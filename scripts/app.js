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
  return $("#levelChildren").text("level.children = " + shump.Game.level.children.length);
};

shump.Game.world.on("update", updateDebug);


},{"./shump/shump.coffee":18}],2:[function(require,module,exports){
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


},{"./GameObject.coffee":6}],4:[function(require,module,exports){
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


},{"./CollisionObject.coffee":3,"./Particle.coffee":10,"./Sound.coffee":14,"./Weapons.coffee":16}],5:[function(require,module,exports){
var Game, GameObject, Level, Score, Screens, Sound, World, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

util = require('../util.coffee');

World = require('./World.coffee');

Sound = require('./Sound.coffee');

Score = require('./Score.coffee');

Level = require('./Level.coffee');

GameObject = require('./GameObject.coffee');

Screens = require('./Screens.coffee');

Game = (function() {
  function Game() {
    this.gameOver = __bind(this.gameOver, this);
    this.resetPlayer = __bind(this.resetPlayer, this);
    this.world = new World();
    this.homeScreen = new Screens.HomeScreen();
    this.gameOverScreen = new Screens.GameOverScreen();
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
    return this.level = new Level.Level(this.world);
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

exports.Game = Game;


},{"../util.coffee":19,"./GameObject.coffee":6,"./Level.coffee":8,"./Score.coffee":12,"./Screens.coffee":13,"./Sound.coffee":14,"./World.coffee":17}],6:[function(require,module,exports){
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


},{}],7:[function(require,module,exports){
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


},{}],8:[function(require,module,exports){
var CollisionObject, GameObject, Level, Player, Tiled,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Tiled = require('./Tiled.coffee');

Player = require('./Player.coffee');

CollisionObject = require('./CollisionObject.coffee');

GameObject = require('./GameObject.coffee');

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

exports.Level = Level;


},{"./CollisionObject.coffee":3,"./GameObject.coffee":6,"./Player.coffee":11,"./Tiled.coffee":15}],9:[function(require,module,exports){
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


},{"./Base.coffee":2}],10:[function(require,module,exports){
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


},{"../util.coffee":19,"./GameObject.coffee":6}],11:[function(require,module,exports){
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
    return Player.__super__.die.call(this);
  };

  return Player;

})(CollisionObject);

module.exports = Player;


},{"../util.coffee":19,"./CollisionObject.coffee":3,"./Input.coffee":7,"./ModelLoader.coffee":9,"./Particle.coffee":10,"./Sound.coffee":14,"./Weapons.coffee":16,"./shump.coffee":18}],12:[function(require,module,exports){
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


},{}],13:[function(require,module,exports){
var GameObject, GameOverScreen, HomeScreen,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

GameObject = require('./GameObject.coffee');

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

exports.HomeScreen = HomeScreen;

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

exports.GameOverScreen = GameOverScreen;


},{"./GameObject.coffee":6}],14:[function(require,module,exports){
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


},{}],15:[function(require,module,exports){
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


},{"./Enemies.coffee":4}],16:[function(require,module,exports){
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


},{"./CollisionObject.coffee":3,"./Particle.coffee":10,"./Score.coffee":12}],17:[function(require,module,exports){
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


},{"./Base.coffee":2,"./Input.coffee":7}],18:[function(require,module,exports){
var Game;

Game = require('./Game.coffee');

module.exports.Game = new Game.Game();


},{"./Game.coffee":5}],19:[function(require,module,exports){
exports.after = function(delay, func) {
  return setTimeout(func, delay);
};

exports.random = function(min, max) {
  return Math.random() * (max - min) + min;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9HYW1lT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvSW5wdXQuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9MZXZlbC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NjcmVlbnMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9Tb3VuZC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1RpbGVkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dvcmxkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvc2h1bXAuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsQ0FFQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxLQUFqQixDQUF1QixTQUFBLEdBQUE7QUFFdEIsTUFBQSxzRUFBQTtBQUFBLEVBQUEsQ0FBQSxDQUFFLFFBQUYsQ0FBWSxDQUFBLENBQUEsQ0FBRSxDQUFDLHVCQUFmLENBQXVDLE9BQU8sQ0FBQyxvQkFBL0MsQ0FBQSxDQUFBO0FBQUEsRUFFQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLGVBQUYsQ0FGVCxDQUFBO0FBQUEsRUFHQSxZQUFBLEdBQWUsTUFB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QUFuQixFQUEwQixJQUFDLENBQUEsTUFBM0IsRUFBbUMsSUFBQyxDQUFBLFlBQXBDLEVBQWtELElBQWxELENBTEEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxZQUFsQixFQUFnQyxJQUFDLENBQUEsYUFBakMsQ0FSQSxDQUFBO0FBQUEsSUFVQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQVZBLENBQUE7QUFBQSxJQVdBLHFCQUFBLENBQXNCLElBQUMsQ0FBQSxPQUF2QixDQVhBLENBRFE7RUFBQSxDQTdGVCxDQUFBOztBQUFBLGtCQTRHQSxLQUFBLEdBQU8sU0FBQSxHQUFBO1dBQ04sSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQURNO0VBQUEsQ0E1R1AsQ0FBQTs7ZUFBQTs7R0FGbUIsS0FKcEIsQ0FBQTs7QUFBQSxNQXVITSxDQUFDLE9BQVAsR0FBaUIsS0F2SGpCLENBQUE7Ozs7QUNBQSxJQUFBLElBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBQVAsQ0FBQTs7QUFBQSxNQUdNLENBQUMsT0FBTyxDQUFDLElBQWYsR0FBMEIsSUFBQSxJQUFJLENBQUMsSUFBTCxDQUFBLENBSDFCLENBQUE7Ozs7QUNBQSxPQUFPLENBQUMsS0FBUixHQUFnQixTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7U0FDZixVQUFBLENBQVcsSUFBWCxFQUFpQixLQUFqQixFQURlO0FBQUEsQ0FBaEIsQ0FBQTs7QUFBQSxPQUdPLENBQUMsTUFBUixHQUFpQixTQUFDLEdBQUQsRUFBTSxHQUFOLEdBQUE7QUFDaEIsU0FBTyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsQ0FBQyxHQUFBLEdBQU0sR0FBUCxDQUFoQixHQUE4QixHQUFyQyxDQURnQjtBQUFBLENBSGpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInNodW1wID0gcmVxdWlyZSgnLi9zaHVtcC9zaHVtcC5jb2ZmZWUnKVxuXG4kKFwiI2Z1bGxzY3JlZW5cIikuY2xpY2sgKCktPlxuXHRcblx0JChcIiNzaHVtcFwiKVswXS53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbihFbGVtZW50LkFMTE9XX0tFWUJPQVJEX0lOUFVUKTtcblx0XG5cdGNhbnZhcyA9ICQoXCIjc2h1bXAgY2FudmFzXCIpXG5cdGNhbnZhc0FzcGVjdCA9IGNhbnZhcy53aWR0aCgpIC8gY2FudmFzLmhlaWdodCgpXG5cblx0Y29udGFpbmVyV2lkdGggPSAkKHdpbmRvdykud2lkdGgoKVxuXHRjb250YWluZXJIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KClcblx0Y29udGFpbmVyQXNwZWN0ID0gY29udGFpbmVyV2lkdGggLyBjb250YWluZXJIZWlnaHRcblx0Y29uc29sZS5sb2cgY2FudmFzQXNwZWN0LCAkKHdpbmRvdykud2lkdGgoKSAsICQod2luZG93KS5oZWlnaHQoKSwgY29udGFpbmVyQXNwZWN0XG5cdFxuXHRpZiBjYW52YXNBc3BlY3QgPCBjb250YWluZXJBc3BlY3Rcblx0XHRjb25zb2xlLmxvZyBcIm1hdGNoIGhlaWdodFwiXG5cdFx0Y2FudmFzLmhlaWdodCBjb250YWluZXJIZWlnaHRcblx0XHRjYW52YXMud2lkdGggY29udGFpbmVySGVpZ2h0ICogY2FudmFzQXNwZWN0XG5cdGVsc2Vcblx0XHRjb25zb2xlLmxvZyBcIm1hdGNoIHdpZHRoXCJcblx0XHRjYW52YXMud2lkdGggY29udGFpbmVyV2lkdGhcblx0XHRjYW52YXMuaGVpZ2h0IGNvbnRhaW5lcldpZHRoIC8gY2FudmFzQXNwZWN0XG5cbiQoXCIjZGVidWdcIikuYXBwZW5kKFwiXCJcIjxzcGFuIGlkPVwibGV2ZWxDaGlsZHJlblwiPlwiXCJcIilcblxuXG51cGRhdGVEZWJ1ZyA9ICgpLT5cblx0JChcIiNsZXZlbENoaWxkcmVuXCIpLnRleHQgXCJcIlwibGV2ZWwuY2hpbGRyZW4gPSAje3NodW1wLkdhbWUubGV2ZWwuY2hpbGRyZW4ubGVuZ3RofVwiXCJcIlxuXG5cbnNodW1wLkdhbWUud29ybGQub24gXCJ1cGRhdGVcIiwgdXBkYXRlRGVidWdcblxuXG5cbiMgY29uc29sZS5sb2cgXCJoaWRlcmFcIlxuXG5cbiIsImNsYXNzIEJhc2Vcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAX2V2ZW50cyA9IHt9XG5cblx0b246IChldmVudCwgaGFuZGxlcikgLT5cblx0XHQoQF9ldmVudHNbZXZlbnRdID89IFtdKS5wdXNoIGhhbmRsZXJcblx0XHRyZXR1cm4gdGhpc1xuXG5cdG9mZjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdGZvciBzdXNwZWN0LCBpbmRleCBpbiBAX2V2ZW50c1tldmVudF0gd2hlbiBzdXNwZWN0IGlzIGhhbmRsZXJcblx0XHRcdEBfZXZlbnRzW2V2ZW50XS5zcGxpY2UgaW5kZXgsIDFcblx0XHRyZXR1cm4gdGhpc1xuXG5cdHRyaWdnZXI6IChldmVudCwgYXJncy4uLikgPT5cblx0XHRyZXR1cm4gdGhpcyB1bmxlc3MgQF9ldmVudHNbZXZlbnRdP1xuXHRcdGZvciBpIGluIFtAX2V2ZW50c1tldmVudF0ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRoYW5kbGVyID0gQF9ldmVudHNbZXZlbnRdW2ldXG5cdFx0XHRoYW5kbGVyLmFwcGx5IHRoaXMsIGFyZ3Ncblx0XHRyZXR1cm4gdGhpc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBDb2xsaXNpb25PYmplY3QgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSB1bmRlZmluZWRcblx0XHRAY29sbGlkZXJIaXRUeXBlcyA9IFtdXG5cdFx0QGhwID0gMVxuXHRcdEBkcCA9IDFcblx0XHRAY29sbGlzaW9uUmFkaXVzID0gLjZcblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHRhcmdldC50YWtlRGFtYWdlKEBkcClcblx0XHQjIEBkaWUoKVxuXHRcdCMgZ2FtZU9iamVjdC5kaWUoKVxuXG5cdHRha2VEYW1hZ2U6IChkYW1hZ2UpLT5cblx0XHRAaHAgLT0gZGFtYWdlXG5cdFx0aWYgQGhwIDw9IDAgXG5cdFx0XHRAZGllKClcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb25PYmplY3RcbiIsIlxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblxuXG5jbGFzcyBCYXNpYyBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRlbmVteVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL2VuZW1pZXMvZW5lbXkucG5nXCJcblx0ZW5lbXlNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBlbmVteVRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0ZW5lbXlHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImVuZW15XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwicGxheWVyXCJcblxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBlbmVteUdlb21ldHJ5LCBlbmVteU1hdGVyaWFsXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XHRAYWdlID0gMFxuXHRcdEBoYXNGaXJlZCA9IGZhbHNlXG5cblx0XHRAYWN0aXZlID0gZmFsc2VcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVxuXHRcdEBhZ2UgKz0gZGVsdGFcblx0XHRcblx0XG5cdGRpZTogKCktPlxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAzKVxuXHRcdHN1cGVyKClcblxuXG5jbGFzcyBTaW5XYXZlIGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSAtMSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBkZWx0YSAqIE1hdGguc2luKEBhZ2UpXG5cbmNsYXNzIERhcnQgZXh0ZW5kcyBCYXNpY1xuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVx0XHRcblx0XHRpZiBAYWdlIDwgLjVcblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gLTIwICogZGVsdGFcblx0XHRlbHNlIGlmIEBhZ2UgPCAzXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdGVsc2Vcblx0XHRcdEBkaWUoKVxuXG5cdFx0aWYgQGFnZSA+IDEgYW5kIG5vdCBAaGFzRmlyZWRcblx0XHRcdEBoYXNGaXJlZCA9IHRydWVcblx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFxuXHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuRW5lbXlCdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cblx0XHRidWxsZXQuY29sbGlkZXJUeXBlID0gXCJlbmVteV9idWxsZXRcIlxuXHRcdGJ1bGxldC5jb2xsaWRlckhpdFR5cGVzID0gW1wicGxheWVyXCJdXG5cdFx0YnVsbGV0LmFuZ2xlID0gTWF0aC5QSSAtIC4yNVxuXHRcdGJ1bGxldC5zcGVlZCA9IDVcblxuXHRcdEBwYXJlbnQuYWRkIGJ1bGxldFx0XG5cblx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5FbmVteUJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJICsgLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXG5leHBvcnRzLkJhc2ljID0gQmFzaWNcbmV4cG9ydHMuU2luV2F2ZSA9IFNpbldhdmVcbmV4cG9ydHMuRGFydCA9IERhcnRcblxuIyBzdXBlcihkZWx0YSlcblx0XHQjIGlmIEBhZ2UgPCAxXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMlxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi55ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDIuMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdCMgZWxzZVxuXHRcdCMgXHRAZGllKClcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuV29ybGQgPSByZXF1aXJlICcuL1dvcmxkLmNvZmZlZSdcblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5TY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuTGV2ZWwgPSByZXF1aXJlICcuL0xldmVsLmNvZmZlZSdcblxuR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5cblNjcmVlbnMgPSByZXF1aXJlICcuL1NjcmVlbnMuY29mZmVlJ1xuXG5cbmNsYXNzIEdhbWVcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHQjc2V0dXAgd29ybGRcblx0XHRAd29ybGQgPSBuZXcgV29ybGQoKVxuXHRcdEBob21lU2NyZWVuID0gbmV3IFNjcmVlbnMuSG9tZVNjcmVlbigpXG5cdFx0QGdhbWVPdmVyU2NyZWVuID0gbmV3IFNjcmVlbnMuR2FtZU92ZXJTY3JlZW4oKVxuXHRcdEBsb2FkTGV2ZWwoKVxuXHRcdEBsaXZlcyA9IDNcblxuXHRcdFNjb3JlLmRpc3BsYXlFbGVtZW50ID0gJChcIlwiXCI8aDE+U2NvcmU6PC9oMT5cIlwiXCIpLmFwcGVuZFRvICQoXCIjc2h1bXBcIilcblx0XHRAbGl2ZXNFbGVtZW50ID0gJChcIlwiXCI8aDE+TGl2ZXM6PC9oMT5cIlwiXCIpLmFwcGVuZFRvICQoXCIjc2h1bXBcIilcblx0XHRcblx0XHRcblx0XHRAc3RhdGUgPSBcImhvbWVcIlxuXHRcdEB3b3JsZC5zY2VuZS5hZGQgQGhvbWVTY3JlZW4ucm9vdFxuXG5cblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0aWYgQHN0YXRlID09IFwiaG9tZVwiXG5cdFx0XHRcdEB3b3JsZC5zY2VuZS5yZW1vdmUgQGhvbWVTY3JlZW4ucm9vdFxuXHRcdFx0XHRAc3RhdGUgPSBcInBsYXlcIlxuXHRcdFx0XHRAc3RhcnRMZXZlbCgpXG5cdFx0XHRcdHJldHVyblxuXG5cdFx0XHRpZiBAc3RhdGUgPT0gXCJnYW1lX292ZXJcIlxuXHRcdFx0XHRAd29ybGQuc2NlbmUucmVtb3ZlIEBnYW1lT3ZlclNjcmVlbi5yb290XG5cdFx0XHRcdEB3b3JsZC5zY2VuZS5hZGQgQGhvbWVTY3JlZW4ucm9vdFxuXHRcdFx0XHRAc3RhdGUgPSBcImhvbWVcIlxuXHRcdFx0XHRyZXR1cm5cblxuXHRcdHV0aWwuYWZ0ZXIgMSwgKCk9PlxuXHRcdFx0QHdvcmxkLnN0YXJ0KClcblxuXHRsb2FkTGV2ZWw6ICgpLT5cblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggPSAwO1xuXHRcdEBsZXZlbCA9IG5ldyBMZXZlbC5MZXZlbChAd29ybGQpXG5cdFxuXHRzdGFydExldmVsOiAoKS0+XG5cdFx0QHdvcmxkLnNjZW5lLmFkZCBAbGV2ZWwucm9vdFxuXHRcdEB3b3JsZC5vbiBcInVwZGF0ZVwiLCBAbGV2ZWwudXBkYXRlXG5cdFx0XG5cdHJlc2V0UGxheWVyOiAoKT0+XG5cdFx0QGxpdmVzLS1cblx0XHRAbGl2ZXNFbGVtZW50LnRleHQgXCJMaXZlczogI3tAbGl2ZXN9XCJcblxuXHRcdGlmIEBsaXZlcyA+IDBcblx0XHRcdEBsZXZlbC5wbGF5ZXIxID0gbmV3IFBsYXllcigpXG5cdFx0XHRAbGV2ZWwucGxheWVyMS5yb290LnBvc2l0aW9uLnggPSBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnhcblx0XHRcdEBsZXZlbC5hZGQgQGxldmVsLnBsYXllcjFcblx0XHRlbHNlXG5cdFx0XHR1dGlsLmFmdGVyIDIwMDAsIEBnYW1lT3ZlclxuXG5cdGdhbWVPdmVyOiAoKT0+XG5cdFx0Y29uc29sZS5sb2cgXCJnYW1lIG92ZXJcIlxuXHRcdFxuXHRcdEB3b3JsZC5zY2VuZS5yZW1vdmUgQGxldmVsLnJvb3Rcblx0XHRAd29ybGQub2ZmIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblxuXHRcdEBsb2FkTGV2ZWwoKVxuXHRcdEB3b3JsZC5zY2VuZS5hZGQgQGdhbWVPdmVyU2NyZWVuLnJvb3Rcblx0XHRAc3RhdGUgPSBcImdhbWVfb3ZlclwiXG5cblxuZXhwb3J0cy5HYW1lID0gR2FtZVxuIiwiY2xhc3MgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAcGFyZW50ID0gdW5kZWZpbmVkXG5cdFx0QGNoaWxkcmVuID0gW11cblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0QGRlYWQgPSBmYWxzZVxuXHRcdEBhY3RpdmUgPSB0cnVlXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRmb3IgaSBpbiBbQGNoaWxkcmVuLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0Y2hpbGQgPSBAY2hpbGRyZW5baV1cblx0XHRcdGlmIGNoaWxkLmRlYWRcblx0XHRcdFx0QHJlbW92ZSBjaGlsZFxuXHRcdFx0XHRjb250aW51ZVxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlXG5cdFx0XHRcdGNoaWxkLnVwZGF0ZSBkZWx0YSBcblx0XG5cdGFjdGl2YXRlOiAoKS0+XG5cdFx0QGFjdGl2ZSA9IHRydWU7XG5cdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gdGhpc1xuXHRcdEBjaGlsZHJlbi5wdXNoKGdhbWVPYmplY3QpXG5cdFx0QHJvb3QuYWRkKGdhbWVPYmplY3Qucm9vdClcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRAcm9vdC5yZW1vdmUoZ2FtZU9iamVjdC5yb290KVxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gbnVsbFxuXHRcdGkgPSAgQGNoaWxkcmVuLmluZGV4T2YoZ2FtZU9iamVjdClcblx0XHRpZiBpID49IDBcblx0XHRcdEBjaGlsZHJlbi5zcGxpY2UoaSwgMSk7XG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRkaWU6ICgpLT5cblx0XHRAZGVhZCA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZU9iamVjdFxuIiwiY2xhc3MgSW5wdXRcblx0a2V5TWFwOiBcblx0XHRcIjM4XCI6XCJ1cFwiICN1cCBhcnJvd1xuXHRcdFwiODdcIjpcInVwXCIgI3dcblx0XHRcIjQwXCI6XCJkb3duXCIgI2Rvd24gYXJyb3dcblx0XHRcIjgzXCI6XCJkb3duXCIgI3Ncblx0XHRcIjM3XCI6XCJsZWZ0XCIgI2xlZnQgYXJyb3dcblx0XHRcIjY1XCI6XCJsZWZ0XCIgI2Fcblx0XHRcIjM5XCI6XCJyaWdodFwiICNyaWdodCBhcnJvd1xuXHRcdFwiNjhcIjpcInJpZ2h0XCIgI2Rcblx0XHRcIjMyXCI6XCJmaXJlX3ByaW1hcnlcIiAjc3BhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAa2V5U3RhdGVzID0gW11cblxuXHRcdGZvciBrZXksIHZhbHVlIG9mIEBrZXlNYXBcblx0XHRcdEBrZXlTdGF0ZXNbdmFsdWVdID0gZmFsc2U7XG5cblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0IyBjb25zb2xlLmxvZyBlLndoaWNoXG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSB0cnVlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0JCh3aW5kb3cpLmtleXVwIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSBmYWxzZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuaW5wdXQgPSBuZXcgSW5wdXQoKVxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dFxuIiwiVGlsZWQgPSByZXF1aXJlICcuL1RpbGVkLmNvZmZlZSdcblBsYXllciA9IHJlcXVpcmUgJy4vUGxheWVyLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcbkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBMZXZlbCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IChAd29ybGQpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGNvbGxpZGVycyA9IFtdXG5cblx0XHRAYW1iaWVudExpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XG5cdFx0QHJvb3QuYWRkKEBhbWJpZW50TGlnaHQpXG5cblx0XHRAcGxheWVyMSA9IG5ldyBQbGF5ZXIoKVxuXHRcdEBhZGQgQHBsYXllcjFcblxuXHRcdFxuXHRcdG1hcFByb21pc2UgPSBUaWxlZC5sb2FkKCdhc3NldHMvbGV2ZWxfMS5qc29uJylcblx0XHRyZWFkeVByb21pc2UgPSBtYXBQcm9taXNlLnRoZW4gKG1hcCk9PlxuXHRcdFx0QHJvb3QuYWRkKG1hcC5sYXllcnMuYmFja2dyb3VuZC5yb290KVxuXHRcdFx0bWFwLmxheWVycy5iYWNrZ3JvdW5kLnJvb3QucG9zaXRpb24ueSA9IDcuNVxuXG5cdFx0XHRAcm9vdC5hZGQobWFwLmxheWVycy5taWRncm91bmQucm9vdClcblx0XHRcdG1hcC5sYXllcnMubWlkZ3JvdW5kLnJvb3QucG9zaXRpb24ueSA9IDcuNVxuXG5cdFx0XHRmb3Igb2JqZWN0IGluIG1hcC5sYXllcnMuZW5lbWllcy5vYmplY3RzXG5cdFx0XHRcdEBhZGQgb2JqZWN0XG5cblx0XHRcblx0XHRyZWFkeVByb21pc2UuY2F0Y2ggKGVycm9yKS0+XG5cdFx0XHRjb25zb2xlLmVycm9yIGVycm9yXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlID09IGZhbHNlIGFuZCBjaGlsZC5yb290LnBvc2l0aW9uLnggPCBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKyAxMFxuXHRcdFx0XHRjaGlsZC5hY3RpdmF0ZSgpXG5cblx0XHRAY29sbGlzaW9ucygpXG5cblx0XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKTtcblxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cdGNvbGxpc2lvbnM6ICgpLT5cblx0XHRmb3IgYSBpbiBAY29sbGlkZXJzXG5cdFx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0XHRmb3IgYiBpbiBAY29sbGlkZXJzXG5cdFx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRcdGlmIGEuY29sbGlkZXJIaXRUeXBlcy5pbmRleE9mKGIuY29sbGlkZXJUeXBlKSA+IC0xXG5cdFx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVJbnRvIGJcblxuXHR0ZXN0Q29sbGlzaW9uOiAoYSwgYiktPlxuXHRcdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IGEuY29sbGlzaW9uUmFkaXVzICsgYi5jb2xsaXNpb25SYWRpdXNcblxuXG5leHBvcnRzLkxldmVsID0gTGV2ZWxcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IChAZ2VvbWV0cnksIEBtYXRlcmlhbCktPlxuXHRcdHN1cGVyKClcblx0XHRAbWF0ZXJpYWwgPSB1bmRlZmluZWRcblx0XHRAZ2VvbWV0cnkgPSB1bmRlZmluZWRcblx0XHRAdGV4dHVyZSA9IHVuZGVmaW5lZFxuXHRcdEBzdGF0dXMgPSB1bmRlZmluZWRcblxuXHRsb2FkOiAoZmlsZU5hbWUpPT5cblx0XHRqc29uTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblx0XHRqc29uTG9hZGVyLmxvYWQgZmlsZU5hbWUsIChnZW9tZXRyeSwgbWF0ZXJpYWxzLCBvdGhlcnMuLi4pPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKCBtYXRlcmlhbHMgKVxuXHRcdFx0IyBAbWF0ZXJpYWwgPSBtYXRlcmlhbHNbMF1cblx0XHRcdEBnZW9tZXRyeSA9IGdlb21ldHJ5XG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cdGxvYWRQbmc6IChmaWxlTmFtZSk9PlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBmaWxlTmFtZSwge30sICgpPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0XHQjIHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRcdCMgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblx0XHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0XHQjIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5IDEsIDFcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImxvYWRwbmdcIiwgdGhpc1xuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXG5cbmNsYXNzIE1vZGVsTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QGRlZmF1bHRHZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMSwxLDEpXG5cdFx0QGRlZmF1bHRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0Y29sb3I6IDB4MDBmZjAwXG5cdFx0XHR3aXJlZnJhbWU6IHRydWVcblx0XHRcdG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy91dGlsL3doaXRlLnBuZ1wiXG5cblx0XHRAbG9hZGVkTW9kZWxzID0ge31cblxuXHRsb2FkOiAoZmlsZU5hbWUpLT5cblxuXHRcdCMgaWYgYWxyZWFkeSBsb2FkZWQsIGp1c3QgbWFrZSB0aGUgbmV3IG1lc2ggYW5kIHJldHVyblxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdPyAmJiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5zdGF0dXMgPT0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJjYWNoZWRcIlxuXHRcdFx0cmV0dXJuIG5ldyBUSFJFRS5NZXNoKEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLmdlb21ldHJ5LCBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5tYXRlcmlhbClcblxuXG5cdFx0IyBpZiByZXF1ZXN0ZWQgYnV0IG5vdCByZWFkeVxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XHRtb2RlbCA9IEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XG5cdFx0IyBpZiBub3QgcmVxdWVzdGVkIGJlZm9yZVxuXHRcdGVsc2Vcblx0XHRcdG1vZGVsID0gbmV3IE1vZGVsKClcblx0XHRcdGlmIGZpbGVOYW1lLnNwbGl0KCcuJykucG9wKCkgPT0gXCJqc1wiXG5cdFx0XHRcdG1vZGVsLmxvYWQoZmlsZU5hbWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG1vZGVsLmxvYWRQbmcoZmlsZU5hbWUpXG5cdFx0XHRAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXSA9IG1vZGVsXG5cblx0XHRvYmplY3QgPSBuZXcgVEhSRUUuTWVzaCggQGRlZmF1bHRHZW9tZXRyeSwgQGRlZmF1bHRNYXRlcmlhbCApXG5cdFx0bW9kZWwub24gXCJzdWNjZXNzXCIsIChtKS0+XG5cdFx0XHRvYmplY3QuZ2VvbWV0cnkgPSBtLmdlb21ldHJ5XHRcdFx0XG5cdFx0XHRvYmplY3QubWF0ZXJpYWwgPSBtLm1hdGVyaWFsXG5cdFx0XHRtLm9mZiBcInN1Y2Nlc3NcIiwgYXJndW1lbnRzLmNhbGxlZSAjcmVtb3ZlIHRoaXMgaGFuZGxlciBvbmNlIHVzZWRcblx0XHRyZXR1cm4gb2JqZWN0XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZWxMb2FkZXJcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xudXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5jbGFzcyBQYXJ0aWNsZSBleHRlbmRzIEdhbWVPYmplY3Rcblx0cGFydGljbGVUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9wYXJ0aWNsZXMvcGFydGljbGUyLnBuZ1wiXG5cdHBhcnRpY2xlTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogcGFydGljbGVUZXh0dXJlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoV3JpdGU6IGZhbHNlXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0YmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblxuXHRwYXJ0aWNsZUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24sIGVuZXJneSktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAxMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHBhcnRpY2xlR2VvbWV0cnksIHBhcnRpY2xlTWF0ZXJpYWxcblx0XHRcblx0XHRAdmVsb2NpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMyh1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpKTtcblx0XHRAdmVsb2NpdHkubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoZW5lcmd5KVxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAdmVsb2NpdHkubXVsdGlwbHlTY2FsYXIoLjk5KVxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnggKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gQHZlbG9jaXR5LnkgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnogKz0gQHZlbG9jaXR5LnogKiBkZWx0YVxuXHRcdHMgPSAxLSAoKERhdGUubm93KCkgLSBAYmlydGgpIC8gQHRpbWVUb0xpdmUpICsgLjAxXG5cdFx0QHJvb3Quc2NhbGUuc2V0KHMsIHMsIHMpXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZVxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuTW9kZWxMb2FkZXIgPSByZXF1aXJlICcuL01vZGVsTG9hZGVyLmNvZmZlZSdcbklucHV0ID0gcmVxdWlyZSAnLi9JbnB1dC5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5TaHVtcCA9IHJlcXVpcmUgJy4vc2h1bXAuY29mZmVlJ1xuXG5tb2RlbExvYWRlciA9IG5ldyBNb2RlbExvYWRlcigpXG4jIGlucHV0ID0gbmV3IElucHV0KClcblxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0XG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwicGxheWVyXCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlfYnVsbGV0XCJcblxuXHRcdG1vZGVsID0gbW9kZWxMb2FkZXIubG9hZChcImFzc2V0cy9zaGlwcy9zaGlwMi5qc1wiKVxuXHRcdEByb290LmFkZCBtb2RlbFxuXHRcdHV0aWwuYWZ0ZXIgMTAwMCwgKCktPlxuXHRcdFx0bW9kZWwubWF0ZXJpYWwubWF0ZXJpYWxzWzBdLndpcmVmcmFtZSA9IHRydWVcblx0XHRcblx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0QGhwID0gM1xuXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ3VwJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ2Rvd24nXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1snbGVmdCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54IC09IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydyaWdodCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydmaXJlX3ByaW1hcnknXVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBsYXN0RmlyZSArIDI0MCAqIDFcblx0XHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRcdFxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdGJ1bGxldC5hbmdsZSA9IC0uMjVcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRidWxsZXQuYW5nbGUgPSArLjI1XG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblx0XHRcdCMgQHBhcmVudC5jb2xsaWRlcnMucHVzaCBidWxsZXRcblxuXHRkaWU6ICgpLT5cblx0XHQjIGNvbnNvbGUubG9nIFwiZGllXCJcblx0XHRcblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMDBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDgpXG5cblx0XHRwb3MgPSBAcm9vdC5wb3NpdGlvblxuXHRcdHBhcmVudCA9IEBwYXJlbnRcblx0XHR1dGlsLmFmdGVyIDEwMDAsICgpLT5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChwb3MpXG5cdFx0XHRidWxsZXQuaHAgPSAxMDBcblx0XHRcdGJ1bGxldC5kcCA9IDEwXG5cdFx0XHRidWxsZXQuY29sbGlzaW9uUmFkaXVzID0gMTUwXG5cdFx0XHRwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0IyB1dGlsLmFmdGVyIDEyNTAsIFNodW1wLmdhbWUucmVzZXRQbGF5ZXJcblx0XHRzdXBlcigpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxuIiwiXG5zY29yZSA9IDBcbmV4cG9ydHMuZGlzcGxheUVsZW1lbnQgPSB1bmRlZmluZWRcblxuZXhwb3J0cy5hZGQgPSAocG9pbnRzKS0+XG5cdHNjb3JlICs9IHBvaW50c1xuXHQjIGNvbnNvbGUubG9nIGV4cG9ydHMuZGlzcGxheUVsZW1lbnRcblx0aWYgZXhwb3J0cy5kaXNwbGF5RWxlbWVudD9cblx0XHRleHBvcnRzLmRpc3BsYXlFbGVtZW50LnRleHQgXCJTY29yZTogI3tzY29yZX1cIlxuXG5leHBvcnRzLmdldCA9ICgpLT5cblx0cmV0dXJuIHNjb3JlXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgSG9tZVNjcmVlbiBleHRlbmRzIEdhbWVPYmplY3Rcblx0dGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvc2NyZWVucy90aXRsZS5wbmdcIlxuXHRtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAyMCwgMTUpXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBnZW9tZXRyeSwgbWF0ZXJpYWxcblxuZXhwb3J0cy5Ib21lU2NyZWVuID0gSG9tZVNjcmVlblxuXG5jbGFzcyBHYW1lT3ZlclNjcmVlbiBleHRlbmRzIEdhbWVPYmplY3Rcblx0dGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvc2NyZWVucy9nYW1lX292ZXIucG5nXCJcblx0bWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0Z2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMjAsIDE1KVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG5cbmV4cG9ydHMuR2FtZU92ZXJTY3JlZW4gPSBHYW1lT3ZlclNjcmVlblxuIiwid2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHR8fHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG5hdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbmNsYXNzIFNvdW5kXG5cdGNvbnN0cnVjdG9yOiAoQG5hbWUsIEB1cmwsIEBidWZmZXIpLT5cbmV4cG9ydHMuU291bmQgPSBTb3VuZFxuXG5leHBvcnRzLmxvYWRlZFNvdW5kcyA9IGxvYWRlZFNvdW5kcyA9IHt9XG5cblxuZXhwb3J0cy5sb2FkID0gbG9hZCA9IChuYW1lLCB1cmwpIC0+XG5cdHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXHRcdHJlcXVlc3Qub3BlbignR0VUJywgdXJsKVxuXHRcdHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblx0XHRyZXF1ZXN0Lm9ubG9hZCA9IChhLCBiLCBjKT0+XG5cdFx0XHRpZiByZXF1ZXN0LnN0YXR1cyA9PSAyMDBcblx0XHRcdFx0YXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSByZXF1ZXN0LnJlc3BvbnNlLCBcblx0XHRcdFx0XHQoYnVmZmVyKT0+XG5cdFx0XHRcdFx0XHQjdG9kbyBoYW5kbGUgZGVjb2RpbmcgZXJyb3Jcblx0XHRcdFx0XHRcdHNvdW5kID0gbmV3IFNvdW5kKG5hbWUsIHVybCwgYnVmZmVyKVxuXHRcdFx0XHRcdFx0ZXhwb3J0cy5sb2FkZWRTb3VuZHNbbmFtZV0gPSBzb3VuZFxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc29sdmUoc291bmQpXG5cdFx0XHRcdFx0LChlcnIpPT5cblx0XHRcdFx0XHRcdHJlamVjdCBFcnJvcihcIkRlY29kaW5nIEVycm9yXCIpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNvbnNvbGUubG9nICBcIlN0YXR1c1wiXG5cdFx0XHRcdHJlamVjdCBFcnJvcihcIlN0YXR1cyBFcnJvclwiKVxuXG5cdFx0XHRcdFxuXHRcdHJlcXVlc3Qub25lcnJvciA9ICgpLT5cblx0XHRcdGNvbnNvbGUubG9nIFwiZXJyclwiXG5cdFx0XHRyZWplY3QgRXJyb3IoXCJOZXR3b3JrIEVycm9yXCIpIFx0XG5cblx0XHRyZXF1ZXN0LnNlbmQoKVxuXHRcdFx0XG5cbmV4cG9ydHMucGxheSA9IHBsYXkgPSAoYXJnKS0+XG5cdGlmIHR5cGVvZiBhcmcgPT0gJ3N0cmluZydcblx0XHRidWZmZXIgPSBsb2FkZWRTb3VuZHNbYXJnXS5idWZmZXJcblx0ZWxzZSBcblx0XHRidWZmZXIgPSBhcmdcblx0aWYgYnVmZmVyP1xuXHRcdHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuXHRcdHNvdXJjZS5idWZmZXIgPSBidWZmZXJcblx0XHRzb3VyY2UuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pXG5cdFx0c291cmNlLnN0YXJ0KDApXG5cblxuYXNzZXRzTG9hZGluZyA9IFtdXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnc2hvb3QnLCAnYXNzZXRzL3NvdW5kcy9zaG9vdC53YXYnKVxuYXNzZXRzTG9hZGluZy5wdXNoIGxvYWQoJ2V4cGxvc2lvbicsICdhc3NldHMvc291bmRzL2V4cGxvc2lvbi53YXYnKVxuXG5Qcm9taXNlLmFsbChhc3NldHNMb2FkaW5nKVxuLnRoZW4gKHJlc3VsdHMpLT5cblx0Y29uc29sZS5sb2cgXCJMb2FkZWQgYWxsIFNvdW5kcyFcIiwgcmVzdWx0c1xuLmNhdGNoIChlcnIpLT5cblx0Y29uc29sZS5sb2cgXCJ1aG9oXCIsIGVyclxuXG4iLCJFbmVtaWVzID0gcmVxdWlyZSAnLi9FbmVtaWVzLmNvZmZlZSdcblxuZXhwb3J0cy5sb2FkID0gbG9hZCA9ICh1cmwpIC0+XG5cdHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdGpxeGhyID0gJC5nZXRKU09OIHVybCwgQG9uTG9hZFxuXG5cdFx0anF4aHIuZG9uZSAoKS0+XG5cdFx0XHRsZXZlbCA9IG5ldyBUaWxlZE1hcChqcXhoci5yZXNwb25zZUpTT04pXG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShsZXZlbClcblxuXHRcdGpxeGhyLmZhaWwgKCktPlxuXHRcdFx0cmV0dXJuIHJlamVjdCBFcnJvcihcIlN0YXR1cyBFcnJvclwiKVxuXG5cbmNsYXNzIFRpbGVkTWFwXG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRAdGlsZVNldHMgPSBbXVxuXHRcdEB0aWxlcyA9IFtdXG5cdFx0QGxheWVycyA9IHt9XG5cblx0XHQjIGNyZWF0ZSB0aWxlU2V0cywgbG9hZCB0aGUgdGV4dHVyZXNcblx0XHRmb3IgdGlsZVNldERhdGEgaW4gZGF0YS50aWxlc2V0c1xuXHRcdFx0dGlsZVNldCA9IG5ldyBUaWxlU2V0IHRpbGVTZXREYXRhXG5cdFx0XHRAdGlsZVNldHMucHVzaCB0aWxlU2V0XG5cblx0XHQjIGNyZWF0ZSB0aWxlcyBAZ2VvbWV0ZXJ5IGFuZCBAbWF0ZXJpYWxcblx0XHRmb3IgdGlsZVNldCBpbiBAdGlsZVNldHNcblx0XHRcdGlkID0gdGlsZVNldC5kYXRhLmZpcnN0Z2lkXG5cdFx0XHRmb3Igcm93IGluIFswLi50aWxlU2V0LnJvd3MtMV1cblx0XHRcdFx0Zm9yIGNvbCBpbiBbMC4udGlsZVNldC5jb2xzLTFdXG5cdFx0XHRcdFx0dGlsZSA9IG5ldyBUaWxlIHRpbGVTZXQsIHJvdywgY29sXG5cdFx0XHRcdFx0QHRpbGVzW2lkXSA9IHRpbGVcblx0XHRcdFx0XHRpZCsrXG5cblxuXHRcdCMgbG9hZCBsYXllcnNcblx0XHRmb3IgbGF5ZXJEYXRhIGluIGRhdGEubGF5ZXJzXG5cdFx0XHRpZiBsYXllckRhdGEudHlwZSA9PSBcInRpbGVsYXllclwiXG5cdFx0XHRcdEBsYXllcnNbbGF5ZXJEYXRhLm5hbWVdID0gbmV3IFRpbGVMYXllcih0aGlzLCBsYXllckRhdGEpXG5cdFx0XHRpZiBsYXllckRhdGEudHlwZSA9PSBcIm9iamVjdGdyb3VwXCJcblx0XHRcdFx0QGxheWVyc1tsYXllckRhdGEubmFtZV0gPSBuZXcgT2JqZWN0R3JvdXAobGF5ZXJEYXRhKVxuXG5cdFxuXG5cdGxvYWRUaWxlTGF5ZXI6IChkYXRhKT0+XG5cdFx0bGF5ZXIgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdGZvciBpZCwgaW5kZXggaW4gZGF0YS5kYXRhXG5cdFx0XHRpZiBpZCA+IDBcblx0XHRcdFx0cm93ID0gTWF0aC5mbG9vcihpbmRleCAvIGRhdGEud2lkdGgpXG5cdFx0XHRcdGNvbCA9IGluZGV4ICUgZGF0YS53aWR0aFxuXHRcdFx0XHR0aWxlT2JqZWN0ID0gbmV3IFRpbGVPYmplY3QoQHRpbGVzW2lkXSwgbmV3IFRIUkVFLlZlY3RvcjMoY29sLCAtcm93IC0gMSwgMCkgKVxuXHRcdFx0XHRsYXllci5hZGQgdGlsZU9iamVjdC5yb290XHRcblx0XHRyZXR1cm4gbGF5ZXJcblxuXHRcblxuXG4jIHJlcHJlc2VudHMgYSBUaWxlU2V0IGluIGEgVGlsZWQgRWRpdG9yIGxldmVsXG5jbGFzcyBUaWxlU2V0XG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRAY29scyA9IEBkYXRhLmltYWdld2lkdGggLyBAZGF0YS50aWxld2lkdGhcblx0XHRAcm93cyA9IEBkYXRhLmltYWdlaGVpZ2h0IC8gQGRhdGEudGlsZWhlaWdodFxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy8je0BkYXRhLmltYWdlfVwiXG5cdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoVGVzdDogdHJ1ZVxuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cbiMgUmVwcmVzZW50cyB0aGUgQGdlb21ldHJ5IGFuZCBAbWF0ZXJpYWwgb2YgYSB0aWxlIGxvYWRlZCBmcm9tIGEgVGlsZWQgRWRpdG9yIGxldmVsXG5jbGFzcyBUaWxlXG5cdGNvbnN0cnVjdG9yOiAoQHRpbGVTZXQsIEByb3csIEBjb2wpLT5cblx0XHQjIHRvZG8sIHByb2JhYmx5IGJlIHByZXR0aWVyIHRvIGp1c3QgbWFrZSB0aGlzIGZyb20gc2NyYXRjaFxuXHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCBAdGlsZVNldC5kYXRhLnRpbGV3aWR0aCAvIDMyLCBAdGlsZVNldC5kYXRhLnRpbGVoZWlnaHQgLyAzMilcblx0XHRcblx0XHQjIFJlcG9zaXRpb24gdmVydGljZXMgdG8gbG93ZXIgbGVmdCBhdCAwLDAgXG5cdFx0Zm9yIHYgaW4gQGdlb21ldHJ5LnZlcnRpY2VzXG5cdFx0XHR2LnggKz0gQHRpbGVTZXQuZGF0YS50aWxld2lkdGggLyAzMiAvIDJcblx0XHRcdHYueSArPSBAdGlsZVNldC5kYXRhLnRpbGVoZWlnaHQgLyAzMiAvIDJcblx0XHRAZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZVxuXG5cdFx0IyBjYWxjIGFuZCBzZXQgdXZzXG5cdFx0dXZXaWR0aCA9IEB0aWxlU2V0LmRhdGEudGlsZXdpZHRoL0B0aWxlU2V0LmRhdGEuaW1hZ2V3aWR0aFxuXHRcdHV2SGVpZ2h0ID0gQHRpbGVTZXQuZGF0YS50aWxlaGVpZ2h0L0B0aWxlU2V0LmRhdGEuaW1hZ2VoZWlnaHRcblxuXHRcdHV2WCA9IHV2V2lkdGggKiBAY29sXG5cdFx0dXZZID0gdXZIZWlnaHQgKiAoQHRpbGVTZXQucm93cyAtIEByb3cgLSAxKVxuXHRcdGZvciBmYWNlIGluIEBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdXG5cdFx0XHRmb3IgdiBpbiBmYWNlXG5cdFx0XHRcdGlmIHYueCA9PSAwXG5cdFx0XHRcdFx0di54ID0gdXZYXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR2LnggPSB1dlggKyB1dldpZHRoICMgKiAoMzEuNS8zMi4wKSAjIHRvZG8gZGlydHkgaGFjayB0byBwcmV2ZW50IHNsaWdodCBvdmVyc2FtcGxlIG9uIHRpbGUgc2hvd2luZyBoaW50IG9mIG5leHQgdGlsZSBvbiBlZGdlLlxuXG5cdFx0XHRcdGlmIHYueSA9PSAwXG5cdFx0XHRcdFx0di55ID0gdXZZXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR2LnkgPSB1dlkgKyB1dkhlaWdodCAjICogKDMxLjUvMzIuMCkgIyB0b2RvIGRpcnR5IGhhY2sgdG8gcHJldmVudCBzbGlnaHQgb3ZlcnNhbXBsZSBvbiB0aWxlIHNob3dpbmcgaGludCBvZiBuZXh0IHRpbGUgb24gZWRnZS5cdFx0XHRcdFx0XG5cdFx0QGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlXG5cblx0XHRAbWF0ZXJpYWwgPSBAdGlsZVNldC5tYXRlcmlhbFxuXG5cdFx0XG5cbiMgUmVwcmVzZW50cyBhIFRpbGVMYXllciBpbiB0aGUgVGlsZWQgRWRpdG9yIGZpbGUuIFxuY2xhc3MgVGlsZUxheWVyXG5cdGNvbnN0cnVjdG9yOiAobWFwLCBAZGF0YSktPlxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRmb3IgaWQsIGluZGV4IGluIEBkYXRhLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gZGF0YS53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBkYXRhLndpZHRoXG5cdFx0XHRcdCMgY29uc29sZS5sb2cgIFwidGlsZVwiLCBtYXAsIG1hcC50aWxlc1tpZF1cblx0XHRcdFx0dGlsZU9iamVjdCA9IG5ldyBUaWxlT2JqZWN0KG1hcC50aWxlc1tpZF0sIG5ldyBUSFJFRS5WZWN0b3IzKGNvbCwgLXJvdyAtIDEsIDApIClcblx0XHRcdFx0QHJvb3QuYWRkIHRpbGVPYmplY3QubWVzaFx0XG5cdFx0XG5cbiMgUmVwcmVzZW50cyBhbiBpbnN0YW5jZSBvZiBhIHRpbGUgdG8gYmUgcmVuZGVyZWRcbmNsYXNzIFRpbGVPYmplY3Rcblx0Y29uc3RydWN0b3I6ICh0aWxlLCBwb3NpdGlvbiktPlxuXHRcdEBtZXNoID0gbmV3IFRIUkVFLk1lc2ggdGlsZS5nZW9tZXRyeSwgdGlsZS5tYXRlcmlhbFxuXHRcdEBtZXNoLnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cdFxuXG5jbGFzcyBPYmplY3RHcm91cFxuXHRjb25zdHJ1Y3RvcjogKEBkYXRhKS0+XG5cdFx0QG9iamVjdHMgPSBbXVxuXHRcdGZvciBvYmplY3REYXRhIGluIEBkYXRhLm9iamVjdHMgXG5cdFx0XHRlbmVteSA9IG5ldyBFbmVtaWVzW29iamVjdERhdGEudHlwZV0obmV3IFRIUkVFLlZlY3RvcjMob2JqZWN0RGF0YS54IC8gMzIsIDcgLSBvYmplY3REYXRhLnkgLyAzMiwgMCkpXG5cdFx0XHRAb2JqZWN0cy5wdXNoIGVuZW15XG4iLCJTY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcblxuY2xhc3MgZXhwb3J0cy5CdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXQucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSlcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDIwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggYnVsbGV0R2VvbWV0cnksIGJ1bGxldE1hdGVyaWFsXG5cblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiYnVsbGV0XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlcIlxuXHRcdEBhbmdsZSA9IDBcblx0XHRAc3BlZWQgPSAxNVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBNYXRoLmNvcyhAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gTWF0aC5zaW4oQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5yb3RhdGlvbi56ID0gQGFuZ2xlXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxuXG5cdGNvbGxpZGVJbnRvOiAodGFyZ2V0KS0+XG5cdFx0c3VwZXIodGFyZ2V0KVxuXHRcdFNjb3JlLmFkZCgxKVxuXHRcdEBkaWUoKVxuXHRcdGZvciBpIGluIFswLi41XVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAxKVxuXG5cbmNsYXNzIGV4cG9ydHMuRW5lbXlCdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXRfMi5wbmdcIlxuXHRidWxsZXRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBidWxsZXRUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRidWxsZXRHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKVxuXHRcblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHN1cGVyKHRhcmdldClcblx0XHRTY29yZS5hZGQoMSlcblx0XHRAZGllKClcblx0XHRmb3IgaSBpbiBbMC4uNV1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMSlcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5JbnB1dCA9IHJlcXVpcmUgJy4vSW5wdXQuY29mZmVlJ1xuXG5jbGFzcyBXb3JsZCBleHRlbmRzIEJhc2Vcblx0XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdHN1cGVyKClcblxuXHRcdHcgPSA2NDBcblx0XHRoID0gNDgwXG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgdyAvIGgsIDEsIDEwMDAwKVxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblxuXHRcdHRhcmdldFogPSA0ODAgLyAoMiAqIE1hdGgudGFuKGZvdl9yYWRpYW5zIC8gMikgKSAvIDMyLjA7XG5cblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB0YXJnZXRaXG5cdFx0XG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRcblx0XHRAcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpXG5cdFx0QHJlbmRlcmVyLnNldFNpemUgdywgaFxuXHRcdCMgQHJlbmRlcmVyLnNvcnRPYmplY3RzID0gZmFsc2Vcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cblxuXHRcdFxuXHRcdEB3b3JsZFRleHR1cmUgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQgdywgaCwgXG5cdFx0XHRtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlclxuXHRcdFx0bWFnRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdGZvcm1hdDogVEhSRUUuUkdCRm9ybWF0XG5cdFx0XG5cblx0XHRAcHJvY2Vzc01hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHR0cmFuc3BhcmVudDogZmFsc2Vcblx0XHRcdHVuaWZvcm1zOiBcblx0XHRcdFx0XCJ0RGlmZnVzZVwiOiB7IHR5cGU6IFwidFwiLCB2YWx1ZTogQHdvcmxkVGV4dHVyZSB9XG5cblx0XHRcdHZlcnRleFNoYWRlcjpcblx0XHRcdFx0XCJcIlwiXG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdHZVdiA9IHV2O1xuXHRcdFx0XHRcdGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR1bmlmb3JtIHNhbXBsZXIyRCB0RGlmZnVzZTtcblx0XHRcdFx0dmFyeWluZyB2ZWMyIHZVdjtcblxuXHRcdFx0XHR2b2lkIG1haW4oKSB7XG5cdFx0XHRcdFx0Ly8gcmVhZCB0aGUgaW5wdXQgY29sb3JcblxuXHRcdFx0XHRcdHZlYzQgbztcblx0XHRcdFx0XHR2ZWM0IGM7XG5cdFx0XHRcdFx0YyA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiApO1xuXHRcdFx0XHRcdC8vbyA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiApO1xuXG5cdFx0XHRcdFx0Ly9taXNhbGlnbiByZ2Jcblx0XHRcdFx0XHRvLnIgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKyB2ZWMyKDAuMCwgLTAuMDAxKSApLnI7XG5cdFx0XHRcdFx0by5nID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIDAuMDAxKSApLnI7XG5cdFx0XHRcdFx0by5iID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIDAuMDAzKSApLnI7XG5cblx0XHRcdFx0XHQvL3NjYW5saW5lc1xuXHRcdFx0XHRcdG8uciAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgMS4wO1xuXHRcdFx0XHRcdG8uZyAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgMS4wO1xuXHRcdFx0XHRcdG8uYiAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgMS4wO1xuXG5cdFx0XHRcdFx0byAqPSAwLjUgKyAxLjAqMTYuMCp2VXYueCp2VXYueSooMS4wLXZVdi54KSooMS4wLXZVdi55KTtcblx0XHRcdFx0XHRcblxuXHRcdFx0XHRcdC8vIHNldCB0aGUgb3V0cHV0IGNvbG9yXG5cdFx0XHRcdFx0Z2xfRnJhZ0NvbG9yID0gbyAqIC41ICsgYyAqIC41O1xuXHRcdFx0XHR9XG5cdFx0XHRcdFwiXCJcIlxuXG5cdFx0QHByb2Nlc3NTY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0QHByb2Nlc3NDYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKC0uNSwgLjUsIC0uNSAsIC41LCAwLCAxKVxuXHRcdEBwcm9jZXNzQ2FtZXJhLnBvc2l0aW9uLnogPSAwXG5cdFx0QHByb2Nlc3NTY2VuZS5hZGQgQHByb2Nlc3NDYW1lcmFcblx0XHRAcHJvY2Vzc1F1YWQgPSBuZXcgVEhSRUUuTWVzaCggbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEgKSwgQHByb2Nlc3NNYXRlcmlhbCApO1xuXHRcdEBwcm9jZXNzUXVhZC5yb3RhdGlvbi54ID0gTWF0aC5QSVxuXHRcdEBwcm9jZXNzU2NlbmUuYWRkIEBwcm9jZXNzUXVhZFxuXG5cblxuXG5cdFx0QGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKClcblx0XHRAc3RhdHMgPSBuZXcgU3RhdHMoKTtcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuXHRcdCQoXCIjc2h1bXBcIilbMF0uYXBwZW5kQ2hpbGQoIEBzdGF0cy5kb21FbGVtZW50IClcblxuXHRcdHJldHVybiB0aGlzXG5cblx0YW5pbWF0ZTogPT5cblx0XHRkZWx0YSA9IEBjbG9jay5nZXREZWx0YSgpXHRcdFxuXHRcdCNkb24ndCB1cGRhdGUgYWZ0ZXIgbG9uZyBmcmFtZSAoZml4ZXMgaXNzdWUgd2l0aCBzd2l0Y2hpbmcgdGFicylcblx0XHRpZiAoZGVsdGEgPCAuNSkgXG5cdFx0XHRAdHJpZ2dlciBcInVwZGF0ZVwiLCBkZWx0YVxuXG5cdFx0QHJlbmRlcmVyLnJlbmRlciggQHNjZW5lLCBAY2FtZXJhLCBAd29ybGRUZXh0dXJlLCB0cnVlICk7XG5cblxuXHRcdEByZW5kZXJlci5yZW5kZXIgQHByb2Nlc3NTY2VuZSwgQHByb2Nlc3NDYW1lcmFcblxuXHRcdEBzdGF0cy51cGRhdGUoKVxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSBAYW5pbWF0ZVxuXHRcdHJldHVyblxuXG5cdHN0YXJ0OiAtPlxuXHRcdEBhbmltYXRlKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gV29ybGRcbiIsIkdhbWUgPSByZXF1aXJlICcuL0dhbWUuY29mZmVlJ1xuXG5cbm1vZHVsZS5leHBvcnRzLkdhbWUgPSBuZXcgR2FtZS5HYW1lKClcblxuXHRcdFxuXG4jIG1vZGVsTG9hZGVyID0gbmV3IGNvcmUuTW9kZWxMb2FkZXIoKVxuXG5cblx0XHRcdFxuXG5cbiIsImV4cG9ydHMuYWZ0ZXIgPSAoZGVsYXksIGZ1bmMpLT5cblx0c2V0VGltZW91dCBmdW5jLCBkZWxheVxuXG5leHBvcnRzLnJhbmRvbSA9IChtaW4sIG1heCktPlxuXHRyZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuIl19
