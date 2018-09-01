var socket = io();

var lobbyNames = [];        //names? more ideal --> array of user objects

var turn = undefined;       //STATE/TURN 
const turnArray = ['DRAWING', 'NEXT-TO-DRAW', 'GUESSING', 'NEXT-TO-GUESS'];

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
document.addEventListener('closeModal', function () {
    console.log('All players joined');
    //document.getElementById('close-modal').style.opacity = '1';
    document.getElementById('modal').style.display = 'none';
    jQuery('.page').css({
        'filter': 'blur(0px)',
        '-webkit-filter': 'blur(0px)',
        '-moz-filter': 'blur(0px)',
        '-o-filter': 'blur(0px)',
        '-ms-filter': 'blur(0px)'
    });
});
socket.on('allPlayersJoined', function () {
    document.getElementById('lobby-text').innerHTML = 'READY TO START GAME!';
    //gameReady = true;
    setTimeout(() => {
        var evt = new CustomEvent('closeModal');
        document.dispatchEvent(evt);
        console.log('After 3 seconds...');
    }, 3000);
 });

/* ---------------- TIMER ---------------- */

socket.on('updateTime', function(seconds){
    //jQuery('#time').append(jQuery('<li>').text(count));
    display = document.querySelector('#time');
    //console.log('SECONDS:', seconds);
    //console.log('TYPE OF SECONDS', typeof(seconds));
    display.innerHTML =  seconds;
});






 socket.on('updateTurn', function(turnArrayIndex) {
    turn = turnArray[turnArrayIndex];
 });

// document.getElementById('close-modal').addEventListener('click', function () {
//     if (gameReady)
//     {
//         document.getElementById('modal').style.display = 'none';
//         jQuery('.page').css({
//             'filter': 'blur(0px)',
//             '-webkit-filter': 'blur(0px)',
//             '-moz-filter': 'blur(0px)',
//             '-o-filter': 'blur(0px)',
//             '-ms-filter': 'blur(0px)'
//         });
//     }
// });



/* ---------------- GUESSING MECHANISM ---------------- */

jQuery('#guess-form').on('submit', (e) => {
    e.preventDefault();
    const guess = jQuery("[name='guess']");
    const guessText = guess.val();
    if (typeof guessText === 'string' && guessText.trim().length>0) {
        console.log(guessText);
        socket.emit('createGuess', {
            guess: guessText
        });
    } else{ jQuery('input[type=text]').val(''); }
});

function scrollToBottom() {
    var messages = jQuery('#guess-list');
    var newMessage = messages.children('li:last-child');
    var clientHeight = messages.prop('clientHeight'); //fetch properties
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}
socket.on('distributeGuess', function (guess) {
    //console.log('Guess:', guessString);
    var template = jQuery('#guess-template').html();
    var html = Mustache.render(template, { guessText: guess.guess });
    jQuery('#guess-list').append(html);
    scrollToBottom();
    jQuery('input[type=text]').val('');
});

