// Assuming interfaces LoanApplication and LoanEvent are defined in your shared types
import { StateChangeEvent, LoanEvent, EventType, EventData, LoanApplicationState } from '../../shared/types';
import { kebabCase } from 'change-case';
import { stat } from 'fs';
import { format } from 'path';

enum Display {
    "Block",
    "None",
}

export class LoanCard {
    // Note: Where possible the CSS class names are derived from the property name on
    //  the corresponding object. For example, status.loanId will be have the class .loan-id
    private loanAppState: LoanApplicationState
    private loanCardDiv: HTMLDivElement;
    // keep the field spans to easily update state when it changes
    private fields: { [elementId: string]: HTMLElement } = {};
    private events: LoanEvent[] = [];

    constructor(loanId: string, initialStateChangeEvent: StateChangeEvent) {
        this.loanAppState = initialStateChangeEvent.new_state;
        this.events.push(initialStateChangeEvent.event);
        this.loanCardDiv = document.createElement('div');
        this.loanCardDiv.className = 'loan-card-' + loanId;
        this.layoutLoanCard(this.loanCardDiv);
    }

    layoutLoanCard(loanCardDiv: HTMLDivElement) {
        // The loan card has a header (always displayed), a loan details section (initially hidden),
        //  and an events div which lists the events leading up to the current status in latest first
        //  order (initially hidden)
        this.appendDiv(this.loanCardDiv, 'loan-card-header');
        this.appendDiv(this.loanCardDiv, 'loan-details', Display.None);
        this.appendDiv(this.loanCardDiv, 'loan-events', Display.None);
        this.layoutLoanCardHeader(this.loanCardDiv);
        // todo: loan-details section
        // todo: events-section
    }

    private layoutLoanCardHeader(loanCardDiv: HTMLDivElement) {
        this.appendField(loanCardDiv, 'ID',
            this.formatClassName('LoanApplicationState', 'loanId'),
            this.loanAppState.loanId!);
        this.appendField(loanCardDiv, '',
            this.formatClassName('LoanApplicationState', 'status'),
            this.loanAppState.status!);
    }

    formatClassName(type: string, propertyName: string) {
        return type + '-' + kebabCase(propertyName);
    }

    private appendField(parent: HTMLElement, label: string, baseClassName: string, value: string, display: Display = Display.Block) {
        // Fields will always be in a container (div) that has within it a label and a value. Each will have a class name derived
        //  from the type and property name
        const containerDiv = this.appendDiv(parent, baseClassName + "-container");
        this.appendSpan(containerDiv, baseClassName + label, label);
        const fieldSpan = this.appendSpan(containerDiv, baseClassName, value);
        this.setDisplay(containerDiv, display);
        this.fields[baseClassName] = fieldSpan;
    }

    private appendDiv(parent: HTMLElement, className: string, display: Display = Display.Block) {
        const div = document.createElement('div');
        div.className = className;
        this.setDisplay(div, display);
        parent.appendChild(div);
        return div;
    }

    private appendSpan(parent: HTMLElement, className: string, text: string, display = Display.Block) {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text;
        parent.appendChild(span);
        return span;
    }

    private setDisplay(element: HTMLElement, display: Display) {
        switch (display) {
            case Display.None:
                element.style.display = 'none';
                break;
            case Display.Block:
                element.style.display = 'block';
                break;
        }
    }

    element(): HTMLElement {
        return this.loanCardDiv;
        // const card = document.createElement('div');
        // card.className = 'loan-card';

        // // Header
        // const header = document.createElement('h3');
        // card.appendChild(header);

        // const loanIdSpan = document.createElement('span');
        // loanIdSpan.className = 'loan-id';
        // loanIdSpan.textContent = this.application.loanId;
        // header.appendChild(loanIdSpan);

        // header.appendChild(document.createTextNode(' - ')); // Separator

        // const statusSpan = document.createElement('span');
        // statusSpan.className = 'loan-status';
        // statusSpan.textContent = this.application.status;
        // header.appendChild(statusSpan);

        // // Details
        // this.detailsDiv.className = 'loan-details';
        // const purposeSpan = document.createElement('span');
        // purposeSpan.className = 'loan-purpose';
        // purposeSpan.textContent = `Purpose: ${this.application.purpose}`;
        // this.detailsDiv.appendChild(purposeSpan);

        // this.detailsDiv.appendChild(document.createElement('br')); // Line break

        // const amountSpan = document.createElement('span');
        // amountSpan.className = 'loan-amount';
        // amountSpan.textContent = `Amount: $${this.application.amount}`;
        // this.detailsDiv.appendChild(amountSpan);

        // card.appendChild(this.detailsDiv);

        // // Events toggle
        // const toggleEventsButton = document.createElement('button');
        // toggleEventsButton.textContent = 'Show Events';
        // toggleEventsButton.onclick = () => this.toggleEvents();
        // card.appendChild(toggleEventsButton);

        // // Events list
        // this.eventsDiv.className = 'loan-events';
        // this.application.events.forEach(event => {
        //     const eventItem = document.createElement('div');
        //     eventItem.textContent = `${event.eventType} at ${event.timestamp}`;
        //     this.eventsDiv.appendChild(eventItem);
        // });
        // card.appendChild(this.eventsDiv);

        // return card;
    }

    public update(stateChangeEvent: StateChangeEvent) {
        // Loop through the properties of the new state, look up them in the stored spans
        //  and update their value
        const new_state = stateChangeEvent.new_state;
        const event = stateChangeEvent.event;
        for (const property in new_state) {
            const className = this.formatClassName('LoanApplicationState', property);
            const element = this.fields[property];
            const propertyValue = new_state[property as keyof LoanApplicationState];
            if (element && propertyValue) {
                element.textContent = String(propertyValue);
            }
        }
    }

    // private toggleEvents() {
    //     const isHidden = this.eventsDiv.style.display === 'none';
    //     this.eventsDiv.style.display = isHidden ? 'block' : 'none';
    // }
}

