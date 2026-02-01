from fastapi import APIRouter

from api.src.api_components.token_validator import routers as token_validator_router
from api.src.api_components.billing import routers as billing_router
from api.src.api_components.update_user_profile import routers as update_user_profile_router


router = APIRouter()

# Include Component Routers
router.include_router(token_validator_router.router)
router.include_router(billing_router.router)
router.include_router(update_user_profile_router.router)


# Import endpoint functions from component routers
authenticate_jwt = token_validator_router.authenticate_jwt


# ===============
# Default Endpoints
# ===============

@router.get("/")
def root():
    return {}

@router.get("/health")
def health():
    return {"status": "ok"}