var socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
});