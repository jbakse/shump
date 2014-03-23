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
var Basic, CollisionObject, Particle, Score, SinWave, Sound,
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

exports.Basic = Basic;

exports.SinWave = SinWave;


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
      enemy = new Enemies.SinWave(new THREE.Vector3(o.x / 32, 7 - o.y / 32, util.random(-1, 1)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dvcmxkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvc2h1bXAuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsd0JBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsSUFFQSxHQUFXLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBQSxDQUZYLENBQUE7O0FBQUEsQ0FJQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLE1BQVosQ0FBbUIsNkJBQW5CLENBSkEsQ0FBQTs7QUFBQSxXQU1BLEdBQWMsU0FBQSxHQUFBO1NBQ2IsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBNEIsbUJBQUEsR0FBa0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBbEUsRUFEYTtBQUFBLENBTmQsQ0FBQTs7QUFBQSxJQVVJLENBQUMsS0FBSyxDQUFDLEVBQVgsQ0FBYyxRQUFkLEVBQXdCLFdBQXhCLENBVkEsQ0FBQTs7OztBQ0FBLElBQUEsSUFBQTtFQUFBO29CQUFBOztBQUFBO0FBQ2MsRUFBQSxjQUFBLEdBQUE7QUFDWiw2Q0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQVgsQ0FEWTtFQUFBLENBQWI7O0FBQUEsaUJBR0EsRUFBQSxHQUFJLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTtBQUNILFFBQUEsS0FBQTtBQUFBLElB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QUFLLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLElBQXhCLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsUUFBVixFQUFvQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTNCLENBSkEsQ0FBQTtBQUFBLElBS0EsS0FBSyxDQUFDLGNBQU4sR0FBdUIsQ0FBQSxDQUFFLGFBQUYsQ0FBb0IsQ0FBQyxRQUFyQixDQUE4QixDQUFBLENBQUUsUUFBRixDQUE5QixDQUx2QixDQUFBO0FBQUEsSUFNQSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUNoQixLQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQSxFQURnQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLENBTkEsQ0FGWTtFQUFBLENBQWI7O2NBQUE7O0lBcElELENBQUE7O0FBQUEsTUFrSk0sQ0FBQyxPQUFPLENBQUMsSUFBZixHQUFzQixJQWxKdEIsQ0FBQTs7OztBQ0FBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtTQUNmLFVBQUEsQ0FBVyxJQUFYLEVBQWlCLEtBQWpCLEVBRGU7QUFBQSxDQUFoQixDQUFBOztBQUFBLE9BR08sQ0FBQyxNQUFSLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEdBQU4sR0FBQTtBQUNoQixTQUFPLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLEdBQUEsR0FBTSxHQUFQLENBQWhCLEdBQThCLEdBQXJDLENBRGdCO0FBQUEsQ0FIakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwic2h1bXAgPSByZXF1aXJlKCcuL3NodW1wL3NodW1wLmNvZmZlZScpXG5cbmdhbWUgPSBuZXcgc2h1bXAuR2FtZSgpXG5cbiQoXCIjZGVidWdcIikuYXBwZW5kKFwiXCJcIjxzcGFuIGlkPVwibGV2ZWxDaGlsZHJlblwiPlwiXCJcIilcblxudXBkYXRlRGVidWcgPSAoKS0+XG5cdCQoXCIjbGV2ZWxDaGlsZHJlblwiKS50ZXh0IFwiXCJcImxldmVsLmNoaWxkcmVuID0gI3tnYW1lLmxldmVsLmNoaWxkcmVuLmxlbmd0aH1cIlwiXCJcblxuXG5nYW1lLndvcmxkLm9uIFwidXBkYXRlXCIsIHVwZGF0ZURlYnVnXG4iLCJjbGFzcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QF9ldmVudHMgPSB7fVxuXG5cdG9uOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0KEBfZXZlbnRzW2V2ZW50XSA/PSBbXSkucHVzaCBoYW5kbGVyXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRvZmY6IChldmVudCwgaGFuZGxlcikgLT5cblx0XHRmb3Igc3VzcGVjdCwgaW5kZXggaW4gQF9ldmVudHNbZXZlbnRdIHdoZW4gc3VzcGVjdCBpcyBoYW5kbGVyXG5cdFx0XHRAX2V2ZW50c1tldmVudF0uc3BsaWNlIGluZGV4LCAxXG5cdFx0cmV0dXJuIHRoaXNcblxuXHR0cmlnZ2VyOiAoZXZlbnQsIGFyZ3MuLi4pID0+XG5cdFx0cmV0dXJuIHRoaXMgdW5sZXNzIEBfZXZlbnRzW2V2ZW50XT9cblx0XHRmb3IgaSBpbiBbQF9ldmVudHNbZXZlbnRdLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0aGFuZGxlciA9IEBfZXZlbnRzW2V2ZW50XVtpXVxuXHRcdFx0aGFuZGxlci5hcHBseSB0aGlzLCBhcmdzXG5cdFx0cmV0dXJuIHRoaXNcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgQ29sbGlzaW9uT2JqZWN0IGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gdW5kZWZpbmVkXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMgPSBbXVxuXG5cdGNvbGxpZGVXaXRoOiAoZ2FtZU9iamVjdCktPlxuXHRcdEBkaWUoKVxuXHRcdGdhbWVPYmplY3QuZGllKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvbk9iamVjdFxuIiwiU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5Db2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuXG5jbGFzcyBCYXNpYyBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRlbmVteVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL2VuZW15LnBuZ1wiXG5cdGVuZW15TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogZW5lbXlUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdGVuZW15R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gXCJlbmVteVwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcInBsYXllclwiXG5cblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZW5lbXlHZW9tZXRyeSwgZW5lbXlNYXRlcmlhbFxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cdFx0QGFnZSA9IDBcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVxuXHRcdEBhZ2UgKz0gZGVsdGFcblx0XHRcblx0XG5cdGRpZTogKCktPlxuXHRcdFNjb3JlLmFkZCgxKVxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAzKVxuXHRcdHN1cGVyKClcblxuXG5jbGFzcyBTaW5XYXZlIGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSAtMSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBkZWx0YSAqIE1hdGguc2luKEBhZ2UpXG5cbmV4cG9ydHMuQmFzaWMgPSBCYXNpY1xuZXhwb3J0cy5TaW5XYXZlID0gU2luV2F2ZVxuXG5cbiMgc3VwZXIoZGVsdGEpXG5cdFx0IyBpZiBAYWdlIDwgMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDJcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueSArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyLjFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHQjIGVsc2Vcblx0XHQjIFx0QGRpZSgpXG4iLCJjbGFzcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBwYXJlbnQgPSB1bmRlZmluZWRcblx0XHRAY2hpbGRyZW4gPSBbXVxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRAZGVhZCA9IGZhbHNlXG5cdFx0QGFjdGl2ZSA9IHRydWVcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGZvciBpIGluIFtAY2hpbGRyZW4ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRjaGlsZCA9IEBjaGlsZHJlbltpXVxuXHRcdFx0aWYgY2hpbGQuZGVhZFxuXHRcdFx0XHRAcmVtb3ZlIGNoaWxkXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRpZiBjaGlsZC5hY3RpdmVcblx0XHRcdFx0Y2hpbGQudXBkYXRlIGRlbHRhIFxuXHRcblx0YWN0aXZhdGU6ICgpLT5cblx0XHRAYWN0aXZlID0gdHJ1ZTtcblx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSB0aGlzXG5cdFx0QGNoaWxkcmVuLnB1c2goZ2FtZU9iamVjdClcblx0XHRAcm9vdC5hZGQoZ2FtZU9iamVjdC5yb290KVxuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdEByb290LnJlbW92ZShnYW1lT2JqZWN0LnJvb3QpXG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSBudWxsXG5cdFx0aSA9ICBAY2hpbGRyZW4uaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNoaWxkcmVuLnNwbGljZShpLCAxKTtcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdGRpZTogKCktPlxuXHRcdEBkZWFkID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT2JqZWN0XG4iLCJjbGFzcyBJbnB1dFxuXHRrZXlNYXA6IFxuXHRcdFwiMzhcIjpcInVwXCJcblx0XHRcIjg3XCI6XCJ1cFwiICN3XG5cdFx0XCI0MFwiOlwiZG93blwiXG5cdFx0XCI4M1wiOlwiZG93blwiICNzXG5cdFx0XCIzN1wiOlwibGVmdFwiXG5cdFx0XCI2NVwiOlwibGVmdFwiICNhXG5cdFx0XCIzOVwiOlwicmlnaHRcIlxuXHRcdFwiNjhcIjpcInJpZ2h0XCIgI2Rcblx0XHRcIjMyXCI6XCJmaXJlX3ByaW1hcnlcIiAjc3BhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAa2V5U3RhdGVzID0gW11cblxuXHRcdGZvciBrZXksIHZhbHVlIG9mIEBrZXlNYXBcblx0XHRcdEBrZXlTdGF0ZXNbdmFsdWVdID0gZmFsc2U7XG5cblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gdHJ1ZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdCQod2luZG93KS5rZXl1cCAoZSk9PlxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gZmFsc2U7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXRcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IChAZ2VvbWV0cnksIEBtYXRlcmlhbCktPlxuXHRcdHN1cGVyKClcblx0XHRAbWF0ZXJpYWwgPSB1bmRlZmluZWRcblx0XHRAZ2VvbWV0cnkgPSB1bmRlZmluZWRcblx0XHRAdGV4dHVyZSA9IHVuZGVmaW5lZFxuXHRcdEBzdGF0dXMgPSB1bmRlZmluZWRcblxuXHRsb2FkOiAoZmlsZU5hbWUpPT5cblx0XHRqc29uTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblx0XHRqc29uTG9hZGVyLmxvYWQgZmlsZU5hbWUsIChnZW9tZXRyeSwgbWF0ZXJpYWxzLCBvdGhlcnMuLi4pPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKCBtYXRlcmlhbHMgKVxuXHRcdFx0IyBAbWF0ZXJpYWwgPSBtYXRlcmlhbHNbMF1cblx0XHRcdEBnZW9tZXRyeSA9IGdlb21ldHJ5XG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cdGxvYWRQbmc6IChmaWxlTmFtZSk9PlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBmaWxlTmFtZSwge30sICgpPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0XHQjIHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRcdCMgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblx0XHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0XHQjIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5IDEsIDFcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdGNvbnNvbGUubG9nIFwibG9hZHBuZ1wiLCB0aGlzXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5jbGFzcyBNb2RlbExvYWRlclxuXHRcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAZGVmYXVsdEdlb21ldHJ5ID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSgxLDEsMSlcblx0XHRAZGVmYXVsdE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRjb2xvcjogMHgwMGZmMDBcblx0XHRcdHdpcmVmcmFtZTogdHJ1ZVxuXHRcdFx0bWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3doaXRlLnBuZ1wiXG5cblx0XHRAbG9hZGVkTW9kZWxzID0ge31cblxuXHRsb2FkOiAoZmlsZU5hbWUpLT5cblxuXHRcdCMgaWYgYWxyZWFkeSBsb2FkZWQsIGp1c3QgbWFrZSB0aGUgbmV3IG1lc2ggYW5kIHJldHVyblxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdPyAmJiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5zdGF0dXMgPT0gXCJyZWFkeVwiXG5cdFx0XHRjb25zb2xlLmxvZyBcImNhY2hlZFwiXG5cdFx0XHRyZXR1cm4gbmV3IFRIUkVFLk1lc2goQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uZ2VvbWV0cnksIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLm1hdGVyaWFsKVxuXG5cblx0XHQjIGlmIHJlcXVlc3RlZCBidXQgbm90IHJlYWR5XG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcdG1vZGVsID0gQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcblx0XHQjIGlmIG5vdCByZXF1ZXN0ZWQgYmVmb3JlXG5cdFx0ZWxzZVxuXHRcdFx0bW9kZWwgPSBuZXcgTW9kZWwoKVxuXHRcdFx0aWYgZmlsZU5hbWUuc3BsaXQoJy4nKS5wb3AoKSA9PSBcImpzXCJcblx0XHRcdFx0bW9kZWwubG9hZChmaWxlTmFtZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0bW9kZWwubG9hZFBuZyhmaWxlTmFtZSlcblx0XHRcdEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdID0gbW9kZWxcblxuXHRcdG9iamVjdCA9IG5ldyBUSFJFRS5NZXNoKCBAZGVmYXVsdEdlb21ldHJ5LCBAZGVmYXVsdE1hdGVyaWFsIClcblx0XHRtb2RlbC5vbiBcInN1Y2Nlc3NcIiwgKG0pLT5cblx0XHRcdG9iamVjdC5nZW9tZXRyeSA9IG0uZ2VvbWV0cnlcdFx0XHRcblx0XHRcdG9iamVjdC5tYXRlcmlhbCA9IG0ubWF0ZXJpYWxcblx0XHRcdG0ub2ZmIFwic3VjY2Vzc1wiLCBhcmd1bWVudHMuY2FsbGVlICNyZW1vdmUgdGhpcyBoYW5kbGVyIG9uY2UgdXNlZFxuXHRcdHJldHVybiBvYmplY3RcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbExvYWRlclxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG51dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cbmNsYXNzIFBhcnRpY2xlIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRwYXJ0aWNsZVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3BhcnRpY2xlLnBuZ1wiXG5cdHBhcnRpY2xlTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogcGFydGljbGVUZXh0dXJlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoV3JpdGU6IGZhbHNlXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0YmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblxuXHRwYXJ0aWNsZUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24sIGVuZXJneSktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAxMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHBhcnRpY2xlR2VvbWV0cnksIHBhcnRpY2xlTWF0ZXJpYWxcblx0XHRcblx0XHRAdmVsb2NpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMyh1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpKTtcblx0XHRAdmVsb2NpdHkubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoZW5lcmd5KVxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAdmVsb2NpdHkubXVsdGlwbHlTY2FsYXIoLjk5KVxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnggKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gQHZlbG9jaXR5LnkgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnogKz0gQHZlbG9jaXR5LnogKiBkZWx0YVxuXHRcdHMgPSAxLSAoKERhdGUubm93KCkgLSBAYmlydGgpIC8gQHRpbWVUb0xpdmUpICsgLjAxXG5cdFx0QHJvb3Quc2NhbGUuc2V0KHMsIHMsIHMpXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZVxuIiwiU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcbk1vZGVsTG9hZGVyID0gcmVxdWlyZSAnLi9Nb2RlbExvYWRlci5jb2ZmZWUnXG5JbnB1dCA9IHJlcXVpcmUgJy4vSW5wdXQuY29mZmVlJ1xuV2VhcG9ucyA9IHJlcXVpcmUgJy4vV2VhcG9ucy5jb2ZmZWUnXG5cbm1vZGVsTG9hZGVyID0gbmV3IE1vZGVsTG9hZGVyKClcbmlucHV0ID0gbmV3IElucHV0KClcblxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0XG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwicGxheWVyXCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiXCJcblxuXG5cdFx0QHJvb3QuYWRkIG1vZGVsTG9hZGVyLmxvYWQoXCJhc3NldHMvc2hpcC5qc1wiKVxuXHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWyd1cCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydkb3duJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ2xlZnQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1sncmlnaHQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1snZmlyZV9wcmltYXJ5J11cblx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcdGlmIERhdGUubm93KCkgPiBAbGFzdEZpcmUgKyAyNDAgKiAxXG5cdFx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblx0XHRcdCMgQHBhcmVudC5jb2xsaWRlcnMucHVzaCBidWxsZXRcblxuXHRkaWU6ICgpLT5cblx0XHQjIGNvbnNvbGUubG9nIFwiZGllXCJcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxuIiwiXG5zY29yZSA9IDBcbmV4cG9ydHMuZGlzcGxheUVsZW1lbnQgPSB1bmRlZmluZWRcblxuZXhwb3J0cy5hZGQgPSAocG9pbnRzKS0+XG5cdHNjb3JlICs9IHBvaW50c1xuXHRjb25zb2xlLmxvZyBleHBvcnRzLmRpc3BsYXlFbGVtZW50XG5cdGlmIGV4cG9ydHMuZGlzcGxheUVsZW1lbnQ/XG5cdFx0ZXhwb3J0cy5kaXNwbGF5RWxlbWVudC50ZXh0IFwiU2NvcmU6ICN7c2NvcmV9XCJcblxuZXhwb3J0cy5nZXQgPSAoKS0+XG5cdHJldHVybiBzY29yZVxuIiwid2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHR8fHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG5cbmF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxuXG5cblxuZXhwb3J0cy5zb3VuZHMgPSBzb3VuZHMgPSB7fVxuXG5cbmV4cG9ydHMubG9hZFNvdW5kID0gbG9hZFNvdW5kID0gKG5hbWUsIHVybCktPlxuXHRyZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblx0cmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpXG5cdHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblx0cmVxdWVzdC5vbmxvYWQgPSAoKS0+XG5cdFx0YXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSByZXF1ZXN0LnJlc3BvbnNlLCAoYnVmZmVyKS0+XG5cdFx0XHRleHBvcnRzLnNvdW5kc1tuYW1lXSA9IGJ1ZmZlclxuXHRyZXF1ZXN0LnNlbmQoKVxuXG5leHBvcnRzLnBsYXkgPSBwbGF5ID0gKGFyZyktPlxuXHRpZiB0eXBlb2YgYXJnID09ICdzdHJpbmcnXG5cdFx0YnVmZmVyID0gc291bmRzW2FyZ11cblx0ZWxzZSBcblx0XHRidWZmZXIgPSBhcmdcblx0aWYgYnVmZmVyP1xuXHRcdHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuXHRcdHNvdXJjZS5idWZmZXIgPSBidWZmZXJcblx0XHRzb3VyY2UuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pXG5cdFx0c291cmNlLnN0YXJ0KDApXG5cblxubG9hZFNvdW5kKCdzaG9vdCcsICdhc3NldHMvc2hvb3Qud2F2JylcbmxvYWRTb3VuZCgnZXhwbG9zaW9uJywgJ2Fzc2V0cy9leHBsb3Npb24ud2F2JylcbiIsIkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgZXhwb3J0cy5CdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvYnVsbGV0LnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiYnVsbGV0XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlcIlxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDEwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggYnVsbGV0R2VvbWV0cnksIGJ1bGxldE1hdGVyaWFsXG5cblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKCktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLjI1XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5cbmNsYXNzIFdvcmxkIGV4dGVuZHMgQmFzZVxuXHRcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0c3VwZXIoKVxuXG5cdFx0dyA9IDY0MFxuXHRcdGggPSA0ODBcblx0XHRAY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCB3IC8gaCwgMSwgMTAwMDApXG5cdFx0Zm92X3JhZGlhbnMgPSA0NSAqIChNYXRoLlBJIC8gMTgwKVxuXG5cdFx0dGFyZ2V0WiA9IDQ4MCAvICgyICogTWF0aC50YW4oZm92X3JhZGlhbnMgLyAyKSApIC8gMzIuMDtcblxuXHRcdEBjYW1lcmEucG9zaXRpb24ueiA9IHRhcmdldFpcblx0XHRcblx0XHRAc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdFxuXHRcdEByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKClcblx0XHRAcmVuZGVyZXIuc2V0U2l6ZSB3LCBoXG5cdFx0IyBAcmVuZGVyZXIuc29ydE9iamVjdHMgPSBmYWxzZVxuXHRcdCQoXCIjc2h1bXBcIilbMF0uYXBwZW5kQ2hpbGQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcblxuXHRcdEBjbG9jayA9IG5ldyBUSFJFRS5DbG9jaygpXG5cdFx0QHN0YXRzID0gbmV3IFN0YXRzKCk7XG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCdcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkKCBAc3RhdHMuZG9tRWxlbWVudCApXG5cblx0XHRyZXR1cm4gdGhpc1xuXG5cdGFuaW1hdGU6ID0+XG5cdFx0ZGVsdGEgPSBAY2xvY2suZ2V0RGVsdGEoKVx0XHRcblx0XHQjZG9uJ3QgdXBkYXRlIGFmdGVyIGxvbmcgZnJhbWUgKGZpeGVzIGlzc3VlIHdpdGggc3dpdGNoaW5nIHRhYnMpXG5cdFx0aWYgKGRlbHRhIDwgLjUpIFxuXHRcdFx0QHRyaWdnZXIgXCJ1cGRhdGVcIiwgZGVsdGFcblxuXHRcdEByZW5kZXJlci5yZW5kZXIgQHNjZW5lLCBAY2FtZXJhXG5cdFx0QHN0YXRzLnVwZGF0ZSgpXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIEBhbmltYXRlXG5cdFx0cmV0dXJuXG5cblx0c3RhcnQ6IC0+XG5cdFx0QGFuaW1hdGUoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBXb3JsZFxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5Xb3JsZCA9IHJlcXVpcmUgJy4vV29ybGQuY29mZmVlJ1xuR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5Db2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5QbGF5ZXIgPSByZXF1aXJlICcuL1BsYXllci5jb2ZmZWUnXG5FbmVtaWVzID0gcmVxdWlyZSAnLi9FbmVtaWVzLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcblNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5cblxuY2xhc3MgVGlsZUFzc2V0XG5cdGNvbnN0cnVjdG9yOiAodGV4dHVyZUZpbGUsIHdpZHRoLCBoZWlnaHQpLT5cblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgdGV4dHVyZUZpbGVcblx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhUZXN0OiB0cnVlXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0IyBvcGFjaXR5OiAuOVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdCMgY29sb3I6IDB4ZmYwMDAwXG5cdFx0XHRcdFxuXHRcdGNvbnNvbGUubG9nIFwibWF0XCIsIEBtYXRlcmlhbFxuXHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCB3aWR0aCwgaGVpZ2h0KTtcblxuY2xhc3MgVGlsZSBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiwgdGlsZUFzc2V0KS0+XG5cdFx0c3VwZXIoKVxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCB0aWxlQXNzZXQuZ2VvbWV0cnksIHRpbGVBc3NldC5tYXRlcmlhbFxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAtPlxuXG5jbGFzcyBMZXZlbCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IChAd29ybGQpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGNvbGxpZGVycyA9IFtdXG5cblx0XHRAYW1iaWVudExpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XG5cdFx0QHJvb3QuYWRkKEBhbWJpZW50TGlnaHQpO1x0XHRcblxuXHRcdEBwbGF5ZXIxID0gbmV3IFBsYXllcigpXG5cdFx0QGFkZCBAcGxheWVyMVxuXG5cdFxuXG5cdFx0JC5nZXRKU09OIFwiYXNzZXRzL2xldmVsXzEuanNvblwiLCBAb25Mb2FkXG5cdFx0XHRcblxuXHRvbkxvYWQ6IChkYXRhKT0+XG5cdFx0QGRhdGEgPSBkYXRhXG5cdFx0Y29uc29sZS5sb2cgQGRhdGFcblx0XHRAdGlsZXMgPSBbXVxuXHRcdGZvciB0aWxlc2V0IGluIGRhdGEudGlsZXNldHNcblx0XHRcdEB0aWxlc1t0aWxlc2V0LmZpcnN0Z2lkXSA9IG5ldyBUaWxlQXNzZXQoXCJhc3NldHMvXCIrdGlsZXNldC5pbWFnZSwgdGlsZXNldC50aWxlaGVpZ2h0LzMyLCB0aWxlc2V0LnRpbGV3aWR0aC8zMilcblxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuXHRcdGZvciBkLCBpIGluIGRhdGEubGF5ZXJzWzBdLmRhdGFcblx0XHRcdGlmIGQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaSAvIGRhdGEubGF5ZXJzWzBdLndpZHRoKVxuXHRcdFx0XHRjb2wgPSBpICUgZGF0YS5sYXllcnNbMF0ud2lkdGhcblx0XHRcdFx0dGlsZSA9IG5ldyBUaWxlKG5ldyBUSFJFRS5WZWN0b3IzKGNvbCwgMTQuNSAtIHJvdywgLXRhcmdldFopLCBAdGlsZXNbZF0pXG5cdFx0XHRcdHRpbGUucm9vdC5wb3NpdGlvbi54ICo9IDI7XG5cdFx0XHRcdHRpbGUucm9vdC5wb3NpdGlvbi55ICo9IDI7XG5cblx0XHRcdFx0dGlsZS5yb290LnNjYWxlLnNldCgyLCAyLCAyKTtcblx0XHRcdFx0QGFkZCB0aWxlXG5cblx0XHRmb3IgZCwgaSBpbiBkYXRhLmxheWVyc1sxXS5kYXRhXG5cdFx0XHRpZiBkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGkgLyBkYXRhLmxheWVyc1swXS53aWR0aClcblx0XHRcdFx0Y29sID0gaSAlIGRhdGEubGF5ZXJzWzBdLndpZHRoXG5cdFx0XHRcdHRpbGUgPSBuZXcgVGlsZShuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIDE0LjUgLSByb3csIDApLCBAdGlsZXNbZF0pXG5cdFx0XHRcdEBhZGQgdGlsZVxuXG5cdFx0Zm9yIG8gaW4gZGF0YS5sYXllcnNbMl0ub2JqZWN0cyBcblx0XHRcdGVuZW15ID0gbmV3IEVuZW1pZXMuU2luV2F2ZShuZXcgVEhSRUUuVmVjdG9yMyhvLnggLyAzMiwgNyAtIG8ueSAvIDMyLCB1dGlsLnJhbmRvbSgtMSwgMSkpKVxuXG5cdFx0XHRlbmVteS5hY3RpdmUgPSBmYWxzZVxuXHRcdFx0QGFkZCBlbmVteVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXHRcdEBwbGF5ZXIxLnJvb3QucG9zaXRpb24ueCArPSAxICogZGVsdGFcblxuXHRcdGZvciBjaGlsZCBpbiBAY2hpbGRyZW5cblx0XHRcdGlmIGNoaWxkLmFjdGl2ZSA9PSBmYWxzZSBhbmQgY2hpbGQucm9vdC5wb3NpdGlvbi54IDwgQHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ICsgMTBcblx0XHRcdFx0Y2hpbGQuYWN0aXZhdGUoKVxuXG5cdFx0QGNvbGxpc2lvbnMoKVxuXG5cdFxuXHRcdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGlmIGdhbWVPYmplY3QgaW5zdGFuY2VvZiBDb2xsaXNpb25PYmplY3Rcblx0XHRcdEBjb2xsaWRlcnMucHVzaCBnYW1lT2JqZWN0IFxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRpID0gIEBjb2xsaWRlcnMuaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNvbGxpZGVycy5zcGxpY2UoaSwgMSk7XG5cblx0XHRyZXR1cm4gc3VwZXIoZ2FtZU9iamVjdClcblxuXG5cblxuXHRjb2xsaXNpb25zOiAoKS0+XG5cdFx0Zm9yIGEgaW4gQGNvbGxpZGVyc1xuXHRcdFx0aWYgYS5hY3RpdmVcblx0XHRcdFx0Zm9yIGIgaW4gQGNvbGxpZGVyc1xuXHRcdFx0XHRcdGlmIGIuYWN0aXZlXG5cdFx0XHRcdFx0XHRpZiBhLmNvbGxpZGVySGl0VHlwZXMuaW5kZXhPZihiLmNvbGxpZGVyVHlwZSkgPiAtMVxuXHRcdFx0XHRcdFx0XHRpZiBAdGVzdENvbGxpc2lvbiBhLCBiXG5cdFx0XHRcdFx0XHRcdFx0YS5jb2xsaWRlV2l0aCBiXG5cblx0dGVzdENvbGxpc2lvbjogKGEsIGIpLT5cblx0XHRyZXR1cm4gYS5yb290LnBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKGIucm9vdC5wb3NpdGlvbikgPCAxXG5cblxuXG5cblxuY2xhc3MgR2FtZVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdCNzZXR1cCB3b3JsZFxuXHRcdEB3b3JsZCA9IG5ldyBXb3JsZCgpXG5cdFx0QGxldmVsID0gbmV3IExldmVsKEB3b3JsZClcblxuXHRcdEB3b3JsZC5zY2VuZS5hZGQgQGxldmVsLnJvb3Rcblx0XHRAd29ybGQub24gXCJ1cGRhdGVcIiwgQGxldmVsLnVwZGF0ZVxuXHRcdFNjb3JlLmRpc3BsYXlFbGVtZW50ID0gJChcIlwiXCI8aDE+SGk8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdHV0aWwuYWZ0ZXIgMTAwMCwgKCk9PlxuXHRcdFx0QHdvcmxkLnN0YXJ0KClcblxuXHRcdFxuXG5cbm1vZHVsZS5leHBvcnRzLkdhbWUgPSBHYW1lXHRcblxuXHRcdFxuXG4jIG1vZGVsTG9hZGVyID0gbmV3IGNvcmUuTW9kZWxMb2FkZXIoKVxuXG5cblx0XHRcdFxuXG5cbiIsImV4cG9ydHMuYWZ0ZXIgPSAoZGVsYXksIGZ1bmMpLT5cblx0c2V0VGltZW91dCBmdW5jLCBkZWxheVxuXG5leHBvcnRzLnJhbmRvbSA9IChtaW4sIG1heCktPlxuXHRyZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuIl19
