

var Integrator = MD.Integrator = function(){
	this.nParticles = 0;
	this.particles  = [];
	this.dt = Math.pow(10, -2.50);
	this.time = 0;
};

Integrator.prototype.step = function(){
	
	// this.gearIntegrate();
	this.verletIntegrate();
	this.time += this.dt;
}
Integrator.prototype.verletIntegrate = function(){
	// http://www.compsoc.man.ac.uk/~lucky/Democritus/Theory/verlet.html#velver
	// Zero forces
	for( var n=0; n<this.particles.length; n++){
			this.particles[n].zero_force();
	}
	
	// (step 1) velocity half step
	for( var n=0; n<this.particles.length; n++){
		if(this.particles[n].type==0){
			this.particles[n].velocityHalfStep(this.dt);
		}
	}
	// (step 0) calculate forces
	for( var i=0; i<this.particles.length-1; i++){
		for( var j=i+1; j<this.particles.length; j++){	
			if(this.particles[i].type==0 || this.particles[j].type==0){
				 Sphere.force( this.particles[i], this.particles[j] );
			}
		}
	}
	// (step 2, 3) position full step, velocity (second) half step
	for( var n=0; n<this.particles.length; n++){
		if(this.particles[n].type==0){
			this.particles[n].positionStep(this.dt)
			this.particles[n].velocityHalfStep(this.dt);
		} else {
			this.particles[n].boundary(this.dt, this.time);
		}
	}
}