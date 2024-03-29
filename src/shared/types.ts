export interface StateChangeEvent {
    new_state: LoanApplicationState;
    event: LoanEvent;
}

export type LoanEvent = {
    eventType: EventType;
    data: EventData;
};

export type LoanApplicationState = {
    loanId?: string;
    applicantName?: string;
    loanPurpose?: string;
    loanAmount?: number;
    status?: string;
    creditCheckAgency?: string,
    creditScore?: number;
    creditStatus?: string;
    loanOfficer?: string;
    decisionReason?: string;
    reviewReason?: string;
    disbursementAmount?: number;
    disbursementDate?: string;
};

interface BaseEventData {
    loanId: string;
}

export interface ApplicationReceivedData extends BaseEventData {
    applicantName: string;
    loanPurpose: string;
    loanAmount: number;
}

export interface CreditCheckInitiatedData extends BaseEventData {
    creditCheckAgency: string;
}

export interface CreditCheckCompletedData extends BaseEventData {
    creditScore: number;
    creditStatus: string;
}

export interface ApplicationApprovedData extends BaseEventData {
    reviewer: string;
    decisionReason: string;
}

export interface ApplicationDeniedData extends BaseEventData {
    reviewer: string;
    decisionReason: string;
}

export interface ManualReviewRequiredData extends BaseEventData {
    reviewReason: string;
}

export interface LoanDisbursedData extends BaseEventData {
    disbursementAmount: number;
    disbursementDate: string;
}

export type EventData =
    | ApplicationReceivedData
    | CreditCheckInitiatedData
    | CreditCheckCompletedData
    | ApplicationApprovedData
    | ApplicationDeniedData
    | ManualReviewRequiredData
    | LoanDisbursedData;

export type EventType =
    | "ApplicationReceived"
    | "CreditCheckInitiated"
    | "CreditCheckCompleted"
    | "ApplicationApproved"
    | "ApplicationDenied"
    | "ManualReviewRequired"
    | "LoanDisbursed";