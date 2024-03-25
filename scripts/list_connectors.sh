#!/bin/bash

# Variables
USERNAME="admin"
PASSWORD="changeit"
ESDB_URL="http://localhost:2113/connectors/list"

# List connectors with pretty-printed JSON output
curl -s -u "$USERNAME:$PASSWORD" "$ESDB_URL" | jq .
