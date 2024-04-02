// Assuming interfaces LoanApplication and LoanEvent are defined in your shared types
import {
  StateChangeEvent,
  LoanEvent,
  EventType,
  EventData,
  LoanApplicationState,
} from "../../shared/types";
import { kebabCase } from "change-case";
import { stat } from "fs";
import { format } from "path";

enum Display {
  "Block",
  "None",
}

export class LoanCard {
  // Note: Where possible the CSS class names are derived from the property name on
  //  the corresponding object. For example, status.loanId will be have the class .loan-id
  private loanAppState: LoanApplicationState;
  private loanCardDiv: HTMLDivElement;
  // keep the field spans to easily update state when it changes
  private fields: { [elementId: string]: HTMLElement } = {};
  private lastEventDiv!: HTMLElement;

  constructor(loanId: string, initialStateChangeEvent: StateChangeEvent) {
    this.loanAppState = initialStateChangeEvent.new_state;
    this.loanCardDiv = document.createElement("div");
    this.loanCardDiv.className = `loan-card status-${kebabCase(
      this.loanAppState.status!
    )}`;
    this.loanCardDiv.id = loanId;
    this.layoutLoanCard(this.loanCardDiv, initialStateChangeEvent.event);
  }

  layoutLoanCard(loanCardDiv: HTMLDivElement, event: LoanEvent) {
    // The loan card has a header (always displayed), a loan details section (initially hidden),
    //  and an events div which lists the events leading up to the current status in latest first
    //  order (initially hidden)

    // Header
    const header = this.appendDiv(this.loanCardDiv, "loan-card-header");
    this.layoutLoanCardHeader(header);
    // Details
    this.addSectionHeader(this.loanCardDiv, "Details", "loan-details");
    const loanDetails = this.appendDiv(this.loanCardDiv, "loan-details");
    this.layoutLoanDetails(loanDetails);
    // Events
    this.addSectionHeader(this.loanCardDiv, "Events", "loan-events");
    const loanEvents = this.appendDiv(this.loanCardDiv, "loan-events");
    this.addLoanEvent(loanEvents, event);
  }

  private layoutLoanCardHeader(header: HTMLDivElement) {
    this.appendField(
      header,
      "ID",
      this.formatClassName("LoanApplicationState", "loanId"),
      this.loanAppState.loanId!
    );
    this.appendField(
      header,
      "",
      this.formatClassName("LoanApplicationState", "status"),
      this.loanAppState.status!
    );
  }

  private addSectionHeader(
    parent: HTMLElement,
    sectionTitle: string,
    targetContentClass: string
  ): HTMLElement {
    const header = document.createElement("div");
    header.className = "section-header";
    header.textContent = sectionTitle;

    // Create chevron span with an event listener for toggling
    const chevron = this.createChevronSpan(targetContentClass);
    header.appendChild(chevron);

    // Append the header to the parent element
    parent.appendChild(header);

    return header;
  }

  private createChevronSpan(targetContentClass: string): HTMLElement {
    const chevron = document.createElement("span");
    chevron.className = "toggle-chevron";
    chevron.setAttribute("data-target", targetContentClass); // Store the target class as a data attribute
    // Set the chevron to face right indicating the section is initially collapsed
    chevron.textContent = "\u25B6"; // Unicode for right-pointing triangle

    chevron.addEventListener("click", this.toggleSection.bind(this));

    return chevron;
  }

  private toggleSection(event: MouseEvent): void {
    event.stopPropagation(); // Prevent click event from bubbling up

    const chevronSpan = event.currentTarget as HTMLElement;
    const targetClass = chevronSpan.getAttribute("data-target")!;
    const content = this.loanCardDiv.querySelector(
      `.${targetClass}`
    ) as HTMLElement;

    if (content) {
      content.classList.toggle("collapsed");
      // Update the chevron direction based on the content's collapsed state
      chevronSpan.textContent = content.classList.contains("collapsed")
        ? "\u25BC"
        : "\u25B6";
    } else {
      throw new Error(`.${targetClass} not found`);
    }
  }

