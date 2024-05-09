# Define color codes for output
$red = "`e[0;31m"
$green = "`e[0;32m"
$yellow = "`e[0;33m"
$nc = "`e[0m" # No Color

Write-Host "$yellow Shutting down Docker containers and cleaning up resources... $nc"

# This command stops all containers and removes containers, networks, volumes,
# and images created by `docker-compose up`.
docker-compose down --rmi all --volumes --remove-orphans

Write-Host "$green Cleanup complete. $nc"
