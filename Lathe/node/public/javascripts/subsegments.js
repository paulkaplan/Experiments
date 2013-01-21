var Grid = function(extent){
	this.width = extent;
	this.height = extent;
}

Grid.prototype.initImageData = function( canvas ){ 
	this.imageData = canvas.createImageData(this.width, this.height); 
}

Grid.prototype.writeDataAt = function(point, color){
	var i = 4*(point[0]+point[1]*this.width);
	this.imageData.data[ i ] = color[0];
	this.imageData.data[ i+1 ] = color[1];
	this.imageData.data[ i+2 ] = color[2];
	this.imageData.data[ i+3 ] = color[3];
}

Grid.prototype.readDataAt = function(point){
	var i = 4*(point[0]+point[1]*this.width);
	return [ this.imageData[i], this.imageData[i+1], this.imageData[i+2], this.imageData[i+3] ];
}

Grid.prototype.writeRadial = function( fn ){
	for(var i=0; i<this.width; i++){
		for(var j=0; j<this.width; j++){
			var index = (j*this.width+i)*4;
			var color = fn( Math.sqrt((i-this.width/2)*(i-this.width/2) + (j-this.height/2)*(j-this.height/2))*(2/(Math.sqrt(2)*this.width)) );
			this.imageData.data[index] = color;
			this.imageData.data[index+1] = color;
			this.imageData.data[index+2] = color;
			this.imageData.data[index+3] = 255; // opaque alpha
		}
	}	
}

var LineSegment = function(startPoint, endPoint){
	this.startPoint = startPoint;
	this.endPoint 	= endPoint;
	this.midPoint = [(this.endPoint[0]-this.startPoint[0])/2+this.startPoint[0], (this.endPoint[1]-this.startPoint[1])/2+this.startPoint[1]];
}

LineSegment.prototype.length = function(){
	return Math.sqrt(Math.pow( this.endPoint[0]-this.startPoint[0], 2) + Math.pow( this.endPoint[1]-this.startPoint[1], 2))
}
LineSegment.prototype.lsub = function(){
	return new LineSegment(this.startPoint, this.midPoint);
}

LineSegment.prototype.rsub = function(){
	return new LineSegment(this.midPoint, this.endPoint);
}

LineSegment.prototype.split = function(){
	var k = [this.lsub(), this.rsub()];
	// console.log(k)
	return k;
}

LineSegment.prototype.splitDisplace = function(disp){
	// console.log(disp)
	this.midPoint[0] += disp[0];
	this.midPoint[1] += disp[1];
	return this.split();
}

LineSegment.prototype.print = function(){
	return "["+line.startPoint + ", "+line.endPoint+"]";
}

var EasyDrawing = function( canvas ){
	this.canvas = canvas;
	this.ctx 	  = canvas.getContext('2d');
}

EasyDrawing.prototype.drawLine = function( line ){
	this.ctx.beginPath();
	this.ctx.moveTo(line.startPoint[0], line.startPoint[1])
	this.ctx.lineTo(line.endPoint[0], line.endPoint[1]);
	this.ctx.stroke();
	
	this.ctx.fillStyle = "#ff0000";
	this.ctx.beginPath();
	// this.ctx.arc(line.startPoint[0], line.startPoint[1], 4, 0, Math.PI*2, true); 
	// this.ctx.arc(line.endPoint[0], line.endPoint[1], 4, 0, Math.PI*2, true); 
	
	this.ctx.closePath();
	this.ctx.fill();
}

EasyDrawing.prototype.drawLines = function( lines ){
	// console.log(lines)
	for(var n=0; n<lines.length; n++){
		var line = lines[n];
		// console.log(line)
		this.drawLine( line );
	}
}

EasyDrawing.prototype.drawPoint = function( point ){
	this.ctx.fillStyle = "#ff0000";
	this.ctx.beginPath();
	this.ctx.arc( point[0], point[1], 2, 0, Math.PI*2, true ); 
	this.ctx.fill();
}

EasyDrawing.prototype.drawScalarPoint = function(point, scalar){
	this.ctx.fillStyle = "#ff0000";
	this.ctx.beginPath();
	this.ctx.arc( point[0], point[1], scalar, 0, Math.PI*2, true ); 
	this.ctx.fill();
}
// EasyDrawing.prototype.drawString = function()
EasyDrawing.prototype.drawPoints = function( points ){
	// console.log(lines)
	for(var n=0; n<points.length; n++){
		var p = points[n];
		// console.log(line)
		this.drawPoint( p );
	}
}
EasyDrawing.prototype.drawGrid = function( grid ){
	this.ctx.putImageData( grid.imageData, 0, 0 );
}

EasyDrawing.prototype.clear = function(){
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}