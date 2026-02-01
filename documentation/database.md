# Database Architecture

This document describes the database architecture, schema, connection patterns, and best practices for FlashSlides AI.

## Overview

FlashSlides AI uses **PostgreSQL** as its primary database, accessed via **SQLAlchemy ORM** with both synchronous and asynchronous connection pools.

**Location:**
- Models: `src/common/models/`
- Sync Database: `src/common/database.py`
- Async Database: `src/common/async_database.py`

## Database Configuration

### Connection String

The database URL is dynamically constructed from environment variables:

```python
DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
```

### Environment Variables

Required in `.env` file:
```bash
DATABASE_HOST=postgres        # Container name or hostname
DATABASE_PORT=5432            # Default PostgreSQL port
DATABASE_NAME=flashslides     # Database name
DATABASE_USER=postgres        # Database user
DATABASE_PASSWORD=postgres    # Database password (from SSM in production)
```

**SSM Parameter**: `/flashslides/{ENV}/api/DATABASE_PASSWORD`

### Connection Pools

**Synchronous Pool**:
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before using
)
```

**Asynchronous Pool**:
```python
async_engine = create_async_engine(
    DATABASE_URL_ASYNC,  # Uses asyncpg driver
    pool_size=20,
    max_overflow=10,
    connect_args={
        "statement_cache_size": 0,  # Disable for async
    },
)
```

## Database Models

### User Model

**Location:** `src/common/models/user.py`

```python
class User(Base):
    __tablename__ = "users"

    # Identity
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)  # "managed_externally" for OAuth

    # Profile
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    # Billing
    stripe_customer_id = Column(String, unique=True, nullable=True, index=True)
    credits_balance = Column(Integer, default=0, nullable=False)

    # Preferences (JSONB)
    preferences = Column(JSONB, nullable=True)  # {"company": "...", "marketing_consent": true}

    # Settings
    timezone = Column(String, nullable=True)
    language_preference = Column(String, nullable=True)
    user_type = Column(Enum("admin", "member", "guest", "individual"), default="individual")

    # Status & Timestamps
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**Indexes:**
- `user_id` (primary key, clustered)
- `email` (unique, for login lookups)
- `stripe_customer_id` (unique, for billing operations)

**JSONB Structure (`preferences`):**
```json
{
  "company": "Acme Inc",
  "marketing_consent": true,
  "notification_settings": {
    "email": true,
    "push": false
  }
}
```

### Transaction Model

**Location:** `src/common/models/transaction.py`

```python
class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    stripe_session_id = Column(String, unique=True, nullable=False)  # Idempotency key
    amount_paid_cents = Column(Integer, nullable=False)
    credits_added = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", backref="transactions")
```

**Indexes:**
- `transaction_id` (primary key)
- `user_id` (foreign key index, for user transaction history)
- `stripe_session_id` (unique constraint, for idempotency)

## Connection Patterns

### Synchronous Database Access

**Use For:**
- Simple CRUD operations
- Single-user profile updates
- Read-only queries
- Fast, non-blocking operations

**Pattern:**

```python
from sqlalchemy.orm import Session
from src.common.database import get_db
from src.common.models.user import User

def get_user_profile(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise ExceptionWithErrorType("User not found", "USER_NOT_FOUND")
    return user
```

**With FastAPI Dependency:**
```python
@router.get("/user/{user_id}")
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    return db.query(User).filter(User.user_id == user_id).first()
```

### Asynchronous Database Access

**Use For:**
- Webhook handlers (concurrent processing)
- Billing operations (row-level locking needed)
- High-concurrency endpoints
- Long-running database operations

**Pattern:**

```python
from sqlalchemy.ext.asyncio import AsyncSession
from src.common.async_database import get_async_db
from sqlalchemy import select

async def update_credits(user_id: UUID, credits: int):
    async with get_async_db() as db:
        async with db.begin():
            result = await db.execute(
                select(User)
                .with_for_update()  # Row-level lock
                .where(User.user_id == user_id)
            )
            user = result.scalar_one_or_none()

            if not user:
                raise ExceptionWithErrorType("User not found", "USER_NOT_FOUND")

            user.credits_balance += credits
            # Auto-commit on context exit
```

