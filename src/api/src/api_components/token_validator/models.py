from pydantic import BaseModel, EmailStr


# ===============
# Models
# ===============


class AuthenticationRequest(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None


class AuthenticationResponse(BaseModel):
    internal_id: str
    status: str
    is_new_user: bool