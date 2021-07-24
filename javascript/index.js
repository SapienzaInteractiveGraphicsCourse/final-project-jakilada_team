//fixed colors
var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
	grey:0x696969,
	greys: 0x181818,
	lightgrey:0xB8B8B8,
	orange: 0xffa500,
	sienna:	0xa0522d,
	seagreen: 0x2e8b57,	
	forestgreen: 0x228b22,
	green: 0x006633,
	shinygreen: 0x34d81d,
	black: 0x000000,
	sand: 0xf2d16b,
	gray: 0xE9E5DC,
	moon: 0xC0C0C0,
	neongreen: 0x7bff62,
};
//variables for the camera
var scene, camera, fieldOfView, aspectRatio, nearPlane, 
    farPlane, HEIGHT, WIDTH, renderer, container;
//variables fo the light
var hemisphereLight, shadowLight;

var game = {
	// geometry
	cylinderRadius: 600,
	cylinderHeight: 800,

	// game
	scenario: 0, // 0 -> desert; 1 -> countryside; 2 -> space
	lives: 3,
	level: 1,
	distance: 0,
	nAnimals: 50,
	stepLength: 150, //step interval between one spawn and another (decreases with levels)
	animalsSpeed: 1.4, // x Axis birds speed (increases with levels)
	animalsArray: [], // total animals in a level
	spawnPerStep: 2, // depends on level
	step: 1,
	deltaSpeed: [], // depends on level
	airplaneXpos: 0,
	airplaneYpos: 120,
	bonusLife: null,
	bonusLifeSpeed: 1.6,
	animalsRemoved: 0,
	audioOn: false,
	maxScore: 0,
	// logic
	started: false,
	paused: false,
}

var fieldDistance, fieldLevel, fieldHealth, fieldRecord, fieldAudio;

var currentSky;
var currentscenario;
var currentscenarioanimal;
//object variables
var Desert;
var desert;
var geom;
var mat;
var Cactus;
var cactus;
var nBlocs;  //clouds group 1
var nBlocs2; //clouds gropu 2
var Cloud;
// var Clock; //clock object for handling pause-invincibility
var timer;
var textureRS, textureWS;
//supp materials
var blackMat = new THREE.MeshPhongMaterial({
	color: 0x100707,
	shading:THREE.FlatShading,
  });
var greenMat = new THREE.MeshPhongMaterial({
	color: 0x7abf8e,
	shininess:0,
	shading:THREE.FlatShading,
  });
var witheMat = new THREE.MeshPhongMaterial({
	color: 0xd8d0d1,
	shininess:0,
	shading:THREE.FlatShading,
});
var sienaMat = new THREE.MeshPhongMaterial({
	color: 0xa0522d,
	shininess:0,
	shading:THREE.FlatShading,
});
var orangeMat = new THREE.MeshPhongMaterial({
	color: 0xffa500,
	shininess:0,
	shading:THREE.FlatShading,
});
var columbiaMat = new THREE.MeshPhongMaterial({
	color: 0xB3E5FF,
	shininess:0,
	shading:THREE.FlatShading,
});
var greyMat = new THREE.MeshPhongMaterial({
	color: 0x8C8C8C,
	shininess:0,
	shading:THREE.FlatShading,
});

//Scenario0
var desertsky;
var DesertSky;
var airplane;

//scenario1
var CountrySky;
var countrysky;
var CountrySide;
var countryside;
var geomCondorRightWing;
var matCondorRightWing;
var condorRightWing;
var geomCondorLeftWing;    
var matCondorLeftWing;
var condorLeftWing;

// scenario 2
var geomDuckLeftWing;
var matDuckLeftWing;
var geomDuckRightLowerWing;
var matDuckRightLowerWing;

//scenario 3 space
var Star;
var SpaceSky;
var spacesky;
var Moon;
var moon;
var Rock;
var Hole;

//animation support variables
var Timer, timerVis, timerInv, timeoutsWings = [], tWings, visStep = 100;
var posHor = 0, posVert = 0; //register the arrowkey position
var tweenPlane, tweenExplosion = [], lifeParticles, animalParticles, invincible = false;
//animation Array
var updateFcts	= [];
//scenario supp
var scenarios = [];
//listener "on load" of page
window.addEventListener('load', init, false);

/***************** INIT FUNCTION *****************************************************************************************/
function init() {
	// create the scene, objects and lights
	createScene();
	createLights();
	//for memory efficiency, all scenario will be initialize
	createScenario0();
	createScenario1();
	createScenario2();	
	createBackgroundScenario();	// since the initial scenario is fixed, it will create the default one
	initUI();
	initDeltaSpeed();
	backtrackHandler();

	// animation function used for updating objects position
	var keyboard	= new THREEx.KeyboardState(renderer.domElement);
	renderer.domElement.setAttribute("tabIndex", "0");
	renderer.domElement.focus();
	updateFcts.push(function(delta){
		if(game.started && !game.paused){
			//alert(tween.isActive());
			if(keyboard.pressed('left') || keyboard.pressed('a')){
				airplane.mesh.position.x += (Math.max(-200,  airplane.mesh.position.x - 120) - airplane.mesh.position.x)*delta;
				game.airplaneXpos = airplane.mesh.position.x;

				if(tweenPlane)
					tweenPlane.pause()
				if(airplane.mesh.rotation.x > -0.3) airplane.mesh.rotation.x =  airplane.mesh.rotation.x - 2 * delta ;

			}else if( keyboard.pressed('right') || keyboard.pressed('d')){
				airplane.mesh.position.x += (Math.min(200,  airplane.mesh.position.x + 120)- airplane.mesh.position.x)*delta;
				game.airplaneXpos = airplane.mesh.position.x;

				if(tweenPlane)
					tweenPlane.pause()
				if(airplane.mesh.rotation.x < 0.5) airplane.mesh.rotation.x =  airplane.mesh.rotation.x + 2 * delta ;
			}
			if(keyboard.pressed('up')  || keyboard.pressed('w') ){
				airplane.mesh.position.y += (Math.min(200,  airplane.mesh.position.y + 120)-airplane.mesh.position.y)*delta;
				game.airplaneYpos = airplane.mesh.position.y;
			}else if(keyboard.pressed('down') || keyboard.pressed('s')){
				airplane.mesh.position.y += (Math.max(40,  airplane.mesh.position.y - 120)-airplane.mesh.position.y)*delta;
				game.airplaneYpos = airplane.mesh.position.y;
			}
		}
	})
	var lastTimeMsec= null
	requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate );
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		updateFcts.forEach(function(updateFn){
			updateFn(deltaMsec/500, nowMsec/500)
		})
	})

	loop();
	renderer.render( scene, camera );
}

/************************* SCENE CREATION ********************************************************************************/
function createScene() {
	// Get the width and the height of the screen,
	// use them to set up the aspect ratio of the camera 
	// and the size of the renderer.
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	// Create the scene
	scene = new THREE.Scene();
	// Add a fog effect to the scene; same color as the
	// background color used in the style sheet
	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 50;
	nearPlane = .1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
	// Set the position of the camera
	camera.position.x = 0;
	camera.position.z = 250; // 250
	camera.position.y = 100; // 100
	camera.rotation.z = 0;
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		// Allow transparency to show the gradient background
		// we defined in the CSS
		alpha: true, 
		antialias: true // Activate the anti-aliasing; it may bring poorer performances;
	});
	
	renderer.setSize(WIDTH, HEIGHT);  // Define the size of the renderer; in this case, it will fill the entire screen
	renderer.shadowMap.enabled = true; // Enable shadow rendering
	container = document.getElementById('world'); // Add the DOM element of the renderer to the container we created in the HTML
	container.appendChild(renderer.domElement);
	window.addEventListener('keyup', hanldeUpKeyboard, false); //handle keyup event
	window.addEventListener('keydown', hanldeDownKeyboard, false); //handle keydown event
	window.addEventListener('click', handleClick, false); //handle click event	
	window.addEventListener('resize', handleWindowResize, false); //handle resize event
}

/*************************** WINDOW RESIZE HANDLER ***********************************************************************/

function handleWindowResize() {  // update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();

}

/*************************** KEYBOARD UP HANDLER *************************************************************************/
function hanldeUpKeyboard(event) {
	event.preventDefault();
	var key = event.which;
	switch(key){
		case 37:
		case 65: // A,
			if(!game.paused)
				tweenPlane = TweenMax.to( airplane.mesh.rotation, .5, {x: 0});
			break;

		case 39:
		case 68: // D
			if(!game.paused)
				tweenPlane = TweenMax.to( airplane.mesh.rotation, .5, {x: 0});
			break;
	}
}

/*************************** KEYBOARD DOWN HANDLER ***********************************************************************/
function hanldeDownKeyboard(event) {
	event.preventDefault();
	var key = event.which;
	switch(key){
		case 80: //P
			if(document.getElementById("pausedspan").style.display == "block"){
				document.getElementById("pausedspan").style.display = "none";
				TweenMax.resumeAll()
				if(timerInv)
					timer.resume();
				if(timerVis)
					timerVis.resume();
				game.started = true;
				game.paused = false;
				renderer.domElement.focus();  //airplane starts moving immediately
			}
			else if(document.getElementById("pausedspan").style.display == "none" && game.started == true) {
				document.getElementById("pausedspan").style.display = "block";
				TweenMax.pauseAll();
				if(timerInv)
					timerInv.pause();
				if(timerVis)
					timerVis.pause()
				if(airplane.mesh)
					airplane.mesh.visible = true;
				game.started = true;
				game.paused = true;
			}
			break;
	}
}
/*************************** CLICK HANDLER *******************************************************************************/
function handleClick(e) {
	e.preventDefault();
	var id = e.target.id;
	switch(id){

		case "start":
            game.started = true;
            document.getElementById("menu").style.display = "none";
            document.getElementById("dist").style.display = "block";
            document.getElementById("health").style.display = "block";
            document.getElementById("level").style.display = "block";
			createLifeParticles();
            game.paused = false;
			createBonusLife();
            createPlane();
            resetGame();
            break;
			
		case "selectscenario":
			document.getElementById("menuoption").style.display = "none";
			document.getElementById("selectscenario-div").style.display = "block";
			break;

		case "backssp":
			document.getElementById("menuoption").style.display = "block";
			document.getElementById("selectscenario-div").style.display = "none";
			document.getElementById("credits-div").style.display = "none";
			document.getElementById("howtoplay-div").style.display = "none";
			break;

		case "howtoplay":
			document.getElementById("menuoption").style.display = "none";
			document.getElementById("howtoplay-div").style.display = "block";
			document.getElementById("selectscenario-div").style.display = "none";
			break;

		case "backhtp":
			document.getElementById("menuoption").style.display = "block";
			document.getElementById("howtoplay-div").style.display = "none";
			document.getElementById("selectscenario-div").style.display = "none";
			document.getElementById("credits-div").style.display = "none";
			break;

		case "credits":
			document.getElementById("menuoption").style.display = "none";
			document.getElementById("credits-div").style.display = "block";
			document.getElementById("selectscenario-div").style.display = "none";
			break;

		case "backcdt":
			document.getElementById("menuoption").style.display = "block";
			document.getElementById("credits-div").style.display = "none";
			document.getElementById("selectscenario-div").style.display = "none";
			document.getElementById("howtoplay-div").style.display = "none";
			break;

		case "scenario0":
			if(game.scenario == 0) break;
			game.scenario = 0;
			createBackgroundScenario();
			break;

		case "scenario1":
			if(game.scenario == 1) break;
			game.scenario = 1;
			createBackgroundScenario();
			break;

		case "scenario2":
			if(game.scenario == 2) break;
			game.scenario = 2;
			createBackgroundScenario();
			break;

		case "resumePaused":
			game.started = true;
			document.getElementById("pausedspan").style.display = "none";
			game.paused = false;
			for(var i = 0; i< tweenExplosion.length; i++){
				tweenExplosion[i].play();
			}
			renderer.domElement.focus();  //airplane starts moving immediately
			break;
		
		case "playAgainPaused":
			resetGame();
			document.getElementById("pausedspan").style.display = "none";
			break;
		
		case "backToMenuPaused":
			backGame();
			document.getElementById("menu").style.display = "block";
			document.getElementById("pausedspan").style.display = "none";
			break;

		case "restartGameOver":
			resetGame();
			document.getElementById("gameOver").style.display = "none";
			break;
		
		case "backToMenuGameOver":
			backGame();
			document.getElementById("menu").style.display = "block";
			document.getElementById("gameOver").style.display = "none";
			break;

		case "audioImg":
			if(game.audioOn){
				fieldAudio.src = "img/sound_off.png";
				game.audioOn = false;
			}
			else {
				fieldAudio.src = "img/sound_on.png";
				game.audioOn = true;
			}
			backtrackHandler();
			renderer.domElement.focus();
			break;
	}
}

