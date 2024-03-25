#!/bin/bash

# The URL where EventStoreDB is running
EVENTSTOREDB_URL="http://localhost:2113"

# The connector name
CONNECTOR_NAME="loanapp-connector-demo"

# The Express app endpoint (Assuming the Express server is running on port 3000)
EXPRESS_APP_ENDPOINT="http://localhost:3000/event"

# EventStoreDB admin credentials
USERNAME="admin"
PASSWORD="changeit"

# JSON configuration for the connector
JSON_CONFIG=$(cat <<EOF
{
  "Sink": "$EXPRESS_APP_ENDPOINT"
}
EOF
)

# Create or update the connector
curl -i \
  -H "Content-Type: application/json" \
  -u "$USERNAME:$PASSWORD" \
  -d "$JSON_CONFIG" \
  "$EVENTSTOREDB_URL/connectors/$CONNECTOR_NAME" \
  -k

echo "Connector setup completed."
