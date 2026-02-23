import numpy as np
import json

def inspect_dict(data: dict, title: str = "Dictionary Inspection"):
    """Prints a scannable, indented view of a dictionary."""
    print(f"\n--- {title} ---")
    print(json.dumps(data, indent=4, default=str))
    print("-" * (len(title) + 8) + "\n")

def inspect_array(arr: np.ndarray, name: str = "Array"):
    """Prints the shape, dtype, and basic stats of a NumPy array."""
    print(f"\n--- {name} Inspection ---")
    print(f"Shape: {arr.shape}")
    print(f"Dtype: {arr.dtype}")
    if arr.size > 0:
        print(f"Min:   {arr.min():.4f}")
        print(f"Max:   {arr.max():.4f}")
        print(f"Mean:  {arr.mean():.4f}")
    print("-" * (len(name) + 12) + "\n")