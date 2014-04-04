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


},{"./CollisionObject.coffee":3,"./Particle.coffee":8,"./Sound.coffee":11,"./Weapons.coffee":12}],5:[function(require,module,exports){
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


},{"../util.coffee":15,"./GameObject.coffee":5}],9:[function(require,module,exports){
var CollisionObject, Input, ModelLoader, Particle, Player, Shump, Sound, Weapons, input, modelLoader, util,
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

input = new Input();

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
    util.after(1000, Shump.game.reset);
    return Player.__super__.die.call(this);
  };

  return Player;

})(CollisionObject);

module.exports = Player;


},{"../util.coffee":15,"./CollisionObject.coffee":3,"./Input.coffee":6,"./ModelLoader.coffee":7,"./Particle.coffee":8,"./Sound.coffee":11,"./Weapons.coffee":12,"./shump.coffee":14}],10:[function(require,module,exports){
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


},{"./CollisionObject.coffee":3,"./Particle.coffee":8,"./Score.coffee":10}],13:[function(require,module,exports){
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
      fragmentShader: "uniform sampler2D tDiffuse;\nvarying vec2 vUv;\n\nvoid main() {\n	// read the input color\n\n	vec4 o;\n\n	o = texture2D( tDiffuse, vUv );\n	//o.r = texture2D( tDiffuse, vUv + vec2(0.0, 0.001) ).r;\n\n	//o.r *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;\n	//o.g *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;\n	//o.b *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;\n\n	//o *= 0.5 + 1.0*16.0*vUv.x*vUv.y*(1.0-vUv.x)*(1.0-vUv.y);\n	\n\n	// set the output color\n	gl_FragColor = o;\n}"
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


},{"./Base.coffee":2}],14:[function(require,module,exports){
var CollisionObject, Enemies, Game, GameObject, Level, Player, Score, Sound, Tile, TileObject, TileSet, World, game, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('../util.coffee');

World = require('./World.coffee');

GameObject = require('./GameObject.coffee');

CollisionObject = require('./CollisionObject.coffee');

Player = require('./Player.coffee');

Enemies = require('./Enemies.coffee');

Sound = require('./Sound.coffee');

Score = require('./Score.coffee');

Tile = (function() {
  function Tile(tileSet, row, col) {
    var face, uvHeight, uvWidth, uvX, uvY, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    this.tileSet = tileSet;
    this.row = row;
    this.col = col;
    this.geometry = new THREE.PlaneGeometry(this.tileSet.tileWidth / 32, this.tileSet.tileHeight / 32);
    _ref = this.geometry.vertices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      v.x += this.tileSet.tileWidth / 32 / 2;
      v.y += this.tileSet.tileHeight / 32 / 2;
    }
    this.geometry.verticesNeedUpdate = true;
    uvWidth = this.tileSet.tileWidth / this.tileSet.imageWidth;
    uvHeight = this.tileSet.tileHeight / this.tileSet.imageHeight;
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
          v.x = uvX + uvWidth * (31 / 32.0);
        }
        v.y = v.y * uvHeight + uvY;
      }
    }
    this.geometry.uvsNeedUpdate = true;
    this.material = this.tileSet.material;
  }

  return Tile;

})();

