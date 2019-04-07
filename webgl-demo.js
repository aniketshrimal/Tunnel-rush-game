var cubeRotation = 0.0;
var z_const   = 0.0;
var pos =0;
var positions = new Array();
var faceColors = new Array();
var indices = new Array();
var textureCoordinates = new Array();
var vertexNormals = new Array();
var start = -30
var sp = -60;
const l = 1.0; 
const ang = 45;
const cos = 0.70710678118;
const sin = 0.70710678118;
var z_pos = -1;
var obs_pos1 = -30;
var obs_pos = -60;
var e = 0;
var g = 0.035;
var posy = 2*sin;
var speed = 0.3;
var speedy = 0;
var val=0;
var level = 1;
var flag=0;
var score=0;
main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program
  const vsSource_light = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;


    const vsSource_texture = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.0, 0.8, 1.0));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  // const vsSource_texture = `
  //   attribute vec4 aVertexPosition;
  //   attribute vec2 aTextureCoord;
  //   attribute vec4 aVertexColor;

  //   uniform mat4 uModelViewMatrix;
  //   uniform mat4 uProjectionMatrix;

  //   varying highp vec2 vTextureCoord;

  //   void main(void) {
  //     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  //     vTextureCoord = aTextureCoord;
  //     // vColor = aVertexColor;
      
  //   }
  // `;
  // Fragment shader program

  const fsSource_light = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  const fsSource_texture = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
  `;
  // const fsSource_texture = `
  //   varying highp vec2 vTextureCoord;
  //   varying lowp vec4 vColor;

  //   uniform sampler2D uSampler;

  //   void main(void) {
  //     gl_FragColor = texture2D(uSampler, vTextureCoord);
  //     // gl_FragColor = vColor;

  //   }
  // `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram_light = initShaderProgram(gl, vsSource_light, fsSource_light);
  const shaderProgram_texture = initShaderProgram(gl, vsSource_texture, fsSource_texture);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is uMath.sing
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  // const programInfo = {
  //   program: shaderProgram,
  //   attribLocations: {
  //     vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
  //     vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
  //   },
  //   uniformLocations: {
  //     projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
  //     modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
  //   },
  // };
  var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
  
  const programInfo_light = {
    program: shaderProgram_light,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram_light, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram_light, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram_light, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram_light, 'uModelViewMatrix'),
    },
  };

  const programInfo_texture = {
    program: shaderProgram_texture,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram_texture, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram_texture, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram_texture, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram_texture, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram_texture, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram_texture, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram_texture, 'uSampler'),
    },
  };


  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  var obs_buffers=new Array();
  var obs_rot=new Array();
  var obs_z=new Array();
  var obs1_buffers=new Array();
  var obs1_rot=new Array();
  var obs1_z=new Array();

  var buffers = initBuffers(gl);
  for(var i=0;i<10;i++)
  {
     obs_z[i]=sp;
     obs_buffers[i]= obs_initbuffers(gl);
     obs_rot[i]=2*Math.random();
     sp-=60;
  }
  for(var i=0;i<10;i++)
  {
     obs1_z[i]=start;
     obs1_buffers[i]= obs1_initbuffers(gl);
     obs1_rot[i]=2*Math.random();
     start-=60;
  }
  const texture = loadTexture(gl, 'ab.jpeg');
  const texture1 = loadTexture(gl, 'a.jpeg');

  var then = 0;

  document.addEventListener("keyup", function(event) {
  if(event.keyCode==80)
    val++;   
  if(event.keyCode==32 && flag==0)
  {
    speedy+=0.5;   
    flag=1;
  }
  if(event.keyCode == 84)
  {
    e++;
    if(e%2==1)
    {
      var p=0;
      for( var j=0;j<100;j++)
      {
        const faceColor = [
          [0.0,  0.0,  0.0,  1.0],    // Top face: green
          [1.0,  1.0,  1.0,  1.0],    // Bottom face: blue
        ];
        faceColors.splice(1,8);
        
        p=1-p;
        for(var r = 0;r<8;r++)
        {

            faceColors.push(faceColor[p]);
            p=1-p;
        }

      }

    }
    else
    {
      for( var j=0;j<100;j++)
      {
        const faceColor = [
          [0.0,  1.0,  0.0,  1.0],    // Top face: green
          [0.0,  1.0,  1.0,  1.0],    // Bottom face: blue
          [1.0,  0.0,  0.0,  1.0],    // Right face: yellow
          [1.0,  0.0,  1.0,  1.0],    // Left face: purple
          [1.0,  1.0,  0.0,  1.0],    // Top face: green
          [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        ];
        faceColors.splice(1,8);
        for(var r = 0;r<8;r++)
        {
            var p = Math.random();
            p = Math.floor(p*6);
            faceColors.push(faceColor[p]);
        }

      }

    }
  }
});


  // Draw the scene repeatedly
  function render(now) {
    if(level!=0)
      score++;
    document.getElementById('score').innerHTML = "Score: " + score;
    document.getElementById('level').innerHTML = "Level: " + level;
    
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    if(Key.isDown(Key.LEFT))
      cubeRotation+=(Math.PI)/40;
    if(Key.isDown(Key.RIGHT))
      cubeRotation-=(Math.PI)/40;
    if(score>1000)
      level=2;
    if(score>2500)
      level=3;
    if(z_pos>-z_const+6)
    {
      z_pos-=6;
      buffers = changeBuffers(gl);
      
    }
    for(i=0;i<10;i++)
    {
      if(obs_z[i]>-z_const)
      {
        obs_z[i]=sp;
        obs_buffers[i]= obs_initbuffers(gl);
        obs_rot[i]=2*Math.random();
        sp-=60;
      }
    }

    for(i=0;i<10;i++)
    {
      if(obs1_z[i]>-z_const)
      {
        obs1_z[i]=start;
        obs1_buffers[i]= obs1_initbuffers(gl);
        obs1_rot[i]=2*Math.random();
        start-=60;
      }
    }
    for(i=0;i<10;i++)
    {
      var rot = obs_rot[i]+cubeRotation;
      var temp = Math.floor(rot/(2*(Math.PI)));
      var ang  = rot - (temp)*(2*(Math.PI));
      var pi = Math.PI;
      if(-obs_z[i]-z_const<0.5 && ((ang >= 8*pi/9 && ang<=10*pi/9 )||(ang >= 7*pi/4 || ang<=pi/4)) )
      {
        speed=0;
        level = 0;
          document.getElementById('gameover').innerHTML = "GAME OVER" ;

        }
    }
    for(i=0;i<10;i++)
    {
      var rot = obs1_rot[i]+cubeRotation;
      var temp = Math.floor(rot/(2*(Math.PI)));
      var ang  = rot - (temp)*(2*(Math.PI));
      var pi = Math.PI;
      if(-obs1_z[i]-z_const<0.5 &&( (ang >= 8*pi/9 && ang<=10*pi/9  )||(ang >= 7*pi/4 || ang<=pi/4)) )
      {
        speed=0;
        level=0;
 
         document.getElementById('gameover').innerHTML = "GAME OVER" ;
 
      }
    }
    if(val%2==0)
    {
        drawScene_light(gl, programInfo_light, buffers, deltaTime);
      
      for(i=0;i<10;i++)
      {
        if(level==1)
        {
            obs1_rot[i]+=0;
        
        }
        if(level==2)
        {
            obs1_rot[i]+=(Math.random())/20;
            speed=0.5;
        }
        if(level==3)
        {
            obs1_rot[i]+=(Math.random())/10;
            speed=0.7;

        }

        draw_obstacle1(gl, programInfo_texture, obs1_buffers[i], deltaTime,texture1,obs1_rot[i]);
      }

      for(i=0;i<10;i++)
      {
        if(level==1)
        {
            obs_rot[i]+=0;
        
        }
        if(level==2)
        {
            obs_rot[i]+=(Math.random())/20;
            speed=0.4;
        }
        if(level==3)
        {
            obs_rot[i]+=(Math.random())/10;
            speed=0.5;

        }

        draw_obstacle(gl, programInfo_texture, obs_buffers[i], deltaTime,texture1,obs_rot[i]);
      }
    }  
    else
    {
      drawScene(gl, programInfo_texture, buffers, deltaTime,texture);
      // draw_obstacle(gl, programInfo_texture, obs_buffers, deltaTime,texture);
      for(i=0;i<10;i++)
      {
        if(level==1)
        {
            obs1_rot[i]+=0;
        
        }
        if(level==2)
        {
            obs1_rot[i]+=(Math.random())/20;
            speed=0.5;
        }
        if(level==3)
        {
            obs1_rot[i]+=(Math.random())/10;
            speed=0.7;

        }

        draw_obstacle1(gl, programInfo_texture, obs1_buffers[i], deltaTime,texture1,obs1_rot[i]);
      }

      for(i=0;i<10;i++)
      {
        if(level==1)
        {
            obs_rot[i]+=0;
        
        }
        if(level==2)
        {
            obs_rot[i]+=(Math.random())/20;
            speed=0.5;
        }
        if(level==3)
        {
            obs_rot[i]+=(Math.random())/10;
            speed=0.7;

        }
        draw_obstacle(gl, programInfo_texture, obs_buffers[i], deltaTime,texture1,obs_rot[i]);
      }
    }
    if(level==0)
      speed=0;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//



function initBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.
  
  var i=pos;
  for(var j = 0; j<100;j++)
  {
    const position = [
      -l, -l-2*l*sin, -3*l+i ,
         l , -l-2*l*sin , -3*l+i,
         l , -l-2*l*sin, 3*l+i ,
        -l , -l-2*l*sin, 3*l+i,

        l , -l-2*l*sin, 3*l+i ,
        l , -l-2*l*sin , -3*l+i,
        l+2*l*cos , -l , -3*l+i ,
        l+2*l*cos, -l , 3*l+i ,

        l+2*l*cos, -l , 3*l+i ,
        l+2*l*cos , -l , -3*l+i ,
        l+2*l*cos , l , -3*l+i ,
        l+2*l*cos , l , 3*l+i ,

        l+2*l*cos , l , 3*l+i ,
        l+2*l*cos , l , -3*l+i ,
        l , 2*l*sin + l , -3*l+i ,
        l , 2*l*sin + l , 3*l+i ,
        
        l , 2*l*sin + l , -3*l+i ,
        l , 2*l*sin + l , 3*l+i ,
        -l , 2*l*sin + l , 3*l+i ,
        -l , 2*l*sin + l , -3*l+i ,

        -l-2*l*cos , l , 3*l+i ,
        -l-2*l*cos , l , -3*l+i ,
        -l , 2*l*sin + l , -3*l+i ,
        -l , 2*l*sin + l , 3*l+i ,
        
        -l-2*l*cos, -l , 3*l+i ,
        -l-2*l*cos , -l , -3*l+i ,
        -l-2*l*cos , l , -3*l+i ,
        -l-2*l*cos , l , 3*l+i ,

        -l , -l-2*l*sin , 3*l+i ,
        -l , -l-2*l*sin , -3*l+i,
        -l-2*l*cos , -l , -3*l+i ,
        -l-2*l*cos, -l , 3*l+i ,
        
            
            
          

    ];
    for(r=0;r<96;r++){
      positions.push(position[r]);
    }
    i-=6*l;
  }
  pos=i;
  // console.log(positions);
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.
  for( var j=0;j<100;j++)
  {
    const faceColor = [
      [0.0,  1.0,  0.0,  1.0],    // Top face: green
      [0.0,  1.0,  1.0,  1.0],    // Bottom face: blue
      [1.0,  0.0,  0.0,  1.0],    // Right face: yellow
      [1.0,  0.0,  1.0,  1.0],    // Left face: purple
      [1.0,  1.0,  0.0,  1.0],    // Top face: green
      [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    ];
    for(var r = 0;r<8;r++)
    {
        var p = Math.random();
        p = Math.floor(p*6);
        faceColors.push(faceColor[p]);
    }

  }

  // console.log(faceColors);

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  for(var j=0;j<100;j++)
  {
     const textureCoordinate = [
      // Front
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Back
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Top
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Bottom
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Right
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Left
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,


      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Left
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
    ];
    for(var r=0;r<64;r++)
    {
      textureCoordinates.push(textureCoordinate[r]);
    }
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);


  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, uMath.sing the
  // indices into the vertex array to specify each triangle's
  // position.
 for(var j=0;j<100;j++)
  {
    const indice = [
      0+32*j,  1+32*j,  2+32*j,      0+32*j,  2+32*j,  3+32*j,    // front
      4+32*j,  5+32*j,  6+32*j,      4+32*j,  6+32*j,  7+32*j,    // back
      8+32*j,  9+32*j,  10+32*j,     8+32*j,  10+32*j, 11+32*j,   // top
      12+32*j, 13+32*j, 14+32*j,     12+32*j, 14+32*j, 15+32*j,   // bottom
      16+32*j,17+32*j,18+32*j,       16+32*j,18+32*j,19+32*j,    
      20+32*j,21+32*j,22+32*j,       20+32*j,22+32*j,23+32*j,
      24+32*j,25+32*j,26+32*j,       24+32*j,26+32*j,27+32*j,
      28+32*j,29+32*j,30+32*j,       28+32*j,30+32*j,31+32*j,  
    ];
    for(r=0;r<48;r++)
      indices.push(indice[r]);
  }

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  for(var j=0;j<100;j++)
  {
    const vertexNormal = [
      // Front
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,

      // Back
       -1.0,  1.0, 0.0,
       -1.0,  1.0, 0.0,
       -1.0,  1.0, 0.0,
       -1.0,  1.0, 0.0,

      // Top
       -1.0,  0.0,  0.0,
       -1.0,  0.0,  0.0,
       -1.0,  0.0,  0.0,
       -1.0,  0.0,  0.0,

      // Bottom
       -1.0, -1.0,  0.0,
       -1.0, -1.0,  0.0,
       -1.0, -1.0,  0.0,
       -1.0, -1.0,  0.0,

      // Right
       0.0,  -1.0,  0.0,
       0.0,  -1.0,  0.0,
       0.0,  -1.0,  0.0,
       0.0,  -1.0,  0.0,

      // Left
      1.0,  -1.0,  0.0,
      1.0,  -1.0,  0.0,
      1.0,  -1.0,  0.0,
      1.0,  -1.0,  0.0,
      
      // Right
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,

      // Left
      1.0,  1.0,  0.0,
      1.0,  1.0,  0.0,
      1.0,  1.0,  0.0,
      1.0,  1.0,  0.0,

    ];
    for(var r = 0; r<96 ;r++)
      vertexNormals.push(vertexNormal[r]);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                gl.STATIC_DRAW);


  // console.log(indices);
  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    textureCoord: textureCoordBuffer,
    normal: normalBuffer,

    
  };

  
}

function changeBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.
    var i=pos;
    const position = [
        // Front face
        
        
        -l , -l-2*l*sin, -3*l+i ,
         l , -l-2*l*sin , -3*l+i,
         l , -l-2*l*sin, 3*l+i ,
        -l , -l-2*l*sin, 3*l+i,

        l , -l-2*l*sin, 3*l+i ,
        l , -l-2*l*sin , -3*l+i,
        l+2*l*cos , -l , -3*l+i ,
        l+2*l*cos, -l , 3*l+i ,

        l+2*l*cos, -l , 3*l+i ,
        l+2*l*cos , -l , -3*l+i ,
        l+2*l*cos , l , -3*l+i ,
        l+2*l*cos , l , 3*l+i ,

        l+2*l*cos , l , 3*l+i ,
        l+2*l*cos , l , -3*l+i ,
        l , 2*l*sin + l , -3*l+i ,
        l , 2*l*sin + l , 3*l+i ,
        
        l , 2*l*sin + l , -3*l+i ,
        l , 2*l*sin + l , 3*l+i ,
        -l , 2*l*sin + l , 3*l+i ,
        -l , 2*l*sin + l , -3*l+i ,

        -l-2*l*cos , l , 3*l+i ,
        -l-2*l*cos , l , -3*l+i ,
        -l , 2*l*sin + l , -3*l+i ,
        -l , 2*l*sin + l , 3*l+i ,
        
        -l-2*l*cos, -l , 3*l+i ,
        -l-2*l*cos , -l , -3*l+i ,
        -l-2*l*cos , l , -3*l+i ,
        -l-2*l*cos , l , 3*l+i ,

        -l , -l-2*l*sin , 3*l+i ,
        -l , -l-2*l*sin , -3*l+i,
        -l-2*l*cos , -l , -3*l+i ,
        -l-2*l*cos, -l , 3*l+i ,
        
            

      ];
      positions.splice(1,96);
      for(r=0;r<96;r++){
        positions.push(position[r]);
      }
      i-=6*l;
      pos=i;
    // console.log(positions[9599],-z_const);
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.
  faceColors.splice(1,8);
  for( var j=0;j<1;j++)
  {
    const faceColor = [
      [0.0,  1.0,  0.0,  1.0],    // Top face: green
      [0.0,  1.0,  1.0,  1.0],    // Bottom face: blue
      [1.0,  0.0,  0.0,  1.0],    // Right face: yellow
      [1.0,  0.0,  1.0,  1.0],    // Left face: purple
      [1.0,  1.0,  0.0,  1.0],    // Top face: green
      [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    ];
    for(var r = 0;r<8;r++)
    {
        var p = Math.random();
        p = Math.floor(p*6);
        faceColors.push(faceColor[p]);
    }

  }
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                gl.STATIC_DRAW);


  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);
  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, uMath.sing the
  // indices into the vertex array to specify each triangle's
  // position.
  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    textureCoord: textureCoordBuffer,
    normal: normalBuffer,
  };
}