function backtrackHandler(){

	if(game.audioOn){
		document.getElementById("theme_song").loop = true;
		document.getElementById("theme_song").muted = false;
		document.getElementById("theme_song").play();
	}
	else {
		document.getElementById("theme_song").loop = true;
		document.getElementById("theme_song").muted = true;
		// document.getElementById("theme_song").play();
	}
}

function animationAnimals(){
	for (var i=0; i<game.nAnimals; i++){
		timeoutsWings.push(TweenMax.delayedCall(Math.random()*3, moveWing, [game.animalsArray[i]]));
		// timeoutsWings.push(new Timer(moveWing.bind(this,game.animalsArray[i]), Math.random()*2000));
	}
}

function initDeltaSpeed(){
	for(var i=0; i<game.nAnimals; i++){
		game.deltaSpeed.push(-game.animalsSpeed * Math.random() + game.animalsSpeed);
	}
}

function moveAnimals(){
	for(var i=0; i<game.nAnimals; i++){
		if(game.animalsArray[i].alive == true) game.animalsArray[i].mesh.position.x -= game.animalsSpeed + game.deltaSpeed[i];
	}
}

/******************* LOOP HANDLER ****************************************************************************************/
function loop(){
	if(game.started && !game.paused){
		if(game.animalsArray.length != 0) {
			animationAnimals();
			moveAnimals();
			handleAnimalsOnScene();
		}		
		handleAirplaneMovement();
		updateDistance();
		updateLevel();
		detectCollision();
		game.bonusLife.handleOnScene();
	}
	if(!game.paused && !game.started) backgroundMovement();
	
	renderer.render(scene, camera);// render the scene
	requestAnimationFrame(loop); // call the loop function again
}

//********************* LIGHT CREATIONS **********************************************************************************/
function createLights() {
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	// Allow shadow casting 
	shadowLight.castShadow = true;
	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
	// define the resolution of the shadow; the higher the better, 
	// but also less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
	// an ambient light modifies the global color of a scene and makes the shadows softer
	ambientLight = new THREE.AmbientLight(0xdc8874, .4);
	scene.add(ambientLight);
}

/******************************************** AIRPLANE CLASS *************************************************************/
class AirPlane {
	constructor(){
		this.mesh = new THREE.Object3D();
		// Load a texture
		textureRS = new THREE.TextureLoader().load( "img/textureAirplane.png" );
		textureWS = new THREE.TextureLoader().load( "img/whiteTexturePlane.png" );

		// Create the cabine
		// Cockpit
		var geomCockpit = new THREE.BoxGeometry(100,60,50,1,1,1);
		var matCockpit = new THREE.MeshPhongMaterial({map: textureRS});
		// we can access a specific vertex of a shape through 
		// the vertices array, and then move its x, y and z property:
		geomCockpit.vertices[4].y-=10;
		geomCockpit.vertices[4].z+=20;
		geomCockpit.vertices[5].y-=10;
		geomCockpit.vertices[5].z-=20;
		geomCockpit.vertices[6].y+=30;
		geomCockpit.vertices[6].z+=20;
		geomCockpit.vertices[7].y+=30;
		geomCockpit.vertices[7].z-=20;
		var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
		cockpit.position.set(-20,0,0);
		cockpit.castShadow = true;
		cockpit.receiveShadow = true;
		this.mesh.add(cockpit);
		// Create the front cabine
		var geomEngine = new THREE.BoxGeometry(20,60,50,1,1,1);
		var matEngine = new THREE.MeshPhongMaterial({map: textureWS});
		var engine = new THREE.Mesh(geomEngine, matEngine);
		engine.position.x = 40;
		engine.castShadow = true;
		engine.receiveShadow = true;
		this.mesh.add(engine);	
		// Create the tail
		var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
		var matTailPlane = new THREE.MeshPhongMaterial({map: textureRS});
		var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
		tailPlane.position.set(-62.7,27,0);
		tailPlane.castShadow = true;
		tailPlane.receiveShadow = true;
		this.mesh.add(tailPlane);	
		// Create the wing
		var geomSideWing = new THREE.BoxGeometry(45,15,250,1,1,1);
		var matSideWing = new THREE.MeshPhongMaterial({map: textureRS});
		var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
		sideWing.position.set(6,4,0);
		sideWing.rotation.z = .1;
		geomSideWing.vertices[1].x += 1;
		geomSideWing.vertices[0].x += 1;
		geomSideWing.vertices[4].x += 1;
		geomSideWing.vertices[5].x += 1;
		sideWing.castShadow = true;
		sideWing.receiveShadow = true;
		this.mesh.add(sideWing);
		
		//create glass cabin
		var geomWindshield = new THREE.BoxGeometry(50,20,20,1,1,1);
		var matWindshield = new THREE.MeshPhongMaterial({color:Colors.lightgrey, transparent:true, opacity:.8, shading:THREE.FlatShading});;
		var windshield = new THREE.Mesh(geomWindshield, matWindshield);
		windshield.position.set(2,36,0);
		windshield.rotation.z += 0.1;
		geomWindshield.vertices[0].x += 2;
		geomWindshield.vertices[1].x += 2;
		geomWindshield.vertices[5].x += 2;
		geomWindshield.vertices[4].x += 2;
		windshield.castShadow = true;
		windshield.receiveShadow = true;  
		this.mesh.add(windshield);
		//create wheels
		var wheelProtecGeom = new THREE.BoxGeometry(15,20,20,1,1,1);
		var wheelProtecMat = new THREE.MeshPhongMaterial({map: textureRS});
		var wheelProtecR = new THREE.Mesh(wheelProtecGeom,wheelProtecMat);
		wheelProtecR.position.set(22,-25,20);
		this.mesh.add(wheelProtecR);
	
		var wheelTireGeom = new THREE.BoxGeometry(10,17,17);
		var wheelTireMat = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
		var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
		wheelTireR.position.set(22,-40,20);
	
		var wheelAxisGeom = new THREE.BoxGeometry(4,7,20);
		var wheelAxisMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
		var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
		wheelTireR.add(wheelAxis);
		this.mesh.add(wheelTireR);
		
		var wheelProtecL = wheelProtecR.clone();
		wheelProtecL.position.set(wheelProtecR.position.x,wheelProtecR.position.y,-wheelProtecR.position.z);
		this.mesh.add(wheelProtecL);
	
		var wheelTireL = wheelTireR.clone();
		wheelTireL.position.set(wheelTireR.position.x,wheelTireR.position.y,-wheelTireR.position.z);
		this.mesh.add(wheelTireL);

		var wheelProtecB = wheelProtecR.clone();
		wheelProtecB.scale.set(.7,.7,.7);
		wheelProtecB.position.set(-55,-5,0);
		this.mesh.add(wheelProtecB);
	
		var wheelTireB = wheelTireR.clone();
		wheelTireB.scale.set(.8,.8,.8);
		wheelTireB.position.set(-55,-15,0);
		this.mesh.add(wheelTireB);
		// create the engines
		var geomEngine1 = new THREE.BoxGeometry(47,25,40,1,1,1);
		var matEngine1 = new THREE.MeshPhongMaterial({map: textureRS})
		
		var engine1 = new THREE.Mesh(geomEngine1, matEngine1);
		engine1.position.set(6,-3,80);
		engine1.rotation.z = .1;
		geomEngine1.vertices[2].x -= 2
		geomEngine1.vertices[3].x -= 2
		geomEngine1.vertices[4].x += 3
		geomEngine1.vertices[5].x += 3
		geomEngine1.vertices[6].x += 1
		geomEngine1.vertices[7].x += 1
		engine1.castShadow = true;
		engine1.receiveShadow = true;
		this.mesh.add(engine1);

		var geomEngine2 = new THREE.BoxGeometry(46,25,40,1,1,1);
		var matEngine2 = new THREE.MeshPhongMaterial({map: textureRS})
		
		var engine2 = new THREE.Mesh(geomEngine2, matEngine2);
		engine2.position.set(engine1.position.x,engine1.position.y, -engine1.position.z);
		engine2.rotation.z = .1;
		geomEngine2.vertices[2].x -= 2
		geomEngine2.vertices[3].x -= 2
		geomEngine2.vertices[4].x += 3
		geomEngine2.vertices[5].x += 3
		geomEngine2.vertices[6].x += 1
		geomEngine2.vertices[7].x += 1
		engine2.castShadow = true;
		engine2.receiveShadow = true;
		this.mesh.add(engine2);

		// propellers
		var geomPropeller1 = new THREE.BoxGeometry(20,10,10,1,1,1);
		var matPropeller1 = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
		this.propeller1 = new THREE.Mesh(geomPropeller1, matPropeller1);
		this.propeller1.castShadow = true;
		this.propeller1.receiveShadow = true;

		var geomPropeller2 = new THREE.BoxGeometry(20,10,10,1,1,1);
		var matPropeller2 = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
		this.propeller2 = new THREE.Mesh(geomPropeller2, matPropeller2);
		this.propeller2.castShadow = true;
		this.propeller2.receiveShadow = true;
		
		// blades
		var geomBlade = new THREE.BoxGeometry(1,80,15,1,1,1);
		var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
		
		var blade = new THREE.Mesh(geomBlade, matBlade);
		blade.position.set(8,0,0);
		blade.castShadow = true;
		blade.receiveShadow = true;
		this.propeller1.add(blade);
		this.propeller1.position.set(25,0,80);
		this.mesh.add(this.propeller1);

		var geomBlade2 = new THREE.BoxGeometry(1,80,15,1,1,1);
		var matBlade2 = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
		
		var blade2 = new THREE.Mesh(geomBlade2, matBlade2);
		blade2.position.set(8,0,0);
		blade2.castShadow = true;
		blade2.receiveShadow = true;	
		this.propeller2.add(blade2);
		this.propeller2.position.set(25,0,-80);
		this.mesh.add(this.propeller2);
	}
	
};

//airplane
function createPlane(){ 
	airplane = new AirPlane();
	airplane.mesh.scale.set(.3,.125,.125);
	airplane.mesh.position.y = game.airplaneYpos;
	//airplane.mesh.rotation.z = -.1;
	scene.add(airplane.mesh);
}

function createBackgroundScenario(){
	switch(game.scenario){
		case 0:
			scene.remove(scene.getObjectByName("sky"), scene.getObjectByName("terrain"));
			document.getElementById("gameHolder").style.background = "linear-gradient(#e4e0ba, #f7d9aa)";
			currentSky = desertsky;
			currentscenario = desert;
			break;
		case 1:
			scene.remove(scene.getObjectByName("sky"), scene.getObjectByName("terrain"));
			document.getElementById("gameHolder").style.background = "linear-gradient(#84dbf1, rgb(127, 226, 243))";
			currentSky = countrysky;
			currentscenario = countryside;
			break;
		case 2:
			scene.remove(scene.getObjectByName("sky"), scene.getObjectByName("terrain"))
			document.getElementById("gameHolder").style.background = "linear-gradient(#01013f, #5c5bfb )";
			currentSky = spacesky;
			currentscenario = moon;
			break;
	}
	scene.add(currentscenario.mesh, currentSky.mesh)
}

