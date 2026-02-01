# Error Handling & Custom Exceptions

The application uses a unified error handling strategy to ensure consistent logging and API responses.

## Base Exception

### `ExceptionWithErrorType`

**Location:** `src/api/src/utils.py`

This is the base class for all domain-specific errors in the application. It allows attaching a specific `error_type` string (machine-readable) to the standard human-readable `message`.

```python
class ExceptionWithErrorType(Exception):
    def __init__(self, message: str, error_type: str):
        self.error_type = error_type
        super().__init__(message)
```

## Error Categories

Common `error_type` values used across the system:

- **`CONTENT_PARSING_ERROR`**: critical; Raised when the system fails to parse the AI model's output (e.g., regex mismatch, invalid JSON, missing markdown blocks). Distinction from generic workflow failure allows identifying prompt engineering issues versus system crashes.
- **`PROCESSING_ERROR`**: generic; Fallback error for content processing failures that do not match specific categories.
- **`PROCESSING_SERVICE_UNAVAILABLE`**: infrastructure; Raised when underlying services fail to launch or become unresponsive.
- **`PROCESSING_TIMEOUT`**: business-logic; Raised when a user-provided operation takes too long to complete, exceeding the defined timeout.
- **`RESOURCE_LIMIT_EXCEEDED`**: business-logic; Raised when generated artifacts exceed defined system limits (e.g., >20MB).
- **`WORKFLOW_FAILURE`**: generic; The catch-all for high-level workflow interruptions or when multiple retries have failed. Also used when an unexpected system error occurs within a specific workflow step.
- **`UNKNOWN`**: Fallback for unhandled exceptions caught by the global handler.
- **`AUTH_INVALID_USER_DATA`**: client-error; Raised when the user data in the provided token (e.g. UUID) is invalid or malformed.
- **`AUTH_USER_CREATION_FAILURE`**: system-error; Raised when the database fails to create a new user profile during the authentication flow.
- **`AUTHENTICATION_FAILURE`**: generic; Generic failure during the authentication process, used when an unexpected error occurs or as a fallback.
- **`AUTH_TOKEN_EXPIRED`**: client-error; Raised when the JWT has passed its expiration time. Clients should refresh the token or re-login.
- **`AUTH_TOKEN_INVALID`**: client-error; Raised when the JWT signature verification fails or the token is malformed.
- **`AUTH_ERROR`**: (Implicit in `validate_token`) 401 Unauthorized errors from the token validation middleware.

*Note: The system is designed to be extensible. New error types should be added as specific constants or subclasses as needed.*

## Logging Strategy

