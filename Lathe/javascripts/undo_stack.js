var UndoStack = function(base){
	this.stack = [];
	this.last = 0;
	this.stack.push(base);
};

UndoStack.prototype.push = function( config ) {
	var clone = deepCopy(config);
	this.last+=1;
	this.stack[this.last] = clone;
};

UndoStack.prototype.pop = function( config ) {
	if(this.last !== 0){
		var clone = deepCopy(this.stack[this.last]);
		this.last -=1;
		return clone;
	} else {
		return "ERROR";
	}
};

//http://james.padolsey.com/javascript/deep-copying-of-objects-and-arrays/
function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}