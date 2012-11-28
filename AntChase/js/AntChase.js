var AntChase = function(params){
  this.scene = params.scene;
  this.numberAnts = 20;
  this.lastNAnts = 20;
  this.nAnts = 20;
  this.delta = 0.8;
  this.velocityScale= 0.1;
  this.ants  = [];
  this.radius = 5;
  this.pause = false;
  this.trailCurrent = 0;
  this.restart = false;
  this.trailSize = 1;
  this.trailColor = new THREE.Color( 0xcc00bb );
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
        var newAnt = new Ant(n, this.radius,this.nAnts);
        newAnt.create();
        this.ants.push( newAnt );
        this.scene.add(this.ants[n].mesh);
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
          this.ants[n] = new Ant(n,this.radius, this.nAnts);
          this.ants[n].create();
          this.scene.add(this.ants[n].mesh);
        }
      } else {
        for(var n=0;n<this.nAnts; n++){
          this.ants[n].setRandomPosition();
        }
        var nLeft = this.lastNAnts-n;
        var nIndex = n;
        for(;n<this.lastNAnts; n++){
          this.scene.remove(this.ants[n].mesh);
        }
        this.ants.splice(nIndex, nLeft);
      }
    }
    this.trailMaterial = new THREE.ParticleBasicMaterial({
      // uniforms: this.uniforms,
      // attributes: this.attributes,
      // vertexShader: vertShader,
      // fragmentShader: fragShader,
      // transparent: true,
      color:this.trailColor,
      // vertexColors:true,
      // size:1,
      // sizeAttenuation:true
      transparent: true,
      // blending: THREE.AdditiveBlending,
      // depthTest: true,
      opacity:0.4
    });
    if(!this.restart){
      console.log('first start');
      this.trailGeo = new THREE.Geometry();
      this.trailGeo.dynamic = true;
      for(var i=0; i<this.trailNumber; i++){
        this.trailGeo.vertices.push( new THREE.Vector3(1000,1000,1000) );
        // this.trailGeo.colors.push( new THREE.Color( ).setRGB(Math.random()*0.1+0.7,Math.random()*0.5,Math.random()*0.8) );
      }
      this.trail = new THREE.ParticleSystem( this.trailGeo, this.trailMaterial);
      this.scene.add(this.trail);
      requestAnimationFrame( animate );
    } else {
      console.log('restarting');
      // scene.remove(this.trail);
      for(var i=0; i<Math.min(this.trailCurrent,this.trailNumber); i++){
        this.trail.geometry.vertices[i]= new THREE.Vector3(1000,1000,1000);
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
      for(var n=0;n<this.ants.length; n++){
        var nextAntPos = this.ants[Math.min((n+1)%this.ants.length,(n+1)%this.nAnts)].mesh.position;
        if(this.ants[n]!=undefined){
          this.ants[n].updateVelocity(nextAntPos, this.velocityScale, this.delta);
          this.trail.geometry.vertices[this.trailCurrent%this.trail.geometry.vertices.length].copy( this.ants[n].mesh.position );
          this.trailCurrent++;
        }
      }
    }
    this.trail.geometry.verticesNeedUpdate = true;
    
  }
}