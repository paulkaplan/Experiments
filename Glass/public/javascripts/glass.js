new FastButton(document.getElementById('right'), function() {
  var d = new Date();
  socket.emit('fire', d.getTime());
});

init2();

function init() {
	if (window.DeviceMotionEvent) {
		console.log("DeviceMotionEvent supported");
	} else if ('listenForDeviceMovement' in window) {
		console.log("DeviceMotionEvent supported [listenForDeviceMovement]");
	}
}

function init2() {
	if ((window.DeviceMotionEvent) || ('listenForDeviceMovement' in window)) {
		window.addEventListener('devicemotion', deviceMotionHandler3, false);
	} else {
    // document.getElementById("dmEvent").innerHTML = "Not supported on your device or browser.  Sorry."
	}
}

function deviceMotionHandler3(eventData) {
	// Grab the acceleration including gravity from the results
	var acceleration = eventData.accelerationIncludingGravity;
	
	// Display the raw acceleration data
	var rawAcceleration = "[" + Math.round(acceleration.x) + ", " + Math.round(acceleration.y) + ", " + Math.round(acceleration.z) + "]";
	
	
	// Z is the acceleration in the Z axis, and tells us if the device is facing up, or down
	var facingUp = -1;
	if (acceleration.z > 0) {
		facingUp = +1;
	}

	// Convert the value from acceleration to degress
	//   acceleration.x|y is the acceleration according to gravity, we'll assume we're on Earth and divide 
	//   by 9.81 (earth gravity) to get a percentage value, and then multiply that by 90 to convert to degrees.				
	var tiltLR = Math.round(((acceleration.x) / 9.81) * -90);
	var tiltFB = Math.round(((acceleration.y + 9.81) / 9.81) * 90 * facingUp);
  var x = 0,y = 0;

	socket.emit('xy', {parent_id: parent, xPos: x, yPos: y, tiltLR : tiltLR, tiltFB: tiltFB});

}
