import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
import logging
from collections import deque
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class DQNNetwork(nn.Module):
    """
    A Multi-Layer Perceptron (MLP) for the Dispatch Agent.
    Maps the global state vector to Q-values for each ambulance.
    """
    def __init__(self, state_dim: int, action_dim: int):
        super(DQNNetwork, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )

    def forward(self, x):
        return self.network(x)

class ReplayBuffer:
    """Stores transitions for off-policy learning."""
    def __init__(self, capacity: int = 10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            np.array(states),
            np.array(actions),
            np.array(rewards, dtype=np.float32),
            np.array(next_states),
            np.array(dones, dtype=np.float32)
        )

    def __len__(self):
        return len(self.buffer)

class DispatchAgent:
    """
    The DQN Agent orchestrating exploration, exploitation, and learning.
    Includes strict state-saving protocols for resumability.
    """
    def __init__(self, state_dim: int, action_dim: int, lr: float = 1e-3, gamma: float = 0.99):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        
        # Determine the best available hardware accelerator
        self.device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
        logging.info(f"DQN initialized on device: {self.device}")

        # Primary and Target networks
        self.policy_net = DQNNetwork(state_dim, action_dim).to(self.device)
        self.target_net = DQNNetwork(state_dim, action_dim).to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()

        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=lr)
        self.memory = ReplayBuffer()

    def select_action(self, state: np.ndarray, epsilon: float, available_mask: list[bool]) -> int:
        """
        Uses epsilon-greedy policy to select an action.
        available_mask ensures we don't dispatch an ambulance that is already busy.
        """
        if random.random() < epsilon:
            # Explore: pick a random *available* ambulance
            available_indices = [i for i, is_avail in enumerate(available_mask) if is_avail]
            if not available_indices:
                return -1 # No ambulances available
            return random.choice(available_indices)
        
        # Exploit: pick the available ambulance with the highest Q-value
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.policy_net(state_tensor).cpu().numpy()[0]
            
            # Mask out unavailable ambulances with a massive negative penalty
            for i, is_avail in enumerate(available_mask):
                if not is_avail:
                    q_values[i] = -float('inf')
                    
            if np.max(q_values) == -float('inf'):
                return -1 # No ambulances available
                
            return int(np.argmax(q_values))

    def update(self, batch_size: int) -> float | None:
        """Performs one step of gradient descent on the policy network."""
        if len(self.memory) < batch_size:
            return None

        states, actions, rewards, next_states, dones = self.memory.sample(batch_size)

        states = torch.FloatTensor(states).to(self.device)
        actions = torch.LongTensor(actions).unsqueeze(1).to(self.device)
        rewards = torch.FloatTensor(rewards).unsqueeze(1).to(self.device)
        next_states = torch.FloatTensor(next_states).to(self.device)
        dones = torch.FloatTensor(dones).unsqueeze(1).to(self.device)

        # Get current Q values
        current_q_values = self.policy_net(states).gather(1, actions)

        # Get next Q values from target network
        with torch.no_grad():
            max_next_q_values = self.target_net(next_states).max(1)[0].unsqueeze(1)
            expected_q_values = rewards + (self.gamma * max_next_q_values * (1 - dones))

        # Compute Huber loss (less sensitive to outliers in rewards)
        loss = nn.SmoothL1Loss()(current_q_values, expected_q_values)

        # Optimize the model
        self.optimizer.zero_grad()
        loss.backward()
        # Gradient clipping to stabilize training
        torch.nn.utils.clip_grad_value_(self.policy_net.parameters(), 100)
        self.optimizer.step()

        return loss.item()

    def update_target_network(self) -> None:
        """Syncs the target network weights with the policy network."""
        self.target_net.load_state_dict(self.policy_net.state_dict())

    def save_model(self, filepath: str | Path) -> None:
        """Saves the policy network weights."""
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.policy_net.state_dict(), filepath)
        logging.info(f"Model saved to {filepath}")

    def load_model(self, filepath: str | Path) -> bool:
        """Loads the policy network weights if they exist (Resumability)."""
        filepath = Path(filepath)
        if filepath.exists():
            self.policy_net.load_state_dict(torch.load(filepath, map_location=self.device))
            self.target_net.load_state_dict(self.policy_net.state_dict())
            logging.info(f"Resumed training from existing checkpoint: {filepath}")
            return True
        logging.info("No existing checkpoint found. Initializing fresh weights.")
        return False