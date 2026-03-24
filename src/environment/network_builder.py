import subprocess
import logging
import osmnx as ox
import sumolib
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def build_sumo_network(graphml_path: str | Path, output_net_path: str | Path) -> None:
    """
    Converts the locally cached GraphML file directly into a SUMO-compatible 
    OSM XML file, bypassing all external APIs and Protobuf compilation issues.
    """
    output_net_path = Path(output_net_path)
    if output_net_path.exists():
        logging.info(f"SUMO network already exists at {output_net_path}. Skipping generation.")
        return

    osm_xml_path = output_net_path.parent / "kigali.osm.xml"
    
    # 1. Convert our existing GraphML to plain OSM XML using OSMnx
    if not osm_xml_path.exists():
        logging.info("Loading previously downloaded Kigali GraphML...")
        G = ox.load_graphml(graphml_path)
        
        logging.info("Converting GraphML locally to SUMO-compatible OSM XML...")
        # This uses OSMnx's built-in tool specifically designed for SUMO integration
        ox.save_graph_xml(G, filepath=osm_xml_path)
        logging.info("Local XML conversion complete.")
        
    # 2. Run SUMO's netconvert programmatically
    logging.info("Running netconvert on the locally generated XML...")
    
    cmd = [
        "netconvert",
        "--osm-files", str(osm_xml_path),
        "--output-file", str(output_net_path),
        "--geometry.remove", "true",        # Simplifies geometry for faster simulation
        "--roundabouts.guess", "true",      # Fixes right-of-way logic in traffic circles
        "--tls.guess", "true",              # Generates traffic light controllers at major intersections
        "--ramps.guess", "true",
        "--junctions.join", "true",         # Merges complex intersections into single nodes
        "--remove-edges.isolated", "true",   # Prunes disconnected roads that trap vehicles
        "--proj.utm", "true"
    ]
    
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logging.info(f"Successfully generated SUMO network at {output_net_path}")
    except subprocess.CalledProcessError as e:
        logging.error(f"Netconvert failed. Error: {e.stderr.decode('utf-8', errors='ignore')}")
        raise
    except FileNotFoundError:
        logging.error("The 'netconvert' command was not found. Please ensure SUMO is installed and added to your system PATH.")
        raise

def validate_network(net_path: str | Path) -> None:
    """Validates the network using sumolib to ensure topological integrity."""
    logging.info(f"Validating network topology: {net_path}")
    net = sumolib.net.readNet(str(net_path))
    logging.info(f"Network is valid. Successfully parsed {len(net.getNodes())} nodes and {len(net.getEdges())} edges.")