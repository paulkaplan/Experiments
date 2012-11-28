/*
Strategy : 
  (1) find the wall that the point will collide with
  (2) use a numerical root finder to approximate it. 

(1) finding the right wall
  eq. we want to solve is r_wall = v*t + r_init, for t
  problem is we don't know what r_wall is. We know it can have 6 forms
  r_wall : with x,y,z as any value,xmin/xmax etc. as boundarys
    (xmin,  y,    z   )
    (xmax,  y,    z   )
    (x,     ymin, z   )
    (x,     ymax, z   )
    (x,     y,    zmin)
    (x,     y,    zmax)
  1st idea is to just find what the x,y,z parts of each of these solutions is and use it to confirm the correct one
  vx,vy,vz can only take you along a certain path.
  example:
    xmin = -1, check for this for particle initially at (0,0,0) going at v=(0,1,0) [obviously won't work, thats the point]
               don't have to check this one, just note that x>xmin && vx>=0
               double in fact, don't check any wall solutions that occur where the vi component is 0



*/
var pk = {};

pk.Solver = function( position, velocity, boundary ){
  // boundary format : [ xmin,xmax,ymin,ymax,zmin,zmax ]
  this.position = position;
  this.velocity = velocity;
  this.boundary = ( boundary !== undefined ) ? boundary : [-1,1,-1,1,-1,1];
  this.possibleWalls = 0x0;
  this.xminFlag =  1 << 0;
  this.xmaxFlag =  1 << 1;
  this.yminFlag =  1 << 2;
  this.ymaxFlag =  1 << 3;
  this.zminFlag =  1 << 4;
  this.zmaxFlag =  1 << 5;
  this.flags = [
    this.xminFlag,
    this.xmaxFlag,
    this.yminFlag,
    this.ymaxFlag,
    this.zminFlag,
    this.zmaxFlag
  ];
  this.fudge = 0.1;
  this.guess = Math.abs(this.boundary[0]/this.velocity.x);
}

pk.Solver.prototype = {
  constructor: pk.Solver,
  rejectTrivialSolutions : function(){
    if(this.velocity.x == 0){ 
      this.possibleWalls |= this.xminFlag;
      this.possibleWalls |= this.xmaxFlag;
    }  if(this.velocity.y==0){
      this.possibleWalls |= this.yminFlag;
      this.possibleWalls |= this.ymaxFlag;
    }  if(this.velocity.z==0){
      this.possibleWalls |= this.zminFlag;
      this.possibleWalls |= this.zmaxFlag;
    }  if(this.velocity.x>0){
      this.possibleWalls |= this.xminFlag;
    }  if(this.velocity.x<0){
      this.possibleWalls |= this.xmaxFlag;
    }  if(this.velocity.y>0){
      this.possibleWalls |= this.yminFlag;
    }  if(this.velocity.y<0){
      this.possibleWalls |= this.ymaxFlag;
    }  if(this.velocity.z>0){
      this.possibleWalls |= this.zminFlag;
    }  if(this.velocity.z<0){
      this.possibleWalls |= this.zmaxFlag;
    }
  },
  // reject
  reportCurrentFlags :function(){
    console.log("------flag report------");
    console.log("flag string = "+this.possibleWalls.toString(2))
    for(var n=0;n<this.flags.length;n++){
      console.log('checking flag '+ this.flags[n].toString(2))
      if(this.possibleWalls & this.flags[n]){ console.log("Flag "+n+" set") }
    }
  },
  newtonRaphson : function(f,xGuess){
    // var startTime = new Date().getMilliseconds();
    var delta, iterationCount=0;
    do {
      delta = -f(xGuess)/this.tangentDx(f,xGuess);
      xGuess = xGuess + delta;
      iterationCount++;
    }
    while(Math.abs(delta) > 1e-12);
    // var timeTaken = new Date().getMilliseconds()-startTime;
    // console.log("NewtonRaphson Complete: "+iterationCount+" iterations, in "+timeTaken+" seconds")
    return xGuess;
  },
  tangentDx : function(f,x){
    return ( f(x+pk.DELTA)-f(x) ) / pk.DELTA;
  },
  findRoots : function(i){
      // var startTime = new Date().getMilliseconds();
      
      var _t = this;
      var lim,f, soln = [];
      // console.log('root finding')
      for(var n=0;n<6; n++){
        if(_t.possibleWalls & _t.flags[n]) {
          continue;
        }
        lim = _t.boundary[n];
        if(n<2){
          f = function(t){ return _t.velocity.x*t + _t.position.x - lim }
        } else if (n<4){
          f = function(t){ return _t.velocity.y*t + _t.position.y - lim } 
        } else {
          f = function(t){ return _t.velocity.z*t + _t.position.z - lim } 
        }
        var t = _t.newtonRaphson( f, _t.guess) 
        var xAtT = _t.velocity.x*t + _t.position.x;
        var yAtT = _t.velocity.y*t + _t.position.y;
        var zAtT = _t.velocity.z*t + _t.position.z;
        // Sanity check
        if( xAtT >= _t.boundary[0]-_t.fudge && xAtT <= _t.boundary[1]+_t.fudge
          &&yAtT >= _t.boundary[2]-_t.fudge && yAtT <= _t.boundary[3]+_t.fudge
          &&zAtT >= _t.boundary[4]-_t.fudge && zAtT <= _t.boundary[5]+_t.fudge ){
            soln.push( _t.newtonRaphson( f, _t.guess) );
        }else {
          // console.log("x="+xAtT+", y="+yAtT+", z="+zAtT)
        }
      }
      // var timeTaken = new Date().getMilliseconds()-startTime;
      // console.log("Found roots in "+timeTaken+" seconds")
      // console.log(soln)
      if(soln.length==0){console.log("empty, i="+i)}
      return soln
  },
  findRootPosition : function(t){
    var _t = this;
    var xAtT = _t.velocity.x*t + _t.position.x;
    var yAtT = _t.velocity.y*t + _t.position.y;
    var zAtT = _t.velocity.z*t + _t.position.z;
    return new THREE.Vector3(xAtT,yAtT,zAtT);
  }
  
	
}
pk.DELTA = 0.0001;
// function isBetween(x,min,max){ return (x<max && x>min)}
function rejectZeroVelocity(vel){ if(vel==0){ return false; } }
function mask(arr,boolArr){
  var map = [];
  for(var n=0;n<arr.length;n++){
    if(boolArr[n]){ map.push(arr[n]) }
  }
  return map;
}