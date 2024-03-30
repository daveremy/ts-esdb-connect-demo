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
        this.loanCardDiv.className = `loan-card ${kebabCase(this.loanAppState.status!)}`;
        this.loanCardDiv.id = loanId;
        this.layoutLoanCard(this.loanCardDiv);
    }

    layoutLoanCard(loanCardDiv: HTMLDivElement) {
        // The loan card has a header (always displayed), a loan details section (initially hidden),
        //  and an events div which lists the events leading up to the current status in latest first
        //  order (initially hidden)
        const header = this.appendDiv(this.loanCardDiv, 'loan-card-header');
        this.layoutLoanCardHeader(header);
        this.appendDiv(this.loanCardDiv, 'loan-details');
        this.appendDiv(this.loanCardDiv, 'loan-events');
        // todo: loan-details section
        // todo: events-section
    }

    private layoutLoanCardHeader(header: HTMLDivElement) {
        this.appendField(header, 'ID:',
            this.formatClassName('LoanApplicationState', 'loanId'),
            this.loanAppState.loanId!);
        this.appendField(header, '',
            this.formatClassName('LoanApplicationState', 'status'),
            this.loanAppState.status!);
    }

    formatClassName(type: string, propertyName: string) {
        return type + '-' + kebabCase(propertyName);
    }

    private appendField(parent: HTMLElement, label: string, baseClassName: string, value: string) {
        // Fields will always be in a container (div) that has within it a label and a value. Each will have a class name derived
        //  from the type and property name
        const containerDiv = this.appendDiv(parent, baseClassName + "-container");
        this.appendSpan(containerDiv, `${baseClassName}-label`, label);
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
        // Loop through the properties of the new state, look up them in the stored spans
        //  and update their value
        const new_state = stateChangeEvent.new_state;
        this.loanCardDiv.className = `loan-card ${kebabCase(new_state.status!)}`;
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
}

