//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;
    Text = PIXI.Text;



var type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
	type = "canvas";
}

PIXI.utils.sayHello(type);

//Create the renderer
var renderer = autoDetectRenderer(256, 256, {antialias: false, transparent: false, resolution: 1});

renderer.backgroundColor = 0x061639;

renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the `stage`
var root = new Container();
var i = 0;

loader
  .add([
       "images/launcher.png",
       "images/rocket_yellow.png",
       "images/rocket_cyan.png",
       "images/rocket_gray.png",
       "images/boom.png",
       "images/target_cyan.png",
       "images/target_yellow.png",
       "images/boomwrong.png",
       "images/score_cyan.png",
       "images/score_yellow.png"
  ])
  .on("progress", loadProgressHandler)
  .load(setup);

function loadProgressHandler(loader, resource) {
	console.log(loader.progress + " " + resource.url); 
	i++;
}

var launcher, rocket, boom, target;
var keyLeft, keyUp, keyRight, keyDown;
var message;
var max_velocity = 12;
var autopilot_state = idle, autopilot_ticks = 30;

function setup() {
	launcherA = new Sprite(
		loader.resources["images/launcher.png"].texture
	);
	launcherB = new Sprite(
		loader.resources["images/launcher.png"].texture
	);
	rocketA= new Sprite(
		loader.resources["images/rocket_yellow.png"].texture
	);
	rocketB= new Sprite(
		loader.resources["images/rocket_cyan.png"].texture
	);
	rocketC= new Sprite(
		loader.resources["images/rocket_gray.png"].texture
	);
	boomA = new Sprite(
		loader.resources["images/boom.png"].texture
	);
	boomB = new Sprite(
		loader.resources["images/boom.png"].texture
	);
	boomwrongA = new Sprite(
		loader.resources["images/boomwrong.png"].texture
	);
	boomwrongB = new Sprite(
		loader.resources["images/boomwrong.png"].texture
	);
	boomwrongC = new Sprite(
		loader.resources["images/boomwrong.png"].texture
	);
	targetA = new Sprite(
		loader.resources["images/target_yellow.png"].texture
	);
	targetB = new Sprite(
		loader.resources["images/target_cyan.png"].texture
	);
	scoreA = new Sprite(
		loader.resources["images/score_yellow.png"].texture
	);
	scoreB = new Sprite(
		loader.resources["images/score_cyan.png"].texture
	);
	
	
	rocketA.initX = 50;
	rocketA.initY = window.innerHeight-1;
	
	rocketB.initX = window.innerWidth - 50;
	rocketB.initY = window.innerHeight-1;
	
	rocketC.initX = window.innerWidth/2;
	rocketC.initY = window.innerHeight-1;
	
	launcherA.position.set(50,window.innerHeight);
	launcherA.anchor.set(0.5, 1);
	
	rocketA.anchor.set(0.5, 0.5);
	rocketA.position.set(rocketA.initX, rocketA.initY);
	
	boomA.position.set(200,50);
	boomA.anchor.set(0.5, 0.5);
	
	boomwrongA.position.set(200,50);
	boomwrongA.anchor.set(0.5, 0.5);
	
	targetA.position.set(400,400);
	targetA.anchor.set(0.5, 0.5);
	
	scoreA.position.set((window.innerWidth/2)-120,window.innerHeight);
	scoreA.anchor.set(0.5, 1);
	
	boomA.visible = false;
	boomwrongA.visible = false;
	
	rocketA.angle = 3*Math.PI/2;
	rocketA.velocity = 3;
	
	
	
	launcherB.position.set(window.innerWidth-50,window.innerHeight);
	launcherB.anchor.set(0.5, 1);
	
	rocketB.position.set(rocketB.initX, rocketB.initY);
	rocketB.anchor.set(0.5, 0.5);
	
	boomB.position.set(200,50);
	boomB.anchor.set(0.5, 0.5);
	
	boomwrongB.position.set(200,50);
	boomwrongB.anchor.set(0.5, 0.5);
	
	targetB.position.set(window.innerWidth-400,400);
	targetB.anchor.set(0.5, 0.5);
	
	scoreB.position.set((window.innerWidth/2)+120,window.innerHeight);
	scoreB.anchor.set(0.5, 1);
	
	boomB.visible = false;
	boomwrongB.visible = false;
	
	rocketB.angle = 3*Math.PI/2;
	rocketB.velocity = 5;
	
	
	rocketC.position.set(rocketC.initX, rocketC.initY);
	rocketC.anchor.set(0.5, 0.5);
	
	boomwrongC.position.set(200,50);
	boomwrongC.anchor.set(0.5, 0.5);
	
	boomwrongC.visible = false;
	
	rocketC.angle = 3*Math.PI/2;
	rocketC.velocity = 5;
	
	
	root.addChild(targetA);
	root.addChild(rocketA);
	root.addChild(launcherA);
	root.addChild(boomA);
	root.addChild(boomwrongA);
	root.addChild(scoreA);
	
	root.addChild(targetB);
	root.addChild(rocketB);
	root.addChild(launcherB);
	root.addChild(boomB);
	root.addChild(boomwrongB);
	root.addChild(scoreB);
	
	root.addChild(rocketC);
	root.addChild(boomwrongC);
	
	
	keyLeft= keyboard(37);
	keyUp= keyboard(38);
	keyRight= keyboard(39);
	keyDown= keyboard(40);
	
	message = new Text(
		"Scoreboard",
		{fontFamily: "Arial", fontSize: 32, fill: "white"}
	);
	
	rocketCountA = new Text(
		"0",
		{fontFamily: "Arial", fontSize: 30, fill: "white"}
	);
	rocketCountA.counter = 0;
	
	rocketCountB = new Text(
		"0",
		{fontFamily: "Arial", fontSize: 30, fill: "white"}
	);
	rocketCountB.counter = 0;
	scoreCountA = new Text(
		"0",
		{fontFamily: "Arial", fontSize: 30, fill: "white", fontWeight: "bold"}
	);
	scoreCountA.counter = 0;
	
	scoreCountB = new Text(
		"0",
		{fontFamily: "Arial", fontSize: 30, fill: "white", fontWeight: "bold"}
	);
	scoreCountB.counter = 0;
	
	message.anchor.set(0.5,1);
	message.position.set(window.innerWidth/2, window.innerHeight);
	rocketCountA.anchor.set(0.5,1);
	rocketCountA.position.set(50, window.innerHeight-5);
	rocketCountB.anchor.set(0.5,1);
	rocketCountB.position.set(window.innerWidth-50, window.innerHeight-5);
	scoreCountA.anchor.set(0.5,1);
	scoreCountA.position.set((window.innerWidth/2)-120, window.innerHeight-10);
	scoreCountB.anchor.set(0.5,1);
	scoreCountB.position.set((window.innerWidth/2)+120, window.innerHeight-10);
	root.addChild(message);
	root.addChild(rocketCountA);
	root.addChild(rocketCountB);
	root.addChild(scoreCountA);
	root.addChild(scoreCountB);
	
	rocketA.counter = rocketCountA;
	rocketB.counter = rocketCountB;
	rocketC.counter = null;


	//Tell the `renderer` to `render` the `stage`
	gameLoop();
}

