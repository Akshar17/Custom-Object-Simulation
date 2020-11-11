var gl;
var indexBuffer;
var orthographicIsOn;
var myShaderProgram;
var alpha;
var beta;
 var coordinatesLocation,lightlocation,colorlocation;
 var light,color,keepRunning;

function initGL(){
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.enable(gl.DEPTH_TEST);
    gl.viewport( 0, 0, 1024, 1024 );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    myShaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( myShaderProgram );


    alpha =0.0;
    beta = 0.0;

    light = 1;
    txValue = 0.0;
    tyValue = 0.0;
    keepRunning = 1;

    Mx = [1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0];
    My = [1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0];
    Mxuniform = gl.getUniformLocation( myShaderProgram , "Mx");
    Myuniform = gl.getUniformLocation( myShaderProgram , "My");

    gl.uniformMatrix4fv( Mxuniform , false, flatten(Mx));
    gl.uniformMatrix4fv( Myuniform , false, flatten(My));


    var myImage = document.getElementById( "textureid" );
    console.log(myImage);

    textureImage = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureImage);
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage);
    /*gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);*/
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    //


   var indexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,teapotModel.indices , gl.STATIC_DRAW);

   var verticesBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, teapotModel.vertexPositions, gl.STATIC_DRAW);

   var vertexPosition = gl.getAttribLocation(myShaderProgram,"vertexPosition");
   gl.vertexAttribPointer( vertexPosition, 3, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vertexPosition );

   var normalsbuffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, normalsbuffer );
   gl.bufferData( gl.ARRAY_BUFFER, teapotModel.vertexNormals, gl.STATIC_DRAW );

   var vertexNormalPointer = gl.getAttribLocation( myShaderProgram, "nv" );
   gl.vertexAttribPointer( vertexNormalPointer, 3, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vertexNormalPointer );

   var texcoordBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, teapotModel.vertexTextureCoords, gl.STATIC_DRAW);

   var textureCoordinate  = gl.getAttribLocation( myShaderProgram, "textureCoordinate" );
   gl.vertexAttribPointer( textureCoordinate, 2, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( textureCoordinate );

   var coordinatesLocation = gl.getUniformLocation( myShaderProgram, "coordinates");
   gl.uniform2f(coordinatesLocation , 0.0, 0.0);

   lightlocation = gl.getUniformLocation(myShaderProgram, "light");

//   modelviewMatrixLocation = gl.getUniformLocation(myShaderProgram, "M");
   //gl.uniformMatrix4fv(modelviewMatrixLocation, false, flatten(modelviewMatrix));


    var e = vec3( 30.0, 40.0, 60.0);
    var a = vec3( 0.0, 0.0, 0.0);
    var vup = vec3( 0.0, 1.0, 0.0);
    var n = normalize( vec3( e[0]-a[0], e[1]-a[1], e[2]-a[2]));
    var u = normalize( cross(vup, n));
    var v = normalize( cross(n, u));
    var modelviewMatrix = [u[0], v[0], n[0], 0.0,
                           u[1], v[1], n[1], 0.0,
                           u[2], v[2], n[2], 0.0,
                          -u[0]*e[0]-u[1]*e[1]-u[2]*e[2],
                          -v[0]*e[0]-v[1]*e[1]-v[2]*e[2],
                          -n[0]*e[0]-n[1]*e[1]-n[2]*e[2], 1.0]; //Column Wise Matrix


    var modelviewMatrixInverseTranspose = [u[0], v[0], n[0], e[0],
                                           u[1], v[1], n[1], e[1],
                                           u[2], v[2], n[2], e[2],
                                           0.0, 0.0, 0.0, 1.0];

    modelviewMatrixLocation = gl.getUniformLocation(myShaderProgram, "M");
    gl.uniformMatrix4fv(modelviewMatrixLocation, false, modelviewMatrix);
    var modelviewMatrixInverseTransposeLocation = gl.getUniformLocation(myShaderProgram, "M_inversetranspose");
    gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation, false, modelviewMatrixInverseTranspose);

    //Projection Matrix
    var left = -20.0;
    var right = 20.0;
    var top_ = 20.0;
    var bottom = -20.0;
    var near = 50.0;
    var far = 100.0;

    var orthographicProjectionMatrix = [2.0/(right-left), 0.0, 0.0, 0.0,
                                        0, 2.0/(top_-bottom), 0.0, 0.0,
                                        0.0, 0.0, -2.0/(far-near), 0.0,
                                      -(left+right)/(right-left), -(top_+bottom)/(top_-bottom), -(far+near)/(far-near),1.0];



    var perspectiveProjectionMatrix = [2.0*near/(right-left), 0.0, 0.0, 0.0,
                                       0, 2.0*near/(top_-bottom), 0.0, 0.0,
                                       (left+right)/(right-left), (top_+bottom)/(top_-bottom), -(far+near)/(far-near),-1.0,
                                       0.0, 0.0, -2.0*far*near/(far-near), 0.0];


    var orthographicProjectionMatrixLocation = gl.getUniformLocation(myShaderProgram, "P_orth");
    gl.uniformMatrix4fv(orthographicProjectionMatrixLocation, false, orthographicProjectionMatrix);
    var perspectiveProjectionMatrixLocation = gl.getUniformLocation(myShaderProgram, "P_persp");
    gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation, false, perspectiveProjectionMatrix);

    orthographicIsOn = 1;
    orthographicIsOnLocation = gl.getUniformLocation(myShaderProgram, "orthIsOn");
    gl.uniform1f(orthographicIsOnLocation,orthographicIsOn);


    //gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.enable( gl.DEPTH_TEST );

    drawObject();

};
function selectTexture(num){

  var myImage = document.getElementById( "t"+num);
  console.log(myImage);

  textureImage = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage);
  /*gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);*/
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

}

