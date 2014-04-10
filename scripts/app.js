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


},{"./shump/shump.coffee":15}],2:[function(require,module,exports){
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
    this.hp = 1;
    this.dp = 1;
    this.collisionRadius = .6;
  }

  CollisionObject.prototype.collideInto = function(target) {
    return target.takeDamage(this.dp);
  };

  CollisionObject.prototype.takeDamage = function(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      return this.die();
    }
  };

  return CollisionObject;

})(GameObject);

module.exports = CollisionObject;


},{"./GameObject.coffee":5}],4:[function(require,module,exports){
var Basic, CollisionObject, Dart, Particle, SinWave, Sound, Weapons,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
    this.active = false;
  }

  Basic.prototype.update = function(delta) {
    Basic.__super__.update.call(this, delta);
    return this.age += delta;
  };

  Basic.prototype.die = function() {
    var i, _i;
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
    bullet = new Weapons.EnemyBullet(this.root.position);
    bullet.colliderType = "enemy_bullet";
    bullet.colliderHitTypes = ["player"];
    bullet.angle = Math.PI - .25;
    bullet.speed = 5;
    this.parent.add(bullet);
    bullet = new Weapons.EnemyBullet(this.root.position);
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


},{"./CollisionObject.coffee":3,"./Particle.coffee":8,"./Sound.coffee":11,"./Weapons.coffee":13}],5:[function(require,module,exports){
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
var Input, input;

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

input = new Input();

module.exports = input;


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

  particleTexture = THREE.ImageUtils.loadTexture("assets/particles/particle2.png");

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


},{"../util.coffee":16,"./GameObject.coffee":5}],9:[function(require,module,exports){
var CollisionObject, Input, ModelLoader, Particle, Player, Shump, Sound, Weapons, modelLoader, util,
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

Player = (function(_super) {
  __extends(Player, _super);

  function Player() {
    this.update = __bind(this.update, this);
    var model;
    Player.__super__.constructor.call(this);
    this.colliderType = "player";
    this.colliderHitTypes.push("enemy_bullet");
    model = modelLoader.load("assets/ships/ship2.js");
    this.root.add(model);
    util.after(1000, function() {
      return model.material.materials[0].wireframe = true;
    });
    this.lastFire = Date.now();
    this.hp = 3;
  }

  Player.prototype.update = function(delta) {
    if (Input.keyStates['up']) {
      this.root.position.y += 10 * delta;
    }
    if (Input.keyStates['down']) {
      this.root.position.y -= 10 * delta;
    }
    if (Input.keyStates['left']) {
      this.root.position.x -= 10 * delta;
    }
    if (Input.keyStates['right']) {
      this.root.position.x += 10 * delta;
    }
    if (Input.keyStates['fire_primary']) {
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
    var i, parent, pos, _i;
    Sound.play('explosion');
    for (i = _i = 0; _i <= 200; i = ++_i) {
      this.parent.add(new Particle(this.root.position, 8));
    }
    pos = this.root.position;
    parent = this.parent;
    util.after(1000, function() {
      var bullet;
      bullet = new Weapons.Bullet(pos);
      bullet.hp = 100;
      bullet.dp = 10;
      bullet.collisionRadius = 150;
      return parent.add(bullet);
    });
    util.after(1250, Shump.game.resetPlayer);
    return Player.__super__.die.call(this);
  };

  return Player;

})(CollisionObject);

module.exports = Player;


},{"../util.coffee":16,"./CollisionObject.coffee":3,"./Input.coffee":6,"./ModelLoader.coffee":7,"./Particle.coffee":8,"./Sound.coffee":11,"./Weapons.coffee":13,"./shump.coffee":15}],10:[function(require,module,exports){
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
var Enemies, ObjectGroup, Tile, TileLayer, TileObject, TileSet, TiledMap, load,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Enemies = require('./Enemies.coffee');

exports.load = load = function(url) {
  return new Promise((function(_this) {
    return function(resolve, reject) {
      var jqxhr;
      jqxhr = $.getJSON(url, _this.onLoad);
      jqxhr.done(function() {
        var level;
        level = new TiledMap(jqxhr.responseJSON);
        return resolve(level);
      });
      return jqxhr.fail(function() {
        return reject(Error("Status Error"));
      });
    };
  })(this));
};

TiledMap = (function() {
  function TiledMap(data) {
    var col, id, layerData, row, tile, tileSet, tileSetData, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _ref1, _ref2, _ref3, _ref4;
    this.data = data;
    this.loadTileLayer = __bind(this.loadTileLayer, this);
    this.tileSets = [];
    this.tiles = [];
    this.layers = {};
    _ref = data.tilesets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tileSetData = _ref[_i];
      tileSet = new TileSet(tileSetData);
      this.tileSets.push(tileSet);
    }
    _ref1 = this.tileSets;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      tileSet = _ref1[_j];
      id = tileSet.data.firstgid;
      for (row = _k = 0, _ref2 = tileSet.rows - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; row = 0 <= _ref2 ? ++_k : --_k) {
        for (col = _l = 0, _ref3 = tileSet.cols - 1; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; col = 0 <= _ref3 ? ++_l : --_l) {
          tile = new Tile(tileSet, row, col);
          this.tiles[id] = tile;
          id++;
        }
      }
    }
    _ref4 = data.layers;
    for (_m = 0, _len2 = _ref4.length; _m < _len2; _m++) {
      layerData = _ref4[_m];
      if (layerData.type === "tilelayer") {
        this.layers[layerData.name] = new TileLayer(this, layerData);
      }
      if (layerData.type === "objectgroup") {
        this.layers[layerData.name] = new ObjectGroup(layerData);
      }
    }
  }

  TiledMap.prototype.loadTileLayer = function(data) {
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

  return TiledMap;

})();

TileSet = (function() {
  function TileSet(data) {
    this.data = data;
    this.cols = this.data.imagewidth / this.data.tilewidth;
    this.rows = this.data.imageheight / this.data.tileheight;
    this.texture = THREE.ImageUtils.loadTexture("assets/" + this.data.image);
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

Tile = (function() {
  function Tile(tileSet, row, col) {
    var face, uvHeight, uvWidth, uvX, uvY, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    this.tileSet = tileSet;
    this.row = row;
    this.col = col;
    this.geometry = new THREE.PlaneGeometry(this.tileSet.data.tilewidth / 32, this.tileSet.data.tileheight / 32);
    _ref = this.geometry.vertices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      v.x += this.tileSet.data.tilewidth / 32 / 2;
      v.y += this.tileSet.data.tileheight / 32 / 2;
    }
    this.geometry.verticesNeedUpdate = true;
    uvWidth = this.tileSet.data.tilewidth / this.tileSet.data.imagewidth;
    uvHeight = this.tileSet.data.tileheight / this.tileSet.data.imageheight;
    uvX = uvWidth * this.col;
    uvY = uvHeight * (this.tileSet.rows - this.row - 1);
    _ref1 = this.geometry.faceVertexUvs[0];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      face = _ref1[_j];
      for (_k = 0, _len2 = face.length; _k < _len2; _k++) {
        v = face[_k];
        if (v.x === 0) {
          v.x = uvX;
        } else {
          v.x = uvX + uvWidth;
        }
        if (v.y === 0) {
          v.y = uvY;
        } else {
          v.y = uvY + uvHeight;
        }
      }
    }
    this.geometry.uvsNeedUpdate = true;
    this.material = this.tileSet.material;
  }

  return Tile;

})();

TileLayer = (function() {
  function TileLayer(map, data) {
    var col, id, index, row, tileObject, _i, _len, _ref;
    this.data = data;
    this.root = new THREE.Object3D();
    _ref = this.data.data;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      id = _ref[index];
      if (id > 0) {
        row = Math.floor(index / data.width);
        col = index % data.width;
        tileObject = new TileObject(map.tiles[id], new THREE.Vector3(col, -row - 1, 0));
        this.root.add(tileObject.mesh);
      }
    }
  }

  return TileLayer;

})();

TileObject = (function() {
  function TileObject(tile, position) {
    this.mesh = new THREE.Mesh(tile.geometry, tile.material);
    this.mesh.position.copy(position);
  }

  return TileObject;

})();

ObjectGroup = (function() {
  function ObjectGroup(data) {
    var enemy, objectData, _i, _len, _ref;
    this.data = data;
    console.log(this.data);
    this.objects = [];
    _ref = this.data.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      objectData = _ref[_i];
      enemy = new Enemies[objectData.type](new THREE.Vector3(objectData.x / 32, 7 - objectData.y / 32, 0));
      this.objects.push(enemy);
    }
  }

  return ObjectGroup;

})();


},{"./Enemies.coffee":4}],13:[function(require,module,exports){
var CollisionObject, Particle, Score,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Score = require('./Score.coffee');

CollisionObject = require('./CollisionObject.coffee');

Particle = require('./Particle.coffee');

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

  Bullet.prototype.collideInto = function(target) {
    var i, _i, _results;
    Bullet.__super__.collideInto.call(this, target);
    Score.add(1);
    this.die();
    _results = [];
    for (i = _i = 0; _i <= 5; i = ++_i) {
      _results.push(this.parent.add(new Particle(this.root.position, 1)));
    }
    return _results;
  };

  return Bullet;

})(CollisionObject);

