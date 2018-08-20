const path = require('path');
const bodyParser = require('body-parser');
const hbs = require ('express-handlebars');
const express = require('express');
const app = express(); 
const http = require('http'); 
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);
const {Users, Games} = require('./utils/users');
const {isRealString} = require('./utils/validation');
const {tokenGenerate} = require('./utils/number-code');

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({extend:true}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);
const port = process.env.PORT || 3000;

var gamesInPlay = new Games();
var gamesOnQueue = new Games();
var users = new Users();

app.get('/new-game', (req, res) => {
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

    socket.on('join', function(params) {
        console.log('Joined game', params.game);

        socket.join(params.game);  //Join room by string value
        //socket.leave('The Office Fans');  //kicks you out of room
        //users.removeUser(socket.id); //removes from any previous room the user was in
        if (users.getUserByRoom(params.game) === undefined) {
            console.log('NEW GAME');
        }
        users.addUser(socket.id, params.name, params.game);
        
        console.log(users);
    });

    socket.on('engage', function (coordinates) {
        io.emit('clientEngage', (coordinates));
    });

    socket.on('disengage', function () {
        io.emit('clientDisengage');
    });

    socket.on('draw', function (coordinates) {
        io.emit('clientDraw', (coordinates));
    });

    socket.on('disconnect', function () {
        console.log('User disconnected');
        users.removeUser(socket.id);
        console.log(users);
    });
});


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
