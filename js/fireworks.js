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
//	rocket.position.set(50,window.innerHeight);
	rocket.position.set(50,window.innerHeight);
	rocket.anchor.set(0.5, 0.5);
	boom.position.set(200,50);
	boom.anchor.set(0.5, 0.5);
	boomwrong.position.set(200,50);
	boomwrong.anchor.set(0.5, 0.5);
	target.position.set(window.innerWidth-200,50);
	target.anchor.set(0.5, 0.5);
	//boom.rotation = 0.5;
	
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
		rocket.velocity = Math.min(max_velocity, rocket.velocity+1);
	}
	if(keyRight.isDown){
		rocket.angle += 0.06;
		if(rocket.angle > 2*Math.PI){
			rocket.angle -= (2*Math.PI);
		}
	}
	if(keyLeft.isDown){
		rocket.angle -= 0.06;
		if(rocket.angle < 0){
			rocket.angle += (2*Math.PI);
		}
	}
	if(keyDown.isDown){
		rocket.velocity = Math.max(0, rocket.velocity-1);
	}
	
	rocket.x += Math.cos(rocket.angle) * rocket.velocity;
	rocket.y += Math.sin(rocket.angle) * rocket.velocity;
	rocket.rotation = fixRotation(rocket.angle);
	//message.text = rocket.velocity;
		
}

function resetRocket(){
	rocket.position.set(50,window.innerHeight);
	rocket.angle = 3*Math.PI/2;
	rocket.velocity = 3;
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
		boom.visible = true;
		
		resetRocket();
	}else if(isOutsideBoundary(rocket, window.innerWidth, window.innerHeight, 20)){
		boomwrong.position.set(rocket.x, rocket.y);
		boomwrong.visible = true;
		
		resetRocket();
	} else {
		
	}
	stateFunc();
}

function idle(){}

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
	
	message.text = vx+"/"+vy;

	//`hit` will be either `true` or `false`
	return hit;
};
