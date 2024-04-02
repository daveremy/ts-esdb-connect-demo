// Import both LoanCard and KanbanBoard classes
import { StateChangeEvent } from "../../shared/types";
import { LoanCard } from "./LoanCard";
import { KanbanBoard } from "./KanbanBoard"; // Ensure this path matches your project structure

declare const io: any;
const activeLoanApps: { [loanId: string]: LoanCard } = {};

document.addEventListener("DOMContentLoaded", () => {
  const kanbanContainer = document.getElementById("kanban-container");
  if (!kanbanContainer) {
    throw new Error("Fatal error: Kanban container not found!");
  }
  const kanbanBoard = new KanbanBoard(kanbanContainer); // Instantiate the KanbanBoard

  const socket = io.connect("http://localhost:3000");
  socket.on("state_change", (stateChange: StateChangeEvent) => {
    const loanId = stateChange.new_state.loanId!;
    let loanCard = activeLoanApps[loanId];
    if (loanCard) {
      loanCard.update(stateChange); // Update existing LoanCard
      kanbanBoard.moveCardToCorrectColumn(loanCard, stateChange);
    } else {
      loanCard = new LoanCard(loanId, stateChange); // Create new LoanCard
      activeLoanApps[loanId] = loanCard;
      kanbanBoard.addLoanApplication(stateChange); // Add or update the KanbanBoard
    }
  });
});
