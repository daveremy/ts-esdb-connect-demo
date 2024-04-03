import { LoanCard } from "./LoanCard"; // Adjust the import path as necessary
import { StateChangeEvent, LoanApplicationState } from "../../shared/types";
import { capitalCase } from "change-case";

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
  private activeLoanApps: Map<string, LoanCard> = new Map();
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
      column.innerHTML = `<h3>${capitalCase(state)}</h3>`;
      this.boardElement.appendChild(column);
    });
  }

  public handleStateChange(stateChangeEvent: StateChangeEvent) {
    const loanAppState = stateChangeEvent.new_state;
    const loanId = loanAppState.loanId!;
    let loanCard = this.activeLoanApps.get(loanId);
    if (loanCard) {
      loanCard.update(stateChangeEvent);
    } else {
      loanCard = new LoanCard(stateChangeEvent);
      this.activeLoanApps.set(loanId, loanCard);
    }
    this.moveCardToCorrectColumn(loanCard, stateChangeEvent);
  }

  private placeLoanCard(
    loanAppState: LoanApplicationState,
    loanCard: LoanCard
  ) {
    const loanId = loanAppState.loanId!;
    loanCard.element().remove();
    if (this.terminalStates.includes(loanAppState.status!)) {
      this.completedApplicationsElement.prepend(loanCard.element());
      this.activeLoanApps.delete(loanId);
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

  public moveCardToCorrectColumn(
    loanCard: LoanCard,
    stateChangeEvent: StateChangeEvent
  ) {
    this.placeLoanCard(stateChangeEvent.new_state, loanCard);
  }
}
