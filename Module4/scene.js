/*************************************************************
 *  3D Graphics Programming
 *
 *  Module 4 - Henri Viitanen
 *
 *************************************************************/
// Parameters
var width = 800,
  height = 600,
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

//Arm joints that are moved in animation
var shoulder = null;
var elbow = null;
var wrist = null;

$(function() {

  // get div element
  var ctx = $("#main");
  // create WebGL-based renderer for our content.
  renderer = new THREE.WebGLRenderer();

  // create camera
  camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
  camObject = new THREE.Object3D();
  // create scene
  scene = new THREE.Scene();
  // camera will be the the child of camObject
  camObject.add(camera);

  // add camera to scene and set its position.
  scene.add(camObject);
  camObject.position.z = 5;
  camObject.position.y = 1.0;

  // define renderer viewport size
  renderer.setSize(width, height);

  // add generated canvas element to HTML page
  ctx.append(renderer.domElement);


  // Create ground from cube and some rock
  var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");

  // texture wrapping mode set as repeating
  rockTexture.wrapS = THREE.RepeatWrapping;
  rockTexture.wrapT = THREE.RepeatWrapping;

  // Construct a mesh object
  var ground = new THREE.Mesh(new THREE.BoxGeometry(100, 0.2, 100, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      map: rockTexture,
      transparent: true
    }));
  // do a little magic with vertex coordinates so ground looks more intersesting.
  $.each(ground.geometry.faceVertexUvs[0], function(i, d) {
    d[0] = new THREE.Vector2(0, 25);
    d[2] = new THREE.Vector2(25, 0);
    d[3] = new THREE.Vector2(25, 25);
  });

  // add ground to scene
  scene.add(ground);

  // mesh loading functionality
  var loader = new THREE.JSONLoader();

  function handler(geometry, materials) {
    ruins.push(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      map: rockTexture,
      transparent: true
    })));
    checkIsAllLoaded();
  }

  function checkIsAllLoaded() {

      if (ruins.length == 5) {
        $.each(ruins, function(i, mesh) {
          // rotate 90 degrees
          mesh.rotation.x = Math.PI / 2;
          scene.add(mesh);
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
    // loading of meshes
  loader.load("meshes/ruins30.js", handler);
  loader.load("meshes/ruins31.js", handler);
  loader.load("meshes/ruins33.js", handler);
  loader.load("meshes/ruins34.js", handler);
  loader.load("meshes/ruins35.js", handler);

	//Create the arm object
	initArm();

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
  // var gl = renderer.context;
  // var supported = gl.getSupportedExtensions();
  //
  // console.log("**** Supported extensions ***'");
  // $.each(supported, function(i, d) {
  // 	console.log(d);
  // });


});

var angle = 0.0;

function update() {

  // render everything
  renderer.setClearColor(0x000000, 1.0);
  renderer.clear(true);
  renderer.render(scene, camera);

  if (keysPressed["W".charCodeAt(0)] == true) {
    var dir = new THREE.Vector3(0, 0, -1);
    var m = new THREE.Matrix4();
    camObject.matrixWorld.extractRotation(m);
    var dirW = dir.applyMatrix4(m);
    camObject.translateOnAxis(dirW, 0.1);
  }

  if (keysPressed["S".charCodeAt(0)] == true) {
    var dir = new THREE.Vector3(0, 0, -1);

    var m = new THREE.Matrix4();
    camObject.matrixWorld.extractRotation(m);
    var dirW = dir.applyMatrix4(m);

    camObject.translateOnAxis(dirW, -0.1);
  }
  if (keysPressed["A".charCodeAt(0)] == true) {
    var dir = new THREE.Vector3(1, 0, 0);

    var m = new THREE.Matrix4();
    camObject.matrixWorld.extractRotation(m);
    var dirW = dir.applyMatrix4(m);

    camObject.translateOnAxis(dirW, -0.1);

  }

  if (keysPressed["D".charCodeAt(0)] == true) {
    var dir = new THREE.Vector3(1, 0, 0);

    var m = new THREE.Matrix4();
    camObject.matrixWorld.extractRotation(m);
    var dirW = dir.applyMatrix4(m);

    camObject.translateOnAxis(dirW, 0.1);
  }

	// Arm animation
	angle += .005;
	if (angle > Math.PI * 2)
		angle = 0;

	shoulder.rotation.z = Math.sin(angle);
	elbow.rotation.z = -Math.cos(angle);
	wrist.rotation.x = Math.sin(angle * 4);

  // request another frame update
  requestAnimationFrame(update);
}

function initArm() {
  // Arm parent object
  var arm = new THREE.Object3D();
  scene.add(arm);

  //Shoulder sphere
  shoulder = new THREE.Mesh(new THREE.SphereGeometry(.35, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true
    }));

  shoulder.position.y = .5;
  arm.add(shoulder);

  //Upper arm cube
  var upper = new THREE.Mesh(new THREE.BoxGeometry(.25, 1, .25, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true
    }));

  upper.position.y = .75;
  shoulder.add(upper);

  //Elbow sphere
  elbow = new THREE.Mesh(new THREE.SphereGeometry(.25, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true
    }));

  elbow.position.y = .5;
  upper.add(elbow);

  //Lower arm cube
  var lower = new THREE.Mesh(new THREE.BoxGeometry(.25, 1, .25, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true
    }));

  lower.position.y = .5;
  elbow.add(lower);

	//Wrist joint
	wrist = new THREE.Object3D();
	wrist.position.y = .45;
	lower.add(wrist);

  //Hand cube
  var hand = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true
    }));

	hand.position.y = .25;
  wrist.add(hand);

  //Finger cubes
  var pinky = new THREE.Mesh(new THREE.BoxGeometry(.1, .3, .1, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x557788,
      transparent: true
    }));

  pinky.position.y = .4;
  pinky.position.x = -.2;
  hand.add(pinky);

  var ring = new THREE.Mesh(new THREE.BoxGeometry(.1, .4, .1, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x557788,
      transparent: true
    }));

  ring.position.y = .4;
  ring.position.x = -.07;
  hand.add(ring);

  var middle = new THREE.Mesh(new THREE.BoxGeometry(.1, .5, .1, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x557788,
      transparent: true
    }));

  middle.position.y = .4;
  middle.position.x = .05;
  hand.add(middle);

  var index = new THREE.Mesh(new THREE.BoxGeometry(.1, .41, .1, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x557788,
      transparent: true
    }));

  index.position.y = .4;
  index.position.x = .18;
  hand.add(index);

  var thumb = new THREE.Mesh(new THREE.BoxGeometry(.12, .3, .12, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x557788,
      transparent: true
    }));

  thumb.position.y = 0;
  thumb.position.x = .3;
  thumb.rotation.z = -Math.PI / 4;
  hand.add(thumb);
}
