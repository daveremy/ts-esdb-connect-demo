# EventStoreDB Loan Application Dashboard Demo

## Description

This project is a TypeScript-based application that demonstrates the powerful connector capability of EventStoreDB. It features a real-time Loan Application Dashboard, showcasing live updates of loan application events through a web interface. The application is designed to receive events from EventStoreDB, process them, and display the results in a user-friendly dashboard.

## Getting Started

### Prerequisites

- Node.js (version 18.17.0 or later)
- npm (version 7 or later, comes with Node.js)
- EventStoreDB instance running and accessible

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-github-username/loanapp-connector-demo.git
```

2. Navigate to the project directory:

```bash
cd loanapp-connector-demo
```

3. Install dependencies:

```bash
npm install
```

4. Compile TypeScript to JavaScript:

```bash
tsc
```

5. Start the server:

```bash
npm start
```

This will compile the TypeScript files and start the Express server. By default, the server will listen on port 3000, but you can configure this in the server setup.

### Usage

After starting the server, navigate to `http://localhost:3000` in your web browser to view the Loan Application Dashboard. The dashboard will display real-time events related to loan applications as they are processed and emitted by EventStoreDB.

### Configuration

To connect to your EventStoreDB instance, ensure that the connection details are correctly set up in the server's configuration file. You may need to adjust the connection string, username, and password according to your EventStoreDB setup.

### Project Structure

The project is structured as follows:

- `src/`: Contains the source code for the server and client.
  - `client/`: Frontend TypeScript files that manage the UI and WebSocket communication.
  - `server/`: Backend TypeScript files for the Express server and EventStoreDB integration.
- `dist/`: Contains compiled JavaScript files (generated by `tsc`).
- `node_modules/`: Project dependencies (generated by `npm install`).
- `package.json`: Defines project dependencies and scripts.
- `tsconfig.json`: Configuration file for the TypeScript compiler.

### Contributing

Contributions are welcome! Please feel free to submit pull requests or create issues for bugs, features, or improvements.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.