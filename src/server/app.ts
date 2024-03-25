import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the static files from the public directory
const publicDirectoryPath = path.join(__dirname, '../../dist/client');
console.log(`Serving static files from: ${publicDirectoryPath}`);
app.use(express.static(publicDirectoryPath));

// Route to receive POST requests from the ESDB connector
app.post('/event', (req, res) => {
    console.log('Received event:', req.body);
    io.emit('event', req.body); // Emit the event data to all connected clients
    res.status(200).send('Event received');
});

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
