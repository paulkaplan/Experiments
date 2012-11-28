var Ant = function(n, r, nAnts){
  this.position = new THREE.Vector3(0,0,0);
  this.velocity = new THREE.Vector3(0,0,0);
  this.radius   = 2;
  this.material; this.id; this.follow; this.mesh;
  this.setRandomPosition = function(){
    this.mesh.position.set(
        Math.random()*width-width/2, 
        Math.random()*width-width/2,
        Math.random()*width-width/2
    );
  }
  this.color    = new THREE.Color().setHSV(
    n/nAnts - Math.floor(n/nAnts),
    0.5,
    // 0.5+0.5*Math.random(),// (100+Math.random()*100)/255.0,
    0.5
    // (100+Math.random()*90)/255.0
  );
  this.create   = function(){
    // console.log(this.color)
    this.material = new THREE.MeshLambertMaterial({ 
      color:this.color ,
      blending: THREE.AdditiveBlending
    });
    this.mesh = new THREE.Mesh(
  		new THREE.SphereGeometry(1,8,8),
  		this.material
  	);
    this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = this.radius;
    this.setRandomPosition();
    this.id       = n;
    this.follow   = n+1;
  }
  this.updateVelocity = function(nextAntPosition, vScale, delta){
    this.velocity.x = vScale*(nextAntPosition.x-this.mesh.position.x);
    this.velocity.y = vScale*(nextAntPosition.y-this.mesh.position.y);
    this.velocity.z = vScale*(nextAntPosition.z-this.mesh.position.z);
    this.mesh.position.x += delta*this.velocity.x;
    this.mesh.position.y += delta*this.velocity.y;
    this.mesh.position.z += delta*this.velocity.z;
  }
}