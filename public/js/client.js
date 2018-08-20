var socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
    var params = jQuery.deparam(window.location.search);
    socket.emit('join', params);
});