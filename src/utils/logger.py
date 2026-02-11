import logging
import sys
import os
from datetime import datetime

def setup_logger(name: str, log_to_file: bool = True):
    """
    Initializes a professional logger for the project.
    """
    logger = logging.getLogger(name)
    
    # Prevent duplicate handlers in Notebooks
    if logger.hasHandlers():
        return logger

    logger.setLevel(logging.INFO)
    
    # [Timestamp] [Module] [Level] - Message
    formatter = logging.Formatter(
        '[%(asctime)s] [%(name)s] [%(levelname)s] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File Handler
    if log_to_file:
        log_dir = "outputs/logs"
        os.makedirs(log_dir, exist_ok=True)
        
        file_path = os.path.join(log_dir, f"{name.lower()}_{datetime.now().strftime('%Y%m%d')}.log")
        file_handler = logging.FileHandler(file_path)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger