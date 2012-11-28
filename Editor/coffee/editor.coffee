# console.log(_)
# _ = _
width   = window.innerWidth
height  = window.innerHeight
paused  = false

world = new CANNON.World()
world.gravity.set(0,0,-10)
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 30
world.solver.k = 2000
world.solver.d = 10

stats = new Stats();
stats.domElement.style.position = 'absolute'
stats.domElement.style.top = '0px'
stats.domElement.style.zIndex = 100
document.body.appendChild( stats.domElement )


updatePhysics  = (delta) ->
  world.step(delta)

onWindowResize = ( event ) ->
  width  = window.innerWidth
  height = window.innerHeight

  renderer.setSize( width / height )

  camera.aspect = width / height 
  camera.updateProjectionMatrix()

  controls.screen.width = width
  controls.screen.height = height

class Engine
  constructor : (@world)->
    @world.gravity.set(0,0,-10)
    @pause = false
    @bodies = []
    @clock = new THREE.Clock()
    @scene = new THREE.Scene()
    @renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialias: true } )
    @renderer.setSize width, height
    document.body.appendChild @renderer.domElement
    @camera  = new THREE.PerspectiveCamera( 24, width / height, 0.1, 5000 )
    @camera.position.set(150,200,120)
    @camera.lookAt( new THREE.Vector3(0,0,0) )
    @camera.up.set(0,0,1)
    @scene.add(@camera)
    @light = new THREE.DirectionalLight(0xffffff, 0.8);
    @light.position.copy( @camera.position ).normalize();
    @scene.add(@light)
    @initControls()
    @underControl = []
    @keyControl = 
      up : false
      right : false
      left : false
      down : false
    
  initControls : () ->
    @controls = new THREE.TrackballControls(@camera, @renderer.domElement);
    @controls.rotateSpeed = 1.0;
    @controls.zoomSpeed = 1.2;
    @controls.panSpeed = 0.2;
    @controls.noZoom = false;
    @controls.noPan = false;
    # @controls.staticMoving = false;
    @controls.dynamicDampingFactor = 0.3;
    
  addBody : (body) ->
    @bodies.push body
    @world.add body.phys 
    @scene.add body.view.mesh
    return body
    
  updateVisuals : () ->
    _.each @bodies, (body)->
      body.updateView()
      
  updatePhysics : () ->
    delta =  @clock.getDelta()
    @world.step( delta )
    _t = @
    _.each @underControl, (body) ->
      if _t.keyControl.left
        body.rotation = clamp body.rotation + delta * body.turningRadius, -body.maxTurn, body.maxTurn
      if _t.keyControl.right
        body.rotation = clamp body.rotation + delta * body.turningRadius, -body.maxTurn, body.maxTurn
      if _t.keyControl.up
        body.accel += 5
      if _t.keyControl.down 
        body.accel -= 2
      body.decayAccel()
      body.force.set body.accel*Math.sin(body.rotation), body.accel*Math.cos(body.rotation), 0
      
    @keyControl.left = @keyControl.right = @keyControl.up = false
    
      # console.log()
      
  restart : () ->
    _.each @bodies, (body)->
      body.phys.initPosition.copy body.phys.position
      body.phys.initVelocity.copy body.phys.velocity
      if(body.phys.initAngularVelocity)
        body.phys.initAngularVelocity.copy body.phys.angularVelocity 
        body.phys.initQuaternion.copy body.phys.quaternion
      body.updateView()
  controlsDown : (e) ->
    # console.log(e)
    @restart() if e.keyCode == 32
    @keyControl.left  = true if e.keyCode == 97  # A
    @keyControl.right = true if e.keyCode == 100 # D
    @keyControl.down  = true if e.keyCode == 120  # S
    @keyControl.up    = true if e.keyCode == 119 # W
  controlsUp : (e) ->
    # console.log(e)
    @keyControl.left  = false if e.keyCode == 97  # A
    @keyControl.right = false if e.keyCode == 100 # D
    @keyControl.down  = false if e.keyCode == 120  # S
    @keyControl.up    = false if e.keyCode == 119 # W    
  scaleXY : (x,y) ->
    return [2*x/width - 1, -2*y/height + 1]
  addControllableBody : (body) ->
    @addBody body
    @underControl.push(body.phys)

_.extend CANNON.RigidBody.prototype, {
  maxSpeed : 100
  maxAccel : 100
  maxReverseSpeed : -50
  maxTurn : 0.7
  turningRadius : 2.5
  decayAccel : () ->
    speed = @velocity.norm()
    if speed > 0
      k = exponentialEaseOut speed / @maxSpeed
      @accel = clamp @accel-k, 0, @maxAccel
    else 
      k = exponentialEaseOut speed / @maxReverseSpeed
      @accel = clamp @accel+k, -@maxAccel, 0
    
}    

