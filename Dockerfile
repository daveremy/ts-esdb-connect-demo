# Use the official Node.js 18 image as a base
FROM node:18-slim

# Install packages
RUN apt-get update && \
    apt-get install -y openssh-server curl
RUN mkdir /var/run/sshd
RUN echo 'root:CHANGEIT' | chpasswd  # Set the root password

# Allow root login with password
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

# Set working directory
WORKDIR /app

# Create a user and switch to it
RUN groupadd -r nodeuser && useradd -m -r -g nodeuser nodeuser
RUN chown -R nodeuser:nodeuser /app

USER nodeuser

# Copy package.json and package-lock.json
COPY --chown=nodeuser:nodeuser package.json package-lock.json* ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY --chown=nodeuser:nodeuser . .

# # Create the ESDB connector, start ssh, start the node application
# CMD sh -c './scripts/create_esdb_connector.sh "http://${EVENTSTORE_HOST}:2113" && /usr/sbin/sshd -D & npm start'

# Create the ESDB connector, start ssh, start the node application
CMD sh -c './scripts/create_esdb_connector.sh "http://${EVENTSTORE_HOST}:2113" "http://nodejs:3000/event" && /usr/sbin/sshd -D & npm start'

