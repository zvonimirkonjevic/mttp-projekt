import os
import traceback
import uuid

from typing import Dict
from loguru import logger
from sqlalchemy import select

from common.models.user import User
from common import database
from api.src.utils import ExceptionWithErrorType
from sqlalchemy.exc import IntegrityError
from common.models.transaction import Transaction

from api.src.settings import settings


# ===============
# Process Successful Payment
# ===============

async def process_successful_payment(session: Dict):
    user_id_str = session.get("metadata", {}).get("user_id")
    credits = int(session.get("metadata", {}).get("credits", 0))
    if credits <= 0:
        logger.error("Invalid credits in session metadata")
        return
    env = session.get("metadata", {}).get("env")
    amount_paid_cents = session.get("amount_total")
    session_id = session.get("id")
    stripe_customer_id = session.get("customer")

    if env and env != settings.ENV:
        logger.info(f"Skipping webhook from mismatched env: {env}")
        return

    if not user_id_str:
        logger.error("No user_id in session metadata")
        return

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        logger.error(f"Invalid user_id UUID: {user_id_str}")
        return

    async with database.async_session_local() as db:
        try:
            async with db.begin():
                # Lock user row first to prevent concurrent modifications
                result = await db.execute(
                    select(User).where(User.id == user_uuid).with_for_update()
                )
                user = result.scalar_one_or_none()
                if not user:
                    logger.warning(
                        "User not found for webhook session; skipping transaction",
                        extra={"session_id": session_id, "user_id": user_id_str}
                    )
                    return

                txn = Transaction(
                    user_id=user_uuid,
                    stripe_session_id=session_id,
                    amount_paid_cents=amount_paid_cents,
                    credits_added=credits
                )
                db.add(txn)

                await db.flush()

                user.credits_balance += credits
                if not user.stripe_customer_id and stripe_customer_id:
                    user.stripe_customer_id = stripe_customer_id
                    logger.info(f"Linked new Stripe Customer {stripe_customer_id} to user {user_id_str}")

                logger.info(
                    "Transaction processed successfully",
                    extra={
                        "session_id": session_id,
                        "user_id": str(user_uuid),
                        "credits_added": credits,
                        "amount_paid_cents": amount_paid_cents
                    }
                )

        except IntegrityError as ie:
            if "stripe_session_id" in str(ie.orig):
                logger.info(f"Duplicate webhook for session {session_id}, idempotently ignored")
                return
            else:
                logger.error(f"Database integrity error for session {session_id}: {ie}")
                raise ExceptionWithErrorType(
                    error_type="DATABASE_INTEGRITY_ERROR",
                    message="A database integrity error occurred while processing the transaction."
                )

        except Exception as e:
            error_traceback = traceback.format_exc()
            logger.error(f"Error processing transaction for session {session_id}: {str(e)}\n{error_traceback}")
            raise ExceptionWithErrorType(
                error_type="TRANSACTION_PROCESSING_ERROR",
                message=str(e)
            )