class Body
  maxSpeed : 100
  maxAccel : 100
  maxReverseSpeed : -50
  constructor : (@phys, mesh) ->
   @view = {}
   @view.mesh = mesh
   @verticesMap = {}
   
  updateView : () -> 
    @view.mesh.position.copy( @phys.position )
    @view.mesh.quaternion.copy( @phys.quaternion )
  updateVertexMap : () ->
    @verticesMap = {}
    precisionPoints = 4
    precision = Math.pow( 10, precisionPoints )
    _t = @
    # console.log(@view.mesh.geometry.vertices.length)
    _.each @view.mesh.geometry.vertices, (v, i)->
      key = [ Math.round( v.x * precision ), Math.round( v.y * precision ), Math.round( v.z * precision ) ].join( '_' );
      _t.verticesMap[ key ] = {
        number  : i,
        vert    : v,
        nBlocks : 0
      }
  getVertexFromMap : (x,y,z) ->
    precisionPoints = 4
    precision = Math.pow( 10, precisionPoints )
    key = [ Math.round( x * precision ), Math.round( y * precision ), Math.round( z * precision ) ].join( '_' )
    # console.log(key)
    if @verticesMap[key]!=undefined
      return @verticesMap[ key ]
    else return -1
      
class View
  initialize : () ->
    @mesh     = new THREE.Mesh( @geometry, @material )
    @mesh.useQuaternion = true
  
class BirdView extends View
  constructor:(@length, @width, @depth) -> 
    @geometry = new THREE.CubeGeometry( @length*2, @width*2, @depth*2 )
    @material = new THREE.MeshNormalMaterial()
    @initialize()
    
class Bird extends Body
  constructor: (@length, @width, @depth, @mass) ->
    @view = new BirdView @length, @width, @depth
    @phys = new CANNON.RigidBody @mass, new CANNON.Box(new CANNON.Vec3(@length,@width,@depth)) 

class BlockView extends View
  constructor:(@type) -> 
    @geometry = new THREE.CubeGeometry( 10, 10, 10 ) if @type=='single' 
    @geometry = new THREE.CubeGeometry( 10, 20, 10 ) if @type=='double' 
    @material = new THREE.MeshNormalMaterial()
    @mesh     = new THREE.Mesh( @geometry, @material )
    @mesh.useQuaternion = true
class Block extends Body
  constructor: (@type) ->
    @view = new BlockView( @type )
    @shape = new CANNON.Box(new CANNON.Vec3(5,5,5)) if @type == 'single' 
    @shape = new CANNON.Box(new CANNON.Vec3(5,10,5)) if @type == 'double' 
    @phys = new CANNON.RigidBody 1, @shape
class BallView extends View
  constructor:(@radius) -> 
    @geometry = new THREE.SphereGeometry( @radius, 20,20 )
    @material = new THREE.MeshNormalMaterial()
    @initialize()
class Ball extends Body
  constructor: (@radius, @mass) ->
    @view = new BallView @radius
    @phys = new CANNON.RigidBody @mass, new CANNON.Sphere(@radius) 
    @phys.rotation = 0
    @phys.accel = 0

# class Voxel extends Body
  
engine = new Engine(world)

init = () ->
  groundShape = new CANNON.Plane new CANNON.Vec3(0,0,1) 
  groundBody = new CANNON.RigidBody 0, groundShape
  segSize = 50
  groundGeo = new THREE.PlaneGeometry segSize*10,segSize*10, segSize, segSize
  groundView = new THREE.Mesh groundGeo, new THREE.MeshLambertMaterial({wireframe:true}) 
  groundView.rotation.x = -3*Math.PI/2.0
  engine.groundBody = engine.addBody new Body(groundBody, groundView)
  engine.groundBody.updateVertexMap()
  engine.ground = engine.groundBody.view.mesh
  _(10).times () ->
    bird = new Bird(5,3,3,1)
    # bird.phys.position.set(0,0,5)
    bird.phys.position.set(50*Math.random()-25,50*Math.random()-25,20+100*Math.random())
    bird.phys.angularVelocity.set(1*Math.random(),2*Math.random(),2*Math.random())
    bird.phys.angularDamping = 0
    engine.addBody bird
  _(10).times () ->
    ball = new Ball(2, 1)
    ball.phys.position.set(Math.random()*50-25,Math.random()*50-25,2)
    ball = engine.addControllableBody ball
  
  light = new THREE.PointLight(0xffffff, 1.4)
  light.position.set(0,10,10)
  light2 = new THREE.PointLight(0xffffff, 1.4)
  # light2.position.set(0,-10,-10)
  engine.scene.add light
  engine.scene.add light2
  window.addEventListener 'keydown', _.bind(engine.controlsDown, engine)
  window.addEventListener 'keyup', _.bind(engine.controlsUp, engine)
  
  animate()
  return ball
  
animate = () ->
  engine.light.position.copy( engine.camera.position ).normalize()
  requestAnimationFrame animate
  engine.updateVisuals() if not paused
  engine.updatePhysics() if not paused
  render()
  stats.update()

render = ()->
  engine.controls.update()
  engine.renderer.render( engine.scene, engine.camera );
keyFromPos = (v)->
  precisionPoints = 4
  precision = Math.pow( 10, precisionPoints )
  return [ Math.round( v.x * precision ), Math.round( v.y * precision ), Math.round( v.z * precision ) ].join( '_' )
exponentialEaseOut = ( k ) ->
  return k == 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1
clamp = ( k, min, max ) ->
  return Math.max( min, Math.min( k, max) )
ball = init()