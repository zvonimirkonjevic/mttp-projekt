import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker

from api.src.settings import settings

Base = declarative_base()

sync_engine = None
sync_session_local = None

async_engine = None
async_session_local = None

def init_db():
    """
    Initialize the database connection and session factory.
    """

    global sync_engine, sync_session_local

    DATABASE_URL = settings.DATABASE_URL

    sync_engine = create_engine(
        DATABASE_URL, 
        pool_pre_ping=True,
        pool_size=20,
        max_overflow=10
    )

    sync_session_local = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

def init_async_db():
    """
    Initialize the asynchronous database connection and session factory.
    """

    global async_engine, async_session_local

    ASYNC_DATABASE_URL = settings.ASYNC_DATABASE_URL

    async_engine = create_async_engine(
        ASYNC_DATABASE_URL,
        pool_pre_ping=True,
        pool_size=20,
        max_overflow=10,
        connect_args={"statement_cache_size": 0}
    )

    async_session_local = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

def get_db():
    if sync_session_local is None:
        #NOTE: Fix this error later by adding correct error type
        raise ValueError("Database not initialized. Call init_db() first.")

    db = sync_session_local()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    if async_session_local is None:
        #NOTE: Fix this error later by adding correct error type
        raise ValueError("Database not initialized. Call init_async_db() first.")
    async with async_session_local() as db:
            yield db