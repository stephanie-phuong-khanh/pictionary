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
        console.log('Joined game', params.game);
        if (!isRealString(params.name) || !isRealCode(params.game)) {
            return callback('Invalid name and/or game code');
        }

        socket.join(params.game);  //Join room by string value
        //socket.leave('The Office Fans');  //kicks you out of room
        //users.removeUser(socket.id); //removes from any previous room the user was in
        if (users.getUserList(params.game).length > 3) {
            callback('Room is full');
        }
        
        if (users.getUserByRoom(params.game) === undefined) {
            //console.log('NEW GAME');
            games.newGame(params.game, socket.id);
        } else {
            games.addPlayer(params.game, socket.id);
        }
        users.addUser(socket.id, params.name, params.game);
        callback();   //player successfully added
        console.log(users, games);     //debuggging purposes

        // var namesArray = [];
        // var idsArray = games.getGame(params.game).gamePlayers;
        // for (i in idsArray) {
        //     namesArray.push(users.getUser(idsArray[i]).name);
        // }
        io.to(params.game).emit('playerJoined', {
            numberOfPlayers : games.getNumberOfPlayersInGame(params.game)
        });
        if (games.getNumberOfPlayersInGame(params.game) === 4) {
            io.to(params.game).emit('allPlayersJoined');
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
        games.removeUserFromGame(user.room, socket.id);
        users.removeUser(socket.id);
        console.log(users, games); //debugging purposes
    });
});


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
