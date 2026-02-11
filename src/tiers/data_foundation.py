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

def refine_network_attributes(graph):
    """
    Refines road attributes by imputing missing speed limits and lane counts
    based on Kigali's urban road standards.
    """
    logger.info("Refining road attributes (speeds and lanes)...")
    
    # Standard Kigali urban speeds (km/h) converted to m/s for SUMO
    # Primary: 60km/h (~16.6 m/s), Secondary: 50km/h (~13.8 m/s), Residential: 30km/h (~8.3 m/s)
    speed_map = {
        'trunk': 16.67,
        'primary': 16.67,
        'secondary': 13.89,
        'tertiary': 11.11,
        'residential': 8.33,
        'unclassified': 8.33
    }
    
    # Default lanes if missing
    lane_map = {
        'trunk': 3,
        'primary': 2,
        'secondary': 2,
        'tertiary': 1,
        'residential': 1
    }

    for u, v, k, data in graph.edges(data=True, keys=True):
        highway_type = data.get('highway', 'unclassified')
        if isinstance(highway_type, list): highway_type = highway_type[0]

        # Impute Speed
        if 'maxspeed' not in data:
            data['speed'] = speed_map.get(highway_type, 8.33)
        else:
            # Handle potential strings/lists in OSM maxspeed data
            try:
                data['speed'] = float(data['maxspeed']) / 3.6
            except (ValueError, TypeError):
                data['speed'] = speed_map.get(highway_type, 8.33)

        # Impute Lanes
        if 'lanes' not in data:
            data['lanes'] = lane_map.get(highway_type, 1)
            
    logger.info("Attribute refinement complete.")
    return graph