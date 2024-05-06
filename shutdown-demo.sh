#!/bin/bash

# Define color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Shutting down Docker containers and cleaning up resources...${NC}"
# This command stops all containers and removes containers, networks, volumes,
# and images created by `docker-compose up`.
docker-compose down --rmi all --volumes --remove-orphans

echo -e "${GREEN}Cleanup complete.${NC}"
