import { StateChangeEvent } from '../../shared/types';

declare const io: any;

document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect(`${location.protocol}//${document.domain}:${location.port}`);
    const eventsContainer = document.getElementById('eventsContainer');

    socket.on('state_change', (stateChange: StateChangeEvent) => {
        console.log('State change received:', stateChange);
        if (eventsContainer) {
            const eventElement = document.createElement('pre');
            eventElement.textContent = JSON.stringify(stateChange, null, 2);
            eventsContainer.appendChild(eventElement);
        }
    });
});
