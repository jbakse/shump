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
var Basic, CollisionObject, Dart, Particle, Score, SinWave, Sound,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Score = require('./Score.coffee');

Sound = require('./Sound.coffee');

CollisionObject = require('./CollisionObject.coffee');

Particle = require('./Particle.coffee');

Basic = (function(_super) {
  var enemyGeometry, enemyMaterial, enemyTexture;

  __extends(Basic, _super);

  enemyTexture = THREE.ImageUtils.loadTexture("assets/enemy.png");

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
    if (this.age < 1) {
      return this.root.position.x += -20 * delta;
    } else if (this.age < 3) {
      return this.root.position.x += 5 * delta;
    } else {
      return this.die();
    }
  };

  return Dart;

})(Basic);

exports.Basic = Basic;

exports.SinWave = SinWave;

exports.Dart = Dart;


},{"./CollisionObject.coffee":3,"./Particle.coffee":8,"./Score.coffee":10,"./Sound.coffee":11}],5:[function(require,module,exports){
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
        console.log("loadpng", _this);
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
      map: THREE.ImageUtils.loadTexture("assets/white.png")
    });
    this.loadedModels = {};
  }

  ModelLoader.prototype.load = function(fileName) {
    var model, object;
    if ((this.loadedModels[fileName] != null) && this.loadedModels[fileName].status === "ready") {
      console.log("cached");
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

  particleTexture = THREE.ImageUtils.loadTexture("assets/particle.png");

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
    this.colliderHitTypes.push("");
    this.root.add(modelLoader.load("assets/ship.js"));
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
  console.log(exports.displayElement);
  if (exports.displayElement != null) {
    return exports.displayElement.text("Score: " + score);
  }
};

exports.get = function() {
  return score;
};


},{}],11:[function(require,module,exports){
var audioContext, loadSound, play, sounds;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

audioContext = new AudioContext();

exports.sounds = sounds = {};

exports.loadSound = loadSound = function(name, url) {
  var request;
  request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    return audioContext.decodeAudioData(request.response, function(buffer) {
      return exports.sounds[name] = buffer;
    });
  };
  return request.send();
};

exports.play = play = function(arg) {
  var buffer, source;
  if (typeof arg === 'string') {
    buffer = sounds[arg];
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

loadSound('shoot', 'assets/shoot.wav');

loadSound('explosion', 'assets/explosion.wav');


},{}],12:[function(require,module,exports){
var CollisionObject,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CollisionObject = require('./CollisionObject.coffee');

exports.Bullet = (function(_super) {
  var bulletGeometry, bulletMaterial, bulletTexture;

  __extends(Bullet, _super);

  bulletTexture = THREE.ImageUtils.loadTexture("assets/bullet.png");

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
    this.renderer.render(this.scene, this.camera);
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
    console.log("mat", this.material);
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
    console.log(this.data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dvcmxkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvc2h1bXAuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsd0JBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsSUFFQSxHQUFXLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBQSxDQUZYLENBQUE7O0FBQUEsQ0FJQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLE1BQVosQ0FBbUIsNkJBQW5CLENBSkEsQ0FBQTs7QUFBQSxXQU1BLEdBQWMsU0FBQSxHQUFBO1NBQ2IsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBNEIsbUJBQUEsR0FBa0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBbEUsRUFEYTtBQUFBLENBTmQsQ0FBQTs7QUFBQSxJQVVJLENBQUMsS0FBSyxDQUFDLEVBQVgsQ0FBYyxRQUFkLEVBQXdCLFdBQXhCLENBVkEsQ0FBQTs7OztBQ0FBLElBQUEsSUFBQTtFQUFBO29CQUFBOztBQUFBO0FBQ2MsRUFBQSxjQUFBLEdBQUE7QUFDWiw2Q0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQVgsQ0FEWTtFQUFBLENBQWI7O0FBQUEsaUJBR0EsRUFBQSxHQUFJLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTtBQUNILFFBQUEsS0FBQTtBQUFBLElB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QUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLElBbEp0QixDQUFBOzs7O0FDQUEsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO1NBQ2YsVUFBQSxDQUFXLElBQVgsRUFBaUIsS0FBakIsRUFEZTtBQUFBLENBQWhCLENBQUE7O0FBQUEsT0FHTyxDQUFDLE1BQVIsR0FBaUIsU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO0FBQ2hCLFNBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsR0FBQSxHQUFNLEdBQVAsQ0FBaEIsR0FBOEIsR0FBckMsQ0FEZ0I7QUFBQSxDQUhqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJzaHVtcCA9IHJlcXVpcmUoJy4vc2h1bXAvc2h1bXAuY29mZmVlJylcblxuZ2FtZSA9IG5ldyBzaHVtcC5HYW1lKClcblxuJChcIiNkZWJ1Z1wiKS5hcHBlbmQoXCJcIlwiPHNwYW4gaWQ9XCJsZXZlbENoaWxkcmVuXCI+XCJcIlwiKVxuXG51cGRhdGVEZWJ1ZyA9ICgpLT5cblx0JChcIiNsZXZlbENoaWxkcmVuXCIpLnRleHQgXCJcIlwibGV2ZWwuY2hpbGRyZW4gPSAje2dhbWUubGV2ZWwuY2hpbGRyZW4ubGVuZ3RofVwiXCJcIlxuXG5cbmdhbWUud29ybGQub24gXCJ1cGRhdGVcIiwgdXBkYXRlRGVidWdcbiIsImNsYXNzIEJhc2Vcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAX2V2ZW50cyA9IHt9XG5cblx0b246IChldmVudCwgaGFuZGxlcikgLT5cblx0XHQoQF9ldmVudHNbZXZlbnRdID89IFtdKS5wdXNoIGhhbmRsZXJcblx0XHRyZXR1cm4gdGhpc1xuXG5cdG9mZjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdGZvciBzdXNwZWN0LCBpbmRleCBpbiBAX2V2ZW50c1tldmVudF0gd2hlbiBzdXNwZWN0IGlzIGhhbmRsZXJcblx0XHRcdEBfZXZlbnRzW2V2ZW50XS5zcGxpY2UgaW5kZXgsIDFcblx0XHRyZXR1cm4gdGhpc1xuXG5cdHRyaWdnZXI6IChldmVudCwgYXJncy4uLikgPT5cblx0XHRyZXR1cm4gdGhpcyB1bmxlc3MgQF9ldmVudHNbZXZlbnRdP1xuXHRcdGZvciBpIGluIFtAX2V2ZW50c1tldmVudF0ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRoYW5kbGVyID0gQF9ldmVudHNbZXZlbnRdW2ldXG5cdFx0XHRoYW5kbGVyLmFwcGx5IHRoaXMsIGFyZ3Ncblx0XHRyZXR1cm4gdGhpc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBDb2xsaXNpb25PYmplY3QgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSB1bmRlZmluZWRcblx0XHRAY29sbGlkZXJIaXRUeXBlcyA9IFtdXG5cblx0Y29sbGlkZVdpdGg6IChnYW1lT2JqZWN0KS0+XG5cdFx0QGRpZSgpXG5cdFx0Z2FtZU9iamVjdC5kaWUoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uT2JqZWN0XG4iLCJTY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5cbmNsYXNzIEJhc2ljIGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGVuZW15VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvZW5lbXkucG5nXCJcblx0ZW5lbXlNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBlbmVteVRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0ZW5lbXlHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImVuZW15XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwicGxheWVyXCJcblxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBlbmVteUdlb21ldHJ5LCBlbmVteU1hdGVyaWFsXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XHRAYWdlID0gMFxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QGFnZSArPSBkZWx0YVxuXHRcdFxuXHRcblx0ZGllOiAoKS0+XG5cdFx0U2NvcmUuYWRkKDEpXG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDMpXG5cdFx0c3VwZXIoKVxuXG5cbmNsYXNzIFNpbldhdmUgZXh0ZW5kcyBCYXNpY1xuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVx0XHRcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0xICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IGRlbHRhICogTWF0aC5zaW4oQGFnZSlcblxuY2xhc3MgRGFydCBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdGlmIEBhZ2UgPCAxXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0yMCAqIGRlbHRhXG5cdFx0ZWxzZSBpZiBAYWdlIDwgM1xuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHRlbHNlXG5cdFx0XHRAZGllKClcblxuXG5leHBvcnRzLkJhc2ljID0gQmFzaWNcbmV4cG9ydHMuU2luV2F2ZSA9IFNpbldhdmVcbmV4cG9ydHMuRGFydCA9IERhcnRcblxuIyBzdXBlcihkZWx0YSlcblx0XHQjIGlmIEBhZ2UgPCAxXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMlxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi55ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDIuMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdCMgZWxzZVxuXHRcdCMgXHRAZGllKClcbiIsImNsYXNzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHBhcmVudCA9IHVuZGVmaW5lZFxuXHRcdEBjaGlsZHJlbiA9IFtdXG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdEBkZWFkID0gZmFsc2Vcblx0XHRAYWN0aXZlID0gdHJ1ZVxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0Zm9yIGkgaW4gW0BjaGlsZHJlbi5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGNoaWxkID0gQGNoaWxkcmVuW2ldXG5cdFx0XHRpZiBjaGlsZC5kZWFkXG5cdFx0XHRcdEByZW1vdmUgY2hpbGRcblx0XHRcdFx0Y29udGludWVcblx0XHRcdGlmIGNoaWxkLmFjdGl2ZVxuXHRcdFx0XHRjaGlsZC51cGRhdGUgZGVsdGEgXG5cdFxuXHRhY3RpdmF0ZTogKCktPlxuXHRcdEBhY3RpdmUgPSB0cnVlO1xuXHRcdFxuXG5cdGFkZDogKGdhbWVPYmplY3QpLT5cblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IHRoaXNcblx0XHRAY2hpbGRyZW4ucHVzaChnYW1lT2JqZWN0KVxuXHRcdEByb290LmFkZChnYW1lT2JqZWN0LnJvb3QpXG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0QHJvb3QucmVtb3ZlKGdhbWVPYmplY3Qucm9vdClcblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IG51bGxcblx0XHRpID0gIEBjaGlsZHJlbi5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY2hpbGRyZW4uc3BsaWNlKGksIDEpO1xuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0ZGllOiAoKS0+XG5cdFx0QGRlYWQgPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPYmplY3RcbiIsImNsYXNzIElucHV0XG5cdGtleU1hcDogXG5cdFx0XCIzOFwiOlwidXBcIlxuXHRcdFwiODdcIjpcInVwXCIgI3dcblx0XHRcIjQwXCI6XCJkb3duXCJcblx0XHRcIjgzXCI6XCJkb3duXCIgI3Ncblx0XHRcIjM3XCI6XCJsZWZ0XCJcblx0XHRcIjY1XCI6XCJsZWZ0XCIgI2Fcblx0XHRcIjM5XCI6XCJyaWdodFwiXG5cdFx0XCI2OFwiOlwicmlnaHRcIiAjZFxuXHRcdFwiMzJcIjpcImZpcmVfcHJpbWFyeVwiICNzcGFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxuXG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgQGtleU1hcFxuXHRcdFx0QGtleVN0YXRlc1t2YWx1ZV0gPSBmYWxzZTtcblxuXHRcdCQod2luZG93KS5rZXlkb3duIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSB0cnVlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0JCh3aW5kb3cpLmtleXVwIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSBmYWxzZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dFxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKEBnZW9tZXRyeSwgQG1hdGVyaWFsKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBtYXRlcmlhbCA9IHVuZGVmaW5lZFxuXHRcdEBnZW9tZXRyeSA9IHVuZGVmaW5lZFxuXHRcdEB0ZXh0dXJlID0gdW5kZWZpbmVkXG5cdFx0QHN0YXR1cyA9IHVuZGVmaW5lZFxuXG5cdGxvYWQ6IChmaWxlTmFtZSk9PlxuXHRcdGpzb25Mb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpO1xuXHRcdGpzb25Mb2FkZXIubG9hZCBmaWxlTmFtZSwgKGdlb21ldHJ5LCBtYXRlcmlhbHMsIG90aGVycy4uLik9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwoIG1hdGVyaWFscyApXG5cdFx0XHQjIEBtYXRlcmlhbCA9IG1hdGVyaWFsc1swXVxuXHRcdFx0QGdlb21ldHJ5ID0gZ2VvbWV0cnlcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cblx0bG9hZFBuZzogKGZpbGVOYW1lKT0+XG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIGZpbGVOYW1lLCB7fSwgKCk9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRcdCMgdHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdFx0IyBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXHRcdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRcdCMgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkgMSwgMVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0Y29uc29sZS5sb2cgXCJsb2FkcG5nXCIsIHRoaXNcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cbmNsYXNzIE1vZGVsTG9hZGVyXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBkZWZhdWx0R2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KDEsMSwxKVxuXHRcdEBkZWZhdWx0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdGNvbG9yOiAweDAwZmYwMFxuXHRcdFx0d2lyZWZyYW1lOiB0cnVlXG5cdFx0XHRtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2hpdGUucG5nXCJcblxuXHRcdEBsb2FkZWRNb2RlbHMgPSB7fVxuXG5cdGxvYWQ6IChmaWxlTmFtZSktPlxuXG5cdFx0IyBpZiBhbHJlYWR5IGxvYWRlZCwganVzdCBtYWtlIHRoZSBuZXcgbWVzaCBhbmQgcmV0dXJuXG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0/ICYmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLnN0YXR1cyA9PSBcInJlYWR5XCJcblx0XHRcdGNvbnNvbGUubG9nIFwiY2FjaGVkXCJcblx0XHRcdHJldHVybiBuZXcgVEhSRUUuTWVzaChAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5nZW9tZXRyeSwgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0ubWF0ZXJpYWwpXG5cblxuXHRcdCMgaWYgcmVxdWVzdGVkIGJ1dCBub3QgcmVhZHlcblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFx0bW9kZWwgPSBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFxuXHRcdCMgaWYgbm90IHJlcXVlc3RlZCBiZWZvcmVcblx0XHRlbHNlXG5cdFx0XHRtb2RlbCA9IG5ldyBNb2RlbCgpXG5cdFx0XHRpZiBmaWxlTmFtZS5zcGxpdCgnLicpLnBvcCgpID09IFwianNcIlxuXHRcdFx0XHRtb2RlbC5sb2FkKGZpbGVOYW1lKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRtb2RlbC5sb2FkUG5nKGZpbGVOYW1lKVxuXHRcdFx0QGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0gPSBtb2RlbFxuXG5cdFx0b2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goIEBkZWZhdWx0R2VvbWV0cnksIEBkZWZhdWx0TWF0ZXJpYWwgKVxuXHRcdG1vZGVsLm9uIFwic3VjY2Vzc1wiLCAobSktPlxuXHRcdFx0b2JqZWN0Lmdlb21ldHJ5ID0gbS5nZW9tZXRyeVx0XHRcdFxuXHRcdFx0b2JqZWN0Lm1hdGVyaWFsID0gbS5tYXRlcmlhbFxuXHRcdFx0bS5vZmYgXCJzdWNjZXNzXCIsIGFyZ3VtZW50cy5jYWxsZWUgI3JlbW92ZSB0aGlzIGhhbmRsZXIgb25jZSB1c2VkXG5cdFx0cmV0dXJuIG9iamVjdFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsTG9hZGVyXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbnV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuY2xhc3MgUGFydGljbGUgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHBhcnRpY2xlVGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvcGFydGljbGUucG5nXCJcblx0cGFydGljbGVNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBwYXJ0aWNsZVRleHR1cmVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXG5cdHBhcnRpY2xlR2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiwgZW5lcmd5KS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDEwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggcGFydGljbGVHZW9tZXRyeSwgcGFydGljbGVNYXRlcmlhbFxuXHRcdFxuXHRcdEB2ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSkpO1xuXHRcdEB2ZWxvY2l0eS5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcihlbmVyZ3kpXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEB2ZWxvY2l0eS5tdWx0aXBseVNjYWxhciguOTkpXG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBAdmVsb2NpdHkueCAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBAdmVsb2NpdHkueSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueiArPSBAdmVsb2NpdHkueiAqIGRlbHRhXG5cdFx0cyA9IDEtICgoRGF0ZS5ub3coKSAtIEBiaXJ0aCkgLyBAdGltZVRvTGl2ZSkgKyAuMDFcblx0XHRAcm9vdC5zY2FsZS5zZXQocywgcywgcylcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlXG4iLCJTb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuTW9kZWxMb2FkZXIgPSByZXF1aXJlICcuL01vZGVsTG9hZGVyLmNvZmZlZSdcbklucHV0ID0gcmVxdWlyZSAnLi9JbnB1dC5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblxubW9kZWxMb2FkZXIgPSBuZXcgTW9kZWxMb2FkZXIoKVxuaW5wdXQgPSBuZXcgSW5wdXQoKVxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3RcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRcblx0XHRAY29sbGlkZXJUeXBlID0gXCJwbGF5ZXJcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJcIlxuXG5cblx0XHRAcm9vdC5hZGQgbW9kZWxMb2FkZXIubG9hZChcImFzc2V0cy9zaGlwLmpzXCIpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ3VwJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ2Rvd24nXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1snbGVmdCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54IC09IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydyaWdodCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydmaXJlX3ByaW1hcnknXVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBsYXN0RmlyZSArIDI0MCAqIDFcblx0XHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXHRcdFx0IyBAcGFyZW50LmNvbGxpZGVycy5wdXNoIGJ1bGxldFxuXG5cdGRpZTogKCktPlxuXHRcdCMgY29uc29sZS5sb2cgXCJkaWVcIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJcbnNjb3JlID0gMFxuZXhwb3J0cy5kaXNwbGF5RWxlbWVudCA9IHVuZGVmaW5lZFxuXG5leHBvcnRzLmFkZCA9IChwb2ludHMpLT5cblx0c2NvcmUgKz0gcG9pbnRzXG5cdGNvbnNvbGUubG9nIGV4cG9ydHMuZGlzcGxheUVsZW1lbnRcblx0aWYgZXhwb3J0cy5kaXNwbGF5RWxlbWVudD9cblx0XHRleHBvcnRzLmRpc3BsYXlFbGVtZW50LnRleHQgXCJTY29yZTogI3tzY29yZX1cIlxuXG5leHBvcnRzLmdldCA9ICgpLT5cblx0cmV0dXJuIHNjb3JlXG4iLCJ3aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcblxuYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5cblxuXG5leHBvcnRzLnNvdW5kcyA9IHNvdW5kcyA9IHt9XG5cblxuZXhwb3J0cy5sb2FkU291bmQgPSBsb2FkU291bmQgPSAobmFtZSwgdXJsKS0+XG5cdHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXHRyZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSlcblx0cmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXHRyZXF1ZXN0Lm9ubG9hZCA9ICgpLT5cblx0XHRhdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhIHJlcXVlc3QucmVzcG9uc2UsIChidWZmZXIpLT5cblx0XHRcdGV4cG9ydHMuc291bmRzW25hbWVdID0gYnVmZmVyXG5cdHJlcXVlc3Quc2VuZCgpXG5cbmV4cG9ydHMucGxheSA9IHBsYXkgPSAoYXJnKS0+XG5cdGlmIHR5cGVvZiBhcmcgPT0gJ3N0cmluZydcblx0XHRidWZmZXIgPSBzb3VuZHNbYXJnXVxuXHRlbHNlIFxuXHRcdGJ1ZmZlciA9IGFyZ1xuXHRpZiBidWZmZXI/XG5cdFx0c291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG5cdFx0c291cmNlLmJ1ZmZlciA9IGJ1ZmZlclxuXHRcdHNvdXJjZS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbilcblx0XHRzb3VyY2Uuc3RhcnQoMClcblxuXG5sb2FkU291bmQoJ3Nob290JywgJ2Fzc2V0cy9zaG9vdC53YXYnKVxubG9hZFNvdW5kKCdleHBsb3Npb24nLCAnYXNzZXRzL2V4cGxvc2lvbi53YXYnKVxuIiwiQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBleHBvcnRzLkJ1bGxldCBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRidWxsZXRUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9idWxsZXQucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gXCJidWxsZXRcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteVwiXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBidWxsZXRHZW9tZXRyeSwgYnVsbGV0TWF0ZXJpYWxcblxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAoKS0+XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSAuMjVcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cblxuY2xhc3MgV29ybGQgZXh0ZW5kcyBCYXNlXG5cdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRzdXBlcigpXG5cblx0XHR3ID0gNjQwXG5cdFx0aCA9IDQ4MFxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIHcgLyBoLCAxLCAxMDAwMClcblx0XHRmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuXG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdGFyZ2V0WlxuXHRcdFxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0XG5cdFx0QHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKVxuXHRcdEByZW5kZXJlci5zZXRTaXplIHcsIGhcblx0XHQjIEByZW5kZXJlci5zb3J0T2JqZWN0cyA9IGZhbHNlXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG5cdFx0QGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKClcblx0XHRAc3RhdHMgPSBuZXcgU3RhdHMoKTtcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuXHRcdCQoXCIjc2h1bXBcIilbMF0uYXBwZW5kQ2hpbGQoIEBzdGF0cy5kb21FbGVtZW50IClcblxuXHRcdHJldHVybiB0aGlzXG5cblx0YW5pbWF0ZTogPT5cblx0XHRkZWx0YSA9IEBjbG9jay5nZXREZWx0YSgpXHRcdFxuXHRcdCNkb24ndCB1cGRhdGUgYWZ0ZXIgbG9uZyBmcmFtZSAoZml4ZXMgaXNzdWUgd2l0aCBzd2l0Y2hpbmcgdGFicylcblx0XHRpZiAoZGVsdGEgPCAuNSkgXG5cdFx0XHRAdHJpZ2dlciBcInVwZGF0ZVwiLCBkZWx0YVxuXG5cdFx0QHJlbmRlcmVyLnJlbmRlciBAc2NlbmUsIEBjYW1lcmFcblx0XHRAc3RhdHMudXBkYXRlKClcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGVcblx0XHRyZXR1cm5cblxuXHRzdGFydDogLT5cblx0XHRAYW5pbWF0ZSgpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkXG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cbldvcmxkID0gcmVxdWlyZSAnLi9Xb3JsZC5jb2ZmZWUnXG5HYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBsYXllciA9IHJlcXVpcmUgJy4vUGxheWVyLmNvZmZlZSdcbkVuZW1pZXMgPSByZXF1aXJlICcuL0VuZW1pZXMuY29mZmVlJ1xuXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcblxuXG5jbGFzcyBUaWxlQXNzZXRcblx0Y29uc3RydWN0b3I6ICh0ZXh0dXJlRmlsZSwgd2lkdGgsIGhlaWdodCktPlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSB0ZXh0dXJlRmlsZVxuXHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFRlc3Q6IHRydWVcblx0XHRcdGRlcHRoV3JpdGU6IGZhbHNlXG5cdFx0XHQjIG9wYWNpdHk6IC45XG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0IyBjb2xvcjogMHhmZjAwMDBcblx0XHRcdFx0XG5cdFx0Y29uc29sZS5sb2cgXCJtYXRcIiwgQG1hdGVyaWFsXG5cdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIHdpZHRoLCBoZWlnaHQpO1xuXG5jbGFzcyBUaWxlIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uLCB0aWxlQXNzZXQpLT5cblx0XHRzdXBlcigpXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHRpbGVBc3NldC5nZW9tZXRyeSwgdGlsZUFzc2V0Lm1hdGVyaWFsXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHR1cGRhdGU6IC0+XG5cbmNsYXNzIExldmVsIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKEB3b3JsZCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAY29sbGlkZXJzID0gW11cblxuXHRcdEBhbWJpZW50TGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKTtcblx0XHRAcm9vdC5hZGQoQGFtYmllbnRMaWdodCk7XHRcdFxuXG5cdFx0QHBsYXllcjEgPSBuZXcgUGxheWVyKClcblx0XHRAYWRkIEBwbGF5ZXIxXG5cblx0XG5cblx0XHQkLmdldEpTT04gXCJhc3NldHMvbGV2ZWxfMS5qc29uXCIsIEBvbkxvYWRcblx0XHRcdFxuXG5cdG9uTG9hZDogKGRhdGEpPT5cblx0XHRAZGF0YSA9IGRhdGFcblx0XHRjb25zb2xlLmxvZyBAZGF0YVxuXHRcdEB0aWxlcyA9IFtdXG5cdFx0Zm9yIHRpbGVzZXQgaW4gZGF0YS50aWxlc2V0c1xuXHRcdFx0QHRpbGVzW3RpbGVzZXQuZmlyc3RnaWRdID0gbmV3IFRpbGVBc3NldChcImFzc2V0cy9cIit0aWxlc2V0LmltYWdlLCB0aWxlc2V0LnRpbGVoZWlnaHQvMzIsIHRpbGVzZXQudGlsZXdpZHRoLzMyKVxuXG5cdFx0Zm92X3JhZGlhbnMgPSA0NSAqIChNYXRoLlBJIC8gMTgwKVxuXHRcdHRhcmdldFogPSA0ODAgLyAoMiAqIE1hdGgudGFuKGZvdl9yYWRpYW5zIC8gMikgKSAvIDMyLjA7XG5cdFx0Zm9yIGQsIGkgaW4gZGF0YS5sYXllcnNbMF0uZGF0YVxuXHRcdFx0aWYgZCA+IDBcblx0XHRcdFx0cm93ID0gTWF0aC5mbG9vcihpIC8gZGF0YS5sYXllcnNbMF0ud2lkdGgpXG5cdFx0XHRcdGNvbCA9IGkgJSBkYXRhLmxheWVyc1swXS53aWR0aFxuXHRcdFx0XHR0aWxlID0gbmV3IFRpbGUobmV3IFRIUkVFLlZlY3RvcjMoY29sLCAxNC41IC0gcm93LCAtdGFyZ2V0WiksIEB0aWxlc1tkXSlcblx0XHRcdFx0dGlsZS5yb290LnBvc2l0aW9uLnggKj0gMjtcblx0XHRcdFx0dGlsZS5yb290LnBvc2l0aW9uLnkgKj0gMjtcblxuXHRcdFx0XHR0aWxlLnJvb3Quc2NhbGUuc2V0KDIsIDIsIDIpO1xuXHRcdFx0XHRAYWRkIHRpbGVcblxuXHRcdGZvciBkLCBpIGluIGRhdGEubGF5ZXJzWzFdLmRhdGFcblx0XHRcdGlmIGQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaSAvIGRhdGEubGF5ZXJzWzBdLndpZHRoKVxuXHRcdFx0XHRjb2wgPSBpICUgZGF0YS5sYXllcnNbMF0ud2lkdGhcblx0XHRcdFx0dGlsZSA9IG5ldyBUaWxlKG5ldyBUSFJFRS5WZWN0b3IzKGNvbCwgMTQuNSAtIHJvdywgMCksIEB0aWxlc1tkXSlcblx0XHRcdFx0QGFkZCB0aWxlXG5cblx0XHRmb3IgbyBpbiBkYXRhLmxheWVyc1syXS5vYmplY3RzIFxuXHRcdFx0ZW5lbXkgPSBuZXcgRW5lbWllc1tvLnR5cGVdKG5ldyBUSFJFRS5WZWN0b3IzKG8ueCAvIDMyLCA3IC0gby55IC8gMzIsIHV0aWwucmFuZG9tKC0xLCAxKSkpXG5cblx0XHRcdGVuZW15LmFjdGl2ZSA9IGZhbHNlXG5cdFx0XHRAYWRkIGVuZW15XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlID09IGZhbHNlIGFuZCBjaGlsZC5yb290LnBvc2l0aW9uLnggPCBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKyAxMFxuXHRcdFx0XHRjaGlsZC5hY3RpdmF0ZSgpXG5cblx0XHRAY29sbGlzaW9ucygpXG5cblx0XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKTtcblxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cdGNvbGxpc2lvbnM6ICgpLT5cblx0XHRmb3IgYSBpbiBAY29sbGlkZXJzXG5cdFx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0XHRmb3IgYiBpbiBAY29sbGlkZXJzXG5cdFx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRcdGlmIGEuY29sbGlkZXJIaXRUeXBlcy5pbmRleE9mKGIuY29sbGlkZXJUeXBlKSA+IC0xXG5cdFx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVXaXRoIGJcblxuXHR0ZXN0Q29sbGlzaW9uOiAoYSwgYiktPlxuXHRcdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IDFcblxuXG5cblxuXG5jbGFzcyBHYW1lXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0I3NldHVwIHdvcmxkXG5cdFx0QHdvcmxkID0gbmV3IFdvcmxkKClcblx0XHRAbGV2ZWwgPSBuZXcgTGV2ZWwoQHdvcmxkKVxuXG5cdFx0QHdvcmxkLnNjZW5lLmFkZCBAbGV2ZWwucm9vdFxuXHRcdEB3b3JsZC5vbiBcInVwZGF0ZVwiLCBAbGV2ZWwudXBkYXRlXG5cdFx0U2NvcmUuZGlzcGxheUVsZW1lbnQgPSAkKFwiXCJcIjxoMT5IaTwvaDE+XCJcIlwiKS5hcHBlbmRUbyAkKFwiI3NodW1wXCIpXG5cdFx0dXRpbC5hZnRlciAxMDAwLCAoKT0+XG5cdFx0XHRAd29ybGQuc3RhcnQoKVxuXG5cdFx0XG5cblxubW9kdWxlLmV4cG9ydHMuR2FtZSA9IEdhbWVcdFxuXG5cdFx0XG5cbiMgbW9kZWxMb2FkZXIgPSBuZXcgY29yZS5Nb2RlbExvYWRlcigpXG5cblxuXHRcdFx0XG5cblxuIiwiZXhwb3J0cy5hZnRlciA9IChkZWxheSwgZnVuYyktPlxuXHRzZXRUaW1lb3V0IGZ1bmMsIGRlbGF5XG5cbmV4cG9ydHMucmFuZG9tID0gKG1pbiwgbWF4KS0+XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4iXX0=
