// Generated by CoffeeScript 1.4.0
var Ball, BallView, Bird, BirdView, Block, BlockView, Body, Engine, View, animate, clamp, engine, exponentialEaseOut, height, init, keyFromPos, onWindowResize, paused, render, stats, updatePhysics, width, world,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

width = window.innerWidth;

height = window.innerHeight;

paused = false;

world = new CANNON.World();

world.gravity.set(0, 0, -20);

world.broadphase = new CANNON.NaiveBroadphase();

world.solver.iterations = 5;

world.solver.k = 1000;

world.solver.d = 10;

stats = new Stats();

stats.domElement.style.position = 'absolute';

stats.domElement.style.top = '0px';

stats.domElement.style.zIndex = 100;

document.body.appendChild(stats.domElement);

updatePhysics = function(delta) {
  return world.step(delta);
};

onWindowResize = function(event) {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width / height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  controls.screen.width = width;
  return controls.screen.height = height;
};

Engine = (function() {

  function Engine(world) {
    this.world = world;
    this.world.gravity.set(0, 0, -10);
    this.pause = false;
    this.bodies = [];
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      clearColor: 0x000000,
      clearAlpha: 1,
      antialias: true
    });
    this.renderer.setSize(width, height);
    document.body.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(24, width / height, 0.1, 5000);
    this.camera.position.set(150, 200, 120);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.up.set(0, 0, 1);
    this.scene.add(this.camera);
    this.light = new THREE.DirectionalLight(0xffffff, 0.8);
    this.light.position.copy(this.camera.position).normalize();
    this.scene.add(this.light);
    this.initControls();
    this.underControl = [];
    this.keyControl = {
      up: false,
      right: false,
      left: false,
      down: false
    };
  }

  Engine.prototype.initControls = function() {
    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.2;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = false;
    return this.controls.dynamicDampingFactor = 0.3;
  };

  Engine.prototype.addBody = function(body) {
    this.bodies.push(body);
    this.world.add(body.phys);
    this.scene.add(body.view.mesh);
    return body;
  };

  Engine.prototype.updateVisuals = function() {
    return _.each(this.bodies, function(body) {
      return body.updateView();
    });
  };

  Engine.prototype.updatePhysics = function() {
    var delta, _t;
    delta = this.clock.getDelta();
    this.world.step(delta);
    _t = this;
    _.each(this.underControl, function(body) {
      return body.force.set(0, 0, 0);
    });
    return this.keyControl.left = this.keyControl.right = this.keyControl.up = false;
  };

  Engine.prototype.restart = function() {
    return _.each(this.bodies, function(body) {
      body.phys.initPosition.copy(body.phys.position);
      body.phys.initVelocity.copy(body.phys.velocity);
      if (body.phys.initAngularVelocity) {
        body.phys.initAngularVelocity.copy(body.phys.angularVelocity);
        body.phys.initQuaternion.copy(body.phys.quaternion);
      }
      return body.updateView();
    });
  };

  Engine.prototype.controlsDown = function(e) {
    if (e.keyCode === 32) {
      this.restart();
    }
    if (e.keyCode === 97) {
      this.keyControl.left = true;
    }
    if (e.keyCode === 100) {
      this.keyControl.right = true;
    }
    if (e.keyCode === 120) {
      this.keyControl.down = true;
    }
    if (e.keyCode === 119) {
      return this.keyControl.up = true;
    }
  };

  Engine.prototype.controlsUp = function(e) {
    if (e.keyCode === 97) {
      this.keyControl.left = false;
    }
    if (e.keyCode === 100) {
      this.keyControl.right = false;
    }
    if (e.keyCode === 120) {
      this.keyControl.down = false;
    }
    if (e.keyCode === 119) {
      return this.keyControl.up = false;
    }
  };

  Engine.prototype.scaleXY = function(x, y) {
    return [2 * x / width - 1, -2 * y / height + 1];
  };

  Engine.prototype.addControllableBody = function(body) {
    this.addBody(body);
    return this.underControl.push(body.phys);
  };

  return Engine;

})();

_.extend(CANNON.RigidBody.prototype, {
  maxSpeed: 100,
  maxAccel: 100,
  maxReverseSpeed: -50,
  maxTurn: 0.7,
  turningRadius: 2.5,
  decayAccel: function() {
    var k, speed;
    speed = this.velocity.norm();
    if (speed > 0) {
      k = exponentialEaseOut(speed / this.maxSpeed);
      return this.accel = clamp(this.accel - k, 0, this.maxAccel);
    } else {
      k = exponentialEaseOut(speed / this.maxReverseSpeed);
      return this.accel = clamp(this.accel + k, -this.maxAccel, 0);
    }
  }
});

