var BeadedString = function(length, beadCount){
	this.length = length;
	this.beadCount = beadCount;
	this.beads = [];
	this.tool  = 'ramp';
	this.maxDepth = 0.1;
	this.applyWidth = 30;
	this.toolFunctions = {
		'ramp' : ramp,
		'inverse_ramp' : inv_ramp,
		'quadratic' : quadratic,
		'square' : square
	};
};

BeadedString.prototype.initBeads = function(origin) {
	this.origin = origin;
	this.spacing = this.length / this.beadCount;
	for(var n=0; n<this.beadCount; n++){
		this.beads.push( [this.origin[0]+n*this.spacing,this.origin[1]] );
	}
};

BeadedString.prototype.applyTool = function(toolPosition) {
	var closestBead = Math.floor( (toolPosition[0] - this.origin[0]) / this.spacing );
	for(var n=closestBead-this.applyWidth; n<this.beadCount && n< closestBead+this.applyWidth+1; n++){
		this.displaceBead( this.beads[n], n-closestBead+this.applyWidth, 2*this.applyWidth, toolPosition );
	}
	// console.log()
};

BeadedString.prototype.displaceBead = function(bead, fromCenter){
	var x = 1-2*Math.abs(fromCenter/this.applyWidth-0.5);
	bead[1] -= this.toolFunctions[this.tool].call(this, x, this.maxDepth);
};

BeadedString.prototype.setWidth = function(val){
	this.applyWidth = val;
};
BeadedString.prototype.setDepth = function(val){
	this.maxDepth = val;
};
function ramp(x, max){ return max*x; }
function inv_ramp(x, max){ return -ramp(x, max); }
function square(x, max){ 
	if(x<0.25){ return 0; }
	else if(x<0.75){ return max; }
	else return 0;
}
// function doubleRamp(x, max){
// 	x = 1-2*Math.abs(x-0.5);
// 	return max*( Math.abs(x-0.5)+Math.abs(x+0.5) );
// }

// function exponential(x, max){
// 	x = 1-2*Math.abs(x-0.5);
// 	return max*Math.exp(0.5*x);
// }

function quadratic(x, max){
	// x = 1-2*Math.abs(x-0.5);
	return x*x*max;

}