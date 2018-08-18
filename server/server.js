const path = require('path');
const express = require('express');
const app = express(); //app is function handler
const http = require('http');   //must use http server for socket.io
const server = http.createServer(app); //usually takes callback function as argument
const socketIO = require('socket.io');
const io = socketIO(server);

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

const port = process.env.PORT || 3000;





server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});