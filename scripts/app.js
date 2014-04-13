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
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    $("#shump")[0].appendChild(this.stats.domElement);
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
    this.stats.update();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0VuZW1pZXMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9HYW1lLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvR2FtZU9iamVjdC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0lucHV0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvTGV2ZWwuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9Nb2RlbExvYWRlci5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1BhcnRpY2xlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGxheWVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUG9zdEVmZmVjdHMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NjcmVlbnMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9Tb3VuZC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1RpbGVkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL3NodW1wLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGtCQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsc0JBQVIsQ0FBUixDQUFBOztBQUFBLENBRUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsS0FBakIsQ0FBdUIsU0FBQSxHQUFBO0FBRXRCLE1BQUEsc0VBQUE7QUFBQSxFQUFBLENBQUEsQ0FBRSxRQUFGLENBQVksQ0FBQSxDQUFBLENBQUUsQ0FBQyx1QkFBZixDQUF1QyxPQUFPLENBQUMsb0JBQS9DLENBQUEsQ0FBQTtBQUFBLEVBRUEsTUFBQSxHQUFTLENBQUEsQ0FBRSxlQUFGLENBRlQsQ0FBQTtBQUFBLEVBR0EsWUFBQSxHQUFlLE1B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R0FBeUMsS0FGN0I7QUFBQSxDQVB2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJzaHVtcCA9IHJlcXVpcmUoJy4vc2h1bXAvc2h1bXAuY29mZmVlJylcblxuJChcIiNmdWxsc2NyZWVuXCIpLmNsaWNrICgpLT5cblx0XG5cdCQoXCIjc2h1bXBcIilbMF0ud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4oRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCk7XG5cdFxuXHRjYW52YXMgPSAkKFwiI3NodW1wIGNhbnZhc1wiKVxuXHRjYW52YXNBc3BlY3QgPSBjYW52YXMud2lkdGgoKSAvIGNhbnZhcy5oZWlnaHQoKVxuXG5cdGNvbnRhaW5lcldpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblx0Y29udGFpbmVySGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG5cdGNvbnRhaW5lckFzcGVjdCA9IGNvbnRhaW5lcldpZHRoIC8gY29udGFpbmVySGVpZ2h0XG5cdGNvbnNvbGUubG9nIGNhbnZhc0FzcGVjdCwgJCh3aW5kb3cpLndpZHRoKCkgLCAkKHdpbmRvdykuaGVpZ2h0KCksIGNvbnRhaW5lckFzcGVjdFxuXHRcblx0aWYgY2FudmFzQXNwZWN0IDwgY29udGFpbmVyQXNwZWN0XG5cdFx0Y29uc29sZS5sb2cgXCJtYXRjaCBoZWlnaHRcIlxuXHRcdGNhbnZhcy5oZWlnaHQgY29udGFpbmVySGVpZ2h0XG5cdFx0Y2FudmFzLndpZHRoIGNvbnRhaW5lckhlaWdodCAqIGNhbnZhc0FzcGVjdFxuXHRlbHNlXG5cdFx0Y29uc29sZS5sb2cgXCJtYXRjaCB3aWR0aFwiXG5cdFx0Y2FudmFzLndpZHRoIGNvbnRhaW5lcldpZHRoXG5cdFx0Y2FudmFzLmhlaWdodCBjb250YWluZXJXaWR0aCAvIGNhbnZhc0FzcGVjdFxuXG4kKFwiI2RlYnVnXCIpLmFwcGVuZChcIlwiXCI8c3BhbiBpZD1cImxldmVsQ2hpbGRyZW5cIj5cIlwiXCIpXG5cblxudXBkYXRlRGVidWcgPSAoKS0+XG5cdCQoXCIjbGV2ZWxDaGlsZHJlblwiKS50ZXh0IFwiXCJcImxldmVsLmNoaWxkcmVuID0gI3tzaHVtcC5HYW1lLmxldmVsLmNoaWxkcmVuLmxlbmd0aH1cIlwiXCJcblxuXG5cbiMgdGVzdEl0ID0gKCktPlxuIyBcdGNvbnNvbGUubG9nIFwidGVzdEl0XCJcblxuIyBjbGFzcyBNeVN1cGVyXG4jIFx0dGVzdDogXCJNeVN1cGVyVGVzdFwiXG4jIFx0YW5vdGhlclRoaW5nOiB0ZXN0SXQoKVxuIyBcdGNvbnN0cnVjdG9yOiAoKS0+XG4jIFx0XHRjb25zb2xlLmxvZyBAdGVzdFxuXG5cblxuIyBjbGFzcyBNeVN1YiBleHRlbmRzIE15U3VwZXJcbiMgXHR0ZXN0OiBcIk15U3ViVGVzdFwiXG5cblxuXG4jIG5ldyBNeVN1YigpXG4jIG5ldyBNeVN1YigpXG4jIG5ldyBNeVN1YigpXG4jIG5ldyBNeVN1YigpXG4jIG5ldyBNeVN1cGVyKClcbiIsImNsYXNzIEJhc2Vcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAX2V2ZW50cyA9IHt9XG5cblx0b246IChldmVudCwgaGFuZGxlcikgLT5cblx0XHQoQF9ldmVudHNbZXZlbnRdID89IFtdKS5wdXNoIGhhbmRsZXJcblx0XHRyZXR1cm4gdGhpc1xuXG5cdG9mZjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdGZvciBzdXNwZWN0LCBpbmRleCBpbiBAX2V2ZW50c1tldmVudF0gd2hlbiBzdXNwZWN0IGlzIGhhbmRsZXJcblx0XHRcdEBfZXZlbnRzW2V2ZW50XS5zcGxpY2UgaW5kZXgsIDFcblx0XHRyZXR1cm4gdGhpc1xuXG5cdHRyaWdnZXI6IChldmVudCwgYXJncy4uLikgPT5cblx0XHRyZXR1cm4gdGhpcyB1bmxlc3MgQF9ldmVudHNbZXZlbnRdP1xuXHRcdGZvciBpIGluIFtAX2V2ZW50c1tldmVudF0ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRoYW5kbGVyID0gQF9ldmVudHNbZXZlbnRdW2ldXG5cdFx0XHRoYW5kbGVyLmFwcGx5IHRoaXMsIGFyZ3Ncblx0XHRyZXR1cm4gdGhpc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBDb2xsaXNpb25PYmplY3QgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSB1bmRlZmluZWRcblx0XHRAY29sbGlkZXJIaXRUeXBlcyA9IFtdXG5cdFx0QGhwID0gMVxuXHRcdEBkcCA9IDFcblx0XHRAY29sbGlzaW9uUmFkaXVzID0gLjZcblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHRhcmdldC50YWtlRGFtYWdlKEBkcClcblx0XHQjIEBkaWUoKVxuXHRcdCMgZ2FtZU9iamVjdC5kaWUoKVxuXG5cdHRha2VEYW1hZ2U6IChkYW1hZ2UpLT5cblx0XHRAaHAgLT0gZGFtYWdlXG5cdFx0aWYgQGhwIDw9IDAgXG5cdFx0XHRAZGllKClcblxubW9kdWxlLmV4cG9ydHMuQ29sbGlzaW9uT2JqZWN0ID0gQ29sbGlzaW9uT2JqZWN0XG5cblxuXG5tb2R1bGUuZXhwb3J0cy5yZXNvbHZlQ29sbGlzaW9ucyA9IChjb2xsaWRlcnMpLT5cblx0Zm9yIGEgaW4gY29sbGlkZXJzXG5cdFx0aWYgYS5hY3RpdmVcblx0XHRcdGZvciBiIGluIGNvbGxpZGVyc1xuXHRcdFx0XHRpZiBiLmFjdGl2ZVxuXHRcdFx0XHRcdGlmIGEuY29sbGlkZXJIaXRUeXBlcy5pbmRleE9mKGIuY29sbGlkZXJUeXBlKSA+IC0xXG5cdFx0XHRcdFx0XHRpZiBAdGVzdENvbGxpc2lvbiBhLCBiXG5cdFx0XHRcdFx0XHRcdGEuY29sbGlkZUludG8gYlxuXG5tb2R1bGUuZXhwb3J0cy50ZXN0Q29sbGlzaW9uID0gKGEsIGIpLT5cblx0cmV0dXJuIGEucm9vdC5wb3NpdGlvbi5kaXN0YW5jZVRvU3F1YXJlZChiLnJvb3QucG9zaXRpb24pIDwgYS5jb2xsaXNpb25SYWRpdXMgKyBiLmNvbGxpc2lvblJhZGl1c1xuIiwiXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9ucyA9IHJlcXVpcmUgJy4vQ29sbGlzaW9ucy5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuV2VhcG9ucyA9IHJlcXVpcmUgJy4vV2VhcG9ucy5jb2ZmZWUnXG5cblxuY2xhc3MgQmFzaWMgZXh0ZW5kcyBDb2xsaXNpb25zLkNvbGxpc2lvbk9iamVjdFxuXG5cdGVuZW15VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvZW5lbWllcy9lbmVteS5wbmdcIlxuXHRlbmVteU1hdGVyaWFsOiBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogZW5lbXlUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdGVuZW15R2VvbWV0cnk6IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImVuZW15XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwicGxheWVyXCJcblxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBAZW5lbXlHZW9tZXRyeSwgQGVuZW15TWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXHRcdEBhZ2UgPSAwXG5cdFx0QGhhc0ZpcmVkID0gZmFsc2VcblxuXHRcdEBhY3RpdmUgPSBmYWxzZVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QGFnZSArPSBkZWx0YVxuXHRcdFxuXHRcblx0ZGllOiAoKS0+XG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDMpXG5cdFx0c3VwZXIoKVxuXG5cbmNsYXNzIEJvc3MgZXh0ZW5kcyBCYXNpY1xuXHRlbmVteVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL2VuZW1pZXMvYm9zcy5wbmdcIlxuXHRlbmVteU1hdGVyaWFsOiBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogZW5lbXlUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdGVuZW15R2VvbWV0cnk6IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCA0LCA2KTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIocG9zaXRpb24pXG5cdFx0QGhwID0gMjBcblx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblxuXHRcdGlmIEBhZ2UgPCAyXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54IC09IDEgKiBkZWx0YVxuXHRcdGlmIEBhZ2UgPiAyXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSArPSBkZWx0YSAqIE1hdGguc2luKEBhZ2UpXG5cblx0XHRpZiBAYWdlICUgNCA+IDFcblx0XHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cdFx0XG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcdGlmIERhdGUubm93KCkgPiBAbGFzdEZpcmUgKyAyNTBcblx0XHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRcdFxuXHRcdFx0cG9zID0gQHJvb3QucG9zaXRpb24uY2xvbmUoKVxuXHRcdFx0cG9zLnkgLT0gMS44XG5cdFx0XHRwb3MueCAtPSAxLjZcblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KHBvcylcblx0XHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gTWF0aC5QSVxuXHRcdFx0YnVsbGV0LnNwZWVkID0gN1xuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblxuXHRcdFx0cG9zID0gQHJvb3QucG9zaXRpb24uY2xvbmUoKVxuXHRcdFx0cG9zLnkgKz0gMS44XG5cdFx0XHRwb3MueCAtPSAxLjZcblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KHBvcylcblx0XHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gTWF0aC5QSVxuXHRcdFx0YnVsbGV0LnNwZWVkID0gN1xuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXHRkaWU6ICgpLT5cblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMDBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDEwKVxuXG5cdFx0Zm9yIGkgaW4gWzAuLjEwMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgNSlcblxuXHRcdHN1cGVyKClcblxuXG5leHBvcnRzLkJvc3MgPSBCb3NzXG5cblxuXG5jbGFzcyBTaW5XYXZlIGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSAtMSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBkZWx0YSAqIE1hdGguc2luKEBhZ2UpXG5cbmNsYXNzIERhcnQgZXh0ZW5kcyBCYXNpY1xuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVx0XHRcblx0XHRpZiBAYWdlIDwgLjVcblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gLTIwICogZGVsdGFcblx0XHRlbHNlIGlmIEBhZ2UgPCAzXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdGVsc2Vcblx0XHRcdEBkaWUoKVxuXG5cdFx0aWYgQGFnZSA+IDEgYW5kIG5vdCBAaGFzRmlyZWRcblx0XHRcdEBoYXNGaXJlZCA9IHRydWVcblx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFxuXHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuRW5lbXlCdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cblx0XHRidWxsZXQuY29sbGlkZXJUeXBlID0gXCJlbmVteV9idWxsZXRcIlxuXHRcdGJ1bGxldC5jb2xsaWRlckhpdFR5cGVzID0gW1wicGxheWVyXCJdXG5cdFx0YnVsbGV0LmFuZ2xlID0gTWF0aC5QSSAtIC4yNVxuXHRcdGJ1bGxldC5zcGVlZCA9IDVcblxuXHRcdEBwYXJlbnQuYWRkIGJ1bGxldFx0XG5cblx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5FbmVteUJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJICsgLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXG5leHBvcnRzLkJhc2ljID0gQmFzaWNcbmV4cG9ydHMuU2luV2F2ZSA9IFNpbldhdmVcbmV4cG9ydHMuRGFydCA9IERhcnRcblxuIyBzdXBlcihkZWx0YSlcblx0XHQjIGlmIEBhZ2UgPCAxXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMlxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi55ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDIuMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdCMgZWxzZVxuXHRcdCMgXHRAZGllKClcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcbkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuTGV2ZWwgPSByZXF1aXJlICcuL0xldmVsLmNvZmZlZSdcblNjcmVlbnMgPSByZXF1aXJlICcuL1NjcmVlbnMuY29mZmVlJ1xuU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcblBvc3RFZmZlY3RzID0gcmVxdWlyZSAnLi9Qb3N0RWZmZWN0cy5jb2ZmZWUnXG5cbiMgR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5cblxuXG5jbGFzcyBHYW1lIGV4dGVuZHMgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHQjIGluaXRpYWxpemUgc3RhdGVcblx0XHRAbGl2ZXMgPSAzXG5cblx0XHQjIGNyZWF0ZSByZW5kZXJlclxuXHRcdEByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKClcblx0XHRAcmVuZGVyZXIuc2V0U2l6ZSA2NDAsIDQ4MFxuXHRcdCQoXCIjc2h1bXBcIilbMF0uYXBwZW5kQ2hpbGQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcblxuXHRcdCMgdG9kbyBuZWFyZXN0IGJldHRlcj9cblx0XHRAd29ybGRUZXh0dXJlID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0IDY0MCwgNDgwLCBcblx0XHRcdG1pbkZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyIFxuXHRcdFx0bWFnRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdGZvcm1hdDogVEhSRUUuUkdCRm9ybWF0XG5cblx0XHQjIHNjcmVlbkVmZmVjdCBcblx0XHRAc2NyZWVuRWZmZWN0ID0gbmV3IFBvc3RFZmZlY3RzLlNjcmVlbkVmZmVjdCgpXG5cdFx0QHNjcmVlbkVmZmVjdC5wcm9jZXNzTWF0ZXJpYWwudW5pZm9ybXMudERpZmZ1c2UudmFsdWUgPSBAd29ybGRUZXh0dXJlXG5cdFx0IyBjb25zb2xlLmxvZyBcIm1hdFwiLCBAc2NyZWVuRWZmZWN0LnByb2Nlc3NNYXRlcmlhbFxuXG5cdFx0IyBjbG9ja1xuXHRcdEBjbG9jayA9IG5ldyBUSFJFRS5DbG9jaygpXG5cblx0XHQjIGNyZWF0ZSBzdGF0c1xuXHRcdEBzdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCggQHN0YXRzLmRvbUVsZW1lbnQgKVxuXHRcdFxuXHRcdCMgaHVkXG5cdFx0U2NvcmUuZGlzcGxheUVsZW1lbnQgPSAkKFwiXCJcIjxoMT5TY29yZTo8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdEBsaXZlc0VsZW1lbnQgPSAkKFwiXCJcIjxoMT5MaXZlczo8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXG5cdFx0IyBvdGhlciBzY3JlZW5zXG5cdFx0QHN0YXRlID0gXCJob21lXCJcblx0XHRAaG9tZVNjcmVlbiA9IG5ldyBTY3JlZW5zLkhvbWVTY3JlZW4oKVxuXHRcdEBnYW1lT3ZlclNjcmVlbiA9IG5ldyBTY3JlZW5zLkdhbWVPdmVyU2NyZWVuKClcblxuXHRcdCMgdG9kbywgY2xlYW4gdGhpcyB1cCBsZXQgc2NyZWVucyBoYW5kbGUgdGhlaXIgaW5wdXQgYW5kIHNlbmQgbWVzc2FnZXMgd2hlbiB0aGV5IGFyZSBkb25lLiBtYXliZSB0aHJvdWdoIGEgZ2xvYmFsIGV2ZW50IGJyb2FkY2FzdGVyXG5cdFx0JCh3aW5kb3cpLmtleWRvd24gKGUpPT5cblx0XHRcdGlmIEBzdGF0ZSA9PSBcImhvbWVcIlxuXHRcdFx0XHRAc3RhdGUgPSBcImxvYWRpbmdcIlxuXHRcdFx0XHRAc3RhcnRHYW1lKClcblx0XHRcdFx0cmV0dXJuXG5cblx0XHRcdGlmIEBzdGF0ZSA9PSBcImdhbWVfb3ZlclwiXG5cdFx0XHRcdEBzdGF0ZSA9IFwiaG9tZVwiXG5cdFx0XHRcdHJldHVyblxuXG5cdFx0IyBsb2FkIGFzc2V0c1xuXG5cdFx0IyBiZWdpbiBnYW1lXG5cdFx0dXRpbC5hZnRlciAxLCAoKT0+XG5cdFx0XHRAYW5pbWF0ZSgpXG5cblxuXHRzdGFydEdhbWU6ICgpLT5cblx0XHRAbGl2ZXMgPSAzXG5cdFx0QGxpdmVzRWxlbWVudC50ZXh0IFwiTGl2ZXM6ICN7QGxpdmVzfVwiXG5cblx0XHRTY29yZS5zZXQgMFxuXG5cdFx0IyBsZXZlbFxuXHRcdEBsZXZlbCA9IG5ldyBMZXZlbC5MZXZlbCgpXG5cdFx0QGxldmVsLm9uIFwicGxheWVyRGllXCIsICgpPT5cblx0XHRcdEBsaXZlcy0tXG5cdFx0XHRAbGl2ZXNFbGVtZW50LnRleHQgXCJMaXZlczogI3tAbGl2ZXN9XCJcblxuXHRcdFx0aWYgQGxpdmVzID4gMFxuXHRcdFx0XHR1dGlsLmFmdGVyIDEwMDAsIEBsZXZlbC5pbnNlcnRQbGF5ZXJcblx0XHRcdGVsc2Vcblx0XHRcdFx0QHN0YXRlID0gXCJnYW1lX292ZXJcIlxuXG5cdFx0QGxldmVsLm9uIFwicmVhZHlcIiwgKCk9PlxuXHRcdFx0QHN0YXRlID0gXCJwbGF5XCJcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGlmIEBzdGF0ZSA9PSBcImhvbWVcIlxuXHRcdFx0QGhvbWVTY3JlZW4udXBkYXRlKGRlbHRhKVxuXG5cdFx0aWYgQHN0YXRlID09IFwicGxheVwiXG5cdFx0XHRAbGV2ZWwudXBkYXRlKGRlbHRhKVxuXG5cdFx0aWYgQHN0YXRlID09IFwiZ2FtZV9vdmVyXCJcblx0XHRcdEBsZXZlbC51cGRhdGUoZGVsdGEpXG5cdFx0XHRAZ2FtZU92ZXJTY3JlZW4udXBkYXRlKGRlbHRhKVxuXG5cblx0cmVuZGVyOiAoKT0+XG5cdFx0QHJlbmRlcmVyLmF1dG9DbGVhciA9IGZhbHNlXG5cdFx0aWYgQHN0YXRlID09IFwiaG9tZVwiXG5cdFx0XHRAcmVuZGVyZXIucmVuZGVyIEBob21lU2NyZWVuLnNjZW5lLCBAaG9tZVNjcmVlbi5jYW1lcmEsIEB3b3JsZFRleHR1cmUsIHRydWVcblx0XHRcblx0XHRpZiBAc3RhdGUgPT0gXCJwbGF5XCJcdFxuXHRcdFx0QHJlbmRlcmVyLnJlbmRlciBAbGV2ZWwuc2NlbmUsIEBsZXZlbC5jYW1lcmEsIEB3b3JsZFRleHR1cmUsIHRydWVcblx0XHRcdEByZW5kZXJlci5yZW5kZXIgQGhvbWVTY3JlZW4uc2NlbmUsIEBsZXZlbC5jYW1lcmEsIEB3b3JsZFRleHR1cmUsIGZhbHNlXG5cblx0XHRpZiBAc3RhdGUgPT0gXCJnYW1lX292ZXJcIlxuXHRcdFx0QHJlbmRlcmVyLnJlbmRlciBAbGV2ZWwuc2NlbmUsIEBsZXZlbC5jYW1lcmEsIEB3b3JsZFRleHR1cmUsIHRydWVcblx0XHRcdEByZW5kZXJlci5yZW5kZXIgQGdhbWVPdmVyU2NyZWVuLnNjZW5lLCBAZ2FtZU92ZXJTY3JlZW4uY2FtZXJhLCBAd29ybGRUZXh0dXJlLCBmYWxzZVxuXHRcdFx0XG5cdFx0QHJlbmRlcmVyLnJlbmRlciBAc2NyZWVuRWZmZWN0LnNjZW5lLCBAc2NyZWVuRWZmZWN0LmNhbWVyYVxuXG5cblx0YW5pbWF0ZTogPT5cblx0XHQjIHVwZGF0ZSB0aGUgZ2FtZSBwaHlzaWNzXG5cdFx0ZGVsdGEgPSBAY2xvY2suZ2V0RGVsdGEoKVxuXHRcdGlmIChkZWx0YSA8IC41KSBcblx0XHRcdEB1cGRhdGUoZGVsdGEpXG5cblx0XHQjIHJlbmRlciB0byBzY3JlZW5cblx0XHRAcmVuZGVyKClcblxuXHRcdCMgdXBkYXRlIGZwcyBvdmVybGF5XG5cdFx0QHN0YXRzLnVwZGF0ZSgpXG5cblx0XHQjIHJlcGVhdFxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSBAYW5pbWF0ZVxuXHRcdHJldHVyblxuXG5cbmV4cG9ydHMuR2FtZSA9IEdhbWVcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBHYW1lT2JqZWN0IGV4dGVuZHMgQmFzZVxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRzdXBlcigpXG5cblx0XHRAcGFyZW50ID0gdW5kZWZpbmVkXG5cdFx0QGNoaWxkcmVuID0gW11cblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0QGRlYWQgPSBmYWxzZVxuXHRcdEBhY3RpdmUgPSB0cnVlXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRmb3IgaSBpbiBbQGNoaWxkcmVuLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0Y2hpbGQgPSBAY2hpbGRyZW5baV1cblx0XHRcdGlmIGNoaWxkLmRlYWRcblx0XHRcdFx0QHJlbW92ZSBjaGlsZFxuXHRcdFx0XHRjb250aW51ZVxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlXG5cdFx0XHRcdGNoaWxkLnVwZGF0ZSBkZWx0YSBcblx0XG5cdGFjdGl2YXRlOiAoKS0+XG5cdFx0QGFjdGl2ZSA9IHRydWU7XG5cdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gdGhpc1xuXHRcdEBjaGlsZHJlbi5wdXNoKGdhbWVPYmplY3QpXG5cdFx0QHJvb3QuYWRkKGdhbWVPYmplY3Qucm9vdClcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRAcm9vdC5yZW1vdmUoZ2FtZU9iamVjdC5yb290KVxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gbnVsbFxuXHRcdGkgPSAgQGNoaWxkcmVuLmluZGV4T2YoZ2FtZU9iamVjdClcblx0XHRpZiBpID49IDBcblx0XHRcdEBjaGlsZHJlbi5zcGxpY2UoaSwgMSk7XG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRkaWU6ICgpLT5cblx0XHRAZGVhZCA9IHRydWU7XG5cdFx0QHRyaWdnZXIgXCJkaWVcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPYmplY3RcbiIsImNsYXNzIElucHV0XG5cdGtleU1hcDogXG5cdFx0XCIzOFwiOlwidXBcIiAjdXAgYXJyb3dcblx0XHRcIjg3XCI6XCJ1cFwiICN3XG5cdFx0XCI0MFwiOlwiZG93blwiICNkb3duIGFycm93XG5cdFx0XCI4M1wiOlwiZG93blwiICNzXG5cdFx0XCIzN1wiOlwibGVmdFwiICNsZWZ0IGFycm93XG5cdFx0XCI2NVwiOlwibGVmdFwiICNhXG5cdFx0XCIzOVwiOlwicmlnaHRcIiAjcmlnaHQgYXJyb3dcblx0XHRcIjY4XCI6XCJyaWdodFwiICNkXG5cdFx0XCIzMlwiOlwiZmlyZV9wcmltYXJ5XCIgI3NwYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGtleVN0YXRlcyA9IFtdXG5cblx0XHRmb3Iga2V5LCB2YWx1ZSBvZiBAa2V5TWFwXG5cdFx0XHRAa2V5U3RhdGVzW3ZhbHVlXSA9IGZhbHNlO1xuXG5cdFx0JCh3aW5kb3cpLmtleWRvd24gKGUpPT5cblx0XHRcdCMgY29uc29sZS5sb2cgZS53aGljaFxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gdHJ1ZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdCQod2luZG93KS5rZXl1cCAoZSk9PlxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gZmFsc2U7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cbmlucHV0ID0gbmV3IElucHV0KClcbm1vZHVsZS5leHBvcnRzID0gaW5wdXRcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblRpbGVkID0gcmVxdWlyZSAnLi9UaWxlZC5jb2ZmZWUnXG5QbGF5ZXIgPSByZXF1aXJlICcuL1BsYXllci5jb2ZmZWUnXG5HYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbkNvbGxpc2lvbnMgPSByZXF1aXJlICcuL0NvbGxpc2lvbnMuY29mZmVlJ1xuXG5jbGFzcyBMZXZlbCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGNvbGxpZGVycyA9IFtdXG5cblx0XHQjIGNyZWF0ZSBzY2VuZVxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0QHNjZW5lLmFkZCBAcm9vdFxuXG5cdFx0IyBjYW1lcmFcblx0XHRAY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCA2NDAgLyA0ODAsIDEsIDEwMDAwKVx0XG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdXRpbC5sYXllclNwYWNpbmcoKSAqIDFcblx0XHRAc2NlbmUuYWRkIEBjYW1lcmFcblxuXHRcdCMgbGlnaHRzXG5cdFx0QGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuXHRcdEByb290LmFkZChAYW1iaWVudExpZ2h0KVxuXG5cblx0XHQjIGluc2VydCBwbGF5ZXJcblx0XHRAaW5zZXJ0UGxheWVyKClcblxuXG5cdFx0IyBsZXZlbFxuXHRcdFRpbGVkLmxvYWQoJ2Fzc2V0cy9sZXZlbF8xLmpzb24nKS50aGVuKEBwb3B1bGF0ZSkuY2F0Y2ggKGVycm9yKS0+XG5cdCBcdFx0Y29uc29sZS5lcnJvciBlcnJvclxuXG5cdHBvcHVsYXRlOiAobWFwKT0+XG5cdFx0QHJvb3QuYWRkKG1hcC5sYXllcnMuYmFja2dyb3VuZC5yb290KVxuXHRcdG1hcC5sYXllcnMuYmFja2dyb3VuZC5yb290LnBvc2l0aW9uLnkgPSA3LjUgKiAyXG5cdFx0bWFwLmxheWVycy5iYWNrZ3JvdW5kLnJvb3QucG9zaXRpb24ueiA9ICB1dGlsLmxheWVyU3BhY2luZygpICogLTFcblx0XHRtYXAubGF5ZXJzLmJhY2tncm91bmQucm9vdC5zY2FsZS5zZXQoMiwgMiwgMilcblx0XHRcblx0XHRAcm9vdC5hZGQobWFwLmxheWVycy5taWRncm91bmQucm9vdClcblx0XHRtYXAubGF5ZXJzLm1pZGdyb3VuZC5yb290LnBvc2l0aW9uLnkgPSA3LjVcblxuXHRcdGZvciBvYmplY3QgaW4gbWFwLmxheWVycy5lbmVtaWVzLm9iamVjdHNcblx0XHRcdEBhZGQgb2JqZWN0XG5cblx0XHRAdHJpZ2dlciBcInJlYWR5XCJcblxuXHRpbnNlcnRQbGF5ZXI6ICgpPT5cblx0XHRAcGxheWVyMSA9IG5ldyBQbGF5ZXIoKVxuXHRcdEBhZGQgQHBsYXllcjFcblx0XHRAcGxheWVyMS5yb290LnBvc2l0aW9uLmNvcHkgQGNhbWVyYS5wb3NpdGlvblxuXHRcdEBwbGF5ZXIxLnJvb3QucG9zaXRpb24ueiA9IDBcblxuXHRcdEBwbGF5ZXIxLm9uIFwiZGllXCIsICgpPT5cblx0XHRcdEB0cmlnZ2VyIFwicGxheWVyRGllXCJcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVxuXHRcdEBjYW1lcmEucG9zaXRpb24ueCArPSAxICogZGVsdGFcblx0XHRAcGxheWVyMS5yb290LnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cblx0XHRmb3IgY2hpbGQgaW4gQGNoaWxkcmVuXG5cdFx0XHRpZiBjaGlsZC5hY3RpdmUgPT0gZmFsc2UgYW5kIGNoaWxkLnJvb3QucG9zaXRpb24ueCA8IEBjYW1lcmEucG9zaXRpb24ueCArIDEwXG5cdFx0XHRcdGNoaWxkLmFjdGl2YXRlKClcblxuXHRcdENvbGxpc2lvbnMucmVzb2x2ZUNvbGxpc2lvbnMoQGNvbGxpZGVycylcblxuXHRcblx0XHRcdFxuXG5cdGFkZDogKGdhbWVPYmplY3QpLT5cblx0XHRpZiBnYW1lT2JqZWN0IGluc3RhbmNlb2YgQ29sbGlzaW9ucy5Db2xsaXNpb25PYmplY3Rcblx0XHRcdEBjb2xsaWRlcnMucHVzaCBnYW1lT2JqZWN0IFxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRpID0gIEBjb2xsaWRlcnMuaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNvbGxpZGVycy5zcGxpY2UoaSwgMSlcblx0XHRyZXR1cm4gc3VwZXIoZ2FtZU9iamVjdClcblxuXG5cblxuXG5cbmV4cG9ydHMuTGV2ZWwgPSBMZXZlbFxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKEBnZW9tZXRyeSwgQG1hdGVyaWFsKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBtYXRlcmlhbCA9IHVuZGVmaW5lZFxuXHRcdEBnZW9tZXRyeSA9IHVuZGVmaW5lZFxuXHRcdEB0ZXh0dXJlID0gdW5kZWZpbmVkXG5cdFx0QHN0YXR1cyA9IHVuZGVmaW5lZFxuXG5cdGxvYWQ6IChmaWxlTmFtZSk9PlxuXHRcdGpzb25Mb2FkZXIgPSBuZXcgVEhSRUUuSlNPTkxvYWRlcigpO1xuXHRcdGpzb25Mb2FkZXIubG9hZCBmaWxlTmFtZSwgKGdlb21ldHJ5LCBtYXRlcmlhbHMsIG90aGVycy4uLik9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwoIG1hdGVyaWFscyApXG5cdFx0XHQjIEBtYXRlcmlhbCA9IG1hdGVyaWFsc1swXVxuXHRcdFx0QGdlb21ldHJ5ID0gZ2VvbWV0cnlcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cblx0bG9hZFBuZzogKGZpbGVOYW1lKT0+XG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIGZpbGVOYW1lLCB7fSwgKCk9PlxuXHRcdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRcdCMgdHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdFx0IyBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXHRcdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRcdCMgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkgMSwgMVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0I2NvbnNvbGUubG9nIFwibG9hZHBuZ1wiLCB0aGlzXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cblxuY2xhc3MgTW9kZWxMb2FkZXJcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAZGVmYXVsdEdlb21ldHJ5ID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSgxLDEsMSlcblx0XHRAZGVmYXVsdE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRjb2xvcjogMHgwMGZmMDBcblx0XHRcdHdpcmVmcmFtZTogdHJ1ZVxuXHRcdFx0bWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3V0aWwvd2hpdGUucG5nXCJcblxuXHRcdEBsb2FkZWRNb2RlbHMgPSB7fVxuXG5cdGxvYWQ6IChmaWxlTmFtZSktPlxuXG5cdFx0IyBpZiBhbHJlYWR5IGxvYWRlZCwganVzdCBtYWtlIHRoZSBuZXcgbWVzaCBhbmQgcmV0dXJuXG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0/ICYmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLnN0YXR1cyA9PSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImNhY2hlZFwiXG5cdFx0XHRyZXR1cm4gbmV3IFRIUkVFLk1lc2goQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uZ2VvbWV0cnksIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLm1hdGVyaWFsKVxuXG5cblx0XHQjIGlmIHJlcXVlc3RlZCBidXQgbm90IHJlYWR5XG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcdG1vZGVsID0gQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcblx0XHQjIGlmIG5vdCByZXF1ZXN0ZWQgYmVmb3JlXG5cdFx0ZWxzZVxuXHRcdFx0bW9kZWwgPSBuZXcgTW9kZWwoKVxuXHRcdFx0aWYgZmlsZU5hbWUuc3BsaXQoJy4nKS5wb3AoKSA9PSBcImpzXCJcblx0XHRcdFx0bW9kZWwubG9hZChmaWxlTmFtZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0bW9kZWwubG9hZFBuZyhmaWxlTmFtZSlcblx0XHRcdEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdID0gbW9kZWxcblxuXHRcdG9iamVjdCA9IG5ldyBUSFJFRS5NZXNoKCBAZGVmYXVsdEdlb21ldHJ5LCBAZGVmYXVsdE1hdGVyaWFsIClcblx0XHRtb2RlbC5vbiBcInN1Y2Nlc3NcIiwgKG0pLT5cblx0XHRcdG9iamVjdC5nZW9tZXRyeSA9IG0uZ2VvbWV0cnlcdFx0XHRcblx0XHRcdG9iamVjdC5tYXRlcmlhbCA9IG0ubWF0ZXJpYWxcblx0XHRcdG0ub2ZmIFwic3VjY2Vzc1wiLCBhcmd1bWVudHMuY2FsbGVlICNyZW1vdmUgdGhpcyBoYW5kbGVyIG9uY2UgdXNlZFxuXHRcdHJldHVybiBvYmplY3RcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbExvYWRlclxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG51dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cbmNsYXNzIFBhcnRpY2xlIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRwYXJ0aWNsZVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3BhcnRpY2xlcy9wYXJ0aWNsZTIucG5nXCJcblx0cGFydGljbGVNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBwYXJ0aWNsZVRleHR1cmVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xuXG5cdHBhcnRpY2xlR2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiwgZW5lcmd5KS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDEwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggcGFydGljbGVHZW9tZXRyeSwgcGFydGljbGVNYXRlcmlhbFxuXHRcdFxuXHRcdEB2ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSkpO1xuXHRcdEB2ZWxvY2l0eS5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcihlbmVyZ3kpXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEB2ZWxvY2l0eS5tdWx0aXBseVNjYWxhciguOTkpXG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBAdmVsb2NpdHkueCAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBAdmVsb2NpdHkueSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueiArPSBAdmVsb2NpdHkueiAqIGRlbHRhXG5cdFx0cyA9IDEtICgoRGF0ZS5ub3coKSAtIEBiaXJ0aCkgLyBAdGltZVRvTGl2ZSkgKyAuMDFcblx0XHRAcm9vdC5zY2FsZS5zZXQocywgcywgcylcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlXG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5cblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5Db2xsaXNpb25zID0gcmVxdWlyZSAnLi9Db2xsaXNpb25zLmNvZmZlZSdcbk1vZGVsTG9hZGVyID0gcmVxdWlyZSAnLi9Nb2RlbExvYWRlci5jb2ZmZWUnXG5JbnB1dCA9IHJlcXVpcmUgJy4vSW5wdXQuY29mZmVlJ1xuV2VhcG9ucyA9IHJlcXVpcmUgJy4vV2VhcG9ucy5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuU2h1bXAgPSByZXF1aXJlICcuL3NodW1wLmNvZmZlZSdcblxubW9kZWxMb2FkZXIgPSBuZXcgTW9kZWxMb2FkZXIoKVxuIyBpbnB1dCA9IG5ldyBJbnB1dCgpXG5cbmNsYXNzIFBsYXllciBleHRlbmRzIENvbGxpc2lvbnMuQ29sbGlzaW9uT2JqZWN0XG5cblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0XG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwicGxheWVyXCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlfYnVsbGV0XCJcblxuXHRcdG1vZGVsID0gbW9kZWxMb2FkZXIubG9hZChcImFzc2V0cy9zaGlwcy9zaGlwMi5qc1wiKVxuXHRcdEByb290LmFkZCBtb2RlbFxuXHRcdHV0aWwuYWZ0ZXIgMTAwMCwgKCktPlxuXHRcdFx0bW9kZWwubWF0ZXJpYWwubWF0ZXJpYWxzWzBdLndpcmVmcmFtZSA9IHRydWVcblx0XHRcblx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0QGhwID0gM1xuXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ3VwJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ2Rvd24nXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1snbGVmdCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54IC09IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydyaWdodCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydmaXJlX3ByaW1hcnknXVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBsYXN0RmlyZSArIDI0MCAqIDFcblx0XHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRcdFxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdGJ1bGxldC5hbmdsZSA9IC0uMjVcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRidWxsZXQuYW5nbGUgPSArLjI1XG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblx0XHRcdCMgQHBhcmVudC5jb2xsaWRlcnMucHVzaCBidWxsZXRcblxuXHRkaWU6ICgpLT5cblx0XHQjIGNvbnNvbGUubG9nIFwiZGllXCJcblx0XHRcblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMDBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDgpXG5cblx0XHQjIHBvcyA9IEByb290LnBvc2l0aW9uXG5cdFx0IyBwYXJlbnQgPSBAcGFyZW50XG5cdFx0IyB1dGlsLmFmdGVyIDEwMDAsICgpLT5cblx0XHQjIFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KHBvcylcblx0XHQjIFx0YnVsbGV0LmhwID0gMTAwXG5cdFx0IyBcdGJ1bGxldC5kcCA9IDEwXG5cdFx0IyBcdGJ1bGxldC5jb2xsaXNpb25SYWRpdXMgPSAxNTBcblx0XHQjIFx0cGFyZW50LmFkZCBidWxsZXRcblxuXHRcdCMgdXRpbC5hZnRlciAxMjUwLCBTaHVtcC5nYW1lLnJlc2V0UGxheWVyXG5cdFx0c3VwZXIoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcbiIsImNsYXNzIGV4cG9ydHMuU2NyZWVuRWZmZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRAY2FtZXJhID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYSgtLjUsIC41LCAtLjUgLCAuNSwgMCwgMSlcblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSAwXG5cdFx0QHNjZW5lLmFkZCBAY2FtZXJhXG5cdFx0XG5cblx0XHRAcHJvY2Vzc01hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHR0cmFuc3BhcmVudDogZmFsc2Vcblx0XHRcdHVuaWZvcm1zOiBcblx0XHRcdFx0XCJ0RGlmZnVzZVwiOiB7IHR5cGU6IFwidFwiLCB2YWx1ZTogdW5kZWZpbmVkIH1cblxuXHRcdFx0dmVydGV4U2hhZGVyOlxuXHRcdFx0XHRcIlwiXCJcblx0XHRcdFx0dmFyeWluZyB2ZWMyIHZVdjtcblxuXHRcdFx0XHR2b2lkIG1haW4oKSB7XG5cdFx0XHRcdFx0dlV2ID0gdXY7XG5cdFx0XHRcdFx0Z2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNCggcG9zaXRpb24sIDEuMCApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRmcmFnbWVudFNoYWRlcjpcblx0XHRcdFx0XCJcIlwiXG5cdFx0XHRcdHVuaWZvcm0gc2FtcGxlcjJEIHREaWZmdXNlO1xuXHRcdFx0XHR2YXJ5aW5nIHZlYzIgdlV2O1xuXG5cdFx0XHRcdHZvaWQgbWFpbigpIHtcblx0XHRcdFx0XHQvLyByZWFkIHRoZSBpbnB1dCBjb2xvclxuXG5cdFx0XHRcdFx0dmVjNCBvO1xuXHRcdFx0XHRcdHZlYzQgYztcblx0XHRcdFx0XHRjID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICk7XG5cdFx0XHRcdFx0Ly9vID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICk7XG5cblx0XHRcdFx0XHQvL21pc2FsaWduIHJnYlxuXHRcdFx0XHRcdG8uciA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiArIHZlYzIoMC4wLCAtMC4wMDEpICkucjtcblx0XHRcdFx0XHRvLmcgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKyB2ZWMyKDAuMCwgMC4wMDEpICkuZztcblx0XHRcdFx0XHRvLmIgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKyB2ZWMyKDAuMCwgMC4wMDMpICkuYjtcblxuXHRcdFx0XHRcdC8vc2NhbmxpbmVzXG5cdFx0XHRcdFx0by5yICo9IHNpbih2VXYueSAqIDI0MC4wICogNi4yOCkgKiAuMjUgKyAxLjA7XG5cdFx0XHRcdFx0by5nICo9IHNpbih2VXYueSAqIDI0MC4wICogNi4yOCkgKiAuMjUgKyAxLjA7XG5cdFx0XHRcdFx0by5iICo9IHNpbih2VXYueSAqIDI0MC4wICogNi4yOCkgKiAuMjUgKyAxLjA7XG5cblx0XHRcdFx0XHRvICo9IDAuNSArIDEuMCoxNi4wKnZVdi54KnZVdi55KigxLjAtdlV2LngpKigxLjAtdlV2LnkpO1xuXHRcdFx0XHRcdFxuXG5cdFx0XHRcdFx0Ly8gc2V0IHRoZSBvdXRwdXQgY29sb3Jcblx0XHRcdFx0XHRnbF9GcmFnQ29sb3IgPSBvICogLjUgKyBjICogLjU7XG5cdFx0XHRcdH1cblx0XHRcdFx0XCJcIlwiXG5cblx0XHRAcXVhZCA9IG5ldyBUSFJFRS5NZXNoKCBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSApLCBAcHJvY2Vzc01hdGVyaWFsICk7XG5cdFx0QHF1YWQucm90YXRpb24ueCA9IE1hdGguUElcblx0XHRAc2NlbmUuYWRkIEBxdWFkXG4iLCJcbnNjb3JlID0gMFxuZXhwb3J0cy5kaXNwbGF5RWxlbWVudCA9IHVuZGVmaW5lZFxuXG5leHBvcnRzLnNldCA9IChfc2NvcmUpLT5cblx0c2NvcmUgPSBfc2NvcmVcblx0ZGlzcGxheSgpXG5cbmV4cG9ydHMuYWRkID0gKHBvaW50cyktPlxuXHRzY29yZSArPSBwb2ludHNcblx0ZGlzcGxheSgpXG5cblx0IyBjb25zb2xlLmxvZyBleHBvcnRzLmRpc3BsYXlFbGVtZW50XG5kaXNwbGF5ID0gKCktPlxuXHRpZiBleHBvcnRzLmRpc3BsYXlFbGVtZW50P1xuXHRcdGV4cG9ydHMuZGlzcGxheUVsZW1lbnQudGV4dCBcIlNjb3JlOiAje3Njb3JlfVwiXG5cbmV4cG9ydHMuZ2V0ID0gKCktPlxuXHRyZXR1cm4gc2NvcmVcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcbkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBIb21lU2NyZWVuIGV4dGVuZHMgR2FtZU9iamVjdFxuXHR0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9zY3JlZW5zL3RpdGxlLnBuZ1wiXG5cdG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDIwLCAxNSlcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0QHNjZW5lLmFkZCBAcm9vdFxuXHRcdFxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIDY0MCAvIDQ4MCwgMSwgMTAwMDApXHRcblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB1dGlsLmxheWVyU3BhY2luZygpICogMVxuXHRcdEBzY2VuZS5hZGQgQGNhbWVyYVxuXG5cdFx0c2NyZWVuID0gbmV3IFRIUkVFLk1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG5cdFx0c2NyZWVuLnNjYWxlLnNldCguMjUsIC4yNSwgLjI1KVxuXHRcdHNjcmVlbi5wb3NpdGlvbi56ID0gIHV0aWwubGF5ZXJTcGFjaW5nKCkgKiAuNzVcblx0XHRAcm9vdC5hZGQgc2NyZWVuIFxuXG5cbmV4cG9ydHMuSG9tZVNjcmVlbiA9IEhvbWVTY3JlZW5cblxuY2xhc3MgR2FtZU92ZXJTY3JlZW4gZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3NjcmVlbnMvZ2FtZV9vdmVyLnBuZ1wiXG5cdG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDIwLCAxNSlcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cblx0XHRAc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdEBzY2VuZS5hZGQgQHJvb3Rcblx0XHRcblx0XHRAY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCA2NDAgLyA0ODAsIDEsIDEwMDAwKVx0XG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdXRpbC5sYXllclNwYWNpbmcoKSAqIDFcblx0XHRAc2NlbmUuYWRkIEBjYW1lcmFcblxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBnZW9tZXRyeSwgbWF0ZXJpYWxcblxuZXhwb3J0cy5HYW1lT3ZlclNjcmVlbiA9IEdhbWVPdmVyU2NyZWVuXG4iLCJ3aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbmF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxuY2xhc3MgU291bmRcblx0Y29uc3RydWN0b3I6IChAbmFtZSwgQHVybCwgQGJ1ZmZlciktPlxuZXhwb3J0cy5Tb3VuZCA9IFNvdW5kXG5cbmV4cG9ydHMubG9hZGVkU291bmRzID0gbG9hZGVkU291bmRzID0ge31cblxuXG5leHBvcnRzLmxvYWQgPSBsb2FkID0gKG5hbWUsIHVybCkgLT5cblx0cmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0cmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cdFx0cmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwpXG5cdFx0cmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXHRcdHJlcXVlc3Qub25sb2FkID0gKGEsIGIsIGMpPT5cblx0XHRcdGlmIHJlcXVlc3Quc3RhdHVzID09IDIwMFxuXHRcdFx0XHRhdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhIHJlcXVlc3QucmVzcG9uc2UsIFxuXHRcdFx0XHRcdChidWZmZXIpPT5cblx0XHRcdFx0XHRcdCN0b2RvIGhhbmRsZSBkZWNvZGluZyBlcnJvclxuXHRcdFx0XHRcdFx0c291bmQgPSBuZXcgU291bmQobmFtZSwgdXJsLCBidWZmZXIpXG5cdFx0XHRcdFx0XHRleHBvcnRzLmxvYWRlZFNvdW5kc1tuYW1lXSA9IHNvdW5kXG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzb2x2ZShzb3VuZClcblx0XHRcdFx0XHQsKGVycik9PlxuXHRcdFx0XHRcdFx0cmVqZWN0IEVycm9yKFwiRGVjb2RpbmcgRXJyb3JcIilcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y29uc29sZS5sb2cgIFwiU3RhdHVzXCJcblx0XHRcdFx0cmVqZWN0IEVycm9yKFwiU3RhdHVzIEVycm9yXCIpXG5cblx0XHRcdFx0XG5cdFx0cmVxdWVzdC5vbmVycm9yID0gKCktPlxuXHRcdFx0Y29uc29sZS5sb2cgXCJlcnJyXCJcblx0XHRcdHJlamVjdCBFcnJvcihcIk5ldHdvcmsgRXJyb3JcIikgXHRcblxuXHRcdHJlcXVlc3Quc2VuZCgpXG5cdFx0XHRcblxuZXhwb3J0cy5wbGF5ID0gcGxheSA9IChhcmcpLT5cblx0aWYgdHlwZW9mIGFyZyA9PSAnc3RyaW5nJ1xuXHRcdGJ1ZmZlciA9IGxvYWRlZFNvdW5kc1thcmddLmJ1ZmZlclxuXHRlbHNlIFxuXHRcdGJ1ZmZlciA9IGFyZ1xuXHRpZiBidWZmZXI/XG5cdFx0c291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG5cdFx0c291cmNlLmJ1ZmZlciA9IGJ1ZmZlclxuXHRcdHNvdXJjZS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbilcblx0XHRzb3VyY2Uuc3RhcnQoMClcblxuXG5hc3NldHNMb2FkaW5nID0gW11cbmFzc2V0c0xvYWRpbmcucHVzaCBsb2FkKCdzaG9vdCcsICdhc3NldHMvc291bmRzL3Nob290LndhdicpXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnZXhwbG9zaW9uJywgJ2Fzc2V0cy9zb3VuZHMvZXhwbG9zaW9uLndhdicpXG5cblByb21pc2UuYWxsKGFzc2V0c0xvYWRpbmcpXG4udGhlbiAocmVzdWx0cyktPlxuXHRjb25zb2xlLmxvZyBcIkxvYWRlZCBhbGwgU291bmRzIVwiLCByZXN1bHRzXG4uY2F0Y2ggKGVyciktPlxuXHRjb25zb2xlLmxvZyBcInVob2hcIiwgZXJyXG5cbiIsIkVuZW1pZXMgPSByZXF1aXJlICcuL0VuZW1pZXMuY29mZmVlJ1xuXG5leHBvcnRzLmxvYWQgPSBsb2FkID0gKHVybCkgLT5cblx0cmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0anF4aHIgPSAkLmdldEpTT04gdXJsLCBAb25Mb2FkXG5cblx0XHRqcXhoci5kb25lICgpLT5cblx0XHRcdGxldmVsID0gbmV3IFRpbGVkTWFwKGpxeGhyLnJlc3BvbnNlSlNPTilcblx0XHRcdHJldHVybiByZXNvbHZlKGxldmVsKVxuXG5cdFx0anF4aHIuZmFpbCAoKS0+XG5cdFx0XHRyZXR1cm4gcmVqZWN0IEVycm9yKFwiU3RhdHVzIEVycm9yXCIpXG5cblxuY2xhc3MgVGlsZWRNYXBcblx0Y29uc3RydWN0b3I6IChAZGF0YSktPlxuXHRcdEB0aWxlU2V0cyA9IFtdXG5cdFx0QHRpbGVzID0gW11cblx0XHRAbGF5ZXJzID0ge31cblxuXHRcdCMgY3JlYXRlIHRpbGVTZXRzLCBsb2FkIHRoZSB0ZXh0dXJlc1xuXHRcdGZvciB0aWxlU2V0RGF0YSBpbiBkYXRhLnRpbGVzZXRzXG5cdFx0XHR0aWxlU2V0ID0gbmV3IFRpbGVTZXQgdGlsZVNldERhdGFcblx0XHRcdEB0aWxlU2V0cy5wdXNoIHRpbGVTZXRcblxuXHRcdCMgY3JlYXRlIHRpbGVzIEBnZW9tZXRlcnkgYW5kIEBtYXRlcmlhbFxuXHRcdGZvciB0aWxlU2V0IGluIEB0aWxlU2V0c1xuXHRcdFx0aWQgPSB0aWxlU2V0LmRhdGEuZmlyc3RnaWRcblx0XHRcdGZvciByb3cgaW4gWzAuLnRpbGVTZXQucm93cy0xXVxuXHRcdFx0XHRmb3IgY29sIGluIFswLi50aWxlU2V0LmNvbHMtMV1cblx0XHRcdFx0XHR0aWxlID0gbmV3IFRpbGUgdGlsZVNldCwgcm93LCBjb2xcblx0XHRcdFx0XHRAdGlsZXNbaWRdID0gdGlsZVxuXHRcdFx0XHRcdGlkKytcblxuXG5cdFx0IyBsb2FkIGxheWVyc1xuXHRcdGZvciBsYXllckRhdGEgaW4gZGF0YS5sYXllcnNcblx0XHRcdGlmIGxheWVyRGF0YS50eXBlID09IFwidGlsZWxheWVyXCJcblx0XHRcdFx0QGxheWVyc1tsYXllckRhdGEubmFtZV0gPSBuZXcgVGlsZUxheWVyKHRoaXMsIGxheWVyRGF0YSlcblx0XHRcdGlmIGxheWVyRGF0YS50eXBlID09IFwib2JqZWN0Z3JvdXBcIlxuXHRcdFx0XHRAbGF5ZXJzW2xheWVyRGF0YS5uYW1lXSA9IG5ldyBPYmplY3RHcm91cChsYXllckRhdGEpXG5cblx0XG5cblx0bG9hZFRpbGVMYXllcjogKGRhdGEpPT5cblx0XHRsYXllciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0Zm9yIGlkLCBpbmRleCBpbiBkYXRhLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gZGF0YS53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBkYXRhLndpZHRoXG5cdFx0XHRcdHRpbGVPYmplY3QgPSBuZXcgVGlsZU9iamVjdChAdGlsZXNbaWRdLCBuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIC1yb3cgLSAxLCAwKSApXG5cdFx0XHRcdGxheWVyLmFkZCB0aWxlT2JqZWN0LnJvb3RcdFxuXHRcdHJldHVybiBsYXllclxuXG5cdFxuXG5cbiMgcmVwcmVzZW50cyBhIFRpbGVTZXQgaW4gYSBUaWxlZCBFZGl0b3IgbGV2ZWxcbmNsYXNzIFRpbGVTZXRcblx0Y29uc3RydWN0b3I6IChAZGF0YSktPlxuXHRcdEBjb2xzID0gQGRhdGEuaW1hZ2V3aWR0aCAvIEBkYXRhLnRpbGV3aWR0aFxuXHRcdEByb3dzID0gQGRhdGEuaW1hZ2VoZWlnaHQgLyBAZGF0YS50aWxlaGVpZ2h0XG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzLyN7QGRhdGEuaW1hZ2V9XCJcblx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0ZGVwdGhUZXN0OiB0cnVlXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblxuIyBSZXByZXNlbnRzIHRoZSBAZ2VvbWV0cnkgYW5kIEBtYXRlcmlhbCBvZiBhIHRpbGUgbG9hZGVkIGZyb20gYSBUaWxlZCBFZGl0b3IgbGV2ZWxcbmNsYXNzIFRpbGVcblx0Y29uc3RydWN0b3I6IChAdGlsZVNldCwgQHJvdywgQGNvbCktPlxuXHRcdCMgdG9kbywgcHJvYmFibHkgYmUgcHJldHRpZXIgdG8ganVzdCBtYWtlIHRoaXMgZnJvbSBzY3JhdGNoXG5cdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIEB0aWxlU2V0LmRhdGEudGlsZXdpZHRoIC8gMzIsIEB0aWxlU2V0LmRhdGEudGlsZWhlaWdodCAvIDMyKVxuXHRcdFxuXHRcdCMgUmVwb3NpdGlvbiB2ZXJ0aWNlcyB0byBsb3dlciBsZWZ0IGF0IDAsMCBcblx0XHRmb3IgdiBpbiBAZ2VvbWV0cnkudmVydGljZXNcblx0XHRcdHYueCArPSBAdGlsZVNldC5kYXRhLnRpbGV3aWR0aCAvIDMyIC8gMlxuXHRcdFx0di55ICs9IEB0aWxlU2V0LmRhdGEudGlsZWhlaWdodCAvIDMyIC8gMlxuXHRcdEBnZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlXG5cblx0XHQjIGNhbGMgYW5kIHNldCB1dnNcblx0XHR1dldpZHRoID0gQHRpbGVTZXQuZGF0YS50aWxld2lkdGgvQHRpbGVTZXQuZGF0YS5pbWFnZXdpZHRoXG5cdFx0dXZIZWlnaHQgPSBAdGlsZVNldC5kYXRhLnRpbGVoZWlnaHQvQHRpbGVTZXQuZGF0YS5pbWFnZWhlaWdodFxuXG5cdFx0dXZYID0gdXZXaWR0aCAqIEBjb2xcblx0XHR1dlkgPSB1dkhlaWdodCAqIChAdGlsZVNldC5yb3dzIC0gQHJvdyAtIDEpXG5cdFx0Zm9yIGZhY2UgaW4gQGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1cblx0XHRcdGZvciB2IGluIGZhY2Vcblx0XHRcdFx0aWYgdi54ID09IDBcblx0XHRcdFx0XHR2LnggPSB1dlhcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHYueCA9IHV2WCArIHV2V2lkdGggIyAqICgzMS41LzMyLjApICMgdG9kbyBkaXJ0eSBoYWNrIHRvIHByZXZlbnQgc2xpZ2h0IG92ZXJzYW1wbGUgb24gdGlsZSBzaG93aW5nIGhpbnQgb2YgbmV4dCB0aWxlIG9uIGVkZ2UuXG5cblx0XHRcdFx0aWYgdi55ID09IDBcblx0XHRcdFx0XHR2LnkgPSB1dllcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHYueSA9IHV2WSArIHV2SGVpZ2h0ICMgKiAoMzEuNS8zMi4wKSAjIHRvZG8gZGlydHkgaGFjayB0byBwcmV2ZW50IHNsaWdodCBvdmVyc2FtcGxlIG9uIHRpbGUgc2hvd2luZyBoaW50IG9mIG5leHQgdGlsZSBvbiBlZGdlLlx0XHRcdFx0XHRcblx0XHRAZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWVcblxuXHRcdEBtYXRlcmlhbCA9IEB0aWxlU2V0Lm1hdGVyaWFsXG5cblx0XHRcblxuIyBSZXByZXNlbnRzIGEgVGlsZUxheWVyIGluIHRoZSBUaWxlZCBFZGl0b3IgZmlsZS4gXG5jbGFzcyBUaWxlTGF5ZXJcblx0Y29uc3RydWN0b3I6IChtYXAsIEBkYXRhKS0+XG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdGZvciBpZCwgaW5kZXggaW4gQGRhdGEuZGF0YVxuXHRcdFx0aWYgaWQgPiAwXG5cdFx0XHRcdHJvdyA9IE1hdGguZmxvb3IoaW5kZXggLyBkYXRhLndpZHRoKVxuXHRcdFx0XHRjb2wgPSBpbmRleCAlIGRhdGEud2lkdGhcblx0XHRcdFx0IyBjb25zb2xlLmxvZyAgXCJ0aWxlXCIsIG1hcCwgbWFwLnRpbGVzW2lkXVxuXHRcdFx0XHR0aWxlT2JqZWN0ID0gbmV3IFRpbGVPYmplY3QobWFwLnRpbGVzW2lkXSwgbmV3IFRIUkVFLlZlY3RvcjMoY29sLCAtcm93IC0gMSwgMCkgKVxuXHRcdFx0XHRAcm9vdC5hZGQgdGlsZU9iamVjdC5tZXNoXHRcblx0XHRcblxuIyBSZXByZXNlbnRzIGFuIGluc3RhbmNlIG9mIGEgdGlsZSB0byBiZSByZW5kZXJlZFxuY2xhc3MgVGlsZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKHRpbGUsIHBvc2l0aW9uKS0+XG5cdFx0QG1lc2ggPSBuZXcgVEhSRUUuTWVzaCB0aWxlLmdlb21ldHJ5LCB0aWxlLm1hdGVyaWFsXG5cdFx0QG1lc2gucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XG5cbmNsYXNzIE9iamVjdEdyb3VwXG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRAb2JqZWN0cyA9IFtdXG5cdFx0Zm9yIG9iamVjdERhdGEgaW4gQGRhdGEub2JqZWN0cyBcblx0XHRcdGVuZW15ID0gbmV3IEVuZW1pZXNbb2JqZWN0RGF0YS50eXBlXShuZXcgVEhSRUUuVmVjdG9yMyhvYmplY3REYXRhLnggLyAzMiwgNyAtIG9iamVjdERhdGEueSAvIDMyLCAwKSlcblx0XHRcdEBvYmplY3RzLnB1c2ggZW5lbXlcbiIsIlNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5Db2xsaXNpb25zID0gcmVxdWlyZSAnLi9Db2xsaXNpb25zLmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5cbmNsYXNzIGV4cG9ydHMuQnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9ucy5Db2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXQucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSlcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDIwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggYnVsbGV0R2VvbWV0cnksIGJ1bGxldE1hdGVyaWFsXG5cblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiYnVsbGV0XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlcIlxuXHRcdEBhbmdsZSA9IDBcblx0XHRAc3BlZWQgPSAxNVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBNYXRoLmNvcyhAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gTWF0aC5zaW4oQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5yb3RhdGlvbi56ID0gQGFuZ2xlXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxuXG5cdGNvbGxpZGVJbnRvOiAodGFyZ2V0KS0+XG5cdFx0c3VwZXIodGFyZ2V0KVxuXHRcdFNjb3JlLmFkZCgxKVxuXHRcdEBkaWUoKVxuXHRcdGZvciBpIGluIFswLi41XVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAxKVxuXG5cbmNsYXNzIGV4cG9ydHMuRW5lbXlCdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25zLkNvbGxpc2lvbk9iamVjdFxuXHRidWxsZXRUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy93ZWFwb25zL2J1bGxldF8yLnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpXG5cdFxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDIwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggYnVsbGV0R2VvbWV0cnksIGJ1bGxldE1hdGVyaWFsXG5cblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiYnVsbGV0XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlcIlxuXHRcdEBhbmdsZSA9IDBcblx0XHRAc3BlZWQgPSAxNVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBNYXRoLmNvcyhAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gTWF0aC5zaW4oQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5yb3RhdGlvbi56ID0gQGFuZ2xlXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxuXG5cdGNvbGxpZGVJbnRvOiAodGFyZ2V0KS0+XG5cdFx0c3VwZXIodGFyZ2V0KVxuXHRcdFNjb3JlLmFkZCgxKVxuXHRcdEBkaWUoKVxuXHRcdGZvciBpIGluIFswLi41XVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAxKVxuIiwiR2FtZSA9IHJlcXVpcmUgJy4vR2FtZS5jb2ZmZWUnXG5cblxubW9kdWxlLmV4cG9ydHMuR2FtZSA9IG5ldyBHYW1lLkdhbWUoKVxuXG5cdFx0XG5cbiMgbW9kZWxMb2FkZXIgPSBuZXcgY29yZS5Nb2RlbExvYWRlcigpXG5cblxuXHRcdFx0XG5cblxuIiwiZXhwb3J0cy5hZnRlciA9IChkZWxheSwgZnVuYyktPlxuXHRzZXRUaW1lb3V0IGZ1bmMsIGRlbGF5XG5cbmV4cG9ydHMucmFuZG9tID0gKG1pbiwgbWF4KS0+XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG5cblxuZXhwb3J0cy5sYXllclNwYWNpbmcgPSAoKS0+XG5cdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblx0dGFyZ2V0WiA9IDQ4MCAvICgyICogTWF0aC50YW4oZm92X3JhZGlhbnMgLyAyKSApIC8gMzIuMDtcbiJdfQ==
