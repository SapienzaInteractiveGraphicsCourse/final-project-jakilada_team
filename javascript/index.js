//fixed colors
var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
	grey:0x696969,
	lightgrey:0xB8B8B8,
	orange: 0xffa500,
	sienna:	0xa0522d,
	seagreen: 0x2e8b57,	
	black: 0x000000,
	sand: 0xf2d16b,
	gray: 0x202020,
};
//variables for the camera
var scene, camera, fieldOfView, aspectRatio, nearPlane, 
    farPlane, HEIGHT, WIDTH, renderer, container;
//variables fo the light
var hemisphereLight, shadowLight;
//support variables
var gameStart = false;
var paused = false;
var tween;
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
var sky;
var Sky;
var AirPlane;
var airplane;
var Condor;
var condor;
var SkyCondors;
var skyCondors;
var geomCondorRightWing;
var matCondorRightWing;
var condorRightWing;
var geomCondorLeftWing;    
var matCondorLeftWing;
var condorLeftWing;
//animation support variables
var posHor = 0, posVert = 0; //register the arrowkey position
//animation Array
var updateFcts	= [];
//listener "on load" of page
window.addEventListener('load', init, false);

/***************** INIT FUNCTION *************************/
function init() {
	// create the scene, objects and lights
	createScene();
	createLights();
	createDesert();
	createSky();
	
	// animation function used for updating objects position
	var keyboard	= new THREEx.KeyboardState(renderer.domElement);
	renderer.domElement.setAttribute("tabIndex", "0");
	renderer.domElement.focus();
	updateFcts.push(function(delta, now){
		if(gameStart && !paused){
			//alert(tween.isActive());
			if(keyboard.pressed('left') || keyboard.pressed('a')){
				airplane.mesh.position.x += (Math.max(-0,  airplane.mesh.position.x - 110) - airplane.mesh.position.x)*delta;
			}else if( keyboard.pressed('right') || keyboard.pressed('d')){
				airplane.mesh.position.x += (Math.min(200,  airplane.mesh.position.x + 120)- airplane.mesh.position.x)*delta;
			}
			if( keyboard.pressed('e')){
				airplane.mesh.position.z = Math.min(70,  airplane.mesh.position.z + 120 * delta);
				tween.pause()
				if(airplane.mesh.rotation.x < 1.1)
					airplane.mesh.rotation.x =  airplane.mesh.rotation.x + 2 * delta ;
			}else if( keyboard.pressed('q')){
				airplane.mesh.position.z = Math.max(-220,  airplane.mesh.position.z - 120 * delta);	
				tween.pause()
				if(airplane.mesh.rotation.x > -1.1)
					airplane.mesh.rotation.x =  airplane.mesh.rotation.x - 2 * delta ;		
			}
			if( keyboard.pressed('w') || keyboard.pressed('up')){
				airplane.mesh.position.y += (Math.min(200,  airplane.mesh.position.y + 120)-airplane.mesh.position.y)*delta;
			}else if( keyboard.pressed('s') || keyboard.pressed('down')){
				airplane.mesh.position.y += (Math.max(50,  airplane.mesh.position.y - 100)-airplane.mesh.position.y)*delta;
			}
			//DEV TOOL, IT WILL BE ELIMINATED AT RELEASE TIME
			if( keyboard.pressed('f')){
				airplane.mesh.rotation.y = airplane.mesh.rotation.y + 5 * delta;
			}else if(  keyboard.pressed('g')){
				airplane.mesh.rotation.y = airplane.mesh.rotation.y - 5 * delta;		
			}
			//END DEV TOOL
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
			updateFn(deltaMsec/1000, nowMsec/1000)
		})
	})

	/*************** START THE GAME **************/
	document.getElementById("start").onclick = function(){		
		document.getElementById("menu").hidden = true;
		gameStart = true;
		paused = false;
		createPlane();
		TweenMax.delayedCall(1, createSkyCondors());
	}

	loop();
	renderer.render( scene, camera );
}

/************************* SCENE CREATION ************************************/
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
	camera.position.x = 60;
	camera.position.z = 250;
	camera.position.y = 100;
	camera.rotation.z = -.1;
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		// Allow transparency to show the gradient background
		// we defined in the CSS
		alpha: true, 
		// Activate the anti-aliasing; it may bring poorer performances;
		antialias: true 
	});
	// Define the size of the renderer; in this case,
	// it will fill the entire screen
	renderer.setSize(WIDTH, HEIGHT);
	// Enable shadow rendering
	renderer.shadowMap.enabled = true;
	// Add the DOM element of the renderer to the 
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	//handle keyup event
	window.addEventListener('keyup', hanldeUpKeyboard, false);
	//handle keydown event
	window.addEventListener('keydown', hanldeDownKeyboard, false);
	//handle click event
	window.addEventListener('click', handleClick, false);
	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}
