var Ant = function(n, r){
  this.position = new THREE.Vector3(0,0,0);
  this.velocity = new THREE.Vector3(0,0,0);
  this.radius   = 5;
  this.material; this.id; this.follow; this.mesh;
  this.create   = function(){
    this.color    = new THREE.Color().setRGB(
      (100+Math.random()*90)/255.0,
      (100+Math.random()*10)/255.0,
      (100+Math.random()*90)/255.0
    );
    this.material = new THREE.MeshLambertMaterial({ 
      color:this.color
    });
    this.mesh = new THREE.Mesh(
  		new THREE.SphereGeometry(this.radius,7,7),
  		this.material
  	);
    // this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = r;
    this.mesh.position.set(
        Math.random()*width-width/2, 
        Math.random()*width-width/2 ,
        Math.random()*width-width/2
    );
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