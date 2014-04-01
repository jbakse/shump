(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var game, shump, updateDebug;

shump = require('./shump/shump.coffee');

game = new shump.Game();

$("#debug").append("<span id=\"levelChildren\">");

updateDebug = function() {
  return $("#levelChildren").text("level.children = " + game.level.children.length);
};

game.world.on("update", updateDebug);


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
      console.log("fire");
      this.hasFired = true;
      return this.fire_primary();
    }
  };

  Dart.prototype.fire_primary = function() {
    var bullet;
    Sound.play('shoot');
    this.lastFire = Date.now();
    bullet = new Weapons.EnemyBullet(this.root.position);
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
var CollisionObject, Input, ModelLoader, Player, Sound, Weapons, input, modelLoader,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Sound = require('./Sound.coffee');

CollisionObject = require('./CollisionObject.coffee');

ModelLoader = require('./ModelLoader.coffee');

Input = require('./Input.coffee');

Weapons = require('./Weapons.coffee');

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
      return this.parent.add(bullet);
    }
  };

  Player.prototype.die = function() {};

  return Player;

})(CollisionObject);

module.exports = Player;


},{"./CollisionObject.coffee":3,"./Input.coffee":6,"./ModelLoader.coffee":7,"./Sound.coffee":11,"./Weapons.coffee":12}],10:[function(require,module,exports){
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
    this.colliderType = "bullet";
    this.colliderHitTypes.push("enemy");
    this.birth = Date.now();
    this.timeToLive = 1000;
    this.root.add(new THREE.Mesh(bulletGeometry, bulletMaterial));
    this.root.position.copy(position);
  }

  Bullet.prototype.update = function() {
    this.root.position.x += .25;
    if (Date.now() > this.birth + this.timeToLive) {
      return this.die();
    }
  };

  return Bullet;

})(CollisionObject);

exports.EnemyBullet = (function(_super) {
  var bulletGeometry, bulletMaterial, bulletTexture;

  __extends(EnemyBullet, _super);

  bulletTexture = THREE.ImageUtils.loadTexture("assets/weapons/bullet.png");

  bulletMaterial = new THREE.MeshBasicMaterial({
    map: bulletTexture,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    transparent: true
  });

  bulletGeometry = new THREE.PlaneGeometry(1, 1);

  function EnemyBullet(position) {
    EnemyBullet.__super__.constructor.call(this);
    this.colliderType = "enemy_bullet";
    this.colliderHitTypes.push("player");
    this.birth = Date.now();
    this.timeToLive = 1000;
    this.root.add(new THREE.Mesh(bulletGeometry, bulletMaterial));
    this.root.position.copy(position);
  }

  EnemyBullet.prototype.update = function() {
    this.root.position.x -= .15;
    if (Date.now() > this.birth + this.timeToLive) {
      return this.die();
    }
  };

  return EnemyBullet;

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
var CollisionObject, Enemies, Game, GameObject, Level, Player, Score, Sound, Tile, TileAsset, World, util,
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
    this.world = new World();
    this.level = new Level(this.world);
    this.world.scene.add(this.level.root);
    this.world.on("update", this.level.update);
    Score.displayElement = $("<h1>Hi</h1>").appendTo($("#shump"));
    util.after(1000, (function(_this) {
      return function() {
        return _this.world.start();
      };
    })(this));
  }

  return Game;

})();

