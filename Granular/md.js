var MD = {};

var Vec2 = MD.Vec2 = function( x, y, phi ){
	this.x = x; 
	this.y = y;
	this.phi = phi;
}
//
// 'static' methods
Vec2.add = function(v1, v2){
	v1.x += v2.x;
	v1.y += v2.y;
	v1.phi += v2.phi;
}
Vec2.subtract = function(v1, v2){
	v1.x -= v2.x;
	v1.y -= v2.y;
	v1.phi -= v2.phi;
}
Vec2.scale = function(v1, c){
	v1.x *= c;
	v1.y *= c;
	v1.phi *= c;
}
Vec2.copy = function(v1, v2){
	v1.x = v2.x;
	v1.y = v2.y;
	v1.phi = v2.phi;
}
Vec2.distance = function( v1, v2 ){
	return Math.sqrt( (v1.x-v2.x)*(v1.x-v2.x)+(v1.y-v2.y)*(v1.y-v2.y) );
}

//
// 'instance' methods
Vec2.prototype.dot = function(v){
	return this.x*v.x + this.y*v.y;
}
// cross prod is orthogonal, so in 2D just return the magnitude
Vec2.prototype.cross = function(v){
	return this.x*v.x - this.y*v.y;
}
Vec2.prototype.norm = function(){
	return Math.sqrt(this.x*this.x+this.y*this.y);
}
Vec2.prototype.zero = function(){
	this.x = this.y = this.phi = 0;
}

//
// 2D sphere particles
var Sphere = MD.Sphere = function(type, radius){
	this.type = type
	this.radius = radius;
	
	// particle description
	this.J = 10; // Moment of inertia
	this.m = 10; // Mass
	
	// material description
	this.Y = Math.pow(10, 5.3);
	this.A = 0.01;
	this.mu = 0.7;
	this.gamma = 100;
	
	// Position/time derivatives
	this.rtd0 = new Vec2(0,0,0); // position, named for algorithm readability
	this.rtd1 = new Vec2(0,0,0); // velocity
	this.rtd2 = new Vec2(0,0,0); // acceleration
	this.rtd3 = new Vec2(0,0,0); // higher order, for Gear integration
	this.rtd4 = new Vec2(0,0,0); // 	don't have physical meaning 
	
	// Force
	this.force = new Vec2(0,0,0);
	
	// temporary, for integrator
	this.accel = new Vec2(0,0,0);
	this.tmp = new Vec2(0,0,0);
}
Sphere.prototype.zero_force = function(){ this.force.zero(); }
Sphere.prototype.boundary = function(dt, time){
	this.rtd0.x += 1.5*(Math.cos(6*time) );
	this.rtd0.y += 1.5*(Math.sin(6*time) );
}
Sphere.prototype.predict = function(dt){
	
	var a1 = dt;
	var a2 = a1*dt/2;
	var a3 = a2*dt/3;
	var a4 = a3*dt/4;
	this.rtd0.x += a1*this.rtd1.x + a2*this.rtd2.x + a3*this.rtd3.x + a4*this.rtd4.x;
	this.rtd0.y += a1*this.rtd1.y + a2*this.rtd2.y + a3*this.rtd3.y + a4*this.rtd4.y;
	
	this.rtd1.x += a1*this.rtd2.x + a2*this.rtd3.x + a3*this.rtd4.x;
	this.rtd1.y += a1*this.rtd2.y + a2*this.rtd3.y + a3*this.rtd4.y;
	
	this.rtd2.x += a1*this.rtd3.x + a2*this.rtd4.x;
	this.rtd2.y += a1*this.rtd3.y + a2*this.rtd4.y;
	
	this.rtd3.x += a1*this.rtd4.x;
	this.rtd3.y += a1*this.rtd4.y;
	
}

MD.C0 = 19/90;
MD.C1 = 3/4;
MD.C2 = 1;
MD.C3 = 1/2;
MD.C4 = 1/12;

