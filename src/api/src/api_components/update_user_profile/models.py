from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UpdateUserProfileRequest(BaseModel):
    first_name: Optional[str] = Field(None, description="The user's first name")
    last_name: Optional[str] = Field(None, description="The user's last name")
    company: Optional[str] = Field(None, description="The user's company (stored in preferences)")
    avatar_url: Optional[str] = Field(None, description="The user's avatar URL (maps to profile_image_url)")

    class Config:
        extra = "ignore"  # More flexible: ignore unknown fields instead of raising errors


class UpdateUserProfileResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the update was successful")
    message: Optional[str] = Field(None, description="A message providing additional information about the update")


class CheckEmailAvailabilityResponse(BaseModel):
    is_available: bool = Field(..., description="Indicates if the email is available")
    message: Optional[str] = Field(None, description="Additional information about email availability")