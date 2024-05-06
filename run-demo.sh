#!/bin/bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Log in to the Docker registry if necessary
echo -e "${YELLOW}Checking Docker registry login...${NC}\n"
./scripts/commercial_docker_login.sh

# Start Docker containers in detached mode
echo -e "\n${GREEN}Starting Docker containers...${NC}\n"
docker-compose up -d

# Wait a few seconds to ensure that Docker containers are up and running
echo -e "\n${YELLOW}Waiting a moment for containers to warm up (vrooom)...${NC}\n"
sleep 5

# After a reasonable delay to ensure the web server is up, launch the browser
echo -e "${YELLOW}Attempting to launch the browser...${NC}\n"
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
else
    echo -e "${RED}Unable to open browser automatically (are you on WSL?). No problem...${NC}"
    echo -e "${RED}Open http://localhost:3000 in your browser.${NC}\n"
fi

echo -e "${GREEN}Starting tmux to let you see logs from the web app, ESDB, and the event generator.${NC}"
echo -e "${GREEN}To kill this after you can do CTL-B, ':', kill-session, to kill the tmux session${NC}\n"
echo -e "${GREEN}Press any key to continue...${NC}"
read -n 1 -s -r # This command waits for a single character input without requiring Enter to be pressed.

# Call tmux setup script
./scripts/show_logs_tmux.sh
