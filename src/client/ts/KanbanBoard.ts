import { LoanCard } from "./LoanCard"; // Adjust the import path as necessary
import { StateChangeEvent, LoanApplicationState } from "../../shared/types";

export class KanbanBoard {
  private boardElement: HTMLElement;
  private completedApplicationsElement: HTMLElement;
  private loanStates: string[] = [
    "ApplicationReceived",
    "CreditCheckInitiated",
    "CreditCheckCompleted",
    "ManualReviewRequired",
    "ApplicationApproved",
  ];
  private terminalStates: string[] = ["ApplicationDenied", "LoanDisbursed"];

  constructor(container: HTMLElement) {
    this.boardElement = document.createElement("div");
    this.boardElement.className = "kanban-board";
    container.appendChild(this.boardElement);

    const completedHeading = document.createElement("h2");
    completedHeading.textContent = "Completed Applications";
    completedHeading.className = "completed-heading";
    container.appendChild(completedHeading);

    this.completedApplicationsElement = document.createElement("div");
    this.completedApplicationsElement.className = "completed-applications";
    container.appendChild(this.completedApplicationsElement);

    this.createColumns();
  }

  private createColumns(): void {
    this.loanStates.forEach((state) => {
      const column = document.createElement("div");
      column.className = "kanban-column";
      column.id = state;
      column.innerHTML = `<h2>${state}</h2>`;
      this.boardElement.appendChild(column);
    });
  }

  public addLoanApplication(stateChangeEvent: StateChangeEvent): void {
    const loanAppState = stateChangeEvent.new_state;
    const loanCard = new LoanCard(loanAppState.loanId!, stateChangeEvent);

    this.placeLoanCard(loanAppState, loanCard);
  }

  private placeLoanCard(
    loanAppState: LoanApplicationState,
    loanCard: LoanCard
  ) {
    if (this.terminalStates.includes(loanAppState.status!)) {
      this.completedApplicationsElement.prepend(loanCard.element());
      setTimeout(() => {
        loanCard.element().remove();
      }, 90000);
    } else {
      const column = this.boardElement.querySelector(`#${loanAppState.status}`);
      if (column) {
        column.appendChild(loanCard.element());
      } else {
        throw new Error(`Column for ${loanAppState.status} not found`);
      }
    }
  }

  // In the KanbanBoard class
  public moveCardToCorrectColumn(
    loanCard: LoanCard,
    stateChangeEvent: StateChangeEvent
  ) {
    this.placeLoanCard(stateChangeEvent.new_state, loanCard);
  }
}
