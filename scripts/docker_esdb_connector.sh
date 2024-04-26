#!/bin/bash

# Determine the directory where this script resides
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# Path to the script to create/update the EventStoreDB connector
SCRIPT_PATH="$SCRIPT_DIR/create_esdb_connector.sh"

# The endpoint for the Express app inside Docker
EXPRESS_APP_ENDPOINT="http://host.docker.internal:3000/event"

# Execute the script with the specified endpoint
bash "$SCRIPT_PATH" "$EXPRESS_APP_ENDPOINT"

echo "Connector setup script called with endpoint: $EXPRESS_APP_ENDPOINT"
