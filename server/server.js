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
        if (users.getUserList(params.game).length >= 4) {
            return callback('Game is full.');
        }
        
        users.addUser(socket.id, params.name, params.game);
        if (games.getGame(params.game) === undefined) {
            //new game -- there exists no user with that room already
            games.newGame(params.game, users.getUser(socket.id));
        } else {
            games.addPlayer(params.game, users.getUser(socket.id));
        }
        callback();   //player successfully added

        io.to(params.game).emit('playerJoined', {
            numberOfPlayers : games.getNumberOfPlayersInGame(params.game)
        });
        if (games.getNumberOfPlayersInGame(params.game) === 4) {
            var gameNumber = games.getGame(params.game).room;
            //console.log('--- GAME NUMBER:', gameNumber);
            games.setTeams(gameNumber);
            io.to(params.game).emit('allPlayersJoined', games.getGame(params.game));    //game
            setTimeout(() => {
                newRound(params.game);
            }, 2000);
        };
        console.log(users, games.getGame(params.game).gamePlayers);     //debugging purposes
        console.log('Successfully joined game', params.game);
    });

    function newRound(roomID) {
        if (!games.getGame(roomID) || games.getGame(roomID).gamePlayers.length != 4) {
            return io.to(roomID).emit('errorMessage', 'Oops! There was a problem with the game. Try again!');
        }
        var gameObj = games.getGame(roomID);
        if (gameObj.turnNumber === 6) {
            var result = undefined;
            if (gameObj.team1.score === gameObj.team2.score) {return io.to(roomID).emit('finishedGame', 0)}; //tied
            if (gameObj.team1.score > gameObj.team2.score) {return io.to(roomID).emit('finishedGame', 1)};
            if (gameObj.team1.score < gameObj.team2.score) {return io.to(roomID).emit('finishedGame', 2)};
        }
        io.to(roomID).emit('clearCanvas');

        games.increaseTurn(roomID);
        emitTurns(roomID);

        var word = games.newWord(roomID);
        io.to(roomID).emit('updateWord', word);

        return roundLife(roomID);
    }
    function roundLife(roomID) {
        var seconds = 20;
        function countdown () {
            var currentTurn = games.getGame(roomID).turnNumber;
            var int = setInterval( function(){
                if (!games.getGame(roomID) || games.getGame(roomID).gamePlayers.length != 4) {
                    clearInterval(int);
                    return io.to(roomID).emit('errorMessage', 'Oops! There was a problem with the game. Try again!');
                }
                if (currentTurn !== games.getGame(roomID).turnNumber) { 
                    clearInterval(int);
                    return;
                }
                io.to(roomID).emit('updateTime', seconds);
                seconds--;
                if (seconds < 0) {
                    clearInterval(int);
                    newRound(roomID);
                    return;
                }
            }, 1000);
        };
        if (!games.getGame(roomID)) {
            return console.log('ERROR: Game object doesnt exist in RoundLife');
        }
        countdown();
    };
    function increaseScore(team, newScore, roomID) {
        console.log('IncreaseScore function called');
        io.to(roomID).emit('updateScore', { team, newScore });
    }
    function emitTurns(roomID) {
        var gameObject = games.getGame(roomID);
        if (!gameObject) {
            return console.log('ERROR: Game object doesnt exist in emitTurns');
        }
        var playerObjArr = gameObject.gamePlayers; //BUG!
        var turn = gameObject.turnNumber;
        for (var playerCounter=0; playerCounter<playerObjArr.length; playerCounter++) {
            var shiftedPlayerCounter = (playerCounter + turn) % 4;
            var playerID = playerObjArr[playerCounter].id;
            console.log('DKFJALSDFJKSAF', shiftedPlayerCounter);
            io.to(playerID).emit('updateTurn', shiftedPlayerCounter);
        }
    };

    socket.on('createGuess', (guess) => {
        var guessObj = guess.guess;
        var guessString = JSON.parse(JSON.stringify(guessObj));
        var user = users.getUser(socket.id);
        if (!games.getGame(user.room) || games.getGame(user.room).gamePlayers.length!=4) { return; }
        var game = games.getGame(user.room);
        var currentWordObj = game.words.getLatestWord().word;
        if (guessString.trim().toLowerCase() === currentWordObj) {
            io.to(user.room).emit('distributeGuess', { 
                guess: guessObj,
                correctness: true
            });
            // games.increaseTurn(user.room);
            setTimeout(() => {
                var team = undefined;
                var gamePlayers = games.getGame(user.room).gamePlayers;
                for (var i=0; i<4; i++) {
                    if (gamePlayers[i].id === socket.id) {
                        switch (i) {
                            case (0):
                            case (2):
                                team = 1; break;
                            case (1):
                            case (3):
                                team = 2; break;
                        }
                        break;
                    }
                }
                var newScore = games.addScore(team, user.room);
                //addScore (teamNumber, room) { //teamNumber either 1 or 2
                increaseScore(team, newScore, user.room);
                return newRound(user.room);
            }, 2000);
        } else {
            io.to(user.room).emit('distributeGuess', { 
                guess: guessObj,
                correctness: false
            });
        }
    });
        
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

    socket.on('disconnect', function () {
        console.log('User disconnected');
        var user = users.getUser(socket.id);
        if (user) { 
            games.removeUserFromGame(user.room, socket.id);
        }
        users.removeUser(socket.id);
        console.log(users, games); //debugging purposes
    });
});


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
