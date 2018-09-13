var index = 0;
var balls = [];
var BALL_WIDTH = 40;
var BALL_HEIGHT = 40;
var canvas;
var speedMultiplier = .5;
var ballSpawns = 1;

function setup() {
	// setup canvas
	canvas = createCanvas(640, 320);

	// only recieve mouse input when clicked on canvas
	canvas.mousePressed(onMousePressed);

	// assign canvas to html div
	canvas.parent("canvas-holder");
}

function draw() {
	clear();
	background(128);
	for (var q = 0; q < balls.length; q++){
  		balls[q].drawBall();
  		balls[q].collision();
  		balls[q].move();
  	}
}

// removes all the balls
function clearBalls(){
	console.log("reset");
	balls = [];
	index = 0;
}

// resizes the canvas and removes all the balls. This should be called instead of just resizing it.
function resetCanvas(w, h){
	clearBalls();
	resizeCanvas(w, h);
}

// mouse pressed
function onMousePressed(){
	updateSpeed();
	updateBallSpawns();
	addBall(mouseX, mouseY, ballSpawns);
}

function keyPressed(){
	//clearBalls();
}

// update the speed of the balls from the html input
function updateSpeed(){
	speedMultiplier = (document.getElementById('input-speed').value)/20;
}

// update the ball spawns from the html input
function updateBallSpawns(){
	ballSpawns = Math.min(Math.max(parseInt(document.getElementById('input-spawn').value), 1), 20);
}

// adds balls to the array
function addBall(x, y, n=1){
	for (var q = 0; q < n; q++){
		var deltax = (Math.random()*2)-1;
		var deltay = (Math.random()*2)-1;
		console.log("Adding ball: [x="+x+",y="+y+",dx="+deltax+",dy="+deltay);
		balls[index] = new Ball(x, y, deltax, deltay);
		index++;
	}
}

// ball class
function Ball(x, y, deltax, deltay){
	this.x = x;
	this.y = y;
	this.deltax = deltax;
	this.deltay = deltay;

	// make sure that the ball does not start off outside of the canvas
	console.log(this.x + " " + width);
	if (this.x - (BALL_WIDTH/2) < 0)
		this.x = BALL_WIDTH/2;
	if (this.x + BALL_WIDTH/2 > width)
		this.x = width-BALL_WIDTH/2;
	if (this.y - BALL_HEIGHT/2 < 0)
		this.y = BALL_HEIGHT/2;
	if (this.y + BALL_HEIGHT/2 > height)
		this.y = height-BALL_HEIGHT/2;

	// draws the ball to the canvas
	this.drawBall = function(){
		fill(60, 120, 40); // green
		ellipse(parseInt(this.x), parseInt(this.y), BALL_WIDTH, BALL_HEIGHT);
		return;
	};

	// moves the ball based on the delta values
	this.move = function(){
		// console.log(this.x + ", " + this.y);
		this.x += (this.deltax*speedMultiplier);
		this.y += (this.deltay*speedMultiplier);
		return;
	};

	// check for collision
	this.collision = function(){
		// reached right or left side of page
		if (this.x+BALL_WIDTH/2 > width || this.x-BALL_WIDTH/2 < 0){
			this.deltax *= -1;
		}
		if (this.y+BALL_HEIGHT/2 > height || this.y-BALL_HEIGHT/2 < 0){
			this.deltay *= -1;
		}
	}
}