The application uses [Loguru](https://github.com/Delkan/loguru) for structured logging, replacing Python's standard `logging` module.

### Configuration

**Log Level**: Set via `LOG_LEVEL` environment variable (DEBUG, INFO, WARNING, ERROR, CRITICAL)

**Location**: Configured in `src/api/src/main.py` at startup

### Logging Patterns

#### Basic Logging

```python
from loguru import logger

# Simple info logging
logger.info("User profile updated")

# With contextual data
logger.info("Profile updated", user_id=str(user_id), fields_changed=["first_name", "last_name"])

# Warning
logger.warning("API rate limit approaching", remaining_requests=10)

# Error
logger.error("Database connection failed", error=str(e))
```

#### Exception Logging

**IMPORTANT**: Loguru does NOT support the `exc_info` parameter. Use `traceback.format_exc()` instead.

```python
import traceback
from loguru import logger

try:
    # operation
except Exception as e:
    # Log with full traceback
    logger.error(f"Operation failed: {str(e)}\n{traceback.format_exc()}")
    raise
```

#### Structured Context

Add structured data to logs for better searchability:

```python
logger.info(
    "Credits consumed",
    user_id=str(user_id),
    credits_used=50,
    remaining=450,
    feature="slide_generation"
)
```

### When to Log Tracebacks

- **DO Log Tracebacks For**:
  - Unexpected system failures
  - Database connection errors
  - Third-party API crashes
  - Content processing failures
  - Unhandled exceptions

- **DON'T Log Tracebacks For**:
  - Expected validation errors
  - Authentication failures (wrong password)
  - Business logic errors (insufficient credits)
  - User input errors

### Log Level Guidelines

- **DEBUG**: Detailed diagnostic information (e.g., function parameters, intermediate results)
- **INFO**: General operational events (e.g., user actions, successful operations)
- **WARNING**: Potentially harmful situations (e.g., deprecated APIs, rate limits)
- **ERROR**: Error events that might still allow the application to continue
- **CRITICAL**: Severe errors that may cause the application to abort

### Contextual Info

- **Tracebacks (System Crashes):** Full stack traces are logged (`traceback.format_exc()`) for unexpected system failures and unhandled exceptions to aid in debugging root causes.
- **No Tracebacks (Logical Errors):** Tracebacks are intentionally omitted for expected logical failures (e.g., regex finding no matches, validation errors, prompt refusals) to keep logs clean. These share the same `ERROR` level but rely on descriptive messages.
- **Exception Details:** Errors from third-party services (Google Cloud) or internal processing capture the specific inner exception class name (e.g., `TimeoutError`, `BrokenPipeError`) dynamically.
- **Truncation:** Large content payloads (like AI model responses) are truncated in logs to prevent flooding while preserving failure context.

## Global Handler

### `endpoint_exception_handler`

**Location:** `src/api/src/utils.py`

A decorator that wraps API endpoints (both sync and async) to provide a safety net:

1.  **Catches `ExceptionWithErrorType`:** 
    - Logs the specific known error.
    - Re-raises it (typically to be handled by FastAPI's `exception_handler` middleware to return a JSON response).
2.  **Catches Generic `Exception`:**
    - Logs the full traceback.
    - Converts it into an `ExceptionWithErrorType` with `error_type="UNKNOWN"`.
    - This ensures the API always returns a structured error format, even for unexpected crashes.

## Transaction Management

### Async Database Transactions

For operations requiring atomicity (especially billing and concurrent updates):

**Location:** `src/common/async_database.py`

```python
from src.common.async_database import get_async_db
from sqlalchemy import select
from src.common.models.user import User

async def update_user_credits(user_id: UUID, credits: int):
    async with get_async_db() as db:
        async with db.begin():  # Transaction context
            # Row-level locking for concurrent safety
            result = await db.execute(
                select(User)
                .with_for_update()  # SELECT ... FOR UPDATE
                .where(User.user_id == user_id)
            )
            user = result.scalar_one_or_none()

            if not user:
                raise ExceptionWithErrorType("User not found", "USER_NOT_FOUND")

            # Make changes
            user.credits_balance += credits

            # Automatic commit on context exit
            # Automatic rollback on exception
```

**Key Features**:
- `async with db.begin()`: Creates a transaction that auto-commits on success
- `with_for_update()`: Acquires row-level lock (prevents concurrent modifications)
- Automatic rollback on any exception
- Thread-safe for concurrent webhook processing

### Sync Database Transactions

For simple operations:

```python
from src.common.database import get_db
from sqlalchemy.orm import Session

def update_user_profile(user_id: UUID, data: dict, db: Session):
    try:
        user = db.query(User).filter(User.user_id == user_id).first()

        if not user:
            raise ExceptionWithErrorType("User not found", "USER_NOT_FOUND")

        # Update fields
        user.first_name = data.get("first_name")
        user.last_name = data.get("last_name")

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Profile update failed: {str(e)}\n{traceback.format_exc()}")
        raise ExceptionWithErrorType(
            message=f"Failed to update profile: {str(e)}",
            error_type="DATABASE_ERROR"
        )
```

### When to Use Async vs Sync

**Use Async**:
- Webhook handlers (concurrent processing)
- Billing operations (row-level locking needed)
- High-concurrency endpoints
- Long-running database operations

**Use Sync**:
- Simple CRUD operations
- Single-user profile updates
- Read-only queries
- Fast, non-blocking operations

### Error Handling in Transactions

```python
async with get_async_db() as db:
    async with db.begin():
        try:
            # Multiple operations
            user.credits_balance += 100
            transaction = Transaction(...)
            db.add(transaction)
            # Commit happens automatically if no exception
        except IntegrityError as e:
            # Rollback happens automatically
            logger.warning("Duplicate transaction", session_id=session_id)
            raise ExceptionWithErrorType(
                "Transaction already processed",
                "DUPLICATE_TRANSACTION"
            )
        except Exception as e:
            # Rollback happens automatically
            logger.error(f"Transaction failed: {str(e)}\n{traceback.format_exc()}")
            raise ExceptionWithErrorType(
                f"Database operation failed: {str(e)}",
                "DATABASE_ERROR"
            )
```

## Usage Example

```python
@endpoint_exception_handler
async def create_slide(input_data):
    try:
        # ... logic ...
    except ValueError as e:
        raise ExceptionWithErrorType(
            message=f"Invalid input: {e}",
            error_type="VALIDATION_ERROR"
        )
```

## API Error Response Format

All errors returned to the client follow a consistent structure:

```json
{
  "detail": {
    "message": "User not found",
    "error_type": "USER_NOT_FOUND"
  }
}
```

**Frontend Error Handling**:
```typescript
try {
  const response = await fetch("/api/v1/endpoint", {...});
  if (!response.ok) {
    const error = await response.json();
    console.error(error.detail.message);

    // Handle specific error types
    if (error.detail.error_type === "INSUFFICIENT_CREDITS") {
      router.push("/settings/topup");
    }
  }
} catch (error) {
  // Network or parsing error
  console.error("Request failed", error);
}
```
