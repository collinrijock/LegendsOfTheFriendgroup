#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

PROJECT_DIR=\"/srv/LegendsOfTheFriendgroup\" # Change this to your actual project directory

echo "Navigating to project directory: \$PROJECT_DIR"
cd \"\$PROJECT_DIR\" || { echo "Failed to navigate to project directory. Exiting."; exit 1; }

echo "Pulling latest changes from Git..."
git pull

# Source NVM if not already available (e.g., in cron or non-interactive shells)
export NVM_DIR=\"\$HOME/.nvm\"
[ -s \"\$NVM_DIR/nvm.sh\" ] && \\. \"\$NVM_DIR/nvm.sh\"

echo "Installing client dependencies..."
npm --prefix packages/client install

echo "Building client..."
npm --prefix packages/client run build

echo "Installing server dependencies..."
npm --prefix packages/server install

echo "Building server (TypeScript compilation)..."
npm --prefix packages/server run build

echo "Starting/Restarting server with PM2 using production environment..."
# This will use the env_production settings from ecosystem.config.js
pm2 startOrRestart ecosystem.config.js --env production

echo "Deployment complete. Server should be running."
pm2 list
pm2 logs lotf-server --lines 20 # Show last 20 lines of logs for the server