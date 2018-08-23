var socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
    var params = jQuery.deparam(window.location.search);
    socket.emit('join', params, (err) => {
        if (err) {
            window.location.href = '/';
            console.log(err);
        } else {
            console.log('No error');
        }
    });
});