Body = (function() {

  Body.prototype.maxSpeed = 100;

  Body.prototype.maxAccel = 100;

  Body.prototype.maxReverseSpeed = -50;

  function Body(phys, mesh) {
    this.phys = phys;
    this.view = {};
    this.view.mesh = mesh;
    this.verticesMap = {};
  }

  Body.prototype.setPosition = function(v1, v2, v3) {
    return this.phys.position.set(v1, v2, v3);
  };

  Body.prototype.updateView = function() {
    this.view.mesh.position.copy(this.phys.position);
    return this.view.mesh.quaternion.copy(this.phys.quaternion);
  };

  Body.prototype.updateVertexMap = function() {
    var precision, precisionPoints, _t;
    this.verticesMap = {};
    precisionPoints = 4;
    precision = Math.pow(10, precisionPoints);
    _t = this;
    return _.each(this.view.mesh.geometry.vertices, function(v, i) {
      var key;
      key = [Math.round(v.x * precision), Math.round(v.y * precision), Math.round(v.z * precision)].join('_');
      return _t.verticesMap[key] = {
        number: i,
        vert: v,
        nBlocks: 0
      };
    });
  };

  Body.prototype.getVertexFromMap = function(x, y, z) {
    var key, precision, precisionPoints;
    precisionPoints = 4;
    precision = Math.pow(10, precisionPoints);
    key = [Math.round(x * precision), Math.round(y * precision), Math.round(z * precision)].join('_');
    if (this.verticesMap[key] !== void 0) {
      return this.verticesMap[key];
    } else {
      return -1;
    }
  };

  return Body;

})();

View = (function() {

  function View() {}

  View.prototype.initialize = function() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    return this.mesh.useQuaternion = true;
  };

  return View;

})();

BirdView = (function(_super) {

  __extends(BirdView, _super);

  function BirdView(length, width, depth) {
    this.length = length;
    this.width = width;
    this.depth = depth;
    this.geometry = new THREE.CubeGeometry(this.length * 2, this.width * 2, this.depth * 2);
    this.material = new THREE.MeshNormalMaterial();
    this.initialize();
  }

  return BirdView;

})(View);

Bird = (function(_super) {

  __extends(Bird, _super);

  function Bird(length, width, depth, mass) {
    this.length = length;
    this.width = width;
    this.depth = depth;
    this.mass = mass;
    this.view = new BirdView(this.length, this.width, this.depth);
    this.phys = new CANNON.RigidBody(this.mass, new CANNON.Box(new CANNON.Vec3(this.length, this.width, this.depth)));
  }

  return Bird;

})(Body);

BlockView = (function(_super) {

  __extends(BlockView, _super);

  function BlockView(type) {
    this.type = type;
    if (this.type === 'single') {
      this.geometry = new THREE.CubeGeometry(10, 10, 10);
    }
    if (this.type === 'double') {
      this.geometry = new THREE.CubeGeometry(10, 20, 10);
    }
    this.material = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.useQuaternion = true;
  }

  return BlockView;

})(View);

Block = (function(_super) {

  __extends(Block, _super);

  function Block(type) {
    this.type = type;
    this.view = new BlockView(this.type);
    if (this.type === 'single') {
      this.shape = new CANNON.Box(new CANNON.Vec3(5, 5, 5));
    }
    if (this.type === 'double') {
      this.shape = new CANNON.Box(new CANNON.Vec3(5, 10, 5));
    }
    this.phys = new CANNON.RigidBody(1, this.shape);
  }

  return Block;

})(Body);

BallView = (function(_super) {

  __extends(BallView, _super);

  function BallView(radius) {
    this.radius = radius;
    this.geometry = new THREE.SphereGeometry(this.radius, 20, 20);
    this.material = new THREE.MeshNormalMaterial();
    this.initialize();
  }

  return BallView;

})(View);

Ball = (function(_super) {

  __extends(Ball, _super);

  function Ball(radius, mass) {
    this.radius = radius;
    this.mass = mass;
    this.view = new BallView(this.radius);
    this.phys = new CANNON.RigidBody(this.mass, new CANNON.Sphere(this.radius));
    this.phys.rotation = 0;
    this.phys.accel = 0;
  }

  return Ball;

})(Body);

engine = new Engine(world);

init = function() {
  var ball, groundBody, groundGeo, groundShape, groundView, segSize;
  engine = new Engine(world);
  groundShape = new CANNON.Plane(new CANNON.Vec3(0, 0, 1));
  groundBody = new CANNON.RigidBody(0, groundShape);
  segSize = 50;
  groundGeo = new THREE.PlaneGeometry(segSize * 10, segSize * 10, segSize, segSize);
  groundView = new THREE.Mesh(groundGeo, new THREE.MeshLambertMaterial({
    wireframe: true
  }));
  groundView.rotation.x = -3 * Math.PI / 2.0;
  engine.groundBody = engine.addBody(new Body(groundBody, groundView));
  engine.groundBody.updateVertexMap();
  engine.ground = engine.groundBody.view.mesh;
  ball = new Ball(10, 1);
  ball.setPosition(0, 0, 10);
  engine.addControllableBody(ball);
  window.addEventListener('keydown', _.bind(engine.controlsDown, engine));
  window.addEventListener('keyup', _.bind(engine.controlsUp, engine));
  return animate();
};

animate = function() {
  engine.light.position.copy(engine.camera.position).normalize();
  requestAnimationFrame(animate);
  if (!paused) {
    engine.updateVisuals();
  }
  if (!paused) {
    engine.updatePhysics();
  }
  render();
  return stats.update();
};

render = function() {
  engine.controls.update();
  return engine.renderer.render(engine.scene, engine.camera);
};

keyFromPos = function(v) {
  var precision, precisionPoints;
  precisionPoints = 4;
  precision = Math.pow(10, precisionPoints);
  return [Math.round(v.x * precision), Math.round(v.y * precision), Math.round(v.z * precision)].join('_');
};

exponentialEaseOut = function(k) {
  var _ref;
  return (_ref = k === 1) != null ? _ref : {
    1: -Math.pow(2, -10 * k) + 1
  };
};

clamp = function(k, min, max) {
  return Math.max(min, Math.min(k, max));
};
