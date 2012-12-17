var FaviconUtils = {};

// http://svgopen.org/2010/papers/62-From_SVG_to_Canvas_and_Back/
FaviconUtils.importSVG = function(sourceSVG, targetCanvas) {
    svg_xml = (new XMLSerializer()).serializeToString(sourceSVG);
    var ctx = targetCanvas.getContext('2d');
    var img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(svg_xml);

    img.onload = function() {
        ctx.drawImage(img, 0, 0);
    }
}

FaviconUtils.makeFavicon = function(){
	var link = document.createElement('link');
			link.rel  = 'shortcut icon';
			link.href = '#'
			
	document.getElementsByTagName('head')[0].appendChild(link);
	return link;
}

FaviconUtils.initVideo = function(stream, callback){
  	Video = document.createElement('video');
    Video.autoplay = true;
    Video.src = window.URL.createObjectURL(stream)
    callback();
};

FaviconUtils.getMedia = function(cameraGranted,cameraDenied){
	var getMedia = navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia;

	getMedia({ video: true, audio: false }, cameraGranted, cameraDenied);
}

FaviconUtils.changeFavicon = function(elem, src){
	elem.href = src;
}

FaviconUtils.getCanvas = function(){
	var canvas = document.createElement('canvas');
	    canvas.width  = 32;
	    canvas.height = 32;
	var ctx    = canvas.getContext('2d');
	return canvas;
};

// animates f( ctx, canvas )
FaviconUtils.animateFavicon = function(elem, fn, ms){
	var ctx, canvas = this.getCanvasContext();
	setInterval( function(){
		fn(ctx,canvas);
		this.changeFavicon( elem, canvas.toDataURL() );
	})
};

// Turns out the requestAnimFrame won't run on unfocus tab, by design. So just do this. 
// FaviconUtils.evilAnimFrame = function(fn, ms){ return setInterval(fn, ms); }

// Paul Irish - http://paulirish.com/2011/requestanimationframe-for-smart-animating/
FaviconUtils.requestAnimFrame = function(callback){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
};
