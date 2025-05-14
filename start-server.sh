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

# NVM setup block removed. Assuming Node.js is pre-installed and in PATH.
echo "[INFO] Verifying Node.js and npm versions (using system-installed)..."
if command -v node &>/dev/null && command -v npm &>/dev/null; then
  echo "[INFO] Current Node version: $(node -v)"
  echo "[INFO] Current npm version: $(npm -v)"
else
  echo "[ERROR] Node.js or npm is not installed or not found in PATH. Please install Node.js."
  exit 1
fi

echo "[INFO] Installing client dependencies (packages/client)..."
npm --prefix packages/client install
echo "[SUCCESS] Client dependencies installed."

# Client build step removed. Assuming client is built locally and 'dist' is committed.

echo "[INFO] Installing server dependencies (packages/server)..."
npm --prefix packages/server install
echo "[SUCCESS] Server dependencies installed."

# Server build step removed. Assuming server is built locally and 'dist' is committed.

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