function createScenario0(){
	/*************************** CLOUD CLASS *********************************************************************************/
	Cloud = function(){
		this.mesh = new THREE.Object3D(); // Create an empty container that will hold the different parts of the cloud
		// create a cube geometry;
		// this shape will be duplicated to create the cloud
		geom = new THREE.SphereGeometry(17,32,32);
		mat = new THREE.MeshPhongMaterial({color:Colors.white, }); // create a material; a simple white material will do the trick	
		// duplicate the geometry a random number of times
		nBlocs = 5 + Math.floor(Math.random()*3);	
		for (var i=0; i<nBlocs; i++ ){		
			// create the mesh by cloning the geometry
			var m = new THREE.Mesh(geom, mat); 		
			// set the position and the rotation of each cube randomly
			m.position.x = i*15;
			m.position.y = Math.random()*10;
			m.position.z = Math.random()*10;
			m.rotation.z = Math.random()*Math.PI*2;
			m.rotation.y = Math.random()*Math.PI*2;		
			// set the size of the cube randomly
			var s = .1 + Math.random()*.9;
			m.scale.set(s,s,s);		
			// allow each cube to cast and to receive shadows
			m.castShadow = true;
			m.receiveShadow = true;		
			// add the cube to the container we first created
			this.mesh.add(m);
		} 

		nBlocs2 = 3;
		for (var i=0; i<nBlocs2; i++ ){
			// create the mesh by cloning the geometry
			var m2 = new THREE.Mesh(geom, mat); 
			// set the position and the rotation of each cube randomly
			m2.position.x = i*15;
			m2.position.y = Math.random()*10;
			m2.position.z = Math.random()*10;
			m2.rotation.z = Math.random()*Math.PI*2;
			m2.rotation.y = Math.random()*Math.PI*2;
			
			// set the size of the cube randomly
			var s = .1 + Math.random()*.9;
			m2.scale.set(s,s,s);
			
			// allow each cube to cast and to receive shadows
			m2.castShadow = true;
			m2.receiveShadow = true;
			
			// add the cube to the container we first created
			this.mesh.add(m2);
		}
	}
	/******************************** DESERT game.scenario ************************************************************************/
	DesertSky = function(){
		this.mesh = new THREE.Object3D(); // Create an empty container
		this.nClouds = 10; // choose a number of clouds to be scattered in the sky		
		var stepAngle = Math.PI*2 / this.nClouds; // To distribute the clouds consistently,  we need to place them according to a uniform angle		
		// create the clouds
		for(var i=0; i<this.nClouds; i++){
			var c = new Cloud();		
			// set the rotation and the position of each cloud;
			// for that we use a bit of trigonometry
			var a = stepAngle*i; // this is the final angle of the cloud
			var h = 760 + Math.random()*250; // this is the distance between the center of the axis and the cloud itself
			// Trigonometry!!! I hope you remember what you've learned in Math :)
			// in case you don't: 
			// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			c.mesh.position.y = Math.sin(a)*h;
			c.mesh.position.x = Math.cos(a)*h;
			// rotate the cloud according to its position
			c.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the clouds 
			// at random depths inside of the scene
			c.mesh.position.z = -400-Math.random()*400;			
			// we also set a random scale for each cloud
			var s = 1+Math.random()*2;
			c.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cloud in the scene
			this.mesh.add(c.mesh);  
		}  
	}
	function createDesertSky(){
		desertsky = new DesertSky();
		desertsky.mesh.position.y = -game.cylinderRadius;
		desertsky.mesh.name = "sky"
	}

	Desert = function(){
		this.mesh = new THREE.Object3D();
		// create the geometry (shape) of the cylinder;
		// the parameters are:
		// radius top, radius bottom, height, number of segments on the radius, number of segments vertically
		geom = new THREE.CylinderGeometry(game.cylinderRadius,game.cylinderRadius,game.cylinderHeight,40,10);  //FORSE DA CAMBIARE
		// rotate the geometry on the x axis
		geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
		// create the material 
		var mat = new THREE.MeshPhongMaterial({
			color:Colors.sand,
			shading:THREE.FlatShading,
		});
		// To create an object in Three.js, we have to create a mesh 
		// which is a combination of a geometry and some material
		this.mesh = new THREE.Mesh(geom, mat); // <----------------------------------------------
		// Allow the sea to receive shadows
		this.mesh.receiveShadow = true; 
		this.nCactus= 10;
		// To distribute the clouds consistently,
		// we need to place them according to a uniform angle
		var stepCactusAngle = Math.PI*2 / this.nCactus;

		// create the cactus
		for(var i=0; i<this.nCactus; i++){
			var c = new Cactus();
			// set the rotation and the position of each cactus using trigonometry
			var a = stepCactusAngle*i; // this is the final angle of the cactus
			var h = 610; // this is the distance between the center of the axis and the cactus itself
			// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			c.mesh.position.y = Math.sin(a)*h;
			c.mesh.position.x = Math.cos(a)*h;
			// rotate the cactus according to its position
			c.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the cactus 
			// at fixed depths inside of the scene
			c.mesh.position.z = -400+ Math.random()*270;
			// we also set a random scale for each cactus
			var s = 1+Math.random()*2;
			c.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cactus in the scene
			this.mesh.add(c.mesh); 
		}
		this.nCactus2= 7;
		// To distribute the cactus consistently, we need to place them according to a uniform angle
		var stepCactusAngle2 = Math.PI*2 / this.nCactus2;
		// create the cactus
		for(var i=0; i<this.nCactus2; i++){
			var c = new Cactus();
			// set the rotation and the position of each cactus using trigonometry
			var a = stepCactusAngle2*i; // this is the final angle of the cloud
			var h = 610; // this is the distance between the center of the axis and the cloud itself
			// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			c.mesh.position.y = Math.sin(a)*h;
			c.mesh.position.x = Math.cos(a)*h;
			// rotate the cactus according to its position
			c.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the cactus 
			// at fixed depths inside of the scene
			c.mesh.position.z = -400+ Math.random()*270;
			// we also set a random scale for each cactus
			var s = 1+Math.random()*2;
			c.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cactus in the scene
			this.mesh.add(c.mesh); 
		}
	}
	// Instantiate the desert and add it to the scene:
	function createDesert(){
		desert = new Desert();
		desert.mesh.position.y = -game.cylinderRadius;
		desert.mesh.name = "terrain";
		// scene.add(desert.mesh);
	}
	/********************************** CACTUS CLASS **************************************************************************/
	Cactus= function(){
		this.mesh = new THREE.Object3D();
		const length = 30, width = 20;
		const shape = new THREE.Shape();
		shape.moveTo( 0, 0 );
		shape.lineTo( 0, width );
		shape.lineTo( length, width );
		shape.lineTo( length, 0 );
		shape.lineTo( 0, 0 );

		const extrudeSettings = {
			steps: 2,   // Number of points used for subdividing segments along the depth of the extruded spline. Default is 1.
			depth: 50,  //Depth to extrude the shape. Default is 100.
			bevelEnabled: true,
			bevelThickness: 55, // How deep into the original shape the bevel (smussatura) goes. Default is 6.
			bevelSize: 4,  //Distance from the shape outline that the bevel extends. Default is bevelThickness - 2.
			bevelOffset: 2,  //Distance from the shape outline that the bevel starts. Default is 0.
			bevelSegments: 2  //Number of bevel layers. Default is 3.
		};
		//torso
		var geomCactTorso = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matCactTorso= new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var cactTorso = new THREE.Mesh(geomCactTorso, matCactTorso);
		cactTorso.position.set(10,-10,10);
		cactTorso.rotation.set(0,1.5,0);
		cactTorso.castShadow = true;
		cactTorso.receiveShadow = true;
		cactTorso.scale.set(0.08,0.9,0.02);
		this.mesh.add(cactTorso);
		//left horizontal branch of the cactus
		var geomCactLeftBranch = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matCactLeftBranch= new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var cactLeftBranch = new THREE.Mesh(geomCactLeftBranch, matCactLeftBranch);
		cactLeftBranch.position.set(14,-6,10);
		cactLeftBranch.rotation.set(0,1.5,0);
		cactLeftBranch.castShadow = true;
		cactLeftBranch.receiveShadow = true;
		cactLeftBranch.scale.set(0.08,0.08,0.02);
		this.mesh.add(cactLeftBranch);
		//left vertical branch
		var geomCactLeftVertBranch = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matCactLeftVertBranch= new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var cactLeftVertBranch = new THREE.Mesh(geomCactLeftVertBranch, matCactLeftVertBranch);
		cactLeftVertBranch.position.set(16,-11,10);
		cactLeftVertBranch.rotation.set(0,1.5,0);
		cactLeftVertBranch.castShadow = true;
		cactLeftVertBranch.receiveShadow = true;
		cactLeftVertBranch.scale.set(0.02,0.3,0.015);
		this.mesh.add(cactLeftVertBranch);
		//right horizontal branch of the cactus
		var geomCactRightBranch = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matCactRightBranch = new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var cactRightBranch = new THREE.Mesh(geomCactRightBranch, matCactRightBranch);
		cactRightBranch.position.set(6,-3,10);
		cactRightBranch.rotation.set(0,1.5,0);
		cactRightBranch.castShadow = true;
		cactRightBranch.receiveShadow = true;
		cactRightBranch.scale.set(0.09,0.08,0.02);
		this.mesh.add(cactRightBranch);
		//second cactus
		var geomCactTorso2 = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matCactTorso2= new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var cactTorso2 = new THREE.Mesh(geomCactTorso2, matCactTorso2);
		cactTorso2.position.set(40,-2,80);
		cactTorso2.rotation.set(0,1.5,0);
		cactTorso2.castShadow = true;
		cactTorso2.receiveShadow = true;
		cactTorso2.scale.set(0.08,0.9,0.02);
		this.mesh.add(cactTorso2);
		//left horizontal branch of the cactus
		var geomCactLeftBranch2 = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matCactLeftBranch2= new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var cactLeftBranch2 = new THREE.Mesh(geomCactLeftBranch2, matCactLeftBranch2);
		cactLeftBranch2.position.set(44,-1,80);
		cactLeftBranch2.rotation.set(0,1.5,0);
		cactLeftBranch2.castShadow = true;
		cactLeftBranch2.receiveShadow = true;
		cactLeftBranch2.scale.set(0.08,0.08,0.02);
		this.mesh.add(cactLeftBranch2);
		//right horizontal branch of the cactus
		var geomCactRightBranch2 = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matCactRightBranch2 = new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var cactRightBranch2 = new THREE.Mesh(geomCactRightBranch2, matCactRightBranch2);
		cactRightBranch2.position.set(36,4,80);
		cactRightBranch2.rotation.set(0,1.5,0);
		cactRightBranch2.castShadow = true;
		cactRightBranch2.receiveShadow = true;
		cactRightBranch2.scale.set(0.08,0.08,0.02);
		this.mesh.add(cactRightBranch2);
	    //Rock
		var geomRock = new THREE.BoxGeometry(60,50,50,1,1,1);
		var matRock= new THREE.MeshPhongMaterial({color:Colors.sand, shading:THREE.FlatShading});
		var rock = new THREE.Mesh(geomRock, matRock);
		rock.position.set(80,22,10);
		rock.rotation.set(1,1.5,0);
		rock.castShadow = true;
		rock.receiveShadow = true;
		rock.scale.set(0.2,0.2,0.4);
		this.mesh.add(rock);
	}

	createDesertSky();
	createDesert();
}

