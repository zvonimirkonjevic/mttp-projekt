import traceback
import functools
import asyncio

from loguru import logger
from typing import List
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage


# ===============
# Custom API Exception
# ===============

class ExceptionWithErrorType(Exception):
    """
    Custom exception class with error type information
    """
    def __init__(self, message: str, error_type: str):
        self.error_type = error_type
        super().__init__(message)


# ===============
# Custom Endpoint Exception Handler
# ===============

def endpoint_exception_handler(func):
    """
    Function wrapper for catching exceptions and logging them.
    """

    @functools.wraps(func)
    async def async_inner_function(*args, **kwargs):
        try:
            result = await func(*args, **kwargs)
            return result

        except ExceptionWithErrorType as e:
            error_traceback = traceback.format_exc()
            logger.error(f"{e}\n{error_traceback}")
            raise

        except Exception as e:
            error_traceback = traceback.format_exc()
            logger.error(f"Unknown Error: {e}\n{error_traceback}")
            raise ExceptionWithErrorType(
                error_type="UNKNOWN",
                message=f"Unknown Error: {e}",
            )

    @functools.wraps(func)
    def sync_inner_function(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
            return result

        except ExceptionWithErrorType as e:
            error_traceback = traceback.format_exc()
            logger.error(f"{e}\n{error_traceback}")
            raise

        except Exception as e:
            error_traceback = traceback.format_exc()
            logger.error(f"Unknown Error: {e}\n{error_traceback}")
            raise ExceptionWithErrorType(
                error_type="UNKNOWN",
                message=f"Unknown Error: {e}",
            )

    if asyncio.iscoroutinefunction(func):
        return async_inner_function
    else:
        return sync_inner_function
    

# ===============
# Utility Functions
# ===============

def extract_text_from_response(response, context: str = "unknown") -> str:
    """Extract text content from a LangChain model response.

    Args:
        response: The response object from a LangChain model invocation.
        context (str): Contextual information about workflow stagefor logging purposes.
    Returns:
        str: Extracted text content.
    Raises:
        ValueError: If no text content is found in the response.
    """
    try:
        if not response or not hasattr(response, "content"):
            logger.error(f"No content found in the response for context: {context}")
            raise ValueError("No content found in the response.")

        if hasattr(response, "content") and isinstance(response.content, list) and len(response.content) > 0:
            first_item = response.content[0]
            if isinstance(first_item, dict):
                text_content = first_item.get("text", "").strip()
                if not text_content:
                    logger.error(f"Empty text content in the response for context: {context}")
                    raise ValueError("Empty text content in the response.")
                return text_content
            elif isinstance(first_item, str):
                return first_item.strip()
        
        if isinstance(response.content, str):
            return response.content.strip()
        
        raise ValueError("Unexpected response format.")
    
    except Exception as e:
        error_traceback = traceback.format_exc()
        logger.error(f"Failed to parse model response in '{context}': {e}\n{error_traceback}")
        raise ValueError(f"Critical failure parsing AI model response in stage: {context}")