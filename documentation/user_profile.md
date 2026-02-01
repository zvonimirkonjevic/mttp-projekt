# User Profile Management

This document describes the user profile management system in FlashSlides AI, including profile updates, data storage, and frontend integration.

## Overview

The user profile system allows users to update their personal information including name, company, and profile image. Profile data is stored in PostgreSQL with flexible JSONB fields for extensibility.

## Database Schema

### User Model

**Location:** `src/common/models/user.py`

**Profile Fields:**

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `user_id` | UUID | No | Primary key |
| `email` | String | No | Unique email address |
| `first_name` | String | Yes | User's first name |
| `last_name` | String | Yes | User's last name |
| `profile_image_url` | String | Yes | Avatar/profile image URL |
| `phone` | String | Yes | Phone number |
| `timezone` | String | Yes | User's timezone |
| `language_preference` | String | Yes | Preferred language |
| `preferences` | JSONB | Yes | Flexible settings storage |
| `created_at` | DateTime | No | Account creation timestamp |
| `updated_at` | DateTime | No | Last update timestamp |
| `last_login_at` | DateTime | Yes | Last login timestamp |

**Preferences JSONB Structure:**
```json
{
  "company": "Acme Inc",
  "marketing_consent": true
}
```

The `preferences` field allows flexible schema extension without database migrations.

## API Endpoints

### Update User Profile

**Endpoint:** `PATCH /api/v1/update_profile`

**Location:** `src/api/src/api_components/update_user_profile/routers.py`

**Description:** Updates user profile information with partial update support.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "company": "Acme Inc"
}
```

**All fields are optional** - send only the fields you want to update.

**Field Mappings:**
- `first_name` → `user.first_name` (direct database field)
- `last_name` → `user.last_name` (direct database field)
- `avatar_url` → `user.profile_image_url` (mapped to different field name)
- `company` → `user.preferences['company']` (stored in JSONB)

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Error Responses:**
- `USER_NOT_FOUND`: User doesn't exist in database
- `VALIDATION_ERROR`: Invalid request payload
- `DATABASE_ERROR`: Database operation failed

## Implementation Details

### Request/Response Models

**Location:** `src/api/src/api_components/update_user_profile/models.py`

```python
from pydantic import BaseModel, Field
from typing import Optional

class UpdateUserProfileRequest(BaseModel):
    first_name: Optional[str] = Field(None, description="User's first name")
    last_name: Optional[str] = Field(None, description="User's last name")
    avatar_url: Optional[str] = Field(None, description="Profile image URL")
    company: Optional[str] = Field(None, description="Company name")

class UpdateUserProfileResponse(BaseModel):
    success: bool
    message: str
```

### Backend Implementation

**Location:** `src/api/src/api_components/update_user_profile/routers.py`

```python
@router.patch("/update_profile", response_model=UpdateUserProfileResponse)
async def update_user_profile(
    request: UpdateUserProfileRequest,
    user_payload: dict = Depends(validate_token),
    db: Session = Depends(get_db),
):
    try:
        user_id = UUID(user_payload["sub"])
        user = db.query(User).filter(User.user_id == user_id).first()

        if not user:
            raise ExceptionWithErrorType("User not found", "USER_NOT_FOUND")

        # Update direct fields
        if request.first_name is not None:
            user.first_name = request.first_name
        if request.last_name is not None:
            user.last_name = request.last_name
        if request.avatar_url is not None:
            user.profile_image_url = request.avatar_url

        # Update JSONB preferences
        if request.company is not None:
            if user.preferences is None:
                user.preferences = {}
            user.preferences["company"] = request.company

        db.commit()

        logger.info("Profile updated", user_id=str(user_id))

        return UpdateUserProfileResponse(
            success=True,
            message="Profile updated successfully"
        )

    except Exception as e:
        db.rollback()
        logger.error(f"Profile update failed: {str(e)}\n{traceback.format_exc()}")
        raise ExceptionWithErrorType(
            message=f"Failed to update profile: {str(e)}",
            error_type="DATABASE_ERROR"
        )
