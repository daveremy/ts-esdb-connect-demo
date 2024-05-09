# Use the official Node.js 18 image as a base
FROM node:18-slim

# Install necessary packages
RUN apt-get update && \
    apt-get install -y curl

# Set the working directory in the container
WORKDIR /app

# Create a non-root user for running the application
RUN groupadd -r nodeuser && useradd -m -r -g nodeuser nodeuser

# Copy all files as root
COPY . .

# Change ownership of all files to the non-root user
RUN chown -R nodeuser:nodeuser /app

# Switch to the non-root user
USER nodeuser

# Install Node.js dependencies
RUN npm install

# Execute the script and start the application
CMD ./scripts/create_esdb_connector.sh "http://${EVENTSTORE_HOST}:2113" "http://nodejs:3000/event" && npm start