**With FastAPI (Async Endpoint):**
```python
@router.post("/webhook")
async def handle_webhook():
    async with get_async_db() as db:
        async with db.begin():
            # Database operations
            pass
```

## Advanced Patterns

### Row-Level Locking (SELECT FOR UPDATE)

**Purpose:** Prevent race conditions in concurrent updates.

**Use Case:** Multiple webhooks arrive simultaneously for the same user.

```python
async with get_async_db() as db:
    async with db.begin():
        # This locks the row until transaction completes
        result = await db.execute(
            select(User)
            .with_for_update()
            .where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        # Safe to modify - no other transaction can read or modify this row
        user.credits_balance += 100
```

**Locking Modes:**
- `with_for_update()` - Exclusive lock (prevents reads and writes)
- `with_for_update(skip_locked=True)` - Skip if row is locked
- `with_for_update(nowait=True)` - Fail immediately if row is locked

### Transactions with Multiple Operations

```python
from src.common.models.transaction import Transaction

async with get_async_db() as db:
    async with db.begin():
        try:
            # Update user credits
            user.credits_balance += credits

            # Create transaction record
            transaction = Transaction(
                user_id=user.user_id,
                stripe_session_id=session_id,
                amount_paid_cents=amount,
                credits_added=credits,
            )
            db.add(transaction)

            # Both operations commit together
        except IntegrityError:
            # Automatic rollback if unique constraint violated
            logger.warning("Duplicate transaction", session_id=session_id)
            raise
```

### Idempotency with Database Constraints

Use unique constraints to enforce idempotency:

```python
try:
    transaction = Transaction(
        stripe_session_id=session_id,  # Unique constraint
        # ... other fields
    )
    db.add(transaction)
    db.commit()
except IntegrityError:
    db.rollback()
    # Already processed - idempotent behavior
    return {"status": "already_processed"}
```

### JSONB Operations

**Update nested JSONB field:**

```python
from sqlalchemy.dialects.postgresql import insert

# SQLAlchemy way
user.preferences = user.preferences or {}
user.preferences["company"] = "Acme Inc"
db.commit()

# Raw SQL for complex updates
from sqlalchemy import text

db.execute(
    text("UPDATE users SET preferences = preferences || :new_data WHERE user_id = :user_id"),
    {"new_data": '{"company": "Acme Inc"}', "user_id": user_id}
)
```

**Query JSONB field:**

```python
from sqlalchemy.dialects.postgresql import JSONB

# Find users with marketing consent
users = db.query(User).filter(
    User.preferences["marketing_consent"].astext.cast(Boolean) == True
).all()

# Find users from specific company
users = db.query(User).filter(
    User.preferences["company"].astext == "Acme Inc"
).all()
```

## Database Initialization

### Startup Process

**Location:** `src/api/src/main.py`

```python
from src.common.database import init_db
from src.common.async_database import init_async_db

@app.on_event("startup")
async def startup():
    # Initialize sync engine
    init_db()

    # Initialize async engine
    await init_async_db()
```

### Creating Tables

```python
from src.common.database import Base, engine

# Create all tables defined in models
Base.metadata.create_all(bind=engine)
```

## Migrations (Alembic)

### Setup

**Location:** `alembic/` (if configured)

```bash
# Initialize Alembic
alembic init alembic

# Configure alembic.ini
sqlalchemy.url = postgresql://user:password@localhost/flashslides
```

### Common Commands

```bash
# Generate migration from model changes
alembic revision --autogenerate -m "add user bio field"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current version
alembic current

# Show migration history
alembic history
```

### Migration Template

```python
"""add user bio field

Revision ID: abc123
Revises: def456
Create Date: 2026-01-28
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('users', 'bio')
```

## Best Practices

### 1. Always Use Transactions for Multi-Step Operations

