import os
import time
import boto3

from loguru import logger
from dotenv import load_dotenv 
from typing import Any, Dict, Tuple, Type, Literal
from pydantic import Field, SecretStr, computed_field, model_validator
from pydantic_settings import BaseSettings, PydanticBaseSettingsSource, SettingsConfigDict

load_dotenv()

from api.src.utils import ExceptionWithErrorType

class SSMSettingsSource(PydanticBaseSettingsSource):
    """A Pydantic settings source that fetches configuration from AWS SSM Parameter Store."""

    def __init__(self, settings_cls: Type[BaseSettings]):
        super().__init__(settings_cls)
        self.env = os.getenv("ENV", "local")
        self.region = os.getenv("AWS_DEFAULT_REGION", "eu-central-1")

    def get_field_value(self, field, field_name):
        return None, field_name, False

    def _wait_for_ssm_ready(self, ssm_client):
        """
        Blocks until the /status/ready parameter exists.
        Only runs in 'local' environment to handle Docker startup race conditions.
        """
        if self.env != "local":
            return
        
        retries = 30 # Wait up to 30 seconds
        
        for i in range(retries):
            try:
                # Check for the specific key your seed script sets at the very end
                ssm_client.get_parameter(Name="/status/ready")
                return
            except ssm_client.exceptions.ParameterNotFound:
                pass 
            except Exception as e:
               logger.error(f"Error while checking SSM readiness: {str(e)}")
               raise ExceptionWithErrorType(
                   error_type="SSM_READINESS_CHECK_ERROR",
                   message=f"Error while checking SSM readiness: {str(e)}"
               )

            time.sleep(1)
        
        raise ExceptionWithErrorType(
            error_type="SSM_READINESS_TIMEOUT",
            message="Timeout waiting for LocalStack SSM to be seeded."
        )
    
    def __call__(self) -> Dict[str, Any]:
        if self.env not in ["local", "dev", "preprod", "prod"]:
            raise ExceptionWithErrorType(
                error_type="INVALID_ENVIRONMENT",
                message=f"Invalid ENV value: {self.env}. Must be one of 'local', 'dev', 'preprod', 'prod'."
            )
        
        ssm_client = boto3.client("ssm", region_name=self.region, endpoint_url = "http://localstack:4566" if self.env == "local" else None)
        self._wait_for_ssm_ready(ssm_client)
        
        path_prefix = f"/flashslides/{self.env}/api/"
        data = {}

        try:
            paginator = ssm_client.get_paginator("get_parameters_by_path")
            page_iterator = paginator.paginate(
                Path=path_prefix, Recursive=True, WithDecryption=True
            )
            for page in page_iterator:
                for param in page.get("Parameters", []):
                    key_name = param["Name"].split("/")[-1]
                    data[key_name] = param["Value"]
        except Exception as e:
            raise ExceptionWithErrorType(
                error_type="SSM_FETCH_ERROR",
                message=f"Error fetching parameters from SSM: {str(e)}"
            )
        
        return data
    
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        frozen=True #NOTE: Make settings immutable
    )

    ENV: Literal["local", "dev", "preprod", "prod"] = Field(..., description="Environment the application is running in")
    AWS_DEFAULT_REGION: str = Field("eu-central-1", description="AWS region for SSM Parameter Store")

    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None


    # ===============
    # Secrets (fetched from SSM or .env)
    # ===============

    OPENAI_API_KEY: SecretStr
    ANTHROPIC_API_KEY: SecretStr
    GOOGLE_API_KEY: SecretStr
    STRIPE_SECRET_KEY: SecretStr
    STRIPE_WEBHOOK_SECRET: SecretStr
    DATABASE_PASSWORD: SecretStr
    DATABASE_HOST: str
    DATABASE_PORT: int = Field(default=5432)
    DATABASE_NAME: str
    DATABASE_USER: str
    AUTH_JWT_SECRET: SecretStr


    # ===============
    # Shared Defaults
    # ===============

    LANGSMITH_TRACING: str = "true"


    # ===============
    # Computed/Conditional Defaults
    # ===============

    LANGSMITH_PROJECT: str | None = None
    APP_URL: str | None = None


    # ===============
    # Custom Source Priority
    # ===============

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: Type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> Tuple[PydanticBaseSettingsSource, ...]:
        return (
            init_settings,
            env_settings,
            dotenv_settings,
            SSMSettingsSource(settings_cls)
        )
    

    # ===============
    # Validation & Logic
    # ===============
    
    @computed_field
    def DATABASE_URL(self) -> str:
        """
        Constructs the synchronous database URL from configuration parameters.
        """
        return (
            f"postgresql://{self.DATABASE_USER}:"
            f"{self.DATABASE_PASSWORD.get_secret_value()}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )
    
    @computed_field
    def ASYNC_DATABASE_URL(self) -> str:
        """
        Constructs the asynchronous database URL from configuration parameters.
        """
        return (
            f"postgresql+asyncpg://{self.DATABASE_USER}:"
            f"{self.DATABASE_PASSWORD.get_secret_value()}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )
    

    @model_validator(mode='after')
    def set_environment_specific_defaults(self) -> 'Settings':
        """
        Sets conditional defaults based on ENV.
        """
        if self.ENV == "local":
            if not self.LANGSMITH_PROJECT:
                object.__setattr__(self, 'LANGSMITH_PROJECT', "flashslides-ai-dev")
            if not self.APP_URL:
                object.__setattr__(self, 'APP_URL', "http://localhost:3000")

        #NOTE: Add logic for other environments as needed
        
        return self

    
settings = Settings()

if settings.ENV == "local":
    os.environ["LANGCHAIN_API_KEY"] = settings.OPENAI_API_KEY.get_secret_value()
    os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY.get_secret_value()
    os.environ["ANTHROPIC_API_KEY"] = settings.ANTHROPIC_API_KEY.get_secret_value()
    os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY.get_secret_value()