TileSet = (function() {
  function TileSet(textureFile, imageWidth, imageHeight, tileWidth, tileHeight) {
    this.textureFile = textureFile;
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.cols = this.imageWidth / this.tileWidth;
    this.rows = this.imageHeight / this.tileWidth;
    this.texture = THREE.ImageUtils.loadTexture(textureFile);
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

TileObject = (function() {
  function TileObject(tile, position) {
    this.tile = tile;
    this.root = new THREE.Object3D();
    this.root.add(new THREE.Mesh(tile.geometry, tile.material));
    this.root.position.copy(position);
  }

  TileObject.prototype.update = function() {};

  return TileObject;

})();

Level = (function(_super) {
  __extends(Level, _super);

  function Level(world) {
    this.world = world;
    this.loadTileLayer = __bind(this.loadTileLayer, this);
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
    var background, col, enemy, farBackground, fov_radians, id, o, row, targetZ, tile, tileSet, tileSetData, _i, _j, _k, _l, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;
    this.data = data;
    this.tileSets = [];
    this.tiles = [];
    _ref = data.tilesets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tileSetData = _ref[_i];
      tileSet = new TileSet("assets/" + tileSetData.image, tileSetData.imagewidth, tileSetData.imageheight, tileSetData.tilewidth, tileSetData.tileheight);
      this.tileSets.push(tileSet);
      id = tileSetData.firstgid;
      for (row = _j = 0, _ref1 = tileSet.rows - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; row = 0 <= _ref1 ? ++_j : --_j) {
        for (col = _k = 0, _ref2 = tileSet.cols - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; col = 0 <= _ref2 ? ++_k : --_k) {
          tile = new Tile(tileSet, row, col);
          this.tiles[id] = tile;
          id++;
        }
      }
    }
    farBackground = this.loadTileLayer(data.layers[0]);
    farBackground.position.y = 7.5 * 2;
    fov_radians = 45 * (Math.PI / 180);
    targetZ = 480 / (2 * Math.tan(fov_radians / 2)) / 32.0;
    farBackground.position.z = -targetZ;
    farBackground.scale.set(2, 2, 2);
    console.log(farBackground);
    this.root.add(farBackground);
    background = this.loadTileLayer(data.layers[1]);
    background.position.y = 7.5;
    console.log(background);
    this.root.add(background);
    _ref3 = data.layers[2].objects;
    _results = [];
    for (_l = 0, _len1 = _ref3.length; _l < _len1; _l++) {
      o = _ref3[_l];
      enemy = new Enemies[o.type](new THREE.Vector3(o.x / 32, 7 - o.y / 32, util.random(-1, 1)));
      enemy.active = false;
      _results.push(this.add(enemy));
    }
    return _results;
  };

  Level.prototype.loadTileLayer = function(data) {
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

Game = (function() {
  function Game() {
    this.reset = __bind(this.reset, this);
    this.world = new World();
    Score.displayElement = $("<h1>").appendTo($("#shump"));
    this.loadLevel();
    util.after(1000, (function(_this) {
      return function() {
        return _this.world.start();
      };
    })(this));
  }

  Game.prototype.loadLevel = function() {
    this.world.camera.position.x = 0;
    this.level = new Level(this.world);
    this.world.scene.add(this.level.root);
    return this.world.on("update", this.level.update);
  };

  Game.prototype.reset = function() {
    console.log("reset level");
    this.world.scene.remove(this.level.root);
    this.world.off("update", this.level.update);
    return this.loadLevel();
  };

  return Game;

})();

module.exports.game = game = new Game();


},{"../util.coffee":15,"./CollisionObject.coffee":3,"./Enemies.coffee":4,"./GameObject.coffee":5,"./Player.coffee":9,"./Score.coffee":10,"./Sound.coffee":11,"./World.coffee":13}],15:[function(require,module,exports){
exports.after = function(delay, func) {
  return setTimeout(func, delay);
};

exports.random = function(min, max) {
  return Math.random() * (max - min) + min;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dvcmxkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvc2h1bXAuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsQ0FFQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxLQUFqQixDQUF1QixTQUFBLEdBQUE7QUFFdEIsTUFBQSxzRUFBQTtBQUFBLEVBQUEsQ0FBQSxDQUFFLFFBQUYsQ0FBWSxDQUFBLENBQUEsQ0FBRSxDQUFDLHVCQUFmLENBQXVDLE9BQU8sQ0FBQyxvQkFBL0MsQ0FBQSxDQUFBO0FBQUEsRUFFQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLGVBQUYsQ0FGVCxDQUFBO0FBQUEsRUFHQSxZQUFBLEdBQWUsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFBLEdBQWlCLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FIaEMsQ0FBQTtBQUFBLEVBS0EsY0FBQSxHQUFpQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFBLENBTGpCLENBQUE7QUFBQSxFQU1BLGVBQUEsR0FBa0IsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQU5sQixDQUFBO0FBQUEsRUFPQSxlQUFBLEdBQWtCLGNBQUEsR0FBaUIsZUFQbkMsQ0FBQTtBQUFBLEVBUUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxZQUFaLEVBQTBCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FBMUIsRUFBOEMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQUE5QyxFQUFrRSxlQUFsRSxDQVJBLENBQUE7QUFVQSxFQUFBLElBQUcsWUFBQSxHQUFlLGVBQWxCO0FBQ0MsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVosQ0FBQSxDQUFBO0FBQUEsSUFDQSxNQUFNLENBQUMsTUFBUCxDQUFjLGVBQWQsQ0FEQSxDQUFBO1dBRUEsTUFBTSxDQUFDLEtBQVAsQ0FBYSxlQUFBLEdBQWtCLFlBQS9CLEVBSEQ7R0FBQSxNQUFBO0FBS0MsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGFBQVosQ0FBQSxDQUFBO0FBQUEsSUFDQSxNQUFNLENBQUMsS0FBUCxDQUFhLGNBQWIsQ0FEQSxDQUFBO1dBRUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxjQUFBLEdBQWlCLFlBQS9CLEVBUEQ7R0Fac0I7QUFBQSxDQUF2QixDQUZBLENBQUE7O0FBQUEsQ0F1QkEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxNQUFaLENBQW1CLDZCQUFuQixDQXZCQSxDQUFBOztBQUFBLFdBMEJBLEdBQWMsU0FBQSxHQUFBO1NBQ2IsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBNEIsbUJBQUEsR0FBa0IsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQXhFLEVBRGE7QUFBQSxDQTFCZCxDQUFBOztBQUFBLEtBOEJLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFqQixDQUFvQixRQUFwQixFQUE4QixXQUE5QixDQTlCQSxDQUFBOzs7O0FDQUEsSUFBQSxJQUFBO0VBQUE7b0JBQUE7O0FBQUE7QUFDYyxFQUFBLGNBQUEsR0FBQTtBQUNaLDZDQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBWCxDQURZO0VBQUEsQ0FBYjs7QUFBQSxpQkFHQSxFQUFBLEdBQUksU0FBQyxLQUFELEVBQVEsT0FBUixHQUFBO0FBQ0gsUUFBQSxLQUFBO0FBQUEsSUFBQSw4Q0FBVSxDQUFBLEtBQUEsU0FBQSxDQUFBLEtBQUEsSUFBVSxFQUFwQixDQUF1QixDQUFDLElBQXhCLENBQTZCLE9BQTdCLENBQUEsQ0FBQTtBQUNBLFdBQU8sSUFBUCxDQUZHO0VBQUEsQ0FISixDQUFBOztBQUFBLGlCQU9BLEdBQUEsR0FBSyxTQUFDLEtBQUQsRUFBUSxPQUFSLEdBQUE7QUFDSixRQUFBLDhCQUFBO0FBQUE7QUFBQSxTQUFBLDJEQUFBOzRCQUFBO1VBQTJDLE9BQUEsS0FBVztBQUNyRCxRQUFBLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFNLENBQUMsTUFBaEIsQ0FBdUIsS0FBdkIsRUFBOEIsQ0FBOUIsQ0FBQTtPQUREO0FBQUEsS0FBQTtBQUVBLFdBQU8sSUFBUCxDQUhJO0VBQUEsQ0FQTCxDQUFBOztBQUFBLGlCQVlBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUixRQUFBLGlDQUFBO0FBQUEsSUFEUyxzQkFBTyw4REFDaEIsQ0FBQTtBQUFBLElBQUEsSUFBbUIsMkJBQW5CO0FBQUEsYUFBTyxJQUFQLENBQUE7S0FBQTtBQUNBLFNBQVMscUVBQVQsR0FBQTtBQUNDLE1BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFPLENBQUEsQ0FBQSxDQUExQixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsS0FBUixDQUFjLElBQWQsRUFBb0IsSUFBcEIsQ0FEQSxDQUREO0FBQUEsS0FEQTtBQUlBLFdBQU8sSUFBUCxDQUxRO0VBQUEsQ0FaVCxDQUFBOztjQUFBOztJQURELENBQUE7O0FBQUEsTUFvQk0sQ0FBQyxPQUFQLEdBQWlCLElBcEJqQixDQUFBOzs7O0FDQUEsSUFBQSwyQkFBQTtFQUFBO2lTQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FBYixDQUFBOztBQUFBO0FBR0Msb0NBQUEsQ0FBQTs7QUFBYSxFQUFBLHlCQUFBLEdBQUE7QUFDWixJQUFBLCtDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsTUFEaEIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEVBRnBCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FITixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsRUFBRCxHQUFNLENBSk4sQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsRUFMbkIsQ0FEWTtFQUFBLENBQWI7O0FBQUEsNEJBUUEsV0FBQSxHQUFhLFNBQUMsTUFBRCxHQUFBO1dBQ1osTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBQyxDQUFBLEVBQW5CLEVBRFk7RUFBQSxDQVJiLENBQUE7O0FBQUEsNEJBYUEsVUFBQSxHQUFZLFNBQUMsTUFBRCxHQUFBO0FBQ1gsSUFBQSxJQUFDLENBQUEsRUFBRCxJQUFPLE1BQVAsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFDLENBQUEsRUFBRCxJQUFPLENBQVY7YUFDQyxJQUFDLENBQUEsR0FBRCxDQUFBLEVBREQ7S0FGVztFQUFBLENBYlosQ0FBQTs7eUJBQUE7O0dBRDZCLFdBRjlCLENBQUE7O0FBQUEsTUFxQk0sQ0FBQyxPQUFQLEdBQWlCLGVBckJqQixDQUFBOzs7O0FDQ0EsSUFBQSwrREFBQTtFQUFBO2lTQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FBUixDQUFBOztBQUFBLGVBQ0EsR0FBa0IsT0FBQSxDQUFRLDBCQUFSLENBRGxCLENBQUE7O0FBQUEsUUFFQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUixDQUZYLENBQUE7O0FBQUEsT0FHQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUixDQUhWLENBQUE7O0FBQUE7QUFPQyxNQUFBLDBDQUFBOztBQUFBLDBCQUFBLENBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFqQixDQUE2QiwwQkFBN0IsQ0FBZixDQUFBOztBQUFBLEVBQ0EsYUFBQSxHQUFvQixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUNsQjtBQUFBLElBQUEsR0FBQSxFQUFLLFlBQUw7QUFBQSxJQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsVUFEWjtBQUFBLElBRUEsT0FBQSxFQUFTLEtBQUssQ0FBQyxTQUZmO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtHQURrQixDQURwQixDQUFBOztBQUFBLEVBTUEsYUFBQSxHQUFvQixJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLENBTnBCLENBQUE7O0FBUWEsRUFBQSxlQUFDLFFBQUQsR0FBQTtBQUNaLElBQUEscUNBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixPQURoQixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsUUFBdkIsQ0FGQSxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBYyxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsYUFBWCxFQUEwQixhQUExQixDQUFkLENBSkEsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBZixDQUFvQixRQUFwQixDQUxBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FOUCxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBUFosQ0FEWTtFQUFBLENBUmI7O0FBQUEsa0JBbUJBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLElBQUEsa0NBQU0sS0FBTixDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsR0FBRCxJQUFRLE1BRkQ7RUFBQSxDQW5CUixDQUFBOztBQUFBLGtCQXdCQSxHQUFBLEdBQUssU0FBQSxHQUFBO0FBQ0osUUFBQSxLQUFBO0FBQUEsSUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLFdBQVgsQ0FBQSxDQUFBO0FBQ0EsU0FBUyw4QkFBVCxHQUFBO0FBQ0MsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBZ0IsSUFBQSxRQUFBLENBQVMsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFmLEVBQXlCLENBQXpCLENBQWhCLENBQUEsQ0FERDtBQUFBLEtBREE7V0FHQSw2QkFBQSxFQUpJO0VBQUEsQ0F4QkwsQ0FBQTs7ZUFBQTs7R0FEbUIsZ0JBTnBCLENBQUE7O0FBQUE7QUF1Q0MsNEJBQUEsQ0FBQTs7OztHQUFBOztBQUFBLG9CQUFBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLElBQUEsb0NBQU0sS0FBTixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsQ0FBQSxDQUFBLEdBQUssS0FEekIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsS0FBQSxHQUFRLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEdBQVYsRUFIckI7RUFBQSxDQUFSLENBQUE7O2lCQUFBOztHQURxQixNQXRDdEIsQ0FBQTs7QUFBQTtBQTZDQyx5QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsaUJBQUEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxpQ0FBTSxLQUFOLENBQUEsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFDLENBQUEsR0FBRCxHQUFPLEVBQVY7QUFDQyxNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsQ0FBQSxFQUFBLEdBQU0sS0FBMUIsQ0FERDtLQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsR0FBRCxHQUFPLENBQVY7QUFDSixNQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsQ0FBQSxHQUFJLEtBQXhCLENBREk7S0FBQSxNQUFBO0FBR0osTUFBQSxJQUFDLENBQUEsR0FBRCxDQUFBLENBQUEsQ0FISTtLQUhMO0FBUUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBUCxJQUFhLENBQUEsSUFBSyxDQUFBLFFBQXJCO0FBQ0MsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQVosQ0FBQTthQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFGRDtLQVRPO0VBQUEsQ0FBUixDQUFBOztBQUFBLGlCQWNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFFYixRQUFBLE1BQUE7QUFBQSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQURaLENBQUE7QUFBQSxJQUVBLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBMUIsQ0FGYixDQUFBO0FBQUEsSUFJQSxNQUFNLENBQUMsWUFBUCxHQUFzQixjQUp0QixDQUFBO0FBQUEsSUFLQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQyxRQUFELENBTDFCLENBQUE7QUFBQSxJQU1BLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQU56QixDQUFBO0FBQUEsSUFPQSxNQUFNLENBQUMsS0FBUCxHQUFlLENBUGYsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksTUFBWixDQVRBLENBQUE7QUFBQSxJQVdBLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBMUIsQ0FYYixDQUFBO0FBQUEsSUFhQSxNQUFNLENBQUMsWUFBUCxHQUFzQixjQWJ0QixDQUFBO0FBQUEsSUFjQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQyxRQUFELENBZDFCLENBQUE7QUFBQSxJQWVBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBSSxDQUFDLEVBQUwsR0FBVSxHQWZ6QixDQUFBO0FBQUEsSUFnQkEsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQWhCZixDQUFBO1dBa0JBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosRUFwQmE7RUFBQSxDQWRkLENBQUE7O2NBQUE7O0dBRGtCLE1BNUNuQixDQUFBOztBQUFBLE9Ba0ZPLENBQUMsS0FBUixHQUFnQixLQWxGaEIsQ0FBQTs7QUFBQSxPQW1GTyxDQUFDLE9BQVIsR0FBa0IsT0FuRmxCLENBQUE7O0FBQUEsT0FvRk8sQ0FBQyxJQUFSLEdBQWUsSUFwRmYsQ0FBQTs7OztBQ0RBLElBQUEsVUFBQTtFQUFBLGtGQUFBOztBQUFBO0FBQ2MsRUFBQSxvQkFBQSxHQUFBO0FBQ1osMkNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFWLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFEWixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUZaLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FIUixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBSlYsQ0FEWTtFQUFBLENBQWI7O0FBQUEsdUJBT0EsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsUUFBQSw0QkFBQTtBQUFBO1NBQVMsK0RBQVQsR0FBQTtBQUNDLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFsQixDQUFBO0FBQ0EsTUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFUO0FBQ0MsUUFBQSxJQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBO0FBQ0EsaUJBRkQ7T0FEQTtBQUlBLE1BQUEsSUFBRyxLQUFLLENBQUMsTUFBVDtzQkFDQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWIsR0FERDtPQUFBLE1BQUE7OEJBQUE7T0FMRDtBQUFBO29CQURPO0VBQUEsQ0FQUixDQUFBOztBQUFBLHVCQWdCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO1dBQ1QsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUREO0VBQUEsQ0FoQlYsQ0FBQTs7QUFBQSx1QkFvQkEsR0FBQSxHQUFLLFNBQUMsVUFBRCxHQUFBO0FBQ0osSUFBQSxVQUFVLENBQUMsTUFBWCxHQUFvQixJQUFwQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxVQUFmLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsVUFBVSxDQUFDLElBQXJCLENBRkEsQ0FBQTtBQUdBLFdBQU8sVUFBUCxDQUpJO0VBQUEsQ0FwQkwsQ0FBQTs7QUFBQSx1QkEwQkEsTUFBQSxHQUFRLFNBQUMsVUFBRCxHQUFBO0FBQ1AsUUFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxVQUFVLENBQUMsSUFBeEIsQ0FBQSxDQUFBO0FBQUEsSUFDQSxVQUFVLENBQUMsTUFBWCxHQUFvQixJQURwQixDQUFBO0FBQUEsSUFFQSxDQUFBLEdBQUssSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLFVBQWxCLENBRkwsQ0FBQTtBQUdBLElBQUEsSUFBRyxDQUFBLElBQUssQ0FBUjtBQUNDLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLENBQWpCLEVBQW9CLENBQXBCLENBQUEsQ0FERDtLQUhBO0FBS0EsV0FBTyxVQUFQLENBTk87RUFBQSxDQTFCUixDQUFBOztBQUFBLHVCQWtDQSxHQUFBLEdBQUssU0FBQSxHQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FBUSxLQURKO0VBQUEsQ0FsQ0wsQ0FBQTs7b0JBQUE7O0lBREQsQ0FBQTs7QUFBQSxNQXNDTSxDQUFDLE9BQVAsR0FBaUIsVUF0Q2pCLENBQUE7Ozs7QUNBQSxJQUFBLEtBQUE7O0FBQUE7QUFDQyxrQkFBQSxNQUFBLEdBQ0M7QUFBQSxJQUFBLElBQUEsRUFBSyxJQUFMO0FBQUEsSUFDQSxJQUFBLEVBQUssSUFETDtBQUFBLElBRUEsSUFBQSxFQUFLLE1BRkw7QUFBQSxJQUdBLElBQUEsRUFBSyxNQUhMO0FBQUEsSUFJQSxJQUFBLEVBQUssTUFKTDtBQUFBLElBS0EsSUFBQSxFQUFLLE1BTEw7QUFBQSxJQU1BLElBQUEsRUFBSyxPQU5MO0FBQUEsSUFPQSxJQUFBLEVBQUssT0FQTDtBQUFBLElBUUEsSUFBQSxFQUFLLGNBUkw7R0FERCxDQUFBOztBQVdhLEVBQUEsZUFBQSxHQUFBO0FBQ1osUUFBQSxnQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUFiLENBQUE7QUFFQTtBQUFBLFNBQUEsV0FBQTt3QkFBQTtBQUNDLE1BQUEsSUFBQyxDQUFBLFNBQVUsQ0FBQSxLQUFBLENBQVgsR0FBb0IsS0FBcEIsQ0FERDtBQUFBLEtBRkE7QUFBQSxJQUtBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxPQUFWLENBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUVqQixRQUFBLElBQUcsS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFDLENBQUMsS0FBRixDQUFYO0FBQ0MsVUFBQSxLQUFDLENBQUEsU0FBVSxDQUFBLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBUixDQUFYLEdBQStCLElBQS9CLENBREQ7U0FBQTtlQUVBLENBQUMsQ0FBQyxlQUFGLENBQUEsRUFKaUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixDQUxBLENBQUE7QUFBQSxJQVdBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUNmLFFBQUEsSUFBRyxLQUFDLENBQUEsTUFBTyxDQUFBLENBQUMsQ0FBQyxLQUFGLENBQVg7QUFDQyxVQUFBLEtBQUMsQ0FBQSxTQUFVLENBQUEsS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFDLENBQUMsS0FBRixDQUFSLENBQVgsR0FBK0IsS0FBL0IsQ0FERDtTQUFBO2VBRUEsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxFQUhlO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEIsQ0FYQSxDQURZO0VBQUEsQ0FYYjs7ZUFBQTs7SUFERCxDQUFBOztBQUFBLE1BNkJNLENBQUMsT0FBUCxHQUFpQixLQTdCakIsQ0FBQTs7OztBQ0FBLElBQUEsd0JBQUE7RUFBQTs7O29CQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUE7QUFHQywwQkFBQSxDQUFBOztBQUFhLEVBQUEsZUFBRSxRQUFGLEVBQWEsUUFBYixHQUFBO0FBQ1osSUFEYSxJQUFDLENBQUEsV0FBQSxRQUNkLENBQUE7QUFBQSxJQUR3QixJQUFDLENBQUEsV0FBQSxRQUN6QixDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLHVDQUFBLENBQUE7QUFBQSxJQUFBLHFDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxNQURaLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksTUFGWixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLE1BSFgsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUpWLENBRFk7RUFBQSxDQUFiOztBQUFBLGtCQU9BLElBQUEsR0FBTSxTQUFDLFFBQUQsR0FBQTtBQUNMLFFBQUEsVUFBQTtBQUFBLElBQUEsVUFBQSxHQUFpQixJQUFBLEtBQUssQ0FBQyxVQUFOLENBQUEsQ0FBakIsQ0FBQTtXQUNBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFFBQWhCLEVBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDekIsWUFBQSwyQkFBQTtBQUFBLFFBRDBCLHlCQUFVLDBCQUFXLGdFQUMvQyxDQUFBO0FBQUEsUUFBQSxLQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUssQ0FBQyxnQkFBTixDQUF3QixTQUF4QixDQUFoQixDQUFBO0FBQUEsUUFFQSxLQUFDLENBQUEsUUFBRCxHQUFZLFFBRlosQ0FBQTtBQUFBLFFBR0EsS0FBQyxDQUFBLE1BQUQsR0FBVSxPQUhWLENBQUE7ZUFJQSxLQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsRUFBb0IsS0FBcEIsRUFMeUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixFQUZLO0VBQUEsQ0FQTixDQUFBOztBQUFBLGtCQWdCQSxPQUFBLEdBQVMsU0FBQyxRQUFELEdBQUE7V0FDUixJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsUUFBN0IsRUFBdUMsRUFBdkMsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNyRCxRQUFBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBR2Y7QUFBQSxVQUFBLEdBQUEsRUFBSyxLQUFDLENBQUEsT0FBTjtTQUhlLENBQWhCLENBQUE7QUFBQSxRQUtBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsQ0FBcEIsRUFBdUIsQ0FBdkIsQ0FMaEIsQ0FBQTtBQUFBLFFBTUEsS0FBQyxDQUFBLE1BQUQsR0FBVSxPQU5WLENBQUE7ZUFRQSxLQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsRUFBb0IsS0FBcEIsRUFUcUQ7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxFQURIO0VBQUEsQ0FoQlQsQ0FBQTs7ZUFBQTs7R0FEbUIsS0FGcEIsQ0FBQTs7QUFBQTtBQWtDYyxFQUFBLHFCQUFBLEdBQUE7QUFDWixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsQ0FBbkIsRUFBcUIsQ0FBckIsRUFBdUIsQ0FBdkIsQ0FBdkIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDdEI7QUFBQSxNQUFBLEtBQUEsRUFBTyxRQUFQO0FBQUEsTUFDQSxTQUFBLEVBQVcsSUFEWDtBQUFBLE1BRUEsR0FBQSxFQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsdUJBQTdCLENBRkw7S0FEc0IsQ0FEdkIsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsRUFOaEIsQ0FEWTtFQUFBLENBQWI7O0FBQUEsd0JBU0EsSUFBQSxHQUFNLFNBQUMsUUFBRCxHQUFBO0FBR0wsUUFBQSxhQUFBO0FBQUEsSUFBQSxJQUFHLHFDQUFBLElBQTRCLElBQUMsQ0FBQSxZQUFhLENBQUEsUUFBQSxDQUFTLENBQUMsTUFBeEIsS0FBa0MsT0FBakU7QUFFQyxhQUFXLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsWUFBYSxDQUFBLFFBQUEsQ0FBUyxDQUFDLFFBQW5DLEVBQTZDLElBQUMsQ0FBQSxZQUFhLENBQUEsUUFBQSxDQUFTLENBQUMsUUFBckUsQ0FBWCxDQUZEO0tBQUE7QUFNQSxJQUFBLElBQUcsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQWpCO0FBQ0MsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQXRCLENBREQ7S0FBQSxNQUFBO0FBS0MsTUFBQSxLQUFBLEdBQVksSUFBQSxLQUFBLENBQUEsQ0FBWixDQUFBO0FBQ0EsTUFBQSxJQUFHLFFBQVEsQ0FBQyxLQUFULENBQWUsR0FBZixDQUFtQixDQUFDLEdBQXBCLENBQUEsQ0FBQSxLQUE2QixJQUFoQztBQUNDLFFBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLENBQUEsQ0FERDtPQUFBLE1BQUE7QUFHQyxRQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBZCxDQUFBLENBSEQ7T0FEQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFlBQWEsQ0FBQSxRQUFBLENBQWQsR0FBMEIsS0FMMUIsQ0FMRDtLQU5BO0FBQUEsSUFrQkEsTUFBQSxHQUFhLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBWSxJQUFDLENBQUEsZUFBYixFQUE4QixJQUFDLENBQUEsZUFBL0IsQ0FsQmIsQ0FBQTtBQUFBLElBbUJBLEtBQUssQ0FBQyxFQUFOLENBQVMsU0FBVCxFQUFvQixTQUFDLENBQUQsR0FBQTtBQUNuQixNQUFBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLENBQUMsQ0FBQyxRQUFwQixDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsUUFBUCxHQUFrQixDQUFDLENBQUMsUUFEcEIsQ0FBQTthQUVBLENBQUMsQ0FBQyxHQUFGLENBQU0sU0FBTixFQUFpQixTQUFTLENBQUMsTUFBM0IsRUFIbUI7SUFBQSxDQUFwQixDQW5CQSxDQUFBO0FBdUJBLFdBQU8sTUFBUCxDQTFCSztFQUFBLENBVE4sQ0FBQTs7cUJBQUE7O0lBbENELENBQUE7O0FBQUEsTUF1RU0sQ0FBQyxPQUFQLEdBQWlCLFdBdkVqQixDQUFBOzs7O0FDQUEsSUFBQSwwQkFBQTtFQUFBO2lTQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FBYixDQUFBOztBQUFBLElBQ0EsR0FBTyxPQUFBLENBQVEsZ0JBQVIsQ0FEUCxDQUFBOztBQUFBO0FBSUMsTUFBQSxtREFBQTs7QUFBQSw2QkFBQSxDQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLGdDQUE3QixDQUFsQixDQUFBOztBQUFBLEVBQ0EsZ0JBQUEsR0FBdUIsSUFBQSxLQUFLLENBQUMsaUJBQU4sQ0FDckI7QUFBQSxJQUFBLEdBQUEsRUFBSyxlQUFMO0FBQUEsSUFDQSxPQUFBLEVBQVMsS0FBSyxDQUFDLFNBRGY7QUFBQSxJQUVBLFVBQUEsRUFBWSxLQUZaO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtBQUFBLElBSUEsUUFBQSxFQUFVLEtBQUssQ0FBQyxnQkFKaEI7R0FEcUIsQ0FEdkIsQ0FBQTs7QUFBQSxFQVFBLGdCQUFBLEdBQXVCLElBQUEsS0FBSyxDQUFDLGFBQU4sQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FSdkIsQ0FBQTs7QUFVYSxFQUFBLGtCQUFDLFFBQUQsRUFBVyxNQUFYLEdBQUE7QUFDWixJQUFBLHdDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFBLENBRlQsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxnQkFBWCxFQUE2QixnQkFBN0IsQ0FBZCxDQUpBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQUEsQ0FBWixFQUFnQixDQUFoQixDQUFkLEVBQWtDLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQSxDQUFaLEVBQWdCLENBQWhCLENBQWxDLEVBQXNELElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQSxDQUFaLEVBQWdCLENBQWhCLENBQXRELENBTmhCLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQXFCLENBQUMsY0FBdEIsQ0FBcUMsTUFBckMsQ0FQQSxDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBUkEsQ0FEWTtFQUFBLENBVmI7O0FBQUEscUJBcUJBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLFFBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxjQUFWLENBQXlCLEdBQXpCLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixJQUFDLENBQUEsUUFBUSxDQUFDLENBQVYsR0FBYyxLQURsQyxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBVixHQUFjLEtBRmxDLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsSUFBb0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsS0FIbEMsQ0FBQTtBQUFBLElBSUEsQ0FBQSxHQUFJLENBQUEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLEtBQWYsQ0FBQSxHQUF3QixJQUFDLENBQUEsVUFBMUIsQ0FBSCxHQUEyQyxHQUovQyxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFaLENBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLENBTEEsQ0FBQTtBQU1BLElBQUEsSUFBRyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxVQUExQjthQUNDLElBQUMsQ0FBQSxHQUFELENBQUEsRUFERDtLQVBPO0VBQUEsQ0FyQlIsQ0FBQTs7a0JBQUE7O0dBRHNCLFdBSHZCLENBQUE7O0FBQUEsTUFtQ00sQ0FBQyxPQUFQLEdBQWlCLFFBbkNqQixDQUFBOzs7O0FDQUEsSUFBQSxzR0FBQTtFQUFBOztpU0FBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGdCQUFSLENBQVAsQ0FBQTs7QUFBQSxLQUVBLEdBQVEsT0FBQSxDQUFRLGdCQUFSLENBRlIsQ0FBQTs7QUFBQSxlQUdBLEdBQWtCLE9BQUEsQ0FBUSwwQkFBUixDQUhsQixDQUFBOztBQUFBLFdBSUEsR0FBYyxPQUFBLENBQVEsc0JBQVIsQ0FKZCxDQUFBOztBQUFBLEtBS0EsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FMUixDQUFBOztBQUFBLE9BTUEsR0FBVSxPQUFBLENBQVEsa0JBQVIsQ0FOVixDQUFBOztBQUFBLFFBT0EsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FQWCxDQUFBOztBQUFBLEtBUUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FSUixDQUFBOztBQUFBLFdBVUEsR0FBa0IsSUFBQSxXQUFBLENBQUEsQ0FWbEIsQ0FBQTs7QUFBQSxLQVdBLEdBQVksSUFBQSxLQUFBLENBQUEsQ0FYWixDQUFBOztBQUFBO0FBZUMsMkJBQUEsQ0FBQTs7QUFBYSxFQUFBLGdCQUFBLEdBQUE7QUFDWiwyQ0FBQSxDQUFBO0FBQUEsUUFBQSxLQUFBO0FBQUEsSUFBQSxzQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxZQUFELEdBQWdCLFFBSGhCLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixjQUF2QixDQUpBLENBQUE7QUFBQSxJQU1BLEtBQUEsR0FBUSxXQUFXLENBQUMsSUFBWixDQUFpQix1QkFBakIsQ0FOUixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxLQUFWLENBUEEsQ0FBQTtBQUFBLElBUUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLFNBQUEsR0FBQTthQUNoQixLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUE1QixHQUF3QyxLQUR4QjtJQUFBLENBQWpCLENBUkEsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFBLENBWFosQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxDQVpOLENBRFk7RUFBQSxDQUFiOztBQUFBLG1CQWdCQSxNQUFBLEdBQVEsU0FBQyxLQUFELEdBQUE7QUFDUCxJQUFBLElBQUcsS0FBSyxDQUFDLFNBQVUsQ0FBQSxJQUFBLENBQW5CO0FBQ0MsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLEVBQUEsR0FBSyxLQUF6QixDQUREO0tBQUE7QUFFQSxJQUFBLElBQUcsS0FBSyxDQUFDLFNBQVUsQ0FBQSxNQUFBLENBQW5CO0FBQ0MsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLEVBQUEsR0FBSyxLQUF6QixDQUREO0tBRkE7QUFJQSxJQUFBLElBQUcsS0FBSyxDQUFDLFNBQVUsQ0FBQSxNQUFBLENBQW5CO0FBQ0MsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLEVBQUEsR0FBSyxLQUF6QixDQUREO0tBSkE7QUFNQSxJQUFBLElBQUcsS0FBSyxDQUFDLFNBQVUsQ0FBQSxPQUFBLENBQW5CO0FBQ0MsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLEVBQUEsR0FBSyxLQUF6QixDQUREO0tBTkE7QUFRQSxJQUFBLElBQUcsS0FBSyxDQUFDLFNBQVUsQ0FBQSxjQUFBLENBQW5CO2FBQ0MsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQUREO0tBVE87RUFBQSxDQWhCUixDQUFBOztBQUFBLG1CQTRCQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ2IsUUFBQSxNQUFBO0FBQUEsSUFBQSxJQUFHLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBQSxHQUFhLElBQUMsQ0FBQSxRQUFELEdBQVksR0FBQSxHQUFNLENBQWxDO0FBQ0MsTUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FEWixDQUFBO0FBQUEsTUFHQSxNQUFBLEdBQWEsSUFBQSxPQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBckIsQ0FIYixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxNQUFaLENBSkEsQ0FBQTtBQUFBLE1BTUEsTUFBQSxHQUFhLElBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQXJCLENBTmIsQ0FBQTtBQUFBLE1BT0EsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQUFBLEdBUGYsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksTUFBWixDQVJBLENBQUE7QUFBQSxNQVVBLE1BQUEsR0FBYSxJQUFBLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFyQixDQVZiLENBQUE7QUFBQSxNQVdBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsQ0FBQSxHQVhmLENBQUE7YUFZQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBYkQ7S0FEYTtFQUFBLENBNUJkLENBQUE7O0FBQUEsbUJBNkNBLEdBQUEsR0FBSyxTQUFBLEdBQUE7QUFHSixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsV0FBWCxDQUFBLENBQUE7QUFDQSxTQUFTLCtCQUFULEdBQUE7QUFDQyxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFnQixJQUFBLFFBQUEsQ0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQWYsRUFBeUIsQ0FBekIsQ0FBaEIsQ0FBQSxDQUREO0FBQUEsS0FEQTtBQUFBLElBSUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBNUIsQ0FKQSxDQUFBO1dBS0EsOEJBQUEsRUFSSTtFQUFBLENBN0NMLENBQUE7O2dCQUFBOztHQUZvQixnQkFickIsQ0FBQTs7QUFBQSxNQXdFTSxDQUFDLE9BQVAsR0FBaUIsTUF4RWpCLENBQUE7Ozs7QUNDQSxJQUFBLEtBQUE7O0FBQUEsS0FBQSxHQUFRLENBQVIsQ0FBQTs7QUFBQSxPQUNPLENBQUMsY0FBUixHQUF5QixNQUR6QixDQUFBOztBQUFBLE9BR08sQ0FBQyxHQUFSLEdBQWMsU0FBQyxNQUFELEdBQUE7QUFDYixFQUFBLEtBQUEsSUFBUyxNQUFULENBQUE7QUFFQSxFQUFBLElBQUcsOEJBQUg7V0FDQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQXZCLENBQTZCLFNBQUEsR0FBUSxLQUFyQyxFQUREO0dBSGE7QUFBQSxDQUhkLENBQUE7O0FBQUEsT0FTTyxDQUFDLEdBQVIsR0FBYyxTQUFBLEdBQUE7QUFDYixTQUFPLEtBQVAsQ0FEYTtBQUFBLENBVGQsQ0FBQTs7OztBQ0RBLElBQUEsNERBQUE7O0FBQUEsTUFBTSxDQUFDLFlBQVAsR0FBc0IsTUFBTSxDQUFDLFlBQVAsSUFBcUIsTUFBTSxDQUFDLGtCQUFsRCxDQUFBOztBQUFBLFlBQ0EsR0FBbUIsSUFBQSxZQUFBLENBQUEsQ0FEbkIsQ0FBQTs7QUFBQTtBQUljLEVBQUEsZUFBRSxJQUFGLEVBQVMsR0FBVCxFQUFlLE1BQWYsR0FBQTtBQUF1QixJQUF0QixJQUFDLENBQUEsT0FBQSxJQUFxQixDQUFBO0FBQUEsSUFBZixJQUFDLENBQUEsTUFBQSxHQUFjLENBQUE7QUFBQSxJQUFULElBQUMsQ0FBQSxTQUFBLE1BQVEsQ0FBdkI7RUFBQSxDQUFiOztlQUFBOztJQUpELENBQUE7O0FBQUEsT0FLTyxDQUFDLEtBQVIsR0FBZ0IsS0FMaEIsQ0FBQTs7QUFBQSxPQU9PLENBQUMsWUFBUixHQUF1QixZQUFBLEdBQWUsRUFQdEMsQ0FBQTs7QUFBQSxPQVVPLENBQUMsSUFBUixHQUFlLElBQUEsR0FBTyxTQUFDLElBQUQsRUFBTyxHQUFQLEdBQUE7QUFDckIsU0FBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2xCLFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFjLElBQUEsY0FBQSxDQUFBLENBQWQsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFiLEVBQW9CLEdBQXBCLENBREEsQ0FBQTtBQUFBLE1BRUEsT0FBTyxDQUFDLFlBQVIsR0FBdUIsYUFGdkIsQ0FBQTtBQUFBLE1BR0EsT0FBTyxDQUFDLE1BQVIsR0FBaUIsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsR0FBQTtBQUNoQixRQUFBLElBQUcsT0FBTyxDQUFDLE1BQVIsS0FBa0IsR0FBckI7aUJBQ0MsWUFBWSxDQUFDLGVBQWIsQ0FBNkIsT0FBTyxDQUFDLFFBQXJDLEVBQ0MsU0FBQyxNQUFELEdBQUE7QUFFQyxnQkFBQSxLQUFBO0FBQUEsWUFBQSxLQUFBLEdBQVksSUFBQSxLQUFBLENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUIsTUFBakIsQ0FBWixDQUFBO0FBQUEsWUFDQSxPQUFPLENBQUMsWUFBYSxDQUFBLElBQUEsQ0FBckIsR0FBNkIsS0FEN0IsQ0FBQTtBQUVBLG1CQUFPLE9BQUEsQ0FBUSxLQUFSLENBQVAsQ0FKRDtVQUFBLENBREQsRUFNRSxTQUFDLEdBQUQsR0FBQTttQkFDQSxNQUFBLENBQU8sS0FBQSxDQUFNLGdCQUFOLENBQVAsRUFEQTtVQUFBLENBTkYsRUFERDtTQUFBLE1BQUE7QUFVQyxVQUFBLE9BQU8sQ0FBQyxHQUFSLENBQWEsUUFBYixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQUEsQ0FBTSxjQUFOLENBQVAsRUFYRDtTQURnQjtNQUFBLENBSGpCLENBQUE7QUFBQSxNQWtCQSxPQUFPLENBQUMsT0FBUixHQUFrQixTQUFBLEdBQUE7QUFDakIsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLEtBQUEsQ0FBTSxlQUFOLENBQVAsRUFGaUI7TUFBQSxDQWxCbEIsQ0FBQTthQXNCQSxPQUFPLENBQUMsSUFBUixDQUFBLEVBdkJrQjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsQ0FBWCxDQURxQjtBQUFBLENBVnRCLENBQUE7O0FBQUEsT0FxQ08sQ0FBQyxJQUFSLEdBQWUsSUFBQSxHQUFPLFNBQUMsR0FBRCxHQUFBO0FBQ3JCLE1BQUEsY0FBQTtBQUFBLEVBQUEsSUFBRyxNQUFBLENBQUEsR0FBQSxLQUFjLFFBQWpCO0FBQ0MsSUFBQSxNQUFBLEdBQVMsWUFBYSxDQUFBLEdBQUEsQ0FBSSxDQUFDLE1BQTNCLENBREQ7R0FBQSxNQUFBO0FBR0MsSUFBQSxNQUFBLEdBQVMsR0FBVCxDQUhEO0dBQUE7QUFJQSxFQUFBLElBQUcsY0FBSDtBQUNDLElBQUEsTUFBQSxHQUFTLFlBQVksQ0FBQyxrQkFBYixDQUFBLENBQVQsQ0FBQTtBQUFBLElBQ0EsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFEaEIsQ0FBQTtBQUFBLElBRUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxZQUFZLENBQUMsV0FBNUIsQ0FGQSxDQUFBO1dBR0EsTUFBTSxDQUFDLEtBQVAsQ0FBYSxDQUFiLEVBSkQ7R0FMcUI7QUFBQSxDQXJDdEIsQ0FBQTs7QUFBQSxhQWlEQSxHQUFnQixFQWpEaEIsQ0FBQTs7QUFBQSxhQWtEYSxDQUFDLElBQWQsQ0FBbUIsSUFBQSxDQUFLLE9BQUwsRUFBYyx5QkFBZCxDQUFuQixDQWxEQSxDQUFBOztBQUFBLGFBbURhLENBQUMsSUFBZCxDQUFtQixJQUFBLENBQUssV0FBTCxFQUFrQiw2QkFBbEIsQ0FBbkIsQ0FuREEsQ0FBQTs7QUFBQSxPQXFETyxDQUFDLEdBQVIsQ0FBWSxhQUFaLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxPQUFELEdBQUE7U0FDTCxPQUFPLENBQUMsR0FBUixDQUFZLG9CQUFaLEVBQWtDLE9BQWxDLEVBREs7QUFBQSxDQUROLENBR0EsQ0FBQyxPQUFELENBSEEsQ0FHTyxTQUFDLEdBQUQsR0FBQTtTQUNOLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixFQUFvQixHQUFwQixFQURNO0FBQUEsQ0FIUCxDQXJEQSxDQUFBOzs7O0FDQUEsSUFBQSxnQ0FBQTtFQUFBO2lTQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FBUixDQUFBOztBQUFBLGVBQ0EsR0FBa0IsT0FBQSxDQUFRLDBCQUFSLENBRGxCLENBQUE7O0FBQUEsUUFFQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUixDQUZYLENBQUE7O0FBQUEsT0FJYSxDQUFDO0FBQ2IsTUFBQSw2Q0FBQTs7QUFBQSwyQkFBQSxDQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLDJCQUE3QixDQUFoQixDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFxQixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUNuQjtBQUFBLElBQUEsR0FBQSxFQUFLLGFBQUw7QUFBQSxJQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsVUFEWjtBQUFBLElBRUEsT0FBQSxFQUFTLEtBQUssQ0FBQyxTQUZmO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtHQURtQixDQURyQixDQUFBOztBQUFBLEVBT0EsY0FBQSxHQUFxQixJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLENBUHJCLENBQUE7O0FBU2EsRUFBQSxnQkFBQyxRQUFELEdBQUE7QUFDWixJQUFBLHNDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFBLENBRlQsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxjQUFYLEVBQTJCLGNBQTNCLENBQWQsQ0FKQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBTkEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsUUFSaEIsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLE9BQXZCLENBVEEsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQVZULENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFYVCxDQURZO0VBQUEsQ0FUYjs7QUFBQSxtQkF1QkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEtBQVYsQ0FBQSxHQUFpQixJQUFDLENBQUEsS0FBbEIsR0FBd0IsS0FBNUMsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxLQUFWLENBQUEsR0FBaUIsSUFBQyxDQUFBLEtBQWxCLEdBQXdCLEtBRDVDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsR0FBbUIsSUFBQyxDQUFBLEtBRnBCLENBQUE7QUFHQSxJQUFBLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsVUFBMUI7YUFDQyxJQUFDLENBQUEsR0FBRCxDQUFBLEVBREQ7S0FKTztFQUFBLENBdkJSLENBQUE7O0FBQUEsbUJBK0JBLFdBQUEsR0FBYSxTQUFDLE1BQUQsR0FBQTtBQUNaLFFBQUEsZUFBQTtBQUFBLElBQUEsd0NBQU0sTUFBTixDQUFBLENBQUE7QUFBQSxJQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxHQUFELENBQUEsQ0FGQSxDQUFBO0FBR0E7U0FBUyw2QkFBVCxHQUFBO0FBQ0Msb0JBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWdCLElBQUEsUUFBQSxDQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBZixFQUF5QixDQUF6QixDQUFoQixFQUFBLENBREQ7QUFBQTtvQkFKWTtFQUFBLENBL0JiLENBQUE7O2dCQUFBOztHQUQ0QixnQkFKN0IsQ0FBQTs7QUFBQSxPQTRDYSxDQUFDO0FBQ2IsTUFBQSw2Q0FBQTs7QUFBQSxnQ0FBQSxDQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQWpCLENBQTZCLDZCQUE3QixDQUFoQixDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFxQixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUNuQjtBQUFBLElBQUEsR0FBQSxFQUFLLGFBQUw7QUFBQSxJQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsVUFEWjtBQUFBLElBRUEsT0FBQSxFQUFTLEtBQUssQ0FBQyxTQUZmO0FBQUEsSUFHQSxXQUFBLEVBQWEsSUFIYjtHQURtQixDQURyQixDQUFBOztBQUFBLEVBT0EsY0FBQSxHQUFxQixJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLENBUHJCLENBQUE7O0FBU2EsRUFBQSxxQkFBQyxRQUFELEdBQUE7QUFDWixJQUFBLDJDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFBLENBRlQsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxjQUFYLEVBQTJCLGNBQTNCLENBQWQsQ0FKQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBTkEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsUUFSaEIsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLE9BQXZCLENBVEEsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQVZULENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFYVCxDQURZO0VBQUEsQ0FUYjs7QUFBQSx3QkF1QkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLElBQW9CLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLEtBQVYsQ0FBQSxHQUFpQixJQUFDLENBQUEsS0FBbEIsR0FBd0IsS0FBNUMsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixJQUFvQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxLQUFWLENBQUEsR0FBaUIsSUFBQyxDQUFBLEtBQWxCLEdBQXdCLEtBRDVDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsR0FBbUIsSUFBQyxDQUFBLEtBRnBCLENBQUE7QUFHQSxJQUFBLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsVUFBMUI7YUFDQyxJQUFDLENBQUEsR0FBRCxDQUFBLEVBREQ7S0FKTztFQUFBLENBdkJSLENBQUE7O0FBQUEsd0JBK0JBLFdBQUEsR0FBYSxTQUFDLE1BQUQsR0FBQTtBQUNaLFFBQUEsZUFBQTtBQUFBLElBQUEsNkNBQU0sTUFBTixDQUFBLENBQUE7QUFBQSxJQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxHQUFELENBQUEsQ0FGQSxDQUFBO0FBR0E7U0FBUyw2QkFBVCxHQUFBO0FBQ0Msb0JBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWdCLElBQUEsUUFBQSxDQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBZixFQUF5QixDQUF6QixDQUFoQixFQUFBLENBREQ7QUFBQTtvQkFKWTtFQUFBLENBL0JiLENBQUE7O3FCQUFBOztHQURpQyxnQkE1Q2xDLENBQUE7Ozs7QUNBQSxJQUFBLFdBQUE7RUFBQTs7aVNBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBQVAsQ0FBQTs7QUFBQTtBQUtDLDBCQUFBLENBQUE7O0FBQWEsRUFBQSxlQUFBLEdBQUE7QUFDWiw2Q0FBQSxDQUFBO0FBQUEsUUFBQSwwQkFBQTtBQUFBLElBQUEscUNBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxDQUFBLEdBQUksR0FGSixDQUFBO0FBQUEsSUFHQSxDQUFBLEdBQUksR0FISixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQXdCLEVBQXhCLEVBQTRCLENBQUEsR0FBSSxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxLQUF0QyxDQUpkLENBQUE7QUFBQSxJQUtBLFdBQUEsR0FBYyxFQUFBLEdBQUssQ0FBQyxJQUFJLENBQUMsRUFBTCxHQUFVLEdBQVgsQ0FMbkIsQ0FBQTtBQUFBLElBT0EsT0FBQSxHQUFVLEdBQUEsR0FBTSxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLFdBQUEsR0FBYyxDQUF2QixDQUFMLENBQU4sR0FBeUMsSUFQbkQsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBakIsR0FBcUIsT0FUckIsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FYYixDQUFBO0FBQUEsSUFhQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUssQ0FBQyxhQUFOLENBQUEsQ0FiaEIsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLENBQWxCLEVBQXFCLENBQXJCLENBZEEsQ0FBQTtBQUFBLElBZ0JBLENBQUEsQ0FBRSxRQUFGLENBQVksQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFmLENBQTJCLElBQUMsQ0FBQSxRQUFRLENBQUMsVUFBckMsQ0FoQkEsQ0FBQTtBQUFBLElBb0JBLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQXdCLENBQXhCLEVBQTJCLENBQTNCLEVBQ25CO0FBQUEsTUFBQSxTQUFBLEVBQVcsS0FBSyxDQUFDLFlBQWpCO0FBQUEsTUFDQSxTQUFBLEVBQVcsS0FBSyxDQUFDLFlBRGpCO0FBQUEsTUFFQSxNQUFBLEVBQVEsS0FBSyxDQUFDLFNBRmQ7S0FEbUIsQ0FwQnBCLENBQUE7QUFBQSxJQTBCQSxJQUFDLENBQUEsZUFBRCxHQUF1QixJQUFBLEtBQUssQ0FBQyxjQUFOLENBQ3RCO0FBQUEsTUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFVBQVo7QUFBQSxNQUNBLFdBQUEsRUFBYSxLQURiO0FBQUEsTUFFQSxRQUFBLEVBQ0M7QUFBQSxRQUFBLFVBQUEsRUFBWTtBQUFBLFVBQUUsSUFBQSxFQUFNLEdBQVI7QUFBQSxVQUFhLEtBQUEsRUFBTyxJQUFDLENBQUEsWUFBckI7U0FBWjtPQUhEO0FBQUEsTUFLQSxZQUFBLEVBQ0MsK0hBTkQ7QUFBQSxNQWVBLGNBQUEsRUFDQyxtZEFoQkQ7S0FEc0IsQ0ExQnZCLENBQUE7QUFBQSxJQW1FQSxJQUFDLENBQUEsWUFBRCxHQUFvQixJQUFBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FuRXBCLENBQUE7QUFBQSxJQW9FQSxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLEtBQUssQ0FBQyxrQkFBTixDQUF5QixDQUFBLEVBQXpCLEVBQThCLEVBQTlCLEVBQWtDLENBQUEsRUFBbEMsRUFBd0MsRUFBeEMsRUFBNEMsQ0FBNUMsRUFBK0MsQ0FBL0MsQ0FwRXJCLENBQUE7QUFBQSxJQXFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUF4QixHQUE0QixDQXJFNUIsQ0FBQTtBQUFBLElBc0VBLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsYUFBbkIsQ0F0RUEsQ0FBQTtBQUFBLElBdUVBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBZ0IsSUFBQSxLQUFLLENBQUMsYUFBTixDQUFxQixDQUFyQixFQUF3QixDQUF4QixDQUFoQixFQUE2QyxJQUFDLENBQUEsZUFBOUMsQ0F2RW5CLENBQUE7QUFBQSxJQXdFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUF0QixHQUEwQixJQUFJLENBQUMsRUF4RS9CLENBQUE7QUFBQSxJQXlFQSxJQUFDLENBQUEsWUFBWSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLENBekVBLENBQUE7QUFBQSxJQThFQSxJQUFDLENBQUEsS0FBRCxHQUFhLElBQUEsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQTlFYixDQUFBO0FBQUEsSUErRUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUEsQ0FBQSxDQS9FYixDQUFBO0FBQUEsSUFnRkEsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQXhCLEdBQW1DLFVBaEZuQyxDQUFBO0FBQUEsSUFpRkEsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQXhCLEdBQThCLEtBakY5QixDQUFBO0FBQUEsSUFrRkEsQ0FBQSxDQUFFLFFBQUYsQ0FBWSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQWYsQ0FBNEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFuQyxDQWxGQSxDQUFBO0FBb0ZBLFdBQU8sSUFBUCxDQXJGWTtFQUFBLENBQWI7O0FBQUEsa0JBdUZBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBQSxDQUFSLENBQUE7QUFFQSxJQUFBLElBQUksS0FBQSxHQUFRLEVBQVo7QUFDQyxNQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFtQixLQUFuQixDQUFBLENBREQ7S0FGQTtBQUFBLElBS0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWtCLElBQUMsQ0FBQSxLQUFuQixFQUEwQixJQUFDLENBQUEsTUFBM0IsRUFBbUMsSUFBQyxDQUFBLFlBQXBDLEVBQWtELElBQWxELENBTEEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxZQUFsQixFQUFnQyxJQUFDLENBQUEsYUFBakMsQ0FSQSxDQUFBO0FBQUEsSUFVQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQVZBLENBQUE7QUFBQSxJQVdBLHFCQUFBLENBQXNCLElBQUMsQ0FBQSxPQUF2QixDQVhBLENBRFE7RUFBQSxDQXZGVCxDQUFBOztBQUFBLGtCQXNHQSxLQUFBLEdBQU8sU0FBQSxHQUFBO1dBQ04sSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQURNO0VBQUEsQ0F0R1AsQ0FBQTs7ZUFBQTs7R0FGbUIsS0FIcEIsQ0FBQTs7QUFBQSxNQWdITSxDQUFDLE9BQVAsR0FBaUIsS0FoSGpCLENBQUE7Ozs7QUNBQSxJQUFBLHFIQUFBO0VBQUE7O2lTQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZ0JBQVIsQ0FBUCxDQUFBOztBQUFBLEtBRUEsR0FBUSxPQUFBLENBQVEsZ0JBQVIsQ0FGUixDQUFBOztBQUFBLFVBR0EsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FIYixDQUFBOztBQUFBLGVBSUEsR0FBa0IsT0FBQSxDQUFRLDBCQUFSLENBSmxCLENBQUE7O0FBQUEsTUFLQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQUxULENBQUE7O0FBQUEsT0FNQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUixDQU5WLENBQUE7O0FBQUEsS0FRQSxHQUFRLE9BQUEsQ0FBUSxnQkFBUixDQVJSLENBQUE7O0FBQUEsS0FTQSxHQUFRLE9BQUEsQ0FBUSxnQkFBUixDQVRSLENBQUE7O0FBQUE7QUFZYyxFQUFBLGNBQUUsT0FBRixFQUFZLEdBQVosRUFBa0IsR0FBbEIsR0FBQTtBQUNaLFFBQUEsaUZBQUE7QUFBQSxJQURhLElBQUMsQ0FBQSxVQUFBLE9BQ2QsQ0FBQTtBQUFBLElBRHVCLElBQUMsQ0FBQSxNQUFBLEdBQ3hCLENBQUE7QUFBQSxJQUQ2QixJQUFDLENBQUEsTUFBQSxHQUM5QixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUssQ0FBQyxhQUFOLENBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixFQUExQyxFQUE4QyxJQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsR0FBc0IsRUFBcEUsQ0FBaEIsQ0FBQTtBQUNBO0FBQUEsU0FBQSwyQ0FBQTttQkFBQTtBQUNDLE1BQUEsQ0FBQyxDQUFDLENBQUYsSUFBTyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsRUFBckIsR0FBMEIsQ0FBakMsQ0FBQTtBQUFBLE1BQ0EsQ0FBQyxDQUFDLENBQUYsSUFBTyxJQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsR0FBc0IsRUFBdEIsR0FBMkIsQ0FEbEMsQ0FERDtBQUFBLEtBREE7QUFBQSxJQUlBLElBQUMsQ0FBQSxRQUFRLENBQUMsa0JBQVYsR0FBK0IsSUFKL0IsQ0FBQTtBQUFBLElBT0EsT0FBQSxHQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFtQixJQUFDLENBQUEsT0FBTyxDQUFDLFVBUHRDLENBQUE7QUFBQSxJQVFBLFFBQUEsR0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsR0FBb0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQVJ4QyxDQUFBO0FBQUEsSUFTQSxHQUFBLEdBQU0sT0FBQSxHQUFVLElBQUMsQ0FBQSxHQVRqQixDQUFBO0FBQUEsSUFVQSxHQUFBLEdBQU0sUUFBQSxHQUFXLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULEdBQWdCLElBQUMsQ0FBQSxHQUFqQixHQUF1QixDQUF4QixDQVZqQixDQUFBO0FBV0E7QUFBQSxTQUFBLDhDQUFBO3VCQUFBO0FBQ0MsV0FBQSw2Q0FBQTtxQkFBQTtBQUNDLFFBQUEsSUFBRyxDQUFDLENBQUMsQ0FBRixLQUFPLENBQVY7QUFDQyxVQUFBLENBQUMsQ0FBQyxDQUFGLEdBQU0sR0FBTixDQUREO1NBQUEsTUFBQTtBQUdDLFVBQUEsQ0FBQyxDQUFDLENBQUYsR0FBTSxHQUFBLEdBQU0sT0FBQSxHQUFVLENBQUMsRUFBQSxHQUFHLElBQUosQ0FBdEIsQ0FIRDtTQUFBO0FBQUEsUUFNQSxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxDQUFGLEdBQU0sUUFBTixHQUFpQixHQU52QixDQUREO0FBQUEsT0FERDtBQUFBLEtBWEE7QUFBQSxJQW9CQSxJQUFDLENBQUEsUUFBUSxDQUFDLGFBQVYsR0FBMEIsSUFwQjFCLENBQUE7QUFBQSxJQXNCQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsUUF0QnJCLENBRFk7RUFBQSxDQUFiOztjQUFBOztJQVpELENBQUE7O0FBQUE7QUF1Q2MsRUFBQSxpQkFBRSxXQUFGLEVBQWdCLFVBQWhCLEVBQTZCLFdBQTdCLEVBQTJDLFNBQTNDLEVBQXVELFVBQXZELEdBQUE7QUFDWixJQURhLElBQUMsQ0FBQSxjQUFBLFdBQ2QsQ0FBQTtBQUFBLElBRDJCLElBQUMsQ0FBQSxhQUFBLFVBQzVCLENBQUE7QUFBQSxJQUR3QyxJQUFDLENBQUEsY0FBQSxXQUN6QyxDQUFBO0FBQUEsSUFEc0QsSUFBQyxDQUFBLFlBQUEsU0FDdkQsQ0FBQTtBQUFBLElBRGtFLElBQUMsQ0FBQSxhQUFBLFVBQ25FLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsU0FBdkIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxTQUR4QixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBakIsQ0FBNkIsV0FBN0IsQ0FIWCxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUNmO0FBQUEsTUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLE9BQU47QUFBQSxNQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsVUFEWjtBQUFBLE1BRUEsT0FBQSxFQUFTLEtBQUssQ0FBQyxTQUZmO0FBQUEsTUFHQSxTQUFBLEVBQVcsSUFIWDtBQUFBLE1BSUEsVUFBQSxFQUFZLEtBSlo7QUFBQSxNQUtBLFdBQUEsRUFBYSxJQUxiO0tBRGUsQ0FKaEIsQ0FEWTtFQUFBLENBQWI7O2lCQUFBOztJQXZDRCxDQUFBOztBQUFBO0FBMkRjLEVBQUEsb0JBQUUsSUFBRixFQUFRLFFBQVIsR0FBQTtBQUVaLElBRmEsSUFBQyxDQUFBLE9BQUEsSUFFZCxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFaLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFjLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsUUFBaEIsRUFBMEIsSUFBSSxDQUFDLFFBQS9CLENBQWQsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBRkEsQ0FGWTtFQUFBLENBQWI7O0FBQUEsdUJBTUEsTUFBQSxHQUFRLFNBQUEsR0FBQSxDQU5SLENBQUE7O29CQUFBOztJQTNERCxDQUFBOztBQUFBO0FBb0VDLDBCQUFBLENBQUE7O0FBQWEsRUFBQSxlQUFFLEtBQUYsR0FBQTtBQUNaLElBRGEsSUFBQyxDQUFBLFFBQUEsS0FDZCxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLDJDQUFBLENBQUE7QUFBQSxJQUFBLHFDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUZiLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsUUFBbkIsQ0FKcEIsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFlBQVgsQ0FMQSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsTUFBQSxDQUFBLENBUGYsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFDLENBQUEsT0FBTixDQVJBLENBQUE7QUFBQSxJQVVBLENBQUMsQ0FBQyxPQUFGLENBQVUscUJBQVYsRUFBaUMsSUFBQyxDQUFBLE1BQWxDLENBVkEsQ0FEWTtFQUFBLENBQWI7O0FBQUEsa0JBYUEsTUFBQSxHQUFRLFNBQUMsSUFBRCxHQUFBO0FBQ1AsUUFBQSxxS0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFSLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFGWixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBSFQsQ0FBQTtBQU1BO0FBQUEsU0FBQSwyQ0FBQTs2QkFBQTtBQUVDLE1BQUEsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFRLFNBQUEsR0FBVSxXQUFXLENBQUMsS0FBOUIsRUFDYixXQUFXLENBQUMsVUFEQyxFQUViLFdBQVcsQ0FBQyxXQUZDLEVBR2IsV0FBVyxDQUFDLFNBSEMsRUFJYixXQUFXLENBQUMsVUFKQyxDQUFkLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLE9BQWYsQ0FOQSxDQUFBO0FBQUEsTUFTQSxFQUFBLEdBQUssV0FBVyxDQUFDLFFBVGpCLENBQUE7QUFVQSxXQUFXLDhHQUFYLEdBQUE7QUFDQyxhQUFXLDhHQUFYLEdBQUE7QUFDQyxVQUFBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBSyxPQUFMLEVBQWMsR0FBZCxFQUFtQixHQUFuQixDQUFYLENBQUE7QUFBQSxVQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsRUFBQSxDQUFQLEdBQWEsSUFEYixDQUFBO0FBQUEsVUFFQSxFQUFBLEVBRkEsQ0FERDtBQUFBLFNBREQ7QUFBQSxPQVpEO0FBQUEsS0FOQTtBQUFBLElBMEJBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBM0IsQ0ExQmhCLENBQUE7QUFBQSxJQTJCQSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQXZCLEdBQTJCLEdBQUEsR0FBTSxDQTNCakMsQ0FBQTtBQUFBLElBNEJBLFdBQUEsR0FBYyxFQUFBLEdBQUssQ0FBQyxJQUFJLENBQUMsRUFBTCxHQUFVLEdBQVgsQ0E1Qm5CLENBQUE7QUFBQSxJQTZCQSxPQUFBLEdBQVUsR0FBQSxHQUFNLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsV0FBQSxHQUFjLENBQXZCLENBQUwsQ0FBTixHQUF5QyxJQTdCbkQsQ0FBQTtBQUFBLElBOEJBLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBdkIsR0FBMkIsQ0FBQSxPQTlCM0IsQ0FBQTtBQUFBLElBK0JBLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBcEIsQ0FBd0IsQ0FBeEIsRUFBMkIsQ0FBM0IsRUFBOEIsQ0FBOUIsQ0EvQkEsQ0FBQTtBQUFBLElBZ0NBLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWixDQWhDQSxDQUFBO0FBQUEsSUFpQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsYUFBVixDQWpDQSxDQUFBO0FBQUEsSUFtQ0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTNCLENBbkNiLENBQUE7QUFBQSxJQW9DQSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQXBCLEdBQXdCLEdBcEN4QixDQUFBO0FBQUEsSUFxQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaLENBckNBLENBQUE7QUFBQSxJQXNDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxVQUFWLENBdENBLENBQUE7QUEwQ0E7QUFBQTtTQUFBLDhDQUFBO29CQUFBO0FBQ0MsTUFBQSxLQUFBLEdBQVksSUFBQSxPQUFRLENBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBUixDQUFvQixJQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUFwQixFQUF3QixDQUFBLEdBQUksQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUFsQyxFQUFzQyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQUEsQ0FBWixFQUFnQixDQUFoQixDQUF0QyxDQUFwQixDQUFaLENBQUE7QUFBQSxNQUNBLEtBQUssQ0FBQyxNQUFOLEdBQWUsS0FEZixDQUFBO0FBQUEsb0JBRUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMLEVBRkEsQ0FERDtBQUFBO29CQTNDTztFQUFBLENBYlIsQ0FBQTs7QUFBQSxrQkE4REEsYUFBQSxHQUFlLFNBQUMsSUFBRCxHQUFBO0FBQ2QsUUFBQSxzREFBQTtBQUFBLElBQUEsS0FBQSxHQUFZLElBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFaLENBQUE7QUFDQTtBQUFBLFNBQUEsMkRBQUE7dUJBQUE7QUFDQyxNQUFBLElBQUcsRUFBQSxHQUFLLENBQVI7QUFDQyxRQUFBLEdBQUEsR0FBTSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBeEIsQ0FBTixDQUFBO0FBQUEsUUFDQSxHQUFBLEdBQU0sS0FBQSxHQUFRLElBQUksQ0FBQyxLQURuQixDQUFBO0FBQUEsUUFFQSxVQUFBLEdBQWlCLElBQUEsVUFBQSxDQUFXLElBQUMsQ0FBQSxLQUFNLENBQUEsRUFBQSxDQUFsQixFQUEyQixJQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxFQUFtQixDQUFBLEdBQUEsR0FBTyxDQUExQixFQUE2QixDQUE3QixDQUEzQixDQUZqQixDQUFBO0FBQUEsUUFHQSxLQUFLLENBQUMsR0FBTixDQUFVLFVBQVUsQ0FBQyxJQUFyQixDQUhBLENBREQ7T0FERDtBQUFBLEtBREE7QUFPQSxXQUFPLEtBQVAsQ0FSYztFQUFBLENBOURmLENBQUE7O0FBQUEsa0JBNEVBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNQLFFBQUEscUJBQUE7QUFBQSxJQUFBLGtDQUFNLEtBQU4sQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBdkIsSUFBNEIsQ0FBQSxHQUFJLEtBRGhDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUF2QixJQUE0QixDQUFBLEdBQUksS0FGaEMsQ0FBQTtBQUlBO0FBQUEsU0FBQSwyQ0FBQTt1QkFBQTtBQUNDLE1BQUEsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixLQUFoQixJQUEwQixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFwQixHQUF3QixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBdkIsR0FBMkIsRUFBaEY7QUFDQyxRQUFBLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBQSxDQUREO09BREQ7QUFBQSxLQUpBO1dBUUEsSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQVRPO0VBQUEsQ0E1RVIsQ0FBQTs7QUFBQSxrQkEwRkEsR0FBQSxHQUFLLFNBQUMsVUFBRCxHQUFBO0FBQ0osSUFBQSxJQUFHLFVBQUEsWUFBc0IsZUFBekI7QUFDQyxNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixVQUFoQixDQUFBLENBREQ7S0FBQTtBQUVBLFdBQU8sK0JBQU0sVUFBTixDQUFQLENBSEk7RUFBQSxDQTFGTCxDQUFBOztBQUFBLGtCQStGQSxNQUFBLEdBQVEsU0FBQyxVQUFELEdBQUE7QUFDUCxRQUFBLENBQUE7QUFBQSxJQUFBLENBQUEsR0FBSyxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsVUFBbkIsQ0FBTCxDQUFBO0FBQ0EsSUFBQSxJQUFHLENBQUEsSUFBSyxDQUFSO0FBQ0MsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsQ0FBQSxDQUREO0tBREE7QUFJQSxXQUFPLGtDQUFNLFVBQU4sQ0FBUCxDQUxPO0VBQUEsQ0EvRlIsQ0FBQTs7QUFBQSxrQkF5R0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNYLFFBQUEsOEJBQUE7QUFBQTtBQUFBO1NBQUEsMkNBQUE7bUJBQUE7QUFDQyxNQUFBLElBQUcsQ0FBQyxDQUFDLE1BQUw7OztBQUNDO0FBQUE7ZUFBQSw4Q0FBQTswQkFBQTtBQUNDLFlBQUEsSUFBRyxDQUFDLENBQUMsTUFBTDtBQUNDLGNBQUEsSUFBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBbkIsQ0FBMkIsQ0FBQyxDQUFDLFlBQTdCLENBQUEsR0FBNkMsQ0FBQSxDQUFoRDtBQUNDLGdCQUFBLElBQUcsSUFBQyxDQUFBLGFBQUQsQ0FBZSxDQUFmLEVBQWtCLENBQWxCLENBQUg7aUNBQ0MsQ0FBQyxDQUFDLFdBQUYsQ0FBYyxDQUFkLEdBREQ7aUJBQUEsTUFBQTt5Q0FBQTtpQkFERDtlQUFBLE1BQUE7dUNBQUE7ZUFERDthQUFBLE1BQUE7cUNBQUE7YUFERDtBQUFBOzt1QkFERDtPQUFBLE1BQUE7OEJBQUE7T0FERDtBQUFBO29CQURXO0VBQUEsQ0F6R1osQ0FBQTs7QUFBQSxrQkFrSEEsYUFBQSxHQUFlLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNkLFdBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWhCLENBQWtDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBekMsQ0FBQSxHQUFxRCxDQUFDLENBQUMsZUFBRixHQUFvQixDQUFDLENBQUMsZUFBbEYsQ0FEYztFQUFBLENBbEhmLENBQUE7O2VBQUE7O0dBRG1CLFdBbkVwQixDQUFBOztBQUFBO0FBOExjLEVBQUEsY0FBQSxHQUFBO0FBRVoseUNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUEsQ0FBQSxDQUFiLENBQUE7QUFBQSxJQUVBLEtBQUssQ0FBQyxjQUFOLEdBQXVCLENBQUEsQ0FBRSxNQUFGLENBQWEsQ0FBQyxRQUFkLENBQXVCLENBQUEsQ0FBRSxRQUFGLENBQXZCLENBRnZCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FIQSxDQUFBO0FBQUEsSUFLQSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUNoQixLQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQSxFQURnQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLENBTEEsQ0FGWTtFQUFBLENBQWI7O0FBQUEsaUJBVUEsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNWLElBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQXZCLEdBQTJCLENBQTNCLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxLQUFBLENBQU0sSUFBQyxDQUFBLEtBQVAsQ0FEYixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBeEIsQ0FGQSxDQUFBO1dBR0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsUUFBVixFQUFvQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTNCLEVBSlU7RUFBQSxDQVZYLENBQUE7O0FBQUEsaUJBZ0JBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTixJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQWIsQ0FBb0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUEzQixDQUZBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsRUFBcUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUE1QixDQUhBLENBQUE7V0FLQSxJQUFDLENBQUEsU0FBRCxDQUFBLEVBTk07RUFBQSxDQWhCUCxDQUFBOztjQUFBOztJQTlMRCxDQUFBOztBQUFBLE1BdU5NLENBQUMsT0FBTyxDQUFDLElBQWYsR0FBc0IsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFBLENBdk5qQyxDQUFBOzs7O0FDQUEsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO1NBQ2YsVUFBQSxDQUFXLElBQVgsRUFBaUIsS0FBakIsRUFEZTtBQUFBLENBQWhCLENBQUE7O0FBQUEsT0FHTyxDQUFDLE1BQVIsR0FBaUIsU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO0FBQ2hCLFNBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsR0FBQSxHQUFNLEdBQVAsQ0FBaEIsR0FBOEIsR0FBckMsQ0FEZ0I7QUFBQSxDQUhqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJzaHVtcCA9IHJlcXVpcmUoJy4vc2h1bXAvc2h1bXAuY29mZmVlJylcblxuJChcIiNmdWxsc2NyZWVuXCIpLmNsaWNrICgpLT5cblx0XG5cdCQoXCIjc2h1bXBcIilbMF0ud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4oRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCk7XG5cdFxuXHRjYW52YXMgPSAkKFwiI3NodW1wIGNhbnZhc1wiKVxuXHRjYW52YXNBc3BlY3QgPSBjYW52YXMud2lkdGgoKSAvIGNhbnZhcy5oZWlnaHQoKVxuXG5cdGNvbnRhaW5lcldpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblx0Y29udGFpbmVySGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG5cdGNvbnRhaW5lckFzcGVjdCA9IGNvbnRhaW5lcldpZHRoIC8gY29udGFpbmVySGVpZ2h0XG5cdGNvbnNvbGUubG9nIGNhbnZhc0FzcGVjdCwgJCh3aW5kb3cpLndpZHRoKCkgLCAkKHdpbmRvdykuaGVpZ2h0KCksIGNvbnRhaW5lckFzcGVjdFxuXHRcblx0aWYgY2FudmFzQXNwZWN0IDwgY29udGFpbmVyQXNwZWN0XG5cdFx0Y29uc29sZS5sb2cgXCJtYXRjaCBoZWlnaHRcIlxuXHRcdGNhbnZhcy5oZWlnaHQgY29udGFpbmVySGVpZ2h0XG5cdFx0Y2FudmFzLndpZHRoIGNvbnRhaW5lckhlaWdodCAqIGNhbnZhc0FzcGVjdFxuXHRlbHNlXG5cdFx0Y29uc29sZS5sb2cgXCJtYXRjaCB3aWR0aFwiXG5cdFx0Y2FudmFzLndpZHRoIGNvbnRhaW5lcldpZHRoXG5cdFx0Y2FudmFzLmhlaWdodCBjb250YWluZXJXaWR0aCAvIGNhbnZhc0FzcGVjdFxuXG4kKFwiI2RlYnVnXCIpLmFwcGVuZChcIlwiXCI8c3BhbiBpZD1cImxldmVsQ2hpbGRyZW5cIj5cIlwiXCIpXG5cblxudXBkYXRlRGVidWcgPSAoKS0+XG5cdCQoXCIjbGV2ZWxDaGlsZHJlblwiKS50ZXh0IFwiXCJcImxldmVsLmNoaWxkcmVuID0gI3tzaHVtcC5nYW1lLmxldmVsLmNoaWxkcmVuLmxlbmd0aH1cIlwiXCJcblxuXG5zaHVtcC5nYW1lLndvcmxkLm9uIFwidXBkYXRlXCIsIHVwZGF0ZURlYnVnXG5cblxuXG4jIGNvbnNvbGUubG9nIFwiaGlkZXJhXCJcblxuXG4iLCJjbGFzcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QF9ldmVudHMgPSB7fVxuXG5cdG9uOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0KEBfZXZlbnRzW2V2ZW50XSA/PSBbXSkucHVzaCBoYW5kbGVyXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRvZmY6IChldmVudCwgaGFuZGxlcikgLT5cblx0XHRmb3Igc3VzcGVjdCwgaW5kZXggaW4gQF9ldmVudHNbZXZlbnRdIHdoZW4gc3VzcGVjdCBpcyBoYW5kbGVyXG5cdFx0XHRAX2V2ZW50c1tldmVudF0uc3BsaWNlIGluZGV4LCAxXG5cdFx0cmV0dXJuIHRoaXNcblxuXHR0cmlnZ2VyOiAoZXZlbnQsIGFyZ3MuLi4pID0+XG5cdFx0cmV0dXJuIHRoaXMgdW5sZXNzIEBfZXZlbnRzW2V2ZW50XT9cblx0XHRmb3IgaSBpbiBbQF9ldmVudHNbZXZlbnRdLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0aGFuZGxlciA9IEBfZXZlbnRzW2V2ZW50XVtpXVxuXHRcdFx0aGFuZGxlci5hcHBseSB0aGlzLCBhcmdzXG5cdFx0cmV0dXJuIHRoaXNcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcblxuY2xhc3MgQ29sbGlzaW9uT2JqZWN0IGV4dGVuZHMgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gdW5kZWZpbmVkXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMgPSBbXVxuXHRcdEBocCA9IDFcblx0XHRAZHAgPSAxXG5cdFx0QGNvbGxpc2lvblJhZGl1cyA9IC42XG5cblx0Y29sbGlkZUludG86ICh0YXJnZXQpLT5cblx0XHR0YXJnZXQudGFrZURhbWFnZShAZHApXG5cdFx0IyBAZGllKClcblx0XHQjIGdhbWVPYmplY3QuZGllKClcblxuXHR0YWtlRGFtYWdlOiAoZGFtYWdlKS0+XG5cdFx0QGhwIC09IGRhbWFnZVxuXHRcdGlmIEBocCA8PSAwIFxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uT2JqZWN0XG4iLCJcblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5Db2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuV2VhcG9ucyA9IHJlcXVpcmUgJy4vV2VhcG9ucy5jb2ZmZWUnXG5cblxuY2xhc3MgQmFzaWMgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0ZW5lbXlUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9lbmVtaWVzL2VuZW15LnBuZ1wiXG5cdGVuZW15TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogZW5lbXlUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdGVuZW15R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gXCJlbmVteVwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcInBsYXllclwiXG5cblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZW5lbXlHZW9tZXRyeSwgZW5lbXlNYXRlcmlhbFxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cdFx0QGFnZSA9IDBcblx0XHRAaGFzRmlyZWQgPSBmYWxzZVxuXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAYWdlICs9IGRlbHRhXG5cdFx0XG5cdFxuXHRkaWU6ICgpLT5cblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMylcblx0XHRzdXBlcigpXG5cblxuY2xhc3MgU2luV2F2ZSBleHRlbmRzIEJhc2ljXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0c3VwZXIoZGVsdGEpXHRcdFxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLTEgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gZGVsdGEgKiBNYXRoLnNpbihAYWdlKVxuXG5jbGFzcyBEYXJ0IGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0aWYgQGFnZSA8IC41XG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0yMCAqIGRlbHRhXG5cdFx0ZWxzZSBpZiBAYWdlIDwgM1xuXHRcdFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHRlbHNlXG5cdFx0XHRAZGllKClcblxuXHRcdGlmIEBhZ2UgPiAxIGFuZCBub3QgQGhhc0ZpcmVkXG5cdFx0XHRAaGFzRmlyZWQgPSB0cnVlXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXG5cdGZpcmVfcHJpbWFyeTogKCktPlxuXHRcblx0XHRTb3VuZC5wbGF5KCdzaG9vdCcpXG5cdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkVuZW15QnVsbGV0KEByb290LnBvc2l0aW9uKVxuXG5cdFx0YnVsbGV0LmNvbGxpZGVyVHlwZSA9IFwiZW5lbXlfYnVsbGV0XCJcblx0XHRidWxsZXQuY29sbGlkZXJIaXRUeXBlcyA9IFtcInBsYXllclwiXVxuXHRcdGJ1bGxldC5hbmdsZSA9IE1hdGguUEkgLSAuMjVcblx0XHRidWxsZXQuc3BlZWQgPSA1XG5cblx0XHRAcGFyZW50LmFkZCBidWxsZXRcdFxuXG5cdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuRW5lbXlCdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cblx0XHRidWxsZXQuY29sbGlkZXJUeXBlID0gXCJlbmVteV9idWxsZXRcIlxuXHRcdGJ1bGxldC5jb2xsaWRlckhpdFR5cGVzID0gW1wicGxheWVyXCJdXG5cdFx0YnVsbGV0LmFuZ2xlID0gTWF0aC5QSSArIC4yNVxuXHRcdGJ1bGxldC5zcGVlZCA9IDVcblxuXHRcdEBwYXJlbnQuYWRkIGJ1bGxldFx0XG5cblxuZXhwb3J0cy5CYXNpYyA9IEJhc2ljXG5leHBvcnRzLlNpbldhdmUgPSBTaW5XYXZlXG5leHBvcnRzLkRhcnQgPSBEYXJ0XG5cbiMgc3VwZXIoZGVsdGEpXG5cdFx0IyBpZiBAYWdlIDwgMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDJcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueSArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyLjFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSA1ICogZGVsdGFcblx0XHQjIGVsc2Vcblx0XHQjIFx0QGRpZSgpXG4iLCJjbGFzcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBwYXJlbnQgPSB1bmRlZmluZWRcblx0XHRAY2hpbGRyZW4gPSBbXVxuXHRcdEByb290ID0gbmV3IFRIUkVFLk9iamVjdDNEKClcblx0XHRAZGVhZCA9IGZhbHNlXG5cdFx0QGFjdGl2ZSA9IHRydWVcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGZvciBpIGluIFtAY2hpbGRyZW4ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRjaGlsZCA9IEBjaGlsZHJlbltpXVxuXHRcdFx0aWYgY2hpbGQuZGVhZFxuXHRcdFx0XHRAcmVtb3ZlIGNoaWxkXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRpZiBjaGlsZC5hY3RpdmVcblx0XHRcdFx0Y2hpbGQudXBkYXRlIGRlbHRhIFxuXHRcblx0YWN0aXZhdGU6ICgpLT5cblx0XHRAYWN0aXZlID0gdHJ1ZTtcblx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSB0aGlzXG5cdFx0QGNoaWxkcmVuLnB1c2goZ2FtZU9iamVjdClcblx0XHRAcm9vdC5hZGQoZ2FtZU9iamVjdC5yb290KVxuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdEByb290LnJlbW92ZShnYW1lT2JqZWN0LnJvb3QpXG5cdFx0Z2FtZU9iamVjdC5wYXJlbnQgPSBudWxsXG5cdFx0aSA9ICBAY2hpbGRyZW4uaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNoaWxkcmVuLnNwbGljZShpLCAxKTtcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdGRpZTogKCktPlxuXHRcdEBkZWFkID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT2JqZWN0XG4iLCJjbGFzcyBJbnB1dFxuXHRrZXlNYXA6IFxuXHRcdFwiMzhcIjpcInVwXCIgI3VwIGFycm93XG5cdFx0XCI4N1wiOlwidXBcIiAjd1xuXHRcdFwiNDBcIjpcImRvd25cIiAjZG93biBhcnJvd1xuXHRcdFwiODNcIjpcImRvd25cIiAjc1xuXHRcdFwiMzdcIjpcImxlZnRcIiAjbGVmdCBhcnJvd1xuXHRcdFwiNjVcIjpcImxlZnRcIiAjYVxuXHRcdFwiMzlcIjpcInJpZ2h0XCIgI3JpZ2h0IGFycm93XG5cdFx0XCI2OFwiOlwicmlnaHRcIiAjZFxuXHRcdFwiMzJcIjpcImZpcmVfcHJpbWFyeVwiICNzcGFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBrZXlTdGF0ZXMgPSBbXVxuXG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgQGtleU1hcFxuXHRcdFx0QGtleVN0YXRlc1t2YWx1ZV0gPSBmYWxzZTtcblxuXHRcdCQod2luZG93KS5rZXlkb3duIChlKT0+XG5cdFx0XHQjIGNvbnNvbGUubG9nIGUud2hpY2hcblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IHRydWU7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHQkKHdpbmRvdykua2V5dXAgKGUpPT5cblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IGZhbHNlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0XG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoQGdlb21ldHJ5LCBAbWF0ZXJpYWwpLT5cblx0XHRzdXBlcigpXG5cdFx0QG1hdGVyaWFsID0gdW5kZWZpbmVkXG5cdFx0QGdlb21ldHJ5ID0gdW5kZWZpbmVkXG5cdFx0QHRleHR1cmUgPSB1bmRlZmluZWRcblx0XHRAc3RhdHVzID0gdW5kZWZpbmVkXG5cblx0bG9hZDogKGZpbGVOYW1lKT0+XG5cdFx0anNvbkxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKCk7XG5cdFx0anNvbkxvYWRlci5sb2FkIGZpbGVOYW1lLCAoZ2VvbWV0cnksIG1hdGVyaWFscywgb3RoZXJzLi4uKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbCggbWF0ZXJpYWxzIClcblx0XHRcdCMgQG1hdGVyaWFsID0gbWF0ZXJpYWxzWzBdXG5cdFx0XHRAZ2VvbWV0cnkgPSBnZW9tZXRyeVxuXHRcdFx0QHN0YXR1cyA9IFwicmVhZHlcIlxuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXHRsb2FkUG5nOiAoZmlsZU5hbWUpPT5cblx0XHRAdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgZmlsZU5hbWUsIHt9LCAoKT0+XG5cdFx0XHRAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdFx0IyB0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0XHQjIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cdFx0XHRcdG1hcDogQHRleHR1cmVcblx0XHRcdFx0IyBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSAxLCAxXG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJsb2FkcG5nXCIsIHRoaXNcblx0XHRcdEB0cmlnZ2VyIFwic3VjY2Vzc1wiLCB0aGlzXG5cblxuXG5jbGFzcyBNb2RlbExvYWRlclxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdEBkZWZhdWx0R2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KDEsMSwxKVxuXHRcdEBkZWZhdWx0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdGNvbG9yOiAweDAwZmYwMFxuXHRcdFx0d2lyZWZyYW1lOiB0cnVlXG5cdFx0XHRtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvdXRpbC93aGl0ZS5wbmdcIlxuXG5cdFx0QGxvYWRlZE1vZGVscyA9IHt9XG5cblx0bG9hZDogKGZpbGVOYW1lKS0+XG5cblx0XHQjIGlmIGFscmVhZHkgbG9hZGVkLCBqdXN0IG1ha2UgdGhlIG5ldyBtZXNoIGFuZCByZXR1cm5cblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXT8gJiYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uc3RhdHVzID09IFwicmVhZHlcIlxuXHRcdFx0I2NvbnNvbGUubG9nIFwiY2FjaGVkXCJcblx0XHRcdHJldHVybiBuZXcgVEhSRUUuTWVzaChAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5nZW9tZXRyeSwgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0ubWF0ZXJpYWwpXG5cblxuXHRcdCMgaWYgcmVxdWVzdGVkIGJ1dCBub3QgcmVhZHlcblx0XHRpZiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFx0bW9kZWwgPSBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXVxuXHRcdFxuXHRcdCMgaWYgbm90IHJlcXVlc3RlZCBiZWZvcmVcblx0XHRlbHNlXG5cdFx0XHRtb2RlbCA9IG5ldyBNb2RlbCgpXG5cdFx0XHRpZiBmaWxlTmFtZS5zcGxpdCgnLicpLnBvcCgpID09IFwianNcIlxuXHRcdFx0XHRtb2RlbC5sb2FkKGZpbGVOYW1lKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRtb2RlbC5sb2FkUG5nKGZpbGVOYW1lKVxuXHRcdFx0QGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0gPSBtb2RlbFxuXG5cdFx0b2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goIEBkZWZhdWx0R2VvbWV0cnksIEBkZWZhdWx0TWF0ZXJpYWwgKVxuXHRcdG1vZGVsLm9uIFwic3VjY2Vzc1wiLCAobSktPlxuXHRcdFx0b2JqZWN0Lmdlb21ldHJ5ID0gbS5nZW9tZXRyeVx0XHRcdFxuXHRcdFx0b2JqZWN0Lm1hdGVyaWFsID0gbS5tYXRlcmlhbFxuXHRcdFx0bS5vZmYgXCJzdWNjZXNzXCIsIGFyZ3VtZW50cy5jYWxsZWUgI3JlbW92ZSB0aGlzIGhhbmRsZXIgb25jZSB1c2VkXG5cdFx0cmV0dXJuIG9iamVjdFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsTG9hZGVyXG4iLCJHYW1lT2JqZWN0ID0gcmVxdWlyZSAnLi9HYW1lT2JqZWN0LmNvZmZlZSdcbnV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuY2xhc3MgUGFydGljbGUgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHBhcnRpY2xlVGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvcGFydGljbGVzL3BhcnRpY2xlMi5wbmdcIlxuXHRwYXJ0aWNsZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IHBhcnRpY2xlVGV4dHVyZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHRkZXB0aFdyaXRlOiBmYWxzZVxuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XHRcdGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXG5cblx0cGFydGljbGVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uLCBlbmVyZ3kpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBwYXJ0aWNsZUdlb21ldHJ5LCBwYXJ0aWNsZU1hdGVyaWFsXG5cdFx0XG5cdFx0QHZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjModXRpbC5yYW5kb20oLTEsIDEpLCB1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSk7XG5cdFx0QHZlbG9jaXR5Lm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKGVuZXJneSlcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHZlbG9jaXR5Lm11bHRpcGx5U2NhbGFyKC45OSlcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IEB2ZWxvY2l0eS54ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55ICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi56ICs9IEB2ZWxvY2l0eS56ICogZGVsdGFcblx0XHRzID0gMS0gKChEYXRlLm5vdygpIC0gQGJpcnRoKSAvIEB0aW1lVG9MaXZlKSArIC4wMVxuXHRcdEByb290LnNjYWxlLnNldChzLCBzLCBzKVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGVcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcbk1vZGVsTG9hZGVyID0gcmVxdWlyZSAnLi9Nb2RlbExvYWRlci5jb2ZmZWUnXG5JbnB1dCA9IHJlcXVpcmUgJy4vSW5wdXQuY29mZmVlJ1xuV2VhcG9ucyA9IHJlcXVpcmUgJy4vV2VhcG9ucy5jb2ZmZWUnXG5QYXJ0aWNsZSA9IHJlcXVpcmUgJy4vUGFydGljbGUuY29mZmVlJ1xuU2h1bXAgPSByZXF1aXJlICcuL3NodW1wLmNvZmZlZSdcblxubW9kZWxMb2FkZXIgPSBuZXcgTW9kZWxMb2FkZXIoKVxuaW5wdXQgPSBuZXcgSW5wdXQoKVxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3RcblxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRcblx0XHRAY29sbGlkZXJUeXBlID0gXCJwbGF5ZXJcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteV9idWxsZXRcIlxuXG5cdFx0bW9kZWwgPSBtb2RlbExvYWRlci5sb2FkKFwiYXNzZXRzL3NoaXBzL3NoaXAyLmpzXCIpXG5cdFx0QHJvb3QuYWRkIG1vZGVsXG5cdFx0dXRpbC5hZnRlciAxMDAwLCAoKS0+XG5cdFx0XHRtb2RlbC5tYXRlcmlhbC5tYXRlcmlhbHNbMF0ud2lyZWZyYW1lID0gdHJ1ZVxuXHRcdFxuXHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRAaHAgPSAzXG5cblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGlmIGlucHV0LmtleVN0YXRlc1sndXAnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1snZG93biddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55IC09IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydsZWZ0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ3JpZ2h0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ2ZpcmVfcHJpbWFyeSddXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXHRmaXJlX3ByaW1hcnk6ICgpLT5cblx0XHRpZiBEYXRlLm5vdygpID4gQGxhc3RGaXJlICsgMjQwICogMVxuXHRcdFx0U291bmQucGxheSgnc2hvb3QnKVxuXHRcdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdFx0XG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0YnVsbGV0LmFuZ2xlID0gLS4yNVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdGJ1bGxldC5hbmdsZSA9ICsuMjVcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXHRcdFx0IyBAcGFyZW50LmNvbGxpZGVycy5wdXNoIGJ1bGxldFxuXG5cdGRpZTogKCktPlxuXHRcdCMgY29uc29sZS5sb2cgXCJkaWVcIlxuXHRcdFxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwMF1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgOClcblxuXHRcdHV0aWwuYWZ0ZXIgMTAwMCwgU2h1bXAuZ2FtZS5yZXNldFxuXHRcdHN1cGVyKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJcbnNjb3JlID0gMFxuZXhwb3J0cy5kaXNwbGF5RWxlbWVudCA9IHVuZGVmaW5lZFxuXG5leHBvcnRzLmFkZCA9IChwb2ludHMpLT5cblx0c2NvcmUgKz0gcG9pbnRzXG5cdCMgY29uc29sZS5sb2cgZXhwb3J0cy5kaXNwbGF5RWxlbWVudFxuXHRpZiBleHBvcnRzLmRpc3BsYXlFbGVtZW50P1xuXHRcdGV4cG9ydHMuZGlzcGxheUVsZW1lbnQudGV4dCBcIlNjb3JlOiAje3Njb3JlfVwiXG5cbmV4cG9ydHMuZ2V0ID0gKCktPlxuXHRyZXR1cm4gc2NvcmVcbiIsIndpbmRvdy5BdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0fHx3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5jbGFzcyBTb3VuZFxuXHRjb25zdHJ1Y3RvcjogKEBuYW1lLCBAdXJsLCBAYnVmZmVyKS0+XG5leHBvcnRzLlNvdW5kID0gU291bmRcblxuZXhwb3J0cy5sb2FkZWRTb3VuZHMgPSBsb2FkZWRTb3VuZHMgPSB7fVxuXG5cbmV4cG9ydHMubG9hZCA9IGxvYWQgPSAobmFtZSwgdXJsKSAtPlxuXHRyZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHRyZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblx0XHRyZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybClcblx0XHRyZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cdFx0cmVxdWVzdC5vbmxvYWQgPSAoYSwgYiwgYyk9PlxuXHRcdFx0aWYgcmVxdWVzdC5zdGF0dXMgPT0gMjAwXG5cdFx0XHRcdGF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEgcmVxdWVzdC5yZXNwb25zZSwgXG5cdFx0XHRcdFx0KGJ1ZmZlcik9PlxuXHRcdFx0XHRcdFx0I3RvZG8gaGFuZGxlIGRlY29kaW5nIGVycm9yXG5cdFx0XHRcdFx0XHRzb3VuZCA9IG5ldyBTb3VuZChuYW1lLCB1cmwsIGJ1ZmZlcilcblx0XHRcdFx0XHRcdGV4cG9ydHMubG9hZGVkU291bmRzW25hbWVdID0gc291bmRcblx0XHRcdFx0XHRcdHJldHVybiByZXNvbHZlKHNvdW5kKVxuXHRcdFx0XHRcdCwoZXJyKT0+XG5cdFx0XHRcdFx0XHRyZWplY3QgRXJyb3IoXCJEZWNvZGluZyBFcnJvclwiKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRjb25zb2xlLmxvZyAgXCJTdGF0dXNcIlxuXHRcdFx0XHRyZWplY3QgRXJyb3IoXCJTdGF0dXMgRXJyb3JcIilcblxuXHRcdFx0XHRcblx0XHRyZXF1ZXN0Lm9uZXJyb3IgPSAoKS0+XG5cdFx0XHRjb25zb2xlLmxvZyBcImVycnJcIlxuXHRcdFx0cmVqZWN0IEVycm9yKFwiTmV0d29yayBFcnJvclwiKSBcdFxuXG5cdFx0cmVxdWVzdC5zZW5kKClcblx0XHRcdFxuXG5leHBvcnRzLnBsYXkgPSBwbGF5ID0gKGFyZyktPlxuXHRpZiB0eXBlb2YgYXJnID09ICdzdHJpbmcnXG5cdFx0YnVmZmVyID0gbG9hZGVkU291bmRzW2FyZ10uYnVmZmVyXG5cdGVsc2UgXG5cdFx0YnVmZmVyID0gYXJnXG5cdGlmIGJ1ZmZlcj9cblx0XHRzb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcblx0XHRzb3VyY2UuYnVmZmVyID0gYnVmZmVyXG5cdFx0c291cmNlLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKVxuXHRcdHNvdXJjZS5zdGFydCgwKVxuXG5cbmFzc2V0c0xvYWRpbmcgPSBbXVxuYXNzZXRzTG9hZGluZy5wdXNoIGxvYWQoJ3Nob290JywgJ2Fzc2V0cy9zb3VuZHMvc2hvb3Qud2F2JylcbmFzc2V0c0xvYWRpbmcucHVzaCBsb2FkKCdleHBsb3Npb24nLCAnYXNzZXRzL3NvdW5kcy9leHBsb3Npb24ud2F2JylcblxuUHJvbWlzZS5hbGwoYXNzZXRzTG9hZGluZylcbi50aGVuIChyZXN1bHRzKS0+XG5cdGNvbnNvbGUubG9nIFwiTG9hZGVkIGFsbCBTb3VuZHMhXCIsIHJlc3VsdHNcbi5jYXRjaCAoZXJyKS0+XG5cdGNvbnNvbGUubG9nIFwidWhvaFwiLCBlcnJcblxuIiwiU2NvcmUgPSByZXF1aXJlICcuL1Njb3JlLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5cbmNsYXNzIGV4cG9ydHMuQnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0LnBuZ1wiXG5cdGJ1bGxldE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IGJ1bGxldFRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0XG5cdGJ1bGxldEdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpXG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHN1cGVyKHRhcmdldClcblx0XHRTY29yZS5hZGQoMSlcblx0XHRAZGllKClcblx0XHRmb3IgaSBpbiBbMC4uNV1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMSlcblxuXG5jbGFzcyBleHBvcnRzLkVuZW15QnVsbGV0IGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cdGJ1bGxldFRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3dlYXBvbnMvYnVsbGV0XzIucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSlcblx0XG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMjAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBidWxsZXRHZW9tZXRyeSwgYnVsbGV0TWF0ZXJpYWxcblxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0XHRAY29sbGlkZXJUeXBlID0gXCJidWxsZXRcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteVwiXG5cdFx0QGFuZ2xlID0gMFxuXHRcdEBzcGVlZCA9IDE1XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IE1hdGguY29zKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBNYXRoLnNpbihAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnJvdGF0aW9uLnogPSBAYW5nbGVcblx0XHRpZiBEYXRlLm5vdygpID4gQGJpcnRoICsgQHRpbWVUb0xpdmVcblx0XHRcdEBkaWUoKVxuXG5cblx0Y29sbGlkZUludG86ICh0YXJnZXQpLT5cblx0XHRzdXBlcih0YXJnZXQpXG5cdFx0U2NvcmUuYWRkKDEpXG5cdFx0QGRpZSgpXG5cdFx0Zm9yIGkgaW4gWzAuLjVdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDEpXG4iLCJCYXNlID0gcmVxdWlyZSAnLi9CYXNlLmNvZmZlZSdcblxuXG5jbGFzcyBXb3JsZCBleHRlbmRzIEJhc2Vcblx0XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdHN1cGVyKClcblxuXHRcdHcgPSA2NDBcblx0XHRoID0gNDgwXG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgdyAvIGgsIDEsIDEwMDAwKVxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblxuXHRcdHRhcmdldFogPSA0ODAgLyAoMiAqIE1hdGgudGFuKGZvdl9yYWRpYW5zIC8gMikgKSAvIDMyLjA7XG5cblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB0YXJnZXRaXG5cdFx0XG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRcblx0XHRAcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpXG5cdFx0QHJlbmRlcmVyLnNldFNpemUgdywgaFxuXHRcdCMgQHJlbmRlcmVyLnNvcnRPYmplY3RzID0gZmFsc2Vcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cblxuXHRcdFxuXHRcdEB3b3JsZFRleHR1cmUgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQgdywgaCwgXG5cdFx0XHRtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlclxuXHRcdFx0bWFnRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdGZvcm1hdDogVEhSRUUuUkdCRm9ybWF0XG5cdFx0XG5cblx0XHRAcHJvY2Vzc01hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHR0cmFuc3BhcmVudDogZmFsc2Vcblx0XHRcdHVuaWZvcm1zOiBcblx0XHRcdFx0XCJ0RGlmZnVzZVwiOiB7IHR5cGU6IFwidFwiLCB2YWx1ZTogQHdvcmxkVGV4dHVyZSB9XG5cblx0XHRcdHZlcnRleFNoYWRlcjpcblx0XHRcdFx0XCJcIlwiXG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdHZVdiA9IHV2O1xuXHRcdFx0XHRcdGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR1bmlmb3JtIHNhbXBsZXIyRCB0RGlmZnVzZTtcblx0XHRcdFx0dmFyeWluZyB2ZWMyIHZVdjtcblxuXHRcdFx0XHR2b2lkIG1haW4oKSB7XG5cdFx0XHRcdFx0Ly8gcmVhZCB0aGUgaW5wdXQgY29sb3JcblxuXHRcdFx0XHRcdHZlYzQgbztcblxuXHRcdFx0XHRcdG8gPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKTtcblx0XHRcdFx0XHQvL28uciA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiArIHZlYzIoMC4wLCAwLjAwMSkgKS5yO1xuXG5cdFx0XHRcdFx0Ly9vLnIgKj0gc2luKHZVdi55ICogMjQwLjAgKiA2LjI4KSAqIC4yNSArIC43NTtcblx0XHRcdFx0XHQvL28uZyAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgLjc1O1xuXHRcdFx0XHRcdC8vby5iICo9IHNpbih2VXYueSAqIDI0MC4wICogNi4yOCkgKiAuMjUgKyAuNzU7XG5cblx0XHRcdFx0XHQvL28gKj0gMC41ICsgMS4wKjE2LjAqdlV2LngqdlV2LnkqKDEuMC12VXYueCkqKDEuMC12VXYueSk7XG5cdFx0XHRcdFx0XG5cblx0XHRcdFx0XHQvLyBzZXQgdGhlIG91dHB1dCBjb2xvclxuXHRcdFx0XHRcdGdsX0ZyYWdDb2xvciA9IG87XG5cdFx0XHRcdH1cblx0XHRcdFx0XCJcIlwiXG5cblx0XHRAcHJvY2Vzc1NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRAcHJvY2Vzc0NhbWVyYSA9IG5ldyBUSFJFRS5PcnRob2dyYXBoaWNDYW1lcmEoLS41LCAuNSwgLS41ICwgLjUsIDAsIDEpXG5cdFx0QHByb2Nlc3NDYW1lcmEucG9zaXRpb24ueiA9IDBcblx0XHRAcHJvY2Vzc1NjZW5lLmFkZCBAcHJvY2Vzc0NhbWVyYVxuXHRcdEBwcm9jZXNzUXVhZCA9IG5ldyBUSFJFRS5NZXNoKCBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSApLCBAcHJvY2Vzc01hdGVyaWFsICk7XG5cdFx0QHByb2Nlc3NRdWFkLnJvdGF0aW9uLnggPSBNYXRoLlBJXG5cdFx0QHByb2Nlc3NTY2VuZS5hZGQgQHByb2Nlc3NRdWFkXG5cblxuXG5cblx0XHRAY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKVxuXHRcdEBzdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCggQHN0YXRzLmRvbUVsZW1lbnQgKVxuXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRhbmltYXRlOiA9PlxuXHRcdGRlbHRhID0gQGNsb2NrLmdldERlbHRhKClcdFx0XG5cdFx0I2Rvbid0IHVwZGF0ZSBhZnRlciBsb25nIGZyYW1lIChmaXhlcyBpc3N1ZSB3aXRoIHN3aXRjaGluZyB0YWJzKVxuXHRcdGlmIChkZWx0YSA8IC41KSBcblx0XHRcdEB0cmlnZ2VyIFwidXBkYXRlXCIsIGRlbHRhXG5cblx0XHRAcmVuZGVyZXIucmVuZGVyKCBAc2NlbmUsIEBjYW1lcmEsIEB3b3JsZFRleHR1cmUsIHRydWUgKTtcblxuXG5cdFx0QHJlbmRlcmVyLnJlbmRlciBAcHJvY2Vzc1NjZW5lLCBAcHJvY2Vzc0NhbWVyYVxuXG5cdFx0QHN0YXRzLnVwZGF0ZSgpXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIEBhbmltYXRlXG5cdFx0cmV0dXJuXG5cblx0c3RhcnQ6IC0+XG5cdFx0QGFuaW1hdGUoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBXb3JsZFxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5Xb3JsZCA9IHJlcXVpcmUgJy4vV29ybGQuY29mZmVlJ1xuR2FtZU9iamVjdCA9IHJlcXVpcmUgJy4vR2FtZU9iamVjdC5jb2ZmZWUnXG5Db2xsaXNpb25PYmplY3QgPSByZXF1aXJlICcuL0NvbGxpc2lvbk9iamVjdC5jb2ZmZWUnXG5QbGF5ZXIgPSByZXF1aXJlICcuL1BsYXllci5jb2ZmZWUnXG5FbmVtaWVzID0gcmVxdWlyZSAnLi9FbmVtaWVzLmNvZmZlZSdcblxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcblNjb3JlID0gcmVxdWlyZSAnLi9TY29yZS5jb2ZmZWUnXG5cbmNsYXNzIFRpbGVcblx0Y29uc3RydWN0b3I6IChAdGlsZVNldCwgQHJvdywgQGNvbCktPlxuXHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCBAdGlsZVNldC50aWxlV2lkdGggLyAzMiwgQHRpbGVTZXQudGlsZUhlaWdodCAvIDMyKVxuXHRcdGZvciB2IGluIEBnZW9tZXRyeS52ZXJ0aWNlc1xuXHRcdFx0di54ICs9IEB0aWxlU2V0LnRpbGVXaWR0aCAvIDMyIC8gMlxuXHRcdFx0di55ICs9IEB0aWxlU2V0LnRpbGVIZWlnaHQgLyAzMiAvIDJcblx0XHRAZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZVxuXG5cdFx0IyBjYWxjIGFuZCBzZXQgdXZzXG5cdFx0dXZXaWR0aCA9IEB0aWxlU2V0LnRpbGVXaWR0aC9AdGlsZVNldC5pbWFnZVdpZHRoXG5cdFx0dXZIZWlnaHQgPSBAdGlsZVNldC50aWxlSGVpZ2h0L0B0aWxlU2V0LmltYWdlSGVpZ2h0XG5cdFx0dXZYID0gdXZXaWR0aCAqIEBjb2xcblx0XHR1dlkgPSB1dkhlaWdodCAqIChAdGlsZVNldC5yb3dzIC0gQHJvdyAtIDEpXG5cdFx0Zm9yIGZhY2UgaW4gQGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1cblx0XHRcdGZvciB2IGluIGZhY2Vcblx0XHRcdFx0aWYgdi54ID09IDBcblx0XHRcdFx0XHR2LnggPSB1dlhcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHYueCA9IHV2WCArIHV2V2lkdGggKiAoMzEvMzIuMCkgI2RpcnR5IGhhY2sgdG8gcHJldmVudCBzbGlnaHQgb3ZlcnNhbXBsZSBvbiB0aWxlIHNob3dpbmcgaGludCBvZiBuZXh0IHRpbGUgb24gZWRnZS5cblxuXHRcdFx0XHQjIHYueCA9IHYueCAqIHV2V2lkdGggICsgdXZYIFxuXHRcdFx0XHR2LnkgPSB2LnkgKiB1dkhlaWdodCArIHV2WSBcblx0XHRAZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWVcblxuXHRcdEBtYXRlcmlhbCA9IEB0aWxlU2V0Lm1hdGVyaWFsXG5cblxuY2xhc3MgVGlsZVNldFxuXHRjb25zdHJ1Y3RvcjogKEB0ZXh0dXJlRmlsZSwgQGltYWdlV2lkdGgsIEBpbWFnZUhlaWdodCwgQHRpbGVXaWR0aCwgQHRpbGVIZWlnaHQpLT5cblx0XHRAY29scyA9IEBpbWFnZVdpZHRoIC8gQHRpbGVXaWR0aFxuXHRcdEByb3dzID0gQGltYWdlSGVpZ2h0IC8gQHRpbGVXaWR0aFxuXG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIHRleHR1cmVGaWxlXG5cdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoVGVzdDogdHJ1ZVxuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XG5cdFx0XG5cblx0XHQjIEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCB3aWR0aCwgaGVpZ2h0KTtcblxuXG5cbmNsYXNzIFRpbGVPYmplY3Rcblx0Y29uc3RydWN0b3I6IChAdGlsZSwgcG9zaXRpb24pLT5cblx0XHQjdG9kbyByZW1vdmUgdW5uZWRlZCBvYmplY3QzZCBudWxsIHdyYXBwZXJcblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHRpbGUuZ2VvbWV0cnksIHRpbGUubWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogLT5cblxuY2xhc3MgTGV2ZWwgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoQHdvcmxkKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0QGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuXHRcdEByb290LmFkZChAYW1iaWVudExpZ2h0KTtcdFx0XG5cblx0XHRAcGxheWVyMSA9IG5ldyBQbGF5ZXIoKVxuXHRcdEBhZGQgQHBsYXllcjFcblxuXHRcdCQuZ2V0SlNPTiBcImFzc2V0cy9sZXZlbF8xLmpzb25cIiwgQG9uTG9hZFxuXHRcdFx0XG5cdG9uTG9hZDogKGRhdGEpPT5cblx0XHRAZGF0YSA9IGRhdGFcblx0XHQjIGNvbnNvbGUubG9nIEBkYXRhXG5cdFx0QHRpbGVTZXRzID0gW11cblx0XHRAdGlsZXMgPSBbXVxuXG5cdFx0IyBsb2FkIHRoZSB0aWxlU2V0IG1ldGFkYXRhLCB0ZXh0dXJlLCBhbmQgY3JlYXRlIHRpbGUgZ2VvbWV0cmllc1xuXHRcdGZvciB0aWxlU2V0RGF0YSBpbiBkYXRhLnRpbGVzZXRzXG5cdFx0XHQjIGxvYWQgdGlsZXNldCBkYXRhIGFuZCB0ZXh0dXJlXG5cdFx0XHR0aWxlU2V0ID0gbmV3IFRpbGVTZXQgXCJhc3NldHMvXCIrdGlsZVNldERhdGEuaW1hZ2UsIFxuXHRcdFx0XHR0aWxlU2V0RGF0YS5pbWFnZXdpZHRoLCBcblx0XHRcdFx0dGlsZVNldERhdGEuaW1hZ2VoZWlnaHQsXG5cdFx0XHRcdHRpbGVTZXREYXRhLnRpbGV3aWR0aCxcblx0XHRcdFx0dGlsZVNldERhdGEudGlsZWhlaWdodFxuXG5cdFx0XHRAdGlsZVNldHMucHVzaCB0aWxlU2V0XG5cblx0XHRcdCMgY3JlYXRlIHRpbGUgZ2VvbWV0cnlcblx0XHRcdGlkID0gdGlsZVNldERhdGEuZmlyc3RnaWRcblx0XHRcdGZvciByb3cgaW4gWzAuLnRpbGVTZXQucm93cy0xXVxuXHRcdFx0XHRmb3IgY29sIGluIFswLi50aWxlU2V0LmNvbHMtMV1cblx0XHRcdFx0XHR0aWxlID0gbmV3IFRpbGUgdGlsZVNldCwgcm93LCBjb2xcblx0XHRcdFx0XHRAdGlsZXNbaWRdID0gdGlsZVxuXHRcdFx0XHRcdGlkKytcblxuXG5cdFx0IyBjcmVhdGUgdGlsZSBvYmplY3RzIHRoYXQgY29tcHJpc2UgYmFja2dyb3VuZHNcblx0XHRmYXJCYWNrZ3JvdW5kID0gQGxvYWRUaWxlTGF5ZXIoZGF0YS5sYXllcnNbMF0pXG5cdFx0ZmFyQmFja2dyb3VuZC5wb3NpdGlvbi55ID0gNy41ICogMlxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wXG5cdFx0ZmFyQmFja2dyb3VuZC5wb3NpdGlvbi56ID0gLXRhcmdldFpcblx0XHRmYXJCYWNrZ3JvdW5kLnNjYWxlLnNldCgyLCAyLCAyKVxuXHRcdGNvbnNvbGUubG9nIGZhckJhY2tncm91bmRcblx0XHRAcm9vdC5hZGQgZmFyQmFja2dyb3VuZFxuXHRcdFxuXHRcdGJhY2tncm91bmQgPSBAbG9hZFRpbGVMYXllcihkYXRhLmxheWVyc1sxXSlcblx0XHRiYWNrZ3JvdW5kLnBvc2l0aW9uLnkgPSA3LjVcblx0XHRjb25zb2xlLmxvZyBiYWNrZ3JvdW5kXG5cdFx0QHJvb3QuYWRkIGJhY2tncm91bmRcblxuXG5cdFx0IyBsb2FkIG9iamVjdHNcblx0XHRmb3IgbyBpbiBkYXRhLmxheWVyc1syXS5vYmplY3RzIFxuXHRcdFx0ZW5lbXkgPSBuZXcgRW5lbWllc1tvLnR5cGVdKG5ldyBUSFJFRS5WZWN0b3IzKG8ueCAvIDMyLCA3IC0gby55IC8gMzIsIHV0aWwucmFuZG9tKC0xLCAxKSkpXG5cdFx0XHRlbmVteS5hY3RpdmUgPSBmYWxzZVxuXHRcdFx0QGFkZCBlbmVteVxuXG5cblx0bG9hZFRpbGVMYXllcjogKGRhdGEpPT5cblx0XHRsYXllciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0Zm9yIGlkLCBpbmRleCBpbiBkYXRhLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gZGF0YS53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBkYXRhLndpZHRoXG5cdFx0XHRcdHRpbGVPYmplY3QgPSBuZXcgVGlsZU9iamVjdChAdGlsZXNbaWRdLCBuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIC1yb3cgLSAxLCAwKSApXG5cdFx0XHRcdGxheWVyLmFkZCB0aWxlT2JqZWN0LnJvb3RcdFxuXHRcdHJldHVybiBsYXllclxuXHRcdFxuXG5cblx0XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlID09IGZhbHNlIGFuZCBjaGlsZC5yb290LnBvc2l0aW9uLnggPCBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKyAxMFxuXHRcdFx0XHRjaGlsZC5hY3RpdmF0ZSgpXG5cblx0XHRAY29sbGlzaW9ucygpXG5cblx0XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKTtcblxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cdGNvbGxpc2lvbnM6ICgpLT5cblx0XHRmb3IgYSBpbiBAY29sbGlkZXJzXG5cdFx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0XHRmb3IgYiBpbiBAY29sbGlkZXJzXG5cdFx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRcdGlmIGEuY29sbGlkZXJIaXRUeXBlcy5pbmRleE9mKGIuY29sbGlkZXJUeXBlKSA+IC0xXG5cdFx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVJbnRvIGJcblxuXHR0ZXN0Q29sbGlzaW9uOiAoYSwgYiktPlxuXHRcdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IGEuY29sbGlzaW9uUmFkaXVzICsgYi5jb2xsaXNpb25SYWRpdXNcblxuXG5cblxuXG5jbGFzcyBHYW1lXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0I3NldHVwIHdvcmxkXG5cdFx0QHdvcmxkID0gbmV3IFdvcmxkKClcblx0XHRcblx0XHRTY29yZS5kaXNwbGF5RWxlbWVudCA9ICQoXCJcIlwiPGgxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdEBsb2FkTGV2ZWwoKVxuXG5cdFx0dXRpbC5hZnRlciAxMDAwLCAoKT0+XG5cdFx0XHRAd29ybGQuc3RhcnQoKVxuXHRcblx0bG9hZExldmVsOiAoKS0+XG5cdFx0QHdvcmxkLmNhbWVyYS5wb3NpdGlvbi54ID0gMDtcblx0XHRAbGV2ZWwgPSBuZXcgTGV2ZWwoQHdvcmxkKVxuXHRcdEB3b3JsZC5zY2VuZS5hZGQgQGxldmVsLnJvb3Rcblx0XHRAd29ybGQub24gXCJ1cGRhdGVcIiwgQGxldmVsLnVwZGF0ZVxuXHRcdFxuXHRyZXNldDogKCk9PlxuXHRcdGNvbnNvbGUubG9nIFwicmVzZXQgbGV2ZWxcIlxuXHRcdFxuXHRcdEB3b3JsZC5zY2VuZS5yZW1vdmUgQGxldmVsLnJvb3Rcblx0XHRAd29ybGQub2ZmIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblxuXHRcdEBsb2FkTGV2ZWwoKVxuXG5cbm1vZHVsZS5leHBvcnRzLmdhbWUgPSBnYW1lID0gbmV3IEdhbWUoKVxuXG5cdFx0XG5cbiMgbW9kZWxMb2FkZXIgPSBuZXcgY29yZS5Nb2RlbExvYWRlcigpXG5cblxuXHRcdFx0XG5cblxuIiwiZXhwb3J0cy5hZnRlciA9IChkZWxheSwgZnVuYyktPlxuXHRzZXRUaW1lb3V0IGZ1bmMsIGRlbGF5XG5cbmV4cG9ydHMucmFuZG9tID0gKG1pbiwgbWF4KS0+XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4iXX0=
