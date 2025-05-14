#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
echo "--- Starting Server Deployment Script ---"

PROJECT_DIR="$(pwd)" # Use current working directory
echo "[INFO] Project directory set to: $PROJECT_DIR"

echo "[INFO] Navigating to project directory to ensure context..."
cd "$PROJECT_DIR" || { echo "[ERROR] Failed to navigate to project directory: $PROJECT_DIR. Exiting."; exit 1; }
echo "[SUCCESS] Successfully navigated to project directory."

echo "[INFO] Attempting to pull latest changes from Git..."
git pull
echo "[SUCCESS] Git pull completed."

# Source NVM if not already available (e.g., in cron or non-interactive shells)
echo "[INFO] Sourcing NVM..."
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  echo "[SUCCESS] NVM sourced."
else
  echo "[WARNING] NVM script not found at $NVM_DIR/nvm.sh. Node/npm commands might fail if not in PATH."
fi

echo "[INFO] Current Node version: $(node -v)"
echo "[INFO] Current npm version: $(npm -v)"

echo "[INFO] Installing client dependencies (packages/client)..."
npm --prefix packages/client install
echo "[SUCCESS] Client dependencies installed."

echo "[INFO] Building client (packages/client)..."
npm --prefix packages/client run build
echo "[SUCCESS] Client build completed."

echo "[INFO] Installing server dependencies (packages/server)..."
npm --prefix packages/server install
echo "[SUCCESS] Server dependencies installed."

echo "[INFO] Building server (TypeScript compilation for packages/server)..."
npm --prefix packages/server run build
echo "[SUCCESS] Server build completed."

echo "[INFO] Starting/Restarting server with PM2 using 'production' environment..."
# This will use the env_production settings from ecosystem.config.js
pm2 startOrRestart ecosystem.config.js --env production
echo "[SUCCESS] PM2 startOrRestart command issued."

echo "[INFO] Deployment complete. Server should be running."
echo "[INFO] Current PM2 process list:"
pm2 list
echo "[INFO] Last 20 lines of logs for 'lotf-server':"
pm2 logs lotf-server --lines 20

echo "--- Server Deployment Script Finished ---"