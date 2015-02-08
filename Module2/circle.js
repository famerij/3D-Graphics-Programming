/*******************************************************************************
*  3D Graphics Programming
*  Module 2
*  Henri Viitanen
*******************************************************************************/

var WebGLApp = function(){

    var that = this;        // to access object itself
    this.canvas = null;     // canvas where gl context will be set
    this.gl = null;         // our WebGL context
    this.angles = null;   // vertex data buffer  (WebGL-specific)
    this.radius = null;
    this.indices = null;    // index data buffer (WebGL-specific)

    this.projMat = new THREE.Matrix4();           // projection matrix, using Three.js matrix type
    this.modelViewMat = new THREE.Matrix4();      // modelview matrix, using Three.js matrix type

    this.shaderProgram = null;                    // shader program (WebGL-specific)
    this.mode = "TRIANGLE_FAN";
    this.setMode = function( mode ){
  that.mode = mode;
    }
    /* ---------- Initialization routine ---------- */
    this.Prepare = function(canvas) {

  // get DOM element from jQuery object
  that.canvas = canvas[0]

  that.InitGL();
  that.InitData();
  that.InitShaders();

  // define screen clear color.
  that.gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // enable depth test.
  that.gl.enable(that.gl.DEPTH_TEST);

  // Draw everything.
  that.Render();

  console.log('Drawing complete');

    }

    /* ---------- WebGL context init  ---------- */
    this.InitGL = function()
    {

  try {
      // get webgl context
      that.gl = that.canvas.getContext("experimental-webgl");
      that.gl.viewportWidth = that.canvas.width;
      that.gl.viewportHeight = that.canvas.height;
      that.mode = that.gl.TRIANGLE_FAN;
  } catch(e) {
      console.log(e);
  }

  if (!that.gl) {
      console.log("Could not initialise WebGL, sorry :-(");
  } else {
      console.log("WebGL initialized ok!");

  }
    }
    /* ---------- Vertex Data Init  ---------- */
    this.InitData = function()
    {
      // create buffer for angles (WebGL-specific buffer)
      that.angles = that.gl.createBuffer();
      // bind that buffer (activate)
      that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.angles);

      // define circle radius
      that.radius = 5.0;

      // define angle data
      var verticeCount = 16; // amount of vertices in the circle
      var angle = 2 * Math.PI / verticeCount;
      var angles = [];
      for (var i = 0; i < verticeCount; i++)
      {
          angles.push(i * angle);
      }

      // copy data from angles-array into buffer
      that.gl.bufferData( that.gl.ARRAY_BUFFER,    // array
              new Float32Array(angles), // floats
              that.gl.STATIC_DRAW );   // STATIC_DRAW = hint that data does not change

      // add few helpful parameters
      that.angles.itemSize = 1;  // how many floats does a single vertex element need
      that.angles.numItems = verticeCount;  // how many angle elements exist in the buffer

      ////////////////////////////////////////////////////////////
      // Create element array buffer where we can store indices.
      that.indices = that.gl.createBuffer();
      that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, that.indices);

      var indices = [];
      for (var i = 0; i < verticeCount; i++)
      {
        indices.push(i);
      }

      // copy data into buffer
      that.gl.bufferData( that.gl.ELEMENT_ARRAY_BUFFER,
              new Uint8Array(indices),
              that.gl.STATIC_DRAW);
      // define sizes
      that.indices.itemSize = that.gl.UNSIGNED_BYTE; // size of each index value - currently between 0-255,so they fit in BYTE
      that.indices.numItems = indices.length;        // number of elements in index array.

      console.log('Data initialized.');
    }

    /* ---------- Shader Data Init  ---------- */
    this.InitShaders = function() {

  // compile vertex and fragment shaders
  var vs = that.compileShader("shader-vs");
  var fs = that.compileShader("shader-fs");

  // Create actual shader program
  that.shaderProgram = that.gl.createProgram();

  // Attach shaders into shader program
  that.gl.attachShader(that.shaderProgram, vs);
  that.gl.attachShader(that.shaderProgram, fs);

  // link shader program
  that.gl.linkProgram(that.shaderProgram);

  // check if the shader program was successfully linked
  var ok = that.gl.getProgramParameter( that.shaderProgram, that.gl.LINK_STATUS);
  if ( !ok ){
      console.log('Could not link shaders:' +
      that.gl.getProgramInfoLog( that.shaderProgram));
  }

  // enable program
  that.gl.useProgram( that.shaderProgram );

  // access attribute location in program
  that.shaderProgram.vertexAngleAttribute = that.gl.getAttribLocation(that.shaderProgram, "aAngle");

  // radius uniform location
  that.shaderProgram.radius = that.gl.getUniformLocation(that.shaderProgram, "uRadius");

  // access uniform parameters (matrices)
  that.shaderProgram.projection = that.gl.getUniformLocation(that.shaderProgram, "uProjection");
  that.shaderProgram.modelView  = that.gl.getUniformLocation(that.shaderProgram, "uModelView");

    }

    /* ---------- Actual rendering  ---------- */
    this.Render = function()
    {
  // viewport to fill entire canvas area
  that.gl.viewport(0,0, that.gl.viewportWidth, that.gl.viewportHeight);

  // clear screen.
  that.gl.clear(that.gl.COLOR_BUFFER_BIT | that.gl.DEPTH_BUFFER_BIT);

  // set camera
  var viewRatio = that.gl.viewportWidth / that.gl.viewportHeight;
  // multiply left and right edges with viewratio, so the x-axis and y-axis scales match visually
  that.projMat.makeOrthographic( -7.0 * viewRatio, 7.0 * viewRatio, 7.0, -7.0, -0.1, 2.0);
  //that.projMat.makePerspective( 90.0, viewRatio, 0.1, 10.0);
  that.modelViewMat.identity();

  that.gl.useProgram( that.shaderProgram );
  // bind buffer for next operation
  that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.angles);

  // bind buffer data to shader attribute
  that.gl.vertexAttribPointer( that.shaderProgram.vertexAngleAttribute,
             that.angles.itemSize,
             that.gl.FLOAT, false, 0, 0);

  // enable vertex attrib array so data gets transferred
  that.gl.enableVertexAttribArray(that.shaderProgram.vertexAngleAttribute);

  // update uniforms in shader program
  that.gl.uniform1f( that.shaderProgram.radius, that.radius);
  that.gl.uniformMatrix4fv( that.shaderProgram.projection, false, that.projMat.flattenToArrayOffset([],0));
  that.gl.uniformMatrix4fv( that.shaderProgram.modelView,  false, that.modelViewMat.flattenToArrayOffset([],0));

  // tell opengl that we use this index buffer now.
  that.gl.bindBuffer( that.gl.ELEMENT_ARRAY_BUFFER, that.indices);


  // draw stuff on screen from vertices, using triangles and specified index buffer
  that.gl.drawElements(that.gl[that.mode], that.indices.numItems, that.indices.itemSize, 0);
    }

    /* ---------- Utility function, allows to compile shaders   ---------- */
    this.compileShader = function( id )
    {
  // access script element according to id (using jQuery)
  var script = $("#"+id);
  // access text source
  var src = script.text();
  var shader = null;

  // determine shader type and create appropriate shader
  if (script[0].type == "x-shader/x-vertex" )
  {
      shader = that.gl.createShader(that.gl.VERTEX_SHADER);
  }
  else if ( script[0].type == "x-shader/x-fragment" )
  {
      shader = that.gl.createShader(that.gl.FRAGMENT_SHADER);
  }
  else
  {
      console.log('Unknown shader type:', script[0].type);
      return null;
  }
  // set shader source (text)
  that.gl.shaderSource( shader, src);

  // compile shader source
  that.gl.compileShader(shader);

  // check if the compilation went ok, otherwise
  var ok = that.gl.getShaderParameter(shader, that.gl.COMPILE_STATUS);

  if ( !ok ) {
      console.log('shader failed to compile: ', that.gl.getShaderInfoLog(shader));
      return null;
  }

  return shader;
    }

}
// Create test application instance
var app = new WebGLApp();