var stateFunc = rocketFlight;

function gameLoop(){

	//Loop this function 60 times per second
	requestAnimationFrame(gameLoop);

	state();

	//Render the stage
	renderer.render(root);
}

function rocketFlight() {
	//Move the rocket 1 pixel per frame
	
	if(keyUp.isDown){
		accelerate(rocketA);
	}
	if(keyRight.isDown){
		steerRight(rocketA);
	}
	if(keyLeft.isDown){
		steerLeft(rocketA);
	}
	if(keyDown.isDown){
		decelerate(rocketA);
	}
	
	moveRocket(rocketA);
	moveRocket(rocketB);
	moveRocket(rocketC);
	
	
	
	//message.text = rocket.velocity;
		
}

function moveRocket(r){
	r.x += Math.cos(r.angle) * r.velocity;
	r.y += Math.sin(r.angle) * r.velocity;
	r.rotation = fixRotation(r.angle);
}

function steerRight(r){
	r.angle += 0.06;
	if(r.angle > 2*Math.PI){
		r.angle -= (2*Math.PI);
	}
}

function steerLeft(r){
	r.angle -= 0.06;
	if(r.angle < 0){
		r.angle += (2*Math.PI);
	}
}

function accelerate(r){
	r.velocity = Math.min(max_velocity, r.velocity+1);
}

function decelerate(r){
	r.velocity = Math.max(0, r.velocity-1);
}

function resetRocket(r){
	r.position.set(r.initX, r.initY);
	r.angle = 3*Math.PI/2;
	r.velocity = 5;
	
	if(r.counter != null){
		r.counter.counter++;
		r.counter.text = r.counter.counter;
	}
}



function getVelocity(dx, dy){
	return Math.sqrt(dx*dx + dy*dy);
}

