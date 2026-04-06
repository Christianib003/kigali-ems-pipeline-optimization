import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
import logging
from collections import deque
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class SharedTrafficNetwork(nn.Module):
    """
    A lightweight Multi-Layer Perceptron (MLP).
    Shared across all traffic light agents in the city to accelerate learning.
    """
    def __init__(self, state_dim: int, action_dim: int):
        super(SharedTrafficNetwork, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )

    def forward(self, x):
        return self.network(x)

class MultiAgentTrafficController:
    """
    Manages the Independent Q-Learning logic for all traffic light intersections.
    Uses parameter sharing: one neural network, multiple intersection states.
    """
    def __init__(self, state_dim: int, action_dim: int = 2, lr: float = 1e-3, gamma: float = 0.95):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        
        self.device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
        logging.info(f"MARL Traffic Controller initialized on device: {self.device}")

        self.policy_net = SharedTrafficNetwork(state_dim, action_dim).to(self.device)
        self.target_net = SharedTrafficNetwork(state_dim, action_dim).to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()

        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=lr)
        
        self.memory = deque(maxlen=50000)

    def select_action(self, state: np.ndarray, epsilon: float) -> int:
        """Selects an action for a SINGLE intersection given its specific state."""
        if random.random() < epsilon:
            return random.randint(0, self.action_dim - 1)
        
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.policy_net(state_tensor)
            return int(torch.argmax(q_values).item())

    def push_experience(self, state, action, reward, next_state, done):
        """Stores a transition from any intersection into the shared pool."""
        self.memory.append((state, action, reward, next_state, done))

    def update(self, batch_size: int = 64) -> float | None:
        """Trains the shared network using a batch of experiences from random intersections."""
        if len(self.memory) < batch_size:
            return None

        batch = random.sample(self.memory, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)

        states = torch.FloatTensor(np.array(states)).to(self.device)
        actions = torch.LongTensor(actions).unsqueeze(1).to(self.device)
        rewards = torch.FloatTensor(rewards).unsqueeze(1).to(self.device)
        next_states = torch.FloatTensor(np.array(next_states)).to(self.device)
        dones = torch.FloatTensor(dones).unsqueeze(1).to(self.device)

        current_q_values = self.policy_net(states).gather(1, actions)

        with torch.no_grad():
            max_next_q_values = self.target_net(next_states).max(1)[0].unsqueeze(1)
            expected_q_values = rewards + (self.gamma * max_next_q_values * (1 - dones))

        loss = nn.MSELoss()(current_q_values, expected_q_values)

        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_value_(self.policy_net.parameters(), 10)
        self.optimizer.step()

        return loss.item()

    def update_target_network(self) -> None:
        self.target_net.load_state_dict(self.policy_net.state_dict())

    def save_model(self, filepath: str | Path) -> None:
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.policy_net.state_dict(), filepath)
        logging.info(f"Traffic MARL model saved to {filepath}")

    def load_model(self, filepath: str | Path) -> bool:
        filepath = Path(filepath)
        if filepath.exists():
            self.policy_net.load_state_dict(torch.load(filepath, map_location=self.device))
            self.target_net.load_state_dict(self.policy_net.state_dict())
            logging.info(f"Resumed traffic training from checkpoint: {filepath}")
            return True
        return False