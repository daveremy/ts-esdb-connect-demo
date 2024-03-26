export interface StateChangeEvent {
    new_state: LoanApplicationState;
    event: {
        eventType: EventType;
        data: EventData;
    };
}

export type LoanApplicationState = {
    loan_id?: string;
    applicant_name?: string;
    loan_purpose?: string;
    loan_amount?: number;
    status?: string;
    creditCheckAgency?: string,
    credit_score?: number;
    credit_status?: string;
    loan_officer?: string;
    decision_reason?: string;
    review_reason?: string;
    disbursement_amount?: number;
    disbursement_date?: string;
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