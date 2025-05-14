#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting server setup..."

# Update package list and install dependencies
echo "Updating package list and installing git, curl..."
sudo apt-get update
sudo apt-get install -y git curl

# Install NVM (Node Version Manager)
echo "Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Source NVM script to make nvm command available
echo "Sourcing NVM script..."
export NVM_DIR=\"\$HOME/.nvm\"
[ -s \"\$NVM_DIR/nvm.sh\" ] && \\. \"\$NVM_DIR/nvm.sh\"  # This loads nvm
[ -s \"\$NVM_DIR/bash_completion\" ] && \\. \"\$NVM_DIR/bash_completion\"  # This loads nvm bash_completion

# Verify NVM installation (optional)
# command -v nvm

# Install Node.js v21
echo "Installing Node.js v21..."
nvm install 21

# Set Node.js v21 as the default version
echo "Setting Node.js v21 as default..."
nvm alias default 21
nvm use default

# Verify Node and npm installation
echo "Node version:"
node -v
echo "npm version:"
npm -v

# Install PM2 globally
echo "Installing PM2 globally..."
npm install pm2 -g

# (Optional) Clone your repository if it's not already on the server
# Replace <your-repo-url> with your actual repository URL
# Replace /srv/LegendsOfTheFriendgroup with your desired project path
PROJECT_DIR=\"/srv/LegendsOfTheFriendgroup\" # Example project directory
REPO_URL=\"<your-repo-url>\"

# if [ ! -d \"\$PROJECT_DIR\" ]; then
#   echo "Cloning repository into \$PROJECT_DIR..."
#   git clone \"\$REPO_URL\" \"\$PROJECT_DIR\"
# else
#   echo "Project directory \$PROJECT_DIR already exists. Skipping clone."
# fi
# cd \"\$PROJECT_DIR\" || exit

echo "Setup complete!"
echo "Remember to:"
echo "1. SSH out and back in to ensure NVM is correctly loaded in your new shell session."
echo "2. If you didn't clone the repo via this script, ensure it's on your server at your chosen PROJECT_DIR."
echo "3. Create your .env file in the project root."
echo "4. Make start-server.sh executable (chmod +x start-server.sh) and run it to deploy."