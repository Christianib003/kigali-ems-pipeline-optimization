import os
from pathlib import Path
from src.utils.logger import setup_logger

logger = setup_logger("cache_manager")

def load_or_build(file_path: Path, build_func, *args, **kwargs):
    """
    Checks if a file exists. Loads it if true, otherwise runs build_func.
    """
    if file_path.exists():
        logger.info(f"Cache Hit: Loading existing artifact from {file_path}")
        # Logic for loading depends on file extension
        if file_path.suffix == '.parquet':
            import pandas as pd
            return pd.read_parquet(file_path)
        return str(file_path) # Return path for non-data files (like .net.xml)

    logger.info(f"Cache Miss: Building artifact at {file_path}")
    result = build_func(*args, **kwargs)
    
    # Optional: Save result if it's a dataframe and path is parquet
    if hasattr(result, 'to_parquet') and file_path.suffix == '.parquet':
        result.to_parquet(file_path)
        logger.info(f"Artifact saved to {file_path}")
        
    return result