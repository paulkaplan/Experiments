
// Keep a reference to the Box2D World
var world;

// The scale between Box2D units and pixels
var SCALE = 30;

// Multiply to convert degrees to radians.
var D2R = Math.PI / 180;

// Multiply to convert radians to degrees.
var R2D = 180 / Math.PI;

// 360 degrees in radians.
var PI2 = Math.PI * 2;
var interval;

//Cache the canvas DOM reference
var canvas;

//Are we debug drawing
var debug = false;

var center = {x: $(window).width() / 2, y:$(window).height() / 2}

// Shorthand "imports"
var b2Vec2 = Box2D.Common.Math.b2Vec2,
  b2BodyDef = Box2D.Dynamics.b2BodyDef,
  b2AABB = Box2D.Collision.b2AABB,
  b2Body = Box2D.Dynamics.b2Body,
  b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
  b2Fixture = Box2D.Dynamics.b2Fixture,
  b2World = Box2D.Dynamics.b2World,
  b2MassData = Box2D.Collision.Shapes.b2MassData,
  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
  b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
  b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
  b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;

function init() {

  //Create the Box2D World with horisontal and vertical gravity (10 is close enough to 9.8)
  world = new b2World(
  new b2Vec2(0, 10) //gravity
  , true //allow sleep
  );

////  setup debug draw
//  var debugDraw = new b2DebugDraw();
//  canvas = $("#canvas");
//  debugDraw.SetSprite(canvas[0].getContext("2d"));
//  debugDraw.SetDrawScale(SCALE);
//  debugDraw.SetFillAlpha(0.3);
//  debugDraw.SetLineThickness(1.0);
//  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
//  world.SetDebugDraw(debugDraw);

  //Create DOB OBjects
  createFromDOMObjects();

  //Create boundary objects
  createBoundaryObjects( bounding_radius );

  // var x, y, w, h;
  //     x = center.x-0*center.x / 3;
  //     y = 3*center.y / 3;
  //     w = center.x / 3;
  //     h = center.x / 3;

  // var info_box = paper.rect(x,y,w,h );
  //     info_box.attr({
  //       fill : "#F1C40F",
  //       stroke : "none"
  //     });
  //     info_box.node.id = 'info'

  // var info_text = paper.text(x-w, y-h, "soft matter");
  //     info_text.node.id = 'info-text'

  // var info = createBox(x,y,w/2,h/2, false);
  //     info.m_userData = {domObj:info_box, name_text:info_text, rect_offset:{x:w/2,y:h/2}} 


  //Simple solution; reload to reset
  $("#resetButton").click(function() {
    document.location.reload();
  });

  // $("#debugDraw").click(function () {
  //   if ($("#debugDraw:checked").val()) {
  //     debug = true;
  //   } else {
  //     debug = false;
  //     canvas.width = canvas.width;
  //   }
  //   $("article").animate({opacity:debug ? 0.2 : 1},1000);
  // })

  // $("#removeText").click(function() {
  //   $(".panel p").hide()
  // });

  //Create the ground
  var w = $(window).width(); 
  var h = $(window).height();

  createBox(0, h , w, 5, true);
  createBox(0,0,5,h, true);
  createBox(w,0,5,h, true);

  //Do one animation interation and start animating
  // interval = setInterval(update,1000/60);

  update();
}

var boundary_objects = [];

function rotateBoundaryObjects( t, radius ){
    for(var n=0; n<boundary_objects.length; n++){

        var b = boundary_objects[n].m_body;

        var f = b.m_fixtureList;
            
        var theta = (boundary_objects[n].m_userData.n /nBoundary)*(2*Math.PI);
            if(rotate) theta += t*0.01;
        
        f.m_body.m_xf.position.x = (radius*Math.cos(theta)+center.x ) / SCALE;
        f.m_body.m_xf.position.y = (radius*Math.sin(theta)+center.y ) / SCALE;

    }
}
 
  var nBoundary = 50
  var boundaryRandScale = 10;

var boundaryDisks = [];

function createBoundaryObjects( r ){
var radius = r;
var boundaryDiskRadius = 18;

  for(var n=0; n<nBoundary; n++){

    var theta = (n / nBoundary)*(2*Math.PI);
    var x = radius*Math.cos(theta);
    var y = radius*Math.sin(theta);
      
    var body = createCircle(x+center.x, y+center.y,boundaryDiskRadius, true);

    body.m_userData = {radius: boundaryDiskRadius, n: n};

    
      boundary_objects.push( body );
  }

  var outside = paper.circle(center.x, center.y, r);
      outside.attr({
        stroke : "#7F8C8D",
        "stroke-width": boundaryDiskRadius*1.87
      })
}
var nameDisks = [];
var fillerNumber = 50
function createFromDOMObjects() {

// filler
    for(var n=0; n<fillerNumber; n++){
    
    var radius = Math.random()*10+22;

    var x = center.x/2+Math.random()*center.x
    var y = center.y/2+Math.random()*center.y;

    var circle = paper.circle(x, y, radius);
        circle.attr({

          fill : "#E74C3C",
          stroke: false

        });
         
    var body = createCircle(x,y,radius );

        body.m_userData = {domObj: circle, radius: radius};
    }

// named
$(".member-name").each(function (a,b) {

  // var radius = Math.random()*50+50;
  // radius = widths[]
    var name = $(b).attr('id')
    var radius = widths[name]*12;
          var x = center.x/2+Math.random()*center.x
          var y = center.y/2+Math.random()*center.y;

    var circle = paper.circle(x, y, radius);
        circle.attr({

          fill : "#1ABC9C",
          stroke: false

        });

    circle.node.setAttribute('id', name);
    
    var name_text = paper.text(x, y, $(b).text());
        name_text.attr({

          fill: "#34495e",
          font: "22px 'Lato', sans-serif",
          'font-weight':700

        })

    nameDisks.push( circle );
         
    var body = createCircle(x,y,radius );

    body.m_userData = {domObj: circle, name_text:name_text, radius: radius};

  });

}

