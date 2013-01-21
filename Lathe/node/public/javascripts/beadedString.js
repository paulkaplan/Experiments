var BeadedString = function(length, beadCount){
	this.length = length;
	this.beadCount = beadCount;
	this.beads = [];
	this.tool  = 'ramp';
	this.maxDepth = 0.1;
	this.applyWidth = 10;
	this.repeats = 1;
	this.direction = 1;
	this.toolFunctions = {
		'ramp' : ramp,
		'inverse_ramp' : inv_ramp,
		'square' : square,
		'pinch' : pinch,
		'rounded':rounded
	};
	this.toolArray = [
		'ramp',
		'inverse_ramp',
		'square',
		'pinch',
		'rounded'
	]

};

BeadedString.prototype.reset = function(){
	this.initBeads(this.origin);
}
BeadedString.prototype.initBeads = function(origin) {
	this.origin = origin;
	this.spacing = this.length / this.beadCount;
	for(var n=0; n<this.beadCount; n++){
		this.beads.push( [this.origin[0]+n*this.spacing,this.origin[1]] );
	}
};

BeadedString.prototype.applyTool = function(toolPosition) {
	var closestBead = Math.floor( (toolPosition[0] ) / this.spacing );
	for(var n=Math.max(0,closestBead-this.applyWidth); n<this.beadCount && n< closestBead+this.applyWidth+1; n++){
		// console.log(n);
		this.displaceBead( this.beads[n], n-closestBead+this.applyWidth);
	}
	// console.log()
};

BeadedString.prototype.displaceBead = function(bead, fromCenter){
	// console.log(fromCenter/this.applyWidth);
	var x = 1.0-Math.abs(fromCenter/this.applyWidth-1.0);

	bead[1] -= this.direction*this.toolFunctions[this.tool].call(this, x, this.maxDepth);
	bead[1] = Math.max(-17, bead[1]);
};

BeadedString.prototype.setWidth = function(val){
	this.applyWidth = val;
};
BeadedString.prototype.setDepth = function(val){
	this.maxDepth = val;
};
function ramp(x, max){ 
	// x = 1-x/2;
	// console.log(x)
	// x = x/2;
	// x *= this.repeat;
	// x = 1-Math.abs(x);
	return max*x; 
}
function inv_ramp(x, max){ return -ramp(x, max); }
function square(x, max){ 
	if(x<0.75){ return 0; }
	else { return max; }
	// else return 0;
}
function pinch(x, max){ return max*x*x*x*x; }

function rounded(x, max){
	return Math.sin(Math.PI*x/2.0)*max;
}