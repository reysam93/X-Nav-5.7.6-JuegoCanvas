// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function () {
	princessReady = true;
};
princessImage.src = "images/princess.png";

//stone image
var stonesReady = false;
var stoneImage = new Image();
stoneImage.onload = function(){
	stonesReady = true;
};
stoneImage.src = "images/stone.png";

//monster image
var monstersReady = false;
var monsterImage = new Image();
monsterImage.onload = function(){
	monstersReady = true;
}
monsterImage.src = "images/monster.png"

// Game objects
var lives = 3;
var level = 1;
var monsterSpeed = 256/2;

var hero = {
	speed: 256, // movement in pixels per second
	size: 32
};
var lastHeroPos = {};
var princess = {
	size: 32,
};
var princessesCaught = 0;

var stones = [];
var nStones = 3;

var nMonsters = 2;
var monsters = [];

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var touching = function(obj1, obj2, size1, size2){
	if (
		obj1.x <= (obj2.x + size2)
		&& obj2.x <= (obj1.x + size1)
		&& obj1.y <= (obj2.y + size2)
		&& obj2.y <= (obj1.y + size1)
	) {
		return true;
	}else{
		return false;
	}
}

var generateStones = function(){
	stones = [];
	var stone = {};
	for (var i = 0; i < nStones; i++){
		stone.x = 32 + (Math.random() * (canvas.width - 96));
		stone.y = 32 + (Math.random() * (canvas.height - 96));
		stone.size = 30;

		if (!touching(stone, princess, stone.size, princess.size) 
			&& !touching(stone, hero, stone.size, princess.size)){
			stones.push(stone);
		}
		stone = {};
	}
}

var generateMonsters = function(){
	monsters =[];
	var monster = {};
	for (var i = 0; i < nMonsters; i++){
		monster.x = 32 + (Math.random() * (canvas.width - 96));
		monster.y = 32 + (Math.random() * (canvas.height - 96));
		monster.size = 32;
		monster.initX = monster.x;
		monster.initY = monster.y;
		monster.maxMov = 100;
		monster.speed = monsterSpeed;

		if(!touching(monster, princess, monster.size, princess.size) &&
		   !touching(monster, hero, monster.size, hero.size)){
			monsters.push(monster);
		}
		monster = {};
	}
}

// Reset the game when the player catches a princess
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the princess somewhere on the screen randomly
	//+32 for avoiding up & left trees
	//+ 96 for compensating the others 32, the 32 of the bottom/rigth trees and 32 for the width/higth of the pricess
	princess.x = 32 + (Math.random() * (canvas.width - 96));
	princess.y = 32 + (Math.random() * (canvas.height - 96));

	generateStones();
	generateMonsters();
};

var touchingTrees = function(obj){
	var touch = false;
	if (obj.x <= obj.size){
		obj.x = obj.size;
		touch = true;
	}
	if (obj.x >= canvas.width - 64){
		obj.x = canvas.width - 64;
		touch = true;
	}
	if(obj.y <= obj.size){
		obj.y = obj.size;
		touch = true;
	}
	if (obj.y >= canvas.height - 64){
		obj.y = canvas.height - 64;
		touch = true;
	}
	return touch;
}

var touchingMonsters = function(){
	for (var i = 0; i < monsters.length; i++){
		if (touching(hero, monsters[i], hero.size/2, monsters[i].size/2)){
			lives--;
			if (lives == 0){
				lives = 3;
				level = 1;
				nStones = 3;
				nMonsters = 2;
				princessesCaught = 0;
			}
			reset();
		}
	}
}

var touchingStones = function(){
	for (var i = 0; i < stones.length; i++){
		if (touching(hero, stones[i], hero.size, stones[i].size)){
			hero.x = lastHeroPos.x;
			hero.y = lastHeroPos.y;
		}
	}
}

var movingMonsters = function(modifier){
	for(var i = 0; i < monsters.length; i++){
		if ((i % 2) == 0){
			monsters[i].x += monsters[i].speed * modifier;
			if (Math.abs(monsters[i].x - monsters[i].initX) > monsters[i].maxMov){
				monsters[i].x -= monsters[i].speed * modifier;
				monsters[i].speed = monsters[i].speed * -1;
			}
		}else{
			monsters[i].y += monsters[i].speed * modifier;
			if (Math.abs(monsters[i].y - monsters[i].initY) > monsters[i].maxMov){
				monsters[i].y -= monsters[i].speed * modifier;
				monsters[i].speed = monsters[i].speed * -1;
			}
		}
		if (touchingTrees(monsters[i])){
			monsters[i].speed = monsters[i].speed * -1;
		}
	}
}

// Update game objects
var update = function (modifier) {
	lastHeroPos.x = hero.x;
	lastHeroPos.y = hero.y;
	if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
	}
	movingMonsters(modifier);
	touchingTrees(hero);
	touchingMonsters();
	touchingStones();

	// Princess and hero touching?
	if (touching(hero, princess, hero.size/2, princess.size/2)) {
		++princessesCaught;
		if (princessesCaught % 10 == 0){
			level++;
			lives++;
			nStones += 3;
			nMonsters += 2;
		}
		reset();
	}

	
};

var drawStones = function(){
	for (var i = 0; i < stones.length; i++){
		ctx.drawImage(stoneImage, stones[i].x, stones[i].y);
	}
}

var drawMonsters = function(){
	for (var i = 0; i < monsters.length; i++){
		ctx.drawImage(monsterImage, monsters[i].x, monsters[i].y);
	}
}

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}

	if (stonesReady){
		drawStones();
	}

	if (monstersReady){
		drawMonsters();
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Princesses caught: " + princessesCaught + " Lives: " + lives + " Level: " + level, 32, 32);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then; 

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
reset();
var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
