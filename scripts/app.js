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
    var background, col, enemy, farBackground, fov_radians, id, index, layer, o, row, targetZ, tile, tileObject, tileSet, tileSetData, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
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
    fov_radians = 45 * (Math.PI / 180);
    targetZ = 480 / (2 * Math.tan(fov_radians / 2)) / 32.0;
    layer = data.layers[0];
    farBackground = new THREE.Object3D();
    _ref3 = layer.data;
    for (index = _l = 0, _len1 = _ref3.length; _l < _len1; index = ++_l) {
      id = _ref3[index];
      if (id > 0) {
        row = Math.floor(index / layer.width);
        col = index % layer.width;
        tileObject = new TileObject(this.tiles[id], new THREE.Vector3(col, -row - 1, 0));
        farBackground.add(tileObject.root);
      }
    }
    this.root.add(farBackground);
    farBackground.position.y = 7.5 * 2;
    farBackground.position.z = -targetZ;
    farBackground.scale.set(2, 2, 2);
    layer = data.layers[1];
    background = new THREE.Object3D();
    _ref4 = layer.data;
    for (index = _m = 0, _len2 = _ref4.length; _m < _len2; index = ++_m) {
      id = _ref4[index];
      if (id > 0) {
        row = Math.floor(index / layer.width);
        col = index % layer.width;
        tileObject = new TileObject(this.tiles[id], new THREE.Vector3(col, -row - 1, 0));
        background.add(tileObject.root);
      }
    }
    background.position.y = 7.5;
    this.root.add(background);
    _ref5 = data.layers[2].objects;
    _results = [];
    for (_n = 0, _len3 = _ref5.length; _n < _len3; _n++) {
      o = _ref5[_n];
      enemy = new Enemies[o.type](new THREE.Vector3(o.x / 32, 7 - o.y / 32, util.random(-1, 1)));
      enemy.active = false;
      _results.push(this.add(enemy));
    }
    return _results;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dvcmxkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvc2h1bXAuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsQ0FFQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxLQUFqQixDQUF1QixTQUFBLEdBQUE7QUFFdEIsTUFBQSxzRUFBQTtBQUFBLEVBQUEsQ0FBQSxDQUFFLFFBQUYsQ0FBWSxDQUFBLENBQUEsQ0FBRSxDQUFDLHVCQUFmLENBQXVDLE9BQU8sQ0FBQyxvQkFBL0MsQ0FBQSxDQUFBO0FBQUEsRUFFQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLGVBQUYsQ0FGVCxDQUFBO0FBQUEsRUFHQSxZQUFBLEdBQWUsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFBLEdBQWlCLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FIaEMsQ0FBQTtBQUFBLEVBS0EsY0FBQSxHQUFpQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFBLENBTGpCLENBQUE7QUFBQSxFQU1BLGVBQUEsR0FBa0IsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQU5sQixDQUFBO0FBQUEsRUFPQSxlQUFBLEdBQWtCLGNBQUEsR0FBaUIsZUFQbkMsQ0FBQTtBQUFBLEVBUUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxZQUFaLEVBQTBCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FBMUIsRUFBOEMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQUE5QyxFQUFrRSxlQUFsRSxDQVJBLENBQUE7QUFVQSxFQUFBLElBQUcsWUFBQSxHQUFlLGVBQWxCO0FBQ0MsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVosQ0FBQSxDQUFBO0FBQUEsSUFDQSxNQUFNLENBQUMsTUFBUCxDQUFjLGVBQWQsQ0FEQSxDQUFBO1dBRUEsTUFBTSxDQUFDLEtBQVAsQ0FBYSxlQUFBLEdBQWtCLFlBQS9CLEVBSEQ7R0FBQSxNQUFBO0FBS0MsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGFBQVosQ0FBQSxDQUFBO0FBQUEsSUFDQSxNQUFNLENBQUMsS0FBUCxDQUFhLGNBQWIsQ0FEQSxDQUFBO1dBRUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxjQUFBLEdBQWlCLFlBQS9CLEVBUEQ7R0Fac0I7QUFBQSxDQUF2QixDQUZBLENBQUE7O0FBQUEsQ0F1QkEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxNQUFaLENBQW1CLDZCQUFuQixDQXZCQSxDQUFBOztBQUFBLFdBMEJBLEdBQWMsU0FBQSxHQUFBO1NBQ2IsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBNEIsbUJBQUEsR0FBa0IsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQXhFLEVBRGE7QUFBQSxDQTFCZCxDQUFBOztBQUFBLEtBOEJLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFqQixDQUFvQixRQUFwQixFQUE4QixXQUE5QixDQTlCQSxDQUFBOzs7O0FDQUEsSUFBQSxJQUFBO0VBQUE7b0JBQUE7O0FBQUE7QUFDYyxFQUFBLGNBQUEsR0FBQTtBQUNaLDZDQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBWCxDQURZO0VBQUEsQ0FBYjs7QUFBQSxpQkFHQSxFQUFBLEdBQUksU0FBQyxLQUFELEVBQVEsT0FBUixHQUFBO0FBQ0gsUUFBQSxLQUFBO0FBQUEsSUFBQSw4Q0FBVSxDQUFBLEtBQUEsU0FBQSxDQUFBLEtBQUEsSUFBVSxFQUFwQixDQUF1QixDQUFDLElBQXhCLENBQTZCLE9BQTdCLENBQUEsQ0FBQTtBQUNBLFdBQU8sSUFBUCxDQUZHO0VBQUEsQ0FISixDQUFBOztBQUFBLGlCQU9BLEdBQUEsR0FBSyxTQUFDLEtBQUQsRUFBUSxPQUFSLEdBQUE7QUFDSixRQUFBLDhCQUFBO0FBQUE7QUFBQSxTQUFBLDJEQUFBOzRCQUFBO1VBQTJDLE9BQUEsS0FBVztBQUNyRCxRQUFBLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFNLENBQUMsTUFBaEIsQ0FBdUIsS0FBdkIsRUFBOEIsQ0FBOUIsQ0FBQTtPQUREO0FBQUEsS0FBQTtBQUVBLFdBQU8sSUFBUCxDQUhJO0VBQUEsQ0FQTCxDQUFBOztBQUFBLGlCQVlBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUixRQUFBLGlDQUFBO0FBQUEsSUFEUyxzQkFBTyw4REFDaEIsQ0FBQTtBQUFBLElBQUEsSUFBbUIsMkJBQW5CO0FBQUEsYUFBTyxJQUFQLENBQUE7S0FBQTtBQUNBLFNBQVMscUVBQVQsR0FBQTtBQUNDLE1BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFPLENBQUEsQ0FBQSxDQUExQixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsS0FBUixDQUFjLElBQWQsRUFBb0IsSUFBcEIsQ0FEQSxDQUREO0FBQUEsS0FEQTtBQUlBLFdBQU8sSUFBUCxDQUxRO0VBQUEsQ0FaVCxDQUFBOztjQUFBOztJQURELENBQUE7O0FBQUEsTUFvQk0sQ0FBQyxPQUFQLEdBQWlCLElBcEJqQixDQUFBOzs7O0FDQUEsSUFBQSwyQkFBQTtFQUFBO2lTQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FBYixDQUFBOztBQUFBO0FBR0Msb0NBQUEsQ0FBQTs7QUFBYSxFQUFBLHlCQUFBLEdBQUE7QUFDWixJQUFBLCtDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsTUFEaEIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEVBRnBCLENBRFk7RUFBQSxDQUFiOztBQUFBLDRCQUtBLFdBQUEsR0FBYSxTQUFDLFVBQUQsR0FBQTtBQUNaLElBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBQSxDQUFBLENBQUE7V0FDQSxVQUFVLENBQUMsR0FBWCxDQUFBLEVBRlk7RUFBQSxDQUxiLENBQUE7O3lCQUFBOztHQUQ2QixXQUY5QixDQUFBOztBQUFBLE1BYU0sQ0FBQyxPQUFQLEdBQWlCLGVBYmpCLENBQUE7Ozs7QUNBQSxJQUFBLHNFQUFBO0VBQUE7aVNBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxnQkFBUixDQUFSLENBQUE7O0FBQUEsS0FDQSxHQUFRLE9BQUEsQ0FBUSxnQkFBUixDQURSLENBQUE7O0FBQUEsZUFFQSxHQUFrQixPQUFBLENBQVEsMEJBQVIsQ0FGbEIsQ0FBQTs7QUFBQSxRQUdBLEdBQVcsT0FBQSxDQUFRLG1CQUFSLENBSFgsQ0FBQTs7QUFBQSxPQUlBLEdBQVUsT0FBQSxDQUFRLGtCQUFSLENBSlYsQ0FBQTs7QUFBQTtBQVFDLE1BQUEsMENBQUE7O0FBQUEsMEJBQUEsQ0FBQTs7QUFBQSxFQUFBLFlBQUEsR0FBZSxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLDBCQUE3QixDQUFmLENBQUE7O0FBQUEsRUFDQSxhQUFBLEdBQW9CLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQ2xCO0FBQUEsSUFBQSxHQUFBLEVBQUssWUFBTDtBQUFBLElBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxVQURaO0FBQUEsSUFFQSxPQUFBLEVBQVMsS0FBSyxDQUFDLFNBRmY7QUFBQSxJQUdBLFdBQUEsRUFBYSxJQUhiO0dBRGtCLENBRHBCLENBQUE7O0FBQUEsRUFNQSxhQUFBLEdBQW9CLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FOcEIsQ0FBQTs7QUFRYSxFQUFBLGVBQUMsUUFBRCxHQUFBO0FBQ1osSUFBQSxxQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxZQUFELEdBQWdCLE9BRGhCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixRQUF2QixDQUZBLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxhQUFYLEVBQTBCLGFBQTFCLENBQWQsQ0FKQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBTEEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQU5QLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxRQUFELEdBQVksS0FQWixDQURZO0VBQUEsQ0FSYjs7QUFBQSxrQkFrQkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxrQ0FBTSxLQUFOLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxHQUFELElBQVEsTUFGRDtFQUFBLENBbEJSLENBQUE7O0FBQUEsa0JBdUJBLEdBQUEsR0FBSyxTQUFBLEdBQUE7QUFDSixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFBLENBQUE7QUFBQSxJQUNBLEtBQUssQ0FBQyxJQUFOLENBQVcsV0FBWCxDQURBLENBQUE7QUFFQSxTQUFTLDhCQUFULEdBQUE7QUFDQyxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFnQixJQUFBLFFBQUEsQ0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQWYsRUFBeUIsQ0FBekIsQ0FBaEIsQ0FBQSxDQUREO0FBQUEsS0FGQTtXQUlBLDZCQUFBLEVBTEk7RUFBQSxDQXZCTCxDQUFBOztlQUFBOztHQURtQixnQkFQcEIsQ0FBQTs7QUFBQTtBQXdDQyw0QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsb0JBQUEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxvQ0FBTSxLQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixDQUFBLENBQUEsR0FBSyxLQUR6QixDQUFBO1dBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixLQUFBLEdBQVEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsR0FBVixFQUhyQjtFQUFBLENBQVIsQ0FBQTs7aUJBQUE7O0dBRHFCLE1BdkN0QixDQUFBOztBQUFBO0FBOENDLHlCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxpQkFBQSxNQUFBLEdBQVEsU0FBQyxLQUFELEdBQUE7QUFDUCxJQUFBLGlDQUFNLEtBQU4sQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxHQUFELEdBQU8sRUFBVjtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixDQUFBLEVBQUEsR0FBTSxLQUExQixDQUREO0tBQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBVjtBQUNKLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixDQUFBLEdBQUksS0FBeEIsQ0FESTtLQUFBLE1BQUE7QUFHSixNQUFBLElBQUMsQ0FBQSxHQUFELENBQUEsQ0FBQSxDQUhJO0tBSEw7QUFRQSxJQUFBLElBQUcsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFQLElBQWEsQ0FBQSxJQUFLLENBQUEsUUFBckI7QUFDQyxNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBWixDQUFBO2FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQUZEO0tBVE87RUFBQSxDQUFSLENBQUE7O0FBQUEsaUJBY0EsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUViLFFBQUEsTUFBQTtBQUFBLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFBLENBRFosQ0FBQTtBQUFBLElBRUEsTUFBQSxHQUFhLElBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQXJCLENBRmIsQ0FBQTtBQUFBLElBSUEsTUFBTSxDQUFDLFlBQVAsR0FBc0IsY0FKdEIsQ0FBQTtBQUFBLElBS0EsTUFBTSxDQUFDLGdCQUFQLEdBQTBCLENBQUMsUUFBRCxDQUwxQixDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxFQUFMLEdBQVUsR0FOekIsQ0FBQTtBQUFBLElBT0EsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQVBmLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosQ0FUQSxDQUFBO0FBQUEsSUFXQSxNQUFBLEdBQWEsSUFBQSxPQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBckIsQ0FYYixDQUFBO0FBQUEsSUFhQSxNQUFNLENBQUMsWUFBUCxHQUFzQixjQWJ0QixDQUFBO0FBQUEsSUFjQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQyxRQUFELENBZDFCLENBQUE7QUFBQSxJQWVBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQWZ6QixDQUFBO0FBQUEsSUFnQkEsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQWhCZixDQUFBO1dBa0JBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosRUFwQmE7RUFBQSxDQWRkLENBQUE7O2NBQUE7O0dBRGtCLE1BN0NuQixDQUFBOztBQUFBLE9BbUZPLENBQUMsS0FBUixHQUFnQixLQW5GaEIsQ0FBQTs7QUFBQSxPQW9GTyxDQUFDLE9BQVIsR0FBa0IsT0FwRmxCLENBQUE7O0FBQUEsT0FxRk8sQ0FBQyxJQUFSLEdBQWUsSUFyRmYsQ0FBQTs7OztBQ0FBLElBQUEsVUFBQTtFQUFBLGtGQUFBOztBQUFBO0FBQ2MsRUFBQSxvQkFBQSxHQUFBO0FBQ1osMkNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFWLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFEWixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUZaLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FIUixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBSlYsQ0FEWTtFQUFBLENBQWI7O0FBQUEsdUJBT0EsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsUUFBQSw0QkFBQTtBQUFBO1NBQVMsK0RBQVQsR0FBQTtBQUNDLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFsQixDQUFBO0FBQ0EsTUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFUO0FBQ0MsUUFBQSxJQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBO0FBQ0EsaUJBRkQ7T0FEQTtBQUlBLE1BQUEsSUFBRyxLQUFLLENBQUMsTUFBVDtzQkFDQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWIsR0FERDtPQUFBLE1BQUE7OEJBQUE7T0FMRDtBQUFBO29CQURPO0VBQUEsQ0FQUixDQUFBOztBQUFBLHVCQWdCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO1dBQ1QsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUREO0VBQUEsQ0FoQlYsQ0FBQTs7QUFBQSx1QkFvQkEsR0FBQSxHQUFLLFNBQUMsVUFBRCxHQUFBO0FBQ0osSUFBQSxVQUFVLENBQUMsTUFBWCxHQUFvQixJQUFwQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxVQUFmLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsVUFBVSxDQUFDLElBQXJCLENBRkEsQ0FBQTtBQUdBLFdBQU8sVUFBUCxDQUpJO0VBQUEsQ0FwQkwsQ0FBQTs7QUFBQSx1QkEwQkEsTUFBQSxHQUFRLFNBQUMsVUFBRCxHQUFBO0FBQ1AsUUFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxVQUFVLENBQUMsSUFBeEIsQ0FBQSxDQUFBO0FBQUEsSUFDQSxVQUFVLENBQUMsTUFBWCxHQUFvQixJQURwQixDQUFBO0FBQUEsSUFFQSxDQUFBLEdBQUssSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLFVBQWxCLENBRkwsQ0FBQTtBQUdBLElBQUEsSUFBRyxDQUFBLElBQUssQ0FBUjtBQUNDLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLENBQWpCLEVBQW9CLENBQXBCLENBQUEsQ0FERDtLQUhBO0FBS0EsV0FBTyxVQUFQLENBTk87RUFBQSxDQTFCUixDQUFBOztBQUFBLHVCQWtDQSxHQUFBLEdBQUssU0FBQSxHQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FBUSxLQURKO0VBQUEsQ0FsQ0wsQ0FBQTs7b0JBQUE7O0lBREQsQ0FBQTs7QUFBQSxNQXNDTSxDQUFDLE9BQVAsR0FBaUIsVUF0Q2pCLENBQUE7Ozs7QUNBQSxJQUFBLEtBQUE7O0FBQUE7QUFDQyxrQkFBQSxNQUFBLEdBQ0M7QUFBQSxJQUFBLElBQUEsRUFBSyxJQUFMO0FBQUEsSUFDQSxJQUFBLEVBQUssSUFETDtBQUFBLElBRUEsSUFBQSxFQUFLLE1BRkw7QUFBQSxJQUdBLElBQUEsRUFBSyxNQUhMO0FBQUEsSUFJQSxJQUFBLEVBQUssTUFKTDtBQUFBLElBS0EsSUFBQSxFQUFLLE1BTEw7QUFBQSxJQU1BLElBQUEsRUFBSyxPQU5MO0FBQUEsSUFPQSxJQUFBLEVBQUssT0FQTDtBQUFBLElBUUEsSUFBQSxFQUFLLGNBUkw7R0FERCxDQUFBOztBQVdhLEVBQUEsZUFBQSxHQUFBO0FBQ1osUUFBQSxnQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUFiLENBQUE7QUFFQTtBQUFBLFNBQUEsV0FBQTt3QkFBQTtBQUNDLE1BQUEsSUFBQyxDQUFBLFNBQVUsQ0FBQSxLQUFBLENBQVgsR0FBb0IsS0FBcEIsQ0FERDtBQUFBLEtBRkE7QUFBQSxJQUtBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxPQUFWLENBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUVqQixRQUFBLElBQUcsS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFDLENBQUMsS0FBRixDQUFYO0FBQ0MsVUFBQSxLQUFDLENBQUEsU0FBVSxDQUFBLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBUixDQUFYLEdBQStCLElBQS9CLENBREQ7U0FBQTtlQUVBLENBQUMsQ0FBQyxlQUFGLENBQUEsRUFKaUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixDQUxBLENBQUE7QUFBQSxJQVdBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUNmLFFBQUEsSUFBRyxLQUFDLENBQUEsTUFBTyxDQUFBLENBQUMsQ0FBQyxLQUFGLENBQVg7QUFDQyxVQUFBLEtBQUMsQ0FBQSxTQUFVLENBQUEsS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFDLENBQUMsS0FBRixDQUFSLENBQVgsR0FBK0IsS0FBL0IsQ0FERDtTQUFBO2VBRUEsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxFQUhlO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEIsQ0FYQSxDQURZO0VBQUEsQ0FYYjs7ZUFBQTs7SUFERCxDQUFBOztBQUFBLE1BNkJNLENBQUMsT0FBUCxHQUFpQixLQTdCakIsQ0FBQTs7OztBQ0FBLElBQUEsd0JBQUE7RUFBQTs7O29CQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUE7QUFHQywwQkFBQSxDQUFBOztBQUFhLEVBQUEsZUFBRSxRQUFGLEVBQWEsUUFBYixHQUFBO0FBQ1osSUFEYSxJQUFDLENBQUEsV0FBQSxRQUNkLENBQUE7QUFBQSxJQUR3QixJQUFDLENBQUEsV0FBQSxRQUN6QixDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLHVDQUFBLENBQUE7QUFBQSxJQUFBLHFDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxNQURaLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksTUFGWixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLE1BSFgsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUpWLENBRFk7RUFBQSxDQUFiOztBQUFBLGtCQU9BLElBQUEsR0FBTSxTQUFDLFFBQUQsR0FBQTtBQUNMLFFBQUEsVUFBQTtBQUFBLElBQUEsVUFBQSxHQUFpQixJQUFBLEtBQUssQ0FBQyxVQUFOLENBQUEsQ0FBakIsQ0FBQTtXQUNBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFFBQWhCLEVBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDekIsWUFBQSwyQkFBQTtBQUFBLFFBRDBCLHlCQUFVLDBCQUFXLGdFQUMvQyxDQUFBO0FBQUEsUUFBQSxLQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUssQ0FBQyxnQkFBTixDQUF3QixTQUF4QixDQUFoQixDQUFBO0FBQUEsUUFFQSxLQUFDLENBQUEsUUFBRCxHQUFZLFFBRlosQ0FBQTtBQUFBLFFBR0EsS0FBQyxDQUFBLE1BQUQsR0FBVSxPQUhWLENBQUE7ZUFJQSxLQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsRUFBb0IsS0FBcEIsRUFMeUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixFQUZLO0VBQUEsQ0FQTixDQUFBOztBQUFBLGtCQWdCQSxPQUFBLEdBQVMsU0FBQyxRQUFELEdBQUE7V0FDUixJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsUUFBN0IsRUFBdUMsRUFBdkMsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNyRCxRQUFBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBR2Y7QUFBQSxVQUFBLEdBQUEsRUFBSyxLQUFDLENBQUEsT0FBTjtTQUhlLENBQWhCLENBQUE7QUFBQSxRQUtBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsQ0FBcEIsRUFBdUIsQ0FBdkIsQ0FMaEIsQ0FBQTtBQUFBLFFBTUEsS0FBQyxDQUFBLE1BQUQsR0FBVSxPQU5WLENBQUE7ZUFRQSxLQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsRUFBb0IsS0FBcEIsRUFUcUQ7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxFQURIO0VBQUEsQ0FoQlQsQ0FBQTs7ZUFBQTs7R0FEbUIsS0FGcEIsQ0FBQTs7QUFBQTtBQWtDYyxFQUFBLHFCQUFBLEdBQUE7QUFDWixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsQ0FBbkIsRUFBcUIsQ0FBckIsRUFBdUIsQ0FBdkIsQ0FBdkIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDdEI7QUFBQSxNQUFBLEtBQUEsRUFBTyxRQUFQO0FBQUEsTUFDQSxTQUFBLEVBQVcsSUFEWDtBQUFBLE1BRUEsR0FBQSxFQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsdUJBQTdCLENBRkw7S0FEc0IsQ0FEdkIsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsRUFOaEIsQ0FEWTtFQUFBLENBQWI7O0FBQUEsd0JBU0EsSUFBQSxHQUFNLFNBQUMsUUFBRCxHQUFBO0FBR0wsUUFBQSxhQUFBO0FBQUEsSUFBQSxJQUFHLHFDQUFBLElBQTRCLElBQUMsQ0FBQSxZQUFhLENBQUEsUUFBQSxDQUFTLENBQUMsTUFBeEIsS0FBa0MsT0FBakU7QUFFQyxhQUFXLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsWUFBYSxDQUFBLFFBQUEsQ0FBUyxDQUFDLFFBQW5DLEVBQTZDLElBQUMsQ0FBQSxZQUFhLENBQUEsUUFBQSxDQUFTLENBQUMsUUFBckUsQ0FBWCxDQUZEO0tBQUE7QUFNQSxJQUFBLElBQUcsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQWpCO0FBQ0MsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQXRCLENBREQ7S0FBQSxNQUFBO0FBS0MsTUFBQSxLQUFBLEdBQVksSUFBQSxLQUFBLENBQUEsQ0FBWixDQUFBO0FBQ0EsTUFBQSxJQUFHLFFBQVEsQ0FBQyxLQUFULENBQWUsR0FBZixDQUFtQixDQUFDLEdBQXBCLENBQUEsQ0FBQSxLQUE2QixJQUFoQztBQUNDLFFBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLENBQUEsQ0FERDtPQUFBLE1BQUE7QUFHQyxRQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBZCxDQUFBLENBSEQ7T0FEQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQWQsR0FBMEIsS0FMMUIsQ0FMRDtLQU5BO0FBQUEsSUFrQkEsTUFBQSxHQUFhLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBWSxJQUFDLENBQUEsZUFBYixFQUE4QixJQUFDLENBQUEsZUFBL0IsQ0FsQmIsQ0FBQTtBQUFBLElBbUJBLEtBQUssQ0FBQyxFQUFOLENBQVMsU0FBVCxFQUFvQixTQUFDLENBQUQsR0FBQTtBQUNuQixNQUFBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLENBQUMsQ0FBQyxRQUFwQixDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsUUFBUCxHQUFrQixDQUFDLENBQUMsUUFEcEIsQ0FBQTthQUVBLENBQUMsQ0FBQyxHQUFGLENBQU0sU0FBTixFQUFpQixTQUFTLENBQUMsTUFBM0IsRUFIbUI7SUFBQSxDQUFwQixDQW5CQSxDQUFBO0FBdUJBLFdBQU8sTUFBUCxDQTFCSztFQUFBLENBVE4sQ0FBQTs7cUJBQUE7O0lBbENELENBQUE7O0FBQUEsTUF1RU0sQ0FBQyxPQUFQLEdBQWlCLFdBdkVqQixDQUFBOzs7O0FDQUEsSUFBQSwwQkFBQTtFQUFBO2lTQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FBYixDQUFBOztBQUFBLElBQ0EsR0FBTyxPQUFBLENBQVEsZ0JBQVIsQ0FEUCxDQUFBOztBQUFBO0FBSUMsTUFBQSxtREFBQTs7QUFBQSw2QkFBQSxDQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLCtCQUE3QixDQUFsQixDQUFBOztBQUFBLEVBQ0EsZ0JBQUEsR0FBdUIsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDckI7QUFBQSxJQUFBLEdBQUEsRUFBSyxlQUFMO0FBQUEsSUFDQSxPQUFBLEVBQVMsS0FBSyxDQUFDLFNBRGY7QUFBQSxJQUVBLFVBQUEsRUFBWSxLQUZaO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtBQUFBLElBSUEsUUFBQSxFQUFVLEtBQUssQ0FBQyxnQkFKaEI7R0FEcUIsQ0FEdkIsQ0FBQTs7QUFBQSxFQVFBLGdCQUFBLEdBQXVCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FSdkIsQ0FBQTs7QUFVYSxFQUFBLGtCQUFDLFFBQUQsRUFBVyxNQUFYLEdBQUE7QUFDWixJQUFBLHdDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFBLENBRlQsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxnQkFBWCxFQUE2QixnQkFBN0IsQ0FBZCxDQUpBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQUEsQ0FBWixFQUFnQixDQUFoQixDQUFkLEVBQWtDLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQSxDQUFaLEVBQWdCLENBQWhCLENBQWxDLEVBQXNELElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQSxDQUFaLEVBQWdCLENBQWhCLENBQXRELENBTmhCLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQXFCLENBQUMsY0FBdEIsQ0FBcUMsTUFBckMsQ0FQQSxDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBUkEsQ0FEWTtFQUFBLENBVmI7O0FBQUEscUJBcUJBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLFFBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxjQUFWLENBQXlCLEdBQXpCLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixJQUFDLENBQUEsUUFBUSxDQUFDLENBQVYsR0FBYyxLQURsQyxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBVixHQUFjLEtBRmxDLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsS0FIbEMsQ0FBQTtBQUFBLElBSUEsQ0FBQSxHQUFJLENBQUEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLEtBQWYsQ0FBQSxHQUF3QixJQUFDLENBQUEsVUFBMUIsQ0FBSCxHQUEyQyxHQUovQyxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFaLENBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLENBTEEsQ0FBQTtBQU1BLElBQUEsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxVQUExQjthQUNDLElBQUMsQ0FBQSxHQUFELENBQUEsRUFERDtLQVBPO0VBQUEsQ0FyQlIsQ0FBQTs7a0JBQUE7O0dBRHNCLFdBSHZCLENBQUE7O0FBQUEsTUFtQ00sQ0FBQyxPQUFQLEdBQWlCLFFBbkNqQixDQUFBOzs7O0FDQUEsSUFBQSxzR0FBQTtFQUFBOztpU0FBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGdCQUFSLENBQVAsQ0FBQTs7QUFBQSxLQUVBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBRlIsQ0FBQTs7QUFBQSxlQUdBLEdBQWtCLE9BQUEsQ0FBUSwwQkFBUixDQUhsQixDQUFBOztBQUFBLFdBSUEsR0FBYyxPQUFBLENBQVEsc0JBQVIsQ0FKZCxDQUFBOztBQUFBLEtBS0EsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FMUixDQUFBOztBQUFBLE9BTUEsR0FBVSxPQUFBLENBQVEsa0JBQVIsQ0FOVixDQUFBOztBQUFBLFFBT0EsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FQWCxDQUFBOztBQUFBLEtBUUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FSUixDQUFBOztBQUFBLFdBVUEsR0FBa0IsSUFBQSxXQUFBLENBQUEsQ0FWbEIsQ0FBQTs7QUFBQSxLQVdBLEdBQVksSUFBQSxLQUFBLENBQUEsQ0FYWixDQUFBOztBQUFBO0FBZUMsMkJBQUEsQ0FBQTs7QUFBYSxFQUFBLGdCQUFBLEdBQUE7QUFDWiwyQ0FBQSxDQUFBO0FBQUEsSUFBQSxzQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxZQUFELEdBQWdCLFFBSGhCLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixjQUF2QixDQUpBLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLFdBQVcsQ0FBQyxJQUFaLENBQWlCLHNCQUFqQixDQUFWLENBUEEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFBLENBVFosQ0FEWTtFQUFBLENBQWI7O0FBQUEsbUJBYUEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsSUFBQSxDQUFuQjtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixFQUFBLEdBQUssS0FBekIsQ0FERDtLQUFBO0FBRUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsTUFBQSxDQUFuQjtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixFQUFBLEdBQUssS0FBekIsQ0FERDtLQUZBO0FBSUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsTUFBQSxDQUFuQjtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixFQUFBLEdBQUssS0FBekIsQ0FERDtLQUpBO0FBTUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsT0FBQSxDQUFuQjtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixFQUFBLEdBQUssS0FBekIsQ0FERDtLQU5BO0FBUUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsY0FBQSxDQUFuQjthQUNDLElBQUMsQ0FBQSxZQUFELENBQUEsRUFERDtLQVRPO0VBQUEsQ0FiUixDQUFBOztBQUFBLG1CQXlCQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ2IsUUFBQSxNQUFBO0FBQUEsSUFBQSxJQUFHLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBQSxHQUFhLElBQUMsQ0FBQSxRQUFELEdBQVksR0FBQSxHQUFNLENBQWxDO0FBQ0MsTUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FEWixDQUFBO0FBQUEsTUFHQSxNQUFBLEdBQWEsSUFBQSxPQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBckIsQ0FIYixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBSkEsQ0FBQTtBQUFBLE1BTUEsTUFBQSxHQUFhLElBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQXJCLENBTmIsQ0FBQTtBQUFBLE1BT0EsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQUFBLEdBUGYsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksTUFBWixDQVJBLENBQUE7QUFBQSxNQVVBLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFyQixDQVZiLENBQUE7QUFBQSxNQVdBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsQ0FBQSxHQVhmLENBQUE7YUFZQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBYkQ7S0FEYTtFQUFBLENBekJkLENBQUE7O0FBQUEsbUJBMENBLEdBQUEsR0FBSyxTQUFBLEdBQUE7QUFHSixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsV0FBWCxDQUFBLENBQUE7QUFDQSxTQUFTLCtCQUFULEdBQUE7QUFDQyxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFnQixJQUFBLFFBQUEsQ0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQWYsRUFBeUIsQ0FBekIsQ0FBaEIsQ0FBQSxDQUREO0FBQUEsS0FEQTtBQUFBLElBSUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBNUIsQ0FKQSxDQUFBO1dBS0EsOEJBQUEsRUFSSTtFQUFBLENBMUNMLENBQUE7O2dCQUFBOztHQUZvQixnQkFickIsQ0FBQTs7QUFBQSxNQXFFTSxDQUFDLE9BQVAsR0FBaUIsTUFyRWpCLENBQUE7Ozs7QUNDQSxJQUFBLEtBQUE7O0FBQUEsS0FBQSxHQUFRLENBQVIsQ0FBQTs7QUFBQSxPQUNPLENBQUMsY0FBUixHQUF5QixNQUR6QixDQUFBOztBQUFBLE9BR08sQ0FBQyxHQUFSLEdBQWMsU0FBQyxNQUFELEdBQUE7QUFDYixFQUFBLEtBQUEsSUFBUyxNQUFULENBQUE7QUFFQSxFQUFBLElBQUcsOEJBQUg7V0FDQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQXZCLENBQTZCLFNBQUEsR0FBUSxLQUFyQyxFQUREO0dBSGE7QUFBQSxDQUhkLENBQUE7O0FBQUEsT0FTTyxDQUFDLEdBQVIsR0FBYyxTQUFBLEdBQUE7QUFDYixTQUFPLEtBQVAsQ0FEYTtBQUFBLENBVGQsQ0FBQTs7OztBQ0RBLElBQUEsNERBQUE7O0FBQUEsTUFBTSxDQUFDLFlBQVAsR0FBc0IsTUFBTSxDQUFDLFlBQVAsSUFBcUIsTUFBTSxDQUFDLGtCQUFsRCxDQUFBOztBQUFBLFlBQ0EsR0FBbUIsSUFBQSxZQUFBLENBQUEsQ0FEbkIsQ0FBQTs7QUFBQTtBQUljLEVBQUEsZUFBRSxJQUFGLEVBQVMsR0FBVCxFQUFlLE1BQWYsR0FBQTtBQUF1QixJQUF0QixJQUFDLENBQUEsT0FBQSxJQUFxQixDQUFBO0FBQUEsSUFBZixJQUFDLENBQUEsTUFBQSxHQUFjLENBQUE7QUFBQSxJQUFULElBQUMsQ0FBQSxTQUFBLE1BQVEsQ0FBdkI7RUFBQSxDQUFiOztlQUFBOztJQUpELENBQUE7O0FBQUEsT0FLTyxDQUFDLEtBQVIsR0FBZ0IsS0FMaEIsQ0FBQTs7QUFBQSxPQU9PLENBQUMsWUFBUixHQUF1QixZQUFBLEdBQWUsRUFQdEMsQ0FBQTs7QUFBQSxPQVVPLENBQUMsSUFBUixHQUFlLElBQUEsR0FBTyxTQUFDLElBQUQsRUFBTyxHQUFQLEdBQUE7QUFDckIsU0FBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2xCLFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFjLElBQUEsY0FBQSxDQUFBLENBQWQsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFiLEVBQW9CLEdBQXBCLENBREEsQ0FBQTtBQUFBLE1BRUEsT0FBTyxDQUFDLFlBQVIsR0FBdUIsYUFGdkIsQ0FBQTtBQUFBLE1BR0EsT0FBTyxDQUFDLE1BQVIsR0FBaUIsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsR0FBQTtBQUNoQixRQUFBLElBQUcsT0FBTyxDQUFDLE1BQVIsS0FBa0IsR0FBckI7aUJBQ0MsWUFBWSxDQUFDLGVBQWIsQ0FBNkIsT0FBTyxDQUFDLFFBQXJDLEVBQ0MsU0FBQyxNQUFELEdBQUE7QUFFQyxnQkFBQSxLQUFBO0FBQUEsWUFBQSxLQUFBLEdBQVksSUFBQSxLQUFBLENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUIsTUFBakIsQ0FBWixDQUFBO0FBQUEsWUFDQSxPQUFPLENBQUMsWUFBYSxDQUFBLElBQUEsQ0FBckIsR0FBNkIsS0FEN0IsQ0FBQTtBQUVBLG1CQUFPLE9BQUEsQ0FBUSxLQUFSLENBQVAsQ0FKRDtVQUFBLENBREQsRUFNRSxTQUFDLEdBQUQsR0FBQTttQkFDQSxNQUFBLENBQU8sS0FBQSxDQUFNLGdCQUFOLENBQVAsRUFEQTtVQUFBLENBTkYsRUFERDtTQUFBLE1BQUE7QUFVQyxVQUFBLE9BQU8sQ0FBQyxHQUFSLENBQWEsUUFBYixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQUEsQ0FBTSxjQUFOLENBQVAsRUFYRDtTQURnQjtNQUFBLENBSGpCLENBQUE7QUFBQSxNQWtCQSxPQUFPLENBQUMsT0FBUixHQUFrQixTQUFBLEdBQUE7QUFDakIsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLEtBQUEsQ0FBTSxlQUFOLENBQVAsRUFGaUI7TUFBQSxDQWxCbEIsQ0FBQTthQXNCQSxPQUFPLENBQUMsSUFBUixDQUFBLEVBdkJrQjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsQ0FBWCxDQURxQjtBQUFBLENBVnRCLENBQUE7O0FBQUEsT0FxQ08sQ0FBQyxJQUFSLEdBQWUsSUFBQSxHQUFPLFNBQUMsR0FBRCxHQUFBO0FBQ3JCLE1BQUEsY0FBQTtBQUFBLEVBQUEsSUFBRyxNQUFBLENBQUEsR0FBQSxLQUFjLFFBQWpCO0FBQ0MsSUFBQSxNQUFBLEdBQVMsWUFBYSxDQUFBLEdBQUEsQ0FBSSxDQUFDLE1BQTNCLENBREQ7R0FBQSxNQUFBO0FBR0MsSUFBQSxNQUFBLEdBQVMsR0FBVCxDQUhEO0dBQUE7QUFJQSxFQUFBLElBQUcsY0FBSDtBQUNDLElBQUEsTUFBQSxHQUFTLFlBQVksQ0FBQyxrQkFBYixDQUFBLENBQVQsQ0FBQTtBQUFBLElBQ0EsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFEaEIsQ0FBQTtBQUFBLElBRUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxZQUFZLENBQUMsV0FBNUIsQ0FGQSxDQUFBO1dBR0EsTUFBTSxDQUFDLEtBQVAsQ0FBYSxDQUFiLEVBSkQ7R0FMcUI7QUFBQSxDQXJDdEIsQ0FBQTs7QUFBQSxhQWlEQSxHQUFnQixFQWpEaEIsQ0FBQTs7QUFBQSxhQWtEYSxDQUFDLElBQWQsQ0FBbUIsSUFBQSxDQUFLLE9BQUwsRUFBYyx5QkFBZCxDQUFuQixDQWxEQSxDQUFBOztBQUFBLGFBbURhLENBQUMsSUFBZCxDQUFtQixJQUFBLENBQUssV0FBTCxFQUFrQiw2QkFBbEIsQ0FBbkIsQ0FuREEsQ0FBQTs7QUFBQSxPQXFETyxDQUFDLEdBQVIsQ0FBWSxhQUFaLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxPQUFELEdBQUE7U0FDTCxPQUFPLENBQUMsR0FBUixDQUFZLG9CQUFaLEVBQWtDLE9BQWxDLEVBREs7QUFBQSxDQUROLENBR0EsQ0FBQyxPQUFELENBSEEsQ0FHTyxTQUFDLEdBQUQsR0FBQTtTQUNOLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixFQUFvQixHQUFwQixFQURNO0FBQUEsQ0FIUCxDQXJEQSxDQUFBOzs7O0FDQUEsSUFBQSxlQUFBO0VBQUE7aVNBQUE7O0FBQUEsZUFBQSxHQUFrQixPQUFBLENBQVEsMEJBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxPQUVhLENBQUM7QUFDYixNQUFBLDZDQUFBOztBQUFBLDJCQUFBLENBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsMkJBQTdCLENBQWhCLENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQXFCLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQ25CO0FBQUEsSUFBQSxHQUFBLEVBQUssYUFBTDtBQUFBLElBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxVQURaO0FBQUEsSUFFQSxPQUFBLEVBQVMsS0FBSyxDQUFDLFNBRmY7QUFBQSxJQUdBLFdBQUEsRUFBYSxJQUhiO0dBRG1CLENBRHJCLENBQUE7O0FBQUEsRUFPQSxjQUFBLEdBQXFCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FQckIsQ0FBQTs7QUFTYSxFQUFBLGdCQUFDLFFBQUQsR0FBQTtBQUNaLElBQUEsc0NBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FGVCxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBSGQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQWMsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLGNBQVgsRUFBMkIsY0FBM0IsQ0FBZCxDQUpBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FOQSxDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsWUFBRCxHQUFnQixRQVJoQixDQUFBO0FBQUEsSUFTQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsT0FBdkIsQ0FUQSxDQUFBO0FBQUEsSUFVQSxJQUFDLENBQUEsS0FBRCxHQUFTLENBVlQsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQVhULENBRFk7RUFBQSxDQVRiOztBQUFBLG1CQXVCQSxNQUFBLEdBQVEsU0FBQyxLQUFELEdBQUE7QUFDUCxJQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsS0FBVixDQUFBLEdBQWlCLElBQUMsQ0FBQSxLQUFsQixHQUF3QixLQUE1QyxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEtBQVYsQ0FBQSxHQUFpQixJQUFDLENBQUEsS0FBbEIsR0FBd0IsS0FENUMsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixHQUFtQixJQUFDLENBQUEsS0FGcEIsQ0FBQTtBQUdBLElBQUEsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxVQUExQjthQUNDLElBQUMsQ0FBQSxHQUFELENBQUEsRUFERDtLQUpPO0VBQUEsQ0F2QlIsQ0FBQTs7Z0JBQUE7O0dBRDRCLGdCQUY3QixDQUFBOzs7O0FDQUEsSUFBQSxXQUFBO0VBQUE7O2lTQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUE7QUFLQywwQkFBQSxDQUFBOztBQUFhLEVBQUEsZUFBQSxHQUFBO0FBQ1osNkNBQUEsQ0FBQTtBQUFBLFFBQUEsMEJBQUE7QUFBQSxJQUFBLHFDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsQ0FBQSxHQUFJLEdBRkosQ0FBQTtBQUFBLElBR0EsQ0FBQSxHQUFJLEdBSEosQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUF3QixFQUF4QixFQUE0QixDQUFBLEdBQUksQ0FBaEMsRUFBbUMsQ0FBbkMsRUFBc0MsS0FBdEMsQ0FKZCxDQUFBO0FBQUEsSUFLQSxXQUFBLEdBQWMsRUFBQSxHQUFLLENBQUMsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQUFYLENBTG5CLENBQUE7QUFBQSxJQU9BLE9BQUEsR0FBVSxHQUFBLEdBQU0sQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxXQUFBLEdBQWMsQ0FBdkIsQ0FBTCxDQUFOLEdBQXlDLElBUG5ELENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWpCLEdBQXFCLE9BVHJCLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxLQUFLLENBQUMsS0FBTixDQUFBLENBWGIsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxLQUFLLENBQUMsYUFBTixDQUFBLENBYmhCLENBQUE7QUFBQSxJQWNBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixDQUFsQixFQUFxQixDQUFyQixDQWRBLENBQUE7QUFBQSxJQWdCQSxDQUFBLENBQUUsUUFBRixDQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBZixDQUEyQixJQUFDLENBQUEsUUFBUSxDQUFDLFVBQXJDLENBaEJBLENBQUE7QUFBQSxJQW9CQSxJQUFDLENBQUEsWUFBRCxHQUFvQixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUF3QixDQUF4QixFQUEyQixDQUEzQixFQUNuQjtBQUFBLE1BQUEsU0FBQSxFQUFXLEtBQUssQ0FBQyxZQUFqQjtBQUFBLE1BQ0EsU0FBQSxFQUFXLEtBQUssQ0FBQyxZQURqQjtBQUFBLE1BRUEsTUFBQSxFQUFRLEtBQUssQ0FBQyxTQUZkO0tBRG1CLENBcEJwQixDQUFBO0FBQUEsSUEwQkEsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxLQUFLLENBQUMsY0FBTixDQUN0QjtBQUFBLE1BQUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxVQUFaO0FBQUEsTUFDQSxXQUFBLEVBQWEsS0FEYjtBQUFBLE1BRUEsUUFBQSxFQUNDO0FBQUEsUUFBQSxVQUFBLEVBQVk7QUFBQSxVQUFFLElBQUEsRUFBTSxHQUFSO0FBQUEsVUFBYSxLQUFBLEVBQU8sSUFBQyxDQUFBLFlBQXJCO1NBQVo7T0FIRDtBQUFBLE1BS0EsWUFBQSxFQUNDLCtIQU5EO0FBQUEsTUFlQSxjQUFBLEVBQ0MsbWRBaEJEO0tBRHNCLENBMUJ2QixDQUFBO0FBQUEsSUFtRUEsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxLQUFLLENBQUMsS0FBTixDQUFBLENBbkVwQixDQUFBO0FBQUEsSUFvRUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsQ0FBQSxFQUF6QixFQUE4QixFQUE5QixFQUFrQyxDQUFBLEVBQWxDLEVBQXdDLEVBQXhDLEVBQTRDLENBQTVDLEVBQStDLENBQS9DLENBcEVyQixDQUFBO0FBQUEsSUFxRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBeEIsR0FBNEIsQ0FyRTVCLENBQUE7QUFBQSxJQXNFQSxJQUFDLENBQUEsWUFBWSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLGFBQW5CLENBdEVBLENBQUE7QUFBQSxJQXVFQSxJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLEtBQUssQ0FBQyxJQUFOLENBQWdCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FBaEIsRUFBNkMsSUFBQyxDQUFBLGVBQTlDLENBdkVuQixDQUFBO0FBQUEsSUF3RUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBdEIsR0FBMEIsSUFBSSxDQUFDLEVBeEUvQixDQUFBO0FBQUEsSUF5RUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxXQUFuQixDQXpFQSxDQUFBO0FBQUEsSUE4RUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0E5RWIsQ0FBQTtBQUFBLElBK0VBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxLQUFBLENBQUEsQ0EvRWIsQ0FBQTtBQUFBLElBZ0ZBLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUF4QixHQUFtQyxVQWhGbkMsQ0FBQTtBQUFBLElBaUZBLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUF4QixHQUE4QixLQWpGOUIsQ0FBQTtBQUFBLElBa0ZBLENBQUEsQ0FBRSxRQUFGLENBQVksQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFmLENBQTRCLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBbkMsQ0FsRkEsQ0FBQTtBQW9GQSxXQUFPLElBQVAsQ0FyRlk7RUFBQSxDQUFiOztBQUFBLGtCQXVGQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1IsUUFBQSxLQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFQLENBQUEsQ0FBUixDQUFBO0FBRUEsSUFBQSxJQUFJLEtBQUEsR0FBUSxFQUFaO0FBQ0MsTUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFBbUIsS0FBbkIsQ0FBQSxDQUREO0tBRkE7QUFBQSxJQUtBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFrQixJQUFDLENBQUEsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLE1BQTNCLEVBQW1DLElBQUMsQ0FBQSxZQUFwQyxFQUFrRCxJQUFsRCxDQUxBLENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFDLENBQUEsWUFBbEIsRUFBZ0MsSUFBQyxDQUFBLGFBQWpDLENBUkEsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FWQSxDQUFBO0FBQUEsSUFXQSxxQkFBQSxDQUFzQixJQUFDLENBQUEsT0FBdkIsQ0FYQSxDQURRO0VBQUEsQ0F2RlQsQ0FBQTs7QUFBQSxrQkFzR0EsS0FBQSxHQUFPLFNBQUEsR0FBQTtXQUNOLElBQUMsQ0FBQSxPQUFELENBQUEsRUFETTtFQUFBLENBdEdQLENBQUE7O2VBQUE7O0dBRm1CLEtBSHBCLENBQUE7O0FBQUEsTUFnSE0sQ0FBQyxPQUFQLEdBQWlCLEtBaEhqQixDQUFBOzs7O0FDQUEsSUFBQSxxSEFBQTtFQUFBOztpU0FBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGdCQUFSLENBQVAsQ0FBQTs7QUFBQSxLQUVBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBRlIsQ0FBQTs7QUFBQSxVQUdBLEdBQWEsT0FBQSxDQUFRLHFCQUFSLENBSGIsQ0FBQTs7QUFBQSxlQUlBLEdBQWtCLE9BQUEsQ0FBUSwwQkFBUixDQUpsQixDQUFBOztBQUFBLE1BS0EsR0FBUyxPQUFBLENBQVEsaUJBQVIsQ0FMVCxDQUFBOztBQUFBLE9BTUEsR0FBVSxPQUFBLENBQVEsa0JBQVIsQ0FOVixDQUFBOztBQUFBLEtBUUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FSUixDQUFBOztBQUFBLEtBU0EsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FUUixDQUFBOztBQUFBO0FBWWMsRUFBQSxjQUFFLE9BQUYsRUFBWSxHQUFaLEVBQWtCLEdBQWxCLEdBQUE7QUFDWixRQUFBLGlGQUFBO0FBQUEsSUFEYSxJQUFDLENBQUEsVUFBQSxPQUNkLENBQUE7QUFBQSxJQUR1QixJQUFDLENBQUEsTUFBQSxHQUN4QixDQUFBO0FBQUEsSUFENkIsSUFBQyxDQUFBLE1BQUEsR0FDOUIsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxLQUFLLENBQUMsYUFBTixDQUFxQixJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsRUFBMUMsRUFBOEMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUFULEdBQXNCLEVBQXBFLENBQWhCLENBQUE7QUFDQTtBQUFBLFNBQUEsMkNBQUE7bUJBQUE7QUFDQyxNQUFBLENBQUMsQ0FBQyxDQUFGLElBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLEVBQXJCLEdBQTBCLENBQWpDLENBQUE7QUFBQSxNQUNBLENBQUMsQ0FBQyxDQUFGLElBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUFULEdBQXNCLEVBQXRCLEdBQTJCLENBRGxDLENBREQ7QUFBQSxLQURBO0FBQUEsSUFJQSxJQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFWLEdBQStCLElBSi9CLENBQUE7QUFBQSxJQU9BLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBbUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQVB0QyxDQUFBO0FBQUEsSUFRQSxRQUFBLEdBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUFULEdBQW9CLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FSeEMsQ0FBQTtBQUFBLElBU0EsR0FBQSxHQUFNLE9BQUEsR0FBVSxJQUFDLENBQUEsR0FUakIsQ0FBQTtBQUFBLElBVUEsR0FBQSxHQUFNLFFBQUEsR0FBVyxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxHQUFnQixJQUFDLENBQUEsR0FBakIsR0FBdUIsQ0FBeEIsQ0FWakIsQ0FBQTtBQVdBO0FBQUEsU0FBQSw4Q0FBQTt1QkFBQTtBQUNDLFdBQUEsNkNBQUE7cUJBQUE7QUFDQyxRQUFBLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLENBQUYsR0FBTSxPQUFOLEdBQWdCLEdBQXRCLENBQUE7QUFBQSxRQUNBLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDLENBQUYsR0FBTSxRQUFOLEdBQWlCLEdBRHZCLENBREQ7QUFBQSxPQUREO0FBQUEsS0FYQTtBQUFBLElBZUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLEdBQTBCLElBZjFCLENBQUE7QUFBQSxJQWlCQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFqQnJCLENBRFk7RUFBQSxDQUFiOztjQUFBOztJQVpELENBQUE7O0FBQUE7QUFrQ2MsRUFBQSxpQkFBRSxXQUFGLEVBQWdCLFVBQWhCLEVBQTZCLFdBQTdCLEVBQTJDLFNBQTNDLEVBQXVELFVBQXZELEdBQUE7QUFDWixJQURhLElBQUMsQ0FBQSxjQUFBLFdBQ2QsQ0FBQTtBQUFBLElBRDJCLElBQUMsQ0FBQSxhQUFBLFVBQzVCLENBQUE7QUFBQSxJQUR3QyxJQUFDLENBQUEsY0FBQSxXQUN6QyxDQUFBO0FBQUEsSUFEc0QsSUFBQyxDQUFBLFlBQUEsU0FDdkQsQ0FBQTtBQUFBLElBRGtFLElBQUMsQ0FBQSxhQUFBLFVBQ25FLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsU0FBdkIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxTQUR4QixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsV0FBN0IsQ0FIWCxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUNmO0FBQUEsTUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLE9BQU47QUFBQSxNQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsVUFEWjtBQUFBLE1BRUEsT0FBQSxFQUFTLEtBQUssQ0FBQyxTQUZmO0FBQUEsTUFHQSxTQUFBLEVBQVcsSUFIWDtBQUFBLE1BSUEsVUFBQSxFQUFZLEtBSlo7QUFBQSxNQUtBLFdBQUEsRUFBYSxJQUxiO0tBRGUsQ0FKaEIsQ0FEWTtFQUFBLENBQWI7O2lCQUFBOztJQWxDRCxDQUFBOztBQUFBO0FBc0RjLEVBQUEsb0JBQUUsSUFBRixFQUFRLFFBQVIsR0FBQTtBQUVaLElBRmEsSUFBQyxDQUFBLE9BQUEsSUFFZCxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFaLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsUUFBaEIsRUFBMEIsSUFBSSxDQUFDLFFBQS9CLENBQWQsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBRkEsQ0FGWTtFQUFBLENBQWI7O0FBQUEsdUJBTUEsTUFBQSxHQUFRLFNBQUEsR0FBQSxDQU5SLENBQUE7O29CQUFBOztJQXRERCxDQUFBOztBQUFBO0FBK0RDLDBCQUFBLENBQUE7O0FBQWEsRUFBQSxlQUFFLEtBQUYsR0FBQTtBQUNaLElBRGEsSUFBQyxDQUFBLFFBQUEsS0FDZCxDQUFBO0FBQUEsMkNBQUEsQ0FBQTtBQUFBLElBQUEscUNBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBRmIsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxLQUFLLENBQUMsWUFBTixDQUFtQixRQUFuQixDQUpwQixDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsWUFBWCxDQUxBLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxNQUFBLENBQUEsQ0FQZixDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUMsQ0FBQSxPQUFOLENBUkEsQ0FBQTtBQUFBLElBVUEsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxxQkFBVixFQUFpQyxJQUFDLENBQUEsTUFBbEMsQ0FWQSxDQURZO0VBQUEsQ0FBYjs7QUFBQSxrQkFhQSxNQUFBLEdBQVEsU0FBQyxJQUFELEdBQUE7QUFDUCxRQUFBLG1PQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQVIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxFQUZaLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFIVCxDQUFBO0FBTUE7QUFBQSxTQUFBLDJDQUFBOzZCQUFBO0FBQ0MsTUFBQSxPQUFBLEdBQWMsSUFBQSxPQUFBLENBQVEsU0FBQSxHQUFVLFdBQVcsQ0FBQyxLQUE5QixFQUNiLFdBQVcsQ0FBQyxVQURDLEVBRWIsV0FBVyxDQUFDLFdBRkMsRUFHYixXQUFXLENBQUMsU0FIQyxFQUliLFdBQVcsQ0FBQyxVQUpDLENBQWQsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsT0FBZixDQU5BLENBQUE7QUFBQSxNQVFBLEVBQUEsR0FBSyxXQUFXLENBQUMsUUFSakIsQ0FBQTtBQVNBLFdBQVcsOEdBQVgsR0FBQTtBQUNDLGFBQVcsOEdBQVgsR0FBQTtBQUNDLFVBQUEsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFLLE9BQUwsRUFBYyxHQUFkLEVBQW1CLEdBQW5CLENBQVgsQ0FBQTtBQUFBLFVBQ0EsSUFBQyxDQUFBLEtBQU0sQ0FBQSxFQUFBLENBQVAsR0FBYSxJQURiLENBQUE7QUFBQSxVQUVBLEVBQUEsRUFGQSxDQUREO0FBQUEsU0FERDtBQUFBLE9BVkQ7QUFBQSxLQU5BO0FBQUEsSUF3QkEsV0FBQSxHQUFjLEVBQUEsR0FBSyxDQUFDLElBQUksQ0FBQyxFQUFMLEdBQVUsR0FBWCxDQXhCbkIsQ0FBQTtBQUFBLElBeUJBLE9BQUEsR0FBVSxHQUFBLEdBQU0sQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxXQUFBLEdBQWMsQ0FBdkIsQ0FBTCxDQUFOLEdBQXlDLElBekJuRCxDQUFBO0FBQUEsSUE2QkEsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQTdCcEIsQ0FBQTtBQUFBLElBOEJBLGFBQUEsR0FBb0IsSUFBQSxLQUFLLENBQUMsUUFBTixDQUFBLENBOUJwQixDQUFBO0FBZ0NBO0FBQUEsU0FBQSw4REFBQTt3QkFBQTtBQUNDLE1BQUEsSUFBRyxFQUFBLEdBQUssQ0FBUjtBQUNDLFFBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBQSxHQUFRLEtBQUssQ0FBQyxLQUF6QixDQUFOLENBQUE7QUFBQSxRQUVBLEdBQUEsR0FBTSxLQUFBLEdBQVEsS0FBSyxDQUFDLEtBRnBCLENBQUE7QUFBQSxRQUdBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVcsSUFBQyxDQUFBLEtBQU0sQ0FBQSxFQUFBLENBQWxCLEVBQTJCLElBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLENBQUEsR0FBQSxHQUFPLENBQTFCLEVBQTZCLENBQTdCLENBQTNCLENBSGpCLENBQUE7QUFBQSxRQU1BLGFBQWEsQ0FBQyxHQUFkLENBQWtCLFVBQVUsQ0FBQyxJQUE3QixDQU5BLENBREQ7T0FERDtBQUFBLEtBaENBO0FBQUEsSUEwQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsYUFBVixDQTFDQSxDQUFBO0FBQUEsSUEyQ0EsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUF2QixHQUEyQixHQUFBLEdBQU0sQ0EzQ2pDLENBQUE7QUFBQSxJQTRDQSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQXZCLEdBQTJCLENBQUEsT0E1QzNCLENBQUE7QUFBQSxJQThDQSxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQXBCLENBQXdCLENBQXhCLEVBQTJCLENBQTNCLEVBQThCLENBQTlCLENBOUNBLENBQUE7QUFBQSxJQWlEQSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBakRwQixDQUFBO0FBQUEsSUFrREEsVUFBQSxHQUFpQixJQUFBLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FsRGpCLENBQUE7QUFvREE7QUFBQSxTQUFBLDhEQUFBO3dCQUFBO0FBQ0MsTUFBQSxJQUFHLEVBQUEsR0FBSyxDQUFSO0FBQ0MsUUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFBLEdBQVEsS0FBSyxDQUFDLEtBQXpCLENBQU4sQ0FBQTtBQUFBLFFBQ0EsR0FBQSxHQUFNLEtBQUEsR0FBUSxLQUFLLENBQUMsS0FEcEIsQ0FBQTtBQUFBLFFBRUEsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FBVyxJQUFDLENBQUEsS0FBTSxDQUFBLEVBQUEsQ0FBbEIsRUFBMkIsSUFBQSxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsRUFBbUIsQ0FBQSxHQUFBLEdBQU8sQ0FBMUIsRUFBNkIsQ0FBN0IsQ0FBM0IsQ0FGakIsQ0FBQTtBQUFBLFFBR0EsVUFBVSxDQUFDLEdBQVgsQ0FBZSxVQUFVLENBQUMsSUFBMUIsQ0FIQSxDQUREO09BREQ7QUFBQSxLQXBEQTtBQUFBLElBMkRBLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBcEIsR0FBd0IsR0EzRHhCLENBQUE7QUFBQSxJQTZEQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxVQUFWLENBN0RBLENBQUE7QUFpRUE7QUFBQTtTQUFBLDhDQUFBO29CQUFBO0FBQ0MsTUFBQSxLQUFBLEdBQVksSUFBQSxPQUFRLENBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBUixDQUFvQixJQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUFwQixFQUF3QixDQUFBLEdBQUksQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUFsQyxFQUFzQyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQUEsQ0FBWixFQUFnQixDQUFoQixDQUF0QyxDQUFwQixDQUFaLENBQUE7QUFBQSxNQUVBLEtBQUssQ0FBQyxNQUFOLEdBQWUsS0FGZixDQUFBO0FBQUEsb0JBR0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMLEVBSEEsQ0FERDtBQUFBO29CQWxFTztFQUFBLENBYlIsQ0FBQTs7QUFBQSxrQkFxRkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsUUFBQSxxQkFBQTtBQUFBLElBQUEsa0NBQU0sS0FBTixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUF2QixJQUE0QixDQUFBLEdBQUksS0FEaEMsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQXZCLElBQTRCLENBQUEsR0FBSSxLQUZoQyxDQUFBO0FBSUE7QUFBQSxTQUFBLDJDQUFBO3VCQUFBO0FBQ0MsTUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLEtBQWhCLElBQTBCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQXBCLEdBQXdCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUF2QixHQUEyQixFQUFoRjtBQUNDLFFBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFBLENBREQ7T0FERDtBQUFBLEtBSkE7V0FRQSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBVE87RUFBQSxDQXJGUixDQUFBOztBQUFBLGtCQW1HQSxHQUFBLEdBQUssU0FBQyxVQUFELEdBQUE7QUFDSixJQUFBLElBQUcsVUFBQSxZQUFzQixlQUF6QjtBQUNDLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLFVBQWhCLENBQUEsQ0FERDtLQUFBO0FBRUEsV0FBTywrQkFBTSxVQUFOLENBQVAsQ0FISTtFQUFBLENBbkdMLENBQUE7O0FBQUEsa0JBd0dBLE1BQUEsR0FBUSxTQUFDLFVBQUQsR0FBQTtBQUNQLFFBQUEsQ0FBQTtBQUFBLElBQUEsQ0FBQSxHQUFLLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixVQUFuQixDQUFMLENBQUE7QUFDQSxJQUFBLElBQUcsQ0FBQSxJQUFLLENBQVI7QUFDQyxNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixDQUFsQixFQUFxQixDQUFyQixDQUFBLENBREQ7S0FEQTtBQUlBLFdBQU8sa0NBQU0sVUFBTixDQUFQLENBTE87RUFBQSxDQXhHUixDQUFBOztBQUFBLGtCQWtIQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1gsUUFBQSw4QkFBQTtBQUFBO0FBQUE7U0FBQSwyQ0FBQTttQkFBQTtBQUNDLE1BQUEsSUFBRyxDQUFDLENBQUMsTUFBTDs7O0FBQ0M7QUFBQTtlQUFBLDhDQUFBOzBCQUFBO0FBQ0MsWUFBQSxJQUFHLENBQUMsQ0FBQyxNQUFMO0FBQ0MsY0FBQSxJQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFuQixDQUEyQixDQUFDLENBQUMsWUFBN0IsQ0FBQSxHQUE2QyxDQUFBLENBQWhEO0FBQ0MsZ0JBQUEsSUFBRyxJQUFDLENBQUEsYUFBRCxDQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBSDtpQ0FDQyxDQUFDLENBQUMsV0FBRixDQUFjLENBQWQsR0FERDtpQkFBQSxNQUFBO3lDQUFBO2lCQUREO2VBQUEsTUFBQTt1Q0FBQTtlQUREO2FBQUEsTUFBQTtxQ0FBQTthQUREO0FBQUE7O3VCQUREO09BQUEsTUFBQTs4QkFBQTtPQUREO0FBQUE7b0JBRFc7RUFBQSxDQWxIWixDQUFBOztBQUFBLGtCQTJIQSxhQUFBLEdBQWUsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO0FBQ2QsV0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaEIsQ0FBa0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUF6QyxDQUFBLEdBQXFELENBQTVELENBRGM7RUFBQSxDQTNIZixDQUFBOztlQUFBOztHQURtQixXQTlEcEIsQ0FBQTs7QUFBQTtBQWtNYyxFQUFBLGNBQUEsR0FBQTtBQUVaLHlDQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxLQUFBLENBQUEsQ0FBYixDQUFBO0FBQUEsSUFFQSxLQUFLLENBQUMsY0FBTixHQUF1QixDQUFBLENBQUUsTUFBRixDQUFhLENBQUMsUUFBZCxDQUF1QixDQUFBLENBQUUsUUFBRixDQUF2QixDQUZ2QixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBSEEsQ0FBQTtBQUFBLElBS0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFDaEIsS0FBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsRUFEZ0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQUxBLENBRlk7RUFBQSxDQUFiOztBQUFBLGlCQVVBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUF2QixHQUEyQixDQUEzQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsS0FBRCxHQUFhLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxLQUFQLENBRGIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLElBQXhCLENBRkEsQ0FBQTtXQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFFBQVYsRUFBb0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUEzQixFQUpVO0VBQUEsQ0FWWCxDQUFBOztBQUFBLGlCQWdCQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ04sSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGFBQVosQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFiLENBQW9CLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBM0IsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBNUIsQ0FIQSxDQUFBO1dBS0EsSUFBQyxDQUFBLFNBQUQsQ0FBQSxFQU5NO0VBQUEsQ0FoQlAsQ0FBQTs7Y0FBQTs7SUFsTUQsQ0FBQTs7QUFBQSxNQTJOTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBQSxDQTNOakMsQ0FBQTs7OztBQ0FBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtTQUNmLFVBQUEsQ0FBVyxJQUFYLEVBQWlCLEtBQWpCLEVBRGU7QUFBQSxDQUFoQixDQUFBOztBQUFBLE9BR08sQ0FBQyxNQUFSLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEdBQU4sR0FBQTtBQUNoQixTQUFPLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLEdBQUEsR0FBTSxHQUFQLENBQWhCLEdBQThCLEdBQXJDLENBRGdCO0FBQUEsQ0FIakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwic2h1bXAgPSByZXF1aXJlKCcuL3NodW1wL3NodW1wLmNvZmZlZScpXG5cbiQoXCIjZnVsbHNjcmVlblwiKS5jbGljayAoKS0+XG5cdFxuXHQkKFwiI3NodW1wXCIpWzBdLndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuKEVsZW1lbnQuQUxMT1dfS0VZQk9BUkRfSU5QVVQpO1xuXHRcblx0Y2FudmFzID0gJChcIiNzaHVtcCBjYW52YXNcIilcblx0Y2FudmFzQXNwZWN0ID0gY2FudmFzLndpZHRoKCkgLyBjYW52YXMuaGVpZ2h0KClcblxuXHRjb250YWluZXJXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG5cdGNvbnRhaW5lckhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKVxuXHRjb250YWluZXJBc3BlY3QgPSBjb250YWluZXJXaWR0aCAvIGNvbnRhaW5lckhlaWdodFxuXHRjb25zb2xlLmxvZyBjYW52YXNBc3BlY3QsICQod2luZG93KS53aWR0aCgpICwgJCh3aW5kb3cpLmhlaWdodCgpLCBjb250YWluZXJBc3BlY3Rcblx0XG5cdGlmIGNhbnZhc0FzcGVjdCA8IGNvbnRhaW5lckFzcGVjdFxuXHRcdGNvbnNvbGUubG9nIFwibWF0Y2ggaGVpZ2h0XCJcblx0XHRjYW52YXMuaGVpZ2h0IGNvbnRhaW5lckhlaWdodFxuXHRcdGNhbnZhcy53aWR0aCBjb250YWluZXJIZWlnaHQgKiBjYW52YXNBc3BlY3Rcblx0ZWxzZVxuXHRcdGNvbnNvbGUubG9nIFwibWF0Y2ggd2lkdGhcIlxuXHRcdGNhbnZhcy53aWR0aCBjb250YWluZXJXaWR0aFxuXHRcdGNhbnZhcy5oZWlnaHQgY29udGFpbmVyV2lkdGggLyBjYW52YXNBc3BlY3RcblxuJChcIiNkZWJ1Z1wiKS5hcHBlbmQoXCJcIlwiPHNwYW4gaWQ9XCJsZXZlbENoaWxkcmVuXCI+XCJcIlwiKVxuXG5cbnVwZGF0ZURlYnVnID0gKCktPlxuXHQkKFwiI2xldmVsQ2hpbGRyZW5cIikudGV4dCBcIlwiXCJsZXZlbC5jaGlsZHJlbiA9ICN7c2h1bXAuZ2FtZS5sZXZlbC5jaGlsZHJlbi5sZW5ndGh9XCJcIlwiXG5cblxuc2h1bXAuZ2FtZS53b3JsZC5vbiBcInVwZGF0ZVwiLCB1cGRhdGVEZWJ1Z1xuXG5cblxuIyBjb25zb2xlLmxvZyBcImhpZGVyYVwiXG5cblxuIiwiY2xhc3MgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBfZXZlbnRzID0ge31cblxuXHRvbjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdChAX2V2ZW50c1tldmVudF0gPz0gW10pLnB1c2ggaGFuZGxlclxuXHRcdHJldHVybiB0aGlzXG5cblx0b2ZmOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0Zm9yIHN1c3BlY3QsIGluZGV4IGluIEBfZXZlbnRzW2V2ZW50XSB3aGVuIHN1c3BlY3QgaXMgaGFuZGxlclxuXHRcdFx0QF9ldmVudHNbZXZlbnRdLnNwbGljZSBpbmRleCwgMVxuXHRcdHJldHVybiB0aGlzXG5cblx0dHJpZ2dlcjogKGV2ZW50LCBhcmdzLi4uKSA9PlxuXHRcdHJldHVybiB0aGlzIHVubGVzcyBAX2V2ZW50c1tldmVudF0/XG5cdFx0Zm9yIGkgaW4gW0BfZXZlbnRzW2V2ZW50XS5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGhhbmRsZXIgPSBAX2V2ZW50c1tldmVudF1baV1cblx0XHRcdGhhbmRsZXIuYXBwbHkgdGhpcywgYXJnc1xuXHRcdHJldHVybiB0aGlzXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5cbmNsYXNzIENvbGxpc2lvbk9iamVjdCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IHVuZGVmaW5lZFxuXHRcdEBjb2xsaWRlckhpdFR5cGVzID0gW11cblxuXHRjb2xsaWRlV2l0aDogKGdhbWVPYmplY3QpLT5cblx0XHRAZGllKClcblx0XHRnYW1lT2JqZWN0LmRpZSgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb25PYmplY3RcbiIsIlNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcbldlYXBvbnMgPSByZXF1aXJlICcuL1dlYXBvbnMuY29mZmVlJ1xuXG5cbmNsYXNzIEJhc2ljIGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGVuZW15VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvZW5lbWllcy9lbmVteS5wbmdcIlxuXHRlbmVteU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGVuZW15VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRlbmVteUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiZW5lbXlcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJwbGF5ZXJcIlxuXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGVuZW15R2VvbWV0cnksIGVuZW15TWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXHRcdEBhZ2UgPSAwXG5cdFx0QGhhc0ZpcmVkID0gZmFsc2VcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVxuXHRcdEBhZ2UgKz0gZGVsdGFcblx0XHRcblx0XG5cdGRpZTogKCktPlxuXHRcdFNjb3JlLmFkZCgxKVxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAzKVxuXHRcdHN1cGVyKClcblxuXG5jbGFzcyBTaW5XYXZlIGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSAtMSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBkZWx0YSAqIE1hdGguc2luKEBhZ2UpXG5cbmNsYXNzIERhcnQgZXh0ZW5kcyBCYXNpY1xuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVx0XHRcblx0XHRpZiBAYWdlIDwgLjVcblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gLTIwICogZGVsdGFcblx0XHRlbHNlIGlmIEBhZ2UgPCAzXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdGVsc2Vcblx0XHRcdEBkaWUoKVxuXG5cdFx0aWYgQGFnZSA+IDEgYW5kIG5vdCBAaGFzRmlyZWRcblx0XHRcdEBoYXNGaXJlZCA9IHRydWVcblx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFxuXHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXG5cdFx0YnVsbGV0LmNvbGxpZGVyVHlwZSA9IFwiZW5lbXlfYnVsbGV0XCJcblx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUEkgLSAuMjVcblx0XHRidWxsZXQuc3BlZWQgPSA1XG5cblx0XHRAcGFyZW50LmFkZCBidWxsZXRcdFxuXG5cdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXG5cdFx0YnVsbGV0LmNvbGxpZGVyVHlwZSA9IFwiZW5lbXlfYnVsbGV0XCJcblx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUEkgKyAuMjVcblx0XHRidWxsZXQuc3BlZWQgPSA1XG5cblx0XHRAcGFyZW50LmFkZCBidWxsZXRcdFxuXG5cbmV4cG9ydHMuQmFzaWMgPSBCYXNpY1xuZXhwb3J0cy5TaW5XYXZlID0gU2luV2F2ZVxuZXhwb3J0cy5EYXJ0ID0gRGFydFxuXG4jIHN1cGVyKGRlbHRhKVxuXHRcdCMgaWYgQGFnZSA8IDFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnkgKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMi4xXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gNSAqIGRlbHRhXG5cdFx0IyBlbHNlXG5cdFx0IyBcdEBkaWUoKVxuIiwiY2xhc3MgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAcGFyZW50ID0gdW5kZWZpbmVkXG5cdFx0QGNoaWxkcmVuID0gW11cblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0QGRlYWQgPSBmYWxzZVxuXHRcdEBhY3RpdmUgPSB0cnVlXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRmb3IgaSBpbiBbQGNoaWxkcmVuLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0Y2hpbGQgPSBAY2hpbGRyZW5baV1cblx0XHRcdGlmIGNoaWxkLmRlYWRcblx0XHRcdFx0QHJlbW92ZSBjaGlsZFxuXHRcdFx0XHRjb250aW51ZVxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlXG5cdFx0XHRcdGNoaWxkLnVwZGF0ZSBkZWx0YSBcblx0XG5cdGFjdGl2YXRlOiAoKS0+XG5cdFx0QGFjdGl2ZSA9IHRydWU7XG5cdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gdGhpc1xuXHRcdEBjaGlsZHJlbi5wdXNoKGdhbWVPYmplY3QpXG5cdFx0QHJvb3QuYWRkKGdhbWVPYmplY3Qucm9vdClcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRAcm9vdC5yZW1vdmUoZ2FtZU9iamVjdC5yb290KVxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gbnVsbFxuXHRcdGkgPSAgQGNoaWxkcmVuLmluZGV4T2YoZ2FtZU9iamVjdClcblx0XHRpZiBpID49IDBcblx0XHRcdEBjaGlsZHJlbi5zcGxpY2UoaSwgMSk7XG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRkaWU6ICgpLT5cblx0XHRAZGVhZCA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZU9iamVjdFxuIiwiY2xhc3MgSW5wdXRcblx0a2V5TWFwOiBcblx0XHRcIjM4XCI6XCJ1cFwiICN1cCBhcnJvd1xuXHRcdFwiODdcIjpcInVwXCIgI3dcblx0XHRcIjQwXCI6XCJkb3duXCIgI2Rvd24gYXJyb3dcblx0XHRcIjgzXCI6XCJkb3duXCIgI3Ncblx0XHRcIjM3XCI6XCJsZWZ0XCIgI2xlZnQgYXJyb3dcblx0XHRcIjY1XCI6XCJsZWZ0XCIgI2Fcblx0XHRcIjM5XCI6XCJyaWdodFwiICNyaWdodCBhcnJvd1xuXHRcdFwiNjhcIjpcInJpZ2h0XCIgI2Rcblx0XHRcIjMyXCI6XCJmaXJlX3ByaW1hcnlcIiAjc3BhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAa2V5U3RhdGVzID0gW11cblxuXHRcdGZvciBrZXksIHZhbHVlIG9mIEBrZXlNYXBcblx0XHRcdEBrZXlTdGF0ZXNbdmFsdWVdID0gZmFsc2U7XG5cblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0IyBjb25zb2xlLmxvZyBlLndoaWNoXG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSB0cnVlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0JCh3aW5kb3cpLmtleXVwIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSBmYWxzZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dFxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKEBnZW9tZXRyeSwgQG1hdGVyaWFsKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBtYXRlcmlhbCA9IHVuZGVmaW5lZFxuXHRcdEBnZW9tZXRyeSA9IHVuZGVmaW5lZFxuXHRcdEB0ZXh0dXJlID0gdW5kZWZpbmVkXG5cdFx0QHN0YXR1cyA9IHVuZGVmaW5lZFxuXG5cdGxvYWQ6IChmaWxlTmFtZSk9PlxuXHRcdGpzb25Mb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpO1xuXHRcdGpzb25Mb2FkZXIubG9hZCBmaWxlTmFtZSwgKGdlb21ldHJ5LCBtYXRlcmlhbHMsIG90aGVycy4uLik9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwoIG1hdGVyaWFscyApXG5cdFx0XHQjIEBtYXRlcmlhbCA9IG1hdGVyaWFsc1swXVxuXHRcdFx0QGdlb21ldHJ5ID0gZ2VvbWV0cnlcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cblx0bG9hZFBuZzogKGZpbGVOYW1lKT0+XG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIGZpbGVOYW1lLCB7fSwgKCk9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRcdCMgdHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdFx0IyBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXHRcdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRcdCMgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkgMSwgMVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0I2NvbnNvbGUubG9nIFwibG9hZHBuZ1wiLCB0aGlzXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cblxuY2xhc3MgTW9kZWxMb2FkZXJcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAZGVmYXVsdEdlb21ldHJ5ID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSgxLDEsMSlcblx0XHRAZGVmYXVsdE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRjb2xvcjogMHgwMGZmMDBcblx0XHRcdHdpcmVmcmFtZTogdHJ1ZVxuXHRcdFx0bWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3V0aWwvd2hpdGUucG5nXCJcblxuXHRcdEBsb2FkZWRNb2RlbHMgPSB7fVxuXG5cdGxvYWQ6IChmaWxlTmFtZSktPlxuXG5cdFx0IyBpZiBhbHJlYWR5IGxvYWRlZCwganVzdCBtYWtlIHRoZSBuZXcgbWVzaCBhbmQgcmV0dXJuXG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0/ICYmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLnN0YXR1cyA9PSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImNhY2hlZFwiXG5cdFx0XHRyZXR1cm4gbmV3IFRIUkVFLk1lc2goQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uZ2VvbWV0cnksIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLm1hdGVyaWFsKVxuXG5cblx0XHQjIGlmIHJlcXVlc3RlZCBidXQgbm90IHJlYWR5XG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcdG1vZGVsID0gQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcblx0XHQjIGlmIG5vdCByZXF1ZXN0ZWQgYmVmb3JlXG5cdFx0ZWxzZVxuXHRcdFx0bW9kZWwgPSBuZXcgTW9kZWwoKVxuXHRcdFx0aWYgZmlsZU5hbWUuc3BsaXQoJy4nKS5wb3AoKSA9PSBcImpzXCJcblx0XHRcdFx0bW9kZWwubG9hZChmaWxlTmFtZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0bW9kZWwubG9hZFBuZyhmaWxlTmFtZSlcblx0XHRcdEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdID0gbW9kZWxcblxuXHRcdG9iamVjdCA9IG5ldyBUSFJFRS5NZXNoKCBAZGVmYXVsdEdlb21ldHJ5LCBAZGVmYXVsdE1hdGVyaWFsIClcblx0XHRtb2RlbC5vbiBcInN1Y2Nlc3NcIiwgKG0pLT5cblx0XHRcdG9iamVjdC5nZW9tZXRyeSA9IG0uZ2VvbWV0cnlcdFx0XHRcblx0XHRcdG9iamVjdC5tYXRlcmlhbCA9IG0ubWF0ZXJpYWxcblx0XHRcdG0ub2ZmIFwic3VjY2Vzc1wiLCBhcmd1bWVudHMuY2FsbGVlICNyZW1vdmUgdGhpcyBoYW5kbGVyIG9uY2UgdXNlZFxuXHRcdHJldHVybiBvYmplY3RcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbExvYWRlclxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG51dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cbmNsYXNzIFBhcnRpY2xlIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRwYXJ0aWNsZVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3BhcnRpY2xlcy9wYXJ0aWNsZS5wbmdcIlxuXHRwYXJ0aWNsZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHBhcnRpY2xlVGV4dHVyZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cblx0cGFydGljbGVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uLCBlbmVyZ3kpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBwYXJ0aWNsZUdlb21ldHJ5LCBwYXJ0aWNsZU1hdGVyaWFsXG5cdFx0XG5cdFx0QHZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjModXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSk7XG5cdFx0QHZlbG9jaXR5Lm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKGVuZXJneSlcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHZlbG9jaXR5Lm11bHRpcGx5U2NhbGFyKC45OSlcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IEB2ZWxvY2l0eS54ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi56ICs9IEB2ZWxvY2l0eS56ICogZGVsdGFcblx0XHRzID0gMS0gKChEYXRlLm5vdygpIC0gQGJpcnRoKSAvIEB0aW1lVG9MaXZlKSArIC4wMVxuXHRcdEByb290LnNjYWxlLnNldChzLCBzLCBzKVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGVcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcbk1vZGVsTG9hZGVyID0gcmVxdWlyZSAnLi9Nb2RlbExvYWRlci5jb2ZmZWUnXG5JbnB1dCA9IHJlcXVpcmUgJy4vSW5wdXQuY29mZmVlJ1xuV2VhcG9ucyA9IHJlcXVpcmUgJy4vV2VhcG9ucy5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuU2h1bXAgPSByZXF1aXJlICcuL3NodW1wLmNvZmZlZSdcblxubW9kZWxMb2FkZXIgPSBuZXcgTW9kZWxMb2FkZXIoKVxuaW5wdXQgPSBuZXcgSW5wdXQoKVxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3RcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRcblx0XHRAY29sbGlkZXJUeXBlID0gXCJwbGF5ZXJcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteV9idWxsZXRcIlxuXG5cblx0XHRAcm9vdC5hZGQgbW9kZWxMb2FkZXIubG9hZChcImFzc2V0cy9zaGlwcy9zaGlwLmpzXCIpXG5cdFx0XG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ3VwJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ2Rvd24nXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1snbGVmdCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54IC09IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydyaWdodCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydmaXJlX3ByaW1hcnknXVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBsYXN0RmlyZSArIDI0MCAqIDFcblx0XHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRcdFxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdGJ1bGxldC5hbmdsZSA9IC0uMjVcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRidWxsZXQuYW5nbGUgPSArLjI1XG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblx0XHRcdCMgQHBhcmVudC5jb2xsaWRlcnMucHVzaCBidWxsZXRcblxuXHRkaWU6ICgpLT5cblx0XHQjIGNvbnNvbGUubG9nIFwiZGllXCJcblx0XHRcblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMDBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDgpXG5cblx0XHR1dGlsLmFmdGVyIDEwMDAsIFNodW1wLmdhbWUucmVzZXRcblx0XHRzdXBlcigpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxuIiwiXG5zY29yZSA9IDBcbmV4cG9ydHMuZGlzcGxheUVsZW1lbnQgPSB1bmRlZmluZWRcblxuZXhwb3J0cy5hZGQgPSAocG9pbnRzKS0+XG5cdHNjb3JlICs9IHBvaW50c1xuXHQjIGNvbnNvbGUubG9nIGV4cG9ydHMuZGlzcGxheUVsZW1lbnRcblx0aWYgZXhwb3J0cy5kaXNwbGF5RWxlbWVudD9cblx0XHRleHBvcnRzLmRpc3BsYXlFbGVtZW50LnRleHQgXCJTY29yZTogI3tzY29yZX1cIlxuXG5leHBvcnRzLmdldCA9ICgpLT5cblx0cmV0dXJuIHNjb3JlXG4iLCJ3aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbmF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxuY2xhc3MgU291bmRcblx0Y29uc3RydWN0b3I6IChAbmFtZSwgQHVybCwgQGJ1ZmZlciktPlxuZXhwb3J0cy5Tb3VuZCA9IFNvdW5kXG5cbmV4cG9ydHMubG9hZGVkU291bmRzID0gbG9hZGVkU291bmRzID0ge31cblxuXG5leHBvcnRzLmxvYWQgPSBsb2FkID0gKG5hbWUsIHVybCkgLT5cblx0cmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0cmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cdFx0cmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwpXG5cdFx0cmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXHRcdHJlcXVlc3Qub25sb2FkID0gKGEsIGIsIGMpPT5cblx0XHRcdGlmIHJlcXVlc3Quc3RhdHVzID09IDIwMFxuXHRcdFx0XHRhdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhIHJlcXVlc3QucmVzcG9uc2UsIFxuXHRcdFx0XHRcdChidWZmZXIpPT5cblx0XHRcdFx0XHRcdCN0b2RvIGhhbmRsZSBkZWNvZGluZyBlcnJvclxuXHRcdFx0XHRcdFx0c291bmQgPSBuZXcgU291bmQobmFtZSwgdXJsLCBidWZmZXIpXG5cdFx0XHRcdFx0XHRleHBvcnRzLmxvYWRlZFNvdW5kc1tuYW1lXSA9IHNvdW5kXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzb2x2ZShzb3VuZClcblx0XHRcdFx0XHQsKGVycik9PlxuXHRcdFx0XHRcdFx0cmVqZWN0IEVycm9yKFwiRGVjb2RpbmcgRXJyb3JcIilcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y29uc29sZS5sb2cgIFwiU3RhdHVzXCJcblx0XHRcdFx0cmVqZWN0IEVycm9yKFwiU3RhdHVzIEVycm9yXCIpXG5cblx0XHRcdFx0XG5cdFx0cmVxdWVzdC5vbmVycm9yID0gKCktPlxuXHRcdFx0Y29uc29sZS5sb2cgXCJlcnJyXCJcblx0XHRcdHJlamVjdCBFcnJvcihcIk5ldHdvcmsgRXJyb3JcIikgXHRcblxuXHRcdHJlcXVlc3Quc2VuZCgpXG5cdFx0XHRcblxuZXhwb3J0cy5wbGF5ID0gcGxheSA9IChhcmcpLT5cblx0aWYgdHlwZW9mIGFyZyA9PSAnc3RyaW5nJ1xuXHRcdGJ1ZmZlciA9IGxvYWRlZFNvdW5kc1thcmddLmJ1ZmZlclxuXHRlbHNlIFxuXHRcdGJ1ZmZlciA9IGFyZ1xuXHRpZiBidWZmZXI/XG5cdFx0c291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG5cdFx0c291cmNlLmJ1ZmZlciA9IGJ1ZmZlclxuXHRcdHNvdXJjZS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbilcblx0XHRzb3VyY2Uuc3RhcnQoMClcblxuXG5hc3NldHNMb2FkaW5nID0gW11cbmFzc2V0c0xvYWRpbmcucHVzaCBsb2FkKCdzaG9vdCcsICdhc3NldHMvc291bmRzL3Nob290LndhdicpXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnZXhwbG9zaW9uJywgJ2Fzc2V0cy9zb3VuZHMvZXhwbG9zaW9uLndhdicpXG5cblByb21pc2UuYWxsKGFzc2V0c0xvYWRpbmcpXG4udGhlbiAocmVzdWx0cyktPlxuXHRjb25zb2xlLmxvZyBcIkxvYWRlZCBhbGwgU291bmRzIVwiLCByZXN1bHRzXG4uY2F0Y2ggKGVyciktPlxuXHRjb25zb2xlLmxvZyBcInVob2hcIiwgZXJyXG5cbiIsIkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgZXhwb3J0cy5CdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXQucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuXG5jbGFzcyBXb3JsZCBleHRlbmRzIEJhc2Vcblx0XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdHN1cGVyKClcblxuXHRcdHcgPSA2NDBcblx0XHRoID0gNDgwXG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgdyAvIGgsIDEsIDEwMDAwKVxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblxuXHRcdHRhcmdldFogPSA0ODAgLyAoMiAqIE1hdGgudGFuKGZvdl9yYWRpYW5zIC8gMikgKSAvIDMyLjA7XG5cblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB0YXJnZXRaXG5cdFx0XG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRcblx0XHRAcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpXG5cdFx0QHJlbmRlcmVyLnNldFNpemUgdywgaFxuXHRcdCMgQHJlbmRlcmVyLnNvcnRPYmplY3RzID0gZmFsc2Vcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cblxuXHRcdFxuXHRcdEB3b3JsZFRleHR1cmUgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQgdywgaCwgXG5cdFx0XHRtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlclxuXHRcdFx0bWFnRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdGZvcm1hdDogVEhSRUUuUkdCRm9ybWF0XG5cdFx0XG5cblx0XHRAcHJvY2Vzc01hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHR0cmFuc3BhcmVudDogZmFsc2Vcblx0XHRcdHVuaWZvcm1zOiBcblx0XHRcdFx0XCJ0RGlmZnVzZVwiOiB7IHR5cGU6IFwidFwiLCB2YWx1ZTogQHdvcmxkVGV4dHVyZSB9XG5cblx0XHRcdHZlcnRleFNoYWRlcjpcblx0XHRcdFx0XCJcIlwiXG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdHZVdiA9IHV2O1xuXHRcdFx0XHRcdGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR1bmlmb3JtIHNhbXBsZXIyRCB0RGlmZnVzZTtcblx0XHRcdFx0dmFyeWluZyB2ZWMyIHZVdjtcblxuXHRcdFx0XHR2b2lkIG1haW4oKSB7XG5cdFx0XHRcdFx0Ly8gcmVhZCB0aGUgaW5wdXQgY29sb3JcblxuXHRcdFx0XHRcdHZlYzQgbztcblxuXHRcdFx0XHRcdG8gPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcblx0XHRcdFx0XHQvL28uciA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiArIHZlYzIoMC4wLCAwLjAwMSkgKS5yO1xuXG5cdFx0XHRcdFx0Ly9vLnIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIC43NTtcblx0XHRcdFx0XHQvL28uZyAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgLjc1O1xuXHRcdFx0XHRcdC8vby5iICo9IHNpbih2VXYueSAqIDI0MC4wICogNi4yOCkgKiAuMjUgKyAuNzU7XG5cblx0XHRcdFx0XHQvL28gKj0gMC41ICsgMS4wKjE2LjAqdlV2LngqdlV2LnkqKDEuMC12VXYueCkqKDEuMC12VXYueSk7XG5cdFx0XHRcdFx0XG5cblx0XHRcdFx0XHQvLyBzZXQgdGhlIG91dHB1dCBjb2xvclxuXHRcdFx0XHRcdGdsX0ZyYWdDb2xvciA9IG87XG5cdFx0XHRcdH1cblx0XHRcdFx0XCJcIlwiXG5cblx0XHRAcHJvY2Vzc1NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRAcHJvY2Vzc0NhbWVyYSA9IG5ldyBUSFJFRS5PcnRob2dyYXBoaWNDYW1lcmEoLS41LCAuNSwgLS41ICwgLjUsIDAsIDEpXG5cdFx0QHByb2Nlc3NDYW1lcmEucG9zaXRpb24ueiA9IDBcblx0XHRAcHJvY2Vzc1NjZW5lLmFkZCBAcHJvY2Vzc0NhbWVyYVxuXHRcdEBwcm9jZXNzUXVhZCA9IG5ldyBUSFJFRS5NZXNoKCBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSApLCBAcHJvY2Vzc01hdGVyaWFsICk7XG5cdFx0QHByb2Nlc3NRdWFkLnJvdGF0aW9uLnggPSBNYXRoLlBJXG5cdFx0QHByb2Nlc3NTY2VuZS5hZGQgQHByb2Nlc3NRdWFkXG5cblxuXG5cblx0XHRAY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKVxuXHRcdEBzdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCggQHN0YXRzLmRvbUVsZW1lbnQgKVxuXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRhbmltYXRlOiA9PlxuXHRcdGRlbHRhID0gQGNsb2NrLmdldERlbHRhKClcdFx0XG5cdFx0I2Rvbid0IHVwZGF0ZSBhZnRlciBsb25nIGZyYW1lIChmaXhlcyBpc3N1ZSB3aXRoIHN3aXRjaGluZyB0YWJzKVxuXHRcdGlmIChkZWx0YSA8IC41KSBcblx0XHRcdEB0cmlnZ2VyIFwidXBkYXRlXCIsIGRlbHRhXG5cblx0XHRAcmVuZGVyZXIucmVuZGVyKCBAc2NlbmUsIEBjYW1lcmEsIEB3b3JsZFRleHR1cmUsIHRydWUgKTtcblxuXG5cdFx0QHJlbmRlcmVyLnJlbmRlciBAcHJvY2Vzc1NjZW5lLCBAcHJvY2Vzc0NhbWVyYVxuXG5cdFx0QHN0YXRzLnVwZGF0ZSgpXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIEBhbmltYXRlXG5cdFx0cmV0dXJuXG5cblx0c3RhcnQ6IC0+XG5cdFx0QGFuaW1hdGUoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBXb3JsZFxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5Xb3JsZCA9IHJlcXVpcmUgJy4vV29ybGQuY29mZmVlJ1xuR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5Db2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5QbGF5ZXIgPSByZXF1aXJlICcuL1BsYXllci5jb2ZmZWUnXG5FbmVtaWVzID0gcmVxdWlyZSAnLi9FbmVtaWVzLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcblNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5cbmNsYXNzIFRpbGVcblx0Y29uc3RydWN0b3I6IChAdGlsZVNldCwgQHJvdywgQGNvbCktPlxuXHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCBAdGlsZVNldC50aWxlV2lkdGggLyAzMiwgQHRpbGVTZXQudGlsZUhlaWdodCAvIDMyKVxuXHRcdGZvciB2IGluIEBnZW9tZXRyeS52ZXJ0aWNlc1xuXHRcdFx0di54ICs9IEB0aWxlU2V0LnRpbGVXaWR0aCAvIDMyIC8gMlxuXHRcdFx0di55ICs9IEB0aWxlU2V0LnRpbGVIZWlnaHQgLyAzMiAvIDJcblx0XHRAZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZVxuXG5cdFx0IyBjYWxjIGFuZCBzZXQgdXZzXG5cdFx0dXZXaWR0aCA9IEB0aWxlU2V0LnRpbGVXaWR0aC9AdGlsZVNldC5pbWFnZVdpZHRoXG5cdFx0dXZIZWlnaHQgPSBAdGlsZVNldC50aWxlSGVpZ2h0L0B0aWxlU2V0LmltYWdlSGVpZ2h0XG5cdFx0dXZYID0gdXZXaWR0aCAqIEBjb2xcblx0XHR1dlkgPSB1dkhlaWdodCAqIChAdGlsZVNldC5yb3dzIC0gQHJvdyAtIDEpXG5cdFx0Zm9yIGZhY2UgaW4gQGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1cblx0XHRcdGZvciB2IGluIGZhY2Vcblx0XHRcdFx0di54ID0gdi54ICogdXZXaWR0aCArIHV2WFxuXHRcdFx0XHR2LnkgPSB2LnkgKiB1dkhlaWdodCArIHV2WVxuXHRcdEBnZW9tZXRyeS51dnNOZWVkVXBkYXRlID0gdHJ1ZVxuXG5cdFx0QG1hdGVyaWFsID0gQHRpbGVTZXQubWF0ZXJpYWxcblxuXG5jbGFzcyBUaWxlU2V0XG5cdGNvbnN0cnVjdG9yOiAoQHRleHR1cmVGaWxlLCBAaW1hZ2VXaWR0aCwgQGltYWdlSGVpZ2h0LCBAdGlsZVdpZHRoLCBAdGlsZUhlaWdodCktPlxuXHRcdEBjb2xzID0gQGltYWdlV2lkdGggLyBAdGlsZVdpZHRoXG5cdFx0QHJvd3MgPSBAaW1hZ2VIZWlnaHQgLyBAdGlsZVdpZHRoXG5cblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgdGV4dHVyZUZpbGVcblx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhUZXN0OiB0cnVlXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcblx0XHRcblxuXHRcdCMgQGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIHdpZHRoLCBoZWlnaHQpO1xuXG5cblxuY2xhc3MgVGlsZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKEB0aWxlLCBwb3NpdGlvbiktPlxuXHRcdCN0b2RvIHJlbW92ZSB1bm5lZGVkIG9iamVjdDNkIG51bGwgd3JhcHBlclxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggdGlsZS5nZW9tZXRyeSwgdGlsZS5tYXRlcmlhbFxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAtPlxuXG5jbGFzcyBMZXZlbCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IChAd29ybGQpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGNvbGxpZGVycyA9IFtdXG5cblx0XHRAYW1iaWVudExpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XG5cdFx0QHJvb3QuYWRkKEBhbWJpZW50TGlnaHQpO1x0XHRcblxuXHRcdEBwbGF5ZXIxID0gbmV3IFBsYXllcigpXG5cdFx0QGFkZCBAcGxheWVyMVxuXG5cdFx0JC5nZXRKU09OIFwiYXNzZXRzL2xldmVsXzEuanNvblwiLCBAb25Mb2FkXG5cdFx0XHRcblx0b25Mb2FkOiAoZGF0YSk9PlxuXHRcdEBkYXRhID0gZGF0YVxuXHRcdCMgY29uc29sZS5sb2cgQGRhdGFcblx0XHRAdGlsZVNldHMgPSBbXVxuXHRcdEB0aWxlcyA9IFtdXG5cblx0XHQjIGxvYWQgdGhlIHRpbGVTZXQgbWV0YWRhdGEsIHRleHR1cmUsIGFuZCBjcmVhdGUgdGlsZSBnZW9tZXRyaWVzXG5cdFx0Zm9yIHRpbGVTZXREYXRhIGluIGRhdGEudGlsZXNldHNcblx0XHRcdHRpbGVTZXQgPSBuZXcgVGlsZVNldCBcImFzc2V0cy9cIit0aWxlU2V0RGF0YS5pbWFnZSwgXG5cdFx0XHRcdHRpbGVTZXREYXRhLmltYWdld2lkdGgsIFxuXHRcdFx0XHR0aWxlU2V0RGF0YS5pbWFnZWhlaWdodCxcblx0XHRcdFx0dGlsZVNldERhdGEudGlsZXdpZHRoLFxuXHRcdFx0XHR0aWxlU2V0RGF0YS50aWxlaGVpZ2h0XG5cblx0XHRcdEB0aWxlU2V0cy5wdXNoIHRpbGVTZXRcblxuXHRcdFx0aWQgPSB0aWxlU2V0RGF0YS5maXJzdGdpZFxuXHRcdFx0Zm9yIHJvdyBpbiBbMC4udGlsZVNldC5yb3dzLTFdXG5cdFx0XHRcdGZvciBjb2wgaW4gWzAuLnRpbGVTZXQuY29scy0xXVxuXHRcdFx0XHRcdHRpbGUgPSBuZXcgVGlsZSB0aWxlU2V0LCByb3csIGNvbFxuXHRcdFx0XHRcdEB0aWxlc1tpZF0gPSB0aWxlXG5cdFx0XHRcdFx0aWQrK1xuXG5cblxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuXHRcdFxuXG5cdFx0IyBjcmVhdGUgdGlsZSBvYmplY3RzIHRoYXQgY29tcHJpc2UgYmFja2dyb3VuZHNcblx0XHRsYXllciA9IGRhdGEubGF5ZXJzWzBdXG5cdFx0ZmFyQmFja2dyb3VuZCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cblx0XHRmb3IgaWQsIGluZGV4IGluIGxheWVyLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gbGF5ZXIud2lkdGgpXG5cblx0XHRcdFx0Y29sID0gaW5kZXggJSBsYXllci53aWR0aFxuXHRcdFx0XHR0aWxlT2JqZWN0ID0gbmV3IFRpbGVPYmplY3QoQHRpbGVzW2lkXSwgbmV3IFRIUkVFLlZlY3RvcjMoY29sLCAtcm93IC0gMSwgMCkgKVxuXHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdGZhckJhY2tncm91bmQuYWRkIHRpbGVPYmplY3Qucm9vdFx0XG5cblx0XHRAcm9vdC5hZGQgZmFyQmFja2dyb3VuZFxuXHRcdGZhckJhY2tncm91bmQucG9zaXRpb24ueSA9IDcuNSAqIDJcblx0XHRmYXJCYWNrZ3JvdW5kLnBvc2l0aW9uLnogPSAtdGFyZ2V0WlxuXHRcdFxuXHRcdGZhckJhY2tncm91bmQuc2NhbGUuc2V0KDIsIDIsIDIpXG5cblxuXHRcdGxheWVyID0gZGF0YS5sYXllcnNbMV1cblx0XHRiYWNrZ3JvdW5kID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblxuXHRcdGZvciBpZCwgaW5kZXggaW4gbGF5ZXIuZGF0YVxuXHRcdFx0aWYgaWQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaW5kZXggLyBsYXllci53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBsYXllci53aWR0aFxuXHRcdFx0XHR0aWxlT2JqZWN0ID0gbmV3IFRpbGVPYmplY3QoQHRpbGVzW2lkXSwgbmV3IFRIUkVFLlZlY3RvcjMoY29sLCAtcm93IC0gMSwgMCkpXG5cdFx0XHRcdGJhY2tncm91bmQuYWRkIHRpbGVPYmplY3Qucm9vdFxuXG5cdFx0YmFja2dyb3VuZC5wb3NpdGlvbi55ID0gNy41XG5cdFx0XG5cdFx0QHJvb3QuYWRkIGJhY2tncm91bmRcblxuXG5cdFx0IyBsb2FkIG9iamVjdHNcblx0XHRmb3IgbyBpbiBkYXRhLmxheWVyc1syXS5vYmplY3RzIFxuXHRcdFx0ZW5lbXkgPSBuZXcgRW5lbWllc1tvLnR5cGVdKG5ldyBUSFJFRS5WZWN0b3IzKG8ueCAvIDMyLCA3IC0gby55IC8gMzIsIHV0aWwucmFuZG9tKC0xLCAxKSkpXG5cblx0XHRcdGVuZW15LmFjdGl2ZSA9IGZhbHNlXG5cdFx0XHRAYWRkIGVuZW15XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlID09IGZhbHNlIGFuZCBjaGlsZC5yb290LnBvc2l0aW9uLnggPCBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKyAxMFxuXHRcdFx0XHRjaGlsZC5hY3RpdmF0ZSgpXG5cblx0XHRAY29sbGlzaW9ucygpXG5cblx0XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKTtcblxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cdGNvbGxpc2lvbnM6ICgpLT5cblx0XHRmb3IgYSBpbiBAY29sbGlkZXJzXG5cdFx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0XHRmb3IgYiBpbiBAY29sbGlkZXJzXG5cdFx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRcdGlmIGEuY29sbGlkZXJIaXRUeXBlcy5pbmRleE9mKGIuY29sbGlkZXJUeXBlKSA+IC0xXG5cdFx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVXaXRoIGJcblxuXHR0ZXN0Q29sbGlzaW9uOiAoYSwgYiktPlxuXHRcdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IDFcblxuXG5cblxuXG5jbGFzcyBHYW1lXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0I3NldHVwIHdvcmxkXG5cdFx0QHdvcmxkID0gbmV3IFdvcmxkKClcblx0XHRcblx0XHRTY29yZS5kaXNwbGF5RWxlbWVudCA9ICQoXCJcIlwiPGgxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdEBsb2FkTGV2ZWwoKVxuXG5cdFx0dXRpbC5hZnRlciAxMDAwLCAoKT0+XG5cdFx0XHRAd29ybGQuc3RhcnQoKVxuXHRcblx0bG9hZExldmVsOiAoKS0+XG5cdFx0QHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ID0gMDtcblx0XHRAbGV2ZWwgPSBuZXcgTGV2ZWwoQHdvcmxkKVxuXHRcdEB3b3JsZC5zY2VuZS5hZGQgQGxldmVsLnJvb3Rcblx0XHRAd29ybGQub24gXCJ1cGRhdGVcIiwgQGxldmVsLnVwZGF0ZVxuXHRcdFxuXHRyZXNldDogKCk9PlxuXHRcdGNvbnNvbGUubG9nIFwicmVzZXQgbGV2ZWxcIlxuXHRcdFxuXHRcdEB3b3JsZC5zY2VuZS5yZW1vdmUgQGxldmVsLnJvb3Rcblx0XHRAd29ybGQub2ZmIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblxuXHRcdEBsb2FkTGV2ZWwoKVxuXG5cbm1vZHVsZS5leHBvcnRzLmdhbWUgPSBnYW1lID0gbmV3IEdhbWUoKVxuXG5cdFx0XG5cbiMgbW9kZWxMb2FkZXIgPSBuZXcgY29yZS5Nb2RlbExvYWRlcigpXG5cblxuXHRcdFx0XG5cblxuIiwiZXhwb3J0cy5hZnRlciA9IChkZWxheSwgZnVuYyktPlxuXHRzZXRUaW1lb3V0IGZ1bmMsIGRlbGF5XG5cbmV4cG9ydHMucmFuZG9tID0gKG1pbiwgbWF4KS0+XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4iXX0=