function rotateAroundX() {
    // will implement this to rotate the cube around the X-axis
    if(keepRunning = 1){
      alpha += 0.05;
      beta = 0.0;
      Mx = [1.0,
            0.0,
            0.0,
            0.0,
            0.0,
            Math.cos(alpha),
            -Math.sin(alpha),
            0.0,
            0.0,
            Math.sin(alpha),
            Math.cos(alpha),
            0.0,
            0.0,
            0.0,
            0.0,
            1.0]
      gl.uniformMatrix4fv(Mxuniform , false , flatten(Mx));
      }
//    drawObject();

}

function rotateAroundY() {
    // will implement to rotate the cube around the Y-axis
    if(keepRunning = 1){
      beta += 0.05;
      alpha = 0.0;
      My = [Math.cos(beta),
            0.0,
            -Math.sin(beta),
            0.0,
            0.0,
            1.0,
            0.0,
            0.0,
            Math.sin(beta),
            0.0,
            Math.cos(beta),
            0.0,
            0.0,
            0.0,
            0.0,
            1.0]
      gl.uniformMatrix4fv(Myuniform , false , flatten(My));
    }
    //drawObject();

}

function startstopRotate(){
  if(keepRunning == 1){
    keepRunning = 0;
  }
  else {
    keepRunning = 1;
  }
}

function TextureToggle(){
  if(light == 1){
    light = 0;
  }
  else {
    light = 1;
  }
}


function showOrthographic() {
  orthographicIsOn = 1;
  orthographicIsOnLocation = gl.getUniformLocation(myShaderProgram, "orthIsOn");
  gl.uniform1f(orthographicIsOnLocation,orthographicIsOn);
  console.log("orth");
}

function showPerspective(){
  orthographicIsOn = 0;
  orthographicIsOnLocation = gl.getUniformLocation(myShaderProgram, "orthIsOn");
  gl.uniform1f(orthographicIsOnLocation,orthographicIsOn);
  console.log("persp");
}

function drawObject() {

    r = document.getElementById("sliderR").value;
    r = r/100;
    g = document.getElementById("sliderG").value;
    g = g/100;
    b = document.getElementById("sliderB").value;
    b = b/100;
    color = [r,g,b,1];
    colorlocation = gl.getUniformLocation(myShaderProgram, "color");
    gl.uniform1i(lightlocation, light);
    gl.uniform4fv(colorlocation, color);
    gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);

    if(keepRunning == 1.0){
      if(alpha>=0.05 && beta ==0.0){
         rotateAroundX();
      }
      else if(beta>=0.05 && alpha ==0.0) {
        rotateAroundY();
      }
    }

  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
  gl.drawElements( gl.TRIANGLES, teapotModel.indices.length, gl.UNSIGNED_SHORT, 0 );
  requestAnimFrame(drawObject);
}
