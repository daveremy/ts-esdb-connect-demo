#!/bin/bash

# Default settings
EVENTSTOREDB_URL="http://localhost:2113"
CONNECTOR_NAME="loanapp-connector-demo"
# Default Express app endpoint (Assuming the Express server is running on port 3000)
EXPRESS_APP_ENDPOINT="http://localhost:3000/event"
USERNAME="admin"
PASSWORD="changeit"

# Check if an argument was provided for the Express app endpoint
if [[ ! -z "$1" ]]; then
  EXPRESS_APP_ENDPOINT="$1"
fi

# JSON configuration for the connector
JSON_CONFIG=$(cat <<EOF
{
  "Sink": "$EXPRESS_APP_ENDPOINT"
}
EOF
)

# Create or update the connector
response=$(curl -i \
  -H "Content-Type: application/json" \
  -u "$USERNAME:$PASSWORD" \
  -d "$JSON_CONFIG" \
  "$EVENTSTOREDB_URL/connectors/$CONNECTOR_NAME" \
  -k)

# Output the curl response
echo "$response"

# Summarize the action taken
echo "Connector setup attempted for '$CONNECTOR_NAME' at '$EVENTSTOREDB_URL'."
echo "Target endpoint for connector: '$EXPRESS_APP_ENDPOINT'."
if [[ "$response" == *"HTTP/1.1 200 OK"* ]]; then
  echo "Connector update was successful."
elif [[ "$response" == *"HTTP/1.1 201 Created"* ]]; then
  echo "Connector created successfully."
else
  echo "Failed to create or update the connector. Check the response above for details."
fi