exports.EnemyBullet = (function(_super) {
  var bulletGeometry, bulletMaterial, bulletTexture;

  __extends(EnemyBullet, _super);

  bulletTexture = THREE.ImageUtils.loadTexture("assets/weapons/bullet_2.png");

  bulletMaterial = new THREE.MeshBasicMaterial({
    map: bulletTexture,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    transparent: true
  });

  bulletGeometry = new THREE.PlaneGeometry(1, 1);

  function EnemyBullet(position) {
    EnemyBullet.__super__.constructor.call(this);
    this.birth = Date.now();
    this.timeToLive = 2000;
    this.root.add(new THREE.Mesh(bulletGeometry, bulletMaterial));
    this.root.position.copy(position);
    this.colliderType = "bullet";
    this.colliderHitTypes.push("enemy");
    this.angle = 0;
    this.speed = 15;
  }

  EnemyBullet.prototype.update = function(delta) {
    this.root.position.x += Math.cos(this.angle) * this.speed * delta;
    this.root.position.y += Math.sin(this.angle) * this.speed * delta;
    this.root.rotation.z = this.angle;
    if (Date.now() > this.birth + this.timeToLive) {
      return this.die();
    }
  };

  EnemyBullet.prototype.collideInto = function(target) {
    var i, _i, _results;
    EnemyBullet.__super__.collideInto.call(this, target);
    Score.add(1);
    this.die();
    _results = [];
    for (i = _i = 0; _i <= 5; i = ++_i) {
      _results.push(this.parent.add(new Particle(this.root.position, 1)));
    }
    return _results;
  };

  return EnemyBullet;

})(CollisionObject);


},{"./CollisionObject.coffee":3,"./Particle.coffee":8,"./Score.coffee":10}],14:[function(require,module,exports){
var Base, Input, World,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./Base.coffee');

Input = require('./Input.coffee');

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
      fragmentShader: "uniform sampler2D tDiffuse;\nvarying vec2 vUv;\n\nvoid main() {\n	// read the input color\n\n	vec4 o;\n	vec4 c;\n	c = texture2D( tDiffuse, vUv );\n	//o = texture2D( tDiffuse, vUv );\n\n	//misalign rgb\n	o.r = texture2D( tDiffuse, vUv + vec2(0.0, -0.001) ).r;\n	o.g = texture2D( tDiffuse, vUv + vec2(0.0, 0.001) ).r;\n	o.b = texture2D( tDiffuse, vUv + vec2(0.0, 0.003) ).r;\n\n	//scanlines\n	o.r *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;\n	o.g *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;\n	o.b *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;\n\n	o *= 0.5 + 1.0*16.0*vUv.x*vUv.y*(1.0-vUv.x)*(1.0-vUv.y);\n	\n\n	// set the output color\n	gl_FragColor = o * .5 + c * .5;\n}"
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


},{"./Base.coffee":2,"./Input.coffee":6}],15:[function(require,module,exports){
var CollisionObject, Enemies, Game, GameObject, GameOverScreen, HomeScreen, Level, Player, Score, Sound, Tiled, World, game, util,
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

Tiled = require('./Tiled.coffee');

Level = (function(_super) {
  __extends(Level, _super);

  function Level(world) {
    var mapPromise, readyPromise;
    this.world = world;
    Level.__super__.constructor.call(this);
    this.colliders = [];
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.root.add(this.ambientLight);
    this.player1 = new Player();
    this.add(this.player1);
    mapPromise = Tiled.load('assets/level_1.json');
    readyPromise = mapPromise.then((function(_this) {
      return function(map) {
        var object, _i, _len, _ref, _results;
        _this.root.add(map.layers.background.root);
        map.layers.background.root.position.y = 7.5;
        _this.root.add(map.layers.midground.root);
        map.layers.midground.root.position.y = 7.5;
        _ref = map.layers.enemies.objects;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          object = _ref[_i];
          _results.push(_this.add(object));
        }
        return _results;
      };
    })(this));
    readyPromise["catch"](function(error) {
      return console.error(error);
    });
  }

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
                  _results1.push(a.collideInto(b));
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
    return a.root.position.distanceToSquared(b.root.position) < a.collisionRadius + b.collisionRadius;
  };

  return Level;

})(GameObject);

HomeScreen = (function(_super) {
  var geometry, material, texture;

  __extends(HomeScreen, _super);

  texture = THREE.ImageUtils.loadTexture("assets/screens/title.png");

  material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    transparent: true
  });

  geometry = new THREE.PlaneGeometry(20, 15);

  function HomeScreen() {
    HomeScreen.__super__.constructor.call(this);
    this.root.add(new THREE.Mesh(geometry, material));
  }

  return HomeScreen;

})(GameObject);

GameOverScreen = (function(_super) {
  var geometry, material, texture;

  __extends(GameOverScreen, _super);

  texture = THREE.ImageUtils.loadTexture("assets/screens/game_over.png");

  material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    transparent: true
  });

  geometry = new THREE.PlaneGeometry(20, 15);

  function GameOverScreen() {
    GameOverScreen.__super__.constructor.call(this);
    this.root.add(new THREE.Mesh(geometry, material));
  }

  return GameOverScreen;

})(GameObject);

Game = (function() {
  function Game() {
    this.gameOver = __bind(this.gameOver, this);
    this.resetPlayer = __bind(this.resetPlayer, this);
    this.world = new World();
    this.homeScreen = new HomeScreen();
    this.gameOverScreen = new GameOverScreen();
    this.loadLevel();
    this.lives = 3;
    Score.displayElement = $("<h1>Score:</h1>").appendTo($("#shump"));
    this.livesElement = $("<h1>Lives:</h1>").appendTo($("#shump"));
    this.state = "home";
    this.world.scene.add(this.homeScreen.root);
    $(window).keydown((function(_this) {
      return function(e) {
        if (_this.state === "home") {
          _this.world.scene.remove(_this.homeScreen.root);
          _this.state = "play";
          _this.startLevel();
          return;
        }
        if (_this.state === "game_over") {
          _this.world.scene.remove(_this.gameOverScreen.root);
          _this.world.scene.add(_this.homeScreen.root);
          _this.state = "home";
        }
      };
    })(this));
    util.after(1, (function(_this) {
      return function() {
        return _this.world.start();
      };
    })(this));
  }

  Game.prototype.loadLevel = function() {
    this.world.camera.position.x = 0;
    return this.level = new Level(this.world);
  };

  Game.prototype.startLevel = function() {
    this.world.scene.add(this.level.root);
    return this.world.on("update", this.level.update);
  };

  Game.prototype.resetPlayer = function() {
    this.lives--;
    this.livesElement.text("Lives: " + this.lives);
    if (this.lives > 0) {
      this.level.player1 = new Player();
      this.level.player1.root.position.x = this.world.camera.position.x;
      return this.level.add(this.level.player1);
    } else {
      return util.after(2000, this.gameOver);
    }
  };

  Game.prototype.gameOver = function() {
    console.log("game over");
    this.world.scene.remove(this.level.root);
    this.world.off("update", this.level.update);
    this.loadLevel();
    this.world.scene.add(this.gameOverScreen.root);
    return this.state = "game_over";
  };

  return Game;

})();