function createScenario1(){
		/******************************* COUNTRYSIDE ******************************************************************************/
	CountrySky = function(){
		this.mesh = new THREE.Object3D();	// Create an empty container
		this.nClouds = 18;	// choose a number of clouds to be scattered in the sky
		// To distribute the clouds consistently,
		// we need to place them according to a uniform angle
		var stepAngle = Math.PI*2 / this.nClouds;	
		// create the clouds
		for(var i=0; i<this.nClouds; i++){
			var c = new Cloud();	 
			// set the rotation and the position of each cloud;
			// for that we use a bit of trigonometry
			var a = stepAngle*i; // this is the final angle of the cloud
			var h = 760 + Math.random()*250; // this is the distance between the center of the axis and the cloud itself
			// Trigonometry!!! I hope you remember what you've learned in Math :)
			// in case you don't: 
			// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			c.mesh.position.y = Math.sin(a)*h;
			c.mesh.position.x = Math.cos(a)*h;
			// rotate the cloud according to its position
			c.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the clouds 
			// at random depths inside of the scene
			c.mesh.position.z = -400-Math.random()*400;		
			// we also set a random scale for each cloud
			var s = 1+Math.random()*2;
			c.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cloud in the scene
			this.mesh.add(c.mesh);  
		}  
	}

	function createCountrySky(){
		countrysky = new CountrySky();
		countrysky.mesh.position.y = -game.cylinderRadius;
		countrysky.mesh.name = "sky";
	}

	Countryside = function(){
		this.mesh = new THREE.Object3D();
		// create the geometry (shape) of the cylinder;
		// the parameters are: 
		// radius top, radius bottom, height, number of segments on the radius, number of segments vertically
		var geom = new THREE.CylinderGeometry(600,600,800,40,10);  //FORSE DA CAMBIARE	
		// rotate the geometry on the x axis
		geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));	
		// create the material 
		var mat = new THREE.MeshPhongMaterial({
			color: Colors.green,
			shading: THREE.FlatShading
		});
		// To create an object in Three.js, we have to create a mesh 
		// which is a combination of a geometry and some material
		this.mesh = new THREE.Mesh(geom, mat);
		this.mesh.receiveShadow = true; // Allow the sea to receive shadows
		this.nTrees= 25;	
		// To distribute the trees consistently,
		// we need to place them according to a uniform angle
		var stepTreeAngle = Math.PI*2 / this.nTrees;
		// create the cactus
		for(var i=0; i<this.nTrees; i++){
			var c = new Tree();	
			// set the rotation and the position of each tree using trigonometry
			var a = stepTreeAngle*i; // this is the final angle of the cloud
			var h = 610; // this is the distance between the center of the axis and the cloud itself
			// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			c.mesh.position.y = Math.sin(a)*h;
			c.mesh.position.x = Math.cos(a)*h;
			// rotate the cloud according to its position
			c.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the cactus 
			// at fixed depths inside of the scene
			c.mesh.position.z = -400+ Math.random()*270;		
			// we also set a random scale for each cloud
			var s = 1+Math.random()*2;
			c.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cloud in the scene
			this.mesh.add(c.mesh); 
		}	
		this.nTrees2= 20;	
		// To distribute the cactus consistently, we need to place them according to a uniform angle
		var stepTreeAngle2 = Math.PI*2 / this.nTrees2;
		// create the cactus
		for(var i=0; i<this.nTrees2; i++){
			var c = new Tree2();	
			// set the rotation and the position of each cactus using trigonometry
			var a = stepTreeAngle2*i; // this is the final angle of the cloud
			var h = 610; // this is the distance between the center of the axis and the cloud itself
			// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			c.mesh.position.y = Math.sin(a)*h;
			c.mesh.position.x = Math.cos(a)*h;
			// rotate the cactus according to its position
			c.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the cactus 
			// at fixed depths inside of the scene
			c.mesh.position.z = -200+ Math.random()*200;		
			// we also set a random scale for each cactus
			var s = 1+Math.random()*2;
			c.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cactus in the scene
			this.mesh.add(c.mesh); 
		}
		this.nBushes= 50;	
		// To distribute the cactus consistently, we need to place them according to a uniform angle
		var stepBushAngle = Math.PI*2 / this.nBushes;
		// create the cactus
		for(var i=0; i<this.nBushes; i++){
			var c = new Bush();	
			// set the rotation and the position of each cactus using trigonometry
			var a = stepBushAngle*i; // this is the final angle of the cloud
			var h = game.cylinderRadius; // this is the distance between the center of the axis and the cloud itself
			// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			c.mesh.position.y = Math.sin(a)*h;
			c.mesh.position.x = Math.cos(a)*h;
			// rotate the cactus according to its position
			c.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the cactus 
			// at fixed depths inside of the scene
			c.mesh.position.z = -200+ Math.random()*270;		
			// we also set a random scale for each cactus
			var s = .2 + Math.random()*.2;
			c.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cactus in the scene
			this.mesh.add(c.mesh); 
		}
	}

	// Instantiate the countryside and add it to the scene
	function createCountryside(){
		countryside = new Countryside();
		countryside.mesh.position.y = -game.cylinderRadius;
		countryside.mesh.name = "terrain";
	}

	/********************************** TREE CLASS****************************************************************************/
	Tree = function(){
		this.mesh = new THREE.Object3D();
		const length = 30, width = 20;
		const shape = new THREE.Shape();
		shape.moveTo( 0, 0 );
		shape.lineTo( 0, width );
		shape.lineTo( length, width );
		shape.lineTo( length, 0 );
		shape.lineTo( 0, 0 );
		const extrudeSettings = {
			steps: 2,   // Number of points used for subdividing segments along the depth of the extruded spline. Default is 1.
			depth: 50,  //Depth to extrude the shape. Default is 100.
			bevelEnabled: true,
			bevelThickness: 55, // How deep into the original shape the bevel (smussatura) goes. Default is 6.
			bevelSize: 4,  //Distance from the shape outline that the bevel extends. Default is bevelThickness - 2.
			bevelOffset: 2,  //Distance from the shape outline that the bevel starts. Default is 0.
			bevelSegments: 2  //Number of bevel layers. Default is 3.
		};
		//torso
		var geomTreeTorso = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matTreeTorso= new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
		var treeTorso = new THREE.Mesh(geomTreeTorso, matTreeTorso);
		treeTorso.position.set(10,-10,10);
		treeTorso.rotation.set(0,1.5,0);
		treeTorso.castShadow = true;
		treeTorso.receiveShadow = true;
		treeTorso.scale.set(0.08,0.9,0.03);
		this.mesh.add(treeTorso);
		//right branch
		var geomTreeLeftBranch = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matTreeLeftBranch= new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
		var treeLeftBranch = new THREE.Mesh(geomTreeLeftBranch, matTreeLeftBranch);
		treeLeftBranch.position.set(7,-6,10);
		treeLeftBranch.rotation.set(1.2,-0.8,0);
		treeLeftBranch.castShadow = true;
		treeLeftBranch.receiveShadow = true;
		treeLeftBranch.scale.set(0.03,0.09,0.05);
		this.mesh.add(treeLeftBranch);
		//leaves
		//leftleaf
		var geomTreeLeftLeaf = new THREE.SphereGeometry(17,32,32);
		var matTreeLeftLeaf= new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var treeLeftLeaf = new THREE.Mesh(geomTreeLeftLeaf, matTreeLeftLeaf);
		treeLeftLeaf.position.set(15,-6,10);
		treeLeftLeaf.rotation.set(0,1.5,0);
		treeLeftLeaf.castShadow = true;
		treeLeftLeaf.receiveShadow = true;
		treeLeftLeaf.scale.set(0.3,0.2,0.3);
		this.mesh.add(treeLeftLeaf);
		//upper leaf
		var geomTreeUpperLeaf = new THREE.SphereGeometry(17,32,32);
		var matTreeUpperLeaf= new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var treeUpperLeaf = new THREE.Mesh(geomTreeUpperLeaf, matTreeUpperLeaf);
		treeUpperLeaf.position.set(11,-12, 8);
		treeUpperLeaf.rotation.set(0,1.5,0);
		treeUpperLeaf.castShadow = true;
		treeUpperLeaf.receiveShadow = true;
		treeUpperLeaf.scale.set(0.3,0.2,0.3);
		this.mesh.add(treeUpperLeaf);
		//right leaf
		var geomTreeRightLeaf = new THREE.SphereGeometry(17,32,32);
		var matTreeRightLeaf  = new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var treeRightLeaf  = new THREE.Mesh(geomTreeRightLeaf , matTreeRightLeaf );
		treeRightLeaf.position.set(5,-10,10);
		treeRightLeaf.rotation.set(0,1.5,0);
		treeRightLeaf.castShadow = true;
		treeRightLeaf.receiveShadow = true;
		treeRightLeaf.scale.set(0.3,0.2,0.3);
		this.mesh.add(treeRightLeaf);
		//front sphere
		var geomTreeFrontLeaf = new THREE.SphereGeometry(17,32,32);
		var matTreeFrontLeaf= new THREE.MeshPhongMaterial({color:Colors.seagreen, shading:THREE.FlatShading});
		var treeFrontLeaf = new THREE.Mesh(geomTreeFrontLeaf, matTreeFrontLeaf);
		treeFrontLeaf.position.set(11,-10,12);
		treeFrontLeaf.rotation.set(0,1.5,0);
		treeFrontLeaf.castShadow = true;
		treeFrontLeaf.receiveShadow = true;
		treeFrontLeaf.scale.set(0.3,0.2,0.3);
		this.mesh.add(treeFrontLeaf);
	}

	/****************************** TREE2 CLASS ******************************************************************************/
	Tree2 = function(){
		this.mesh = new THREE.Object3D();
		const length = 30, width = 20;
		const shape = new THREE.Shape();
		shape.moveTo( 0, 0 );
		shape.lineTo( 0, width );
		shape.lineTo( length, width );
		shape.lineTo( length, 0 );
		shape.lineTo( 0, 0 );
		const extrudeSettings = {
			steps: 2,   // Number of points used for subdividing segments along the depth of the extruded spline. Default is 1.
			depth: 50,  //Depth to extrude the shape. Default is 100.
			bevelEnabled: true,
			bevelThickness: 55, // How deep into the original shape the bevel (smussatura) goes. Default is 6.
			bevelSize: 4,  //Distance from the shape outline that the bevel extends. Default is bevelThickness - 2.
			bevelOffset: 2,  //Distance from the shape outline that the bevel starts. Default is 0.
			bevelSegments: 2  //Number of bevel layers. Default is 3.
		};
		//torso
		var geomTreeTorso = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matTreeTorso= new THREE.MeshPhongMaterial({color:Colors.sienna, shading:THREE.FlatShading});
		var treeTorso = new THREE.Mesh(geomTreeTorso, matTreeTorso);
		treeTorso.position.set(10,-10,10);
		treeTorso.rotation.set(0,1.5,0);
		treeTorso.castShadow = true;
		treeTorso.receiveShadow = true;
		treeTorso.scale.set(0.08,0.9,0.03);
		this.mesh.add(treeTorso);
		//left branch
		var geomTreeLeftBranch = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		var matTreeLeftBranch= new THREE.MeshPhongMaterial({color:Colors.sienna, shading:THREE.FlatShading});
		var treeLeftBranch = new THREE.Mesh(geomTreeLeftBranch, matTreeLeftBranch);
		treeLeftBranch.position.set(14,0,9);
		treeLeftBranch.rotation.set(1.2,0.8,0);
		treeLeftBranch.castShadow = true;
		treeLeftBranch.receiveShadow = true;
		treeLeftBranch.scale.set(0.03,0.07,0.012);
		this.mesh.add(treeLeftBranch);
		//leaves
		//leftleaf
		var geomTreeLeftLeaf = new THREE.SphereGeometry(17,32,32);
		var matTreeLeftLeaf= new THREE.MeshPhongMaterial({color:Colors.forestgreen, shading:THREE.FlatShading});
		var treeLeftLeaf = new THREE.Mesh(geomTreeLeftLeaf, matTreeLeftLeaf);
		treeLeftLeaf.position.set(15,-6,10);
		treeLeftLeaf.rotation.set(0,1.5,0);
		treeLeftLeaf.castShadow = true;
		treeLeftLeaf.receiveShadow = true;
		treeLeftLeaf.scale.set(0.3,0.2,0.3);
		this.mesh.add(treeLeftLeaf);
		//left upper leaf
		var geomTreeLeftLeaf = new THREE.SphereGeometry(17,32,32);
		var matTreeLeftLeaf= new THREE.MeshPhongMaterial({color:Colors.forestgreen, shading:THREE.FlatShading});
		var treeLeftLeaf = new THREE.Mesh(geomTreeLeftLeaf, matTreeLeftLeaf);
		treeLeftLeaf.position.set(15,-11,10);
		treeLeftLeaf.rotation.set(0,1.5,0);
		treeLeftLeaf.castShadow = true;
		treeLeftLeaf.receiveShadow = true;
		treeLeftLeaf.scale.set(0.3,0.2,0.3);
		this.mesh.add(treeLeftLeaf);
		//upper leaf
		var geomTreeUpperLeaf = new THREE.SphereGeometry(17,32,32);
		var matTreeUpperLeaf= new THREE.MeshPhongMaterial({color:Colors.forestgreen, shading:THREE.FlatShading});
		var treeUpperLeaf = new THREE.Mesh(geomTreeUpperLeaf, matTreeUpperLeaf);
		treeUpperLeaf.position.set(11,-12, 8);
		treeUpperLeaf.rotation.set(0,1.5,0);
		treeUpperLeaf.castShadow = true;
		treeUpperLeaf.receiveShadow = true;
		treeUpperLeaf.scale.set(0.3,0.2,0.3);
		this.mesh.add(treeUpperLeaf);
		//right leaf
		var geomTreeRightLeaf = new THREE.SphereGeometry(17,32,32);
		var matTreeRightLeaf  = new THREE.MeshPhongMaterial({color:Colors.forestgreen, shading:THREE.FlatShading});
		var treeRightLeaf  = new THREE.Mesh(geomTreeRightLeaf , matTreeRightLeaf );
		treeRightLeaf.position.set(5,-8,10);
		treeRightLeaf.rotation.set(0,1.5,0);
		treeRightLeaf.castShadow = true;
		treeRightLeaf.receiveShadow = true;
		treeRightLeaf.scale.set(0.3,0.2,0.3);
		this.mesh.add(treeRightLeaf);
		//front sphere
		var geomTreeFrontLeaf = new THREE.SphereGeometry(17,32,32);
		var matTreeFrontLeaf= new THREE.MeshPhongMaterial({color:Colors.forestgreen, shading:THREE.FlatShading});
		var treeFrontLeaf = new THREE.Mesh(geomTreeFrontLeaf, matTreeFrontLeaf);
		treeFrontLeaf.position.set(11,-10,12);
		treeFrontLeaf.rotation.set(0,1.5,0);
		treeFrontLeaf.castShadow = true;
		treeFrontLeaf.receiveShadow = true;
		treeFrontLeaf.scale.set(0.3,0.2,0.3);
		this.mesh.add(treeFrontLeaf);
	}

	/******************* BUSH CLASS ******************************************************************************************/
	Bush = function(){
		this.mesh = new THREE.Object3D();
		var geom = new THREE.SphereGeometry(17,17,32);
		var mat = new THREE.MeshPhongMaterial({color:Colors.green, });
		nBushes = 5 + Math.floor(Math.random()*3);	
		for (var i=0; i<nBushes; i++ ){		
			// create the mesh by cloning the geometry
			var m = new THREE.Mesh(geom, mat); 		
			// set the position and the rotation of each cube randomly
			m.position.x = i*15;
			m.position.y = Math.random()*10;
			m.position.z = Math.random()*10;	
			// set the size of the cube randomly
			var s = .1 + Math.random()*.9;
			m.scale.set(s,s,s);		
			// allow each cube to cast and to receive shadows
			m.castShadow = true;
			m.receiveShadow = true;		
			// add the cube to the container we first created
			this.mesh.add(m);
		} 
	}

	createCountrySky();
	createCountryside();
}

