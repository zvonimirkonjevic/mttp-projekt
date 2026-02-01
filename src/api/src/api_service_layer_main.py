import os
import multiprocessing

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

import api.src.routers.router_v1 as router_v1
from api.src.logging_config import setup_logging
from common.database import init_async_db, init_db
from api.src.settings import settings

#NOTE: Set multiprocessing start method for compatibility with gRPC
if multiprocessing.get_start_method(allow_none=True) != 'spawn':
    try:
        multiprocessing.set_start_method('spawn', force=False)
    except RuntimeError:
        pass

setup_logging(env=settings.ENV)
init_db()
init_async_db()


def create_app():
    app = FastAPI()

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # Next.js default port
            "http://localhost:3002",  # Your current Next.js port
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3002",
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    app.include_router(router_v1.router)
    app.include_router(router_v1.router, prefix="/v1")
    app.include_router(router_v1.router, prefix="/latest")
    
    return app

app = create_app()
handler = Mangum(app)