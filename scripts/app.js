(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var level, shump, updateDebug;

shump = require('./shump/shump.coffee');

console.log("shump", shump);

$("#debug").append("<span id=\"levelChildren\">");

updateDebug = function() {
  return $("#levelChildren").text("level.children = " + level.children.length);
};

window.world = new shump.core.World();

level = new shump.Level();

world.scene.add(level.root);

world.on("update", level.update);

world.on("update", updateDebug);

console.log("level", level);

setTimeout(function() {
  return world.start();
}, 1000);

window.level = level;


},{"./shump/shump.coffee":4}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
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


},{"../util.coffee":6,"./GameObject.coffee":2}],4:[function(require,module,exports){
var Bullet, CollisionObject, Enemy, GameObject, Level, Particle, Player, Tile, TileAsset, core, input, modelLoader, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

core = require('./shump_core.coffee');

util = require('../util.coffee');

GameObject = require('./GameObject.coffee');

Particle = require('./Particle.coffee');

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

Player = (function(_super) {
  __extends(Player, _super);

  function Player() {
    this.update = __bind(this.update, this);
    Player.__super__.constructor.call(this);
    this.root.position.setX(-0);
    world.camera.position.setX(-0);
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
    if (Date.now() > this.lastFire + 240) {
      this.lastFire = Date.now();
      bullet = new Bullet(this.root.position);
      return this.parent.add(bullet);
    }
  };

  Player.prototype.die = function() {};

  return Player;

})(CollisionObject);

Bullet = (function(_super) {
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

Enemy = (function(_super) {
  var enemyGeometry, enemyMaterial, enemyTexture;

  __extends(Enemy, _super);

  enemyTexture = THREE.ImageUtils.loadTexture("assets/enemy.png");

  enemyMaterial = new THREE.MeshBasicMaterial({
    map: enemyTexture,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    transparent: true
  });

  enemyGeometry = new THREE.PlaneGeometry(1, 1);

  function Enemy(position) {
    Enemy.__super__.constructor.call(this);
    this.colliderType = "enemy";
    this.colliderHitTypes.push("player");
    this.root.add(new THREE.Mesh(enemyGeometry, enemyMaterial));
    this.root.position.copy(position);
    this.age = 0;
  }

  Enemy.prototype.update = function(delta) {
    this.age += delta;
    Enemy.__super__.update.call(this, delta);
    this.root.position.x += -1 * delta;
    return this.root.position.y += delta * Math.sin(this.age);
  };

  Enemy.prototype.die = function() {
    var i, _i;
    for (i = _i = 0; _i <= 20; i = ++_i) {
      this.parent.add(new Particle(this.root.position, 3));
    }
    return Enemy.__super__.die.call(this);
  };

  return Enemy;

})(CollisionObject);

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

  function Level() {
    this.onLoad = __bind(this.onLoad, this);
    Level.__super__.constructor.call(this);
    this.colliders = [];
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.root.add(this.ambientLight);
    this.player1 = new Player();
    this.add(this.player1);
    this.lastEnemy = Date.now();
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
      enemy = new Enemy(new THREE.Vector3(o.x / 32, 7 - o.y / 32, util.random(-1, 1)));
      enemy.active = false;
      _results.push(this.add(enemy));
    }
    return _results;
  };

  Level.prototype.update = function(delta) {
    var child, _i, _len, _ref;
    Level.__super__.update.call(this, delta);
    world.camera.position.x += 1 * delta;
    this.player1.root.position.x += 1 * delta;
    _ref = this.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.active === false && child.root.position.x < world.camera.position.x + 10) {
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

modelLoader = new core.ModelLoader();

input = new core.Input();

module.exports.Level = Level;

module.exports.core = core;


},{"../util.coffee":6,"./GameObject.coffee":2,"./Particle.coffee":3,"./shump_core.coffee":5}],5:[function(require,module,exports){
var Base, Input, Model, ModelLoader, World,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

module.exports.World = World;

module.exports.Model = Model;

module.exports.ModelLoader = ModelLoader;

module.exports.Input = Input;


},{}],6:[function(require,module,exports){
exports.after = function(delay, func) {
  return setTimeout(func, delay);
};

exports.random = function(min, max) {
  return Math.random() * (max - min) + min;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9HYW1lT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9zaHVtcC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL3NodW1wX2NvcmUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEseUJBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsT0FDTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQXFCLEtBQXJCLENBREEsQ0FBQTs7QUFBQSxDQUdBLENBQUUsUUFBRixDQUFXLENBQUMsTUFBWixDQUFtQiw2QkFBbkIsQ0FIQSxDQUFBOztBQUFBLFdBS0EsR0FBYyxTQUFBLEdBQUE7U0FDYixDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUE0QixtQkFBQSxHQUFrQixLQUFLLENBQUMsUUFBUSxDQUFDLE1BQTdELEVBRGE7QUFB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b10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJzaHVtcCA9IHJlcXVpcmUoJy4vc2h1bXAvc2h1bXAuY29mZmVlJyk7XG5jb25zb2xlLmxvZyBcInNodW1wXCIsIHNodW1wXG5cbiQoXCIjZGVidWdcIikuYXBwZW5kKFwiXCJcIjxzcGFuIGlkPVwibGV2ZWxDaGlsZHJlblwiPlwiXCJcIilcblxudXBkYXRlRGVidWcgPSAoKS0+XG5cdCQoXCIjbGV2ZWxDaGlsZHJlblwiKS50ZXh0IFwiXCJcImxldmVsLmNoaWxkcmVuID0gI3tsZXZlbC5jaGlsZHJlbi5sZW5ndGh9XCJcIlwiXG5cblxuI3NldHVwIHdvcmxkXG53aW5kb3cud29ybGQgPSBuZXcgc2h1bXAuY29yZS5Xb3JsZCgpXG5sZXZlbCA9IG5ldyBzaHVtcC5MZXZlbCgpXG5cbndvcmxkLnNjZW5lLmFkZCBsZXZlbC5yb290XG53b3JsZC5vbiBcInVwZGF0ZVwiLCBsZXZlbC51cGRhdGVcbndvcmxkLm9uIFwidXBkYXRlXCIsIHVwZGF0ZURlYnVnXG5cbmNvbnNvbGUubG9nIFwibGV2ZWxcIiwgbGV2ZWxcbiNiZWdpblxuc2V0VGltZW91dCAoKS0+XG5cdHdvcmxkLnN0YXJ0KClcbiwgMTAwMFxuXG5cbndpbmRvdy5sZXZlbCA9IGxldmVsXG5cbiIsImNsYXNzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHBhcmVudCA9IHVuZGVmaW5lZFxuXHRcdEBjaGlsZHJlbiA9IFtdXG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdEBkZWFkID0gZmFsc2Vcblx0XHRAYWN0aXZlID0gdHJ1ZVxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0Zm9yIGkgaW4gW0BjaGlsZHJlbi5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGNoaWxkID0gQGNoaWxkcmVuW2ldXG5cdFx0XHRpZiBjaGlsZC5kZWFkXG5cdFx0XHRcdEByZW1vdmUgY2hpbGRcblx0XHRcdFx0Y29udGludWVcblx0XHRcdGlmIGNoaWxkLmFjdGl2ZVxuXHRcdFx0XHRjaGlsZC51cGRhdGUgZGVsdGEgXG5cdFxuXHRhY3RpdmF0ZTogKCktPlxuXHRcdEBhY3RpdmUgPSB0cnVlO1xuXHRcdFxuXG5cdGFkZDogKGdhbWVPYmplY3QpLT5cblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IHRoaXNcblx0XHRAY2hpbGRyZW4ucHVzaChnYW1lT2JqZWN0KVxuXHRcdEByb290LmFkZChnYW1lT2JqZWN0LnJvb3QpXG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0QHJvb3QucmVtb3ZlKGdhbWVPYmplY3Qucm9vdClcblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IG51bGxcblx0XHRpID0gIEBjaGlsZHJlbi5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY2hpbGRyZW4uc3BsaWNlKGksIDEpO1xuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0ZGllOiAoKS0+XG5cdFx0QGRlYWQgPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPYmplY3RcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xudXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5jbGFzcyBQYXJ0aWNsZSBleHRlbmRzIEdhbWVPYmplY3Rcblx0cGFydGljbGVUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9wYXJ0aWNsZS5wbmdcIlxuXHRwYXJ0aWNsZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHBhcnRpY2xlVGV4dHVyZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cblx0cGFydGljbGVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uLCBlbmVyZ3kpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBwYXJ0aWNsZUdlb21ldHJ5LCBwYXJ0aWNsZU1hdGVyaWFsXG5cdFx0XG5cdFx0QHZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjModXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSk7XG5cdFx0QHZlbG9jaXR5Lm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKGVuZXJneSlcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHZlbG9jaXR5Lm11bHRpcGx5U2NhbGFyKC45OSlcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IEB2ZWxvY2l0eS54ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi56ICs9IEB2ZWxvY2l0eS56ICogZGVsdGFcblx0XHRzID0gMS0gKChEYXRlLm5vdygpIC0gQGJpcnRoKSAvIEB0aW1lVG9MaXZlKSArIC4wMVxuXHRcdEByb290LnNjYWxlLnNldChzLCBzLCBzKVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGVcbiIsImNvcmUgPSByZXF1aXJlICcuL3NodW1wX2NvcmUuY29mZmVlJ1xudXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5HYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5cblxuXG5jbGFzcyBDb2xsaXNpb25PYmplY3QgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSB1bmRlZmluZWRcblx0XHRAY29sbGlkZXJIaXRUeXBlcyA9IFtdXG5cblx0Y29sbGlkZVdpdGg6IChnYW1lT2JqZWN0KS0+XG5cdFx0QGRpZSgpXG5cdFx0Z2FtZU9iamVjdC5kaWUoKVxuXG5cdFxuXG5cbmNsYXNzIFBsYXllciBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEByb290LnBvc2l0aW9uLnNldFgoLTApO1xuXHRcdHdvcmxkLmNhbWVyYS5wb3NpdGlvbi5zZXRYKC0wKTtcblx0XHRAY29sbGlkZXJUeXBlID0gXCJwbGF5ZXJcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJcIlxuXG5cblx0XHRAcm9vdC5hZGQgbW9kZWxMb2FkZXIubG9hZChcImFzc2V0cy9zaGlwLmpzXCIpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ3VwJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ2Rvd24nXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1snbGVmdCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54IC09IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydyaWdodCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydmaXJlX3ByaW1hcnknXVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBsYXN0RmlyZSArIDI0MCBcblx0XHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRcdGJ1bGxldCA9IG5ldyBCdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblx0XHRcdCMgQHBhcmVudC5jb2xsaWRlcnMucHVzaCBidWxsZXRcblxuXHRkaWU6ICgpLT5cblx0XHQjIGNvbnNvbGUubG9nIFwiZGllXCJcblxuXG5jbGFzcyBCdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvYnVsbGV0LnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiYnVsbGV0XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlcIlxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDEwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggYnVsbGV0R2VvbWV0cnksIGJ1bGxldE1hdGVyaWFsXG5cblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKCktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLjI1XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxuXG5cblxuY2xhc3MgRW5lbXkgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0ZW5lbXlUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9lbmVteS5wbmdcIlxuXHRlbmVteU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGVuZW15VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0XG5cblx0ZW5lbXlHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImVuZW15XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwicGxheWVyXCJcblxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBlbmVteUdlb21ldHJ5LCBlbmVteU1hdGVyaWFsXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XHRAYWdlID0gMFxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QGFnZSArPSBkZWx0YVxuXHRcdHN1cGVyKGRlbHRhKVxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLTEgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gZGVsdGEgKiBNYXRoLnNpbihAYWdlKVxuXHRcdCMgc3VwZXIoZGVsdGEpXG5cdFx0IyBpZiBAYWdlIDwgMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDJcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueSArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyLjFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHQjIGVsc2Vcblx0XHQjIFx0QGRpZSgpXG5cblx0ZGllOiAoKS0+XG5cdFx0Zm9yIGkgaW4gWzAuLjIwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAzKVxuXHRcdHN1cGVyKClcblxuY2xhc3MgVGlsZUFzc2V0XG5cdGNvbnN0cnVjdG9yOiAodGV4dHVyZUZpbGUsIHdpZHRoLCBoZWlnaHQpLT5cblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgdGV4dHVyZUZpbGVcblx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhUZXN0OiB0cnVlXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0IyBvcGFjaXR5OiAuOVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdCMgY29sb3I6IDB4ZmYwMDAwXG5cdFx0XHRcdFxuXHRcdGNvbnNvbGUubG9nIFwibWF0XCIsIEBtYXRlcmlhbFxuXHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCB3aWR0aCwgaGVpZ2h0KTtcblxuY2xhc3MgVGlsZSBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiwgdGlsZUFzc2V0KS0+XG5cdFx0c3VwZXIoKVxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCB0aWxlQXNzZXQuZ2VvbWV0cnksIHRpbGVBc3NldC5tYXRlcmlhbFxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAtPlxuXG5jbGFzcyBMZXZlbCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0QGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuXHRcdEByb290LmFkZChAYW1iaWVudExpZ2h0KTtcdFx0XG5cblx0XHRAcGxheWVyMSA9IG5ldyBQbGF5ZXIoKVxuXHRcdEBhZGQgQHBsYXllcjFcblxuXHRcdCMgYUByb290LmFkZCBtb2RlbExvYWRlci5sb2FkKFwiYXNzZXRzL2dyaWRfY3ViZS5qc1wiKVxuXHRcdEBsYXN0RW5lbXkgPSBEYXRlLm5vdygpXG5cblx0XHQkLmdldEpTT04gXCJhc3NldHMvbGV2ZWxfMS5qc29uXCIsIEBvbkxvYWRcblx0XHRcdFxuXG5cdG9uTG9hZDogKGRhdGEpPT5cblx0XHRAZGF0YSA9IGRhdGFcblx0XHRjb25zb2xlLmxvZyBAZGF0YVxuXHRcdEB0aWxlcyA9IFtdXG5cdFx0Zm9yIHRpbGVzZXQgaW4gZGF0YS50aWxlc2V0c1xuXHRcdFx0QHRpbGVzW3RpbGVzZXQuZmlyc3RnaWRdID0gbmV3IFRpbGVBc3NldChcImFzc2V0cy9cIit0aWxlc2V0LmltYWdlLCB0aWxlc2V0LnRpbGVoZWlnaHQvMzIsIHRpbGVzZXQudGlsZXdpZHRoLzMyKVxuXG5cdFx0Zm92X3JhZGlhbnMgPSA0NSAqIChNYXRoLlBJIC8gMTgwKVxuXHRcdHRhcmdldFogPSA0ODAgLyAoMiAqIE1hdGgudGFuKGZvdl9yYWRpYW5zIC8gMikgKSAvIDMyLjA7XG5cdFx0Zm9yIGQsIGkgaW4gZGF0YS5sYXllcnNbMF0uZGF0YVxuXHRcdFx0aWYgZCA+IDBcblx0XHRcdFx0cm93ID0gTWF0aC5mbG9vcihpIC8gZGF0YS5sYXllcnNbMF0ud2lkdGgpXG5cdFx0XHRcdGNvbCA9IGkgJSBkYXRhLmxheWVyc1swXS53aWR0aFxuXHRcdFx0XHR0aWxlID0gbmV3IFRpbGUobmV3IFRIUkVFLlZlY3RvcjMoY29sLCAxNC41IC0gcm93LCAtdGFyZ2V0WiksIEB0aWxlc1tkXSlcblx0XHRcdFx0dGlsZS5yb290LnBvc2l0aW9uLnggKj0gMjtcblx0XHRcdFx0dGlsZS5yb290LnBvc2l0aW9uLnkgKj0gMjtcblxuXHRcdFx0XHR0aWxlLnJvb3Quc2NhbGUuc2V0KDIsIDIsIDIpO1xuXHRcdFx0XHRAYWRkIHRpbGVcblxuXHRcdGZvciBkLCBpIGluIGRhdGEubGF5ZXJzWzFdLmRhdGFcblx0XHRcdGlmIGQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaSAvIGRhdGEubGF5ZXJzWzBdLndpZHRoKVxuXHRcdFx0XHRjb2wgPSBpICUgZGF0YS5sYXllcnNbMF0ud2lkdGhcblx0XHRcdFx0dGlsZSA9IG5ldyBUaWxlKG5ldyBUSFJFRS5WZWN0b3IzKGNvbCwgMTQuNSAtIHJvdywgMCksIEB0aWxlc1tkXSlcblx0XHRcdFx0QGFkZCB0aWxlXG5cblx0XHRmb3IgbyBpbiBkYXRhLmxheWVyc1syXS5vYmplY3RzIFxuXHRcdFx0ZW5lbXkgPSBuZXcgRW5lbXkobmV3IFRIUkVFLlZlY3RvcjMoby54IC8gMzIsIDcgLSBvLnkgLyAzMiwgdXRpbC5yYW5kb20oLTEsIDEpKSlcblx0XHRcdGVuZW15LmFjdGl2ZSA9IGZhbHNlXG5cdFx0XHRAYWRkIGVuZW15XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHR3b3JsZC5jYW1lcmEucG9zaXRpb24ueCArPSAxICogZGVsdGFcblx0XHRAcGxheWVyMS5yb290LnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cblx0XHRmb3IgY2hpbGQgaW4gQGNoaWxkcmVuXG5cdFx0XHRpZiBjaGlsZC5hY3RpdmUgPT0gZmFsc2UgYW5kIGNoaWxkLnJvb3QucG9zaXRpb24ueCA8IHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ICsgMTBcblx0XHRcdFx0Y2hpbGQuYWN0aXZhdGUoKVxuXG5cdFx0QGNvbGxpc2lvbnMoKVxuXG5cdFx0IyBpZiBEYXRlLm5vdygpID4gQGxhc3RFbmVteSArIDEwMFxuXHRcdCMgXHRAbGFzdEVuZW15ID0gRGF0ZS5ub3coKVxuXHRcdCMgXHRlbmVteSA9IG5ldyBFbmVteShAcm9vdC5wb3NpdGlvbi5jbG9uZSgpLnNldFgoMTUpLnNldFkodXRpbC5yYW5kb20oLTEwLCAxMCkpKVxuXHRcdCMgXHRAYWRkIGVuZW15XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKTtcblxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cdGNvbGxpc2lvbnM6ICgpLT5cblx0XHRmb3IgYSBpbiBAY29sbGlkZXJzXG5cdFx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0XHRmb3IgYiBpbiBAY29sbGlkZXJzXG5cdFx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRcdGlmIGEuY29sbGlkZXJIaXRUeXBlcy5pbmRleE9mKGIuY29sbGlkZXJUeXBlKSA+IC0xXG5cdFx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVXaXRoIGJcblxuXHR0ZXN0Q29sbGlzaW9uOiAoYSwgYiktPlxuXHRcdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IDFcblxuXG5cdFx0XG5cbm1vZGVsTG9hZGVyID0gbmV3IGNvcmUuTW9kZWxMb2FkZXIoKVxuaW5wdXQgPSBuZXcgY29yZS5JbnB1dCgpXG5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMuTGV2ZWwgPSBMZXZlbFxubW9kdWxlLmV4cG9ydHMuY29yZSA9IGNvcmVcbiIsImNsYXNzIEJhc2Vcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAX2V2ZW50cyA9IHt9XG5cblx0b246IChldmVudCwgaGFuZGxlcikgLT5cblx0XHQoQF9ldmVudHNbZXZlbnRdID89IFtdKS5wdXNoIGhhbmRsZXJcblx0XHR0aGlzXG5cblx0b2ZmOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0Zm9yIHN1c3BlY3QsIGluZGV4IGluIEBfZXZlbnRzW2V2ZW50XSB3aGVuIHN1c3BlY3QgaXMgaGFuZGxlclxuXHRcdFx0QF9ldmVudHNbZXZlbnRdLnNwbGljZSBpbmRleCwgMVxuXHRcdHRoaXNcblxuXHR0cmlnZ2VyOiAoZXZlbnQsIGFyZ3MuLi4pID0+XG5cdFx0cmV0dXJuIHRoaXMgdW5sZXNzIEBfZXZlbnRzW2V2ZW50XT9cblx0XHRmb3IgaSBpbiBbQF9ldmVudHNbZXZlbnRdLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0aGFuZGxlciA9IEBfZXZlbnRzW2V2ZW50XVtpXVxuXHRcdFx0aGFuZGxlci5hcHBseSB0aGlzLCBhcmdzXG5cblx0XHR0aGlzXG5cblxuY2xhc3MgV29ybGQgZXh0ZW5kcyBCYXNlXG5cdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRzdXBlcigpXG5cblx0XHR3ID0gNjQwXG5cdFx0aCA9IDQ4MFxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIHcgLyBoLCAxLCAxMDAwMClcblx0XHRmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuXG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdGFyZ2V0WlxuXHRcdFxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0XG5cdFx0QHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKVxuXHRcdEByZW5kZXJlci5zZXRTaXplIHcsIGhcblx0XHQjIEByZW5kZXJlci5zb3J0T2JqZWN0cyA9IGZhbHNlXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG5cdFx0QGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKClcblx0XHRAc3RhdHMgPSBuZXcgU3RhdHMoKTtcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuXHRcdCQoXCIjc2h1bXBcIilbMF0uYXBwZW5kQ2hpbGQoIEBzdGF0cy5kb21FbGVtZW50IClcblxuXHRcdHJldHVybiB0aGlzXG5cblx0YW5pbWF0ZTogPT5cblx0XHRkZWx0YSA9IEBjbG9jay5nZXREZWx0YSgpXHRcdFxuXHRcdCNkb24ndCB1cGRhdGUgYWZ0ZXIgbG9uZyBmcmFtZSAoZml4ZXMgaXNzdWUgd2l0aCBzd2l0Y2hpbmcgdGFicylcblx0XHRpZiAoZGVsdGEgPCAuNSkgXG5cdFx0XHRAdHJpZ2dlciBcInVwZGF0ZVwiLCBkZWx0YVxuXG5cdFx0QHJlbmRlcmVyLnJlbmRlciBAc2NlbmUsIEBjYW1lcmFcblx0XHRAc3RhdHMudXBkYXRlKClcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGVcblx0XHRyZXR1cm5cblxuXHRzdGFydDogLT5cblx0XHRAYW5pbWF0ZSgpXG5cblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoQGdlb21ldHJ5LCBAbWF0ZXJpYWwpLT5cblx0XHRzdXBlcigpXG5cdFx0QG1hdGVyaWFsID0gdW5kZWZpbmVkXG5cdFx0QGdlb21ldHJ5ID0gdW5kZWZpbmVkXG5cdFx0QHRleHR1cmUgPSB1bmRlZmluZWRcblx0XHRAc3RhdHVzID0gdW5kZWZpbmVkXG5cblx0bG9hZDogKGZpbGVOYW1lKT0+XG5cdFx0anNvbkxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKCk7XG5cdFx0anNvbkxvYWRlci5sb2FkIGZpbGVOYW1lLCAoZ2VvbWV0cnksIG1hdGVyaWFscywgb3RoZXJzLi4uKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbCggbWF0ZXJpYWxzIClcblx0XHRcdCMgQG1hdGVyaWFsID0gbWF0ZXJpYWxzWzBdXG5cdFx0XHRAZ2VvbWV0cnkgPSBnZW9tZXRyeVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXHRsb2FkUG5nOiAoZmlsZU5hbWUpPT5cblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgZmlsZU5hbWUsIHt9LCAoKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdFx0IyB0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0XHQjIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cdFx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdFx0IyBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSAxLCAxXG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHRjb25zb2xlLmxvZyBcImxvYWRwbmdcIiwgdGhpc1xuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuY2xhc3MgTW9kZWxMb2FkZXJcblx0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QGRlZmF1bHRHZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMSwxLDEpXG5cdFx0QGRlZmF1bHRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0Y29sb3I6IDB4MDBmZjAwXG5cdFx0XHR3aXJlZnJhbWU6IHRydWVcblx0XHRcdG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy93aGl0ZS5wbmdcIlxuXG5cdFx0QGxvYWRlZE1vZGVscyA9IHt9XG5cblx0bG9hZDogKGZpbGVOYW1lKS0+XG5cblx0XHQjIGlmIGFscmVhZHkgbG9hZGVkLCBqdXN0IG1ha2UgdGhlIG5ldyBtZXNoIGFuZCByZXR1cm5cblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXT8gJiYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uc3RhdHVzID09IFwicmVhZHlcIlxuXHRcdFx0Y29uc29sZS5sb2cgXCJjYWNoZWRcIlxuXHRcdFx0cmV0dXJuIG5ldyBUSFJFRS5NZXNoKEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLmdlb21ldHJ5LCBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5tYXRlcmlhbClcblxuXG5cdFx0IyBpZiByZXF1ZXN0ZWQgYnV0IG5vdCByZWFkeVxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XHRtb2RlbCA9IEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XG5cdFx0IyBpZiBub3QgcmVxdWVzdGVkIGJlZm9yZVxuXHRcdGVsc2Vcblx0XHRcdG1vZGVsID0gbmV3IE1vZGVsKClcblx0XHRcdGlmIGZpbGVOYW1lLnNwbGl0KCcuJykucG9wKCkgPT0gXCJqc1wiXG5cdFx0XHRcdG1vZGVsLmxvYWQoZmlsZU5hbWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG1vZGVsLmxvYWRQbmcoZmlsZU5hbWUpXG5cdFx0XHRAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXSA9IG1vZGVsXG5cblx0XHRvYmplY3QgPSBuZXcgVEhSRUUuTWVzaCggQGRlZmF1bHRHZW9tZXRyeSwgQGRlZmF1bHRNYXRlcmlhbCApXG5cdFx0bW9kZWwub24gXCJzdWNjZXNzXCIsIChtKS0+XG5cdFx0XHRvYmplY3QuZ2VvbWV0cnkgPSBtLmdlb21ldHJ5XHRcdFx0XG5cdFx0XHRvYmplY3QubWF0ZXJpYWwgPSBtLm1hdGVyaWFsXG5cdFx0XHRtLm9mZiBcInN1Y2Nlc3NcIiwgYXJndW1lbnRzLmNhbGxlZSAjcmVtb3ZlIHRoaXMgaGFuZGxlciBvbmNlIHVzZWRcblx0XHRyZXR1cm4gb2JqZWN0XG5cbmNsYXNzIElucHV0XG5cdGtleU1hcDogXG5cdFx0XCIzOFwiOlwidXBcIlxuXHRcdFwiODdcIjpcInVwXCIgI3dcblx0XHRcIjQwXCI6XCJkb3duXCJcblx0XHRcIjgzXCI6XCJkb3duXCIgI3Ncblx0XHRcIjM3XCI6XCJsZWZ0XCJcblx0XHRcIjY1XCI6XCJsZWZ0XCIgI2Fcblx0XHRcIjM5XCI6XCJyaWdodFwiXG5cdFx0XCI2OFwiOlwicmlnaHRcIiAjZFxuXHRcdFwiMzJcIjpcImZpcmVfcHJpbWFyeVwiICNzcGFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxuXG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgQGtleU1hcFxuXHRcdFx0QGtleVN0YXRlc1t2YWx1ZV0gPSBmYWxzZTtcblxuXHRcdCQod2luZG93KS5rZXlkb3duIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSB0cnVlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0JCh3aW5kb3cpLmtleXVwIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSBmYWxzZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuIyBtb2R1bGUuZXhwb3J0cy5CYXNlID0gQmFzZVxubW9kdWxlLmV4cG9ydHMuV29ybGQgPSBXb3JsZFxubW9kdWxlLmV4cG9ydHMuTW9kZWwgPSBNb2RlbFxubW9kdWxlLmV4cG9ydHMuTW9kZWxMb2FkZXIgPSBNb2RlbExvYWRlclxubW9kdWxlLmV4cG9ydHMuSW5wdXQgPSBJbnB1dFxuIiwiZXhwb3J0cy5hZnRlciA9IChkZWxheSwgZnVuYyktPlxuXHRzZXRUaW1lb3V0IGZ1bmMsIGRlbGF5XG5cbmV4cG9ydHMucmFuZG9tID0gKG1pbiwgbWF4KS0+XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4iXX0=
