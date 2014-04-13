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


},{"./shump/shump.coffee":17}],2:[function(require,module,exports){
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

module.exports.CollisionObject = CollisionObject;

module.exports.resolveCollisions = function(colliders) {
  var a, b, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = colliders.length; _i < _len; _i++) {
    a = colliders[_i];
    if (a.active) {
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = colliders.length; _j < _len1; _j++) {
          b = colliders[_j];
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

module.exports.testCollision = function(a, b) {
  return a.root.position.distanceToSquared(b.root.position) < a.collisionRadius + b.collisionRadius;
};


},{"./GameObject.coffee":6}],4:[function(require,module,exports){
var Basic, Collisions, Dart, Particle, SinWave, Sound, Weapons,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Sound = require('./Sound.coffee');

Collisions = require('./Collisions.coffee');

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

})(Collisions.CollisionObject);

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


},{"./Collisions.coffee":3,"./Particle.coffee":10,"./Sound.coffee":14,"./Weapons.coffee":16}],5:[function(require,module,exports){
var Base, Game, Level, Screens, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('../util.coffee');

Base = require('./Base.coffee');

Level = require('./Level.coffee');

Screens = require('./Screens.coffee');

Game = (function(_super) {
  __extends(Game, _super);

  function Game() {
    this.animate = __bind(this.animate, this);
    this.render = __bind(this.render, this);
    this.update = __bind(this.update, this);
    Game.__super__.constructor.call(this);
    this.lives = 3;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(640, 480);
    $("#shump")[0].appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.state = "home";
    this.homeScreen = new Screens.HomeScreen();
    this.gameOverScreen = new Screens.GameOverScreen();
    $(window).keydown((function(_this) {
      return function(e) {
        if (_this.state === "home") {
          _this.state = "loading";
          _this.startGame();
          return;
        }
        if (_this.state === "game_over") {
          _this.state = "home";
        }
      };
    })(this));
    util.after(1, (function(_this) {
      return function() {
        return _this.animate();
      };
    })(this));
  }

  Game.prototype.startGame = function() {
    this.lives = 3;
    this.level = new Level.Level();
    this.level.on("playerDie", (function(_this) {
      return function() {
        _this.lives--;
        if (_this.lives > 0) {
          return util.after(1000, _this.level.insertPlayer);
        } else {
          return _this.state = "game_over";
        }
      };
    })(this));
    return this.level.on("ready", (function(_this) {
      return function() {
        return _this.state = "play";
      };
    })(this));
  };

  Game.prototype.update = function(delta) {
    if (this.state === "home") {
      this.homeScreen.update(delta);
    }
    if (this.state === "play") {
      this.level.update(delta);
    }
    if (this.state === "game_over") {
      this.level.update(delta);
      return this.gameOverScreen.update(delta);
    }
  };

  Game.prototype.render = function() {
    this.renderer.autoClear = false;
    if (this.state === "home") {
      this.renderer.render(this.homeScreen.scene, this.homeScreen.camera);
    }
    if (this.state === "play") {
      this.renderer.render(this.level.scene, this.level.camera);
      this.renderer.render(this.homeScreen.scene, this.level.camera, void 0, false);
    }
    if (this.state === "game_over") {
      this.renderer.render(this.level.scene, this.level.camera);
      return this.renderer.render(this.gameOverScreen.scene, this.gameOverScreen.camera, void 0, false);
    }
  };

  Game.prototype.animate = function() {
    var delta;
    delta = this.clock.getDelta();
    if (delta < .5) {
      this.update(delta);
    }
    this.render();
    requestAnimationFrame(this.animate);
  };

  return Game;

})(Base);

exports.Game = Game;


},{"../util.coffee":18,"./Base.coffee":2,"./Level.coffee":8,"./Screens.coffee":13}],6:[function(require,module,exports){
var Base, GameObject,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./Base.coffee');

GameObject = (function(_super) {
  __extends(GameObject, _super);

  function GameObject() {
    this.update = __bind(this.update, this);
    GameObject.__super__.constructor.call(this);
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
    this.dead = true;
    return this.trigger("die");
  };

  return GameObject;

})(Base);

module.exports = GameObject;


},{"./Base.coffee":2}],7:[function(require,module,exports){
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
var Collisions, GameObject, Level, Player, Tiled, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('../util.coffee');

Tiled = require('./Tiled.coffee');

Player = require('./Player.coffee');

GameObject = require('./GameObject.coffee');

Collisions = require('./Collisions.coffee');

Level = (function(_super) {
  __extends(Level, _super);

  function Level() {
    this.insertPlayer = __bind(this.insertPlayer, this);
    this.populate = __bind(this.populate, this);
    Level.__super__.constructor.call(this);
    this.colliders = [];
    this.scene = new THREE.Scene();
    this.scene.add(this.root);
    this.camera = new THREE.PerspectiveCamera(45, 640 / 480, 1, 10000);
    this.camera.position.z = util.layerSpacing() * 1;
    this.scene.add(this.camera);
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.root.add(this.ambientLight);
    this.insertPlayer();
    Tiled.load('assets/level_1.json').then(this.populate)["catch"](function(error) {
      return console.error(error);
    });
  }

  Level.prototype.populate = function(map) {
    var object, _i, _len, _ref;
    this.root.add(map.layers.background.root);
    map.layers.background.root.position.y = 7.5 * 2;
    map.layers.background.root.position.z = util.layerSpacing() * -1;
    map.layers.background.root.scale.set(2, 2, 2);
    this.root.add(map.layers.midground.root);
    map.layers.midground.root.position.y = 7.5;
    _ref = map.layers.enemies.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      this.add(object);
    }
    return this.trigger("ready");
  };

  Level.prototype.insertPlayer = function() {
    this.player1 = new Player();
    this.add(this.player1);
    this.player1.root.position.copy(this.camera.position);
    this.player1.root.position.z = 0;
    return this.player1.on("die", (function(_this) {
      return function() {
        return _this.trigger("playerDie");
      };
    })(this));
  };

  Level.prototype.update = function(delta) {
    var child, _i, _len, _ref;
    Level.__super__.update.call(this, delta);
    this.camera.position.x += 1 * delta;
    this.player1.root.position.x += 1 * delta;
    _ref = this.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.active === false && child.root.position.x < this.camera.position.x + 10) {
        child.activate();
      }
    }
    return Collisions.resolveCollisions(this.colliders);
  };

  Level.prototype.add = function(gameObject) {
    if (gameObject instanceof Collisions.CollisionObject) {
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

  return Level;

})(GameObject);

exports.Level = Level;


},{"../util.coffee":18,"./Collisions.coffee":3,"./GameObject.coffee":6,"./Player.coffee":11,"./Tiled.coffee":15}],9:[function(require,module,exports){
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


},{"../util.coffee":18,"./GameObject.coffee":6}],11:[function(require,module,exports){
var Collisions, Input, ModelLoader, Particle, Player, Shump, Sound, Weapons, modelLoader, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('../util.coffee');

Sound = require('./Sound.coffee');

Collisions = require('./Collisions.coffee');

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
    var i, _i;
    Sound.play('explosion');
    for (i = _i = 0; _i <= 200; i = ++_i) {
      this.parent.add(new Particle(this.root.position, 8));
    }
    return Player.__super__.die.call(this);
  };

  return Player;

})(Collisions.CollisionObject);

module.exports = Player;


},{"../util.coffee":18,"./Collisions.coffee":3,"./Input.coffee":7,"./ModelLoader.coffee":9,"./Particle.coffee":10,"./Sound.coffee":14,"./Weapons.coffee":16,"./shump.coffee":17}],12:[function(require,module,exports){
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
var GameObject, GameOverScreen, HomeScreen, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('../util.coffee');

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
    var screen;
    HomeScreen.__super__.constructor.call(this);
    this.scene = new THREE.Scene();
    this.scene.add(this.root);
    this.camera = new THREE.PerspectiveCamera(45, 640 / 480, 1, 10000);
    this.camera.position.z = util.layerSpacing() * 1;
    this.scene.add(this.camera);
    screen = new THREE.Mesh(geometry, material);
    screen.scale.set(.25, .25, .25);
    screen.position.z = util.layerSpacing() * .75;
    this.root.add(screen);
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
    this.scene = new THREE.Scene();
    this.scene.add(this.root);
    this.camera = new THREE.PerspectiveCamera(45, 640 / 480, 1, 10000);
    this.camera.position.z = util.layerSpacing() * 1;
    this.scene.add(this.camera);
    this.root.add(new THREE.Mesh(geometry, material));
  }

  return GameOverScreen;

})(GameObject);

