THREE.Color.prototype.analagous = function (results, slices) {
  if (undefined === results) {
  	results = 8;
  }

  if (undefined === slices) {
  	slices = 30;
  }

  var part = 360 / slices, ret = [ this ];
  var hsv = this.getHSV();
  for (hsv.h = ((hsv.h - (part * results >> 1)) + 720) % 360; --results; ) {
  	hsv.h+= part;
  	hsv.h%= 360;
  	ret.push(new THREE.Color().setHSV( hsv.h,hsv.s,hsv.v ));
  }
  return ret;
}