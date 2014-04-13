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
      fragmentShader: "uniform sampler2D tDiffuse;\nvarying vec2 vUv;\n\nvoid main() {\n	// read the input color\n\n	vec4 o;\n	vec4 c;\n	c = texture2D( tDiffuse, vUv );\n	//o = texture2D( tDiffuse, vUv );\n\n	//misalign rgb\n	o.r = texture2D( tDiffuse, vUv + vec2(0.0, -0.001) ).r;\n	o.g = texture2D( tDiffuse, vUv + vec2(0.0, 0.001) ).r;\n	o.b = texture2D( tDiffuse, vUv + vec2(0.0, 0.003) ).r;\n\n	//scanlines\n	o.r *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;\n	o.g *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;\n	o.b *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;\n\n	o *= 0.9 + 1.0*16.0*vUv.x*vUv.y*(1.0-vUv.x)*(1.0-vUv.y);\n	\n\n	// set the output color\n	gl_FragColor = o * .5 + c * .5;\n}"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0VuZW1pZXMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9HYW1lLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvR2FtZU9iamVjdC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0lucHV0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvTGV2ZWwuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9Nb2RlbExvYWRlci5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1BhcnRpY2xlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGxheWVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUG9zdEVmZmVjdHMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NjcmVlbnMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9Tb3VuZC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1RpbGVkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL3NodW1wLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGtCQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsc0JBQVIsQ0FBUixDQUFBOztBQUFBLENBRUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsS0FBakIsQ0FBdUIsU0FBQSxHQUFBO0FBRXRCLE1BQUEsc0VBQUE7QUFBQSxFQUFBLENBQUEsQ0FBRSxRQUFGLENBQVksQ0FBQSxDQUFBLENBQUUsQ0FBQyx1QkFBZixDQUF1QyxPQUFPLENBQUMsb0JBQS9DLENBQUEsQ0FBQTtBQUFBLEVBRUEsTUFBQSxHQUFTLENBQUEsQ0FBRSxlQUFGLENBRlQsQ0FBQTtBQUFBLEVBR0EsWUFBQSxHQUFlLE1B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LENBQU4sR0FBeUMsS0FGN0I7QUFBQSxDQVB2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJzaHVtcCA9IHJlcXVpcmUoJy4vc2h1bXAvc2h1bXAuY29mZmVlJylcblxuJChcIiNmdWxsc2NyZWVuXCIpLmNsaWNrICgpLT5cblx0XG5cdCQoXCIjc2h1bXBcIilbMF0ud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4oRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCk7XG5cdFxuXHRjYW52YXMgPSAkKFwiI3NodW1wIGNhbnZhc1wiKVxuXHRjYW52YXNBc3BlY3QgPSBjYW52YXMud2lkdGgoKSAvIGNhbnZhcy5oZWlnaHQoKVxuXG5cdGNvbnRhaW5lcldpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblx0Y29udGFpbmVySGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG5cdGNvbnRhaW5lckFzcGVjdCA9IGNvbnRhaW5lcldpZHRoIC8gY29udGFpbmVySGVpZ2h0XG5cdGNvbnNvbGUubG9nIGNhbnZhc0FzcGVjdCwgJCh3aW5kb3cpLndpZHRoKCkgLCAkKHdpbmRvdykuaGVpZ2h0KCksIGNvbnRhaW5lckFzcGVjdFxuXHRcblx0aWYgY2FudmFzQXNwZWN0IDwgY29udGFpbmVyQXNwZWN0XG5cdFx0Y29uc29sZS5sb2cgXCJtYXRjaCBoZWlnaHRcIlxuXHRcdGNhbnZhcy5oZWlnaHQgY29udGFpbmVySGVpZ2h0XG5cdFx0Y2FudmFzLndpZHRoIGNvbnRhaW5lckhlaWdodCAqIGNhbnZhc0FzcGVjdFxuXHRlbHNlXG5cdFx0Y29uc29sZS5sb2cgXCJtYXRjaCB3aWR0aFwiXG5cdFx0Y2FudmFzLndpZHRoIGNvbnRhaW5lcldpZHRoXG5cdFx0Y2FudmFzLmhlaWdodCBjb250YWluZXJXaWR0aCAvIGNhbnZhc0FzcGVjdFxuXG4kKFwiI2RlYnVnXCIpLmFwcGVuZChcIlwiXCI8c3BhbiBpZD1cImxldmVsQ2hpbGRyZW5cIj5cIlwiXCIpXG5cblxudXBkYXRlRGVidWcgPSAoKS0+XG5cdCQoXCIjbGV2ZWxDaGlsZHJlblwiKS50ZXh0IFwiXCJcImxldmVsLmNoaWxkcmVuID0gI3tzaHVtcC5HYW1lLmxldmVsLmNoaWxkcmVuLmxlbmd0aH1cIlwiXCJcblxuIiwiY2xhc3MgQmFzZVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBfZXZlbnRzID0ge31cblxuXHRvbjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdChAX2V2ZW50c1tldmVudF0gPz0gW10pLnB1c2ggaGFuZGxlclxuXHRcdHJldHVybiB0aGlzXG5cblx0b2ZmOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0Zm9yIHN1c3BlY3QsIGluZGV4IGluIEBfZXZlbnRzW2V2ZW50XSB3aGVuIHN1c3BlY3QgaXMgaGFuZGxlclxuXHRcdFx0QF9ldmVudHNbZXZlbnRdLnNwbGljZSBpbmRleCwgMVxuXHRcdHJldHVybiB0aGlzXG5cblx0dHJpZ2dlcjogKGV2ZW50LCBhcmdzLi4uKSA9PlxuXHRcdHJldHVybiB0aGlzIHVubGVzcyBAX2V2ZW50c1tldmVudF0/XG5cdFx0Zm9yIGkgaW4gW0BfZXZlbnRzW2V2ZW50XS5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGhhbmRsZXIgPSBAX2V2ZW50c1tldmVudF1baV1cblx0XHRcdGhhbmRsZXIuYXBwbHkgdGhpcywgYXJnc1xuXHRcdHJldHVybiB0aGlzXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIiwiR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5cbmNsYXNzIENvbGxpc2lvbk9iamVjdCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IHVuZGVmaW5lZFxuXHRcdEBjb2xsaWRlckhpdFR5cGVzID0gW11cblx0XHRAaHAgPSAxXG5cdFx0QGRwID0gMVxuXHRcdEBjb2xsaXNpb25SYWRpdXMgPSAuNlxuXG5cdGNvbGxpZGVJbnRvOiAodGFyZ2V0KS0+XG5cdFx0dGFyZ2V0LnRha2VEYW1hZ2UoQGRwKVxuXHRcdCMgQGRpZSgpXG5cdFx0IyBnYW1lT2JqZWN0LmRpZSgpXG5cblx0dGFrZURhbWFnZTogKGRhbWFnZSktPlxuXHRcdEBocCAtPSBkYW1hZ2Vcblx0XHRpZiBAaHAgPD0gMCBcblx0XHRcdEBkaWUoKVxuXG5tb2R1bGUuZXhwb3J0cy5Db2xsaXNpb25PYmplY3QgPSBDb2xsaXNpb25PYmplY3RcblxuXG5cbm1vZHVsZS5leHBvcnRzLnJlc29sdmVDb2xsaXNpb25zID0gKGNvbGxpZGVycyktPlxuXHRmb3IgYSBpbiBjb2xsaWRlcnNcblx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0Zm9yIGIgaW4gY29sbGlkZXJzXG5cdFx0XHRcdGlmIGIuYWN0aXZlXG5cdFx0XHRcdFx0aWYgYS5jb2xsaWRlckhpdFR5cGVzLmluZGV4T2YoYi5jb2xsaWRlclR5cGUpID4gLTFcblx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0YS5jb2xsaWRlSW50byBiXG5cbm1vZHVsZS5leHBvcnRzLnRlc3RDb2xsaXNpb24gPSAoYSwgYiktPlxuXHRyZXR1cm4gYS5yb290LnBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKGIucm9vdC5wb3NpdGlvbikgPCBhLmNvbGxpc2lvblJhZGl1cyArIGIuY29sbGlzaW9uUmFkaXVzXG4iLCJcblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5Db2xsaXNpb25zID0gcmVxdWlyZSAnLi9Db2xsaXNpb25zLmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblxuXG5jbGFzcyBCYXNpYyBleHRlbmRzIENvbGxpc2lvbnMuQ29sbGlzaW9uT2JqZWN0XG5cdGVuZW15VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvZW5lbWllcy9lbmVteS5wbmdcIlxuXHRlbmVteU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGVuZW15VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRlbmVteUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiZW5lbXlcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJwbGF5ZXJcIlxuXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGVuZW15R2VvbWV0cnksIGVuZW15TWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXHRcdEBhZ2UgPSAwXG5cdFx0QGhhc0ZpcmVkID0gZmFsc2VcblxuXHRcdEBhY3RpdmUgPSBmYWxzZVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QGFnZSArPSBkZWx0YVxuXHRcdFxuXHRcblx0ZGllOiAoKS0+XG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDMpXG5cdFx0c3VwZXIoKVxuXG5cbmNsYXNzIFNpbldhdmUgZXh0ZW5kcyBCYXNpY1xuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVx0XHRcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0xICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IGRlbHRhICogTWF0aC5zaW4oQGFnZSlcblxuY2xhc3MgRGFydCBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdGlmIEBhZ2UgPCAuNVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSAtMjAgKiBkZWx0YVxuXHRcdGVsc2UgaWYgQGFnZSA8IDNcblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gNSAqIGRlbHRhXG5cdFx0ZWxzZVxuXHRcdFx0QGRpZSgpXG5cblx0XHRpZiBAYWdlID4gMSBhbmQgbm90IEBoYXNGaXJlZFxuXHRcdFx0QGhhc0ZpcmVkID0gdHJ1ZVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblxuXHRmaXJlX3ByaW1hcnk6ICgpLT5cblx0XG5cdFx0U291bmQucGxheSgnc2hvb3QnKVxuXHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5FbmVteUJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJIC0gLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KEByb290LnBvc2l0aW9uKVxuXG5cdFx0YnVsbGV0LmNvbGxpZGVyVHlwZSA9IFwiZW5lbXlfYnVsbGV0XCJcblx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUEkgKyAuMjVcblx0XHRidWxsZXQuc3BlZWQgPSA1XG5cblx0XHRAcGFyZW50LmFkZCBidWxsZXRcdFxuXG5cbmV4cG9ydHMuQmFzaWMgPSBCYXNpY1xuZXhwb3J0cy5TaW5XYXZlID0gU2luV2F2ZVxuZXhwb3J0cy5EYXJ0ID0gRGFydFxuXG4jIHN1cGVyKGRlbHRhKVxuXHRcdCMgaWYgQGFnZSA8IDFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnkgKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMi4xXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gNSAqIGRlbHRhXG5cdFx0IyBlbHNlXG5cdFx0IyBcdEBkaWUoKVxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5MZXZlbCA9IHJlcXVpcmUgJy4vTGV2ZWwuY29mZmVlJ1xuU2NyZWVucyA9IHJlcXVpcmUgJy4vU2NyZWVucy5jb2ZmZWUnXG5TY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuUG9zdEVmZmVjdHMgPSByZXF1aXJlICcuL1Bvc3RFZmZlY3RzLmNvZmZlZSdcblxuIyBHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblxuXG5cbmNsYXNzIEdhbWUgZXh0ZW5kcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdCMgaW5pdGlhbGl6ZSBzdGF0ZVxuXHRcdEBsaXZlcyA9IDNcblxuXHRcdCMgY3JlYXRlIHJlbmRlcmVyXG5cdFx0QHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKVxuXHRcdEByZW5kZXJlci5zZXRTaXplIDY0MCwgNDgwXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG5cdFx0IyB0b2RvIG5lYXJlc3QgYmV0dGVyP1xuXHRcdEB3b3JsZFRleHR1cmUgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQgNjQwLCA0ODAsIFxuXHRcdFx0bWluRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXIgXG5cdFx0XHRtYWdGaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlclxuXHRcdFx0Zm9ybWF0OiBUSFJFRS5SR0JGb3JtYXRcblxuXHRcdCMgc2NyZWVuRWZmZWN0IFxuXHRcdEBzY3JlZW5FZmZlY3QgPSBuZXcgUG9zdEVmZmVjdHMuU2NyZWVuRWZmZWN0KClcblx0XHRAc2NyZWVuRWZmZWN0LnByb2Nlc3NNYXRlcmlhbC51bmlmb3Jtcy50RGlmZnVzZS52YWx1ZSA9IEB3b3JsZFRleHR1cmVcblx0XHQjIGNvbnNvbGUubG9nIFwibWF0XCIsIEBzY3JlZW5FZmZlY3QucHJvY2Vzc01hdGVyaWFsXG5cblx0XHQjIGNsb2NrXG5cdFx0QGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKClcblxuXHRcdCMgY3JlYXRlIHN0YXRzXG5cdFx0QHN0YXRzID0gbmV3IFN0YXRzKCk7XG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0QHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCdcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkKCBAc3RhdHMuZG9tRWxlbWVudCApXG5cdFx0XG5cdFx0IyBodWRcblx0XHRTY29yZS5kaXNwbGF5RWxlbWVudCA9ICQoXCJcIlwiPGgxPlNjb3JlOjwvaDE+XCJcIlwiKS5hcHBlbmRUbyAkKFwiI3NodW1wXCIpXG5cdFx0QGxpdmVzRWxlbWVudCA9ICQoXCJcIlwiPGgxPkxpdmVzOjwvaDE+XCJcIlwiKS5hcHBlbmRUbyAkKFwiI3NodW1wXCIpXG5cblx0XHQjIG90aGVyIHNjcmVlbnNcblx0XHRAc3RhdGUgPSBcImhvbWVcIlxuXHRcdEBob21lU2NyZWVuID0gbmV3IFNjcmVlbnMuSG9tZVNjcmVlbigpXG5cdFx0QGdhbWVPdmVyU2NyZWVuID0gbmV3IFNjcmVlbnMuR2FtZU92ZXJTY3JlZW4oKVxuXG5cdFx0IyB0b2RvLCBjbGVhbiB0aGlzIHVwIGxldCBzY3JlZW5zIGhhbmRsZSB0aGVpciBpbnB1dCBhbmQgc2VuZCBtZXNzYWdlcyB3aGVuIHRoZXkgYXJlIGRvbmUuIG1heWJlIHRocm91Z2ggYSBnbG9iYWwgZXZlbnQgYnJvYWRjYXN0ZXJcblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0aWYgQHN0YXRlID09IFwiaG9tZVwiXG5cdFx0XHRcdEBzdGF0ZSA9IFwibG9hZGluZ1wiXG5cdFx0XHRcdEBzdGFydEdhbWUoKVxuXHRcdFx0XHRyZXR1cm5cblxuXHRcdFx0aWYgQHN0YXRlID09IFwiZ2FtZV9vdmVyXCJcblx0XHRcdFx0QHN0YXRlID0gXCJob21lXCJcblx0XHRcdFx0cmV0dXJuXG5cblx0XHQjIGxvYWQgYXNzZXRzXG5cblx0XHQjIGJlZ2luIGdhbWVcblx0XHR1dGlsLmFmdGVyIDEsICgpPT5cblx0XHRcdEBhbmltYXRlKClcblxuXG5cdHN0YXJ0R2FtZTogKCktPlxuXHRcdEBsaXZlcyA9IDNcblx0XHRAbGl2ZXNFbGVtZW50LnRleHQgXCJMaXZlczogI3tAbGl2ZXN9XCJcblxuXHRcdFNjb3JlLnNldCAwXG5cblx0XHQjIGxldmVsXG5cdFx0QGxldmVsID0gbmV3IExldmVsLkxldmVsKClcblx0XHRAbGV2ZWwub24gXCJwbGF5ZXJEaWVcIiwgKCk9PlxuXHRcdFx0QGxpdmVzLS1cblx0XHRcdEBsaXZlc0VsZW1lbnQudGV4dCBcIkxpdmVzOiAje0BsaXZlc31cIlxuXG5cdFx0XHRpZiBAbGl2ZXMgPiAwXG5cdFx0XHRcdHV0aWwuYWZ0ZXIgMTAwMCwgQGxldmVsLmluc2VydFBsYXllclxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRAc3RhdGUgPSBcImdhbWVfb3ZlclwiXG5cblx0XHRAbGV2ZWwub24gXCJyZWFkeVwiLCAoKT0+XG5cdFx0XHRAc3RhdGUgPSBcInBsYXlcIlxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0aWYgQHN0YXRlID09IFwiaG9tZVwiXG5cdFx0XHRAaG9tZVNjcmVlbi51cGRhdGUoZGVsdGEpXG5cblx0XHRpZiBAc3RhdGUgPT0gXCJwbGF5XCJcblx0XHRcdEBsZXZlbC51cGRhdGUoZGVsdGEpXG5cblx0XHRpZiBAc3RhdGUgPT0gXCJnYW1lX292ZXJcIlxuXHRcdFx0QGxldmVsLnVwZGF0ZShkZWx0YSlcblx0XHRcdEBnYW1lT3ZlclNjcmVlbi51cGRhdGUoZGVsdGEpXG5cblxuXHRyZW5kZXI6ICgpPT5cblx0XHRAcmVuZGVyZXIuYXV0b0NsZWFyID0gZmFsc2Vcblx0XHRpZiBAc3RhdGUgPT0gXCJob21lXCJcblx0XHRcdEByZW5kZXJlci5yZW5kZXIgQGhvbWVTY3JlZW4uc2NlbmUsIEBob21lU2NyZWVuLmNhbWVyYSwgQHdvcmxkVGV4dHVyZSwgdHJ1ZVxuXHRcdFxuXHRcdGlmIEBzdGF0ZSA9PSBcInBsYXlcIlx0XG5cdFx0XHRAcmVuZGVyZXIucmVuZGVyIEBsZXZlbC5zY2VuZSwgQGxldmVsLmNhbWVyYSwgQHdvcmxkVGV4dHVyZSwgdHJ1ZVxuXHRcdFx0QHJlbmRlcmVyLnJlbmRlciBAaG9tZVNjcmVlbi5zY2VuZSwgQGxldmVsLmNhbWVyYSwgQHdvcmxkVGV4dHVyZSwgZmFsc2VcblxuXHRcdGlmIEBzdGF0ZSA9PSBcImdhbWVfb3ZlclwiXG5cdFx0XHRAcmVuZGVyZXIucmVuZGVyIEBsZXZlbC5zY2VuZSwgQGxldmVsLmNhbWVyYSwgQHdvcmxkVGV4dHVyZSwgdHJ1ZVxuXHRcdFx0QHJlbmRlcmVyLnJlbmRlciBAZ2FtZU92ZXJTY3JlZW4uc2NlbmUsIEBnYW1lT3ZlclNjcmVlbi5jYW1lcmEsIEB3b3JsZFRleHR1cmUsIGZhbHNlXG5cblxuXHRcdFxuXHRcdEByZW5kZXJlci5yZW5kZXIgQHNjcmVlbkVmZmVjdC5zY2VuZSwgQHNjcmVlbkVmZmVjdC5jYW1lcmFcblxuXG5cdGFuaW1hdGU6ID0+XG5cdFx0IyB1cGRhdGUgdGhlIGdhbWUgcGh5c2ljc1xuXHRcdGRlbHRhID0gQGNsb2NrLmdldERlbHRhKClcblx0XHRpZiAoZGVsdGEgPCAuNSkgXG5cdFx0XHRAdXBkYXRlKGRlbHRhKVxuXG5cdFx0IyByZW5kZXIgdG8gc2NyZWVuXG5cdFx0QHJlbmRlcigpXG5cblx0XHQjIHVwZGF0ZSBmcHMgb3ZlcmxheVxuXHRcdEBzdGF0cy51cGRhdGUoKVxuXG5cdFx0IyByZXBlYXRcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGVcblx0XHRyZXR1cm5cblxuXG5leHBvcnRzLkdhbWUgPSBHYW1lXG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuY2xhc3MgR2FtZU9iamVjdCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0c3VwZXIoKVxuXG5cdFx0QHBhcmVudCA9IHVuZGVmaW5lZFxuXHRcdEBjaGlsZHJlbiA9IFtdXG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdEBkZWFkID0gZmFsc2Vcblx0XHRAYWN0aXZlID0gdHJ1ZVxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0Zm9yIGkgaW4gW0BjaGlsZHJlbi5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGNoaWxkID0gQGNoaWxkcmVuW2ldXG5cdFx0XHRpZiBjaGlsZC5kZWFkXG5cdFx0XHRcdEByZW1vdmUgY2hpbGRcblx0XHRcdFx0Y29udGludWVcblx0XHRcdGlmIGNoaWxkLmFjdGl2ZVxuXHRcdFx0XHRjaGlsZC51cGRhdGUgZGVsdGEgXG5cdFxuXHRhY3RpdmF0ZTogKCktPlxuXHRcdEBhY3RpdmUgPSB0cnVlO1xuXHRcdFxuXG5cdGFkZDogKGdhbWVPYmplY3QpLT5cblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IHRoaXNcblx0XHRAY2hpbGRyZW4ucHVzaChnYW1lT2JqZWN0KVxuXHRcdEByb290LmFkZChnYW1lT2JqZWN0LnJvb3QpXG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0QHJvb3QucmVtb3ZlKGdhbWVPYmplY3Qucm9vdClcblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IG51bGxcblx0XHRpID0gIEBjaGlsZHJlbi5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY2hpbGRyZW4uc3BsaWNlKGksIDEpO1xuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0ZGllOiAoKS0+XG5cdFx0QGRlYWQgPSB0cnVlO1xuXHRcdEB0cmlnZ2VyIFwiZGllXCJcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT2JqZWN0XG4iLCJjbGFzcyBJbnB1dFxuXHRrZXlNYXA6IFxuXHRcdFwiMzhcIjpcInVwXCIgI3VwIGFycm93XG5cdFx0XCI4N1wiOlwidXBcIiAjd1xuXHRcdFwiNDBcIjpcImRvd25cIiAjZG93biBhcnJvd1xuXHRcdFwiODNcIjpcImRvd25cIiAjc1xuXHRcdFwiMzdcIjpcImxlZnRcIiAjbGVmdCBhcnJvd1xuXHRcdFwiNjVcIjpcImxlZnRcIiAjYVxuXHRcdFwiMzlcIjpcInJpZ2h0XCIgI3JpZ2h0IGFycm93XG5cdFx0XCI2OFwiOlwicmlnaHRcIiAjZFxuXHRcdFwiMzJcIjpcImZpcmVfcHJpbWFyeVwiICNzcGFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxuXG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgQGtleU1hcFxuXHRcdFx0QGtleVN0YXRlc1t2YWx1ZV0gPSBmYWxzZTtcblxuXHRcdCQod2luZG93KS5rZXlkb3duIChlKT0+XG5cdFx0XHQjIGNvbnNvbGUubG9nIGUud2hpY2hcblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IHRydWU7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHQkKHdpbmRvdykua2V5dXAgKGUpPT5cblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IGZhbHNlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5pbnB1dCA9IG5ldyBJbnB1dCgpXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0XG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5UaWxlZCA9IHJlcXVpcmUgJy4vVGlsZWQuY29mZmVlJ1xuUGxheWVyID0gcmVxdWlyZSAnLi9QbGF5ZXIuY29mZmVlJ1xuR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5Db2xsaXNpb25zID0gcmVxdWlyZSAnLi9Db2xsaXNpb25zLmNvZmZlZSdcblxuY2xhc3MgTGV2ZWwgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0IyBjcmVhdGUgc2NlbmVcblx0XHRAc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdEBzY2VuZS5hZGQgQHJvb3RcblxuXHRcdCMgY2FtZXJhXG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgNjQwIC8gNDgwLCAxLCAxMDAwMClcdFxuXHRcdEBjYW1lcmEucG9zaXRpb24ueiA9IHV0aWwubGF5ZXJTcGFjaW5nKCkgKiAxXG5cdFx0QHNjZW5lLmFkZCBAY2FtZXJhXG5cblx0XHQjIGxpZ2h0c1xuXHRcdEBhbWJpZW50TGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKTtcblx0XHRAcm9vdC5hZGQoQGFtYmllbnRMaWdodClcblxuXG5cdFx0IyBpbnNlcnQgcGxheWVyXG5cdFx0QGluc2VydFBsYXllcigpXG5cblxuXHRcdCMgbGV2ZWxcblx0XHRUaWxlZC5sb2FkKCdhc3NldHMvbGV2ZWxfMS5qc29uJykudGhlbihAcG9wdWxhdGUpLmNhdGNoIChlcnJvciktPlxuXHQgXHRcdGNvbnNvbGUuZXJyb3IgZXJyb3JcblxuXHRwb3B1bGF0ZTogKG1hcCk9PlxuXHRcdEByb290LmFkZChtYXAubGF5ZXJzLmJhY2tncm91bmQucm9vdClcblx0XHRtYXAubGF5ZXJzLmJhY2tncm91bmQucm9vdC5wb3NpdGlvbi55ID0gNy41ICogMlxuXHRcdG1hcC5sYXllcnMuYmFja2dyb3VuZC5yb290LnBvc2l0aW9uLnogPSAgdXRpbC5sYXllclNwYWNpbmcoKSAqIC0xXG5cdFx0bWFwLmxheWVycy5iYWNrZ3JvdW5kLnJvb3Quc2NhbGUuc2V0KDIsIDIsIDIpXG5cdFx0XG5cdFx0QHJvb3QuYWRkKG1hcC5sYXllcnMubWlkZ3JvdW5kLnJvb3QpXG5cdFx0bWFwLmxheWVycy5taWRncm91bmQucm9vdC5wb3NpdGlvbi55ID0gNy41XG5cblx0XHRmb3Igb2JqZWN0IGluIG1hcC5sYXllcnMuZW5lbWllcy5vYmplY3RzXG5cdFx0XHRAYWRkIG9iamVjdFxuXG5cdFx0QHRyaWdnZXIgXCJyZWFkeVwiXG5cblx0aW5zZXJ0UGxheWVyOiAoKT0+XG5cdFx0QHBsYXllcjEgPSBuZXcgUGxheWVyKClcblx0XHRAYWRkIEBwbGF5ZXIxXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi5jb3B5IEBjYW1lcmEucG9zaXRpb25cblx0XHRAcGxheWVyMS5yb290LnBvc2l0aW9uLnogPSAwXG5cblx0XHRAcGxheWVyMS5vbiBcImRpZVwiLCAoKT0+XG5cdFx0XHRAdHJpZ2dlciBcInBsYXllckRpZVwiXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAY2FtZXJhLnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlID09IGZhbHNlIGFuZCBjaGlsZC5yb290LnBvc2l0aW9uLnggPCBAY2FtZXJhLnBvc2l0aW9uLnggKyAxMFxuXHRcdFx0XHRjaGlsZC5hY3RpdmF0ZSgpXG5cblx0XHRDb2xsaXNpb25zLnJlc29sdmVDb2xsaXNpb25zKEBjb2xsaWRlcnMpXG5cblx0XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbnMuQ29sbGlzaW9uT2JqZWN0XG5cdFx0XHRAY29sbGlkZXJzLnB1c2ggZ2FtZU9iamVjdCBcblx0XHRyZXR1cm4gc3VwZXIoZ2FtZU9iamVjdClcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0aSA9ICBAY29sbGlkZXJzLmluZGV4T2YoZ2FtZU9iamVjdClcblx0XHRpZiBpID49IDBcblx0XHRcdEBjb2xsaWRlcnMuc3BsaWNlKGksIDEpXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblxuXG5cblxuXG5leHBvcnRzLkxldmVsID0gTGV2ZWxcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IChAZ2VvbWV0cnksIEBtYXRlcmlhbCktPlxuXHRcdHN1cGVyKClcblx0XHRAbWF0ZXJpYWwgPSB1bmRlZmluZWRcblx0XHRAZ2VvbWV0cnkgPSB1bmRlZmluZWRcblx0XHRAdGV4dHVyZSA9IHVuZGVmaW5lZFxuXHRcdEBzdGF0dXMgPSB1bmRlZmluZWRcblxuXHRsb2FkOiAoZmlsZU5hbWUpPT5cblx0XHRqc29uTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblx0XHRqc29uTG9hZGVyLmxvYWQgZmlsZU5hbWUsIChnZW9tZXRyeSwgbWF0ZXJpYWxzLCBvdGhlcnMuLi4pPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKCBtYXRlcmlhbHMgKVxuXHRcdFx0IyBAbWF0ZXJpYWwgPSBtYXRlcmlhbHNbMF1cblx0XHRcdEBnZW9tZXRyeSA9IGdlb21ldHJ5XG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cdGxvYWRQbmc6IChmaWxlTmFtZSk9PlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBmaWxlTmFtZSwge30sICgpPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0XHQjIHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRcdCMgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblx0XHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0XHQjIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5IDEsIDFcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImxvYWRwbmdcIiwgdGhpc1xuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXG5cbmNsYXNzIE1vZGVsTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QGRlZmF1bHRHZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMSwxLDEpXG5cdFx0QGRlZmF1bHRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0Y29sb3I6IDB4MDBmZjAwXG5cdFx0XHR3aXJlZnJhbWU6IHRydWVcblx0XHRcdG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy91dGlsL3doaXRlLnBuZ1wiXG5cblx0XHRAbG9hZGVkTW9kZWxzID0ge31cblxuXHRsb2FkOiAoZmlsZU5hbWUpLT5cblxuXHRcdCMgaWYgYWxyZWFkeSBsb2FkZWQsIGp1c3QgbWFrZSB0aGUgbmV3IG1lc2ggYW5kIHJldHVyblxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdPyAmJiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5zdGF0dXMgPT0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJjYWNoZWRcIlxuXHRcdFx0cmV0dXJuIG5ldyBUSFJFRS5NZXNoKEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLmdlb21ldHJ5LCBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5tYXRlcmlhbClcblxuXG5cdFx0IyBpZiByZXF1ZXN0ZWQgYnV0IG5vdCByZWFkeVxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XHRtb2RlbCA9IEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XG5cdFx0IyBpZiBub3QgcmVxdWVzdGVkIGJlZm9yZVxuXHRcdGVsc2Vcblx0XHRcdG1vZGVsID0gbmV3IE1vZGVsKClcblx0XHRcdGlmIGZpbGVOYW1lLnNwbGl0KCcuJykucG9wKCkgPT0gXCJqc1wiXG5cdFx0XHRcdG1vZGVsLmxvYWQoZmlsZU5hbWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG1vZGVsLmxvYWRQbmcoZmlsZU5hbWUpXG5cdFx0XHRAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXSA9IG1vZGVsXG5cblx0XHRvYmplY3QgPSBuZXcgVEhSRUUuTWVzaCggQGRlZmF1bHRHZW9tZXRyeSwgQGRlZmF1bHRNYXRlcmlhbCApXG5cdFx0bW9kZWwub24gXCJzdWNjZXNzXCIsIChtKS0+XG5cdFx0XHRvYmplY3QuZ2VvbWV0cnkgPSBtLmdlb21ldHJ5XHRcdFx0XG5cdFx0XHRvYmplY3QubWF0ZXJpYWwgPSBtLm1hdGVyaWFsXG5cdFx0XHRtLm9mZiBcInN1Y2Nlc3NcIiwgYXJndW1lbnRzLmNhbGxlZSAjcmVtb3ZlIHRoaXMgaGFuZGxlciBvbmNlIHVzZWRcblx0XHRyZXR1cm4gb2JqZWN0XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZWxMb2FkZXJcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xudXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5jbGFzcyBQYXJ0aWNsZSBleHRlbmRzIEdhbWVPYmplY3Rcblx0cGFydGljbGVUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9wYXJ0aWNsZXMvcGFydGljbGUyLnBuZ1wiXG5cdHBhcnRpY2xlTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogcGFydGljbGVUZXh0dXJlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoV3JpdGU6IGZhbHNlXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0YmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblxuXHRwYXJ0aWNsZUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24sIGVuZXJneSktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAxMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHBhcnRpY2xlR2VvbWV0cnksIHBhcnRpY2xlTWF0ZXJpYWxcblx0XHRcblx0XHRAdmVsb2NpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMyh1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpKTtcblx0XHRAdmVsb2NpdHkubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoZW5lcmd5KVxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAdmVsb2NpdHkubXVsdGlwbHlTY2FsYXIoLjk5KVxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnggKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gQHZlbG9jaXR5LnkgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnogKz0gQHZlbG9jaXR5LnogKiBkZWx0YVxuXHRcdHMgPSAxLSAoKERhdGUubm93KCkgLSBAYmlydGgpIC8gQHRpbWVUb0xpdmUpICsgLjAxXG5cdFx0QHJvb3Quc2NhbGUuc2V0KHMsIHMsIHMpXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZVxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9ucyA9IHJlcXVpcmUgJy4vQ29sbGlzaW9ucy5jb2ZmZWUnXG5Nb2RlbExvYWRlciA9IHJlcXVpcmUgJy4vTW9kZWxMb2FkZXIuY29mZmVlJ1xuSW5wdXQgPSByZXF1aXJlICcuL0lucHV0LmNvZmZlZSdcbldlYXBvbnMgPSByZXF1aXJlICcuL1dlYXBvbnMuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcblNodW1wID0gcmVxdWlyZSAnLi9zaHVtcC5jb2ZmZWUnXG5cbm1vZGVsTG9hZGVyID0gbmV3IE1vZGVsTG9hZGVyKClcbiMgaW5wdXQgPSBuZXcgSW5wdXQoKVxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBDb2xsaXNpb25zLkNvbGxpc2lvbk9iamVjdFxuXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdFxuXHRcdEBjb2xsaWRlclR5cGUgPSBcInBsYXllclwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15X2J1bGxldFwiXG5cblx0XHRtb2RlbCA9IG1vZGVsTG9hZGVyLmxvYWQoXCJhc3NldHMvc2hpcHMvc2hpcDIuanNcIilcblx0XHRAcm9vdC5hZGQgbW9kZWxcblx0XHR1dGlsLmFmdGVyIDEwMDAsICgpLT5cblx0XHRcdG1vZGVsLm1hdGVyaWFsLm1hdGVyaWFsc1swXS53aXJlZnJhbWUgPSB0cnVlXG5cdFx0XG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdEBocCA9IDNcblxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWyd1cCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydkb3duJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ2xlZnQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1sncmlnaHQnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1snZmlyZV9wcmltYXJ5J11cblx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcdGlmIERhdGUubm93KCkgPiBAbGFzdEZpcmUgKyAyNDAgKiAxXG5cdFx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0XHRcblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRidWxsZXQuYW5nbGUgPSAtLjI1XG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gKy4yNVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cdFx0XHQjIEBwYXJlbnQuY29sbGlkZXJzLnB1c2ggYnVsbGV0XG5cblx0ZGllOiAoKS0+XG5cdFx0IyBjb25zb2xlLmxvZyBcImRpZVwiXG5cdFx0XG5cdFx0U291bmQucGxheSgnZXhwbG9zaW9uJylcblx0XHRmb3IgaSBpbiBbMC4uMjAwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCA4KVxuXG5cdFx0IyBwb3MgPSBAcm9vdC5wb3NpdGlvblxuXHRcdCMgcGFyZW50ID0gQHBhcmVudFxuXHRcdCMgdXRpbC5hZnRlciAxMDAwLCAoKS0+XG5cdFx0IyBcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChwb3MpXG5cdFx0IyBcdGJ1bGxldC5ocCA9IDEwMFxuXHRcdCMgXHRidWxsZXQuZHAgPSAxMFxuXHRcdCMgXHRidWxsZXQuY29sbGlzaW9uUmFkaXVzID0gMTUwXG5cdFx0IyBcdHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHQjIHV0aWwuYWZ0ZXIgMTI1MCwgU2h1bXAuZ2FtZS5yZXNldFBsYXllclxuXHRcdHN1cGVyKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJjbGFzcyBleHBvcnRzLlNjcmVlbkVmZmVjdFxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5PcnRob2dyYXBoaWNDYW1lcmEoLS41LCAuNSwgLS41ICwgLjUsIDAsIDEpXG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gMFxuXHRcdEBzY2VuZS5hZGQgQGNhbWVyYVxuXHRcdFxuXG5cdFx0QHByb2Nlc3NNYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbFxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IGZhbHNlXG5cdFx0XHR1bmlmb3JtczogXG5cdFx0XHRcdFwidERpZmZ1c2VcIjogeyB0eXBlOiBcInRcIiwgdmFsdWU6IHVuZGVmaW5lZCB9XG5cblx0XHRcdHZlcnRleFNoYWRlcjpcblx0XHRcdFx0XCJcIlwiXG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdHZVdiA9IHV2O1xuXHRcdFx0XHRcdGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR1bmlmb3JtIHNhbXBsZXIyRCB0RGlmZnVzZTtcblx0XHRcdFx0dmFyeWluZyB2ZWMyIHZVdjtcblxuXHRcdFx0XHR2b2lkIG1haW4oKSB7XG5cdFx0XHRcdFx0Ly8gcmVhZCB0aGUgaW5wdXQgY29sb3JcblxuXHRcdFx0XHRcdHZlYzQgbztcblx0XHRcdFx0XHR2ZWM0IGM7XG5cdFx0XHRcdFx0YyA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiApO1xuXHRcdFx0XHRcdC8vbyA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiApO1xuXG5cdFx0XHRcdFx0Ly9taXNhbGlnbiByZ2Jcblx0XHRcdFx0XHRvLnIgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKyB2ZWMyKDAuMCwgLTAuMDAxKSApLnI7XG5cdFx0XHRcdFx0by5nID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIDAuMDAxKSApLnI7XG5cdFx0XHRcdFx0by5iID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIDAuMDAzKSApLnI7XG5cblx0XHRcdFx0XHQvL3NjYW5saW5lc1xuXHRcdFx0XHRcdG8uciAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgMS4wO1xuXHRcdFx0XHRcdG8uZyAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgMS4wO1xuXHRcdFx0XHRcdG8uYiAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgMS4wO1xuXG5cdFx0XHRcdFx0byAqPSAwLjkgKyAxLjAqMTYuMCp2VXYueCp2VXYueSooMS4wLXZVdi54KSooMS4wLXZVdi55KTtcblx0XHRcdFx0XHRcblxuXHRcdFx0XHRcdC8vIHNldCB0aGUgb3V0cHV0IGNvbG9yXG5cdFx0XHRcdFx0Z2xfRnJhZ0NvbG9yID0gbyAqIC41ICsgYyAqIC41O1xuXHRcdFx0XHR9XG5cdFx0XHRcdFwiXCJcIlxuXG5cdFx0QHF1YWQgPSBuZXcgVEhSRUUuTWVzaCggbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEgKSwgQHByb2Nlc3NNYXRlcmlhbCApO1xuXHRcdEBxdWFkLnJvdGF0aW9uLnggPSBNYXRoLlBJXG5cdFx0QHNjZW5lLmFkZCBAcXVhZFxuIiwiXG5zY29yZSA9IDBcbmV4cG9ydHMuZGlzcGxheUVsZW1lbnQgPSB1bmRlZmluZWRcblxuZXhwb3J0cy5zZXQgPSAoX3Njb3JlKS0+XG5cdHNjb3JlID0gX3Njb3JlXG5cdGRpc3BsYXkoKVxuXG5leHBvcnRzLmFkZCA9IChwb2ludHMpLT5cblx0c2NvcmUgKz0gcG9pbnRzXG5cdGRpc3BsYXkoKVxuXG5cdCMgY29uc29sZS5sb2cgZXhwb3J0cy5kaXNwbGF5RWxlbWVudFxuZGlzcGxheSA9ICgpLT5cblx0aWYgZXhwb3J0cy5kaXNwbGF5RWxlbWVudD9cblx0XHRleHBvcnRzLmRpc3BsYXlFbGVtZW50LnRleHQgXCJTY29yZTogI3tzY29yZX1cIlxuXG5leHBvcnRzLmdldCA9ICgpLT5cblx0cmV0dXJuIHNjb3JlXG4iLCJ1dGlsID0gcmVxdWlyZSAnLi4vdXRpbC5jb2ZmZWUnXG5HYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgSG9tZVNjcmVlbiBleHRlbmRzIEdhbWVPYmplY3Rcblx0dGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvc2NyZWVucy90aXRsZS5wbmdcIlxuXHRtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAyMCwgMTUpXG5cblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cblx0XHRAc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXHRcdEBzY2VuZS5hZGQgQHJvb3Rcblx0XHRcblx0XHRAY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCA2NDAgLyA0ODAsIDEsIDEwMDAwKVx0XG5cdFx0QGNhbWVyYS5wb3NpdGlvbi56ID0gdXRpbC5sYXllclNwYWNpbmcoKSAqIDFcblx0XHRAc2NlbmUuYWRkIEBjYW1lcmFcblxuXHRcdHNjcmVlbiA9IG5ldyBUSFJFRS5NZXNoIGdlb21ldHJ5LCBtYXRlcmlhbFxuXHRcdHNjcmVlbi5zY2FsZS5zZXQoLjI1LCAuMjUsIC4yNSlcblx0XHRzY3JlZW4ucG9zaXRpb24ueiA9ICB1dGlsLmxheWVyU3BhY2luZygpICogLjc1XG5cdFx0QHJvb3QuYWRkIHNjcmVlbiBcblxuXG5leHBvcnRzLkhvbWVTY3JlZW4gPSBIb21lU2NyZWVuXG5cbmNsYXNzIEdhbWVPdmVyU2NyZWVuIGV4dGVuZHMgR2FtZU9iamVjdFxuXHR0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9zY3JlZW5zL2dhbWVfb3Zlci5wbmdcIlxuXHRtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAyMCwgMTUpXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRAc2NlbmUuYWRkIEByb290XG5cdFx0XG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgNjQwIC8gNDgwLCAxLCAxMDAwMClcdFxuXHRcdEBjYW1lcmEucG9zaXRpb24ueiA9IHV0aWwubGF5ZXJTcGFjaW5nKCkgKiAxXG5cdFx0QHNjZW5lLmFkZCBAY2FtZXJhXG5cblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG5cbmV4cG9ydHMuR2FtZU92ZXJTY3JlZW4gPSBHYW1lT3ZlclNjcmVlblxuIiwid2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHR8fHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG5hdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbmNsYXNzIFNvdW5kXG5cdGNvbnN0cnVjdG9yOiAoQG5hbWUsIEB1cmwsIEBidWZmZXIpLT5cbmV4cG9ydHMuU291bmQgPSBTb3VuZFxuXG5leHBvcnRzLmxvYWRlZFNvdW5kcyA9IGxvYWRlZFNvdW5kcyA9IHt9XG5cblxuZXhwb3J0cy5sb2FkID0gbG9hZCA9IChuYW1lLCB1cmwpIC0+XG5cdHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXHRcdHJlcXVlc3Qub3BlbignR0VUJywgdXJsKVxuXHRcdHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblx0XHRyZXF1ZXN0Lm9ubG9hZCA9IChhLCBiLCBjKT0+XG5cdFx0XHRpZiByZXF1ZXN0LnN0YXR1cyA9PSAyMDBcblx0XHRcdFx0YXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSByZXF1ZXN0LnJlc3BvbnNlLCBcblx0XHRcdFx0XHQoYnVmZmVyKT0+XG5cdFx0XHRcdFx0XHQjdG9kbyBoYW5kbGUgZGVjb2RpbmcgZXJyb3Jcblx0XHRcdFx0XHRcdHNvdW5kID0gbmV3IFNvdW5kKG5hbWUsIHVybCwgYnVmZmVyKVxuXHRcdFx0XHRcdFx0ZXhwb3J0cy5sb2FkZWRTb3VuZHNbbmFtZV0gPSBzb3VuZFxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc29sdmUoc291bmQpXG5cdFx0XHRcdFx0LChlcnIpPT5cblx0XHRcdFx0XHRcdHJlamVjdCBFcnJvcihcIkRlY29kaW5nIEVycm9yXCIpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNvbnNvbGUubG9nICBcIlN0YXR1c1wiXG5cdFx0XHRcdHJlamVjdCBFcnJvcihcIlN0YXR1cyBFcnJvclwiKVxuXG5cdFx0XHRcdFxuXHRcdHJlcXVlc3Qub25lcnJvciA9ICgpLT5cblx0XHRcdGNvbnNvbGUubG9nIFwiZXJyclwiXG5cdFx0XHRyZWplY3QgRXJyb3IoXCJOZXR3b3JrIEVycm9yXCIpIFx0XG5cblx0XHRyZXF1ZXN0LnNlbmQoKVxuXHRcdFx0XG5cbmV4cG9ydHMucGxheSA9IHBsYXkgPSAoYXJnKS0+XG5cdGlmIHR5cGVvZiBhcmcgPT0gJ3N0cmluZydcblx0XHRidWZmZXIgPSBsb2FkZWRTb3VuZHNbYXJnXS5idWZmZXJcblx0ZWxzZSBcblx0XHRidWZmZXIgPSBhcmdcblx0aWYgYnVmZmVyP1xuXHRcdHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuXHRcdHNvdXJjZS5idWZmZXIgPSBidWZmZXJcblx0XHRzb3VyY2UuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pXG5cdFx0c291cmNlLnN0YXJ0KDApXG5cblxuYXNzZXRzTG9hZGluZyA9IFtdXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnc2hvb3QnLCAnYXNzZXRzL3NvdW5kcy9zaG9vdC53YXYnKVxuYXNzZXRzTG9hZGluZy5wdXNoIGxvYWQoJ2V4cGxvc2lvbicsICdhc3NldHMvc291bmRzL2V4cGxvc2lvbi53YXYnKVxuXG5Qcm9taXNlLmFsbChhc3NldHNMb2FkaW5nKVxuLnRoZW4gKHJlc3VsdHMpLT5cblx0Y29uc29sZS5sb2cgXCJMb2FkZWQgYWxsIFNvdW5kcyFcIiwgcmVzdWx0c1xuLmNhdGNoIChlcnIpLT5cblx0Y29uc29sZS5sb2cgXCJ1aG9oXCIsIGVyclxuXG4iLCJFbmVtaWVzID0gcmVxdWlyZSAnLi9FbmVtaWVzLmNvZmZlZSdcblxuZXhwb3J0cy5sb2FkID0gbG9hZCA9ICh1cmwpIC0+XG5cdHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdGpxeGhyID0gJC5nZXRKU09OIHVybCwgQG9uTG9hZFxuXG5cdFx0anF4aHIuZG9uZSAoKS0+XG5cdFx0XHRsZXZlbCA9IG5ldyBUaWxlZE1hcChqcXhoci5yZXNwb25zZUpTT04pXG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShsZXZlbClcblxuXHRcdGpxeGhyLmZhaWwgKCktPlxuXHRcdFx0cmV0dXJuIHJlamVjdCBFcnJvcihcIlN0YXR1cyBFcnJvclwiKVxuXG5cbmNsYXNzIFRpbGVkTWFwXG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRAdGlsZVNldHMgPSBbXVxuXHRcdEB0aWxlcyA9IFtdXG5cdFx0QGxheWVycyA9IHt9XG5cblx0XHQjIGNyZWF0ZSB0aWxlU2V0cywgbG9hZCB0aGUgdGV4dHVyZXNcblx0XHRmb3IgdGlsZVNldERhdGEgaW4gZGF0YS50aWxlc2V0c1xuXHRcdFx0dGlsZVNldCA9IG5ldyBUaWxlU2V0IHRpbGVTZXREYXRhXG5cdFx0XHRAdGlsZVNldHMucHVzaCB0aWxlU2V0XG5cblx0XHQjIGNyZWF0ZSB0aWxlcyBAZ2VvbWV0ZXJ5IGFuZCBAbWF0ZXJpYWxcblx0XHRmb3IgdGlsZVNldCBpbiBAdGlsZVNldHNcblx0XHRcdGlkID0gdGlsZVNldC5kYXRhLmZpcnN0Z2lkXG5cdFx0XHRmb3Igcm93IGluIFswLi50aWxlU2V0LnJvd3MtMV1cblx0XHRcdFx0Zm9yIGNvbCBpbiBbMC4udGlsZVNldC5jb2xzLTFdXG5cdFx0XHRcdFx0dGlsZSA9IG5ldyBUaWxlIHRpbGVTZXQsIHJvdywgY29sXG5cdFx0XHRcdFx0QHRpbGVzW2lkXSA9IHRpbGVcblx0XHRcdFx0XHRpZCsrXG5cblxuXHRcdCMgbG9hZCBsYXllcnNcblx0XHRmb3IgbGF5ZXJEYXRhIGluIGRhdGEubGF5ZXJzXG5cdFx0XHRpZiBsYXllckRhdGEudHlwZSA9PSBcInRpbGVsYXllclwiXG5cdFx0XHRcdEBsYXllcnNbbGF5ZXJEYXRhLm5hbWVdID0gbmV3IFRpbGVMYXllcih0aGlzLCBsYXllckRhdGEpXG5cdFx0XHRpZiBsYXllckRhdGEudHlwZSA9PSBcIm9iamVjdGdyb3VwXCJcblx0XHRcdFx0QGxheWVyc1tsYXllckRhdGEubmFtZV0gPSBuZXcgT2JqZWN0R3JvdXAobGF5ZXJEYXRhKVxuXG5cdFxuXG5cdGxvYWRUaWxlTGF5ZXI6IChkYXRhKT0+XG5cdFx0bGF5ZXIgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdGZvciBpZCwgaW5kZXggaW4gZGF0YS5kYXRhXG5cdFx0XHRpZiBpZCA+IDBcblx0XHRcdFx0cm93ID0gTWF0aC5mbG9vcihpbmRleCAvIGRhdGEud2lkdGgpXG5cdFx0XHRcdGNvbCA9IGluZGV4ICUgZGF0YS53aWR0aFxuXHRcdFx0XHR0aWxlT2JqZWN0ID0gbmV3IFRpbGVPYmplY3QoQHRpbGVzW2lkXSwgbmV3IFRIUkVFLlZlY3RvcjMoY29sLCAtcm93IC0gMSwgMCkgKVxuXHRcdFx0XHRsYXllci5hZGQgdGlsZU9iamVjdC5yb290XHRcblx0XHRyZXR1cm4gbGF5ZXJcblxuXHRcblxuXG4jIHJlcHJlc2VudHMgYSBUaWxlU2V0IGluIGEgVGlsZWQgRWRpdG9yIGxldmVsXG5jbGFzcyBUaWxlU2V0XG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRAY29scyA9IEBkYXRhLmltYWdld2lkdGggLyBAZGF0YS50aWxld2lkdGhcblx0XHRAcm93cyA9IEBkYXRhLmltYWdlaGVpZ2h0IC8gQGRhdGEudGlsZWhlaWdodFxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy8je0BkYXRhLmltYWdlfVwiXG5cdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoVGVzdDogdHJ1ZVxuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cbiMgUmVwcmVzZW50cyB0aGUgQGdlb21ldHJ5IGFuZCBAbWF0ZXJpYWwgb2YgYSB0aWxlIGxvYWRlZCBmcm9tIGEgVGlsZWQgRWRpdG9yIGxldmVsXG5jbGFzcyBUaWxlXG5cdGNvbnN0cnVjdG9yOiAoQHRpbGVTZXQsIEByb3csIEBjb2wpLT5cblx0XHQjIHRvZG8sIHByb2JhYmx5IGJlIHByZXR0aWVyIHRvIGp1c3QgbWFrZSB0aGlzIGZyb20gc2NyYXRjaFxuXHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCBAdGlsZVNldC5kYXRhLnRpbGV3aWR0aCAvIDMyLCBAdGlsZVNldC5kYXRhLnRpbGVoZWlnaHQgLyAzMilcblx0XHRcblx0XHQjIFJlcG9zaXRpb24gdmVydGljZXMgdG8gbG93ZXIgbGVmdCBhdCAwLDAgXG5cdFx0Zm9yIHYgaW4gQGdlb21ldHJ5LnZlcnRpY2VzXG5cdFx0XHR2LnggKz0gQHRpbGVTZXQuZGF0YS50aWxld2lkdGggLyAzMiAvIDJcblx0XHRcdHYueSArPSBAdGlsZVNldC5kYXRhLnRpbGVoZWlnaHQgLyAzMiAvIDJcblx0XHRAZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZVxuXG5cdFx0IyBjYWxjIGFuZCBzZXQgdXZzXG5cdFx0dXZXaWR0aCA9IEB0aWxlU2V0LmRhdGEudGlsZXdpZHRoL0B0aWxlU2V0LmRhdGEuaW1hZ2V3aWR0aFxuXHRcdHV2SGVpZ2h0ID0gQHRpbGVTZXQuZGF0YS50aWxlaGVpZ2h0L0B0aWxlU2V0LmRhdGEuaW1hZ2VoZWlnaHRcblxuXHRcdHV2WCA9IHV2V2lkdGggKiBAY29sXG5cdFx0dXZZID0gdXZIZWlnaHQgKiAoQHRpbGVTZXQucm93cyAtIEByb3cgLSAxKVxuXHRcdGZvciBmYWNlIGluIEBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdXG5cdFx0XHRmb3IgdiBpbiBmYWNlXG5cdFx0XHRcdGlmIHYueCA9PSAwXG5cdFx0XHRcdFx0di54ID0gdXZYXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR2LnggPSB1dlggKyB1dldpZHRoICMgKiAoMzEuNS8zMi4wKSAjIHRvZG8gZGlydHkgaGFjayB0byBwcmV2ZW50IHNsaWdodCBvdmVyc2FtcGxlIG9uIHRpbGUgc2hvd2luZyBoaW50IG9mIG5leHQgdGlsZSBvbiBlZGdlLlxuXG5cdFx0XHRcdGlmIHYueSA9PSAwXG5cdFx0XHRcdFx0di55ID0gdXZZXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR2LnkgPSB1dlkgKyB1dkhlaWdodCAjICogKDMxLjUvMzIuMCkgIyB0b2RvIGRpcnR5IGhhY2sgdG8gcHJldmVudCBzbGlnaHQgb3ZlcnNhbXBsZSBvbiB0aWxlIHNob3dpbmcgaGludCBvZiBuZXh0IHRpbGUgb24gZWRnZS5cdFx0XHRcdFx0XG5cdFx0QGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlXG5cblx0XHRAbWF0ZXJpYWwgPSBAdGlsZVNldC5tYXRlcmlhbFxuXG5cdFx0XG5cbiMgUmVwcmVzZW50cyBhIFRpbGVMYXllciBpbiB0aGUgVGlsZWQgRWRpdG9yIGZpbGUuIFxuY2xhc3MgVGlsZUxheWVyXG5cdGNvbnN0cnVjdG9yOiAobWFwLCBAZGF0YSktPlxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRmb3IgaWQsIGluZGV4IGluIEBkYXRhLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gZGF0YS53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBkYXRhLndpZHRoXG5cdFx0XHRcdCMgY29uc29sZS5sb2cgIFwidGlsZVwiLCBtYXAsIG1hcC50aWxlc1tpZF1cblx0XHRcdFx0dGlsZU9iamVjdCA9IG5ldyBUaWxlT2JqZWN0KG1hcC50aWxlc1tpZF0sIG5ldyBUSFJFRS5WZWN0b3IzKGNvbCwgLXJvdyAtIDEsIDApIClcblx0XHRcdFx0QHJvb3QuYWRkIHRpbGVPYmplY3QubWVzaFx0XG5cdFx0XG5cbiMgUmVwcmVzZW50cyBhbiBpbnN0YW5jZSBvZiBhIHRpbGUgdG8gYmUgcmVuZGVyZWRcbmNsYXNzIFRpbGVPYmplY3Rcblx0Y29uc3RydWN0b3I6ICh0aWxlLCBwb3NpdGlvbiktPlxuXHRcdEBtZXNoID0gbmV3IFRIUkVFLk1lc2ggdGlsZS5nZW9tZXRyeSwgdGlsZS5tYXRlcmlhbFxuXHRcdEBtZXNoLnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cdFxuXG5jbGFzcyBPYmplY3RHcm91cFxuXHRjb25zdHJ1Y3RvcjogKEBkYXRhKS0+XG5cdFx0QG9iamVjdHMgPSBbXVxuXHRcdGZvciBvYmplY3REYXRhIGluIEBkYXRhLm9iamVjdHMgXG5cdFx0XHRlbmVteSA9IG5ldyBFbmVtaWVzW29iamVjdERhdGEudHlwZV0obmV3IFRIUkVFLlZlY3RvcjMob2JqZWN0RGF0YS54IC8gMzIsIDcgLSBvYmplY3REYXRhLnkgLyAzMiwgMCkpXG5cdFx0XHRAb2JqZWN0cy5wdXNoIGVuZW15XG4iLCJTY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuQ29sbGlzaW9ucyA9IHJlcXVpcmUgJy4vQ29sbGlzaW9ucy5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuXG5jbGFzcyBleHBvcnRzLkJ1bGxldCBleHRlbmRzIENvbGxpc2lvbnMuQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0LnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpXG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHN1cGVyKHRhcmdldClcblx0XHRTY29yZS5hZGQoMSlcblx0XHRAZGllKClcblx0XHRmb3IgaSBpbiBbMC4uNV1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMSlcblxuXG5jbGFzcyBleHBvcnRzLkVuZW15QnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9ucy5Db2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXRfMi5wbmdcIlxuXHRidWxsZXRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBidWxsZXRUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRidWxsZXRHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKVxuXHRcblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHN1cGVyKHRhcmdldClcblx0XHRTY29yZS5hZGQoMSlcblx0XHRAZGllKClcblx0XHRmb3IgaSBpbiBbMC4uNV1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMSlcbiIsIkdhbWUgPSByZXF1aXJlICcuL0dhbWUuY29mZmVlJ1xuXG5cbm1vZHVsZS5leHBvcnRzLkdhbWUgPSBuZXcgR2FtZS5HYW1lKClcblxuXHRcdFxuXG4jIG1vZGVsTG9hZGVyID0gbmV3IGNvcmUuTW9kZWxMb2FkZXIoKVxuXG5cblx0XHRcdFxuXG5cbiIsImV4cG9ydHMuYWZ0ZXIgPSAoZGVsYXksIGZ1bmMpLT5cblx0c2V0VGltZW91dCBmdW5jLCBkZWxheVxuXG5leHBvcnRzLnJhbmRvbSA9IChtaW4sIG1heCktPlxuXHRyZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuXG5cbmV4cG9ydHMubGF5ZXJTcGFjaW5nID0gKCktPlxuXHRmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cdHRhcmdldFogPSA0ODAgLyAoMiAqIE1hdGgudGFuKGZvdl9yYWRpYW5zIC8gMikgKSAvIDMyLjA7XG4iXX0=
