/*************************************************************
 3D Graphics Programming
 Module 6
 by Henri Viitanen

 Based on:
 Custom particle system example.
 (c) anssi.grohn at karelia.fi 2013-2015.
*************************************************************/

// Parameters
var width = 800,
	height = 600
viewAngle = 45,
	aspect = width / height,
	near = 0.1,
	far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

var mouse = {
	down: false,
	prevY: 0,
	prevX: 0
}

var camObject = null;
var keysPressed = [];
var ruins = [];

var fps = {
	width: 100,
	height: 50,
	svg: null,
	data: [],
	ticks: 0,
	time: null
}
var spotLight = null;
var spotLightObj = null;
var ambientLight = null;
var smokeParticleSystem = null;
var fireParticleSystem = null;
var clouds = null;
// for easier conversion
function colorToVec4(color) {
	var res = new THREE.Vector4(color.r, color.g, color.b, color.a);
	return res;
}

function colorToVec3(color) {
	var res = new THREE.Vector3(color.r, color.g, color.b);
	return res;
}

$(function() {

	// get div element
	var ctx = $("#main");
	// create WebGL-based renderer for our content.
	renderer = new THREE.WebGLRenderer();

	// create camera
	camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);

	// create scene
	scene = new THREE.Scene();
	camObject = new THREE.Object3D();
	camObject.add(camera);
	spotLightObj = new THREE.Object3D();
	spotLightObj.position.z = 0.1;
	camera.add(spotLightObj);

	// add camera to scene and set its position.
	scene.add(camObject);
	camObject.position.z = 5;
	camObject.position.y = 1.0;
	// define renderer viewport size
	renderer.setSize(width, height);

	// add generated canvas element to HTML page
	ctx.append(renderer.domElement);

	// directional light for the moon
	var directionalLight = new THREE.DirectionalLight(0x88aaff, 1.0);
	directionalLight.position.set(1, 1, -1);

	scene.add(directionalLight);

	// Add ambient light, simulating surround scattering light
	ambientLight = new THREE.AmbientLight(0x282a2f);
	scene.add(ambientLight);


	scene.fog = new THREE.Fog(0x172747, 1.0, 50.0);
	// Add our flashlight
	var distance = 6.0;
	var intensity = 2.0;
	spotLight = new THREE.SpotLight(0xffffff,
		intensity,
		distance);
	spotLight.castShadow = false;
	spotLight.position = new THREE.Vector3(0, 0, 1);
	spotLight.target = spotLightObj;
	spotLight.exponent = 488.1;
	spotLight.angle = 0.21;
	scene.add(spotLight);

	// create cube  material
	var material =
		new THREE.MeshBasicMaterial({
			color: 0xFFFFFF,

		});

	var loader = new THREE.JSONLoader();
	// Create ground from cube and some rock
	var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");

	// texture wrapping mode set as repeating
	rockTexture.wrapS = THREE.RepeatWrapping;
	rockTexture.wrapT = THREE.RepeatWrapping;
	customLamberShader = new THREE.ShaderMaterial({
		vertexShader: $("#light-vs").text(),
		fragmentShader: $("#light-fs").text(),
		transparent: false,
		uniforms: {
			map: {
				type: 't',
				value: rockTexture
			},
			"dirlight.diffuse": {
				type: 'v4',
				value: colorToVec4(directionalLight.color)
			},
			"dirlight.pos": {
				type: 'v3',
				value: directionalLight.position
			},
			"dirlight.ambient": {
				type: 'v4',
				value: new THREE.Vector4(0, 0, 0, 1.0) /* ambient value in light */
			},
			"dirlight.specular": {
				type: 'v4',
				value: new THREE.Vector4(0, 0, 0, 1)
			},
			"spotlight.diffuse": {
				type: 'v4',
				value: new THREE.Vector4(1, 1, 0, 1)
			},
			"spotlight.distance": {
				type: 'f',
				value: distance
			},
			"spotlight.pos": {
				type: 'v3',
				value: spotLight.position
			},
			"spotlight.exponent": {
				type: 'f',
				value: spotLight.exponent
			},
			"spotlight.direction": {
				type: 'v3',
				value: new THREE.Vector3(0, 0, -1)
			},
			"spotlight.specular": {
				type: 'v4',
				value: new THREE.Vector4(1, 1, 1, 1)
			},
			"spotlight.intensity": {
				type: 'f',
				value: 2.0
			},
			"spotlight.angle": {
				type: 'f',
				value: spotLight.angle
			},
			u_ambient: {
				type: 'v4',
				value: colorToVec4(ambientLight.color) /* global ambient */
			},
			fogColor: {
				type: 'v3',
				value: colorToVec3(scene.fog.color)
			},
			fogNear: {
				type: 'f',
				value: scene.fog.near
			},
			fogFar: {
				type: 'f',
				value: scene.fog.far
			}
		}
	});

	function handler(geometry, materials) {
		var m = new THREE.Mesh(geometry, customLamberShader);
		m.renderDepth = 2000;
		ruins.push(m);
		checkIsAllLoaded();
	}

	function checkIsAllLoaded() {
		if (ruins.length == 5) {
			$.each(ruins, function(i, mesh) {
				scene.add(mesh);
				// mesh is rotated around
				mesh.rotation.x = Math.PI / 2.0;
				/*$.each( mesh.material.materials, function(i,d){
				    d.map = THREE.ImageUtils.loadTexture("rock.jpg");
				    d.transparent = true;
				});*/
			});
			// arcs
			ruins[0].position.z = 13;
			// corner
			ruins[1].position.x = 13;

			// crumbled place
			ruins[2].position.x = -13;


			ruins[3].position.z = -13;
		}
	}
	loader.load("meshes/ruins30.js", handler);
	loader.load("meshes/ruins31.js", handler);
	loader.load("meshes/ruins33.js", handler);
	loader.load("meshes/ruins34.js", handler);
	loader.load("meshes/ruins35.js", handler);

	var path = "./nightsky/nightsky_";
	var format = '.png';
	var urls = [
  path + 'west' + format, path + 'east' + format,
  path + 'up' + format, path + 'down' + format,
  path + 'north' + format, path + 'south' + format
  ];

	var reflectionCube = THREE.ImageUtils.loadTextureCube(urls);
	reflectionCube.format = THREE.RGBFormat;

	// Skybox
	var shader = THREE.ShaderLib["cube"];
	shader.uniforms["tCube"].value = reflectionCube;
	var material = new THREE.ShaderMaterial({
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		}),
		skybox = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), material);

	scene.add(skybox);

  //Clouds to skybox
	var cloudTexture = THREE.ImageUtils.loadTexture("clouds.png");

	loader.load("meshes/sky.js", function h(geometry, materials) {
		clouds = new THREE.Mesh(geometry,
			new THREE.MeshBasicMaterial({
				map: cloudTexture,
				depthTest: true,
				depthWrite: false,
				transparent: true,
				blending: THREE.NormalBlending
			}));

		scene.add(clouds);
		clouds.position.setY(0);
		clouds.scale.set(50,50,50);
	});

	// var cloudGeometry = new THREE.SphereGeometry(50, 290, 290);
	// var cloudMat = new THREE.MeshBasicMaterial({
	// 			map: cloudTexture,
	// 			depthTest: true,
	// 			depthWrite: false,
	// 			transparent: true,
	// 			blending: THREE.AdditiveBlending,
	// 			side: THREE.BackSide
	// 		});
	//
	// var clouds = new THREE.Mesh(cloudGeometry, cloudMat);
	// scene.add(clouds);

	// Construct a mesh object
	var ground = new THREE.Mesh(new THREE.BoxGeometry(100, 0.2, 100, 1, 1, 1),
		customLamberShader
		/*new THREE.MeshPhongMaterial({
		    map: rockTexture,
		    transparent: true
		})*/
	);


	// Do a little magic with vertex coordinates so ground looks more interesting
	$.each(ground.geometry.faceVertexUvs[0], function(i, d) {

		d[0] = new THREE.Vector2(0, 25);
		//d[1] = new THREE.Vector2(0,0);
		d[2] = new THREE.Vector2(25, 0);
		d[3] = new THREE.Vector2(25, 25);
	});
	ground.renderDepth = 2001;

	scene.add(ground);


	//createArm();
	// Create our improved particle system object.
	smokeParticleSystem = new CustomParticleSystem({
		maxParticles: 500,
		energyDecrement: .1,
		throughPutFactor: 20,
		material: new THREE.PointCloudMaterial({
			color: 0x222222,
			size: 2,
			map: THREE.ImageUtils.loadTexture("smoke.png"),
			transparent: true,
			blending: THREE.CustomBlending,
			blendEquation: THREE.AddEquation,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneFactor,
			depthWrite: false
		}),
		onParticleInit: function(particle) {
			// original birth position of particle.
			particle.set(0, 1, 0);
			// particle moves up
			var yVel = THREE.Math.randFloat(.6, 1);
			var xVel = THREE.Math.randFloat(-.3, .3);
			particle.velocity = new THREE.Vector3(xVel, yVel, 0);
			// particle life force
			particle.energy = 1.0;
		},
		onParticleUpdate: function(particle, delta) {
			// Add velocity per passed time in seconds
			particle.add(particle.velocity.clone().multiplyScalar(delta));
			// reduce particle energy
			particle.energy -= (smokeParticleSystem.options.energyDecrement * delta);
		}
	});
	// add Three.js particlesystem to scene.
	scene.add(smokeParticleSystem.ps);

	fireParticleSystem = new CustomParticleSystem({
		maxParticles: 100,
		energyDecrement: .2,
		throughPutFactor: 3,
		material: new THREE.PointCloudMaterial({
			color: 0xFFFFFFF,
			size: 3,
			map: THREE.ImageUtils.loadTexture("fire.png"),
			transparent: true,
			blending: THREE.CustomBlending,
			blendEquation: THREE.AddEquation,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneFactor,
			depthWrite: false
		}),
		onParticleInit: function(particle) {
			// original birth position of particle.
			particle.set(0, 0, 0);
			var yVel = THREE.Math.randFloat(.3, .5);
			var xVel = THREE.Math.randFloat(-.1, .1);
			particle.velocity = new THREE.Vector3(xVel, yVel, 0);
			// particle life force
			particle.energy = 1.0;
		},
		onParticleUpdate: function(particle, delta) {
			// Add velocity per passed time in seconds
			particle.add(particle.velocity.clone().multiplyScalar(delta));
			// reduce particle energy
			particle.energy -= (smokeParticleSystem.options.energyDecrement * delta);
		}
	});
	// add Three.js particlesystem to scene.
	scene.add(fireParticleSystem.ps);

	fps.time = new Date();
	// request frame update and call update-function once it comes
	requestAnimationFrame(update);

	////////////////////
	// Setup simple input handling with mouse
	document.onmousedown = function(ev) {
		mouse.down = true;
		mouse.prevY = ev.pageY;
		mouse.prevX = ev.pageX;
	}

	document.onmouseup = function(ev) {
		mouse.down = false;
	}

	document.onmousemove = function(ev) {
			if (mouse.down) {

				var rot = (ev.pageY - mouse.prevY) * 0.01;
				var rotY = (ev.pageX - mouse.prevX) * 0.01;

				camObject.rotation.y -= rotY;
				camera.rotation.x -= rot;

				mouse.prevY = ev.pageY;
				mouse.prevX = ev.pageX;
			}
		}
	////////////////////
	// setup input handling with keypresses
	document.onkeydown = function(event) {
		keysPressed[event.keyCode] = true;
	}

	document.onkeyup = function(event) {
		keysPressed[event.keyCode] = false;
	}


	// querying supported extensions
	var gl = renderer.context;
	var supported = gl.getSupportedExtensions();

	console.log("**** Supported extensions ***'");
	$.each(supported, function(i, d) {
		console.log(d);
	});
	//Create SVG element
	fps.svg = d3.select("#fps")
		.append("svg")
		.attr("width", fps.width)
		.attr("height", fps.height);

});

