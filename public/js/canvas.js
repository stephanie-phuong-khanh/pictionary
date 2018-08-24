var canvas = document.getElementById('canvas');
var canvasContainer = document.getElementById('canvas-container');
var context = canvas.getContext('2d');
canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight;

var mouseIsDown = false;
var dragging = false;
var radius = 1;

document.onmousedown = function() { 
    //console.log('THIS MOUSE IS DOWN');
    mouseIsDown = true;
}
document.onmouseup = function() {
    //console.log('not down!!');
    mouseIsDown = false;
}

socket.on('clientEngage', (coordinates) => {
    dragging = true;
    context.arc(coordinates.x, coordinates.y, radius, 0, Math.PI*2);
    context.fillStyle = "rgb(49, 26, 0)";
    context.fill();
    context.moveTo(coordinates.x, coordinates.y);
});

socket.on('clientDisengage', (coordinates) => {
    //console.log('CLIENT DISENGAGE!');
    dragging = false;
    context.beginPath();
});

socket.on('clientDraw', (coordinates) => {
    if (dragging) {
        console.log(coordinates.x, coordinates.y);

        context.lineTo(coordinates.x, coordinates.y); 
        context.lineWidth = radius*2; 
        context.strokeStyle = "rgb(49, 26, 0)";
        context.stroke();

        context.beginPath();
        context.arc(coordinates.x, coordinates.y, radius, 0, Math.PI*2);
        context.fillStyle = "rgb(49, 26, 0)";
        context.fill();

        context.beginPath();

        context.moveTo(coordinates.x, coordinates.y);
    }
});

canvas.addEventListener('mousedown', (e) => {
    socket.emit('engage', {
        x: e.offsetX,
        y: e.offsetY
    });
});

canvas.addEventListener('mouseup', () => {
    socket.emit('disengage');
});

canvas.addEventListener('mousemove', (e) => {
    socket.emit('draw', {
        x: e.offsetX,
        y: e.offsetY
    });
});

canvas.addEventListener ('mouseout', () => {
    socket.emit('disengage');
});

canvas.addEventListener ('mouseenter', (e) => {
    //console.log('MouseEnter');
    if (mouseIsDown) {
        socket.emit('engage', {
            x: e.offsetX,
            y: e.offsetY
        });
    }
});