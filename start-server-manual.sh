#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
echo "--- Starting Manual Server Build Script ---"

PROJECT_DIR="$(pwd)" # Use current working directory
echo "[INFO] Project directory set to: $PROJECT_DIR"

echo "[INFO] Navigating to project directory to ensure context..."
cd "$PROJECT_DIR" || { echo "[ERROR] Failed to navigate to project directory: $PROJECT_DIR. Exiting."; exit 1; }
echo "[SUCCESS] Successfully navigated to project directory."

echo "[INFO] Attempting to pull latest changes from Git..."
git pull
echo "[SUCCESS] Git pull completed."

# Source NVM if not already available
echo "[INFO] Setting up NVM environment..."
export NVM_DIR="$HOME/.nvm"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  echo "[DEBUG] Sourcing $NVM_DIR/nvm.sh..."
  . "$NVM_DIR/nvm.sh"
  if command -v nvm &>/dev/null; then
    echo "[SUCCESS] NVM function is available."
    if nvm use; then
      echo "[SUCCESS] NVM Node.js version activated: $(node -v) (npm $(npm -v))"
    else
      echo "[ERROR] 'nvm use' command failed. Check .nvmrc or default alias."
      exit 1
    fi
  else
    echo "[ERROR] Sourced nvm.sh, but 'nvm' command is not available."
    exit 1
  fi
else
  echo "[ERROR] NVM script ($NVM_DIR/nvm.sh) not found or is empty."
  exit 1
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

echo ""
echo "--- Build Process Complete ---"
echo ""
echo "To run your server using 'screen':"
echo "1. If 'screen' is not installed, run: sudo apt-get install screen"
echo "2. Start a new screen session: screen -S lotf-server"
echo "   (You can name 'lotf-server' anything you like)"
echo "3. Inside the screen session, navigate to your project directory if you're not already there:"
echo "   cd $PROJECT_DIR"
echo "4. Run the server (make sure your .env file is in $PROJECT_DIR):"
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