/*
  extending cannon for cylinders
  @author paulkaplan
*/

var lerp = function(v, min,max,newMin,newMax){
  var oldRange = max-min;
  var newRange = newMax-newMin;
  return ( v/oldRange )*newRange+newMin;
}

var cylinder = function(radius, height){
  var verts = [], faces = [], faceNormals = [];
  var rings = 10;
  var ringPoints = 10;
  var r = radius;
  var h = height
  for(var z=0;z<rings;z++){
    var vertRow = [];
    for(var i=0;i<ringPoints; i++){
      phi = lerp(i, 0, ringPoints, 0, 2*Math.PI);
      vertRow.push( new CANNON.Vec3(r*Math.cos(phi), r*Math.sin(phi), h*z / rings));
    }
    verts.push( vertRow );
  }
  // Faces
  for(var z=0;z<rings-1;z++){
    for(var i=0;i<ringPoints-1;i++){
      faces.push( new CANNON.Vec3(verts[z+1][i], verts[z+1][i+1], verts[z][i]));
      faces.push( new CANNON.Vec3(verts[z][i], verts[z][i+1], verts[z+1][i+1]));
    }
  }
  // Face normals
  for(var n=0;n<faces.length; n++){
    
    // http://gmc.yoyogames.com/index.php?showtopic=374068
    var v1 = faces[n].x;
    var v2 = faces[n].y;
    var v3 = faces[n].z;
    
    var x1 = v1.x;
    var x2 = v2.x;
    var x3 = v3.x;
    
    var y1 = v1.y;
    var y2 = v2.y;
    var y3 = v3.y;
    
    var z1 = v1.z;
    var z2 = v2.z;
    var z3 = v3.z;
    
    var nx1 = (y3-y1)*(z2-z1)-(y2-y1)*(z3-z1);
    var ny1 = (z3-z1)*(x2-x1)-(z2-z1)*(x3-x1);
    var nz1 = (x3-x1)*(y2-y1)-(x2-x1)*(y3-y1);
    var fac1= Math.sqrt((nx1*nx1)+(ny1*ny1)+(nz1*nz1));
    faceNormals.push( new CANNON.Vec3( nx1/fac1, ny1/fac1, nz1/fac1))
  }

  
  return {
    vertices : _.flatten(verts),
    faces : faces,
    normals : faceNormals
  }
}



// CANNON.Shape.types.CYLINDER = 32;
// CANNON.Cylinder = function(radius, height){
//     CANNON.Shape.call(this);
// 
//     this.radius = radius!=undefined ? Number(radius) : 1.0;
//     this.height = height!=undefined ? Number(height) : 1.0;
//     this.type = CANNON.Shape.types.CYLINDER;
// };
// CANNON.Cylinder.prototype = new CANNON.Shape();
// CANNON.Cylinder.prototype.constructor = CANNON.Cylinder;
// 
// CANNON.Cylinder.prototype.calculateLocalInertia = function(mass,target){
//   target = target || new CANNON.Vec3();
//   var I_centralAxis = 0.5*mass*this.radius*this.radius;
//   var I_centralDiameter = 0.5*I_centralAxis + (1.0/12.0)*mass*this.height+this.height
//   target.x = I_centralAxis;
//   target.y = I_centralDiameter;
//   target.z = I_centralDiameter;
//   return target;
// };
// 
// CANNON.Cylinder.prototype.volume = function(){
//   return Math.PI * this.radius * this.radius * this.height;
// };
// 
// CANNON.Cylinder.prototype.boundingSphereRadius = function(){
//   return Math.sqrt( this.radius*this.radius + (this.height/2.0)*(this.height/2.0) );
// };