module.exports.Game = Game;


},{"../util.coffee":15,"./CollisionObject.coffee":3,"./Enemies.coffee":4,"./GameObject.coffee":5,"./Player.coffee":9,"./Score.coffee":10,"./Sound.coffee":11,"./World.coffee":13}],15:[function(require,module,exports){
exports.after = function(delay, func) {
  return setTimeout(func, delay);
};

exports.random = function(min, max) {
  return Math.random() * (max - min) + min;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dvcmxkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvc2h1bXAuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsd0JBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsSUFFQSxHQUFXLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBQSxDQUZYLENBQUE7O0FBQUEsQ0FJQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLE1BQVosQ0FBbUIsNkJBQW5CLENBSkEsQ0FBQTs7QUFBQSxXQU1BLEdBQWMsU0FBQSxHQUFBO1NBQ2IsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBNEIsbUJBQUEsR0FBa0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBbEUsRUFEYTtBQUFBLENBTmQsQ0FBQTs7QUFBQSxJQVVJLENBQUMsS0FBSyxDQUFDLEVBQVgsQ0FBYyxRQUFkLEVBQXdCLFdBQXhCLENBVkEsQ0FBQTs7OztBQ0FBLElBQUEsSUFBQTtFQUFBO29CQUFBOztBQUFBO0FBQ2MsRUFBQSxjQUFBLEdBQUE7QUFDWiw2Q0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQVgsQ0FEWTtFQUFBLENBQWI7O0FBQUEsaUJBR0EsRUFBQSxHQUFJLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTtBQUNILFFBQUEsS0FBQTtBQUFBLElB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UUFBRixDQUE5QixDQUx2QixDQUFBO0FBQUEsSUFNQSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUNoQixLQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQSxFQURnQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLENBTkEsQ0FGWTtFQUFBLENBQWI7O2NBQUE7O0lBcElELENBQUE7O0FBQUEsTUFrSk0sQ0FBQyxPQUFPLENBQUMsSUFBZixHQUFzQixJQWxKdEIsQ0FBQTs7OztBQ0FBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtTQUNmLFVBQUEsQ0FBVyxJQUFYLEVBQWlCLEtBQWpCLEVBRGU7QUFBQSxDQUFoQixDQUFBOztBQUFBLE9BR08sQ0FBQyxNQUFSLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEdBQU4sR0FBQTtBQUNoQixTQUFPLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLEdBQUEsR0FBTSxHQUFQLENBQWhCLEdBQThCLEdBQXJDLENBRGdCO0FBQUEsQ0FIakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwic2h1bXAgPSByZXF1aXJlKCcuL3NodW1wL3NodW1wLmNvZmZlZScpXG5cbmdhbWUgPSBuZXcgc2h1bXAuR2FtZSgpXG5cbiQoXCIjZGVidWdcIikuYXBwZW5kKFwiXCJcIjxzcGFuIGlkPVwibGV2ZWxDaGlsZHJlblwiPlwiXCJcIilcblxudXBkYXRlRGVidWcgPSAoKS0+XG5cdCQoXCIjbGV2ZWxDaGlsZHJlblwiKS50ZXh0IFwiXCJcImxldmVsLmNoaWxkcmVuID0gI3tnYW1lLmxldmVsLmNoaWxkcmVuLmxlbmd0aH1cIlwiXCJcblxuXG5nYW1lLndvcmxkLm9uIFwidXBkYXRlXCIsIHVwZGF0ZURlYnVnXG5cblxuIyBjb25zb2xlLmxvZyBcImhpZGVyYVwiXG5cblxuIiwiY2xhc3MgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBfZXZlbnRzID0ge31cblxuXHRvbjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdChAX2V2ZW50c1tldmVudF0gPz0gW10pLnB1c2ggaGFuZGxlclxuXHRcdHJldHVybiB0aGlzXG5cblx0b2ZmOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0Zm9yIHN1c3BlY3QsIGluZGV4IGluIEBfZXZlbnRzW2V2ZW50XSB3aGVuIHN1c3BlY3QgaXMgaGFuZGxlclxuXHRcdFx0QF9ldmVudHNbZXZlbnRdLnNwbGljZSBpbmRleCwgMVxuXHRcdHJldHVybiB0aGlzXG5cblx0dHJpZ2dlcjogKGV2ZW50LCBhcmdzLi4uKSA9PlxuXHRcdHJldHVybiB0aGlzIHVubGVzcyBAX2V2ZW50c1tldmVudF0/XG5cdFx0Zm9yIGkgaW4gW0BfZXZlbnRzW2V2ZW50XS5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGhhbmRsZXIgPSBAX2V2ZW50c1tldmVudF1baV1cblx0XHRcdGhhbmRsZXIuYXBwbHkgdGhpcywgYXJnc1xuXHRcdHJldHVybiB0aGlzXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5cbmNsYXNzIENvbGxpc2lvbk9iamVjdCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IHVuZGVmaW5lZFxuXHRcdEBjb2xsaWRlckhpdFR5cGVzID0gW11cblxuXHRjb2xsaWRlV2l0aDogKGdhbWVPYmplY3QpLT5cblx0XHRAZGllKClcblx0XHRnYW1lT2JqZWN0LmRpZSgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb25PYmplY3RcbiIsIlNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcbldlYXBvbnMgPSByZXF1aXJlICcuL1dlYXBvbnMuY29mZmVlJ1xuXG5cbmNsYXNzIEJhc2ljIGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGVuZW15VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvZW5lbWllcy9lbmVteS5wbmdcIlxuXHRlbmVteU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGVuZW15VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRlbmVteUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiZW5lbXlcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJwbGF5ZXJcIlxuXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGVuZW15R2VvbWV0cnksIGVuZW15TWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXHRcdEBhZ2UgPSAwXG5cdFx0QGhhc0ZpcmVkID0gZmFsc2VcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVxuXHRcdEBhZ2UgKz0gZGVsdGFcblx0XHRcblx0XG5cdGRpZTogKCktPlxuXHRcdFNjb3JlLmFkZCgxKVxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAzKVxuXHRcdHN1cGVyKClcblxuXG5jbGFzcyBTaW5XYXZlIGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSAtMSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBkZWx0YSAqIE1hdGguc2luKEBhZ2UpXG5cbmNsYXNzIERhcnQgZXh0ZW5kcyBCYXNpY1xuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVx0XHRcblx0XHRpZiBAYWdlIDwgLjVcblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gLTIwICogZGVsdGFcblx0XHRlbHNlIGlmIEBhZ2UgPCAzXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdGVsc2Vcblx0XHRcdEBkaWUoKVxuXG5cdFx0aWYgQGFnZSA+IDEgYW5kIG5vdCBAaGFzRmlyZWRcblx0XHRcdGNvbnNvbGUubG9nIFwiZmlyZVwiXG5cdFx0XHRAaGFzRmlyZWQgPSB0cnVlXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcblx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdEBwYXJlbnQuYWRkIGJ1bGxldFx0XG5cblxuZXhwb3J0cy5CYXNpYyA9IEJhc2ljXG5leHBvcnRzLlNpbldhdmUgPSBTaW5XYXZlXG5leHBvcnRzLkRhcnQgPSBEYXJ0XG5cbiMgc3VwZXIoZGVsdGEpXG5cdFx0IyBpZiBAYWdlIDwgMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDJcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueSArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyLjFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHQjIGVsc2Vcblx0XHQjIFx0QGRpZSgpXG4iLCJjbGFzcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBwYXJlbnQgPSB1bmRlZmluZWRcblx0XHRAY2hpbGRyZW4gPSBbXVxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRAZGVhZCA9IGZhbHNlXG5cdFx0QGFjdGl2ZSA9IHRydWVcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGZvciBpIGluIFtAY2hpbGRyZW4ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRjaGlsZCA9IEBjaGlsZHJlbltpXVxuXHRcdFx0aWYgY2hpbGQuZGVhZFxuXHRcdFx0XHRAcmVtb3ZlIGNoaWxkXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRpZiBjaGlsZC5hY3RpdmVcblx0XHRcdFx0Y2hpbGQudXBkYXRlIGRlbHRhIFxuXHRcblx0YWN0aXZhdGU6ICgpLT5cblx0XHRAYWN0aXZlID0gdHJ1ZTtcblx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSB0aGlzXG5cdFx0QGNoaWxkcmVuLnB1c2goZ2FtZU9iamVjdClcblx0XHRAcm9vdC5hZGQoZ2FtZU9iamVjdC5yb290KVxuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdEByb290LnJlbW92ZShnYW1lT2JqZWN0LnJvb3QpXG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSBudWxsXG5cdFx0aSA9ICBAY2hpbGRyZW4uaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNoaWxkcmVuLnNwbGljZShpLCAxKTtcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdGRpZTogKCktPlxuXHRcdEBkZWFkID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT2JqZWN0XG4iLCJjbGFzcyBJbnB1dFxuXHRrZXlNYXA6IFxuXHRcdFwiMzhcIjpcInVwXCJcblx0XHRcIjg3XCI6XCJ1cFwiICN3XG5cdFx0XCI0MFwiOlwiZG93blwiXG5cdFx0XCI4M1wiOlwiZG93blwiICNzXG5cdFx0XCIzN1wiOlwibGVmdFwiXG5cdFx0XCI2NVwiOlwibGVmdFwiICNhXG5cdFx0XCIzOVwiOlwicmlnaHRcIlxuXHRcdFwiNjhcIjpcInJpZ2h0XCIgI2Rcblx0XHRcIjMyXCI6XCJmaXJlX3ByaW1hcnlcIiAjc3BhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAa2V5U3RhdGVzID0gW11cblxuXHRcdGZvciBrZXksIHZhbHVlIG9mIEBrZXlNYXBcblx0XHRcdEBrZXlTdGF0ZXNbdmFsdWVdID0gZmFsc2U7XG5cblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gdHJ1ZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdCQod2luZG93KS5rZXl1cCAoZSk9PlxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gZmFsc2U7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXRcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IChAZ2VvbWV0cnksIEBtYXRlcmlhbCktPlxuXHRcdHN1cGVyKClcblx0XHRAbWF0ZXJpYWwgPSB1bmRlZmluZWRcblx0XHRAZ2VvbWV0cnkgPSB1bmRlZmluZWRcblx0XHRAdGV4dHVyZSA9IHVuZGVmaW5lZFxuXHRcdEBzdGF0dXMgPSB1bmRlZmluZWRcblxuXHRsb2FkOiAoZmlsZU5hbWUpPT5cblx0XHRqc29uTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblx0XHRqc29uTG9hZGVyLmxvYWQgZmlsZU5hbWUsIChnZW9tZXRyeSwgbWF0ZXJpYWxzLCBvdGhlcnMuLi4pPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKCBtYXRlcmlhbHMgKVxuXHRcdFx0IyBAbWF0ZXJpYWwgPSBtYXRlcmlhbHNbMF1cblx0XHRcdEBnZW9tZXRyeSA9IGdlb21ldHJ5XG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cdGxvYWRQbmc6IChmaWxlTmFtZSk9PlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBmaWxlTmFtZSwge30sICgpPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0XHQjIHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRcdCMgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblx0XHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0XHQjIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5IDEsIDFcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImxvYWRwbmdcIiwgdGhpc1xuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuY2xhc3MgTW9kZWxMb2FkZXJcblx0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QGRlZmF1bHRHZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMSwxLDEpXG5cdFx0QGRlZmF1bHRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0Y29sb3I6IDB4MDBmZjAwXG5cdFx0XHR3aXJlZnJhbWU6IHRydWVcblx0XHRcdG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy91dGlsL3doaXRlLnBuZ1wiXG5cblx0XHRAbG9hZGVkTW9kZWxzID0ge31cblxuXHRsb2FkOiAoZmlsZU5hbWUpLT5cblxuXHRcdCMgaWYgYWxyZWFkeSBsb2FkZWQsIGp1c3QgbWFrZSB0aGUgbmV3IG1lc2ggYW5kIHJldHVyblxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdPyAmJiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5zdGF0dXMgPT0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJjYWNoZWRcIlxuXHRcdFx0cmV0dXJuIG5ldyBUSFJFRS5NZXNoKEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLmdlb21ldHJ5LCBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5tYXRlcmlhbClcblxuXG5cdFx0IyBpZiByZXF1ZXN0ZWQgYnV0IG5vdCByZWFkeVxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XHRtb2RlbCA9IEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XG5cdFx0IyBpZiBub3QgcmVxdWVzdGVkIGJlZm9yZVxuXHRcdGVsc2Vcblx0XHRcdG1vZGVsID0gbmV3IE1vZGVsKClcblx0XHRcdGlmIGZpbGVOYW1lLnNwbGl0KCcuJykucG9wKCkgPT0gXCJqc1wiXG5cdFx0XHRcdG1vZGVsLmxvYWQoZmlsZU5hbWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG1vZGVsLmxvYWRQbmcoZmlsZU5hbWUpXG5cdFx0XHRAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXSA9IG1vZGVsXG5cblx0XHRvYmplY3QgPSBuZXcgVEhSRUUuTWVzaCggQGRlZmF1bHRHZW9tZXRyeSwgQGRlZmF1bHRNYXRlcmlhbCApXG5cdFx0bW9kZWwub24gXCJzdWNjZXNzXCIsIChtKS0+XG5cdFx0XHRvYmplY3QuZ2VvbWV0cnkgPSBtLmdlb21ldHJ5XHRcdFx0XG5cdFx0XHRvYmplY3QubWF0ZXJpYWwgPSBtLm1hdGVyaWFsXG5cdFx0XHRtLm9mZiBcInN1Y2Nlc3NcIiwgYXJndW1lbnRzLmNhbGxlZSAjcmVtb3ZlIHRoaXMgaGFuZGxlciBvbmNlIHVzZWRcblx0XHRyZXR1cm4gb2JqZWN0XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZWxMb2FkZXJcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xudXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5jbGFzcyBQYXJ0aWNsZSBleHRlbmRzIEdhbWVPYmplY3Rcblx0cGFydGljbGVUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9wYXJ0aWNsZXMvcGFydGljbGUucG5nXCJcblx0cGFydGljbGVNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBwYXJ0aWNsZVRleHR1cmVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXG5cdHBhcnRpY2xlR2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiwgZW5lcmd5KS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDEwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggcGFydGljbGVHZW9tZXRyeSwgcGFydGljbGVNYXRlcmlhbFxuXHRcdFxuXHRcdEB2ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSkpO1xuXHRcdEB2ZWxvY2l0eS5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcihlbmVyZ3kpXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEB2ZWxvY2l0eS5tdWx0aXBseVNjYWxhciguOTkpXG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBAdmVsb2NpdHkueCAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBAdmVsb2NpdHkueSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueiArPSBAdmVsb2NpdHkueiAqIGRlbHRhXG5cdFx0cyA9IDEtICgoRGF0ZS5ub3coKSAtIEBiaXJ0aCkgLyBAdGltZVRvTGl2ZSkgKyAuMDFcblx0XHRAcm9vdC5zY2FsZS5zZXQocywgcywgcylcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlXG4iLCJTb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuTW9kZWxMb2FkZXIgPSByZXF1aXJlICcuL01vZGVsTG9hZGVyLmNvZmZlZSdcbklucHV0ID0gcmVxdWlyZSAnLi9JbnB1dC5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblxubW9kZWxMb2FkZXIgPSBuZXcgTW9kZWxMb2FkZXIoKVxuaW5wdXQgPSBuZXcgSW5wdXQoKVxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3RcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRcblx0XHRAY29sbGlkZXJUeXBlID0gXCJwbGF5ZXJcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteV9idWxsZXRcIlxuXG5cblx0XHRAcm9vdC5hZGQgbW9kZWxMb2FkZXIubG9hZChcImFzc2V0cy9zaGlwcy9zaGlwLmpzXCIpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ3VwJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ2Rvd24nXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1snbGVmdCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54IC09IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydyaWdodCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydmaXJlX3ByaW1hcnknXVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBsYXN0RmlyZSArIDI0MCAqIDFcblx0XHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXHRcdFx0IyBAcGFyZW50LmNvbGxpZGVycy5wdXNoIGJ1bGxldFxuXG5cdGRpZTogKCktPlxuXHRcdCMgY29uc29sZS5sb2cgXCJkaWVcIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJcbnNjb3JlID0gMFxuZXhwb3J0cy5kaXNwbGF5RWxlbWVudCA9IHVuZGVmaW5lZFxuXG5leHBvcnRzLmFkZCA9IChwb2ludHMpLT5cblx0c2NvcmUgKz0gcG9pbnRzXG5cdCMgY29uc29sZS5sb2cgZXhwb3J0cy5kaXNwbGF5RWxlbWVudFxuXHRpZiBleHBvcnRzLmRpc3BsYXlFbGVtZW50P1xuXHRcdGV4cG9ydHMuZGlzcGxheUVsZW1lbnQudGV4dCBcIlNjb3JlOiAje3Njb3JlfVwiXG5cbmV4cG9ydHMuZ2V0ID0gKCktPlxuXHRyZXR1cm4gc2NvcmVcbiIsIndpbmRvdy5BdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0fHx3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5jbGFzcyBTb3VuZFxuXHRjb25zdHJ1Y3RvcjogKEBuYW1lLCBAdXJsLCBAYnVmZmVyKS0+XG5leHBvcnRzLlNvdW5kID0gU291bmRcblxuZXhwb3J0cy5sb2FkZWRTb3VuZHMgPSBsb2FkZWRTb3VuZHMgPSB7fVxuXG5cbmV4cG9ydHMubG9hZCA9IGxvYWQgPSAobmFtZSwgdXJsKSAtPlxuXHRyZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHRyZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblx0XHRyZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybClcblx0XHRyZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cdFx0cmVxdWVzdC5vbmxvYWQgPSAoYSwgYiwgYyk9PlxuXHRcdFx0aWYgcmVxdWVzdC5zdGF0dXMgPT0gMjAwXG5cdFx0XHRcdGF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEgcmVxdWVzdC5yZXNwb25zZSwgXG5cdFx0XHRcdFx0KGJ1ZmZlcik9PlxuXHRcdFx0XHRcdFx0I3RvZG8gaGFuZGxlIGRlY29kaW5nIGVycm9yXG5cdFx0XHRcdFx0XHRzb3VuZCA9IG5ldyBTb3VuZChuYW1lLCB1cmwsIGJ1ZmZlcilcblx0XHRcdFx0XHRcdGV4cG9ydHMubG9hZGVkU291bmRzW25hbWVdID0gc291bmRcblx0XHRcdFx0XHRcdHJldHVybiByZXNvbHZlKHNvdW5kKVxuXHRcdFx0XHRcdCwoZXJyKT0+XG5cdFx0XHRcdFx0XHRyZWplY3QgRXJyb3IoXCJEZWNvZGluZyBFcnJvclwiKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRjb25zb2xlLmxvZyAgXCJTdGF0dXNcIlxuXHRcdFx0XHRyZWplY3QgRXJyb3IoXCJTdGF0dXMgRXJyb3JcIilcblxuXHRcdFx0XHRcblx0XHRyZXF1ZXN0Lm9uZXJyb3IgPSAoKS0+XG5cdFx0XHRjb25zb2xlLmxvZyBcImVycnJcIlxuXHRcdFx0cmVqZWN0IEVycm9yKFwiTmV0d29yayBFcnJvclwiKSBcdFxuXG5cdFx0cmVxdWVzdC5zZW5kKClcblx0XHRcdFxuXG5leHBvcnRzLnBsYXkgPSBwbGF5ID0gKGFyZyktPlxuXHRpZiB0eXBlb2YgYXJnID09ICdzdHJpbmcnXG5cdFx0YnVmZmVyID0gbG9hZGVkU291bmRzW2FyZ10uYnVmZmVyXG5cdGVsc2UgXG5cdFx0YnVmZmVyID0gYXJnXG5cdGlmIGJ1ZmZlcj9cblx0XHRzb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcblx0XHRzb3VyY2UuYnVmZmVyID0gYnVmZmVyXG5cdFx0c291cmNlLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKVxuXHRcdHNvdXJjZS5zdGFydCgwKVxuXG5cbmFzc2V0c0xvYWRpbmcgPSBbXVxuYXNzZXRzTG9hZGluZy5wdXNoIGxvYWQoJ3Nob290JywgJ2Fzc2V0cy9zb3VuZHMvc2hvb3Qud2F2JylcbmFzc2V0c0xvYWRpbmcucHVzaCBsb2FkKCdleHBsb3Npb24nLCAnYXNzZXRzL3NvdW5kcy9leHBsb3Npb24ud2F2JylcblxuUHJvbWlzZS5hbGwoYXNzZXRzTG9hZGluZylcbi50aGVuIChyZXN1bHRzKS0+XG5cdGNvbnNvbGUubG9nIFwiTG9hZGVkIGFsbCBTb3VuZHMhXCIsIHJlc3VsdHNcbi5jYXRjaCAoZXJyKS0+XG5cdGNvbnNvbGUubG9nIFwidWhvaFwiLCBlcnJcblxuIiwiQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBleHBvcnRzLkJ1bGxldCBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRidWxsZXRUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy93ZWFwb25zL2J1bGxldC5wbmdcIlxuXHRidWxsZXRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBidWxsZXRUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRidWxsZXRHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAxMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHR1cGRhdGU6ICgpLT5cblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC4yNVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuY2xhc3MgZXhwb3J0cy5FbmVteUJ1bGxldCBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRidWxsZXRUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy93ZWFwb25zL2J1bGxldC5wbmdcIlxuXHRidWxsZXRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBidWxsZXRUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRidWxsZXRHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcInBsYXllclwiXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBidWxsZXRHZW9tZXRyeSwgYnVsbGV0TWF0ZXJpYWxcblxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAoKS0+XG5cdFx0QHJvb3QucG9zaXRpb24ueCAtPSAuMTVcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cblxuY2xhc3MgV29ybGQgZXh0ZW5kcyBCYXNlXG5cdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRzdXBlcigpXG5cblx0XHR3ID0gNjQwXG5cdFx0aCA9IDQ4MFxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIHcgLyBoLCAxLCAxMDAwMClcblx0XHRmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuXG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdGFyZ2V0WlxuXHRcdFxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0XG5cdFx0QHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKVxuXHRcdEByZW5kZXJlci5zZXRTaXplIHcsIGhcblx0XHQjIEByZW5kZXJlci5zb3J0T2JqZWN0cyA9IGZhbHNlXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG5cblx0XHRcblx0XHRAd29ybGRUZXh0dXJlID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0IHcsIGgsIFxuXHRcdFx0bWluRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdG1hZ0ZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyXG5cdFx0XHRmb3JtYXQ6IFRIUkVFLlJHQkZvcm1hdFxuXHRcdFxuXG5cdFx0QHByb2Nlc3NNYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbFxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IGZhbHNlXG5cdFx0XHR1bmlmb3JtczogXG5cdFx0XHRcdFwidERpZmZ1c2VcIjogeyB0eXBlOiBcInRcIiwgdmFsdWU6IEB3b3JsZFRleHR1cmUgfVxuXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR2YXJ5aW5nIHZlYzIgdlV2O1xuXG5cdFx0XHRcdHZvaWQgbWFpbigpIHtcblx0XHRcdFx0XHR2VXYgPSB1djtcblx0XHRcdFx0XHRnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdGZyYWdtZW50U2hhZGVyOlxuXHRcdFx0XHRcIlwiXCJcblx0XHRcdFx0dW5pZm9ybSBzYW1wbGVyMkQgdERpZmZ1c2U7XG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdC8vIHJlYWQgdGhlIGlucHV0IGNvbG9yXG5cblx0XHRcdFx0XHR2ZWM0IG87XG5cblx0XHRcdFx0XHRvID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICk7XG5cdFx0XHRcdFx0by5yID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIDAuMDAxKSApLnI7XG5cblx0XHRcdFx0XHRvLnIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIC43NTtcblx0XHRcdFx0XHRvLmcgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIC43NTtcblx0XHRcdFx0XHRvLmIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIC43NTtcblxuXHRcdFx0XHRcdG8gKj0gMC41ICsgMS4wKjE2LjAqdlV2LngqdlV2LnkqKDEuMC12VXYueCkqKDEuMC12VXYueSk7XG5cdFx0XHRcdFx0XG5cblx0XHRcdFx0XHQvLyBzZXQgdGhlIG91dHB1dCBjb2xvclxuXHRcdFx0XHRcdGdsX0ZyYWdDb2xvciA9IG87XG5cdFx0XHRcdH1cblx0XHRcdFx0XCJcIlwiXG5cblx0XHRAcHJvY2Vzc1NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRAcHJvY2Vzc0NhbWVyYSA9IG5ldyBUSFJFRS5PcnRob2dyYXBoaWNDYW1lcmEoLS41LCAuNSwgLS41ICwgLjUsIDAsIDEpXG5cdFx0QHByb2Nlc3NDYW1lcmEucG9zaXRpb24ueiA9IDBcblx0XHRAcHJvY2Vzc1NjZW5lLmFkZCBAcHJvY2Vzc0NhbWVyYVxuXHRcdEBwcm9jZXNzUXVhZCA9IG5ldyBUSFJFRS5NZXNoKCBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSApLCBAcHJvY2Vzc01hdGVyaWFsICk7XG5cdFx0QHByb2Nlc3NRdWFkLnJvdGF0aW9uLnggPSBNYXRoLlBJXG5cdFx0QHByb2Nlc3NTY2VuZS5hZGQgQHByb2Nlc3NRdWFkXG5cblxuXG5cblx0XHRAY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKVxuXHRcdEBzdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCggQHN0YXRzLmRvbUVsZW1lbnQgKVxuXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRhbmltYXRlOiA9PlxuXHRcdGRlbHRhID0gQGNsb2NrLmdldERlbHRhKClcdFx0XG5cdFx0I2Rvbid0IHVwZGF0ZSBhZnRlciBsb25nIGZyYW1lIChmaXhlcyBpc3N1ZSB3aXRoIHN3aXRjaGluZyB0YWJzKVxuXHRcdGlmIChkZWx0YSA8IC41KSBcblx0XHRcdEB0cmlnZ2VyIFwidXBkYXRlXCIsIGRlbHRhXG5cblx0XHRAcmVuZGVyZXIucmVuZGVyKCBAc2NlbmUsIEBjYW1lcmEsIEB3b3JsZFRleHR1cmUsIHRydWUgKTtcblxuXG5cdFx0QHJlbmRlcmVyLnJlbmRlciBAcHJvY2Vzc1NjZW5lLCBAcHJvY2Vzc0NhbWVyYVxuXG5cdFx0QHN0YXRzLnVwZGF0ZSgpXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIEBhbmltYXRlXG5cdFx0cmV0dXJuXG5cblx0c3RhcnQ6IC0+XG5cdFx0QGFuaW1hdGUoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBXb3JsZFxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5Xb3JsZCA9IHJlcXVpcmUgJy4vV29ybGQuY29mZmVlJ1xuR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5Db2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5QbGF5ZXIgPSByZXF1aXJlICcuL1BsYXllci5jb2ZmZWUnXG5FbmVtaWVzID0gcmVxdWlyZSAnLi9FbmVtaWVzLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcblNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5cblxuY2xhc3MgVGlsZUFzc2V0XG5cdGNvbnN0cnVjdG9yOiAodGV4dHVyZUZpbGUsIHdpZHRoLCBoZWlnaHQpLT5cblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgdGV4dHVyZUZpbGVcblx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhUZXN0OiB0cnVlXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0IyBvcGFjaXR5OiAuOVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdCMgY29sb3I6IDB4ZmYwMDAwXG5cdFx0XHRcdFxuXHRcdCMgY29uc29sZS5sb2cgXCJtYXRcIiwgQG1hdGVyaWFsXG5cdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIHdpZHRoLCBoZWlnaHQpO1xuXG5jbGFzcyBUaWxlIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uLCB0aWxlQXNzZXQpLT5cblx0XHRzdXBlcigpXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHRpbGVBc3NldC5nZW9tZXRyeSwgdGlsZUFzc2V0Lm1hdGVyaWFsXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHR1cGRhdGU6IC0+XG5cbmNsYXNzIExldmVsIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKEB3b3JsZCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAY29sbGlkZXJzID0gW11cblxuXHRcdEBhbWJpZW50TGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKTtcblx0XHRAcm9vdC5hZGQoQGFtYmllbnRMaWdodCk7XHRcdFxuXG5cdFx0QHBsYXllcjEgPSBuZXcgUGxheWVyKClcblx0XHRAYWRkIEBwbGF5ZXIxXG5cblx0XG5cblx0XHQkLmdldEpTT04gXCJhc3NldHMvbGV2ZWxfMS5qc29uXCIsIEBvbkxvYWRcblx0XHRcdFxuXG5cdG9uTG9hZDogKGRhdGEpPT5cblx0XHRAZGF0YSA9IGRhdGFcblx0XHQjIGNvbnNvbGUubG9nIEBkYXRhXG5cdFx0QHRpbGVzID0gW11cblx0XHRmb3IgdGlsZXNldCBpbiBkYXRhLnRpbGVzZXRzXG5cdFx0XHRAdGlsZXNbdGlsZXNldC5maXJzdGdpZF0gPSBuZXcgVGlsZUFzc2V0KFwiYXNzZXRzL1wiK3RpbGVzZXQuaW1hZ2UsIHRpbGVzZXQudGlsZWhlaWdodC8zMiwgdGlsZXNldC50aWxld2lkdGgvMzIpXG5cblx0XHRmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cdFx0dGFyZ2V0WiA9IDQ4MCAvICgyICogTWF0aC50YW4oZm92X3JhZGlhbnMgLyAyKSApIC8gMzIuMDtcblx0XHRmb3IgZCwgaSBpbiBkYXRhLmxheWVyc1swXS5kYXRhXG5cdFx0XHRpZiBkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGkgLyBkYXRhLmxheWVyc1swXS53aWR0aClcblx0XHRcdFx0Y29sID0gaSAlIGRhdGEubGF5ZXJzWzBdLndpZHRoXG5cdFx0XHRcdHRpbGUgPSBuZXcgVGlsZShuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIDE0LjUgLSByb3csIC10YXJnZXRaKSwgQHRpbGVzW2RdKVxuXHRcdFx0XHR0aWxlLnJvb3QucG9zaXRpb24ueCAqPSAyO1xuXHRcdFx0XHR0aWxlLnJvb3QucG9zaXRpb24ueSAqPSAyO1xuXG5cdFx0XHRcdHRpbGUucm9vdC5zY2FsZS5zZXQoMiwgMiwgMik7XG5cdFx0XHRcdEBhZGQgdGlsZVxuXG5cdFx0Zm9yIGQsIGkgaW4gZGF0YS5sYXllcnNbMV0uZGF0YVxuXHRcdFx0aWYgZCA+IDBcblx0XHRcdFx0cm93ID0gTWF0aC5mbG9vcihpIC8gZGF0YS5sYXllcnNbMF0ud2lkdGgpXG5cdFx0XHRcdGNvbCA9IGkgJSBkYXRhLmxheWVyc1swXS53aWR0aFxuXHRcdFx0XHR0aWxlID0gbmV3IFRpbGUobmV3IFRIUkVFLlZlY3RvcjMoY29sLCAxNC41IC0gcm93LCAwKSwgQHRpbGVzW2RdKVxuXHRcdFx0XHRAYWRkIHRpbGVcblxuXHRcdGZvciBvIGluIGRhdGEubGF5ZXJzWzJdLm9iamVjdHMgXG5cdFx0XHRlbmVteSA9IG5ldyBFbmVtaWVzW28udHlwZV0obmV3IFRIUkVFLlZlY3RvcjMoby54IC8gMzIsIDcgLSBvLnkgLyAzMiwgdXRpbC5yYW5kb20oLTEsIDEpKSlcblxuXHRcdFx0ZW5lbXkuYWN0aXZlID0gZmFsc2Vcblx0XHRcdEBhZGQgZW5lbXlcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVxuXHRcdEB3b3JsZC5jYW1lcmEucG9zaXRpb24ueCArPSAxICogZGVsdGFcblx0XHRAcGxheWVyMS5yb290LnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cblx0XHRmb3IgY2hpbGQgaW4gQGNoaWxkcmVuXG5cdFx0XHRpZiBjaGlsZC5hY3RpdmUgPT0gZmFsc2UgYW5kIGNoaWxkLnJvb3QucG9zaXRpb24ueCA8IEB3b3JsZC5jYW1lcmEucG9zaXRpb24ueCArIDEwXG5cdFx0XHRcdGNoaWxkLmFjdGl2YXRlKClcblxuXHRcdEBjb2xsaXNpb25zKClcblxuXHRcblx0XHRcdFxuXG5cdGFkZDogKGdhbWVPYmplY3QpLT5cblx0XHRpZiBnYW1lT2JqZWN0IGluc3RhbmNlb2YgQ29sbGlzaW9uT2JqZWN0XG5cdFx0XHRAY29sbGlkZXJzLnB1c2ggZ2FtZU9iamVjdCBcblx0XHRyZXR1cm4gc3VwZXIoZ2FtZU9iamVjdClcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0aSA9ICBAY29sbGlkZXJzLmluZGV4T2YoZ2FtZU9iamVjdClcblx0XHRpZiBpID49IDBcblx0XHRcdEBjb2xsaWRlcnMuc3BsaWNlKGksIDEpO1xuXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblxuXG5cblx0Y29sbGlzaW9uczogKCktPlxuXHRcdGZvciBhIGluIEBjb2xsaWRlcnNcblx0XHRcdGlmIGEuYWN0aXZlXG5cdFx0XHRcdGZvciBiIGluIEBjb2xsaWRlcnNcblx0XHRcdFx0XHRpZiBiLmFjdGl2ZVxuXHRcdFx0XHRcdFx0aWYgYS5jb2xsaWRlckhpdFR5cGVzLmluZGV4T2YoYi5jb2xsaWRlclR5cGUpID4gLTFcblx0XHRcdFx0XHRcdFx0aWYgQHRlc3RDb2xsaXNpb24gYSwgYlxuXHRcdFx0XHRcdFx0XHRcdGEuY29sbGlkZVdpdGggYlxuXG5cdHRlc3RDb2xsaXNpb246IChhLCBiKS0+XG5cdFx0cmV0dXJuIGEucm9vdC5wb3NpdGlvbi5kaXN0YW5jZVRvU3F1YXJlZChiLnJvb3QucG9zaXRpb24pIDwgMVxuXG5cblxuXG5cbmNsYXNzIEdhbWVcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHQjc2V0dXAgd29ybGRcblx0XHRAd29ybGQgPSBuZXcgV29ybGQoKVxuXHRcdEBsZXZlbCA9IG5ldyBMZXZlbChAd29ybGQpXG5cblx0XHRAd29ybGQuc2NlbmUuYWRkIEBsZXZlbC5yb290XG5cdFx0QHdvcmxkLm9uIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblx0XHRTY29yZS5kaXNwbGF5RWxlbWVudCA9ICQoXCJcIlwiPGgxPkhpPC9oMT5cIlwiXCIpLmFwcGVuZFRvICQoXCIjc2h1bXBcIilcblx0XHR1dGlsLmFmdGVyIDEwMDAsICgpPT5cblx0XHRcdEB3b3JsZC5zdGFydCgpXG5cblx0XHRcblxuXG5tb2R1bGUuZXhwb3J0cy5HYW1lID0gR2FtZVx0XG5cblx0XHRcblxuIyBtb2RlbExvYWRlciA9IG5ldyBjb3JlLk1vZGVsTG9hZGVyKClcblxuXG5cdFx0XHRcblxuXG4iLCJleHBvcnRzLmFmdGVyID0gKGRlbGF5LCBmdW5jKS0+XG5cdHNldFRpbWVvdXQgZnVuYywgZGVsYXlcblxuZXhwb3J0cy5yYW5kb20gPSAobWluLCBtYXgpLT5cblx0cmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiJdfQ==
