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
var ObjectGroup, Tile, TileLayer, TileObject, TileSet, TiledMap, load,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
        this.layers[layerData.name] = new ObjectGroup(this, layerData);
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
          v.x = uvX + uvWidth * (31.5 / 32.0);
        }
        if (v.y === 0) {
          v.y = uvY;
        } else {
          v.y = uvY + uvHeight * (31.5 / 32.0);
        }
      }
    }
    this.geometry.uvsNeedUpdate = true;
    console.log("geo", this.geometry.faceVertexUvs[0]);
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
    this.data = data;
  }

  return ObjectGroup;

})();


},{}],13:[function(require,module,exports){
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
    var mapPromise;
    this.world = world;
    Level.__super__.constructor.call(this);
    this.colliders = [];
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.root.add(this.ambientLight);
    this.player1 = new Player();
    this.add(this.player1);
    mapPromise = Tiled.load('assets/level_1.json');
    mapPromise.then((function(_this) {
      return function(map) {
        map.layers.background.root.position.y = 7.5;
        _this.root.add(map.layers.background.root);
        map.layers.midground.root.position.y = 7.5;
        return _this.root.add(map.layers.midground.root);
      };
    })(this));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvVGlsZWQuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9XZWFwb25zLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV29ybGQuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9zaHVtcC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxrQkFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHNCQUFSLENBQVIsQ0FBQTs7QUFBQSxDQUVBLENBQUUsYUFBRixDQUFnQixDQUFDLEtBQWpCLENBQXVCLFNBQUEsR0FBQTtBQUV0QixNQUFBLHNFQUFBO0FBQUEsRUFBQSxDQUFBLENBQUUsUUFBRixDQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsdUJBQWYsQ0FBdUMsT0FBTyxDQUFDLG9CQUEvQyxDQUFBLENBQUE7QUFBQSxFQUVBLE1BQUEsR0FBUyxDQUFBLENBQUUsZUFBRixDQUZULENBQUE7QUFBQSxFQUdBLFlBQUEsR0FBZSxNQUFNLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsTUFBTSxDQUFDLE1BQVAsQ0FBQSxDQUhoQyxDQUFBO0FBQUEsRUFLQSxjQUFBLEdBQWlCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FMakIsQ0FBQTtBQUFBLEVBTUEsZUFBQSxHQUFrQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBTmxCLENBQUE7QUFBQSxFQU9BLGVB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QUFLLENBQUMsS0FBSyxDQUFDLE1BQWIsQ0FBb0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUEzQixDQUZBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsRUFBcUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUE1QixDQUhBLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FMQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBakMsQ0FOQSxDQUFBO1dBT0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxZQVJBO0VBQUEsQ0FuRFYsQ0FBQTs7Y0FBQTs7SUFySEQsQ0FBQTs7QUFBQSxNQW1MTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBQSxDQW5MakMsQ0FBQTs7OztBQ0FBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtTQUNmLFVBQUEsQ0FBVyxJQUFYLEVBQWlCLEtBQWpCLEVBRGU7QUFBQSxDQUFoQixDQUFBOztBQUFBLE9BR08sQ0FBQyxNQUFSLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEdBQU4sR0FBQTtBQUNoQixTQUFPLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLEdBQUEsR0FBTSxHQUFQLENBQWhCLEdBQThCLEdBQXJDLENBRGdCO0FBQUEsQ0FIakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwic2h1bXAgPSByZXF1aXJlKCcuL3NodW1wL3NodW1wLmNvZmZlZScpXG5cbiQoXCIjZnVsbHNjcmVlblwiKS5jbGljayAoKS0+XG5cdFxuXHQkKFwiI3NodW1wXCIpWzBdLndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuKEVsZW1lbnQuQUxMT1dfS0VZQk9BUkRfSU5QVVQpO1xuXHRcblx0Y2FudmFzID0gJChcIiNzaHVtcCBjYW52YXNcIilcblx0Y2FudmFzQXNwZWN0ID0gY2FudmFzLndpZHRoKCkgLyBjYW52YXMuaGVpZ2h0KClcblxuXHRjb250YWluZXJXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG5cdGNvbnRhaW5lckhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKVxuXHRjb250YWluZXJBc3BlY3QgPSBjb250YWluZXJXaWR0aCAvIGNvbnRhaW5lckhlaWdodFxuXHRjb25zb2xlLmxvZyBjYW52YXNBc3BlY3QsICQod2luZG93KS53aWR0aCgpICwgJCh3aW5kb3cpLmhlaWdodCgpLCBjb250YWluZXJBc3BlY3Rcblx0XG5cdGlmIGNhbnZhc0FzcGVjdCA8IGNvbnRhaW5lckFzcGVjdFxuXHRcdGNvbnNvbGUubG9nIFwibWF0Y2ggaGVpZ2h0XCJcblx0XHRjYW52YXMuaGVpZ2h0IGNvbnRhaW5lckhlaWdodFxuXHRcdGNhbnZhcy53aWR0aCBjb250YWluZXJIZWlnaHQgKiBjYW52YXNBc3BlY3Rcblx0ZWxzZVxuXHRcdGNvbnNvbGUubG9nIFwibWF0Y2ggd2lkdGhcIlxuXHRcdGNhbnZhcy53aWR0aCBjb250YWluZXJXaWR0aFxuXHRcdGNhbnZhcy5oZWlnaHQgY29udGFpbmVyV2lkdGggLyBjYW52YXNBc3BlY3RcblxuJChcIiNkZWJ1Z1wiKS5hcHBlbmQoXCJcIlwiPHNwYW4gaWQ9XCJsZXZlbENoaWxkcmVuXCI+XCJcIlwiKVxuXG5cbnVwZGF0ZURlYnVnID0gKCktPlxuXHQkKFwiI2xldmVsQ2hpbGRyZW5cIikudGV4dCBcIlwiXCJsZXZlbC5jaGlsZHJlbiA9ICN7c2h1bXAuZ2FtZS5sZXZlbC5jaGlsZHJlbi5sZW5ndGh9XCJcIlwiXG5cblxuc2h1bXAuZ2FtZS53b3JsZC5vbiBcInVwZGF0ZVwiLCB1cGRhdGVEZWJ1Z1xuXG5cblxuIyBjb25zb2xlLmxvZyBcImhpZGVyYVwiXG5cblxuIiwiY2xhc3MgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBfZXZlbnRzID0ge31cblxuXHRvbjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdChAX2V2ZW50c1tldmVudF0gPz0gW10pLnB1c2ggaGFuZGxlclxuXHRcdHJldHVybiB0aGlzXG5cblx0b2ZmOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0Zm9yIHN1c3BlY3QsIGluZGV4IGluIEBfZXZlbnRzW2V2ZW50XSB3aGVuIHN1c3BlY3QgaXMgaGFuZGxlclxuXHRcdFx0QF9ldmVudHNbZXZlbnRdLnNwbGljZSBpbmRleCwgMVxuXHRcdHJldHVybiB0aGlzXG5cblx0dHJpZ2dlcjogKGV2ZW50LCBhcmdzLi4uKSA9PlxuXHRcdHJldHVybiB0aGlzIHVubGVzcyBAX2V2ZW50c1tldmVudF0/XG5cdFx0Zm9yIGkgaW4gW0BfZXZlbnRzW2V2ZW50XS5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGhhbmRsZXIgPSBAX2V2ZW50c1tldmVudF1baV1cblx0XHRcdGhhbmRsZXIuYXBwbHkgdGhpcywgYXJnc1xuXHRcdHJldHVybiB0aGlzXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5cbmNsYXNzIENvbGxpc2lvbk9iamVjdCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IHVuZGVmaW5lZFxuXHRcdEBjb2xsaWRlckhpdFR5cGVzID0gW11cblx0XHRAaHAgPSAxXG5cdFx0QGRwID0gMVxuXHRcdEBjb2xsaXNpb25SYWRpdXMgPSAuNlxuXG5cdGNvbGxpZGVJbnRvOiAodGFyZ2V0KS0+XG5cdFx0dGFyZ2V0LnRha2VEYW1hZ2UoQGRwKVxuXHRcdCMgQGRpZSgpXG5cdFx0IyBnYW1lT2JqZWN0LmRpZSgpXG5cblx0dGFrZURhbWFnZTogKGRhbWFnZSktPlxuXHRcdEBocCAtPSBkYW1hZ2Vcblx0XHRpZiBAaHAgPD0gMCBcblx0XHRcdEBkaWUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvbk9iamVjdFxuIiwiXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcbldlYXBvbnMgPSByZXF1aXJlICcuL1dlYXBvbnMuY29mZmVlJ1xuXG5cbmNsYXNzIEJhc2ljIGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGVuZW15VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvZW5lbWllcy9lbmVteS5wbmdcIlxuXHRlbmVteU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGVuZW15VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRlbmVteUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiZW5lbXlcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJwbGF5ZXJcIlxuXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGVuZW15R2VvbWV0cnksIGVuZW15TWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXHRcdEBhZ2UgPSAwXG5cdFx0QGhhc0ZpcmVkID0gZmFsc2VcblxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QGFnZSArPSBkZWx0YVxuXHRcdFxuXHRcblx0ZGllOiAoKS0+XG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDMpXG5cdFx0c3VwZXIoKVxuXG5cbmNsYXNzIFNpbldhdmUgZXh0ZW5kcyBCYXNpY1xuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVx0XHRcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0xICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IGRlbHRhICogTWF0aC5zaW4oQGFnZSlcblxuY2xhc3MgRGFydCBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdGlmIEBhZ2UgPCAuNVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSAtMjAgKiBkZWx0YVxuXHRcdGVsc2UgaWYgQGFnZSA8IDNcblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gNSAqIGRlbHRhXG5cdFx0ZWxzZVxuXHRcdFx0QGRpZSgpXG5cblx0XHRpZiBAYWdlID4gMSBhbmQgbm90IEBoYXNGaXJlZFxuXHRcdFx0QGhhc0ZpcmVkID0gdHJ1ZVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblxuXHRmaXJlX3ByaW1hcnk6ICgpLT5cblx0XG5cdFx0U291bmQucGxheSgnc2hvb3QnKVxuXHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5FbmVteUJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJIC0gLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KEByb290LnBvc2l0aW9uKVxuXG5cdFx0YnVsbGV0LmNvbGxpZGVyVHlwZSA9IFwiZW5lbXlfYnVsbGV0XCJcblx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUEkgKyAuMjVcblx0XHRidWxsZXQuc3BlZWQgPSA1XG5cblx0XHRAcGFyZW50LmFkZCBidWxsZXRcdFxuXG5cbmV4cG9ydHMuQmFzaWMgPSBCYXNpY1xuZXhwb3J0cy5TaW5XYXZlID0gU2luV2F2ZVxuZXhwb3J0cy5EYXJ0ID0gRGFydFxuXG4jIHN1cGVyKGRlbHRhKVxuXHRcdCMgaWYgQGFnZSA8IDFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnkgKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMi4xXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gNSAqIGRlbHRhXG5cdFx0IyBlbHNlXG5cdFx0IyBcdEBkaWUoKVxuIiwiY2xhc3MgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAcGFyZW50ID0gdW5kZWZpbmVkXG5cdFx0QGNoaWxkcmVuID0gW11cblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0QGRlYWQgPSBmYWxzZVxuXHRcdEBhY3RpdmUgPSB0cnVlXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRmb3IgaSBpbiBbQGNoaWxkcmVuLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0Y2hpbGQgPSBAY2hpbGRyZW5baV1cblx0XHRcdGlmIGNoaWxkLmRlYWRcblx0XHRcdFx0QHJlbW92ZSBjaGlsZFxuXHRcdFx0XHRjb250aW51ZVxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlXG5cdFx0XHRcdGNoaWxkLnVwZGF0ZSBkZWx0YSBcblx0XG5cdGFjdGl2YXRlOiAoKS0+XG5cdFx0QGFjdGl2ZSA9IHRydWU7XG5cdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gdGhpc1xuXHRcdEBjaGlsZHJlbi5wdXNoKGdhbWVPYmplY3QpXG5cdFx0QHJvb3QuYWRkKGdhbWVPYmplY3Qucm9vdClcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRAcm9vdC5yZW1vdmUoZ2FtZU9iamVjdC5yb290KVxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gbnVsbFxuXHRcdGkgPSAgQGNoaWxkcmVuLmluZGV4T2YoZ2FtZU9iamVjdClcblx0XHRpZiBpID49IDBcblx0XHRcdEBjaGlsZHJlbi5zcGxpY2UoaSwgMSk7XG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRkaWU6ICgpLT5cblx0XHRAZGVhZCA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZU9iamVjdFxuIiwiY2xhc3MgSW5wdXRcblx0a2V5TWFwOiBcblx0XHRcIjM4XCI6XCJ1cFwiICN1cCBhcnJvd1xuXHRcdFwiODdcIjpcInVwXCIgI3dcblx0XHRcIjQwXCI6XCJkb3duXCIgI2Rvd24gYXJyb3dcblx0XHRcIjgzXCI6XCJkb3duXCIgI3Ncblx0XHRcIjM3XCI6XCJsZWZ0XCIgI2xlZnQgYXJyb3dcblx0XHRcIjY1XCI6XCJsZWZ0XCIgI2Fcblx0XHRcIjM5XCI6XCJyaWdodFwiICNyaWdodCBhcnJvd1xuXHRcdFwiNjhcIjpcInJpZ2h0XCIgI2Rcblx0XHRcIjMyXCI6XCJmaXJlX3ByaW1hcnlcIiAjc3BhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAa2V5U3RhdGVzID0gW11cblxuXHRcdGZvciBrZXksIHZhbHVlIG9mIEBrZXlNYXBcblx0XHRcdEBrZXlTdGF0ZXNbdmFsdWVdID0gZmFsc2U7XG5cblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0IyBjb25zb2xlLmxvZyBlLndoaWNoXG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSB0cnVlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0JCh3aW5kb3cpLmtleXVwIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSBmYWxzZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuaW5wdXQgPSBuZXcgSW5wdXQoKVxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dFxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKEBnZW9tZXRyeSwgQG1hdGVyaWFsKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBtYXRlcmlhbCA9IHVuZGVmaW5lZFxuXHRcdEBnZW9tZXRyeSA9IHVuZGVmaW5lZFxuXHRcdEB0ZXh0dXJlID0gdW5kZWZpbmVkXG5cdFx0QHN0YXR1cyA9IHVuZGVmaW5lZFxuXG5cdGxvYWQ6IChmaWxlTmFtZSk9PlxuXHRcdGpzb25Mb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpO1xuXHRcdGpzb25Mb2FkZXIubG9hZCBmaWxlTmFtZSwgKGdlb21ldHJ5LCBtYXRlcmlhbHMsIG90aGVycy4uLik9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwoIG1hdGVyaWFscyApXG5cdFx0XHQjIEBtYXRlcmlhbCA9IG1hdGVyaWFsc1swXVxuXHRcdFx0QGdlb21ldHJ5ID0gZ2VvbWV0cnlcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cblx0bG9hZFBuZzogKGZpbGVOYW1lKT0+XG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIGZpbGVOYW1lLCB7fSwgKCk9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRcdCMgdHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdFx0IyBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXHRcdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRcdCMgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkgMSwgMVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0I2NvbnNvbGUubG9nIFwibG9hZHBuZ1wiLCB0aGlzXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cblxuY2xhc3MgTW9kZWxMb2FkZXJcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAZGVmYXVsdEdlb21ldHJ5ID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSgxLDEsMSlcblx0XHRAZGVmYXVsdE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRjb2xvcjogMHgwMGZmMDBcblx0XHRcdHdpcmVmcmFtZTogdHJ1ZVxuXHRcdFx0bWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3V0aWwvd2hpdGUucG5nXCJcblxuXHRcdEBsb2FkZWRNb2RlbHMgPSB7fVxuXG5cdGxvYWQ6IChmaWxlTmFtZSktPlxuXG5cdFx0IyBpZiBhbHJlYWR5IGxvYWRlZCwganVzdCBtYWtlIHRoZSBuZXcgbWVzaCBhbmQgcmV0dXJuXG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0/ICYmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLnN0YXR1cyA9PSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImNhY2hlZFwiXG5cdFx0XHRyZXR1cm4gbmV3IFRIUkVFLk1lc2goQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uZ2VvbWV0cnksIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLm1hdGVyaWFsKVxuXG5cblx0XHQjIGlmIHJlcXVlc3RlZCBidXQgbm90IHJlYWR5XG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcdG1vZGVsID0gQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcblx0XHQjIGlmIG5vdCByZXF1ZXN0ZWQgYmVmb3JlXG5cdFx0ZWxzZVxuXHRcdFx0bW9kZWwgPSBuZXcgTW9kZWwoKVxuXHRcdFx0aWYgZmlsZU5hbWUuc3BsaXQoJy4nKS5wb3AoKSA9PSBcImpzXCJcblx0XHRcdFx0bW9kZWwubG9hZChmaWxlTmFtZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0bW9kZWwubG9hZFBuZyhmaWxlTmFtZSlcblx0XHRcdEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdID0gbW9kZWxcblxuXHRcdG9iamVjdCA9IG5ldyBUSFJFRS5NZXNoKCBAZGVmYXVsdEdlb21ldHJ5LCBAZGVmYXVsdE1hdGVyaWFsIClcblx0XHRtb2RlbC5vbiBcInN1Y2Nlc3NcIiwgKG0pLT5cblx0XHRcdG9iamVjdC5nZW9tZXRyeSA9IG0uZ2VvbWV0cnlcdFx0XHRcblx0XHRcdG9iamVjdC5tYXRlcmlhbCA9IG0ubWF0ZXJpYWxcblx0XHRcdG0ub2ZmIFwic3VjY2Vzc1wiLCBhcmd1bWVudHMuY2FsbGVlICNyZW1vdmUgdGhpcyBoYW5kbGVyIG9uY2UgdXNlZFxuXHRcdHJldHVybiBvYmplY3RcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbExvYWRlclxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG51dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cbmNsYXNzIFBhcnRpY2xlIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRwYXJ0aWNsZVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3BhcnRpY2xlcy9wYXJ0aWNsZTIucG5nXCJcblx0cGFydGljbGVNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBwYXJ0aWNsZVRleHR1cmVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXG5cdHBhcnRpY2xlR2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiwgZW5lcmd5KS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDEwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggcGFydGljbGVHZW9tZXRyeSwgcGFydGljbGVNYXRlcmlhbFxuXHRcdFxuXHRcdEB2ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSkpO1xuXHRcdEB2ZWxvY2l0eS5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcihlbmVyZ3kpXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEB2ZWxvY2l0eS5tdWx0aXBseVNjYWxhciguOTkpXG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBAdmVsb2NpdHkueCAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBAdmVsb2NpdHkueSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueiArPSBAdmVsb2NpdHkueiAqIGRlbHRhXG5cdFx0cyA9IDEtICgoRGF0ZS5ub3coKSAtIEBiaXJ0aCkgLyBAdGltZVRvTGl2ZSkgKyAuMDFcblx0XHRAcm9vdC5zY2FsZS5zZXQocywgcywgcylcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlXG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5Db2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5Nb2RlbExvYWRlciA9IHJlcXVpcmUgJy4vTW9kZWxMb2FkZXIuY29mZmVlJ1xuSW5wdXQgPSByZXF1aXJlICcuL0lucHV0LmNvZmZlZSdcbldlYXBvbnMgPSByZXF1aXJlICcuL1dlYXBvbnMuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcblNodW1wID0gcmVxdWlyZSAnLi9zaHVtcC5jb2ZmZWUnXG5cbm1vZGVsTG9hZGVyID0gbmV3IE1vZGVsTG9hZGVyKClcbiMgaW5wdXQgPSBuZXcgSW5wdXQoKVxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3RcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRcblx0XHRAY29sbGlkZXJUeXBlID0gXCJwbGF5ZXJcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteV9idWxsZXRcIlxuXG5cdFx0bW9kZWwgPSBtb2RlbExvYWRlci5sb2FkKFwiYXNzZXRzL3NoaXBzL3NoaXAyLmpzXCIpXG5cdFx0QHJvb3QuYWRkIG1vZGVsXG5cdFx0dXRpbC5hZnRlciAxMDAwLCAoKS0+XG5cdFx0XHRtb2RlbC5tYXRlcmlhbC5tYXRlcmlhbHNbMF0ud2lyZWZyYW1lID0gdHJ1ZVxuXHRcdFxuXHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRAaHAgPSAzXG5cblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGlmIElucHV0LmtleVN0YXRlc1sndXAnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1snZG93biddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55IC09IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydsZWZ0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ3JpZ2h0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ2ZpcmVfcHJpbWFyeSddXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXHRmaXJlX3ByaW1hcnk6ICgpLT5cblx0XHRpZiBEYXRlLm5vdygpID4gQGxhc3RGaXJlICsgMjQwICogMVxuXHRcdFx0U291bmQucGxheSgnc2hvb3QnKVxuXHRcdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdFx0XG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gLS4yNVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdGJ1bGxldC5hbmdsZSA9ICsuMjVcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXHRcdFx0IyBAcGFyZW50LmNvbGxpZGVycy5wdXNoIGJ1bGxldFxuXG5cdGRpZTogKCktPlxuXHRcdCMgY29uc29sZS5sb2cgXCJkaWVcIlxuXHRcdFxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgOClcblxuXHRcdHBvcyA9IEByb290LnBvc2l0aW9uXG5cdFx0cGFyZW50ID0gQHBhcmVudFxuXHRcdHV0aWwuYWZ0ZXIgMTAwMCwgKCktPlxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KHBvcylcblx0XHRcdGJ1bGxldC5ocCA9IDEwMFxuXHRcdFx0YnVsbGV0LmRwID0gMTBcblx0XHRcdGJ1bGxldC5jb2xsaXNpb25SYWRpdXMgPSAxNTBcblx0XHRcdHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHR1dGlsLmFmdGVyIDEyNTAsIFNodW1wLmdhbWUucmVzZXRQbGF5ZXJcblx0XHRzdXBlcigpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxuIiwiXG5zY29yZSA9IDBcbmV4cG9ydHMuZGlzcGxheUVsZW1lbnQgPSB1bmRlZmluZWRcblxuZXhwb3J0cy5hZGQgPSAocG9pbnRzKS0+XG5cdHNjb3JlICs9IHBvaW50c1xuXHQjIGNvbnNvbGUubG9nIGV4cG9ydHMuZGlzcGxheUVsZW1lbnRcblx0aWYgZXhwb3J0cy5kaXNwbGF5RWxlbWVudD9cblx0XHRleHBvcnRzLmRpc3BsYXlFbGVtZW50LnRleHQgXCJTY29yZTogI3tzY29yZX1cIlxuXG5leHBvcnRzLmdldCA9ICgpLT5cblx0cmV0dXJuIHNjb3JlXG4iLCJ3aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbmF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxuY2xhc3MgU291bmRcblx0Y29uc3RydWN0b3I6IChAbmFtZSwgQHVybCwgQGJ1ZmZlciktPlxuZXhwb3J0cy5Tb3VuZCA9IFNvdW5kXG5cbmV4cG9ydHMubG9hZGVkU291bmRzID0gbG9hZGVkU291bmRzID0ge31cblxuXG5leHBvcnRzLmxvYWQgPSBsb2FkID0gKG5hbWUsIHVybCkgLT5cblx0cmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0cmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cdFx0cmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwpXG5cdFx0cmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXHRcdHJlcXVlc3Qub25sb2FkID0gKGEsIGIsIGMpPT5cblx0XHRcdGlmIHJlcXVlc3Quc3RhdHVzID09IDIwMFxuXHRcdFx0XHRhdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhIHJlcXVlc3QucmVzcG9uc2UsIFxuXHRcdFx0XHRcdChidWZmZXIpPT5cblx0XHRcdFx0XHRcdCN0b2RvIGhhbmRsZSBkZWNvZGluZyBlcnJvclxuXHRcdFx0XHRcdFx0c291bmQgPSBuZXcgU291bmQobmFtZSwgdXJsLCBidWZmZXIpXG5cdFx0XHRcdFx0XHRleHBvcnRzLmxvYWRlZFNvdW5kc1tuYW1lXSA9IHNvdW5kXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzb2x2ZShzb3VuZClcblx0XHRcdFx0XHQsKGVycik9PlxuXHRcdFx0XHRcdFx0cmVqZWN0IEVycm9yKFwiRGVjb2RpbmcgRXJyb3JcIilcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y29uc29sZS5sb2cgIFwiU3RhdHVzXCJcblx0XHRcdFx0cmVqZWN0IEVycm9yKFwiU3RhdHVzIEVycm9yXCIpXG5cblx0XHRcdFx0XG5cdFx0cmVxdWVzdC5vbmVycm9yID0gKCktPlxuXHRcdFx0Y29uc29sZS5sb2cgXCJlcnJyXCJcblx0XHRcdHJlamVjdCBFcnJvcihcIk5ldHdvcmsgRXJyb3JcIikgXHRcblxuXHRcdHJlcXVlc3Quc2VuZCgpXG5cdFx0XHRcblxuZXhwb3J0cy5wbGF5ID0gcGxheSA9IChhcmcpLT5cblx0aWYgdHlwZW9mIGFyZyA9PSAnc3RyaW5nJ1xuXHRcdGJ1ZmZlciA9IGxvYWRlZFNvdW5kc1thcmddLmJ1ZmZlclxuXHRlbHNlIFxuXHRcdGJ1ZmZlciA9IGFyZ1xuXHRpZiBidWZmZXI/XG5cdFx0c291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG5cdFx0c291cmNlLmJ1ZmZlciA9IGJ1ZmZlclxuXHRcdHNvdXJjZS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbilcblx0XHRzb3VyY2Uuc3RhcnQoMClcblxuXG5hc3NldHNMb2FkaW5nID0gW11cbmFzc2V0c0xvYWRpbmcucHVzaCBsb2FkKCdzaG9vdCcsICdhc3NldHMvc291bmRzL3Nob290LndhdicpXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnZXhwbG9zaW9uJywgJ2Fzc2V0cy9zb3VuZHMvZXhwbG9zaW9uLndhdicpXG5cblByb21pc2UuYWxsKGFzc2V0c0xvYWRpbmcpXG4udGhlbiAocmVzdWx0cyktPlxuXHRjb25zb2xlLmxvZyBcIkxvYWRlZCBhbGwgU291bmRzIVwiLCByZXN1bHRzXG4uY2F0Y2ggKGVyciktPlxuXHRjb25zb2xlLmxvZyBcInVob2hcIiwgZXJyXG5cbiIsIlxuZXhwb3J0cy5sb2FkID0gbG9hZCA9ICh1cmwpIC0+XG5cdHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdGpxeGhyID0gJC5nZXRKU09OIHVybCwgQG9uTG9hZFxuXG5cdFx0anF4aHIuZG9uZSAoKS0+XG5cdFx0XHRsZXZlbCA9IG5ldyBUaWxlZE1hcChqcXhoci5yZXNwb25zZUpTT04pXG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShsZXZlbClcblxuXHRcdGpxeGhyLmZhaWwgKCktPlxuXHRcdFx0cmV0dXJuIHJlamVjdCBFcnJvcihcIlN0YXR1cyBFcnJvclwiKVxuXG5cbmNsYXNzIFRpbGVkTWFwXG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRAdGlsZVNldHMgPSBbXVxuXHRcdEB0aWxlcyA9IFtdXG5cdFx0QGxheWVycyA9IHt9XG5cblx0XHQjIGNyZWF0ZSB0aWxlU2V0cywgbG9hZCB0aGUgdGV4dHVyZXNcblx0XHRmb3IgdGlsZVNldERhdGEgaW4gZGF0YS50aWxlc2V0c1xuXHRcdFx0dGlsZVNldCA9IG5ldyBUaWxlU2V0IHRpbGVTZXREYXRhXG5cdFx0XHRAdGlsZVNldHMucHVzaCB0aWxlU2V0XG5cblx0XHQjIGNyZWF0ZSB0aWxlcyBAZ2VvbWV0ZXJ5IGFuZCBAbWF0ZXJpYWxcblx0XHRmb3IgdGlsZVNldCBpbiBAdGlsZVNldHNcblx0XHRcdGlkID0gdGlsZVNldC5kYXRhLmZpcnN0Z2lkXG5cdFx0XHRmb3Igcm93IGluIFswLi50aWxlU2V0LnJvd3MtMV1cblx0XHRcdFx0Zm9yIGNvbCBpbiBbMC4udGlsZVNldC5jb2xzLTFdXG5cdFx0XHRcdFx0dGlsZSA9IG5ldyBUaWxlIHRpbGVTZXQsIHJvdywgY29sXG5cdFx0XHRcdFx0QHRpbGVzW2lkXSA9IHRpbGVcblx0XHRcdFx0XHRpZCsrXG5cblxuXHRcdCMgbG9hZCBsYXllcnNcblx0XHRmb3IgbGF5ZXJEYXRhIGluIGRhdGEubGF5ZXJzXG5cdFx0XHRpZiBsYXllckRhdGEudHlwZSA9PSBcInRpbGVsYXllclwiXG5cdFx0XHRcdEBsYXllcnNbbGF5ZXJEYXRhLm5hbWVdID0gbmV3IFRpbGVMYXllcih0aGlzLCBsYXllckRhdGEpXG5cdFx0XHRpZiBsYXllckRhdGEudHlwZSA9PSBcIm9iamVjdGdyb3VwXCJcblx0XHRcdFx0QGxheWVyc1tsYXllckRhdGEubmFtZV0gPSBuZXcgT2JqZWN0R3JvdXAodGhpcywgbGF5ZXJEYXRhKVxuXG5cdFx0IyAjIGNyZWF0ZSB0aWxlIG9iamVjdHMgdGhhdCBjb21wcmlzZSBiYWNrZ3JvdW5kc1xuXG5cdFx0IyBkYXRhLmxheWVyc1xuXG5cdFx0IyBAZmFyQmFja2dyb3VuZCA9IEBsb2FkVGlsZUxheWVyKGRhdGEubGF5ZXJzWzBdKVxuXHRcdCMgQGJhY2tncm91bmQgPSBcblxuXG5cdFx0IyBmYXJCYWNrZ3JvdW5kLnBvc2l0aW9uLnkgPSA3LjUgKiAyXG5cdFx0IyBmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cdFx0IyB0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wXG5cdFx0IyBmYXJCYWNrZ3JvdW5kLnBvc2l0aW9uLnogPSAtdGFyZ2V0WlxuXHRcdCMgZmFyQmFja2dyb3VuZC5zY2FsZS5zZXQoMiwgMiwgMilcblx0XHQjIGNvbnNvbGUubG9nIGZhckJhY2tncm91bmRcblx0XHQjIEByb290LmFkZCBmYXJCYWNrZ3JvdW5kXG5cdFx0XG5cdFx0IyBiYWNrZ3JvdW5kID0gQGxvYWRUaWxlTGF5ZXIoZGF0YS5sYXllcnNbMV0pXG5cdFx0IyBiYWNrZ3JvdW5kLnBvc2l0aW9uLnkgPSA3LjVcblx0XHQjIGNvbnNvbGUubG9nIGJhY2tncm91bmRcblx0XHQjIEByb290LmFkZCBiYWNrZ3JvdW5kXG5cblxuXHRcdCMgIyBsb2FkIG9iamVjdHNcblx0XHQjIGZvciBvIGluIGRhdGEubGF5ZXJzWzJdLm9iamVjdHMgXG5cdFx0IyBcdGVuZW15ID0gbmV3IEVuZW1pZXNbby50eXBlXShuZXcgVEhSRUUuVmVjdG9yMyhvLnggLyAzMiwgNyAtIG8ueSAvIDMyLCB1dGlsLnJhbmRvbSgtMSwgMSkpKVxuXHRcdCMgXHRlbmVteS5hY3RpdmUgPSBmYWxzZVxuXHRcdCMgXHRAYWRkIGVuZW15XG5cblxuXHRsb2FkVGlsZUxheWVyOiAoZGF0YSk9PlxuXHRcdGxheWVyID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRmb3IgaWQsIGluZGV4IGluIGRhdGEuZGF0YVxuXHRcdFx0aWYgaWQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaW5kZXggLyBkYXRhLndpZHRoKVxuXHRcdFx0XHRjb2wgPSBpbmRleCAlIGRhdGEud2lkdGhcblx0XHRcdFx0dGlsZU9iamVjdCA9IG5ldyBUaWxlT2JqZWN0KEB0aWxlc1tpZF0sIG5ldyBUSFJFRS5WZWN0b3IzKGNvbCwgLXJvdyAtIDEsIDApIClcblx0XHRcdFx0bGF5ZXIuYWRkIHRpbGVPYmplY3Qucm9vdFx0XG5cdFx0cmV0dXJuIGxheWVyXG5cblx0XG5cblxuIyByZXByZXNlbnRzIGEgVGlsZVNldCBpbiBhIFRpbGVkIEVkaXRvciBsZXZlbFxuY2xhc3MgVGlsZVNldFxuXHRjb25zdHJ1Y3RvcjogKEBkYXRhKS0+XG5cdFx0QGNvbHMgPSBAZGF0YS5pbWFnZXdpZHRoIC8gQGRhdGEudGlsZXdpZHRoXG5cdFx0QHJvd3MgPSBAZGF0YS5pbWFnZWhlaWdodCAvIEBkYXRhLnRpbGVoZWlnaHRcblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvI3tAZGF0YS5pbWFnZX1cIlxuXHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFRlc3Q6IHRydWVcblx0XHRcdGRlcHRoV3JpdGU6IGZhbHNlXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXG4jIFJlcHJlc2VudHMgdGhlIEBnZW9tZXRyeSBhbmQgQG1hdGVyaWFsIG9mIGEgdGlsZSBsb2FkZWQgZnJvbSBhIFRpbGVkIEVkaXRvciBsZXZlbFxuY2xhc3MgVGlsZVxuXHRjb25zdHJ1Y3RvcjogKEB0aWxlU2V0LCBAcm93LCBAY29sKS0+XG5cdFx0IyB0b2RvLCBwcm9iYWJseSBiZSBwcmV0dGllciB0byBqdXN0IG1ha2UgdGhpcyBmcm9tIHNjcmF0Y2hcblx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggQHRpbGVTZXQuZGF0YS50aWxld2lkdGggLyAzMiwgQHRpbGVTZXQuZGF0YS50aWxlaGVpZ2h0IC8gMzIpXG5cdFx0XG5cdFx0IyBSZXBvc2l0aW9uIHZlcnRpY2VzIHRvIGxvd2VyIGxlZnQgYXQgMCwwIFxuXHRcdGZvciB2IGluIEBnZW9tZXRyeS52ZXJ0aWNlc1xuXHRcdFx0di54ICs9IEB0aWxlU2V0LmRhdGEudGlsZXdpZHRoIC8gMzIgLyAyXG5cdFx0XHR2LnkgKz0gQHRpbGVTZXQuZGF0YS50aWxlaGVpZ2h0IC8gMzIgLyAyXG5cdFx0QGdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWVcblxuXHRcdCMgY2FsYyBhbmQgc2V0IHV2c1xuXHRcdHV2V2lkdGggPSBAdGlsZVNldC5kYXRhLnRpbGV3aWR0aC9AdGlsZVNldC5kYXRhLmltYWdld2lkdGhcblx0XHR1dkhlaWdodCA9IEB0aWxlU2V0LmRhdGEudGlsZWhlaWdodC9AdGlsZVNldC5kYXRhLmltYWdlaGVpZ2h0XG5cblx0XHR1dlggPSB1dldpZHRoICogQGNvbFxuXHRcdHV2WSA9IHV2SGVpZ2h0ICogKEB0aWxlU2V0LnJvd3MgLSBAcm93IC0gMSlcblx0XHRmb3IgZmFjZSBpbiBAZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVxuXHRcdFx0Zm9yIHYgaW4gZmFjZVxuXHRcdFx0XHRpZiB2LnggPT0gMFxuXHRcdFx0XHRcdHYueCA9IHV2WFxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0di54ID0gdXZYICsgdXZXaWR0aCAqICgzMS41LzMyLjApICMgdG9kbyBkaXJ0eSBoYWNrIHRvIHByZXZlbnQgc2xpZ2h0IG92ZXJzYW1wbGUgb24gdGlsZSBzaG93aW5nIGhpbnQgb2YgbmV4dCB0aWxlIG9uIGVkZ2UuXG5cblx0XHRcdFx0aWYgdi55ID09IDBcblx0XHRcdFx0XHR2LnkgPSB1dllcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHYueSA9IHV2WSArIHV2SGVpZ2h0ICogKDMxLjUvMzIuMCkgIyB0b2RvIGRpcnR5IGhhY2sgdG8gcHJldmVudCBzbGlnaHQgb3ZlcnNhbXBsZSBvbiB0aWxlIHNob3dpbmcgaGludCBvZiBuZXh0IHRpbGUgb24gZWRnZS5cdFx0XHRcdFx0XG5cdFx0QGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlXG5cblx0XHRjb25zb2xlLmxvZyBcImdlb1wiLCBAZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVxuXG5cdFx0QG1hdGVyaWFsID0gQHRpbGVTZXQubWF0ZXJpYWxcblxuXHRcdFxuXG4jIFJlcHJlc2VudHMgYSBUaWxlTGF5ZXIgaW4gdGhlIFRpbGVkIEVkaXRvciBmaWxlLiBcbmNsYXNzIFRpbGVMYXllclxuXHRjb25zdHJ1Y3RvcjogKG1hcCwgQGRhdGEpLT5cblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0Zm9yIGlkLCBpbmRleCBpbiBAZGF0YS5kYXRhXG5cdFx0XHRpZiBpZCA+IDBcblx0XHRcdFx0cm93ID0gTWF0aC5mbG9vcihpbmRleCAvIGRhdGEud2lkdGgpXG5cdFx0XHRcdGNvbCA9IGluZGV4ICUgZGF0YS53aWR0aFxuXHRcdFx0XHQjIGNvbnNvbGUubG9nICBcInRpbGVcIiwgbWFwLCBtYXAudGlsZXNbaWRdXG5cdFx0XHRcdHRpbGVPYmplY3QgPSBuZXcgVGlsZU9iamVjdChtYXAudGlsZXNbaWRdLCBuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIC1yb3cgLSAxLCAwKSApXG5cdFx0XHRcdEByb290LmFkZCB0aWxlT2JqZWN0Lm1lc2hcdFxuXHRcdFxuXG4jIFJlcHJlc2VudHMgYW4gaW5zdGFuY2Ugb2YgYSB0aWxlIHRvIGJlIHJlbmRlcmVkXG5jbGFzcyBUaWxlT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAodGlsZSwgcG9zaXRpb24pLT5cblx0XHRAbWVzaCA9IG5ldyBUSFJFRS5NZXNoIHRpbGUuZ2VvbWV0cnksIHRpbGUubWF0ZXJpYWxcblx0XHRAbWVzaC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXHRcblxuY2xhc3MgT2JqZWN0R3JvdXBcblx0Y29uc3RydWN0b3I6IChAZGF0YSktPlxuIiwiU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5cbmNsYXNzIGV4cG9ydHMuQnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0LnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpXG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHN1cGVyKHRhcmdldClcblx0XHRTY29yZS5hZGQoMSlcblx0XHRAZGllKClcblx0XHRmb3IgaSBpbiBbMC4uNV1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMSlcblxuXG5jbGFzcyBleHBvcnRzLkVuZW15QnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0XzIucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSlcblx0XG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMjAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBidWxsZXRHZW9tZXRyeSwgYnVsbGV0TWF0ZXJpYWxcblxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0XHRAY29sbGlkZXJUeXBlID0gXCJidWxsZXRcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteVwiXG5cdFx0QGFuZ2xlID0gMFxuXHRcdEBzcGVlZCA9IDE1XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IE1hdGguY29zKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBNYXRoLnNpbihAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnJvdGF0aW9uLnogPSBAYW5nbGVcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5cblx0Y29sbGlkZUludG86ICh0YXJnZXQpLT5cblx0XHRzdXBlcih0YXJnZXQpXG5cdFx0U2NvcmUuYWRkKDEpXG5cdFx0QGRpZSgpXG5cdFx0Zm9yIGkgaW4gWzAuLjVdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDEpXG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuSW5wdXQgPSByZXF1aXJlICcuL0lucHV0LmNvZmZlZSdcblxuY2xhc3MgV29ybGQgZXh0ZW5kcyBCYXNlXG5cdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRzdXBlcigpXG5cblx0XHR3ID0gNjQwXG5cdFx0aCA9IDQ4MFxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIHcgLyBoLCAxLCAxMDAwMClcblx0XHRmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuXG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdGFyZ2V0WlxuXHRcdFxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0XG5cdFx0QHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKVxuXHRcdEByZW5kZXJlci5zZXRTaXplIHcsIGhcblx0XHQjIEByZW5kZXJlci5zb3J0T2JqZWN0cyA9IGZhbHNlXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG5cblx0XHRcblx0XHRAd29ybGRUZXh0dXJlID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0IHcsIGgsIFxuXHRcdFx0bWluRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdG1hZ0ZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyXG5cdFx0XHRmb3JtYXQ6IFRIUkVFLlJHQkZvcm1hdFxuXHRcdFxuXG5cdFx0QHByb2Nlc3NNYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbFxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IGZhbHNlXG5cdFx0XHR1bmlmb3JtczogXG5cdFx0XHRcdFwidERpZmZ1c2VcIjogeyB0eXBlOiBcInRcIiwgdmFsdWU6IEB3b3JsZFRleHR1cmUgfVxuXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR2YXJ5aW5nIHZlYzIgdlV2O1xuXG5cdFx0XHRcdHZvaWQgbWFpbigpIHtcblx0XHRcdFx0XHR2VXYgPSB1djtcblx0XHRcdFx0XHRnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdGZyYWdtZW50U2hhZGVyOlxuXHRcdFx0XHRcIlwiXCJcblx0XHRcdFx0dW5pZm9ybSBzYW1wbGVyMkQgdERpZmZ1c2U7XG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdC8vIHJlYWQgdGhlIGlucHV0IGNvbG9yXG5cblx0XHRcdFx0XHR2ZWM0IG87XG5cdFx0XHRcdFx0dmVjNCBjO1xuXHRcdFx0XHRcdGMgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcblx0XHRcdFx0XHQvL28gPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcblxuXHRcdFx0XHRcdC8vbWlzYWxpZ24gcmdiXG5cdFx0XHRcdFx0by5yID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIC0wLjAwMSkgKS5yO1xuXHRcdFx0XHRcdG8uZyA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiArIHZlYzIoMC4wLCAwLjAwMSkgKS5yO1xuXHRcdFx0XHRcdG8uYiA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiArIHZlYzIoMC4wLCAwLjAwMykgKS5yO1xuXG5cdFx0XHRcdFx0Ly9zY2FubGluZXNcblx0XHRcdFx0XHRvLnIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIDEuMDtcblx0XHRcdFx0XHRvLmcgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIDEuMDtcblx0XHRcdFx0XHRvLmIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIDEuMDtcblxuXHRcdFx0XHRcdG8gKj0gMC41ICsgMS4wKjE2LjAqdlV2LngqdlV2LnkqKDEuMC12VXYueCkqKDEuMC12VXYueSk7XG5cdFx0XHRcdFx0XG5cblx0XHRcdFx0XHQvLyBzZXQgdGhlIG91dHB1dCBjb2xvclxuXHRcdFx0XHRcdGdsX0ZyYWdDb2xvciA9IG8gKiAuNSArIGMgKiAuNTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdEBwcm9jZXNzU2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdEBwcm9jZXNzQ2FtZXJhID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYSgtLjUsIC41LCAtLjUgLCAuNSwgMCwgMSlcblx0XHRAcHJvY2Vzc0NhbWVyYS5wb3NpdGlvbi56ID0gMFxuXHRcdEBwcm9jZXNzU2NlbmUuYWRkIEBwcm9jZXNzQ2FtZXJhXG5cdFx0QHByb2Nlc3NRdWFkID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxICksIEBwcm9jZXNzTWF0ZXJpYWwgKTtcblx0XHRAcHJvY2Vzc1F1YWQucm90YXRpb24ueCA9IE1hdGguUElcblx0XHRAcHJvY2Vzc1NjZW5lLmFkZCBAcHJvY2Vzc1F1YWRcblxuXG5cblxuXHRcdEBjbG9jayA9IG5ldyBUSFJFRS5DbG9jaygpXG5cdFx0QHN0YXRzID0gbmV3IFN0YXRzKCk7XG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCdcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkKCBAc3RhdHMuZG9tRWxlbWVudCApXG5cblx0XHRyZXR1cm4gdGhpc1xuXG5cdGFuaW1hdGU6ID0+XG5cdFx0ZGVsdGEgPSBAY2xvY2suZ2V0RGVsdGEoKVx0XHRcblx0XHQjZG9uJ3QgdXBkYXRlIGFmdGVyIGxvbmcgZnJhbWUgKGZpeGVzIGlzc3VlIHdpdGggc3dpdGNoaW5nIHRhYnMpXG5cdFx0aWYgKGRlbHRhIDwgLjUpIFxuXHRcdFx0QHRyaWdnZXIgXCJ1cGRhdGVcIiwgZGVsdGFcblxuXHRcdEByZW5kZXJlci5yZW5kZXIoIEBzY2VuZSwgQGNhbWVyYSwgQHdvcmxkVGV4dHVyZSwgdHJ1ZSApO1xuXG5cblx0XHRAcmVuZGVyZXIucmVuZGVyIEBwcm9jZXNzU2NlbmUsIEBwcm9jZXNzQ2FtZXJhXG5cblx0XHRAc3RhdHMudXBkYXRlKClcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGVcblx0XHRyZXR1cm5cblxuXHRzdGFydDogLT5cblx0XHRAYW5pbWF0ZSgpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkXG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cbldvcmxkID0gcmVxdWlyZSAnLi9Xb3JsZC5jb2ZmZWUnXG5HYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBsYXllciA9IHJlcXVpcmUgJy4vUGxheWVyLmNvZmZlZSdcbkVuZW1pZXMgPSByZXF1aXJlICcuL0VuZW1pZXMuY29mZmVlJ1xuXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcblxuVGlsZWQgPSByZXF1aXJlICcuL1RpbGVkLmNvZmZlZSdcblxuY2xhc3MgTGV2ZWwgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoQHdvcmxkKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0QGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuXHRcdEByb290LmFkZChAYW1iaWVudExpZ2h0KVxuXG5cdFx0QHBsYXllcjEgPSBuZXcgUGxheWVyKClcblx0XHRAYWRkIEBwbGF5ZXIxXG5cblx0XHRcblx0XHRtYXBQcm9taXNlID0gVGlsZWQubG9hZCgnYXNzZXRzL2xldmVsXzEuanNvbicpXG5cdFx0bWFwUHJvbWlzZS50aGVuIChtYXApPT5cblx0XHRcdG1hcC5sYXllcnMuYmFja2dyb3VuZC5yb290LnBvc2l0aW9uLnkgPSA3LjVcblx0XHRcdEByb290LmFkZChtYXAubGF5ZXJzLmJhY2tncm91bmQucm9vdClcblxuXHRcdFx0bWFwLmxheWVycy5taWRncm91bmQucm9vdC5wb3NpdGlvbi55ID0gNy41XG5cdFx0XHRAcm9vdC5hZGQobWFwLmxheWVycy5taWRncm91bmQucm9vdClcblxuXHRcdCMgQHRpbGVkTGV2ZWwgPSBuZXcgVGlsZWRMZXZlbChcImFzc2V0cy9sZXZlbF8xLmpzb25cIilcblxuXG5cdFx0IyAkLmdldEpTT04gXCJhc3NldHMvbGV2ZWxfMS5qc29uXCIsIEBvbkxvYWRcblx0XHRcdFxuXHRcblx0XHRcblxuXG5cdFxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXHRcdEBwbGF5ZXIxLnJvb3QucG9zaXRpb24ueCArPSAxICogZGVsdGFcblxuXHRcdGZvciBjaGlsZCBpbiBAY2hpbGRyZW5cblx0XHRcdGlmIGNoaWxkLmFjdGl2ZSA9PSBmYWxzZSBhbmQgY2hpbGQucm9vdC5wb3NpdGlvbi54IDwgQHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ICsgMTBcblx0XHRcdFx0Y2hpbGQuYWN0aXZhdGUoKVxuXG5cdFx0QGNvbGxpc2lvbnMoKVxuXG5cdFxuXHRcdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGlmIGdhbWVPYmplY3QgaW5zdGFuY2VvZiBDb2xsaXNpb25PYmplY3Rcblx0XHRcdEBjb2xsaWRlcnMucHVzaCBnYW1lT2JqZWN0IFxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRpID0gIEBjb2xsaWRlcnMuaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNvbGxpZGVycy5zcGxpY2UoaSwgMSk7XG5cblx0XHRyZXR1cm4gc3VwZXIoZ2FtZU9iamVjdClcblxuXG5cblxuXHRjb2xsaXNpb25zOiAoKS0+XG5cdFx0Zm9yIGEgaW4gQGNvbGxpZGVyc1xuXHRcdFx0aWYgYS5hY3RpdmVcblx0XHRcdFx0Zm9yIGIgaW4gQGNvbGxpZGVyc1xuXHRcdFx0XHRcdGlmIGIuYWN0aXZlXG5cdFx0XHRcdFx0XHRpZiBhLmNvbGxpZGVySGl0VHlwZXMuaW5kZXhPZihiLmNvbGxpZGVyVHlwZSkgPiAtMVxuXHRcdFx0XHRcdFx0XHRpZiBAdGVzdENvbGxpc2lvbiBhLCBiXG5cdFx0XHRcdFx0XHRcdFx0YS5jb2xsaWRlSW50byBiXG5cblx0dGVzdENvbGxpc2lvbjogKGEsIGIpLT5cblx0XHRyZXR1cm4gYS5yb290LnBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKGIucm9vdC5wb3NpdGlvbikgPCBhLmNvbGxpc2lvblJhZGl1cyArIGIuY29sbGlzaW9uUmFkaXVzXG5cblxuXG5jbGFzcyBIb21lU2NyZWVuIGV4dGVuZHMgR2FtZU9iamVjdFxuXHR0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9zY3JlZW5zL3RpdGxlLnBuZ1wiXG5cdG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDIwLCAxNSlcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGdlb21ldHJ5LCBtYXRlcmlhbFxuXG5jbGFzcyBHYW1lT3ZlclNjcmVlbiBleHRlbmRzIEdhbWVPYmplY3Rcblx0dGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvc2NyZWVucy9nYW1lX292ZXIucG5nXCJcblx0bWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0Z2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMjAsIDE1KVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG5cblxuXG5jbGFzcyBHYW1lXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0I3NldHVwIHdvcmxkXG5cdFx0QHdvcmxkID0gbmV3IFdvcmxkKClcblx0XHRAaG9tZVNjcmVlbiA9IG5ldyBIb21lU2NyZWVuKClcblx0XHRAZ2FtZU92ZXJTY3JlZW4gPSBuZXcgR2FtZU92ZXJTY3JlZW4oKVxuXHRcdEBsb2FkTGV2ZWwoKVxuXHRcdEBsaXZlcyA9IDNcblxuXHRcdFNjb3JlLmRpc3BsYXlFbGVtZW50ID0gJChcIlwiXCI8aDE+U2NvcmU6PC9oMT5cIlwiXCIpLmFwcGVuZFRvICQoXCIjc2h1bXBcIilcblx0XHRAbGl2ZXNFbGVtZW50ID0gJChcIlwiXCI8aDE+TGl2ZXM6PC9oMT5cIlwiXCIpLmFwcGVuZFRvICQoXCIjc2h1bXBcIilcblx0XHRcblx0XHRcblx0XHRAc3RhdGUgPSBcImhvbWVcIlxuXHRcdEB3b3JsZC5zY2VuZS5hZGQgQGhvbWVTY3JlZW4ucm9vdFxuXG5cblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0aWYgQHN0YXRlID09IFwiaG9tZVwiXG5cdFx0XHRcdEB3b3JsZC5zY2VuZS5yZW1vdmUgQGhvbWVTY3JlZW4ucm9vdFxuXHRcdFx0XHRAc3RhdGUgPSBcInBsYXlcIlxuXHRcdFx0XHRAc3RhcnRMZXZlbCgpXG5cdFx0XHRcdHJldHVyblxuXG5cdFx0XHRpZiBAc3RhdGUgPT0gXCJnYW1lX292ZXJcIlxuXHRcdFx0XHRAd29ybGQuc2NlbmUucmVtb3ZlIEBnYW1lT3ZlclNjcmVlbi5yb290XG5cdFx0XHRcdEB3b3JsZC5zY2VuZS5hZGQgQGhvbWVTY3JlZW4ucm9vdFxuXHRcdFx0XHRAc3RhdGUgPSBcImhvbWVcIlxuXHRcdFx0XHRyZXR1cm5cblxuXHRcdHV0aWwuYWZ0ZXIgMSwgKCk9PlxuXHRcdFx0QHdvcmxkLnN0YXJ0KClcblxuXHRsb2FkTGV2ZWw6ICgpLT5cblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggPSAwO1xuXHRcdEBsZXZlbCA9IG5ldyBMZXZlbChAd29ybGQpXG5cdFxuXHRzdGFydExldmVsOiAoKS0+XG5cdFx0QHdvcmxkLnNjZW5lLmFkZCBAbGV2ZWwucm9vdFxuXHRcdEB3b3JsZC5vbiBcInVwZGF0ZVwiLCBAbGV2ZWwudXBkYXRlXG5cdFx0XG5cdHJlc2V0UGxheWVyOiAoKT0+XG5cdFx0QGxpdmVzLS1cblx0XHRAbGl2ZXNFbGVtZW50LnRleHQgXCJMaXZlczogI3tAbGl2ZXN9XCJcblxuXHRcdGlmIEBsaXZlcyA+IDBcblx0XHRcdEBsZXZlbC5wbGF5ZXIxID0gbmV3IFBsYXllcigpXG5cdFx0XHRAbGV2ZWwucGxheWVyMS5yb290LnBvc2l0aW9uLnggPSBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnhcblx0XHRcdEBsZXZlbC5hZGQgQGxldmVsLnBsYXllcjFcblx0XHRlbHNlXG5cdFx0XHR1dGlsLmFmdGVyIDIwMDAsIEBnYW1lT3ZlclxuXG5cdGdhbWVPdmVyOiAoKT0+XG5cdFx0Y29uc29sZS5sb2cgXCJnYW1lIG92ZXJcIlxuXHRcdFxuXHRcdEB3b3JsZC5zY2VuZS5yZW1vdmUgQGxldmVsLnJvb3Rcblx0XHRAd29ybGQub2ZmIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblxuXHRcdEBsb2FkTGV2ZWwoKVxuXHRcdEB3b3JsZC5zY2VuZS5hZGQgQGdhbWVPdmVyU2NyZWVuLnJvb3Rcblx0XHRAc3RhdGUgPSBcImdhbWVfb3ZlclwiXG5cblxubW9kdWxlLmV4cG9ydHMuZ2FtZSA9IGdhbWUgPSBuZXcgR2FtZSgpXG5cblx0XHRcblxuIyBtb2RlbExvYWRlciA9IG5ldyBjb3JlLk1vZGVsTG9hZGVyKClcblxuXG5cdFx0XHRcblxuXG4iLCJleHBvcnRzLmFmdGVyID0gKGRlbGF5LCBmdW5jKS0+XG5cdHNldFRpbWVvdXQgZnVuYywgZGVsYXlcblxuZXhwb3J0cy5yYW5kb20gPSAobWluLCBtYXgpLT5cblx0cmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiJdfQ==
