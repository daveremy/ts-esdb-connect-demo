import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { LoanApplication } from './LoanApplication';
import { StateChangeEvent, LoanEvent, EventType, EventData } from "../shared/types";

const app = express();
const httpServer = createServer(app);
// Add CORS configuration to the Socket.IO server instantiation
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8080", // Assuming your client runs on this port with webpack-dev-server
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist/client')));

// Map to keep active loan applications
const activeLoanApps: { [loanId: string]: LoanApplication } = {};

// Route to receive POST requests from the ESDB connector
app.post('/event', (req, res) => {
    const metadata = parseMetadata(req);
    const event: LoanEvent = {
        eventType: metadata['es-event-type'] as EventType,
        data: req.body as EventData,
    };

    const loanId = event.data.loanId; // Ensure your LoanEvent and EventData interfaces reflect the actual structure

    let loanApplication = activeLoanApps[loanId];
    if (!loanApplication) {
        loanApplication = new LoanApplication(loanId);
        activeLoanApps[loanId] = loanApplication;
    }

    const new_state = loanApplication.evolve(event);
    const state_change: StateChangeEvent = {
        new_state: new_state,
        event: event,
    };

    io.emit('state_change', state_change);

    if (loanApplication.isComplete()) {
        delete activeLoanApps[loanId];
    }

    res.status(200).send('Event received');
});

function parseMetadata(req: express.Request): { [key: string]: string | string[]; } {
    return Object.keys(req.headers)
        .filter((key) => key.startsWith('es-'))
        .reduce((acc, key) => {
            const value = req.headers[key];
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as { [key: string]: string | string[]; });
}

// Initialize Socket.IO connection
io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});