/******************************** SPACE game.scenario ************************************************************************/
function createScenario2(){
	Star = function(){
		// Create an empty container that will hold the different parts of the star
		this.mesh = new THREE.Object3D();	
		// create a cube geometry;
		// this shape will be duplicated to create the star
		geom = new THREE.BoxGeometry(1, 1, 1);
		mat = new THREE.MeshPhongMaterial({color:Colors.white, }); // create a material; a simple white material will do the trick	
		// duplicate the geometry a random number of times
		nBlocks = 50 + Math.floor(Math.random()*4);	
		//var nBlocs = 3;
		for (var i=0; i<nBlocks; i++ ){		
			// create the mesh by cloning the geometry
			var m = new THREE.Mesh(geom, mat); 		
			// set the position and the rotation of each cube randomly
			m.position.x = i*15;
			m.position.y = Math.random()*10;
			m.position.z = Math.random()*10;
			m.rotation.z = Math.random()*Math.PI*2;
			m.rotation.y = Math.random()*Math.PI*2;		
			// set the size of the cube randomly
			var s = .1 + Math.random()*.9;
			m.scale.set(s,s,s);		
			// allow each cube to cast and to receive shadows
			//m.castShadow = true;
			//m.receiveShadow = true;		
			// add the cube to the container we first created
			this.mesh.add(m);
		} 
		//momentaneamente commentato perche altrimenti non funziona il gioco
		nBlocks2 = 40;
		for (var i=0; i<nBlocks2; i++ ){
			// create the mesh by cloning the geometry
			var m2 = new THREE.Mesh(geom, mat); 
			// set the position and the rotation of each cube randomly
			m2.position.x = i*300;
			m2.position.y = Math.random()*10;
			m2.position.z = Math.random()*10;
			m2.rotation.z = Math.random()*Math.PI*2;
			m2.rotation.y = Math.random()*Math.PI*2;
			
			// set the size of the cube randomly
			var s = .1 + Math.random()*.9;
			m2.scale.set(s,s,s);

			// add the cube to the container we first created
			this.mesh.add(m2);
		}
	}
	SpaceSky = function(){
		// Create an empty container
		this.mesh = new THREE.Object3D();		
		// choose a number of clouds to be scattered in the sky
		this.nStarts = 100;		
		// To distribute the clouds consistently,
		// we need to place them according to a uniform angle
		var stepAngle = Math.PI*2 / this.nStarts;		
		// create the clouds
		for(var i=0; i<this.nStarts; i++){
			var c = new Star();		
			// set the rotation and the position of each cloud;
			// for that we use a bit of trigonometry
			var a = stepAngle*i; // this is the final angle of the cloud
			var h = 500 + Math.random()*250; // this is the distance between the center of the axis and the cloud itself
			// we are converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			c.mesh.position.y = Math.sin(a)*h;
			c.mesh.position.x = Math.cos(a)*h;
			// rotate the cloud according to its position
			c.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the clouds 
			// at random depths inside of the scene
			c.mesh.position.z = -200 - Math.random()*400;			
			// we also set a random scale for each cloud
			var s = 1 + Math.random()*2;
			c.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cloud in the scene
			this.mesh.add(c.mesh);  
		}  
	}

	function createSpaceSky(){
		spacesky = new SpaceSky();
		spacesky.mesh.position.y = -game.cylinderRadius;
		spacesky.mesh.name = "sky"
	}

	Rock = function(){
		//Rock
		this.mesh = new THREE.Object3D();
		var geomRock = new THREE.BoxGeometry(60,50,50,1,1,1); // create a cube geometry;
		var matRock= new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading}); // create a material; a simple white material will do the trick	
		
		var nRocks = 1 + Math.floor(Math.random()*3);	// duplicate the geometry a random number of times
		for (var i=0; i<nRocks; i++ ){		
			var rock = new THREE.Mesh(geomRock, matRock); // create the mesh by cloning the geometry
			// set the position and the rotation of each cube randomly
			rock.position.x = i*20;
			rock.position.y = 0;
			rock.position.z =  0;

			rock.rotation.z = Math.random()*Math.PI*2;
			rock.rotation.y = Math.random()*Math.PI*2;	
				
			var s = .1 + Math.random()*.09;  // set the size of the cube randomly
			rock.scale.set(s,s,s);		
			// allow each cube to cast and to receive shadows
			rock.castShadow = true;
			rock.receiveShadow = true;	
			// add the cube to the container we first created
			this.mesh.add(rock);
		} 
		var nRocks2 = 2 + Math.floor(Math.random()*4);	
		for (var i=0; i<nRocks2; i++ ){		
			var rock2 = new THREE.Mesh(geomRock, matRock);	
			rock2.position.x = Math.random()*Math.PI*2;
			rock2.position.y = Math.random()*Math.PI*2;
			rock2.rotation.z = Math.random()*Math.PI*2;
			rock2.rotation.y = Math.random()*Math.PI*2;				
			var s2 = .2 + Math.random()*.09;
			rock2.scale.set(s2,s2,s2);					
			rock2.castShadow = true;
			rock2.receiveShadow = true;	
			this.mesh.add(rock2);
		} 
	}

	Hole = function(){
		//holes
		this.mesh = new THREE.Object3D();
	    var geomHole = new THREE.CircleGeometry(60,50);
		var matHole = new THREE.MeshPhongMaterial({color:Colors.grey, shading:THREE.FlatShading});
		var hole = new THREE.Mesh(geomHole, matHole);	
		hole.rotation.set(1.5, 0, 0);
		hole.scale.set(0.2,0.2,0.4);
		hole.castShadow = true;
		hole.receiveShadow = true;	
		this.mesh = new THREE.Object3D();
		var geomHole2 = new THREE.CircleGeometry(60,50);
		var matHole2 = new THREE.MeshPhongMaterial({color:Colors.black, shading:THREE.FlatShading});
		var hole2 = new THREE.Mesh(geomHole2, matHole2);	
		hole2.rotation.set(2, 0, 0);
		hole2.scale.set(0.08,0.08,0.2);
		hole2.position.set(110, 33, 10);
		hole2.castShadow = true;
		hole2.receiveShadow = true;	
		this.mesh.add(hole2);
		this.mesh.add(hole);	
	}
	
	Moon = function(){
		this.mesh = new THREE.Object3D();
		// the parameters are: 
		// radius top, radius bottom, height, number of segments on the radius, number of segments vertically
		geom = new THREE.CylinderGeometry(game.cylinderRadius,game.cylinderRadius,game.cylinderHeight,40,10);  //FORSE DA CAMBIARE
		// rotate the geometry on the x axis
		geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
		// create the material 
		var mat = new THREE.MeshPhongMaterial({
			color:Colors.moon,
			shading:THREE.FlatShading,
		});
		// To create an object in Three.js, we have to create a mesh 
		// which is a combination of a geometry and some material
		this.mesh = new THREE.Mesh(geom, mat);
		// Allow the sea to receive shadows
		this.mesh.receiveShadow = true; 
		this.nRocksMoon= 130;
		// To distribute the clouds consistently,
		// we need to place them according to a uniform angle
		var stepRockMoonAngle = Math.PI*2 / this.nRocksMoon;
		// create the cactus

		for(var i=0; i<this.nRocksMoon; i++){
			var r = new Rock();
			// set the rotation and the position of each cloud using trigonometry
			var a = stepRockMoonAngle*i; // this is the final angle of the cloud
			var h = 590; // this is the distance between the center of the axis and the cloud itself
			// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			r.mesh.position.y = Math.sin(a)*h;
			r.mesh.position.x = Math.cos(a)*h;
			// rotate the cloud according to its position
			r.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the cactus 
			// at fixed depths inside of the scene
			r.mesh.position.z = -300+ Math.random()*270;
			// we also set a random scale for each cloud
			var s = 1+Math.random()*2;
			r.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cloud in the scene
			this.mesh.add(r.mesh); 
		}


		this.nHoles= 15;
		// To distribute the cactus consistently, we need to place them according to a uniform angle
		var stepHolesAngle = Math.PI*2 / this.nHoles;

		// create the cactus
		for(var i=0; i<this.nHoles; i++){
			var hol = new Hole();
			// set the rotation and the position of each cactus using trigonometry
			var a = stepHolesAngle*i; // this is the final angle of the cloud
			var h = 600; // this is the distance between the center of the axis and the cloud itself
			// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
			hol.mesh.position.y = Math.sin(a)*h;
			hol.mesh.position.x = Math.cos(a)*h;
			// rotate the cactus according to its position
			hol.mesh.rotation.z = a + Math.PI/2;
			// for a better result, we position the cactus 
			// at fixed depths inside of the scene
			hol.mesh.position.z = -300+ Math.random()*300;
			// we also set a random scale for each cactus
			var s = 1+Math.random()*2;
			hol.mesh.scale.set(s,s,s);
			// do not forget to add the mesh of each cactus in the scene
			this.mesh.add(hol.mesh); 
		}
	}
	// Instantiate the desert and add it to the scene:	
	function createSpace(){
		moon = new Moon();
		moon.mesh.position.y = -game.cylinderRadius;
		moon.mesh.name = "terrain";
	}
	createSpaceSky();
	createSpace();
}
// spawna n animals (means put n animals on the screen, from right to left)
function spawnAnimals(n){

	class Condor {
		constructor() {
			this.alive = true;
			this.movingUpWings = true;
			this.upperBound = 0;
			this.lowerBound = 0;
			this.mesh = new THREE.Object3D();
			// Create the body
			//number of points on the curve, default 12
			const length = 30, width = 20;
			const shape = new THREE.Shape();
			shape.moveTo(0, 0);
			shape.lineTo(0, width);
			shape.lineTo(length, width);
			shape.lineTo(length, 0);
			shape.lineTo(0, 0);
			const extrudeSettings = {
				steps: 2,
				depth: 50,
				bevelEnabled: true,
				bevelThickness: 55,
				bevelSize: 4,
				bevelOffset: 2,
				bevelSegments: 2 //Number of bevel layers. Default is 3.
			};
			var geomBody = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var matBody = new THREE.MeshPhongMaterial({ color: Colors.greys, shading: THREE.FlatShading });
			var body = new THREE.Mesh(geomBody, matBody);
			body.position.set(-20, -6, 10);
			body.rotation.set(0, 1.5, 0);
			body.castShadow = true;
			body.receiveShadow = true;
			body.scale.set(0.5, 0.7, 0.25);
			this.mesh.add(body);
			//create the white neck
			var geomNeck = new THREE.CylinderGeometry(8, 8, 6, 32);
			var matNeck = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
			var neck = new THREE.Mesh(geomNeck, matNeck);
			neck.rotation.z = 30;
			neck.position.x = 22;
			neck.castShadow = true;
			neck.receiveShadow = true;
			this.mesh.add(neck);
			// Create the face
			var geomFace = new THREE.CylinderGeometry(5, 5, 10, 32);
			var matFace = new THREE.MeshPhongMaterial({ color: Colors.pink, shading: THREE.FlatShading });
			var face = new THREE.Mesh(geomFace, matFace);
			face.rotation.z = 30;
			face.position.x = 30;
			face.position.y = 2;
			face.castShadow = true;
			face.receiveShadow = true;
			this.mesh.add(face);
			// Create the beak
			var geomBeak = new THREE.CylinderGeometry(0, 5, 10, 10);
			var matBeak = new THREE.MeshPhongMaterial({ color: Colors.orange, shading: THREE.FlatShading });
			var beak = new THREE.Mesh(geomBeak, matBeak);
			beak.position.set(40, 4, -1);
			beak.rotation.set(5, 0, 250);
			beak.castShadow = true;
			beak.receiveShadow = true;
			this.mesh.add(beak);
			//tail
			var geomTail = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var matTail = new THREE.MeshPhongMaterial({ color: Colors.black, shading: THREE.FlatShading });
			var tail = new THREE.Mesh(geomTail, matTail);
			tail.position.set(-40, -3, -5);
			tail.castShadow = true;
			tail.receiveShadow = true;
			tail.scale.set(0.2, 0.2, 0.05);
			this.mesh.add(tail);
			// Create the R lower wing
			geomCondorRightWing = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			matCondorRightWing = new THREE.MeshPhongMaterial({ color: Colors.black, shading: THREE.FlatShading });
			this.condorRightWing = new THREE.Mesh(geomCondorRightWing, matCondorRightWing);
			this.condorRightWing.position.set(-9, -1, 14);
			this.condorRightWing.rotation.set(0, 0, 0);
			this.condorRightWing.castShadow = true;
			this.condorRightWing.receiveShadow = true;
			this.condorRightWing.scale.set(0.5, 0.3, 0.2);
			this.mesh.add(this.condorRightWing);
			// Create the L lower wing
			geomCondorLeftWing = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			matCondorLeftWing = new THREE.MeshPhongMaterial({ color: Colors.black, shading: THREE.FlatShading });
			this.condorLeftWing = new THREE.Mesh(geomCondorLeftWing, matCondorLeftWing);
			this.condorLeftWing.position.set(-9, 6, -14);
			this.condorLeftWing.rotation.set(59.7, 0, 0);
			this.condorLeftWing.castShadow = true;
			this.condorLeftWing.receiveShadow = true;
			this.condorLeftWing.scale.set(0.5, 0.3, 0.2);
			this.mesh.add(this.condorLeftWing);
			//create eyes
			var geomCondorEye1 = new THREE.BoxGeometry(4, 3, 3, 1, 1, 1);
			var matCondorEye1 = new THREE.MeshPhongMaterial({ color: Colors.black, shading: THREE.FlatShading });
			var condorEye1 = new THREE.Mesh(geomCondorEye1, matCondorEye1);
			condorEye1.position.set(33, 0, 4);
			condorEye1.castShadow = true;
			condorEye1.receiveShadow = true;
			this.mesh.add(condorEye1);

			var geomCondorEye2 = new THREE.BoxGeometry(4, 3, 3, 1, 1, 1);
			var matCondorEye2 = new THREE.MeshPhongMaterial({ color: Colors.black, shading: THREE.FlatShading });
			var condorEye2 = new THREE.Mesh(geomCondorEye2, matCondorEye2);
			condorEye2.position.set(32, 0, -4);
			condorEye2.castShadow = true;
			condorEye2.receiveShadow = true;
			this.mesh.add(condorEye2);
			//create duck legs
			var geomRightLeg = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var matRightLeg = new THREE.MeshPhongMaterial({ color: Colors.orange, shading: THREE.FlatShading });
			var rightLeg = new THREE.Mesh(geomRightLeg, matRightLeg);
			rightLeg.position.set(-15, 11, 4);
			rightLeg.rotation.set(0, 0, 2.4);
			rightLeg.castShadow = true;
			rightLeg.receiveShadow = true;
			rightLeg.scale.set(0.2, 0.1, 0.05);

			this.mesh.add(rightLeg);
			var geomLeftLeg = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var matLeftLeg = new THREE.MeshPhongMaterial({ color: Colors.orange, shading: THREE.FlatShading });
			var leftLeg = new THREE.Mesh(geomLeftLeg, matLeftLeg);
			leftLeg.position.set(-15, 11, -8);
			leftLeg.rotation.set(0, 0, 2.4);
			leftLeg.castShadow = true;
			leftLeg.receiveShadow = true;
			leftLeg.scale.set(0.2, 0.1, 0.05);
			this.mesh.add(leftLeg);
		}
	}

	class Duck {
		constructor() {
			this.alive = true;
			this.upperBound = 0;
			this.lowerBound = 0;
			this.mesh = new THREE.Object3D();
			// Create the body
			//number of points on the curve, default 12
			const length = 30, width = 20;
			const shape = new THREE.Shape();
			shape.moveTo(0, 0);
			shape.lineTo(0, width);
			shape.lineTo(length, width);
			shape.lineTo(length, 0);
			shape.lineTo(0, 0);
			const extrudeSettings = {
				steps: 2,
				depth: 50,
				bevelEnabled: true,
				bevelThickness: 55,
				bevelSize: 4,
				bevelOffset: 2,
				bevelSegments: 2 //Number of bevel layers. Default is 3.
			};
			var geomBody = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var matBody = new THREE.MeshPhongMaterial({ color: Colors.sienna, shading: THREE.FlatShading });
			var body = new THREE.Mesh(geomBody, matBody);
			body.position.set(-20, -6, 10);
			body.rotation.set(0, 1.5, 0);
			body.castShadow = true;
			body.receiveShadow = true;
			body.scale.set(0.7, 0.7, 0.25);
			this.mesh.add(body);
			//white part 
			var geomBody2 = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var matBody2 = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
			var body2 = new THREE.Mesh(geomBody2, matBody2);
			body2.position.set(-20, 3.6, 10);
			body2.rotation.set(0, 1.5, 0);
			body2.castShadow = true;
			body2.receiveShadow = true;
			body2.scale.set(0.7, 0.3, 0.25);
			this.mesh.add(body2);
			//create the white neck
			var geomNeck = new THREE.CylinderGeometry(5, 5, 5, 32);
			var matNeck = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
			var neck = new THREE.Mesh(geomNeck, matNeck);
			neck.rotation.z = 30;
			neck.position.x = 22;
			neck.castShadow = true;
			neck.receiveShadow = true;
			this.mesh.add(neck);
			// Create the face and neck
			var geomFace = new THREE.CylinderGeometry(5, 5, 20, 32);
			var matFace = new THREE.MeshPhongMaterial({ color: Colors.seagreen, shading: THREE.FlatShading });
			var face = new THREE.Mesh(geomFace, matFace);
			face.rotation.z = 30;
			face.position.x = 34;
			face.position.y = 2;
			face.castShadow = true;
			face.receiveShadow = true;
			this.mesh.add(face);
			// Create the beak
			var geomBeak = new THREE.CylinderGeometry(0, 5, 10, 10);
			var matBeak = new THREE.MeshPhongMaterial({ color: Colors.orange, shading: THREE.FlatShading });
			var beak = new THREE.Mesh(geomBeak, matBeak);
			beak.position.set(47, 4, -1);
			beak.rotation.set(5, 0, 250);
			beak.castShadow = true;
			beak.receiveShadow = true;
			this.mesh.add(beak);
			//tail
			var geomTail = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var matTail = new THREE.MeshPhongMaterial({ color: Colors.sienna, shading: THREE.FlatShading });
			var tail = new THREE.Mesh(geomTail, matTail);
			tail.position.set(-40, -3, -5);
			tail.castShadow = true;
			tail.receiveShadow = true;
			tail.scale.set(0.2, 0.2, 0.05);
			this.mesh.add(tail);

			geomDuckRightLowerWing = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			matDuckRightLowerWing = new THREE.MeshPhongMaterial({ color: Colors.sienna, shading: THREE.FlatShading });
			this.duckRightWing = new THREE.Mesh(geomDuckRightLowerWing, matDuckRightLowerWing);
			this.duckRightWing.position.set(-9, -1, 14);
			this.duckRightWing.rotation.set(0, 0, 0);
			this.duckRightWing.castShadow = true;
			this.duckRightWing.receiveShadow = true;
			this.duckRightWing.scale.set(0.5, 0.2, 0.3);
			this.mesh.add(this.duckRightWing);

			geomDuckLeftWing = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			matDuckLeftWing = new THREE.MeshPhongMaterial({ color: Colors.sienna, shading: THREE.FlatShading });
			this.duckLeftWing = new THREE.Mesh(geomDuckLeftWing, matDuckLeftWing);
			this.duckLeftWing.position.set(-9, 0, -14);
			this.duckLeftWing.rotation.set(59.7, 0, 0);
			this.duckLeftWing.castShadow = true;
			this.duckLeftWing.receiveShadow = true;
			this.duckLeftWing.scale.set(0.5, 0.2, 0.3);
			this.mesh.add(this.duckLeftWing);
			//create eyes
			var geomDuckEye1 = new THREE.BoxGeometry(3, 3, 3, 1, 1, 1);
			var matDuckEye1 = new THREE.MeshPhongMaterial({ color: Colors.black, shading: THREE.FlatShading });
			var duckEye1 = new THREE.Mesh(geomDuckEye1, matDuckEye1);
			duckEye1.position.set(40, 2, 4);
			duckEye1.castShadow = true;
			duckEye1.receiveShadow = true;
			this.mesh.add(duckEye1);

			var geomDuckEye2 = new THREE.BoxGeometry(3, 3, 3, 1, 1, 1);
			var matDuckEye2 = new THREE.MeshPhongMaterial({ color: Colors.black, shading: THREE.FlatShading });
			var duckEye2 = new THREE.Mesh(geomDuckEye2, matDuckEye2);
			duckEye2.position.set(40, 2, -4);
			duckEye2.castShadow = true;
			duckEye2.receiveShadow = true;
			this.mesh.add(duckEye2);
			//create duck legs
			var geomRightLeg = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var matRightLeg = new THREE.MeshPhongMaterial({ color: Colors.orange, shading: THREE.FlatShading });
			var rightLeg = new THREE.Mesh(geomRightLeg, matRightLeg);
			rightLeg.position.set(-15, 11, 4);
			rightLeg.rotation.set(0, 0, 2.4);
			rightLeg.castShadow = true;
			rightLeg.receiveShadow = true;
			rightLeg.scale.set(0.2, 0.1, 0.05);
			this.mesh.add(rightLeg);

			var geomLeftLeg = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var matLeftLeg = new THREE.MeshPhongMaterial({ color: Colors.orange, shading: THREE.FlatShading });
			var leftLeg = new THREE.Mesh(geomLeftLeg, matLeftLeg);
			leftLeg.position.set(-15, 11, -8);
			leftLeg.rotation.set(0, 0, 2.4);
			leftLeg.castShadow = true;
			leftLeg.receiveShadow = true;
			leftLeg.scale.set(0.2, 0.1, 0.05);
			this.mesh.add(leftLeg);
		}
	}

	class Ship {
		constructor() {
			this.alive= true;
			this.mesh = new THREE.Object3D();	
			//top
			var pointsTop = [];
			for ( let i = 0; i < 20; i ++ ) {
				pointsTop.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );
			}
			var geometryTop = new THREE.LatheGeometry(pointsTop);
			var materialTop = new THREE.MeshBasicMaterial( { color: 0xB3E5FF, transparent:true, opacity:.99, shading:THREE.FlatShading } );
			var latheTop = new THREE.Mesh( geometryTop, materialTop );
			latheTop.position.set(0, 6, 0);
			latheTop.rotation.set(0, 1, 0);
			latheTop.castShadow = true;
			latheTop.receiveShadow = true;
			latheTop.scale.set(0.6, 0.6, 0.6);
			latheTop.rotation.z = Math.PI;	
			this.mesh.add(latheTop);
			
			//bottom
			var geometryTop = new THREE.SphereGeometry( 7, 32, 32 );
			var materialTop = new THREE.MeshBasicMaterial( {color: Colors.orange} );
			var sphere = new THREE.Mesh( geometryTop, materialTop );
			sphere.position.set(0, 5, 0);
			sphere.rotation.set(0, 0, 0);
			sphere.castShadow = true;
			sphere.receiveShadow = true;
			sphere.scale.set(1, 1, 1);
			sphere.rotation.z = Math.PI;	
			this.mesh.add( sphere );
		
			//body
			var geometryBody = new THREE.TorusGeometry( 10, 4, 16, 100 );
			var materialBody = new THREE.MeshBasicMaterial( { color: 0x8C8C8C, transparent:false, opacity:.8, shading:THREE.FlatShading } );
			var body = new THREE.Mesh(geometryBody, materialBody);
			body.position.set(0, 4, 0);
			body.rotation.set(1.5, 0, 0);
			body.castShadow = true;
			body.receiveShadow = true;
			body.scale.set(1, 1, 1);
			//body.rotation.z = Math.PI;	
			this.mesh.add(body);
		}
	}
	var animal;
	// create nAnimals and pushes in animalsArray
	for(var i=0; i < game.nAnimals;){
		for(var j=0; j<game.spawnPerStep; j++){
			if(game.scenario == 0){
				animal = new Condor();
				animal.mesh.scale.set(0.35,0.35,0.35);
			}
			else if(game.scenario == 1){
				animal = new Duck();
				animal.mesh.scale.set(0.25,0.25,0.25);
			}
			else {
				animal = new Ship();
				animal.mesh.scale.set(0.9,0.75,0.9);
			}
			animal.name = "animal" + i;	
			// position on Y
			var baseLine = 30;
			var redline = baseLine + 180 / game.spawnPerStep * (j+1);
			var yellowline = redline - 180/(2*game.spawnPerStep);
			animal.mesh.position.y = yellowline + (180/game.spawnPerStep) * (Math.random() - 0.5);
			animal.upperBound = animal.mesh.position.y + 15;
			animal.lowerBound = animal.mesh.position.y - 15;
			animal.mesh.position.x = 300; // handle with spawn speed
			animal.mesh.rotation.z = Math.PI;
			game.animalsArray.push(animal);
		}
		i += game.spawnPerStep


		
	}

	var aux = 0;
	var howManyAnimalsPerStep = Math.round(game.spawnPerStep * Math.random() + 1);
	for(var i=0; i<n;){ // deve ciclare su tutto l'animalsArray
		if(howManyAnimalsPerStep + i > n){
			for(var k=aux; k<n; k++){
				game.animalsArray[k].mesh.position.x += game.step * game.stepLength 
														- (game.stepLength * rand * 0.8) 
														+ (game.stepLength * (1 - rand) * 0.2);
			}
			break;
		} 
		for(var j=i; j < howManyAnimalsPerStep + i; j++){
			var rand = Math.random();
			game.animalsArray[j].mesh.position.x += game.step * game.stepLength 
													- (game.stepLength * rand * 0.8) 
													+ (game.stepLength * (1 - rand) * 0.2);
		}
		i+= howManyAnimalsPerStep;
		howManyAnimalsPerStep = Math.round(game.spawnPerStep * Math.random() + 1);
		game.step++;
		aux = i;
	}

	// adding animals to the scene
	for(var i=0; i<n; i++) scene.add(game.animalsArray[i].mesh);
}