var widths = {
  jaeger : 8,
  irvine : 7.4,
  nagel  : 6,
  kadanoff : 7,
  witten : 6.4,
  zhang  : 7
}
// #jaeger{
//   width:8em; height:8em; line-height:8em;
// }
// #irvine{
//   width:7.4em; height: 7.4em; line-height:7.4em;
// }
// #nagel{
//   width:6em; height:6em; line-height:6em;
// }
// #kadanoff{
//   width:7em; height:7em; line-height:7em;
// }
// #witten{
//   width:6.4em; height:6.4em; line-height:6.4em;

// }
// #zhang{
//   width:7em; height:7em; line-height:7em;

// }
function createCircle(x, y, width, static){
        var bodyDef = new b2BodyDef;
  bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE

  var fixDef = new b2FixtureDef;
      fixDef.density = 0.05;
      fixDef.friction = 0.3;
      fixDef.restitution = 0.6;

  fixDef.shape = new b2CircleShape(width / (1*SCALE))


  return world.CreateBody(bodyDef).CreateFixture(fixDef);
}
function createBox(x,y,width,height, static) {
  
  var bodyDef = new b2BodyDef;
  bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE

  var fixDef = new b2FixtureDef;
      fixDef.density = 0.05;
      fixDef.friction = 0.3;
      fixDef.restitution = 0.6;

  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(width / SCALE, height / SCALE);

  return world.CreateBody(bodyDef).CreateFixture(fixDef);
}

//Animate DOM objects
function drawObjects( offset ) {
  var i = 0;
  for (var b = world.m_bodyList; b; b = b.m_next) {
         for (var f = b.m_fixtureList; f; f = f.m_next) {
        if (f.m_userData) {
          //Retrieve positions and rotations from the Box2d world
          var x = (f.m_body.m_xf.position.x * SCALE) ;
          var y = (f.m_body.m_xf.position.y * SCALE) ;
            // console.log(x)
//            x+=offset.left;
// //            y+=offset.top;
//             x -= f.m_userData.radius;
//             y -= f.m_userData.radius;
        if(f.m_userData.rect_offset){
          // console.log(f.m_userData.rect_offs)
            x-=f.m_userData.rect_offset.x;
            y-=f.m_userData.rect_offset.y;     
        }

        // if(f.m_userData.offset){
        //     x-=f.m_userData.offset.left;
        //     y-=f.m_userData.offset.top;
        // }

          //CSS3 transform does not like negative values or infitate decimals
          var r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;

        if(f.m_userData.domObj){
          var c = f.m_userData.domObj;

          if(c.node.id && c.node.id==='info'){

            c.attr('x', x);
            c.attr('y', y);
            c.transform("r"+r);

            // f.m_userData.name_text.transform("x"+r);
            // f.m_userData.name_text.transform("r"+r);

            f.m_userData.name_text.transform("r"+r);

          } else {
          // console.log(c)
            c.attr('cx', x);
            c.attr('cy', y);
          }
        }

        if(f.m_userData.name_text){
          var c = f.m_userData.name_text;

          c.attr('x', x);
          c.attr('y', y);

        }

        // if(f)
        
      }
    }
  }
};

//Method for animating

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
var time = 0;

function update() {
    time++;
  //I tried to use this cross browser animation snippet from Paul Irish, but it killed the performance/timing.
  //Ill have to look more at it later, when I have the time.
  requestAnimFrame(update);


  world.Step(
  1 / 60 //frame-rate
  , 10 //velocity iterations
  , 10 //position iterations
  );



    // rotateBoundaryObjects( time, bounding_radius );

    drawObjects( offset );
    world.ClearForces();
}

var offset, bounding_radius, rotate, paper;
$(document).ready( function(){

  paper = new Raphael(0, 0, window.innerWidth, window.innerHeight); //option (a)  

  offset = $('.name-container').offset();
  bounding_radius = center.y *( 7.0 / 8.0 );
  $('.name-container').height( bounding_radius*2 );
  $('.name-container').css("background-size", "cover");
    // rotate = true;

  init();


})