/*************************** WINDOW RESIZE HANDLER *********************************/
function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}
/*************************** KEYBOARD UP HANDLER *********************************/
function hanldeUpKeyboard(event) {
	event.preventDefault();
	var key = event.which;
	tween = TweenMax.to( airplane.mesh.rotation, .5, {x: 0});
	switch(key){
		case 69:
			tween;
			break;
		case 81:
			tween;
			break;
	}
}
/*************************** KEYBOARD UP HANDLER *********************************/
function handleClick(e) {
	e.preventDefault();
	var id = e.target.id;
	switch(id){
		case "howtoplay":
			document.getElementById("menuoption").style.display = "none";
			document.getElementById("howtoplay-div").style.display = "block";
			break;
		case "backhtp":
			document.getElementById("menuoption").style.display = "block";
			document.getElementById("howtoplay-div").style.display = "none";
			break;
		case "credits":
			document.getElementById("menuoption").style.display = "none";
			document.getElementById("credits-div").style.display = "block";
			break;
		case "backcdt":
			document.getElementById("menuoption").style.display = "block";
			document.getElementById("credits-div").style.display = "none";
			break;
	}
}
/*************************** KEYBOARD DOWN HANDLER *********************************/
function hanldeDownKeyboard(event) {
	event.preventDefault();
	var key = event.which;
	switch(key){
		case 77:
			if(!gameStart) break;
			if(document.getElementById("pausedspan").style.display == "block"){
				document.getElementById("pausedspan").style.display = "none";
				TweenMax.to( airplane.mesh.rotation, .5, {x: 0});
			}
			else{
				document.getElementById("pausedspan").style.display = "block";
				tween.pause();
			}
			paused = !paused;
			break;
		case 80:
			if(!gameStart) break;
			if(document.getElementById("pausedspan").style.display == "block"){
				document.getElementById("pausedspan").style.display = "none"
			}
			else
				document.getElementById("pausedspan").style.display = "block"
			paused = !paused;
			break;
	}
}
/************* LOOP HANDLER *************************************************/
function loop(){
	var pos = 0;
	if(gameStart && !paused){
		pos = Math.abs(airplane.mesh.position.x)
		skyCondors.mesh.rotation.z +=  Math.abs(.0015 + pos*0.00005);
		airplane.propeller1.rotation.x += 0.5 + pos*0.0005;
		airplane.propeller2.rotation.x += 0.5 + pos*0.0005;
	}
	// Rotate the propeller, the sea and the sky
	if(!paused){
		desert.mesh.rotation.z += .005 + pos*0.00005;
		sky.mesh.rotation.z += .0004 + pos*0.00005;
	}
	/*
	if(condorLeftWing.rotation.x > 54 && condorLeftWing.rotation.x < 59.4){
		condorLeftWing.rotation.x += 0.7;
	}
	if(condorLeftWing.rotation.x <= 54 || condorLeftWing.rotation.x >= 59){
		condorLeftWing.rotation.x -= 0.02;
	}
	if(condorRightWing.rotation.x <= -5|| condorRightWing.rotation.x >= 0.3){
		condorRightWing.rotation.x -= 0.7;
	}
	if(condorRightWing.rotation.x > -5 && condorRightWing.rotation.x < 0.3){
		condorRightWing.rotation.x += 0.02;
	}
    */
	// render the scene
	renderer.render(scene, camera);
	// call the loop function again
	requestAnimationFrame(loop);
}
//*********************LIGHT CREATIONS********************************************************/
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
// First let's define a Sea object :
Desert = function(){
	this.mesh = new THREE.Object3D();
	// create the geometry (shape) of the cylinder;
	// the parameters are: 
	// radius top, radius bottom, height, number of segments on the radius, number of segments vertically
	geom = new THREE.CylinderGeometry(600,600,800,40,10);  //FORSE DA CAMBIARE
	// rotate the geometry on the x axis
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	// create the material 
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.sand,
		shading:THREE.FlatShading,
	});
	// To create an object in Three.js, we have to create a mesh 
	// which is a combination of a geometry and some material
	this.mesh = new THREE.Mesh(geom, mat);
	// Allow the sea to receive shadows
	this.mesh.receiveShadow = true; 
	this.nCactus= 10;
	// To distribute the clouds consistently,
	// we need to place them according to a uniform angle
	var stepCactusAngle = Math.PI*2 / this.nCactus;

	// create the cactus
	for(var i=0; i<this.nCactus; i++){
		var c = new Cactus();
		// set the rotation and the position of each cloud using trigonometry
		var a = stepCactusAngle*i; // this is the final angle of the cloud
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
	desert.mesh.position.y = -600;
	scene.add(desert.mesh);
}
//cactus class ****************************************************************************************************************************************
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
function createCactus(){
	cactus = new Cactus();
	cactus.mesh.position.y = -600;
	scene.add(cactus.mesh);
}
//***************************************************************************************************************************
//Object Classes
AirPlane = function() {
	this.mesh = new THREE.Object3D();
	// Create the cabin
	// Cockpit
	var geomCockpit = new THREE.BoxGeometry(100,60,50,1,1,1);
	var matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
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
	var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var engine = new THREE.Mesh(geomEngine, matEngine);
	engine.position.x = 40;
	engine.castShadow = true;
	engine.receiveShadow = true;
	this.mesh.add(engine);	
	// Create the tail
	var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
	var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
	tailPlane.position.set(-62.7,27,0);
	tailPlane.castShadow = true;
	tailPlane.receiveShadow = true;
	this.mesh.add(tailPlane);	
	// Create the wing
	var geomSideWing = new THREE.BoxGeometry(45,15,250,1,1,1);
	var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
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
	//create guns
	var geomGun1= new THREE.BoxGeometry(10,10,10,1,1,1);
	var matGun1 = new THREE.MeshPhongMaterial({color:Colors.grey, shading:THREE.FlatShading})
	var gun1 = new THREE.Mesh(geomGun1, matGun1);
	gun1.position.set(50,-17,15);
	gun1.castShadow = true;
	gun1.receiveShadow = true;
	this.mesh.add(gun1);

	var geomGun2= new THREE.BoxGeometry(10,10,10,1,1,1);
	var matGun2 = new THREE.MeshPhongMaterial({color:Colors.grey, shading:THREE.FlatShading})
	var gun2 = new THREE.Mesh(geomGun2, matGun2);
	gun2.position.set(gun1.position.x,gun1.position.y,-gun1.position.z);
	gun2.castShadow = true;
	gun2.receiveShadow = true;
	this.mesh.add(gun2);

	var geomMgun1= new THREE.BoxGeometry(5,5,5,1,1,1);
	var mutMgun1 = new THREE.MeshPhongMaterial({color:Colors.grey, shading:THREE.FlatShading})
	var mgun1 = new THREE.Mesh(geomMgun1, mutMgun1);
	mgun1.position.set(55,-15,15);
	mgun1.castShadow = true;
	mgun1.receiveShadow = true;
	this.mesh.add(mgun1);

	var geomMgun2= new THREE.BoxGeometry(5,5,5,1,1,1);
	var mutMgun2 = new THREE.MeshPhongMaterial({color:Colors.grey, shading:THREE.FlatShading})
	var mgun2 = new THREE.Mesh(geomMgun2, mutMgun2);
	mgun2.position.set(55,-15,-15);
	mgun2.castShadow = true;
	mgun2.receiveShadow = true;
	this.mesh.add(mgun2);
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
	var wheelProtecMat = new THREE.MeshPhongMaterial({color:Colors.red,shading:THREE.FlatShading});
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
	var matEngine1 = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading})
	
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
	var matEngine2 = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading})
	
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
};
//airplane
function createPlane(){ 
	airplane = new AirPlane();
	//airplane.mesh.scale.set(0.3,.125,.125);
	airplane.mesh.scale.set(.3,.125,.125);
	airplane.mesh.position.y = 120;
	airplane.mesh.rotation.z = -.1;
	scene.add(airplane.mesh);
}
/*
Cloud = function(){
	// Create an empty container that will hold the different parts of the cloud
	this.mesh = new THREE.Object3D();
	
	// create a cube geometry;
	// this shape will be duplicated to create the cloud
	var geom = new THREE.BoxGeometry(20,20,20);
	
	// create a material; a simple white material will do the trick
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.white,  
	});
		// duplicate the geometry a random number of times
	var nBlocs = 3+Math.floor(Math.random()*3);
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
}
*/
Cloud = function(){
	// Create an empty container that will hold the different parts of the cloud
	this.mesh = new THREE.Object3D();	
	// create a cube geometry;
	// this shape will be duplicated to create the cloud
	geom = new THREE.SphereGeometry(17,32,32);
	mat = new THREE.MeshPhongMaterial({color:Colors.white, }); // create a material; a simple white material will do the trick	
	// duplicate the geometry a random number of times
	nBlocs = 5 + Math.floor(Math.random()*3);	
	//var nBlocs = 3;
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
	//momentaneamente commentato perche altrimenti non funziona il gioco
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

Sky = function(){
	// Create an empty container
	this.mesh = new THREE.Object3D();
	
	// choose a number of clouds to be scattered in the sky
	this.nClouds = 10;
	
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

function createSky(){
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}

SkyCondors= function(){
	this.mesh = new THREE.Object3D();

	//number of ducks
	this.nCondors= 15; // era 60, lo abbasso per fare le prove


	var stepAngleCondor = Math.PI*2 / this.nCondors;
	
	// create the clouds
	for(var i=0; i<this.nCondors; i++){
		var c4 = new Condor();
         
		// set the rotation and the position of each cloud using trigonometry
		var a4 = stepAngleCondor*i; // this is the final angle of the cloud
		var h4 = 600 + Math.random()*200; // this is the distance between the center of the axis and the cloud itself
		
		// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
		c4.mesh.position.y = Math.sin(a4)*h4;
		c4.mesh.position.x = Math.cos(a4)*h4;

		// rotate the condors according to its position
		c4.mesh.rotation.z = a4 + Math.PI/2;
		// for a better result, we position the clouds 
		// at random depths inside of the scene
	    //c2.mesh.position.z = -400-Math.random()*400;		
		// we also set a random scale for each cloud
		//var s2 = 1+Math.random()*2;		
		c4.mesh.scale.set(0.3,0.3,0.3);
		// do not forget to add the mesh of each cloud in the scene
		this.mesh.add(c4.mesh);
	}	
}
//create ducks on the screen
function createSkyCondors(){
	skyCondors = new SkyCondors();
	skyCondors.mesh.position.y = -600;
	scene.add(skyCondors.mesh);
}
//Condor class *************************************************************************************************
Condor = function() {	
	this.mesh = new THREE.Object3D();	
	// Create the body
	//number of points on the curve, default 12
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
	var geomBody = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	var matBody = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
	var body = new THREE.Mesh(geomBody, matBody);
	body.position.set(-20,-6,10);
	body.rotation.set(0,1.5,0);
	body.castShadow = true;
	body.receiveShadow = true;
	body.scale.set(0.5,0.7,0.25);
	this.mesh.add(body);
	//create the white neck
	var geomNeck = new THREE.CylinderGeometry(8,8,6,32);
	var matNeck= new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var neck = new THREE.Mesh(geomNeck, matNeck);
	neck.rotation.z= 30;
	neck.position.x = 22;
	neck.castShadow = true;
	neck.receiveShadow = true;
	this.mesh.add(neck);
	// Create the face
	var geomFace = new THREE.CylinderGeometry(5,5,10,32);
	var matFace= new THREE.MeshPhongMaterial({color:Colors.pink, shading:THREE.FlatShading});
	var face = new THREE.Mesh(geomFace, matFace);
	face.rotation.z= 30;
	face.position.x = 30;
	face.position.y = 2;
	face.castShadow = true;
	face.receiveShadow = true;
	this.mesh.add(face);
	// Create the beak
	var geomBeak = new THREE.CylinderGeometry(0,5,10,10);
	var matBeak= new THREE.MeshPhongMaterial({color:Colors.orange, shading:THREE.FlatShading});
	var beak = new THREE.Mesh(geomBeak, matBeak);
	beak.position.set(40,4,-1);
	beak.rotation.set(5,0,250);
	beak.castShadow = true;
	beak.receiveShadow = true;
	this.mesh.add(beak);
    //tail
	var geomTail = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	var matTail = new THREE.MeshPhongMaterial({color:Colors.black, shading:THREE.FlatShading});
	var tail = new THREE.Mesh(geomTail, matTail);
	tail.position.set(-40,-3,-5);
	tail.castShadow = true;
	tail.receiveShadow = true;
	tail.scale.set(0.2,0.2,0.05);
	this.mesh.add(tail);
	// Create the R lower wing
	/*//si puo usare solo con create duck e senza variabili globali
	var geomDuckRightLowerWing = new THREE.ExtrudeGeometry(shape, extrudeSettings);    
	var matDuckRightLowerWing = new THREE.MeshPhongMaterial({color:Colors.sienna, shading:THREE.FlatShading});
	this.duckRightLowerWing = new THREE.Mesh(geomDuckRightLowerWing, matDuckRightLowerWing);
    this.duckRightLowerWing.position.set(-9, -1, 14);
	this.duckRightLowerWing.rotation.set(0,0,0);
	this.duckRightLowerWing.castShadow = true;
	this.duckRightLowerWing.receiveShadow = true;
	this.duckRightLowerWing.scale.set(0.5,0.2,0.3);
	this.mesh.add(this.duckRightLowerWing);
	*/ 
    geomCondorRightWing = new THREE.ExtrudeGeometry(shape, extrudeSettings);    
	matCondorRightWing = new THREE.MeshPhongMaterial({color:Colors.black, shading:THREE.FlatShading});
	condorRightWing = new THREE.Mesh(geomCondorRightWing, matCondorRightWing);
    condorRightWing.position.set(-9, -1, 14);
	condorRightWing.rotation.set(0,0,0);
	condorRightWing.castShadow = true;
	condorRightWing.receiveShadow = true;
    condorRightWing.scale.set(0.5,0.3,0.3);
	this.mesh.add(condorRightWing);
	// Create the L lower wing
/*
	var geomDuckLeftWing = new THREE.ExtrudeGeometry(shape, extrudeSettings);    
	var matDuckLeftWing = new THREE.MeshPhongMaterial({color:Colors.sienna, shading:THREE.FlatShading});
	this.duckLeftWing = new THREE.Mesh(geomDuckLeftWing, matDuckLeftWing);
    this.duckLeftWing.position.set(-9, 0, -14);
	this.duckLeftWing.rotation.set(59.7,0,0);
	this.duckLeftWing.castShadow = true;
	this.duckLeftWing.receiveShadow = true;
	this.duckLeftWing.scale.set(0.5,0.2,0.3);
	this.mesh.add(this.duckLeftWing);
*/
	geomCondorLeftWing = new THREE.ExtrudeGeometry(shape, extrudeSettings);    
	matCondorLeftWing = new THREE.MeshPhongMaterial({color:Colors.black, shading:THREE.FlatShading});
	condorLeftWing = new THREE.Mesh(geomCondorLeftWing, matCondorLeftWing);
	condorLeftWing.position.set(-9, 0, -14);
	condorLeftWing.rotation.set(59.7,0,0);
	condorLeftWing.castShadow = true;
	condorLeftWing.receiveShadow = true;
	condorLeftWing.scale.set(0.5,0.3,0.3);
	this.mesh.add(condorLeftWing);
	//create eyes
    var geomCondorEye1 = new THREE.BoxGeometry(4,3,3,1,1,1);
	var matCondorEye1 = new THREE.MeshPhongMaterial({color:Colors.black, shading:THREE.FlatShading});
	var condorEye1 = new THREE.Mesh(geomCondorEye1, matCondorEye1);
	condorEye1.position.set(33,0,4);
	condorEye1.castShadow = true;
	condorEye1.receiveShadow = true;
	this.mesh.add(condorEye1);

	var geomCondorEye2 = new THREE.BoxGeometry(4,3,3,1,1,1);
	var matCondorEye2 = new THREE.MeshPhongMaterial({color:Colors.black, shading:THREE.FlatShading});
	var condorEye2 = new THREE.Mesh(geomCondorEye2, matCondorEye2);
	condorEye2.position.set(32,0,-4);
	condorEye2.castShadow = true;
	condorEye2.receiveShadow = true;
	this.mesh.add(condorEye2);
	//create duck legs
    var geomRightLeg = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	var matRightLeg = new THREE.MeshPhongMaterial({color:Colors.orange, shading:THREE.FlatShading});
	var rightLeg = new THREE.Mesh(geomRightLeg, matRightLeg);
	rightLeg.position.set(-15,11,4);
	rightLeg.rotation.set(0,0,2.4);
	rightLeg.castShadow = true;
	rightLeg.receiveShadow = true;
	rightLeg.scale.set(0.2,0.1,0.05);

	this.mesh.add(rightLeg);
	var geomLeftLeg = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	var matLeftLeg = new THREE.MeshPhongMaterial({color:Colors.orange, shading:THREE.FlatShading});
	var leftLeg = new THREE.Mesh(geomLeftLeg, matLeftLeg);
	leftLeg.position.set(-15,11,-8);
	leftLeg.rotation.set(0,0,2.4);
	leftLeg.castShadow = true;
	leftLeg.receiveShadow = true;
	leftLeg.scale.set(0.2,0.1,0.05);
	this.mesh.add(leftLeg);
};

function createCondor(){ 
	condor = new Condor();
	condor.mesh.scale.set(.25,.25,.25);
	condor.mesh.position.y = 60;
	condor.mesh.rotation.x= 41;  //era 41
	//condor.mesh.rotation.y= 20.4;  //20.4
	//condor.mesh.rotation.z= 41;
	scene.add(condor.mesh);
}
