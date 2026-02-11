import osmnx as ox
import os
from src.utils.logger import setup_logger

# Initialize logger for this module
logger = setup_logger("Data_Foundation")

def download_kigali_network(districts=None, network_type='drive'):
    """
    Downloads the Kigali road network based on specified districts.
    
    Args:
        districts (list): List of district names in Kigali.
        network_type (str): Type of street network to download (default: 'drive').
        
    Returns:
        networkx.MultiDiGraph: The downloaded road network.
    """
    if districts is None:
        districts = ["Nyarugenge", "Gasabo", "Kicukiro"]
    
    # Constructing the query for Kigali, Rwanda
    place_queries = [f"{district}, Kigali, Rwanda" for district in districts]
    
    logger.info(f"Starting download for districts: {districts}")
    
    try:
        # ox.graph_from_place handles the merging of multiple boundaries
        graph = ox.graph_from_place(place_queries, network_type=network_type, simplify=True)
        
        # Log basic stats for verification
        nodes = len(graph.nodes)
        edges = len(graph.edges)
        logger.info(f"Successfully downloaded network: {nodes} nodes and {edges} edges.")
        
        return graph
    
    except Exception as e:
        logger.error(f"Failed to download road network: {str(e)}")
        return None

def save_raw_osm(graph, filename="kigali_raw.osm"):
    """
    Saves the networkx graph to a raw .osm (XML) format for SUMO conversion.
    """
    output_path = os.path.join("data", "raw", filename)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    logger.info(f"Saving raw network to {output_path}...")
    ox.save_graph_xml(graph, filepath=output_path)
    logger.info("Save complete.")