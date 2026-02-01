# Billing System

This document describes the billing and credit purchase system in FlashSlides AI, as implemented in the backend API (FastAPI).

## Overview

The billing system allows users to purchase AI credits using Stripe. Credits are used to access premium features and AI-powered content generation. The backend integrates with Stripe for payment processing and manages user credit balances in the database.

## Endpoints

### 1. Create Checkout Session
- **POST** `/api/v1/create-checkout-session`
- **Description:** Initiates a Stripe Checkout session for purchasing credits.
- **Request Body:**
  - `credit_option` (str): One of the allowed credit packages (e.g., "500", "1000", "2500", "5000", "10000").
- **Authentication:** JWT required (token in Authorization header).
- **Response:**
  - `{ "url": "<stripe_checkout_url>" }`

### 2. Stripe Webhook
- **POST** `/api/v1/stripe-webhook`
- **Description:** Receives Stripe webhook events. On successful payment, credits are added to the user's account.
- **Security:** Stripe webhook secret required (set in environment variable `STRIPE_WEBHOOK_SECRET`).
- **Behavior:**
  - Validates event signature.
  - On `checkout.session.completed`, credits are added to the user and transaction is recorded.

## Credit Options

**Location:** `src/api/src/globals.py`

The following packages are available:

| Credits | Price (USD) | Name       | Price per Credit |
|---------|-------------|------------|------------------|
| 500     | $5.00       | Starter    | $0.01            |
| 1000    | $9.00       | Basic      | $0.009           |
| 2500    | $20.00      | Pro        | $0.008           |
| 5000    | $35.00      | Business   | $0.007           |
| 10000   | $60.00      | Enterprise | $0.006           |

```python
CREDIT_PACKAGES = {
    500: {"price_cents": 500, "name": "Starter"},
    1000: {"price_cents": 900, "name": "Basic"},
    2500: {"price_cents": 2000, "name": "Pro"},
    5000: {"price_cents": 3500, "name": "Business"},
    10000: {"price_cents": 6000, "name": "Enterprise"},
}
```

## Environment Variables
- `STRIPE_SECRET_KEY`: Stripe secret key (use special key for testing inside Stripe Sandbox)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `APP_URL`: Used for redirect URLs after payment
- `ENV`: Environment name (local/dev/prod)

Secrets source
- The application retrieves `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from AWS Systems Manager Parameter Store at startup.
- Parameter paths used by the project:
  - `/flashslides/{ENV}/app/STRIPE_SECRET_KEY`
  - `/flashslides/{ENV}/app/STRIPE_WEBHOOK_SECRET`

Local development: when `ENV=local` these parameters are read from LocalStack (seeded by `scripts/localstack_init.sh`).
Dev/prod: parameters are read from the real AWS SSM endpoint (the running service must have access to the parameters via credentials or IAM role).

## Database Schema

### Transaction Model

**Location:** `src/common/models/transaction.py`

Tracks all billing transactions for audit and idempotency:

```python
class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    stripe_session_id = Column(String, unique=True, nullable=False)  # Idempotency key
    amount_paid_cents = Column(Integer, nullable=False)
    credits_added = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

**Key Features**:
- `stripe_session_id` has a unique constraint to prevent duplicate processing
- Used as idempotency key in webhook handling
- Provides complete audit trail for all credit purchases

### User Model (Billing Fields)

**Location:** `src/common/models/user.py`

Billing-related fields:
- `stripe_customer_id` (String, indexed, nullable) - Reused across purchases
- `credits_balance` (Integer, default=0) - Current available credits

## Implementation Details

### Idempotency Implementation

The webhook handler uses database-level uniqueness constraints to ensure idempotent processing:

**Location:** `src/api/src/api_components/billing/billing.py`

```python
try:
    # Create transaction record with unique stripe_session_id
    transaction = Transaction(
        user_id=user.user_id,
        stripe_session_id=session_id,
        amount_paid_cents=amount_paid,
        credits_added=credits
    )
    db.add(transaction)
    db.commit()
except IntegrityError:
    # Transaction already processed - return success without double-crediting
    db.rollback()
    logger.info(f"Duplicate webhook event ignored", session_id=session_id)
    return {"status": "already_processed"}
```

**Why This Matters**:
- Stripe may send duplicate webhooks during retries
- Network issues can cause replay attacks
- Database constraint prevents double-crediting users
- Gracefully handles retries without errors

### Row-Level Locking

For concurrent webhook processing, the system uses database row-level locking:

**Location:** `src/api/src/api_components/billing/billing.py`

```python
from src.common.async_database import get_async_db
from sqlalchemy import select

async with get_async_db() as db:
    async with db.begin():
        # Acquire exclusive lock on user row
        result = await db.execute(
            select(User)
            .with_for_update()  # SELECT ... FOR UPDATE
            .where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        # Safe to modify - no other transaction can modify this user
        user.credits_balance += credits
        # Automatic commit on context exit
```

**Concurrency Safety**:
- Prevents race conditions if multiple webhooks arrive simultaneously
- Ensures credit balance updates are atomic
- Other transactions wait until lock is released

### Credit Addition Flow

