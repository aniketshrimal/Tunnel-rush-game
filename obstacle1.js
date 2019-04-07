function obs1_initbuffers(gl) {

  
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var z = start; 
    const position = [
      // Front face
      -l/2, l+2*l*sin, z,
     
     -l/2, -l-2*l*sin, z ,
      l/2 , -l-2*l*sin , z,
      
      -l/2, l+2*l*sin, z,
      l/2, l+2*l*sin, z,
      l/2 , -l-2*l*sin , z,

    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

 const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  
     const textureCoordinate = [
      // Front
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Back
      0.0,  0.0,
      1.0,  0.0,
      // 1.0,  1.0,
      // Top
      
    ];
      
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinate),
                gl.DYNAMIC_DRAW);



  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, uMath.sing the
  // indices into the vertex array to specify each triangle's
  // position.
    const indice = [
        0,  1,  2,   
        3,  4,  5,    // front
      
     ];

gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indice), gl.DYNAMIC_DRAW);




  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    // normal: normalBuffer,
    // color: colorBuffer,
    indices: indexBuffer,
  };
}

function draw_obstacle1(gl, programInfo, buffers,  deltaTime,texture,rot) {
  // Clear the canvas before we start drawing on it.
 
  var projectionMatrix2,modelViewMatrix2;
  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  projectionMatrix2 = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix2,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
   modelViewMatrix2 = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  
  mat4.translate(modelViewMatrix2,     // destination matrix
                 modelViewMatrix2,     // matrix to translate
                 [0,posy, z_const]);  // amount to translate
  
  mat4.rotate(modelViewMatrix2,  // destination matrix
              modelViewMatrix2,  // matrix to rotate
              cubeRotation+ rot,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  
  // mat4.rotate(modelViewMatrix,  // destination matrix
  //             modelViewMatrix,  // matrix to rotate
  //             cubeRotation * .7,// amount to rotate in radians
  //             [0, 1, 0]);       // axis to rotate around (X)
  // z_const+=0.3;
  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  // {
  //   const numComponents = 4;
  //   const type = gl.FLOAT;
  //   const normalize = false;
  //   const stride = 0;
  //   const offset = 0;
  //   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  //   gl.vertexAttribPointer(
  //       programInfo.attribLocations.vertexColor,
  //       numComponents,
  //       type,
  //       normalize,
  //       stride,
  //       offset);
  //   gl.enableVertexAttribArray(
  //       programInfo.attribLocations.vertexColor);
  // }
    {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
  }


  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  


  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix2);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix2);

   
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
 
  {
    const vertexCount = 6;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
   // Update the rotation for the next draw
  gl.flush();
}