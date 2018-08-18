var canvas = document.getElementById('canvas');
var canvasContainer = document.getElementById('canvas-container');
var context = canvas.getContext('2d');
canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight;

var mouseIsDown = false;
var dragging = false;
var radius = 1;

document.onmousedown = function() { 
    console.log('THIS MOUSE IS DOWN');
    mouseIsDown = true;
}
document.onmouseup = function() {
    console.log('not down!!');
    mouseIsDown = false;
}

var engage = (e) => {
    dragging = true;
    
    context.arc(e.offsetX, e.offsetY, radius, 0, Math.PI*2);
    context.fill();
    context.moveTo(e.offsetX, e.offsetY);
}
var disengage = (e) => { 
    dragging = false;
    //console.log('not down!!');
    context.beginPath();
}
var draw = (e) => { 
    if (dragging) {
        console.log(e.offsetX, e.offsetY);

        context.lineTo(e.offsetX, e.offsetY); 
        context.lineWidth = radius*2; 
        context.stroke();

        context.beginPath();
        context.arc(e.offsetX, e.offsetY, radius, 0, Math.PI*2);
        context.fill();

        context.beginPath();

        context.moveTo(e.offsetX, e.offsetY);
    }
}

canvas.addEventListener('mousedown', engage);
canvas.addEventListener('mouseup', disengage);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener ('mouseout', () => {
    disengage();
});
canvas.addEventListener ('mouseenter', (e) => {
    console.log('MouseEnter');
    if (mouseIsDown) {
        engage(e);
    }
});