function handleAnimalsOnScene(){

	for(var i=0; i<game.nAnimals; i++){
		if(game.animalsArray[i].mesh.position.x < -300){
			
			game.animalsRemoved++;
			scene.remove(game.animalsArray[i].mesh);

			// x position
			var rand = Math.random();
			game.animalsArray[i].mesh.position.x += game.step * game.stepLength 
														- (game.stepLength * rand * 0.8) 
														+ (game.stepLength * (1 - rand) * 0.2);

			// y position
			// game.animalsArray[i].mesh.position.y = 60 + Math.random()*140;

			var j = game.animalsRemoved % game.spawnPerStep;
			// position on Y
			var baseLine = 30;
			var redline = baseLine + 180 / game.spawnPerStep * (j+1);
			var yellowline = redline - 180/(2*game.spawnPerStep);
			game.animalsArray[i].mesh.position.y = yellowline + (180/game.spawnPerStep) *(Math.random() - 0.5);

			game.animalsArray[i].alive = true;
			scene.add(game.animalsArray[i].mesh);
		}	
	}
}

function backgroundMovement(){
	if(game.airplaneXpos >= 0){
		// game.level is used to increase background rotation speed along with levels
		currentscenario.mesh.rotation.z += .005 + game.airplaneXpos*0.00004 + game.level * 0.0005; 
		currentSky.mesh.rotation.z += 0.0005 + game.airplaneXpos*0.000002 + game.level * 0.0005;
	}
	else {
		currentscenario.mesh.rotation.z += .005 + game.airplaneXpos*0.000008 + game.level * 0.0005;
		currentSky.mesh.rotation.z += 0.0005 + game.airplaneXpos*0.0000008 + game.level * 0.0005;
	}
}