function fixRotation(r){
	r += (Math.PI/2);
	
	if(r > (2*Math.PI)){
		r -= (2*Math.PI);
	}
	
	return r;
}

function getRotation(dx, dy){
	
	let s = Math.sqrt(dx*dx + dy*dy);
	
	let rotation = Math.acos(dx/s);
	
	if(dy < 0){
		rotation = (2*Math.PI) - rotation;
	}
	
	rotation += (Math.PI/2);
	
	if(rotation > (2*Math.PI)){
		rotation -= (2*Math.PI);
	}
	
	return rotation;
}

function state(){
	// rocket collision
	if(hitTestPointRectangle(rocketA, rocketC)){
		boomwrongA.position.set(rocketA.x, rocketA.y);
		hideBoom('A');
		boomwrongA.visible = true;
		resetRocket(rocketA);
		
		boomwrongC.position.set(rocketC.x, rocketC.y);
		boomwrongC.visible = true;
		resetRocket(rocketC);
	}
	else if(hitTestPointRectangle(rocketB, rocketC)){
		boomwrongB.position.set(rocketB.x, rocketB.y);
		hideBoom('B');
		boomwrongB.visible = true;
		resetRocket(rocketB);
		
		boomwrongC.position.set(rocketC.x, rocketC.y);
		boomwrongC.visible = true;
		resetRocket(rocketC);
	} else {
		autopilot(rocketC, rocketA);
	}
	
	if(hitTestPointRectangle(rocketA, rocketB)){
		boomwrongA.position.set(rocketA.x, rocketA.y);
		hideBoom('A');
		boomwrongA.visible = true;
		resetRocket(rocketA);
		
		boomwrongB.position.set(rocketB.x, rocketB.y);
		hideBoom('B');
// 		boomwrongB.visible = true;
		resetRocket(rocketB);
		
		scoreCountA.counter = 0;
		scoreCountB.counter = 0;
		updateScore(scoreCountA);
		updateScore(scoreCountB);
	}
	else if(hitTestPointRectangle(rocketA, targetA)){
		boomA.position.set(rocketA.x, rocketA.y);
		hideBoom('A');
		boomA.visible = true;
		
		scoreCountA.counter++;
		updateScore(scoreCountA);
		
		resetRocket(rocketA);
		relocateTarget(targetA);
	}
	else if(isOutsideBoundary(rocketA, window.innerWidth, window.innerHeight, 20)){
		boomwrongA.position.set(rocketA.x, rocketA.y);
		hideBoom('A');
		boomwrongA.visible = true;
		
		resetRocket(rocketA);
	} else {
		autopilot(rocketA, targetA);
	}
	
	// rocket b
	if(hitTestPointRectangle(rocketB, targetB)){
		boomB.position.set(rocketB.x, rocketB.y);
		hideBoom('B');
		boomB.visible = true;
		
		scoreCountB.counter++;
		updateScore(scoreCountB);
		
		resetRocket(rocketB);
		relocateTarget(targetB);
	}else if(isOutsideBoundary(rocketB, window.innerWidth, window.innerHeight, 20)){
		boomwrongB.position.set(rocketB.x, rocketB.y);
		hideBoom('B');
		boomwrongB.visible = true;
		
		scoreCountB.counter = 0;
		updateScore(scoreCountB);
		
		resetRocket(rocketB);
		
	} else {
		autopilot(rocketB, targetB);
	}
	
	scoreCountA.text = scoreCountA.counter;
	
	stateFunc();
}

function updateScore(s){
	s.text = s.counter;
}

function idle(r){}

function relocateTarget(t){
	t.x = 300 + Math.random()*(window.innerWidth-350)
	t.y = 50 + Math.random()*(window.innerHeight-350)
}

