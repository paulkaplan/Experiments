
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , fs   = require('fs');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// app.get('/', function());
app.post('/verts', function(req, res){

  var numberRadial = req.body.numberRadial;
  var numberHeight = req.body.numberHeight;
  var verts = req.body.verts;
  var innerVerts = deepCopy( verts );
  var lowestInner = numberHeight-1;
  var narrowest = 0;

  var disps = req.body.disps;
  // console.log( disps )
  var tris  = [];
  for(var r = 0; r<numberHeight+1; r++){
    for(var n= r*numberRadial+r; n<r*numberRadial+numberRadial+r+1; n++){
      var v =  verts[n];
      var iv = innerVerts[n];
      var no = normalize( v );

      v.x += 0.1*no.x*disps[r][1];
      v.z += 0.1*no.z*disps[r][1];
      
      // Inner
      iv.x /= 1.1;
      iv.z /= 1.1;
      iv.x += 0.1*no.x*disps[r][1];
      iv.z += 0.1*no.z*disps[r][1];
    }
    if(disps[r][1]<narrowest){
      // console.log("Setting bottom: "+r);
      narrowest = disps[r][1];
      lowestInner =  r;
    }
  }
  // Also displace the bottom vert up
  var bottomInner = innerVerts[verts.length-1]
    bottomInner.x = 0; 
    bottomInner.y = 0;
    bottomInner.y = innerVerts[lowestInner-1].y;

  for(var r = 0; r<numberHeight+1; r++){
    for(var i=0; i<numberRadial; i++){
      var index = (i+r*numberRadial);
          tris.push( [verts[index+numberRadial],   verts[index+numberRadial+1], verts[index]] );
          tris.push( [verts[index+numberRadial+1], verts[index+1],              verts[index]] );

          // Inner
          if(r<lowestInner){
            tris.push( [innerVerts[index], innerVerts[index+numberRadial+1], innerVerts[index+numberRadial]] );
            tris.push( [innerVerts[index], innerVerts[index+1], innerVerts[index+numberRadial+1]] );
          }
    }
  }

  // Inner Bottom
  for(var i=numberRadial*(lowestInner)+lowestInner; i<numberRadial*(lowestInner)+numberRadial+lowestInner; i++){
    var index = i;
    tris.push([innerVerts[index], {x:0, y:innerVerts[lowestInner*numberRadial+numberRadial+1].y,z:0}, innerVerts[index+1]]);
  }

  // Outer Bottom
  for(var i=numberRadial*(numberHeight)+(numberHeight); i<numberRadial*(numberHeight)+numberRadial+numberHeight; i++){
    var index = i;
    tris.push([verts[index], verts[verts.length-1], verts[index+1]]);
  }

  // Inner/Outer gap
  for(var i=0; i<numberRadial; i++){
    var index = i;
    tris.push([verts[index+1], innerVerts[index], verts[index]]);
    tris.push([innerVerts[index+1], innerVerts[index], verts[index+1]]);
  }

  var now = new Date();
  var stream = fs.createWriteStream( "stl/"+now.getHours()+"_"+now.getMinutes()+"_"+now.getSeconds()+"_"+now.getMilliseconds()+".stl");
  
  // ASCII STL write
  stream.once('open', function(fd) {
    stream.write("solid cyl");
    for(var i = 0; i<tris.length; i++){
      stream.write("facet normal 0.0 0.0 0.0 \n");
      stream.write("outer loop \n");
      stream.write("vertex "+tris[i][0].x+" "+tris[i][0].y+" "+tris[i][0].z+" \n");
      stream.write("vertex "+tris[i][1].x+" "+tris[i][1].y+" "+tris[i][1].z+" \n");
      stream.write("vertex "+tris[i][2].x+" "+tris[i][2].y+" "+tris[i][2].z+" \n");
      stream.write("endloop \n");
      stream.write("endfacet \n");
    }
    stream.write("endsolid");
    stream.end();
  });
  
  //
  // Binary STL write
  // Format - from http://en.wikipedia.org/wiki/STL_(file_format)#Binary_STL
  /*  UINT8[80] – Header
      UINT32 – Number of triangles

      foreach triangle (4*3*4 byte size / triangle)
        REAL32[3] – Normal vector
        REAL32[3] – Vertex 1
        REAL32[3] – Vertex 2
        REAL32[3] – Vertex 3
        UINT16 – Attribute byte count
      end

  */
  //
  
  // // 1. compute the size
  //   var size  = tris.length*(4*3*4+2);
  //       size += 10; // Header
  //       size += 4;  // Number of triangles
  //   var b = new Buffer(size);
  //   var cursor = 0;
  
  // // 2. write header
  //   b.fill(0, 0, 10);
  //   cursor += 10;
  
  // // 3. write num tris
  //   b.writeUInt32LE(tris.length, cursor);
  //   cursor += 4;
  
  // // 4. write triangles
  //   for(var i = 0; i<tris.length; i++){
  //     cursor = writeZeroVectorToBuffer(b, cursor);
  //     cursor = writeVectorToBuffer(tris[i][0], b, cursor);
  //     cursor = writeVectorToBuffer(tris[i][1], b, cursor);
  //     cursor = writeVectorToBuffer(tris[i][2], b, cursor);
  //     b.writeUInt16LE(0, cursor);                 cursor+=2;
  //   }

  // // 5. write the buffer to file
  //   fs.writeFileSync(createFileName(), b);




});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// function computeSize
function createFileName(){
  now = new Date();
  return "stl/"+now.getHours()+"_"+now.getMinutes()+"_"+now.getSeconds()+"_"+now.getMilliseconds()+".stl"
}
function writeVectorToBuffer(v, b, offset){
  b.writeFloatLE(v.x, offset);
  b.writeFloatLE(v.y, offset+4);
  b.writeFloatLE(v.z, offset+8);
  return offset +4*4;
}
function writeZeroVectorToBuffer(b, offset){
  var v = {x:0, y:0, z:0};
  writeVectorToBuffer(v, b, offset);
  return offset + 4*4;
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
};

//http://james.padolsey.com/javascript/deep-copying-of-objects-and-arrays/
function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}