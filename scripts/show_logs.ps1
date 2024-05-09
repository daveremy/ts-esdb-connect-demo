function Open-NewWindow {
    param (
        [string]$Command,
        [string]$Title
    )
    $fullCommand = "`$host.ui.RawUI.WindowTitle = '$Title'; $Command"
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command & {$fullCommand}"
}

# Close any existing PowerShell windows titled 'loanapp-demo'
Get-Process | Where-Object { $_.MainWindowTitle -eq 'loanapp-demo' } | Stop-Process -Force

# Open new PowerShell windows for each service
Open-NewWindow -Command 'docker-compose logs -f nodejs' -Title 'LoanApp (NodeJS)'
Open-NewWindow -Command 'docker-compose logs -f eventstoredb' -Title 'EventStoreDB'
Open-NewWindow -Command 'docker-compose logs -f event_generator' -Title 'Event Generator'

Write-Host "Logs streaming in separate windows. Close the windows to terminate logs."
