
/*************************************************************
  3D Graphics Programming
  Blending example code with rendering order.
  (c) anssi.grohn at karelia.fi 2013
 *************************************************************/

// Parameters
var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;



$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    
    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);
    camera.position.z = 2;

    // create scene
    scene = new THREE.Scene();



    // Create ground from cube and some rock
    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");
    var fire = THREE.ImageUtils.loadTexture("fire.png");
    var plasma = THREE.ImageUtils.loadTexture("plasma.png");
    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;
    

    var plane1 = new THREE.Mesh( new THREE.PlaneGeometry(1,1), 
				 new THREE.MeshBasicMaterial({
				     map: plasma,
				     depthTest: true,
				     depthWrite: false,
				     transparent: true,
				     blending: THREE.NormalBlending
				 }));
    plane1.position.x = -0.33;
    plane1.position.z = -0.5;
    var plane2 = new THREE.Mesh( new THREE.PlaneGeometry(1,1), 
				 new THREE.MeshBasicMaterial({
				     map: plasma,
				     depthTest: true,
				     depthWrite: false,
				     transparent: true,
				     blending: THREE.NormalBlending,
				 }));

    var plane3 = new THREE.Mesh( new THREE.PlaneGeometry(1,1), 
				 new THREE.MeshBasicMaterial({
				     map: plasma,
				     depthTest: true,
				     depthWrite: false,
				     transparent: true,
				     blending: THREE.NormalBlending
				 }));
    plane3.position.x = 0.33;
    plane3.position.z = 0.5;

    scene.add(plane1);
    scene.add(plane2);
    scene.add(plane3);
    
    plane1.renderDepth = 20; 
    plane2.renderDepth = 80;  
    plane3.renderDepth = 0; 


    // request frame update and call update-function once it comes
    requestAnimationFrame(update);


});





function update(){


    var tmp = new Date();
    renderer.setClearColor(0x000000, 1.0);
    renderer.render(scene, camera);
    // request another frame update
    requestAnimationFrame(update);


    
}





