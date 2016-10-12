let vertexShader = `
attribute vec4 a_Position;
attribute vec4 a_Color;


uniform mat4 u_Model;
uniform mat4 u_View;
uniform mat4 u_Projection;

varying vec4 v_Color;

void main(){
  v_Color = a_Color;
  gl_Position = u_Projection * u_View * u_Model * a_Position;
}`;

var fragmentShader = `
precision mediump float;
varying vec4 v_Color;
void main(){
  gl_FragColor = v_Color;
}`;



var createCube = function(gl, program){
  var cube = {
      vertices : new Float32Array([
            1.0,  1.0,  1.0,
           -1.0,  1.0,  1.0,
           -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,

            1.0,  1.0, -1.0,
           -1.0,  1.0, -1.0,
           -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0
      ]),
      colors: new Float32Array([
            1.0, 1.0, 1.0,
            1.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 1.0, 1.0,

            1.0, 1.0, 0.0,
            1.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
            0.0, 1.0, 0.0]),

      indices: new Uint8Array([
         0,1,2,  0,2,3, // front face
         0,7,4,  0,3,7,   // right face
         1,5,6,  1,6,2, // left face
         0,4,5,  0,5,1, // top face
         3,2,6,  3,6,7, // bottom face
         4,7,6,  4,6,5 // back face

      ]),
      dimensions: 3,
      numPoints: 8
    };

  cube.vertexBuffer = gl.createBuffer();
  cube.colorBuffer = gl.createBuffer();
  cube.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, cube.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.colors, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);

  return function(){
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.vertexBuffer);
    // associate it with our position attribute
    gl.vertexAttribPointer(program.a_Position, cube.dimensions, gl.FLOAT, false, 0,0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cube.colorBuffer);
    // associate it with our position attribute
    gl.vertexAttribPointer(program.a_Color, cube.dimensions, gl.FLOAT, false, 0,0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indexBuffer);
    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_BYTE, 0);
  };
};





window.onload = function(){
  let canvas = document.getElementById('canvas');
  let gl;
  // catch the error from creating the context since this has nothing to do with the code
  try{
    gl = middUtils.initializeGL(canvas);
  } catch (e){
    alert('Could not create WebGL context');
    return;
  }

  // don't catch this error since any problem here is a programmer error
  let program = middUtils.initializeProgram(gl, vertexShader, fragmentShader);

  // load referneces to the vertex attributes as properties of the program
  program.a_Position = gl.getAttribLocation(program, 'a_Position');
  if (program.a_Position < 0) {
      console.log('Failed to get storage location');
      return -1;
  }
  gl.enableVertexAttribArray(program.a_Position);

 // specify the association between the VBO and the a_Color attribute
  program.a_Color = gl.getAttribLocation(program, 'a_Color');
  if (program.a_Color < 0) {
      console.log('Failed to get storage location');
      return -1;
  }
  gl.enableVertexAttribArray(program.a_Color);


  // get uniform locations
  let u_Model = gl.getUniformLocation(program, 'u_Model');
  let u_View = gl.getUniformLocation(program, 'u_View');
  let u_Projection = gl.getUniformLocation(program, 'u_Projection');

  // set up the view
  let view = mat4.create();

  let eye = vec3.fromValues(0, 3, 7);
  let up = vec3.fromValues(0,1,0);
  let at = vec3.fromValues(0,0,0);

  mat4.lookAt(view, eye, at, up);
  gl.uniformMatrix4fv(u_View, false, view);

  // set up the projection
  let projection = mat4.create();
  mat4.perspective(projection, Math.PI/6, canvas.width / canvas.height, 0.5, 10.0);
  gl.uniformMatrix4fv(u_Projection, false, projection);



  let drawCube = createCube(gl, program);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0,0,0,1);

  let angle = 0;
  let last;

  let render = (now)=> {

    var c = Math.cos(angle);
    var s = Math.sin(angle);

    var rotation = new Float32Array([
      c,0, s, 0,
      0, 1, 0, 0,
      -s, 0, c, 0,
      0, 0, 0, 1
    ]);

    // find the new angle based on the elapsed time
    if (now && last){
      var elapsed = now -last;
      angle += (Math.PI/2) * elapsed/1000;
      angle = angle > 2 * Math.PI ? angle - Math.PI *2 : angle;
    }
    last = now;
    gl.uniformMatrix4fv(u_Model, false, rotation);

    // clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawCube();

    requestAnimationFrame(render);
  };

  render();


};