1. User clicks "Buy Credits" on `/settings/billing` page
2. Frontend calls `POST /api/v1/create-checkout-session` with credit amount
3. Backend creates/retrieves Stripe customer ID
4. Backend creates Stripe checkout session with metadata
5. User redirected to Stripe-hosted payment page
6. User completes payment
7. Stripe sends webhook to `/api/v1/stripe-webhook`
8. Backend verifies webhook signature
9. Backend checks transaction uniqueness (idempotency)
10. Backend updates user credit balance with row-level locking
11. Backend creates transaction record
12. User redirected back to app with `?payment=success` parameter
13. Frontend auto-refreshes credit balance

### Implementation Notes
- User's Stripe customer ID is stored and reused for future purchases
- Transactions are recorded in the database with amount and credits
- Webhook handler is idempotent (checks for duplicate session IDs using unique constraint)
- Only processes webhooks for the current environment (checks ENV in metadata)
- Uses async database connections for high-concurrency webhook processing
- Row-level locking prevents race conditions during credit updates

## Frontend Integration

### Settings Pages

**Billing Overview Page**: `src/app/src/app/settings/billing`
- Displays current credit balance
- Shows purchase history
- "Buy More Credits" button

**Top-Up Page**: `src/app/src/app/settings/topup`
- Credit package selection
- Stripe Checkout integration
- Auto-refresh on payment completion (`?payment=success` parameter)
- Cancellation handling (`?payment=cancelled` parameter)

### API Integration Pattern

```typescript
// Create checkout session
const response = await fetch(`${API_URL}/api/v1/create-checkout-session`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({
    credit_option: "1000",  // Package size
  }),
});

const data = await response.json();
// Redirect to Stripe checkout
window.location.href = data.url;
```

### Credit Balance Display

The UserContext automatically tracks and displays credit balance:

```typescript
import { useUser } from "@/contexts/UserContext";

function CreditDisplay() {
  const { user } = useUser();

  return (
    <div>Credits: {user?.credits_balance || 0}</div>
  );
}
```

**Auto-Refresh**: When the user returns from Stripe with `?payment=success`, the frontend automatically invalidates the user query cache, triggering a refresh of the credit balance.

### Credit Consumption Pattern

When implementing features that consume credits:

**Backend** (`src/api/src/api_components/your_feature/service.py`):
```python
from src.common.database import get_db
from src.common.models.user import User
from src.common.exceptions import ExceptionWithErrorType

def consume_credits(user_id: UUID, credits_needed: int, db: Session):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise ExceptionWithErrorType("User not found", "USER_NOT_FOUND")

    if user.credits_balance < credits_needed:
        raise ExceptionWithErrorType(
            f"Insufficient credits. Required: {credits_needed}, Available: {user.credits_balance}",
            "INSUFFICIENT_CREDITS"
        )

    user.credits_balance -= credits_needed
    db.commit()

    logger.info(
        "Credits consumed",
        user_id=str(user_id),
        credits_used=credits_needed,
        remaining=user.credits_balance
    )
```

**Frontend Error Handling**:
```typescript
try {
  // API call that consumes credits
} catch (error) {
  if (error.detail?.error_type === "INSUFFICIENT_CREDITS") {
    // Redirect to top-up page
    router.push("/settings/topup");
  }
}
```

## Local Testing
- Use [Stripe CLI](https://docs.stripe.com/stripe-cli) to forward webhooks to your local API.
- See the main `README.md` for setup instructions.

### Stripe CLI Setup

1. Install and authenticate:
   ```bash
   stripe login
   ```

2. Forward webhooks to local API:
   ```bash
   # If running via Docker (default port 3001)
   stripe listen --forward-to localhost:3001/api/v1/stripe-webhook

   # If running locally without Docker (default port 8000)
   stripe listen --forward-to localhost:8000/api/v1/stripe-webhook
   ```

3. Copy the webhook signing secret (starts with `whsec_`) and add to LocalStack:
   ```bash
   awslocal ssm put-parameter \
     --name "/flashslides/local/app/STRIPE_WEBHOOK_SECRET" \
     --value "whsec_..." \
     --type "SecureString" \
     --overwrite
   ```

4. Restart the API to pick up the new secret

5. Test a purchase:
   - Go to `http://localhost:3000/settings/topup`
   - Select a credit package
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete checkout
   - Watch webhook events in Stripe CLI output
   - Verify credits added: Check logs or database

### Troubleshooting

**Webhook signature verification fails**:
- Ensure `STRIPE_WEBHOOK_SECRET` matches the one from Stripe CLI output
- Restart API after updating the secret
- Check LocalStack logs: `docker logs localstack-main`

**Credits not added after payment**:
- Check Stripe CLI output for webhook delivery status
- Check API logs for errors: `docker logs -f flashslides-api-1`
- Verify transaction in database: `SELECT * FROM transactions;`
- Check for duplicate session IDs (idempotency)

**"Already processed" webhook**:
- This is expected behavior - idempotency is working correctly
- The transaction was already recorded, preventing double-crediting

---
For more details, see the implementation in `src/api/src/api_components/billing/billing.py`.
