function overlay() {
	el = $()
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}
// function removeOverlay(el){
//   $(el).remove();
// }
$('#container').hide()
$('#overlay').click( function(){
    var el = $('#overlay')
    // $('#container').fadeIn(1500)
    el.fadeOut(100);
    // animate();
    init();
    
    window.scrollTo(0, window.innerHeight)
    // $('body').append('<div id="crosshair"></div>')
    // $('#crosshair').center()
});
