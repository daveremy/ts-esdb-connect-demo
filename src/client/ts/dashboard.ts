import { StateChangeEvent } from '../../shared/types';
import { LoanCard } from './LoanCard';

declare const io: any;
const activeLoanApps: { [loanId: string]: LoanCard } = {};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard DOMContentLoaded");
    const socket = io.connect('http://localhost:3000');
    socket.on('state_change', (stateChange: StateChangeEvent) => {
        console.log('State change received!:', stateChange);
        const loanId = stateChange.new_state.loanId!;
        let loanCard = activeLoanApps[loanId];
        if (loanCard) {
            console.log("Loan: " + loanId + " found, updating");
            loanCard.update(stateChange);
        }
        else {
            console.log("New Loan, creating LoanCard!");
            loanCard = new LoanCard(loanId, stateChange);
            activeLoanApps[loanId] = loanCard;
            console.log("Ready to prepend loanCard!!");
            const contentContainer = document.getElementById('content');
            if (contentContainer) {
                console.log("Prepending loan: " + loanId);
                contentContainer.prepend(loanCard.element());
            }
            else {
                throw new Error("Fatal error: no content dev found!");
            }
        };
    });

});
