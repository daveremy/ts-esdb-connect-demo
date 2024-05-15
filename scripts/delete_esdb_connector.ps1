# The URL where EventStoreDB is running
$EVENTSTOREDB_URL = "http://localhost:2113"

# The connector name you want to delete
$CONNECTOR_NAME = "loanapp-connector-demo"

# EventStoreDB admin credentials
$USERNAME = "admin"
$PASSWORD = "changeit"

# Create the credential object
$Credentials = "${USERNAME}:${PASSWORD}"
$EncodedCredentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($Credentials))

# Delete the connector
Invoke-RestMethod -Uri "$EVENTSTOREDB_URL/connectors/$CONNECTOR_NAME" -Method Delete -Headers @{
    Authorization = "Basic $EncodedCredentials"
} -SkipCertificateCheck

Write-Output "Connector deletion request sent."