  private layoutLoanDetails(loanDetails: HTMLDivElement) {
    for (const property in this.loanAppState) {
      // loanId and status are in the header
      if (["loanId", "status"].includes(property)) {
        continue;
      }
      const className = this.formatClassName("LoanDetails", property);
      const propertyValue = String(
        this.loanAppState[property as keyof LoanApplicationState]!
      );
      this.appendField(loanDetails, property, className, propertyValue);
    }
  }

  private addLoanEvent(loanEvents: HTMLElement, event: LoanEvent) {
    const loanEventDiv = this.appendDiv(loanEvents, "loan-event");
    this.appendField(
      loanEventDiv,
      "Event Type",
      this.formatClassName("LoanEvent", "eventType"),
      event.eventType
    );
    Object.entries(event.data).forEach(([property, value]) => {
      if (property != "loanId") {
        const className = this.formatClassName("LoanEvent", property);
        if (property.includes("timestamp")) {
          const formattedTimestamp = new Date(value * 1000)
            .toISOString()
            .replace("T", " ")
            .substring(0, 19);
          this.appendField(
            loanEventDiv,
            property,
            className,
            formattedTimestamp
          );
        } else {
          this.appendField(loanEventDiv, property, className, value);
        }
      }
    });
    this.lastEventDiv = loanEventDiv;
  }

  private formatClassName(type: string, propertyName: string) {
    return kebabCase(type) + "-" + kebabCase(propertyName);
  }

  private appendField(
    parent: HTMLElement,
    label: string,
    baseClassName: string,
    value: string
  ) {
    // Fields will always be in a container (div) that has within it a label and a value. Each will have a class name derived
    //  from the type and property name
    const kebabBaseClassName = kebabCase(baseClassName);
    const containerDiv = this.appendDiv(
      parent,
      kebabBaseClassName + "-container"
    );
    if (label)
      this.appendSpan(containerDiv, `${kebabBaseClassName}-label`, label + ":");

    const fieldSpan = this.appendSpan(containerDiv, kebabBaseClassName, value);
    this.fields[kebabBaseClassName] = fieldSpan;
  }

  private appendDiv(parent: HTMLElement, className: string) {
    const div = document.createElement("div");
    div.className = className;
    parent.appendChild(div);
    return div;
  }

  private appendSpan(
    parent: HTMLElement,
    className: string,
    text: string,
    display = Display.Block
  ) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    parent.appendChild(span);
    return span;
  }

  element(): HTMLElement {
    return this.loanCardDiv;
  }

  public update(stateChangeEvent: StateChangeEvent) {
    const new_state = stateChangeEvent.new_state;
    this.updateLoanStatus(this.loanCardDiv, new_state.status!);
    this.updateLoanDetails(new_state);
    this.addLoanEvent(this.lastEventDiv.parentElement!, stateChangeEvent.event);
  }

  private updateLoanDetails(new_state: LoanApplicationState) {
    for (const property in new_state) {
      // loanId and status are already shown in the header
      if (["loanId", "status"].includes(property)) {
        break;
      }
      const className = this.formatClassName("LoanApplicationState", property);
      const element = this.fields[property];
      const propertyValue = new_state[property as keyof LoanApplicationState];
      if (element && propertyValue) {
        element.textContent = String(propertyValue);
      }
    }
  }

  private updateLoanStatus(loanCardDiv: HTMLDivElement, newStatus: string) {
    const statusSpan = loanCardDiv.querySelector(
      "." + this.formatClassName("LoanApplicationState", "status")
    );
    if (statusSpan) {
      statusSpan.textContent = newStatus;
    } else {
      throw new Error("status field not found");
    }
    this.updateLoanCardStatusClass(loanCardDiv, newStatus);
  }

  private updateLoanCardStatusClass(
    loanCardDiv: HTMLDivElement,
    newStatus: string
  ) {
    const newStatusClass = `status-${kebabCase(newStatus)}`;
    // Remove existing status class
    Array.from(loanCardDiv.classList).forEach((className) => {
      if (className.startsWith("status-")) {
        loanCardDiv.classList.remove(className);
      }
    });
    // Now add the new status class
    loanCardDiv.classList.add(newStatusClass);
  }
}
