(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var shump, updateDebug;

shump = require('./shump/shump.coffee');

$("#fullscreen").click(function() {
  var canvas, canvasAspect, containerAspect, containerHeight, containerWidth;
  $("#shump")[0].webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  canvas = $("#shump canvas");
  canvasAspect = canvas.width() / canvas.height();
  containerWidth = $(window).width();
  containerHeight = $(window).height();
  containerAspect = containerWidth / containerHeight;
  console.log(canvasAspect, $(window).width(), $(window).height(), containerAspect);
  if (canvasAspect < containerAspect) {
    console.log("match height");
    canvas.height(containerHeight);
    return canvas.width(containerHeight * canvasAspect);
  } else {
    console.log("match width");
    canvas.width(containerWidth);
    return canvas.height(containerWidth / canvasAspect);
  }
});

$("#debug").append("<span id=\"levelChildren\">");

updateDebug = function() {
  return $("#levelChildren").text("level.children = " + shump.game.level.children.length);
};

shump.game.world.on("update", updateDebug);


},{"./shump/shump.coffee":14}],2:[function(require,module,exports){
var Base,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

Base = (function() {
  function Base() {
    this.trigger = __bind(this.trigger, this);
    this._events = {};
  }

  Base.prototype.on = function(event, handler) {
    var _base;
    ((_base = this._events)[event] != null ? _base[event] : _base[event] = []).push(handler);
    return this;
  };

  Base.prototype.off = function(event, handler) {
    var index, suspect, _i, _len, _ref;
    _ref = this._events[event];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      suspect = _ref[index];
      if (suspect === handler) {
        this._events[event].splice(index, 1);
      }
    }
    return this;
  };

  Base.prototype.trigger = function() {
    var args, event, handler, i, _i, _ref;
    event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (this._events[event] == null) {
      return this;
    }
    for (i = _i = _ref = this._events[event].length - 1; _i >= 0; i = _i += -1) {
      handler = this._events[event][i];
      handler.apply(this, args);
    }
    return this;
  };

  return Base;

})();

module.exports = Base;


},{}],3:[function(require,module,exports){
var CollisionObject, GameObject,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

GameObject = require('./GameObject.coffee');

CollisionObject = (function(_super) {
  __extends(CollisionObject, _super);

  function CollisionObject() {
    CollisionObject.__super__.constructor.call(this);
    this.colliderType = void 0;
    this.colliderHitTypes = [];
  }

  CollisionObject.prototype.collideWith = function(gameObject) {
    this.die();
    return gameObject.die();
  };

  return CollisionObject;

})(GameObject);

module.exports = CollisionObject;


},{"./GameObject.coffee":5}],4:[function(require,module,exports){
var Basic, CollisionObject, Dart, Particle, Score, SinWave, Sound, Weapons,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Score = require('./Score.coffee');

Sound = require('./Sound.coffee');

CollisionObject = require('./CollisionObject.coffee');

Particle = require('./Particle.coffee');

Weapons = require('./Weapons.coffee');

Basic = (function(_super) {
  var enemyGeometry, enemyMaterial, enemyTexture;

  __extends(Basic, _super);

  enemyTexture = THREE.ImageUtils.loadTexture("assets/enemies/enemy.png");

  enemyMaterial = new THREE.MeshBasicMaterial({
    map: enemyTexture,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    transparent: true
  });

  enemyGeometry = new THREE.PlaneGeometry(1, 1);

  function Basic(position) {
    Basic.__super__.constructor.call(this);
    this.colliderType = "enemy";
    this.colliderHitTypes.push("player");
    this.root.add(new THREE.Mesh(enemyGeometry, enemyMaterial));
    this.root.position.copy(position);
    this.age = 0;
    this.hasFired = false;
  }

  Basic.prototype.update = function(delta) {
    Basic.__super__.update.call(this, delta);
    return this.age += delta;
  };

  Basic.prototype.die = function() {
    var i, _i;
    Score.add(1);
    Sound.play('explosion');
    for (i = _i = 0; _i <= 20; i = ++_i) {
      this.parent.add(new Particle(this.root.position, 3));
    }
    return Basic.__super__.die.call(this);
  };

  return Basic;

})(CollisionObject);

SinWave = (function(_super) {
  __extends(SinWave, _super);

  function SinWave() {
    return SinWave.__super__.constructor.apply(this, arguments);
  }

  SinWave.prototype.update = function(delta) {
    SinWave.__super__.update.call(this, delta);
    this.root.position.x += -1 * delta;
    return this.root.position.y += delta * Math.sin(this.age);
  };

  return SinWave;

})(Basic);

Dart = (function(_super) {
  __extends(Dart, _super);

  function Dart() {
    return Dart.__super__.constructor.apply(this, arguments);
  }

  Dart.prototype.update = function(delta) {
    Dart.__super__.update.call(this, delta);
    if (this.age < .5) {
      this.root.position.x += -20 * delta;
    } else if (this.age < 3) {
      this.root.position.x += 5 * delta;
    } else {
      this.die();
    }
    if (this.age > 1 && !this.hasFired) {
      this.hasFired = true;
      return this.fire_primary();
    }
  };

  Dart.prototype.fire_primary = function() {
    var bullet;
    Sound.play('shoot');
    this.lastFire = Date.now();
    bullet = new Weapons.Bullet(this.root.position);
    bullet.colliderType = "enemy_bullet";
    bullet.colliderHitTypes = ["player"];
    bullet.angle = Math.PI - .25;
    bullet.speed = 5;
    this.parent.add(bullet);
    bullet = new Weapons.Bullet(this.root.position);
    bullet.colliderType = "enemy_bullet";
    bullet.colliderHitTypes = ["player"];
    bullet.angle = Math.PI + .25;
    bullet.speed = 5;
    return this.parent.add(bullet);
  };

  return Dart;

})(Basic);

exports.Basic = Basic;

exports.SinWave = SinWave;

exports.Dart = Dart;


},{"./CollisionObject.coffee":3,"./Particle.coffee":8,"./Score.coffee":10,"./Sound.coffee":11,"./Weapons.coffee":12}],5:[function(require,module,exports){
var GameObject,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

GameObject = (function() {
  function GameObject() {
    this.update = __bind(this.update, this);
    this.parent = void 0;
    this.children = [];
    this.root = new THREE.Object3D();
    this.dead = false;
    this.active = true;
  }

  GameObject.prototype.update = function(delta) {
    var child, i, _i, _ref, _results;
    _results = [];
    for (i = _i = _ref = this.children.length - 1; _i >= 0; i = _i += -1) {
      child = this.children[i];
      if (child.dead) {
        this.remove(child);
        continue;
      }
      if (child.active) {
        _results.push(child.update(delta));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  GameObject.prototype.activate = function() {
    return this.active = true;
  };

  GameObject.prototype.add = function(gameObject) {
    gameObject.parent = this;
    this.children.push(gameObject);
    this.root.add(gameObject.root);
    return gameObject;
  };

  GameObject.prototype.remove = function(gameObject) {
    var i;
    this.root.remove(gameObject.root);
    gameObject.parent = null;
    i = this.children.indexOf(gameObject);
    if (i >= 0) {
      this.children.splice(i, 1);
    }
    return gameObject;
  };

  GameObject.prototype.die = function() {
    return this.dead = true;
  };

  return GameObject;

})();

module.exports = GameObject;


},{}],6:[function(require,module,exports){
var Input;

Input = (function() {
  Input.prototype.keyMap = {
    "38": "up",
    "87": "up",
    "40": "down",
    "83": "down",
    "37": "left",
    "65": "left",
    "39": "right",
    "68": "right",
    "32": "fire_primary"
  };

  function Input() {
    var key, value, _ref;
    this.keyStates = [];
    _ref = this.keyMap;
    for (key in _ref) {
      value = _ref[key];
      this.keyStates[value] = false;
    }
    $(window).keydown((function(_this) {
      return function(e) {
        if (_this.keyMap[e.which]) {
          _this.keyStates[_this.keyMap[e.which]] = true;
        }
        return e.stopPropagation();
      };
    })(this));
    $(window).keyup((function(_this) {
      return function(e) {
        if (_this.keyMap[e.which]) {
          _this.keyStates[_this.keyMap[e.which]] = false;
        }
        return e.stopPropagation();
      };
    })(this));
  }

  return Input;

})();

module.exports = Input;


},{}],7:[function(require,module,exports){
var Base, Model, ModelLoader,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Base = require('./Base.coffee');

Model = (function(_super) {
  __extends(Model, _super);

  function Model(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.loadPng = __bind(this.loadPng, this);
    this.load = __bind(this.load, this);
    Model.__super__.constructor.call(this);
    this.material = void 0;
    this.geometry = void 0;
    this.texture = void 0;
    this.status = void 0;
  }

  Model.prototype.load = function(fileName) {
    var jsonLoader;
    jsonLoader = new THREE.JSONLoader();
    return jsonLoader.load(fileName, (function(_this) {
      return function() {
        var geometry, materials, others;
        geometry = arguments[0], materials = arguments[1], others = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        _this.material = new THREE.MeshFaceMaterial(materials);
        _this.geometry = geometry;
        _this.status = "ready";
        return _this.trigger("success", _this);
      };
    })(this));
  };

  Model.prototype.loadPng = function(fileName) {
    return this.texture = THREE.ImageUtils.loadTexture(fileName, {}, (function(_this) {
      return function() {
        _this.material = new THREE.MeshBasicMaterial({
          map: _this.texture
        });
        _this.geometry = new THREE.PlaneGeometry(1, 1);
        _this.status = "ready";
        return _this.trigger("success", _this);
      };
    })(this));
  };

  return Model;

})(Base);

ModelLoader = (function() {
  function ModelLoader() {
    this.defaultGeometry = new THREE.CubeGeometry(1, 1, 1);
    this.defaultMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      map: THREE.ImageUtils.loadTexture("assets/util/white.png")
    });
    this.loadedModels = {};
  }

  ModelLoader.prototype.load = function(fileName) {
    var model, object;
    if ((this.loadedModels[fileName] != null) && this.loadedModels[fileName].status === "ready") {
      return new THREE.Mesh(this.loadedModels[fileName].geometry, this.loadedModels[fileName].material);
    }
    if (this.loadedModels[fileName]) {
      model = this.loadedModels[fileName];
    } else {
      model = new Model();
      if (fileName.split('.').pop() === "js") {
        model.load(fileName);
      } else {
        model.loadPng(fileName);
      }
      this.loadedModels[fileName] = model;
    }
    object = new THREE.Mesh(this.defaultGeometry, this.defaultMaterial);
    model.on("success", function(m) {
      object.geometry = m.geometry;
      object.material = m.material;
      return m.off("success", arguments.callee);
    });
    return object;
  };

  return ModelLoader;

})();

module.exports = ModelLoader;


},{"./Base.coffee":2}],8:[function(require,module,exports){
var GameObject, Particle, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

GameObject = require('./GameObject.coffee');

util = require('../util.coffee');

Particle = (function(_super) {
  var particleGeometry, particleMaterial, particleTexture;

  __extends(Particle, _super);

  particleTexture = THREE.ImageUtils.loadTexture("assets/particles/particle.png");

  particleMaterial = new THREE.MeshBasicMaterial({
    map: particleTexture,
    shading: THREE.NoShading,
    depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  particleGeometry = new THREE.PlaneGeometry(1, 1);

  function Particle(position, energy) {
    Particle.__super__.constructor.call(this);
    this.birth = Date.now();
    this.timeToLive = 1000;
    this.root.add(new THREE.Mesh(particleGeometry, particleMaterial));
    this.velocity = new THREE.Vector3(util.random(-1, 1), util.random(-1, 1), util.random(-1, 1));
    this.velocity.normalize().multiplyScalar(energy);
    this.root.position.copy(position);
  }

  Particle.prototype.update = function(delta) {
    var s;
    this.velocity.multiplyScalar(.99);
    this.root.position.x += this.velocity.x * delta;
    this.root.position.y += this.velocity.y * delta;
    this.root.position.z += this.velocity.z * delta;
    s = 1 - ((Date.now() - this.birth) / this.timeToLive) + .01;
    this.root.scale.set(s, s, s);
    if (Date.now() > this.birth + this.timeToLive) {
      return this.die();
    }
  };

  return Particle;

})(GameObject);

module.exports = Particle;


},{"../util.coffee":15,"./GameObject.coffee":5}],9:[function(require,module,exports){
var CollisionObject, Input, ModelLoader, Particle, Player, Shump, Sound, Weapons, input, modelLoader, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('../util.coffee');

Sound = require('./Sound.coffee');

CollisionObject = require('./CollisionObject.coffee');

ModelLoader = require('./ModelLoader.coffee');

Input = require('./Input.coffee');

Weapons = require('./Weapons.coffee');

Particle = require('./Particle.coffee');

Shump = require('./shump.coffee');

modelLoader = new ModelLoader();

input = new Input();

Player = (function(_super) {
  __extends(Player, _super);

  function Player() {
    this.update = __bind(this.update, this);
    Player.__super__.constructor.call(this);
    this.colliderType = "player";
    this.colliderHitTypes.push("enemy_bullet");
    this.root.add(modelLoader.load("assets/ships/ship.js"));
    this.lastFire = Date.now();
  }

  Player.prototype.update = function(delta) {
    if (input.keyStates['up']) {
      this.root.position.y += 10 * delta;
    }
    if (input.keyStates['down']) {
      this.root.position.y -= 10 * delta;
    }
    if (input.keyStates['left']) {
      this.root.position.x -= 10 * delta;
    }
    if (input.keyStates['right']) {
      this.root.position.x += 10 * delta;
    }
    if (input.keyStates['fire_primary']) {
      return this.fire_primary();
    }
  };

  Player.prototype.fire_primary = function() {
    var bullet;
    if (Date.now() > this.lastFire + 240 * 1) {
      Sound.play('shoot');
      this.lastFire = Date.now();
      bullet = new Weapons.Bullet(this.root.position);
      this.parent.add(bullet);
      bullet = new Weapons.Bullet(this.root.position);
      bullet.angle = -.25;
      this.parent.add(bullet);
      bullet = new Weapons.Bullet(this.root.position);
      bullet.angle = +.25;
      return this.parent.add(bullet);
    }
  };

  Player.prototype.die = function() {
    var i, _i;
    Sound.play('explosion');
    for (i = _i = 0; _i <= 200; i = ++_i) {
      this.parent.add(new Particle(this.root.position, 8));
    }
    util.after(1000, Shump.game.reset);
    return Player.__super__.die.call(this);
  };

  return Player;

})(CollisionObject);

module.exports = Player;


},{"../util.coffee":15,"./CollisionObject.coffee":3,"./Input.coffee":6,"./ModelLoader.coffee":7,"./Particle.coffee":8,"./Sound.coffee":11,"./Weapons.coffee":12,"./shump.coffee":14}],10:[function(require,module,exports){
var score;

score = 0;

exports.displayElement = void 0;

exports.add = function(points) {
  score += points;
  if (exports.displayElement != null) {
    return exports.displayElement.text("Score: " + score);
  }
};

exports.get = function() {
  return score;
};


},{}],11:[function(require,module,exports){
var Sound, assetsLoading, audioContext, load, loadedSounds, play;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

audioContext = new AudioContext();

Sound = (function() {
  function Sound(name, url, buffer) {
    this.name = name;
    this.url = url;
    this.buffer = buffer;
  }

  return Sound;

})();

exports.Sound = Sound;

exports.loadedSounds = loadedSounds = {};

exports.load = load = function(name, url) {
  return new Promise((function(_this) {
    return function(resolve, reject) {
      var request;
      request = new XMLHttpRequest();
      request.open('GET', url);
      request.responseType = 'arraybuffer';
      request.onload = function(a, b, c) {
        if (request.status === 200) {
          return audioContext.decodeAudioData(request.response, function(buffer) {
            var sound;
            sound = new Sound(name, url, buffer);
            exports.loadedSounds[name] = sound;
            return resolve(sound);
          }, function(err) {
            return reject(Error("Decoding Error"));
          });
        } else {
          console.log("Status");
          return reject(Error("Status Error"));
        }
      };
      request.onerror = function() {
        console.log("errr");
        return reject(Error("Network Error"));
      };
      return request.send();
    };
  })(this));
};

exports.play = play = function(arg) {
  var buffer, source;
  if (typeof arg === 'string') {
    buffer = loadedSounds[arg].buffer;
  } else {
    buffer = arg;
  }
  if (buffer != null) {
    source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    return source.start(0);
  }
};

assetsLoading = [];

assetsLoading.push(load('shoot', 'assets/sounds/shoot.wav'));

assetsLoading.push(load('explosion', 'assets/sounds/explosion.wav'));

Promise.all(assetsLoading).then(function(results) {
  return console.log("Loaded all Sounds!", results);
})["catch"](function(err) {
  return console.log("uhoh", err);
});


},{}],12:[function(require,module,exports){
var CollisionObject,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CollisionObject = require('./CollisionObject.coffee');

exports.Bullet = (function(_super) {
  var bulletGeometry, bulletMaterial, bulletTexture;

  __extends(Bullet, _super);

  bulletTexture = THREE.ImageUtils.loadTexture("assets/weapons/bullet.png");

  bulletMaterial = new THREE.MeshBasicMaterial({
    map: bulletTexture,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    transparent: true
  });

  bulletGeometry = new THREE.PlaneGeometry(1, 1);

  function Bullet(position) {
    Bullet.__super__.constructor.call(this);
    this.birth = Date.now();
    this.timeToLive = 2000;
    this.root.add(new THREE.Mesh(bulletGeometry, bulletMaterial));
    this.root.position.copy(position);
    this.colliderType = "bullet";
    this.colliderHitTypes.push("enemy");
    this.angle = 0;
    this.speed = 15;
  }

  Bullet.prototype.update = function(delta) {
    this.root.position.x += Math.cos(this.angle) * this.speed * delta;
    this.root.position.y += Math.sin(this.angle) * this.speed * delta;
    this.root.rotation.z = this.angle;
    if (Date.now() > this.birth + this.timeToLive) {
      return this.die();
    }
  };

  return Bullet;

})(CollisionObject);


},{"./CollisionObject.coffee":3}],13:[function(require,module,exports){
var Base, World,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./Base.coffee');

World = (function(_super) {
  __extends(World, _super);

  function World() {
    this.animate = __bind(this.animate, this);
    var fov_radians, h, targetZ, w;
    World.__super__.constructor.call(this);
    w = 640;
    h = 480;
    this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
    fov_radians = 45 * (Math.PI / 180);
    targetZ = 480 / (2 * Math.tan(fov_radians / 2)) / 32.0;
    this.camera.position.z = targetZ;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(w, h);
    $("#shump")[0].appendChild(this.renderer.domElement);
    this.worldTexture = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat
    });
    this.processMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: false,
      uniforms: {
        "tDiffuse": {
          type: "t",
          value: this.worldTexture
        }
      },
      vertexShader: "varying vec2 vUv;\n\nvoid main() {\n	vUv = uv;\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",
      fragmentShader: "uniform sampler2D tDiffuse;\nvarying vec2 vUv;\n\nvoid main() {\n	// read the input color\n\n	vec4 o;\n\n	o = texture2D( tDiffuse, vUv );\n	//o.r = texture2D( tDiffuse, vUv + vec2(0.0, 0.001) ).r;\n\n	//o.r *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;\n	//o.g *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;\n	//o.b *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;\n\n	//o *= 0.5 + 1.0*16.0*vUv.x*vUv.y*(1.0-vUv.x)*(1.0-vUv.y);\n	\n\n	// set the output color\n	gl_FragColor = o;\n}"
    });
    this.processScene = new THREE.Scene();
    this.processCamera = new THREE.OrthographicCamera(-.5, .5, -.5, .5, 0, 1);
    this.processCamera.position.z = 0;
    this.processScene.add(this.processCamera);
    this.processQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.processMaterial);
    this.processQuad.rotation.x = Math.PI;
    this.processScene.add(this.processQuad);
    this.clock = new THREE.Clock();
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    $("#shump")[0].appendChild(this.stats.domElement);
    return this;
  }

  World.prototype.animate = function() {
    var delta;
    delta = this.clock.getDelta();
    if (delta < .5) {
      this.trigger("update", delta);
    }
    this.renderer.render(this.scene, this.camera, this.worldTexture, true);
    this.renderer.render(this.processScene, this.processCamera);
    this.stats.update();
    requestAnimationFrame(this.animate);
  };

  World.prototype.start = function() {
    return this.animate();
  };

  return World;

})(Base);