var angle = 0.0;
var movement = 0.0;
var moving = false;

function update() {

	// render everything
	renderer.setClearColor(0x000000, 1.0);
	renderer.clear(true);
	renderer.render(scene, camera);
	angle += 0.001;
	moving = false;
	if (keysPressed["W".charCodeAt(0)] == true) {
		var dir = new THREE.Vector3(0, 0, -1);
		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);
		camObject.translateOnAxis(dirW, 0.1);
		moving = true;
	}

	if (keysPressed["S".charCodeAt(0)] == true) {

		var dir = new THREE.Vector3(0, 0, -1);
		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);
		camObject.translateOnAxis(dirW, -0.1);
		moving = true;

	}
	if (keysPressed["A".charCodeAt(0)] == true) {
		var dir = new THREE.Vector3(-1, 0, 0);
		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);
		camObject.translateOnAxis(dirW, 0.1);
		moving = true;
	}

	if (keysPressed["D".charCodeAt(0)] == true) {

		var dir = new THREE.Vector3(-1, 0, 0);
		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);
		camObject.translateOnAxis(dirW, -0.1);
		moving = true;
	}
	// so strafing and moving back-fourth does not double the bounce
	if (moving) {
		movement += 0.1;
		camObject.position.y = Math.sin(movement * 2.30) * 0.07 + 1.2;
	}
	spotLight.position = camObject.position;
	customLamberShader.uniforms["spotlight.pos"].value = camObject.position;

	var dir = new THREE.Vector3(0, 0, -1);
	var m = new THREE.Matrix4();
	camObject.matrixWorld.extractRotation(m);
	var dirW = dir.applyMatrix4(m);

	spotLight.target.position = dirW;

	if (smokeParticleSystem != null) {
		smokeParticleSystem.update();
	}
	if (fireParticleSystem != null) {
		fireParticleSystem.update();
	}

	if (clouds)
		clouds.rotation.y += 0.001;

	// request another frame update
	requestAnimationFrame(update);

	fps.ticks++;
	var tmp = new Date();
	var diff = tmp.getTime() - fps.time.getTime();

	if (diff > 1000.0) {
		fps.data.push(fps.ticks);
		if (fps.data.length > 15) {
			fps.data.splice(0, 1);
		}
		fps.time = tmp;
		fps.ticks = 0;
		displayFPS();
	}

}

