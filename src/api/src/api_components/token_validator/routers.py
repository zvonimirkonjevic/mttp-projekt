import uuid
from typing import Any

from loguru import logger
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import select
from common.database import get_db
from common.models.user import User

from api.src.api_components.token_validator.token_validator import validate_token
from api.src.api_components.token_validator.models import AuthenticationResponse
from api.src.utils import ExceptionWithErrorType


router = APIRouter()


# ========== 
# Helper Functions 
# ==========

def _extract_name_parts(full_name: str) -> tuple[str, str]:
    if not full_name:
        return "", ""
    parts = full_name.strip().split(" ", 1)
    return parts[0], parts[1] if len(parts) > 1 else ""


def _get_email(body: dict[str, Any], token_data: dict[str, Any]) -> str | None:
    return (
        body.get("email") or
        token_data.get("email") or
        token_data.get("user_metadata", {}).get("email")
    )


def _get_full_name(body: dict[str, Any], token_data: dict[str, Any]) -> str:
    meta = token_data.get("user_metadata", {})
    return (
        body.get("full_name") or
        meta.get("full_name") or
        meta.get("name") or
        meta.get("display_name") or
        ""
    )


# ========== 
# Token Authentication 
# ==========

@router.post("/authenticate-jwt", response_model=AuthenticationResponse, tags=["Authentication"])
async def authenticate_jwt(
    request: Request,
    token_data: dict = Depends(validate_token),
    db: Session = Depends(get_db),
):
    try:
        body = await request.json()
    except Exception:
        body = {}

    try:
        user_uuid = uuid.UUID(token_data.get("sub"))
    except (ValueError, TypeError):
        raise ExceptionWithErrorType(
            message="Invalid user ID in authentication token",
            error_type="AUTH_INVALID_USER_DATA"
        )

    user = db.execute(select(User).where(User.id == user_uuid)).scalars().first()

    if user:
        return AuthenticationResponse(internal_id=str(user.id), status="authenticated", is_new_user=False)

    email = _get_email(body, token_data)
    if not email:
        raise ExceptionWithErrorType(
            message="Email is required for user creation",
            error_type="AUTH_MISSING_EMAIL"
        )

    first_name, last_name = _extract_name_parts(_get_full_name(body, token_data))
    meta = token_data.get("user_metadata", {})

    try:
        user = User(
            id=user_uuid,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password_hash="managed_externally",
            preferences={"marketing_consent": meta.get("marketing_consent")}
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        logger.info(f"New user created: {user.id}")
        return AuthenticationResponse(internal_id=str(user.id), status="created", is_new_user=True)

    except Exception as e:
        db.rollback()
        logger.error(f"User creation failed: {e}")
        raise ExceptionWithErrorType(
            message=f"User creation failed: {str(e)}",
            error_type="AUTH_USER_CREATION_FAILURE"
        )