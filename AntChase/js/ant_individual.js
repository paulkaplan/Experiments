var Ant = function(n, r, nAnts){
  this.position = new THREE.Vector3(0,0,0);
  this.velocity = new THREE.Vector3(0,0,0);
  this.radius   = 5;
  this.material; this.id; this.follow; this.mesh;
  this.setRandomPosition = function(){
    this.mesh.position.set(
      Math.random()*width*2 - width, 
      Math.random()*width*2 - width,
      Math.random()*width*2 - width
    );
  }
  this.id       = n;
  this.follow   = n+1;
  this.color    = new THREE.Color().setHSV( n/nAnts, 0.5, 0.5  );
  this.create   = function(){
    this.material = new THREE.MeshLambertMaterial({ 
      color:this.color
    });
    this.mesh = new THREE.Mesh(
  		new THREE.SphereGeometry(this.radius,7,7),
  		this.material
  	);
    this.setRandomPosition();
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