// for displaying fps meter
function displayFPS() {

	fps.svg.selectAll("rect").remove();

	fps.svg.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 100)
		.attr("height", 50)
		.attr("fill", "rgb(0,0,0)");

	fps.svg.selectAll("rect")
		.data(fps.data)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
			return (i * (2 + 1)); //Bar width of 20 plus 1 for padding
		})
		.attr("y", function(d, i) {
			return 50 - (d / 2);
		})
		.attr("width", 2)
		.attr("height", function(d, i) {
			return (d / 2);
		})
		.attr("fill", "#FFFFFF");

	fps.svg.selectAll("text").remove();
	fps.svg
		.append("text")
		.text(function() {
			return fps.data[fps.data.length - 1] + " FPS";
		})
		.attr("x", 50)
		.attr("y", 25)
		.attr("fill", "#FFFFFF");
}

var CustomParticleSystem = function(options) {
	var that = this;

	this.prevTime = new Date();
	this.particles = new THREE.Geometry();
	this.options = options;

	this.numAlive = 0;
	this.throughPut = 0.0;
	this.throughPutFactor = 0.0;
	if (options.throughPutFactor !== undefined) {
		this.throughPutFactor = options.throughPutFactor;
	}

	// add max amount of particles (vertices) to geometry
	for (var i = 0; i < this.options.maxParticles; i++) {
		this.particles.vertices.push(new THREE.Vector3());
	}

	this.ps = new THREE.PointCloud(this.particles,
		this.options.material);
	this.ps.renderDepth = 0;
	this.ps.sortParticles = false;
	this.ps.geometry.__webglParticleCount = 0;

	this.getNumParticlesAlive = function() {
		return this.numAlive;
	}
	this.setNumParticlesAlive = function(particleCount) {
		this.numAlive = particleCount;
	}
	this.getMaxParticleCount = function() {
		return this.ps.geometry.vertices.length;
	}

	this.removeDeadParticles = function() {

		var endPoint = this.getNumParticlesAlive();
		for (var p = 0; p < endPoint; p++) {
			var particle = this.ps.geometry.vertices[p];
			//console.log("remove dead particles", particle.energy);
			if (particle.energy <= 0.0) {
				// remove from array
				var tmp = this.ps.geometry.vertices.splice(p, 1);
				// append to end of array
				this.ps.geometry.vertices.push(tmp[0]);
				// vertices have shifted, no need to as far anymore
				endPoint--;
				// decrease alive count by one
				this.setNumParticlesAlive(this.getNumParticlesAlive() - 1);

			}
		}
	}

	this.init = function(particleCount) {
		var previouslyAlive = this.getNumParticlesAlive();
		var newTotal = particleCount + previouslyAlive;
		newTotal = (newTotal > this.getMaxParticleCount()) ?
			this.getMaxParticleCount() : newTotal;

		this.setNumParticlesAlive(newTotal);
		// initialize every particle
		for (var p = previouslyAlive; p < newTotal; p++) {
			this.options.onParticleInit(this.ps.geometry.vertices[p]);
		}
		this.ps.geometry.verticesNeedUpdate = true;

	}

	this.update = function() {

		var now = new Date();
		var delta = (now.getTime() - that.prevTime.getTime()) / 1000.0;

		// a quick hack to get things working.
		this.ps.geometry.__webglParticleCount = this.getNumParticlesAlive();

		// seek and destroy dead ones
		this.removeDeadParticles();

		var endPoint = this.getNumParticlesAlive();
		for (var p = 0; p < endPoint; p++) {
			var particle = this.ps.geometry.vertices[p];
			if (particle !== undefined) {
				this.options.onParticleUpdate(particle, delta);
			}
		}
		// Add new particles according to throughput factor
		that.throughPut += (that.throughPutFactor * delta);
		var howManyToCreate = Math.floor(that.throughPut);
		if (howManyToCreate > 1) {
			that.throughPut -= howManyToCreate;
			that.init(howManyToCreate);
		}
		// Changes in position need to be reflected to VBO
		this.ps.geometry.verticesNeedUpdate = true;

		that.prevTime = now;
	}
}
