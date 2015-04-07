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
var Basic, Boss, Collisions, Dart, Particle, SinWave, Sound, Weapons,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Sound = require('./Sound.coffee');

Collisions = require('./Collisions.coffee');

Particle = require('./Particle.coffee');

Weapons = require('./Weapons.coffee');

Basic = (function(_super) {
  var enemyTexture;

  __extends(Basic, _super);

  enemyTexture = THREE.ImageUtils.loadTexture("assets/enemies/enemy.png");

  Basic.prototype.enemyMaterial = new THREE.MeshBasicMaterial({
    map: enemyTexture,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    transparent: true
  });

  Basic.prototype.enemyGeometry = new THREE.PlaneGeometry(1, 1);

  function Basic(position) {
    Basic.__super__.constructor.call(this);
    this.colliderType = "enemy";
    this.colliderHitTypes.push("player");
    this.root.add(new THREE.Mesh(this.enemyGeometry, this.enemyMaterial));
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

Boss = (function(_super) {
  var enemyTexture;

  __extends(Boss, _super);

  enemyTexture = THREE.ImageUtils.loadTexture("assets/enemies/boss.png");

  Boss.prototype.enemyMaterial = new THREE.MeshBasicMaterial({
    map: enemyTexture,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    transparent: true
  });

  Boss.prototype.enemyGeometry = new THREE.PlaneGeometry(4, 6);

  function Boss(position) {
    Boss.__super__.constructor.call(this, position);
    this.hp = 20;
    this.lastFire = Date.now();
  }

  Boss.prototype.update = function(delta) {
    Boss.__super__.update.call(this, delta);
    if (this.age < 2) {
      this.root.position.x -= 1 * delta;
    }
    if (this.age > 2) {
      this.root.position.x += 1 * delta;
      this.root.position.y += delta * Math.sin(this.age);
    }
    if (this.age % 4 > 1) {
      return this.fire_primary();
    }
  };

  Boss.prototype.fire_primary = function() {
    var bullet, pos;
    if (Date.now() > this.lastFire + 250) {
      Sound.play('shoot');
      this.lastFire = Date.now();
      pos = this.root.position.clone();
      pos.y -= 1.8;
      pos.x -= 1.6;
      bullet = new Weapons.EnemyBullet(pos);
      bullet.colliderType = "enemy_bullet";
      bullet.colliderHitTypes = ["player"];
      bullet.angle = Math.PI;
      bullet.speed = 7;
      this.parent.add(bullet);
      pos = this.root.position.clone();
      pos.y += 1.8;
      pos.x -= 1.6;
      bullet = new Weapons.EnemyBullet(pos);
      bullet.colliderType = "enemy_bullet";
      bullet.colliderHitTypes = ["player"];
      bullet.angle = Math.PI;
      bullet.speed = 7;
      return this.parent.add(bullet);
    }
  };

  Boss.prototype.die = function() {
    var i, _i, _j;
    Sound.play('explosion');
    for (i = _i = 0; _i <= 200; i = ++_i) {
      this.parent.add(new Particle(this.root.position, 10));
    }
    for (i = _j = 0; _j <= 100; i = ++_j) {
      this.parent.add(new Particle(this.root.position, 5));
    }
    return Boss.__super__.die.call(this);
  };

  return Boss;

})(Basic);

exports.Boss = Boss;

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


},{"./Collisions.coffee":3,"./Particle.coffee":10,"./Sound.coffee":15,"./Weapons.coffee":17}],5:[function(require,module,exports){
var Base, Game, Level, PostEffects, Score, Screens, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('../util.coffee');

Base = require('./Base.coffee');

Level = require('./Level.coffee');

Screens = require('./Screens.coffee');

Score = require('./Score.coffee');

PostEffects = require('./PostEffects.coffee');

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
    this.worldTexture = new THREE.WebGLRenderTarget(640, 480, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat
    });
    this.screenEffect = new PostEffects.ScreenEffect();
    this.screenEffect.processMaterial.uniforms.tDiffuse.value = this.worldTexture;
    this.clock = new THREE.Clock();
    Score.displayElement = $("<h1>Score:</h1>").appendTo($("#shump"));
    this.livesElement = $("<h1>Lives:</h1>").appendTo($("#shump"));
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
    this.livesElement.text("Lives: " + this.lives);
    Score.set(0);
    this.level = new Level.Level();
    this.level.on("playerDie", (function(_this) {
      return function() {
        _this.lives--;
        _this.livesElement.text("Lives: " + _this.lives);
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
      this.renderer.render(this.homeScreen.scene, this.homeScreen.camera, this.worldTexture, true);
    }
    if (this.state === "play") {
      this.renderer.render(this.level.scene, this.level.camera, this.worldTexture, true);
      this.renderer.render(this.homeScreen.scene, this.level.camera, this.worldTexture, false);
    }
    if (this.state === "game_over") {
      this.renderer.render(this.level.scene, this.level.camera, this.worldTexture, true);
      this.renderer.render(this.gameOverScreen.scene, this.gameOverScreen.camera, this.worldTexture, false);
    }
    return this.renderer.render(this.screenEffect.scene, this.screenEffect.camera);
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


},{"../util.coffee":19,"./Base.coffee":2,"./Level.coffee":8,"./PostEffects.coffee":12,"./Score.coffee":13,"./Screens.coffee":14}],6:[function(require,module,exports){
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


},{"../util.coffee":19,"./Collisions.coffee":3,"./GameObject.coffee":6,"./Player.coffee":11,"./Tiled.coffee":16}],9:[function(require,module,exports){
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


},{"../util.coffee":19,"./Collisions.coffee":3,"./Input.coffee":7,"./ModelLoader.coffee":9,"./Particle.coffee":10,"./Sound.coffee":15,"./Weapons.coffee":17,"./shump.coffee":18}],12:[function(require,module,exports){
exports.ScreenEffect = (function() {
  function ScreenEffect() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-.5, .5, -.5, .5, 0, 1);
    this.camera.position.z = 0;
    this.scene.add(this.camera);
    this.processMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: false,
      uniforms: {
        "tDiffuse": {
          type: "t",
          value: void 0
        }
      },
      vertexShader: "varying vec2 vUv;\n\nvoid main() {\n	vUv = uv;\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",
      fragmentShader: "uniform sampler2D tDiffuse;\nvarying vec2 vUv;\n\nvoid main() {\n	// read the input color\n\n	vec4 o;\n	vec4 c;\n	c = texture2D( tDiffuse, vUv );\n	//o = texture2D( tDiffuse, vUv );\n\n	//misalign rgb\n	o.r = texture2D( tDiffuse, vUv + vec2(0.0, -0.001) ).r;\n	o.g = texture2D( tDiffuse, vUv + vec2(0.0, 0.001) ).g;\n	o.b = texture2D( tDiffuse, vUv + vec2(0.0, 0.003) ).b;\n\n	//scanlines\n	o.r *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;\n	o.g *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;\n	o.b *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;\n\n	o *= 0.5 + 1.0*16.0*vUv.x*vUv.y*(1.0-vUv.x)*(1.0-vUv.y);\n	\n\n	// set the output color\n	gl_FragColor = o * .5 + c * .5;\n}"
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.processMaterial);
    this.quad.rotation.x = Math.PI;
    this.scene.add(this.quad);
  }

  return ScreenEffect;

})();


},{}],13:[function(require,module,exports){
var display, score;

score = 0;

exports.displayElement = void 0;

exports.set = function(_score) {
  score = _score;
  return display();
};

exports.add = function(points) {
  score += points;
  return display();
};

display = function() {
  if (exports.displayElement != null) {
    return exports.displayElement.text("Score: " + score);
  }
};

exports.get = function() {
  return score;
};


},{}],14:[function(require,module,exports){
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


},{"../util.coffee":19,"./GameObject.coffee":6}],15:[function(require,module,exports){
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


},{}],16:[function(require,module,exports){
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


},{"./Enemies.coffee":4}],17:[function(require,module,exports){
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


},{"./Collisions.coffee":3,"./Particle.coffee":10,"./Score.coffee":13}],18:[function(require,module,exports){
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

exports.layerSpacing = function() {
  var fov_radians, targetZ;
  fov_radians = 45 * (Math.PI / 180);
  return targetZ = 480 / (2 * Math.tan(fov_radians / 2)) / 32.0;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYmFrc2UvRGVza3RvcC9kZXNrdG9wL2piYWtzZS9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRGVza3RvcC9kZXNrdG9wL2piYWtzZS9zaHVtcC9zY3JpcHRzL3NodW1wL0Jhc2UuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9EZXNrdG9wL2Rlc2t0b3AvamJha3NlL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9zaHVtcC9FbmVtaWVzLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRGVza3RvcC9kZXNrdG9wL2piYWtzZS9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9EZXNrdG9wL2Rlc2t0b3AvamJha3NlL3NodW1wL3NjcmlwdHMvc2h1bXAvR2FtZU9iamVjdC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9zaHVtcC9MZXZlbC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9zaHVtcC9Nb2RlbExvYWRlci5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9zaHVtcC9QYXJ0aWNsZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9EZXNrdG9wL2Rlc2t0b3AvamJha3NlL3NodW1wL3NjcmlwdHMvc2h1bXAvUG9zdEVmZmVjdHMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9EZXNrdG9wL2Rlc2t0b3AvamJha3NlL3NodW1wL3NjcmlwdHMvc2h1bXAvU2NvcmUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9EZXNrdG9wL2Rlc2t0b3AvamJha3NlL3NodW1wL3NjcmlwdHMvc2h1bXAvU2NyZWVucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9zaHVtcC9Tb3VuZC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9zaHVtcC9UaWxlZC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0Rlc2t0b3AvZGVza3RvcC9qYmFrc2Uvc2h1bXAvc2NyaXB0cy9zaHVtcC9XZWFwb25zLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRGVza3RvcC9kZXNrdG9wL2piYWtzZS9zaHVtcC9zY3JpcHRzL3NodW1wL3NodW1wLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRGVza3RvcC9kZXNrdG9wL2piYWtzZS9zaHVtcC9zY3JpcHRzL3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxrQkFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHNCQUFSLENBQVIsQ0FBQTs7QUFBQSxDQUVBLENBQUUsYUFBRixDQUFnQixDQUFDLEtBQWpCLENBQXVCLFNBQUEsR0FBQTtBQUV0QixNQUFBLHNFQUFBO0FBQUEsRUFBQSxDQUFBLENBQUUsUUFBRixDQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsdUJBQWYsQ0FBdUMsT0FBTyxDQUFDLG9CQUEvQyxDQUFBLENBQUE7QUFBQSxFQUVBLE1BQUEsR0FBUyxDQUFBLENBQUUsZUFBRixDQUZULENBQUE7QUFBQSxFQUdBLFlBQUEsR0FBZSxNQUFNLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsTUFBTSxDQUFDLE1BQVAsQ0FBQSxDQUhoQyxDQUFBO0FBQUEsRUFLQSxjQUFBLEdBQWlCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FMakIsQ0FBQTtBQUFBLEVBTUEsZUFBQSxHQUFrQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBTmxCLENBQUE7QUFBQSxFQU9BLGVBQUEsR0FBa0IsY0FBQSxHQUFpQixlQVBuQyxDQUFBO0FBQUEsRUFRQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVosRUFBMEIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEtBQVYsQ0FBQSxDQUExQixFQUE4QyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQTlDLEVBQWtFLGVBQWxFLENBUkEsQ0FBQTtBQVVBLEVBQUEsSUFBRyxZQUFBLEdBQWUsZUFBbEI7QUFDQyxJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWixDQUFBLENBQUE7QUFBQSxJQUNBLE1BQU0sQ0FBQyxNQUFQLENBQWMsZUFBZCxDQURBLENBQUE7V0FFQSxNQUFNLENBQUMsS0FBUCxDQUFhLGVBQUEsR0FBa0IsWUFBL0IsRUFIRDtHQUFBLE1BQUE7QUFLQyxJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWixDQUFBLENBQUE7QUFBQSxJQUNBLE1BQU0sQ0FBQyxLQUFQLENBQWEsY0FBYixDQURBLENBQUE7V0FFQSxNQUFNLENBQUMsTUFBUCxDQUFjLGNBQUEsR0FBaUIsWUFBL0IsRUFQRDtHQVpzQjtBQUFBLENBQXZCLENBRkEsQ0FBQTs7QUFBQSxDQXVCQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLE1BQVosQ0FBbUIsNkJBQW5CLENBdkJBLENBQUE7O0FBQUEsV0EwQkEsR0FBYyxTQUFBLEdBQUE7U0FDYixDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUE0QixtQkFBQSxHQUFrQixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBeEUsRUFEYTtBQUFBLENBMUJkLENBQUE7Ozs7QUNBQSxJQUFBLElBQUE7RUFBQTtvQkFBQTs7QUFBQTtBQUNjLEVBQUEsY0FBQSxHQUFBO0FBQ1osNkNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFYLENBRFk7RUFBQSxDQUFiOztBQUFBLGlCQUdBLEVBQUEsR0FBSSxTQUFDLEtBQUQsRUFBUSxPQUFSLEdBQUE7QUFDSCxRQUFBLEtBQUE7QUFBQSxJQUFBLDhDQUFVLENBQUEsS0FBQSxTQUFBLENBQUEsS0FBQSxJQUFVLEVBQXBCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsT0FBN0IsQ0FBQSxDQUFBO0FBQ0EsV0FBTyxJQUFQLENBRkc7RUFBQSxDQUhKLENBQUE7O0FBQUEsaUJBT0EsR0FBQSxHQUFLLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTtBQUNKLFFBQUEsOEJBQUE7QUFBQTtBQUFBLFNBQUEsMkRBQUE7NEJBQUE7VUFBMkMsT0FBQSxLQUFXO0FBQ3JELFFBQUEsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQU0sQ0FBQyxNQUFoQixDQUF1QixLQUF2QixFQUE4QixDQUE5QixDQUFBO09BREQ7QUFBQSxLQUFBO0FBRUEsV0FBTyxJQUFQLENBSEk7RUFBQSxDQVBMLENBQUE7O0FBQUEsaUJBWUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNSLFFBQUEsaUNBQUE7QUFBQSxJQURTLHNCQUFPLDhEQUNoQixDQUFBO0FBQUEsSUFBQSxJQUFtQiwyQkFBbkI7QUFBQSxhQUFPLElBQVAsQ0FBQTtLQUFBO0FBQ0EsU0FBUyxxRUFBVCxHQUFBO0FBQ0MsTUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQU8sQ0FBQSxDQUFBLENBQTFCLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxLQUFSLENBQWMsSUFBZCxFQUFvQixJQUFwQixDQURBLENBREQ7QUFBQSxLQURBO0FBSUEsV0FBTyxJQUFQLENBTFE7RUFBQSxDQVpULENBQUE7O2NBQUE7O0lBREQsQ0FBQTs7QUFBQSxNQW9CTSxDQUFDLE9BQVAsR0FBaUIsSUFwQmpCLENBQUE7Ozs7QUNBQSxJQUFBLDJCQUFBO0VBQUE7aVNBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQUFiLENBQUE7O0FBQUE7QUFHQyxvQ0FBQSxDQUFBOztBQUFhLEVBQUEseUJBQUEsR0FBQTtBQUNaLElBQUEsK0NBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixNQURoQixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsRUFGcEIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEVBQUQsR0FBTSxDQUhOLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FKTixDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsZUFBRCxHQUFtQixFQUxuQixDQURZO0VBQUEsQ0FBYjs7QUFBQSw0QkFRQSxXQUFBLEdBQWEsU0FBQyxNQUFELEdBQUE7V0FDWixNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFDLENBQUEsRUFBbkIsRUFEWTtFQUFBLENBUmIsQ0FBQTs7QUFBQSw0QkFhQSxVQUFBLEdBQVksU0FBQyxNQUFELEdBQUE7QUFDWCxJQUFBLElBQUMsQ0FBQSxFQUFELElBQU8sTUFBUCxDQUFBO0FBQ0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxFQUFELElBQU8sQ0FBVjthQUNDLElBQUMsQ0FBQSxHQUFELENBQUEsRUFERDtLQUZXO0VBQUEsQ0FiWixDQUFBOzt5QkFBQTs7R0FENkIsV0FGOUIsQ0FBQTs7QUFBQSxNQXFCTSxDQUFDLE9BQU8sQ0FBQyxlQUFmLEdBQWlDLGVBckJqQyxDQUFBOztBQUFBLE1BeUJNLENBQUMsT0FBTyxDQUFDLGlCQUFmLEdBQW1DLFNBQUMsU0FBRCxHQUFBO0FBQ2xDLE1BQUEsd0JBQUE7QUFBQTtPQUFBLGdEQUFBO3NCQUFBO0FBQ0MsSUFBQSxJQUFHLENBQUMsQ0FBQyxNQUFMOzs7QUFDQzthQUFBLGtEQUFBOzRCQUFBO0FBQ0MsVUFBQSxJQUFHLENBQUMsQ0FBQyxNQUFMO0FBQ0MsWUFBQSxJQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFuQixDQUEyQixDQUFDLENBQUMsWUFBN0IsQ0FBQSxHQUE2QyxDQUFBLENBQWhEO0FBQ0MsY0FBQSxJQUFHLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFrQixDQUFsQixDQUFIOytCQUNDLENBQUMsQ0FBQyxXQUFGLENBQWMsQ0FBZCxHQUREO2VBQUEsTUFBQTt1Q0FBQTtlQUREO2FBQUEsTUFBQTtxQ0FBQTthQUREO1dBQUEsTUFBQTttQ0FBQTtXQUREO0FBQUE7O3FCQUREO0tBQUEsTUFBQTs0QkFBQTtLQUREO0FBQUE7a0JBRGtDO0FBQUEsQ0F6Qm5DLENBQUE7O0FBQUEsTUFrQ00sQ0FBQyxPQUFPLENBQUMsYUFBZixHQUErQixTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7QUFDOUIsU0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaEIsQ0FBa0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUF6QyxDQUFBLEdBQXFELENBQUMsQ0FBQyxlQUFGLEdBQW9CLENBQUMsQ0FBQyxlQUFsRixDQUQ4QjtBQUFBLENBbEMvQixDQUFBOzs7O0FDQ0EsSUFBQSxnRUFBQTtFQUFBO2lTQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FBUixDQUFBOztBQUFBLFVBQ0EsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FEYixDQUFBOztBQUFBLFFBRUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FGWCxDQUFBOztBQUFBLE9BR0EsR0FBVSxPQUFBLENBQVEsa0JBQVIsQ0FIVixDQUFBOztBQUFBO0FBUUMsTUFBQSxZQUFBOztBQUFBLDBCQUFBLENBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFqQixDQUE2QiwwQkFBN0IsQ0FBZixDQUFBOztBQUFBLGtCQUNBLGFBQUEsR0FBbUIsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDakI7QUFBQSxJQUFBLEdBQUEsRUFBSyxZQUFMO0FBQUEsSUFDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFVBRFo7QUFBQSxJQUVBLE9BQUEsRUFBUyxLQUFLLENBQUMsU0FGZjtBQUFBLElBR0EsV0FBQSxFQUFhLElBSGI7R0FEaUIsQ0FEbkIsQ0FBQTs7QUFBQSxrQkFNQSxhQUFBLEdBQW1CLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FObkIsQ0FBQTs7QUFRYSxFQUFBLGVBQUMsUUFBRCxHQUFBO0FBQ1osSUFBQSxxQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxZQUFELEdBQWdCLE9BRGhCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixRQUF2QixDQUZBLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsYUFBWixFQUEyQixJQUFDLENBQUEsYUFBNUIsQ0FBZCxDQUpBLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FMQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBTlAsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQVBaLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FUVixDQURZO0VBQUEsQ0FSYjs7QUFBQSxrQkFvQkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxrQ0FBTSxLQUFOLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxHQUFELElBQVEsTUFGRDtFQUFBLENBcEJSLENBQUE7O0FBQUEsa0JBeUJBLEdBQUEsR0FBSyxTQUFBLEdBQUE7QUFDSixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsV0FBWCxDQUFBLENBQUE7QUFDQSxTQUFTLDhCQUFULEdBQUE7QUFDQyxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFnQixJQUFBLFFBQUEsQ0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQWYsRUFBeUIsQ0FBekIsQ0FBaEIsQ0FBQSxDQUREO0FBQUEsS0FEQTtXQUdBLDZCQUFBLEVBSkk7RUFBQSxDQXpCTCxDQUFBOztlQUFBOztHQUZtQixVQUFVLENBQUMsZ0JBTi9CLENBQUE7O0FBQUE7QUF5Q0MsTUFBQSxZQUFBOztBQUFBLHlCQUFBLENBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFqQixDQUE2Qix5QkFBN0IsQ0FBZixDQUFBOztBQUFBLGlCQUNBLGFBQUEsR0FBbUIsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDakI7QUFBQSxJQUFBLEdBQUEsRUFBSyxZQUFMO0FBQUEsSUFDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFVBRFo7QUFBQSxJQUVBLE9BQUEsRUFBUyxLQUFLLENBQUMsU0FGZjtBQUFBLElBR0EsV0FBQSxFQUFhLElBSGI7R0FEaUIsQ0FEbkIsQ0FBQTs7QUFBQSxpQkFNQSxhQUFBLEdBQW1CLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FObkIsQ0FBQTs7QUFRYSxFQUFBLGNBQUMsUUFBRCxHQUFBO0FBQ1osSUFBQSxzQ0FBTSxRQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLEVBQUQsR0FBTSxFQUROLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUZaLENBRFk7RUFBQSxDQVJiOztBQUFBLGlCQWFBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLElBQUEsaUNBQU0sS0FBTixDQUFBLENBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFWO0FBQ0MsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLENBQUEsR0FBSSxLQUF4QixDQUREO0tBRkE7QUFJQSxJQUFBLElBQUcsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFWO0FBQ0MsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLENBQUEsR0FBSSxLQUF4QixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxHQUFWLENBRDVCLENBREQ7S0FKQTtBQVFBLElBQUEsSUFBRyxJQUFDLENBQUEsR0FBRCxHQUFPLENBQVAsR0FBVyxDQUFkO2FBQ0UsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQURGO0tBVE87RUFBQSxDQWJSLENBQUE7O0FBQUEsaUJBeUJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDYixRQUFBLFdBQUE7QUFBQSxJQUFBLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLFFBQUQsR0FBWSxHQUE1QjtBQUNDLE1BQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFBLENBRFosQ0FBQTtBQUFBLE1BR0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQWYsQ0FBQSxDQUhOLENBQUE7QUFBQSxNQUlBLEdBQUcsQ0FBQyxDQUFKLElBQVMsR0FKVCxDQUFBO0FBQUEsTUFLQSxHQUFHLENBQUMsQ0FBSixJQUFTLEdBTFQsQ0FBQTtBQUFBLE1BTUEsTUFBQSxHQUFhLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsR0FBcEIsQ0FOYixDQUFBO0FBQUEsTUFPQSxNQUFNLENBQUMsWUFBUCxHQUFzQixjQVB0QixDQUFBO0FBQUEsTUFRQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQyxRQUFELENBUjFCLENBQUE7QUFBQSxNQVNBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBSSxDQUFDLEVBVHBCLENBQUE7QUFBQSxNQVVBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsQ0FWZixDQUFBO0FBQUEsTUFXQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBWEEsQ0FBQTtBQUFBLE1BY0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQWYsQ0FBQSxDQWROLENBQUE7QUFBQSxNQWVBLEdBQUcsQ0FBQyxDQUFKLElBQVMsR0FmVCxDQUFBO0FBQUEsTUFnQkEsR0FBRyxDQUFDLENBQUosSUFBUyxHQWhCVCxDQUFBO0FBQUEsTUFpQkEsTUFBQSxHQUFhLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsR0FBcEIsQ0FqQmIsQ0FBQTtBQUFBLE1Ba0JBLE1BQU0sQ0FBQyxZQUFQLEdBQXNCLGNBbEJ0QixDQUFBO0FBQUEsTUFtQkEsTUFBTSxDQUFDLGdCQUFQLEdBQTBCLENBQUMsUUFBRCxDQW5CMUIsQ0FBQTtBQUFBLE1Bb0JBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBSSxDQUFDLEVBcEJwQixDQUFBO0FBQUEsTUFxQkEsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQXJCZixDQUFBO2FBc0JBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosRUF2QkQ7S0FEYTtFQUFBLENBekJkLENBQUE7O0FBQUEsaUJBbURBLEdBQUEsR0FBSyxTQUFBLEdBQUE7QUFDSixRQUFBLFNBQUE7QUFBQSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsV0FBWCxDQUFBLENBQUE7QUFDQSxTQUFTLCtCQUFULEdBQUE7QUFDQyxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFnQixJQUFBLFFBQUEsQ0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQWYsRUFBeUIsRUFBekIsQ0FBaEIsQ0FBQSxDQUREO0FBQUEsS0FEQTtBQUlBLFNBQVMsK0JBQVQsR0FBQTtBQUNDLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWdCLElBQUEsUUFBQSxDQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBZixFQUF5QixDQUF6QixDQUFoQixDQUFBLENBREQ7QUFBQSxLQUpBO1dBT0EsNEJBQUEsRUFSSTtFQUFBLENBbkRMLENBQUE7O2NBQUE7O0dBRGtCLE1BeENuQixDQUFBOztBQUFBLE9BdUdPLENBQUMsSUFBUixHQUFlLElBdkdmLENBQUE7O0FBQUE7QUE0R0MsNEJBQUEsQ0FBQTs7OztHQUFBOztBQUFBLG9CQUFBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLElBQUEsb0NBQU0sS0FBTixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsQ0FBQSxDQUFBLEdBQUssS0FEekIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsS0FBQSxHQUFRLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEdBQVYsRUFIckI7RUFBQSxDQUFSLENBQUE7O2lCQUFBOztHQURxQixNQTNHdEIsQ0FBQTs7QUFBQTtBQWtIQyx5QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsaUJBQUEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxpQ0FBTSxLQUFOLENBQUEsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFDLENBQUEsR0FBRCxHQUFPLEVBQVY7QUFDQyxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsQ0FBQSxFQUFBLEdBQU0sS0FBMUIsQ0FERDtLQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsR0FBRCxHQUFPLENBQVY7QUFDSixNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsQ0FBQSxHQUFJLEtBQXhCLENBREk7S0FBQSxNQUFBO0FBR0osTUFBQSxJQUFDLENBQUEsR0FBRCxDQUFBLENBQUEsQ0FISTtLQUhMO0FBUUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBUCxJQUFhLENBQUEsSUFBSyxDQUFBLFFBQXJCO0FBQ0MsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQVosQ0FBQTthQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFGRDtLQVRPO0VBQUEsQ0FBUixDQUFBOztBQUFBLGlCQWNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFFYixRQUFBLE1BQUE7QUFBQSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQURaLENBQUE7QUFBQSxJQUVBLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBMUIsQ0FGYixDQUFBO0FBQUEsSUFJQSxNQUFNLENBQUMsWUFBUCxHQUFzQixjQUp0QixDQUFBO0FBQUEsSUFLQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQyxRQUFELENBTDFCLENBQUE7QUFBQSxJQU1BLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQU56QixDQUFBO0FBQUEsSUFPQSxNQUFNLENBQUMsS0FBUCxHQUFlLENBUGYsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksTUFBWixDQVRBLENBQUE7QUFBQSxJQVdBLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBMUIsQ0FYYixDQUFBO0FBQUEsSUFhQSxNQUFNLENBQUMsWUFBUCxHQUFzQixjQWJ0QixDQUFBO0FBQUEsSUFjQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQyxRQUFELENBZDFCLENBQUE7QUFBQSxJQWVBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQWZ6QixDQUFBO0FBQUEsSUFnQkEsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQWhCZixDQUFBO1dBa0JBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosRUFwQmE7RUFBQSxDQWRkLENBQUE7O2NBQUE7O0dBRGtCLE1BakhuQixDQUFBOztBQUFBLE9BdUpPLENBQUMsS0FBUixHQUFnQixLQXZKaEIsQ0FBQTs7QUFBQSxPQXdKTyxDQUFDLE9BQVIsR0FBa0IsT0F4SmxCLENBQUE7O0FBQUEsT0F5Sk8sQ0FBQyxJQUFSLEdBQWUsSUF6SmYsQ0FBQTs7OztBQ0RBLElBQUEsb0RBQUE7RUFBQTs7aVNBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxnQkFBUixDQUFQLENBQUE7O0FBQUEsSUFDQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBRFAsQ0FBQTs7QUFBQSxLQUVBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBRlIsQ0FBQTs7QUFBQSxPQUdBLEdBQVUsT0FBQSxDQUFRLGtCQUFSLENBSFYsQ0FBQTs7QUFBQSxLQUlBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBSlIsQ0FBQTs7QUFBQSxXQUtBLEdBQWMsT0FBQSxDQUFRLHNCQUFSLENBTGQsQ0FBQTs7QUFBQTtBQVlDLHlCQUFBLENBQUE7O0FBQWEsRUFBQSxjQUFBLEdBQUE7QUFDWiw2Q0FBQSxDQUFBO0FBQUEsMkNBQUEsQ0FBQTtBQUFBLDJDQUFBLENBQUE7QUFBQSxJQUFBLG9DQUFBLENBQUEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQUhULENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBQSxDQU5oQixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBa0IsR0FBbEIsRUFBdUIsR0FBdkIsQ0FQQSxDQUFBO0FBQUEsSUFRQSxDQUFBLENBQUUsUUFBRixDQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBZixDQUEyQixJQUFDLENBQUEsUUFBUSxDQUFDLFVBQXJDLENBUkEsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FBd0IsR0FBeEIsRUFBNkIsR0FBN0IsRUFDbkI7QUFBQSxNQUFBLFNBQUEsRUFBVyxLQUFLLENBQUMsWUFBakI7QUFBQSxNQUNBLFNBQUEsRUFBVyxLQUFLLENBQUMsWUFEakI7QUFBQSxNQUVBLE1BQUEsRUFBUSxLQUFLLENBQUMsU0FGZDtLQURtQixDQVhwQixDQUFBO0FBQUEsSUFpQkEsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxXQUFXLENBQUMsWUFBWixDQUFBLENBakJwQixDQUFBO0FBQUEsSUFrQkEsSUFBQyxDQUFBLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFoRCxHQUF3RCxJQUFDLENBQUEsWUFsQnpELENBQUE7QUFBQSxJQXNCQSxJQUFDLENBQUEsS0FBRCxHQUFhLElBQUEsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQXRCYixDQUFBO0FBQUEsSUErQkEsS0FBSyxDQUFDLGNBQU4sR0FBdUIsQ0FBQSxDQUFFLGlCQUFGLENBQXdCLENBQUMsUUFBekIsQ0FBa0MsQ0FBQSxDQUFFLFFBQUYsQ0FBbEMsQ0EvQnZCLENBQUE7QUFBQSxJQWdDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixDQUFBLENBQUUsaUJBQUYsQ0FBd0IsQ0FBQyxRQUF6QixDQUFrQyxDQUFBLENBQUUsUUFBRixDQUFsQyxDQWhDaEIsQ0FBQTtBQUFBLElBbUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsTUFuQ1QsQ0FBQTtBQUFBLElBb0NBLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsT0FBTyxDQUFDLFVBQVIsQ0FBQSxDQXBDbEIsQ0FBQTtBQUFBLElBcUNBLElBQUMsQ0FBQSxjQUFELEdBQXNCLElBQUEsT0FBTyxDQUFDLGNBQVIsQ0FBQSxDQXJDdEIsQ0FBQTtBQUFBLElBd0NBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxPQUFWLENBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUNqQixRQUFBLElBQUcsS0FBQyxDQUFBLEtBQUQsS0FBVSxNQUFiO0FBQ0MsVUFBQSxLQUFDLENBQUEsS0FBRCxHQUFTLFNBQVQsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLFNBQUQsQ0FBQSxDQURBLENBQUE7QUFFQSxnQkFBQSxDQUhEO1NBQUE7QUFLQSxRQUFBLElBQUcsS0FBQyxDQUFBLEtBQUQsS0FBVSxXQUFiO1VBQ0MsS0FBQyxDQUFBLEtBQUQsR0FBUyxPQURWO1NBTmlCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0F4Q0EsQ0FBQTtBQUFBLElBcURBLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFDYixLQUFDLENBQUEsT0FBRCxDQUFBLEVBRGE7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkLENBckRBLENBRFk7RUFBQSxDQUFiOztBQUFBLGlCQTBEQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1YsSUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLENBQVQsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW9CLFNBQUEsR0FBUSxJQUFDLENBQUEsS0FBN0IsQ0FEQSxDQUFBO0FBQUEsSUFHQSxLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FIQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsS0FBRCxHQUFhLElBQUEsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQU5iLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFdBQVYsRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUN0QixRQUFBLEtBQUMsQ0FBQSxLQUFELEVBQUEsQ0FBQTtBQUFBLFFBQ0EsS0FBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW9CLFNBQUEsR0FBUSxLQUFDLENBQUEsS0FBN0IsQ0FEQSxDQUFBO0FBR0EsUUFBQSxJQUFHLEtBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBWjtpQkFDQyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFBaUIsS0FBQyxDQUFBLEtBQUssQ0FBQyxZQUF4QixFQUREO1NBQUEsTUFBQTtpQkFHQyxLQUFDLENBQUEsS0FBRCxHQUFTLFlBSFY7U0FKc0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixDQVBBLENBQUE7V0FnQkEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQ2xCLEtBQUMsQ0FBQSxLQUFELEdBQVMsT0FEUztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLEVBakJVO0VBQUEsQ0ExRFgsQ0FBQTs7QUFBQSxpQkE4RUEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFELEtBQVUsTUFBYjtBQUNDLE1BQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLEtBQW5CLENBQUEsQ0FERDtLQUFBO0FBR0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFELEtBQVUsTUFBYjtBQUNDLE1BQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsS0FBZCxDQUFBLENBREQ7S0FIQTtBQU1BLElBQUEsSUFBRyxJQUFDLENBQUEsS0FBRCxLQUFVLFdBQWI7QUFDQyxNQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLEtBQWQsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUF1QixLQUF2QixFQUZEO0tBUE87RUFBQSxDQTlFUixDQUFBOztBQUFBLGlCQTBGQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsR0FBc0IsS0FBdEIsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFDLENBQUEsS0FBRCxLQUFVLE1BQWI7QUFDQyxNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFDLENBQUEsVUFBVSxDQUFDLEtBQTdCLEVBQW9DLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBaEQsRUFBd0QsSUFBQyxDQUFBLFlBQXpELEVBQXVFLElBQXZFLENBQUEsQ0FERDtLQURBO0FBSUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFELEtBQVUsTUFBYjtBQUNDLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBeEIsRUFBK0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUF0QyxFQUE4QyxJQUFDLENBQUEsWUFBL0MsRUFBNkQsSUFBN0QsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUE3QixFQUFvQyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTNDLEVBQW1ELElBQUMsQ0FBQSxZQUFwRCxFQUFrRSxLQUFsRSxDQURBLENBREQ7S0FKQTtBQVFBLElBQUEsSUFBRyxJQUFDLENBQUEsS0FBRCxLQUFVLFdBQWI7QUFDQyxNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLEtBQXhCLEVBQStCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBdEMsRUFBOEMsSUFBQyxDQUFBLFlBQS9DLEVBQTZELElBQTdELENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxjQUFjLENBQUMsS0FBakMsRUFBd0MsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUF4RCxFQUFnRSxJQUFDLENBQUEsWUFBakUsRUFBK0UsS0FBL0UsQ0FEQSxDQUREO0tBUkE7V0FZQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLFlBQVksQ0FBQyxLQUEvQixFQUFzQyxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQXBELEVBYk87RUFBQSxDQTFGUixDQUFBOztBQUFBLGlCQTBHQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBRVIsUUFBQSxLQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFQLENBQUEsQ0FBUixDQUFBO0FBQ0EsSUFBQSxJQUFJLEtBQUEsR0FBUSxFQUFaO0FBQ0MsTUFBQSxJQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUREO0tBREE7QUFBQSxJQUtBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FMQSxDQUFBO0FBQUEsSUFXQSxxQkFBQSxDQUFzQixJQUFDLENBQUEsT0FBdkIsQ0FYQSxDQUZRO0VBQUEsQ0ExR1QsQ0FBQTs7Y0FBQTs7R0FEa0IsS0FYbkIsQ0FBQTs7QUFBQSxPQXVJTyxDQUFDLElBQVIsR0FBZSxJQXZJZixDQUFBOzs7O0FDQUEsSUFBQSxnQkFBQTtFQUFBOztpU0FBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBUCxDQUFBOztBQUFBO0FBR0MsK0JBQUEsQ0FBQTs7QUFBYSxFQUFBLG9CQUFBLEdBQUE7QUFDWiwyQ0FBQSxDQUFBO0FBQUEsSUFBQSwwQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFGVixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsUUFBRCxHQUFZLEVBSFosQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FKWixDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsSUFBRCxHQUFRLEtBTFIsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQU5WLENBRFk7RUFBQSxDQUFiOztBQUFBLHVCQVNBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLFFBQUEsNEJBQUE7QUFBQTtTQUFTLCtEQUFULEdBQUE7QUFDQyxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBbEIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxLQUFLLENBQUMsSUFBVDtBQUNDLFFBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTtBQUNBLGlCQUZEO09BREE7QUFJQSxNQUFBLElBQUcsS0FBSyxDQUFDLE1BQVQ7c0JBQ0MsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFiLEdBREQ7T0FBQSxNQUFBOzhCQUFBO09BTEQ7QUFBQTtvQkFETztFQUFBLENBVFIsQ0FBQTs7QUFBQSx1QkFrQkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtXQUNULElBQUMsQ0FBQSxNQUFELEdBQVUsS0FERDtFQUFBLENBbEJWLENBQUE7O0FBQUEsdUJBc0JBLEdBQUEsR0FBSyxTQUFDLFVBQUQsR0FBQTtBQUNKLElBQUEsVUFBVSxDQUFDLE1BQVgsR0FBb0IsSUFBcEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsVUFBZixDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLFVBQVUsQ0FBQyxJQUFyQixDQUZBLENBQUE7QUFHQSxXQUFPLFVBQVAsQ0FKSTtFQUFBLENBdEJMLENBQUE7O0FBQUEsdUJBNEJBLE1BQUEsR0FBUSxTQUFDLFVBQUQsR0FBQTtBQUNQLFFBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQWEsVUFBVSxDQUFDLElBQXhCLENBQUEsQ0FBQTtBQUFBLElBQ0EsVUFBVSxDQUFDLE1BQVgsR0FBb0IsSUFEcEIsQ0FBQTtBQUFBLElBRUEsQ0FBQSxHQUFLLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixVQUFsQixDQUZMLENBQUE7QUFHQSxJQUFBLElBQUcsQ0FBQSxJQUFLLENBQVI7QUFDQyxNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixDQUFqQixFQUFvQixDQUFwQixDQUFBLENBREQ7S0FIQTtBQUtBLFdBQU8sVUFBUCxDQU5PO0VBQUEsQ0E1QlIsQ0FBQTs7QUFBQSx1QkFvQ0EsR0FBQSxHQUFLLFNBQUEsR0FBQTtBQUNKLElBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFSLENBQUE7V0FDQSxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQVQsRUFGSTtFQUFBLENBcENMLENBQUE7O29CQUFBOztHQUR3QixLQUZ6QixDQUFBOztBQUFBLE1BMkNNLENBQUMsT0FBUCxHQUFpQixVQTNDakIsQ0FBQTs7OztBQ0FBLElBQUEsWUFBQTs7QUFBQTtBQUNDLGtCQUFBLE1BQUEsR0FDQztBQUFBLElBQUEsSUFBQSxFQUFLLElBQUw7QUFBQSxJQUNBLElBQUEsRUFBSyxJQURMO0FBQUEsSUFFQSxJQUFBLEVBQUssTUFGTDtBQUFBLElBR0EsSUFBQSxFQUFLLE1BSEw7QUFBQSxJQUlBLElBQUEsRUFBSyxNQUpMO0FBQUEsSUFLQSxJQUFBLEVBQUssTUFMTDtBQUFBLElBTUEsSUFBQSxFQUFLLE9BTkw7QUFBQSxJQU9BLElBQUEsRUFBSyxPQVBMO0FBQUEsSUFRQSxJQUFBLEVBQUssY0FSTDtHQURELENBQUE7O0FBV2EsRUFBQSxlQUFBLEdBQUE7QUFDWixRQUFBLGdCQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBQWIsQ0FBQTtBQUVBO0FBQUEsU0FBQSxXQUFBO3dCQUFBO0FBQ0MsTUFBQSxJQUFDLENBQUEsU0FBVSxDQUFBLEtBQUEsQ0FBWCxHQUFvQixLQUFwQixDQUREO0FBQUEsS0FGQTtBQUFBLElBS0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxHQUFBO0FBRWpCLFFBQUEsSUFBRyxLQUFDLENBQUEsTUFBTyxDQUFBLENBQUMsQ0FBQyxLQUFGLENBQVg7QUFDQyxVQUFBLEtBQUMsQ0FBQSxTQUFVLENBQUEsS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFDLENBQUMsS0FBRixDQUFSLENBQVgsR0FBK0IsSUFBL0IsQ0FERDtTQUFBO2VBRUEsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxFQUppQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLENBTEEsQ0FBQTtBQUFBLElBV0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEtBQVYsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQ2YsUUFBQSxJQUFHLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBWDtBQUNDLFVBQUEsS0FBQyxDQUFBLFNBQVUsQ0FBQSxLQUFDLENBQUEsTUFBTyxDQUFBLENBQUMsQ0FBQyxLQUFGLENBQVIsQ0FBWCxHQUErQixLQUEvQixDQUREO1NBQUE7ZUFFQSxDQUFDLENBQUMsZUFBRixDQUFBLEVBSGU7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQixDQVhBLENBRFk7RUFBQSxDQVhiOztlQUFBOztJQURELENBQUE7O0FBQUEsS0E2QkEsR0FBWSxJQUFBLEtBQUEsQ0FBQSxDQTdCWixDQUFBOztBQUFBLE1BOEJNLENBQUMsT0FBUCxHQUFpQixLQTlCakIsQ0FBQTs7OztBQ0FBLElBQUEsa0RBQUE7RUFBQTs7aVNBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxnQkFBUixDQUFQLENBQUE7O0FBQUEsS0FDQSxHQUFRLE9BQUEsQ0FBUSxnQkFBUixDQURSLENBQUE7O0FBQUEsTUFFQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQUZULENBQUE7O0FBQUEsVUFHQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQUhiLENBQUE7O0FBQUEsVUFJQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQUpiLENBQUE7O0FBQUE7QUFPQywwQkFBQSxDQUFBOztBQUFhLEVBQUEsZUFBQSxHQUFBO0FBQ1osdURBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSxJQUFBLHFDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUZiLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxLQUFLLENBQUMsS0FBTixDQUFBLENBTGIsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsSUFBQyxDQUFBLElBQVosQ0FOQSxDQUFBO0FBQUEsSUFTQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQXdCLEVBQXhCLEVBQTRCLEdBQUEsR0FBTSxHQUFsQyxFQUF1QyxDQUF2QyxFQUEwQyxLQUExQyxDQVRkLENBQUE7QUFBQSxJQVVBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWpCLEdBQXFCLElBQUksQ0FBQyxZQUFMLENBQUEsQ0FBQSxHQUFzQixDQVYzQyxDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxJQUFDLENBQUEsTUFBWixDQVhBLENBQUE7QUFBQSxJQWNBLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsUUFBbkIsQ0FkcEIsQ0FBQTtBQUFBLElBZUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFlBQVgsQ0FmQSxDQUFBO0FBQUEsSUFtQkEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQW5CQSxDQUFBO0FBQUEsSUF1QkEsS0FBSyxDQUFDLElBQU4sQ0FBVyxxQkFBWCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLElBQUMsQ0FBQSxRQUF4QyxDQUFpRCxDQUFDLE9BQUQsQ0FBakQsQ0FBd0QsU0FBQyxLQUFELEdBQUE7YUFDdEQsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLEVBRHNEO0lBQUEsQ0FBeEQsQ0F2QkEsQ0FEWTtFQUFBLENBQWI7O0FBQUEsa0JBMkJBLFFBQUEsR0FBVSxTQUFDLEdBQUQsR0FBQTtBQUNULFFBQUEsc0JBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQWhDLENBQUEsQ0FBQTtBQUFBLElBQ0EsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFwQyxHQUF3QyxHQUFBLEdBQU0sQ0FEOUMsQ0FBQTtBQUFBLElBRUEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFwQyxHQUF5QyxJQUFJLENBQUMsWUFBTCxDQUFBLENBQUEsR0FBc0IsQ0FBQSxDQUYvRCxDQUFBO0FBQUEsSUFHQSxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQWpDLENBQXFDLENBQXJDLEVBQXdDLENBQXhDLEVBQTJDLENBQTNDLENBSEEsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBL0IsQ0FMQSxDQUFBO0FBQUEsSUFNQSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQW5DLEdBQXVDLEdBTnZDLENBQUE7QUFRQTtBQUFBLFNBQUEsMkNBQUE7d0JBQUE7QUFDQyxNQUFBLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxDQUFBLENBREQ7QUFBQSxLQVJBO1dBV0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFULEVBWlM7RUFBQSxDQTNCVixDQUFBOztBQUFBLGtCQXlDQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ2IsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsTUFBQSxDQUFBLENBQWYsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFDLENBQUEsT0FBTixDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUF2QixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXBDLENBRkEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQXZCLEdBQTJCLENBSDNCLENBQUE7V0FLQSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxLQUFaLEVBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFDbEIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxXQUFULEVBRGtCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsRUFOYTtFQUFBLENBekNkLENBQUE7O0FBQUEsa0JBa0RBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLFFBQUEscUJBQUE7QUFBQSxJQUFBLGtDQUFNLEtBQU4sQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFqQixJQUFzQixDQUFBLEdBQUksS0FEMUIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQXZCLElBQTRCLENBQUEsR0FBSSxLQUZoQyxDQUFBO0FBSUE7QUFBQSxTQUFBLDJDQUFBO3VCQUFBO0FBQ0MsTUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLEtBQWhCLElBQTBCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQXBCLEdBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWpCLEdBQXFCLEVBQTFFO0FBQ0MsUUFBQSxLQUFLLENBQUMsUUFBTixDQUFBLENBQUEsQ0FERDtPQUREO0FBQUEsS0FKQTtXQVFBLFVBQVUsQ0FBQyxpQkFBWCxDQUE2QixJQUFDLENBQUEsU0FBOUIsRUFUTztFQUFBLENBbERSLENBQUE7O0FBQUEsa0JBZ0VBLEdBQUEsR0FBSyxTQUFDLFVBQUQsR0FBQTtBQUNKLElBQUEsSUFBRyxVQUFBLFlBQXNCLFVBQVUsQ0FBQyxlQUFwQztBQUNDLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLFVBQWhCLENBQUEsQ0FERDtLQUFBO0FBRUEsV0FBTywrQkFBTSxVQUFOLENBQVAsQ0FISTtFQUFBLENBaEVMLENBQUE7O0FBQUEsa0JBcUVBLE1BQUEsR0FBUSxTQUFDLFVBQUQsR0FBQTtBQUNQLFFBQUEsQ0FBQTtBQUFBLElBQUEsQ0FBQSxHQUFLLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixVQUFuQixDQUFMLENBQUE7QUFDQSxJQUFBLElBQUcsQ0FBQSxJQUFLLENBQVI7QUFDQyxNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixDQUFsQixFQUFxQixDQUFyQixDQUFBLENBREQ7S0FEQTtBQUdBLFdBQU8sa0NBQU0sVUFBTixDQUFQLENBSk87RUFBQSxDQXJFUixDQUFBOztlQUFBOztHQURtQixXQU5wQixDQUFBOztBQUFBLE9BdUZPLENBQUMsS0FBUixHQUFnQixLQXZGaEIsQ0FBQTs7OztBQ0FBLElBQUEsd0JBQUE7RUFBQTs7O29CQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUE7QUFHQywwQkFBQSxDQUFBOztBQUFhLEVBQUEsZUFBRSxRQUFGLEVBQWEsUUFBYixHQUFBO0FBQ1osSUFEYSxJQUFDLENBQUEsV0FBQSxRQUNkLENBQUE7QUFBQSxJQUR3QixJQUFDLENBQUEsV0FBQSxRQUN6QixDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLHVDQUFBLENBQUE7QUFBQSxJQUFBLHFDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxNQURaLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksTUFGWixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLE1BSFgsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUpWLENBRFk7RUFBQSxDQUFiOztBQUFBLGtCQU9BLElBQUEsR0FBTSxTQUFDLFFBQUQsR0FBQTtBQUNMLFFBQUEsVUFBQTtBQUFBLElBQUEsVUFBQSxHQUFpQixJQUFBLEtBQUssQ0FBQyxVQUFOLENBQUEsQ0FBakIsQ0FBQTtXQUNBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFFBQWhCLEVBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDekIsWUFBQSwyQkFBQTtBQUFBLFFBRDBCLHlCQUFVLDBCQUFXLGdFQUMvQyxDQUFBO0FBQUEsUUFBQSxLQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUssQ0FBQyxnQkFBTixDQUF3QixTQUF4QixDQUFoQixDQUFBO0FBQUEsUUFFQSxLQUFDLENBQUEsUUFBRCxHQUFZLFFBRlosQ0FBQTtBQUFBLFFBR0EsS0FBQyxDQUFBLE1BQUQsR0FBVSxPQUhWLENBQUE7ZUFJQSxLQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsRUFBb0IsS0FBcEIsRUFMeUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixFQUZLO0VBQUEsQ0FQTixDQUFBOztBQUFBLGtCQWdCQSxPQUFBLEdBQVMsU0FBQyxRQUFELEdBQUE7V0FDUixJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsUUFBN0IsRUFBdUMsRUFBdkMsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNyRCxRQUFBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBR2Y7QUFBQSxVQUFBLEdBQUEsRUFBSyxLQUFDLENBQUEsT0FBTjtTQUhlLENBQWhCLENBQUE7QUFBQSxRQUtBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsQ0FBcEIsRUFBdUIsQ0FBdkIsQ0FMaEIsQ0FBQTtBQUFBLFFBTUEsS0FBQyxDQUFBLE1BQUQsR0FBVSxPQU5WLENBQUE7ZUFRQSxLQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsRUFBb0IsS0FBcEIsRUFUcUQ7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxFQURIO0VBQUEsQ0FoQlQsQ0FBQTs7ZUFBQTs7R0FEbUIsS0FGcEIsQ0FBQTs7QUFBQTtBQWtDYyxFQUFBLHFCQUFBLEdBQUE7QUFDWixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsQ0FBbkIsRUFBcUIsQ0FBckIsRUFBdUIsQ0FBdkIsQ0FBdkIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDdEI7QUFBQSxNQUFBLEtBQUEsRUFBTyxRQUFQO0FBQUEsTUFDQSxTQUFBLEVBQVcsSUFEWDtBQUFBLE1BRUEsR0FBQSxFQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsdUJBQTdCLENBRkw7S0FEc0IsQ0FEdkIsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsRUFOaEIsQ0FEWTtFQUFBLENBQWI7O0FBQUEsd0JBU0EsSUFBQSxHQUFNLFNBQUMsUUFBRCxHQUFBO0FBR0wsUUFBQSxhQUFBO0FBQUEsSUFBQSxJQUFHLHFDQUFBLElBQTRCLElBQUMsQ0FBQSxZQUFhLENBQUEsUUFBQSxDQUFTLENBQUMsTUFBeEIsS0FBa0MsT0FBakU7QUFFQyxhQUFXLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsWUFBYSxDQUFBLFFBQUEsQ0FBUyxDQUFDLFFBQW5DLEVBQTZDLElBQUMsQ0FBQSxZQUFhLENBQUEsUUFBQSxDQUFTLENBQUMsUUFBckUsQ0FBWCxDQUZEO0tBQUE7QUFNQSxJQUFBLElBQUcsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQWpCO0FBQ0MsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQXRCLENBREQ7S0FBQSxNQUFBO0FBS0MsTUFBQSxLQUFBLEdBQVksSUFBQSxLQUFBLENBQUEsQ0FBWixDQUFBO0FBQ0EsTUFBQSxJQUFHLFFBQVEsQ0FBQyxLQUFULENBQWUsR0FBZixDQUFtQixDQUFDLEdBQXBCLENBQUEsQ0FBQSxLQUE2QixJQUFoQztBQUNDLFFBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLENBQUEsQ0FERDtPQUFBLE1BQUE7QUFHQyxRQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBZCxDQUFBLENBSEQ7T0FEQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQWQsR0FBMEIsS0FMMUIsQ0FMRDtLQU5BO0FBQUEsSUFrQkEsTUFBQSxHQUFhLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBWSxJQUFDLENBQUEsZUFBYixFQUE4QixJQUFDLENBQUEsZUFBL0IsQ0FsQmIsQ0FBQTtBQUFBLElBbUJBLEtBQUssQ0FBQyxFQUFOLENBQVMsU0FBVCxFQUFvQixTQUFDLENBQUQsR0FBQTtBQUNuQixNQUFBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLENBQUMsQ0FBQyxRQUFwQixDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsUUFBUCxHQUFrQixDQUFDLENBQUMsUUFEcEIsQ0FBQTthQUVBLENBQUMsQ0FBQyxHQUFGLENBQU0sU0FBTixFQUFpQixTQUFTLENBQUMsTUFBM0IsRUFIbUI7SUFBQSxDQUFwQixDQW5CQSxDQUFBO0FBdUJBLFdBQU8sTUFBUCxDQTFCSztFQUFBLENBVE4sQ0FBQTs7cUJBQUE7O0lBbENELENBQUE7O0FBQUEsTUF1RU0sQ0FBQyxPQUFQLEdBQWlCLFdBdkVqQixDQUFBOzs7O0FDQUEsSUFBQSwwQkFBQTtFQUFBO2lTQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FBYixDQUFBOztBQUFBLElBQ0EsR0FBTyxPQUFBLENBQVEsZ0JBQVIsQ0FEUCxDQUFBOztBQUFBO0FBSUMsTUFBQSxtREFBQTs7QUFBQSw2QkFBQSxDQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLGdDQUE3QixDQUFsQixDQUFBOztBQUFBLEVBQ0EsZ0JBQUEsR0FBdUIsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDckI7QUFBQSxJQUFBLEdBQUEsRUFBSyxlQUFMO0FBQUEsSUFDQSxPQUFBLEVBQVMsS0FBSyxDQUFDLFNBRGY7QUFBQSxJQUVBLFVBQUEsRUFBWSxLQUZaO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtBQUFBLElBSUEsUUFBQSxFQUFVLEtBQUssQ0FBQyxnQkFKaEI7R0FEcUIsQ0FEdkIsQ0FBQTs7QUFBQSxFQVFBLGdCQUFBLEdBQXVCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FSdkIsQ0FBQTs7QUFVYSxFQUFBLGtCQUFDLFFBQUQsRUFBVyxNQUFYLEdBQUE7QUFDWixJQUFBLHdDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFBLENBRlQsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxnQkFBWCxFQUE2QixnQkFBN0IsQ0FBZCxDQUpBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQUEsQ0FBWixFQUFnQixDQUFoQixDQUFkLEVBQWtDLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQSxDQUFaLEVBQWdCLENBQWhCLENBQWxDLEVBQXNELElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQSxDQUFaLEVBQWdCLENBQWhCLENBQXRELENBTmhCLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQXFCLENBQUMsY0FBdEIsQ0FBcUMsTUFBckMsQ0FQQSxDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBUkEsQ0FEWTtFQUFBLENBVmI7O0FBQUEscUJBcUJBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLFFBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxjQUFWLENBQXlCLEdBQXpCLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixJQUFDLENBQUEsUUFBUSxDQUFDLENBQVYsR0FBYyxLQURsQyxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBVixHQUFjLEtBRmxDLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsS0FIbEMsQ0FBQTtBQUFBLElBSUEsQ0FBQSxHQUFJLENBQUEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLEtBQWYsQ0FBQSxHQUF3QixJQUFDLENBQUEsVUFBMUIsQ0FBSCxHQUEyQyxHQUovQyxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFaLENBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLENBTEEsQ0FBQTtBQU1BLElBQUEsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxVQUExQjthQUNDLElBQUMsQ0FBQSxHQUFELENBQUEsRUFERDtLQVBPO0VBQUEsQ0FyQlIsQ0FBQTs7a0JBQUE7O0dBRHNCLFdBSHZCLENBQUE7O0FBQUEsTUFtQ00sQ0FBQyxPQUFQLEdBQWlCLFFBbkNqQixDQUFBOzs7O0FDQUEsSUFBQSwwRkFBQTtFQUFBOztpU0FBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGdCQUFSLENBQVAsQ0FBQTs7QUFBQSxLQUVBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBRlIsQ0FBQTs7QUFBQSxVQUdBLEdBQWEsT0FBQSxDQUFRLHFCQUFSLENBSGIsQ0FBQTs7QUFBQSxXQUlBLEdBQWMsT0FBQSxDQUFRLHNCQUFSLENBSmQsQ0FBQTs7QUFBQSxLQUtBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBTFIsQ0FBQTs7QUFBQSxPQU1BLEdBQVUsT0FBQSxDQUFRLGtCQUFSLENBTlYsQ0FBQTs7QUFBQSxRQU9BLEdBQVcsT0FBQSxDQUFRLG1CQUFSLENBUFgsQ0FBQTs7QUFBQSxLQVFBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBUlIsQ0FBQTs7QUFBQSxXQVVBLEdBQWtCLElBQUEsV0FBQSxDQUFBLENBVmxCLENBQUE7O0FBQUE7QUFlQywyQkFBQSxDQUFBOztBQUFhLEVBQUEsZ0JBQUEsR0FBQTtBQUNaLDJDQUFBLENBQUE7QUFBQSxRQUFBLEtBQUE7QUFBQSxJQUFBLHNDQUFBLENBQUEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsUUFIaEIsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLGNBQXZCLENBSkEsQ0FBQTtBQUFBLElBTUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxJQUFaLENBQWlCLHVCQUFqQixDQU5SLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLEtBQVYsQ0FQQSxDQUFBO0FBQUEsSUFRQSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFBaUIsU0FBQSxHQUFBO2FBQ2hCLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBVSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQTVCLEdBQXdDLEtBRHhCO0lBQUEsQ0FBakIsQ0FSQSxDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FYWixDQUFBO0FBQUEsSUFZQSxJQUFDLENBQUEsRUFBRCxHQUFNLENBWk4sQ0FEWTtFQUFBLENBQWI7O0FBQUEsbUJBZ0JBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLElBQUEsSUFBRyxLQUFLLENBQUMsU0FBVSxDQUFBLElBQUEsQ0FBbkI7QUFDQyxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsRUFBQSxHQUFLLEtBQXpCLENBREQ7S0FBQTtBQUVBLElBQUEsSUFBRyxLQUFLLENBQUMsU0FBVSxDQUFBLE1BQUEsQ0FBbkI7QUFDQyxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsRUFBQSxHQUFLLEtBQXpCLENBREQ7S0FGQTtBQUlBLElBQUEsSUFBRyxLQUFLLENBQUMsU0FBVSxDQUFBLE1BQUEsQ0FBbkI7QUFDQyxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsRUFBQSxHQUFLLEtBQXpCLENBREQ7S0FKQTtBQU1BLElBQUEsSUFBRyxLQUFLLENBQUMsU0FBVSxDQUFBLE9BQUEsQ0FBbkI7QUFDQyxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsRUFBQSxHQUFLLEtBQXpCLENBREQ7S0FOQTtBQVFBLElBQUEsSUFBRyxLQUFLLENBQUMsU0FBVSxDQUFBLGNBQUEsQ0FBbkI7YUFDQyxJQUFDLENBQUEsWUFBRCxDQUFBLEVBREQ7S0FUTztFQUFBLENBaEJSLENBQUE7O0FBQUEsbUJBNEJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDYixRQUFBLE1BQUE7QUFBQSxJQUFBLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLFFBQUQsR0FBWSxHQUFBLEdBQU0sQ0FBbEM7QUFDQyxNQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQURaLENBQUE7QUFBQSxNQUdBLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFyQixDQUhiLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosQ0FKQSxDQUFBO0FBQUEsTUFNQSxNQUFBLEdBQWEsSUFBQSxPQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBckIsQ0FOYixDQUFBO0FBQUEsTUFPQSxNQUFNLENBQUMsS0FBUCxHQUFlLENBQUEsR0FQZixDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBUkEsQ0FBQTtBQUFBLE1BVUEsTUFBQSxHQUFhLElBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQXJCLENBVmIsQ0FBQTtBQUFBLE1BV0EsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQUFBLEdBWGYsQ0FBQTthQVlBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosRUFiRDtLQURhO0VBQUEsQ0E1QmQsQ0FBQTs7QUFBQSxtQkE2Q0EsR0FBQSxHQUFLLFNBQUEsR0FBQTtBQUdKLFFBQUEsS0FBQTtBQUFBLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxXQUFYLENBQUEsQ0FBQTtBQUNBLFNBQVMsK0JBQVQsR0FBQTtBQUNDLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWdCLElBQUEsUUFBQSxDQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBZixFQUF5QixDQUF6QixDQUFoQixDQUFBLENBREQ7QUFBQSxLQURBO1dBY0EsOEJBQUEsRUFqQkk7RUFBQSxDQTdDTCxDQUFBOztnQkFBQTs7R0FGb0IsVUFBVSxDQUFDLGdCQWJoQyxDQUFBOztBQUFBLE1BaUZNLENBQUMsT0FBUCxHQUFpQixNQWpGakIsQ0FBQTs7OztBQ0FBLE9BQWEsQ0FBQztBQUNBLEVBQUEsc0JBQUEsR0FBQTtBQUNaLElBQUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBYixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsS0FBSyxDQUFDLGtCQUFOLENBQXlCLENBQUEsRUFBekIsRUFBOEIsRUFBOUIsRUFBa0MsQ0FBQSxFQUFsQyxFQUF3QyxFQUF4QyxFQUE0QyxDQUE1QyxFQUErQyxDQUEvQyxDQURkLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWpCLEdBQXFCLENBRnJCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLElBQUMsQ0FBQSxNQUFaLENBSEEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxLQUFLLENBQUMsY0FBTixDQUN0QjtBQUFBLE1BQUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxVQUFaO0FBQUEsTUFDQSxXQUFBLEVBQWEsS0FEYjtBQUFBLE1BRUEsUUFBQSxFQUNDO0FBQUEsUUFBQSxVQUFBLEVBQVk7QUFBQSxVQUFFLElBQUEsRUFBTSxHQUFSO0FBQUEsVUFBYSxLQUFBLEVBQU8sTUFBcEI7U0FBWjtPQUhEO0FBQUEsTUFLQSxZQUFBLEVBQ0MsK0hBTkQ7QUFBQSxNQWVBLGNBQUEsRUFDQyx1cEJBaEJEO0tBRHNCLENBTnZCLENBQUE7QUFBQSxJQXFEQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBZ0IsSUFBQSxLQUFLLENBQUMsYUFBTixDQUFxQixDQUFyQixFQUF3QixDQUF4QixDQUFoQixFQUE2QyxJQUFDLENBQUEsZUFBOUMsQ0FyRFosQ0FBQTtBQUFBLElBc0RBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsR0FBbUIsSUFBSSxDQUFDLEVBdER4QixDQUFBO0FBQUEsSUF1REEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsSUFBQyxDQUFBLElBQVosQ0F2REEsQ0FEWTtFQUFBLENBQWI7O3NCQUFBOztJQURELENBQUE7Ozs7QUNDQSxJQUFBLGNBQUE7O0FBQUEsS0FBQSxHQUFRLENBQVIsQ0FBQTs7QUFBQSxPQUNPLENBQUMsY0FBUixHQUF5QixNQUR6QixDQUFBOztBQUFBLE9BR08sQ0FBQyxHQUFSLEdBQWMsU0FBQyxNQUFELEdBQUE7QUFDYixFQUFBLEtBQUEsR0FBUSxNQUFSLENBQUE7U0FDQSxPQUFBLENBQUEsRUFGYTtBQUFBLENBSGQsQ0FBQTs7QUFBQSxPQU9PLENBQUMsR0FBUixHQUFjLFNBQUMsTUFBRCxHQUFBO0FBQ2IsRUFBQSxLQUFBLElBQVMsTUFBVCxDQUFBO1NBQ0EsT0FBQSxDQUFBLEVBRmE7QUFBQSxDQVBkLENBQUE7O0FBQUEsT0FZQSxHQUFVLFNBQUEsR0FBQTtBQUNULEVBQUEsSUFBRyw4QkFBSDtXQUNDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBdkIsQ0FBNkIsU0FBQSxHQUFRLEtBQXJDLEVBREQ7R0FEUztBQUFBLENBWlYsQ0FBQTs7QUFBQSxPQWdCTyxDQUFDLEdBQVIsR0FBYyxTQUFBLEdBQUE7QUFDYixTQUFPLEtBQVAsQ0FEYTtBQUFBLENBaEJkLENBQUE7Ozs7QUNEQSxJQUFBLDRDQUFBO0VBQUE7aVNBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxnQkFBUixDQUFQLENBQUE7O0FBQUEsVUFDQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQURiLENBQUE7O0FBQUE7QUFJQyxNQUFBLDJCQUFBOztBQUFBLCtCQUFBLENBQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFqQixDQUE2QiwwQkFBN0IsQ0FBVixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFlLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQ2I7QUFBQSxJQUFBLEdBQUEsRUFBSyxPQUFMO0FBQUEsSUFDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFVBRFo7QUFBQSxJQUVBLE9BQUEsRUFBUyxLQUFLLENBQUMsU0FGZjtBQUFBLElBR0EsV0FBQSxFQUFhLElBSGI7R0FEYSxDQURmLENBQUE7O0FBQUEsRUFPQSxRQUFBLEdBQWUsSUFBQSxLQUFLLENBQUMsYUFBTixDQUFxQixFQUFyQixFQUF5QixFQUF6QixDQVBmLENBQUE7O0FBU2EsRUFBQSxvQkFBQSxHQUFBO0FBQ1osUUFBQSxNQUFBO0FBQUEsSUFBQSwwQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxLQUFLLENBQUMsS0FBTixDQUFBLENBRmIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsSUFBQyxDQUFBLElBQVosQ0FIQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQXdCLEVBQXhCLEVBQTRCLEdBQUEsR0FBTSxHQUFsQyxFQUF1QyxDQUF2QyxFQUEwQyxLQUExQyxDQUxkLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWpCLEdBQXFCLElBQUksQ0FBQyxZQUFMLENBQUEsQ0FBQSxHQUFzQixDQU4zQyxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxJQUFDLENBQUEsTUFBWixDQVBBLENBQUE7QUFBQSxJQVNBLE1BQUEsR0FBYSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxFQUFxQixRQUFyQixDQVRiLENBQUE7QUFBQSxJQVVBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBYixDQUFpQixHQUFqQixFQUFzQixHQUF0QixFQUEyQixHQUEzQixDQVZBLENBQUE7QUFBQSxJQVdBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBaEIsR0FBcUIsSUFBSSxDQUFDLFlBQUwsQ0FBQSxDQUFBLEdBQXNCLEdBWDNDLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FaQSxDQURZO0VBQUEsQ0FUYjs7b0JBQUE7O0dBRHdCLFdBSHpCLENBQUE7O0FBQUEsT0E2Qk8sQ0FBQyxVQUFSLEdBQXFCLFVBN0JyQixDQUFBOztBQUFBO0FBZ0NDLE1BQUEsMkJBQUE7O0FBQUEsbUNBQUEsQ0FBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLDhCQUE3QixDQUFWLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQWUsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDYjtBQUFBLElBQUEsR0FBQSxFQUFLLE9BQUw7QUFBQSxJQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsVUFEWjtBQUFBLElBRUEsT0FBQSxFQUFTLEtBQUssQ0FBQyxTQUZmO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtHQURhLENBRGYsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsR0FBZSxJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLEVBQXJCLEVBQXlCLEVBQXpCLENBUGYsQ0FBQTs7QUFRYSxFQUFBLHdCQUFBLEdBQUE7QUFDWixJQUFBLDhDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FGYixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxJQUFDLENBQUEsSUFBWixDQUhBLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FBd0IsRUFBeEIsRUFBNEIsR0FBQSxHQUFNLEdBQWxDLEVBQXVDLENBQXZDLEVBQTBDLEtBQTFDLENBTGQsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBakIsR0FBcUIsSUFBSSxDQUFDLFlBQUwsQ0FBQSxDQUFBLEdBQXNCLENBTjNDLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLElBQUMsQ0FBQSxNQUFaLENBUEEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQWMsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsRUFBcUIsUUFBckIsQ0FBZCxDQVRBLENBRFk7RUFBQSxDQVJiOzt3QkFBQTs7R0FENEIsV0EvQjdCLENBQUE7O0FBQUEsT0FvRE8sQ0FBQyxjQUFSLEdBQXlCLGNBcER6QixDQUFBOzs7O0FDQUEsSUFBQSw0REFBQTs7QUFBQSxNQUFNLENBQUMsWUFBUCxHQUFzQixNQUFNLENBQUMsWUFBUCxJQUFxQixNQUFNLENBQUMsa0JBQWxELENBQUE7O0FBQUEsWUFDQSxHQUFtQixJQUFBLFlBQUEsQ0FBQSxDQURuQixDQUFBOztBQUFBO0FBSWMsRUFBQSxlQUFFLElBQUYsRUFBUyxHQUFULEVBQWUsTUFBZixHQUFBO0FBQXVCLElBQXRCLElBQUMsQ0FBQSxPQUFBLElBQXFCLENBQUE7QUFBQSxJQUFmLElBQUMsQ0FBQSxNQUFBLEdBQWMsQ0FBQTtBQUFBLElBQVQsSUFBQyxDQUFBLFNBQUEsTUFBUSxDQUF2QjtFQUFBLENBQWI7O2VBQUE7O0lBSkQsQ0FBQTs7QUFBQSxPQUtPLENBQUMsS0FBUixHQUFnQixLQUxoQixDQUFBOztBQUFBLE9BT08sQ0FBQyxZQUFSLEdBQXVCLFlBQUEsR0FBZSxFQVB0QyxDQUFBOztBQUFBLE9BVU8sQ0FBQyxJQUFSLEdBQWUsSUFBQSxHQUFPLFNBQUMsSUFBRCxFQUFPLEdBQVAsR0FBQTtBQUNyQixTQUFXLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDbEIsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQWMsSUFBQSxjQUFBLENBQUEsQ0FBZCxDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLEtBQWIsRUFBb0IsR0FBcEIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxPQUFPLENBQUMsWUFBUixHQUF1QixhQUZ2QixDQUFBO0FBQUEsTUFHQSxPQUFPLENBQUMsTUFBUixHQUFpQixTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxHQUFBO0FBQ2hCLFFBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixLQUFrQixHQUFyQjtpQkFDQyxZQUFZLENBQUMsZUFBYixDQUE2QixPQUFPLENBQUMsUUFBckMsRUFDQyxTQUFDLE1BQUQsR0FBQTtBQUVDLGdCQUFBLEtBQUE7QUFBQSxZQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQixNQUFqQixDQUFaLENBQUE7QUFBQSxZQUNBLE9BQU8sQ0FBQyxZQUFhLENBQUEsSUFBQSxDQUFyQixHQUE2QixLQUQ3QixDQUFBO0FBRUEsbUJBQU8sT0FBQSxDQUFRLEtBQVIsQ0FBUCxDQUpEO1VBQUEsQ0FERCxFQU1FLFNBQUMsR0FBRCxHQUFBO21CQUNBLE1BQUEsQ0FBTyxLQUFBLENBQU0sZ0JBQU4sQ0FBUCxFQURBO1VBQUEsQ0FORixFQUREO1NBQUEsTUFBQTtBQVVDLFVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBYSxRQUFiLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBQSxDQUFNLGNBQU4sQ0FBUCxFQVhEO1NBRGdCO01BQUEsQ0FIakIsQ0FBQTtBQUFBLE1Ba0JBLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBQUEsR0FBQTtBQUNqQixRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sS0FBQSxDQUFNLGVBQU4sQ0FBUCxFQUZpQjtNQUFBLENBbEJsQixDQUFBO2FBc0JBLE9BQU8sQ0FBQyxJQUFSLENBQUEsRUF2QmtCO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixDQUFYLENBRHFCO0FBQUEsQ0FWdEIsQ0FBQTs7QUFBQSxPQXFDTyxDQUFDLElBQVIsR0FBZSxJQUFBLEdBQU8sU0FBQyxHQUFELEdBQUE7QUFDckIsTUFBQSxjQUFBO0FBQUEsRUFBQSxJQUFHLE1BQUEsQ0FBQSxHQUFBLEtBQWMsUUFBakI7QUFDQyxJQUFBLE1BQUEsR0FBUyxZQUFhLENBQUEsR0FBQSxDQUFJLENBQUMsTUFBM0IsQ0FERDtHQUFBLE1BQUE7QUFHQyxJQUFBLE1BQUEsR0FBUyxHQUFULENBSEQ7R0FBQTtBQUlBLEVBQUEsSUFBRyxjQUFIO0FBQ0MsSUFBQSxNQUFBLEdBQVMsWUFBWSxDQUFDLGtCQUFiLENBQUEsQ0FBVCxDQUFBO0FBQUEsSUFDQSxNQUFNLENBQUMsTUFBUCxHQUFnQixNQURoQixDQUFBO0FBQUEsSUFFQSxNQUFNLENBQUMsT0FBUCxDQUFlLFlBQVksQ0FBQyxXQUE1QixDQUZBLENBQUE7V0FHQSxNQUFNLENBQUMsS0FBUCxDQUFhLENBQWIsRUFKRDtHQUxxQjtBQUFBLENBckN0QixDQUFBOztBQUFBLGFBaURBLEdBQWdCLEVBakRoQixDQUFBOztBQUFBLGFBa0RhLENBQUMsSUFBZCxDQUFtQixJQUFBLENBQUssT0FBTCxFQUFjLHlCQUFkLENBQW5CLENBbERBLENBQUE7O0FBQUEsYUFtRGEsQ0FBQyxJQUFkLENBQW1CLElBQUEsQ0FBSyxXQUFMLEVBQWtCLDZCQUFsQixDQUFuQixDQW5EQSxDQUFBOztBQUFBLE9BcURPLENBQUMsR0FBUixDQUFZLGFBQVosQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLE9BQUQsR0FBQTtTQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksb0JBQVosRUFBa0MsT0FBbEMsRUFESztBQUFBLENBRE4sQ0FHQSxDQUFDLE9BQUQsQ0FIQSxDQUdPLFNBQUMsR0FBRCxHQUFBO1NBQ04sT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBQW9CLEdBQXBCLEVBRE07QUFBQSxDQUhQLENBckRBLENBQUE7Ozs7QUNBQSxJQUFBLDBFQUFBO0VBQUEsa0ZBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUixDQUFWLENBQUE7O0FBQUEsT0FFTyxDQUFDLElBQVIsR0FBZSxJQUFBLEdBQU8sU0FBQyxHQUFELEdBQUE7QUFDckIsU0FBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2xCLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBVixFQUFlLEtBQUMsQ0FBQSxNQUFoQixDQUFSLENBQUE7QUFBQSxNQUVBLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQSxHQUFBO0FBQ1YsWUFBQSxLQUFBO0FBQUEsUUFBQSxLQUFBLEdBQVksSUFBQSxRQUFBLENBQVMsS0FBSyxDQUFDLFlBQWYsQ0FBWixDQUFBO0FBQ0EsZUFBTyxPQUFBLENBQVEsS0FBUixDQUFQLENBRlU7TUFBQSxDQUFYLENBRkEsQ0FBQTthQU1BLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQSxHQUFBO0FBQ1YsZUFBTyxNQUFBLENBQU8sS0FBQSxDQUFNLGNBQU4sQ0FBUCxDQUFQLENBRFU7TUFBQSxDQUFYLEVBUGtCO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixDQUFYLENBRHFCO0FBQUEsQ0FGdEIsQ0FBQTs7QUFBQTtBQWVjLEVBQUEsa0JBQUUsSUFBRixHQUFBO0FBQ1osUUFBQSw2SEFBQTtBQUFBLElBRGEsSUFBQyxDQUFBLE9BQUEsSUFDZCxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxFQUFaLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFEVCxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBRlYsQ0FBQTtBQUtBO0FBQUEsU0FBQSwyQ0FBQTs2QkFBQTtBQUNDLE1BQUEsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFRLFdBQVIsQ0FBZCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxPQUFmLENBREEsQ0FERDtBQUFBLEtBTEE7QUFVQTtBQUFBLFNBQUEsOENBQUE7MEJBQUE7QUFDQyxNQUFBLEVBQUEsR0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQWxCLENBQUE7QUFDQSxXQUFXLDhHQUFYLEdBQUE7QUFDQyxhQUFXLDhHQUFYLEdBQUE7QUFDQyxVQUFBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBSyxPQUFMLEVBQWMsR0FBZCxFQUFtQixHQUFuQixDQUFYLENBQUE7QUFBQSxVQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsRUFBQSxDQUFQLEdBQWEsSUFEYixDQUFBO0FBQUEsVUFFQSxFQUFBLEVBRkEsQ0FERDtBQUFBLFNBREQ7QUFBQSxPQUZEO0FBQUEsS0FWQTtBQW9CQTtBQUFBLFNBQUEsOENBQUE7NEJBQUE7QUFDQyxNQUFBLElBQUcsU0FBUyxDQUFDLElBQVYsS0FBa0IsV0FBckI7QUFDQyxRQUFBLElBQUMsQ0FBQSxNQUFPLENBQUEsU0FBUyxDQUFDLElBQVYsQ0FBUixHQUE4QixJQUFBLFNBQUEsQ0FBVSxJQUFWLEVBQWdCLFNBQWhCLENBQTlCLENBREQ7T0FBQTtBQUVBLE1BQUEsSUFBRyxTQUFTLENBQUMsSUFBVixLQUFrQixhQUFyQjtBQUNDLFFBQUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxTQUFTLENBQUMsSUFBVixDQUFSLEdBQThCLElBQUEsV0FBQSxDQUFZLFNBQVosQ0FBOUIsQ0FERDtPQUhEO0FBQUEsS0FyQlk7RUFBQSxDQUFiOztBQUFBLHFCQTZCQSxhQUFBLEdBQWUsU0FBQyxJQUFELEdBQUE7QUFDZCxRQUFBLHNEQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVksSUFBQSxLQUFLLENBQUMsUUFBTixDQUFBLENBQVosQ0FBQTtBQUNBO0FBQUEsU0FBQSwyREFBQTt1QkFBQTtBQUNDLE1BQUEsSUFBRyxFQUFBLEdBQUssQ0FBUjtBQUNDLFFBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUF4QixDQUFOLENBQUE7QUFBQSxRQUNBLEdBQUEsR0FBTSxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBRG5CLENBQUE7QUFBQSxRQUVBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVcsSUFBQyxDQUFBLEtBQU0sQ0FBQSxFQUFBLENBQWxCLEVBQTJCLElBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLENBQUEsR0FBQSxHQUFPLENBQTFCLEVBQTZCLENBQTdCLENBQTNCLENBRmpCLENBQUE7QUFBQSxRQUdBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBVSxDQUFDLElBQXJCLENBSEEsQ0FERDtPQUREO0FBQUEsS0FEQTtBQU9BLFdBQU8sS0FBUCxDQVJjO0VBQUEsQ0E3QmYsQ0FBQTs7a0JBQUE7O0lBZkQsQ0FBQTs7QUFBQTtBQTJEYyxFQUFBLGlCQUFFLElBQUYsR0FBQTtBQUNaLElBRGEsSUFBQyxDQUFBLE9BQUEsSUFDZCxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBTixHQUFtQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQWpDLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLEdBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFEbEMsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQThCLFNBQUEsR0FBUSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQTVDLENBRlgsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDZjtBQUFBLE1BQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxPQUFOO0FBQUEsTUFDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFVBRFo7QUFBQSxNQUVBLE9BQUEsRUFBUyxLQUFLLENBQUMsU0FGZjtBQUFBLE1BR0EsU0FBQSxFQUFXLElBSFg7QUFBQSxNQUlBLFVBQUEsRUFBWSxLQUpaO0FBQUEsTUFLQSxXQUFBLEVBQWEsSUFMYjtLQURlLENBSGhCLENBRFk7RUFBQSxDQUFiOztpQkFBQTs7SUEzREQsQ0FBQTs7QUFBQTtBQXlFYyxFQUFBLGNBQUUsT0FBRixFQUFZLEdBQVosRUFBa0IsR0FBbEIsR0FBQTtBQUVaLFFBQUEsaUZBQUE7QUFBQSxJQUZhLElBQUMsQ0FBQSxVQUFBLE9BRWQsQ0FBQTtBQUFBLElBRnVCLElBQUMsQ0FBQSxNQUFBLEdBRXhCLENBQUE7QUFBQSxJQUY2QixJQUFDLENBQUEsTUFBQSxHQUU5QixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQWQsR0FBMEIsRUFBL0MsRUFBbUQsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBZCxHQUEyQixFQUE5RSxDQUFoQixDQUFBO0FBR0E7QUFBQSxTQUFBLDJDQUFBO21CQUFBO0FBQ0MsTUFBQSxDQUFDLENBQUMsQ0FBRixJQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQWQsR0FBMEIsRUFBMUIsR0FBK0IsQ0FBdEMsQ0FBQTtBQUFBLE1BQ0EsQ0FBQyxDQUFDLENBQUYsSUFBTyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFkLEdBQTJCLEVBQTNCLEdBQWdDLENBRHZDLENBREQ7QUFBQSxLQUhBO0FBQUEsSUFNQSxJQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFWLEdBQStCLElBTi9CLENBQUE7QUFBQSxJQVNBLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFkLEdBQXdCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBVGhELENBQUE7QUFBQSxJQVVBLFFBQUEsR0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFkLEdBQXlCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBVmxELENBQUE7QUFBQSxJQVlBLEdBQUEsR0FBTSxPQUFBLEdBQVUsSUFBQyxDQUFBLEdBWmpCLENBQUE7QUFBQSxJQWFBLEdBQUEsR0FBTSxRQUFBLEdBQVcsQ0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsR0FBZ0IsSUFBQyxDQUFBLEdBQWpCLEdBQXVCLENBQXhCLENBYmpCLENBQUE7QUFjQTtBQUFBLFNBQUEsOENBQUE7dUJBQUE7QUFDQyxXQUFBLDZDQUFBO3FCQUFBO0FBQ0MsUUFBQSxJQUFHLENBQUMsQ0FBQyxDQUFGLEtBQU8sQ0FBVjtBQUNDLFVBQUEsQ0FBQyxDQUFDLENBQUYsR0FBTSxHQUFOLENBREQ7U0FBQSxNQUFBO0FBR0MsVUFBQSxDQUFDLENBQUMsQ0FBRixHQUFNLEdBQUEsR0FBTSxPQUFaLENBSEQ7U0FBQTtBQUtBLFFBQUEsSUFBRyxDQUFDLENBQUMsQ0FBRixLQUFPLENBQVY7QUFDQyxVQUFBLENBQUMsQ0FBQyxDQUFGLEdBQU0sR0FBTixDQUREO1NBQUEsTUFBQTtBQUdDLFVBQUEsQ0FBQyxDQUFDLENBQUYsR0FBTSxHQUFBLEdBQU0sUUFBWixDQUhEO1NBTkQ7QUFBQSxPQUREO0FBQUEsS0FkQTtBQUFBLElBeUJBLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixHQUEwQixJQXpCMUIsQ0FBQTtBQUFBLElBMkJBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQTNCckIsQ0FGWTtFQUFBLENBQWI7O2NBQUE7O0lBekVELENBQUE7O0FBQUE7QUE0R2MsRUFBQSxtQkFBQyxHQUFELEVBQU8sSUFBUCxHQUFBO0FBQ1osUUFBQSwrQ0FBQTtBQUFBLElBRGtCLElBQUMsQ0FBQSxPQUFBLElBQ25CLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxLQUFLLENBQUMsUUFBTixDQUFBLENBQVosQ0FBQTtBQUNBO0FBQUEsU0FBQSwyREFBQTt1QkFBQTtBQUNDLE1BQUEsSUFBRyxFQUFBLEdBQUssQ0FBUjtBQUNDLFFBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUF4QixDQUFOLENBQUE7QUFBQSxRQUNBLEdBQUEsR0FBTSxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBRG5CLENBQUE7QUFBQSxRQUdBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVcsR0FBRyxDQUFDLEtBQU0sQ0FBQSxFQUFBLENBQXJCLEVBQThCLElBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLENBQUEsR0FBQSxHQUFPLENBQTFCLEVBQTZCLENBQTdCLENBQTlCLENBSGpCLENBQUE7QUFBQSxRQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLFVBQVUsQ0FBQyxJQUFyQixDQUpBLENBREQ7T0FERDtBQUFBLEtBRlk7RUFBQSxDQUFiOzttQkFBQTs7SUE1R0QsQ0FBQTs7QUFBQTtBQXlIYyxFQUFBLG9CQUFDLElBQUQsRUFBTyxRQUFQLEdBQUE7QUFDWixJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxRQUFoQixFQUEwQixJQUFJLENBQUMsUUFBL0IsQ0FBWixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBREEsQ0FEWTtFQUFBLENBQWI7O29CQUFBOztJQXpIRCxDQUFBOztBQUFBO0FBK0hjLEVBQUEscUJBQUUsSUFBRixHQUFBO0FBQ1osUUFBQSxpQ0FBQTtBQUFBLElBRGEsSUFBQyxDQUFBLE9BQUEsSUFDZCxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQVgsQ0FBQTtBQUNBO0FBQUEsU0FBQSwyQ0FBQTs0QkFBQTtBQUNDLE1BQUEsS0FBQSxHQUFZLElBQUEsT0FBUSxDQUFBLFVBQVUsQ0FBQyxJQUFYLENBQVIsQ0FBNkIsSUFBQSxLQUFLLENBQUMsT0FBTixDQUFjLFVBQVUsQ0FBQyxDQUFYLEdBQWUsRUFBN0IsRUFBaUMsQ0FBQSxHQUFJLFVBQVUsQ0FBQyxDQUFYLEdBQWUsRUFBcEQsRUFBd0QsQ0FBeEQsQ0FBN0IsQ0FBWixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxLQUFkLENBREEsQ0FERDtBQUFBLEtBRlk7RUFBQSxDQUFiOztxQkFBQTs7SUEvSEQsQ0FBQTs7OztBQ0FBLElBQUEsMkJBQUE7RUFBQTtpU0FBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBQVIsQ0FBQTs7QUFBQSxVQUNBLEdBQWEsT0FBQSxDQUFRLHFCQUFSLENBRGIsQ0FBQTs7QUFBQSxRQUVBLEdBQVcsT0FBQSxDQUFRLG1CQUFSLENBRlgsQ0FBQTs7QUFBQSxPQUlhLENBQUM7QUFDYixNQUFBLDZDQUFBOztBQUFBLDJCQUFBLENBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsMkJBQTdCLENBQWhCLENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQXFCLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQ25CO0FBQUEsSUFBQSxHQUFBLEVBQUssYUFBTDtBQUFBLElBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxVQURaO0FBQUEsSUFFQSxPQUFBLEVBQVMsS0FBSyxDQUFDLFNBRmY7QUFBQSxJQUdBLFdBQUEsRUFBYSxJQUhiO0dBRG1CLENBRHJCLENBQUE7O0FBQUEsRUFPQSxjQUFBLEdBQXFCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FQckIsQ0FBQTs7QUFTYSxFQUFBLGdCQUFDLFFBQUQsR0FBQTtBQUNaLElBQUEsc0NBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FGVCxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBSGQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQWMsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLGNBQVgsRUFBMkIsY0FBM0IsQ0FBZCxDQUpBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FOQSxDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsWUFBRCxHQUFnQixRQVJoQixDQUFBO0FBQUEsSUFTQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsT0FBdkIsQ0FUQSxDQUFBO0FBQUEsSUFVQSxJQUFDLENBQUEsS0FBRCxHQUFTLENBVlQsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQVhULENBRFk7RUFBQSxDQVRiOztBQUFBLG1CQXVCQSxNQUFBLEdBQVEsU0FBQyxLQUFELEdBQUE7QUFDUCxJQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsS0FBVixDQUFBLEdBQWlCLElBQUMsQ0FBQSxLQUFsQixHQUF3QixLQUE1QyxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEtBQVYsQ0FBQSxHQUFpQixJQUFDLENBQUEsS0FBbEIsR0FBd0IsS0FENUMsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixHQUFtQixJQUFDLENBQUEsS0FGcEIsQ0FBQTtBQUdBLElBQUEsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxVQUExQjthQUNDLElBQUMsQ0FBQSxHQUFELENBQUEsRUFERDtLQUpPO0VBQUEsQ0F2QlIsQ0FBQTs7QUFBQSxtQkErQkEsV0FBQSxHQUFhLFNBQUMsTUFBRCxHQUFBO0FBQ1osUUFBQSxlQUFBO0FBQUEsSUFBQSx3Q0FBTSxNQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEdBQUQsQ0FBQSxDQUZBLENBQUE7QUFHQTtTQUFTLDZCQUFULEdBQUE7QUFDQyxvQkFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBZ0IsSUFBQSxRQUFBLENBQVMsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFmLEVBQXlCLENBQXpCLENBQWhCLEVBQUEsQ0FERDtBQUFBO29CQUpZO0VBQUEsQ0EvQmIsQ0FBQTs7Z0JBQUE7O0dBRDRCLFVBQVUsQ0FBQyxnQkFKeEMsQ0FBQTs7QUFBQSxPQTRDYSxDQUFDO0FBQ2IsTUFBQSw2Q0FBQTs7QUFBQSxnQ0FBQSxDQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLDZCQUE3QixDQUFoQixDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFxQixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUNuQjtBQUFBLElBQUEsR0FBQSxFQUFLLGFBQUw7QUFBQSxJQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsVUFEWjtBQUFBLElBRUEsT0FBQSxFQUFTLEtBQUssQ0FBQyxTQUZmO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtHQURtQixDQURyQixDQUFBOztBQUFBLEVBT0EsY0FBQSxHQUFxQixJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLENBUHJCLENBQUE7O0FBU2EsRUFBQSxxQkFBQyxRQUFELEdBQUE7QUFDWixJQUFBLDJDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFBLENBRlQsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxjQUFYLEVBQTJCLGNBQTNCLENBQWQsQ0FKQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBTkEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsUUFSaEIsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLE9BQXZCLENBVEEsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQVZULENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFYVCxDQURZO0VBQUEsQ0FUYjs7QUFBQSx3QkF1QkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEtBQVYsQ0FBQSxHQUFpQixJQUFDLENBQUEsS0FBbEIsR0FBd0IsS0FBNUMsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxLQUFWLENBQUEsR0FBaUIsSUFBQyxDQUFBLEtBQWxCLEdBQXdCLEtBRDVDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsR0FBbUIsSUFBQyxDQUFBLEtBRnBCLENBQUE7QUFHQSxJQUFBLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsVUFBMUI7YUFDQyxJQUFDLENBQUEsR0FBRCxDQUFBLEVBREQ7S0FKTztFQUFBLENBdkJSLENBQUE7O0FBQUEsd0JBK0JBLFdBQUEsR0FBYSxTQUFDLE1BQUQsR0FBQTtBQUNaLFFBQUEsZUFBQTtBQUFBLElBQUEsNkNBQU0sTUFBTixDQUFBLENBQUE7QUFBQSxJQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxHQUFELENBQUEsQ0FGQSxDQUFBO0FBR0E7U0FBUyw2QkFBVCxHQUFBO0FBQ0Msb0JBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWdCLElBQUEsUUFBQSxDQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBZixFQUF5QixDQUF6QixDQUFoQixFQUFBLENBREQ7QUFBQTtvQkFKWTtFQUFBLENBL0JiLENBQUE7O3FCQUFBOztHQURpQyxVQUFVLENBQUMsZ0JBNUM3QyxDQUFBOzs7O0FDQUEsSUFBQSxJQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUEsTUFHTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQTBCLElBQUEsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUgxQixDQUFBOzs7O0FDQUEsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO1NBQ2YsVUFBQSxDQUFXLElBQVgsRUFBaUIsS0FBakIsRUFEZTtBQUFBLENBQWhCLENBQUE7O0FBQUEsT0FHTyxDQUFDLE1BQVIsR0FBaUIsU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO0FBQ2hCLFNBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsR0FBQSxHQUFNLEdBQVAsQ0FBaEIsR0FBOEIsR0FBckMsQ0FEZ0I7QUFBQSxDQUhqQixDQUFBOztBQUFBLE9BT08sQ0FBQyxZQUFSLEdBQXVCLFNBQUEsR0FBQTtBQUN0QixNQUFBLG9CQUFBO0FBQUEsRUFBQSxXQUFBLEdBQWMsRUFBQSxHQUFLLENBQUMsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQUFYLENBQW5CLENBQUE7U0FDQSxPQUFBLEdBQVUsR0FBQSxHQUFNLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsV0FBQSxHQUFjLENBQXZCLENBQUwsQ0FBTixHQUF5QyxLQUY3QjtBQUFBLENBUHZCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwic2h1bXAgPSByZXF1aXJlKCcuL3NodW1wL3NodW1wLmNvZmZlZScpXG5cbiQoXCIjZnVsbHNjcmVlblwiKS5jbGljayAoKS0+XG5cdFxuXHQkKFwiI3NodW1wXCIpWzBdLndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuKEVsZW1lbnQuQUxMT1dfS0VZQk9BUkRfSU5QVVQpO1xuXHRcblx0Y2FudmFzID0gJChcIiNzaHVtcCBjYW52YXNcIilcblx0Y2FudmFzQXNwZWN0ID0gY2FudmFzLndpZHRoKCkgLyBjYW52YXMuaGVpZ2h0KClcblxuXHRjb250YWluZXJXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG5cdGNvbnRhaW5lckhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKVxuXHRjb250YWluZXJBc3BlY3QgPSBjb250YWluZXJXaWR0aCAvIGNvbnRhaW5lckhlaWdodFxuXHRjb25zb2xlLmxvZyBjYW52YXNBc3BlY3QsICQod2luZG93KS53aWR0aCgpICwgJCh3aW5kb3cpLmhlaWdodCgpLCBjb250YWluZXJBc3BlY3Rcblx0XG5cdGlmIGNhbnZhc0FzcGVjdCA8IGNvbnRhaW5lckFzcGVjdFxuXHRcdGNvbnNvbGUubG9nIFwibWF0Y2ggaGVpZ2h0XCJcblx0XHRjYW52YXMuaGVpZ2h0IGNvbnRhaW5lckhlaWdodFxuXHRcdGNhbnZhcy53aWR0aCBjb250YWluZXJIZWlnaHQgKiBjYW52YXNBc3BlY3Rcblx0ZWxzZVxuXHRcdGNvbnNvbGUubG9nIFwibWF0Y2ggd2lkdGhcIlxuXHRcdGNhbnZhcy53aWR0aCBjb250YWluZXJXaWR0aFxuXHRcdGNhbnZhcy5oZWlnaHQgY29udGFpbmVyV2lkdGggLyBjYW52YXNBc3BlY3RcblxuJChcIiNkZWJ1Z1wiKS5hcHBlbmQoXCJcIlwiPHNwYW4gaWQ9XCJsZXZlbENoaWxkcmVuXCI+XCJcIlwiKVxuXG5cbnVwZGF0ZURlYnVnID0gKCktPlxuXHQkKFwiI2xldmVsQ2hpbGRyZW5cIikudGV4dCBcIlwiXCJsZXZlbC5jaGlsZHJlbiA9ICN7c2h1bXAuR2FtZS5sZXZlbC5jaGlsZHJlbi5sZW5ndGh9XCJcIlwiXG5cblxuXG4jIHRlc3RJdCA9ICgpLT5cbiMgXHRjb25zb2xlLmxvZyBcInRlc3RJdFwiXG5cbiMgY2xhc3MgTXlTdXBlclxuIyBcdHRlc3Q6IFwiTXlTdXBlclRlc3RcIlxuIyBcdGFub3RoZXJUaGluZzogdGVzdEl0KClcbiMgXHRjb25zdHJ1Y3RvcjogKCktPlxuIyBcdFx0Y29uc29sZS5sb2cgQHRlc3RcblxuXG5cbiMgY2xhc3MgTXlTdWIgZXh0ZW5kcyBNeVN1cGVyXG4jIFx0dGVzdDogXCJNeVN1YlRlc3RcIlxuXG5cblxuIyBuZXcgTXlTdWIoKVxuIyBuZXcgTXlTdWIoKVxuIyBuZXcgTXlTdWIoKVxuIyBuZXcgTXlTdWIoKVxuIyBuZXcgTXlTdXBlcigpXG4iLCJjbGFzcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QF9ldmVudHMgPSB7fVxuXG5cdG9uOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0KEBfZXZlbnRzW2V2ZW50XSA/PSBbXSkucHVzaCBoYW5kbGVyXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRvZmY6IChldmVudCwgaGFuZGxlcikgLT5cblx0XHRmb3Igc3VzcGVjdCwgaW5kZXggaW4gQF9ldmVudHNbZXZlbnRdIHdoZW4gc3VzcGVjdCBpcyBoYW5kbGVyXG5cdFx0XHRAX2V2ZW50c1tldmVudF0uc3BsaWNlIGluZGV4LCAxXG5cdFx0cmV0dXJuIHRoaXNcblxuXHR0cmlnZ2VyOiAoZXZlbnQsIGFyZ3MuLi4pID0+XG5cdFx0cmV0dXJuIHRoaXMgdW5sZXNzIEBfZXZlbnRzW2V2ZW50XT9cblx0XHRmb3IgaSBpbiBbQF9ldmVudHNbZXZlbnRdLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0aGFuZGxlciA9IEBfZXZlbnRzW2V2ZW50XVtpXVxuXHRcdFx0aGFuZGxlci5hcHBseSB0aGlzLCBhcmdzXG5cdFx0cmV0dXJuIHRoaXNcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgQ29sbGlzaW9uT2JqZWN0IGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gdW5kZWZpbmVkXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMgPSBbXVxuXHRcdEBocCA9IDFcblx0XHRAZHAgPSAxXG5cdFx0QGNvbGxpc2lvblJhZGl1cyA9IC42XG5cblx0Y29sbGlkZUludG86ICh0YXJnZXQpLT5cblx0XHR0YXJnZXQudGFrZURhbWFnZShAZHApXG5cdFx0IyBAZGllKClcblx0XHQjIGdhbWVPYmplY3QuZGllKClcblxuXHR0YWtlRGFtYWdlOiAoZGFtYWdlKS0+XG5cdFx0QGhwIC09IGRhbWFnZVxuXHRcdGlmIEBocCA8PSAwIFxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzLkNvbGxpc2lvbk9iamVjdCA9IENvbGxpc2lvbk9iamVjdFxuXG5cblxubW9kdWxlLmV4cG9ydHMucmVzb2x2ZUNvbGxpc2lvbnMgPSAoY29sbGlkZXJzKS0+XG5cdGZvciBhIGluIGNvbGxpZGVyc1xuXHRcdGlmIGEuYWN0aXZlXG5cdFx0XHRmb3IgYiBpbiBjb2xsaWRlcnNcblx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRpZiBhLmNvbGxpZGVySGl0VHlwZXMuaW5kZXhPZihiLmNvbGxpZGVyVHlwZSkgPiAtMVxuXHRcdFx0XHRcdFx0aWYgQHRlc3RDb2xsaXNpb24gYSwgYlxuXHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVJbnRvIGJcblxubW9kdWxlLmV4cG9ydHMudGVzdENvbGxpc2lvbiA9IChhLCBiKS0+XG5cdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IGEuY29sbGlzaW9uUmFkaXVzICsgYi5jb2xsaXNpb25SYWRpdXNcbiIsIlxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbnMgPSByZXF1aXJlICcuL0NvbGxpc2lvbnMuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcbldlYXBvbnMgPSByZXF1aXJlICcuL1dlYXBvbnMuY29mZmVlJ1xuXG5cbmNsYXNzIEJhc2ljIGV4dGVuZHMgQ29sbGlzaW9ucy5Db2xsaXNpb25PYmplY3RcblxuXHRlbmVteVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL2VuZW1pZXMvZW5lbXkucG5nXCJcblx0ZW5lbXlNYXRlcmlhbDogbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGVuZW15VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRlbmVteUdlb21ldHJ5OiBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gXCJlbmVteVwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcInBsYXllclwiXG5cblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggQGVuZW15R2VvbWV0cnksIEBlbmVteU1hdGVyaWFsXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XHRAYWdlID0gMFxuXHRcdEBoYXNGaXJlZCA9IGZhbHNlXG5cblx0XHRAYWN0aXZlID0gZmFsc2VcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVxuXHRcdEBhZ2UgKz0gZGVsdGFcblx0XHRcblx0XG5cdGRpZTogKCktPlxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAzKVxuXHRcdHN1cGVyKClcblxuXG5jbGFzcyBCb3NzIGV4dGVuZHMgQmFzaWNcblx0ZW5lbXlUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9lbmVtaWVzL2Jvc3MucG5nXCJcblx0ZW5lbXlNYXRlcmlhbDogbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGVuZW15VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRlbmVteUdlb21ldHJ5OiBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggNCwgNik7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKHBvc2l0aW9uKVxuXHRcdEBocCA9IDIwXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cblx0XHRpZiBAYWdlIDwgMlxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCAtPSAxICogZGVsdGFcblx0XHRpZiBAYWdlID4gMlxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSAxICogZGVsdGFcblx0XHRcdEByb290LnBvc2l0aW9uLnkgKz0gZGVsdGEgKiBNYXRoLnNpbihAYWdlKVxuXG5cdFx0aWYgQGFnZSAlIDQgPiAxXG5cdFx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXHRcdFxuXHRmaXJlX3ByaW1hcnk6ICgpLT5cblx0XHRpZiBEYXRlLm5vdygpID4gQGxhc3RGaXJlICsgMjUwXG5cdFx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0XHRcblx0XHRcdHBvcyA9IEByb290LnBvc2l0aW9uLmNsb25lKClcblx0XHRcdHBvcy55IC09IDEuOFxuXHRcdFx0cG9zLnggLT0gMS42XG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5FbmVteUJ1bGxldChwb3MpXG5cdFx0XHRidWxsZXQuY29sbGlkZXJUeXBlID0gXCJlbmVteV9idWxsZXRcIlxuXHRcdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUElcblx0XHRcdGJ1bGxldC5zcGVlZCA9IDdcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cblx0XHRcdHBvcyA9IEByb290LnBvc2l0aW9uLmNsb25lKClcblx0XHRcdHBvcy55ICs9IDEuOFxuXHRcdFx0cG9zLnggLT0gMS42XG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5FbmVteUJ1bGxldChwb3MpXG5cdFx0XHRidWxsZXQuY29sbGlkZXJUeXBlID0gXCJlbmVteV9idWxsZXRcIlxuXHRcdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUElcblx0XHRcdGJ1bGxldC5zcGVlZCA9IDdcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFx0XG5cblx0ZGllOiAoKS0+XG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjAwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAxMClcblxuXHRcdGZvciBpIGluIFswLi4xMDBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDUpXG5cblx0XHRzdXBlcigpXG5cblxuZXhwb3J0cy5Cb3NzID0gQm9zc1xuXG5cblxuY2xhc3MgU2luV2F2ZSBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLTEgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gZGVsdGEgKiBNYXRoLnNpbihAYWdlKVxuXG5jbGFzcyBEYXJ0IGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0aWYgQGFnZSA8IC41XG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0yMCAqIGRlbHRhXG5cdFx0ZWxzZSBpZiBAYWdlIDwgM1xuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHRlbHNlXG5cdFx0XHRAZGllKClcblxuXHRcdGlmIEBhZ2UgPiAxIGFuZCBub3QgQGhhc0ZpcmVkXG5cdFx0XHRAaGFzRmlyZWQgPSB0cnVlXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcblx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KEByb290LnBvc2l0aW9uKVxuXG5cdFx0YnVsbGV0LmNvbGxpZGVyVHlwZSA9IFwiZW5lbXlfYnVsbGV0XCJcblx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUEkgLSAuMjVcblx0XHRidWxsZXQuc3BlZWQgPSA1XG5cblx0XHRAcGFyZW50LmFkZCBidWxsZXRcdFxuXG5cdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuRW5lbXlCdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cblx0XHRidWxsZXQuY29sbGlkZXJUeXBlID0gXCJlbmVteV9idWxsZXRcIlxuXHRcdGJ1bGxldC5jb2xsaWRlckhpdFR5cGVzID0gW1wicGxheWVyXCJdXG5cdFx0YnVsbGV0LmFuZ2xlID0gTWF0aC5QSSArIC4yNVxuXHRcdGJ1bGxldC5zcGVlZCA9IDVcblxuXHRcdEBwYXJlbnQuYWRkIGJ1bGxldFx0XG5cblxuZXhwb3J0cy5CYXNpYyA9IEJhc2ljXG5leHBvcnRzLlNpbldhdmUgPSBTaW5XYXZlXG5leHBvcnRzLkRhcnQgPSBEYXJ0XG5cbiMgc3VwZXIoZGVsdGEpXG5cdFx0IyBpZiBAYWdlIDwgMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDJcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueSArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyLjFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHQjIGVsc2Vcblx0XHQjIFx0QGRpZSgpXG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5CYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcbkxldmVsID0gcmVxdWlyZSAnLi9MZXZlbC5jb2ZmZWUnXG5TY3JlZW5zID0gcmVxdWlyZSAnLi9TY3JlZW5zLmNvZmZlZSdcblNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5Qb3N0RWZmZWN0cyA9IHJlcXVpcmUgJy4vUG9zdEVmZmVjdHMuY29mZmVlJ1xuXG4jIEdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5cblxuY2xhc3MgR2FtZSBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0IyBpbml0aWFsaXplIHN0YXRlXG5cdFx0QGxpdmVzID0gM1xuXG5cdFx0IyBjcmVhdGUgcmVuZGVyZXJcblx0XHRAcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpXG5cdFx0QHJlbmRlcmVyLnNldFNpemUgNjQwLCA0ODBcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cblx0XHQjIHRvZG8gbmVhcmVzdCBiZXR0ZXI/XG5cdFx0QHdvcmxkVGV4dHVyZSA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCA2NDAsIDQ4MCwgXG5cdFx0XHRtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlciBcblx0XHRcdG1hZ0ZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyXG5cdFx0XHRmb3JtYXQ6IFRIUkVFLlJHQkZvcm1hdFxuXG5cdFx0IyBzY3JlZW5FZmZlY3QgXG5cdFx0QHNjcmVlbkVmZmVjdCA9IG5ldyBQb3N0RWZmZWN0cy5TY3JlZW5FZmZlY3QoKVxuXHRcdEBzY3JlZW5FZmZlY3QucHJvY2Vzc01hdGVyaWFsLnVuaWZvcm1zLnREaWZmdXNlLnZhbHVlID0gQHdvcmxkVGV4dHVyZVxuXHRcdCMgY29uc29sZS5sb2cgXCJtYXRcIiwgQHNjcmVlbkVmZmVjdC5wcm9jZXNzTWF0ZXJpYWxcblxuXHRcdCMgY2xvY2tcblx0XHRAY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKVxuXG5cdFx0IyBjcmVhdGUgc3RhdHNcblx0XHQjIEBzdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdCMgQHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0IyBAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuXHRcdCMgJChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCggQHN0YXRzLmRvbUVsZW1lbnQgKVxuXHRcdFxuXHRcdCMgaHVkXG5cdFx0U2NvcmUuZGlzcGxheUVsZW1lbnQgPSAkKFwiXCJcIjxoMT5TY29yZTo8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdEBsaXZlc0VsZW1lbnQgPSAkKFwiXCJcIjxoMT5MaXZlczo8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXG5cdFx0IyBvdGhlciBzY3JlZW5zXG5cdFx0QHN0YXRlID0gXCJob21lXCJcblx0XHRAaG9tZVNjcmVlbiA9IG5ldyBTY3JlZW5zLkhvbWVTY3JlZW4oKVxuXHRcdEBnYW1lT3ZlclNjcmVlbiA9IG5ldyBTY3JlZW5zLkdhbWVPdmVyU2NyZWVuKClcblxuXHRcdCMgdG9kbywgY2xlYW4gdGhpcyB1cCBsZXQgc2NyZWVucyBoYW5kbGUgdGhlaXIgaW5wdXQgYW5kIHNlbmQgbWVzc2FnZXMgd2hlbiB0aGV5IGFyZSBkb25lLiBtYXliZSB0aHJvdWdoIGEgZ2xvYmFsIGV2ZW50IGJyb2FkY2FzdGVyXG5cdFx0JCh3aW5kb3cpLmtleWRvd24gKGUpPT5cblx0XHRcdGlmIEBzdGF0ZSA9PSBcImhvbWVcIlxuXHRcdFx0XHRAc3RhdGUgPSBcImxvYWRpbmdcIlxuXHRcdFx0XHRAc3RhcnRHYW1lKClcblx0XHRcdFx0cmV0dXJuXG5cblx0XHRcdGlmIEBzdGF0ZSA9PSBcImdhbWVfb3ZlclwiXG5cdFx0XHRcdEBzdGF0ZSA9IFwiaG9tZVwiXG5cdFx0XHRcdHJldHVyblxuXG5cdFx0IyBsb2FkIGFzc2V0c1xuXG5cdFx0IyBiZWdpbiBnYW1lXG5cdFx0dXRpbC5hZnRlciAxLCAoKT0+XG5cdFx0XHRAYW5pbWF0ZSgpXG5cblxuXHRzdGFydEdhbWU6ICgpLT5cblx0XHRAbGl2ZXMgPSAzXG5cdFx0QGxpdmVzRWxlbWVudC50ZXh0IFwiTGl2ZXM6ICN7QGxpdmVzfVwiXG5cblx0XHRTY29yZS5zZXQgMFxuXG5cdFx0IyBsZXZlbFxuXHRcdEBsZXZlbCA9IG5ldyBMZXZlbC5MZXZlbCgpXG5cdFx0QGxldmVsLm9uIFwicGxheWVyRGllXCIsICgpPT5cblx0XHRcdEBsaXZlcy0tXG5cdFx0XHRAbGl2ZXNFbGVtZW50LnRleHQgXCJMaXZlczogI3tAbGl2ZXN9XCJcblxuXHRcdFx0aWYgQGxpdmVzID4gMFxuXHRcdFx0XHR1dGlsLmFmdGVyIDEwMDAsIEBsZXZlbC5pbnNlcnRQbGF5ZXJcblx0XHRcdGVsc2Vcblx0XHRcdFx0QHN0YXRlID0gXCJnYW1lX292ZXJcIlxuXG5cdFx0QGxldmVsLm9uIFwicmVhZHlcIiwgKCk9PlxuXHRcdFx0QHN0YXRlID0gXCJwbGF5XCJcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGlmIEBzdGF0ZSA9PSBcImhvbWVcIlxuXHRcdFx0QGhvbWVTY3JlZW4udXBkYXRlKGRlbHRhKVxuXG5cdFx0aWYgQHN0YXRlID09IFwicGxheVwiXG5cdFx0XHRAbGV2ZWwudXBkYXRlKGRlbHRhKVxuXG5cdFx0aWYgQHN0YXRlID09IFwiZ2FtZV9vdmVyXCJcblx0XHRcdEBsZXZlbC51cGRhdGUoZGVsdGEpXG5cdFx0XHRAZ2FtZU92ZXJTY3JlZW4udXBkYXRlKGRlbHRhKVxuXG5cblx0cmVuZGVyOiAoKT0+XG5cdFx0QHJlbmRlcmVyLmF1dG9DbGVhciA9IGZhbHNlXG5cdFx0aWYgQHN0YXRlID09IFwiaG9tZVwiXG5cdFx0XHRAcmVuZGVyZXIucmVuZGVyIEBob21lU2NyZWVuLnNjZW5lLCBAaG9tZVNjcmVlbi5jYW1lcmEsIEB3b3JsZFRleHR1cmUsIHRydWVcblx0XHRcblx0XHRpZiBAc3RhdGUgPT0gXCJwbGF5XCJcdFxuXHRcdFx0QHJlbmRlcmVyLnJlbmRlciBAbGV2ZWwuc2NlbmUsIEBsZXZlbC5jYW1lcmEsIEB3b3JsZFRleHR1cmUsIHRydWVcblx0XHRcdEByZW5kZXJlci5yZW5kZXIgQGhvbWVTY3JlZW4uc2NlbmUsIEBsZXZlbC5jYW1lcmEsIEB3b3JsZFRleHR1cmUsIGZhbHNlXG5cblx0XHRpZiBAc3RhdGUgPT0gXCJnYW1lX292ZXJcIlxuXHRcdFx0QHJlbmRlcmVyLnJlbmRlciBAbGV2ZWwuc2NlbmUsIEBsZXZlbC5jYW1lcmEsIEB3b3JsZFRleHR1cmUsIHRydWVcblx0XHRcdEByZW5kZXJlci5yZW5kZXIgQGdhbWVPdmVyU2NyZWVuLnNjZW5lLCBAZ2FtZU92ZXJTY3JlZW4uY2FtZXJhLCBAd29ybGRUZXh0dXJlLCBmYWxzZVxuXHRcdFx0XG5cdFx0QHJlbmRlcmVyLnJlbmRlciBAc2NyZWVuRWZmZWN0LnNjZW5lLCBAc2NyZWVuRWZmZWN0LmNhbWVyYVxuXG5cblx0YW5pbWF0ZTogPT5cblx0XHQjIHVwZGF0ZSB0aGUgZ2FtZSBwaHlzaWNzXG5cdFx0ZGVsdGEgPSBAY2xvY2suZ2V0RGVsdGEoKVxuXHRcdGlmIChkZWx0YSA8IC41KSBcblx0XHRcdEB1cGRhdGUoZGVsdGEpXG5cblx0XHQjIHJlbmRlciB0byBzY3JlZW5cblx0XHRAcmVuZGVyKClcblxuXHRcdCMgdXBkYXRlIGZwcyBvdmVybGF5XG5cdFx0IyBAc3RhdHMudXBkYXRlKClcblxuXHRcdCMgcmVwZWF0XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIEBhbmltYXRlXG5cdFx0cmV0dXJuXG5cblxuZXhwb3J0cy5HYW1lID0gR2FtZVxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIEdhbWVPYmplY3QgZXh0ZW5kcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdHN1cGVyKClcblxuXHRcdEBwYXJlbnQgPSB1bmRlZmluZWRcblx0XHRAY2hpbGRyZW4gPSBbXVxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRAZGVhZCA9IGZhbHNlXG5cdFx0QGFjdGl2ZSA9IHRydWVcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGZvciBpIGluIFtAY2hpbGRyZW4ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRjaGlsZCA9IEBjaGlsZHJlbltpXVxuXHRcdFx0aWYgY2hpbGQuZGVhZFxuXHRcdFx0XHRAcmVtb3ZlIGNoaWxkXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRpZiBjaGlsZC5hY3RpdmVcblx0XHRcdFx0Y2hpbGQudXBkYXRlIGRlbHRhIFxuXHRcblx0YWN0aXZhdGU6ICgpLT5cblx0XHRAYWN0aXZlID0gdHJ1ZTtcblx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSB0aGlzXG5cdFx0QGNoaWxkcmVuLnB1c2goZ2FtZU9iamVjdClcblx0XHRAcm9vdC5hZGQoZ2FtZU9iamVjdC5yb290KVxuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdEByb290LnJlbW92ZShnYW1lT2JqZWN0LnJvb3QpXG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSBudWxsXG5cdFx0aSA9ICBAY2hpbGRyZW4uaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNoaWxkcmVuLnNwbGljZShpLCAxKTtcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdGRpZTogKCktPlxuXHRcdEBkZWFkID0gdHJ1ZTtcblx0XHRAdHJpZ2dlciBcImRpZVwiXG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZU9iamVjdFxuIiwiY2xhc3MgSW5wdXRcblx0a2V5TWFwOiBcblx0XHRcIjM4XCI6XCJ1cFwiICN1cCBhcnJvd1xuXHRcdFwiODdcIjpcInVwXCIgI3dcblx0XHRcIjQwXCI6XCJkb3duXCIgI2Rvd24gYXJyb3dcblx0XHRcIjgzXCI6XCJkb3duXCIgI3Ncblx0XHRcIjM3XCI6XCJsZWZ0XCIgI2xlZnQgYXJyb3dcblx0XHRcIjY1XCI6XCJsZWZ0XCIgI2Fcblx0XHRcIjM5XCI6XCJyaWdodFwiICNyaWdodCBhcnJvd1xuXHRcdFwiNjhcIjpcInJpZ2h0XCIgI2Rcblx0XHRcIjMyXCI6XCJmaXJlX3ByaW1hcnlcIiAjc3BhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAa2V5U3RhdGVzID0gW11cblxuXHRcdGZvciBrZXksIHZhbHVlIG9mIEBrZXlNYXBcblx0XHRcdEBrZXlTdGF0ZXNbdmFsdWVdID0gZmFsc2U7XG5cblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0IyBjb25zb2xlLmxvZyBlLndoaWNoXG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSB0cnVlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0JCh3aW5kb3cpLmtleXVwIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSBmYWxzZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuaW5wdXQgPSBuZXcgSW5wdXQoKVxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dFxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuVGlsZWQgPSByZXF1aXJlICcuL1RpbGVkLmNvZmZlZSdcblBsYXllciA9IHJlcXVpcmUgJy4vUGxheWVyLmNvZmZlZSdcbkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuQ29sbGlzaW9ucyA9IHJlcXVpcmUgJy4vQ29sbGlzaW9ucy5jb2ZmZWUnXG5cbmNsYXNzIExldmVsIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAY29sbGlkZXJzID0gW11cblxuXHRcdCMgY3JlYXRlIHNjZW5lXG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRAc2NlbmUuYWRkIEByb290XG5cblx0XHQjIGNhbWVyYVxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIDY0MCAvIDQ4MCwgMSwgMTAwMDApXHRcblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB1dGlsLmxheWVyU3BhY2luZygpICogMVxuXHRcdEBzY2VuZS5hZGQgQGNhbWVyYVxuXG5cdFx0IyBsaWdodHNcblx0XHRAYW1iaWVudExpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XG5cdFx0QHJvb3QuYWRkKEBhbWJpZW50TGlnaHQpXG5cblxuXHRcdCMgaW5zZXJ0IHBsYXllclxuXHRcdEBpbnNlcnRQbGF5ZXIoKVxuXG5cblx0XHQjIGxldmVsXG5cdFx0VGlsZWQubG9hZCgnYXNzZXRzL2xldmVsXzEuanNvbicpLnRoZW4oQHBvcHVsYXRlKS5jYXRjaCAoZXJyb3IpLT5cblx0IFx0XHRjb25zb2xlLmVycm9yIGVycm9yXG5cblx0cG9wdWxhdGU6IChtYXApPT5cblx0XHRAcm9vdC5hZGQobWFwLmxheWVycy5iYWNrZ3JvdW5kLnJvb3QpXG5cdFx0bWFwLmxheWVycy5iYWNrZ3JvdW5kLnJvb3QucG9zaXRpb24ueSA9IDcuNSAqIDJcblx0XHRtYXAubGF5ZXJzLmJhY2tncm91bmQucm9vdC5wb3NpdGlvbi56ID0gIHV0aWwubGF5ZXJTcGFjaW5nKCkgKiAtMVxuXHRcdG1hcC5sYXllcnMuYmFja2dyb3VuZC5yb290LnNjYWxlLnNldCgyLCAyLCAyKVxuXHRcdFxuXHRcdEByb290LmFkZChtYXAubGF5ZXJzLm1pZGdyb3VuZC5yb290KVxuXHRcdG1hcC5sYXllcnMubWlkZ3JvdW5kLnJvb3QucG9zaXRpb24ueSA9IDcuNVxuXG5cdFx0Zm9yIG9iamVjdCBpbiBtYXAubGF5ZXJzLmVuZW1pZXMub2JqZWN0c1xuXHRcdFx0QGFkZCBvYmplY3RcblxuXHRcdEB0cmlnZ2VyIFwicmVhZHlcIlxuXG5cdGluc2VydFBsYXllcjogKCk9PlxuXHRcdEBwbGF5ZXIxID0gbmV3IFBsYXllcigpXG5cdFx0QGFkZCBAcGxheWVyMVxuXHRcdEBwbGF5ZXIxLnJvb3QucG9zaXRpb24uY29weSBAY2FtZXJhLnBvc2l0aW9uXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi56ID0gMFxuXG5cdFx0QHBsYXllcjEub24gXCJkaWVcIiwgKCk9PlxuXHRcdFx0QHRyaWdnZXIgXCJwbGF5ZXJEaWVcIlxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QGNhbWVyYS5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXHRcdEBwbGF5ZXIxLnJvb3QucG9zaXRpb24ueCArPSAxICogZGVsdGFcblxuXHRcdGZvciBjaGlsZCBpbiBAY2hpbGRyZW5cblx0XHRcdGlmIGNoaWxkLmFjdGl2ZSA9PSBmYWxzZSBhbmQgY2hpbGQucm9vdC5wb3NpdGlvbi54IDwgQGNhbWVyYS5wb3NpdGlvbi54ICsgMTBcblx0XHRcdFx0Y2hpbGQuYWN0aXZhdGUoKVxuXG5cdFx0Q29sbGlzaW9ucy5yZXNvbHZlQ29sbGlzaW9ucyhAY29sbGlkZXJzKVxuXG5cdFxuXHRcdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGlmIGdhbWVPYmplY3QgaW5zdGFuY2VvZiBDb2xsaXNpb25zLkNvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKVxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cblxuZXhwb3J0cy5MZXZlbCA9IExldmVsXG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoQGdlb21ldHJ5LCBAbWF0ZXJpYWwpLT5cblx0XHRzdXBlcigpXG5cdFx0QG1hdGVyaWFsID0gdW5kZWZpbmVkXG5cdFx0QGdlb21ldHJ5ID0gdW5kZWZpbmVkXG5cdFx0QHRleHR1cmUgPSB1bmRlZmluZWRcblx0XHRAc3RhdHVzID0gdW5kZWZpbmVkXG5cblx0bG9hZDogKGZpbGVOYW1lKT0+XG5cdFx0anNvbkxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKCk7XG5cdFx0anNvbkxvYWRlci5sb2FkIGZpbGVOYW1lLCAoZ2VvbWV0cnksIG1hdGVyaWFscywgb3RoZXJzLi4uKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbCggbWF0ZXJpYWxzIClcblx0XHRcdCMgQG1hdGVyaWFsID0gbWF0ZXJpYWxzWzBdXG5cdFx0XHRAZ2VvbWV0cnkgPSBnZW9tZXRyeVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXHRsb2FkUG5nOiAoZmlsZU5hbWUpPT5cblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgZmlsZU5hbWUsIHt9LCAoKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdFx0IyB0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0XHQjIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cdFx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdFx0IyBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSAxLCAxXG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJsb2FkcG5nXCIsIHRoaXNcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cblxuXG5jbGFzcyBNb2RlbExvYWRlclxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBkZWZhdWx0R2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KDEsMSwxKVxuXHRcdEBkZWZhdWx0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdGNvbG9yOiAweDAwZmYwMFxuXHRcdFx0d2lyZWZyYW1lOiB0cnVlXG5cdFx0XHRtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvdXRpbC93aGl0ZS5wbmdcIlxuXG5cdFx0QGxvYWRlZE1vZGVscyA9IHt9XG5cblx0bG9hZDogKGZpbGVOYW1lKS0+XG5cblx0XHQjIGlmIGFscmVhZHkgbG9hZGVkLCBqdXN0IG1ha2UgdGhlIG5ldyBtZXNoIGFuZCByZXR1cm5cblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXT8gJiYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uc3RhdHVzID09IFwicmVhZHlcIlxuXHRcdFx0I2NvbnNvbGUubG9nIFwiY2FjaGVkXCJcblx0XHRcdHJldHVybiBuZXcgVEhSRUUuTWVzaChAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5nZW9tZXRyeSwgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0ubWF0ZXJpYWwpXG5cblxuXHRcdCMgaWYgcmVxdWVzdGVkIGJ1dCBub3QgcmVhZHlcblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFx0bW9kZWwgPSBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFxuXHRcdCMgaWYgbm90IHJlcXVlc3RlZCBiZWZvcmVcblx0XHRlbHNlXG5cdFx0XHRtb2RlbCA9IG5ldyBNb2RlbCgpXG5cdFx0XHRpZiBmaWxlTmFtZS5zcGxpdCgnLicpLnBvcCgpID09IFwianNcIlxuXHRcdFx0XHRtb2RlbC5sb2FkKGZpbGVOYW1lKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRtb2RlbC5sb2FkUG5nKGZpbGVOYW1lKVxuXHRcdFx0QGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0gPSBtb2RlbFxuXG5cdFx0b2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goIEBkZWZhdWx0R2VvbWV0cnksIEBkZWZhdWx0TWF0ZXJpYWwgKVxuXHRcdG1vZGVsLm9uIFwic3VjY2Vzc1wiLCAobSktPlxuXHRcdFx0b2JqZWN0Lmdlb21ldHJ5ID0gbS5nZW9tZXRyeVx0XHRcdFxuXHRcdFx0b2JqZWN0Lm1hdGVyaWFsID0gbS5tYXRlcmlhbFxuXHRcdFx0bS5vZmYgXCJzdWNjZXNzXCIsIGFyZ3VtZW50cy5jYWxsZWUgI3JlbW92ZSB0aGlzIGhhbmRsZXIgb25jZSB1c2VkXG5cdFx0cmV0dXJuIG9iamVjdFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsTG9hZGVyXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbnV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuY2xhc3MgUGFydGljbGUgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHBhcnRpY2xlVGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvcGFydGljbGVzL3BhcnRpY2xlMi5wbmdcIlxuXHRwYXJ0aWNsZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHBhcnRpY2xlVGV4dHVyZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cblx0cGFydGljbGVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uLCBlbmVyZ3kpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBwYXJ0aWNsZUdlb21ldHJ5LCBwYXJ0aWNsZU1hdGVyaWFsXG5cdFx0XG5cdFx0QHZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjModXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSk7XG5cdFx0QHZlbG9jaXR5Lm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKGVuZXJneSlcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHZlbG9jaXR5Lm11bHRpcGx5U2NhbGFyKC45OSlcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IEB2ZWxvY2l0eS54ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi56ICs9IEB2ZWxvY2l0eS56ICogZGVsdGFcblx0XHRzID0gMS0gKChEYXRlLm5vdygpIC0gQGJpcnRoKSAvIEB0aW1lVG9MaXZlKSArIC4wMVxuXHRcdEByb290LnNjYWxlLnNldChzLCBzLCBzKVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGVcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbnMgPSByZXF1aXJlICcuL0NvbGxpc2lvbnMuY29mZmVlJ1xuTW9kZWxMb2FkZXIgPSByZXF1aXJlICcuL01vZGVsTG9hZGVyLmNvZmZlZSdcbklucHV0ID0gcmVxdWlyZSAnLi9JbnB1dC5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5TaHVtcCA9IHJlcXVpcmUgJy4vc2h1bXAuY29mZmVlJ1xuXG5tb2RlbExvYWRlciA9IG5ldyBNb2RlbExvYWRlcigpXG4jIGlucHV0ID0gbmV3IElucHV0KClcblxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQ29sbGlzaW9ucy5Db2xsaXNpb25PYmplY3RcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRcblx0XHRAY29sbGlkZXJUeXBlID0gXCJwbGF5ZXJcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteV9idWxsZXRcIlxuXG5cdFx0bW9kZWwgPSBtb2RlbExvYWRlci5sb2FkKFwiYXNzZXRzL3NoaXBzL3NoaXAyLmpzXCIpXG5cdFx0QHJvb3QuYWRkIG1vZGVsXG5cdFx0dXRpbC5hZnRlciAxMDAwLCAoKS0+XG5cdFx0XHRtb2RlbC5tYXRlcmlhbC5tYXRlcmlhbHNbMF0ud2lyZWZyYW1lID0gdHJ1ZVxuXHRcdFxuXHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRAaHAgPSAzXG5cblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGlmIElucHV0LmtleVN0YXRlc1sndXAnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1snZG93biddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55IC09IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydsZWZ0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ3JpZ2h0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ2ZpcmVfcHJpbWFyeSddXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXHRmaXJlX3ByaW1hcnk6ICgpLT5cblx0XHRpZiBEYXRlLm5vdygpID4gQGxhc3RGaXJlICsgMjQwICogMVxuXHRcdFx0U291bmQucGxheSgnc2hvb3QnKVxuXHRcdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdFx0XG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gLS4yNVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdGJ1bGxldC5hbmdsZSA9ICsuMjVcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXHRcdFx0IyBAcGFyZW50LmNvbGxpZGVycy5wdXNoIGJ1bGxldFxuXG5cdGRpZTogKCktPlxuXHRcdCMgY29uc29sZS5sb2cgXCJkaWVcIlxuXHRcdFxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgOClcblxuXHRcdCMgcG9zID0gQHJvb3QucG9zaXRpb25cblx0XHQjIHBhcmVudCA9IEBwYXJlbnRcblx0XHQjIHV0aWwuYWZ0ZXIgMTAwMCwgKCktPlxuXHRcdCMgXHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQocG9zKVxuXHRcdCMgXHRidWxsZXQuaHAgPSAxMDBcblx0XHQjIFx0YnVsbGV0LmRwID0gMTBcblx0XHQjIFx0YnVsbGV0LmNvbGxpc2lvblJhZGl1cyA9IDE1MFxuXHRcdCMgXHRwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0IyB1dGlsLmFmdGVyIDEyNTAsIFNodW1wLmdhbWUucmVzZXRQbGF5ZXJcblx0XHRzdXBlcigpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxuIiwiY2xhc3MgZXhwb3J0cy5TY3JlZW5FZmZlY3Rcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKC0uNSwgLjUsIC0uNSAsIC41LCAwLCAxKVxuXHRcdEBjYW1lcmEucG9zaXRpb24ueiA9IDBcblx0XHRAc2NlbmUuYWRkIEBjYW1lcmFcblx0XHRcblxuXHRcdEBwcm9jZXNzTWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWxcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHRyYW5zcGFyZW50OiBmYWxzZVxuXHRcdFx0dW5pZm9ybXM6IFxuXHRcdFx0XHRcInREaWZmdXNlXCI6IHsgdHlwZTogXCJ0XCIsIHZhbHVlOiB1bmRlZmluZWQgfVxuXG5cdFx0XHR2ZXJ0ZXhTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR2YXJ5aW5nIHZlYzIgdlV2O1xuXG5cdFx0XHRcdHZvaWQgbWFpbigpIHtcblx0XHRcdFx0XHR2VXYgPSB1djtcblx0XHRcdFx0XHRnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdGZyYWdtZW50U2hhZGVyOlxuXHRcdFx0XHRcIlwiXCJcblx0XHRcdFx0dW5pZm9ybSBzYW1wbGVyMkQgdERpZmZ1c2U7XG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdC8vIHJlYWQgdGhlIGlucHV0IGNvbG9yXG5cblx0XHRcdFx0XHR2ZWM0IG87XG5cdFx0XHRcdFx0dmVjNCBjO1xuXHRcdFx0XHRcdGMgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcblx0XHRcdFx0XHQvL28gPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcblxuXHRcdFx0XHRcdC8vbWlzYWxpZ24gcmdiXG5cdFx0XHRcdFx0by5yID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIC0wLjAwMSkgKS5yO1xuXHRcdFx0XHRcdG8uZyA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiArIHZlYzIoMC4wLCAwLjAwMSkgKS5nO1xuXHRcdFx0XHRcdG8uYiA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiArIHZlYzIoMC4wLCAwLjAwMykgKS5iO1xuXG5cdFx0XHRcdFx0Ly9zY2FubGluZXNcblx0XHRcdFx0XHRvLnIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIDEuMDtcblx0XHRcdFx0XHRvLmcgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIDEuMDtcblx0XHRcdFx0XHRvLmIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIDEuMDtcblxuXHRcdFx0XHRcdG8gKj0gMC41ICsgMS4wKjE2LjAqdlV2LngqdlV2LnkqKDEuMC12VXYueCkqKDEuMC12VXYueSk7XG5cdFx0XHRcdFx0XG5cblx0XHRcdFx0XHQvLyBzZXQgdGhlIG91dHB1dCBjb2xvclxuXHRcdFx0XHRcdGdsX0ZyYWdDb2xvciA9IG8gKiAuNSArIGMgKiAuNTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdEBxdWFkID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxICksIEBwcm9jZXNzTWF0ZXJpYWwgKTtcblx0XHRAcXVhZC5yb3RhdGlvbi54ID0gTWF0aC5QSVxuXHRcdEBzY2VuZS5hZGQgQHF1YWRcbiIsIlxuc2NvcmUgPSAwXG5leHBvcnRzLmRpc3BsYXlFbGVtZW50ID0gdW5kZWZpbmVkXG5cbmV4cG9ydHMuc2V0ID0gKF9zY29yZSktPlxuXHRzY29yZSA9IF9zY29yZVxuXHRkaXNwbGF5KClcblxuZXhwb3J0cy5hZGQgPSAocG9pbnRzKS0+XG5cdHNjb3JlICs9IHBvaW50c1xuXHRkaXNwbGF5KClcblxuXHQjIGNvbnNvbGUubG9nIGV4cG9ydHMuZGlzcGxheUVsZW1lbnRcbmRpc3BsYXkgPSAoKS0+XG5cdGlmIGV4cG9ydHMuZGlzcGxheUVsZW1lbnQ/XG5cdFx0ZXhwb3J0cy5kaXNwbGF5RWxlbWVudC50ZXh0IFwiU2NvcmU6ICN7c2NvcmV9XCJcblxuZXhwb3J0cy5nZXQgPSAoKS0+XG5cdHJldHVybiBzY29yZVxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5cbmNsYXNzIEhvbWVTY3JlZW4gZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3NjcmVlbnMvdGl0bGUucG5nXCJcblx0bWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0Z2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMjAsIDE1KVxuXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRAc2NlbmUuYWRkIEByb290XG5cdFx0XG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgNjQwIC8gNDgwLCAxLCAxMDAwMClcdFxuXHRcdEBjYW1lcmEucG9zaXRpb24ueiA9IHV0aWwubGF5ZXJTcGFjaW5nKCkgKiAxXG5cdFx0QHNjZW5lLmFkZCBAY2FtZXJhXG5cblx0XHRzY3JlZW4gPSBuZXcgVEhSRUUuTWVzaCBnZW9tZXRyeSwgbWF0ZXJpYWxcblx0XHRzY3JlZW4uc2NhbGUuc2V0KC4yNSwgLjI1LCAuMjUpXG5cdFx0c2NyZWVuLnBvc2l0aW9uLnogPSAgdXRpbC5sYXllclNwYWNpbmcoKSAqIC43NVxuXHRcdEByb290LmFkZCBzY3JlZW4gXG5cblxuZXhwb3J0cy5Ib21lU2NyZWVuID0gSG9tZVNjcmVlblxuXG5jbGFzcyBHYW1lT3ZlclNjcmVlbiBleHRlbmRzIEdhbWVPYmplY3Rcblx0dGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvc2NyZWVucy9nYW1lX292ZXIucG5nXCJcblx0bWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0Z2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMjAsIDE1KVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0QHNjZW5lLmFkZCBAcm9vdFxuXHRcdFxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIDY0MCAvIDQ4MCwgMSwgMTAwMDApXHRcblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB1dGlsLmxheWVyU3BhY2luZygpICogMVxuXHRcdEBzY2VuZS5hZGQgQGNhbWVyYVxuXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGdlb21ldHJ5LCBtYXRlcmlhbFxuXG5leHBvcnRzLkdhbWVPdmVyU2NyZWVuID0gR2FtZU92ZXJTY3JlZW5cbiIsIndpbmRvdy5BdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0fHx3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5jbGFzcyBTb3VuZFxuXHRjb25zdHJ1Y3RvcjogKEBuYW1lLCBAdXJsLCBAYnVmZmVyKS0+XG5leHBvcnRzLlNvdW5kID0gU291bmRcblxuZXhwb3J0cy5sb2FkZWRTb3VuZHMgPSBsb2FkZWRTb3VuZHMgPSB7fVxuXG5cbmV4cG9ydHMubG9hZCA9IGxvYWQgPSAobmFtZSwgdXJsKSAtPlxuXHRyZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHRyZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblx0XHRyZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybClcblx0XHRyZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cdFx0cmVxdWVzdC5vbmxvYWQgPSAoYSwgYiwgYyk9PlxuXHRcdFx0aWYgcmVxdWVzdC5zdGF0dXMgPT0gMjAwXG5cdFx0XHRcdGF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEgcmVxdWVzdC5yZXNwb25zZSwgXG5cdFx0XHRcdFx0KGJ1ZmZlcik9PlxuXHRcdFx0XHRcdFx0I3RvZG8gaGFuZGxlIGRlY29kaW5nIGVycm9yXG5cdFx0XHRcdFx0XHRzb3VuZCA9IG5ldyBTb3VuZChuYW1lLCB1cmwsIGJ1ZmZlcilcblx0XHRcdFx0XHRcdGV4cG9ydHMubG9hZGVkU291bmRzW25hbWVdID0gc291bmRcblx0XHRcdFx0XHRcdHJldHVybiByZXNvbHZlKHNvdW5kKVxuXHRcdFx0XHRcdCwoZXJyKT0+XG5cdFx0XHRcdFx0XHRyZWplY3QgRXJyb3IoXCJEZWNvZGluZyBFcnJvclwiKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRjb25zb2xlLmxvZyAgXCJTdGF0dXNcIlxuXHRcdFx0XHRyZWplY3QgRXJyb3IoXCJTdGF0dXMgRXJyb3JcIilcblxuXHRcdFx0XHRcblx0XHRyZXF1ZXN0Lm9uZXJyb3IgPSAoKS0+XG5cdFx0XHRjb25zb2xlLmxvZyBcImVycnJcIlxuXHRcdFx0cmVqZWN0IEVycm9yKFwiTmV0d29yayBFcnJvclwiKSBcdFxuXG5cdFx0cmVxdWVzdC5zZW5kKClcblx0XHRcdFxuXG5leHBvcnRzLnBsYXkgPSBwbGF5ID0gKGFyZyktPlxuXHRpZiB0eXBlb2YgYXJnID09ICdzdHJpbmcnXG5cdFx0YnVmZmVyID0gbG9hZGVkU291bmRzW2FyZ10uYnVmZmVyXG5cdGVsc2UgXG5cdFx0YnVmZmVyID0gYXJnXG5cdGlmIGJ1ZmZlcj9cblx0XHRzb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcblx0XHRzb3VyY2UuYnVmZmVyID0gYnVmZmVyXG5cdFx0c291cmNlLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKVxuXHRcdHNvdXJjZS5zdGFydCgwKVxuXG5cbmFzc2V0c0xvYWRpbmcgPSBbXVxuYXNzZXRzTG9hZGluZy5wdXNoIGxvYWQoJ3Nob290JywgJ2Fzc2V0cy9zb3VuZHMvc2hvb3Qud2F2JylcbmFzc2V0c0xvYWRpbmcucHVzaCBsb2FkKCdleHBsb3Npb24nLCAnYXNzZXRzL3NvdW5kcy9leHBsb3Npb24ud2F2JylcblxuUHJvbWlzZS5hbGwoYXNzZXRzTG9hZGluZylcbi50aGVuIChyZXN1bHRzKS0+XG5cdGNvbnNvbGUubG9nIFwiTG9hZGVkIGFsbCBTb3VuZHMhXCIsIHJlc3VsdHNcbi5jYXRjaCAoZXJyKS0+XG5cdGNvbnNvbGUubG9nIFwidWhvaFwiLCBlcnJcblxuIiwiRW5lbWllcyA9IHJlcXVpcmUgJy4vRW5lbWllcy5jb2ZmZWUnXG5cbmV4cG9ydHMubG9hZCA9IGxvYWQgPSAodXJsKSAtPlxuXHRyZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHRqcXhociA9ICQuZ2V0SlNPTiB1cmwsIEBvbkxvYWRcblxuXHRcdGpxeGhyLmRvbmUgKCktPlxuXHRcdFx0bGV2ZWwgPSBuZXcgVGlsZWRNYXAoanF4aHIucmVzcG9uc2VKU09OKVxuXHRcdFx0cmV0dXJuIHJlc29sdmUobGV2ZWwpXG5cblx0XHRqcXhoci5mYWlsICgpLT5cblx0XHRcdHJldHVybiByZWplY3QgRXJyb3IoXCJTdGF0dXMgRXJyb3JcIilcblxuXG5jbGFzcyBUaWxlZE1hcFxuXHRjb25zdHJ1Y3RvcjogKEBkYXRhKS0+XG5cdFx0QHRpbGVTZXRzID0gW11cblx0XHRAdGlsZXMgPSBbXVxuXHRcdEBsYXllcnMgPSB7fVxuXG5cdFx0IyBjcmVhdGUgdGlsZVNldHMsIGxvYWQgdGhlIHRleHR1cmVzXG5cdFx0Zm9yIHRpbGVTZXREYXRhIGluIGRhdGEudGlsZXNldHNcblx0XHRcdHRpbGVTZXQgPSBuZXcgVGlsZVNldCB0aWxlU2V0RGF0YVxuXHRcdFx0QHRpbGVTZXRzLnB1c2ggdGlsZVNldFxuXG5cdFx0IyBjcmVhdGUgdGlsZXMgQGdlb21ldGVyeSBhbmQgQG1hdGVyaWFsXG5cdFx0Zm9yIHRpbGVTZXQgaW4gQHRpbGVTZXRzXG5cdFx0XHRpZCA9IHRpbGVTZXQuZGF0YS5maXJzdGdpZFxuXHRcdFx0Zm9yIHJvdyBpbiBbMC4udGlsZVNldC5yb3dzLTFdXG5cdFx0XHRcdGZvciBjb2wgaW4gWzAuLnRpbGVTZXQuY29scy0xXVxuXHRcdFx0XHRcdHRpbGUgPSBuZXcgVGlsZSB0aWxlU2V0LCByb3csIGNvbFxuXHRcdFx0XHRcdEB0aWxlc1tpZF0gPSB0aWxlXG5cdFx0XHRcdFx0aWQrK1xuXG5cblx0XHQjIGxvYWQgbGF5ZXJzXG5cdFx0Zm9yIGxheWVyRGF0YSBpbiBkYXRhLmxheWVyc1xuXHRcdFx0aWYgbGF5ZXJEYXRhLnR5cGUgPT0gXCJ0aWxlbGF5ZXJcIlxuXHRcdFx0XHRAbGF5ZXJzW2xheWVyRGF0YS5uYW1lXSA9IG5ldyBUaWxlTGF5ZXIodGhpcywgbGF5ZXJEYXRhKVxuXHRcdFx0aWYgbGF5ZXJEYXRhLnR5cGUgPT0gXCJvYmplY3Rncm91cFwiXG5cdFx0XHRcdEBsYXllcnNbbGF5ZXJEYXRhLm5hbWVdID0gbmV3IE9iamVjdEdyb3VwKGxheWVyRGF0YSlcblxuXHRcblxuXHRsb2FkVGlsZUxheWVyOiAoZGF0YSk9PlxuXHRcdGxheWVyID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRmb3IgaWQsIGluZGV4IGluIGRhdGEuZGF0YVxuXHRcdFx0aWYgaWQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaW5kZXggLyBkYXRhLndpZHRoKVxuXHRcdFx0XHRjb2wgPSBpbmRleCAlIGRhdGEud2lkdGhcblx0XHRcdFx0dGlsZU9iamVjdCA9IG5ldyBUaWxlT2JqZWN0KEB0aWxlc1tpZF0sIG5ldyBUSFJFRS5WZWN0b3IzKGNvbCwgLXJvdyAtIDEsIDApIClcblx0XHRcdFx0bGF5ZXIuYWRkIHRpbGVPYmplY3Qucm9vdFx0XG5cdFx0cmV0dXJuIGxheWVyXG5cblx0XG5cblxuIyByZXByZXNlbnRzIGEgVGlsZVNldCBpbiBhIFRpbGVkIEVkaXRvciBsZXZlbFxuY2xhc3MgVGlsZVNldFxuXHRjb25zdHJ1Y3RvcjogKEBkYXRhKS0+XG5cdFx0QGNvbHMgPSBAZGF0YS5pbWFnZXdpZHRoIC8gQGRhdGEudGlsZXdpZHRoXG5cdFx0QHJvd3MgPSBAZGF0YS5pbWFnZWhlaWdodCAvIEBkYXRhLnRpbGVoZWlnaHRcblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvI3tAZGF0YS5pbWFnZX1cIlxuXHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFRlc3Q6IHRydWVcblx0XHRcdGRlcHRoV3JpdGU6IGZhbHNlXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXG4jIFJlcHJlc2VudHMgdGhlIEBnZW9tZXRyeSBhbmQgQG1hdGVyaWFsIG9mIGEgdGlsZSBsb2FkZWQgZnJvbSBhIFRpbGVkIEVkaXRvciBsZXZlbFxuY2xhc3MgVGlsZVxuXHRjb25zdHJ1Y3RvcjogKEB0aWxlU2V0LCBAcm93LCBAY29sKS0+XG5cdFx0IyB0b2RvLCBwcm9iYWJseSBiZSBwcmV0dGllciB0byBqdXN0IG1ha2UgdGhpcyBmcm9tIHNjcmF0Y2hcblx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggQHRpbGVTZXQuZGF0YS50aWxld2lkdGggLyAzMiwgQHRpbGVTZXQuZGF0YS50aWxlaGVpZ2h0IC8gMzIpXG5cdFx0XG5cdFx0IyBSZXBvc2l0aW9uIHZlcnRpY2VzIHRvIGxvd2VyIGxlZnQgYXQgMCwwIFxuXHRcdGZvciB2IGluIEBnZW9tZXRyeS52ZXJ0aWNlc1xuXHRcdFx0di54ICs9IEB0aWxlU2V0LmRhdGEudGlsZXdpZHRoIC8gMzIgLyAyXG5cdFx0XHR2LnkgKz0gQHRpbGVTZXQuZGF0YS50aWxlaGVpZ2h0IC8gMzIgLyAyXG5cdFx0QGdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWVcblxuXHRcdCMgY2FsYyBhbmQgc2V0IHV2c1xuXHRcdHV2V2lkdGggPSBAdGlsZVNldC5kYXRhLnRpbGV3aWR0aC9AdGlsZVNldC5kYXRhLmltYWdld2lkdGhcblx0XHR1dkhlaWdodCA9IEB0aWxlU2V0LmRhdGEudGlsZWhlaWdodC9AdGlsZVNldC5kYXRhLmltYWdlaGVpZ2h0XG5cblx0XHR1dlggPSB1dldpZHRoICogQGNvbFxuXHRcdHV2WSA9IHV2SGVpZ2h0ICogKEB0aWxlU2V0LnJvd3MgLSBAcm93IC0gMSlcblx0XHRmb3IgZmFjZSBpbiBAZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVxuXHRcdFx0Zm9yIHYgaW4gZmFjZVxuXHRcdFx0XHRpZiB2LnggPT0gMFxuXHRcdFx0XHRcdHYueCA9IHV2WFxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0di54ID0gdXZYICsgdXZXaWR0aCAjICogKDMxLjUvMzIuMCkgIyB0b2RvIGRpcnR5IGhhY2sgdG8gcHJldmVudCBzbGlnaHQgb3ZlcnNhbXBsZSBvbiB0aWxlIHNob3dpbmcgaGludCBvZiBuZXh0IHRpbGUgb24gZWRnZS5cblxuXHRcdFx0XHRpZiB2LnkgPT0gMFxuXHRcdFx0XHRcdHYueSA9IHV2WVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0di55ID0gdXZZICsgdXZIZWlnaHQgIyAqICgzMS41LzMyLjApICMgdG9kbyBkaXJ0eSBoYWNrIHRvIHByZXZlbnQgc2xpZ2h0IG92ZXJzYW1wbGUgb24gdGlsZSBzaG93aW5nIGhpbnQgb2YgbmV4dCB0aWxlIG9uIGVkZ2UuXHRcdFx0XHRcdFxuXHRcdEBnZW9tZXRyeS51dnNOZWVkVXBkYXRlID0gdHJ1ZVxuXG5cdFx0QG1hdGVyaWFsID0gQHRpbGVTZXQubWF0ZXJpYWxcblxuXHRcdFxuXG4jIFJlcHJlc2VudHMgYSBUaWxlTGF5ZXIgaW4gdGhlIFRpbGVkIEVkaXRvciBmaWxlLiBcbmNsYXNzIFRpbGVMYXllclxuXHRjb25zdHJ1Y3RvcjogKG1hcCwgQGRhdGEpLT5cblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0Zm9yIGlkLCBpbmRleCBpbiBAZGF0YS5kYXRhXG5cdFx0XHRpZiBpZCA+IDBcblx0XHRcdFx0cm93ID0gTWF0aC5mbG9vcihpbmRleCAvIGRhdGEud2lkdGgpXG5cdFx0XHRcdGNvbCA9IGluZGV4ICUgZGF0YS53aWR0aFxuXHRcdFx0XHQjIGNvbnNvbGUubG9nICBcInRpbGVcIiwgbWFwLCBtYXAudGlsZXNbaWRdXG5cdFx0XHRcdHRpbGVPYmplY3QgPSBuZXcgVGlsZU9iamVjdChtYXAudGlsZXNbaWRdLCBuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIC1yb3cgLSAxLCAwKSApXG5cdFx0XHRcdEByb290LmFkZCB0aWxlT2JqZWN0Lm1lc2hcdFxuXHRcdFxuXG4jIFJlcHJlc2VudHMgYW4gaW5zdGFuY2Ugb2YgYSB0aWxlIHRvIGJlIHJlbmRlcmVkXG5jbGFzcyBUaWxlT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAodGlsZSwgcG9zaXRpb24pLT5cblx0XHRAbWVzaCA9IG5ldyBUSFJFRS5NZXNoIHRpbGUuZ2VvbWV0cnksIHRpbGUubWF0ZXJpYWxcblx0XHRAbWVzaC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXHRcblxuY2xhc3MgT2JqZWN0R3JvdXBcblx0Y29uc3RydWN0b3I6IChAZGF0YSktPlxuXHRcdEBvYmplY3RzID0gW11cblx0XHRmb3Igb2JqZWN0RGF0YSBpbiBAZGF0YS5vYmplY3RzIFxuXHRcdFx0ZW5lbXkgPSBuZXcgRW5lbWllc1tvYmplY3REYXRhLnR5cGVdKG5ldyBUSFJFRS5WZWN0b3IzKG9iamVjdERhdGEueCAvIDMyLCA3IC0gb2JqZWN0RGF0YS55IC8gMzIsIDApKVxuXHRcdFx0QG9iamVjdHMucHVzaCBlbmVteVxuIiwiU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcbkNvbGxpc2lvbnMgPSByZXF1aXJlICcuL0NvbGxpc2lvbnMuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcblxuY2xhc3MgZXhwb3J0cy5CdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25zLkNvbGxpc2lvbk9iamVjdFxuXHRidWxsZXRUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy93ZWFwb25zL2J1bGxldC5wbmdcIlxuXHRidWxsZXRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBidWxsZXRUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRidWxsZXRHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKVxuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMjAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBidWxsZXRHZW9tZXRyeSwgYnVsbGV0TWF0ZXJpYWxcblxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0XHRAY29sbGlkZXJUeXBlID0gXCJidWxsZXRcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteVwiXG5cdFx0QGFuZ2xlID0gMFxuXHRcdEBzcGVlZCA9IDE1XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IE1hdGguY29zKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBNYXRoLnNpbihAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnJvdGF0aW9uLnogPSBAYW5nbGVcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5cblx0Y29sbGlkZUludG86ICh0YXJnZXQpLT5cblx0XHRzdXBlcih0YXJnZXQpXG5cdFx0U2NvcmUuYWRkKDEpXG5cdFx0QGRpZSgpXG5cdFx0Zm9yIGkgaW4gWzAuLjVdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDEpXG5cblxuY2xhc3MgZXhwb3J0cy5FbmVteUJ1bGxldCBleHRlbmRzIENvbGxpc2lvbnMuQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0XzIucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSlcblx0XG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMjAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBidWxsZXRHZW9tZXRyeSwgYnVsbGV0TWF0ZXJpYWxcblxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0XHRAY29sbGlkZXJUeXBlID0gXCJidWxsZXRcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteVwiXG5cdFx0QGFuZ2xlID0gMFxuXHRcdEBzcGVlZCA9IDE1XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IE1hdGguY29zKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBNYXRoLnNpbihAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnJvdGF0aW9uLnogPSBAYW5nbGVcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5cblx0Y29sbGlkZUludG86ICh0YXJnZXQpLT5cblx0XHRzdXBlcih0YXJnZXQpXG5cdFx0U2NvcmUuYWRkKDEpXG5cdFx0QGRpZSgpXG5cdFx0Zm9yIGkgaW4gWzAuLjVdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDEpXG4iLCJHYW1lID0gcmVxdWlyZSAnLi9HYW1lLmNvZmZlZSdcblxuXG5tb2R1bGUuZXhwb3J0cy5HYW1lID0gbmV3IEdhbWUuR2FtZSgpXG5cblx0XHRcblxuIyBtb2RlbExvYWRlciA9IG5ldyBjb3JlLk1vZGVsTG9hZGVyKClcblxuXG5cdFx0XHRcblxuXG4iLCJleHBvcnRzLmFmdGVyID0gKGRlbGF5LCBmdW5jKS0+XG5cdHNldFRpbWVvdXQgZnVuYywgZGVsYXlcblxuZXhwb3J0cy5yYW5kb20gPSAobWluLCBtYXgpLT5cblx0cmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcblxuXG5leHBvcnRzLmxheWVyU3BhY2luZyA9ICgpLT5cblx0Zm92X3JhZGlhbnMgPSA0NSAqIChNYXRoLlBJIC8gMTgwKVxuXHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wO1xuIl19
