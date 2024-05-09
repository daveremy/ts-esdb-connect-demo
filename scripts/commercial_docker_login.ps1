# Define color codes
$red = "`e[0;31m"
$green = "`e[0;32m"
$yellow = "`e[0;33m"
$nc = "`e[0m" # No Color

function Prompt-For-Credentials {
    Write-Host "$yellow Enter Event Store Cloudsmith Docker registry username (docker.eventstore.com): $nc" -NoNewline
    $username = Read-Host
    Write-Host "$yellow Enter Event Store Cloudsmith Docker registry password: $nc" -NoNewline
    $password = Read-Host -AsSecureString
    $passwordBSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $passwordPlainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($passwordBSTR)

    # Attempt to log in with the provided credentials
    $credentials = "$username,$passwordPlainText" | ConvertTo-SecureString -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential ($username, $credentials)

    docker login docker.eventstore.com --username $username --password-stdin $passwordPlainText

    # Check if login was successful
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$green Docker login successful. Attempting to pull a test image... $nc"
        
        # Attempt to pull a specific version of the image to verify access
        docker pull docker.eventstore.com/eventstore-ee/eventstoredb-commercial:24.2.0-jammy

        # Check if the docker pull was successful
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$green Successfully pulled the test image. $nc"
        }
        else {
            Write-Host "$red Failed to pull the test image. Please check your permissions or the image tag. $nc"
            exit 1
        }
    }
    else {
        Write-Host "$red Docker login failed. Please check your credentials and try again. $nc"
        exit 1
    }
}

function Check-If-LoggedIn {
    # Attempt to pull a known image without further login
    docker pull docker.eventstore.com/eventstore-ee/eventstoredb-commercial:24.2.0-jammy > $null 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "$green Already logged into Docker registry and can pull images. $nc"
        return $true
    }
    else {
        Write-Host "$red Not logged into Docker registry or unable to pull images. $nc"
        return $false
    }
}

# Main script execution
# Check if logged in by trying to pull a known image
if (Check-If-LoggedIn) {
    Write-Host "$green Using existing session for operations. $nc"
}
else {
    Prompt-For-Credentials
}
