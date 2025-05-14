#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
echo "--- Starting Manual Server Setup Script (for pre-built app) ---"

PROJECT_DIR="$(pwd)" # Use current working directory
echo "[INFO] Project directory set to: $PROJECT_DIR"

echo "[INFO] Navigating to project directory to ensure context..."
cd "$PROJECT_DIR" || { echo "[ERROR] Failed to navigate to project directory: $PROJECT_DIR. Exiting."; exit 1; }
echo "[SUCCESS] Successfully navigated to project directory."

echo "[INFO] Attempting to pull latest changes from Git (including pre-built 'dist' folders)..."
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

echo ""
echo "--- Dependency Installation Complete ---"
echo "The application should have been built locally (npm run build in client and server packages),"
echo "and the resulting 'dist' folders committed to the repository before running this script."
echo ""
echo "To run your server manually (e.g., using 'screen'):"
echo "1. If 'screen' is not installed, run: sudo apt-get install screen"
echo "2. Start a new screen session: screen -S lotf-server"
echo "   (You can name 'lotf-server' anything you like)"
echo "3. Inside the screen session, navigate to your project directory if you're not already there:"
echo "   cd $PROJECT_DIR"
echo "4. Run the server (make sure your .env file is in $PROJECT_DIR and app was built locally):"
echo "   NODE_ENV=production node packages/server/dist/server.js"
echo "5. To detach from the screen session (leaving the server running), press: Ctrl+A then D"
echo ""
echo "To reattach to the session later: screen -r lotf-server (or the name you used)"
echo "To list active screen sessions: screen -ls"
echo "To terminate a screen session (and the server): reattach to it, then press Ctrl+C, then type 'exit'."
echo ""
echo "Ensure your .env file exists at $PROJECT_DIR/.env with necessary variables (PORT, VITE_CLIENT_ID, CLIENT_SECRET, etc.)."
echo "The server will use the PORT from .env or default to 4001."
echo "--- Manual Server Start Instructions Finished ---"