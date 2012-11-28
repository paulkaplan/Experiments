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
  this.size = 1;
  // this.tColor = new THREE.Color()
  this.trailColor = new THREE.Color( 0xcc00bb );
  this.clock = new THREE.Clock();
  this.alpha = 0.2;
	this.uniforms = {
		amplitude: { type: "f", value: 1.0 },
		color:     { type: "c", value: new THREE.Color( 0xff0088 ) },
		alpha:     { type: "f", value: 0.2},
		texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "textures/spark1.png" ) },
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
    this.trailNumber = 40*10000;
    if(!this.restart){ 
      this.ants = []; 
      for(var n=0;n<this.nAnts; n++){
        var newAnt = new Ant(n, this.radius);
        newAnt.create();
        this.ants.push( newAnt );
        // if(this.showAnts){
          // this.scene.add(this.ants[n].mesh);
        // }
      }
    } else {
      if(this.nAnts > this.lastNAnts){
        for(var n=0;n<this.lastNAnts; n++){
          this.ants[n].mesh.position.set(
              Math.random()*width-width/2, 
              Math.random()*height-height/2, 
              Math.random()*width-width/2
          );        
        }
        for(--n;n<this.nAnts;n++){
          this.ants[n] = new Ant(n,this.radius);
          this.ants[n].create();
          // this.scene.add(this.ants[n].mesh);
        }
      } else {
        for(var n=0;n<this.nAnts; n++){
          this.ants[n].mesh.position.set(
              Math.random()*width-width/2, 
              Math.random()*height-height/2, 
              Math.random()*width-width/2
          );        
        }
        var nLeft = this.lastNAnts-n;
        var nIndex = --n;
        for(;n<this.lastNAnts; n++){
          // this.scene.remove(this.ants[n].mesh);
        }
        this.ants.splice(nIndex, nLeft);
      }
    }
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
        // this.attributes.spawnAt.value.push(0.0);
        // this.trailGeo.colors.push( new THREE.Color( ).setRGB(Math.random()*0.1+0.7,Math.random()*0.5,Math.random()*0.8) );
      }
      this.trail = new THREE.ParticleSystem( this.trailGeo, this.trailMaterial);
      this.scene.add(this.trail);
      requestAnimationFrame( animate );
    } else {
      console.log('restarting');
      // scene.remove(this.trail);
      for(var i=0; i<this.trailCurrent; i++){
        this.trail.geometry.vertices[i]= new THREE.Vector3(1000,1000,1000);
        // this.attributes.spawnAt.value[i]=0.0;
      }
    }
    this.trail = new THREE.ParticleSystem( this.trail.geometry, this.trailMaterial);
    this.trailCurrent = 0;
    this.restart = true;
    this.pause = false;
    // this.
    // scene.simulate();
    this.lastNAnts = this.nAnts;
  }
  this.updateVelocities = function(){
    if(this.trailCurrent >= this.trailNumber){ this.pause=true; }
    if(!this.pause){
      // this.uniforms.clock.value+=this.ants.length;
      for(var n=0;n<this.ants.length; n++){
        var nextAntPos = this.ants[Math.min((n+1)%this.ants.length,(n+1)%this.nAnts)].mesh.position;
        if(this.ants[n]!=undefined){
          this.ants[n].updateVelocity(nextAntPos, this.velocityScale, this.delta);
          this.trail.geometry.vertices[this.trailCurrent%this.trail.geometry.vertices.length].copy( this.ants[n].mesh.position );
          this.trailCurrent++;
          // this.attributes.spawnAt.value[this.trailCurrent%this.trail.geometry.vertices.length]=this.trailCurrent;
          this.trail.geometry.verticesNeedUpdate = true;
          // console.log(this.trail.geometry.spawn)
        }
      }
    }
  }
}