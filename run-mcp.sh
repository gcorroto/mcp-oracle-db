#!/bin/bash

echo "Starting Oracle DB MCP Server..."
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please copy config.example.env to .env and configure your Oracle DB settings."
    echo
    exit 1
fi

# Check if dist folder exists
if [ ! -d dist ]; then
    echo "Building project..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "ERROR: Build failed!"
        exit 1
    fi
fi

# Load environment variables from .env file
set -a
source .env
set +a

echo "Oracle DB MCP Server Configuration:"
echo "- Host: ${ORACLE_HOST:-localhost}"
echo "- Port: ${ORACLE_PORT:-1521}"
echo "- Service: ${ORACLE_SERVICE_NAME:-XE}"
echo "- Username: ${ORACLE_USERNAME:-hr}"
echo "- Old Crypto: ${ORACLE_OLD_CRYPTO:-false}"
echo

echo "Starting server..."
node dist/index.js 