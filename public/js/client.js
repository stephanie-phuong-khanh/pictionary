var socket = io();

var lobbyNames = [];  
var turn = undefined;
const turnArray = ['DRAWING', 'NEXT-TO-GUESS', 'GUESSING', 'NEXT-TO-DRAW'];

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

socket.on('errorMessage', function(errorMessage) {
    console.log('errorMessage', errorMessage);
    //alert(errorMessage);
    window.location.href = '/';
});

socket.on('finishedGame', function(winner) {
    console.log('Game Finished! Winning team:', winner);
    window.location.href = '/';
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
socket.on('allPlayersJoined', function (gameObj) {
    for (var i=0; i<gameObj.gamePlayers.length; i++) {
        lobbyNames.push(gameObj.gamePlayers[i].name);
    }
    document.getElementById('lobby-text').innerHTML = 'READY TO START GAME';
    //gameReady = true;
    setTimeout(() => {
        var evt = new CustomEvent('closeModal');
        document.dispatchEvent(evt);
        console.log('After 3 seconds...');
    }, 3000);
 });

/* ---------------- TIMER ---------------- */

socket.on('updateTime', function(seconds){
    display = document.querySelector('#time');
    display.innerHTML =  seconds;
});

/* ---------------- WORD ---------------- */

socket.on('updateWord', function(wordObj){
    if (turn === 'DRAWING') {
        document.querySelector('#word').innerHTML =  wordObj.word;
        document.querySelector('#word-sentence').innerHTML =  'your turn to draw:';
    } else {
        document.querySelector('#word').innerHTML =  wordObj.hintWord;
        if (turn === 'GUESSING') {
            document.querySelector('#word-sentence').innerHTML =  'your turn to guess:';
        } else {
            document.querySelector('#word-sentence').innerHTML =  'their turn to guess:';
        }
    }
});

/* ---------------- SCORE ---------------- */

socket.on('updateScore', function(obj){
    switch (obj.team) {
        case 1:
            document.querySelector('#score-num-1').innerHTML = obj.newScore;
            break;
        case 2:
            document.querySelector('#score-num-2').innerHTML = obj.newScore;
            break;
    }
    display = document.querySelector('#score');
});

/* ---------------- TURN-BASED INTERFACE ---------------- */

 socket.on('updateTurn', function(turnArrayIndex) {
    jQuery("#guess-list").empty();
    turn = turnArray[turnArrayIndex];
    console.log(turn);  //for debug
    if (turn === 'DRAWING') {
        jQuery('#guess-form-footer').css("display", "none");
        jQuery('#guess-form-footer-2').css("display", "block");
        jQuery('#guess-form-footer-3').css("display", "none");
        // document.querySelector('#person-to').innerHTML = 'your turn';
        // document.querySelector('#action').innerHTML = 'to draw';
    }

    if (turn === 'GUESSING') {
        // document.querySelector('#person-to').innerHTML = 'your turn';
        // document.querySelector('#action').innerHTML = 'to guess';
        jQuery('#guess-form-footer').css("display", "block");
        jQuery('#guess-form-footer-2').css("display", "none");
        jQuery('#guess-form-footer-3').css("display", "none");
    } 

    if (turn === 'NEXT-TO-DRAW' || turn === 'NEXT-TO-GUESS') {
        // document.querySelector('#person-to').innerHTML = 'word being';
        // document.querySelector('#action').innerHTML = 'drawn:';
        jQuery('#guess-form-footer').css("display", "none");
        jQuery('#guess-form-footer-2').css("display", "none");
        jQuery('#guess-form-footer-3').css("display", "block");
    }
 });


/* ---------------- GUESSING MECHANISM ---------------- */

jQuery('#guess-form').on('submit', (e) => {
    e.preventDefault();
    const guess = jQuery("[name='guess-input']");
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
socket.on('distributeGuess', function (guessObj) {
    //console.log('Guess:', guessString);
    var template = jQuery('#guess-template').html();
    var html = Mustache.render(template, { guessText: guessObj.guess });
    jQuery('#guess-list').append(html);
    if (guessObj.correctness) {
        jQuery('#guess-list li:last').find('#guess-text-correctness').css("background-color", "green");
        jQuery('#guess-list li:last').find('#guess-text-correctness').innerHTML='✓';
    }
    scrollToBottom();
    jQuery('input[type=text]').val('');
});











/*TURN MECHANISM
        *              0               1              2            3
        *              drawing    next-to-guess     guessing     next-to-draw  
        *   turn 0:     1.1    ->       2.1              1.2         2.2
        *   turn 1:     2.2    ->       1.1              2.1         1.2
        *   turn 2:     1.2    ->       2.2              1.1         2.1
        *   turn 3:     2.1    ->       1.2              2.2         1.1           
        */