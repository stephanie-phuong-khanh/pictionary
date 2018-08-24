var socket = io();
var gameReady = false;
var lobbyNames = [];

socket.on('connect', () => {
    console.log('Connected to server');
    var params = jQuery.deparam(window.location.search);
    socket.emit('join', params, (err) => {
        if (err) {
            alert('Game room is full.');
            window.location.href = '/';
            console.log(err);
        } else {
            console.log('No error');
        }
    });
});

socket.on('playerJoined', function(numberOfPlayers) {
    console.log(numberOfPlayers);
});

document.addEventListener('makeOpaque', function () {
    console.log('OPAQUE');
    document.getElementById('close-modal').style.opacity = '1';
    gameReady = true;
});
socket.on('allPlayersJoined', function () {
    var evt = new CustomEvent('makeOpaque');
    document.dispatchEvent(evt);
 });

document.getElementById('close-modal').addEventListener('click', function () {
    if (gameReady)
    {
        document.getElementById('modal').style.visibility = 'hidden';
        jQuery('.page').css({
            'filter': 'blur(0px)',
            '-webkit-filter': 'blur(0px)',
            '-moz-filter': 'blur(0px)',
            '-o-filter': 'blur(0px)',
            '-ms-filter': 'blur(0px)'
        });
    }
})