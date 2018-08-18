const path = require('path');
const express = require('express');
const app = express(); 
const http = require('http'); 
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

const port = process.env.PORT || 3000;

io.on('connection', function (socket) {
    console.log('User connected');

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
    });
});


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});