module.exports = World;


},{"./Base.coffee":2}],14:[function(require,module,exports){
var CollisionObject, Enemies, Game, GameObject, Level, Player, Score, Sound, Tile, TileObject, TileSet, World, game, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('../util.coffee');

World = require('./World.coffee');

GameObject = require('./GameObject.coffee');

CollisionObject = require('./CollisionObject.coffee');

Player = require('./Player.coffee');

Enemies = require('./Enemies.coffee');

Sound = require('./Sound.coffee');

Score = require('./Score.coffee');

Tile = (function() {
  function Tile(tileSet, row, col) {
    var face, uvHeight, uvWidth, uvX, uvY, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    this.tileSet = tileSet;
    this.row = row;
    this.col = col;
    this.geometry = new THREE.PlaneGeometry(this.tileSet.tileWidth / 32, this.tileSet.tileHeight / 32);
    _ref = this.geometry.vertices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      v.x += this.tileSet.tileWidth / 32 / 2;
      v.y += this.tileSet.tileHeight / 32 / 2;
    }
    this.geometry.verticesNeedUpdate = true;
    uvWidth = this.tileSet.tileWidth / this.tileSet.imageWidth;
    uvHeight = this.tileSet.tileHeight / this.tileSet.imageHeight;
    uvX = uvWidth * this.col;
    uvY = uvHeight * (this.tileSet.rows - this.row - 1);
    _ref1 = this.geometry.faceVertexUvs[0];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      face = _ref1[_j];
      for (_k = 0, _len2 = face.length; _k < _len2; _k++) {
        v = face[_k];
        v.x = v.x * uvWidth + uvX;
        v.y = v.y * uvHeight + uvY;
      }
    }
    this.geometry.uvsNeedUpdate = true;
    this.material = this.tileSet.material;
  }

  return Tile;

})();

