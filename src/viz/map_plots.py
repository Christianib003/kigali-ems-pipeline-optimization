import matplotlib.pyplot as plt
import osmnx as ox

def plot_road_network(G, title="Kigali Road Network", bgcolor="white", edge_color="#666666"):
    """
    Standardizes the visualization of the OpenStreetMap graph.
    """
    fig, ax = ox.plot_graph(
        G, 
        bgcolor=bgcolor, 
        edge_color=edge_color, 
        node_size=0, 
        show=False, 
        close=False
    )
    ax.set_title(title, fontsize=14)
    return fig, ax

def plot_hotspots(ax, hotspots_df, color='red', label='Hotspots'):
    """
    Overlays hotspots on an existing map axis.
    """
    hotspots_df.plot(ax=ax, color=color, markersize=50, label=label, alpha=0.7)
    return ax
