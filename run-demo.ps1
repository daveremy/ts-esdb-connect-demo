# Define color codes
$red = "`e[0;31m"
$green = "`e[0;32m"
$yellow = "`e[0;33m"
$nc = "`e[0m" # No Color

# Log in to the Docker registry if necessary
Write-Host "$yellow Checking Docker registry login... $nc" -NoNewline
& ./scripts/commercial_docker_login.sh

# Start Docker containers in detached mode
Write-Host "`n$green Starting Docker containers... $nc`n"
Start-Process -FilePath "docker-compose" -ArgumentList "up -d" -NoNewWindow -Wait

# Wait a few seconds to ensure that Docker containers are up and running
Write-Host "`n$yellow Waiting a moment for containers to warm up (vrooom)... $nc`n"
Start-Sleep -Seconds 5

# After a reasonable delay to ensure the web server is up, launch the browser
Write-Host "$yellow Attempting to launch the browser... $nc`n"
try {
    Start-Process "http://localhost:8080"
}
catch {
    Write-Host "$red Unable to open browser automatically. Please open http://localhost:3000 in your browser manually.$nc`n" -ForegroundColor Red
}

# Notify user about logs
Write-Host "$green Starting logs monitoring in separate windows. Please check new PowerShell windows.$nc"

# Call PowerShell script to open new windows for logs
& ./scripts/show_logs.ps1