exports.GameOverScreen = GameOverScreen;


},{"../util.coffee":18,"./GameObject.coffee":6}],14:[function(require,module,exports){
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
var Collisions, Particle, Score,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Score = require('./Score.coffee');

Collisions = require('./Collisions.coffee');

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

})(Collisions.CollisionObject);

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

})(Collisions.CollisionObject);


},{"./Collisions.coffee":3,"./Particle.coffee":10,"./Score.coffee":12}],17:[function(require,module,exports){
var Game;

Game = require('./Game.coffee');

module.exports.Game = new Game.Game();


},{"./Game.coffee":5}],18:[function(require,module,exports){
exports.after = function(delay, func) {
  return setTimeout(func, delay);
};

exports.random = function(min, max) {
  return Math.random() * (max - min) + min;
};

exports.layerSpacing = function() {
  var fov_radians, targetZ;
  fov_radians = 45 * (Math.PI / 180);
  return targetZ = 480 / (2 * Math.tan(fov_radians / 2)) / 32.0;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0VuZW1pZXMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9HYW1lLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvR2FtZU9iamVjdC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0lucHV0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvTGV2ZWwuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9Nb2RlbExvYWRlci5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1BhcnRpY2xlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGxheWVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvU2NvcmUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY3JlZW5zLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvU291bmQuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9UaWxlZC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dlYXBvbnMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9zaHVtcC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxrQkFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHNCQUFSLENBQVIsQ0FBQTs7QUFBQSxDQUVBLENBQUUsYUFBRixDQUFnQixDQUFDLEtBQWpCLENBQXVCLFNBQUEsR0FBQTtBQUV0QixNQUFBLHNFQUFBO0FBQUEsRUFBQSxDQUFBLENBQUUsUUFBRixDQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsdUJBQWYsQ0FBdUMsT0FBTyxDQUFDLG9CQUEvQyxDQUFBLENBQUE7QUFBQSxFQUVBLE1BQUEsR0FBUyxDQUFBLENBQUUsZUFBRixDQUZULENBQUE7QUFBQSxFQUdBLFlBQUEsR0FBZSxNQUFNLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsTUFBTSxDQUFDLE1BQVAsQ0FBQSxDQUhoQyxDQUFBO0FBQUEsRUFLQSxjQUFBLEdBQWlCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FMakIsQ0FBQTtBQUFBLEVBTUEsZUFBQSxHQUFrQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBTmxCLENBQUE7QUFBQSxFQU9BLGVBQUEsR0FBa0IsY0FBQSxHQUFpQixlQVBuQyxDQUFBO0FBQUEsRUFRQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVosRUFBMEIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEtBQVYsQ0FBQSxDQUExQixFQUE4QyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQTlDLEVBQWtFLGVBQWxFLENBUkEsQ0FBQTtBQVVBLEVBQUEsSUFBRyxZQUFBLEdBQWUsZUFBbEI7QUFDQyxJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWixDQUFBLENBQUE7QUFBQSxJQUNBLE1BQU0sQ0FBQyxNQUFQLENBQWMsZUFBZCxDQURBLENBQUE7V0FFQSxNQUFNLENBQUMsS0FBUCxDQUFhLGVBQUEsR0FBa0IsWUFBL0IsRUFIRDtHQUFBLE1BQUE7QUFLQyxJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWixDQUFBLENBQUE7QUFBQSxJQUNBLE1BQU0sQ0FBQyxLQUFQLENBQWEsY0FBYixDQURBLENBQUE7V0FFQSxNQUFNLENBQUMsTUFBUCxDQUFjLGNBQUEsR0FBaUIsWUFBL0IsRUFQRDtHQVpzQjtBQUFBLENBQXZCLENBRkEsQ0FBQTs7QUFBQSxDQXVCQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLE1BQVosQ0FBbUIsNkJBQW5CLENBdkJBLENBQUE7O0FBQUEsV0EwQkEsR0FBYyxTQUFBLEdBQUE7U0FDYixDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUE0QixtQkFBQSxHQUFrQixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBeEUsRUFEYTtBQUFBLENBMUJkLENBQUE7Ozs7QUNBQSxJQUFBLElBQUE7RUFBQTtvQkFBQTs7QUFBQTtBQUNjLEVBQUEsY0FBQSxHQUFBO0FBQ1osNkNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFYLENBRFk7RUFBQSxDQUFiOztBQUFBLGlCQUdBLEVBQUEsR0FBSSxTQUFDLEtBQUQsRUFBUSxPQUFSLEdBQUE7QUFDSCxRQUFBLEtBQUE7QUFBQSxJQUFBLDhDQUFVLENBQUEsS0FBQSxTQUFBLENBQUEsS0FBQSxJQUFVLEVBQXBCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsT0FBN0IsQ0FBQSxDQUFBO0FBQ0EsV0FBTyxJQUFQLENBRkc7RUFBQSxDQUhKLENBQUE7O0FBQUEsaUJBT0EsR0FBQSxHQUFLLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTtBQUNKLFFBQUEsOEJBQUE7QUFBQTtBQUFBLFNBQUEsMkRBQUE7NEJBQUE7VUFBMkMsT0FBQSxLQUFXO0FBQ3JELFFBQUEsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQU0sQ0FBQyxNQUFoQixDQUF1QixLQUF2QixFQUE4QixDQUE5QixDQUFBO09BREQ7QUFBQSxLQUFBO0FBRUEsV0FBTyxJQUFQLENBSEk7RUFBQSxDQVBMLENBQUE7O0FBQUEsaUJBWUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNSLFFBQUEsaUNBQUE7QUFBQSxJQURTLHNCQUFPLDhEQUNoQixDQUFBO0FBQUEsSUFBQSxJQUFtQiwyQkFBbkI7QUFBQSxhQUFPLElBQVAsQ0FBQTtLQUFBO0FBQ0EsU0FBUyxxRUFBVCxHQUFBO0FBQ0MsTUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQU8sQ0FBQSxDQUFBLENBQTFCLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxLQUFSLENBQWMsSUFBZCxFQUFvQixJQUFwQixDQURBLENBREQ7QUFBQSxLQURBO0FBSUEsV0FBTyxJQUFQLENBTFE7RUFBQSxDQVpULENBQUE7O2NBQUE7O0lBREQsQ0FBQTs7QUFBQSxNQW9CTSxDQUFDLE9BQVAsR0FBaUIsSUFwQmpCLENBQUE7Ozs7QUNBQSxJQUFBLDJCQUFBO0VBQUE7aVNBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQUFiLENBQUE7O0FBQUE7QUFHQyxvQ0FBQSxDQUFBOztBQUFhLEVBQUEseUJBQUEsR0FBQTtBQUNaLElBQUEsK0NBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixNQURoQixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsRUFGcEIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEVBQUQsR0FBTSxDQUhOLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FKTixDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsZUFBRCxHQUFtQixFQUxuQixDQURZO0VBQUEsQ0FBYjs7QUFBQSw0QkFRQSxXQUFBLEdBQWEsU0FBQyxNQUFELEdBQUE7V0FDWixNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFDLENBQUEsRUFBbkIsRUFEWTtFQUFBLENBUmIsQ0FBQTs7QUFBQSw0QkFhQSxVQUFBLEdBQVksU0FBQyxNQUFELEdBQUE7QUFDWCxJQUFBLElBQUMsQ0FBQSxFQUFELElBQU8sTUFBUCxDQUFBO0FBQ0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxFQUFELElBQU8sQ0FBVjthQUNDLElBQUMsQ0FBQSxHQUFELENBQUEsRUFERDtLQUZXO0VBQUEsQ0FiWixDQUFBOzt5QkFBQTs7R0FENkIsV0FGOUIsQ0FBQTs7QUFBQSxNQXFCTSxDQUFDLE9BQU8sQ0FBQyxlQUFmLEdBQWlDLGVBckJqQyxDQUFBOztBQUFBLE1BeUJNLENBQUMsT0FBTyxDQUFDLGlCQUFmLEdBQW1DLFNBQUMsU0FBRCxHQUFBO0FBQ2xDLE1BQUEsd0JBQUE7QUFBQTtPQUFBLGdEQUFBO3NCQUFBO0FBQ0MsSUFBQSxJQUFHLENBQUMsQ0FBQyxNQUFMOzs7QUFDQzthQUFBLGtEQUFBOzRCQUFBO0FBQ0MsVUFBQSxJQUFHLENBQUMsQ0FBQyxNQUFMO0FBQ0MsWUFBQSxJQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFuQixDQUEyQixDQUFDLENBQUMsWUFBN0IsQ0FBQSxHQUE2QyxDQUFBLENBQWhEO0FBQ0MsY0FBQSxJQUFHLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFrQixDQUFsQixDQUFIOytCQUNDLENBQUMsQ0FBQyxXQUFGLENBQWMsQ0FBZCxHQUREO2VBQUEsTUFBQTt1Q0FBQTtlQUREO2FBQUEsTUFBQTtxQ0FBQTthQUREO1dBQUEsTUFBQTttQ0FBQTtXQUREO0FBQUE7O3FCQUREO0tBQUEsTUFBQTs0QkFBQTtLQUREO0FBQUE7a0JBRGtDO0FBQUEsQ0F6Qm5DLENBQUE7O0FBQUEsTUFrQ00sQ0FBQyxPQUFPLENBQUMsYUFBZixHQUErQixTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7QUFDOUIsU0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaEIsQ0FBa0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUF6QyxDQUFBLEdBQXFELENBQUMsQ0FBQyxlQUFGLEdBQW9CLENBQUMsQ0FBQyxlQUFsRixDQUQ4QjtBQUFBLENBbEMvQixDQUFBOzs7O0FDQ0EsSUFBQSwwREFBQTtFQUFBO2lTQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FBUixDQUFBOztBQUFBLFVBQ0EsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FEYixDQUFBOztBQUFBLFFBRUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FGWCxDQUFBOztBQUFBLE9BR0EsR0FBVSxPQUFBLENBQVEsa0JBQVIsQ0FIVixDQUFBOztBQUFBO0FBT0MsTUFBQSwwQ0FBQTs7QUFBQSwwQkFBQSxDQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsMEJBQTdCLENBQWYsQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBb0IsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDbEI7QUFBQSxJQUFBLEdBQUEsRUFBSyxZQUFMO0FBQUEsSUFDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFVBRFo7QUFBQSxJQUVBLE9BQUEsRUFBUyxLQUFLLENBQUMsU0FGZjtBQUFBLElBR0EsV0FBQSxFQUFhLElBSGI7R0FEa0IsQ0FEcEIsQ0FBQTs7QUFBQSxFQU1BLGFBQUEsR0FBb0IsSUFBQSxLQUFLLENBQUMsYUFBTixDQUFxQixDQUFyQixFQUF3QixDQUF4QixDQU5wQixDQUFBOztBQVFhLEVBQUEsZUFBQyxRQUFELEdBQUE7QUFDWixJQUFBLHFDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsT0FEaEIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLFFBQXZCLENBRkEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQWMsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLGFBQVgsRUFBMEIsYUFBMUIsQ0FBZCxDQUpBLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FMQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBTlAsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQVBaLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FUVixDQURZO0VBQUEsQ0FSYjs7QUFBQSxrQkFvQkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxrQ0FBTSxLQUFOLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxHQUFELElBQVEsTUFGRDtFQUFBLENBcEJSLENBQUE7O0FBQUEsa0JBeUJBLEdBQUEsR0FBSyxTQUFBLEdBQUE7QUFDSixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsV0FBWCxDQUFBLENBQUE7QUFDQSxTQUFTLDhCQUFULEdBQUE7QUFDQyxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFnQixJQUFBLFFBQUEsQ0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQWYsRUFBeUIsQ0FBekIsQ0FBaEIsQ0FBQSxDQUREO0FBQUEsS0FEQTtXQUdBLDZCQUFBLEVBSkk7RUFBQSxDQXpCTCxDQUFBOztlQUFBOztHQURtQixVQUFVLENBQUMsZ0JBTi9CLENBQUE7O0FBQUE7QUF3Q0MsNEJBQUEsQ0FBQTs7OztHQUFBOztBQUFBLG9CQUFBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLElBQUEsb0NBQU0sS0FBTixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsQ0FBQSxDQUFBLEdBQUssS0FEekIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsS0FBQSxHQUFRLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEdBQVYsRUFIckI7RUFBQSxDQUFSLENBQUE7O2lCQUFBOztHQURxQixNQXZDdEIsQ0FBQTs7QUFBQTtBQThDQyx5QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsaUJBQUEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxpQ0FBTSxLQUFOLENBQUEsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFDLENBQUEsR0FBRCxHQUFPLEVBQVY7QUFDQyxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsQ0FBQSxFQUFBLEdBQU0sS0FBMUIsQ0FERDtLQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsR0FBRCxHQUFPLENBQVY7QUFDSixNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsQ0FBQSxHQUFJLEtBQXhCLENBREk7S0FBQSxNQUFBO0FBR0osTUFBQSxJQUFDLENBQUEsR0FBRCxDQUFBLENBQUEsQ0FISTtLQUhMO0FBUUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBUCxJQUFhLENBQUEsSUFBSyxDQUFBLFFBQXJCO0FBQ0MsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQVosQ0FBQTthQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFGRDtLQVRPO0VBQUEsQ0FBUixDQUFBOztBQUFBLGlCQWNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFFYixRQUFBLE1BQUE7QUFBQSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQURaLENBQUE7QUFBQSxJQUVBLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBMUIsQ0FGYixDQUFBO0FBQUEsSUFJQSxNQUFNLENBQUMsWUFBUCxHQUFzQixjQUp0QixDQUFBO0FBQUEsSUFLQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQyxRQUFELENBTDFCLENBQUE7QUFBQSxJQU1BLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQU56QixDQUFBO0FBQUEsSUFPQSxNQUFNLENBQUMsS0FBUCxHQUFlLENBUGYsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksTUFBWixDQVRBLENBQUE7QUFBQSxJQVdBLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBMUIsQ0FYYixDQUFBO0FBQUEsSUFhQSxNQUFNLENBQUMsWUFBUCxHQUFzQixjQWJ0QixDQUFBO0FBQUEsSUFjQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQyxRQUFELENBZDFCLENBQUE7QUFBQSxJQWVBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQWZ6QixDQUFBO0FBQUEsSUFnQkEsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQWhCZixDQUFBO1dBa0JBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosRUFwQmE7RUFBQSxDQWRkLENBQUE7O2NBQUE7O0dBRGtCLE1BN0NuQixDQUFBOztBQUFBLE9BbUZPLENBQUMsS0FBUixHQUFnQixLQW5GaEIsQ0FBQTs7QUFBQSxPQW9GTyxDQUFDLE9BQVIsR0FBa0IsT0FwRmxCLENBQUE7O0FBQUEsT0FxRk8sQ0FBQyxJQUFSLEdBQWUsSUFyRmYsQ0FBQTs7OztBQ0RBLElBQUEsZ0NBQUE7RUFBQTs7aVNBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxnQkFBUixDQUFQLENBQUE7O0FBQUEsSUFDQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBRFAsQ0FBQTs7QUFBQSxLQUVBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBRlIsQ0FBQTs7QUFBQSxPQUdBLEdBQVUsT0FBQSxDQUFRLGtCQUFSLENBSFYsQ0FBQTs7QUFBQTtBQWNDLHlCQUFBLENBQUE7O0FBQWEsRUFBQSxjQUFBLEdBQUE7QUFDWiw2Q0FBQSxDQUFBO0FBQUEsMkNBQUEsQ0FBQTtBQUFBLDJDQUFBLENBQUE7QUFBQSxJQUFBLG9DQUFBLENBQUEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQUhULENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBQSxDQU5oQixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBa0IsR0FBbEIsRUFBdUIsR0FBdkIsQ0FQQSxDQUFBO0FBQUEsSUFRQSxDQUFBLENBQUUsUUFBRixDQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBZixDQUEyQixJQUFDLENBQUEsUUFBUSxDQUFDLFVBQXJDLENBUkEsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FYYixDQUFBO0FBQUEsSUFnQkEsSUFBQyxDQUFBLEtBQUQsR0FBUyxNQWhCVCxDQUFBO0FBQUEsSUFpQkEsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxPQUFPLENBQUMsVUFBUixDQUFBLENBakJsQixDQUFBO0FBQUEsSUFrQkEsSUFBQyxDQUFBLGNBQUQsR0FBc0IsSUFBQSxPQUFPLENBQUMsY0FBUixDQUFBLENBbEJ0QixDQUFBO0FBQUEsSUFxQkEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQ2pCLFFBQUEsSUFBRyxLQUFDLENBQUEsS0FBRCxLQUFVLE1BQWI7QUFDQyxVQUFBLEtBQUMsQ0FBQSxLQUFELEdBQVMsU0FBVCxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsU0FBRCxDQUFBLENBREEsQ0FBQTtBQUVBLGdCQUFBLENBSEQ7U0FBQTtBQUtBLFFBQUEsSUFBRyxLQUFDLENBQUEsS0FBRCxLQUFVLFdBQWI7VUFDQyxLQUFDLENBQUEsS0FBRCxHQUFTLE9BRFY7U0FOaUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixDQXJCQSxDQUFBO0FBQUEsSUFrQ0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYLEVBQWMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUNiLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFEYTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQsQ0FsQ0EsQ0FEWTtFQUFBLENBQWI7O0FBQUEsaUJBdUNBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBVCxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsS0FBRCxHQUFhLElBQUEsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUhiLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFdBQVYsRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUN0QixRQUFBLEtBQUMsQ0FBQSxLQUFELEVBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBRyxLQUFDLENBQUEsS0FBRCxHQUFTLENBQVo7aUJBQ0MsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLEtBQUMsQ0FBQSxLQUFLLENBQUMsWUFBeEIsRUFERDtTQUFBLE1BQUE7aUJBR0MsS0FBQyxDQUFBLEtBQUQsR0FBUyxZQUhWO1NBRnNCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsQ0FKQSxDQUFBO1dBV0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQ2xCLEtBQUMsQ0FBQSxLQUFELEdBQVMsT0FEUztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLEVBWlU7RUFBQSxDQXZDWCxDQUFBOztBQUFBLGlCQXNEQSxNQUFBLEdBQVEsU0FBQyxLQUFELEdBQUE7QUFDUCxJQUFBLElBQUcsSUFBQyxDQUFBLEtBQUQsS0FBVSxNQUFiO0FBQ0MsTUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBbUIsS0FBbkIsQ0FBQSxDQUREO0tBQUE7QUFHQSxJQUFBLElBQUcsSUFBQyxDQUFBLEtBQUQsS0FBVSxNQUFiO0FBQ0MsTUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxLQUFkLENBQUEsQ0FERDtLQUhBO0FBTUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFELEtBQVUsV0FBYjtBQUNDLE1BQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsS0FBZCxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsY0FBYyxDQUFDLE1BQWhCLENBQXVCLEtBQXZCLEVBRkQ7S0FQTztFQUFBLENBdERSLENBQUE7O0FBQUEsaUJBa0VBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDUCxJQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixHQUFzQixLQUF0QixDQUFBO0FBRUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFELEtBQVUsTUFBYjtBQUNDLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBN0IsRUFBb0MsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFoRCxDQUFBLENBREQ7S0FGQTtBQUtBLElBQUEsSUFBRyxJQUFDLENBQUEsS0FBRCxLQUFVLE1BQWI7QUFDQyxNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLEtBQXhCLEVBQStCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBdEMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUE3QixFQUFvQyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTNDLEVBQW1ELE1BQW5ELEVBQThELEtBQTlELENBREEsQ0FERDtLQUxBO0FBU0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFELEtBQVUsV0FBYjtBQUNDLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBeEIsRUFBK0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUF0QyxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxLQUFqQyxFQUF3QyxJQUFDLENBQUEsY0FBYyxDQUFDLE1BQXhELEVBQWdFLE1BQWhFLEVBQTJFLEtBQTNFLEVBRkQ7S0FWTztFQUFBLENBbEVSLENBQUE7O0FBQUEsaUJBa0ZBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFFUixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBQSxDQUFSLENBQUE7QUFDQSxJQUFBLElBQUksS0FBQSxHQUFRLEVBQVo7QUFDQyxNQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBREQ7S0FEQTtBQUFBLElBS0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUxBLENBQUE7QUFBQSxJQVFBLHFCQUFBLENBQXNCLElBQUMsQ0FBQSxPQUF2QixDQVJBLENBRlE7RUFBQSxDQWxGVCxDQUFBOztjQUFBOztHQURrQixLQWJuQixDQUFBOztBQUFBLE9BOEdPLENBQUMsSUFBUixHQUFlLElBOUdmLENBQUE7Ozs7QUNBQSxJQUFBLGdCQUFBO0VBQUE7O2lTQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUE7QUFHQywrQkFBQSxDQUFBOztBQUFhLEVBQUEsb0JBQUEsR0FBQTtBQUNaLDJDQUFBLENBQUE7QUFBQSxJQUFBLDBDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUZWLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFIWixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUpaLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FMUixDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBTlYsQ0FEWTtFQUFBLENBQWI7O0FBQUEsdUJBU0EsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsUUFBQSw0QkFBQTtBQUFBO1NBQVMsK0RBQVQsR0FBQTtBQUNDLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFsQixDQUFBO0FBQ0EsTUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFUO0FBQ0MsUUFBQSxJQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBO0FBQ0EsaUJBRkQ7T0FEQTtBQUlBLE1BQUEsSUFBRyxLQUFLLENBQUMsTUFBVDtzQkFDQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWIsR0FERDtPQUFBLE1BQUE7OEJBQUE7T0FMRDtBQUFBO29CQURPO0VBQUEsQ0FUUixDQUFBOztBQUFBLHVCQWtCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO1dBQ1QsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUREO0VBQUEsQ0FsQlYsQ0FBQTs7QUFBQSx1QkFzQkEsR0FBQSxHQUFLLFNBQUMsVUFBRCxHQUFBO0FBQ0osSUFBQSxVQUFVLENBQUMsTUFBWCxHQUFvQixJQUFwQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxVQUFmLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsVUFBVSxDQUFDLElBQXJCLENBRkEsQ0FBQTtBQUdBLFdBQU8sVUFBUCxDQUpJO0VBQUEsQ0F0QkwsQ0FBQTs7QUFBQSx1QkE0QkEsTUFBQSxHQUFRLFNBQUMsVUFBRCxHQUFBO0FBQ1AsUUFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxVQUFVLENBQUMsSUFBeEIsQ0FBQSxDQUFBO0FBQUEsSUFDQSxVQUFVLENBQUMsTUFBWCxHQUFvQixJQURwQixDQUFBO0FBQUEsSUFFQSxDQUFBLEdBQUssSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLFVBQWxCLENBRkwsQ0FBQTtBQUdBLElBQUEsSUFBRyxDQUFBLElBQUssQ0FBUjtBQUNDLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLENBQWpCLEVBQW9CLENBQXBCLENBQUEsQ0FERDtLQUhBO0FBS0EsV0FBTyxVQUFQLENBTk87RUFBQSxDQTVCUixDQUFBOztBQUFBLHVCQW9DQSxHQUFBLEdBQUssU0FBQSxHQUFBO0FBQ0osSUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQVIsQ0FBQTtXQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBVCxFQUZJO0VBQUEsQ0FwQ0wsQ0FBQTs7b0JBQUE7O0dBRHdCLEtBRnpCLENBQUE7O0FBQUEsTUEyQ00sQ0FBQyxPQUFQLEdBQWlCLFVBM0NqQixDQUFBOzs7O0FDQUEsSUFBQSxZQUFBOztBQUFBO0FBQ0Msa0JBQUEsTUFBQSxHQUNDO0FBQUEsSUFBQSxJQUFBLEVBQUssSUFBTDtBQUFBLElBQ0EsSUFBQSxFQUFLLElBREw7QUFBQSxJQUVBLElBQUEsRUFBSyxNQUZMO0FBQUEsSUFHQSxJQUFBLEVBQUssTUFITDtBQUFBLElBSUEsSUFBQSxFQUFLLE1BSkw7QUFBQSxJQUtBLElBQUEsRUFBSyxNQUxMO0FBQUEsSUFNQSxJQUFBLEVBQUssT0FOTDtBQUFBLElBT0EsSUFBQSxFQUFLLE9BUEw7QUFBQSxJQVFBLElBQUEsRUFBSyxjQVJMO0dBREQsQ0FBQTs7QUFXYSxFQUFBLGVBQUEsR0FBQTtBQUNaLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFBYixDQUFBO0FBRUE7QUFBQSxTQUFBLFdBQUE7d0JBQUE7QUFDQyxNQUFBLElBQUMsQ0FBQSxTQUFVLENBQUEsS0FBQSxDQUFYLEdBQW9CLEtBQXBCLENBREQ7QUFBQSxLQUZBO0FBQUEsSUFLQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsT0FBVixDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEdBQUE7QUFFakIsUUFBQSxJQUFHLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBWDtBQUNDLFVBQUEsS0FBQyxDQUFBLFNBQVUsQ0FBQSxLQUFDLENBQUEsTUFBTyxDQUFBLENBQUMsQ0FBQyxLQUFGLENBQVIsQ0FBWCxHQUErQixJQUEvQixDQUREO1NBQUE7ZUFFQSxDQUFDLENBQUMsZUFBRixDQUFBLEVBSmlCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0FMQSxDQUFBO0FBQUEsSUFXQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEdBQUE7QUFDZixRQUFBLElBQUcsS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFDLENBQUMsS0FBRixDQUFYO0FBQ0MsVUFBQSxLQUFDLENBQUEsU0FBVSxDQUFBLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBUixDQUFYLEdBQStCLEtBQS9CLENBREQ7U0FBQTtlQUVBLENBQUMsQ0FBQyxlQUFGLENBQUEsRUFIZTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCLENBWEEsQ0FEWTtFQUFBLENBWGI7O2VBQUE7O0lBREQsQ0FBQTs7QUFBQSxLQTZCQSxHQUFZLElBQUEsS0FBQSxDQUFBLENBN0JaLENBQUE7O0FBQUEsTUE4Qk0sQ0FBQyxPQUFQLEdBQWlCLEtBOUJqQixDQUFBOzs7O0FDQUEsSUFBQSxrREFBQTtFQUFBOztpU0FBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGdCQUFSLENBQVAsQ0FBQTs7QUFBQSxLQUNBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBRFIsQ0FBQTs7QUFBQSxNQUVBLEdBQVMsT0FBQSxDQUFRLGlCQUFSLENBRlQsQ0FBQTs7QUFBQSxVQUdBLEdBQWEsT0FBQSxDQUFRLHFCQUFSLENBSGIsQ0FBQTs7QUFBQSxVQUlBLEdBQWEsT0FBQSxDQUFRLHFCQUFSLENBSmIsQ0FBQTs7QUFBQTtBQU9DLDBCQUFBLENBQUE7O0FBQWEsRUFBQSxlQUFBLEdBQUE7QUFDWix1REFBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLElBQUEscUNBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBRmIsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FMYixDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxJQUFDLENBQUEsSUFBWixDQU5BLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FBd0IsRUFBeEIsRUFBNEIsR0FBQSxHQUFNLEdBQWxDLEVBQXVDLENBQXZDLEVBQTBDLEtBQTFDLENBVGQsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBakIsR0FBcUIsSUFBSSxDQUFDLFlBQUwsQ0FBQSxDQUFBLEdBQXNCLENBVjNDLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLElBQUMsQ0FBQSxNQUFaLENBWEEsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxLQUFLLENBQUMsWUFBTixDQUFtQixRQUFuQixDQWRwQixDQUFBO0FBQUEsSUFlQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsWUFBWCxDQWZBLENBQUE7QUFBQSxJQW1CQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBbkJBLENBQUE7QUFBQSxJQXVCQSxLQUFLLENBQUMsSUFBTixDQUFXLHFCQUFYLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsSUFBQyxDQUFBLFFBQXhDLENBQWlELENBQUMsT0FBRCxDQUFqRCxDQUF3RCxTQUFDLEtBQUQsR0FBQTthQUN0RCxPQUFPLENBQUMsS0FBUixDQUFjLEtBQWQsRUFEc0Q7SUFBQSxDQUF4RCxDQXZCQSxDQURZO0VBQUEsQ0FBYjs7QUFBQSxrQkEyQkEsUUFBQSxHQUFVLFNBQUMsR0FBRCxHQUFBO0FBQ1QsUUFBQSxzQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBaEMsQ0FBQSxDQUFBO0FBQUEsSUFDQSxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQXBDLEdBQXdDLEdBQUEsR0FBTSxDQUQ5QyxDQUFBO0FBQUEsSUFFQSxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQXBDLEdBQXlDLElBQUksQ0FBQyxZQUFMLENBQUEsQ0FBQSxHQUFzQixDQUFBLENBRi9ELENBQUE7QUFBQSxJQUdBLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBakMsQ0FBcUMsQ0FBckMsRUFBd0MsQ0FBeEMsRUFBMkMsQ0FBM0MsQ0FIQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUEvQixDQUxBLENBQUE7QUFBQSxJQU1BLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBbkMsR0FBdUMsR0FOdkMsQ0FBQTtBQVFBO0FBQUEsU0FBQSwyQ0FBQTt3QkFBQTtBQUNDLE1BQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMLENBQUEsQ0FERDtBQUFBLEtBUkE7V0FXQSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQsRUFaUztFQUFBLENBM0JWLENBQUE7O0FBQUEsa0JBeUNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDYixJQUFBLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxNQUFBLENBQUEsQ0FBZixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUMsQ0FBQSxPQUFOLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQXZCLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBcEMsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBdkIsR0FBMkIsQ0FIM0IsQ0FBQTtXQUtBLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLEtBQVosRUFBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUNsQixLQUFDLENBQUEsT0FBRCxDQUFTLFdBQVQsRUFEa0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQU5hO0VBQUEsQ0F6Q2QsQ0FBQTs7QUFBQSxrQkFrREEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsUUFBQSxxQkFBQTtBQUFBLElBQUEsa0NBQU0sS0FBTixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWpCLElBQXNCLENBQUEsR0FBSSxLQUQxQixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBdkIsSUFBNEIsQ0FBQSxHQUFJLEtBRmhDLENBQUE7QUFJQTtBQUFBLFNBQUEsMkNBQUE7dUJBQUE7QUFDQyxNQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsS0FBaEIsSUFBMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBcEIsR0FBd0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBakIsR0FBcUIsRUFBMUU7QUFDQyxRQUFBLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBQSxDQUREO09BREQ7QUFBQSxLQUpBO1dBUUEsVUFBVSxDQUFDLGlCQUFYLENBQTZCLElBQUMsQ0FBQSxTQUE5QixFQVRPO0VBQUEsQ0FsRFIsQ0FBQTs7QUFBQSxrQkFnRUEsR0FBQSxHQUFLLFNBQUMsVUFBRCxHQUFBO0FBQ0osSUFBQSxJQUFHLFVBQUEsWUFBc0IsVUFBVSxDQUFDLGVBQXBDO0FBQ0MsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsVUFBaEIsQ0FBQSxDQUREO0tBQUE7QUFFQSxXQUFPLCtCQUFNLFVBQU4sQ0FBUCxDQUhJO0VBQUEsQ0FoRUwsQ0FBQTs7QUFBQSxrQkFxRUEsTUFBQSxHQUFRLFNBQUMsVUFBRCxHQUFBO0FBQ1AsUUFBQSxDQUFBO0FBQUEsSUFBQSxDQUFBLEdBQUssSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLFVBQW5CLENBQUwsQ0FBQTtBQUNBLElBQUEsSUFBRyxDQUFBLElBQUssQ0FBUjtBQUNDLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLENBQWxCLEVBQXFCLENBQXJCLENBQUEsQ0FERDtLQURBO0FBR0EsV0FBTyxrQ0FBTSxVQUFOLENBQVAsQ0FKTztFQUFBLENBckVSLENBQUE7O2VBQUE7O0dBRG1CLFdBTnBCLENBQUE7O0FBQUEsT0F1Rk8sQ0FBQyxLQUFSLEdBQWdCLEtBdkZoQixDQUFBOzs7O0FDQUEsSUFBQSx3QkFBQTtFQUFBOzs7b0JBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBQVAsQ0FBQTs7QUFBQTtBQUdDLDBCQUFBLENBQUE7O0FBQWEsRUFBQSxlQUFFLFFBQUYsRUFBYSxRQUFiLEdBQUE7QUFDWixJQURhLElBQUMsQ0FBQSxXQUFBLFFBQ2QsQ0FBQTtBQUFBLElBRHdCLElBQUMsQ0FBQSxXQUFBLFFBQ3pCLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsdUNBQUEsQ0FBQTtBQUFBLElBQUEscUNBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLE1BRFosQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxNQUZaLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxPQUFELEdBQVcsTUFIWCxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsTUFBRCxHQUFVLE1BSlYsQ0FEWTtFQUFBLENBQWI7O0FBQUEsa0JBT0EsSUFBQSxHQUFNLFNBQUMsUUFBRCxHQUFBO0FBQ0wsUUFBQSxVQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWlCLElBQUEsS0FBSyxDQUFDLFVBQU4sQ0FBQSxDQUFqQixDQUFBO1dBQ0EsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsUUFBaEIsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUN6QixZQUFBLDJCQUFBO0FBQUEsUUFEMEIseUJBQVUsMEJBQVcsZ0VBQy9DLENBQUE7QUFBQSxRQUFBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLGdCQUFOLENBQXdCLFNBQXhCLENBQWhCLENBQUE7QUFBQSxRQUVBLEtBQUMsQ0FBQSxRQUFELEdBQVksUUFGWixDQUFBO0FBQUEsUUFHQSxLQUFDLENBQUEsTUFBRCxHQUFVLE9BSFYsQ0FBQTtlQUlBLEtBQUMsQ0FBQSxPQUFELENBQVMsU0FBVCxFQUFvQixLQUFwQixFQUx5QjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLEVBRks7RUFBQSxDQVBOLENBQUE7O0FBQUEsa0JBZ0JBLE9BQUEsR0FBUyxTQUFDLFFBQUQsR0FBQTtXQUNSLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFqQixDQUE2QixRQUE3QixFQUF1QyxFQUF2QyxFQUEyQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQ3JELFFBQUEsS0FBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FHZjtBQUFBLFVBQUEsR0FBQSxFQUFLLEtBQUMsQ0FBQSxPQUFOO1NBSGUsQ0FBaEIsQ0FBQTtBQUFBLFFBS0EsS0FBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxLQUFLLENBQUMsYUFBTixDQUFvQixDQUFwQixFQUF1QixDQUF2QixDQUxoQixDQUFBO0FBQUEsUUFNQSxLQUFDLENBQUEsTUFBRCxHQUFVLE9BTlYsQ0FBQTtlQVFBLEtBQUMsQ0FBQSxPQUFELENBQVMsU0FBVCxFQUFvQixLQUFwQixFQVRxRDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDLEVBREg7RUFBQSxDQWhCVCxDQUFBOztlQUFBOztHQURtQixLQUZwQixDQUFBOztBQUFBO0FBa0NjLEVBQUEscUJBQUEsR0FBQTtBQUNaLElBQUEsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxLQUFLLENBQUMsWUFBTixDQUFtQixDQUFuQixFQUFxQixDQUFyQixFQUF1QixDQUF2QixDQUF2QixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZUFBRCxHQUF1QixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUN0QjtBQUFBLE1BQUEsS0FBQSxFQUFPLFFBQVA7QUFBQSxNQUNBLFNBQUEsRUFBVyxJQURYO0FBQUEsTUFFQSxHQUFBLEVBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFqQixDQUE2Qix1QkFBN0IsQ0FGTDtLQURzQixDQUR2QixDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsWUFBRCxHQUFnQixFQU5oQixDQURZO0VBQUEsQ0FBYjs7QUFBQSx3QkFTQSxJQUFBLEdBQU0sU0FBQyxRQUFELEdBQUE7QUFHTCxRQUFBLGFBQUE7QUFBQSxJQUFBLElBQUcscUNBQUEsSUFBNEIsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQVMsQ0FBQyxNQUF4QixLQUFrQyxPQUFqRTtBQUVDLGFBQVcsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxZQUFhLENBQUEsUUFBQSxDQUFTLENBQUMsUUFBbkMsRUFBNkMsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQVMsQ0FBQyxRQUFyRSxDQUFYLENBRkQ7S0FBQTtBQU1BLElBQUEsSUFBRyxJQUFDLENBQUEsWUFBYSxDQUFBLFFBQUEsQ0FBakI7QUFDQyxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsWUFBYSxDQUFBLFFBQUEsQ0FBdEIsQ0FERDtLQUFBLE1BQUE7QUFLQyxNQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBQSxDQUFaLENBQUE7QUFDQSxNQUFBLElBQUcsUUFBUSxDQUFDLEtBQVQsQ0FBZSxHQUFmLENBQW1CLENBQUMsR0FBcEIsQ0FBQSxDQUFBLEtBQTZCLElBQWhDO0FBQ0MsUUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsQ0FBQSxDQUREO09BQUEsTUFBQTtBQUdDLFFBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxRQUFkLENBQUEsQ0FIRDtPQURBO0FBQUEsTUFLQSxJQUFDLENBQUEsWUFBYSxDQUFBLFFBQUEsQ0FBZCxHQUEwQixLQUwxQixDQUxEO0tBTkE7QUFBQSxJQWtCQSxNQUFBLEdBQWEsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFZLElBQUMsQ0FBQSxlQUFiLEVBQThCLElBQUMsQ0FBQSxlQUEvQixDQWxCYixDQUFBO0FBQUEsSUFtQkEsS0FBSyxDQUFDLEVBQU4sQ0FBUyxTQUFULEVBQW9CLFNBQUMsQ0FBRCxHQUFBO0FBQ25CLE1BQUEsTUFBTSxDQUFDLFFBQVAsR0FBa0IsQ0FBQyxDQUFDLFFBQXBCLENBQUE7QUFBQSxNQUNBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLENBQUMsQ0FBQyxRQURwQixDQUFBO2FBRUEsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxTQUFOLEVBQWlCLFNBQVMsQ0FBQyxNQUEzQixFQUhtQjtJQUFBLENBQXBCLENBbkJBLENBQUE7QUF1QkEsV0FBTyxNQUFQLENBMUJLO0VBQUEsQ0FUTixDQUFBOztxQkFBQTs7SUFsQ0QsQ0FBQTs7QUFBQSxNQXVFTSxDQUFDLE9BQVAsR0FBaUIsV0F2RWpCLENBQUE7Ozs7QUNBQSxJQUFBLDBCQUFBO0VBQUE7aVNBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQUFiLENBQUE7O0FBQUEsSUFDQSxHQUFPLE9BQUEsQ0FBUSxnQkFBUixDQURQLENBQUE7O0FBQUE7QUFJQyxNQUFBLG1EQUFBOztBQUFBLDZCQUFBLENBQUE7O0FBQUEsRUFBQSxlQUFBLEdBQWtCLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsZ0NBQTdCLENBQWxCLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUF1QixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUNyQjtBQUFBLElBQUEsR0FBQSxFQUFLLGVBQUw7QUFBQSxJQUNBLE9BQUEsRUFBUyxLQUFLLENBQUMsU0FEZjtBQUFBLElBRUEsVUFBQSxFQUFZLEtBRlo7QUFBQSxJQUdBLFdBQUEsRUFBYSxJQUhiO0FBQUEsSUFJQSxRQUFBLEVBQVUsS0FBSyxDQUFDLGdCQUpoQjtHQURxQixDQUR2QixDQUFBOztBQUFBLEVBUUEsZ0JBQUEsR0FBdUIsSUFBQSxLQUFLLENBQUMsYUFBTixDQUFxQixDQUFyQixFQUF3QixDQUF4QixDQVJ2QixDQUFBOztBQVVhLEVBQUEsa0JBQUMsUUFBRCxFQUFXLE1BQVgsR0FBQTtBQUNaLElBQUEsd0NBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FGVCxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBSGQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQWMsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLGdCQUFYLEVBQTZCLGdCQUE3QixDQUFkLENBSkEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxLQUFLLENBQUMsT0FBTixDQUFjLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQSxDQUFaLEVBQWdCLENBQWhCLENBQWQsRUFBa0MsSUFBSSxDQUFDLE1BQUwsQ0FBWSxDQUFBLENBQVosRUFBZ0IsQ0FBaEIsQ0FBbEMsRUFBc0QsSUFBSSxDQUFDLE1BQUwsQ0FBWSxDQUFBLENBQVosRUFBZ0IsQ0FBaEIsQ0FBdEQsQ0FOaEIsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQUEsQ0FBcUIsQ0FBQyxjQUF0QixDQUFxQyxNQUFyQyxDQVBBLENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FSQSxDQURZO0VBQUEsQ0FWYjs7QUFBQSxxQkFxQkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsUUFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLGNBQVYsQ0FBeUIsR0FBekIsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBVixHQUFjLEtBRGxDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsS0FGbEMsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixJQUFDLENBQUEsUUFBUSxDQUFDLENBQVYsR0FBYyxLQUhsQyxDQUFBO0FBQUEsSUFJQSxDQUFBLEdBQUksQ0FBQSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsS0FBZixDQUFBLEdBQXdCLElBQUMsQ0FBQSxVQUExQixDQUFILEdBQTJDLEdBSi9DLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQVosQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FMQSxDQUFBO0FBTUEsSUFBQSxJQUFHLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBQSxHQUFhLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLFVBQTFCO2FBQ0MsSUFBQyxDQUFBLEdBQUQsQ0FBQSxFQUREO0tBUE87RUFBQSxDQXJCUixDQUFBOztrQkFBQTs7R0FEc0IsV0FIdkIsQ0FBQTs7QUFBQSxNQW1DTSxDQUFDLE9BQVAsR0FBaUIsUUFuQ2pCLENBQUE7Ozs7QUNBQSxJQUFBLDBGQUFBO0VBQUE7O2lTQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZ0JBQVIsQ0FBUCxDQUFBOztBQUFBLEtBRUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FGUixDQUFBOztBQUFBLFVBR0EsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FIYixDQUFBOztBQUFBLFdBSUEsR0FBYyxPQUFBLENBQVEsc0JBQVIsQ0FKZCxDQUFBOztBQUFBLEtBS0EsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FMUixDQUFBOztBQUFBLE9BTUEsR0FBVSxPQUFBLENBQVEsa0JBQVIsQ0FOVixDQUFBOztBQUFBLFFBT0EsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FQWCxDQUFBOztBQUFBLEtBUUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FSUixDQUFBOztBQUFBLFdBVUEsR0FBa0IsSUFBQSxXQUFBLENBQUEsQ0FWbEIsQ0FBQTs7QUFBQTtBQWVDLDJCQUFBLENBQUE7O0FBQWEsRUFBQSxnQkFBQSxHQUFBO0FBQ1osMkNBQUEsQ0FBQTtBQUFBLFFBQUEsS0FBQTtBQUFBLElBQUEsc0NBQUEsQ0FBQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsWUFBRCxHQUFnQixRQUhoQixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsY0FBdkIsQ0FKQSxDQUFBO0FBQUEsSUFNQSxLQUFBLEdBQVEsV0FBVyxDQUFDLElBQVosQ0FBaUIsdUJBQWpCLENBTlIsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsS0FBVixDQVBBLENBQUE7QUFBQSxJQVFBLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxFQUFpQixTQUFBLEdBQUE7YUFDaEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBNUIsR0FBd0MsS0FEeEI7SUFBQSxDQUFqQixDQVJBLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQVhaLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FaTixDQURZO0VBQUEsQ0FBYjs7QUFBQSxtQkFnQkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsSUFBQSxDQUFuQjtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixFQUFBLEdBQUssS0FBekIsQ0FERDtLQUFBO0FBRUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsTUFBQSxDQUFuQjtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixFQUFBLEdBQUssS0FBekIsQ0FERDtLQUZBO0FBSUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsTUFBQSxDQUFuQjtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixFQUFBLEdBQUssS0FBekIsQ0FERDtLQUpBO0FBTUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsT0FBQSxDQUFuQjtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixFQUFBLEdBQUssS0FBekIsQ0FERDtLQU5BO0FBUUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxTQUFVLENBQUEsY0FBQSxDQUFuQjthQUNDLElBQUMsQ0FBQSxZQUFELENBQUEsRUFERDtLQVRPO0VBQUEsQ0FoQlIsQ0FBQTs7QUFBQSxtQkE0QkEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNiLFFBQUEsTUFBQTtBQUFBLElBQUEsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsUUFBRCxHQUFZLEdBQUEsR0FBTSxDQUFsQztBQUNDLE1BQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFBLENBRFosQ0FBQTtBQUFBLE1BR0EsTUFBQSxHQUFhLElBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQXJCLENBSGIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksTUFBWixDQUpBLENBQUE7QUFBQSxNQU1BLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFyQixDQU5iLENBQUE7QUFBQSxNQU9BLE1BQU0sQ0FBQyxLQUFQLEdBQWUsQ0FBQSxHQVBmLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosQ0FSQSxDQUFBO0FBQUEsTUFVQSxNQUFBLEdBQWEsSUFBQSxPQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBckIsQ0FWYixDQUFBO0FBQUEsTUFXQSxNQUFNLENBQUMsS0FBUCxHQUFlLENBQUEsR0FYZixDQUFBO2FBWUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksTUFBWixFQWJEO0tBRGE7RUFBQSxDQTVCZCxDQUFBOztBQUFBLG1CQTZDQSxHQUFBLEdBQUssU0FBQSxHQUFBO0FBR0osUUFBQSxLQUFBO0FBQUEsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLFdBQVgsQ0FBQSxDQUFBO0FBQ0EsU0FBUywrQkFBVCxHQUFBO0FBQ0MsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBZ0IsSUFBQSxRQUFBLENBQVMsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFmLEVBQXlCLENBQXpCLENBQWhCLENBQUEsQ0FERDtBQUFBLEtBREE7V0FjQSw4QkFBQSxFQWpCSTtFQUFBLENBN0NMLENBQUE7O2dCQUFBOztHQUZvQixVQUFVLENBQUMsZ0JBYmhDLENBQUE7O0FBQUEsTUFpRk0sQ0FBQyxPQUFQLEdBQWlCLE1BakZqQixDQUFBOzs7O0FDQ0EsSUFBQSxLQUFBOztBQUFBLEtBQUEsR0FBUSxDQUFSLENBQUE7O0FBQUEsT0FDTyxDQUFDLGNBQVIsR0FBeUIsTUFEekIsQ0FBQTs7QUFBQSxPQUdPLENBQUMsR0FBUixHQUFjLFNBQUMsTUFBRCxHQUFBO0FBQ2IsRUFBQSxLQUFBLElBQVMsTUFBVCxDQUFBO0FBRUEsRUFBQSxJQUFHLDhCQUFIO1dBQ0MsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUF2QixDQUE2QixTQUFBLEdBQVEsS0FBckMsRUFERDtHQUhhO0FBQUEsQ0FIZCxDQUFBOztBQUFBLE9BU08sQ0FBQyxHQUFSLEdBQWMsU0FBQSxHQUFBO0FBQ2IsU0FBTyxLQUFQLENBRGE7QUFBQSxDQVRkLENBQUE7Ozs7QUNEQSxJQUFBLDRDQUFBO0VBQUE7aVNBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxnQkFBUixDQUFQLENBQUE7O0FBQUEsVUFDQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQURiLENBQUE7O0FBQUE7QUFJQyxNQUFBLDJCQUFBOztBQUFBLCtCQUFBLENBQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFqQixDQUE2QiwwQkFBN0IsQ0FBVixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFlLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQ2I7QUFBQSxJQUFBLEdBQUEsRUFBSyxPQUFMO0FBQUEsSUFDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFVBRFo7QUFBQSxJQUVBLE9BQUEsRUFBUyxLQUFLLENBQUMsU0FGZjtBQUFBLElBR0EsV0FBQSxFQUFhLElBSGI7R0FEYSxDQURmLENBQUE7O0FBQUEsRUFPQSxRQUFBLEdBQWUsSUFBQSxLQUFLLENBQUMsYUFBTixDQUFxQixFQUFyQixFQUF5QixFQUF6QixDQVBmLENBQUE7O0FBU2EsRUFBQSxvQkFBQSxHQUFBO0FBQ1osUUFBQSxNQUFBO0FBQUEsSUFBQSwwQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxLQUFLLENBQUMsS0FBTixDQUFBLENBRmIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsSUFBQyxDQUFBLElBQVosQ0FIQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQXdCLEVBQXhCLEVBQTRCLEdBQUEsR0FBTSxHQUFsQyxFQUF1QyxDQUF2QyxFQUEwQyxLQUExQyxDQUxkLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWpCLEdBQXFCLElBQUksQ0FBQyxZQUFMLENBQUEsQ0FBQSxHQUFzQixDQU4zQyxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxJQUFDLENBQUEsTUFBWixDQVBBLENBQUE7QUFBQSxJQVNBLE1BQUEsR0FBYSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxFQUFxQixRQUFyQixDQVRiLENBQUE7QUFBQSxJQVVBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBYixDQUFpQixHQUFqQixFQUFzQixHQUF0QixFQUEyQixHQUEzQixDQVZBLENBQUE7QUFBQSxJQVdBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBaEIsR0FBcUIsSUFBSSxDQUFDLFlBQUwsQ0FBQSxDQUFBLEdBQXNCLEdBWDNDLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FaQSxDQURZO0VBQUEsQ0FUYjs7b0JBQUE7O0dBRHdCLFdBSHpCLENBQUE7O0FBQUEsT0E2Qk8sQ0FBQyxVQUFSLEdBQXFCLFVBN0JyQixDQUFBOztBQUFBO0FBZ0NDLE1BQUEsMkJBQUE7O0FBQUEsbUNBQUEsQ0FBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLDhCQUE3QixDQUFWLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQWUsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDYjtBQUFBLElBQUEsR0FBQSxFQUFLLE9BQUw7QUFBQSxJQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsVUFEWjtBQUFBLElBRUEsT0FBQSxFQUFTLEtBQUssQ0FBQyxTQUZmO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtHQURhLENBRGYsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsR0FBZSxJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLEVBQXJCLEVBQXlCLEVBQXpCLENBUGYsQ0FBQTs7QUFRYSxFQUFBLHdCQUFBLEdBQUE7QUFDWixJQUFBLDhDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FGYixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxJQUFDLENBQUEsSUFBWixDQUhBLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FBd0IsRUFBeEIsRUFBNEIsR0FBQSxHQUFNLEdBQWxDLEVBQXVDLENBQXZDLEVBQTBDLEtBQTFDLENBTGQsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBakIsR0FBcUIsSUFBSSxDQUFDLFlBQUwsQ0FBQSxDQUFBLEdBQXNCLENBTjNDLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLElBQUMsQ0FBQSxNQUFaLENBUEEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQWMsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsRUFBcUIsUUFBckIsQ0FBZCxDQVRBLENBRFk7RUFBQSxDQVJiOzt3QkFBQTs7R0FENEIsV0EvQjdCLENBQUE7O0FBQUEsT0FvRE8sQ0FBQyxjQUFSLEdBQXlCLGNBcER6QixDQUFBOzs7O0FDQUEsSUFBQSw0REFBQTs7QUFBQSxNQUFNLENBQUMsWUFBUCxHQUFzQixNQUFNLENBQUMsWUFBUCxJQUFxQixNQUFNLENBQUMsa0JBQWxELENBQUE7O0FBQUEsWUFDQSxHQUFtQixJQUFBLFlBQUEsQ0FBQSxDQURuQixDQUFBOztBQUFBO0FBSWMsRUFBQSxlQUFFLElBQUYsRUFBUyxHQUFULEVBQWUsTUFBZixHQUFBO0FBQXVCLElBQXRCLElBQUMsQ0FBQSxPQUFBLElBQXFCLENBQUE7QUFBQSxJQUFmLElBQUMsQ0FBQSxNQUFBLEdBQWMsQ0FBQTtBQUFBLElBQVQsSUFBQyxDQUFBLFNBQUEsTUFBUSxDQUF2QjtFQUFBLENBQWI7O2VBQUE7O0lBSkQsQ0FBQTs7QUFBQSxPQUtPLENBQUMsS0FBUixHQUFnQixLQUxoQixDQUFBOztBQUFBLE9BT08sQ0FBQyxZQUFSLEdBQXVCLFlBQUEsR0FBZSxFQVB0QyxDQUFBOztBQUFBLE9BVU8sQ0FBQyxJQUFSLEdBQWUsSUFBQSxHQUFPLFNBQUMsSUFBRCxFQUFPLEdBQVAsR0FBQTtBQUNyQixTQUFXLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDbEIsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQWMsSUFBQSxjQUFBLENBQUEsQ0FBZCxDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLEtBQWIsRUFBb0IsR0FBcEIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxPQUFPLENBQUMsWUFBUixHQUF1QixhQUZ2QixDQUFBO0FBQUEsTUFHQSxPQUFPLENBQUMsTUFBUixHQUFpQixTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxHQUFBO0FBQ2hCLFFBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixLQUFrQixHQUFyQjtpQkFDQyxZQUFZLENBQUMsZUFBYixDQUE2QixPQUFPLENBQUMsUUFBckMsRUFDQyxTQUFDLE1BQUQsR0FBQTtBQUVDLGdCQUFBLEtBQUE7QUFBQSxZQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQixNQUFqQixDQUFaLENBQUE7QUFBQSxZQUNBLE9BQU8sQ0FBQyxZQUFhLENBQUEsSUFBQSxDQUFyQixHQUE2QixLQUQ3QixDQUFBO0FBRUEsbUJBQU8sT0FBQSxDQUFRLEtBQVIsQ0FBUCxDQUpEO1VBQUEsQ0FERCxFQU1FLFNBQUMsR0FBRCxHQUFBO21CQUNBLE1BQUEsQ0FBTyxLQUFBLENBQU0sZ0JBQU4sQ0FBUCxFQURBO1VBQUEsQ0FORixFQUREO1NBQUEsTUFBQTtBQVVDLFVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBYSxRQUFiLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBQSxDQUFNLGNBQU4sQ0FBUCxFQVhEO1NBRGdCO01BQUEsQ0FIakIsQ0FBQTtBQUFBLE1Ba0JBLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBQUEsR0FBQTtBQUNqQixRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sS0FBQSxDQUFNLGVBQU4sQ0FBUCxFQUZpQjtNQUFBLENBbEJsQixDQUFBO2FBc0JBLE9BQU8sQ0FBQyxJQUFSLENBQUEsRUF2QmtCO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixDQUFYLENBRHFCO0FBQUEsQ0FWdEIsQ0FBQTs7QUFBQSxPQXFDTyxDQUFDLElBQVIsR0FBZSxJQUFBLEdBQU8sU0FBQyxHQUFELEdBQUE7QUFDckIsTUFBQSxjQUFBO0FBQUEsRUFBQSxJQUFHLE1BQUEsQ0FBQSxHQUFBLEtBQWMsUUFBakI7QUFDQyxJQUFBLE1BQUEsR0FBUyxZQUFhLENBQUEsR0FBQSxDQUFJLENBQUMsTUFBM0IsQ0FERDtHQUFBLE1BQUE7QUFHQyxJQUFBLE1BQUEsR0FBUyxHQUFULENBSEQ7R0FBQTtBQUlBLEVBQUEsSUFBRyxjQUFIO0FBQ0MsSUFBQSxNQUFBLEdBQVMsWUFBWSxDQUFDLGtCQUFiLENBQUEsQ0FBVCxDQUFBO0FBQUEsSUFDQSxNQUFNLENBQUMsTUFBUCxHQUFnQixNQURoQixDQUFBO0FBQUEsSUFFQSxNQUFNLENBQUMsT0FBUCxDQUFlLFlBQVksQ0FBQyxXQUE1QixDQUZBLENBQUE7V0FHQSxNQUFNLENBQUMsS0FBUCxDQUFhLENBQWIsRUFKRDtHQUxxQjtBQUFBLENBckN0QixDQUFBOztBQUFBLGFBaURBLEdBQWdCLEVBakRoQixDQUFBOztBQUFBLGFBa0RhLENBQUMsSUFBZCxDQUFtQixJQUFBLENBQUssT0FBTCxFQUFjLHlCQUFkLENBQW5CLENBbERBLENBQUE7O0FBQUEsYUFtRGEsQ0FBQyxJQUFkLENBQW1CLElBQUEsQ0FBSyxXQUFMLEVBQWtCLDZCQUFsQixDQUFuQixDQW5EQSxDQUFBOztBQUFBLE9BcURPLENBQUMsR0FBUixDQUFZLGFBQVosQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLE9BQUQsR0FBQTtTQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksb0JBQVosRUFBa0MsT0FBbEMsRUFESztBQUFBLENBRE4sQ0FHQSxDQUFDLE9BQUQsQ0FIQSxDQUdPLFNBQUMsR0FBRCxHQUFBO1NBQ04sT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBQW9CLEdBQXBCLEVBRE07QUFBQSxDQUhQLENBckRBLENBQUE7Ozs7QUNBQSxJQUFBLDBFQUFBO0VBQUEsa0ZBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUixDQUFWLENBQUE7O0FBQUEsT0FFTyxDQUFDLElBQVIsR0FBZSxJQUFBLEdBQU8sU0FBQyxHQUFELEdBQUE7QUFDckIsU0FBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2xCLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBVixFQUFlLEtBQUMsQ0FBQSxNQUFoQixDQUFSLENBQUE7QUFBQSxNQUVBLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQSxHQUFBO0FBQ1YsWUFBQSxLQUFBO0FBQUEsUUFBQSxLQUFBLEdBQVksSUFBQSxRQUFBLENBQVMsS0FBSyxDQUFDLFlBQWYsQ0FBWixDQUFBO0FBQ0EsZUFBTyxPQUFBLENBQVEsS0FBUixDQUFQLENBRlU7TUFBQSxDQUFYLENBRkEsQ0FBQTthQU1BLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQSxHQUFBO0FBQ1YsZUFBTyxNQUFBLENBQU8sS0FBQSxDQUFNLGNBQU4sQ0FBUCxDQUFQLENBRFU7TUFBQSxDQUFYLEVBUGtCO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixDQUFYLENBRHFCO0FBQUEsQ0FGdEIsQ0FBQTs7QUFBQTtBQWVjLEVBQUEsa0JBQUUsSUFBRixHQUFBO0FBQ1osUUFBQSw2SEFBQTtBQUFBLElBRGEsSUFBQyxDQUFBLE9BQUEsSUFDZCxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxFQUFaLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFEVCxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBRlYsQ0FBQTtBQUtBO0FBQUEsU0FBQSwyQ0FBQTs2QkFBQTtBQUNDLE1BQUEsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFRLFdBQVIsQ0FBZCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxPQUFmLENBREEsQ0FERDtBQUFBLEtBTEE7QUFVQTtBQUFBLFNBQUEsOENBQUE7MEJBQUE7QUFDQyxNQUFBLEVBQUEsR0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQWxCLENBQUE7QUFDQSxXQUFXLDhHQUFYLEdBQUE7QUFDQyxhQUFXLDhHQUFYLEdBQUE7QUFDQyxVQUFBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBSyxPQUFMLEVBQWMsR0FBZCxFQUFtQixHQUFuQixDQUFYLENBQUE7QUFBQSxVQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsRUFBQSxDQUFQLEdBQWEsSUFEYixDQUFBO0FBQUEsVUFFQSxFQUFBLEVBRkEsQ0FERDtBQUFBLFNBREQ7QUFBQSxPQUZEO0FBQUEsS0FWQTtBQW9CQTtBQUFBLFNBQUEsOENBQUE7NEJBQUE7QUFDQyxNQUFBLElBQUcsU0FBUyxDQUFDLElBQVYsS0FBa0IsV0FBckI7QUFDQyxRQUFBLElBQUMsQ0FBQSxNQUFPLENBQUEsU0FBUyxDQUFDLElBQVYsQ0FBUixHQUE4QixJQUFBLFNBQUEsQ0FBVSxJQUFWLEVBQWdCLFNBQWhCLENBQTlCLENBREQ7T0FBQTtBQUVBLE1BQUEsSUFBRyxTQUFTLENBQUMsSUFBVixLQUFrQixhQUFyQjtBQUNDLFFBQUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxTQUFTLENBQUMsSUFBVixDQUFSLEdBQThCLElBQUEsV0FBQSxDQUFZLFNBQVosQ0FBOUIsQ0FERDtPQUhEO0FBQUEsS0FyQlk7RUFBQSxDQUFiOztBQUFBLHFCQTZCQSxhQUFBLEdBQWUsU0FBQyxJQUFELEdBQUE7QUFDZCxRQUFBLHNEQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVksSUFBQSxLQUFLLENBQUMsUUFBTixDQUFBLENBQVosQ0FBQTtBQUNBO0FBQUEsU0FBQSwyREFBQTt1QkFBQTtBQUNDLE1BQUEsSUFBRyxFQUFBLEdBQUssQ0FBUjtBQUNDLFFBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUF4QixDQUFOLENBQUE7QUFBQSxRQUNBLEdBQUEsR0FBTSxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBRG5CLENBQUE7QUFBQSxRQUVBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVcsSUFBQyxDQUFBLEtBQU0sQ0FBQSxFQUFBLENBQWxCLEVBQTJCLElBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLENBQUEsR0FBQSxHQUFPLENBQTFCLEVBQTZCLENBQTdCLENBQTNCLENBRmpCLENBQUE7QUFBQSxRQUdBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBVSxDQUFDLElBQXJCLENBSEEsQ0FERDtPQUREO0FBQUEsS0FEQTtBQU9BLFdBQU8sS0FBUCxDQVJjO0VBQUEsQ0E3QmYsQ0FBQTs7a0JBQUE7O0lBZkQsQ0FBQTs7QUFBQTtBQTJEYyxFQUFBLGlCQUFFLElBQUYsR0FBQTtBQUNaLElBRGEsSUFBQyxDQUFBLE9BQUEsSUFDZCxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBTixHQUFtQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQWpDLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLEdBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFEbEMsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQThCLFNBQUEsR0FBUSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQTVDLENBRlgsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDZjtBQUFBLE1BQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxPQUFOO0FBQUEsTUFDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFVBRFo7QUFBQSxNQUVBLE9BQUEsRUFBUyxLQUFLLENBQUMsU0FGZjtBQUFBLE1BR0EsU0FBQSxFQUFXLElBSFg7QUFBQSxNQUlBLFVBQUEsRUFBWSxLQUpaO0FBQUEsTUFLQSxXQUFBLEVBQWEsSUFMYjtLQURlLENBSGhCLENBRFk7RUFBQSxDQUFiOztpQkFBQTs7SUEzREQsQ0FBQTs7QUFBQTtBQXlFYyxFQUFBLGNBQUUsT0FBRixFQUFZLEdBQVosRUFBa0IsR0FBbEIsR0FBQTtBQUVaLFFBQUEsaUZBQUE7QUFBQSxJQUZhLElBQUMsQ0FBQSxVQUFBLE9BRWQsQ0FBQTtBQUFBLElBRnVCLElBQUMsQ0FBQSxNQUFBLEdBRXhCLENBQUE7QUFBQSxJQUY2QixJQUFDLENBQUEsTUFBQSxHQUU5QixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQWQsR0FBMEIsRUFBL0MsRUFBbUQsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBZCxHQUEyQixFQUE5RSxDQUFoQixDQUFBO0FBR0E7QUFBQSxTQUFBLDJDQUFBO21CQUFBO0FBQ0MsTUFBQSxDQUFDLENBQUMsQ0FBRixJQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQWQsR0FBMEIsRUFBMUIsR0FBK0IsQ0FBdEMsQ0FBQTtBQUFBLE1BQ0EsQ0FBQyxDQUFDLENBQUYsSUFBTyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFkLEdBQTJCLEVBQTNCLEdBQWdDLENBRHZDLENBREQ7QUFBQSxLQUhBO0FBQUEsSUFNQSxJQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFWLEdBQStCLElBTi9CLENBQUE7QUFBQSxJQVNBLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFkLEdBQXdCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBVGhELENBQUE7QUFBQSxJQVVBLFFBQUEsR0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFkLEdBQXlCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBVmxELENBQUE7QUFBQSxJQVlBLEdBQUEsR0FBTSxPQUFBLEdBQVUsSUFBQyxDQUFBLEdBWmpCLENBQUE7QUFBQSxJQWFBLEdBQUEsR0FBTSxRQUFBLEdBQVcsQ0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsR0FBZ0IsSUFBQyxDQUFBLEdBQWpCLEdBQXVCLENBQXhCLENBYmpCLENBQUE7QUFjQTtBQUFBLFNBQUEsOENBQUE7dUJBQUE7QUFDQyxXQUFBLDZDQUFBO3FCQUFBO0FBQ0MsUUFBQSxJQUFHLENBQUMsQ0FBQyxDQUFGLEtBQU8sQ0FBVjtBQUNDLFVBQUEsQ0FBQyxDQUFDLENBQUYsR0FBTSxHQUFOLENBREQ7U0FBQSxNQUFBO0FBR0MsVUFBQSxDQUFDLENBQUMsQ0FBRixHQUFNLEdBQUEsR0FBTSxPQUFaLENBSEQ7U0FBQTtBQUtBLFFBQUEsSUFBRyxDQUFDLENBQUMsQ0FBRixLQUFPLENBQVY7QUFDQyxVQUFBLENBQUMsQ0FBQyxDQUFGLEdBQU0sR0FBTixDQUREO1NBQUEsTUFBQTtBQUdDLFVBQUEsQ0FBQyxDQUFDLENBQUYsR0FBTSxHQUFBLEdBQU0sUUFBWixDQUhEO1NBTkQ7QUFBQSxPQUREO0FBQUEsS0FkQTtBQUFBLElBeUJBLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixHQUEwQixJQXpCMUIsQ0FBQTtBQUFBLElBMkJBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQTNCckIsQ0FGWTtFQUFBLENBQWI7O2NBQUE7O0lBekVELENBQUE7O0FBQUE7QUE0R2MsRUFBQSxtQkFBQyxHQUFELEVBQU8sSUFBUCxHQUFBO0FBQ1osUUFBQSwrQ0FBQTtBQUFBLElBRGtCLElBQUMsQ0FBQSxPQUFBLElBQ25CLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxLQUFLLENBQUMsUUFBTixDQUFBLENBQVosQ0FBQTtBQUNBO0FBQUEsU0FBQSwyREFBQTt1QkFBQTtBQUNDLE1BQUEsSUFBRyxFQUFBLEdBQUssQ0FBUjtBQUNDLFFBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUF4QixDQUFOLENBQUE7QUFBQSxRQUNBLEdBQUEsR0FBTSxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBRG5CLENBQUE7QUFBQSxRQUdBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVcsR0FBRyxDQUFDLEtBQU0sQ0FBQSxFQUFBLENBQXJCLEVBQThCLElBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLENBQUEsR0FBQSxHQUFPLENBQTFCLEVBQTZCLENBQTdCLENBQTlCLENBSGpCLENBQUE7QUFBQSxRQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLFVBQVUsQ0FBQyxJQUFyQixDQUpBLENBREQ7T0FERDtBQUFBLEtBRlk7RUFBQSxDQUFiOzttQkFBQTs7SUE1R0QsQ0FBQTs7QUFBQTtBQXlIYyxFQUFBLG9CQUFDLElBQUQsRUFBTyxRQUFQLEdBQUE7QUFDWixJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxRQUFoQixFQUEwQixJQUFJLENBQUMsUUFBL0IsQ0FBWixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBREEsQ0FEWTtFQUFBLENBQWI7O29CQUFBOztJQXpIRCxDQUFBOztBQUFBO0FBK0hjLEVBQUEscUJBQUUsSUFBRixHQUFBO0FBQ1osUUFBQSxpQ0FBQTtBQUFBLElBRGEsSUFBQyxDQUFBLE9BQUEsSUFDZCxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQVgsQ0FBQTtBQUNBO0FBQUEsU0FBQSwyQ0FBQTs0QkFBQTtBQUNDLE1BQUEsS0FBQSxHQUFZLElBQUEsT0FBUSxDQUFBLFVBQVUsQ0FBQyxJQUFYLENBQVIsQ0FBNkIsSUFBQSxLQUFLLENBQUMsT0FBTixDQUFjLFVBQVUsQ0FBQyxDQUFYLEdBQWUsRUFBN0IsRUFBaUMsQ0FBQSxHQUFJLFVBQVUsQ0FBQyxDQUFYLEdBQWUsRUFBcEQsRUFBd0QsQ0FBeEQsQ0FBN0IsQ0FBWixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxLQUFkLENBREEsQ0FERDtBQUFBLEtBRlk7RUFBQSxDQUFiOztxQkFBQTs7SUEvSEQsQ0FBQTs7OztBQ0FBLElBQUEsMkJBQUE7RUFBQTtpU0FBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBQVIsQ0FBQTs7QUFBQSxVQUNBLEdBQWEsT0FBQSxDQUFRLHFCQUFSLENBRGIsQ0FBQTs7QUFBQSxRQUVBLEdBQVcsT0FBQSxDQUFRLG1CQUFSLENBRlgsQ0FBQTs7QUFBQSxPQUlhLENBQUM7QUFDYixNQUFBLDZDQUFBOztBQUFBLDJCQUFBLENBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsMkJBQTdCLENBQWhCLENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQXFCLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQ25CO0FBQUEsSUFBQSxHQUFBLEVBQUssYUFBTDtBQUFBLElBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxVQURaO0FBQUEsSUFFQSxPQUFBLEVBQVMsS0FBSyxDQUFDLFNBRmY7QUFBQSxJQUdBLFdBQUEsRUFBYSxJQUhiO0dBRG1CLENBRHJCLENBQUE7O0FBQUEsRUFPQSxjQUFBLEdBQXFCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FQckIsQ0FBQTs7QUFTYSxFQUFBLGdCQUFDLFFBQUQsR0FBQTtBQUNaLElBQUEsc0NBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FGVCxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBSGQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQWMsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLGNBQVgsRUFBMkIsY0FBM0IsQ0FBZCxDQUpBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FOQSxDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsWUFBRCxHQUFnQixRQVJoQixDQUFBO0FBQUEsSUFTQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsT0FBdkIsQ0FUQSxDQUFBO0FBQUEsSUFVQSxJQUFDLENBQUEsS0FBRCxHQUFTLENBVlQsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQVhULENBRFk7RUFBQSxDQVRiOztBQUFBLG1CQXVCQSxNQUFBLEdBQVEsU0FBQyxLQUFELEdBQUE7QUFDUCxJQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsS0FBVixDQUFBLEdBQWlCLElBQUMsQ0FBQSxLQUFsQixHQUF3QixLQUE1QyxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEtBQVYsQ0FBQSxHQUFpQixJQUFDLENBQUEsS0FBbEIsR0FBd0IsS0FENUMsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixHQUFtQixJQUFDLENBQUEsS0FGcEIsQ0FBQTtBQUdBLElBQUEsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxVQUExQjthQUNDLElBQUMsQ0FBQSxHQUFELENBQUEsRUFERDtLQUpPO0VBQUEsQ0F2QlIsQ0FBQTs7QUFBQSxtQkErQkEsV0FBQSxHQUFhLFNBQUMsTUFBRCxHQUFBO0FBQ1osUUFBQSxlQUFBO0FBQUEsSUFBQSx3Q0FBTSxNQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEdBQUQsQ0FBQSxDQUZBLENBQUE7QUFHQTtTQUFTLDZCQUFULEdBQUE7QUFDQyxvQkFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBZ0IsSUFBQSxRQUFBLENBQVMsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFmLEVBQXlCLENBQXpCLENBQWhCLEVBQUEsQ0FERDtBQUFBO29CQUpZO0VBQUEsQ0EvQmIsQ0FBQTs7Z0JBQUE7O0dBRDRCLFVBQVUsQ0FBQyxnQkFKeEMsQ0FBQTs7QUFBQSxPQTRDYSxDQUFDO0FBQ2IsTUFBQSw2Q0FBQTs7QUFBQSxnQ0FBQSxDQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLDZCQUE3QixDQUFoQixDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFxQixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUNuQjtBQUFBLElBQUEsR0FBQSxFQUFLLGFBQUw7QUFBQSxJQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsVUFEWjtBQUFBLElBRUEsT0FBQSxFQUFTLEtBQUssQ0FBQyxTQUZmO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtHQURtQixDQURyQixDQUFBOztBQUFBLEVBT0EsY0FBQSxHQUFxQixJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLENBUHJCLENBQUE7O0FBU2EsRUFBQSxxQkFBQyxRQUFELEdBQUE7QUFDWixJQUFBLDJDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFBLENBRlQsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxjQUFYLEVBQTJCLGNBQTNCLENBQWQsQ0FKQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBTkEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsUUFSaEIsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLE9BQXZCLENBVEEsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQVZULENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFYVCxDQURZO0VBQUEsQ0FUYjs7QUFBQSx3QkF1QkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEtBQVYsQ0FBQSxHQUFpQixJQUFDLENBQUEsS0FBbEIsR0FBd0IsS0FBNUMsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxLQUFWLENBQUEsR0FBaUIsSUFBQyxDQUFBLEtBQWxCLEdBQXdCLEtBRDVDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsR0FBbUIsSUFBQyxDQUFBLEtBRnBCLENBQUE7QUFHQSxJQUFBLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsVUFBMUI7YUFDQyxJQUFDLENBQUEsR0FBRCxDQUFBLEVBREQ7S0FKTztFQUFBLENBdkJSLENBQUE7O0FBQUEsd0JBK0JBLFdBQUEsR0FBYSxTQUFDLE1BQUQsR0FBQTtBQUNaLFFBQUEsZUFBQTtBQUFBLElBQUEsNkNBQU0sTUFBTixDQUFBLENBQUE7QUFBQSxJQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxHQUFELENBQUEsQ0FGQSxDQUFBO0FBR0E7U0FBUyw2QkFBVCxHQUFBO0FBQ0Msb0JBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWdCLElBQUEsUUFBQSxDQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBZixFQUF5QixDQUF6QixDQUFoQixFQUFBLENBREQ7QUFBQTtvQkFKWTtFQUFBLENBL0JiLENBQUE7O3FCQUFBOztHQURpQyxVQUFVLENBQUMsZ0JBNUM3QyxDQUFBOzs7O0FDQUEsSUFBQSxJQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUEsTUFHTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQTBCLElBQUEsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUgxQixDQUFBOzs7O0FDQUEsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO1NBQ2YsVUFBQSxDQUFXLElBQVgsRUFBaUIsS0FBakIsRUFEZTtBQUFBLENBQWhCLENBQUE7O0FBQUEsT0FHTyxDQUFDLE1BQVIsR0FBaUIsU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO0FBQ2hCLFNBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsR0FBQSxHQUFNLEdBQVAsQ0FBaEIsR0FBOEIsR0FBckMsQ0FEZ0I7QUFBQSxDQUhqQixDQUFBOztBQUFBLE9BT08sQ0FBQyxZQUFSLEdBQXVCLFNBQUEsR0FBQTtBQUN0QixNQUFBLG9CQUFBO0FBQUEsRUFBQSxXQUFBLEdBQWMsRUFBQSxHQUFLLENBQUMsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQUFYLENBQW5CLENBQUE7U0FDQSxPQUFBLEdBQVUsR0FBQSxHQUFNLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsV0FBQSxHQUFjLENBQXZCLENBQUwsQ0FBTixHQUF5QyxLQUY3QjtBQUFBLENBUHZCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInNodW1wID0gcmVxdWlyZSgnLi9zaHVtcC9zaHVtcC5jb2ZmZWUnKVxuXG4kKFwiI2Z1bGxzY3JlZW5cIikuY2xpY2sgKCktPlxuXHRcblx0JChcIiNzaHVtcFwiKVswXS53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbihFbGVtZW50LkFMTE9XX0tFWUJPQVJEX0lOUFVUKTtcblx0XG5cdGNhbnZhcyA9ICQoXCIjc2h1bXAgY2FudmFzXCIpXG5cdGNhbnZhc0FzcGVjdCA9IGNhbnZhcy53aWR0aCgpIC8gY2FudmFzLmhlaWdodCgpXG5cblx0Y29udGFpbmVyV2lkdGggPSAkKHdpbmRvdykud2lkdGgoKVxuXHRjb250YWluZXJIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KClcblx0Y29udGFpbmVyQXNwZWN0ID0gY29udGFpbmVyV2lkdGggLyBjb250YWluZXJIZWlnaHRcblx0Y29uc29sZS5sb2cgY2FudmFzQXNwZWN0LCAkKHdpbmRvdykud2lkdGgoKSAsICQod2luZG93KS5oZWlnaHQoKSwgY29udGFpbmVyQXNwZWN0XG5cdFxuXHRpZiBjYW52YXNBc3BlY3QgPCBjb250YWluZXJBc3BlY3Rcblx0XHRjb25zb2xlLmxvZyBcIm1hdGNoIGhlaWdodFwiXG5cdFx0Y2FudmFzLmhlaWdodCBjb250YWluZXJIZWlnaHRcblx0XHRjYW52YXMud2lkdGggY29udGFpbmVySGVpZ2h0ICogY2FudmFzQXNwZWN0XG5cdGVsc2Vcblx0XHRjb25zb2xlLmxvZyBcIm1hdGNoIHdpZHRoXCJcblx0XHRjYW52YXMud2lkdGggY29udGFpbmVyV2lkdGhcblx0XHRjYW52YXMuaGVpZ2h0IGNvbnRhaW5lcldpZHRoIC8gY2FudmFzQXNwZWN0XG5cbiQoXCIjZGVidWdcIikuYXBwZW5kKFwiXCJcIjxzcGFuIGlkPVwibGV2ZWxDaGlsZHJlblwiPlwiXCJcIilcblxuXG51cGRhdGVEZWJ1ZyA9ICgpLT5cblx0JChcIiNsZXZlbENoaWxkcmVuXCIpLnRleHQgXCJcIlwibGV2ZWwuY2hpbGRyZW4gPSAje3NodW1wLkdhbWUubGV2ZWwuY2hpbGRyZW4ubGVuZ3RofVwiXCJcIlxuXG5cbiMgc2h1bXAuR2FtZS53b3JsZC5vbiBcInVwZGF0ZVwiLCB1cGRhdGVEZWJ1Z1xuXG5cblxuIyBjb25zb2xlLmxvZyBcImhpZGVyYVwiXG5cblxuIiwiY2xhc3MgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBfZXZlbnRzID0ge31cblxuXHRvbjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdChAX2V2ZW50c1tldmVudF0gPz0gW10pLnB1c2ggaGFuZGxlclxuXHRcdHJldHVybiB0aGlzXG5cblx0b2ZmOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0Zm9yIHN1c3BlY3QsIGluZGV4IGluIEBfZXZlbnRzW2V2ZW50XSB3aGVuIHN1c3BlY3QgaXMgaGFuZGxlclxuXHRcdFx0QF9ldmVudHNbZXZlbnRdLnNwbGljZSBpbmRleCwgMVxuXHRcdHJldHVybiB0aGlzXG5cblx0dHJpZ2dlcjogKGV2ZW50LCBhcmdzLi4uKSA9PlxuXHRcdHJldHVybiB0aGlzIHVubGVzcyBAX2V2ZW50c1tldmVudF0/XG5cdFx0Zm9yIGkgaW4gW0BfZXZlbnRzW2V2ZW50XS5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGhhbmRsZXIgPSBAX2V2ZW50c1tldmVudF1baV1cblx0XHRcdGhhbmRsZXIuYXBwbHkgdGhpcywgYXJnc1xuXHRcdHJldHVybiB0aGlzXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5cbmNsYXNzIENvbGxpc2lvbk9iamVjdCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IHVuZGVmaW5lZFxuXHRcdEBjb2xsaWRlckhpdFR5cGVzID0gW11cblx0XHRAaHAgPSAxXG5cdFx0QGRwID0gMVxuXHRcdEBjb2xsaXNpb25SYWRpdXMgPSAuNlxuXG5cdGNvbGxpZGVJbnRvOiAodGFyZ2V0KS0+XG5cdFx0dGFyZ2V0LnRha2VEYW1hZ2UoQGRwKVxuXHRcdCMgQGRpZSgpXG5cdFx0IyBnYW1lT2JqZWN0LmRpZSgpXG5cblx0dGFrZURhbWFnZTogKGRhbWFnZSktPlxuXHRcdEBocCAtPSBkYW1hZ2Vcblx0XHRpZiBAaHAgPD0gMCBcblx0XHRcdEBkaWUoKVxuXG5tb2R1bGUuZXhwb3J0cy5Db2xsaXNpb25PYmplY3QgPSBDb2xsaXNpb25PYmplY3RcblxuXG5cbm1vZHVsZS5leHBvcnRzLnJlc29sdmVDb2xsaXNpb25zID0gKGNvbGxpZGVycyktPlxuXHRmb3IgYSBpbiBjb2xsaWRlcnNcblx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0Zm9yIGIgaW4gY29sbGlkZXJzXG5cdFx0XHRcdGlmIGIuYWN0aXZlXG5cdFx0XHRcdFx0aWYgYS5jb2xsaWRlckhpdFR5cGVzLmluZGV4T2YoYi5jb2xsaWRlclR5cGUpID4gLTFcblx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0YS5jb2xsaWRlSW50byBiXG5cbm1vZHVsZS5leHBvcnRzLnRlc3RDb2xsaXNpb24gPSAoYSwgYiktPlxuXHRyZXR1cm4gYS5yb290LnBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKGIucm9vdC5wb3NpdGlvbikgPCBhLmNvbGxpc2lvblJhZGl1cyArIGIuY29sbGlzaW9uUmFkaXVzXG4iLCJcblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5Db2xsaXNpb25zID0gcmVxdWlyZSAnLi9Db2xsaXNpb25zLmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblxuXG5jbGFzcyBCYXNpYyBleHRlbmRzIENvbGxpc2lvbnMuQ29sbGlzaW9uT2JqZWN0XG5cdGVuZW15VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvZW5lbWllcy9lbmVteS5wbmdcIlxuXHRlbmVteU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGVuZW15VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRlbmVteUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiZW5lbXlcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJwbGF5ZXJcIlxuXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGVuZW15R2VvbWV0cnksIGVuZW15TWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXHRcdEBhZ2UgPSAwXG5cdFx0QGhhc0ZpcmVkID0gZmFsc2VcblxuXHRcdEBhY3RpdmUgPSBmYWxzZVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QGFnZSArPSBkZWx0YVxuXHRcdFxuXHRcblx0ZGllOiAoKS0+XG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDMpXG5cdFx0c3VwZXIoKVxuXG5cbmNsYXNzIFNpbldhdmUgZXh0ZW5kcyBCYXNpY1xuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVx0XHRcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0xICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IGRlbHRhICogTWF0aC5zaW4oQGFnZSlcblxuY2xhc3MgRGFydCBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdGlmIEBhZ2UgPCAuNVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSAtMjAgKiBkZWx0YVxuXHRcdGVsc2UgaWYgQGFnZSA8IDNcblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gNSAqIGRlbHRhXG5cdFx0ZWxzZVxuXHRcdFx0QGRpZSgpXG5cblx0XHRpZiBAYWdlID4gMSBhbmQgbm90IEBoYXNGaXJlZFxuXHRcdFx0QGhhc0ZpcmVkID0gdHJ1ZVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblxuXHRmaXJlX3ByaW1hcnk6ICgpLT5cblx0XG5cdFx0U291bmQucGxheSgnc2hvb3QnKVxuXHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5FbmVteUJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJIC0gLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KEByb290LnBvc2l0aW9uKVxuXG5cdFx0YnVsbGV0LmNvbGxpZGVyVHlwZSA9IFwiZW5lbXlfYnVsbGV0XCJcblx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUEkgKyAuMjVcblx0XHRidWxsZXQuc3BlZWQgPSA1XG5cblx0XHRAcGFyZW50LmFkZCBidWxsZXRcdFxuXG5cbmV4cG9ydHMuQmFzaWMgPSBCYXNpY1xuZXhwb3J0cy5TaW5XYXZlID0gU2luV2F2ZVxuZXhwb3J0cy5EYXJ0ID0gRGFydFxuXG4jIHN1cGVyKGRlbHRhKVxuXHRcdCMgaWYgQGFnZSA8IDFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnkgKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMi4xXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gNSAqIGRlbHRhXG5cdFx0IyBlbHNlXG5cdFx0IyBcdEBkaWUoKVxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5MZXZlbCA9IHJlcXVpcmUgJy4vTGV2ZWwuY29mZmVlJ1xuU2NyZWVucyA9IHJlcXVpcmUgJy4vU2NyZWVucy5jb2ZmZWUnXG5cblxuXG4jIFNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5cbiMgR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5cblxuXG5jbGFzcyBHYW1lIGV4dGVuZHMgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHQjIGluaXRpYWxpemUgc3RhdGVcblx0XHRAbGl2ZXMgPSAzXG5cblx0XHQjIGNyZWF0ZSByZW5kZXJlclxuXHRcdEByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKClcblx0XHRAcmVuZGVyZXIuc2V0U2l6ZSA2NDAsIDQ4MFxuXHRcdCQoXCIjc2h1bXBcIilbMF0uYXBwZW5kQ2hpbGQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcblxuXHRcdCMgY2xvY2tcblx0XHRAY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKVxuXG5cdFx0XG5cblx0XHQjIG90aGVyIHNjcmVlbnNcblx0XHRAc3RhdGUgPSBcImhvbWVcIlxuXHRcdEBob21lU2NyZWVuID0gbmV3IFNjcmVlbnMuSG9tZVNjcmVlbigpXG5cdFx0QGdhbWVPdmVyU2NyZWVuID0gbmV3IFNjcmVlbnMuR2FtZU92ZXJTY3JlZW4oKVxuXG5cdFx0IyB0b2RvLCBjbGVhbiB0aGlzIHVwIGxldCBzY3JlZW5zIGhhbmRsZSB0aGVpciBpbnB1dCBhbmQgc2VuZCBtZXNzYWdlcyB3aGVuIHRoZXkgYXJlIGRvbmUuIG1heWJlIHRocm91Z2ggYSBnbG9iYWwgZXZlbnQgYnJvYWRjYXN0ZXJcblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0aWYgQHN0YXRlID09IFwiaG9tZVwiXG5cdFx0XHRcdEBzdGF0ZSA9IFwibG9hZGluZ1wiXG5cdFx0XHRcdEBzdGFydEdhbWUoKVxuXHRcdFx0XHRyZXR1cm5cblxuXHRcdFx0aWYgQHN0YXRlID09IFwiZ2FtZV9vdmVyXCJcblx0XHRcdFx0QHN0YXRlID0gXCJob21lXCJcblx0XHRcdFx0cmV0dXJuXG5cblx0XHQjIGxvYWQgYXNzZXRzXG5cblx0XHQjIGJlZ2luIGdhbWVcblx0XHR1dGlsLmFmdGVyIDEsICgpPT5cblx0XHRcdEBhbmltYXRlKClcblxuXG5cdHN0YXJ0R2FtZTogKCktPlxuXHRcdEBsaXZlcyA9IDNcblxuXHRcdCMgbGV2ZWxcblx0XHRAbGV2ZWwgPSBuZXcgTGV2ZWwuTGV2ZWwoKVxuXHRcdEBsZXZlbC5vbiBcInBsYXllckRpZVwiLCAoKT0+XG5cdFx0XHRAbGl2ZXMtLVxuXHRcdFx0aWYgQGxpdmVzID4gMFxuXHRcdFx0XHR1dGlsLmFmdGVyIDEwMDAsIEBsZXZlbC5pbnNlcnRQbGF5ZXJcblx0XHRcdGVsc2Vcblx0XHRcdFx0QHN0YXRlID0gXCJnYW1lX292ZXJcIlxuXG5cdFx0QGxldmVsLm9uIFwicmVhZHlcIiwgKCk9PlxuXHRcdFx0QHN0YXRlID0gXCJwbGF5XCJcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGlmIEBzdGF0ZSA9PSBcImhvbWVcIlxuXHRcdFx0QGhvbWVTY3JlZW4udXBkYXRlKGRlbHRhKVxuXG5cdFx0aWYgQHN0YXRlID09IFwicGxheVwiXG5cdFx0XHRAbGV2ZWwudXBkYXRlKGRlbHRhKVxuXG5cdFx0aWYgQHN0YXRlID09IFwiZ2FtZV9vdmVyXCJcblx0XHRcdEBsZXZlbC51cGRhdGUoZGVsdGEpXG5cdFx0XHRAZ2FtZU92ZXJTY3JlZW4udXBkYXRlKGRlbHRhKVxuXG5cblx0cmVuZGVyOiAoKT0+XG5cdFx0QHJlbmRlcmVyLmF1dG9DbGVhciA9IGZhbHNlXG5cblx0XHRpZiBAc3RhdGUgPT0gXCJob21lXCJcblx0XHRcdEByZW5kZXJlci5yZW5kZXIgQGhvbWVTY3JlZW4uc2NlbmUsIEBob21lU2NyZWVuLmNhbWVyYVxuXHRcdFxuXHRcdGlmIEBzdGF0ZSA9PSBcInBsYXlcIlx0XG5cdFx0XHRAcmVuZGVyZXIucmVuZGVyIEBsZXZlbC5zY2VuZSwgQGxldmVsLmNhbWVyYVxuXHRcdFx0QHJlbmRlcmVyLnJlbmRlciBAaG9tZVNjcmVlbi5zY2VuZSwgQGxldmVsLmNhbWVyYSwgdW5kZWZpbmVkLCBmYWxzZVxuXG5cdFx0aWYgQHN0YXRlID09IFwiZ2FtZV9vdmVyXCJcblx0XHRcdEByZW5kZXJlci5yZW5kZXIgQGxldmVsLnNjZW5lLCBAbGV2ZWwuY2FtZXJhXG5cdFx0XHRAcmVuZGVyZXIucmVuZGVyIEBnYW1lT3ZlclNjcmVlbi5zY2VuZSwgQGdhbWVPdmVyU2NyZWVuLmNhbWVyYSwgdW5kZWZpbmVkLCBmYWxzZVxuXG5cblxuXHRhbmltYXRlOiA9PlxuXHRcdCMgdXBkYXRlIHRoZSBnYW1lIHBoeXNpY3Ncblx0XHRkZWx0YSA9IEBjbG9jay5nZXREZWx0YSgpXG5cdFx0aWYgKGRlbHRhIDwgLjUpIFxuXHRcdFx0QHVwZGF0ZShkZWx0YSlcblxuXHRcdCMgcmVuZGVyIHRvIHNjcmVlblxuXHRcdEByZW5kZXIoKVxuXG5cdFx0IyByZXBlYXRcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGVcblx0XHRyZXR1cm5cblxuXG5leHBvcnRzLkdhbWUgPSBHYW1lXG5cblxuXG5cblxuXG4jIEBob21lU2NyZWVuID0gbmV3IFNjcmVlbnMuSG9tZVNjcmVlbigpXG4jIEBnYW1lT3ZlclNjcmVlbiA9IG5ldyBTY3JlZW5zLkdhbWVPdmVyU2NyZWVuKClcbiMgQGxvYWRMZXZlbCgpXG5cbiMgU2NvcmUuZGlzcGxheUVsZW1lbnQgPSAkKFwiXCJcIjxoMT5TY29yZTo8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuIyBAbGl2ZXNFbGVtZW50ID0gJChcIlwiXCI8aDE+TGl2ZXM6PC9oMT5cIlwiXCIpLmFwcGVuZFRvICQoXCIjc2h1bXBcIilcblxuXG4jIEBzdGF0ZSA9IFwiaG9tZVwiXG4jICMgQHdvcmxkLnNjZW5lLmFkZCBAaG9tZVNjcmVlbi5yb290XG5cblxuIyAkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuIyBcdGlmIEBzdGF0ZSA9PSBcImhvbWVcIlxuIyBcdFx0IyBAd29ybGQuc2NlbmUucmVtb3ZlIEBob21lU2NyZWVuLnJvb3RcbiMgXHRcdEBzdGF0ZSA9IFwicGxheVwiXG4jIFx0XHRAc3RhcnRMZXZlbCgpXG4jIFx0XHRyZXR1cm5cblxuIyBcdGlmIEBzdGF0ZSA9PSBcImdhbWVfb3ZlclwiXG4jIFx0XHRAd29ybGQuc2NlbmUucmVtb3ZlIEBnYW1lT3ZlclNjcmVlbi5yb290XG4jIFx0XHRAd29ybGQuc2NlbmUuYWRkIEBob21lU2NyZWVuLnJvb3RcbiMgXHRcdEBzdGF0ZSA9IFwiaG9tZVwiXG4jIFx0XHRyZXR1cm5cblxuXG5cdCMgbG9hZExldmVsOiAoKS0+XG5cdCMgXHQjIEB3b3JsZC5jYW1lcmEucG9zaXRpb24ueCA9IDA7XG5cdCMgXHRAbGV2ZWwgPSBuZXcgTGV2ZWwuTGV2ZWwoQHdvcmxkKVxuXHRcblx0IyBzdGFydExldmVsOiAoKS0+XG5cdCMgXHRAd29ybGQuc2NlbmUuYWRkIEBsZXZlbC5yb290XG5cdCMgXHRAd29ybGQub24gXCJ1cGRhdGVcIiwgQGxldmVsLnVwZGF0ZVxuXHRcdFxuXHQjIHJlc2V0UGxheWVyOiAoKT0+XG5cdCMgXHRAbGl2ZXMtLVxuXHQjIFx0QGxpdmVzRWxlbWVudC50ZXh0IFwiTGl2ZXM6ICN7QGxpdmVzfVwiXG5cblx0IyBcdGlmIEBsaXZlcyA+IDBcblx0IyBcdFx0QGxldmVsLnBsYXllcjEgPSBuZXcgUGxheWVyKClcblx0IyBcdFx0QGxldmVsLnBsYXllcjEucm9vdC5wb3NpdGlvbi54ID0gQHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54XG5cdCMgXHRcdEBsZXZlbC5hZGQgQGxldmVsLnBsYXllcjFcblx0IyBcdGVsc2Vcblx0IyBcdFx0dXRpbC5hZnRlciAyMDAwLCBAZ2FtZU92ZXJcblxuXHQjIGdhbWVPdmVyOiAoKT0+XG5cdCMgXHRjb25zb2xlLmxvZyBcImdhbWUgb3ZlclwiXG5cdFx0XG5cdCMgXHRAd29ybGQuc2NlbmUucmVtb3ZlIEBsZXZlbC5yb290XG5cdCMgXHRAd29ybGQub2ZmIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblxuXHQjIFx0QGxvYWRMZXZlbCgpXG5cdCMgXHRAd29ybGQuc2NlbmUuYWRkIEBnYW1lT3ZlclNjcmVlbi5yb290XG5cdCMgXHRAc3RhdGUgPSBcImdhbWVfb3ZlclwiXG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuY2xhc3MgR2FtZU9iamVjdCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0c3VwZXIoKVxuXG5cdFx0QHBhcmVudCA9IHVuZGVmaW5lZFxuXHRcdEBjaGlsZHJlbiA9IFtdXG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdEBkZWFkID0gZmFsc2Vcblx0XHRAYWN0aXZlID0gdHJ1ZVxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0Zm9yIGkgaW4gW0BjaGlsZHJlbi5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGNoaWxkID0gQGNoaWxkcmVuW2ldXG5cdFx0XHRpZiBjaGlsZC5kZWFkXG5cdFx0XHRcdEByZW1vdmUgY2hpbGRcblx0XHRcdFx0Y29udGludWVcblx0XHRcdGlmIGNoaWxkLmFjdGl2ZVxuXHRcdFx0XHRjaGlsZC51cGRhdGUgZGVsdGEgXG5cdFxuXHRhY3RpdmF0ZTogKCktPlxuXHRcdEBhY3RpdmUgPSB0cnVlO1xuXHRcdFxuXG5cdGFkZDogKGdhbWVPYmplY3QpLT5cblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IHRoaXNcblx0XHRAY2hpbGRyZW4ucHVzaChnYW1lT2JqZWN0KVxuXHRcdEByb290LmFkZChnYW1lT2JqZWN0LnJvb3QpXG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0QHJvb3QucmVtb3ZlKGdhbWVPYmplY3Qucm9vdClcblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IG51bGxcblx0XHRpID0gIEBjaGlsZHJlbi5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY2hpbGRyZW4uc3BsaWNlKGksIDEpO1xuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0ZGllOiAoKS0+XG5cdFx0QGRlYWQgPSB0cnVlO1xuXHRcdEB0cmlnZ2VyIFwiZGllXCJcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT2JqZWN0XG4iLCJjbGFzcyBJbnB1dFxuXHRrZXlNYXA6IFxuXHRcdFwiMzhcIjpcInVwXCIgI3VwIGFycm93XG5cdFx0XCI4N1wiOlwidXBcIiAjd1xuXHRcdFwiNDBcIjpcImRvd25cIiAjZG93biBhcnJvd1xuXHRcdFwiODNcIjpcImRvd25cIiAjc1xuXHRcdFwiMzdcIjpcImxlZnRcIiAjbGVmdCBhcnJvd1xuXHRcdFwiNjVcIjpcImxlZnRcIiAjYVxuXHRcdFwiMzlcIjpcInJpZ2h0XCIgI3JpZ2h0IGFycm93XG5cdFx0XCI2OFwiOlwicmlnaHRcIiAjZFxuXHRcdFwiMzJcIjpcImZpcmVfcHJpbWFyeVwiICNzcGFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxuXG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgQGtleU1hcFxuXHRcdFx0QGtleVN0YXRlc1t2YWx1ZV0gPSBmYWxzZTtcblxuXHRcdCQod2luZG93KS5rZXlkb3duIChlKT0+XG5cdFx0XHQjIGNvbnNvbGUubG9nIGUud2hpY2hcblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IHRydWU7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHQkKHdpbmRvdykua2V5dXAgKGUpPT5cblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IGZhbHNlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5pbnB1dCA9IG5ldyBJbnB1dCgpXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0XG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5UaWxlZCA9IHJlcXVpcmUgJy4vVGlsZWQuY29mZmVlJ1xuUGxheWVyID0gcmVxdWlyZSAnLi9QbGF5ZXIuY29mZmVlJ1xuR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5Db2xsaXNpb25zID0gcmVxdWlyZSAnLi9Db2xsaXNpb25zLmNvZmZlZSdcblxuY2xhc3MgTGV2ZWwgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0IyBjcmVhdGUgc2NlbmVcblx0XHRAc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdEBzY2VuZS5hZGQgQHJvb3RcblxuXHRcdCMgY2FtZXJhXG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgNjQwIC8gNDgwLCAxLCAxMDAwMClcdFxuXHRcdEBjYW1lcmEucG9zaXRpb24ueiA9IHV0aWwubGF5ZXJTcGFjaW5nKCkgKiAxXG5cdFx0QHNjZW5lLmFkZCBAY2FtZXJhXG5cblx0XHQjIGxpZ2h0c1xuXHRcdEBhbWJpZW50TGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKTtcblx0XHRAcm9vdC5hZGQoQGFtYmllbnRMaWdodClcblxuXG5cdFx0IyBpbnNlcnQgcGxheWVyXG5cdFx0QGluc2VydFBsYXllcigpXG5cblxuXHRcdCMgbGV2ZWxcblx0XHRUaWxlZC5sb2FkKCdhc3NldHMvbGV2ZWxfMS5qc29uJykudGhlbihAcG9wdWxhdGUpLmNhdGNoIChlcnJvciktPlxuXHQgXHRcdGNvbnNvbGUuZXJyb3IgZXJyb3JcblxuXHRwb3B1bGF0ZTogKG1hcCk9PlxuXHRcdEByb290LmFkZChtYXAubGF5ZXJzLmJhY2tncm91bmQucm9vdClcblx0XHRtYXAubGF5ZXJzLmJhY2tncm91bmQucm9vdC5wb3NpdGlvbi55ID0gNy41ICogMlxuXHRcdG1hcC5sYXllcnMuYmFja2dyb3VuZC5yb290LnBvc2l0aW9uLnogPSAgdXRpbC5sYXllclNwYWNpbmcoKSAqIC0xXG5cdFx0bWFwLmxheWVycy5iYWNrZ3JvdW5kLnJvb3Quc2NhbGUuc2V0KDIsIDIsIDIpXG5cdFx0XG5cdFx0QHJvb3QuYWRkKG1hcC5sYXllcnMubWlkZ3JvdW5kLnJvb3QpXG5cdFx0bWFwLmxheWVycy5taWRncm91bmQucm9vdC5wb3NpdGlvbi55ID0gNy41XG5cblx0XHRmb3Igb2JqZWN0IGluIG1hcC5sYXllcnMuZW5lbWllcy5vYmplY3RzXG5cdFx0XHRAYWRkIG9iamVjdFxuXG5cdFx0QHRyaWdnZXIgXCJyZWFkeVwiXG5cblx0aW5zZXJ0UGxheWVyOiAoKT0+XG5cdFx0QHBsYXllcjEgPSBuZXcgUGxheWVyKClcblx0XHRAYWRkIEBwbGF5ZXIxXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi5jb3B5IEBjYW1lcmEucG9zaXRpb25cblx0XHRAcGxheWVyMS5yb290LnBvc2l0aW9uLnogPSAwXG5cblx0XHRAcGxheWVyMS5vbiBcImRpZVwiLCAoKT0+XG5cdFx0XHRAdHJpZ2dlciBcInBsYXllckRpZVwiXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAY2FtZXJhLnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlID09IGZhbHNlIGFuZCBjaGlsZC5yb290LnBvc2l0aW9uLnggPCBAY2FtZXJhLnBvc2l0aW9uLnggKyAxMFxuXHRcdFx0XHRjaGlsZC5hY3RpdmF0ZSgpXG5cblx0XHRDb2xsaXNpb25zLnJlc29sdmVDb2xsaXNpb25zKEBjb2xsaWRlcnMpXG5cblx0XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbnMuQ29sbGlzaW9uT2JqZWN0XG5cdFx0XHRAY29sbGlkZXJzLnB1c2ggZ2FtZU9iamVjdCBcblx0XHRyZXR1cm4gc3VwZXIoZ2FtZU9iamVjdClcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0aSA9ICBAY29sbGlkZXJzLmluZGV4T2YoZ2FtZU9iamVjdClcblx0XHRpZiBpID49IDBcblx0XHRcdEBjb2xsaWRlcnMuc3BsaWNlKGksIDEpXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblxuXG5cblxuXG5leHBvcnRzLkxldmVsID0gTGV2ZWxcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IChAZ2VvbWV0cnksIEBtYXRlcmlhbCktPlxuXHRcdHN1cGVyKClcblx0XHRAbWF0ZXJpYWwgPSB1bmRlZmluZWRcblx0XHRAZ2VvbWV0cnkgPSB1bmRlZmluZWRcblx0XHRAdGV4dHVyZSA9IHVuZGVmaW5lZFxuXHRcdEBzdGF0dXMgPSB1bmRlZmluZWRcblxuXHRsb2FkOiAoZmlsZU5hbWUpPT5cblx0XHRqc29uTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblx0XHRqc29uTG9hZGVyLmxvYWQgZmlsZU5hbWUsIChnZW9tZXRyeSwgbWF0ZXJpYWxzLCBvdGhlcnMuLi4pPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKCBtYXRlcmlhbHMgKVxuXHRcdFx0IyBAbWF0ZXJpYWwgPSBtYXRlcmlhbHNbMF1cblx0XHRcdEBnZW9tZXRyeSA9IGdlb21ldHJ5XG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cdGxvYWRQbmc6IChmaWxlTmFtZSk9PlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBmaWxlTmFtZSwge30sICgpPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0XHQjIHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRcdCMgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblx0XHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0XHQjIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5IDEsIDFcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImxvYWRwbmdcIiwgdGhpc1xuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXG5cbmNsYXNzIE1vZGVsTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QGRlZmF1bHRHZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMSwxLDEpXG5cdFx0QGRlZmF1bHRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0Y29sb3I6IDB4MDBmZjAwXG5cdFx0XHR3aXJlZnJhbWU6IHRydWVcblx0XHRcdG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy91dGlsL3doaXRlLnBuZ1wiXG5cblx0XHRAbG9hZGVkTW9kZWxzID0ge31cblxuXHRsb2FkOiAoZmlsZU5hbWUpLT5cblxuXHRcdCMgaWYgYWxyZWFkeSBsb2FkZWQsIGp1c3QgbWFrZSB0aGUgbmV3IG1lc2ggYW5kIHJldHVyblxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdPyAmJiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5zdGF0dXMgPT0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJjYWNoZWRcIlxuXHRcdFx0cmV0dXJuIG5ldyBUSFJFRS5NZXNoKEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLmdlb21ldHJ5LCBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5tYXRlcmlhbClcblxuXG5cdFx0IyBpZiByZXF1ZXN0ZWQgYnV0IG5vdCByZWFkeVxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XHRtb2RlbCA9IEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XG5cdFx0IyBpZiBub3QgcmVxdWVzdGVkIGJlZm9yZVxuXHRcdGVsc2Vcblx0XHRcdG1vZGVsID0gbmV3IE1vZGVsKClcblx0XHRcdGlmIGZpbGVOYW1lLnNwbGl0KCcuJykucG9wKCkgPT0gXCJqc1wiXG5cdFx0XHRcdG1vZGVsLmxvYWQoZmlsZU5hbWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG1vZGVsLmxvYWRQbmcoZmlsZU5hbWUpXG5cdFx0XHRAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXSA9IG1vZGVsXG5cblx0XHRvYmplY3QgPSBuZXcgVEhSRUUuTWVzaCggQGRlZmF1bHRHZW9tZXRyeSwgQGRlZmF1bHRNYXRlcmlhbCApXG5cdFx0bW9kZWwub24gXCJzdWNjZXNzXCIsIChtKS0+XG5cdFx0XHRvYmplY3QuZ2VvbWV0cnkgPSBtLmdlb21ldHJ5XHRcdFx0XG5cdFx0XHRvYmplY3QubWF0ZXJpYWwgPSBtLm1hdGVyaWFsXG5cdFx0XHRtLm9mZiBcInN1Y2Nlc3NcIiwgYXJndW1lbnRzLmNhbGxlZSAjcmVtb3ZlIHRoaXMgaGFuZGxlciBvbmNlIHVzZWRcblx0XHRyZXR1cm4gb2JqZWN0XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZWxMb2FkZXJcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xudXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5jbGFzcyBQYXJ0aWNsZSBleHRlbmRzIEdhbWVPYmplY3Rcblx0cGFydGljbGVUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9wYXJ0aWNsZXMvcGFydGljbGUyLnBuZ1wiXG5cdHBhcnRpY2xlTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogcGFydGljbGVUZXh0dXJlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoV3JpdGU6IGZhbHNlXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0YmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblxuXHRwYXJ0aWNsZUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24sIGVuZXJneSktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAxMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHBhcnRpY2xlR2VvbWV0cnksIHBhcnRpY2xlTWF0ZXJpYWxcblx0XHRcblx0XHRAdmVsb2NpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMyh1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpKTtcblx0XHRAdmVsb2NpdHkubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoZW5lcmd5KVxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAdmVsb2NpdHkubXVsdGlwbHlTY2FsYXIoLjk5KVxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnggKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gQHZlbG9jaXR5LnkgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnogKz0gQHZlbG9jaXR5LnogKiBkZWx0YVxuXHRcdHMgPSAxLSAoKERhdGUubm93KCkgLSBAYmlydGgpIC8gQHRpbWVUb0xpdmUpICsgLjAxXG5cdFx0QHJvb3Quc2NhbGUuc2V0KHMsIHMsIHMpXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZVxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9ucyA9IHJlcXVpcmUgJy4vQ29sbGlzaW9ucy5jb2ZmZWUnXG5Nb2RlbExvYWRlciA9IHJlcXVpcmUgJy4vTW9kZWxMb2FkZXIuY29mZmVlJ1xuSW5wdXQgPSByZXF1aXJlICcuL0lucHV0LmNvZmZlZSdcbldlYXBvbnMgPSByZXF1aXJlICcuL1dlYXBvbnMuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcblNodW1wID0gcmVxdWlyZSAnLi9zaHVtcC5jb2ZmZWUnXG5cbm1vZGVsTG9hZGVyID0gbmV3IE1vZGVsTG9hZGVyKClcbiMgaW5wdXQgPSBuZXcgSW5wdXQoKVxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBDb2xsaXNpb25zLkNvbGxpc2lvbk9iamVjdFxuXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdFxuXHRcdEBjb2xsaWRlclR5cGUgPSBcInBsYXllclwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15X2J1bGxldFwiXG5cblx0XHRtb2RlbCA9IG1vZGVsTG9hZGVyLmxvYWQoXCJhc3NldHMvc2hpcHMvc2hpcDIuanNcIilcblx0XHRAcm9vdC5hZGQgbW9kZWxcblx0XHR1dGlsLmFmdGVyIDEwMDAsICgpLT5cblx0XHRcdG1vZGVsLm1hdGVyaWFsLm1hdGVyaWFsc1swXS53aXJlZnJhbWUgPSB0cnVlXG5cdFx0XG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdEBocCA9IDNcblxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWyd1cCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydkb3duJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ2xlZnQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1sncmlnaHQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1snZmlyZV9wcmltYXJ5J11cblx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcdGlmIERhdGUubm93KCkgPiBAbGFzdEZpcmUgKyAyNDAgKiAxXG5cdFx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0XHRcblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRidWxsZXQuYW5nbGUgPSAtLjI1XG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gKy4yNVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cdFx0XHQjIEBwYXJlbnQuY29sbGlkZXJzLnB1c2ggYnVsbGV0XG5cblx0ZGllOiAoKS0+XG5cdFx0IyBjb25zb2xlLmxvZyBcImRpZVwiXG5cdFx0XG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjAwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCA4KVxuXG5cdFx0IyBwb3MgPSBAcm9vdC5wb3NpdGlvblxuXHRcdCMgcGFyZW50ID0gQHBhcmVudFxuXHRcdCMgdXRpbC5hZnRlciAxMDAwLCAoKS0+XG5cdFx0IyBcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChwb3MpXG5cdFx0IyBcdGJ1bGxldC5ocCA9IDEwMFxuXHRcdCMgXHRidWxsZXQuZHAgPSAxMFxuXHRcdCMgXHRidWxsZXQuY29sbGlzaW9uUmFkaXVzID0gMTUwXG5cdFx0IyBcdHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHQjIHV0aWwuYWZ0ZXIgMTI1MCwgU2h1bXAuZ2FtZS5yZXNldFBsYXllclxuXHRcdHN1cGVyKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJcbnNjb3JlID0gMFxuZXhwb3J0cy5kaXNwbGF5RWxlbWVudCA9IHVuZGVmaW5lZFxuXG5leHBvcnRzLmFkZCA9IChwb2ludHMpLT5cblx0c2NvcmUgKz0gcG9pbnRzXG5cdCMgY29uc29sZS5sb2cgZXhwb3J0cy5kaXNwbGF5RWxlbWVudFxuXHRpZiBleHBvcnRzLmRpc3BsYXlFbGVtZW50P1xuXHRcdGV4cG9ydHMuZGlzcGxheUVsZW1lbnQudGV4dCBcIlNjb3JlOiAje3Njb3JlfVwiXG5cbmV4cG9ydHMuZ2V0ID0gKCktPlxuXHRyZXR1cm4gc2NvcmVcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcbkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBIb21lU2NyZWVuIGV4dGVuZHMgR2FtZU9iamVjdFxuXHR0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9zY3JlZW5zL3RpdGxlLnBuZ1wiXG5cdG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDIwLCAxNSlcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0QHNjZW5lLmFkZCBAcm9vdFxuXHRcdFxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIDY0MCAvIDQ4MCwgMSwgMTAwMDApXHRcblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB1dGlsLmxheWVyU3BhY2luZygpICogMVxuXHRcdEBzY2VuZS5hZGQgQGNhbWVyYVxuXG5cdFx0c2NyZWVuID0gbmV3IFRIUkVFLk1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG5cdFx0c2NyZWVuLnNjYWxlLnNldCguMjUsIC4yNSwgLjI1KVxuXHRcdHNjcmVlbi5wb3NpdGlvbi56ID0gIHV0aWwubGF5ZXJTcGFjaW5nKCkgKiAuNzVcblx0XHRAcm9vdC5hZGQgc2NyZWVuIFxuXG5cbmV4cG9ydHMuSG9tZVNjcmVlbiA9IEhvbWVTY3JlZW5cblxuY2xhc3MgR2FtZU92ZXJTY3JlZW4gZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3NjcmVlbnMvZ2FtZV9vdmVyLnBuZ1wiXG5cdG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDIwLCAxNSlcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cblx0XHRAc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdEBzY2VuZS5hZGQgQHJvb3Rcblx0XHRcblx0XHRAY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCA2NDAgLyA0ODAsIDEsIDEwMDAwKVx0XG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdXRpbC5sYXllclNwYWNpbmcoKSAqIDFcblx0XHRAc2NlbmUuYWRkIEBjYW1lcmFcblxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBnZW9tZXRyeSwgbWF0ZXJpYWxcblxuZXhwb3J0cy5HYW1lT3ZlclNjcmVlbiA9IEdhbWVPdmVyU2NyZWVuXG4iLCJ3aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbmF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxuY2xhc3MgU291bmRcblx0Y29uc3RydWN0b3I6IChAbmFtZSwgQHVybCwgQGJ1ZmZlciktPlxuZXhwb3J0cy5Tb3VuZCA9IFNvdW5kXG5cbmV4cG9ydHMubG9hZGVkU291bmRzID0gbG9hZGVkU291bmRzID0ge31cblxuXG5leHBvcnRzLmxvYWQgPSBsb2FkID0gKG5hbWUsIHVybCkgLT5cblx0cmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0cmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cdFx0cmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwpXG5cdFx0cmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXHRcdHJlcXVlc3Qub25sb2FkID0gKGEsIGIsIGMpPT5cblx0XHRcdGlmIHJlcXVlc3Quc3RhdHVzID09IDIwMFxuXHRcdFx0XHRhdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhIHJlcXVlc3QucmVzcG9uc2UsIFxuXHRcdFx0XHRcdChidWZmZXIpPT5cblx0XHRcdFx0XHRcdCN0b2RvIGhhbmRsZSBkZWNvZGluZyBlcnJvclxuXHRcdFx0XHRcdFx0c291bmQgPSBuZXcgU291bmQobmFtZSwgdXJsLCBidWZmZXIpXG5cdFx0XHRcdFx0XHRleHBvcnRzLmxvYWRlZFNvdW5kc1tuYW1lXSA9IHNvdW5kXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzb2x2ZShzb3VuZClcblx0XHRcdFx0XHQsKGVycik9PlxuXHRcdFx0XHRcdFx0cmVqZWN0IEVycm9yKFwiRGVjb2RpbmcgRXJyb3JcIilcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y29uc29sZS5sb2cgIFwiU3RhdHVzXCJcblx0XHRcdFx0cmVqZWN0IEVycm9yKFwiU3RhdHVzIEVycm9yXCIpXG5cblx0XHRcdFx0XG5cdFx0cmVxdWVzdC5vbmVycm9yID0gKCktPlxuXHRcdFx0Y29uc29sZS5sb2cgXCJlcnJyXCJcblx0XHRcdHJlamVjdCBFcnJvcihcIk5ldHdvcmsgRXJyb3JcIikgXHRcblxuXHRcdHJlcXVlc3Quc2VuZCgpXG5cdFx0XHRcblxuZXhwb3J0cy5wbGF5ID0gcGxheSA9IChhcmcpLT5cblx0aWYgdHlwZW9mIGFyZyA9PSAnc3RyaW5nJ1xuXHRcdGJ1ZmZlciA9IGxvYWRlZFNvdW5kc1thcmddLmJ1ZmZlclxuXHRlbHNlIFxuXHRcdGJ1ZmZlciA9IGFyZ1xuXHRpZiBidWZmZXI/XG5cdFx0c291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG5cdFx0c291cmNlLmJ1ZmZlciA9IGJ1ZmZlclxuXHRcdHNvdXJjZS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbilcblx0XHRzb3VyY2Uuc3RhcnQoMClcblxuXG5hc3NldHNMb2FkaW5nID0gW11cbmFzc2V0c0xvYWRpbmcucHVzaCBsb2FkKCdzaG9vdCcsICdhc3NldHMvc291bmRzL3Nob290LndhdicpXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnZXhwbG9zaW9uJywgJ2Fzc2V0cy9zb3VuZHMvZXhwbG9zaW9uLndhdicpXG5cblByb21pc2UuYWxsKGFzc2V0c0xvYWRpbmcpXG4udGhlbiAocmVzdWx0cyktPlxuXHRjb25zb2xlLmxvZyBcIkxvYWRlZCBhbGwgU291bmRzIVwiLCByZXN1bHRzXG4uY2F0Y2ggKGVyciktPlxuXHRjb25zb2xlLmxvZyBcInVob2hcIiwgZXJyXG5cbiIsIkVuZW1pZXMgPSByZXF1aXJlICcuL0VuZW1pZXMuY29mZmVlJ1xuXG5leHBvcnRzLmxvYWQgPSBsb2FkID0gKHVybCkgLT5cblx0cmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0anF4aHIgPSAkLmdldEpTT04gdXJsLCBAb25Mb2FkXG5cblx0XHRqcXhoci5kb25lICgpLT5cblx0XHRcdGxldmVsID0gbmV3IFRpbGVkTWFwKGpxeGhyLnJlc3BvbnNlSlNPTilcblx0XHRcdHJldHVybiByZXNvbHZlKGxldmVsKVxuXG5cdFx0anF4aHIuZmFpbCAoKS0+XG5cdFx0XHRyZXR1cm4gcmVqZWN0IEVycm9yKFwiU3RhdHVzIEVycm9yXCIpXG5cblxuY2xhc3MgVGlsZWRNYXBcblx0Y29uc3RydWN0b3I6IChAZGF0YSktPlxuXHRcdEB0aWxlU2V0cyA9IFtdXG5cdFx0QHRpbGVzID0gW11cblx0XHRAbGF5ZXJzID0ge31cblxuXHRcdCMgY3JlYXRlIHRpbGVTZXRzLCBsb2FkIHRoZSB0ZXh0dXJlc1xuXHRcdGZvciB0aWxlU2V0RGF0YSBpbiBkYXRhLnRpbGVzZXRzXG5cdFx0XHR0aWxlU2V0ID0gbmV3IFRpbGVTZXQgdGlsZVNldERhdGFcblx0XHRcdEB0aWxlU2V0cy5wdXNoIHRpbGVTZXRcblxuXHRcdCMgY3JlYXRlIHRpbGVzIEBnZW9tZXRlcnkgYW5kIEBtYXRlcmlhbFxuXHRcdGZvciB0aWxlU2V0IGluIEB0aWxlU2V0c1xuXHRcdFx0aWQgPSB0aWxlU2V0LmRhdGEuZmlyc3RnaWRcblx0XHRcdGZvciByb3cgaW4gWzAuLnRpbGVTZXQucm93cy0xXVxuXHRcdFx0XHRmb3IgY29sIGluIFswLi50aWxlU2V0LmNvbHMtMV1cblx0XHRcdFx0XHR0aWxlID0gbmV3IFRpbGUgdGlsZVNldCwgcm93LCBjb2xcblx0XHRcdFx0XHRAdGlsZXNbaWRdID0gdGlsZVxuXHRcdFx0XHRcdGlkKytcblxuXG5cdFx0IyBsb2FkIGxheWVyc1xuXHRcdGZvciBsYXllckRhdGEgaW4gZGF0YS5sYXllcnNcblx0XHRcdGlmIGxheWVyRGF0YS50eXBlID09IFwidGlsZWxheWVyXCJcblx0XHRcdFx0QGxheWVyc1tsYXllckRhdGEubmFtZV0gPSBuZXcgVGlsZUxheWVyKHRoaXMsIGxheWVyRGF0YSlcblx0XHRcdGlmIGxheWVyRGF0YS50eXBlID09IFwib2JqZWN0Z3JvdXBcIlxuXHRcdFx0XHRAbGF5ZXJzW2xheWVyRGF0YS5uYW1lXSA9IG5ldyBPYmplY3RHcm91cChsYXllckRhdGEpXG5cblx0XG5cblx0bG9hZFRpbGVMYXllcjogKGRhdGEpPT5cblx0XHRsYXllciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0Zm9yIGlkLCBpbmRleCBpbiBkYXRhLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gZGF0YS53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBkYXRhLndpZHRoXG5cdFx0XHRcdHRpbGVPYmplY3QgPSBuZXcgVGlsZU9iamVjdChAdGlsZXNbaWRdLCBuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIC1yb3cgLSAxLCAwKSApXG5cdFx0XHRcdGxheWVyLmFkZCB0aWxlT2JqZWN0LnJvb3RcdFxuXHRcdHJldHVybiBsYXllclxuXG5cdFxuXG5cbiMgcmVwcmVzZW50cyBhIFRpbGVTZXQgaW4gYSBUaWxlZCBFZGl0b3IgbGV2ZWxcbmNsYXNzIFRpbGVTZXRcblx0Y29uc3RydWN0b3I6IChAZGF0YSktPlxuXHRcdEBjb2xzID0gQGRhdGEuaW1hZ2V3aWR0aCAvIEBkYXRhLnRpbGV3aWR0aFxuXHRcdEByb3dzID0gQGRhdGEuaW1hZ2VoZWlnaHQgLyBAZGF0YS50aWxlaGVpZ2h0XG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzLyN7QGRhdGEuaW1hZ2V9XCJcblx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhUZXN0OiB0cnVlXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblxuIyBSZXByZXNlbnRzIHRoZSBAZ2VvbWV0cnkgYW5kIEBtYXRlcmlhbCBvZiBhIHRpbGUgbG9hZGVkIGZyb20gYSBUaWxlZCBFZGl0b3IgbGV2ZWxcbmNsYXNzIFRpbGVcblx0Y29uc3RydWN0b3I6IChAdGlsZVNldCwgQHJvdywgQGNvbCktPlxuXHRcdCMgdG9kbywgcHJvYmFibHkgYmUgcHJldHRpZXIgdG8ganVzdCBtYWtlIHRoaXMgZnJvbSBzY3JhdGNoXG5cdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIEB0aWxlU2V0LmRhdGEudGlsZXdpZHRoIC8gMzIsIEB0aWxlU2V0LmRhdGEudGlsZWhlaWdodCAvIDMyKVxuXHRcdFxuXHRcdCMgUmVwb3NpdGlvbiB2ZXJ0aWNlcyB0byBsb3dlciBsZWZ0IGF0IDAsMCBcblx0XHRmb3IgdiBpbiBAZ2VvbWV0cnkudmVydGljZXNcblx0XHRcdHYueCArPSBAdGlsZVNldC5kYXRhLnRpbGV3aWR0aCAvIDMyIC8gMlxuXHRcdFx0di55ICs9IEB0aWxlU2V0LmRhdGEudGlsZWhlaWdodCAvIDMyIC8gMlxuXHRcdEBnZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlXG5cblx0XHQjIGNhbGMgYW5kIHNldCB1dnNcblx0XHR1dldpZHRoID0gQHRpbGVTZXQuZGF0YS50aWxld2lkdGgvQHRpbGVTZXQuZGF0YS5pbWFnZXdpZHRoXG5cdFx0dXZIZWlnaHQgPSBAdGlsZVNldC5kYXRhLnRpbGVoZWlnaHQvQHRpbGVTZXQuZGF0YS5pbWFnZWhlaWdodFxuXG5cdFx0dXZYID0gdXZXaWR0aCAqIEBjb2xcblx0XHR1dlkgPSB1dkhlaWdodCAqIChAdGlsZVNldC5yb3dzIC0gQHJvdyAtIDEpXG5cdFx0Zm9yIGZhY2UgaW4gQGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1cblx0XHRcdGZvciB2IGluIGZhY2Vcblx0XHRcdFx0aWYgdi54ID09IDBcblx0XHRcdFx0XHR2LnggPSB1dlhcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHYueCA9IHV2WCArIHV2V2lkdGggIyAqICgzMS41LzMyLjApICMgdG9kbyBkaXJ0eSBoYWNrIHRvIHByZXZlbnQgc2xpZ2h0IG92ZXJzYW1wbGUgb24gdGlsZSBzaG93aW5nIGhpbnQgb2YgbmV4dCB0aWxlIG9uIGVkZ2UuXG5cblx0XHRcdFx0aWYgdi55ID09IDBcblx0XHRcdFx0XHR2LnkgPSB1dllcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHYueSA9IHV2WSArIHV2SGVpZ2h0ICMgKiAoMzEuNS8zMi4wKSAjIHRvZG8gZGlydHkgaGFjayB0byBwcmV2ZW50IHNsaWdodCBvdmVyc2FtcGxlIG9uIHRpbGUgc2hvd2luZyBoaW50IG9mIG5leHQgdGlsZSBvbiBlZGdlLlx0XHRcdFx0XHRcblx0XHRAZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWVcblxuXHRcdEBtYXRlcmlhbCA9IEB0aWxlU2V0Lm1hdGVyaWFsXG5cblx0XHRcblxuIyBSZXByZXNlbnRzIGEgVGlsZUxheWVyIGluIHRoZSBUaWxlZCBFZGl0b3IgZmlsZS4gXG5jbGFzcyBUaWxlTGF5ZXJcblx0Y29uc3RydWN0b3I6IChtYXAsIEBkYXRhKS0+XG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdGZvciBpZCwgaW5kZXggaW4gQGRhdGEuZGF0YVxuXHRcdFx0aWYgaWQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaW5kZXggLyBkYXRhLndpZHRoKVxuXHRcdFx0XHRjb2wgPSBpbmRleCAlIGRhdGEud2lkdGhcblx0XHRcdFx0IyBjb25zb2xlLmxvZyAgXCJ0aWxlXCIsIG1hcCwgbWFwLnRpbGVzW2lkXVxuXHRcdFx0XHR0aWxlT2JqZWN0ID0gbmV3IFRpbGVPYmplY3QobWFwLnRpbGVzW2lkXSwgbmV3IFRIUkVFLlZlY3RvcjMoY29sLCAtcm93IC0gMSwgMCkgKVxuXHRcdFx0XHRAcm9vdC5hZGQgdGlsZU9iamVjdC5tZXNoXHRcblx0XHRcblxuIyBSZXByZXNlbnRzIGFuIGluc3RhbmNlIG9mIGEgdGlsZSB0byBiZSByZW5kZXJlZFxuY2xhc3MgVGlsZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKHRpbGUsIHBvc2l0aW9uKS0+XG5cdFx0QG1lc2ggPSBuZXcgVEhSRUUuTWVzaCB0aWxlLmdlb21ldHJ5LCB0aWxlLm1hdGVyaWFsXG5cdFx0QG1lc2gucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XG5cbmNsYXNzIE9iamVjdEdyb3VwXG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRAb2JqZWN0cyA9IFtdXG5cdFx0Zm9yIG9iamVjdERhdGEgaW4gQGRhdGEub2JqZWN0cyBcblx0XHRcdGVuZW15ID0gbmV3IEVuZW1pZXNbb2JqZWN0RGF0YS50eXBlXShuZXcgVEhSRUUuVmVjdG9yMyhvYmplY3REYXRhLnggLyAzMiwgNyAtIG9iamVjdERhdGEueSAvIDMyLCAwKSlcblx0XHRcdEBvYmplY3RzLnB1c2ggZW5lbXlcbiIsIlNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5Db2xsaXNpb25zID0gcmVxdWlyZSAnLi9Db2xsaXNpb25zLmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5cbmNsYXNzIGV4cG9ydHMuQnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9ucy5Db2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXQucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSlcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDIwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggYnVsbGV0R2VvbWV0cnksIGJ1bGxldE1hdGVyaWFsXG5cblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiYnVsbGV0XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlcIlxuXHRcdEBhbmdsZSA9IDBcblx0XHRAc3BlZWQgPSAxNVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBNYXRoLmNvcyhAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gTWF0aC5zaW4oQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5yb3RhdGlvbi56ID0gQGFuZ2xlXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxuXG5cdGNvbGxpZGVJbnRvOiAodGFyZ2V0KS0+XG5cdFx0c3VwZXIodGFyZ2V0KVxuXHRcdFNjb3JlLmFkZCgxKVxuXHRcdEBkaWUoKVxuXHRcdGZvciBpIGluIFswLi41XVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAxKVxuXG5cbmNsYXNzIGV4cG9ydHMuRW5lbXlCdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25zLkNvbGxpc2lvbk9iamVjdFxuXHRidWxsZXRUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy93ZWFwb25zL2J1bGxldF8yLnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpXG5cdFxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDIwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggYnVsbGV0R2VvbWV0cnksIGJ1bGxldE1hdGVyaWFsXG5cblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiYnVsbGV0XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlcIlxuXHRcdEBhbmdsZSA9IDBcblx0XHRAc3BlZWQgPSAxNVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBNYXRoLmNvcyhAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gTWF0aC5zaW4oQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5yb3RhdGlvbi56ID0gQGFuZ2xlXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxuXG5cdGNvbGxpZGVJbnRvOiAodGFyZ2V0KS0+XG5cdFx0c3VwZXIodGFyZ2V0KVxuXHRcdFNjb3JlLmFkZCgxKVxuXHRcdEBkaWUoKVxuXHRcdGZvciBpIGluIFswLi41XVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAxKVxuIiwiR2FtZSA9IHJlcXVpcmUgJy4vR2FtZS5jb2ZmZWUnXG5cblxubW9kdWxlLmV4cG9ydHMuR2FtZSA9IG5ldyBHYW1lLkdhbWUoKVxuXG5cdFx0XG5cbiMgbW9kZWxMb2FkZXIgPSBuZXcgY29yZS5Nb2RlbExvYWRlcigpXG5cblxuXHRcdFx0XG5cblxuIiwiZXhwb3J0cy5hZnRlciA9IChkZWxheSwgZnVuYyktPlxuXHRzZXRUaW1lb3V0IGZ1bmMsIGRlbGF5XG5cbmV4cG9ydHMucmFuZG9tID0gKG1pbiwgbWF4KS0+XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG5cblxuZXhwb3J0cy5sYXllclNwYWNpbmcgPSAoKS0+XG5cdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblx0dGFyZ2V0WiA9IDQ4MCAvICgyICogTWF0aC50YW4oZm92X3JhZGlhbnMgLyAyKSApIC8gMzIuMDtcbiJdfQ==
