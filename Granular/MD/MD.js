var MD = {};

var Vec2 = MD.Vec2 = function( x, y, phi ){
	this.x = x; 
	this.y = y;
	this.phi = phi;
};
//
// 'static' methods
Vec2.add = function(v1, v2){
	v1.x += v2.x;
	v1.y += v2.y;
	v1.phi += v2.phi;
};
Vec2.subtract = function(v1, v2){
	v1.x -= v2.x;
	v1.y -= v2.y;
	v1.phi -= v2.phi;
};
Vec2.scale = function(v1, c){
	v1.x *= c;
	v1.y *= c;
	v1.phi *= c;
};
Vec2.copy = function(v1, v2){
	v1.x = v2.x;
	v1.y = v2.y;
	v1.phi = v2.phi;
};
Vec2.distance = function( v1, v2 ){
	return Math.sqrt( (v1.x-v2.x)*(v1.x-v2.x)+(v1.y-v2.y)*(v1.y-v2.y) );
};

//
// 'instance' methods
Vec2.prototype.dot = function(v){
	return this.x*v.x + this.y*v.y;
};
// cross prod is orthogonal, so in 2D just return the magnitude
Vec2.prototype.cross = function(v){
	return this.x*v.x - this.y*v.y;
};
Vec2.prototype.norm = function(){
	return Math.sqrt(this.x*this.x+this.y*this.y);
};
Vec2.prototype.zero = function(){
	this.x = this.y = this.phi = 0;
};