from pydantic import BaseModel, Field
from typing import Literal

# Valid credit option keys matching CREDIT_OPTIONS in globals.py
CreditOptionKey = Literal["500", "1000", "2500", "5000", "10000"]


class CheckoutSessionRequest(BaseModel):
    """Request model for creating a Stripe checkout session."""
    credit_option: CreditOptionKey = Field(
        ...,
        description="The credit package to purchase. Must be one of: 500, 1000, 2500, 5000, 10000"
    )


class CheckoutSessionResponse(BaseModel):
    """Response model containing the Stripe checkout URL."""
    url: str = Field(..., description="The Stripe checkout session URL")


class WebhookResponse(BaseModel):
    """Response model for webhook endpoints."""
    status: Literal["success"] = Field(default="success", description="Status of webhook processing")
