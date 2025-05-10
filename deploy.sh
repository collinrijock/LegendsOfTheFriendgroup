#!/bin/bash

# Check for .env file
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file with your Discord credentials:"
    echo "VITE_CLIENT_ID=your_discord_client_id"
    echo "CLIENT_SECRET=your_discord_client_secret"
    exit 1
fi

# Check if netstat is available
if command -v netstat &> /dev/null; then
    # Check if ports 8080 and 4001 are available
    if netstat -tuln | grep -q ":8080 "; then
        echo "Warning: Port 8080 is already in use. This may cause conflicts with the client."
    fi

    if netstat -tuln | grep -q ":4001 "; then
        echo "Warning: Port 4001 is already in use. This may cause conflicts with the server."
    fi
else
    echo "Note: netstat command not found. Skipping port availability checks."
    echo "If you need port checking, install net-tools with: sudo apt install net-tools"
fi

# Check if required directories exist
if [ ! -d "packages/client" ]; then
    echo "Error: packages/client directory not found!"
    echo "Please ensure you have the correct directory structure."
    exit 1
fi

if [ ! -d "packages/server" ]; then
    echo "Error: packages/server directory not found!"
    echo "Please ensure you have the correct directory structure."
    exit 1
fi

echo "Stopping any existing containers..."
docker-compose down

echo "Building containers (this may take a few minutes)..."
docker-compose build --no-cache

echo "Starting containers..."
docker-compose up -d

# Check if containers are running
if [ $(docker-compose ps -q | wc -l) -eq 2 ]; then
    echo "✅ Deployment complete! Application is running at:"
    PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
    echo "Client: http://${PUBLIC_IP:-localhost}:8080"
    echo "Server: http://${PUBLIC_IP:-localhost}:4001"
    echo ""
    echo "To view logs:"
    echo "  Client: docker-compose logs -f client"
    echo "  Server: docker-compose logs -f server"
else
    echo "❌ Deployment failed! Check logs with: docker-compose logs"
fi