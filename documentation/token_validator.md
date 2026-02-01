# Token Validator

The `token_validator` component handles authentication for the API using JSON Web Tokens (JWT).

## Overview

**Location:** `src/api/src/api_components/token_validator/token_validator.py`

This module provides dependency injection functions for FastAPI routes to enforce Bearer authentication. It verifies tokens against a public key derived from a configured secret.

## Configuration

**Environment Variables**:
- **`AUTH_JWT_SECRET`**
  - The value is retrieved from AWS Systems Manager Parameter Store at startup.
  - Parameter path: `/flashslides/{ENV}/api/AUTH_JWT_SECRET` (when `ENV=local` this is read from LocalStack/SSM).
  - Must contain the JWK set (JSON Web Key) JSON string used to derive the public key.
- **`SUPABASE_URL`** - Supabase project URL (for identity provider integration)
- **`SUPABASE_KEY`** - Supabase service role key

**Algorithm:** Enforces `ES256` (Elliptic Curve Digital Signature Algorithm with SHA-256).

## Usage

Can be used as a FastAPI dependency:

```python
from fastapi import Depends
from api.src.api_components.token_validator.token_validator import validate_token

@app.get("/protected")
async def protected_route(user: dict = Depends(validate_token)):
    return {"user_id": user["sub"]}
```

## Endpoints

### 1. Authenticate JWT

**Endpoint:** `POST /api/v1/authenticate-jwt`

**Location:** `src/api/src/api_components/token_validator/routers.py`

**Description:** Validates JWT tokens and auto-creates user records on first login.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**JWT Payload Structure:**
```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "user_metadata": {
    "full_name": "John Doe",
    "display_name": "John",
    "marketing_consent": true
  },
  "exp": 1234567890,
  "iat": 1234567800
}
```

**Response:**
```json
{
  "internal_id": "uuid-of-user",
  "status": "created" | "authenticated",
  "is_new_user": true | false
}
```

**Behavior:**
1. Validates JWT signature and expiration
2. Extracts user info from `sub`, `email`, and `user_metadata`
3. Checks if user exists in database
4. If new user:
   - Creates user record with `password_hash="managed_externally"`
   - Parses `full_name` into `first_name` and `last_name`
   - Stores `marketing_consent` in `preferences` JSONB
   - Returns `status: "created"` and `is_new_user: true`
5. If existing user:
   - Updates `last_login_at` timestamp
   - Returns `status: "authenticated"` and `is_new_user: false`

**Error Responses:**
- `AUTH_TOKEN_EXPIRED`: Token has expired
- `AUTH_TOKEN_INVALID`: Invalid signature or malformed token
- `AUTH_INVALID_USER_DATA`: Missing or invalid user UUID in token
- `AUTH_USER_CREATION_FAILURE`: Database error during user creation
- `AUTHENTICATION_FAILURE`: Generic authentication error

## Functions

### `validate_token`

- **Signature:** `validate_token(credentials: HTTPAuthorizationCredentials = Security(security))`
- **Behavior:**
  1. Extracts the Bearer token from the `Authorization` header.
  2. Decodes the JWT using the configured `AUTH_JWT_SECRET`.
  3. Returns the decoded payload (claims).
- **Errors:**
  - Raises `ExceptionWithErrorType` (which should map to HTTP 401/403) with specific codes:
    - `AUTH_TOKEN_EXPIRED`: If the token is past its expiration time.
    - `AUTH_TOKEN_INVALID`: If the token structure or signature is invalid.
    - `AUTHENTICATION_FAILURE`: For other unexpected validation errors.

## Authentication Flow

### Complete User Authentication Flow

1. **User Initiates OAuth Login**
   - Frontend redirects to Supabase Auth (or other OAuth provider)
   - User completes authentication (Google, GitHub, email, etc.)

2. **OAuth Provider Returns JWT**
   - Supabase returns JWT with user info
   - Frontend stores token in localStorage/cookies

3. **Frontend Makes First API Request**
   - Includes JWT in Authorization header
   - API validates token via `validate_token` dependency

4. **Self-Healing User Creation (First Login)**
   - Frontend attempts to fetch user profile from Supabase
   - If user doesn't exist in backend database (PGRST116 error):
     - Frontend calls `POST /api/v1/authenticate-jwt`
     - Backend auto-creates user record
     - Frontend retries original request successfully

5. **Subsequent Requests**
   - JWT validated on every request
   - User record already exists
   - Standard authentication flow

### Self-Healing Pattern

**Frontend Implementation** (`src/app/src/contexts/UserContext.tsx`):

```typescript
async function fetchUserProfile() {
  try {
    // Try to fetch from Supabase/backend
    const user = await supabase.from("users").select("*").single();
    return user;
  } catch (error) {
    if (error.code === "PGRST116") {
      // User doesn't exist - trigger creation
      await fetch("/api/v1/authenticate-jwt", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      // Retry fetch
      const user = await supabase.from("users").select("*").single();
      return user;
    }
    throw error;
  }
}
```

**Why This Pattern?**:
- OAuth providers create user accounts immediately
- Backend database may not have the user yet
- Self-healing prevents manual user creation steps
- Seamless experience for first-time users
- Backend stays in sync with OAuth provider

### User Metadata Parsing

**Location:** `src/api/src/api_components/token_validator/routers.py`

The `/authenticate-jwt` endpoint parses user metadata from the JWT:

```python
# Extract user metadata
user_metadata = payload.get("user_metadata", {})
full_name = user_metadata.get("full_name", "")
marketing_consent = user_metadata.get("marketing_consent", False)

# Parse full_name into first_name and last_name
name_parts = full_name.split(" ", 1)
first_name = name_parts[0] if name_parts else None
last_name = name_parts[1] if len(name_parts) > 1 else None

# Create user with parsed data
user = User(
    user_id=user_uuid,
    email=email,
    password_hash="managed_externally",  # OAuth-only user
    first_name=first_name,
    last_name=last_name,
    preferences={"marketing_consent": marketing_consent},
)
```

**Stored Fields**:
- `first_name`, `last_name` - Parsed from `full_name`
- `email` - From JWT `email` claim
- `user_id` - From JWT `sub` claim
- `password_hash` - Set to `"managed_externally"` for OAuth users
- `preferences` JSONB - Stores `marketing_consent` and future settings

### Token Validation in Protected Endpoints

Use `validate_token` as a FastAPI dependency:

```python
from fastapi import APIRouter, Depends
from src.api_components.token_validator.token_validator import validate_token

router = APIRouter()

@router.get("/protected-endpoint")
async def protected_endpoint(user: dict = Depends(validate_token)):
    # user contains decoded JWT payload
    user_id = user["sub"]
    email = user["email"]

    return {"message": f"Hello {email}"}
```

### Token Expiration Handling

**Frontend Pattern**:
```typescript
async function makeAuthenticatedRequest(url: string, options: RequestInit) {
  const token = await getToken();  // Get current token

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const error = await response.json();

    if (error.detail?.error_type === "AUTH_TOKEN_EXPIRED") {
      // Refresh token and retry
      const newToken = await refreshToken();
      return makeAuthenticatedRequest(url, options);
    }
  }

  return response;
}
```
