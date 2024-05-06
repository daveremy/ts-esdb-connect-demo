#!/bin/bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Session Name
SESSION="loanapp-demo"

# Check if the tmux session already exists
if tmux has-session -t $SESSION 2>/dev/null; then
    echo -e "${RED}Session $SESSION already exists. Killing existing session...${NC}"
    # Kill the existing session
    tmux kill-session -t $SESSION
fi

echo -e "${YELLOW}Creating new tmux session for monitoring logs...${NC}"
# Create a new tmux session, detached
tmux new-session -d -s $SESSION

# Split the window into two horizontally
tmux split-window -h

# Select the right pane and split it vertically
tmux select-pane -t 1
tmux split-window -v

# Send the docker-compose commands to the respective panes
tmux send-keys -t 0 'docker-compose logs -f nodejs' C-m
tmux send-keys -t 1 'docker-compose logs -f eventstoredb' C-m
tmux send-keys -t 2 'docker-compose logs -f event_generator' C-m

# Attach to the session
tmux attach -t $SESSION
