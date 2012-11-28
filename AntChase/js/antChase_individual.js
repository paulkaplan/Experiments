var AntChase = function(params){
  this.scene = params.scene;
  this.numberAnts   = 20;
  this.lastNAnts    = 20;
  this.nAnts        = 20;
  this.delta        = 0.2;
  this.velocityScale= 0.1;
  this.ants         = [];
  this.radius       = 5;
  this.pause        = false;
  this.trailCurrent = 0;
  this.restart      = false;
  this.trailSize    = 1;
  this.delta        = 0.1;
  this.trailLifetime = 80;
  this.size = 1;
  // this.fadeOutTime 
  // this.tColor = new THREE.Color()
  this.trailColor = new THREE.Color( 0xcc00bb );
  this.trailColor = new THREE.Color( 0x00CCB4 );
  this.clock = new THREE.Clock();
  this.alpha = 0.2;
	this.uniforms = {
    // amplitude: { type: "f", value: 1.0 },
    // alpha:     { type: "f", value: 0.2},
		color:     { type: "c", value: this.trailColor },
    // texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "textures/spark1.png" ) },
    // size:      { type: "f", value: 1.0},
		uTime:     { type: "f", value: 1.0},
		uLifeTime: { type: "f", value: this.trailLifetime }
    // clock: {type: "f", value: 0.1 }
	};
  this.attributes = {
    customColor: { type: 'c', value: [] },
    aTime: { type: 'f', value: [] }
  };
  this.pauseSimulation = function(){ this.pause = !this.pause; }
  this.createAnts = function(){
    // console.log(this.nAnts, this.lastNAnts, this.ants.length)
    if(this.restart && this.lastNAnts != this.ants.length) return;
    this.pause = true;    
    this.trailSize = 2;
    this.nAnts = this.numberAnts;
    this.trailNumber = 40*10000;
    if(!this.restart){ 
      this.ants = []; 
      for(var n=0;n<this.nAnts; n++){
        var newAnt = new Ant(n, this.radius, this.nAnts);
        newAnt.create();
        this.ants.push( newAnt );
        // if(this.showAnts){
          // this.scene.add(this.ants[n].mesh);
        // }
      }
    } else {
      if(this.nAnts > this.lastNAnts){
        for(var n=0;n<this.lastNAnts; n++){
          this.ants[n].setRandomPosition();
        }
        for(--n;n<this.nAnts;n++){
          this.ants[n] = new Ant(n,this.radius, this.nAnts);
          this.ants[n].create();
          // this.scene.add(this.ants[n].mesh);
        }
      } else {
        for(var n=0;n<this.nAnts; n++){
          this.ants[n].setRandomPosition();   
        }
        var nLeft = this.lastNAnts-n;
        var nIndex = --n;
        for(;n<this.lastNAnts; n++){
          // this.scene.remove(this.ants[n].mesh);
        }
        this.ants.splice(nIndex, nLeft);
      }
    }
    if(!this.restart){
      console.log('first start');
      this.trailGeo = new THREE.Geometry();
      this.trailGeo.spawnTimes = [];
      this.trailGeo.dynamic = true;
      this.trailMaterial = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        attributes: this.attributes,
        vertexShader: vertShader,
        fragmentShader: fragShader,
        // blending:    THREE.AdditiveBlending,
        // depthTest:     true,
        transparent: true
      });
      for(var i=0; i<this.trailNumber; i++){
        this.trailGeo.vertices.push( new THREE.Vector3(1000,1000,1000) );
        this.attributes.aTime.value.push(0);
        this.attributes.customColor.value.push( new THREE.Color( 0x00CCB4 ) );
        // this.attributes.color.value.push( new THREE.Color( ).setRGB(Math.random()*0.1+0.7,Math.random()*0.5,Math.random()*0.8) );
      }
      this.trail = new THREE.ParticleSystem( this.trailGeo, this.trailMaterial);
      this.scene.add(this.trail);
      requestAnimationFrame( animate );
    } else {
      console.log('restarting');
      // scene.remove(this.trail);
      for(var i=0; i<this.trailCurrent; i++){
        this.trail.geometry.vertices[i].set( 1000,1000,1000 );
        this.attributes.aTime.value[i]=0.0;
      }
    }
    this.trail = new THREE.ParticleSystem( this.trail.geometry, this.trailMaterial);
    this.trailCurrent = 0;
    this.restart = true;
    this.pause = false;
    this.advanceNSteps = 10;
    // this.
    // scene.simulate();
    this.lastNAnts = this.nAnts;
  }
  this.computeCoM = function(){
    var com = new THREE.Vector3();
    for(var n=0;n<this.ants.length; n++){
      com.x+=this.ants[n].mesh.position.x;
      com.y+=this.ants[n].mesh.position.y;
      com.z+=this.ants[n].mesh.position.z;
    }
    com.x /= this.ants.length;
    com.y /= this.ants.length;
    com.z /= this.ants.length;
    return com;
  }
  this.updateVelocities = function(){
    
    if(this.trailCurrent >= this.trailNumber){ this.pause=true; }
    if(!this.pause){
      
      antChase.uniforms.uTime.value = antChase.clock.getElapsedTime();
      
      // this.uniforms.clock.value+=this.ants.length;
      for(var n=0;n<this.ants.length; n++){
        var time = this.clock.getElapsedTime();
        var nextAntPos = this.ants[Math.min((n+1)%this.ants.length,(n+1)%this.nAnts)].mesh.position;
        if(this.ants[n]!=undefined){
          this.ants[n].updateVelocity(nextAntPos, this.velocityScale, this.delta);
          this.trail.geometry.vertices[this.trailCurrent%this.trail.geometry.vertices.length].copy( this.ants[n].mesh.position );
          this.trailCurrent++;
          this.attributes.aTime.value[this.trailCurrent%this.trail.geometry.vertices.length]=time;
          this.attributes.customColor.value[this.trailCurrent%this.trail.geometry.vertices.length-1]=this.ants[n].color;
          this.attributes.aTime.needsUpdate = true;
          this.attributes.customColor.needsUpdate = true;
          this.trail.geometry.verticesNeedUpdate = true;
        }
      }
    }
  }
}