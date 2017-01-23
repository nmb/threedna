/* -----------------------------------------------
/* Author : Mikael Borg
/* MIT license: http://opensource.org/licenses/MIT
/* Demo / Generator : vincentgarreau.com/particles.js
/* GitHub : github.com/nmb/threedna
/* 
/* ----------------------------------------------- */

function ThreeDNA(config) {

  // options
  var config = Object.assign({
    element: 'canvas',
    noOfObjects: 100,
    objectColor: 0xF47D20,
    bgColor: 0x0B0158,
    rain: false,
    deleteOnError: false
  }, config);

  // some global variables
  var scene, camera, webGLRenderer;
  var light;
  var headPos = new THREE.Vector3 (0,300,400);
  var mesh;
  var meshes = [];
  var rotations = [];
  var xmax;
  var ymax;
  var fov = 50;
  var cameraDistance = 1000;

  // DNA strand curve
  var StrandCurve = THREE.Curve.create(
      function (scale, turns, phase) {
        this.scale = ( scale === undefined ) ? 1 : scale;
        this.turns = turns;
        this.phase = phase;
      },
      function ( t ) { //getPoint: t is between 0-1

        //var tx = t * 3 - 1.5;
        var tx = Math.cos( this.turns*2 * Math.PI * t + this.phase);
        var ty = Math.sin( this.turns*2 * Math.PI * t + this.phase);
        var tz = this.turns*2*t;

        return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );
      }
      );

  // Define DNAMesh as an extension of a THREE mesh
  function DNAMesh(geometry, material) {
    THREE.Mesh.call(this, geometry, material);
    this.type = 'DNAMesh';
  }

  DNAMesh.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {
    constructor: DNAMesh,
    initialize: function(scale, turns) {
      this.cstrand = new StrandCurve( scale, turns, 0.0);
      this.wstrand = new StrandCurve( scale, turns, - 0.75 * Math.PI );
      this.geometry.merge(new THREE.TubeGeometry( this.cstrand, 128, 1, 8, false ));
      this.geometry.merge(new THREE.TubeGeometry( this.wstrand, 128, 1, 8, false ));
      // loop for creating rungs
      for(var i = 0; i < 10*turns; i++) {
        var rung = new THREE.LineCurve3(this.cstrand.getPoint(i/50), this.wstrand.getPoint(i/50));
        this.geometry.merge(new THREE.TubeGeometry( rung, 1, 1, 8, false));
      }
    },
  } );


  function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( config.bgColor );


    // find container
    container = document.getElementById( config.element );
    if(!container){
      throw Error("Cannot find element with id " + config.element);
    }
    if(container.clientWidth < 10 || container.clientHeight < 10){
      throw Error("Canvas element too small.");
    }

    camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, 0.1, 2*cameraDistance);
    // position and point the camera to the center of the scene
    camera.position.set (0, 0, cameraDistance);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    ymax = cameraDistance * Math.tan(0.5*fov/180*Math.PI);
    xmax = ymax*camera.aspect;

    // create renderer
    try {
      webGLRenderer = new THREE.WebGLRenderer({ antialias: true } );
    }
    catch(err) {
      if(config.deleteOnError) {
        container.parentNode.removeChild(container);
      }
      throw(err);
    }

    webGLRenderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    webGLRenderer.setSize(container.clientWidth, container.clientHeight);

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);
    light = new THREE.PointLight(0xffffff);
    light.position.set(100, 300, 200);
    scene.add(light);

    // add the output of the renderer to the html element
    //document.body.appendChild(container);
    container.appendChild( webGLRenderer.domElement );

    var material = new THREE.MeshLambertMaterial( { color: config.objectColor } );
    mesh = new DNAMesh(new THREE.Geometry(), material);
    mesh.initialize(10, 5);
    mesh.geometry.center();

    for(var j = 0; j < config.noOfObjects; j++){
      meshes.push(mesh.clone());
      meshes[j].position.set(Math.random()*2*xmax-xmax, Math.random()*2*ymax-ymax, Math.random()*0.5*cameraDistance);
      meshes[j].rotation.set(Math.random()*2*Math.PI, Math.random()*2*Math.PI, Math.random()*2*Math.PI);
      rotations.push(new THREE.Vector3( Math.random()*0.01, Math.random()*0.01, Math.random()*0.01 ));
      scene.add( meshes[j]);
    }

    return 0;
  }

  // set up rendering and animation
  function render() {

    light.position.copy (headPos.clone().applyMatrix4(camera.matrix));

    // render using requestAnimationFrame
    for(var k = 0; k < config.noOfObjects; k++){
      meshes[k].rotation.x += rotations[k].x;
      meshes[k].rotation.y += rotations[k].y;
      meshes[k].rotation.z += rotations[k].z;
      if(config.rain){
      meshes[k].position.y -= 0.01*meshes[k].position.z;
      if(meshes[k].position.y < -ymax) meshes[k].position.y = ymax;
      }

    }
    requestAnimationFrame(render);
    webGLRenderer.render(scene, camera);
  }


  function onWindowResize(){
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    webGLRenderer.setSize( container.clientWidth, container.clientHeight);
  }


  // Initialize renderer
  try { 
    init();
  }
  catch(err) {
    console.log("Error initializing:", err.message);
  }
  // start rendering
  if(webGLRenderer && container){
    window.addEventListener( 'resize', onWindowResize, false );
    render();
  }
}

