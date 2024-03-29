import { LoanApplicationState, EventType, EventData, ApplicationReceivedData, CreditCheckInitiatedData, CreditCheckCompletedData, ApplicationApprovedData, ApplicationDeniedData, ManualReviewRequiredData, LoanDisbursedData } from '../shared/types';

export class LoanApplication {
    loanId: string;
    private state: LoanApplicationState;

    constructor(loanId: string) {
        this.loanId = loanId;
        this.state = {};
    }

    evolve(event: { eventType: EventType; data: EventData }) {
        switch (event.eventType) {
            case "ApplicationReceived":
                this.applicationReceived(event.data as ApplicationReceivedData);
                break;
            case "CreditCheckInitiated":
                // Assuming no additional data to process
                this.creditCheckInitiated(event.data as CreditCheckInitiatedData);
                break;
            case "CreditCheckCompleted":
                this.creditCheckCompleted(event.data as CreditCheckCompletedData);
                break;
            case "ApplicationApproved":
                this.applicationApproved(event.data as ApplicationApprovedData);
                break;
            case "ApplicationDenied":
                this.applicationDenied(event.data as ApplicationDeniedData);
                break;
            case "ManualReviewRequired":
                this.manualReviewRequired(event.data as ManualReviewRequiredData);
                break;
            case "LoanDisbursed":
                this.loanDisbursed(event.data as LoanDisbursedData);
                break;
        }
        return this.state;
    }

    isComplete(): boolean {
        return this.state.status === "ApplicationDenied" || this.state.status === "LoanDisbursed";
    }

    private applicationReceived(data: ApplicationReceivedData) {
        this.state = {
            ...this.state,
            loanId: data.loanId,
            applicantName: data.applicantName,
            loanPurpose: data.loanPurpose,
            loanAmount: data.loanAmount,
            status: "ApplicationReceived",
        };
    }

    private creditCheckInitiated(data: CreditCheckInitiatedData) {
        this.state = {
            ...this.state,
            loanId: data.loanId,
            creditCheckAgency: data.creditCheckAgency,
            status: "CreditCheckInitiated",
        };

    }

    private creditCheckCompleted(data: CreditCheckCompletedData) {
        this.state = {
            ...this.state,
            loanId: data.loanId,
            creditScore: data.creditScore,
            creditStatus: data.creditStatus,
            status: "CreditCheckCompleted",
        };
    }

    private applicationApproved(data: ApplicationApprovedData) {
        this.state = {
            ...this.state,
            loanId: data.loanId,
            loanOfficer: data.reviewer,
            decisionReason: data.decisionReason,
            status: "ApplicationApproved",
        };
    }

    private applicationDenied(data: ApplicationDeniedData) {
        this.state = {
            ...this.state,
            loanId: data.loanId,
            loanOfficer: data.reviewer,
            decisionReason: data.decisionReason,
            status: "ApplicationDenied",
        };
    }

    private manualReviewRequired(data: ManualReviewRequiredData) {
        this.state = {
            ...this.state,
            loanId: data.loanId,
            reviewReason: data.reviewReason,
            status: "ManualReviewRequired",
        };
    }

    private loanDisbursed(data: LoanDisbursedData) {
        this.state = {
            ...this.state,
            loanId: data.loanId,
            disbursementAmount: data.disbursementAmount,
            disbursementDate: data.disbursementDate,
            status: "LoanDisbursed",
        };
    }
}
