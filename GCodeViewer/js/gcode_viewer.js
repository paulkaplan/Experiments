var scene, camera, renderer, controls, nozzle;
var N_COMMANDS = 0;
var FEED = 1200;
var FEED_SCALE = 0.1;
var GCODE_SCALE = 0.91;
var NOZZLE_OFFSET = 10;
// var nozzle
// var origin = new THREE.Vector3(0, 0, )

init();
animate();
// animateTestGcode();

function init(){

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
      35,         // Field of view
      window.innerWidth / window.innerHeight,  // Aspect ratio
      .1,         // Near
      10000       // Far
  );

  camera.position.set(150,150,150);
  camera.lookAt( scene.position );
  // camera.up = new THREE.Vector3(0,0,);

  renderer = new THREE.WebGLRenderer({ 
    antialias: true
    // clearColor:0x000000
   });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  controls = new THREE.OrbitControls( camera, renderer.domElement );

  var plane = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 20, 20 ), new THREE.MeshBasicMaterial( { color: 0x555555, wireframe: true } ) );
  plane.rotation.x = - Math.PI / 2;
  scene.add( plane );

  // tool = new THREE.Mesh( new THREE.SphereGeometry(0.1,10,10), new THREE.MeshNormalMaterial() );
  // scene.add(tool);

  // scene.add( initLine() );

  var loader = new THREE.STLLoader();
  loader.load( './nozzle.stl', function(geometry){
    // console.log(event)
        // var geometry = event.content;
      _.each(geometry.vertices, function(v){
        v.z -= 23;
      });
      // geometry.verticesNeedUpdate = true;

      tool = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
      tool.rotation.x = Math.PI / 2;
      tool.scale.set(0.125, 0.125, 0.125);
      scene.add( tool);

 } );

}

function render(){

  renderer.render( scene, camera );

}

function animate(){

  requestAnimationFrame( animate );

  render();

  controls.update();

  TWEEN.update();

}

function testGcode(){

  return _.reduce( _.range(100), function(memo, n){

    return memo + "G0 X"+Math.random()*30+" Y"+Math.random()*30+"\n";

  }, "")
}

function loadGcode(str){

  var gcode_str = str;

  // May not be all gcode?
  var lines = str.split("\n");

  // Filter (only G0/G1 for now)
  var filtered_lines = _.filter(lines, function(str){ return  (str.substring(0, 2)==="G0" || str.substring(0,2)==="G1"); })

  var commands = _.map(filtered_lines, function(line){

    var reX = /X([^\s]+)/g.exec(line);
    var reY = /Y([^\s]+)/g.exec(line);
    var reZ = /Z([^\s]+)/g.exec(line);
    var reF = /F([^\s]+)/g.exec(line);
    var reE = /E([^\s]+)/g.exec(line);

    var x = reX ? parseFloat( reX[1] )*GCODE_SCALE : false ;
    var y = reY ? parseFloat( reY[1] )*GCODE_SCALE : false ;
    var z = reZ ? parseFloat( reZ[1] )*GCODE_SCALE : false ;
    var f = reF ? parseFloat( reF[1] ) : false ;
    var e = reE ? parseFloat( reE[1] ) : false ;

    // console.log(x, y, z)

    return { x: x, y:z, z:y, f:f, e:e }

  })

  scene.add( initLine(commands.length) );
  N_COMMANDS = commands.length;

  return commands;

}

var commands, segments, lineGeo, tool, lastE, currE, lineColors = [];
var pos = new THREE.Vector3();
var current_position = new THREE.Vector3();

function animateGcode( commands ){

  if(cursor<commands.length){
    // console.log( "command: "+cursor+" / "+commands.length );

    current_position.copy( tool.position );
    var command = commands[cursor];

    // var final_pos = commands[cursor];
    if( commands[cursor].f ){
      FEED = command.f;
    }
    if( command[cursor].e){
      currE = command.e;
    }

    pos.x = command.x === false ? current_position.x : command.x ;
    pos.y = command.y === false ? current_position.y : command.y ;
    pos.z = command.z === false ? current_position.z : command.z ;

    // If a movement segment, drop a vertex on both sides
    // And make it transparent
    if( lastE === currE ){

      lineGeo.vertices[ cursor ].copy( current_position );
      lineGeo.verticesNeedUpdate = true;

      attributes.alpha.value[ cursor ] = 0;
      attributes.alpha.needUpdate = true;

      cursor += 1;

    }


    var tween = new TWEEN.Tween( tool.position.clone() )
        .to(pos, (1 / FEED)*FEED_SCALE)
        .onUpdate(function(){

          tool.position.set( this.x, this.y, this.z );

          lineGeo.vertices[ cursor ].set(this.x, this.y, this.z);
          lineGeo.verticesNeedUpdate = true;

        })

        .onComplete( function(){

          if( lastE === currE ){
            // Set this vertex transparent
            attributes.alpha.value[ cursor ] = 0;
            attributes.alpha.needUpdate = true;
            cursor += 1;

            // and drop another opaque one
            lineGeo.vertices[ cursor ].copy( current_position );
            lineGeo.verticesNeedUpdate = true;

            attributes.alpha.value[ cursor ] = 1;
            attributes.alpha.needUpdate = true;

            cursor += 1;
          } else {

            attributes.alpha.value[ cursor ] = 1;
            attributes.alpha.needUpdate = true;
            cursor += 1;
            
          }

          if(STATE === STATES.forward){
            cursor++;
          } else {
            cursor--;
          }

          lastE = currE;
          animateGcode( commands );

        })

        .start();

  }

}

var STATES = {
  forward  : 0,
  backward : 1
}

var STATE = STATES.forward;

function animateTestGcode(){

  var commands = loadGcode( testGcode() );
  animateGcode( commands );

}

// Reuse material
var lineMat = new THREE.LineBasicMaterial({
    color: 0x02806f,
    linewidth: 0.5,
    opacity : 0.8
});

var cursor = 0;
var max = 0;

function drawPoint(p){

  lineGeo.vertices[ max-cursor-1 ].set(p.x, p.y, p.z);
  cursor++;

  lineGeo.verticesNeedUpdate = true;

}

function initLine(cmds){

  lineGeo = new THREE.Geometry();
  for(var n=0; n<cmds; n++){

    lineGeo.vertices.push( new THREE.Vector3() );
    lineColors.push( new THREE.Color( 0x2C3E50 ) );
  }
  max = cmds;

  lineMesh = new THREE.Line( lineGeo, lineMat );
  return lineMesh;
}

function loadGcodeFromServer(name){

}