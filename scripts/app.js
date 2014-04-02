(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var shump, updateDebug;

shump = require('./shump/shump.coffee');

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
      fragmentShader: "uniform sampler2D tDiffuse;\nvarying vec2 vUv;\n\nvoid main() {\n	// read the input color\n\n	vec4 o;\n\n	o = texture2D( tDiffuse, vUv );\n	o.r = texture2D( tDiffuse, vUv + vec2(0.0, 0.001) ).r;\n\n	o.r *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;\n	o.g *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;\n	o.b *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;\n\n	o *= 0.5 + 1.0*16.0*vUv.x*vUv.y*(1.0-vUv.x)*(1.0-vUv.y);\n	\n\n	// set the output color\n	gl_FragColor = o;\n}"
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
var CollisionObject, Enemies, Game, GameObject, Level, Player, Score, Sound, Tile, TileAsset, World, game, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

util = require('../util.coffee');

World = require('./World.coffee');

GameObject = require('./GameObject.coffee');

CollisionObject = require('./CollisionObject.coffee');

Player = require('./Player.coffee');

Enemies = require('./Enemies.coffee');

Sound = require('./Sound.coffee');

Score = require('./Score.coffee');

TileAsset = (function() {
  function TileAsset(textureFile, width, height) {
    this.texture = THREE.ImageUtils.loadTexture(textureFile);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      shading: THREE.NoShading,
      depthTest: true,
      depthWrite: false,
      transparent: true
    });
    this.geometry = new THREE.PlaneGeometry(width, height);
  }

  return TileAsset;

})();

