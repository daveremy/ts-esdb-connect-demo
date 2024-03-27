import express from 'express';
import { createServer, request } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { Request } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { LoanApplication } from './LoanApplication';
import { StateChangeEvent, EventType, EventData } from "../shared/types";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist/client')));

// Map to keep active loan applications
const activeLoanApps: { [loanId: string]: LoanApplication } = {};

// Route to receive POST requests from the ESDB connector
app.post('/event', (req, res) => {
    console.log('Received event:', req.body);
    const metadata = parseMetadata(req);
    const event = {
        eventType: metadata['es-event-type'] as EventType,
        data: req.body as EventData,
    }

    const loan_id = event.data.loanId;
    let loanApplication = activeLoanApps[loan_id];
    if (!loanApplication) {
        loanApplication = new LoanApplication(loan_id);
        activeLoanApps[loan_id] = loanApplication;
    }

    // Evolve the state of the loan application based on the event
    const new_state = loanApplication.evolve(event);
    const state_change: StateChangeEvent = {
        'new_state': new_state,
        'event': event,
    }
    io.emit('state_change', state_change); // Emit the event data to all connected clients

    if (loanApplication.isComplete()) {
        delete activeLoanApps[loan_id];
    }

    res.status(200).send('Event received');
});

function parseMetadata(req: Request): { [key: string]: string | string[]; } {
    // EventStoreDB metadata are in headers that start with 'es-'
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
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

