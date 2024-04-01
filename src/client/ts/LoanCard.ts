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
        this.loanCardDiv.className = `loan-card status-${kebabCase(this.loanAppState.status!)}`;
        this.loanCardDiv.id = loanId;
        this.layoutLoanCard(this.loanCardDiv);
    }

    layoutLoanCard(loanCardDiv: HTMLDivElement) {
        // The loan card has a header (always displayed), a loan details section (initially hidden),
        //  and an events div which lists the events leading up to the current status in latest first
        //  order (initially hidden)
        const header = this.appendDiv(this.loanCardDiv, 'loan-card-header');
        this.layoutLoanCardHeader(header);
        const loanDetails = this.appendDiv(this.loanCardDiv, 'loan-details');
        this.layoutLoanDetails(loanDetails);
        this.appendDiv(this.loanCardDiv, 'loan-events');
        // todo: loan-details section
        // todo: events-section
    }

    private layoutLoanCardHeader(header: HTMLDivElement) {
        this.appendField(header, 'ID',
            this.formatClassName('LoanApplicationState', 'loanId'),
            this.loanAppState.loanId!);
        this.appendField(header, '',
            this.formatClassName('LoanApplicationState', 'status'),
            this.loanAppState.status!);
    }

    layoutLoanDetails(loanDetails: HTMLDivElement) {
        for (const property in this.loanAppState) {
            // loanId and status are in the header
            if (['loanId', 'status'].includes(property)) {
                continue;
            }
            const className = this.formatClassName('LoanApplicationState', property);
            const propertyValue = String(this.loanAppState[property as keyof LoanApplicationState]!);
            this.appendField(loanDetails, property, property, propertyValue);
        }
    }

    formatClassName(type: string, propertyName: string) {
        return kebabCase(type) + '-' + kebabCase(propertyName);
    }

    private appendField(parent: HTMLElement, label: string, baseClassName: string, value: string) {
        // Fields will always be in a container (div) that has within it a label and a value. Each will have a class name derived
        //  from the type and property name
        const containerDiv = this.appendDiv(parent, baseClassName + "-container");
        if (label) this.appendSpan(containerDiv, `${baseClassName}-label`, label + ':');

        const fieldSpan = this.appendSpan(containerDiv, baseClassName, value);
        this.fields[baseClassName] = fieldSpan;
    }

    private appendDiv(parent: HTMLElement, className: string) {
        const div = document.createElement('div');
        div.className = className;
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

    element(): HTMLElement {
        return this.loanCardDiv;
    }

    public update(stateChangeEvent: StateChangeEvent) {
        console.log(`Updating loanapp: ${stateChangeEvent.new_state.loanId}`);
        const new_state = stateChangeEvent.new_state;
        this.updateLoanStatus(this.loanCardDiv, new_state.status!);
        const event = stateChangeEvent.event;
        for (const property in new_state) {
            // loanId and status are already shown in the header
            if (['loanId', 'status'].includes(property)) {
                break;
            }
            const className = this.formatClassName('LoanApplicationState', property);
            const element = this.fields[property];
            const propertyValue = new_state[property as keyof LoanApplicationState];
            if (element && propertyValue) {
                element.textContent = String(propertyValue);
            }
        }
    }

    private updateLoanStatus(loanCardDiv: HTMLDivElement, newStatus: string) {
        const statusSpan = loanCardDiv.querySelector('.' + this.formatClassName("LoanApplicationState", "status"));
        if (statusSpan) {
            statusSpan.textContent = newStatus;
        }
        else {
            throw new Error("status field not found");
        }
        this.updateLoanCardStatusClass(loanCardDiv, newStatus);
    }

    private updateLoanCardStatusClass(loanCardDiv: HTMLDivElement, newStatus: string) {
        const newStatusClass = `status-${kebabCase(newStatus)}`;
        // Remove existing status class
        Array.from(loanCardDiv.classList).forEach((className) => {
            if (className.startsWith('status-')) {
                loanCardDiv.classList.remove(className);
            }
        });
        // Now add the new status class
        loanCardDiv.classList.add(newStatusClass);
    }

}
