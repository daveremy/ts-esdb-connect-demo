console.log("Script loaded!!!");
declare const io: any;

console.log("Trying to import io:", io);

document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    console.log("Socket connection:", socket);

    const eventsContainer = document.createElement('div');
    document.body.appendChild(eventsContainer);

    socket.on('event', (event: any) => {
        console.log('Event received:', event);
        const eventElement = document.createElement('pre');
        eventElement.textContent = JSON.stringify(event, null, 2);
        eventsContainer.appendChild(eventElement);
    });
});
