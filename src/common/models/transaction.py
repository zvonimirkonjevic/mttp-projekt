from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from common.database import Base
from datetime import datetime
import uuid

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    
    #NOTE: Stripe Reference (Critical for Idempotency)
    stripe_session_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    
    amount_paid_cents: Mapped[int] = mapped_column(Integer)
    credits_added: Mapped[int] = mapped_column(Integer)    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)