Tile = (function(_super) {
  __extends(Tile, _super);

  function Tile(position, tileAsset) {
    Tile.__super__.constructor.call(this);
    this.root.add(new THREE.Mesh(tileAsset.geometry, tileAsset.material));
    this.root.position.copy(position);
  }

  Tile.prototype.update = function() {};

  return Tile;

})(GameObject);

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
    var col, d, enemy, fov_radians, i, o, row, targetZ, tile, tileset, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _results;
    this.data = data;
    this.tiles = [];
    _ref = data.tilesets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tileset = _ref[_i];
      this.tiles[tileset.firstgid] = new TileAsset("assets/" + tileset.image, tileset.tileheight / 32, tileset.tilewidth / 32);
    }
    fov_radians = 45 * (Math.PI / 180);
    targetZ = 480 / (2 * Math.tan(fov_radians / 2)) / 32.0;
    _ref1 = data.layers[0].data;
    for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
      d = _ref1[i];
      if (d > 0) {
        row = Math.floor(i / data.layers[0].width);
        col = i % data.layers[0].width;
        tile = new Tile(new THREE.Vector3(col, 14.5 - row, -targetZ), this.tiles[d]);
        tile.root.position.x *= 2;
        tile.root.position.y *= 2;
        tile.root.scale.set(2, 2, 2);
        this.add(tile);
      }
    }
    _ref2 = data.layers[1].data;
    for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
      d = _ref2[i];
      if (d > 0) {
        row = Math.floor(i / data.layers[0].width);
        col = i % data.layers[0].width;
        tile = new Tile(new THREE.Vector3(col, 14.5 - row, 0), this.tiles[d]);
        this.add(tile);
      }
    }
    _ref3 = data.layers[2].objects;
    _results = [];
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      o = _ref3[_l];
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
    Score.displayElement = $("<h1>Hi</h1>").appendTo($("#shump"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dvcmxkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvc2h1bXAuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsQ0FJQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLE1BQVosQ0FBbUIsNkJBQW5CLENBSkEsQ0FBQTs7QUFBQSxXQU1BLEdBQWMsU0FBQSxHQUFBO1NBQ2IsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBNEIsbUJBQUEsR0FBa0IsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQXhFLEVBRGE7QUFBQSxDQU5kLENBQUE7O0FBQUEsS0FVSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBakIsQ0FBb0IsUUFBcEIsRUFBOEIsV0FBOUIsQ0FWQSxDQUFBOzs7O0FDQUEsSUFBQSxJQUFBO0VBQUE7b0JBQUE7O0FBQUE7QUFDYyxFQUFBLGNBQUEsR0FBQTtBQUNaLDZDQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBWCxDQURZO0VBQUEsQ0FBYjs7QUFBQSxpQkFHQSxFQUFBLEdBQUksU0FBQyxLQUFELEVBQVEsT0FBUixHQUFBO0FBQ0gsUUFBQSxLQUFBO0FBQUEsSUFBQSw4Q0FBVSxDQUFBLEtBQUEsU0FBQSxDQUFB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QUFBLGlCQWdCQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ04sSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGFBQVosQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFiLENBQW9CLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBM0IsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBNUIsQ0FIQSxDQUFBO1dBS0EsSUFBQyxDQUFBLFNBQUQsQ0FBQSxFQU5NO0VBQUEsQ0FoQlAsQ0FBQTs7Y0FBQTs7SUFwSUQsQ0FBQTs7QUFBQSxNQTZKTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBQSxDQTdKakMsQ0FBQTs7OztBQ0FBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtTQUNmLFVBQUEsQ0FBVyxJQUFYLEVBQWlCLEtBQWpCLEVBRGU7QUFBQSxDQUFoQixDQUFBOztBQUFBLE9BR08sQ0FBQyxNQUFSLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEdBQU4sR0FBQTtBQUNoQixTQUFPLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLEdBQUEsR0FBTSxHQUFQLENBQWhCLEdBQThCLEdBQXJDLENBRGdCO0FBQUEsQ0FIakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwic2h1bXAgPSByZXF1aXJlKCcuL3NodW1wL3NodW1wLmNvZmZlZScpXG5cblxuXG4kKFwiI2RlYnVnXCIpLmFwcGVuZChcIlwiXCI8c3BhbiBpZD1cImxldmVsQ2hpbGRyZW5cIj5cIlwiXCIpXG5cbnVwZGF0ZURlYnVnID0gKCktPlxuXHQkKFwiI2xldmVsQ2hpbGRyZW5cIikudGV4dCBcIlwiXCJsZXZlbC5jaGlsZHJlbiA9ICN7c2h1bXAuZ2FtZS5sZXZlbC5jaGlsZHJlbi5sZW5ndGh9XCJcIlwiXG5cblxuc2h1bXAuZ2FtZS53b3JsZC5vbiBcInVwZGF0ZVwiLCB1cGRhdGVEZWJ1Z1xuXG5cbiMgY29uc29sZS5sb2cgXCJoaWRlcmFcIlxuXG5cbiIsImNsYXNzIEJhc2Vcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAX2V2ZW50cyA9IHt9XG5cblx0b246IChldmVudCwgaGFuZGxlcikgLT5cblx0XHQoQF9ldmVudHNbZXZlbnRdID89IFtdKS5wdXNoIGhhbmRsZXJcblx0XHRyZXR1cm4gdGhpc1xuXG5cdG9mZjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdGZvciBzdXNwZWN0LCBpbmRleCBpbiBAX2V2ZW50c1tldmVudF0gd2hlbiBzdXNwZWN0IGlzIGhhbmRsZXJcblx0XHRcdEBfZXZlbnRzW2V2ZW50XS5zcGxpY2UgaW5kZXgsIDFcblx0XHRyZXR1cm4gdGhpc1xuXG5cdHRyaWdnZXI6IChldmVudCwgYXJncy4uLikgPT5cblx0XHRyZXR1cm4gdGhpcyB1bmxlc3MgQF9ldmVudHNbZXZlbnRdP1xuXHRcdGZvciBpIGluIFtAX2V2ZW50c1tldmVudF0ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRoYW5kbGVyID0gQF9ldmVudHNbZXZlbnRdW2ldXG5cdFx0XHRoYW5kbGVyLmFwcGx5IHRoaXMsIGFyZ3Ncblx0XHRyZXR1cm4gdGhpc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBDb2xsaXNpb25PYmplY3QgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSB1bmRlZmluZWRcblx0XHRAY29sbGlkZXJIaXRUeXBlcyA9IFtdXG5cblx0Y29sbGlkZVdpdGg6IChnYW1lT2JqZWN0KS0+XG5cdFx0QGRpZSgpXG5cdFx0Z2FtZU9iamVjdC5kaWUoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uT2JqZWN0XG4iLCJTY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblxuXG5jbGFzcyBCYXNpYyBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRlbmVteVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL2VuZW1pZXMvZW5lbXkucG5nXCJcblx0ZW5lbXlNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBlbmVteVRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0ZW5lbXlHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImVuZW15XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwicGxheWVyXCJcblxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBlbmVteUdlb21ldHJ5LCBlbmVteU1hdGVyaWFsXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XHRAYWdlID0gMFxuXHRcdEBoYXNGaXJlZCA9IGZhbHNlXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAYWdlICs9IGRlbHRhXG5cdFx0XG5cdFxuXHRkaWU6ICgpLT5cblx0XHRTY29yZS5hZGQoMSlcblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMylcblx0XHRzdXBlcigpXG5cblxuY2xhc3MgU2luV2F2ZSBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLTEgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gZGVsdGEgKiBNYXRoLnNpbihAYWdlKVxuXG5jbGFzcyBEYXJ0IGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0aWYgQGFnZSA8IC41XG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0yMCAqIGRlbHRhXG5cdFx0ZWxzZSBpZiBAYWdlIDwgM1xuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHRlbHNlXG5cdFx0XHRAZGllKClcblxuXHRcdGlmIEBhZ2UgPiAxIGFuZCBub3QgQGhhc0ZpcmVkXG5cdFx0XHRAaGFzRmlyZWQgPSB0cnVlXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcblx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJIC0gLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJICsgLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXG5leHBvcnRzLkJhc2ljID0gQmFzaWNcbmV4cG9ydHMuU2luV2F2ZSA9IFNpbldhdmVcbmV4cG9ydHMuRGFydCA9IERhcnRcblxuIyBzdXBlcihkZWx0YSlcblx0XHQjIGlmIEBhZ2UgPCAxXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMlxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi55ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDIuMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdCMgZWxzZVxuXHRcdCMgXHRAZGllKClcbiIsImNsYXNzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHBhcmVudCA9IHVuZGVmaW5lZFxuXHRcdEBjaGlsZHJlbiA9IFtdXG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdEBkZWFkID0gZmFsc2Vcblx0XHRAYWN0aXZlID0gdHJ1ZVxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0Zm9yIGkgaW4gW0BjaGlsZHJlbi5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGNoaWxkID0gQGNoaWxkcmVuW2ldXG5cdFx0XHRpZiBjaGlsZC5kZWFkXG5cdFx0XHRcdEByZW1vdmUgY2hpbGRcblx0XHRcdFx0Y29udGludWVcblx0XHRcdGlmIGNoaWxkLmFjdGl2ZVxuXHRcdFx0XHRjaGlsZC51cGRhdGUgZGVsdGEgXG5cdFxuXHRhY3RpdmF0ZTogKCktPlxuXHRcdEBhY3RpdmUgPSB0cnVlO1xuXHRcdFxuXG5cdGFkZDogKGdhbWVPYmplY3QpLT5cblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IHRoaXNcblx0XHRAY2hpbGRyZW4ucHVzaChnYW1lT2JqZWN0KVxuXHRcdEByb290LmFkZChnYW1lT2JqZWN0LnJvb3QpXG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0QHJvb3QucmVtb3ZlKGdhbWVPYmplY3Qucm9vdClcblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IG51bGxcblx0XHRpID0gIEBjaGlsZHJlbi5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY2hpbGRyZW4uc3BsaWNlKGksIDEpO1xuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0ZGllOiAoKS0+XG5cdFx0QGRlYWQgPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPYmplY3RcbiIsImNsYXNzIElucHV0XG5cdGtleU1hcDogXG5cdFx0XCIzOFwiOlwidXBcIlxuXHRcdFwiODdcIjpcInVwXCIgI3dcblx0XHRcIjQwXCI6XCJkb3duXCJcblx0XHRcIjgzXCI6XCJkb3duXCIgI3Ncblx0XHRcIjM3XCI6XCJsZWZ0XCJcblx0XHRcIjY1XCI6XCJsZWZ0XCIgI2Fcblx0XHRcIjM5XCI6XCJyaWdodFwiXG5cdFx0XCI2OFwiOlwicmlnaHRcIiAjZFxuXHRcdFwiMzJcIjpcImZpcmVfcHJpbWFyeVwiICNzcGFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxuXG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgQGtleU1hcFxuXHRcdFx0QGtleVN0YXRlc1t2YWx1ZV0gPSBmYWxzZTtcblxuXHRcdCQod2luZG93KS5rZXlkb3duIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSB0cnVlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0JCh3aW5kb3cpLmtleXVwIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSBmYWxzZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dFxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKEBnZW9tZXRyeSwgQG1hdGVyaWFsKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBtYXRlcmlhbCA9IHVuZGVmaW5lZFxuXHRcdEBnZW9tZXRyeSA9IHVuZGVmaW5lZFxuXHRcdEB0ZXh0dXJlID0gdW5kZWZpbmVkXG5cdFx0QHN0YXR1cyA9IHVuZGVmaW5lZFxuXG5cdGxvYWQ6IChmaWxlTmFtZSk9PlxuXHRcdGpzb25Mb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpO1xuXHRcdGpzb25Mb2FkZXIubG9hZCBmaWxlTmFtZSwgKGdlb21ldHJ5LCBtYXRlcmlhbHMsIG90aGVycy4uLik9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwoIG1hdGVyaWFscyApXG5cdFx0XHQjIEBtYXRlcmlhbCA9IG1hdGVyaWFsc1swXVxuXHRcdFx0QGdlb21ldHJ5ID0gZ2VvbWV0cnlcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cblx0bG9hZFBuZzogKGZpbGVOYW1lKT0+XG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIGZpbGVOYW1lLCB7fSwgKCk9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRcdCMgdHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdFx0IyBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXHRcdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRcdCMgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkgMSwgMVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0I2NvbnNvbGUubG9nIFwibG9hZHBuZ1wiLCB0aGlzXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cblxuY2xhc3MgTW9kZWxMb2FkZXJcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAZGVmYXVsdEdlb21ldHJ5ID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSgxLDEsMSlcblx0XHRAZGVmYXVsdE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRjb2xvcjogMHgwMGZmMDBcblx0XHRcdHdpcmVmcmFtZTogdHJ1ZVxuXHRcdFx0bWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3V0aWwvd2hpdGUucG5nXCJcblxuXHRcdEBsb2FkZWRNb2RlbHMgPSB7fVxuXG5cdGxvYWQ6IChmaWxlTmFtZSktPlxuXG5cdFx0IyBpZiBhbHJlYWR5IGxvYWRlZCwganVzdCBtYWtlIHRoZSBuZXcgbWVzaCBhbmQgcmV0dXJuXG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0/ICYmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLnN0YXR1cyA9PSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImNhY2hlZFwiXG5cdFx0XHRyZXR1cm4gbmV3IFRIUkVFLk1lc2goQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uZ2VvbWV0cnksIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLm1hdGVyaWFsKVxuXG5cblx0XHQjIGlmIHJlcXVlc3RlZCBidXQgbm90IHJlYWR5XG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcdG1vZGVsID0gQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcblx0XHQjIGlmIG5vdCByZXF1ZXN0ZWQgYmVmb3JlXG5cdFx0ZWxzZVxuXHRcdFx0bW9kZWwgPSBuZXcgTW9kZWwoKVxuXHRcdFx0aWYgZmlsZU5hbWUuc3BsaXQoJy4nKS5wb3AoKSA9PSBcImpzXCJcblx0XHRcdFx0bW9kZWwubG9hZChmaWxlTmFtZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0bW9kZWwubG9hZFBuZyhmaWxlTmFtZSlcblx0XHRcdEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdID0gbW9kZWxcblxuXHRcdG9iamVjdCA9IG5ldyBUSFJFRS5NZXNoKCBAZGVmYXVsdEdlb21ldHJ5LCBAZGVmYXVsdE1hdGVyaWFsIClcblx0XHRtb2RlbC5vbiBcInN1Y2Nlc3NcIiwgKG0pLT5cblx0XHRcdG9iamVjdC5nZW9tZXRyeSA9IG0uZ2VvbWV0cnlcdFx0XHRcblx0XHRcdG9iamVjdC5tYXRlcmlhbCA9IG0ubWF0ZXJpYWxcblx0XHRcdG0ub2ZmIFwic3VjY2Vzc1wiLCBhcmd1bWVudHMuY2FsbGVlICNyZW1vdmUgdGhpcyBoYW5kbGVyIG9uY2UgdXNlZFxuXHRcdHJldHVybiBvYmplY3RcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbExvYWRlclxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG51dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cbmNsYXNzIFBhcnRpY2xlIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRwYXJ0aWNsZVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3BhcnRpY2xlcy9wYXJ0aWNsZS5wbmdcIlxuXHRwYXJ0aWNsZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHBhcnRpY2xlVGV4dHVyZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cblx0cGFydGljbGVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uLCBlbmVyZ3kpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBwYXJ0aWNsZUdlb21ldHJ5LCBwYXJ0aWNsZU1hdGVyaWFsXG5cdFx0XG5cdFx0QHZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjModXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSk7XG5cdFx0QHZlbG9jaXR5Lm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKGVuZXJneSlcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHZlbG9jaXR5Lm11bHRpcGx5U2NhbGFyKC45OSlcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IEB2ZWxvY2l0eS54ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi56ICs9IEB2ZWxvY2l0eS56ICogZGVsdGFcblx0XHRzID0gMS0gKChEYXRlLm5vdygpIC0gQGJpcnRoKSAvIEB0aW1lVG9MaXZlKSArIC4wMVxuXHRcdEByb290LnNjYWxlLnNldChzLCBzLCBzKVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGVcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcbk1vZGVsTG9hZGVyID0gcmVxdWlyZSAnLi9Nb2RlbExvYWRlci5jb2ZmZWUnXG5JbnB1dCA9IHJlcXVpcmUgJy4vSW5wdXQuY29mZmVlJ1xuV2VhcG9ucyA9IHJlcXVpcmUgJy4vV2VhcG9ucy5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuU2h1bXAgPSByZXF1aXJlICcuL3NodW1wLmNvZmZlZSdcblxubW9kZWxMb2FkZXIgPSBuZXcgTW9kZWxMb2FkZXIoKVxuaW5wdXQgPSBuZXcgSW5wdXQoKVxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3RcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRcblx0XHRAY29sbGlkZXJUeXBlID0gXCJwbGF5ZXJcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteV9idWxsZXRcIlxuXG5cblx0XHRAcm9vdC5hZGQgbW9kZWxMb2FkZXIubG9hZChcImFzc2V0cy9zaGlwcy9zaGlwLmpzXCIpXG5cdFx0XG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ3VwJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ2Rvd24nXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1snbGVmdCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54IC09IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydyaWdodCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydmaXJlX3ByaW1hcnknXVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBsYXN0RmlyZSArIDI0MCAqIDFcblx0XHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRcdFxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdGJ1bGxldC5hbmdsZSA9IC0uMjVcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRidWxsZXQuYW5nbGUgPSArLjI1XG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblx0XHRcdCMgQHBhcmVudC5jb2xsaWRlcnMucHVzaCBidWxsZXRcblxuXHRkaWU6ICgpLT5cblx0XHQjIGNvbnNvbGUubG9nIFwiZGllXCJcblx0XHRcblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMDBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDgpXG5cblx0XHR1dGlsLmFmdGVyIDEwMDAsIFNodW1wLmdhbWUucmVzZXRcblx0XHRzdXBlcigpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxuIiwiXG5zY29yZSA9IDBcbmV4cG9ydHMuZGlzcGxheUVsZW1lbnQgPSB1bmRlZmluZWRcblxuZXhwb3J0cy5hZGQgPSAocG9pbnRzKS0+XG5cdHNjb3JlICs9IHBvaW50c1xuXHQjIGNvbnNvbGUubG9nIGV4cG9ydHMuZGlzcGxheUVsZW1lbnRcblx0aWYgZXhwb3J0cy5kaXNwbGF5RWxlbWVudD9cblx0XHRleHBvcnRzLmRpc3BsYXlFbGVtZW50LnRleHQgXCJTY29yZTogI3tzY29yZX1cIlxuXG5leHBvcnRzLmdldCA9ICgpLT5cblx0cmV0dXJuIHNjb3JlXG4iLCJ3aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbmF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxuY2xhc3MgU291bmRcblx0Y29uc3RydWN0b3I6IChAbmFtZSwgQHVybCwgQGJ1ZmZlciktPlxuZXhwb3J0cy5Tb3VuZCA9IFNvdW5kXG5cbmV4cG9ydHMubG9hZGVkU291bmRzID0gbG9hZGVkU291bmRzID0ge31cblxuXG5leHBvcnRzLmxvYWQgPSBsb2FkID0gKG5hbWUsIHVybCkgLT5cblx0cmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0cmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cdFx0cmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwpXG5cdFx0cmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXHRcdHJlcXVlc3Qub25sb2FkID0gKGEsIGIsIGMpPT5cblx0XHRcdGlmIHJlcXVlc3Quc3RhdHVzID09IDIwMFxuXHRcdFx0XHRhdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhIHJlcXVlc3QucmVzcG9uc2UsIFxuXHRcdFx0XHRcdChidWZmZXIpPT5cblx0XHRcdFx0XHRcdCN0b2RvIGhhbmRsZSBkZWNvZGluZyBlcnJvclxuXHRcdFx0XHRcdFx0c291bmQgPSBuZXcgU291bmQobmFtZSwgdXJsLCBidWZmZXIpXG5cdFx0XHRcdFx0XHRleHBvcnRzLmxvYWRlZFNvdW5kc1tuYW1lXSA9IHNvdW5kXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzb2x2ZShzb3VuZClcblx0XHRcdFx0XHQsKGVycik9PlxuXHRcdFx0XHRcdFx0cmVqZWN0IEVycm9yKFwiRGVjb2RpbmcgRXJyb3JcIilcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y29uc29sZS5sb2cgIFwiU3RhdHVzXCJcblx0XHRcdFx0cmVqZWN0IEVycm9yKFwiU3RhdHVzIEVycm9yXCIpXG5cblx0XHRcdFx0XG5cdFx0cmVxdWVzdC5vbmVycm9yID0gKCktPlxuXHRcdFx0Y29uc29sZS5sb2cgXCJlcnJyXCJcblx0XHRcdHJlamVjdCBFcnJvcihcIk5ldHdvcmsgRXJyb3JcIikgXHRcblxuXHRcdHJlcXVlc3Quc2VuZCgpXG5cdFx0XHRcblxuZXhwb3J0cy5wbGF5ID0gcGxheSA9IChhcmcpLT5cblx0aWYgdHlwZW9mIGFyZyA9PSAnc3RyaW5nJ1xuXHRcdGJ1ZmZlciA9IGxvYWRlZFNvdW5kc1thcmddLmJ1ZmZlclxuXHRlbHNlIFxuXHRcdGJ1ZmZlciA9IGFyZ1xuXHRpZiBidWZmZXI/XG5cdFx0c291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG5cdFx0c291cmNlLmJ1ZmZlciA9IGJ1ZmZlclxuXHRcdHNvdXJjZS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbilcblx0XHRzb3VyY2Uuc3RhcnQoMClcblxuXG5hc3NldHNMb2FkaW5nID0gW11cbmFzc2V0c0xvYWRpbmcucHVzaCBsb2FkKCdzaG9vdCcsICdhc3NldHMvc291bmRzL3Nob290LndhdicpXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnZXhwbG9zaW9uJywgJ2Fzc2V0cy9zb3VuZHMvZXhwbG9zaW9uLndhdicpXG5cblByb21pc2UuYWxsKGFzc2V0c0xvYWRpbmcpXG4udGhlbiAocmVzdWx0cyktPlxuXHRjb25zb2xlLmxvZyBcIkxvYWRlZCBhbGwgU291bmRzIVwiLCByZXN1bHRzXG4uY2F0Y2ggKGVyciktPlxuXHRjb25zb2xlLmxvZyBcInVob2hcIiwgZXJyXG5cbiIsIkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgZXhwb3J0cy5CdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXQucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuXG5jbGFzcyBXb3JsZCBleHRlbmRzIEJhc2Vcblx0XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdHN1cGVyKClcblxuXHRcdHcgPSA2NDBcblx0XHRoID0gNDgwXG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgdyAvIGgsIDEsIDEwMDAwKVxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblxuXHRcdHRhcmdldFogPSA0ODAgLyAoMiAqIE1hdGgudGFuKGZvdl9yYWRpYW5zIC8gMikgKSAvIDMyLjA7XG5cblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB0YXJnZXRaXG5cdFx0XG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRcblx0XHRAcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpXG5cdFx0QHJlbmRlcmVyLnNldFNpemUgdywgaFxuXHRcdCMgQHJlbmRlcmVyLnNvcnRPYmplY3RzID0gZmFsc2Vcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cblxuXHRcdFxuXHRcdEB3b3JsZFRleHR1cmUgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQgdywgaCwgXG5cdFx0XHRtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlclxuXHRcdFx0bWFnRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdGZvcm1hdDogVEhSRUUuUkdCRm9ybWF0XG5cdFx0XG5cblx0XHRAcHJvY2Vzc01hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHR0cmFuc3BhcmVudDogZmFsc2Vcblx0XHRcdHVuaWZvcm1zOiBcblx0XHRcdFx0XCJ0RGlmZnVzZVwiOiB7IHR5cGU6IFwidFwiLCB2YWx1ZTogQHdvcmxkVGV4dHVyZSB9XG5cblx0XHRcdHZlcnRleFNoYWRlcjpcblx0XHRcdFx0XCJcIlwiXG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdHZVdiA9IHV2O1xuXHRcdFx0XHRcdGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR1bmlmb3JtIHNhbXBsZXIyRCB0RGlmZnVzZTtcblx0XHRcdFx0dmFyeWluZyB2ZWMyIHZVdjtcblxuXHRcdFx0XHR2b2lkIG1haW4oKSB7XG5cdFx0XHRcdFx0Ly8gcmVhZCB0aGUgaW5wdXQgY29sb3JcblxuXHRcdFx0XHRcdHZlYzQgbztcblxuXHRcdFx0XHRcdG8gPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcblx0XHRcdFx0XHRvLnIgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKyB2ZWMyKDAuMCwgMC4wMDEpICkucjtcblxuXHRcdFx0XHRcdG8uciAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgLjc1O1xuXHRcdFx0XHRcdG8uZyAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgLjc1O1xuXHRcdFx0XHRcdG8uYiAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgLjc1O1xuXG5cdFx0XHRcdFx0byAqPSAwLjUgKyAxLjAqMTYuMCp2VXYueCp2VXYueSooMS4wLXZVdi54KSooMS4wLXZVdi55KTtcblx0XHRcdFx0XHRcblxuXHRcdFx0XHRcdC8vIHNldCB0aGUgb3V0cHV0IGNvbG9yXG5cdFx0XHRcdFx0Z2xfRnJhZ0NvbG9yID0gbztcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdEBwcm9jZXNzU2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdEBwcm9jZXNzQ2FtZXJhID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYSgtLjUsIC41LCAtLjUgLCAuNSwgMCwgMSlcblx0XHRAcHJvY2Vzc0NhbWVyYS5wb3NpdGlvbi56ID0gMFxuXHRcdEBwcm9jZXNzU2NlbmUuYWRkIEBwcm9jZXNzQ2FtZXJhXG5cdFx0QHByb2Nlc3NRdWFkID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxICksIEBwcm9jZXNzTWF0ZXJpYWwgKTtcblx0XHRAcHJvY2Vzc1F1YWQucm90YXRpb24ueCA9IE1hdGguUElcblx0XHRAcHJvY2Vzc1NjZW5lLmFkZCBAcHJvY2Vzc1F1YWRcblxuXG5cblxuXHRcdEBjbG9jayA9IG5ldyBUSFJFRS5DbG9jaygpXG5cdFx0QHN0YXRzID0gbmV3IFN0YXRzKCk7XG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCdcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkKCBAc3RhdHMuZG9tRWxlbWVudCApXG5cblx0XHRyZXR1cm4gdGhpc1xuXG5cdGFuaW1hdGU6ID0+XG5cdFx0ZGVsdGEgPSBAY2xvY2suZ2V0RGVsdGEoKVx0XHRcblx0XHQjZG9uJ3QgdXBkYXRlIGFmdGVyIGxvbmcgZnJhbWUgKGZpeGVzIGlzc3VlIHdpdGggc3dpdGNoaW5nIHRhYnMpXG5cdFx0aWYgKGRlbHRhIDwgLjUpIFxuXHRcdFx0QHRyaWdnZXIgXCJ1cGRhdGVcIiwgZGVsdGFcblxuXHRcdEByZW5kZXJlci5yZW5kZXIoIEBzY2VuZSwgQGNhbWVyYSwgQHdvcmxkVGV4dHVyZSwgdHJ1ZSApO1xuXG5cblx0XHRAcmVuZGVyZXIucmVuZGVyIEBwcm9jZXNzU2NlbmUsIEBwcm9jZXNzQ2FtZXJhXG5cblx0XHRAc3RhdHMudXBkYXRlKClcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGVcblx0XHRyZXR1cm5cblxuXHRzdGFydDogLT5cblx0XHRAYW5pbWF0ZSgpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkXG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cbldvcmxkID0gcmVxdWlyZSAnLi9Xb3JsZC5jb2ZmZWUnXG5HYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBsYXllciA9IHJlcXVpcmUgJy4vUGxheWVyLmNvZmZlZSdcbkVuZW1pZXMgPSByZXF1aXJlICcuL0VuZW1pZXMuY29mZmVlJ1xuXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcblxuXG5jbGFzcyBUaWxlQXNzZXRcblx0Y29uc3RydWN0b3I6ICh0ZXh0dXJlRmlsZSwgd2lkdGgsIGhlaWdodCktPlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSB0ZXh0dXJlRmlsZVxuXHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFRlc3Q6IHRydWVcblx0XHRcdGRlcHRoV3JpdGU6IGZhbHNlXG5cdFx0XHQjIG9wYWNpdHk6IC45XG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0IyBjb2xvcjogMHhmZjAwMDBcblx0XHRcdFx0XG5cdFx0IyBjb25zb2xlLmxvZyBcIm1hdFwiLCBAbWF0ZXJpYWxcblx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggd2lkdGgsIGhlaWdodCk7XG5cbmNsYXNzIFRpbGUgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24sIHRpbGVBc3NldCktPlxuXHRcdHN1cGVyKClcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggdGlsZUFzc2V0Lmdlb21ldHJ5LCB0aWxlQXNzZXQubWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogLT5cblxuY2xhc3MgTGV2ZWwgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoQHdvcmxkKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0QGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuXHRcdEByb290LmFkZChAYW1iaWVudExpZ2h0KTtcdFx0XG5cblx0XHRAcGxheWVyMSA9IG5ldyBQbGF5ZXIoKVxuXHRcdEBhZGQgQHBsYXllcjFcblxuXHRcdCQuZ2V0SlNPTiBcImFzc2V0cy9sZXZlbF8xLmpzb25cIiwgQG9uTG9hZFxuXHRcdFx0XG5cdFxuXG5cblx0b25Mb2FkOiAoZGF0YSk9PlxuXHRcdEBkYXRhID0gZGF0YVxuXHRcdCMgY29uc29sZS5sb2cgQGRhdGFcblx0XHRAdGlsZXMgPSBbXVxuXHRcdGZvciB0aWxlc2V0IGluIGRhdGEudGlsZXNldHNcblx0XHRcdEB0aWxlc1t0aWxlc2V0LmZpcnN0Z2lkXSA9IG5ldyBUaWxlQXNzZXQoXCJhc3NldHMvXCIrdGlsZXNldC5pbWFnZSwgdGlsZXNldC50aWxlaGVpZ2h0LzMyLCB0aWxlc2V0LnRpbGV3aWR0aC8zMilcblxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuXHRcdGZvciBkLCBpIGluIGRhdGEubGF5ZXJzWzBdLmRhdGFcblx0XHRcdGlmIGQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaSAvIGRhdGEubGF5ZXJzWzBdLndpZHRoKVxuXHRcdFx0XHRjb2wgPSBpICUgZGF0YS5sYXllcnNbMF0ud2lkdGhcblx0XHRcdFx0dGlsZSA9IG5ldyBUaWxlKG5ldyBUSFJFRS5WZWN0b3IzKGNvbCwgMTQuNSAtIHJvdywgLXRhcmdldFopLCBAdGlsZXNbZF0pXG5cdFx0XHRcdHRpbGUucm9vdC5wb3NpdGlvbi54ICo9IDI7XG5cdFx0XHRcdHRpbGUucm9vdC5wb3NpdGlvbi55ICo9IDI7XG5cblx0XHRcdFx0dGlsZS5yb290LnNjYWxlLnNldCgyLCAyLCAyKTtcblx0XHRcdFx0QGFkZCB0aWxlXG5cblx0XHRmb3IgZCwgaSBpbiBkYXRhLmxheWVyc1sxXS5kYXRhXG5cdFx0XHRpZiBkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGkgLyBkYXRhLmxheWVyc1swXS53aWR0aClcblx0XHRcdFx0Y29sID0gaSAlIGRhdGEubGF5ZXJzWzBdLndpZHRoXG5cdFx0XHRcdHRpbGUgPSBuZXcgVGlsZShuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIDE0LjUgLSByb3csIDApLCBAdGlsZXNbZF0pXG5cdFx0XHRcdEBhZGQgdGlsZVxuXG5cdFx0Zm9yIG8gaW4gZGF0YS5sYXllcnNbMl0ub2JqZWN0cyBcblx0XHRcdGVuZW15ID0gbmV3IEVuZW1pZXNbby50eXBlXShuZXcgVEhSRUUuVmVjdG9yMyhvLnggLyAzMiwgNyAtIG8ueSAvIDMyLCB1dGlsLnJhbmRvbSgtMSwgMSkpKVxuXG5cdFx0XHRlbmVteS5hY3RpdmUgPSBmYWxzZVxuXHRcdFx0QGFkZCBlbmVteVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXHRcdEBwbGF5ZXIxLnJvb3QucG9zaXRpb24ueCArPSAxICogZGVsdGFcblxuXHRcdGZvciBjaGlsZCBpbiBAY2hpbGRyZW5cblx0XHRcdGlmIGNoaWxkLmFjdGl2ZSA9PSBmYWxzZSBhbmQgY2hpbGQucm9vdC5wb3NpdGlvbi54IDwgQHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ICsgMTBcblx0XHRcdFx0Y2hpbGQuYWN0aXZhdGUoKVxuXG5cdFx0QGNvbGxpc2lvbnMoKVxuXG5cdFxuXHRcdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGlmIGdhbWVPYmplY3QgaW5zdGFuY2VvZiBDb2xsaXNpb25PYmplY3Rcblx0XHRcdEBjb2xsaWRlcnMucHVzaCBnYW1lT2JqZWN0IFxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRpID0gIEBjb2xsaWRlcnMuaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNvbGxpZGVycy5zcGxpY2UoaSwgMSk7XG5cblx0XHRyZXR1cm4gc3VwZXIoZ2FtZU9iamVjdClcblxuXG5cblxuXHRjb2xsaXNpb25zOiAoKS0+XG5cdFx0Zm9yIGEgaW4gQGNvbGxpZGVyc1xuXHRcdFx0aWYgYS5hY3RpdmVcblx0XHRcdFx0Zm9yIGIgaW4gQGNvbGxpZGVyc1xuXHRcdFx0XHRcdGlmIGIuYWN0aXZlXG5cdFx0XHRcdFx0XHRpZiBhLmNvbGxpZGVySGl0VHlwZXMuaW5kZXhPZihiLmNvbGxpZGVyVHlwZSkgPiAtMVxuXHRcdFx0XHRcdFx0XHRpZiBAdGVzdENvbGxpc2lvbiBhLCBiXG5cdFx0XHRcdFx0XHRcdFx0YS5jb2xsaWRlV2l0aCBiXG5cblx0dGVzdENvbGxpc2lvbjogKGEsIGIpLT5cblx0XHRyZXR1cm4gYS5yb290LnBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKGIucm9vdC5wb3NpdGlvbikgPCAxXG5cblxuXG5cblxuY2xhc3MgR2FtZVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdCNzZXR1cCB3b3JsZFxuXHRcdEB3b3JsZCA9IG5ldyBXb3JsZCgpXG5cdFx0XG5cdFx0U2NvcmUuZGlzcGxheUVsZW1lbnQgPSAkKFwiXCJcIjxoMT5IaTwvaDE+XCJcIlwiKS5hcHBlbmRUbyAkKFwiI3NodW1wXCIpXG5cdFx0QGxvYWRMZXZlbCgpXG5cblx0XHR1dGlsLmFmdGVyIDEwMDAsICgpPT5cblx0XHRcdEB3b3JsZC5zdGFydCgpXG5cdFxuXHRsb2FkTGV2ZWw6ICgpLT5cblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggPSAwO1xuXHRcdEBsZXZlbCA9IG5ldyBMZXZlbChAd29ybGQpXG5cdFx0QHdvcmxkLnNjZW5lLmFkZCBAbGV2ZWwucm9vdFxuXHRcdEB3b3JsZC5vbiBcInVwZGF0ZVwiLCBAbGV2ZWwudXBkYXRlXG5cdFx0XG5cdHJlc2V0OiAoKT0+XG5cdFx0Y29uc29sZS5sb2cgXCJyZXNldCBsZXZlbFwiXG5cdFx0XG5cdFx0QHdvcmxkLnNjZW5lLnJlbW92ZSBAbGV2ZWwucm9vdFxuXHRcdEB3b3JsZC5vZmYgXCJ1cGRhdGVcIiwgQGxldmVsLnVwZGF0ZVxuXG5cdFx0QGxvYWRMZXZlbCgpXG5cblxubW9kdWxlLmV4cG9ydHMuZ2FtZSA9IGdhbWUgPSBuZXcgR2FtZSgpXG5cblx0XHRcblxuIyBtb2RlbExvYWRlciA9IG5ldyBjb3JlLk1vZGVsTG9hZGVyKClcblxuXG5cdFx0XHRcblxuXG4iLCJleHBvcnRzLmFmdGVyID0gKGRlbGF5LCBmdW5jKS0+XG5cdHNldFRpbWVvdXQgZnVuYywgZGVsYXlcblxuZXhwb3J0cy5yYW5kb20gPSAobWluLCBtYXgpLT5cblx0cmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiJdfQ==
