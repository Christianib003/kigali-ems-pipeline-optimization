import os
import logging
import osmnx as ox
import networkx as nx
import requests
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def fetch_kigali_osm(districts: list, output_path: str | Path, network_type: str = 'drive') -> None:
    """
    Fetches OpenStreetMap road network data for given districts and saves it as a GraphML file.
    If the file already exists, it skips the download to ensure resumability.
    """
    output_path = Path(output_path)
    
    if output_path.exists():
        logging.info(f"OSM network graph already exists at {output_path}. Skipping download.")
        return

    logging.info(f"Downloading UN-SIMPLIFIED OSM network data for: {districts}. This may take a moment...")
    try:
        graphs = [ox.graph_from_place(place, network_type=network_type, simplify=False) for place in districts]
        
        combined_graph = nx.compose_all(graphs)
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        ox.save_graphml(combined_graph, filepath=output_path)
        logging.info(f"Successfully saved unsimplified OSM network to {output_path}.")
        
    except Exception as e:
        logging.error(f"Failed to fetch OSM data: {e}")
        raise

def download_population_data(url: str, output_path: str | Path) -> None:
    """
    Downloads population density data (e.g., WorldPop GeoTIFF) if it doesn't already exist.
    """
    output_path = Path(output_path)
    
    if output_path.exists():
        logging.info(f"Population data already exists at {output_path}. Skipping download.")
        return
        
    logging.info(f"Downloading population data from {url}...")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        logging.info(f"Successfully downloaded population data to {output_path}.")
    except Exception as e:
        logging.error(f"Failed to download population data: {e}")
        raise