TileSet = (function() {
  function TileSet(textureFile, imageWidth, imageHeight, tileWidth, tileHeight) {
    this.textureFile = textureFile;
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.cols = this.imageWidth / this.tileWidth;
    this.rows = this.imageHeight / this.tileWidth;
    this.texture = THREE.ImageUtils.loadTexture(textureFile);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      shading: THREE.NoShading,
      depthTest: true,
      depthWrite: false,
      transparent: true
    });
  }

  return TileSet;

})();

TileObject = (function() {
  function TileObject(tile, position) {
    this.tile = tile;
    this.root = new THREE.Object3D();
    this.root.add(new THREE.Mesh(tile.geometry, tile.material));
    this.root.position.copy(position);
  }

  TileObject.prototype.update = function() {};

  return TileObject;

})();

Level = (function(_super) {
  __extends(Level, _super);

  function Level(world) {
    this.world = world;
    this.loadTileLayer = __bind(this.loadTileLayer, this);
    this.onLoad = __bind(this.onLoad, this);
    Level.__super__.constructor.call(this);
    this.colliders = [];
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.root.add(this.ambientLight);
    this.player1 = new Player();
    this.add(this.player1);
    $.getJSON("assets/level_1.json", this.onLoad);
  }

  Level.prototype.onLoad = function(data) {
    var background, col, enemy, farBackground, fov_radians, id, o, row, targetZ, tile, tileSet, tileSetData, _i, _j, _k, _l, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;
    this.data = data;
    this.tileSets = [];
    this.tiles = [];
    _ref = data.tilesets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tileSetData = _ref[_i];
      tileSet = new TileSet("assets/" + tileSetData.image, tileSetData.imagewidth, tileSetData.imageheight, tileSetData.tilewidth, tileSetData.tileheight);
      this.tileSets.push(tileSet);
      id = tileSetData.firstgid;
      for (row = _j = 0, _ref1 = tileSet.rows - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; row = 0 <= _ref1 ? ++_j : --_j) {
        for (col = _k = 0, _ref2 = tileSet.cols - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; col = 0 <= _ref2 ? ++_k : --_k) {
          tile = new Tile(tileSet, row, col);
          this.tiles[id] = tile;
          id++;
        }
      }
    }
    farBackground = this.loadTileLayer(data.layers[0]);
    farBackground.position.y = 7.5 * 2;
    fov_radians = 45 * (Math.PI / 180);
    targetZ = 480 / (2 * Math.tan(fov_radians / 2)) / 32.0;
    farBackground.position.z = -targetZ;
    farBackground.scale.set(2, 2, 2);
    console.log(farBackground);
    this.root.add(farBackground);
    background = this.loadTileLayer(data.layers[1]);
    background.position.y = 7.5;
    console.log(background);
    this.root.add(background);
    _ref3 = data.layers[2].objects;
    _results = [];
    for (_l = 0, _len1 = _ref3.length; _l < _len1; _l++) {
      o = _ref3[_l];
      enemy = new Enemies[o.type](new THREE.Vector3(o.x / 32, 7 - o.y / 32, util.random(-1, 1)));
      enemy.active = false;
      _results.push(this.add(enemy));
    }
    return _results;
  };

  Level.prototype.loadTileLayer = function(data) {
    var col, id, index, layer, row, tileObject, _i, _len, _ref;
    layer = new THREE.Object3D();
    _ref = data.data;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      id = _ref[index];
      if (id > 0) {
        row = Math.floor(index / data.width);
        col = index % data.width;
        tileObject = new TileObject(this.tiles[id], new THREE.Vector3(col, -row - 1, 0));
        layer.add(tileObject.root);
      }
    }
    return layer;
  };

  Level.prototype.update = function(delta) {
    var child, _i, _len, _ref;
    Level.__super__.update.call(this, delta);
    this.world.camera.position.x += 1 * delta;
    this.player1.root.position.x += 1 * delta;
    _ref = this.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.active === false && child.root.position.x < this.world.camera.position.x + 10) {
        child.activate();
      }
    }
    return this.collisions();
  };

  Level.prototype.add = function(gameObject) {
    if (gameObject instanceof CollisionObject) {
      this.colliders.push(gameObject);
    }
    return Level.__super__.add.call(this, gameObject);
  };

  Level.prototype.remove = function(gameObject) {
    var i;
    i = this.colliders.indexOf(gameObject);
    if (i >= 0) {
      this.colliders.splice(i, 1);
    }
    return Level.__super__.remove.call(this, gameObject);
  };

  Level.prototype.collisions = function() {
    var a, b, _i, _len, _ref, _results;
    _ref = this.colliders;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.active) {
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = this.colliders;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            b = _ref1[_j];
            if (b.active) {
              if (a.colliderHitTypes.indexOf(b.colliderType) > -1) {
                if (this.testCollision(a, b)) {
                  _results1.push(a.collideWith(b));
                } else {
                  _results1.push(void 0);
                }
              } else {
                _results1.push(void 0);
              }
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Level.prototype.testCollision = function(a, b) {
    return a.root.position.distanceToSquared(b.root.position) < 1;
  };

  return Level;

})(GameObject);

