var gl = null,
	canvas = null,
	glProgram = null,
	fragmentShader = null,
	vertexShader = null;

var vertexPositionAttribute = null,
	vertexTexCoordAttribute = null,
	trianglesVerticeBuffer = null,
	trianglesTexCoordBuffer = null;

var texture = [],
	textureImage = [];

var mvMatrix = mat4.create(),
	pMatrix = mat4.create(),
	matRotY = 0,
	matRotX = 0;

var angle = 0.01;

var mouse = {
	down: false,
	prevY: 0,
	prevX: 0
}

function loadTextures() {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	var faces = [["./posx.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["./negx.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["./posy.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["./negy.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["./posz.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["./negz.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
	for (var i = 0; i < faces.length; i++) {
		var face = faces[i][1];
		var image = new Image();
		image.onload = function(texture, face, image) {
			return function() {
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			}
		}(texture, face, image);
		image.src = faces[i][0];
	}
}

function setupTexture(i, target) {
	texture[i] = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture[i]);
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		textureImage[i]);

	if (!gl.isTexture(texture[i])) {
		console.error("Error: Texture is invalid");
	}
}

function initWebGL() {
	canvas = document.getElementById("my-canvas");
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	} catch (e) {}

	if (gl) {
		initShaders();
		setupBuffers();
		getMatrixUniforms();
		loadTextures();

		(function animLoop() {
			setupWebGL();
			setMatrixUniforms();

			drawScene();
			requestAnimationFrame(animLoop, canvas);
		})();
	} else {
		alert("Error: Your browser does not appear to support WebGL.");
	}
}

function setupWebGL() {
	//set the clear color to a shade of green
	gl.clearColor(0.1, 0.5, 0.1, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);

	gl.viewport(0, 0, canvas.width, canvas.height);
	mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0.0, 0.0, 0.0]);
	// mat4.rotate(mvMatrix, angle, [0.0, 1.0, 0.0]);
	// angle += 0.005;
	mat4.rotate(mvMatrix, matRotX, [1.0, 0.0, 0.0]);
	mat4.rotate(mvMatrix, matRotY, [0.0, 1.0, 0.0]);

	// simple input handling
	canvas.onmousedown = function(ev) {
		mouse.down = true;
		mouse.prevX = ev.pageX;
		mouse.prevY = ev.pageY;
	}

	canvas.onmouseup = function(ev) {
		mouse.down = false;
	}

	canvas.onmousemove = function(ev) {
		if (mouse.down) {
			matRotY += (ev.pageX - mouse.prevX) * 0.005;
			matRotX += (ev.pageY - mouse.prevY) * 0.005;
			mouse.prevY = ev.pageY;
			mouse.prevX = ev.pageX;
		}
	}
}

function initShaders() {
	// compile vertex and fragment shaders
	var vertexShader = compileShader("shader-vs");
	var fragmentShader = compileShader("shader-fs");

	//create program
	glProgram = gl.createProgram();

	//attach and link shaders to the program
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);
	gl.linkProgram(glProgram);

	if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program.");
	}

	//use program
	gl.useProgram(glProgram);
}

/* ---------- Utility function, allows to compile shaders   ---------- */
function compileShader(id) {
	// access script element according to id (using jQuery)
	var script = $("#" + id);
	// access text source
	var src = script.text();
	var shader = null;

	// determine shader type and create appropriate shader
	if (script[0].type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else if (script[0].type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else {
		console.log('Unknown shader type:', script[0].type);
		return null;
	}
	// set shader source (text)
	gl.shaderSource(shader, src);

	// compile shader source
	gl.compileShader(shader);

	// check if the compilation went ok, otherwise
	var ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

	if (!ok) {
		console.log('shader failed to compile: ', gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function setupBuffers() {
	//8 vertices
	var triangleVerticesOriginal = [
		//front face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,

		//rear face
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
	];

	//12 triangles
	var triangleVertexIndices = [
		0, 3, 1, //front face
		0, 2, 3,

		4, 5, 7, //rear face
		4, 7, 6,

		0, 4, 2, //left side
		4, 6, 2,

		1, 3, 7, //right side
		1, 7, 5,

    3, 2, 6, //top side
    3, 6, 7,

    0, 1, 4, //bottom side
    1, 5, 4,
	];

	//36 vertices
	var triangleVertices = [];
	//var triangleTexCoords = [];

	for (var i = 0; i < triangleVertexIndices.length; ++i) {
		var a = triangleVertexIndices[i];

		triangleVertices.push(triangleVerticesOriginal[a * 3]);
		triangleVertices.push(triangleVerticesOriginal[a * 3 + 1]);
		triangleVertices.push(triangleVerticesOriginal[a * 3 + 2]);
	}

	trianglesVerticeBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
}

function drawScene() {
	vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 12 * 3);
}

function getMatrixUniforms() {
	glProgram.pMatrixUniform = gl.getUniformLocation(glProgram, "uPMatrix");
	glProgram.mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVMatrix");
	glProgram.samplerUniform = gl.getUniformLocation(glProgram,
		"uSamplerCube");
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
}
