import logging
from typing import Optional


def get_logger(name: Optional[str] = None) -> logging.Logger:
    logger = logging.getLogger(name or __name__)
    
    if not logger.handlers:
        logging.basicConfig(level=logging.INFO)
    
    return logger


def configure_logging(level: int = logging.INFO) -> None:
    logging.basicConfig(level=level)