#!/bin/bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to prompt for Docker credentials
prompt_for_credentials() {
  echo -e "${YELLOW}Enter Event Store Cloudsmith Docker registry username (docker.eventstore.com):${NC}"
  read username
  echo -e "${YELLOW}Enter Event Store Cloudsmith Docker registry password:${NC}"
  read password
  echo

  # Attempt to log in with the provided credentials
  echo "$password" | docker login docker.eventstore.com -u "$username" --password-stdin

  # Check if login was successful
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Docker login successful. Attempting to pull a test image...${NC}"
    
    # Attempt to pull a specific version of the image to verify access
    docker pull docker.eventstore.com/eventstore-ee/eventstoredb-commercial:24.2.0-jammy

    # Check if the docker pull was successful
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Successfully pulled the test image.${NC}"
    else
      echo -e "${RED}Failed to pull the test image. Please check your permissions or the image tag.${NC}"
      exit 1
    fi

  else
    echo -e "${RED}Docker login failed. Please check your credentials and try again.${NC}"
    exit 1
  fi
}

# Function to check if already logged in to Docker registry
check_if_logged_in() {
  # Attempt to pull a known image without further login
  docker pull docker.eventstore.com/eventstore-ee/eventstoredb-commercial:24.2.0-jammy > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Already logged into Docker registry and can pull images.${NC}"
    return 0
  else
    echo -e "${RED}Not logged into Docker registry or unable to pull images.${NC}"
    return 1
  fi
}

# Main script execution
# Check if logged in by trying to pull a known image
if check_if_logged_in; then
  echo -e "${GREEN}Using existing session for operations.${NC}"
else
  prompt_for_credentials
fi

# Continue with other Docker operations as necessary
