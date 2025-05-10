#!/bin/bash

# Simple setup script for Digital Ocean droplet

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install requirements
echo "Installing Docker and other required packages..."
sudo apt install -y docker.io docker-compose git curl netstat-net-tools

# Enable and start Docker
echo "Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Add current user to Docker group
sudo usermod -aG docker $USER
echo "Added $USER to docker group. You may need to log out and back in for this to take effect."

# Clone the repository (uncomment and modify if needed)
# echo "Cloning repository..."
# git clone https://github.com/yourusername/LegendsOfTheFriendgroup.git
# cd LegendsOfTheFriendgroup

echo "Setup complete! Next steps:"
echo "1. Create your .env file with Discord credentials"
echo "2. Run './deploy.sh' to deploy the application"