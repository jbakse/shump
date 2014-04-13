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
var Base, Game, GameObject, Level, Score, Screens, Sound,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Sound = require('./Sound.coffee');

Score = require('./Score.coffee');

Level = require('./Level.coffee');

GameObject = require('./GameObject.coffee');

Screens = require('./Screens.coffee');

Base = require('./Base.coffee');

Game = (function(_super) {
  __extends(Game, _super);

  function Game() {
    this.animate = __bind(this.animate, this);
    this.render = __bind(this.render, this);
    this.update = __bind(this.update, this);
    Game.__super__.constructor.call(this);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(640, 480);
    $("#shump")[0].appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.level = new Level.Level(this.world);
    this.lives = 3;
    util.after(1, (function(_this) {
      return function() {
        return _this.animate();
      };
    })(this));
  }

  Game.prototype.update = function(delta) {
    return this.level.update(delta);
  };

  Game.prototype.render = function() {
    return this.renderer.render(this.level.scene, this.level.camera);
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


},{"./Base.coffee":2,"./GameObject.coffee":6,"./Level.coffee":8,"./Score.coffee":12,"./Screens.coffee":13,"./Sound.coffee":14}],6:[function(require,module,exports){
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
    var object, _i, _len, _ref, _results;
    this.root.add(map.layers.background.root);
    map.layers.background.root.position.y = 7.5 * 2;
    map.layers.background.root.position.z = util.layerSpacing() * -1;
    map.layers.background.root.scale.set(2, 2, 2);
    this.root.add(map.layers.midground.root);
    map.layers.midground.root.position.y = 7.5;
    _ref = map.layers.enemies.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      _results.push(this.add(object));
    }
    return _results;
  };

  Level.prototype.insertPlayer = function() {
    this.player1 = new Player();
    this.add(this.player1);
    this.player1.root.position.copy(this.camera.position);
    this.player1.root.position.z = 0;
    return this.player1.on("die", (function(_this) {
      return function() {
        return util.after(1000, _this.insertPlayer);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0VuZW1pZXMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9HYW1lLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvR2FtZU9iamVjdC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0lucHV0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvTGV2ZWwuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9Nb2RlbExvYWRlci5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1BhcnRpY2xlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGxheWVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvU2NvcmUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY3JlZW5zLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvU291bmQuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9UaWxlZC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dlYXBvbnMuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9zaHVtcC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxrQkFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHNCQUFSLENBQVIsQ0FBQTs7QUFBQSxDQUVBLENBQUUsYUFBRixDQUFnQixDQUFDLEtBQWpCLENBQXVCLFNBQUEsR0FBQTtBQUV0QixNQUFBLHNFQUFBO0FBQUEsRUFBQSxDQUFBLENBQUUsUUFBRixDQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsdUJBQWYsQ0FBdUMsT0FBTyxDQUFDLG9CQUEvQyxDQUFBLENBQUE7QUFBQSxFQUVBLE1BQUEsR0FBUyxDQUFBLENBQUUsZUFBRixDQUZULENBQUE7QUFBQSxFQUdBLFlBQUEsR0FBZSxNQUFNLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsTUFBTSxDQUFDLE1BQVAsQ0FBQSxDQUhoQyxDQUFBO0FBQUEsRUFLQSxjQUFB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QUEsQ0FBUSxlQUFSLENBQVAsQ0FBQTs7QUFBQSxNQUdNLENBQUMsT0FBTyxDQUFDLElBQWYsR0FBMEIsSUFBQSxJQUFJLENBQUMsSUFBTCxDQUFBLENBSDFCLENBQUE7Ozs7QUNBQSxPQUFPLENBQUMsS0FBUixHQUFnQixTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7U0FDZixVQUFBLENBQVcsSUFBWCxFQUFpQixLQUFqQixFQURlO0FBQUEsQ0FBaEIsQ0FBQTs7QUFBQSxPQUdPLENBQUMsTUFBUixHQUFpQixTQUFDLEdBQUQsRUFBTSxHQUFOLEdBQUE7QUFDaEIsU0FBTyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsQ0FBQyxHQUFBLEdBQU0sR0FBUCxDQUFoQixHQUE4QixHQUFyQyxDQURnQjtBQUFBLENBSGpCLENBQUE7O0FBQUEsT0FPTyxDQUFDLFlBQVIsR0FBdUIsU0FBQSxHQUFBO0FBQ3RCLE1BQUEsb0JBQUE7QUFBQSxFQUFBLFdBQUEsR0FBYyxFQUFBLEdBQUssQ0FBQyxJQUFJLENBQUMsRUFBTCxHQUFVLEdBQVgsQ0FBbkIsQ0FBQTtTQUNBLE9BQUEsR0FBVSxHQUFBLEdBQU0sQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxXQUFBLEdBQWMsQ0FBdkIsQ0FBTCxDQUFOLEdBQXlDLEtBRjdCO0FBQUEsQ0FQdkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwic2h1bXAgPSByZXF1aXJlKCcuL3NodW1wL3NodW1wLmNvZmZlZScpXG5cbiQoXCIjZnVsbHNjcmVlblwiKS5jbGljayAoKS0+XG5cdFxuXHQkKFwiI3NodW1wXCIpWzBdLndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuKEVsZW1lbnQuQUxMT1dfS0VZQk9BUkRfSU5QVVQpO1xuXHRcblx0Y2FudmFzID0gJChcIiNzaHVtcCBjYW52YXNcIilcblx0Y2FudmFzQXNwZWN0ID0gY2FudmFzLndpZHRoKCkgLyBjYW52YXMuaGVpZ2h0KClcblxuXHRjb250YWluZXJXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG5cdGNvbnRhaW5lckhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKVxuXHRjb250YWluZXJBc3BlY3QgPSBjb250YWluZXJXaWR0aCAvIGNvbnRhaW5lckhlaWdodFxuXHRjb25zb2xlLmxvZyBjYW52YXNBc3BlY3QsICQod2luZG93KS53aWR0aCgpICwgJCh3aW5kb3cpLmhlaWdodCgpLCBjb250YWluZXJBc3BlY3Rcblx0XG5cdGlmIGNhbnZhc0FzcGVjdCA8IGNvbnRhaW5lckFzcGVjdFxuXHRcdGNvbnNvbGUubG9nIFwibWF0Y2ggaGVpZ2h0XCJcblx0XHRjYW52YXMuaGVpZ2h0IGNvbnRhaW5lckhlaWdodFxuXHRcdGNhbnZhcy53aWR0aCBjb250YWluZXJIZWlnaHQgKiBjYW52YXNBc3BlY3Rcblx0ZWxzZVxuXHRcdGNvbnNvbGUubG9nIFwibWF0Y2ggd2lkdGhcIlxuXHRcdGNhbnZhcy53aWR0aCBjb250YWluZXJXaWR0aFxuXHRcdGNhbnZhcy5oZWlnaHQgY29udGFpbmVyV2lkdGggLyBjYW52YXNBc3BlY3RcblxuJChcIiNkZWJ1Z1wiKS5hcHBlbmQoXCJcIlwiPHNwYW4gaWQ9XCJsZXZlbENoaWxkcmVuXCI+XCJcIlwiKVxuXG5cbnVwZGF0ZURlYnVnID0gKCktPlxuXHQkKFwiI2xldmVsQ2hpbGRyZW5cIikudGV4dCBcIlwiXCJsZXZlbC5jaGlsZHJlbiA9ICN7c2h1bXAuR2FtZS5sZXZlbC5jaGlsZHJlbi5sZW5ndGh9XCJcIlwiXG5cblxuIyBzaHVtcC5HYW1lLndvcmxkLm9uIFwidXBkYXRlXCIsIHVwZGF0ZURlYnVnXG5cblxuXG4jIGNvbnNvbGUubG9nIFwiaGlkZXJhXCJcblxuXG4iLCJjbGFzcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QF9ldmVudHMgPSB7fVxuXG5cdG9uOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0KEBfZXZlbnRzW2V2ZW50XSA/PSBbXSkucHVzaCBoYW5kbGVyXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRvZmY6IChldmVudCwgaGFuZGxlcikgLT5cblx0XHRmb3Igc3VzcGVjdCwgaW5kZXggaW4gQF9ldmVudHNbZXZlbnRdIHdoZW4gc3VzcGVjdCBpcyBoYW5kbGVyXG5cdFx0XHRAX2V2ZW50c1tldmVudF0uc3BsaWNlIGluZGV4LCAxXG5cdFx0cmV0dXJuIHRoaXNcblxuXHR0cmlnZ2VyOiAoZXZlbnQsIGFyZ3MuLi4pID0+XG5cdFx0cmV0dXJuIHRoaXMgdW5sZXNzIEBfZXZlbnRzW2V2ZW50XT9cblx0XHRmb3IgaSBpbiBbQF9ldmVudHNbZXZlbnRdLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0aGFuZGxlciA9IEBfZXZlbnRzW2V2ZW50XVtpXVxuXHRcdFx0aGFuZGxlci5hcHBseSB0aGlzLCBhcmdzXG5cdFx0cmV0dXJuIHRoaXNcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgQ29sbGlzaW9uT2JqZWN0IGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gdW5kZWZpbmVkXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMgPSBbXVxuXHRcdEBocCA9IDFcblx0XHRAZHAgPSAxXG5cdFx0QGNvbGxpc2lvblJhZGl1cyA9IC42XG5cblx0Y29sbGlkZUludG86ICh0YXJnZXQpLT5cblx0XHR0YXJnZXQudGFrZURhbWFnZShAZHApXG5cdFx0IyBAZGllKClcblx0XHQjIGdhbWVPYmplY3QuZGllKClcblxuXHR0YWtlRGFtYWdlOiAoZGFtYWdlKS0+XG5cdFx0QGhwIC09IGRhbWFnZVxuXHRcdGlmIEBocCA8PSAwIFxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzLkNvbGxpc2lvbk9iamVjdCA9IENvbGxpc2lvbk9iamVjdFxuXG5cblxubW9kdWxlLmV4cG9ydHMucmVzb2x2ZUNvbGxpc2lvbnMgPSAoY29sbGlkZXJzKS0+XG5cdGZvciBhIGluIGNvbGxpZGVyc1xuXHRcdGlmIGEuYWN0aXZlXG5cdFx0XHRmb3IgYiBpbiBjb2xsaWRlcnNcblx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRpZiBhLmNvbGxpZGVySGl0VHlwZXMuaW5kZXhPZihiLmNvbGxpZGVyVHlwZSkgPiAtMVxuXHRcdFx0XHRcdFx0aWYgQHRlc3RDb2xsaXNpb24gYSwgYlxuXHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVJbnRvIGJcblxubW9kdWxlLmV4cG9ydHMudGVzdENvbGxpc2lvbiA9IChhLCBiKS0+XG5cdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IGEuY29sbGlzaW9uUmFkaXVzICsgYi5jb2xsaXNpb25SYWRpdXNcbiIsIlxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbnMgPSByZXF1aXJlICcuL0NvbGxpc2lvbnMuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcbldlYXBvbnMgPSByZXF1aXJlICcuL1dlYXBvbnMuY29mZmVlJ1xuXG5cbmNsYXNzIEJhc2ljIGV4dGVuZHMgQ29sbGlzaW9ucy5Db2xsaXNpb25PYmplY3Rcblx0ZW5lbXlUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9lbmVtaWVzL2VuZW15LnBuZ1wiXG5cdGVuZW15TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogZW5lbXlUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdGVuZW15R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gXCJlbmVteVwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcInBsYXllclwiXG5cblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZW5lbXlHZW9tZXRyeSwgZW5lbXlNYXRlcmlhbFxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cdFx0QGFnZSA9IDBcblx0XHRAaGFzRmlyZWQgPSBmYWxzZVxuXG5cdFx0QGFjdGl2ZSA9IGZhbHNlXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAYWdlICs9IGRlbHRhXG5cdFx0XG5cdFxuXHRkaWU6ICgpLT5cblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMylcblx0XHRzdXBlcigpXG5cblxuY2xhc3MgU2luV2F2ZSBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLTEgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gZGVsdGEgKiBNYXRoLnNpbihAYWdlKVxuXG5jbGFzcyBEYXJ0IGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0aWYgQGFnZSA8IC41XG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0yMCAqIGRlbHRhXG5cdFx0ZWxzZSBpZiBAYWdlIDwgM1xuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHRlbHNlXG5cdFx0XHRAZGllKClcblxuXHRcdGlmIEBhZ2UgPiAxIGFuZCBub3QgQGhhc0ZpcmVkXG5cdFx0XHRAaGFzRmlyZWQgPSB0cnVlXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcblx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KEByb290LnBvc2l0aW9uKVxuXG5cdFx0YnVsbGV0LmNvbGxpZGVyVHlwZSA9IFwiZW5lbXlfYnVsbGV0XCJcblx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUEkgLSAuMjVcblx0XHRidWxsZXQuc3BlZWQgPSA1XG5cblx0XHRAcGFyZW50LmFkZCBidWxsZXRcdFxuXG5cdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuRW5lbXlCdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cblx0XHRidWxsZXQuY29sbGlkZXJUeXBlID0gXCJlbmVteV9idWxsZXRcIlxuXHRcdGJ1bGxldC5jb2xsaWRlckhpdFR5cGVzID0gW1wicGxheWVyXCJdXG5cdFx0YnVsbGV0LmFuZ2xlID0gTWF0aC5QSSArIC4yNVxuXHRcdGJ1bGxldC5zcGVlZCA9IDVcblxuXHRcdEBwYXJlbnQuYWRkIGJ1bGxldFx0XG5cblxuZXhwb3J0cy5CYXNpYyA9IEJhc2ljXG5leHBvcnRzLlNpbldhdmUgPSBTaW5XYXZlXG5leHBvcnRzLkRhcnQgPSBEYXJ0XG5cbiMgc3VwZXIoZGVsdGEpXG5cdFx0IyBpZiBAYWdlIDwgMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDJcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueSArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyLjFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHQjIGVsc2Vcblx0XHQjIFx0QGRpZSgpXG4iLCJcblxuXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcbkxldmVsID0gcmVxdWlyZSAnLi9MZXZlbC5jb2ZmZWUnXG5cbkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5TY3JlZW5zID0gcmVxdWlyZSAnLi9TY3JlZW5zLmNvZmZlZSdcblxuQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIEdhbWUgZXh0ZW5kcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXG5cdFx0IyBjcmVhdGUgcmVuZGVyZXJcblx0XHRAcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpXG5cdFx0QHJlbmRlcmVyLnNldFNpemUgNjQwLCA0ODBcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cblx0XHQjIGNsb2NrXG5cdFx0QGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKClcblxuXHRcdCMgbGV2ZWxcblx0XHRAbGV2ZWwgPSBuZXcgTGV2ZWwuTGV2ZWwoQHdvcmxkKVxuXG5cdFx0IyBpbml0aWFsaXplIHN0YXRlXG5cdFx0QGxpdmVzID0gM1xuXG5cdFx0IyBsb2FkIGFzc2V0c1xuXG5cdFx0IyBiZWdpbiBnYW1lXG5cdFx0dXRpbC5hZnRlciAxLCAoKT0+XG5cdFx0XHRAYW5pbWF0ZSgpXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRAbGV2ZWwudXBkYXRlKGRlbHRhKVxuXG5cdHJlbmRlcjogKCk9PlxuXHRcdEByZW5kZXJlci5yZW5kZXIgQGxldmVsLnNjZW5lLCBAbGV2ZWwuY2FtZXJhXG5cblx0YW5pbWF0ZTogPT5cblx0XHQjIHVwZGF0ZSB0aGUgZ2FtZSBwaHlzaWNzXG5cdFx0ZGVsdGEgPSBAY2xvY2suZ2V0RGVsdGEoKVxuXHRcdGlmIChkZWx0YSA8IC41KSBcblx0XHRcdEB1cGRhdGUoZGVsdGEpXG5cblx0XHQjIHJlbmRlciB0byBzY3JlZW5cblx0XHRAcmVuZGVyKClcblxuXHRcdCMgcmVwZWF0XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIEBhbmltYXRlXG5cdFx0cmV0dXJuXG5cblxuZXhwb3J0cy5HYW1lID0gR2FtZVxuXG5cblxuXG5cblxuIyBAaG9tZVNjcmVlbiA9IG5ldyBTY3JlZW5zLkhvbWVTY3JlZW4oKVxuIyBAZ2FtZU92ZXJTY3JlZW4gPSBuZXcgU2NyZWVucy5HYW1lT3ZlclNjcmVlbigpXG4jIEBsb2FkTGV2ZWwoKVxuXG4jIFNjb3JlLmRpc3BsYXlFbGVtZW50ID0gJChcIlwiXCI8aDE+U2NvcmU6PC9oMT5cIlwiXCIpLmFwcGVuZFRvICQoXCIjc2h1bXBcIilcbiMgQGxpdmVzRWxlbWVudCA9ICQoXCJcIlwiPGgxPkxpdmVzOjwvaDE+XCJcIlwiKS5hcHBlbmRUbyAkKFwiI3NodW1wXCIpXG5cblxuIyBAc3RhdGUgPSBcImhvbWVcIlxuIyAjIEB3b3JsZC5zY2VuZS5hZGQgQGhvbWVTY3JlZW4ucm9vdFxuXG5cbiMgJCh3aW5kb3cpLmtleWRvd24gKGUpPT5cbiMgXHRpZiBAc3RhdGUgPT0gXCJob21lXCJcbiMgXHRcdCMgQHdvcmxkLnNjZW5lLnJlbW92ZSBAaG9tZVNjcmVlbi5yb290XG4jIFx0XHRAc3RhdGUgPSBcInBsYXlcIlxuIyBcdFx0QHN0YXJ0TGV2ZWwoKVxuIyBcdFx0cmV0dXJuXG5cbiMgXHRpZiBAc3RhdGUgPT0gXCJnYW1lX292ZXJcIlxuIyBcdFx0QHdvcmxkLnNjZW5lLnJlbW92ZSBAZ2FtZU92ZXJTY3JlZW4ucm9vdFxuIyBcdFx0QHdvcmxkLnNjZW5lLmFkZCBAaG9tZVNjcmVlbi5yb290XG4jIFx0XHRAc3RhdGUgPSBcImhvbWVcIlxuIyBcdFx0cmV0dXJuXG5cblxuXHQjIGxvYWRMZXZlbDogKCktPlxuXHQjIFx0IyBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggPSAwO1xuXHQjIFx0QGxldmVsID0gbmV3IExldmVsLkxldmVsKEB3b3JsZClcblx0XG5cdCMgc3RhcnRMZXZlbDogKCktPlxuXHQjIFx0QHdvcmxkLnNjZW5lLmFkZCBAbGV2ZWwucm9vdFxuXHQjIFx0QHdvcmxkLm9uIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblx0XHRcblx0IyByZXNldFBsYXllcjogKCk9PlxuXHQjIFx0QGxpdmVzLS1cblx0IyBcdEBsaXZlc0VsZW1lbnQudGV4dCBcIkxpdmVzOiAje0BsaXZlc31cIlxuXG5cdCMgXHRpZiBAbGl2ZXMgPiAwXG5cdCMgXHRcdEBsZXZlbC5wbGF5ZXIxID0gbmV3IFBsYXllcigpXG5cdCMgXHRcdEBsZXZlbC5wbGF5ZXIxLnJvb3QucG9zaXRpb24ueCA9IEB3b3JsZC5jYW1lcmEucG9zaXRpb24ueFxuXHQjIFx0XHRAbGV2ZWwuYWRkIEBsZXZlbC5wbGF5ZXIxXG5cdCMgXHRlbHNlXG5cdCMgXHRcdHV0aWwuYWZ0ZXIgMjAwMCwgQGdhbWVPdmVyXG5cblx0IyBnYW1lT3ZlcjogKCk9PlxuXHQjIFx0Y29uc29sZS5sb2cgXCJnYW1lIG92ZXJcIlxuXHRcdFxuXHQjIFx0QHdvcmxkLnNjZW5lLnJlbW92ZSBAbGV2ZWwucm9vdFxuXHQjIFx0QHdvcmxkLm9mZiBcInVwZGF0ZVwiLCBAbGV2ZWwudXBkYXRlXG5cblx0IyBcdEBsb2FkTGV2ZWwoKVxuXHQjIFx0QHdvcmxkLnNjZW5lLmFkZCBAZ2FtZU92ZXJTY3JlZW4ucm9vdFxuXHQjIFx0QHN0YXRlID0gXCJnYW1lX292ZXJcIlxuIiwiQmFzZSA9IHJlcXVpcmUgJy4vQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIEdhbWVPYmplY3QgZXh0ZW5kcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdHN1cGVyKClcblxuXHRcdEBwYXJlbnQgPSB1bmRlZmluZWRcblx0XHRAY2hpbGRyZW4gPSBbXVxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRAZGVhZCA9IGZhbHNlXG5cdFx0QGFjdGl2ZSA9IHRydWVcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGZvciBpIGluIFtAY2hpbGRyZW4ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRjaGlsZCA9IEBjaGlsZHJlbltpXVxuXHRcdFx0aWYgY2hpbGQuZGVhZFxuXHRcdFx0XHRAcmVtb3ZlIGNoaWxkXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRpZiBjaGlsZC5hY3RpdmVcblx0XHRcdFx0Y2hpbGQudXBkYXRlIGRlbHRhIFxuXHRcblx0YWN0aXZhdGU6ICgpLT5cblx0XHRAYWN0aXZlID0gdHJ1ZTtcblx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSB0aGlzXG5cdFx0QGNoaWxkcmVuLnB1c2goZ2FtZU9iamVjdClcblx0XHRAcm9vdC5hZGQoZ2FtZU9iamVjdC5yb290KVxuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdEByb290LnJlbW92ZShnYW1lT2JqZWN0LnJvb3QpXG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSBudWxsXG5cdFx0aSA9ICBAY2hpbGRyZW4uaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNoaWxkcmVuLnNwbGljZShpLCAxKTtcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdGRpZTogKCktPlxuXHRcdEBkZWFkID0gdHJ1ZTtcblx0XHRAdHJpZ2dlciBcImRpZVwiXG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZU9iamVjdFxuIiwiY2xhc3MgSW5wdXRcblx0a2V5TWFwOiBcblx0XHRcIjM4XCI6XCJ1cFwiICN1cCBhcnJvd1xuXHRcdFwiODdcIjpcInVwXCIgI3dcblx0XHRcIjQwXCI6XCJkb3duXCIgI2Rvd24gYXJyb3dcblx0XHRcIjgzXCI6XCJkb3duXCIgI3Ncblx0XHRcIjM3XCI6XCJsZWZ0XCIgI2xlZnQgYXJyb3dcblx0XHRcIjY1XCI6XCJsZWZ0XCIgI2Fcblx0XHRcIjM5XCI6XCJyaWdodFwiICNyaWdodCBhcnJvd1xuXHRcdFwiNjhcIjpcInJpZ2h0XCIgI2Rcblx0XHRcIjMyXCI6XCJmaXJlX3ByaW1hcnlcIiAjc3BhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAa2V5U3RhdGVzID0gW11cblxuXHRcdGZvciBrZXksIHZhbHVlIG9mIEBrZXlNYXBcblx0XHRcdEBrZXlTdGF0ZXNbdmFsdWVdID0gZmFsc2U7XG5cblx0XHQkKHdpbmRvdykua2V5ZG93biAoZSk9PlxuXHRcdFx0IyBjb25zb2xlLmxvZyBlLndoaWNoXG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSB0cnVlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5cdFx0JCh3aW5kb3cpLmtleXVwIChlKT0+XG5cdFx0XHRpZiBAa2V5TWFwW2Uud2hpY2hdXG5cdFx0XHRcdEBrZXlTdGF0ZXNbQGtleU1hcFtlLndoaWNoXV0gPSBmYWxzZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuaW5wdXQgPSBuZXcgSW5wdXQoKVxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dFxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuVGlsZWQgPSByZXF1aXJlICcuL1RpbGVkLmNvZmZlZSdcblBsYXllciA9IHJlcXVpcmUgJy4vUGxheWVyLmNvZmZlZSdcbkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuQ29sbGlzaW9ucyA9IHJlcXVpcmUgJy4vQ29sbGlzaW9ucy5jb2ZmZWUnXG5cbmNsYXNzIExldmVsIGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAY29sbGlkZXJzID0gW11cblxuXHRcdCMgY3JlYXRlIHNjZW5lXG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRAc2NlbmUuYWRkIEByb290XG5cblx0XHQjIGNhbWVyYVxuXHRcdEBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIDY0MCAvIDQ4MCwgMSwgMTAwMDApXHRcblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB1dGlsLmxheWVyU3BhY2luZygpICogMVxuXHRcdEBzY2VuZS5hZGQgQGNhbWVyYVxuXG5cdFx0IyBsaWdodHNcblx0XHRAYW1iaWVudExpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XG5cdFx0QHJvb3QuYWRkKEBhbWJpZW50TGlnaHQpXG5cblxuXHRcdCMgaW5zZXJ0IHBsYXllclxuXHRcdEBpbnNlcnRQbGF5ZXIoKVxuXG5cblx0XHQjIGxldmVsXG5cdFx0VGlsZWQubG9hZCgnYXNzZXRzL2xldmVsXzEuanNvbicpLnRoZW4oQHBvcHVsYXRlKS5jYXRjaCAoZXJyb3IpLT5cblx0IFx0XHRjb25zb2xlLmVycm9yIGVycm9yXG5cblx0cG9wdWxhdGU6IChtYXApPT5cblx0XHRAcm9vdC5hZGQobWFwLmxheWVycy5iYWNrZ3JvdW5kLnJvb3QpXG5cdFx0bWFwLmxheWVycy5iYWNrZ3JvdW5kLnJvb3QucG9zaXRpb24ueSA9IDcuNSAqIDJcblx0XHRtYXAubGF5ZXJzLmJhY2tncm91bmQucm9vdC5wb3NpdGlvbi56ID0gIHV0aWwubGF5ZXJTcGFjaW5nKCkgKiAtMVxuXHRcdG1hcC5sYXllcnMuYmFja2dyb3VuZC5yb290LnNjYWxlLnNldCgyLCAyLCAyKVxuXHRcdFxuXHRcdEByb290LmFkZChtYXAubGF5ZXJzLm1pZGdyb3VuZC5yb290KVxuXHRcdG1hcC5sYXllcnMubWlkZ3JvdW5kLnJvb3QucG9zaXRpb24ueSA9IDcuNVxuXG5cdFx0Zm9yIG9iamVjdCBpbiBtYXAubGF5ZXJzLmVuZW1pZXMub2JqZWN0c1xuXHRcdFx0QGFkZCBvYmplY3RcblxuXHRpbnNlcnRQbGF5ZXI6ICgpPT5cblx0XHRAcGxheWVyMSA9IG5ldyBQbGF5ZXIoKVxuXHRcdEBhZGQgQHBsYXllcjFcblx0XHRAcGxheWVyMS5yb290LnBvc2l0aW9uLmNvcHkgQGNhbWVyYS5wb3NpdGlvblxuXHRcdEBwbGF5ZXIxLnJvb3QucG9zaXRpb24ueiA9IDBcblxuXHRcdEBwbGF5ZXIxLm9uIFwiZGllXCIsICgpPT5cblx0XHRcdHV0aWwuYWZ0ZXIgMTAwMCwgQGluc2VydFBsYXllclxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXG5cdFx0QGNhbWVyYS5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXHRcdEBwbGF5ZXIxLnJvb3QucG9zaXRpb24ueCArPSAxICogZGVsdGFcblxuXHRcdGZvciBjaGlsZCBpbiBAY2hpbGRyZW5cblx0XHRcdGlmIGNoaWxkLmFjdGl2ZSA9PSBmYWxzZSBhbmQgY2hpbGQucm9vdC5wb3NpdGlvbi54IDwgQGNhbWVyYS5wb3NpdGlvbi54ICsgMTBcblx0XHRcdFx0Y2hpbGQuYWN0aXZhdGUoKVxuXG5cdFx0Q29sbGlzaW9ucy5yZXNvbHZlQ29sbGlzaW9ucyhAY29sbGlkZXJzKVxuXG5cdFxuXHRcdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGlmIGdhbWVPYmplY3QgaW5zdGFuY2VvZiBDb2xsaXNpb25zLkNvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKVxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cblxuZXhwb3J0cy5MZXZlbCA9IExldmVsXG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoQGdlb21ldHJ5LCBAbWF0ZXJpYWwpLT5cblx0XHRzdXBlcigpXG5cdFx0QG1hdGVyaWFsID0gdW5kZWZpbmVkXG5cdFx0QGdlb21ldHJ5ID0gdW5kZWZpbmVkXG5cdFx0QHRleHR1cmUgPSB1bmRlZmluZWRcblx0XHRAc3RhdHVzID0gdW5kZWZpbmVkXG5cblx0bG9hZDogKGZpbGVOYW1lKT0+XG5cdFx0anNvbkxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKCk7XG5cdFx0anNvbkxvYWRlci5sb2FkIGZpbGVOYW1lLCAoZ2VvbWV0cnksIG1hdGVyaWFscywgb3RoZXJzLi4uKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbCggbWF0ZXJpYWxzIClcblx0XHRcdCMgQG1hdGVyaWFsID0gbWF0ZXJpYWxzWzBdXG5cdFx0XHRAZ2VvbWV0cnkgPSBnZW9tZXRyeVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXHRsb2FkUG5nOiAoZmlsZU5hbWUpPT5cblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgZmlsZU5hbWUsIHt9LCAoKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdFx0IyB0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0XHQjIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cdFx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdFx0IyBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSAxLCAxXG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJsb2FkcG5nXCIsIHRoaXNcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cblxuXG5jbGFzcyBNb2RlbExvYWRlclxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBkZWZhdWx0R2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KDEsMSwxKVxuXHRcdEBkZWZhdWx0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdGNvbG9yOiAweDAwZmYwMFxuXHRcdFx0d2lyZWZyYW1lOiB0cnVlXG5cdFx0XHRtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvdXRpbC93aGl0ZS5wbmdcIlxuXG5cdFx0QGxvYWRlZE1vZGVscyA9IHt9XG5cblx0bG9hZDogKGZpbGVOYW1lKS0+XG5cblx0XHQjIGlmIGFscmVhZHkgbG9hZGVkLCBqdXN0IG1ha2UgdGhlIG5ldyBtZXNoIGFuZCByZXR1cm5cblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXT8gJiYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uc3RhdHVzID09IFwicmVhZHlcIlxuXHRcdFx0I2NvbnNvbGUubG9nIFwiY2FjaGVkXCJcblx0XHRcdHJldHVybiBuZXcgVEhSRUUuTWVzaChAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5nZW9tZXRyeSwgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0ubWF0ZXJpYWwpXG5cblxuXHRcdCMgaWYgcmVxdWVzdGVkIGJ1dCBub3QgcmVhZHlcblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFx0bW9kZWwgPSBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFxuXHRcdCMgaWYgbm90IHJlcXVlc3RlZCBiZWZvcmVcblx0XHRlbHNlXG5cdFx0XHRtb2RlbCA9IG5ldyBNb2RlbCgpXG5cdFx0XHRpZiBmaWxlTmFtZS5zcGxpdCgnLicpLnBvcCgpID09IFwianNcIlxuXHRcdFx0XHRtb2RlbC5sb2FkKGZpbGVOYW1lKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRtb2RlbC5sb2FkUG5nKGZpbGVOYW1lKVxuXHRcdFx0QGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0gPSBtb2RlbFxuXG5cdFx0b2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goIEBkZWZhdWx0R2VvbWV0cnksIEBkZWZhdWx0TWF0ZXJpYWwgKVxuXHRcdG1vZGVsLm9uIFwic3VjY2Vzc1wiLCAobSktPlxuXHRcdFx0b2JqZWN0Lmdlb21ldHJ5ID0gbS5nZW9tZXRyeVx0XHRcdFxuXHRcdFx0b2JqZWN0Lm1hdGVyaWFsID0gbS5tYXRlcmlhbFxuXHRcdFx0bS5vZmYgXCJzdWNjZXNzXCIsIGFyZ3VtZW50cy5jYWxsZWUgI3JlbW92ZSB0aGlzIGhhbmRsZXIgb25jZSB1c2VkXG5cdFx0cmV0dXJuIG9iamVjdFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsTG9hZGVyXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbnV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuY2xhc3MgUGFydGljbGUgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHBhcnRpY2xlVGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvcGFydGljbGVzL3BhcnRpY2xlMi5wbmdcIlxuXHRwYXJ0aWNsZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHBhcnRpY2xlVGV4dHVyZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cblx0cGFydGljbGVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uLCBlbmVyZ3kpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBwYXJ0aWNsZUdlb21ldHJ5LCBwYXJ0aWNsZU1hdGVyaWFsXG5cdFx0XG5cdFx0QHZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjModXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSk7XG5cdFx0QHZlbG9jaXR5Lm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKGVuZXJneSlcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHZlbG9jaXR5Lm11bHRpcGx5U2NhbGFyKC45OSlcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IEB2ZWxvY2l0eS54ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi56ICs9IEB2ZWxvY2l0eS56ICogZGVsdGFcblx0XHRzID0gMS0gKChEYXRlLm5vdygpIC0gQGJpcnRoKSAvIEB0aW1lVG9MaXZlKSArIC4wMVxuXHRcdEByb290LnNjYWxlLnNldChzLCBzLCBzKVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGVcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbnMgPSByZXF1aXJlICcuL0NvbGxpc2lvbnMuY29mZmVlJ1xuTW9kZWxMb2FkZXIgPSByZXF1aXJlICcuL01vZGVsTG9hZGVyLmNvZmZlZSdcbklucHV0ID0gcmVxdWlyZSAnLi9JbnB1dC5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5TaHVtcCA9IHJlcXVpcmUgJy4vc2h1bXAuY29mZmVlJ1xuXG5tb2RlbExvYWRlciA9IG5ldyBNb2RlbExvYWRlcigpXG4jIGlucHV0ID0gbmV3IElucHV0KClcblxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQ29sbGlzaW9ucy5Db2xsaXNpb25PYmplY3RcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRcblx0XHRAY29sbGlkZXJUeXBlID0gXCJwbGF5ZXJcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteV9idWxsZXRcIlxuXG5cdFx0bW9kZWwgPSBtb2RlbExvYWRlci5sb2FkKFwiYXNzZXRzL3NoaXBzL3NoaXAyLmpzXCIpXG5cdFx0QHJvb3QuYWRkIG1vZGVsXG5cdFx0dXRpbC5hZnRlciAxMDAwLCAoKS0+XG5cdFx0XHRtb2RlbC5tYXRlcmlhbC5tYXRlcmlhbHNbMF0ud2lyZWZyYW1lID0gdHJ1ZVxuXHRcdFxuXHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRAaHAgPSAzXG5cblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGlmIElucHV0LmtleVN0YXRlc1sndXAnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1snZG93biddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55IC09IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydsZWZ0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ3JpZ2h0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ2ZpcmVfcHJpbWFyeSddXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXHRmaXJlX3ByaW1hcnk6ICgpLT5cblx0XHRpZiBEYXRlLm5vdygpID4gQGxhc3RGaXJlICsgMjQwICogMVxuXHRcdFx0U291bmQucGxheSgnc2hvb3QnKVxuXHRcdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdFx0XG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gLS4yNVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdGJ1bGxldC5hbmdsZSA9ICsuMjVcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXHRcdFx0IyBAcGFyZW50LmNvbGxpZGVycy5wdXNoIGJ1bGxldFxuXG5cdGRpZTogKCktPlxuXHRcdCMgY29uc29sZS5sb2cgXCJkaWVcIlxuXHRcdFxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgOClcblxuXHRcdCMgcG9zID0gQHJvb3QucG9zaXRpb25cblx0XHQjIHBhcmVudCA9IEBwYXJlbnRcblx0XHQjIHV0aWwuYWZ0ZXIgMTAwMCwgKCktPlxuXHRcdCMgXHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQocG9zKVxuXHRcdCMgXHRidWxsZXQuaHAgPSAxMDBcblx0XHQjIFx0YnVsbGV0LmRwID0gMTBcblx0XHQjIFx0YnVsbGV0LmNvbGxpc2lvblJhZGl1cyA9IDE1MFxuXHRcdCMgXHRwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0IyB1dGlsLmFmdGVyIDEyNTAsIFNodW1wLmdhbWUucmVzZXRQbGF5ZXJcblx0XHRzdXBlcigpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxuIiwiXG5zY29yZSA9IDBcbmV4cG9ydHMuZGlzcGxheUVsZW1lbnQgPSB1bmRlZmluZWRcblxuZXhwb3J0cy5hZGQgPSAocG9pbnRzKS0+XG5cdHNjb3JlICs9IHBvaW50c1xuXHQjIGNvbnNvbGUubG9nIGV4cG9ydHMuZGlzcGxheUVsZW1lbnRcblx0aWYgZXhwb3J0cy5kaXNwbGF5RWxlbWVudD9cblx0XHRleHBvcnRzLmRpc3BsYXlFbGVtZW50LnRleHQgXCJTY29yZTogI3tzY29yZX1cIlxuXG5leHBvcnRzLmdldCA9ICgpLT5cblx0cmV0dXJuIHNjb3JlXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgSG9tZVNjcmVlbiBleHRlbmRzIEdhbWVPYmplY3Rcblx0dGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvc2NyZWVucy90aXRsZS5wbmdcIlxuXHRtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAyMCwgMTUpXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBnZW9tZXRyeSwgbWF0ZXJpYWxcblxuZXhwb3J0cy5Ib21lU2NyZWVuID0gSG9tZVNjcmVlblxuXG5jbGFzcyBHYW1lT3ZlclNjcmVlbiBleHRlbmRzIEdhbWVPYmplY3Rcblx0dGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvc2NyZWVucy9nYW1lX292ZXIucG5nXCJcblx0bWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0Z2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMjAsIDE1KVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG5cbmV4cG9ydHMuR2FtZU92ZXJTY3JlZW4gPSBHYW1lT3ZlclNjcmVlblxuIiwid2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHR8fHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG5hdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbmNsYXNzIFNvdW5kXG5cdGNvbnN0cnVjdG9yOiAoQG5hbWUsIEB1cmwsIEBidWZmZXIpLT5cbmV4cG9ydHMuU291bmQgPSBTb3VuZFxuXG5leHBvcnRzLmxvYWRlZFNvdW5kcyA9IGxvYWRlZFNvdW5kcyA9IHt9XG5cblxuZXhwb3J0cy5sb2FkID0gbG9hZCA9IChuYW1lLCB1cmwpIC0+XG5cdHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXHRcdHJlcXVlc3Qub3BlbignR0VUJywgdXJsKVxuXHRcdHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblx0XHRyZXF1ZXN0Lm9ubG9hZCA9IChhLCBiLCBjKT0+XG5cdFx0XHRpZiByZXF1ZXN0LnN0YXR1cyA9PSAyMDBcblx0XHRcdFx0YXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSByZXF1ZXN0LnJlc3BvbnNlLCBcblx0XHRcdFx0XHQoYnVmZmVyKT0+XG5cdFx0XHRcdFx0XHQjdG9kbyBoYW5kbGUgZGVjb2RpbmcgZXJyb3Jcblx0XHRcdFx0XHRcdHNvdW5kID0gbmV3IFNvdW5kKG5hbWUsIHVybCwgYnVmZmVyKVxuXHRcdFx0XHRcdFx0ZXhwb3J0cy5sb2FkZWRTb3VuZHNbbmFtZV0gPSBzb3VuZFxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc29sdmUoc291bmQpXG5cdFx0XHRcdFx0LChlcnIpPT5cblx0XHRcdFx0XHRcdHJlamVjdCBFcnJvcihcIkRlY29kaW5nIEVycm9yXCIpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNvbnNvbGUubG9nICBcIlN0YXR1c1wiXG5cdFx0XHRcdHJlamVjdCBFcnJvcihcIlN0YXR1cyBFcnJvclwiKVxuXG5cdFx0XHRcdFxuXHRcdHJlcXVlc3Qub25lcnJvciA9ICgpLT5cblx0XHRcdGNvbnNvbGUubG9nIFwiZXJyclwiXG5cdFx0XHRyZWplY3QgRXJyb3IoXCJOZXR3b3JrIEVycm9yXCIpIFx0XG5cblx0XHRyZXF1ZXN0LnNlbmQoKVxuXHRcdFx0XG5cbmV4cG9ydHMucGxheSA9IHBsYXkgPSAoYXJnKS0+XG5cdGlmIHR5cGVvZiBhcmcgPT0gJ3N0cmluZydcblx0XHRidWZmZXIgPSBsb2FkZWRTb3VuZHNbYXJnXS5idWZmZXJcblx0ZWxzZSBcblx0XHRidWZmZXIgPSBhcmdcblx0aWYgYnVmZmVyP1xuXHRcdHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuXHRcdHNvdXJjZS5idWZmZXIgPSBidWZmZXJcblx0XHRzb3VyY2UuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pXG5cdFx0c291cmNlLnN0YXJ0KDApXG5cblxuYXNzZXRzTG9hZGluZyA9IFtdXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnc2hvb3QnLCAnYXNzZXRzL3NvdW5kcy9zaG9vdC53YXYnKVxuYXNzZXRzTG9hZGluZy5wdXNoIGxvYWQoJ2V4cGxvc2lvbicsICdhc3NldHMvc291bmRzL2V4cGxvc2lvbi53YXYnKVxuXG5Qcm9taXNlLmFsbChhc3NldHNMb2FkaW5nKVxuLnRoZW4gKHJlc3VsdHMpLT5cblx0Y29uc29sZS5sb2cgXCJMb2FkZWQgYWxsIFNvdW5kcyFcIiwgcmVzdWx0c1xuLmNhdGNoIChlcnIpLT5cblx0Y29uc29sZS5sb2cgXCJ1aG9oXCIsIGVyclxuXG4iLCJFbmVtaWVzID0gcmVxdWlyZSAnLi9FbmVtaWVzLmNvZmZlZSdcblxuZXhwb3J0cy5sb2FkID0gbG9hZCA9ICh1cmwpIC0+XG5cdHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdGpxeGhyID0gJC5nZXRKU09OIHVybCwgQG9uTG9hZFxuXG5cdFx0anF4aHIuZG9uZSAoKS0+XG5cdFx0XHRsZXZlbCA9IG5ldyBUaWxlZE1hcChqcXhoci5yZXNwb25zZUpTT04pXG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShsZXZlbClcblxuXHRcdGpxeGhyLmZhaWwgKCktPlxuXHRcdFx0cmV0dXJuIHJlamVjdCBFcnJvcihcIlN0YXR1cyBFcnJvclwiKVxuXG5cbmNsYXNzIFRpbGVkTWFwXG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRAdGlsZVNldHMgPSBbXVxuXHRcdEB0aWxlcyA9IFtdXG5cdFx0QGxheWVycyA9IHt9XG5cblx0XHQjIGNyZWF0ZSB0aWxlU2V0cywgbG9hZCB0aGUgdGV4dHVyZXNcblx0XHRmb3IgdGlsZVNldERhdGEgaW4gZGF0YS50aWxlc2V0c1xuXHRcdFx0dGlsZVNldCA9IG5ldyBUaWxlU2V0IHRpbGVTZXREYXRhXG5cdFx0XHRAdGlsZVNldHMucHVzaCB0aWxlU2V0XG5cblx0XHQjIGNyZWF0ZSB0aWxlcyBAZ2VvbWV0ZXJ5IGFuZCBAbWF0ZXJpYWxcblx0XHRmb3IgdGlsZVNldCBpbiBAdGlsZVNldHNcblx0XHRcdGlkID0gdGlsZVNldC5kYXRhLmZpcnN0Z2lkXG5cdFx0XHRmb3Igcm93IGluIFswLi50aWxlU2V0LnJvd3MtMV1cblx0XHRcdFx0Zm9yIGNvbCBpbiBbMC4udGlsZVNldC5jb2xzLTFdXG5cdFx0XHRcdFx0dGlsZSA9IG5ldyBUaWxlIHRpbGVTZXQsIHJvdywgY29sXG5cdFx0XHRcdFx0QHRpbGVzW2lkXSA9IHRpbGVcblx0XHRcdFx0XHRpZCsrXG5cblxuXHRcdCMgbG9hZCBsYXllcnNcblx0XHRmb3IgbGF5ZXJEYXRhIGluIGRhdGEubGF5ZXJzXG5cdFx0XHRpZiBsYXllckRhdGEudHlwZSA9PSBcInRpbGVsYXllclwiXG5cdFx0XHRcdEBsYXllcnNbbGF5ZXJEYXRhLm5hbWVdID0gbmV3IFRpbGVMYXllcih0aGlzLCBsYXllckRhdGEpXG5cdFx0XHRpZiBsYXllckRhdGEudHlwZSA9PSBcIm9iamVjdGdyb3VwXCJcblx0XHRcdFx0QGxheWVyc1tsYXllckRhdGEubmFtZV0gPSBuZXcgT2JqZWN0R3JvdXAobGF5ZXJEYXRhKVxuXG5cdFxuXG5cdGxvYWRUaWxlTGF5ZXI6IChkYXRhKT0+XG5cdFx0bGF5ZXIgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdGZvciBpZCwgaW5kZXggaW4gZGF0YS5kYXRhXG5cdFx0XHRpZiBpZCA+IDBcblx0XHRcdFx0cm93ID0gTWF0aC5mbG9vcihpbmRleCAvIGRhdGEud2lkdGgpXG5cdFx0XHRcdGNvbCA9IGluZGV4ICUgZGF0YS53aWR0aFxuXHRcdFx0XHR0aWxlT2JqZWN0ID0gbmV3IFRpbGVPYmplY3QoQHRpbGVzW2lkXSwgbmV3IFRIUkVFLlZlY3RvcjMoY29sLCAtcm93IC0gMSwgMCkgKVxuXHRcdFx0XHRsYXllci5hZGQgdGlsZU9iamVjdC5yb290XHRcblx0XHRyZXR1cm4gbGF5ZXJcblxuXHRcblxuXG4jIHJlcHJlc2VudHMgYSBUaWxlU2V0IGluIGEgVGlsZWQgRWRpdG9yIGxldmVsXG5jbGFzcyBUaWxlU2V0XG5cdGNvbnN0cnVjdG9yOiAoQGRhdGEpLT5cblx0XHRAY29scyA9IEBkYXRhLmltYWdld2lkdGggLyBAZGF0YS50aWxld2lkdGhcblx0XHRAcm93cyA9IEBkYXRhLmltYWdlaGVpZ2h0IC8gQGRhdGEudGlsZWhlaWdodFxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy8je0BkYXRhLmltYWdlfVwiXG5cdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoVGVzdDogdHJ1ZVxuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cbiMgUmVwcmVzZW50cyB0aGUgQGdlb21ldHJ5IGFuZCBAbWF0ZXJpYWwgb2YgYSB0aWxlIGxvYWRlZCBmcm9tIGEgVGlsZWQgRWRpdG9yIGxldmVsXG5jbGFzcyBUaWxlXG5cdGNvbnN0cnVjdG9yOiAoQHRpbGVTZXQsIEByb3csIEBjb2wpLT5cblx0XHQjIHRvZG8sIHByb2JhYmx5IGJlIHByZXR0aWVyIHRvIGp1c3QgbWFrZSB0aGlzIGZyb20gc2NyYXRjaFxuXHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCBAdGlsZVNldC5kYXRhLnRpbGV3aWR0aCAvIDMyLCBAdGlsZVNldC5kYXRhLnRpbGVoZWlnaHQgLyAzMilcblx0XHRcblx0XHQjIFJlcG9zaXRpb24gdmVydGljZXMgdG8gbG93ZXIgbGVmdCBhdCAwLDAgXG5cdFx0Zm9yIHYgaW4gQGdlb21ldHJ5LnZlcnRpY2VzXG5cdFx0XHR2LnggKz0gQHRpbGVTZXQuZGF0YS50aWxld2lkdGggLyAzMiAvIDJcblx0XHRcdHYueSArPSBAdGlsZVNldC5kYXRhLnRpbGVoZWlnaHQgLyAzMiAvIDJcblx0XHRAZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZVxuXG5cdFx0IyBjYWxjIGFuZCBzZXQgdXZzXG5cdFx0dXZXaWR0aCA9IEB0aWxlU2V0LmRhdGEudGlsZXdpZHRoL0B0aWxlU2V0LmRhdGEuaW1hZ2V3aWR0aFxuXHRcdHV2SGVpZ2h0ID0gQHRpbGVTZXQuZGF0YS50aWxlaGVpZ2h0L0B0aWxlU2V0LmRhdGEuaW1hZ2VoZWlnaHRcblxuXHRcdHV2WCA9IHV2V2lkdGggKiBAY29sXG5cdFx0dXZZID0gdXZIZWlnaHQgKiAoQHRpbGVTZXQucm93cyAtIEByb3cgLSAxKVxuXHRcdGZvciBmYWNlIGluIEBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdXG5cdFx0XHRmb3IgdiBpbiBmYWNlXG5cdFx0XHRcdGlmIHYueCA9PSAwXG5cdFx0XHRcdFx0di54ID0gdXZYXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR2LnggPSB1dlggKyB1dldpZHRoICMgKiAoMzEuNS8zMi4wKSAjIHRvZG8gZGlydHkgaGFjayB0byBwcmV2ZW50IHNsaWdodCBvdmVyc2FtcGxlIG9uIHRpbGUgc2hvd2luZyBoaW50IG9mIG5leHQgdGlsZSBvbiBlZGdlLlxuXG5cdFx0XHRcdGlmIHYueSA9PSAwXG5cdFx0XHRcdFx0di55ID0gdXZZXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR2LnkgPSB1dlkgKyB1dkhlaWdodCAjICogKDMxLjUvMzIuMCkgIyB0b2RvIGRpcnR5IGhhY2sgdG8gcHJldmVudCBzbGlnaHQgb3ZlcnNhbXBsZSBvbiB0aWxlIHNob3dpbmcgaGludCBvZiBuZXh0IHRpbGUgb24gZWRnZS5cdFx0XHRcdFx0XG5cdFx0QGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlXG5cblx0XHRAbWF0ZXJpYWwgPSBAdGlsZVNldC5tYXRlcmlhbFxuXG5cdFx0XG5cbiMgUmVwcmVzZW50cyBhIFRpbGVMYXllciBpbiB0aGUgVGlsZWQgRWRpdG9yIGZpbGUuIFxuY2xhc3MgVGlsZUxheWVyXG5cdGNvbnN0cnVjdG9yOiAobWFwLCBAZGF0YSktPlxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRmb3IgaWQsIGluZGV4IGluIEBkYXRhLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gZGF0YS53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBkYXRhLndpZHRoXG5cdFx0XHRcdCMgY29uc29sZS5sb2cgIFwidGlsZVwiLCBtYXAsIG1hcC50aWxlc1tpZF1cblx0XHRcdFx0dGlsZU9iamVjdCA9IG5ldyBUaWxlT2JqZWN0KG1hcC50aWxlc1tpZF0sIG5ldyBUSFJFRS5WZWN0b3IzKGNvbCwgLXJvdyAtIDEsIDApIClcblx0XHRcdFx0QHJvb3QuYWRkIHRpbGVPYmplY3QubWVzaFx0XG5cdFx0XG5cbiMgUmVwcmVzZW50cyBhbiBpbnN0YW5jZSBvZiBhIHRpbGUgdG8gYmUgcmVuZGVyZWRcbmNsYXNzIFRpbGVPYmplY3Rcblx0Y29uc3RydWN0b3I6ICh0aWxlLCBwb3NpdGlvbiktPlxuXHRcdEBtZXNoID0gbmV3IFRIUkVFLk1lc2ggdGlsZS5nZW9tZXRyeSwgdGlsZS5tYXRlcmlhbFxuXHRcdEBtZXNoLnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cdFxuXG5jbGFzcyBPYmplY3RHcm91cFxuXHRjb25zdHJ1Y3RvcjogKEBkYXRhKS0+XG5cdFx0QG9iamVjdHMgPSBbXVxuXHRcdGZvciBvYmplY3REYXRhIGluIEBkYXRhLm9iamVjdHMgXG5cdFx0XHRlbmVteSA9IG5ldyBFbmVtaWVzW29iamVjdERhdGEudHlwZV0obmV3IFRIUkVFLlZlY3RvcjMob2JqZWN0RGF0YS54IC8gMzIsIDcgLSBvYmplY3REYXRhLnkgLyAzMiwgMCkpXG5cdFx0XHRAb2JqZWN0cy5wdXNoIGVuZW15XG4iLCJTY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuQ29sbGlzaW9ucyA9IHJlcXVpcmUgJy4vQ29sbGlzaW9ucy5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuXG5jbGFzcyBleHBvcnRzLkJ1bGxldCBleHRlbmRzIENvbGxpc2lvbnMuQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0LnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpXG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHN1cGVyKHRhcmdldClcblx0XHRTY29yZS5hZGQoMSlcblx0XHRAZGllKClcblx0XHRmb3IgaSBpbiBbMC4uNV1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMSlcblxuXG5jbGFzcyBleHBvcnRzLkVuZW15QnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9ucy5Db2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXRfMi5wbmdcIlxuXHRidWxsZXRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBidWxsZXRUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRidWxsZXRHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKVxuXHRcblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHN1cGVyKHRhcmdldClcblx0XHRTY29yZS5hZGQoMSlcblx0XHRAZGllKClcblx0XHRmb3IgaSBpbiBbMC4uNV1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMSlcbiIsIkdhbWUgPSByZXF1aXJlICcuL0dhbWUuY29mZmVlJ1xuXG5cbm1vZHVsZS5leHBvcnRzLkdhbWUgPSBuZXcgR2FtZS5HYW1lKClcblxuXHRcdFxuXG4jIG1vZGVsTG9hZGVyID0gbmV3IGNvcmUuTW9kZWxMb2FkZXIoKVxuXG5cblx0XHRcdFxuXG5cbiIsImV4cG9ydHMuYWZ0ZXIgPSAoZGVsYXksIGZ1bmMpLT5cblx0c2V0VGltZW91dCBmdW5jLCBkZWxheVxuXG5leHBvcnRzLnJhbmRvbSA9IChtaW4sIG1heCktPlxuXHRyZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuXG5cbmV4cG9ydHMubGF5ZXJTcGFjaW5nID0gKCktPlxuXHRmb3ZfcmFkaWFucyA9IDQ1ICogKE1hdGguUEkgLyAxODApXG5cdHRhcmdldFogPSA0ODAgLyAoMiAqIE1hdGgudGFuKGZvdl9yYWRpYW5zIC8gMikgKSAvIDMyLjA7XG4iXX0=
