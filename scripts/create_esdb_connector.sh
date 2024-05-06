#!/bin/bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Usage:
#   ./create_esdb_connector.sh [eventstoredb_url] [express_app_endpoint]
# Arguments:
#   eventstoredb_url        - Optional. URL of the EventStoreDB instance. Defaults to 'http://localhost:2113'.
#   express_app_endpoint    - Optional. Endpoint URL of the Express app to receive events. Defaults to 'http://localhost:3000/event'.
#
# Example:
#   ./create_esdb_connector.sh "http://eventstoredb:2113" "http://nodejs:3000/event"

# Default settings
EVENTSTOREDB_URL="http://localhost:2113"
CONNECTOR_NAME="loanapp-connector-demo"
EXPRESS_APP_ENDPOINT="http://localhost:3000/event"
USERNAME="admin"
PASSWORD="changeit"

# Check if arguments were provided for the EventStoreDB URL and Express app endpoint
if [[ ! -z "$1" ]]; then
  EVENTSTOREDB_URL="$1"
fi
if [[ ! -z "$2" ]]; then
  EXPRESS_APP_ENDPOINT="$2"
fi

# JSON configuration for the connector
JSON_CONFIG=$(cat <<EOF
{
  "Sink": "$EXPRESS_APP_ENDPOINT"
}
EOF
)

# Retry settings
max_retries=5
retry_count=0
sleep_seconds=10

# Function to create or update the connector
function create_connector {
  echo -e "${YELLOW}Attempting to create/update connector at URL: $EVENTSTOREDB_URL/connectors/$CONNECTOR_NAME${NC}"
  echo -e "${YELLOW}With configuration: ${NC}$JSON_CONFIG"
  
  response=$(curl -i \
    -H "Content-Type: application/json" \
    -u "$USERNAME:$PASSWORD" \
    -d "$JSON_CONFIG" \
    "$EVENTSTOREDB_URL/connectors/$CONNECTOR_NAME" \
    -k)

  # Check response for success
  echo "$response"
  if [[ "$response" == *"HTTP/1.1 200 OK"* ]] || [[ "$response" == *"HTTP/1.1 201 Created"* ]]; then
    echo -e "${GREEN}Connector setup successful.${NC}"
    return 0
  else
    echo -e "${RED}Failed to create or update the connector. Response:${NC}"
    return 1
  fi
}

# Attempt to create/update the connector with retries
until create_connector || [ "$retry_count" -eq "$max_retries" ]; do
  echo -e "${RED}Attempt $((++retry_count)) failed. Retrying in $sleep_seconds seconds...${NC}"
  sleep $sleep_seconds
done

if [ "$retry_count" -eq "$max_retries" ]; then
  echo -e "${RED}Failed to set up connector after $max_retries attempts.${NC}"
fi
