import os
import jwt
import json

from loguru import logger
from jwt import PyJWK
from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from api.src.utils import ExceptionWithErrorType
from api.src.settings import settings

JWT_SECRET_JSON = settings.AUTH_JWT_SECRET.get_secret_value()
ALGORITHM = "ES256"

security = HTTPBearer()

def validate_token(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> str:
    """
    Decodes the token and returns the Identity Provider's User ID.
    """
    token = credentials.credentials

    try:
        jwk_data = json.loads(JWT_SECRET_JSON)
        public_key = PyJWK(jwk_data).key

        payload = jwt.decode(
            token,
            public_key,
            algorithms=[ALGORITHM],
            options={"verify_aud": False}
        )
        return payload
    
    except jwt.ExpiredSignatureError:
        logger.error("Token validation failed: Token expired.")
        raise ExceptionWithErrorType(
            message="Token validation failed: Token expired.",
            error_type="AUTH_TOKEN_EXPIRED"
        )

    except jwt.PyJWTError as e:
        logger.error(f"Token validation error: {e}")
        raise ExceptionWithErrorType(
            message="Token validation failed: Token validation error",
            error_type="AUTH_TOKEN_INVALID"
        )
    
    except Exception as e:
        logger.error(f"Unexpected error during token validation: {e}")
        raise ExceptionWithErrorType(
            message="Unexpected error during token validation",
            error_type="AUTHENTICATION_FAILURE"
        )