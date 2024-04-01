import { StateChangeEvent } from '../../shared/types';
import { LoanCard } from './LoanCard';

declare const io: any;
const activeLoanApps: { [loanId: string]: LoanCard } = {};

document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect('http://localhost:3000');
    socket.on('state_change', (stateChange: StateChangeEvent) => {
        const loanId = stateChange.new_state.loanId!;
        let loanCard = activeLoanApps[loanId];
        if (loanCard) {
            loanCard.update(stateChange);
        }
        else {
            loanCard = new LoanCard(loanId, stateChange);
            activeLoanApps[loanId] = loanCard;
            const contentContainer = document.getElementById('content');
            if (contentContainer) {
                contentContainer.prepend(loanCard.element());
            }
            else {
                throw new Error("Fatal error: no content dev found!");
            }
        };
    });

});
