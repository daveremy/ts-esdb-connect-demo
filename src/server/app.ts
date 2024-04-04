import express from "express";
import { createServer, IncomingHttpHeaders } from "http";
import { Server } from "socket.io";
import path from "path";
import { LoanApplication } from "./LoanApplication";
import {
  StateChangeEvent,
  LoanEvent,
  EventType,
  EventData,
} from "../shared/types";

const app = express();
const httpServer = createServer(app);
// Add CORS configuration to the Socket.IO server instantiation
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8080", // Assuming your client runs on this port with webpack-dev-server
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../dist/client")));

// Map to keep active loan applications
const activeLoanApps: { [loanId: string]: LoanApplication } = {};

// Route to receive POST requests from the ESDB connector
app.post("/event", (request, response) => {
  // Events from EventstoreDB are in the body (request.body)
  //  Metadata is in the request.headers
  const metadata = parseMetadata(request.headers);
  const eventData = request.body;

  // Bundle the Event Type and Event Data into LoanEvent for ease later
  const event: LoanEvent = {
    eventType: metadata["es-event-type"] as EventType,
    data: eventData as EventData,
  };

  // Active loans applications are cached
  let loanApplication = getLoanApplicationFromCacheOrNew(event);

  // Evolve (apply the new event) the state of the loan application and get
  //  new state
  const new_state = loanApplication.evolve(event);

  // Bundle the new state and the event that caused the new state together to
  //  broadcast to interested web pages
  const state_change: StateChangeEvent = {
    new_state: new_state,
    event: event,
  };

  // Emit the state change to interested web pages
  io.emit("state_change", state_change);

  response.status(200).send("Event received");
});

function getLoanApplicationFromCacheOrNew(event: LoanEvent) {
  const loanId = event.data.loanId;
  let loanApplication = activeLoanApps[loanId];
  if (!loanApplication) {
    loanApplication = new LoanApplication(loanId);
    activeLoanApps[loanId] = loanApplication;
  }

  if (loanApplication.isComplete()) {
    delete activeLoanApps[loanId];
  }

  return loanApplication;
}

function parseMetadata(headers: IncomingHttpHeaders): {
  [key: string]: string | string[];
} {
  // todo: change this to a map from an object
  return Object.keys(headers)
    .filter((key) => key.startsWith("es-"))
    .reduce((acc, key) => {
      const value = headers[key];
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: string | string[] });
}

// Initialize Socket.IO connection
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