module.exports.game = game = new Game();


},{"../util.coffee":16,"./CollisionObject.coffee":3,"./Enemies.coffee":4,"./GameObject.coffee":5,"./Player.coffee":9,"./Score.coffee":10,"./Sound.coffee":11,"./Tiled.coffee":12,"./World.coffee":14}],16:[function(require,module,exports){
exports.after = function(delay, func) {
  return setTimeout(func, delay);
};

exports.random = function(min, max) {
  return Math.random() * (max - min) + min;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvVGlsZWQuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9XZWFwb25zLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV29ybGQuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9zaHVtcC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxrQkFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHNCQUFSLENBQVIsQ0FBQTs7QUFBQSxDQUVBLENBQUUsYUFBRixDQUFnQixDQUFDLEtBQWpCLENBQXVCLFNBQUEsR0FBQTtBQUV0QixNQUFBLHNFQUFBO0FBQUEsRUFBQSxDQUFBLENBQUUsUUFBRixDQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsdUJBQWYsQ0FBdUMsT0FBTyxDQUFDLG9CQUEvQyxDQUFBLENBQUE7QUFBQSxFQUVBLE1BQUEsR0FBUyxDQUFBLENBQUUsZUFBRixDQUZULENBQUE7QUFBQSxFQUdBLFlBQUEsR0FBZSxNQUFNLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsTUFBTSxDQUFDLE1BQVAsQ0FBQSxDQUhoQyxDQUFBO0FBQUEsRUFLQSxjQUFBLEdBQWlCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FMakIsQ0FBQTtBQUFBLEVBTUEsZUFBQSxHQUFrQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBTmxCLENBQUE7QUFBQSxFQU9BLGVB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QUFDLElBQWYsR0FBc0IsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFBLENBdExqQyxDQUFBOzs7O0FDQUEsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO1NBQ2YsVUFBQSxDQUFXLElBQVgsRUFBaUIsS0FBakIsRUFEZTtBQUFBLENBQWhCLENBQUE7O0FBQUEsT0FHTyxDQUFDLE1BQVIsR0FBaUIsU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO0FBQ2hCLFNBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsR0FBQSxHQUFNLEdBQVAsQ0FBaEIsR0FBOEIsR0FBckMsQ0FEZ0I7QUFBQSxDQUhqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJzaHVtcCA9IHJlcXVpcmUoJy4vc2h1bXAvc2h1bXAuY29mZmVlJylcblxuJChcIiNmdWxsc2NyZWVuXCIpLmNsaWNrICgpLT5cblx0XG5cdCQoXCIjc2h1bXBcIilbMF0ud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4oRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCk7XG5cdFxuXHRjYW52YXMgPSAkKFwiI3NodW1wIGNhbnZhc1wiKVxuXHRjYW52YXNBc3BlY3QgPSBjYW52YXMud2lkdGgoKSAvIGNhbnZhcy5oZWlnaHQoKVxuXG5cdGNvbnRhaW5lcldpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblx0Y29udGFpbmVySGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG5cdGNvbnRhaW5lckFzcGVjdCA9IGNvbnRhaW5lcldpZHRoIC8gY29udGFpbmVySGVpZ2h0XG5cdGNvbnNvbGUubG9nIGNhbnZhc0FzcGVjdCwgJCh3aW5kb3cpLndpZHRoKCkgLCAkKHdpbmRvdykuaGVpZ2h0KCksIGNvbnRhaW5lckFzcGVjdFxuXHRcblx0aWYgY2FudmFzQXNwZWN0IDwgY29udGFpbmVyQXNwZWN0XG5cdFx0Y29uc29sZS5sb2cgXCJtYXRjaCBoZWlnaHRcIlxuXHRcdGNhbnZhcy5oZWlnaHQgY29udGFpbmVySGVpZ2h0XG5cdFx0Y2FudmFzLndpZHRoIGNvbnRhaW5lckhlaWdodCAqIGNhbnZhc0FzcGVjdFxuXHRlbHNlXG5cdFx0Y29uc29sZS5sb2cgXCJtYXRjaCB3aWR0aFwiXG5cdFx0Y2FudmFzLndpZHRoIGNvbnRhaW5lcldpZHRoXG5cdFx0Y2FudmFzLmhlaWdodCBjb250YWluZXJXaWR0aCAvIGNhbnZhc0FzcGVjdFxuXG4kKFwiI2RlYnVnXCIpLmFwcGVuZChcIlwiXCI8c3BhbiBpZD1cImxldmVsQ2hpbGRyZW5cIj5cIlwiXCIpXG5cblxudXBkYXRlRGVidWcgPSAoKS0+XG5cdCQoXCIjbGV2ZWxDaGlsZHJlblwiKS50ZXh0IFwiXCJcImxldmVsLmNoaWxkcmVuID0gI3tzaHVtcC5nYW1lLmxldmVsLmNoaWxkcmVuLmxlbmd0aH1cIlwiXCJcblxuXG5zaHVtcC5nYW1lLndvcmxkLm9uIFwidXBkYXRlXCIsIHVwZGF0ZURlYnVnXG5cblxuXG4jIGNvbnNvbGUubG9nIFwiaGlkZXJhXCJcblxuXG4iLCJjbGFzcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QF9ldmVudHMgPSB7fVxuXG5cdG9uOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0KEBfZXZlbnRzW2V2ZW50XSA/PSBbXSkucHVzaCBoYW5kbGVyXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRvZmY6IChldmVudCwgaGFuZGxlcikgLT5cblx0XHRmb3Igc3VzcGVjdCwgaW5kZXggaW4gQF9ldmVudHNbZXZlbnRdIHdoZW4gc3VzcGVjdCBpcyBoYW5kbGVyXG5cdFx0XHRAX2V2ZW50c1tldmVudF0uc3BsaWNlIGluZGV4LCAxXG5cdFx0cmV0dXJuIHRoaXNcblxuXHR0cmlnZ2VyOiAoZXZlbnQsIGFyZ3MuLi4pID0+XG5cdFx0cmV0dXJuIHRoaXMgdW5sZXNzIEBfZXZlbnRzW2V2ZW50XT9cblx0XHRmb3IgaSBpbiBbQF9ldmVudHNbZXZlbnRdLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0aGFuZGxlciA9IEBfZXZlbnRzW2V2ZW50XVtpXVxuXHRcdFx0aGFuZGxlci5hcHBseSB0aGlzLCBhcmdzXG5cdFx0cmV0dXJuIHRoaXNcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgQ29sbGlzaW9uT2JqZWN0IGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gdW5kZWZpbmVkXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMgPSBbXVxuXHRcdEBocCA9IDFcblx0XHRAZHAgPSAxXG5cdFx0QGNvbGxpc2lvblJhZGl1cyA9IC42XG5cblx0Y29sbGlkZUludG86ICh0YXJnZXQpLT5cblx0XHR0YXJnZXQudGFrZURhbWFnZShAZHApXG5cdFx0IyBAZGllKClcblx0XHQjIGdhbWVPYmplY3QuZGllKClcblxuXHR0YWtlRGFtYWdlOiAoZGFtYWdlKS0+XG5cdFx0QGhwIC09IGRhbWFnZVxuXHRcdGlmIEBocCA8PSAwIFxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uT2JqZWN0XG4iLCJcblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5Db2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuV2VhcG9ucyA9IHJlcXVpcmUgJy4vV2VhcG9ucy5jb2ZmZWUnXG5cblxuY2xhc3MgQmFzaWMgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0ZW5lbXlUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9lbmVtaWVzL2VuZW15LnBuZ1wiXG5cdGVuZW15TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogZW5lbXlUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdGVuZW15R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gXCJlbmVteVwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcInBsYXllclwiXG5cblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZW5lbXlHZW9tZXRyeSwgZW5lbXlNYXRlcmlhbFxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cdFx0QGFnZSA9IDBcblx0XHRAaGFzRmlyZWQgPSBmYWxzZVxuXG5cdFx0QGFjdGl2ZSA9IGZhbHNlXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAYWdlICs9IGRlbHRhXG5cdFx0XG5cdFxuXHRkaWU6ICgpLT5cblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMylcblx0XHRzdXBlcigpXG5cblxuY2xhc3MgU2luV2F2ZSBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLTEgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gZGVsdGEgKiBNYXRoLnNpbihAYWdlKVxuXG5jbGFzcyBEYXJ0IGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0aWYgQGFnZSA8IC41XG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0yMCAqIGRlbHRhXG5cdFx0ZWxzZSBpZiBAYWdlIDwgM1xuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHRlbHNlXG5cdFx0XHRAZGllKClcblxuXHRcdGlmIEBhZ2UgPiAxIGFuZCBub3QgQGhhc0ZpcmVkXG5cdFx0XHRAaGFzRmlyZWQgPSB0cnVlXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcblx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KEByb290LnBvc2l0aW9uKVxuXG5cdFx0YnVsbGV0LmNvbGxpZGVyVHlwZSA9IFwiZW5lbXlfYnVsbGV0XCJcblx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUEkgLSAuMjVcblx0XHRidWxsZXQuc3BlZWQgPSA1XG5cblx0XHRAcGFyZW50LmFkZCBidWxsZXRcdFxuXG5cdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuRW5lbXlCdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cblx0XHRidWxsZXQuY29sbGlkZXJUeXBlID0gXCJlbmVteV9idWxsZXRcIlxuXHRcdGJ1bGxldC5jb2xsaWRlckhpdFR5cGVzID0gW1wicGxheWVyXCJdXG5cdFx0YnVsbGV0LmFuZ2xlID0gTWF0aC5QSSArIC4yNVxuXHRcdGJ1bGxldC5zcGVlZCA9IDVcblxuXHRcdEBwYXJlbnQuYWRkIGJ1bGxldFx0XG5cblxuZXhwb3J0cy5CYXNpYyA9IEJhc2ljXG5leHBvcnRzLlNpbldhdmUgPSBTaW5XYXZlXG5leHBvcnRzLkRhcnQgPSBEYXJ0XG5cbiMgc3VwZXIoZGVsdGEpXG5cdFx0IyBpZiBAYWdlIDwgMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDJcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueSArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyLjFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHQjIGVsc2Vcblx0XHQjIFx0QGRpZSgpXG4iLCJjbGFzcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBwYXJlbnQgPSB1bmRlZmluZWRcblx0XHRAY2hpbGRyZW4gPSBbXVxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRAZGVhZCA9IGZhbHNlXG5cdFx0QGFjdGl2ZSA9IHRydWVcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGZvciBpIGluIFtAY2hpbGRyZW4ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRjaGlsZCA9IEBjaGlsZHJlbltpXVxuXHRcdFx0aWYgY2hpbGQuZGVhZFxuXHRcdFx0XHRAcmVtb3ZlIGNoaWxkXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRpZiBjaGlsZC5hY3RpdmVcblx0XHRcdFx0Y2hpbGQudXBkYXRlIGRlbHRhIFxuXHRcblx0YWN0aXZhdGU6ICgpLT5cblx0XHRAYWN0aXZlID0gdHJ1ZTtcblx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSB0aGlzXG5cdFx0QGNoaWxkcmVuLnB1c2goZ2FtZU9iamVjdClcblx0XHRAcm9vdC5hZGQoZ2FtZU9iamVjdC5yb290KVxuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdEByb290LnJlbW92ZShnYW1lT2JqZWN0LnJvb3QpXG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSBudWxsXG5cdFx0aSA9ICBAY2hpbGRyZW4uaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNoaWxkcmVuLnNwbGljZShpLCAxKTtcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdGRpZTogKCktPlxuXHRcdEBkZWFkID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT2JqZWN0XG4iLCJjbGFzcyBJbnB1dFxuXHRrZXlNYXA6IFxuXHRcdFwiMzhcIjpcInVwXCIgI3VwIGFycm93XG5cdFx0XCI4N1wiOlwidXBcIiAjd1xuXHRcdFwiNDBcIjpcImRvd25cIiAjZG93biBhcnJvd1xuXHRcdFwiODNcIjpcImRvd25cIiAjc1xuXHRcdFwiMzdcIjpcImxlZnRcIiAjbGVmdCBhcnJvd1xuXHRcdFwiNjVcIjpcImxlZnRcIiAjYVxuXHRcdFwiMzlcIjpcInJpZ2h0XCIgI3JpZ2h0IGFycm93XG5cdFx0XCI2OFwiOlwicmlnaHRcIiAjZFxuXHRcdFwiMzJcIjpcImZpcmVfcHJpbWFyeVwiICNzcGFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxuXG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgQGtleU1hcFxuXHRcdFx0QGtleVN0YXRlc1t2YWx1ZV0gPSBmYWxzZTtcblxuXHRcdCQod2luZG93KS5rZXlkb3duIChlKT0+XG5cdFx0XHQjIGNvbnNvbGUubG9nIGUud2hpY2hcblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IHRydWU7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHQkKHdpbmRvdykua2V5dXAgKGUpPT5cblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IGZhbHNlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5pbnB1dCA9IG5ldyBJbnB1dCgpXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0XG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoQGdlb21ldHJ5LCBAbWF0ZXJpYWwpLT5cblx0XHRzdXBlcigpXG5cdFx0QG1hdGVyaWFsID0gdW5kZWZpbmVkXG5cdFx0QGdlb21ldHJ5ID0gdW5kZWZpbmVkXG5cdFx0QHRleHR1cmUgPSB1bmRlZmluZWRcblx0XHRAc3RhdHVzID0gdW5kZWZpbmVkXG5cblx0bG9hZDogKGZpbGVOYW1lKT0+XG5cdFx0anNvbkxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKCk7XG5cdFx0anNvbkxvYWRlci5sb2FkIGZpbGVOYW1lLCAoZ2VvbWV0cnksIG1hdGVyaWFscywgb3RoZXJzLi4uKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbCggbWF0ZXJpYWxzIClcblx0XHRcdCMgQG1hdGVyaWFsID0gbWF0ZXJpYWxzWzBdXG5cdFx0XHRAZ2VvbWV0cnkgPSBnZW9tZXRyeVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXHRsb2FkUG5nOiAoZmlsZU5hbWUpPT5cblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgZmlsZU5hbWUsIHt9LCAoKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdFx0IyB0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0XHQjIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cdFx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdFx0IyBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSAxLCAxXG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJsb2FkcG5nXCIsIHRoaXNcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cblxuXG5jbGFzcyBNb2RlbExvYWRlclxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBkZWZhdWx0R2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KDEsMSwxKVxuXHRcdEBkZWZhdWx0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdGNvbG9yOiAweDAwZmYwMFxuXHRcdFx0d2lyZWZyYW1lOiB0cnVlXG5cdFx0XHRtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvdXRpbC93aGl0ZS5wbmdcIlxuXG5cdFx0QGxvYWRlZE1vZGVscyA9IHt9XG5cblx0bG9hZDogKGZpbGVOYW1lKS0+XG5cblx0XHQjIGlmIGFscmVhZHkgbG9hZGVkLCBqdXN0IG1ha2UgdGhlIG5ldyBtZXNoIGFuZCByZXR1cm5cblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXT8gJiYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uc3RhdHVzID09IFwicmVhZHlcIlxuXHRcdFx0I2NvbnNvbGUubG9nIFwiY2FjaGVkXCJcblx0XHRcdHJldHVybiBuZXcgVEhSRUUuTWVzaChAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5nZW9tZXRyeSwgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0ubWF0ZXJpYWwpXG5cblxuXHRcdCMgaWYgcmVxdWVzdGVkIGJ1dCBub3QgcmVhZHlcblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFx0bW9kZWwgPSBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFxuXHRcdCMgaWYgbm90IHJlcXVlc3RlZCBiZWZvcmVcblx0XHRlbHNlXG5cdFx0XHRtb2RlbCA9IG5ldyBNb2RlbCgpXG5cdFx0XHRpZiBmaWxlTmFtZS5zcGxpdCgnLicpLnBvcCgpID09IFwianNcIlxuXHRcdFx0XHRtb2RlbC5sb2FkKGZpbGVOYW1lKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRtb2RlbC5sb2FkUG5nKGZpbGVOYW1lKVxuXHRcdFx0QGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0gPSBtb2RlbFxuXG5cdFx0b2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goIEBkZWZhdWx0R2VvbWV0cnksIEBkZWZhdWx0TWF0ZXJpYWwgKVxuXHRcdG1vZGVsLm9uIFwic3VjY2Vzc1wiLCAobSktPlxuXHRcdFx0b2JqZWN0Lmdlb21ldHJ5ID0gbS5nZW9tZXRyeVx0XHRcdFxuXHRcdFx0b2JqZWN0Lm1hdGVyaWFsID0gbS5tYXRlcmlhbFxuXHRcdFx0bS5vZmYgXCJzdWNjZXNzXCIsIGFyZ3VtZW50cy5jYWxsZWUgI3JlbW92ZSB0aGlzIGhhbmRsZXIgb25jZSB1c2VkXG5cdFx0cmV0dXJuIG9iamVjdFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsTG9hZGVyXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbnV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuY2xhc3MgUGFydGljbGUgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHBhcnRpY2xlVGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvcGFydGljbGVzL3BhcnRpY2xlMi5wbmdcIlxuXHRwYXJ0aWNsZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHBhcnRpY2xlVGV4dHVyZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cblx0cGFydGljbGVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uLCBlbmVyZ3kpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBwYXJ0aWNsZUdlb21ldHJ5LCBwYXJ0aWNsZU1hdGVyaWFsXG5cdFx0XG5cdFx0QHZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjModXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSk7XG5cdFx0QHZlbG9jaXR5Lm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKGVuZXJneSlcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHZlbG9jaXR5Lm11bHRpcGx5U2NhbGFyKC45OSlcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IEB2ZWxvY2l0eS54ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi56ICs9IEB2ZWxvY2l0eS56ICogZGVsdGFcblx0XHRzID0gMS0gKChEYXRlLm5vdygpIC0gQGJpcnRoKSAvIEB0aW1lVG9MaXZlKSArIC4wMVxuXHRcdEByb290LnNjYWxlLnNldChzLCBzLCBzKVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGVcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcbk1vZGVsTG9hZGVyID0gcmVxdWlyZSAnLi9Nb2RlbExvYWRlci5jb2ZmZWUnXG5JbnB1dCA9IHJlcXVpcmUgJy4vSW5wdXQuY29mZmVlJ1xuV2VhcG9ucyA9IHJlcXVpcmUgJy4vV2VhcG9ucy5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuU2h1bXAgPSByZXF1aXJlICcuL3NodW1wLmNvZmZlZSdcblxubW9kZWxMb2FkZXIgPSBuZXcgTW9kZWxMb2FkZXIoKVxuIyBpbnB1dCA9IG5ldyBJbnB1dCgpXG5cbmNsYXNzIFBsYXllciBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdFxuXHRcdEBjb2xsaWRlclR5cGUgPSBcInBsYXllclwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15X2J1bGxldFwiXG5cblx0XHRtb2RlbCA9IG1vZGVsTG9hZGVyLmxvYWQoXCJhc3NldHMvc2hpcHMvc2hpcDIuanNcIilcblx0XHRAcm9vdC5hZGQgbW9kZWxcblx0XHR1dGlsLmFmdGVyIDEwMDAsICgpLT5cblx0XHRcdG1vZGVsLm1hdGVyaWFsLm1hdGVyaWFsc1swXS53aXJlZnJhbWUgPSB0cnVlXG5cdFx0XG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdEBocCA9IDNcblxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWyd1cCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydkb3duJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ2xlZnQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1sncmlnaHQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1snZmlyZV9wcmltYXJ5J11cblx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcdGlmIERhdGUubm93KCkgPiBAbGFzdEZpcmUgKyAyNDAgKiAxXG5cdFx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0XHRcblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRidWxsZXQuYW5nbGUgPSAtLjI1XG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gKy4yNVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cdFx0XHQjIEBwYXJlbnQuY29sbGlkZXJzLnB1c2ggYnVsbGV0XG5cblx0ZGllOiAoKS0+XG5cdFx0IyBjb25zb2xlLmxvZyBcImRpZVwiXG5cdFx0XG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjAwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCA4KVxuXG5cdFx0cG9zID0gQHJvb3QucG9zaXRpb25cblx0XHRwYXJlbnQgPSBAcGFyZW50XG5cdFx0dXRpbC5hZnRlciAxMDAwLCAoKS0+XG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQocG9zKVxuXHRcdFx0YnVsbGV0LmhwID0gMTAwXG5cdFx0XHRidWxsZXQuZHAgPSAxMFxuXHRcdFx0YnVsbGV0LmNvbGxpc2lvblJhZGl1cyA9IDE1MFxuXHRcdFx0cGFyZW50LmFkZCBidWxsZXRcblxuXHRcdHV0aWwuYWZ0ZXIgMTI1MCwgU2h1bXAuZ2FtZS5yZXNldFBsYXllclxuXHRcdHN1cGVyKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJcbnNjb3JlID0gMFxuZXhwb3J0cy5kaXNwbGF5RWxlbWVudCA9IHVuZGVmaW5lZFxuXG5leHBvcnRzLmFkZCA9IChwb2ludHMpLT5cblx0c2NvcmUgKz0gcG9pbnRzXG5cdCMgY29uc29sZS5sb2cgZXhwb3J0cy5kaXNwbGF5RWxlbWVudFxuXHRpZiBleHBvcnRzLmRpc3BsYXlFbGVtZW50P1xuXHRcdGV4cG9ydHMuZGlzcGxheUVsZW1lbnQudGV4dCBcIlNjb3JlOiAje3Njb3JlfVwiXG5cbmV4cG9ydHMuZ2V0ID0gKCktPlxuXHRyZXR1cm4gc2NvcmVcbiIsIndpbmRvdy5BdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0fHx3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5jbGFzcyBTb3VuZFxuXHRjb25zdHJ1Y3RvcjogKEBuYW1lLCBAdXJsLCBAYnVmZmVyKS0+XG5leHBvcnRzLlNvdW5kID0gU291bmRcblxuZXhwb3J0cy5sb2FkZWRTb3VuZHMgPSBsb2FkZWRTb3VuZHMgPSB7fVxuXG5cbmV4cG9ydHMubG9hZCA9IGxvYWQgPSAobmFtZSwgdXJsKSAtPlxuXHRyZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHRyZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblx0XHRyZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybClcblx0XHRyZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cdFx0cmVxdWVzdC5vbmxvYWQgPSAoYSwgYiwgYyk9PlxuXHRcdFx0aWYgcmVxdWVzdC5zdGF0dXMgPT0gMjAwXG5cdFx0XHRcdGF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEgcmVxdWVzdC5yZXNwb25zZSwgXG5cdFx0XHRcdFx0KGJ1ZmZlcik9PlxuXHRcdFx0XHRcdFx0I3RvZG8gaGFuZGxlIGRlY29kaW5nIGVycm9yXG5cdFx0XHRcdFx0XHRzb3VuZCA9IG5ldyBTb3VuZChuYW1lLCB1cmwsIGJ1ZmZlcilcblx0XHRcdFx0XHRcdGV4cG9ydHMubG9hZGVkU291bmRzW25hbWVdID0gc291bmRcblx0XHRcdFx0XHRcdHJldHVybiByZXNvbHZlKHNvdW5kKVxuXHRcdFx0XHRcdCwoZXJyKT0+XG5cdFx0XHRcdFx0XHRyZWplY3QgRXJyb3IoXCJEZWNvZGluZyBFcnJvclwiKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRjb25zb2xlLmxvZyAgXCJTdGF0dXNcIlxuXHRcdFx0XHRyZWplY3QgRXJyb3IoXCJTdGF0dXMgRXJyb3JcIilcblxuXHRcdFx0XHRcblx0XHRyZXF1ZXN0Lm9uZXJyb3IgPSAoKS0+XG5cdFx0XHRjb25zb2xlLmxvZyBcImVycnJcIlxuXHRcdFx0cmVqZWN0IEVycm9yKFwiTmV0d29yayBFcnJvclwiKSBcdFxuXG5cdFx0cmVxdWVzdC5zZW5kKClcblx0XHRcdFxuXG5leHBvcnRzLnBsYXkgPSBwbGF5ID0gKGFyZyktPlxuXHRpZiB0eXBlb2YgYXJnID09ICdzdHJpbmcnXG5cdFx0YnVmZmVyID0gbG9hZGVkU291bmRzW2FyZ10uYnVmZmVyXG5cdGVsc2UgXG5cdFx0YnVmZmVyID0gYXJnXG5cdGlmIGJ1ZmZlcj9cblx0XHRzb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcblx0XHRzb3VyY2UuYnVmZmVyID0gYnVmZmVyXG5cdFx0c291cmNlLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKVxuXHRcdHNvdXJjZS5zdGFydCgwKVxuXG5cbmFzc2V0c0xvYWRpbmcgPSBbXVxuYXNzZXRzTG9hZGluZy5wdXNoIGxvYWQoJ3Nob290JywgJ2Fzc2V0cy9zb3VuZHMvc2hvb3Qud2F2JylcbmFzc2V0c0xvYWRpbmcucHVzaCBsb2FkKCdleHBsb3Npb24nLCAnYXNzZXRzL3NvdW5kcy9leHBsb3Npb24ud2F2JylcblxuUHJvbWlzZS5hbGwoYXNzZXRzTG9hZGluZylcbi50aGVuIChyZXN1bHRzKS0+XG5cdGNvbnNvbGUubG9nIFwiTG9hZGVkIGFsbCBTb3VuZHMhXCIsIHJlc3VsdHNcbi5jYXRjaCAoZXJyKS0+XG5cdGNvbnNvbGUubG9nIFwidWhvaFwiLCBlcnJcblxuIiwiRW5lbWllcyA9IHJlcXVpcmUgJy4vRW5lbWllcy5jb2ZmZWUnXG5cbmV4cG9ydHMubG9hZCA9IGxvYWQgPSAodXJsKSAtPlxuXHRyZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHRqcXhociA9ICQuZ2V0SlNPTiB1cmwsIEBvbkxvYWRcblxuXHRcdGpxeGhyLmRvbmUgKCktPlxuXHRcdFx0bGV2ZWwgPSBuZXcgVGlsZWRNYXAoanF4aHIucmVzcG9uc2VKU09OKVxuXHRcdFx0cmV0dXJuIHJlc29sdmUobGV2ZWwpXG5cblx0XHRqcXhoci5mYWlsICgpLT5cblx0XHRcdHJldHVybiByZWplY3QgRXJyb3IoXCJTdGF0dXMgRXJyb3JcIilcblxuXG5jbGFzcyBUaWxlZE1hcFxuXHRjb25zdHJ1Y3RvcjogKEBkYXRhKS0+XG5cdFx0QHRpbGVTZXRzID0gW11cblx0XHRAdGlsZXMgPSBbXVxuXHRcdEBsYXllcnMgPSB7fVxuXG5cdFx0IyBjcmVhdGUgdGlsZVNldHMsIGxvYWQgdGhlIHRleHR1cmVzXG5cdFx0Zm9yIHRpbGVTZXREYXRhIGluIGRhdGEudGlsZXNldHNcblx0XHRcdHRpbGVTZXQgPSBuZXcgVGlsZVNldCB0aWxlU2V0RGF0YVxuXHRcdFx0QHRpbGVTZXRzLnB1c2ggdGlsZVNldFxuXG5cdFx0IyBjcmVhdGUgdGlsZXMgQGdlb21ldGVyeSBhbmQgQG1hdGVyaWFsXG5cdFx0Zm9yIHRpbGVTZXQgaW4gQHRpbGVTZXRzXG5cdFx0XHRpZCA9IHRpbGVTZXQuZGF0YS5maXJzdGdpZFxuXHRcdFx0Zm9yIHJvdyBpbiBbMC4udGlsZVNldC5yb3dzLTFdXG5cdFx0XHRcdGZvciBjb2wgaW4gWzAuLnRpbGVTZXQuY29scy0xXVxuXHRcdFx0XHRcdHRpbGUgPSBuZXcgVGlsZSB0aWxlU2V0LCByb3csIGNvbFxuXHRcdFx0XHRcdEB0aWxlc1tpZF0gPSB0aWxlXG5cdFx0XHRcdFx0aWQrK1xuXG5cblx0XHQjIGxvYWQgbGF5ZXJzXG5cdFx0Zm9yIGxheWVyRGF0YSBpbiBkYXRhLmxheWVyc1xuXHRcdFx0aWYgbGF5ZXJEYXRhLnR5cGUgPT0gXCJ0aWxlbGF5ZXJcIlxuXHRcdFx0XHRAbGF5ZXJzW2xheWVyRGF0YS5uYW1lXSA9IG5ldyBUaWxlTGF5ZXIodGhpcywgbGF5ZXJEYXRhKVxuXHRcdFx0aWYgbGF5ZXJEYXRhLnR5cGUgPT0gXCJvYmplY3Rncm91cFwiXG5cdFx0XHRcdEBsYXllcnNbbGF5ZXJEYXRhLm5hbWVdID0gbmV3IE9iamVjdEdyb3VwKGxheWVyRGF0YSlcblxuXHRcdCMgIyBjcmVhdGUgdGlsZSBvYmplY3RzIHRoYXQgY29tcHJpc2UgYmFja2dyb3VuZHNcblxuXHRcdCMgZGF0YS5sYXllcnNcblxuXHRcdCMgQGZhckJhY2tncm91bmQgPSBAbG9hZFRpbGVMYXllcihkYXRhLmxheWVyc1swXSlcblx0XHQjIEBiYWNrZ3JvdW5kID0gXG5cblxuXHRcdCMgZmFyQmFja2dyb3VuZC5wb3NpdGlvbi55ID0gNy41ICogMlxuXHRcdCMgZm92X3JhZGlhbnMgPSA0NSAqIChNYXRoLlBJIC8gMTgwKVxuXHRcdCMgdGFyZ2V0WiA9IDQ4MCAvICgyICogTWF0aC50YW4oZm92X3JhZGlhbnMgLyAyKSApIC8gMzIuMFxuXHRcdCMgZmFyQmFja2dyb3VuZC5wb3NpdGlvbi56ID0gLXRhcmdldFpcblx0XHQjIGZhckJhY2tncm91bmQuc2NhbGUuc2V0KDIsIDIsIDIpXG5cdFx0IyBjb25zb2xlLmxvZyBmYXJCYWNrZ3JvdW5kXG5cdFx0IyBAcm9vdC5hZGQgZmFyQmFja2dyb3VuZFxuXHRcdFxuXHRcdCMgYmFja2dyb3VuZCA9IEBsb2FkVGlsZUxheWVyKGRhdGEubGF5ZXJzWzFdKVxuXHRcdCMgYmFja2dyb3VuZC5wb3NpdGlvbi55ID0gNy41XG5cdFx0IyBjb25zb2xlLmxvZyBiYWNrZ3JvdW5kXG5cdFx0IyBAcm9vdC5hZGQgYmFja2dyb3VuZFxuXG5cblx0XHQjICMgbG9hZCBvYmplY3RzXG5cdFx0IyBmb3IgbyBpbiBkYXRhLmxheWVyc1syXS5vYmplY3RzIFxuXHRcdCMgXHRlbmVteSA9IG5ldyBFbmVtaWVzW28udHlwZV0obmV3IFRIUkVFLlZlY3RvcjMoby54IC8gMzIsIDcgLSBvLnkgLyAzMiwgdXRpbC5yYW5kb20oLTEsIDEpKSlcblx0XHQjIFx0ZW5lbXkuYWN0aXZlID0gZmFsc2Vcblx0XHQjIFx0QGFkZCBlbmVteVxuXG5cblx0bG9hZFRpbGVMYXllcjogKGRhdGEpPT5cblx0XHRsYXllciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0Zm9yIGlkLCBpbmRleCBpbiBkYXRhLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gZGF0YS53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBkYXRhLndpZHRoXG5cdFx0XHRcdHRpbGVPYmplY3QgPSBuZXcgVGlsZU9iamVjdChAdGlsZXNbaWRdLCBuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIC1yb3cgLSAxLCAwKSApXG5cdFx0XHRcdGxheWVyLmFkZCB0aWxlT2JqZWN0LnJvb3RcdFxuXHRcdHJldHVybiBsYXllclxuXG5cdFxuXG5cbiMgcmVwcmVzZW50cyBhIFRpbGVTZXQgaW4gYSBUaWxlZCBFZGl0b3IgbGV2ZWxcbmNsYXNzIFRpbGVTZXRcblx0Y29uc3RydWN0b3I6IChAZGF0YSktPlxuXHRcdEBjb2xzID0gQGRhdGEuaW1hZ2V3aWR0aCAvIEBkYXRhLnRpbGV3aWR0aFxuXHRcdEByb3dzID0gQGRhdGEuaW1hZ2VoZWlnaHQgLyBAZGF0YS50aWxlaGVpZ2h0XG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzLyN7QGRhdGEuaW1hZ2V9XCJcblx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhUZXN0OiB0cnVlXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblxuIyBSZXByZXNlbnRzIHRoZSBAZ2VvbWV0cnkgYW5kIEBtYXRlcmlhbCBvZiBhIHRpbGUgbG9hZGVkIGZyb20gYSBUaWxlZCBFZGl0b3IgbGV2ZWxcbmNsYXNzIFRpbGVcblx0Y29uc3RydWN0b3I6IChAdGlsZVNldCwgQHJvdywgQGNvbCktPlxuXHRcdCMgdG9kbywgcHJvYmFibHkgYmUgcHJldHRpZXIgdG8ganVzdCBtYWtlIHRoaXMgZnJvbSBzY3JhdGNoXG5cdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIEB0aWxlU2V0LmRhdGEudGlsZXdpZHRoIC8gMzIsIEB0aWxlU2V0LmRhdGEudGlsZWhlaWdodCAvIDMyKVxuXHRcdFxuXHRcdCMgUmVwb3NpdGlvbiB2ZXJ0aWNlcyB0byBsb3dlciBsZWZ0IGF0IDAsMCBcblx0XHRmb3IgdiBpbiBAZ2VvbWV0cnkudmVydGljZXNcblx0XHRcdHYueCArPSBAdGlsZVNldC5kYXRhLnRpbGV3aWR0aCAvIDMyIC8gMlxuXHRcdFx0di55ICs9IEB0aWxlU2V0LmRhdGEudGlsZWhlaWdodCAvIDMyIC8gMlxuXHRcdEBnZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlXG5cblx0XHQjIGNhbGMgYW5kIHNldCB1dnNcblx0XHR1dldpZHRoID0gQHRpbGVTZXQuZGF0YS50aWxld2lkdGgvQHRpbGVTZXQuZGF0YS5pbWFnZXdpZHRoXG5cdFx0dXZIZWlnaHQgPSBAdGlsZVNldC5kYXRhLnRpbGVoZWlnaHQvQHRpbGVTZXQuZGF0YS5pbWFnZWhlaWdodFxuXG5cdFx0dXZYID0gdXZXaWR0aCAqIEBjb2xcblx0XHR1dlkgPSB1dkhlaWdodCAqIChAdGlsZVNldC5yb3dzIC0gQHJvdyAtIDEpXG5cdFx0Zm9yIGZhY2UgaW4gQGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1cblx0XHRcdGZvciB2IGluIGZhY2Vcblx0XHRcdFx0aWYgdi54ID09IDBcblx0XHRcdFx0XHR2LnggPSB1dlhcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHYueCA9IHV2WCArIHV2V2lkdGggIyAqICgzMS41LzMyLjApICMgdG9kbyBkaXJ0eSBoYWNrIHRvIHByZXZlbnQgc2xpZ2h0IG92ZXJzYW1wbGUgb24gdGlsZSBzaG93aW5nIGhpbnQgb2YgbmV4dCB0aWxlIG9uIGVkZ2UuXG5cblx0XHRcdFx0aWYgdi55ID09IDBcblx0XHRcdFx0XHR2LnkgPSB1dllcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHYueSA9IHV2WSArIHV2SGVpZ2h0ICMgKiAoMzEuNS8zMi4wKSAjIHRvZG8gZGlydHkgaGFjayB0byBwcmV2ZW50IHNsaWdodCBvdmVyc2FtcGxlIG9uIHRpbGUgc2hvd2luZyBoaW50IG9mIG5leHQgdGlsZSBvbiBlZGdlLlx0XHRcdFx0XHRcblx0XHRAZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWVcblxuXHRcdEBtYXRlcmlhbCA9IEB0aWxlU2V0Lm1hdGVyaWFsXG5cblx0XHRcblxuIyBSZXByZXNlbnRzIGEgVGlsZUxheWVyIGluIHRoZSBUaWxlZCBFZGl0b3IgZmlsZS4gXG5jbGFzcyBUaWxlTGF5ZXJcblx0Y29uc3RydWN0b3I6IChtYXAsIEBkYXRhKS0+XG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdGZvciBpZCwgaW5kZXggaW4gQGRhdGEuZGF0YVxuXHRcdFx0aWYgaWQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaW5kZXggLyBkYXRhLndpZHRoKVxuXHRcdFx0XHRjb2wgPSBpbmRleCAlIGRhdGEud2lkdGhcblx0XHRcdFx0IyBjb25zb2xlLmxvZyAgXCJ0aWxlXCIsIG1hcCwgbWFwLnRpbGVzW2lkXVxuXHRcdFx0XHR0aWxlT2JqZWN0ID0gbmV3IFRpbGVPYmplY3QobWFwLnRpbGVzW2lkXSwgbmV3IFRIUkVFLlZlY3RvcjMoY29sLCAtcm93IC0gMSwgMCkgKVxuXHRcdFx0XHRAcm9vdC5hZGQgdGlsZU9iamVjdC5tZXNoXHRcblx0XHRcblxuIyBSZXByZXNlbnRzIGFuIGluc3RhbmNlIG9mIGEgdGlsZSB0byBiZSByZW5kZXJlZFxuY2xhc3MgVGlsZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKHRpbGUsIHBvc2l0aW9uKS0+XG5cdFx0QG1lc2ggPSBuZXcgVEhSRUUuTWVzaCB0aWxlLmdlb21ldHJ5LCB0aWxlLm1hdGVyaWFsXG5cdFx0QG1lc2gucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XG5cbmNsYXNzIE9iamVjdEdyb3VwXG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRjb25zb2xlLmxvZyBAZGF0YVxuXHRcdEBvYmplY3RzID0gW11cblx0XHRmb3Igb2JqZWN0RGF0YSBpbiBAZGF0YS5vYmplY3RzIFxuXHRcdFx0ZW5lbXkgPSBuZXcgRW5lbWllc1tvYmplY3REYXRhLnR5cGVdKG5ldyBUSFJFRS5WZWN0b3IzKG9iamVjdERhdGEueCAvIDMyLCA3IC0gb2JqZWN0RGF0YS55IC8gMzIsIDApKVxuXHRcdFx0QG9iamVjdHMucHVzaCBlbmVteVxuIiwiU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5cbmNsYXNzIGV4cG9ydHMuQnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0LnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpXG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHN1cGVyKHRhcmdldClcblx0XHRTY29yZS5hZGQoMSlcblx0XHRAZGllKClcblx0XHRmb3IgaSBpbiBbMC4uNV1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMSlcblxuXG5jbGFzcyBleHBvcnRzLkVuZW15QnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0XzIucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSlcblx0XG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMjAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBidWxsZXRHZW9tZXRyeSwgYnVsbGV0TWF0ZXJpYWxcblxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0XHRAY29sbGlkZXJUeXBlID0gXCJidWxsZXRcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteVwiXG5cdFx0QGFuZ2xlID0gMFxuXHRcdEBzcGVlZCA9IDE1XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IE1hdGguY29zKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBNYXRoLnNpbihAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnJvdGF0aW9uLnogPSBAYW5nbGVcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5cblx0Y29sbGlkZUludG86ICh0YXJnZXQpLT5cblx0XHRzdXBlcih0YXJnZXQpXG5cdFx0U2NvcmUuYWRkKDEpXG5cdFx0QGRpZSgpXG5cdFx0Zm9yIGkgaW4gWzAuLjVdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDEpXG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuSW5wdXQgPSByZXF1aXJlICcuL0lucHV0LmNvZmZlZSdcblxuY2xhc3MgV29ybGQgZXh0ZW5kcyBCYXNlXG5cdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRzdXBlcigpXG5cblx0XHR3ID0gNjQwXG5cdFx0aCA9IDQ4MFxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIHcgLyBoLCAxLCAxMDAwMClcblx0XHRmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuXG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdGFyZ2V0WlxuXHRcdFxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0XG5cdFx0QHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKVxuXHRcdEByZW5kZXJlci5zZXRTaXplIHcsIGhcblx0XHQjIEByZW5kZXJlci5zb3J0T2JqZWN0cyA9IGZhbHNlXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG5cblx0XHRcblx0XHRAd29ybGRUZXh0dXJlID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0IHcsIGgsIFxuXHRcdFx0bWluRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdG1hZ0ZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyXG5cdFx0XHRmb3JtYXQ6IFRIUkVFLlJHQkZvcm1hdFxuXHRcdFxuXG5cdFx0QHByb2Nlc3NNYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbFxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IGZhbHNlXG5cdFx0XHR1bmlmb3JtczogXG5cdFx0XHRcdFwidERpZmZ1c2VcIjogeyB0eXBlOiBcInRcIiwgdmFsdWU6IEB3b3JsZFRleHR1cmUgfVxuXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR2YXJ5aW5nIHZlYzIgdlV2O1xuXG5cdFx0XHRcdHZvaWQgbWFpbigpIHtcblx0XHRcdFx0XHR2VXYgPSB1djtcblx0XHRcdFx0XHRnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdGZyYWdtZW50U2hhZGVyOlxuXHRcdFx0XHRcIlwiXCJcblx0XHRcdFx0dW5pZm9ybSBzYW1wbGVyMkQgdERpZmZ1c2U7XG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdC8vIHJlYWQgdGhlIGlucHV0IGNvbG9yXG5cblx0XHRcdFx0XHR2ZWM0IG87XG5cdFx0XHRcdFx0dmVjNCBjO1xuXHRcdFx0XHRcdGMgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcblx0XHRcdFx0XHQvL28gPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcblxuXHRcdFx0XHRcdC8vbWlzYWxpZ24gcmdiXG5cdFx0XHRcdFx0by5yID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIC0wLjAwMSkgKS5yO1xuXHRcdFx0XHRcdG8uZyA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiArIHZlYzIoMC4wLCAwLjAwMSkgKS5yO1xuXHRcdFx0XHRcdG8uYiA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiArIHZlYzIoMC4wLCAwLjAwMykgKS5yO1xuXG5cdFx0XHRcdFx0Ly9zY2FubGluZXNcblx0XHRcdFx0XHRvLnIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIDEuMDtcblx0XHRcdFx0XHRvLmcgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIDEuMDtcblx0XHRcdFx0XHRvLmIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIDEuMDtcblxuXHRcdFx0XHRcdG8gKj0gMC41ICsgMS4wKjE2LjAqdlV2LngqdlV2LnkqKDEuMC12VXYueCkqKDEuMC12VXYueSk7XG5cdFx0XHRcdFx0XG5cblx0XHRcdFx0XHQvLyBzZXQgdGhlIG91dHB1dCBjb2xvclxuXHRcdFx0XHRcdGdsX0ZyYWdDb2xvciA9IG8gKiAuNSArIGMgKiAuNTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdEBwcm9jZXNzU2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdEBwcm9jZXNzQ2FtZXJhID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYSgtLjUsIC41LCAtLjUgLCAuNSwgMCwgMSlcblx0XHRAcHJvY2Vzc0NhbWVyYS5wb3NpdGlvbi56ID0gMFxuXHRcdEBwcm9jZXNzU2NlbmUuYWRkIEBwcm9jZXNzQ2FtZXJhXG5cdFx0QHByb2Nlc3NRdWFkID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxICksIEBwcm9jZXNzTWF0ZXJpYWwgKTtcblx0XHRAcHJvY2Vzc1F1YWQucm90YXRpb24ueCA9IE1hdGguUElcblx0XHRAcHJvY2Vzc1NjZW5lLmFkZCBAcHJvY2Vzc1F1YWRcblxuXG5cblxuXHRcdEBjbG9jayA9IG5ldyBUSFJFRS5DbG9jaygpXG5cdFx0QHN0YXRzID0gbmV3IFN0YXRzKCk7XG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCdcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkKCBAc3RhdHMuZG9tRWxlbWVudCApXG5cblx0XHRyZXR1cm4gdGhpc1xuXG5cdGFuaW1hdGU6ID0+XG5cdFx0ZGVsdGEgPSBAY2xvY2suZ2V0RGVsdGEoKVx0XHRcblx0XHQjZG9uJ3QgdXBkYXRlIGFmdGVyIGxvbmcgZnJhbWUgKGZpeGVzIGlzc3VlIHdpdGggc3dpdGNoaW5nIHRhYnMpXG5cdFx0aWYgKGRlbHRhIDwgLjUpIFxuXHRcdFx0QHRyaWdnZXIgXCJ1cGRhdGVcIiwgZGVsdGFcblxuXHRcdEByZW5kZXJlci5yZW5kZXIoIEBzY2VuZSwgQGNhbWVyYSwgQHdvcmxkVGV4dHVyZSwgdHJ1ZSApO1xuXG5cblx0XHRAcmVuZGVyZXIucmVuZGVyIEBwcm9jZXNzU2NlbmUsIEBwcm9jZXNzQ2FtZXJhXG5cblx0XHRAc3RhdHMudXBkYXRlKClcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGVcblx0XHRyZXR1cm5cblxuXHRzdGFydDogLT5cblx0XHRAYW5pbWF0ZSgpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkXG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cbldvcmxkID0gcmVxdWlyZSAnLi9Xb3JsZC5jb2ZmZWUnXG5HYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBsYXllciA9IHJlcXVpcmUgJy4vUGxheWVyLmNvZmZlZSdcbkVuZW1pZXMgPSByZXF1aXJlICcuL0VuZW1pZXMuY29mZmVlJ1xuXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcblxuVGlsZWQgPSByZXF1aXJlICcuL1RpbGVkLmNvZmZlZSdcblxuY2xhc3MgTGV2ZWwgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoQHdvcmxkKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0QGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuXHRcdEByb290LmFkZChAYW1iaWVudExpZ2h0KVxuXG5cdFx0QHBsYXllcjEgPSBuZXcgUGxheWVyKClcblx0XHRAYWRkIEBwbGF5ZXIxXG5cblx0XHRcblx0XHRtYXBQcm9taXNlID0gVGlsZWQubG9hZCgnYXNzZXRzL2xldmVsXzEuanNvbicpXG5cdFx0cmVhZHlQcm9taXNlID0gbWFwUHJvbWlzZS50aGVuIChtYXApPT5cblx0XHRcdEByb290LmFkZChtYXAubGF5ZXJzLmJhY2tncm91bmQucm9vdClcblx0XHRcdG1hcC5sYXllcnMuYmFja2dyb3VuZC5yb290LnBvc2l0aW9uLnkgPSA3LjVcblxuXHRcdFx0QHJvb3QuYWRkKG1hcC5sYXllcnMubWlkZ3JvdW5kLnJvb3QpXG5cdFx0XHRtYXAubGF5ZXJzLm1pZGdyb3VuZC5yb290LnBvc2l0aW9uLnkgPSA3LjVcblxuXHRcdFx0Zm9yIG9iamVjdCBpbiBtYXAubGF5ZXJzLmVuZW1pZXMub2JqZWN0c1xuXHRcdFx0XHRAYWRkIG9iamVjdFxuXG5cdFx0XG5cdFx0cmVhZHlQcm9taXNlLmNhdGNoIChlcnJvciktPlxuXHRcdFx0Y29uc29sZS5lcnJvciBlcnJvclxuXHRcdFxuXHRcdFx0XG5cdFxuXHRcdFxuXG5cblx0XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlID09IGZhbHNlIGFuZCBjaGlsZC5yb290LnBvc2l0aW9uLnggPCBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKyAxMFxuXHRcdFx0XHRjaGlsZC5hY3RpdmF0ZSgpXG5cblx0XHRAY29sbGlzaW9ucygpXG5cblx0XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKTtcblxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cdGNvbGxpc2lvbnM6ICgpLT5cblx0XHRmb3IgYSBpbiBAY29sbGlkZXJzXG5cdFx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0XHRmb3IgYiBpbiBAY29sbGlkZXJzXG5cdFx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRcdGlmIGEuY29sbGlkZXJIaXRUeXBlcy5pbmRleE9mKGIuY29sbGlkZXJUeXBlKSA+IC0xXG5cdFx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVJbnRvIGJcblxuXHR0ZXN0Q29sbGlzaW9uOiAoYSwgYiktPlxuXHRcdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IGEuY29sbGlzaW9uUmFkaXVzICsgYi5jb2xsaXNpb25SYWRpdXNcblxuXG5cbmNsYXNzIEhvbWVTY3JlZW4gZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3NjcmVlbnMvdGl0bGUucG5nXCJcblx0bWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0Z2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMjAsIDE1KVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG5cbmNsYXNzIEdhbWVPdmVyU2NyZWVuIGV4dGVuZHMgR2FtZU9iamVjdFxuXHR0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9zY3JlZW5zL2dhbWVfb3Zlci5wbmdcIlxuXHRtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAyMCwgMTUpXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBnZW9tZXRyeSwgbWF0ZXJpYWxcblxuXG5cbmNsYXNzIEdhbWVcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHQjc2V0dXAgd29ybGRcblx0XHRAd29ybGQgPSBuZXcgV29ybGQoKVxuXHRcdEBob21lU2NyZWVuID0gbmV3IEhvbWVTY3JlZW4oKVxuXHRcdEBnYW1lT3ZlclNjcmVlbiA9IG5ldyBHYW1lT3ZlclNjcmVlbigpXG5cdFx0QGxvYWRMZXZlbCgpXG5cdFx0QGxpdmVzID0gM1xuXG5cdFx0U2NvcmUuZGlzcGxheUVsZW1lbnQgPSAkKFwiXCJcIjxoMT5TY29yZTo8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdEBsaXZlc0VsZW1lbnQgPSAkKFwiXCJcIjxoMT5MaXZlczo8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdFxuXHRcdFxuXHRcdEBzdGF0ZSA9IFwiaG9tZVwiXG5cdFx0QHdvcmxkLnNjZW5lLmFkZCBAaG9tZVNjcmVlbi5yb290XG5cblxuXHRcdCQod2luZG93KS5rZXlkb3duIChlKT0+XG5cdFx0XHRpZiBAc3RhdGUgPT0gXCJob21lXCJcblx0XHRcdFx0QHdvcmxkLnNjZW5lLnJlbW92ZSBAaG9tZVNjcmVlbi5yb290XG5cdFx0XHRcdEBzdGF0ZSA9IFwicGxheVwiXG5cdFx0XHRcdEBzdGFydExldmVsKClcblx0XHRcdFx0cmV0dXJuXG5cblx0XHRcdGlmIEBzdGF0ZSA9PSBcImdhbWVfb3ZlclwiXG5cdFx0XHRcdEB3b3JsZC5zY2VuZS5yZW1vdmUgQGdhbWVPdmVyU2NyZWVuLnJvb3Rcblx0XHRcdFx0QHdvcmxkLnNjZW5lLmFkZCBAaG9tZVNjcmVlbi5yb290XG5cdFx0XHRcdEBzdGF0ZSA9IFwiaG9tZVwiXG5cdFx0XHRcdHJldHVyblxuXG5cdFx0dXRpbC5hZnRlciAxLCAoKT0+XG5cdFx0XHRAd29ybGQuc3RhcnQoKVxuXG5cdGxvYWRMZXZlbDogKCktPlxuXHRcdEB3b3JsZC5jYW1lcmEucG9zaXRpb24ueCA9IDA7XG5cdFx0QGxldmVsID0gbmV3IExldmVsKEB3b3JsZClcblx0XG5cdHN0YXJ0TGV2ZWw6ICgpLT5cblx0XHRAd29ybGQuc2NlbmUuYWRkIEBsZXZlbC5yb290XG5cdFx0QHdvcmxkLm9uIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblx0XHRcblx0cmVzZXRQbGF5ZXI6ICgpPT5cblx0XHRAbGl2ZXMtLVxuXHRcdEBsaXZlc0VsZW1lbnQudGV4dCBcIkxpdmVzOiAje0BsaXZlc31cIlxuXG5cdFx0aWYgQGxpdmVzID4gMFxuXHRcdFx0QGxldmVsLnBsYXllcjEgPSBuZXcgUGxheWVyKClcblx0XHRcdEBsZXZlbC5wbGF5ZXIxLnJvb3QucG9zaXRpb24ueCA9IEB3b3JsZC5jYW1lcmEucG9zaXRpb24ueFxuXHRcdFx0QGxldmVsLmFkZCBAbGV2ZWwucGxheWVyMVxuXHRcdGVsc2Vcblx0XHRcdHV0aWwuYWZ0ZXIgMjAwMCwgQGdhbWVPdmVyXG5cblx0Z2FtZU92ZXI6ICgpPT5cblx0XHRjb25zb2xlLmxvZyBcImdhbWUgb3ZlclwiXG5cdFx0XG5cdFx0QHdvcmxkLnNjZW5lLnJlbW92ZSBAbGV2ZWwucm9vdFxuXHRcdEB3b3JsZC5vZmYgXCJ1cGRhdGVcIiwgQGxldmVsLnVwZGF0ZVxuXG5cdFx0QGxvYWRMZXZlbCgpXG5cdFx0QHdvcmxkLnNjZW5lLmFkZCBAZ2FtZU92ZXJTY3JlZW4ucm9vdFxuXHRcdEBzdGF0ZSA9IFwiZ2FtZV9vdmVyXCJcblxuXG5tb2R1bGUuZXhwb3J0cy5nYW1lID0gZ2FtZSA9IG5ldyBHYW1lKClcblxuXHRcdFxuXG4jIG1vZGVsTG9hZGVyID0gbmV3IGNvcmUuTW9kZWxMb2FkZXIoKVxuXG5cblx0XHRcdFxuXG5cbiIsImV4cG9ydHMuYWZ0ZXIgPSAoZGVsYXksIGZ1bmMpLT5cblx0c2V0VGltZW91dCBmdW5jLCBkZWxheVxuXG5leHBvcnRzLnJhbmRvbSA9IChtaW4sIG1heCktPlxuXHRyZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuIl19
