//
// 2D sphere particles
var Sphere = MD.Sphere = function(type, radius, index){
	this.type = type;
	this.radius = radius;
	this.index = index;
	// particle description
	this.J = 10; // Moment of inertia
	this.m = 20; // Mass
	
	// material description
	this.Y = Math.pow(10, 5.33);
	this.A = 0.01;
	this.mu = 0.7;
	this.gamma = 100;
	
	// Position/time derivatives
	this.rtd0 = new Vec2(0,0,0); // position, named for algorithm readability
	this.rtd1 = new Vec2(0,0,0); // velocity
	// this.rtd2 = new Vec2(0,0,0); // acceleration
	// this.rtd3 = new Vec2(0,0,0); // higher order, for Gear integration
	// this.rtd4 = new Vec2(0,0,0); // don't have physical meaning 
	
	// Force
	this.force = new Vec2(0,0,0);
	
	// temporary, for integrator
	this.accel = new Vec2(0,0,0);
	this.tmp = new Vec2(0,0,0);
};
Sphere.prototype.zero_force = function(){ this.force.zero(); };
Sphere.prototype.boundary = function(dt, time){
	this.rtd0.x += 1.5*(Math.cos(5*time) );
	this.rtd0.y += 1.5*(Math.sin(5*time) );
};

//
// 'static' methods
Sphere.compression = function(s1, s2){
	return s1.radius + s2.radius - Vec2.distance( s1.rtd0, s2.rtd0 );
	// return s1.radius+s2.radius+Math.sqrt( (s2.rtd0.x-s1.rtd0.x)*(s2.rtd0.x-s1.rtd0.x)+(s2.rtd0.y-s1.rtd0.y)*(s2.rtd0.y-s1.rtd0.y) )
};

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
		if(s1.type===0){
			s1.force.x 	 += fn*ex-ft*ey;
			s1.force.y 	 += fn*ey+ft*ex;
			s1.force.phi += s1.radius*ft;
		}
		if(s2.type===0){
			s2.force.x 	 += -fn*ex+ft*ey;
			s2.force.y 	 += -fn*ey-ft*ex;
			s2.force.phi += -s2.radius*ft;
		}
	}
};

Sphere.prototype.velocityHalfStep = function(dt){
	this.rtd1.x += this.force.x*dt / (2*this.m);
	this.rtd1.y += (this.force.y+20000)*dt / (2*this.m);
};

Sphere.prototype.positionStep = function(dt){
	this.rtd0.x += this.rtd1.x*dt;
	this.rtd0.y += this.rtd1.y*dt;
};