function autopilot(r, t){
	dx = t.x - r.x;
	dy = t.y - r.y;
	
	if(autopilot_ticks <= 0){
		autopilot_ticks = 0;
		if(dx == 0){
			// nothing
		} else {
			let beta = Math.atan(dy / dx);
			
			if (beta < 0){
				beta += 2*Math.PI;
			}
			
			if(r.x > t.x){
				beta += Math.PI;
				if(beta > 2*Math.PI){
					beta -= 2*Math.PI;
				}
			}
			var correct_direction = "";
			var pos = "";
			
			if(r.y > t.y){
				//beta += Math.PI;
				pos = "r.y > t.y";
				
				if( ( (beta-Math.PI) < r.angle ) && ( r.angle < beta ) ){
					var correct_direction = "right";
				} else {
					var correct_direction = "left";
				}
			} else {
				pos = "r.y < t.y";
				if( ( beta < r.angle ) && ( r.angle < (beta + Math.PI) ) ){
					var correct_direction = "left";
				} else {
					var correct_direction = "right";
				}
			}
			
			
			//message.text = "beta="+beta+" / angle="+r.angle+" / "+ correct_direction+" / "+pos;
			//message.text = correct_direction;
			
			let random = Math.random();
			
			if(random < 0.8){
				if(correct_direction === "left"){
					steerLeft(r);
				} else if(correct_direction === "right"){
					steerRight(r);
				}
			} else if (random < 0.95) {
				if(correct_direction === "right"){
					steerLeft(r);
				}  else if(correct_direction === "left") {
					steerRight(r);
				}
				
			} else {
				// nothing
			}
		}
		
	}
	autopilot_ticks--;
	
	//message.text = autopilot_ticks;
	
}

function hideBoom(c){
	if(c==='A'){
		boomwrongA.visible = false;
		boomA.visible = false;
	}
	if(c==='B'){
		boomwrongB.visible = false;
		boomB.visible = false;
	}
	
}

function isOutsideBoundary(r, width, height, margin){
	if(r.x < (0+margin)) return true;
	if(r.y < (0+margin)) return true;
	if(r.x > (width-margin)) return true;
	if(r.y > (height)) return true;
	return false;
}

function keyboard(keyCode) {
	var key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
	//The `downHandler`
	key.downHandler = function(event) {
	if (event.keyCode === key.code) {
		if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
		}
		if(event.keyCode > 36 && event.keyCode < 41){
			event.preventDefault();
		}
	};

	//The `upHandler`
	key.upHandler = function(event) {
		if (event.keyCode === key.code) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
		}
		if(event.keyCode > 36 && event.keyCode < 41){
			event.preventDefault();
		}
	};
	//Attach event listeners
	window.addEventListener(
		"keydown", key.downHandler.bind(key), false
	);
	window.addEventListener(
		"keyup", key.upHandler.bind(key), false
	);
	return key;
}

function hitTestRectangle(r1, r2) {

	//Define the variables we'll need to calculate
	var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

	//hit will determine whether there's a collision
	hit = false;

	//Find the center points of each sprite
	r1.centerX = r1.x + r1.width / 2;
	r1.centerY = r1.y + r1.height / 2;
	r2.centerX = r2.x + r2.width / 2;
	r2.centerY = r2.y + r2.height / 2;

	//Find the half-widths and half-heights of each sprite
	r1.halfWidth = r1.width / 2;
	r1.halfHeight = r1.height / 2;
	r2.halfWidth = r2.width / 2;
	r2.halfHeight = r2.height / 2;

	//Calculate the distance vector between the sprites
	vx = r1.centerX - r2.centerX;
	vy = r1.centerY - r2.centerY;

	//Figure out the combined half-widths and half-heights
	combinedHalfWidths = r1.halfWidth + r2.halfWidth;
	combinedHalfHeights = r1.halfHeight + r2.halfHeight;

	//Check for a collision on the x axis
	if (Math.abs(vx) < combinedHalfWidths) {

		//A collision might be occuring. Check for a collision on the y axis
		if (Math.abs(vy) < combinedHalfHeights) {

			//There's definitely a collision happening
			hit = true;
		} else {

			//There's no collision on the y axis
			hit = false;
		}
	} else {

		//There's no collision on the x axis
		hit = false;
	}

	//`hit` will be either `true` or `false`
	return hit;
};

function hitTestPointRectangle(r1, r2) {

	//Define the variables we'll need to calculate
	var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

	//hit will determine whether there's a collision
	hit = false;

	//Find the center points of each sprite
	r1.centerX = r1.x;
	r1.centerY = r1.y;
	r2.centerX = r2.x;
	r2.centerY = r2.y;

	//Calculate the distance vector between the sprites
	vx = r1.centerX - r2.centerX;
	vy = r1.centerY - r2.centerY;

	//Check for a collision on the x axis
	if (Math.abs(vx) < 20) {

		//A collision might be occuring. Check for a collision on the y axis
		if (Math.abs(vy) < 20) {

			//There's definitely a collision happening
			hit = true;
		} else {

			//There's no collision on the y axis
			hit = false;
		}
	} else {

		//There's no collision on the x axis
		hit = false;
	}
	
	//message.text = vx+"/"+vy;

	//`hit` will be either `true` or `false`
	return hit;
};
