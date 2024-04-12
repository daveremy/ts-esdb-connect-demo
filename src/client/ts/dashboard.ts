// Import both LoanCard and KanbanBoard classes
import { StateChangeEvent } from "../../shared/types";
import { LoanCard } from "./LoanCard";
import { KanbanBoard } from "./KanbanBoard"; // Ensure this path matches your project structure

declare const io: any;

document.addEventListener("DOMContentLoaded", () => {
  const kanbanContainer = document.getElementById("kanban-container");

  // todo: make this a singleton
  const kanbanBoard = new KanbanBoard(kanbanContainer!);

  const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
  const socket = io.connect(backendUrl);

  socket.on("state_change", (stateChange: StateChangeEvent) => {
    kanbanBoard.handleStateChange(stateChange);
  });

  socket.on("connect_error", (error: Error) => {
    console.error('Connection Error:', error);
  });

});
