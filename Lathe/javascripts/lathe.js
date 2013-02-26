  
  // Check for webgl
  // http://code.google.com/p/webgl-globe/source/browse/globe/Three/Detector.js
  function lathe(){


  Detector = {
    canvas : !! window.CanvasRenderingContext2D,
    webgl : ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
  }

  var attributes = {
        displacement: {
          type: 'f', // a float
          value: [] // an empty array
         }
  };
  if( Detector.webgl )
    var renderer = new THREE.WebGLRenderer();
  else
    var renderer = new THREE.CanvasRenderer();
  
    renderer.setSize( window.innerWidth, window.innerHeight )

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(
                                    35,             // Field of view
                                    window.innerWidth/window.innerHeight,
                                    0.1,            // Near plane
                                    10000           // Far plane
                                );
    camera.position.set( -15, 0, 10 );
    camera.lookAt( scene.position );

    scene.add( camera );
    var numberHeight = 66;
    var numberRadial = 66;
    var geo = new THREE.CylinderGeometry(2, 2, 9, numberRadial, numberHeight);
        geo.dynamic = true;
    var material = new THREE.MeshLambertMaterial( { 
      color: 0x00e0ff ,
      shading: THREE.FlatShading } );
    var cyl  = new THREE.Mesh(
                            geo, 
                            material
                            );
    var pristine = new THREE.CylinderGeometry(2, 2, 9, numberRadial, numberHeight)

    for(var n=0; n<cyl.geometry.vertices.length; n++){
      attributes.displacement.value.push(0);
    }


    // cyl.dynamic = true;
    // cyl.geometry.computeFaceNormals();
    // cyl.geometry.computeVertexNormals();
    cyl.position.set(0, -0.5,0)
    scene.add( cyl );
    var string = new BeadedString(800, numberHeight+1);
    string.initBeads( [0, 0] );


    // get id from url
    // http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
    function getURLParameter(name) {
      return decodeURI(
          (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
      );
    }



    // var light = new THREE.PointLight( 0xFFFFFF );
    // light.position.set( -12,0, 10 );
    // scene.add( light );
    // string.tool = 'square';
    var light = new THREE.PointLight( 0xFFFF00, 0.75);
    light.position.set(-10, 10, 1)
    scene.add(light);

    var light2 = new THREE.PointLight( 0x00FFFF, 0.5 );
    light2.position.set(-5, -4, 10)
    scene.add(light2);


    var light3 = new THREE.PointLight( 0x00FFFF, 0.5 );
    light3.position.set(-5, 2, -10)
    scene.add(light3);


    function animate(){
          document.body.appendChild( renderer.domElement );
      requestAnimationFrame( animate );
      modify();
      render();
    } 
    function normalize(v){
  // var n = {
  //   x : v.x / m
  //   y : v.y / m
  // }
  var m = Math.sqrt(v.x*v.x + v.z*v.z);
  return  {
    x : v.x / m,
    z : v.z / m
  };
}
    function setRing(attr, ring, val){
      for(var j=ring*numberRadial+ring; j<ring*numberRadial+numberRadial+ring+1; j++ ){
        var theta = (j-ring*numberRadial+ring) / (ring*numberRadial+numberRadial+ring+1);
          var n = normalize( pristine.vertices[j] );
          attr[j].x = pristine.vertices[j].x+0.1*val*n.x;
          attr[j].z = pristine.vertices[j].z+0.1*val*n.z;
      }
    }

    var mouseX, mouseY;
    var closest;
    function modify(){
      cyl.rotation.y+=0.1;
      // sphere.position.copy
      if(clicking){
        string.applyToolAt( closest );
        // string.applyTool( [mouseY, mouseX]  );
        applyBeads();
      }
    }

    function applyBeads(){
      for(var n=0; n<numberHeight+1; n++){
        setRing(cyl.geometry.vertices, n, string.beads[n][1] );
      }
    cyl.geometry.computeFaceNormals();
    // cyl.geometry.computeVertexNormals();
    cyl.geometry.normalsNeedUpdate = true;
    cyl.geometry.verticesNeedUpdate = true;

    }
    var clicking = false;
    

    function render () {
      renderer.render( scene, camera );
    }


    function exportVerts(){
      var stl = generateSTL( cyl.geometry );
      var blob = new Blob([stl], {type: 'text/plain'});
      saveAs(blob, 'lathe.stl');
    }

    var undo_stack = new UndoStack(string.beads);
    animate();


    // Tools
    for( var n=0; n<string.toolArray.length; n++ ){
      // console.log(n, typeof(n));
      var tool = string.toolArray[n];
      console.log(tool);
      $("#"+tool ).click( function(e){
        string.tool = this.id;
        if( $(this).parent().parent().hasClass('selected') ){
          string.direction *= -1;
          if( $(this).parent().parent().hasClass('reversed') ){
            $(this).parent().parent().removeClass('reversed');
          } else {
            $(this).parent().parent().addClass('reversed');
          }
        } else {
          string.direction = 1;
          $(".tool").each( function(){ 
            $(this).removeClass('selected reversed') 
          })
          $(this).parent().parent().addClass('selected');
        }
      });
    }

    function reset(){
      string.reset();
      applyBeads();
    }
    function undo(){
      var lastConfig = undo_stack.pop();
      if(lastConfig != "ERROR"){
        string.beads = lastConfig;
        applyBeads();
      }
      // debug(undo_stack.last);
    }

    $("#submit").click( exportVerts );
    var mouse3D= new THREE.Vector3(0,0,0);
    // var closest = 0;
    var projector = new THREE.Projector();
    $("canvas").bind('mousedown', function(e){
      mouse3D.x = ((e.pageX-4*e.target.offsetLeft) / renderer.domElement.width) * 2 - 1;
      mouse3D.y = -((e.pageY-e.target.offsetTop)/ renderer.domElement.height) * 2 + 1;
      mouse3D.z = 0.5
      // console.log(renderer.domElement.width)
      projector.unprojectVector(mouse3D, camera);
      var ray = new THREE.Ray(camera.position, mouse3D.subSelf(camera.position).normalize());
      var intersects = ray.intersectObject(cyl);
      // var closest = cyl.position.y +intersects[0].point.y;
      // console.log(intersects)
      if(intersects[0]!==undefined){
        clicking = true;
        // console.log(intersects[0].point.y, mouse3D.y)
        closest = cyl.position.y+1+intersects[0].point.y + 4.5;
        closest /= 9
        // closest 
        closest *= numberHeight;
        closest = numberHeight-closest;
        // console.log(closest)
        undo_stack.push( string.beads );
      }
    });

    $("canvas").bind('mouseup', function(e){
      clicking = false;
    })
    $("canvas").bind('mousemove', function(e){
      mouseX = e.clientX;
      mouseY = e.clientY;
    })
    $("#undo").click( undo );

    function debug(v){
      $("#debug").text(v);
    }
}

$(document).ready( function(){
  // console.log()
    lathe();
})