import uuid
from datetime import datetime
from typing import Optional, Any
from sqlalchemy import ForeignKey, Integer, String, Boolean, DateTime, func, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from common.database import Base
import enum


class UserType(str, enum.Enum):
    admin = "admin"
    member = "member"
    guest = "guest"
    individual = "individual"

class User(Base):
    __tablename__ = "users"

    # Primary Key (UUID)
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        server_default=func.gen_random_uuid()
    )

    # Core Identity
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Profile Info
    first_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    profile_image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Security
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    password_status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    password_updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )

    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), 
        #ForeignKey("organizations.id"),
        nullable=True,
        index=True
    )
    subscription_plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), 
        #ForeignKey("subscription_plans.id"),
        nullable=True
    )
    stripe_customer_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    credits_balance: Mapped[int] = mapped_column(Integer, default=0)

    # Enums & Configuration
    user_type: Mapped[Optional[UserType]] = mapped_column(
        SAEnum(UserType, name="user_type", create_type=False),
        nullable=True
    )
    
    # Preferences & Settings
    timezone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    language_preference: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    preferences: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # System Timestamps (Timestamptz)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )