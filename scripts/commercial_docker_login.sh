#!/bin/bash

# Function to prompt for Docker credentials
prompt_for_credentials() {
  echo "Enter Event Store Cloudsmith Docker registry username (docker.eventstore.com):"
  read username
  echo "Enter Event Store Cloudsmith Docker registry password:"
  # this version will suppress password showing, i think in this case better to just show it for
  # verification purposes
  # read -s password
  read password
  echo

  # Attempt to log in with the provided credentials
  echo "$password" | docker login docker.eventstore.com -u "$username" --password-stdin

  # Check if login was successful
  if [ $? -eq 0 ]; then
    echo "Docker login successful. Attempting to pull a test image..."
    
    # Attempt to pull a specific version of the image to verify access
    docker pull docker.eventstore.com/eventstore-ee/eventstoredb-commercial:24.2.0-jammy

    # Check if the docker pull was successful
    if [ $? -eq 0 ]; then
      echo "Successfully pulled the test image."
    else
      echo "Failed to pull the test image. Please check your permissions or the image tag."
      exit 1
    fi

  else
    echo "Docker login failed. Please check your credentials and try again."
    exit 1
  fi
}

# Function to check if already logged in to Docker registry
check_if_logged_in() {
  # Attempt to pull a known image without further login
  docker pull docker.eventstore.com/eventstore-ee/eventstoredb-commercial:24.2.0-jammy > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo "Already logged into Docker registry and can pull images."
    return 0
  else
    echo "Not logged into Docker registry or unable to pull images."
    return 1
  fi
}

# Main script execution
# Check if logged in by trying to pull a known image
if check_if_logged_in; then
  echo "Using existing session for operations."
else
  prompt_for_credentials
fi

# Continue with other Docker operations as necessary
