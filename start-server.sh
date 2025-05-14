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
# --- MODIFIED NVM SOURCING BLOCK START ---
echo "[INFO] Setting up NVM environment..."
export NVM_DIR="$HOME/.nvm" # Standard NVM directory

if [ -s "$NVM_DIR/nvm.sh" ]; then # Check if nvm.sh exists and is not empty
  echo "[DEBUG] Sourcing $NVM_DIR/nvm.sh..."
  . "$NVM_DIR/nvm.sh" # Source NVM script. If this fails and set -e is on, script exits here.
  
  # After sourcing, nvm should be a shell function.
  if command -v nvm &>/dev/null; then
    echo "[SUCCESS] NVM function is available."
    
    echo "[INFO] Activating Node.js version using 'nvm use' (checks .nvmrc or uses default alias)..."
    # 'nvm use' without arguments will try to use .nvmrc or the default alias.
    # The setup.sh should have set a 'default' alias.
    if nvm use; then
      echo "[SUCCESS] NVM Node.js version activated: $(node -v) (npm $(npm -v))"
    else
      echo "[ERROR] 'nvm use' command failed. This could be due to a missing/invalid .nvmrc file, or no default NVM alias being set (e.g., 'nvm alias default node')."
      exit 1 # Critical failure if Node version cannot be set
    fi
  else
    echo "[ERROR] Sourced nvm.sh, but 'nvm' command/function is not available. This indicates a problem with NVM installation or the sourcing process."
    exit 1 # Critical failure
  fi
else
  echo "[ERROR] NVM script ($NVM_DIR/nvm.sh) not found or is empty. Please ensure NVM is installed correctly for the current user ($USER)."
  exit 1 # Critical failure
fi
# --- MODIFIED NVM SOURCING BLOCK END ---

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