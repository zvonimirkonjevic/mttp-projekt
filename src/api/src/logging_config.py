from loguru import logger 
import sys


def setup_logging(env: str = "local", serialize: bool = False):
    """
    Setup of the logging for the application.
    The logger will configure logging level based on the environment 
    
    This should be called at the start of the application. 
    Then all other imports of logger as 
    ```
    from src.logging_config import logger
    ```
    will use this setup 
    
    Args:
        env (str): The environment to setup logging for.
        serialize (bool): Whether to serialize the logs.
    """

    assert env in ["local", "dev", "preprod", "prod"], "Environment must be local, dev, preprod or prod"
    match env:
        case "local":
            level = "DEBUG"
        case "dev":
            level = "INFO"
        case "preprod":
            level = "INFO"
        case "prod":
            level = "INFO" # WARN

    logger_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level> | "
        "{extra}"
    )
    
    logger.remove()
    logger.add(
        sys.stdout,
        format = logger_format,
        level = level,
        enqueue = True, # In multiprocess setups ensures logs from different processes are safely written.
        serialize = serialize # Can turn logs to structured and makes sure logs are serialized and can be safely written to stdout.
    )


    logger.info(f"Logging setup complete for environment: {env}")
    return logger
