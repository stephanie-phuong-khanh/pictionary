const path = require('path');
const bodyParser = require('body-parser');
const hbs = require ('express-handlebars');
const Mustache = require('mustache');
const express = require('express');
const app = express(); 
const http = require('http'); 
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);
const {Users, Games, shuffle} = require('./utils/users');
const {isRealString, isRealCode} = require('./utils/validation');
const {tokenGenerate} = require('./utils/number-code');
const {DICTIONARY, Words} = require('./utils/word-gen');


const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({extend:true}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);
const port = process.env.PORT || 3000;

var games = new Games();
var users = new Users();

app.get('/new-game', (req, res) => {
    var newToken = tokenGenerate();
    while (users.getUserByRoom(newToken) !== undefined) {
        newToken = tokenGenerate();
    }
    res.render('./../public/new-game.html', {
        codeNumber: tokenGenerate()
    });
});

app.post('/new-game', (req, res) => {
    console.log(req.body.name, req.body.codeNumber);
    if (!isRealString(req.body.name)) {
        res.render('./../public/new-game.html', {
            codeNumber: tokenGenerate(),
            error: 'Please enter valid name.'
        });
        return;
    }
    console.log(req.body.codeNumber);
    res.redirect(`/canvas.html?name=${req.body.name}&game=${req.body.codeNumber}`);
});

app.get('/join-game', (req, res) => {
    res.render('./../public/join-game.html');
});

app.post('/join-game', (req, res) => {
    console.log(req.body.name, req.body.codeNumber);
    var nameValidity = null;
    var codeValidity = null;
    var okayName = null;
    var okayCode = null;
    if (!isRealString(req.body.name)) {
        nameValidity = 'Please enter a valid name.';   
    } else { okayName = req.body.name; }
    if (!isRealString(req.body.codeNumber)) {
        codeValidity = 'Please enter a valid code.';
    } else { okayCode = req.body.codeNumber; }
    if (nameValidity || codeValidity) {
        res.render('./../public/join-game.html', {
            errorName: nameValidity,
            errorCode: codeValidity,
            defaultName: okayName,
            defaultCode: okayCode
        });
        return;
    }
    console.log('Join Game -- successful!');
    res.redirect(`/canvas.html?name=${req.body.name}&game=${req.body.codeNumber}`);
});

io.on('connection', function (socket) {
    console.log('User connected');

    socket.on('join', (params, callback) => {
        console.log('Attempt to join game', params.game);
        if (!isRealString(params.name) || !isRealCode(params.game)) {
            return callback('Invalid name and/or game code');
        }

        socket.join(params.game);  //Join room by string value
        //socket.leave('The Office Fans');  //kicks you out of room
        //users.removeUser(socket.id); //removes from any previous room the user was in
        if (users.getUserList(params.game).length > 3) {
            return callback('Game is full.');
        }
        
        if (users.getUserByRoom(params.game) === undefined) {
            //console.log('NEW GAME');
            games.newGame(params.game, users.getUser(socket.id));
        } else {
            games.addPlayer(params.game, users.getUser(socket.id));
        }
        users.addUser(socket.id, params.name, params.game);
        callback();   //player successfully added

        // var namesArray = [];
        // var idsArray = games.getGame(params.game).gamePlayers;
        // for (i in idsArray) {
        //     namesArray.push(users.getUser(idsArray[i]).name);
        // }
        io.to(params.game).emit('playerJoined', {
            numberOfPlayers : games.getNumberOfPlayersInGame(params.game)
        });
        if (games.getNumberOfPlayersInGame(params.game) === 4) {
            var gameNumber = games.getGame(params.game).room;
            //console.log('--- GAME NUMBER:', gameNumber);
            games.setTeams(gameNumber);
            io.to(params.game).emit('allPlayersJoined', {
                //return actual game object
                gameObject: games.getGame(params.game)
            });
            setTimeout(() => {
                startTimer(params.game);
            }, 3000);
        };
        console.log(users, games);     //debugging purposes
        console.log('Successfully joined game', params.game);
    });
    
    function startTimer(roomID) {
        console.log('starTimer called on server side');
        var seconds = 10;
        var countdown = setInterval(function(){
            io.to(roomID).emit('updateTime', seconds);
            seconds--;
            if (seconds < 0) {
                //io.to(roomID).emit('updateTime', "Congratulations You WON!!");
                clearInterval(countdown);
            }
        }, 1000);
    };
    

    socket.on('emitRound', function () {  //perhaps in a normal function
        //gets game object from room -> reads turnNumber property
        var room = '1234'; //TEMP
        var gameObject = this.games.getGame(room);
        var playerObjArr = gameObject.gamePlayers;
        var turn = gameObject.turnNumber;
        //const turnArray = ['DRAWING', 'NEXT-TO-DRAW', 'GUESSING', 'NEXT-TO-GUESS'];
        if (playerObjArr.length !== 4) { console.log('ERROR: Player object array does not have 4 players.'); return undefined; }
        for (var playerCounter=0; playerCounter<playerObjArr.length; playerCounter++) {
            var shiftedPlayerCounter = (playerCounter + turn) % 4;
            var playerID = playerObjArr[playerCounter].id;
            io.to(playerID).emit('updateTurn', shiftedPlayerCounter);
        }
        /*TURN MECHANISM
        *              0               1              2            3
        *              drawing    next-to-draw     guessing     next-to-guess  
        *   turn 0:     1.1    ->       2.1              1.2         2.2
        *   turn 1:     2.2    ->       1.1              2.1         1.2
        *   turn 2:     1.2    ->       2.2              1.1         2.1
        *   turn 3:     2.1    ->       1.2              2.2         1.1           
        */
    })
    

    socket.on('engage', function (coordinates) {
        var user = users.getUser(socket.id);
        io.to(user.room).emit('clientEngage', (coordinates));
    });

    socket.on('disengage', function () {
        var user = users.getUser(socket.id);
        io.to(user.room).emit('clientDisengage');
    });

    socket.on('draw', function (coordinates) {
        var user = users.getUser(socket.id);
        io.to(user.room).emit('clientDraw', (coordinates));
    });

    socket.on('createGuess', (guess) => {
        var guessObj = guess.guess;
        var guessString = JSON.parse(JSON.stringify(guessObj));
        var user = users.getUser(socket.id);
        var game = games.getGame(user.room);
        game.words.newWordObject();
        var currentWordObj = game.words.getLatestWord().word;
        // console.log('Current Word Object:', currentWordObj);
        // console.log('Guess I typed:', guessString.trim().toLowerCase());
        if (guessString.trim().toLowerCase() === currentWordObj) {
            console.log('YOU GUESSED RIGHT');
        }
        if (user) {
            io.to(user.room).emit('distributeGuess', { guess: guessObj });
        }
    });

    socket.on('disconnect', function () {
        console.log('User disconnected');
        var user = users.getUser(socket.id);
        if (user) {
            if (games.getGame(user.room).gamePlayers.length === 1) { 
                games.deleteGame(user.room);
            } else {
                games.removeUserFromGame(user.room, socket.id);
            }
        }
        users.removeUser(socket.id);
        console.log(users, games); //debugging purposes
    });
});


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