function handleAirplaneMovement(){
	backgroundMovement();
	// movements of propellers (don't affect airplane position)
	airplane.propeller1.rotation.x += 0.5 + game.airplaneXpos*0.0005;
	airplane.propeller2.rotation.x += 0.5 + game.airplaneXpos*0.0005;
}

function updateLevel(){
	fieldLevel.innerHTML = game.level;
	if(game.distance / 500 > game.level){
		game.level++;
		if(game.stepLength > 90) game.stepLength -= game.stepLength/10;
		if(game.animalsSpeed < 2.5) game.animalsSpeed += game.animalsSpeed/10;
		if(game.bonusLifeSpeed < 2.5 ) game.bonusLifeSpeed += game.bonusLifeSpeed/20;
		if(game.level % 3 == 0 && game.spawnPerStep < 4) game.spawnPerStep++;
		initDeltaSpeed();
		game.bonusLife.resetAvailability();
	}
}

function updateDistance(){
	game.airplaneXpos = airplane.mesh.position.x;
	var aux;
	aux = 0.1 + (game.airplaneXpos + 200)/1000;
	game.distance += aux;
	fieldDistance.innerHTML = Math.floor(game.distance);
}

/********************************** DETECT COLLISION ************************************************************/
function detectCollision(){
	var n = game.nAnimals;
	var animals = game.animalsArray;
	var airplaneBox = new THREE.Box3().setFromObject(airplane.mesh);
	var bonusLifeBox = new THREE.Box3().setFromObject(game.bonusLife.mesh);
	var bonusLifeCollision = airplaneBox.intersectsBox(bonusLifeBox);

	for(var i=0; i<n; i++){
		var animalBox = new THREE.Box3().setFromObject(animals[i].mesh);
		var animalCollision = airplaneBox.intersectsBox(animalBox);

		if(animalCollision && animals[i].alive){
			animals[i].alive = false;
			getMalus(animals[i]);
			if(game.started && game.audioOn) {
				// audio effects
				if(game.scenario == 2){
					var audioShipDeath = new Audio(document.getElementById("shipCollAudio").children[0].src);
					audioShipDeath.play()
				}
				else {
					var audioAnimalDeath = new Audio(document.getElementById("animalCollAudio").children[0].src);
					audioAnimalDeath.play()
				}	
			}
		}
		else if(bonusLifeCollision && game.bonusLife.available){
			getLife(game.bonusLife);
			if(game.audioOn){
				// audio effects
				document.getElementById("bonusLifeAudio").play();
			}
			game.bonusLife.available = false;
			//scene.remove(game.bonusLife.mesh); // explosion animation to add
			game.bonusLife.resetPosition();
			scene.add(game.bonusLife.mesh);
			getBonus();
		}
	}
}

function getBonus(){
	if(game.lives < 3){
		game.lives++;
		document.getElementById("h"+game.lives).style.display = "";
	}
}

function getMalus(anim){
	createAnimalParticles();
	animalParticles.mesh.position.copy(anim.mesh.position);
	animalParticles.mesh.visible = true;
	animalParticles.explose()
	scene.remove(anim.mesh)	
	if(!invincible){
		invincible = true;
		document.getElementById("h"+game.lives).style.display = "none";
		game.lives--;
		if(game.lives <= 0){
			gameOver();
			return;
		}
		airplane.mesh.visible = false;
		invincible = true;
		timerInv  = Timer(invFalse, 3000);
		timerVis = Timer(swapVisibilityAp, 100);
	}
}
//swap functions for handling "lazy" change of attributes: invincible and visible
function invFalse(){
	invincible = false;
	airplane.mesh.visible = true;
	timerInv = null;
}
function swapVisibilityAp(){
	airplane.mesh.visible = !airplane.mesh.visible;
	if(invincible)
		timerVis = new Timer(swapVisibilityAp, visStep)
	else{
		timerVis = null;
		airplane.mesh.visible = true;
	}
}

function gameOver(){
	if(game.audioOn){
		document.getElementById("gameOverAudio").play();
	}

	document.getElementById("gameOver").style.display = "block";
	document.getElementById("dist").style.display = "none";
	document.getElementById("health").style.display = "none";
	document.getElementById("level").style.display = "none";

	var dista = document.getElementById("dist");
	dista.style.display = "block";
	dista.style.top = "29%";
	dista.style.left = "44.8%";
	dista.style.width = WIDTH;

	if(game.maxScore < parseInt(fieldDistance.innerHTML)){
		document.getElementById("recordValue").innerHTML = fieldDistance.innerHTML;
		game.maxScore = parseInt(fieldDistance.innerHTML);
	}

	var level = document.getElementById("level");
	level.style.display = "block";
	level.style.top = "29%";
	level.style.left = "51.8%";
	level.style.width = WIDTH;


	var record = document.getElementById("record");
	record.style.display = "block";
	record.style.top = "29%";
	record.style.left = "58.8%";
	record.style.width = WIDTH;


	tweenPlane = null;
	tweenExplosion = [];
	invincible = false;
	game.started = false;
	clearScene();
}

function clearScene(){
	if(game.animalsArray.length != 0){
		for(var i=0; i<game.nAnimals; i++){
			scene.remove(game.animalsArray[i].mesh);
		}
	}
	if(animalParticles != null)
		scene.remove(animalParticles.mesh);
	scene.remove(airplane.mesh);
	scene.remove(game.bonusLife);

	game.bonusLife.resetPosition();
	game.bonusLife.available = false;
}

function backGame() {
	clearScene();

	// logic
	game.started = false;
	game.paused = false;

	document.getElementById("dist").style.display = "none";
	document.getElementById("health").style.display = "none";
	document.getElementById("level").style.display = "none";
	
	var dista = document.getElementById("dist")
	dista.style.top = "";
	dista.style.left = "";

	var level = document.getElementById("level")
	level.style.top = "";
	level.style.left = "";

	if(animalParticles)
		scene.remove(animalParticles.mesh)
	document.getElementById("record").style.display = "none";

	document.getElementById("h1").style.display = "";
	document.getElementById("h2").style.display = "";
	document.getElementById("h3").style.display = "";
	
	renderer.domElement.focus();  //airplane starts moving immediately	
}