Sphere.prototype.correct = function(dt){
	var dtrez = 1/dt;
	var coeff0 = MD.C0 * (dt*dt/2);
	var coeff1 = MD.C1 * (dt/2);
	var coeff3 = MD.C3 * (3*dtrez);
	var coeff4 = MD.C4 * (12*dtrez*dtrez);
	
	this.accel.x = (1/this.m)*this.force.x;
	this.accel.y = (1/this.m)*this.force.y-10;
	this.accel.phi = (1/this.m)*this.force.phi;
	Vec2.copy( this.tmp, this.accel);
	Vec2.subtract( this.tmp, this.rtd2 );
	
	this.rtd0.x += coeff0*this.tmp.x;
	this.rtd0.y += coeff0*this.tmp.y;
	this.rtd0.phi += coeff0*this.tmp.phi;
	
	this.rtd1.x += coeff1*this.tmp.x;
	this.rtd1.y += coeff1*this.tmp.y;
	this.rtd1.phi += coeff1*this.tmp.phi;
	
	Vec2.copy( this.rtd2, this.accel );
	
	this.rtd3.x += coeff3*this.tmp.x;
	this.rtd3.y += coeff3*this.tmp.y;
	this.rtd3.phi += coeff3*this.tmp.phi;
	
	this.rtd4.x += coeff4*this.tmp.x;
	this.rtd4.y += coeff4*this.tmp.y;
	this.rtd4.phi += coeff4*this.tmp.phi;
}

//
// 'static' methods
Sphere.compression = function(s1, s2){
	return s1.radius + s2.radius - Vec2.distance( s1.rtd0, s2.rtd0 );
	// return s1.radius+s2.radius+Math.sqrt( (s2.rtd0.x-s1.rtd0.x)*(s2.rtd0.x-s1.rtd0.x)+(s2.rtd0.y-s1.rtd0.y)*(s2.rtd0.y-s1.rtd0.y) )
}

Sphere.force = function( s1, s2 ){
	var xi = Sphere.compression(s1, s2);
	// return xi
	if( xi>0 ){
		// console.log('in contact')
		// console.log(s1.rtd0.x)
		var dx = s1.rtd0.x - s2.rtd0.x;
		var dy = s1.rtd0.y - s2.rtd0.y;
		var rr = Math.sqrt(dx*dx + dy*dy);
		
		var Y = s1.Y*s2.Y / (s1.Y+s2.Y);
		var A = 0.5*(s1.A+s2.A);
		var mu = (s1.mu<s2.mu ? s1.mu : s2.mu );
		var gamma = (s1.gamma<s2.gamma ? s1.gamma : s2.gamma);
		var reff = s1.radius*s2.radius/(s1.radius+s2.radius);
		var dvx = s1.rtd1.x-s2.rtd1.x;
		var dvy = s1.rtd1.y-s2.rtd1.y;
		var ex = dx / rr;
		var ey = dy / rr;
		var xidot = -(ex*dvx+ey*dvy);
		var vtrel = -dvx*ey + dvy*ex + s1.rtd0.phi*s1.radius + s2.rtd0.phi*s2.radius;
		var fn = Math.sqrt(xi)*Y*Math.sqrt(reff)*(xi+A*xidot);
		var ft = -gamma*vtrel;
		
		if(fn<0) fn=0;
		if(ft < -mu*fn) ft = -mu*fn;
		if(ft >  mu*fn) ft =  mu*fn;
		if(s1.type==0){
			s1.force.x 	 += fn*ex-ft*ey;
			s1.force.y 	 += fn*ey+ft*ex;
			s1.force.phi += s1.radius*ft;
		}
		if(s2.type==0){
			s2.force.x 	 += -fn*ex+ft*ey;
			s2.force.y 	 += -fn*ey-ft*ex;
			s2.force.phi += -s2.radius*ft;
		}
	}
}

Sphere.prototype.velocityHalfStep = function(dt){
	this.rtd1.x += this.force.x*dt / (2*this.m);
	this.rtd1.y += (this.force.y+10000)*dt / (2*this.m);
}

Sphere.prototype.positionStep = function(dt){
	this.rtd0.x += this.rtd1.x*dt;
	this.rtd0.y += this.rtd1.y*dt;
}

var Integrator = MD.Integrator = function(){
	this.nParticles = 0;
	this.particles  = []
	this.dt = Math.pow(10, -2.5);
	this.time = 0;
}

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
Integrator.prototype.gearIntegrate = function(){
	for( var n=0; n<this.particles.length; n++){
		if(this.particles[n].type==0){
			this.particles[n].zero_force();
			this.particles[n].predict(this.dt);
		}	
	}
	
	for( var i=0; i<this.particles.length-1; i++){
		for( var j=i+1; j<this.particles.length; j++){	
			if(this.particles[i].type==0 || this.particles[j].type==0){
				 Sphere.force( this.particles[i], this.particles[j] );
			}
		}
	}
	
	for( var n=0; n<this.particles.length; n++){
		if(this.particles[n].type==0){
			this.particles[n].correct(this.dt);	
		}
	}
}