// Import both LoanCard and KanbanBoard classes
import { StateChangeEvent } from "../../shared/types";
import { LoanCard } from "./LoanCard";
import { KanbanBoard } from "./KanbanBoard"; // Ensure this path matches your project structure

declare const io: any;

document.addEventListener("DOMContentLoaded", () => {
  const kanbanContainer = document.getElementById("kanban-container");

  // todo: make this a singleton
  const kanbanBoard = new KanbanBoard(kanbanContainer!);
  const socket = io.connect("http://localhost:3000");
  socket.on("state_change", (stateChange: StateChangeEvent) => {
    kanbanBoard.handleStateChange(stateChange);
  });
});
