var AntChase = function(params){
  this.scene = params.scene;
  this.numberAnts = 200;
  this.lastNAnts = 200;
  this.nAnts = 200;
  this.delta = 0.2;
  this.velocityScale= 0.1;
  this.ants  = [];
  this.radius = 5;
  this.pause = false;
  this.trailCurrent = 0;
  this.restart = false;
  this.trailSize = 1;
  this.delta = 0.1;
  this.showAnts = true;
  this.x=Math.random();
  this.rInit = 3.2;
  this.r = this.rInit;
  this.rMax = 4.0;
  this.rStepInit = 0.0004;
  this.rStep = this.rStepInit;
  this.iterationCount = 300;
  
  this.rRange = function(){ return this.rMax-this.rInit };
  this.resetRange = function(xStart,xEnd){
        this.rMax = xEnd;
    this.rInit = this.r = xStart;
    // this.rStep = this.rRange()*1.5*this.rStepInit;
    // this.iterationCount = this.rRange()
  }
  this.size = 1;
  // this.tColor = new THREE.Color()
  this.trailColor = new THREE.Color( 0xcc00bb );
  this.clock = new THREE.Clock();
  this.alpha = 0.2;
	this.uniforms = {
		amplitude: { type: "f", value: 1.0 },
		color:     { type: "c", value: new THREE.Color( 0xff0088 ) },
		alpha:     { type: "f", value: 0.2},
    // texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "textures/spark1.png" ) },
		size:      { type: "f", value: 1.0}
    // clock: {type: "f", value: 0.1 }
	};
  this.attributes = {
    // spawnAt: { type: 'f', value: [] }
  };
  this.pauseSimulation = function(){ this.pause = !this.pause; }
  this.createAnts = function(){
    // console.log(this.nAnts, this.lastNAnts, this.ants.length)
    if(this.restart && this.lastNAnts != this.ants.length) return;
    this.pause = true;    
    this.trailSize = 2;
    this.nAnts = this.numberAnts;
    this.trailNumber = 50*10000;
    this.trailMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      attributes: this.attributes,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      // alphaTest: 0.5,
      blending:    THREE.AdditiveBlending,
      depthTest:     false,
    });
    if(!this.restart){
      console.log('first start');
      this.trailGeo = new THREE.Geometry();
      this.trailGeo.spawnTimes = [];
      this.trailGeo.dynamic = true;
      for(var i=0; i<this.trailNumber; i++){
        this.trailGeo.vertices.push( new THREE.Vector3(1000,1000,1000) );
      }
      this.trail = new THREE.ParticleSystem( this.trailGeo, this.trailMaterial);
      this.scene.add(this.trail);
      requestAnimationFrame( animate );
    } else {
      console.log('restarting');
      for(var i=0; i<this.trailCurrent; i++){
        this.trail.geometry.vertices[i]= new THREE.Vector3(1000,1000,1000);
      }
    }
    this.trail = new THREE.ParticleSystem( this.trail.geometry, this.trailMaterial);
    this.trailCurrent = 0;
    this.restart = true;
    this.pause = false;
  }
  this.iterationOffset = 300;
  // this.
  this.updateVelocities = function(){
    // if(this.r<3.5) this.iterationCount=20;
    // else           this.iterationCount=200;
    if(!this.pause&&this.r<this.rMax){
      var xlast = this.x;
      this.r+=(this.rStep+Math.random()*this.rStep/2.0);
      for(var n=0; n<this.iterationOffset; n++){ this.x = this.x*this.r*(1.0-this.x); }
      for(var n=0; n<this.iterationCount; n++){
         this.x = this.x*this.r*(1.0-this.x);
         this.trail.geometry.vertices[this.trailCurrent%this.trail.geometry.vertices.length].set(
           this.r,  // x
           this.x,  // y
           0
           // Math.sqrt(this.x*this.x-xlast*xlast)        // z
         );
         this.trailCurrent++;
      }
      this.trail.geometry.verticesNeedUpdate = true;
    }
  }
}