function resetGame(){

	clearScene();
	// geometry
	game.cylinderRadius = 600;
	game.cylinderHeight = 800;

	// game
	game.lives = 3;
	//game.collisionDistanceMalus = 15;
	game.level = 1;
	game.distance = 0;
	game.nAnimals = 50;
	game.stepLength = 150; // step interval between one spawn and another (decreases with levels)
	game.animalsSpeed = 1.4; // x Axis birds speed (increases with levels)
	game.animalsArray = []; // total animals in a level
	game.spawnPerStep = 2; // depends on level
	game.step = 1;
	game.deltaSpeed = []; // depends on level
	game.airplaneXpos = 0;
	game.airplaneYpos = 120;
	game.bonusLifeSpeed = 1.6;
	game.animalsRemoved = 0;
	
	airplane.mesh.position.x = game.airplaneXpos;
	airplane.mesh.position.y = game.airplaneYpos;

	game.bonusLife.resetPosition();
	game.bonusLife.available = false;

	spawnAnimals(game.nAnimals);
	initDeltaSpeed();
	
	// logic
	game.started = true;
	game.paused = false;

	document.getElementById("dist").style.display = "block";
	document.getElementById("health").style.display = "block";
	document.getElementById("level").style.display = "block";
	
	var dista = document.getElementById("dist")
	dista.style.top = "";
	dista.style.left = "";
	//dista.style.color = "black";
	//dista.style.fontSize = "1000px";

	var level = document.getElementById("level")
	level.style.top = "";
	level.style.left = "";

	document.getElementById("record").style.display = "none";
	// record.style.top = "";
	// record.style.left = "";


	document.getElementById("h1").style.display = "";
	document.getElementById("h2").style.display = "";
	document.getElementById("h3").style.display = "";
	
	renderer.domElement.focus();  //airplane starts moving immediately
	if(animalParticles)
		scene.remove(animalParticles.mesh)
	scene.add(airplane.mesh);
	
}

function initUI(){
	fieldDistance = document.getElementById("distValue");
	fieldLevel = document.getElementById("levelValue");
	fieldRecord = document.getElementById("recordValue");

	fieldAudio = document.getElementById("audioImg");
}

class BonusLife {

	constructor(){

		this.movingUp = false;
		this.available = false;
		this.mesh = new THREE.Object3D();
		
			
		var geomHorizontal = new THREE.BoxGeometry(30,30,30);
		var matHorizontal = new THREE.MeshPhongMaterial({ color: Colors.neongreen, shading: THREE.FlatShading });
		var horizontal = new THREE.Mesh(geomHorizontal, matHorizontal);
		horizontal.position.set(-20, -6, 10);
		horizontal.rotation.set(0, 1.5, 0);
		horizontal.castShadow = true;
		horizontal.scale.set(0.16, 0.48, 0.16);
		this.mesh.add(horizontal);
	
		var geomVertical = new THREE.BoxGeometry(30,30,30);
		var matVertical = new THREE.MeshPhongMaterial({ color: Colors.neongreen, shading: THREE.FlatShading });
		var vertical = new THREE.Mesh(geomVertical, matVertical);
		vertical.position.set(-20, -6, 10);
		vertical.rotation.set(0, 1.5, 0);
		vertical.castShadow = true;
		vertical.scale.set(0.48, 0.16, 0.16);
		this.mesh.add(vertical);
	}

	rotate = function() {
		var l = this.mesh.children.length;
		for(var i=0; i<l; i++){
			var m = this.mesh.children[i];
			m.rotation.y+= 0.03;
		}
	}

	resetAvailability = function(){
		this.available = true;
	}

	resetPosition = function(){
		this.mesh.position.y = 40 + Math.random()*160;
		this.mesh.position.x = 400;
	}


	handleOnScene = function() {
		if(this.available == true){
			if(this.mesh.position.x > -300){
				this.rotate();
				this.mesh.position.x -= game.bonusLifeSpeed; // is increased in updateLevel
				
				if(this.movingUp == true){
					this.mesh.position.y += 1.0;
					if(this.mesh.position.y > 200){
						this.movingUp = false;
					}
				}
				else {
					this.mesh.position.y -= 1.0;
					if(this.mesh.position.y < 40){
						this.movingUp = true;
					}
				}
			}
			else {
				this.available = false;
				this.resetPosition();
				return;
			}
		}
		
	}

} 

function createBonusLife(){
	game.bonusLife = new BonusLife();
	game.bonusLife.mesh.name = "bonusLife";
	game.bonusLife.mesh.position.y = 60 + Math.random()*140;
	game.bonusLife.mesh.position.x = 300;
    scene.add(game.bonusLife.mesh);
}

/************************************************ PARTICLE ESPLOSION ************************************************************/
LifeParticles = function(){
	this.mesh = new THREE.Group();
	var particleGeom = new THREE.CubeGeometry(5,5,5,1);
	this.parts = [];

	for (var i=0; i<10; i++){
		var partGreen = new THREE.Mesh(particleGeom, greenMat);
		partGreen.scale.set(.5,.5,.5);
		this.parts.push(partGreen);
		this.mesh.add(partGreen);
	}
}
  
LifeParticles.prototype.explose = function(){
	var explosionSpeed = .5;
	for(var i=0; i<this.parts.length; i++){
		var tx = -50 + Math.random()*100;
		var ty = -50 + Math.random()*100;
		var tz = -50 + Math.random()*100;
		var p = this.parts[i];
		p.position.set(0,0,0);
		p.scale.set(1,1,1);
		p.visible = true;
		var s = explosionSpeed + Math.random()*.5;
		TweenMax.to(p.position, s,{x:tx, y:ty, z:tz, ease:Power4.easeOut});
		TweenMax.to(p.scale, s,{x:.01, y:.01, z:.01, ease:Power4.easeOut, onComplete:removeParticle, onCompleteParams:[p]});
	}
}

function removeParticle(p){
	p.visible = false;
}

function createLifeParticles(){
  lifeParticles = new LifeParticles();
  lifeParticles.mesh.visible = false;
  scene.add(lifeParticles.mesh);  
}

function getLife(life){
	lifeParticles.mesh.position.copy(life.mesh.position);
	lifeParticles.mesh.visible = true;
	lifeParticles.explose();
	scene.remove(life.mesh)
}

AnimalParticles = function(){
	this.mesh = new THREE.Group();
	var bigParticleGeom = new THREE.CubeGeometry(5,5,5,1);
	var mediumParticleGeom = new THREE.CubeGeometry(3,3,3,1);
	var smallParticleGeom = new THREE.CubeGeometry(2,2,2,1);
	this.parts = [];
	var part1, part2, part3;
	switch(game.scenario){
		case 0:
			var bigParticleGeom = new THREE.CubeGeometry(8,8,8,1);
			var mediumParticleGeom = new THREE.CubeGeometry(5,5,5,1);
			var smallParticleGeom = new THREE.CubeGeometry(3,3,3,1);
			for (var i=0; i<15; i++){
				part1 = new THREE.Mesh(bigParticleGeom, blackMat);
				part2 = new THREE.Mesh(mediumParticleGeom, witheMat);
				part3 = new THREE.Mesh(smallParticleGeom, orangeMat);
				part2.scale.set(.3,.3,.3);
				part3.scale.set(.1,.1,.1);
				this.parts.push(part1);
				this.parts.push(part2);
				this.parts.push(part3);
				this.mesh.add(part1);
				this.mesh.add(part2);
				this.mesh.add(part3);
			}
			break;
		case 1:
			for (var i=0; i<15; i++){
				var bigParticleGeom = new THREE.CubeGeometry(4,4,4,1);
				var mediumParticleGeom = new THREE.CubeGeometry(2,2,2,1);
				var smallParticleGeom = new THREE.CubeGeometry(1,1,2,1);
				part1 = new THREE.Mesh(bigParticleGeom, sienaMat);
				part2 = new THREE.Mesh(mediumParticleGeom, witheMat);
				part3 = new THREE.Mesh(smallParticleGeom, orangeMat);
				this.parts.push(part1);
				this.parts.push(part2);
				this.parts.push(part3);
				this.mesh.add(part1);
				this.mesh.add(part2);
				this.mesh.add(part3);
			}
			break;
		case 2:
			for (var i=0; i<15; i++){
				var bigParticleGeom = new THREE.CubeGeometry(8,8,8,1);
				var mediumParticleGeom = new THREE.CubeGeometry(5,5,5,1);
				var smallParticleGeom = new THREE.CubeGeometry(3,3,3,1);
				part1 = new THREE.Mesh(bigParticleGeom, columbiaMat);
				part2 = new THREE.Mesh(mediumParticleGeom, greyMat);
				part3 = new THREE.Mesh(smallParticleGeom, orangeMat);
				this.parts.push(part1);
				this.parts.push(part2);
				this.parts.push(part3);
				this.mesh.add(part1);
				this.mesh.add(part2);
				this.mesh.add(part3);
			}
			break;
		default:
			break;
	}
}
  
AnimalParticles.prototype.explose = function(){
	var explosionSpeed = .5;
	for(var i=0; i<this.parts.length; i++){
		var tx = -50 + Math.random()*100;
		var ty = -50 + Math.random()*100;
		var tz = -50 + Math.random()*100;
		var p = this.parts[i];
		p.position.set(0,0,0);
		p.scale.set(1,1,1);
		p.visible = true;
		var s = explosionSpeed + Math.random()*.5;
		tweenExplosion.push(TweenMax.to(p.position, s,{x:tx, y:ty, z:tz, ease:Power4.easeOut}));
		tweenExplosion.push(TweenMax.to(p.scale, s,{x:.01, y:.01, z:.01, ease:Power4.easeOut, onComplete:removeParticle, onCompleteParams:[p]}));
	}
}

function removeParticle(p){
	p.visible = false;
}

function createAnimalParticles(){
  animalParticles = new AnimalParticles();
  animalParticles.mesh.visible = false;
  scene.add(animalParticles.mesh);  
}

/*********************************************************** CLOCK OBJECT *******************************************************/
//it is implemented in order to handle plane flashy effect during invincibility
Timer = function(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= Date.now() - start;
    };

    this.resume = function() {
        start = Date.now();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
    };

    this.resume();
};
/*********************************************************	SUPPORT FUNCTION ****************************************************/
function moveWing(an){
	var lb = an.lowerBound;
	var ub = an.upperBound;
	if(game.scenario == 0){
		var con = an;
		var lb = con.lowerBound;
		var ub = con.upperBound;
		if(con.condorLeftWing.rotation.x > 54 && con.condorLeftWing.rotation.x < 59.4){ // pushing down wing
			con.condorLeftWing.rotation.x += 0.9;
			if(con.mesh.position.y < ub)
				con.mesh.position.y += 2.4
		}
		if(con.condorLeftWing.rotation.x <= 54 || con.condorLeftWing.rotation.x >= 59.4){ // rising up
			con.condorLeftWing.rotation.x -= 0.02;
			if(con.mesh.position.y > lb)
				con.mesh.position.y -= 0.1
		}
		if(con.condorRightWing.rotation.x <= -5|| con.condorRightWing.rotation.x >= 0.3){ 
			con.condorRightWing.rotation.x -= 0.9;
		}
		if(con.condorRightWing.rotation.x > -5 && con.condorRightWing.rotation.x < 0.3){
			con.condorRightWing.rotation.x += 0.02;
		}
	}else if(game.scenario == 1){
		var duc = an;
		
		if(duc.duckLeftWing.rotation.x > 54 && duc.duckLeftWing.rotation.x < 59.4){
			duc.duckLeftWing.rotation.x += 0.7 ;
			if(duc.mesh.position.y < ub)
				duc.mesh.position.y += 2
		}
		if(duc.duckLeftWing.rotation.x <= 54 || duc.duckLeftWing.rotation.x >= 59){
			duc.duckLeftWing.rotation.x -= 0.02;
			if(duc.mesh.position.y > lb)
				duc.mesh.position.y -= 0.08
		}
		if(duc.duckRightWing.rotation.x <= -5|| duc.duckRightWing.rotation.x >= 0.3){
			duc.duckRightWing.rotation.x -= 0.7;
		}
		if(duc.duckRightWing.rotation.x > -5 && duc.duckRightWing.rotation.x < 0.3){
			duc.duckRightWing.rotation.x += 0.02;
		}
	}else {
		var shi = an;
		shi.mesh.rotation.y += Math.random()*.1 ;
	}
	timeoutsWings.pop();
}

