//fixed colors
var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
	grey:0x696969,
	lightgrey:0xB8B8B8
};

var keyCode = {"D": 68} //da rifinire, per gestire meglio il movimento

//THREE.JS VARIABLES
//variables for the camera
var scene, camera, fieldOfView, aspectRatio, nearPlane, 
    farPlane, HEIGHT, WIDTH, renderer, container;
//variables fo the light
var hemisphereLight, shadowLight;
//object variables
var sea, cloud, sky, airplane;
//animation support variables
var posHor = 0, posVert = 0; //register the arrowkey position
//animation Array
var updateFcts	= [];
////animation variable supp
var animationOnGoing = true;
//listener "on load" of page
window.addEventListener('load', init, false);

//main function
function init() {
	// create the scene, with all its subpart
	createScene();
	// create the lights
	createLights();
	// create the objects
	createPlane();
	createSea();
	createSky();
	// animation function used for updating objects position
	var keyboard	= new THREEx.KeyboardState(renderer.domElement);
	renderer.domElement.setAttribute("tabIndex", "0");
	renderer.domElement.focus();
	updateFcts.push(function(delta, now){
		if( keyboard.pressed('left') || keyboard.pressed('a')){
			//airplane.mesh.position.x = Math.max( -160, airplane.mesh.position.x -  120 * delta);
			airplane.mesh.position.x += (Math.max(-240,  airplane.mesh.position.x - 120) - airplane.mesh.position.x)*delta;
		}else if( keyboard.pressed('right') || keyboard.pressed('d')){
			//airplane.mesh.position.x = Math.min( 160, airplane.mesh.position.x +  120 * delta);
			airplane.mesh.position.x += (Math.min(200,  airplane.mesh.position.x + 120)- airplane.mesh.position.x)*delta;
		}
		if( keyboard.pressed('e') && !animationOnGoing){
			airplane.mesh.position.z = Math.min(70,  airplane.mesh.position.z + 120 * delta);
			if(airplane.mesh.rotation.x < 1.1)
				airplane.mesh.rotation.x =  airplane.mesh.rotation.x + 2 * delta ;
		}else if( keyboard.pressed('q') && !animationOnGoing){
			airplane.mesh.position.z = Math.max(-70,  airplane.mesh.position.z - 120 * delta);	
			if(airplane.mesh.rotation.x > -1.1)
				airplane.mesh.rotation.x =  airplane.mesh.rotation.x - 2 * delta ;		
		}
		if( keyboard.pressed('w') || keyboard.pressed('up')){
			//airplane.mesh.position.y = Math.min(200,  airplane.mesh.position.y + 120 * delta);
			airplane.mesh.position.y += (Math.min(230,  airplane.mesh.position.y + 120)-airplane.mesh.position.y)*delta;
		}else if( keyboard.pressed('s') || keyboard.pressed('down')){
			airplane.mesh.position.y += (Math.max(-40,  airplane.mesh.position.y - 120)-airplane.mesh.position.y)*delta;

		}
		//DEV TOOL, IT WILL BE ELIMINATED AT RELEASE TIME
		if( keyboard.pressed('f')){
			airplane.mesh.rotation.y = airplane.mesh.rotation.y + 5 * delta;
		}else if( keyboard.pressed('g')){
			airplane.mesh.rotation.y = airplane.mesh.rotation.y - 5 * delta;		
		}
		//END DEV TOOL
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
	loop();
	renderer.render( scene, camera );
}


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
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	// Set the position of the camera
	camera.position.x = 0;
	camera.position.z = 250;
	camera.position.y = 100;
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
	//create keyboardState object
	window.addEventListener('keyup', hanldeKeyboard, false);
	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

function hanldeKeyboard(event) {
	event.preventDefault();
	var key = event.which; //read the ascii code of the pressed button
	// var coord = {x: airplane.mesh.rotation.x, y: airplane.mesh.position.y};
	// var tl = new TweenMax(airplane.mesh.rotation);
	switch(key){
		case 69:
			animationOnGoing = true;
			TweenMax.to( airplane.mesh.rotation, .5, {x: 0});
			break;
		case 81:
			animationOnGoing = true;
			TweenMax.to( airplane.mesh.rotation, .5, {x: 0});
			break;
	}
	animationOnGoing = false;
}

//loop handler
function loop(){
	// Rotate the propeller, the sea and the sky
	airplane.propeller1.rotation.x += 0.3;
	airplane.propeller2.rotation.x += 0.3;
	sea.mesh.rotation.z += .005;
	sky.mesh.rotation.z += .01;
	// render the scene
	renderer.render(scene, camera);
	// call the loop function again
	requestAnimationFrame(loop);
}

function createLights() {
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, 2)
	
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
	ambientLight = new THREE.AmbientLight(0xdc8874, .5);
	scene.add(ambientLight);
}

// First let's define a Sea object :
Sea = function(){
	
	// create the geometry (shape) of the cylinder;
	// the parameters are: 
	// radius top, radius bottom, height, number of segments on the radius, number of segments vertically
	var geom = new THREE.CylinderGeometry(600,60,400,100,10);
	
	// rotate the geometry on the x axis
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	
	// create the material 
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.blue,
		transparent:false,
		opacity:.6,
		shading:THREE.FlatShading,
	});

	// To create an object in Three.js, we have to create a mesh 
	// which is a combination of a geometry and some material
	this.mesh = new THREE.Mesh(geom, mat);

	// Allow the sea to receive shadows
	this.mesh.receiveShadow = true; 
}
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

Sky = function(){
	// Create an empty container
	this.mesh = new THREE.Object3D();
	
	// choose a number of clouds to be scattered in the sky
	this.nClouds = 40;
	
	// To distribute the clouds consistently,
	// we need to place them according to a uniform angle
	var stepAngle = Math.PI*2 / this.nClouds;
	
	// create the clouds
	for(var i=0; i<this.nClouds; i++){
		var c = new Cloud();
	 
		// set the rotation and the position of each cloud;
		// for that we use a bit of trigonometry
		var a = stepAngle*i; // this is the final angle of the cloud
		var h = 800 + Math.random()*200; // this is the distance between the center of the axis and the cloud itself

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

//object creation functions

//terrain
function createSea(){
	sea = new Sea();

	// push it a little bit at the bottom of the scene
	sea.mesh.position.y = -600;

	// add the mesh of the sea to the scene
	scene.add(sea.mesh);
}
//sky
function createSky(){
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}
//airplane
function createPlane(){ 
	airplane = new AirPlane();
	//airplane.mesh.scale.set(0.3,.125,.125);
	airplane.mesh.scale.set(.6,.25,.25);
	airplane.mesh.position.y = 120;
	scene.add(airplane.mesh);
}