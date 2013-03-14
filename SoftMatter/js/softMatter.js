
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
  createDOMObjects();

  //Create boundary objects
  createBoundaryObjects( bounding_radius );


  //Make sure that the screen canvas for debug drawing matches the window size
//  resizeHandler();
//  $(window).bind('resize', resizeHandler);

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
  interval = setInterval(update,1000/60);
  update();
}

var boundary_objects = [];

function rotateBoundaryObjects( t, radius ){
    for(var n=0; n<boundary_objects.length; n++){
        var b = boundary_objects[n].m_body;
//        console.log(b)
        var f = b.m_fixtureList;
            
        var theta = (boundary_objects[n].m_userData.n /nBoundary)*(2*Math.PI);
            if(rotate) theta += t*0.01;
        
        f.m_body.m_xf.position.x = (radius*Math.cos(theta)+center.x ) / SCALE;
        f.m_body.m_xf.position.y = (radius*Math.sin(theta)+center.y ) / SCALE;

    }
}
  var nBoundary = 65
  var boundaryRandScale = 10;
function createBoundaryObjects( r ){
var radius = r;
  for(var n=0; n<nBoundary; n++){
    var theta = (n / nBoundary)*(2*Math.PI);
    var x = radius*Math.cos(theta);
    var y = radius*Math.sin(theta);
            
    var el = $('<div class="static boundary"></div>');
    $('.name-container').append( el );
      
          var body = createCircle(x+center.x, y+center.y, el.width()/2, true);

    body.m_userData = {
        width:el.width()/2, 
        height:el.height()/2, 
        domObj:el, 
        offset:el.offset(), 
        n: n,
//        n : n,
//        randX : Math.random()*boundaryRandScale-boundaryRandScale/2,
//        randY : Math.random()*boundaryRandScale-boundaryRandScale/2
        randX : 0,
        randY : 0
    };
    
      boundary_objects.push( body );
  }
}

function createDOMObjects() {

    for(var n=0; n<70; n++){
    
        var x = Math.random()*center.x-center.y/2;
        var y = Math.random()*center.y-center.y/2;
                  
        var el = $('<div class="filler"></div>');
        $('.name-container').append( el );

        var body = createCircle(x+center.x, y+center.y,el.width()/2);

        body.m_userData = {
            width:el.width()/2, 
            height:el.height()/2, 
            domObj:el
        };
        
    }
    
$(".member-name").each(function (a,b) {
    var domObj = $(b);
    var domPos = $(b).position();
    var width = domObj.width() / 2 ;
    var height = domObj.height() / 2 ;
    
          var x = center.x+Math.random()*center.x/2
          var y = center.y+Math.random()*center.y/2;
         
    var body = createCircle(x,y,width);

    body.m_userData = {domObj:domObj, width:width, height:height};
    
    //Reset DOM object position for use with CSS3 positioning
    domObj.css({'left':'0px', 'top':'0px'});
  });
}
function createCircle(x, y, width, static){
        var bodyDef = new b2BodyDef;
  bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE

  var fixDef = new b2FixtureDef;
      fixDef.density = 0.00001;
      fixDef.friction = 100.3;
      fixDef.restitution = 0.9;

  fixDef.shape = new b2CircleShape(width / (1*SCALE))


  return world.CreateBody(bodyDef).CreateFixture(fixDef);
}
function createBox(x,y,width,height, static) {
  var bodyDef = new b2BodyDef;
  bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE

  var fixDef = new b2FixtureDef;
      fixDef.density = 0.00005;
      fixDef.friction = 0.3;
      fixDef.restitution = 0.4;

  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(width / SCALE, height / SCALE);


  return world.CreateBody(bodyDef).CreateFixture(fixDef);
}

//Animate DOM objects
function drawDOMObjects( offset ) {
  var i = 0;
  for (var b = world.m_bodyList; b; b = b.m_next) {
         for (var f = b.m_fixtureList; f; f = f.m_next) {
        if (f.m_userData) {
          //Retrieve positions and rotations from the Box2d world
          var x = (f.m_body.m_xf.position.x * SCALE) ;
          var y = (f.m_body.m_xf.position.y * SCALE) ;
            
//            x+=offset.left;
//            y+=offset.top;
            x -= f.m_userData.width;
            y -= f.m_userData.height;
            
        if(f.m_userData.offset){
            x-=f.m_userData.offset.left;
            y-=f.m_userData.offset.top;
        }
          //CSS3 transform does not like negative values or infitate decimals
          var r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;

          // var css = {'-webkit-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', '-moz-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', '-ms-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)'  , '-o-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', 'transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)'};
          if(f.m_userData.domObj){
              
              if(rotate){
                f.m_userData.domObj.css('-webkit-transform','translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)' );
              } else {
                f.m_userData.domObj.css('-webkit-transform','translate(' + x + 'px,' + y + 'px)' );
              }
          }
            // f.m_userData.domObj.css('top', y);
          // f.m_userData.domObj.css('left', x);
        }
         }
      }
};

//Method for animating
var time = 0;
function update() {
    time++;
  //I tried to use this cross browser animation snippet from Paul Irish, but it killed the performance/timing.
  //Ill have to look more at it later, when I have the time.
  //requestAnimFrame(update);

  // updateMouseDrag();

  world.Step(
  1 / 60 //frame-rate
  , 10 //velocity iterations
  , 10 //position iterations
  );

  //If you experience strange results, enable the debug drawing
  if (debug) {
    world.DrawDebugData();
  }
    rotateBoundaryObjects( time, bounding_radius );

    drawDOMObjects( offset );
  world.ClearForces();
}

////Keep the canvas size correct for debug drawing
function resizeHandler() {
  canvas.attr('width', $(window).width());
  canvas.attr('height', $(window).height());
}

var offset, bounding_radius, rotate;
$(document).ready( function(){
  offset = $('.name-container').offset();
  bounding_radius = center.y *( 5.0 / 6.0 );
  $('.name-container').height( bounding_radius*2 );
    $('.name-container').css("background-size", "cover");
    rotate = true;
  init();
})