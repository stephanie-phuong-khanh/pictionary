var socket = io();

var gameReady = false;
var lobbyNames = [];        //names? more ideal --> array of user objects
//CLIENT INTELLIGENCE:
//whole game object? --> gamePlayers array (socket IDs only), names
//                   --> team1, team2 members, scores
//Timer? --> better to be handled by server
//Word library 

socket.on('connect', () => {
    console.log('Connected to server');
    var params = jQuery.deparam(window.location.search);
    socket.emit('join', params, (err) => {
        if (err) {
            alert(err);
            window.location.href = '/';
            console.log(err);
        } else {
            console.log('No error');
        }
    });
});

socket.on('playerJoined', function(numberOfPlayers) {
    console.log('Number of current players:', numberOfPlayers);
});

document.addEventListener('makeOpaque', function () {
    console.log('OPAQUE');
    document.getElementById('close-modal').style.opacity = '1';
    document.getElementById('lobby-text').innerHTML = 'READY TO START GAME!';
    gameReady = true;
});
socket.on('allPlayersJoined', function () {
    var evt = new CustomEvent('makeOpaque');
    document.dispatchEvent(evt);
 });

document.getElementById('close-modal').addEventListener('click', function () {
    if (gameReady)
    {
        document.getElementById('modal').style.display = 'none';
        jQuery('.page').css({
            'filter': 'blur(0px)',
            '-webkit-filter': 'blur(0px)',
            '-moz-filter': 'blur(0px)',
            '-o-filter': 'blur(0px)',
            '-ms-filter': 'blur(0px)'
        });
    }
});


jQuery('#guess-form').on('submit', (e) => {
    e.preventDefault();
    const guess = jQuery("[name='guess']");
    const guessText = guess.val();
    if (typeof guessText === 'string' && guessText.trim().length>0) {
        console.log(guessText);
        socket.emit('createGuess', {
            guess: guessText //select input
        });
    }
});

socket.on('distributeGuess', function (guessString) {
    console.log('Guess:', guessString);
    //jQuery("#guessList ul").append('<li>guess 1</li>');
    var template = jQuery('#guess-template').html();
    var temp = 'test text';
    var html = Mustache.render(template, { guessText: guessString.guessString });
    console.log('HTML rendered:', html);
    console.log('Actual string:', guessString.guessString);
    console.log('Test text:', temp);
    jQuery('#guess-list').append(html);
});

// var template = jQuery('#message-template').html(); //method that returns markup inside HTML template
//     //adds to browser:
//     var html = Mustache.render(template, {
//         text: message.text,
//         from: message.from,
//         createdAt: formattedTime
//     });

//     jQuery('#messages').append(html);
//     scrollToBottom();