//
// Draw the scene.
//
function drawScene_light(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  
  speedy -=g;
  
  posy-=speedy;

  if(posy>2*sin)
  {
    posy = 2*sin;
    flag=0;
    speedy = 0;
  }



  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [0,posy, z_const]);  // amount to translate
  
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  
  // mat4.rotate(modelViewMatrix,  // destination matrix
  //             modelViewMatrix,  // matrix to rotate
  //             cubeRotation * .7,// amount to rotate in radians
  //             [0, 1, 0]);       // axis to rotate around (X)
  z_const+=speed;
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
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }
   
  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

   
  {
    const vertexCount = 100*48;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw
  gl.flush();

  // cubeRotation += deltaTime;
}

function drawScene(gl, programInfo, buffers, deltaTime,texture) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  speedy -=g;
  
  posy-=speedy;

  if(posy>2*sin)
  {
    posy = 2*sin;
    flag=0;
    speedy = 0;
  }

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [0,posy, z_const]);  // amount to translate
  
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  
  // mat4.rotate(modelViewMatrix,  // destination matrix
  //             modelViewMatrix,  // matrix to rotate
  //             cubeRotation * .7,// amount to rotate in radians
  //             [0, 1, 0]);       // axis to rotate around (X)
  z_const+=speed;
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

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal);
  }


  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.normalMatrix,
    false,
    normalMatrix);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

   
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
 
  {
    const vertexCount = 100*48;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw
  gl.flush();

  // cubeRotation += deltaTime;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

