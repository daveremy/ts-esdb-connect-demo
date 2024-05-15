#!/bin/bash

# Usage:
#   ./docker_esdb_connector.sh
# This script is a helper for Docker scenarios where EventStoreDB needs to communicate with a Node.js app running on the host.

# EventStoreDB URL inside Docker
EVENTSTOREDB_URL="http://eventstoredb:2113"

# The Node.js endpoint URL when running locally on the host machine.
# Change the IP to match your Docker host IP or specific configurations if needed.
NODEJS_ENDPOINT="http://host.docker.internal:3000/event/loanApplication"

# Calling the main connector creation script with Docker-specific URLs
./create_esdb_connector.sh "$EVENTSTOREDB_URL" "$NODEJS_ENDPOINT"
