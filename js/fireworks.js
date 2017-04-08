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
  .add(["images/launcher.png","images/rocket.png","images/boom.png","images/target.png","images/boomwrong.png"])
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
	launcher = new Sprite(
		loader.resources["images/launcher.png"].texture
	);
	rocket= new Sprite(
		loader.resources["images/rocket.png"].texture
	);
	boom = new Sprite(
		loader.resources["images/boom.png"].texture
	);
	boomwrong = new Sprite(
		loader.resources["images/boomwrong.png"].texture
	);
	target = new Sprite(
		loader.resources["images/target.png"].texture
	);
	
	launcher.position.set(50,window.innerHeight);
	launcher.anchor.set(0.5, 1);
	rocket.position.set(50,window.innerHeight);
	rocket.anchor.set(0.5, 0.5);
	boom.position.set(200,50);
	boom.anchor.set(0.5, 0.5);
	boomwrong.position.set(200,50);
	boomwrong.anchor.set(0.5, 0.5);
	//target.position.set(window.innerWidth-200,50);
	target.position.set(400,400);
	target.anchor.set(0.5, 0.5);
	
	boom.visible = false;
	boomwrong.visible = false;
	
	rocket.vx = 0;
	rocket.vy = 0;
	rocket.angle = 3*Math.PI/2;
	rocket.velocity = 0;
	
	
	root.addChild(target);
	root.addChild(rocket);
	root.addChild(launcher);
	root.addChild(boom);
	root.addChild(boomwrong);
	
	keyLeft= keyboard(37);
	keyUp= keyboard(38);
	keyRight= keyboard(39);
	keyDown= keyboard(40);
	
	message = new Text(
		"Hello Pixi!",
		{fontFamily: "Arial", fontSize: 32, fill: "white"}
	);
	
	message.anchor.set(1,1);
	message.position.set(window.innerWidth, window.innerHeight);
	root.addChild(message);


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
		accelerate(rocket);
	}
	if(keyRight.isDown){
		steerRight(rocket);
	}
	if(keyLeft.isDown){
		steerLeft(rocket);
	}
	if(keyDown.isDown){
		decelerate(rocket);
	}
	
	rocket.x += Math.cos(rocket.angle) * rocket.velocity;
	rocket.y += Math.sin(rocket.angle) * rocket.velocity;
	rocket.rotation = fixRotation(rocket.angle);
	//message.text = rocket.velocity;
		
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
	r.position.set(50,window.innerHeight);
	r.angle = 3*Math.PI/2;
	r.velocity = 12;
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
	if(hitTestPointRectangle(rocket, target)){
		boom.position.set(rocket.x, rocket.y);
		hideBoom()
		boom.visible = true;
		
		resetRocket(rocket);
		relocateTarget(target);
	}else if(isOutsideBoundary(rocket, window.innerWidth, window.innerHeight, 20)){
		boomwrong.position.set(rocket.x, rocket.y);
		hideBoom();
		boomwrong.visible = true;
		
		resetRocket(rocket);
	} else {
		autopilot(rocket);
	}
	stateFunc();
}

function idle(r){}

function relocateTarget(t){
	t.x = 300 + Math.random()*(window.innerWidth-350)
	t.y = 50 + Math.random()*(window.innerHeight-350)
}

function autopilot(r){
	dx = target.x - r.x;
	dy = target.y - r.y;
	
	if(autopilot_ticks <= 0){
		autopilot_ticks = 0;
		if(dx == 0){
			// nothing
		} else {
			let beta = Math.atan(dy / dx);
			
			if (beta < 0){
				beta += 2*Math.PI;
			}
			
			if(r.x > target.x){
				beta += Math.PI;
				if(beta > 2*Math.PI){
					beta -= 2*Math.PI;
				}
			}
			var correct_direction = "";
			var pos = "";
			
			if(r.y > target.y){
				//beta += Math.PI;
				pos = "r.y > target.y";
				
				if( ( (beta-Math.PI) < r.angle ) && ( r.angle < beta ) ){
					var correct_direction = "right";
				} else {
					var correct_direction = "left";
				}
			} else {
				pos = "r.y < target.y";
				if( ( beta < r.angle ) && ( r.angle < (beta + Math.PI) ) ){
					var correct_direction = "left";
				} else {
					var correct_direction = "right";
				}
			}
			
			
			message.text = "beta="+beta+" / angle="+r.angle+" / "+ correct_direction+" / "+pos;
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

function hideBoom(){
	boomwrong.visible = false;
	boom.visible = false;
	
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
