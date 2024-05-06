# EventStoreDB Loan Application Dashboard Demo

## Description

This project is a TypeScript-based application that demonstrates the powerful connector capability of EventStoreDB. It features a real-time Loan Application Dashboard, showcasing live updates of loan application events through a kanban type board. The application is designed to receive events from EventStoreDB, process them, and display the results in a real time.

To do this we leverage the _webhook_ capabiilty of EventStoreDB's http connector. Take a look in `src/server/ts/app.ts` to see the `post` event
and how simple it is to receive events in real time from ESDB. Rather than the developer having to implement complex subscription logic on the
client side like timeouts, restart on lost connection, etc. this is handled by the ESDB http connector.

### Background info

- [Connector Preview Documenation](https://developers.eventstore.com/connectors/#motivation)

## Getting Started

### Prerequisites

- EventStoreDB version > 24.2, Commercial edition. _Note: The ESDB http connector is currently in preview and only available in the commercial 
edition. We expect it to be in the open source community edition soon.
- Node.js (version 18.17.0 or later)
- npm (version 7 or later, comes with Node.js)
- python > 3.10 installed (for event generation)
- Docker installed (for running containers)

### Run the demo with Docker Continers (one command) 

1. Clone the project and change into the project directory

```bash
git clone https://github.com/daveremy/ts-esdb-connect-demo.git
cd ts-esdb-connect-demo
```

2. Run `./run-demo.sh` - this script will prompt you for docker.eventstore.com login credentials (if youa aren't logged in already), run docker containers for EventStoreDB, the ESDB Connector Loan Application Webapp, and the python event generator. It will open a tmux session with panes to see the live log for each of these containers. It will also try to open a browser pointing to `http://localhost:3000` to see the application in action.

3. To shutdown run `./shutdown-demo.sh` which will shut down all the containers and clean up the related resources.

### Running Docker Compose yourself
Optionally you can run 3 docker containers, one for EventStoreDB, one for the NodeJS application,
and one for the python based event generator.

1. Clone the project and change into the project directory

```bash
git clone https://github.com/daveremy/ts-esdb-connect-demo.git
cd ts-esdb-connect-demo
```

2. Ensure you are logged in to eventstore.docker.com in order to be able to pull the commercial
version of EventStoreDB. There is a script in the scripts folder to faciliate logging in, you will need to know your username and password:

```bash
./scripts/commercial_docker_login.sh
```

3. Run `docker-compose up` from the project directory to bring up the 3 containers. This will start EventStoreDB commercial version with connectors enabled, start the nodejs application
on http://localhost:3000, and start the python event generator to simulate loan application events.

4. Navigate to `http://localhost:3000` to view the web page for the live loan application 
dashboard.

5. Afterwards, if you want to shut down and clean up run `docker-compose down`

### Installation

1. Clone the repository:

```bash
git clone https://github.com/daveremy/ts-esdb-connect-demo.git
```

2. Navigate to the project directory:

```bash
cd ts-esdb-connect-demo
```

3. Install dependencies and do the initial build:

```bash
npm run setup
```

4. For the event-generator the EventStoreDB client is needed. If you don't mind it globally you can do (another option is to set up a virtual env for this):

```bash
pip install esdbclient
```

5. Create the connector in EventStoreDB. From the project directory:

- if using docker (tested in docker desktop for mac and windows wls):

  ```bash
  ./scripts/docker_esdb_connector.sh
  ```

- if using docker from within linux (todo) something like adding --network="host" to docker run command (not tested)

- if from a build

  ```bash
  ./scripts/create_esdb_connector.sh
  ```

### Usage

For the web page to run you will need to 1. start EventStoreDB, 2. Run the webapplication (uses express) and 3. Run the event generator for the workload:

1. From a terminal start ESDB (see prerequisites).

1. From another terminal start the web server:
  1.1 `cd` to the project directory
  1.2 start the express server and webpack server (allowing real time updates):

  ```bash
  npm start
  ```

1. From another terminal start the event generator:
  1.1 `cd` to the project directory
  1.2 run the event generator:

  ```bash
  python3 src/util/event_generator.py
  ```

After starting the server, app, and event generator navigate to `http://localhost:3000` in your web browser to view the Loan Application Dashboard. The dashboard will display real-time events related to loan applications as they are processed and emitted by EventStoreDB.

If working in developer mode use `http://localhost:8080` to get immediates updates when client side files change.

### Project Structure

The project is structured as follows:

- `scripts`: Useful scripts for creating, deleting, and listing ESDB connectors
- `src/`: Contains the source code for the server and client.
  - `client/`: Frontend TypeScript files that manage the UI and WebSocket communication.
  - `server/`: Backend TypeScript files for the Express server and EventStoreDB integration.
  - `shared/`: Types that are shared between backend and frontent
  - `util/`: Utility programs most notably the event generator.
- `dist/`: Contains compiled JavaScript files (generated by `tsc`).
- `node_modules/`: Project dependencies (generated by `npm install`).
- `package.json`: Defines project dependencies and scripts.
- `tsconfig.client.json`: Configuration file for the TypeScript compiler specific to building the client.
- `tsconfig.server.json`: Configuration file for the TypeScript compiler specific to building the server.

### Limitations

- At the moment the connector picks up where it last left off and the UI only shows the events from there forward. A future enhancement would be to detect that a loan application was in process and read prior events to provide the full context (details and events list) in the UI.