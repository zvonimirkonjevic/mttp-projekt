import uuid
import traceback

from loguru import logger
from fastapi import APIRouter, Depends
from sqlalchemy import update, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from common.models.user import User
from common.database import get_async_db
from api.src.utils import ExceptionWithErrorType
from api.src.api_components.update_user_profile.models import (
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
    CheckEmailAvailabilityResponse,
)
from api.src.api_components.token_validator.token_validator import validate_token

router = APIRouter()


@router.patch(
    "/update_profile",
    response_model=UpdateUserProfileResponse,
    tags=["User Profile"]
)
async def update_user_profile(
    params: UpdateUserProfileRequest,
    token_payload: dict = Depends(validate_token),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Update user profile information including name, avatar, and company.

    - **first_name**: User's first name
    - **last_name**: User's last name
    - **avatar_url**: URL to user's profile image
    - **company**: Company name (stored in preferences JSONB)
    """

    request_data = params.model_dump(exclude_unset=True)
    if not request_data:
        raise ExceptionWithErrorType(
            error_type="EMPTY_UPDATE_DATA",
            message="No data provided for update."
        )

    # Parse and validate user UUID from token
    try:
        user_uuid = uuid.UUID(token_payload.get("sub"))
    except (TypeError, ValueError):
        raise ExceptionWithErrorType(
            error_type="INVALID_USER_ID",
            message="The user ID in the token is invalid."
        )

    # Build database update payload
    db_data = {}

    if "avatar_url" in request_data:
        db_data["profile_image_url"] = request_data["avatar_url"]

    if "first_name" in request_data:
        db_data["first_name"] = request_data["first_name"]

    if "last_name" in request_data:
        db_data["last_name"] = request_data["last_name"]

    # Handle company in preferences JSONB field
    if "company" in request_data:
        try:
            # Fetch existing preferences in a single query
            result = await db.execute(
                select(User.preferences).where(User.id == user_uuid)
            )
            existing_preferences = result.scalar_one_or_none()

            if existing_preferences is None:
                # User doesn't exist
                raise ExceptionWithErrorType(
                    error_type="USER_NOT_FOUND",
                    message="No user found with the provided ID."
                )

            # Merge company into preferences
            preferences = existing_preferences or {}
            preferences["company"] = request_data["company"]
            db_data["preferences"] = preferences

        except ExceptionWithErrorType:
            # Re-raise our custom exceptions
            raise
        except SQLAlchemyError as e:
            logger.error(f"Database error fetching user preferences: {e}")
            raise ExceptionWithErrorType(
                error_type="DATABASE_ERROR",
                message="Failed to fetch user preferences."
            )

    # Validate we have data to update
    if not db_data:
        raise ExceptionWithErrorType(
            error_type="EMPTY_UPDATE_DATA",
            message="No valid data provided for update."
        )

    # Execute update with transaction management
    try:
        statement = (
            update(User)
            .where(User.id == user_uuid)
            .values(**db_data)
            .execution_options(synchronize_session="fetch")
        )

        result = await db.execute(statement)
        await db.commit()

        if result.rowcount == 0:
            raise ExceptionWithErrorType(
                error_type="USER_NOT_FOUND",
                message="No user found with the provided ID."
            )

        logger.info(f"User profile updated successfully for user_id={user_uuid}")

        return UpdateUserProfileResponse(
            success=True,
            message="User profile updated successfully."
        )

    except ExceptionWithErrorType:
        raise

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error(f"Database error updating user profile: {e}")
        raise ExceptionWithErrorType(
            error_type="DATABASE_ERROR",
            message="Failed to update user profile due to a database error."
        )
    
    except Exception as e:
        await db.rollback()
        error_traceback = traceback.format_exc()
        logger.error(f"Unexpected error updating user profile: {e}\n{error_traceback}")
        raise ExceptionWithErrorType(
            error_type="INTERNAL_ERROR",
            message="An unexpected error occurred while updating the profile."
        )


@router.get(
    "/check_email_availability",
    response_model=CheckEmailAvailabilityResponse,
    tags=["User Profile"]
)
async def check_email_availability(
    email: str,
    token_payload: dict = Depends(validate_token),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Check if an email address is already taken by another user.

    - **email**: The email address to check

    Returns whether the email is available for use.
    """

    # Get current user's UUID from token
    try:
        current_user_uuid = uuid.UUID(token_payload.get("sub"))
    except (TypeError, ValueError):
        raise ExceptionWithErrorType(
            error_type="INVALID_USER_ID",
            message="The user ID in the token is invalid."
        )

    try:
        # Check if email exists in the database
        result = await db.execute(
            select(User.id).where(User.email == email)
        )
        existing_user = result.scalar_one_or_none()

        # Email is available if:
        # 1. No user has this email, OR
        # 2. The current user already has this email
        is_available = existing_user is None or existing_user == current_user_uuid

        return CheckEmailAvailabilityResponse(
            is_available=is_available,
            message="Email is available" if is_available else "Email is already taken"
        )

    except SQLAlchemyError as e:
        logger.error(f"Database error checking email availability: {e}")
        raise ExceptionWithErrorType(
            error_type="DATABASE_ERROR",
            message="Failed to check email availability."
        )
    except Exception as e:
        error_traceback = traceback.format_exc()
        logger.error(f"Unexpected error checking email availability: {e}\n{error_traceback}")
        raise ExceptionWithErrorType(
            error_type="INTERNAL_ERROR",
            message="An unexpected error occurred while checking email availability."
        )