❌ **Bad:**
```python
user.credits_balance += 100
db.commit()

transaction = Transaction(...)
db.add(transaction)
db.commit()  # If this fails, credits were already added!
```

✅ **Good:**
```python
async with db.begin():
    user.credits_balance += 100
    transaction = Transaction(...)
    db.add(transaction)
    # Both commit together or both rollback
```

### 2. Use Row-Level Locking for Concurrent Updates

❌ **Bad:**
```python
user = db.query(User).filter(User.user_id == user_id).first()
user.credits_balance += 100  # Race condition!
db.commit()
```

✅ **Good:**
```python
result = await db.execute(
    select(User).with_for_update().where(User.user_id == user_id)
)
user = result.scalar_one_or_none()
user.credits_balance += 100
```

### 3. Always Check for None Before Accessing

❌ **Bad:**
```python
user = db.query(User).filter(...).first()
user.credits_balance += 100  # Crashes if user is None!
```

✅ **Good:**
```python
user = db.query(User).filter(...).first()
if not user:
    raise ExceptionWithErrorType("User not found", "USER_NOT_FOUND")
user.credits_balance += 100
```

### 4. Use Async for I/O-Bound Operations

❌ **Bad (in async endpoint):**
```python
@router.post("/webhook")
async def webhook():
    db = next(get_db())  # Blocking sync call in async context!
    user = db.query(User).first()
```

✅ **Good:**
```python
@router.post("/webhook")
async def webhook():
    async with get_async_db() as db:
        result = await db.execute(select(User))
        user = result.scalar_one_or_none()
```

### 5. Close Database Sessions Properly

Using `Depends(get_db)` or `async with get_async_db()` ensures proper cleanup.

❌ **Bad:**
```python
from src.common.database import SessionLocal
db = SessionLocal()
# ... operations ...
# Forgot to close - connection leak!
```

✅ **Good:**
```python
# With dependency injection
def endpoint(db: Session = Depends(get_db)):
    # Auto-closed after request

# Or with context manager
with SessionLocal() as db:
    # Auto-closed on exit
```

### 6. Index Frequently Queried Fields

For fields used in WHERE clauses or JOINs:

```python
email = Column(String, unique=True, nullable=False, index=True)
stripe_customer_id = Column(String, unique=True, nullable=True, index=True)
```

### 7. Use JSONB for Flexible Schema

For settings and preferences that don't need indexing:

```python
preferences = Column(JSONB, nullable=True)

# Instead of:
notification_email = Column(Boolean)
notification_push = Column(Boolean)
notification_sms = Column(Boolean)
# ... (requires migration for each new setting)
```

## Troubleshooting

### Connection Pool Exhausted

**Symptom:** "QueuePool limit of size X overflow Y reached"

**Solution:**
- Increase pool size: `pool_size=50, max_overflow=20`
- Ensure sessions are closed: Use `Depends(get_db)` or context managers
- Check for connection leaks: Look for `SessionLocal()` without `.close()`

### Deadlocks

**Symptom:** "deadlock detected" in PostgreSQL logs

**Solution:**
- Always lock rows in the same order
- Use `with_for_update(nowait=True)` to fail fast
- Reduce transaction duration

### JSONB Query Performance

**Symptom:** Slow queries on JSONB fields

**Solution:**
- Create GIN index: `CREATE INDEX idx_preferences ON users USING gin(preferences);`
- Or use expression index: `CREATE INDEX idx_company ON users ((preferences->>'company'));`

### Alembic Conflicts

**Symptom:** "Target database is not up to date"

**Solution:**
```bash
# Check current version
alembic current

# Stamp database to specific version (if manually applied)
alembic stamp head

# Or rollback and reapply
alembic downgrade -1
alembic upgrade head
```

---

For more details, see:
- User Model: `src/common/models/user.py`
- Transaction Model: `src/common/models/transaction.py`
- Database Setup: `src/common/database.py`
- Async Database: `src/common/async_database.py`
