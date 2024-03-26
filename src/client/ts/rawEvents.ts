import { StateChangeEvent } from '../../shared/types';

declare const io: any;

document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect(`${location.protocol}//${document.domain}:${location.port}`);
    const eventsContainer = document.getElementById('eventsContainer');

    socket.on('state_change', (stateChange: StateChangeEvent) => {
        console.log('State change received:', stateChange);
        if (eventsContainer) {
            const eventElement = document.createElement('div');
            eventElement.className = 'event'; // Optionally add some class for styling
            // Creating a header element to clearly separate and label the event
            const header = document.createElement('h2');
            header.textContent = `Event: ${stateChange.event.eventType}`;
            eventElement.appendChild(header);

            // Creating a preformatted text element for the state change and event details
            const details = document.createElement('pre');
            details.textContent = JSON.stringify(stateChange, null, 2);
            eventElement.appendChild(details);

            // Prepending the new event element to display the latest first
            eventsContainer.prepend(eventElement);
        }
    });
});
