# Variables
$USERNAME = "admin"
$PASSWORD = "changeit"
$ESDB_URL = "http://localhost:2113/connectors/list"

# Create the credential object
$Credentials = "${USERNAME}:${PASSWORD}"
$EncodedCredentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($Credentials))

# List connectors with pretty-printed JSON output
$response = Invoke-RestMethod -Uri $ESDB_URL -Method Get -Headers @{
    Authorization = "Basic $EncodedCredentials"
} -SkipCertificateCheck

# Pretty-print JSON output
$response | ConvertTo-Json -Depth 100 | Out-String | % { $_ -replace '\\u([0-9A-Fa-f]{4})', { param($matches) [char][int]::Parse($matches[1], 'Hex') } }

Write-Output $response
