var canvas = document.getElementById('canvas');
var canvasContainer = document.getElementById('canvas-container');
var context = canvas.getContext('2d');
canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight;

var mouseIsDown = false;
var dragging = false;
var radius = 1;

document.onmousedown = function() { 
    if (turn !== 'DRAWING') { return; }
    mouseIsDown = true;
}
document.onmouseup = function() {
    if (turn !== 'DRAWING') { return; }
    mouseIsDown = false;
}

socket.on('clientEngage', (coordinates) => {
    dragging = true;
    context.arc(coordinates.x, coordinates.y, radius, 0, Math.PI*2);
    context.fillStyle = "black";
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
        context.strokeStyle = "black";
        context.stroke();

        context.beginPath();
        context.arc(coordinates.x, coordinates.y, radius, 0, Math.PI*2);
        context.fillStyle = "black";
        context.fill();

        context.beginPath();

        context.moveTo(coordinates.x, coordinates.y);
    }
});

socket.on('clearCanvas', function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener('mousedown', (e) => {
    if (turn !== 'DRAWING') { return; }
    socket.emit('engage', {
        x: e.offsetX,
        y: e.offsetY
    });
});

canvas.addEventListener('mouseup', () => {
    if (turn !== 'DRAWING') { return; }
    socket.emit('disengage');
});

canvas.addEventListener('mousemove', (e) => {
    if (turn !== 'DRAWING') { return; }
    socket.emit('draw', {
        x: e.offsetX,
        y: e.offsetY
    });
});

canvas.addEventListener ('mouseout', () => {
    if (turn !== 'DRAWING') { return; }
    socket.emit('disengage');
});

canvas.addEventListener ('mouseenter', (e) => {
    //console.log('MouseEnter');
    if (turn !== 'DRAWING') { return; }
    if (mouseIsDown) {
        socket.emit('engage', {
            x: e.offsetX,
            y: e.offsetY
        });
    }
});