import uuid
import stripe
import traceback

from typing import Dict
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import APIRouter, Depends, Request, Header

from common.models.user import User
from api.src.globals import CREDIT_OPTIONS
from common.database import get_async_db
from api.src.utils import ExceptionWithErrorType
from api.src.api_components.billing.billing import process_successful_payment
from api.src.api_components.token_validator.token_validator import validate_token
from api.src.api_components.billing.models import (
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    WebhookResponse
)
from api.src.settings import settings


router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY.get_secret_value()


# ===============
# Create Checkout Session
# ===============

@router.post(
    "/create-checkout-session",
    response_model=CheckoutSessionResponse,
    tags=["Billing"]
)
async def create_checkout_session(
    request: CheckoutSessionRequest,
    token_payload: Dict = Depends(validate_token),
    db: AsyncSession = Depends(get_async_db)
):
    credit_option = request.credit_option
    credit = CREDIT_OPTIONS[credit_option]

    try:
        user_uuid = uuid.UUID(token_payload.get("sub"))
    except (TypeError, ValueError):
        raise ExceptionWithErrorType(
            error_type="INVALID_USER_ID",
            message="The user ID in the token is invalid."
        )

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise ExceptionWithErrorType(
            error_type="USER_NOT_FOUND",
            message="User not found in the database."
        )

    try:
        customer_kwargs = {}

        if user.stripe_customer_id:
            customer_kwargs["customer"] = user.stripe_customer_id
        else:
            customer_kwargs["customer_email"] = user.email
            customer_kwargs["customer_creation"] = "always"

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"{credit['credits']} AI Credits",
                    },
                    "unit_amount": credit["price_in_cents"],
                },
                "quantity": 1,
            }],
            mode="payment",
            **customer_kwargs,
            metadata={
                "user_id": str(user.id),
                "credits": str(credit["credits"]),
                "package_id": credit_option,
                "env": settings.ENV
            },
            
            success_url=f"{settings.APP_URL}/settings/billing?payment=success",
            cancel_url=f"{settings.APP_URL}/settings/billing?payment=cancelled",
        )
        
        return CheckoutSessionResponse(url=checkout_session.url)

    except stripe.error.StripeError as e:
        raise ExceptionWithErrorType(
            error_type="STRIPE_GATEWAY_ERROR",
            message=str(e)
        )
    
    except Exception as e:
        error_traceback = traceback.format_exc()
        logger.error(
            f"Unexpected error creating checkout session: {str(e)}\n{error_traceback}",
            extra={
                "user_id": str(user.id),
                "credit_option": credit_option,
                "error": str(e)
            }
        )
        raise ExceptionWithErrorType(
            error_type="STRIPE_CHECKOUT_SESSION_ERROR",
            message=str(e)
        )


# ===============
# Stripe Webhook
# ===============

@router.post(
    "/stripe-webhook",
    response_model=WebhookResponse,
    status_code=200,
    tags=["Billing"]
)
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Stripe webhook handler. Returns 200 for most errors to prevent infinite retries.
    Only returns 5xx for temporary infrastructure failures.
    """
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET.get_secret_value()
        )
    except ValueError as e:
        logger.warning(f"Invalid webhook payload received: {e}")
        return WebhookResponse()
    except stripe.error.SignatureVerificationError as e:
        logger.warning(f"Invalid webhook signature: {e}")
        return WebhookResponse()

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        try:
            await process_successful_payment(session)
        except Exception as e:
            error_traceback = traceback.format_exc()
            logger.error(
                f"Unexpected error processing webhook: {str(e)}\n{error_traceback}",
                extra={
                    "event_id": event.get("id"),
                    "event_type": event.get("type"),
                    "error": str(e)
                }
            )
            #NOTE: Return 200 to prevent infinite retries
            return WebhookResponse()

    return WebhookResponse()