Game = (function() {
  function Game() {
    this.reset = __bind(this.reset, this);
    this.world = new World();
    Score.displayElement = $("<h1>").appendTo($("#shump"));
    this.loadLevel();
    util.after(1000, (function(_this) {
      return function() {
        return _this.world.start();
      };
    })(this));
  }

  Game.prototype.loadLevel = function() {
    this.world.camera.position.x = 0;
    this.level = new Level(this.world);
    this.world.scene.add(this.level.root);
    return this.world.on("update", this.level.update);
  };

  Game.prototype.reset = function() {
    console.log("reset level");
    this.world.scene.remove(this.level.root);
    this.world.off("update", this.level.update);
    return this.loadLevel();
  };

  return Game;

})();

module.exports.game = game = new Game();


},{"../util.coffee":15,"./CollisionObject.coffee":3,"./Enemies.coffee":4,"./GameObject.coffee":5,"./Player.coffee":9,"./Score.coffee":10,"./Sound.coffee":11,"./World.coffee":13}],15:[function(require,module,exports){
exports.after = function(delay, func) {
  return setTimeout(func, delay);
};

exports.random = function(min, max) {
  return Math.random() * (max - min) + min;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dvcmxkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvc2h1bXAuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsQ0FFQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxLQUFqQixDQUF1QixTQUFBLEdBQUE7QUFFdEIsTUFBQSxzRUFBQTtBQUFBLEVBQUEsQ0FBQSxDQUFFLFFBQUYsQ0FBWSxDQUFBLENBQUEsQ0FBRSxDQUFDLHVCQUFmLENBQXVDLE9BQU8sQ0FBQyxvQkFBL0MsQ0FBQSxDQUFBO0FBQUEsRUFFQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLGVBQUYsQ0FGVCxDQUFBO0FBQUEsRUFHQSxZQUFBLEdBQWUsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFBLEdBQWlCLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FIaEMsQ0FBQTtBQUFBLEVBS0EsY0FBQSxHQUFpQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFBLENBTGpCLENBQUE7QUFBQSxFQU1BLGVBQUEsR0FBa0IsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQU5sQixDQUFBO0FBQUEsRUFPQSxlQUFBLEdBQWtCLGNBQUEsR0FBaUIsZUFQbkMsQ0FBQTtBQUFBLEVBUUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxZQUFaLEVB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QjtBQUFBLENBSGpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInNodW1wID0gcmVxdWlyZSgnLi9zaHVtcC9zaHVtcC5jb2ZmZWUnKVxuXG4kKFwiI2Z1bGxzY3JlZW5cIikuY2xpY2sgKCktPlxuXHRcblx0JChcIiNzaHVtcFwiKVswXS53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbihFbGVtZW50LkFMTE9XX0tFWUJPQVJEX0lOUFVUKTtcblx0XG5cdGNhbnZhcyA9ICQoXCIjc2h1bXAgY2FudmFzXCIpXG5cdGNhbnZhc0FzcGVjdCA9IGNhbnZhcy53aWR0aCgpIC8gY2FudmFzLmhlaWdodCgpXG5cblx0Y29udGFpbmVyV2lkdGggPSAkKHdpbmRvdykud2lkdGgoKVxuXHRjb250YWluZXJIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KClcblx0Y29udGFpbmVyQXNwZWN0ID0gY29udGFpbmVyV2lkdGggLyBjb250YWluZXJIZWlnaHRcblx0Y29uc29sZS5sb2cgY2FudmFzQXNwZWN0LCAkKHdpbmRvdykud2lkdGgoKSAsICQod2luZG93KS5oZWlnaHQoKSwgY29udGFpbmVyQXNwZWN0XG5cdFxuXHRpZiBjYW52YXNBc3BlY3QgPCBjb250YWluZXJBc3BlY3Rcblx0XHRjb25zb2xlLmxvZyBcIm1hdGNoIGhlaWdodFwiXG5cdFx0Y2FudmFzLmhlaWdodCBjb250YWluZXJIZWlnaHRcblx0XHRjYW52YXMud2lkdGggY29udGFpbmVySGVpZ2h0ICogY2FudmFzQXNwZWN0XG5cdGVsc2Vcblx0XHRjb25zb2xlLmxvZyBcIm1hdGNoIHdpZHRoXCJcblx0XHRjYW52YXMud2lkdGggY29udGFpbmVyV2lkdGhcblx0XHRjYW52YXMuaGVpZ2h0IGNvbnRhaW5lcldpZHRoIC8gY2FudmFzQXNwZWN0XG5cbiQoXCIjZGVidWdcIikuYXBwZW5kKFwiXCJcIjxzcGFuIGlkPVwibGV2ZWxDaGlsZHJlblwiPlwiXCJcIilcblxuXG51cGRhdGVEZWJ1ZyA9ICgpLT5cblx0JChcIiNsZXZlbENoaWxkcmVuXCIpLnRleHQgXCJcIlwibGV2ZWwuY2hpbGRyZW4gPSAje3NodW1wLmdhbWUubGV2ZWwuY2hpbGRyZW4ubGVuZ3RofVwiXCJcIlxuXG5cbnNodW1wLmdhbWUud29ybGQub24gXCJ1cGRhdGVcIiwgdXBkYXRlRGVidWdcblxuXG5cbiMgY29uc29sZS5sb2cgXCJoaWRlcmFcIlxuXG5cbiIsImNsYXNzIEJhc2Vcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAX2V2ZW50cyA9IHt9XG5cblx0b246IChldmVudCwgaGFuZGxlcikgLT5cblx0XHQoQF9ldmVudHNbZXZlbnRdID89IFtdKS5wdXNoIGhhbmRsZXJcblx0XHRyZXR1cm4gdGhpc1xuXG5cdG9mZjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdGZvciBzdXNwZWN0LCBpbmRleCBpbiBAX2V2ZW50c1tldmVudF0gd2hlbiBzdXNwZWN0IGlzIGhhbmRsZXJcblx0XHRcdEBfZXZlbnRzW2V2ZW50XS5zcGxpY2UgaW5kZXgsIDFcblx0XHRyZXR1cm4gdGhpc1xuXG5cdHRyaWdnZXI6IChldmVudCwgYXJncy4uLikgPT5cblx0XHRyZXR1cm4gdGhpcyB1bmxlc3MgQF9ldmVudHNbZXZlbnRdP1xuXHRcdGZvciBpIGluIFtAX2V2ZW50c1tldmVudF0ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRoYW5kbGVyID0gQF9ldmVudHNbZXZlbnRdW2ldXG5cdFx0XHRoYW5kbGVyLmFwcGx5IHRoaXMsIGFyZ3Ncblx0XHRyZXR1cm4gdGhpc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBDb2xsaXNpb25PYmplY3QgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSB1bmRlZmluZWRcblx0XHRAY29sbGlkZXJIaXRUeXBlcyA9IFtdXG5cblx0Y29sbGlkZVdpdGg6IChnYW1lT2JqZWN0KS0+XG5cdFx0QGRpZSgpXG5cdFx0Z2FtZU9iamVjdC5kaWUoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uT2JqZWN0XG4iLCJTY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblxuXG5jbGFzcyBCYXNpYyBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRlbmVteVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL2VuZW1pZXMvZW5lbXkucG5nXCJcblx0ZW5lbXlNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBlbmVteVRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0ZW5lbXlHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImVuZW15XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwicGxheWVyXCJcblxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBlbmVteUdlb21ldHJ5LCBlbmVteU1hdGVyaWFsXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XHRAYWdlID0gMFxuXHRcdEBoYXNGaXJlZCA9IGZhbHNlXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAYWdlICs9IGRlbHRhXG5cdFx0XG5cdFxuXHRkaWU6ICgpLT5cblx0XHRTY29yZS5hZGQoMSlcblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMylcblx0XHRzdXBlcigpXG5cblxuY2xhc3MgU2luV2F2ZSBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLTEgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gZGVsdGEgKiBNYXRoLnNpbihAYWdlKVxuXG5jbGFzcyBEYXJ0IGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0aWYgQGFnZSA8IC41XG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0yMCAqIGRlbHRhXG5cdFx0ZWxzZSBpZiBAYWdlIDwgM1xuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHRlbHNlXG5cdFx0XHRAZGllKClcblxuXHRcdGlmIEBhZ2UgPiAxIGFuZCBub3QgQGhhc0ZpcmVkXG5cdFx0XHRAaGFzRmlyZWQgPSB0cnVlXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcblx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJIC0gLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJICsgLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXG5leHBvcnRzLkJhc2ljID0gQmFzaWNcbmV4cG9ydHMuU2luV2F2ZSA9IFNpbldhdmVcbmV4cG9ydHMuRGFydCA9IERhcnRcblxuIyBzdXBlcihkZWx0YSlcblx0XHQjIGlmIEBhZ2UgPCAxXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMlxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi55ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDIuMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdCMgZWxzZVxuXHRcdCMgXHRAZGllKClcbiIsImNsYXNzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHBhcmVudCA9IHVuZGVmaW5lZFxuXHRcdEBjaGlsZHJlbiA9IFtdXG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdEBkZWFkID0gZmFsc2Vcblx0XHRAYWN0aXZlID0gdHJ1ZVxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0Zm9yIGkgaW4gW0BjaGlsZHJlbi5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGNoaWxkID0gQGNoaWxkcmVuW2ldXG5cdFx0XHRpZiBjaGlsZC5kZWFkXG5cdFx0XHRcdEByZW1vdmUgY2hpbGRcblx0XHRcdFx0Y29udGludWVcblx0XHRcdGlmIGNoaWxkLmFjdGl2ZVxuXHRcdFx0XHRjaGlsZC51cGRhdGUgZGVsdGEgXG5cdFxuXHRhY3RpdmF0ZTogKCktPlxuXHRcdEBhY3RpdmUgPSB0cnVlO1xuXHRcdFxuXG5cdGFkZDogKGdhbWVPYmplY3QpLT5cblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IHRoaXNcblx0XHRAY2hpbGRyZW4ucHVzaChnYW1lT2JqZWN0KVxuXHRcdEByb290LmFkZChnYW1lT2JqZWN0LnJvb3QpXG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0QHJvb3QucmVtb3ZlKGdhbWVPYmplY3Qucm9vdClcblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IG51bGxcblx0XHRpID0gIEBjaGlsZHJlbi5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY2hpbGRyZW4uc3BsaWNlKGksIDEpO1xuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0ZGllOiAoKS0+XG5cdFx0QGRlYWQgPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPYmplY3RcbiIsImNsYXNzIElucHV0XG5cdGtleU1hcDogXG5cdFx0XCIzOFwiOlwidXBcIiAjdXAgYXJyb3dcblx0XHRcIjg3XCI6XCJ1cFwiICN3XG5cdFx0XCI0MFwiOlwiZG93blwiICNkb3duIGFycm93XG5cdFx0XCI4M1wiOlwiZG93blwiICNzXG5cdFx0XCIzN1wiOlwibGVmdFwiICNsZWZ0IGFycm93XG5cdFx0XCI2NVwiOlwibGVmdFwiICNhXG5cdFx0XCIzOVwiOlwicmlnaHRcIiAjcmlnaHQgYXJyb3dcblx0XHRcIjY4XCI6XCJyaWdodFwiICNkXG5cdFx0XCIzMlwiOlwiZmlyZV9wcmltYXJ5XCIgI3NwYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGtleVN0YXRlcyA9IFtdXG5cblx0XHRmb3Iga2V5LCB2YWx1ZSBvZiBAa2V5TWFwXG5cdFx0XHRAa2V5U3RhdGVzW3ZhbHVlXSA9IGZhbHNlO1xuXG5cdFx0JCh3aW5kb3cpLmtleWRvd24gKGUpPT5cblx0XHRcdCMgY29uc29sZS5sb2cgZS53aGljaFxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gdHJ1ZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdCQod2luZG93KS5rZXl1cCAoZSk9PlxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gZmFsc2U7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXRcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IChAZ2VvbWV0cnksIEBtYXRlcmlhbCktPlxuXHRcdHN1cGVyKClcblx0XHRAbWF0ZXJpYWwgPSB1bmRlZmluZWRcblx0XHRAZ2VvbWV0cnkgPSB1bmRlZmluZWRcblx0XHRAdGV4dHVyZSA9IHVuZGVmaW5lZFxuXHRcdEBzdGF0dXMgPSB1bmRlZmluZWRcblxuXHRsb2FkOiAoZmlsZU5hbWUpPT5cblx0XHRqc29uTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblx0XHRqc29uTG9hZGVyLmxvYWQgZmlsZU5hbWUsIChnZW9tZXRyeSwgbWF0ZXJpYWxzLCBvdGhlcnMuLi4pPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKCBtYXRlcmlhbHMgKVxuXHRcdFx0IyBAbWF0ZXJpYWwgPSBtYXRlcmlhbHNbMF1cblx0XHRcdEBnZW9tZXRyeSA9IGdlb21ldHJ5XG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cdGxvYWRQbmc6IChmaWxlTmFtZSk9PlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBmaWxlTmFtZSwge30sICgpPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0XHQjIHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRcdCMgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblx0XHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0XHQjIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5IDEsIDFcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImxvYWRwbmdcIiwgdGhpc1xuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXG5cbmNsYXNzIE1vZGVsTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QGRlZmF1bHRHZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMSwxLDEpXG5cdFx0QGRlZmF1bHRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0Y29sb3I6IDB4MDBmZjAwXG5cdFx0XHR3aXJlZnJhbWU6IHRydWVcblx0XHRcdG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy91dGlsL3doaXRlLnBuZ1wiXG5cblx0XHRAbG9hZGVkTW9kZWxzID0ge31cblxuXHRsb2FkOiAoZmlsZU5hbWUpLT5cblxuXHRcdCMgaWYgYWxyZWFkeSBsb2FkZWQsIGp1c3QgbWFrZSB0aGUgbmV3IG1lc2ggYW5kIHJldHVyblxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdPyAmJiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5zdGF0dXMgPT0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJjYWNoZWRcIlxuXHRcdFx0cmV0dXJuIG5ldyBUSFJFRS5NZXNoKEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLmdlb21ldHJ5LCBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5tYXRlcmlhbClcblxuXG5cdFx0IyBpZiByZXF1ZXN0ZWQgYnV0IG5vdCByZWFkeVxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XHRtb2RlbCA9IEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XG5cdFx0IyBpZiBub3QgcmVxdWVzdGVkIGJlZm9yZVxuXHRcdGVsc2Vcblx0XHRcdG1vZGVsID0gbmV3IE1vZGVsKClcblx0XHRcdGlmIGZpbGVOYW1lLnNwbGl0KCcuJykucG9wKCkgPT0gXCJqc1wiXG5cdFx0XHRcdG1vZGVsLmxvYWQoZmlsZU5hbWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG1vZGVsLmxvYWRQbmcoZmlsZU5hbWUpXG5cdFx0XHRAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXSA9IG1vZGVsXG5cblx0XHRvYmplY3QgPSBuZXcgVEhSRUUuTWVzaCggQGRlZmF1bHRHZW9tZXRyeSwgQGRlZmF1bHRNYXRlcmlhbCApXG5cdFx0bW9kZWwub24gXCJzdWNjZXNzXCIsIChtKS0+XG5cdFx0XHRvYmplY3QuZ2VvbWV0cnkgPSBtLmdlb21ldHJ5XHRcdFx0XG5cdFx0XHRvYmplY3QubWF0ZXJpYWwgPSBtLm1hdGVyaWFsXG5cdFx0XHRtLm9mZiBcInN1Y2Nlc3NcIiwgYXJndW1lbnRzLmNhbGxlZSAjcmVtb3ZlIHRoaXMgaGFuZGxlciBvbmNlIHVzZWRcblx0XHRyZXR1cm4gb2JqZWN0XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZWxMb2FkZXJcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xudXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5jbGFzcyBQYXJ0aWNsZSBleHRlbmRzIEdhbWVPYmplY3Rcblx0cGFydGljbGVUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9wYXJ0aWNsZXMvcGFydGljbGUucG5nXCJcblx0cGFydGljbGVNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBwYXJ0aWNsZVRleHR1cmVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXG5cdHBhcnRpY2xlR2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiwgZW5lcmd5KS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDEwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggcGFydGljbGVHZW9tZXRyeSwgcGFydGljbGVNYXRlcmlhbFxuXHRcdFxuXHRcdEB2ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSkpO1xuXHRcdEB2ZWxvY2l0eS5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcihlbmVyZ3kpXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEB2ZWxvY2l0eS5tdWx0aXBseVNjYWxhciguOTkpXG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBAdmVsb2NpdHkueCAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBAdmVsb2NpdHkueSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueiArPSBAdmVsb2NpdHkueiAqIGRlbHRhXG5cdFx0cyA9IDEtICgoRGF0ZS5ub3coKSAtIEBiaXJ0aCkgLyBAdGltZVRvTGl2ZSkgKyAuMDFcblx0XHRAcm9vdC5zY2FsZS5zZXQocywgcywgcylcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlXG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5Db2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5Nb2RlbExvYWRlciA9IHJlcXVpcmUgJy4vTW9kZWxMb2FkZXIuY29mZmVlJ1xuSW5wdXQgPSByZXF1aXJlICcuL0lucHV0LmNvZmZlZSdcbldlYXBvbnMgPSByZXF1aXJlICcuL1dlYXBvbnMuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcblNodW1wID0gcmVxdWlyZSAnLi9zaHVtcC5jb2ZmZWUnXG5cbm1vZGVsTG9hZGVyID0gbmV3IE1vZGVsTG9hZGVyKClcbmlucHV0ID0gbmV3IElucHV0KClcblxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0XG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwicGxheWVyXCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlfYnVsbGV0XCJcblxuXG5cdFx0QHJvb3QuYWRkIG1vZGVsTG9hZGVyLmxvYWQoXCJhc3NldHMvc2hpcHMvc2hpcC5qc1wiKVxuXHRcdFxuXHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWyd1cCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydkb3duJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ2xlZnQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1sncmlnaHQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1snZmlyZV9wcmltYXJ5J11cblx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcdGlmIERhdGUubm93KCkgPiBAbGFzdEZpcmUgKyAyNDAgKiAxXG5cdFx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0XHRcblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRidWxsZXQuYW5nbGUgPSAtLjI1XG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gKy4yNVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cdFx0XHQjIEBwYXJlbnQuY29sbGlkZXJzLnB1c2ggYnVsbGV0XG5cblx0ZGllOiAoKS0+XG5cdFx0IyBjb25zb2xlLmxvZyBcImRpZVwiXG5cdFx0XG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjAwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCA4KVxuXG5cdFx0dXRpbC5hZnRlciAxMDAwLCBTaHVtcC5nYW1lLnJlc2V0XG5cdFx0c3VwZXIoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcbiIsIlxuc2NvcmUgPSAwXG5leHBvcnRzLmRpc3BsYXlFbGVtZW50ID0gdW5kZWZpbmVkXG5cbmV4cG9ydHMuYWRkID0gKHBvaW50cyktPlxuXHRzY29yZSArPSBwb2ludHNcblx0IyBjb25zb2xlLmxvZyBleHBvcnRzLmRpc3BsYXlFbGVtZW50XG5cdGlmIGV4cG9ydHMuZGlzcGxheUVsZW1lbnQ/XG5cdFx0ZXhwb3J0cy5kaXNwbGF5RWxlbWVudC50ZXh0IFwiU2NvcmU6ICN7c2NvcmV9XCJcblxuZXhwb3J0cy5nZXQgPSAoKS0+XG5cdHJldHVybiBzY29yZVxuIiwid2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHR8fHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG5hdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbmNsYXNzIFNvdW5kXG5cdGNvbnN0cnVjdG9yOiAoQG5hbWUsIEB1cmwsIEBidWZmZXIpLT5cbmV4cG9ydHMuU291bmQgPSBTb3VuZFxuXG5leHBvcnRzLmxvYWRlZFNvdW5kcyA9IGxvYWRlZFNvdW5kcyA9IHt9XG5cblxuZXhwb3J0cy5sb2FkID0gbG9hZCA9IChuYW1lLCB1cmwpIC0+XG5cdHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXHRcdHJlcXVlc3Qub3BlbignR0VUJywgdXJsKVxuXHRcdHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblx0XHRyZXF1ZXN0Lm9ubG9hZCA9IChhLCBiLCBjKT0+XG5cdFx0XHRpZiByZXF1ZXN0LnN0YXR1cyA9PSAyMDBcblx0XHRcdFx0YXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSByZXF1ZXN0LnJlc3BvbnNlLCBcblx0XHRcdFx0XHQoYnVmZmVyKT0+XG5cdFx0XHRcdFx0XHQjdG9kbyBoYW5kbGUgZGVjb2RpbmcgZXJyb3Jcblx0XHRcdFx0XHRcdHNvdW5kID0gbmV3IFNvdW5kKG5hbWUsIHVybCwgYnVmZmVyKVxuXHRcdFx0XHRcdFx0ZXhwb3J0cy5sb2FkZWRTb3VuZHNbbmFtZV0gPSBzb3VuZFxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc29sdmUoc291bmQpXG5cdFx0XHRcdFx0LChlcnIpPT5cblx0XHRcdFx0XHRcdHJlamVjdCBFcnJvcihcIkRlY29kaW5nIEVycm9yXCIpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNvbnNvbGUubG9nICBcIlN0YXR1c1wiXG5cdFx0XHRcdHJlamVjdCBFcnJvcihcIlN0YXR1cyBFcnJvclwiKVxuXG5cdFx0XHRcdFxuXHRcdHJlcXVlc3Qub25lcnJvciA9ICgpLT5cblx0XHRcdGNvbnNvbGUubG9nIFwiZXJyclwiXG5cdFx0XHRyZWplY3QgRXJyb3IoXCJOZXR3b3JrIEVycm9yXCIpIFx0XG5cblx0XHRyZXF1ZXN0LnNlbmQoKVxuXHRcdFx0XG5cbmV4cG9ydHMucGxheSA9IHBsYXkgPSAoYXJnKS0+XG5cdGlmIHR5cGVvZiBhcmcgPT0gJ3N0cmluZydcblx0XHRidWZmZXIgPSBsb2FkZWRTb3VuZHNbYXJnXS5idWZmZXJcblx0ZWxzZSBcblx0XHRidWZmZXIgPSBhcmdcblx0aWYgYnVmZmVyP1xuXHRcdHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuXHRcdHNvdXJjZS5idWZmZXIgPSBidWZmZXJcblx0XHRzb3VyY2UuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pXG5cdFx0c291cmNlLnN0YXJ0KDApXG5cblxuYXNzZXRzTG9hZGluZyA9IFtdXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnc2hvb3QnLCAnYXNzZXRzL3NvdW5kcy9zaG9vdC53YXYnKVxuYXNzZXRzTG9hZGluZy5wdXNoIGxvYWQoJ2V4cGxvc2lvbicsICdhc3NldHMvc291bmRzL2V4cGxvc2lvbi53YXYnKVxuXG5Qcm9taXNlLmFsbChhc3NldHNMb2FkaW5nKVxuLnRoZW4gKHJlc3VsdHMpLT5cblx0Y29uc29sZS5sb2cgXCJMb2FkZWQgYWxsIFNvdW5kcyFcIiwgcmVzdWx0c1xuLmNhdGNoIChlcnIpLT5cblx0Y29uc29sZS5sb2cgXCJ1aG9oXCIsIGVyclxuXG4iLCJDb2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5cbmNsYXNzIGV4cG9ydHMuQnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0LnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMjAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBidWxsZXRHZW9tZXRyeSwgYnVsbGV0TWF0ZXJpYWxcblxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0XHRAY29sbGlkZXJUeXBlID0gXCJidWxsZXRcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteVwiXG5cdFx0QGFuZ2xlID0gMFxuXHRcdEBzcGVlZCA9IDE1XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IE1hdGguY29zKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBNYXRoLnNpbihAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnJvdGF0aW9uLnogPSBAYW5nbGVcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5cblxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cblxuY2xhc3MgV29ybGQgZXh0ZW5kcyBCYXNlXG5cdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRzdXBlcigpXG5cblx0XHR3ID0gNjQwXG5cdFx0aCA9IDQ4MFxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIHcgLyBoLCAxLCAxMDAwMClcblx0XHRmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuXG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdGFyZ2V0WlxuXHRcdFxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0XG5cdFx0QHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKVxuXHRcdEByZW5kZXJlci5zZXRTaXplIHcsIGhcblx0XHQjIEByZW5kZXJlci5zb3J0T2JqZWN0cyA9IGZhbHNlXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG5cblx0XHRcblx0XHRAd29ybGRUZXh0dXJlID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0IHcsIGgsIFxuXHRcdFx0bWluRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdG1hZ0ZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyXG5cdFx0XHRmb3JtYXQ6IFRIUkVFLlJHQkZvcm1hdFxuXHRcdFxuXG5cdFx0QHByb2Nlc3NNYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbFxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IGZhbHNlXG5cdFx0XHR1bmlmb3JtczogXG5cdFx0XHRcdFwidERpZmZ1c2VcIjogeyB0eXBlOiBcInRcIiwgdmFsdWU6IEB3b3JsZFRleHR1cmUgfVxuXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR2YXJ5aW5nIHZlYzIgdlV2O1xuXG5cdFx0XHRcdHZvaWQgbWFpbigpIHtcblx0XHRcdFx0XHR2VXYgPSB1djtcblx0XHRcdFx0XHRnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdGZyYWdtZW50U2hhZGVyOlxuXHRcdFx0XHRcIlwiXCJcblx0XHRcdFx0dW5pZm9ybSBzYW1wbGVyMkQgdERpZmZ1c2U7XG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdC8vIHJlYWQgdGhlIGlucHV0IGNvbG9yXG5cblx0XHRcdFx0XHR2ZWM0IG87XG5cblx0XHRcdFx0XHRvID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICk7XG5cdFx0XHRcdFx0Ly9vLnIgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKyB2ZWMyKDAuMCwgMC4wMDEpICkucjtcblxuXHRcdFx0XHRcdC8vby5yICo9IHNpbih2VXYueSAqIDI0MC4wICogNi4yOCkgKiAuMjUgKyAuNzU7XG5cdFx0XHRcdFx0Ly9vLmcgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIC43NTtcblx0XHRcdFx0XHQvL28uYiAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgLjc1O1xuXG5cdFx0XHRcdFx0Ly9vICo9IDAuNSArIDEuMCoxNi4wKnZVdi54KnZVdi55KigxLjAtdlV2LngpKigxLjAtdlV2LnkpO1xuXHRcdFx0XHRcdFxuXG5cdFx0XHRcdFx0Ly8gc2V0IHRoZSBvdXRwdXQgY29sb3Jcblx0XHRcdFx0XHRnbF9GcmFnQ29sb3IgPSBvO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFwiXCJcIlxuXG5cdFx0QHByb2Nlc3NTY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0QHByb2Nlc3NDYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKC0uNSwgLjUsIC0uNSAsIC41LCAwLCAxKVxuXHRcdEBwcm9jZXNzQ2FtZXJhLnBvc2l0aW9uLnogPSAwXG5cdFx0QHByb2Nlc3NTY2VuZS5hZGQgQHByb2Nlc3NDYW1lcmFcblx0XHRAcHJvY2Vzc1F1YWQgPSBuZXcgVEhSRUUuTWVzaCggbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEgKSwgQHByb2Nlc3NNYXRlcmlhbCApO1xuXHRcdEBwcm9jZXNzUXVhZC5yb3RhdGlvbi54ID0gTWF0aC5QSVxuXHRcdEBwcm9jZXNzU2NlbmUuYWRkIEBwcm9jZXNzUXVhZFxuXG5cblxuXG5cdFx0QGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKClcblx0XHRAc3RhdHMgPSBuZXcgU3RhdHMoKTtcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuXHRcdCQoXCIjc2h1bXBcIilbMF0uYXBwZW5kQ2hpbGQoIEBzdGF0cy5kb21FbGVtZW50IClcblxuXHRcdHJldHVybiB0aGlzXG5cblx0YW5pbWF0ZTogPT5cblx0XHRkZWx0YSA9IEBjbG9jay5nZXREZWx0YSgpXHRcdFxuXHRcdCNkb24ndCB1cGRhdGUgYWZ0ZXIgbG9uZyBmcmFtZSAoZml4ZXMgaXNzdWUgd2l0aCBzd2l0Y2hpbmcgdGFicylcblx0XHRpZiAoZGVsdGEgPCAuNSkgXG5cdFx0XHRAdHJpZ2dlciBcInVwZGF0ZVwiLCBkZWx0YVxuXG5cdFx0QHJlbmRlcmVyLnJlbmRlciggQHNjZW5lLCBAY2FtZXJhLCBAd29ybGRUZXh0dXJlLCB0cnVlICk7XG5cblxuXHRcdEByZW5kZXJlci5yZW5kZXIgQHByb2Nlc3NTY2VuZSwgQHByb2Nlc3NDYW1lcmFcblxuXHRcdEBzdGF0cy51cGRhdGUoKVxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSBAYW5pbWF0ZVxuXHRcdHJldHVyblxuXG5cdHN0YXJ0OiAtPlxuXHRcdEBhbmltYXRlKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gV29ybGRcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuV29ybGQgPSByZXF1aXJlICcuL1dvcmxkLmNvZmZlZSdcbkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuUGxheWVyID0gcmVxdWlyZSAnLi9QbGF5ZXIuY29mZmVlJ1xuRW5lbWllcyA9IHJlcXVpcmUgJy4vRW5lbWllcy5jb2ZmZWUnXG5cblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5TY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuXG5jbGFzcyBUaWxlXG5cdGNvbnN0cnVjdG9yOiAoQHRpbGVTZXQsIEByb3csIEBjb2wpLT5cblx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggQHRpbGVTZXQudGlsZVdpZHRoIC8gMzIsIEB0aWxlU2V0LnRpbGVIZWlnaHQgLyAzMilcblx0XHRmb3IgdiBpbiBAZ2VvbWV0cnkudmVydGljZXNcblx0XHRcdHYueCArPSBAdGlsZVNldC50aWxlV2lkdGggLyAzMiAvIDJcblx0XHRcdHYueSArPSBAdGlsZVNldC50aWxlSGVpZ2h0IC8gMzIgLyAyXG5cdFx0QGdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWVcblxuXHRcdCMgY2FsYyBhbmQgc2V0IHV2c1xuXHRcdHV2V2lkdGggPSBAdGlsZVNldC50aWxlV2lkdGgvQHRpbGVTZXQuaW1hZ2VXaWR0aFxuXHRcdHV2SGVpZ2h0ID0gQHRpbGVTZXQudGlsZUhlaWdodC9AdGlsZVNldC5pbWFnZUhlaWdodFxuXHRcdHV2WCA9IHV2V2lkdGggKiBAY29sXG5cdFx0dXZZID0gdXZIZWlnaHQgKiAoQHRpbGVTZXQucm93cyAtIEByb3cgLSAxKVxuXHRcdGZvciBmYWNlIGluIEBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdXG5cdFx0XHRmb3IgdiBpbiBmYWNlXG5cdFx0XHRcdHYueCA9IHYueCAqIHV2V2lkdGggKyB1dlhcblx0XHRcdFx0di55ID0gdi55ICogdXZIZWlnaHQgKyB1dllcblx0XHRAZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWVcblxuXHRcdEBtYXRlcmlhbCA9IEB0aWxlU2V0Lm1hdGVyaWFsXG5cblxuY2xhc3MgVGlsZVNldFxuXHRjb25zdHJ1Y3RvcjogKEB0ZXh0dXJlRmlsZSwgQGltYWdlV2lkdGgsIEBpbWFnZUhlaWdodCwgQHRpbGVXaWR0aCwgQHRpbGVIZWlnaHQpLT5cblx0XHRAY29scyA9IEBpbWFnZVdpZHRoIC8gQHRpbGVXaWR0aFxuXHRcdEByb3dzID0gQGltYWdlSGVpZ2h0IC8gQHRpbGVXaWR0aFxuXG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIHRleHR1cmVGaWxlXG5cdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoVGVzdDogdHJ1ZVxuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XG5cdFx0XG5cblx0XHQjIEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCB3aWR0aCwgaGVpZ2h0KTtcblxuXG5cbmNsYXNzIFRpbGVPYmplY3Rcblx0Y29uc3RydWN0b3I6IChAdGlsZSwgcG9zaXRpb24pLT5cblx0XHQjdG9kbyByZW1vdmUgdW5uZWRlZCBvYmplY3QzZCBudWxsIHdyYXBwZXJcblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHRpbGUuZ2VvbWV0cnksIHRpbGUubWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogLT5cblxuY2xhc3MgTGV2ZWwgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoQHdvcmxkKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0QGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuXHRcdEByb290LmFkZChAYW1iaWVudExpZ2h0KTtcdFx0XG5cblx0XHRAcGxheWVyMSA9IG5ldyBQbGF5ZXIoKVxuXHRcdEBhZGQgQHBsYXllcjFcblxuXHRcdCQuZ2V0SlNPTiBcImFzc2V0cy9sZXZlbF8xLmpzb25cIiwgQG9uTG9hZFxuXHRcdFx0XG5cdG9uTG9hZDogKGRhdGEpPT5cblx0XHRAZGF0YSA9IGRhdGFcblx0XHQjIGNvbnNvbGUubG9nIEBkYXRhXG5cdFx0QHRpbGVTZXRzID0gW11cblx0XHRAdGlsZXMgPSBbXVxuXG5cdFx0IyBsb2FkIHRoZSB0aWxlU2V0IG1ldGFkYXRhLCB0ZXh0dXJlLCBhbmQgY3JlYXRlIHRpbGUgZ2VvbWV0cmllc1xuXHRcdGZvciB0aWxlU2V0RGF0YSBpbiBkYXRhLnRpbGVzZXRzXG5cdFx0XHQjIGxvYWQgdGlsZXNldCBkYXRhIGFuZCB0ZXh0dXJlXG5cdFx0XHR0aWxlU2V0ID0gbmV3IFRpbGVTZXQgXCJhc3NldHMvXCIrdGlsZVNldERhdGEuaW1hZ2UsIFxuXHRcdFx0XHR0aWxlU2V0RGF0YS5pbWFnZXdpZHRoLCBcblx0XHRcdFx0dGlsZVNldERhdGEuaW1hZ2VoZWlnaHQsXG5cdFx0XHRcdHRpbGVTZXREYXRhLnRpbGV3aWR0aCxcblx0XHRcdFx0dGlsZVNldERhdGEudGlsZWhlaWdodFxuXG5cdFx0XHRAdGlsZVNldHMucHVzaCB0aWxlU2V0XG5cblx0XHRcdCMgY3JlYXRlIHRpbGUgZ2VvbWV0cnlcblx0XHRcdGlkID0gdGlsZVNldERhdGEuZmlyc3RnaWRcblx0XHRcdGZvciByb3cgaW4gWzAuLnRpbGVTZXQucm93cy0xXVxuXHRcdFx0XHRmb3IgY29sIGluIFswLi50aWxlU2V0LmNvbHMtMV1cblx0XHRcdFx0XHR0aWxlID0gbmV3IFRpbGUgdGlsZVNldCwgcm93LCBjb2xcblx0XHRcdFx0XHRAdGlsZXNbaWRdID0gdGlsZVxuXHRcdFx0XHRcdGlkKytcblxuXG5cdFx0IyBjcmVhdGUgdGlsZSBvYmplY3RzIHRoYXQgY29tcHJpc2UgYmFja2dyb3VuZHNcblx0XHRmYXJCYWNrZ3JvdW5kID0gQGxvYWRUaWxlTGF5ZXIoZGF0YS5sYXllcnNbMF0pXG5cdFx0ZmFyQmFja2dyb3VuZC5wb3NpdGlvbi55ID0gNy41ICogMlxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wXG5cdFx0ZmFyQmFja2dyb3VuZC5wb3NpdGlvbi56ID0gLXRhcmdldFpcblx0XHRmYXJCYWNrZ3JvdW5kLnNjYWxlLnNldCgyLCAyLCAyKVxuXHRcdGNvbnNvbGUubG9nIGZhckJhY2tncm91bmRcblx0XHRAcm9vdC5hZGQgZmFyQmFja2dyb3VuZFxuXHRcdFxuXHRcdGJhY2tncm91bmQgPSBAbG9hZFRpbGVMYXllcihkYXRhLmxheWVyc1sxXSlcblx0XHRiYWNrZ3JvdW5kLnBvc2l0aW9uLnkgPSA3LjVcblx0XHRjb25zb2xlLmxvZyBiYWNrZ3JvdW5kXG5cdFx0QHJvb3QuYWRkIGJhY2tncm91bmRcblxuXG5cdFx0IyBsb2FkIG9iamVjdHNcblx0XHRmb3IgbyBpbiBkYXRhLmxheWVyc1syXS5vYmplY3RzIFxuXHRcdFx0ZW5lbXkgPSBuZXcgRW5lbWllc1tvLnR5cGVdKG5ldyBUSFJFRS5WZWN0b3IzKG8ueCAvIDMyLCA3IC0gby55IC8gMzIsIHV0aWwucmFuZG9tKC0xLCAxKSkpXG5cdFx0XHRlbmVteS5hY3RpdmUgPSBmYWxzZVxuXHRcdFx0QGFkZCBlbmVteVxuXG5cblx0bG9hZFRpbGVMYXllcjogKGRhdGEpPT5cblx0XHRsYXllciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0Zm9yIGlkLCBpbmRleCBpbiBkYXRhLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gZGF0YS53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBkYXRhLndpZHRoXG5cdFx0XHRcdHRpbGVPYmplY3QgPSBuZXcgVGlsZU9iamVjdChAdGlsZXNbaWRdLCBuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIC1yb3cgLSAxLCAwKSApXG5cdFx0XHRcdGxheWVyLmFkZCB0aWxlT2JqZWN0LnJvb3RcdFxuXHRcdHJldHVybiBsYXllclxuXHRcdFxuXG5cblx0XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlID09IGZhbHNlIGFuZCBjaGlsZC5yb290LnBvc2l0aW9uLnggPCBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKyAxMFxuXHRcdFx0XHRjaGlsZC5hY3RpdmF0ZSgpXG5cblx0XHRAY29sbGlzaW9ucygpXG5cblx0XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKTtcblxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cdGNvbGxpc2lvbnM6ICgpLT5cblx0XHRmb3IgYSBpbiBAY29sbGlkZXJzXG5cdFx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0XHRmb3IgYiBpbiBAY29sbGlkZXJzXG5cdFx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRcdGlmIGEuY29sbGlkZXJIaXRUeXBlcy5pbmRleE9mKGIuY29sbGlkZXJUeXBlKSA+IC0xXG5cdFx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVXaXRoIGJcblxuXHR0ZXN0Q29sbGlzaW9uOiAoYSwgYiktPlxuXHRcdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IDFcblxuXG5cblxuXG5jbGFzcyBHYW1lXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0I3NldHVwIHdvcmxkXG5cdFx0QHdvcmxkID0gbmV3IFdvcmxkKClcblx0XHRcblx0XHRTY29yZS5kaXNwbGF5RWxlbWVudCA9ICQoXCJcIlwiPGgxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdEBsb2FkTGV2ZWwoKVxuXG5cdFx0dXRpbC5hZnRlciAxMDAwLCAoKT0+XG5cdFx0XHRAd29ybGQuc3RhcnQoKVxuXHRcblx0bG9hZExldmVsOiAoKS0+XG5cdFx0QHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ID0gMDtcblx0XHRAbGV2ZWwgPSBuZXcgTGV2ZWwoQHdvcmxkKVxuXHRcdEB3b3JsZC5zY2VuZS5hZGQgQGxldmVsLnJvb3Rcblx0XHRAd29ybGQub24gXCJ1cGRhdGVcIiwgQGxldmVsLnVwZGF0ZVxuXHRcdFxuXHRyZXNldDogKCk9PlxuXHRcdGNvbnNvbGUubG9nIFwicmVzZXQgbGV2ZWxcIlxuXHRcdFxuXHRcdEB3b3JsZC5zY2VuZS5yZW1vdmUgQGxldmVsLnJvb3Rcblx0XHRAd29ybGQub2ZmIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblxuXHRcdEBsb2FkTGV2ZWwoKVxuXG5cbm1vZHVsZS5leHBvcnRzLmdhbWUgPSBnYW1lID0gbmV3IEdhbWUoKVxuXG5cdFx0XG5cbiMgbW9kZWxMb2FkZXIgPSBuZXcgY29yZS5Nb2RlbExvYWRlcigpXG5cblxuXHRcdFx0XG5cblxuIiwiZXhwb3J0cy5hZnRlciA9IChkZWxheSwgZnVuYyktPlxuXHRzZXRUaW1lb3V0IGZ1bmMsIGRlbGF5XG5cbmV4cG9ydHMucmFuZG9tID0gKG1pbiwgbWF4KS0+XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4iXX0=