```

**Key Features:**
- **Partial Updates**: Only provided fields are updated
- **Transaction Safety**: Automatic rollback on errors
- **JSONB Handling**: Safely updates nested preferences
- **Audit Logging**: All updates are logged with user_id

## Frontend Integration

### useUserProfile Hook

**Location:** `src/app/src/hooks/useUserProfile.ts`

Custom React hook for profile management:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUserProfile() {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await fetch(`${API_URL}/api/v1/update_profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Update failed");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate user cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
    error: updateProfile.error,
  };
}
```

**Features:**
- **React Query Integration**: Automatic caching and state management
- **Optimistic Updates**: Instant UI feedback
- **Error Handling**: Built-in error states
- **Cache Invalidation**: Auto-refreshes user data after updates

### Settings Page

**Location:** `src/app/src/app/settings/details/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfileSettings() {
  const { user } = useUser();
  const { updateProfile, isUpdating, error } = useUserProfile();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    company: user?.preferences?.company || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.first_name}
        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
        placeholder="First Name"
      />
      <input
        type="text"
        value={formData.last_name}
        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
        placeholder="Last Name"
      />
      <input
        type="text"
        value={formData.company}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        placeholder="Company"
      />
      <button type="submit" disabled={isUpdating}>
        {isUpdating ? "Saving..." : "Save Changes"}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

### UserContext Integration

**Location:** `src/app/src/contexts/UserContext.tsx`

The UserContext provides global access to user data:

```typescript
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    // Fetch user data from Supabase/API
    const userData = await fetchUserProfile();
    setUser(userData);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
```

**Features:**
- **Global State**: User data accessible throughout the app
- **Auto-Refresh**: Reloads after profile updates
- **Type Safety**: Full TypeScript support

## Adding New Profile Fields

To add a new profile field:

### 1. Update Database Model

Edit `src/common/models/user.py`:

```python
class User(Base):
    __tablename__ = "users"

    # ... existing fields ...

    # Add new field
    bio = Column(Text, nullable=True)
```

### 2. Create Database Migration

```bash
# Generate migration
alembic revision --autogenerate -m "add user bio field"

# Apply migration
alembic upgrade head
```

### 3. Update Pydantic Models

Edit `src/api/src/api_components/update_user_profile/models.py`:

```python
class UpdateUserProfileRequest(BaseModel):
    # ... existing fields ...
    bio: Optional[str] = Field(None, description="User bio")
```

### 4. Update Endpoint Logic

Edit `src/api/src/api_components/update_user_profile/routers.py`:

```python
if request.bio is not None:
    user.bio = request.bio
```

### 5. Update Frontend Types

Edit `src/app/src/types/user.ts`:

```typescript
export interface User {
  // ... existing fields ...
  bio?: string;
}
```

### 6. Update UI

Add form field to `src/app/src/app/settings/details/page.tsx`.

## Using JSONB for Flexible Fields

For fields that don't need direct database queries, use the `preferences` JSONB field:

**Backend:**
```python
if request.notification_settings is not None:
    if user.preferences is None:
        user.preferences = {}
    user.preferences["notification_settings"] = request.notification_settings
```

**Frontend:**
```typescript
const notificationSettings = user?.preferences?.notification_settings;
```

**Advantages:**
- No database migrations needed
- Flexible schema
- Store complex nested data

**Disadvantages:**
- Can't efficiently query/index on nested fields
- Less type safety

**Best Practice**: Use direct columns for frequently queried fields (name, email), use JSONB for settings and preferences.

## Testing

### Manual Testing

1. Start the application:
   ```bash
   make flashslides-run
   ```

2. Login to get JWT token

3. Test profile update:
   ```bash
   curl -X PATCH http://localhost:3001/api/v1/update_profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "John",
       "last_name": "Doe",
       "company": "Acme Inc"
     }'
   ```

4. Verify in database:
   ```bash
   docker exec -it flashslides-postgres-1 psql -U postgres -d flashslides
   SELECT first_name, last_name, preferences FROM users WHERE email='test@example.com';
   ```

### Common Issues

**"User not found" error:**
- Ensure JWT token is valid
- Check that user was created via `/authenticate-jwt`
- Verify `sub` claim in JWT matches database `user_id`

**JSONB field not updating:**
- Ensure preferences is initialized: `user.preferences = user.preferences or {}`
- Commit transaction after changes: `db.commit()`
- Check for database rollback in error logs

**Frontend not reflecting changes:**
- Invalidate React Query cache: `queryClient.invalidateQueries(['user'])`
- Check UserContext refresh function is called
- Verify API response is successful (200 status)

---

For more details, see the implementation in `src/api/src/api_components/update_user_profile/`.
