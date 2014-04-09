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


},{"../util.coffee":15,"./GameObject.coffee":5}],9:[function(require,module,exports){
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


},{"./Base.coffee":2,"./Input.coffee":6}],14:[function(require,module,exports){
var CollisionObject, Enemies, Game, GameObject, GameOverScreen, HomeScreen, Level, Player, Score, Sound, Tile, TileObject, TileSet, World, game, util,
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


},{"../util.coffee":15,"./CollisionObject.coffee":3,"./Enemies.coffee":4,"./GameObject.coffee":5,"./Player.coffee":9,"./Score.coffee":10,"./Sound.coffee":11,"./World.coffee":13}],15:[function(require,module,exports){
exports.after = function(delay, func) {
  return setTimeout(func, delay);
};

exports.random = function(min, max) {
  return Math.random() * (max - min) + min;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9CYXNlLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvRW5lbWllcy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL0dhbWVPYmplY3QuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9JbnB1dC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL01vZGVsTG9hZGVyLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvUGFydGljbGUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC9TY29yZS5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1NvdW5kLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvV2VhcG9ucy5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wL1dvcmxkLmNvZmZlZSIsIi9Vc2Vycy9qYmFrc2UvRG9jdW1lbnRzL3Byb2plY3RzL3NodW1wL3NjcmlwdHMvc2h1bXAvc2h1bXAuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxzQkFBUixDQUFSLENBQUE7O0FBQUEsQ0FFQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxLQUFqQixDQUF1QixTQUFBLEdBQUE7QUFFdEIsTUFBQSxzRUFBQTtBQUFBLEVBQUEsQ0FBQSxDQUFFLFFBQUYsQ0FBWSxDQUFBLENBQUEsQ0FBRSxDQUFDLHVCQUFmLENBQXVDLE9BQU8sQ0FBQyxvQkFBL0MsQ0FBQSxDQUFBO0FBQUEsRUFFQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLGVBQUYsQ0FGVCxDQUFBO0FBQUEsRUFHQSxZQUFBLEdBQWUsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFBLEdBQWlCLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FIaEMsQ0FBQTtBQUFBLEVBS0EsY0FBQSxHQUFpQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFBLENBTGpCLENBQUE7QUFBQSxFQU1BLGVBQUEsR0FBa0IsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQU5sQixDQUFBO0FBQUEsRUFPQSxlQUFBLEdBQWtCLGNBQUEsR0FBaUIsZUFQbkMsQ0FBQTtBQUFBLEVBUUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxZQUFaLEVB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SyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBNUIsQ0FIQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBTEEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsY0FBYyxDQUFDLElBQWpDLENBTkEsQ0FBQTtXQU9BLElBQUMsQ0FBQSxLQUFELEdBQVMsWUFSQTtFQUFBLENBbkRWLENBQUE7O2NBQUE7O0lBM05ELENBQUE7O0FBQUEsTUF5Uk0sQ0FBQyxPQUFPLENBQUMsSUFBZixHQUFzQixJQUFBLEdBQVcsSUFBQSxJQUFBLENBQUEsQ0F6UmpDLENBQUE7Ozs7QUNBQSxPQUFPLENBQUMsS0FBUixHQUFnQixTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7U0FDZixVQUFBLENBQVcsSUFBWCxFQUFpQixLQUFqQixFQURlO0FBQUEsQ0FBaEIsQ0FBQTs7QUFBQSxPQUdPLENBQUMsTUFBUixHQUFpQixTQUFDLEdBQUQsRUFBTSxHQUFOLEdBQUE7QUFDaEIsU0FBTyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsQ0FBQyxHQUFBLEdBQU0sR0FBUCxDQUFoQixHQUE4QixHQUFyQyxDQURnQjtBQUFBLENBSGpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInNodW1wID0gcmVxdWlyZSgnLi9zaHVtcC9zaHVtcC5jb2ZmZWUnKVxuXG4kKFwiI2Z1bGxzY3JlZW5cIikuY2xpY2sgKCktPlxuXHRcblx0JChcIiNzaHVtcFwiKVswXS53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbihFbGVtZW50LkFMTE9XX0tFWUJPQVJEX0lOUFVUKTtcblx0XG5cdGNhbnZhcyA9ICQoXCIjc2h1bXAgY2FudmFzXCIpXG5cdGNhbnZhc0FzcGVjdCA9IGNhbnZhcy53aWR0aCgpIC8gY2FudmFzLmhlaWdodCgpXG5cblx0Y29udGFpbmVyV2lkdGggPSAkKHdpbmRvdykud2lkdGgoKVxuXHRjb250YWluZXJIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KClcblx0Y29udGFpbmVyQXNwZWN0ID0gY29udGFpbmVyV2lkdGggLyBjb250YWluZXJIZWlnaHRcblx0Y29uc29sZS5sb2cgY2FudmFzQXNwZWN0LCAkKHdpbmRvdykud2lkdGgoKSAsICQod2luZG93KS5oZWlnaHQoKSwgY29udGFpbmVyQXNwZWN0XG5cdFxuXHRpZiBjYW52YXNBc3BlY3QgPCBjb250YWluZXJBc3BlY3Rcblx0XHRjb25zb2xlLmxvZyBcIm1hdGNoIGhlaWdodFwiXG5cdFx0Y2FudmFzLmhlaWdodCBjb250YWluZXJIZWlnaHRcblx0XHRjYW52YXMud2lkdGggY29udGFpbmVySGVpZ2h0ICogY2FudmFzQXNwZWN0XG5cdGVsc2Vcblx0XHRjb25zb2xlLmxvZyBcIm1hdGNoIHdpZHRoXCJcblx0XHRjYW52YXMud2lkdGggY29udGFpbmVyV2lkdGhcblx0XHRjYW52YXMuaGVpZ2h0IGNvbnRhaW5lcldpZHRoIC8gY2FudmFzQXNwZWN0XG5cbiQoXCIjZGVidWdcIikuYXBwZW5kKFwiXCJcIjxzcGFuIGlkPVwibGV2ZWxDaGlsZHJlblwiPlwiXCJcIilcblxuXG51cGRhdGVEZWJ1ZyA9ICgpLT5cblx0JChcIiNsZXZlbENoaWxkcmVuXCIpLnRleHQgXCJcIlwibGV2ZWwuY2hpbGRyZW4gPSAje3NodW1wLmdhbWUubGV2ZWwuY2hpbGRyZW4ubGVuZ3RofVwiXCJcIlxuXG5cbnNodW1wLmdhbWUud29ybGQub24gXCJ1cGRhdGVcIiwgdXBkYXRlRGVidWdcblxuXG5cbiMgY29uc29sZS5sb2cgXCJoaWRlcmFcIlxuXG5cbiIsImNsYXNzIEJhc2Vcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAX2V2ZW50cyA9IHt9XG5cblx0b246IChldmVudCwgaGFuZGxlcikgLT5cblx0XHQoQF9ldmVudHNbZXZlbnRdID89IFtdKS5wdXNoIGhhbmRsZXJcblx0XHRyZXR1cm4gdGhpc1xuXG5cdG9mZjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdGZvciBzdXNwZWN0LCBpbmRleCBpbiBAX2V2ZW50c1tldmVudF0gd2hlbiBzdXNwZWN0IGlzIGhhbmRsZXJcblx0XHRcdEBfZXZlbnRzW2V2ZW50XS5zcGxpY2UgaW5kZXgsIDFcblx0XHRyZXR1cm4gdGhpc1xuXG5cdHRyaWdnZXI6IChldmVudCwgYXJncy4uLikgPT5cblx0XHRyZXR1cm4gdGhpcyB1bmxlc3MgQF9ldmVudHNbZXZlbnRdP1xuXHRcdGZvciBpIGluIFtAX2V2ZW50c1tldmVudF0ubGVuZ3RoLTEuLjBdIGJ5IC0xXG5cdFx0XHRoYW5kbGVyID0gQF9ldmVudHNbZXZlbnRdW2ldXG5cdFx0XHRoYW5kbGVyLmFwcGx5IHRoaXMsIGFyZ3Ncblx0XHRyZXR1cm4gdGhpc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuXG5jbGFzcyBDb2xsaXNpb25PYmplY3QgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSB1bmRlZmluZWRcblx0XHRAY29sbGlkZXJIaXRUeXBlcyA9IFtdXG5cdFx0QGhwID0gMVxuXHRcdEBkcCA9IDFcblx0XHRAY29sbGlzaW9uUmFkaXVzID0gLjZcblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHRhcmdldC50YWtlRGFtYWdlKEBkcClcblx0XHQjIEBkaWUoKVxuXHRcdCMgZ2FtZU9iamVjdC5kaWUoKVxuXG5cdHRha2VEYW1hZ2U6IChkYW1hZ2UpLT5cblx0XHRAaHAgLT0gZGFtYWdlXG5cdFx0aWYgQGhwIDw9IDAgXG5cdFx0XHRAZGllKClcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb25PYmplY3RcbiIsIlxuU291bmQgPSByZXF1aXJlICcuL1NvdW5kLmNvZmZlZSdcbkNvbGxpc2lvbk9iamVjdCA9IHJlcXVpcmUgJy4vQ29sbGlzaW9uT2JqZWN0LmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblxuXG5jbGFzcyBCYXNpYyBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRlbmVteVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL2VuZW1pZXMvZW5lbXkucG5nXCJcblx0ZW5lbXlNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBlbmVteVRleHR1cmVcblx0XHRcdHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdHNoYWRpbmc6IFRIUkVFLk5vU2hhZGluZ1xuXHRcdFx0dHJhbnNwYXJlbnQ6IHRydWVcblx0ZW5lbXlHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKTtcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImVuZW15XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwicGxheWVyXCJcblxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBlbmVteUdlb21ldHJ5LCBlbmVteU1hdGVyaWFsXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblx0XHRAYWdlID0gMFxuXHRcdEBoYXNGaXJlZCA9IGZhbHNlXG5cblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVxuXHRcdEBhZ2UgKz0gZGVsdGFcblx0XHRcblx0XG5cdGRpZTogKCktPlxuXHRcdFNvdW5kLnBsYXkoJ2V4cGxvc2lvbicpXG5cdFx0Zm9yIGkgaW4gWzAuLjIwXVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAzKVxuXHRcdHN1cGVyKClcblxuXG5jbGFzcyBTaW5XYXZlIGV4dGVuZHMgQmFzaWNcblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcdFx0XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSAtMSAqIGRlbHRhXG5cdFx0QHJvb3QucG9zaXRpb24ueSArPSBkZWx0YSAqIE1hdGguc2luKEBhZ2UpXG5cbmNsYXNzIERhcnQgZXh0ZW5kcyBCYXNpY1xuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdHN1cGVyKGRlbHRhKVx0XHRcblx0XHRpZiBAYWdlIDwgLjVcblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gLTIwICogZGVsdGFcblx0XHRlbHNlIGlmIEBhZ2UgPCAzXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdGVsc2Vcblx0XHRcdEBkaWUoKVxuXG5cdFx0aWYgQGFnZSA+IDEgYW5kIG5vdCBAaGFzRmlyZWRcblx0XHRcdEBoYXNGaXJlZCA9IHRydWVcblx0XHRcdEBmaXJlX3ByaW1hcnkoKVxuXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFxuXHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuRW5lbXlCdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cblx0XHRidWxsZXQuY29sbGlkZXJUeXBlID0gXCJlbmVteV9idWxsZXRcIlxuXHRcdGJ1bGxldC5jb2xsaWRlckhpdFR5cGVzID0gW1wicGxheWVyXCJdXG5cdFx0YnVsbGV0LmFuZ2xlID0gTWF0aC5QSSAtIC4yNVxuXHRcdGJ1bGxldC5zcGVlZCA9IDVcblxuXHRcdEBwYXJlbnQuYWRkIGJ1bGxldFx0XG5cblx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5FbmVteUJ1bGxldChAcm9vdC5wb3NpdGlvbilcblxuXHRcdGJ1bGxldC5jb2xsaWRlclR5cGUgPSBcImVuZW15X2J1bGxldFwiXG5cdFx0YnVsbGV0LmNvbGxpZGVySGl0VHlwZXMgPSBbXCJwbGF5ZXJcIl1cblx0XHRidWxsZXQuYW5nbGUgPSBNYXRoLlBJICsgLjI1XG5cdFx0YnVsbGV0LnNwZWVkID0gNVxuXG5cdFx0QHBhcmVudC5hZGQgYnVsbGV0XHRcblxuXG5leHBvcnRzLkJhc2ljID0gQmFzaWNcbmV4cG9ydHMuU2luV2F2ZSA9IFNpbldhdmVcbmV4cG9ydHMuRGFydCA9IERhcnRcblxuIyBzdXBlcihkZWx0YSlcblx0XHQjIGlmIEBhZ2UgPCAxXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMlxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi55ICs9IC01ICogZGVsdGFcblx0XHQjIGVsc2UgaWYgQGFnZSA8IDIuMVxuXHRcdCMgXHRAcm9vdC5wb3NpdGlvbi54ICs9IDUgKiBkZWx0YVxuXHRcdCMgZWxzZVxuXHRcdCMgXHRAZGllKClcbiIsImNsYXNzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHBhcmVudCA9IHVuZGVmaW5lZFxuXHRcdEBjaGlsZHJlbiA9IFtdXG5cdFx0QHJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKVxuXHRcdEBkZWFkID0gZmFsc2Vcblx0XHRAYWN0aXZlID0gdHJ1ZVxuXG5cdHVwZGF0ZTogKGRlbHRhKT0+XG5cdFx0Zm9yIGkgaW4gW0BjaGlsZHJlbi5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGNoaWxkID0gQGNoaWxkcmVuW2ldXG5cdFx0XHRpZiBjaGlsZC5kZWFkXG5cdFx0XHRcdEByZW1vdmUgY2hpbGRcblx0XHRcdFx0Y29udGludWVcblx0XHRcdGlmIGNoaWxkLmFjdGl2ZVxuXHRcdFx0XHRjaGlsZC51cGRhdGUgZGVsdGEgXG5cdFxuXHRhY3RpdmF0ZTogKCktPlxuXHRcdEBhY3RpdmUgPSB0cnVlO1xuXHRcdFxuXG5cdGFkZDogKGdhbWVPYmplY3QpLT5cblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IHRoaXNcblx0XHRAY2hpbGRyZW4ucHVzaChnYW1lT2JqZWN0KVxuXHRcdEByb290LmFkZChnYW1lT2JqZWN0LnJvb3QpXG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRyZW1vdmU6IChnYW1lT2JqZWN0KS0+XG5cdFx0QHJvb3QucmVtb3ZlKGdhbWVPYmplY3Qucm9vdClcblx0XHRnYW1lT2JqZWN0LnBhcmVudCA9IG51bGxcblx0XHRpID0gIEBjaGlsZHJlbi5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY2hpbGRyZW4uc3BsaWNlKGksIDEpO1xuXHRcdHJldHVybiBnYW1lT2JqZWN0XG5cblx0ZGllOiAoKS0+XG5cdFx0QGRlYWQgPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPYmplY3RcbiIsImNsYXNzIElucHV0XG5cdGtleU1hcDogXG5cdFx0XCIzOFwiOlwidXBcIiAjdXAgYXJyb3dcblx0XHRcIjg3XCI6XCJ1cFwiICN3XG5cdFx0XCI0MFwiOlwiZG93blwiICNkb3duIGFycm93XG5cdFx0XCI4M1wiOlwiZG93blwiICNzXG5cdFx0XCIzN1wiOlwibGVmdFwiICNsZWZ0IGFycm93XG5cdFx0XCI2NVwiOlwibGVmdFwiICNhXG5cdFx0XCIzOVwiOlwicmlnaHRcIiAjcmlnaHQgYXJyb3dcblx0XHRcIjY4XCI6XCJyaWdodFwiICNkXG5cdFx0XCIzMlwiOlwiZmlyZV9wcmltYXJ5XCIgI3NwYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGtleVN0YXRlcyA9IFtdXG5cblx0XHRmb3Iga2V5LCB2YWx1ZSBvZiBAa2V5TWFwXG5cdFx0XHRAa2V5U3RhdGVzW3ZhbHVlXSA9IGZhbHNlO1xuXG5cdFx0JCh3aW5kb3cpLmtleWRvd24gKGUpPT5cblx0XHRcdCMgY29uc29sZS5sb2cgZS53aGljaFxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gdHJ1ZTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblxuXHRcdCQod2luZG93KS5rZXl1cCAoZSk9PlxuXHRcdFx0aWYgQGtleU1hcFtlLndoaWNoXVxuXHRcdFx0XHRAa2V5U3RhdGVzW0BrZXlNYXBbZS53aGljaF1dID0gZmFsc2U7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cbmlucHV0ID0gbmV3IElucHV0KClcbm1vZHVsZS5leHBvcnRzID0gaW5wdXRcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IChAZ2VvbWV0cnksIEBtYXRlcmlhbCktPlxuXHRcdHN1cGVyKClcblx0XHRAbWF0ZXJpYWwgPSB1bmRlZmluZWRcblx0XHRAZ2VvbWV0cnkgPSB1bmRlZmluZWRcblx0XHRAdGV4dHVyZSA9IHVuZGVmaW5lZFxuXHRcdEBzdGF0dXMgPSB1bmRlZmluZWRcblxuXHRsb2FkOiAoZmlsZU5hbWUpPT5cblx0XHRqc29uTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblx0XHRqc29uTG9hZGVyLmxvYWQgZmlsZU5hbWUsIChnZW9tZXRyeSwgbWF0ZXJpYWxzLCBvdGhlcnMuLi4pPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKCBtYXRlcmlhbHMgKVxuXHRcdFx0IyBAbWF0ZXJpYWwgPSBtYXRlcmlhbHNbMF1cblx0XHRcdEBnZW9tZXRyeSA9IGdlb21ldHJ5XG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cdGxvYWRQbmc6IChmaWxlTmFtZSk9PlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBmaWxlTmFtZSwge30sICgpPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0XHQjIHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRcdCMgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblx0XHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0XHQjIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5IDEsIDFcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdCNjb25zb2xlLmxvZyBcImxvYWRwbmdcIiwgdGhpc1xuXHRcdFx0QHRyaWdnZXIgXCJzdWNjZXNzXCIsIHRoaXNcblxuXG5cbmNsYXNzIE1vZGVsTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QGRlZmF1bHRHZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMSwxLDEpXG5cdFx0QGRlZmF1bHRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0Y29sb3I6IDB4MDBmZjAwXG5cdFx0XHR3aXJlZnJhbWU6IHRydWVcblx0XHRcdG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy91dGlsL3doaXRlLnBuZ1wiXG5cblx0XHRAbG9hZGVkTW9kZWxzID0ge31cblxuXHRsb2FkOiAoZmlsZU5hbWUpLT5cblxuXHRcdCMgaWYgYWxyZWFkeSBsb2FkZWQsIGp1c3QgbWFrZSB0aGUgbmV3IG1lc2ggYW5kIHJldHVyblxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdPyAmJiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5zdGF0dXMgPT0gXCJyZWFkeVwiXG5cdFx0XHQjY29uc29sZS5sb2cgXCJjYWNoZWRcIlxuXHRcdFx0cmV0dXJuIG5ldyBUSFJFRS5NZXNoKEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLmdlb21ldHJ5LCBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5tYXRlcmlhbClcblxuXG5cdFx0IyBpZiByZXF1ZXN0ZWQgYnV0IG5vdCByZWFkeVxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XHRtb2RlbCA9IEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdXG5cdFx0XG5cdFx0IyBpZiBub3QgcmVxdWVzdGVkIGJlZm9yZVxuXHRcdGVsc2Vcblx0XHRcdG1vZGVsID0gbmV3IE1vZGVsKClcblx0XHRcdGlmIGZpbGVOYW1lLnNwbGl0KCcuJykucG9wKCkgPT0gXCJqc1wiXG5cdFx0XHRcdG1vZGVsLmxvYWQoZmlsZU5hbWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG1vZGVsLmxvYWRQbmcoZmlsZU5hbWUpXG5cdFx0XHRAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXSA9IG1vZGVsXG5cblx0XHRvYmplY3QgPSBuZXcgVEhSRUUuTWVzaCggQGRlZmF1bHRHZW9tZXRyeSwgQGRlZmF1bHRNYXRlcmlhbCApXG5cdFx0bW9kZWwub24gXCJzdWNjZXNzXCIsIChtKS0+XG5cdFx0XHRvYmplY3QuZ2VvbWV0cnkgPSBtLmdlb21ldHJ5XHRcdFx0XG5cdFx0XHRvYmplY3QubWF0ZXJpYWwgPSBtLm1hdGVyaWFsXG5cdFx0XHRtLm9mZiBcInN1Y2Nlc3NcIiwgYXJndW1lbnRzLmNhbGxlZSAjcmVtb3ZlIHRoaXMgaGFuZGxlciBvbmNlIHVzZWRcblx0XHRyZXR1cm4gb2JqZWN0XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZWxMb2FkZXJcbiIsIkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xudXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5jbGFzcyBQYXJ0aWNsZSBleHRlbmRzIEdhbWVPYmplY3Rcblx0cGFydGljbGVUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9wYXJ0aWNsZXMvcGFydGljbGUyLnBuZ1wiXG5cdHBhcnRpY2xlTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogcGFydGljbGVUZXh0dXJlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoV3JpdGU6IGZhbHNlXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcdFx0YmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblxuXHRwYXJ0aWNsZUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24sIGVuZXJneSktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAxMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHBhcnRpY2xlR2VvbWV0cnksIHBhcnRpY2xlTWF0ZXJpYWxcblx0XHRcblx0XHRAdmVsb2NpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMyh1dGlsLnJhbmRvbSgtMSwgMSksIHV0aWwucmFuZG9tKC0xLCAxKSwgdXRpbC5yYW5kb20oLTEsIDEpKTtcblx0XHRAdmVsb2NpdHkubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoZW5lcmd5KVxuXHRcdEByb290LnBvc2l0aW9uLmNvcHkocG9zaXRpb24pXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRAdmVsb2NpdHkubXVsdGlwbHlTY2FsYXIoLjk5KVxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnggKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gQHZlbG9jaXR5LnkgKiBkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnogKz0gQHZlbG9jaXR5LnogKiBkZWx0YVxuXHRcdHMgPSAxLSAoKERhdGUubm93KCkgLSBAYmlydGgpIC8gQHRpbWVUb0xpdmUpICsgLjAxXG5cdFx0QHJvb3Quc2NhbGUuc2V0KHMsIHMsIHMpXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZVxuIiwidXRpbCA9IHJlcXVpcmUgJy4uL3V0aWwuY29mZmVlJ1xuXG5Tb3VuZCA9IHJlcXVpcmUgJy4vU291bmQuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuTW9kZWxMb2FkZXIgPSByZXF1aXJlICcuL01vZGVsTG9hZGVyLmNvZmZlZSdcbklucHV0ID0gcmVxdWlyZSAnLi9JbnB1dC5jb2ZmZWUnXG5XZWFwb25zID0gcmVxdWlyZSAnLi9XZWFwb25zLmNvZmZlZSdcblBhcnRpY2xlID0gcmVxdWlyZSAnLi9QYXJ0aWNsZS5jb2ZmZWUnXG5TaHVtcCA9IHJlcXVpcmUgJy4vc2h1bXAuY29mZmVlJ1xuXG5tb2RlbExvYWRlciA9IG5ldyBNb2RlbExvYWRlcigpXG4jIGlucHV0ID0gbmV3IElucHV0KClcblxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQ29sbGlzaW9uT2JqZWN0XG5cblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRzdXBlcigpXG5cdFx0XG5cdFx0XG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwicGxheWVyXCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlfYnVsbGV0XCJcblxuXHRcdG1vZGVsID0gbW9kZWxMb2FkZXIubG9hZChcImFzc2V0cy9zaGlwcy9zaGlwMi5qc1wiKVxuXHRcdEByb290LmFkZCBtb2RlbFxuXHRcdHV0aWwuYWZ0ZXIgMTAwMCwgKCktPlxuXHRcdFx0bW9kZWwubWF0ZXJpYWwubWF0ZXJpYWxzWzBdLndpcmVmcmFtZSA9IHRydWVcblx0XHRcblx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cdFx0QGhwID0gM1xuXG5cblx0dXBkYXRlOiAoZGVsdGEpPT5cblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ3VwJ11cblx0XHRcdEByb290LnBvc2l0aW9uLnkgKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBJbnB1dC5rZXlTdGF0ZXNbJ2Rvd24nXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSAtPSAxMCAqIGRlbHRhO1xuXHRcdGlmIElucHV0LmtleVN0YXRlc1snbGVmdCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54IC09IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydyaWdodCddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IDEwICogZGVsdGE7XG5cdFx0aWYgSW5wdXQua2V5U3RhdGVzWydmaXJlX3ByaW1hcnknXVxuXHRcdFx0QGZpcmVfcHJpbWFyeSgpXG5cblx0ZmlyZV9wcmltYXJ5OiAoKS0+XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBsYXN0RmlyZSArIDI0MCAqIDFcblx0XHRcdFNvdW5kLnBsYXkoJ3Nob290Jylcblx0XHRcdEBsYXN0RmlyZSA9IERhdGUubm93KClcblx0XHRcdFxuXHRcdFx0YnVsbGV0ID0gbmV3IFdlYXBvbnMuQnVsbGV0KEByb290LnBvc2l0aW9uKVxuXHRcdFx0QHBhcmVudC5hZGQgYnVsbGV0XG5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdGJ1bGxldC5hbmdsZSA9IC0uMjVcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0XHRidWxsZXQgPSBuZXcgV2VhcG9ucy5CdWxsZXQoQHJvb3QucG9zaXRpb24pXG5cdFx0XHRidWxsZXQuYW5nbGUgPSArLjI1XG5cdFx0XHRAcGFyZW50LmFkZCBidWxsZXRcblx0XHRcdCMgQHBhcmVudC5jb2xsaWRlcnMucHVzaCBidWxsZXRcblxuXHRkaWU6ICgpLT5cblx0XHQjIGNvbnNvbGUubG9nIFwiZGllXCJcblx0XHRcblx0XHRTb3VuZC5wbGF5KCdleHBsb3Npb24nKVxuXHRcdGZvciBpIGluIFswLi4yMDBdXG5cdFx0XHRAcGFyZW50LmFkZCBuZXcgUGFydGljbGUoQHJvb3QucG9zaXRpb24sIDgpXG5cblx0XHRwb3MgPSBAcm9vdC5wb3NpdGlvblxuXHRcdHBhcmVudCA9IEBwYXJlbnRcblx0XHR1dGlsLmFmdGVyIDEwMDAsICgpLT5cblx0XHRcdGJ1bGxldCA9IG5ldyBXZWFwb25zLkJ1bGxldChwb3MpXG5cdFx0XHRidWxsZXQuaHAgPSAxMDBcblx0XHRcdGJ1bGxldC5kcCA9IDEwXG5cdFx0XHRidWxsZXQuY29sbGlzaW9uUmFkaXVzID0gMTUwXG5cdFx0XHRwYXJlbnQuYWRkIGJ1bGxldFxuXG5cdFx0dXRpbC5hZnRlciAxMjUwLCBTaHVtcC5nYW1lLnJlc2V0UGxheWVyXG5cdFx0c3VwZXIoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcbiIsIlxuc2NvcmUgPSAwXG5leHBvcnRzLmRpc3BsYXlFbGVtZW50ID0gdW5kZWZpbmVkXG5cbmV4cG9ydHMuYWRkID0gKHBvaW50cyktPlxuXHRzY29yZSArPSBwb2ludHNcblx0IyBjb25zb2xlLmxvZyBleHBvcnRzLmRpc3BsYXlFbGVtZW50XG5cdGlmIGV4cG9ydHMuZGlzcGxheUVsZW1lbnQ/XG5cdFx0ZXhwb3J0cy5kaXNwbGF5RWxlbWVudC50ZXh0IFwiU2NvcmU6ICN7c2NvcmV9XCJcblxuZXhwb3J0cy5nZXQgPSAoKS0+XG5cdHJldHVybiBzY29yZVxuIiwid2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHR8fHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG5hdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbmNsYXNzIFNvdW5kXG5cdGNvbnN0cnVjdG9yOiAoQG5hbWUsIEB1cmwsIEBidWZmZXIpLT5cbmV4cG9ydHMuU291bmQgPSBTb3VuZFxuXG5leHBvcnRzLmxvYWRlZFNvdW5kcyA9IGxvYWRlZFNvdW5kcyA9IHt9XG5cblxuZXhwb3J0cy5sb2FkID0gbG9hZCA9IChuYW1lLCB1cmwpIC0+XG5cdHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXHRcdHJlcXVlc3Qub3BlbignR0VUJywgdXJsKVxuXHRcdHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblx0XHRyZXF1ZXN0Lm9ubG9hZCA9IChhLCBiLCBjKT0+XG5cdFx0XHRpZiByZXF1ZXN0LnN0YXR1cyA9PSAyMDBcblx0XHRcdFx0YXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSByZXF1ZXN0LnJlc3BvbnNlLCBcblx0XHRcdFx0XHQoYnVmZmVyKT0+XG5cdFx0XHRcdFx0XHQjdG9kbyBoYW5kbGUgZGVjb2RpbmcgZXJyb3Jcblx0XHRcdFx0XHRcdHNvdW5kID0gbmV3IFNvdW5kKG5hbWUsIHVybCwgYnVmZmVyKVxuXHRcdFx0XHRcdFx0ZXhwb3J0cy5sb2FkZWRTb3VuZHNbbmFtZV0gPSBzb3VuZFxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc29sdmUoc291bmQpXG5cdFx0XHRcdFx0LChlcnIpPT5cblx0XHRcdFx0XHRcdHJlamVjdCBFcnJvcihcIkRlY29kaW5nIEVycm9yXCIpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNvbnNvbGUubG9nICBcIlN0YXR1c1wiXG5cdFx0XHRcdHJlamVjdCBFcnJvcihcIlN0YXR1cyBFcnJvclwiKVxuXG5cdFx0XHRcdFxuXHRcdHJlcXVlc3Qub25lcnJvciA9ICgpLT5cblx0XHRcdGNvbnNvbGUubG9nIFwiZXJyclwiXG5cdFx0XHRyZWplY3QgRXJyb3IoXCJOZXR3b3JrIEVycm9yXCIpIFx0XG5cblx0XHRyZXF1ZXN0LnNlbmQoKVxuXHRcdFx0XG5cbmV4cG9ydHMucGxheSA9IHBsYXkgPSAoYXJnKS0+XG5cdGlmIHR5cGVvZiBhcmcgPT0gJ3N0cmluZydcblx0XHRidWZmZXIgPSBsb2FkZWRTb3VuZHNbYXJnXS5idWZmZXJcblx0ZWxzZSBcblx0XHRidWZmZXIgPSBhcmdcblx0aWYgYnVmZmVyP1xuXHRcdHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuXHRcdHNvdXJjZS5idWZmZXIgPSBidWZmZXJcblx0XHRzb3VyY2UuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pXG5cdFx0c291cmNlLnN0YXJ0KDApXG5cblxuYXNzZXRzTG9hZGluZyA9IFtdXG5hc3NldHNMb2FkaW5nLnB1c2ggbG9hZCgnc2hvb3QnLCAnYXNzZXRzL3NvdW5kcy9zaG9vdC53YXYnKVxuYXNzZXRzTG9hZGluZy5wdXNoIGxvYWQoJ2V4cGxvc2lvbicsICdhc3NldHMvc291bmRzL2V4cGxvc2lvbi53YXYnKVxuXG5Qcm9taXNlLmFsbChhc3NldHNMb2FkaW5nKVxuLnRoZW4gKHJlc3VsdHMpLT5cblx0Y29uc29sZS5sb2cgXCJMb2FkZWQgYWxsIFNvdW5kcyFcIiwgcmVzdWx0c1xuLmNhdGNoIChlcnIpLT5cblx0Y29uc29sZS5sb2cgXCJ1aG9oXCIsIGVyclxuXG4iLCJTY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuUGFydGljbGUgPSByZXF1aXJlICcuL1BhcnRpY2xlLmNvZmZlZSdcblxuY2xhc3MgZXhwb3J0cy5CdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXQucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSlcblxuXHRjb25zdHJ1Y3RvcjogKHBvc2l0aW9uKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBiaXJ0aCA9IERhdGUubm93KClcblx0XHRAdGltZVRvTGl2ZSA9IDIwMDBcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggYnVsbGV0R2VvbWV0cnksIGJ1bGxldE1hdGVyaWFsXG5cblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiYnVsbGV0XCJcblx0XHRAY29sbGlkZXJIaXRUeXBlcy5wdXNoIFwiZW5lbXlcIlxuXHRcdEBhbmdsZSA9IDBcblx0XHRAc3BlZWQgPSAxNVxuXG5cdHVwZGF0ZTogKGRlbHRhKS0+XG5cdFx0QHJvb3QucG9zaXRpb24ueCArPSBNYXRoLmNvcyhAYW5nbGUpKkBzcGVlZCpkZWx0YVxuXHRcdEByb290LnBvc2l0aW9uLnkgKz0gTWF0aC5zaW4oQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5yb3RhdGlvbi56ID0gQGFuZ2xlXG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAZGllKClcblxuXG5cdGNvbGxpZGVJbnRvOiAodGFyZ2V0KS0+XG5cdFx0c3VwZXIodGFyZ2V0KVxuXHRcdFNjb3JlLmFkZCgxKVxuXHRcdEBkaWUoKVxuXHRcdGZvciBpIGluIFswLi41XVxuXHRcdFx0QHBhcmVudC5hZGQgbmV3IFBhcnRpY2xlKEByb290LnBvc2l0aW9uLCAxKVxuXG5cbmNsYXNzIGV4cG9ydHMuRW5lbXlCdWxsZXQgZXh0ZW5kcyBDb2xsaXNpb25PYmplY3Rcblx0YnVsbGV0VGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUgXCJhc3NldHMvd2VhcG9ucy9idWxsZXRfMi5wbmdcIlxuXHRidWxsZXRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiBidWxsZXRUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRidWxsZXRHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAxLCAxKVxuXHRcblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRcblx0XHRAYmlydGggPSBEYXRlLm5vdygpXG5cdFx0QHRpbWVUb0xpdmUgPSAyMDAwXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGJ1bGxldEdlb21ldHJ5LCBidWxsZXRNYXRlcmlhbFxuXG5cdFx0QHJvb3QucG9zaXRpb24uY29weShwb3NpdGlvbilcblxuXHRcdEBjb2xsaWRlclR5cGUgPSBcImJ1bGxldFwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcImVuZW15XCJcblx0XHRAYW5nbGUgPSAwXG5cdFx0QHNwZWVkID0gMTVcblxuXHR1cGRhdGU6IChkZWx0YSktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gTWF0aC5jb3MoQGFuZ2xlKSpAc3BlZWQqZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IE1hdGguc2luKEBhbmdsZSkqQHNwZWVkKmRlbHRhXG5cdFx0QHJvb3Qucm90YXRpb24ueiA9IEBhbmdsZVxuXHRcdGlmIERhdGUubm93KCkgPiBAYmlydGggKyBAdGltZVRvTGl2ZVxuXHRcdFx0QGRpZSgpXG5cblxuXHRjb2xsaWRlSW50bzogKHRhcmdldCktPlxuXHRcdHN1cGVyKHRhcmdldClcblx0XHRTY29yZS5hZGQoMSlcblx0XHRAZGllKClcblx0XHRmb3IgaSBpbiBbMC4uNV1cblx0XHRcdEBwYXJlbnQuYWRkIG5ldyBQYXJ0aWNsZShAcm9vdC5wb3NpdGlvbiwgMSlcbiIsIkJhc2UgPSByZXF1aXJlICcuL0Jhc2UuY29mZmVlJ1xuXG5JbnB1dCA9IHJlcXVpcmUgJy4vSW5wdXQuY29mZmVlJ1xuXG5jbGFzcyBXb3JsZCBleHRlbmRzIEJhc2Vcblx0XG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdHN1cGVyKClcblxuXHRcdHcgPSA2NDBcblx0XHRoID0gNDgwXG5cdFx0QGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgdyAvIGgsIDEsIDEwMDAwKVxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblxuXHRcdHRhcmdldFogPSA0ODAgLyAoMiAqIE1hdGgudGFuKGZvdl9yYWRpYW5zIC8gMikgKSAvIDMyLjA7XG5cblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB0YXJnZXRaXG5cdFx0XG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRcblx0XHRAcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpXG5cdFx0QHJlbmRlcmVyLnNldFNpemUgdywgaFxuXHRcdCMgQHJlbmRlcmVyLnNvcnRPYmplY3RzID0gZmFsc2Vcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cblxuXHRcdFxuXHRcdEB3b3JsZFRleHR1cmUgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQgdywgaCwgXG5cdFx0XHRtaW5GaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlclxuXHRcdFx0bWFnRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXJcblx0XHRcdGZvcm1hdDogVEhSRUUuUkdCRm9ybWF0XG5cdFx0XG5cblx0XHRAcHJvY2Vzc01hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHR0cmFuc3BhcmVudDogZmFsc2Vcblx0XHRcdHVuaWZvcm1zOiBcblx0XHRcdFx0XCJ0RGlmZnVzZVwiOiB7IHR5cGU6IFwidFwiLCB2YWx1ZTogQHdvcmxkVGV4dHVyZSB9XG5cblx0XHRcdHZlcnRleFNoYWRlcjpcblx0XHRcdFx0XCJcIlwiXG5cdFx0XHRcdHZhcnlpbmcgdmVjMiB2VXY7XG5cblx0XHRcdFx0dm9pZCBtYWluKCkge1xuXHRcdFx0XHRcdHZVdiA9IHV2O1xuXHRcdFx0XHRcdGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0ZnJhZ21lbnRTaGFkZXI6XG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHR1bmlmb3JtIHNhbXBsZXIyRCB0RGlmZnVzZTtcblx0XHRcdFx0dmFyeWluZyB2ZWMyIHZVdjtcblxuXHRcdFx0XHR2b2lkIG1haW4oKSB7XG5cdFx0XHRcdFx0Ly8gcmVhZCB0aGUgaW5wdXQgY29sb3JcblxuXHRcdFx0XHRcdHZlYzQgbztcblx0XHRcdFx0XHR2ZWM0IGM7XG5cdFx0XHRcdFx0YyA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiApO1xuXHRcdFx0XHRcdC8vbyA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiApO1xuXG5cdFx0XHRcdFx0Ly9taXNhbGlnbiByZ2Jcblx0XHRcdFx0XHRvLnIgPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCB2VXYgKyB2ZWMyKDAuMCwgLTAuMDAxKSApLnI7XG5cdFx0XHRcdFx0by5nID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIDAuMDAxKSApLnI7XG5cdFx0XHRcdFx0by5iID0gdGV4dHVyZTJEKCB0RGlmZnVzZSwgdlV2ICsgdmVjMigwLjAsIDAuMDAzKSApLnI7XG5cblx0XHRcdFx0XHQvL3NjYW5saW5lc1xuXHRcdFx0XHRcdG8uciAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgMS4wO1xuXHRcdFx0XHRcdG8uZyAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgMS4wO1xuXHRcdFx0XHRcdG8uYiAqPSBzaW4odlV2LnkgKiAyNDAuMCAqIDYuMjgpICogLjI1ICsgMS4wO1xuXG5cdFx0XHRcdFx0byAqPSAwLjUgKyAxLjAqMTYuMCp2VXYueCp2VXYueSooMS4wLXZVdi54KSooMS4wLXZVdi55KTtcblx0XHRcdFx0XHRcblxuXHRcdFx0XHRcdC8vIHNldCB0aGUgb3V0cHV0IGNvbG9yXG5cdFx0XHRcdFx0Z2xfRnJhZ0NvbG9yID0gbyAqIC41ICsgYyAqIC41O1xuXHRcdFx0XHR9XG5cdFx0XHRcdFwiXCJcIlxuXG5cdFx0QHByb2Nlc3NTY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cdFx0QHByb2Nlc3NDYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKC0uNSwgLjUsIC0uNSAsIC41LCAwLCAxKVxuXHRcdEBwcm9jZXNzQ2FtZXJhLnBvc2l0aW9uLnogPSAwXG5cdFx0QHByb2Nlc3NTY2VuZS5hZGQgQHByb2Nlc3NDYW1lcmFcblx0XHRAcHJvY2Vzc1F1YWQgPSBuZXcgVEhSRUUuTWVzaCggbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEgKSwgQHByb2Nlc3NNYXRlcmlhbCApO1xuXHRcdEBwcm9jZXNzUXVhZC5yb3RhdGlvbi54ID0gTWF0aC5QSVxuXHRcdEBwcm9jZXNzU2NlbmUuYWRkIEBwcm9jZXNzUXVhZFxuXG5cblxuXG5cdFx0QGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKClcblx0XHRAc3RhdHMgPSBuZXcgU3RhdHMoKTtcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuXHRcdCQoXCIjc2h1bXBcIilbMF0uYXBwZW5kQ2hpbGQoIEBzdGF0cy5kb21FbGVtZW50IClcblxuXHRcdHJldHVybiB0aGlzXG5cblx0YW5pbWF0ZTogPT5cblx0XHRkZWx0YSA9IEBjbG9jay5nZXREZWx0YSgpXHRcdFxuXHRcdCNkb24ndCB1cGRhdGUgYWZ0ZXIgbG9uZyBmcmFtZSAoZml4ZXMgaXNzdWUgd2l0aCBzd2l0Y2hpbmcgdGFicylcblx0XHRpZiAoZGVsdGEgPCAuNSkgXG5cdFx0XHRAdHJpZ2dlciBcInVwZGF0ZVwiLCBkZWx0YVxuXG5cdFx0QHJlbmRlcmVyLnJlbmRlciggQHNjZW5lLCBAY2FtZXJhLCBAd29ybGRUZXh0dXJlLCB0cnVlICk7XG5cblxuXHRcdEByZW5kZXJlci5yZW5kZXIgQHByb2Nlc3NTY2VuZSwgQHByb2Nlc3NDYW1lcmFcblxuXHRcdEBzdGF0cy51cGRhdGUoKVxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSBAYW5pbWF0ZVxuXHRcdHJldHVyblxuXG5cdHN0YXJ0OiAtPlxuXHRcdEBhbmltYXRlKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gV29ybGRcbiIsInV0aWwgPSByZXF1aXJlICcuLi91dGlsLmNvZmZlZSdcblxuV29ybGQgPSByZXF1aXJlICcuL1dvcmxkLmNvZmZlZSdcbkdhbWVPYmplY3QgPSByZXF1aXJlICcuL0dhbWVPYmplY3QuY29mZmVlJ1xuQ29sbGlzaW9uT2JqZWN0ID0gcmVxdWlyZSAnLi9Db2xsaXNpb25PYmplY3QuY29mZmVlJ1xuUGxheWVyID0gcmVxdWlyZSAnLi9QbGF5ZXIuY29mZmVlJ1xuRW5lbWllcyA9IHJlcXVpcmUgJy4vRW5lbWllcy5jb2ZmZWUnXG5cblNvdW5kID0gcmVxdWlyZSAnLi9Tb3VuZC5jb2ZmZWUnXG5TY29yZSA9IHJlcXVpcmUgJy4vU2NvcmUuY29mZmVlJ1xuXG5jbGFzcyBUaWxlXG5cdFxuXG5cblx0Y29uc3RydWN0b3I6IChAdGlsZVNldCwgQHJvdywgQGNvbCktPlxuXHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCBAdGlsZVNldC50aWxlV2lkdGggLyAzMiwgQHRpbGVTZXQudGlsZUhlaWdodCAvIDMyKVxuXHRcdGZvciB2IGluIEBnZW9tZXRyeS52ZXJ0aWNlc1xuXHRcdFx0di54ICs9IEB0aWxlU2V0LnRpbGVXaWR0aCAvIDMyIC8gMlxuXHRcdFx0di55ICs9IEB0aWxlU2V0LnRpbGVIZWlnaHQgLyAzMiAvIDJcblx0XHRAZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZVxuXG5cdFx0IyBjYWxjIGFuZCBzZXQgdXZzXG5cdFx0dXZXaWR0aCA9IEB0aWxlU2V0LnRpbGVXaWR0aC9AdGlsZVNldC5pbWFnZVdpZHRoXG5cdFx0dXZIZWlnaHQgPSBAdGlsZVNldC50aWxlSGVpZ2h0L0B0aWxlU2V0LmltYWdlSGVpZ2h0XG5cdFx0dXZYID0gdXZXaWR0aCAqIEBjb2xcblx0XHR1dlkgPSB1dkhlaWdodCAqIChAdGlsZVNldC5yb3dzIC0gQHJvdyAtIDEpXG5cdFx0Zm9yIGZhY2UgaW4gQGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1cblx0XHRcdGZvciB2IGluIGZhY2Vcblx0XHRcdFx0aWYgdi54ID09IDBcblx0XHRcdFx0XHR2LnggPSB1dlhcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHYueCA9IHV2WCArIHV2V2lkdGggKiAoMzEvMzIuMCkgI2RpcnR5IGhhY2sgdG8gcHJldmVudCBzbGlnaHQgb3ZlcnNhbXBsZSBvbiB0aWxlIHNob3dpbmcgaGludCBvZiBuZXh0IHRpbGUgb24gZWRnZS5cblxuXHRcdFx0XHQjIHYueCA9IHYueCAqIHV2V2lkdGggICsgdXZYIFxuXHRcdFx0XHR2LnkgPSB2LnkgKiB1dkhlaWdodCArIHV2WSBcblx0XHRAZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWVcblxuXHRcdEBtYXRlcmlhbCA9IEB0aWxlU2V0Lm1hdGVyaWFsXG5cblxuY2xhc3MgVGlsZVNldFxuXHRjb25zdHJ1Y3RvcjogKEB0ZXh0dXJlRmlsZSwgQGltYWdlV2lkdGgsIEBpbWFnZUhlaWdodCwgQHRpbGVXaWR0aCwgQHRpbGVIZWlnaHQpLT5cblx0XHRAY29scyA9IEBpbWFnZVdpZHRoIC8gQHRpbGVXaWR0aFxuXHRcdEByb3dzID0gQGltYWdlSGVpZ2h0IC8gQHRpbGVXaWR0aFxuXG5cdFx0QHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIHRleHR1cmVGaWxlXG5cdFx0QG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRtYXA6IEB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdGRlcHRoVGVzdDogdHJ1ZVxuXHRcdFx0ZGVwdGhXcml0ZTogZmFsc2Vcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XG5cdFx0XG5cblx0XHQjIEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCB3aWR0aCwgaGVpZ2h0KTtcblxuXG5cbmNsYXNzIFRpbGVPYmplY3Rcblx0Y29uc3RydWN0b3I6IChAdGlsZSwgcG9zaXRpb24pLT5cblx0XHQjdG9kbyByZW1vdmUgdW5uZWRlZCBvYmplY3QzZCBudWxsIHdyYXBwZXJcblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIHRpbGUuZ2VvbWV0cnksIHRpbGUubWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogLT5cblxuY2xhc3MgTGV2ZWwgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoQHdvcmxkKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0QGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuXHRcdEByb290LmFkZChAYW1iaWVudExpZ2h0KTtcdFx0XG5cblx0XHRAcGxheWVyMSA9IG5ldyBQbGF5ZXIoKVxuXHRcdEBhZGQgQHBsYXllcjFcblxuXHRcdCQuZ2V0SlNPTiBcImFzc2V0cy9sZXZlbF8xLmpzb25cIiwgQG9uTG9hZFxuXHRcdFx0XG5cdG9uTG9hZDogKGRhdGEpPT5cblx0XHRAZGF0YSA9IGRhdGFcblx0XHQjIGNvbnNvbGUubG9nIEBkYXRhXG5cdFx0QHRpbGVTZXRzID0gW11cblx0XHRAdGlsZXMgPSBbXVxuXG5cdFx0IyBsb2FkIHRoZSB0aWxlU2V0IG1ldGFkYXRhLCB0ZXh0dXJlLCBhbmQgY3JlYXRlIHRpbGUgZ2VvbWV0cmllc1xuXHRcdGZvciB0aWxlU2V0RGF0YSBpbiBkYXRhLnRpbGVzZXRzXG5cdFx0XHQjIGxvYWQgdGlsZXNldCBkYXRhIGFuZCB0ZXh0dXJlXG5cdFx0XHR0aWxlU2V0ID0gbmV3IFRpbGVTZXQgXCJhc3NldHMvXCIrdGlsZVNldERhdGEuaW1hZ2UsIFxuXHRcdFx0XHR0aWxlU2V0RGF0YS5pbWFnZXdpZHRoLCBcblx0XHRcdFx0dGlsZVNldERhdGEuaW1hZ2VoZWlnaHQsXG5cdFx0XHRcdHRpbGVTZXREYXRhLnRpbGV3aWR0aCxcblx0XHRcdFx0dGlsZVNldERhdGEudGlsZWhlaWdodFxuXG5cdFx0XHRAdGlsZVNldHMucHVzaCB0aWxlU2V0XG5cblx0XHRcdCMgY3JlYXRlIHRpbGUgZ2VvbWV0cnlcblx0XHRcdGlkID0gdGlsZVNldERhdGEuZmlyc3RnaWRcblx0XHRcdGZvciByb3cgaW4gWzAuLnRpbGVTZXQucm93cy0xXVxuXHRcdFx0XHRmb3IgY29sIGluIFswLi50aWxlU2V0LmNvbHMtMV1cblx0XHRcdFx0XHR0aWxlID0gbmV3IFRpbGUgdGlsZVNldCwgcm93LCBjb2xcblx0XHRcdFx0XHRAdGlsZXNbaWRdID0gdGlsZVxuXHRcdFx0XHRcdGlkKytcblxuXG5cdFx0IyBjcmVhdGUgdGlsZSBvYmplY3RzIHRoYXQgY29tcHJpc2UgYmFja2dyb3VuZHNcblx0XHRmYXJCYWNrZ3JvdW5kID0gQGxvYWRUaWxlTGF5ZXIoZGF0YS5sYXllcnNbMF0pXG5cdFx0ZmFyQmFja2dyb3VuZC5wb3NpdGlvbi55ID0gNy41ICogMlxuXHRcdGZvdl9yYWRpYW5zID0gNDUgKiAoTWF0aC5QSSAvIDE4MClcblx0XHR0YXJnZXRaID0gNDgwIC8gKDIgKiBNYXRoLnRhbihmb3ZfcmFkaWFucyAvIDIpICkgLyAzMi4wXG5cdFx0ZmFyQmFja2dyb3VuZC5wb3NpdGlvbi56ID0gLXRhcmdldFpcblx0XHRmYXJCYWNrZ3JvdW5kLnNjYWxlLnNldCgyLCAyLCAyKVxuXHRcdGNvbnNvbGUubG9nIGZhckJhY2tncm91bmRcblx0XHRAcm9vdC5hZGQgZmFyQmFja2dyb3VuZFxuXHRcdFxuXHRcdGJhY2tncm91bmQgPSBAbG9hZFRpbGVMYXllcihkYXRhLmxheWVyc1sxXSlcblx0XHRiYWNrZ3JvdW5kLnBvc2l0aW9uLnkgPSA3LjVcblx0XHRjb25zb2xlLmxvZyBiYWNrZ3JvdW5kXG5cdFx0QHJvb3QuYWRkIGJhY2tncm91bmRcblxuXG5cdFx0IyBsb2FkIG9iamVjdHNcblx0XHRmb3IgbyBpbiBkYXRhLmxheWVyc1syXS5vYmplY3RzIFxuXHRcdFx0ZW5lbXkgPSBuZXcgRW5lbWllc1tvLnR5cGVdKG5ldyBUSFJFRS5WZWN0b3IzKG8ueCAvIDMyLCA3IC0gby55IC8gMzIsIHV0aWwucmFuZG9tKC0xLCAxKSkpXG5cdFx0XHRlbmVteS5hY3RpdmUgPSBmYWxzZVxuXHRcdFx0QGFkZCBlbmVteVxuXG5cblx0bG9hZFRpbGVMYXllcjogKGRhdGEpPT5cblx0XHRsYXllciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0Zm9yIGlkLCBpbmRleCBpbiBkYXRhLmRhdGFcblx0XHRcdGlmIGlkID4gMFxuXHRcdFx0XHRyb3cgPSBNYXRoLmZsb29yKGluZGV4IC8gZGF0YS53aWR0aClcblx0XHRcdFx0Y29sID0gaW5kZXggJSBkYXRhLndpZHRoXG5cdFx0XHRcdHRpbGVPYmplY3QgPSBuZXcgVGlsZU9iamVjdChAdGlsZXNbaWRdLCBuZXcgVEhSRUUuVmVjdG9yMyhjb2wsIC1yb3cgLSAxLCAwKSApXG5cdFx0XHRcdGxheWVyLmFkZCB0aWxlT2JqZWN0LnJvb3RcdFxuXHRcdHJldHVybiBsYXllclxuXHRcdFxuXG5cblx0XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cdFx0QHBsYXllcjEucm9vdC5wb3NpdGlvbi54ICs9IDEgKiBkZWx0YVxuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlID09IGZhbHNlIGFuZCBjaGlsZC5yb290LnBvc2l0aW9uLnggPCBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLnggKyAxMFxuXHRcdFx0XHRjaGlsZC5hY3RpdmF0ZSgpXG5cblx0XHRAY29sbGlzaW9ucygpXG5cblx0XG5cdFx0XHRcblxuXHRhZGQ6IChnYW1lT2JqZWN0KS0+XG5cdFx0aWYgZ2FtZU9iamVjdCBpbnN0YW5jZW9mIENvbGxpc2lvbk9iamVjdFxuXHRcdFx0QGNvbGxpZGVycy5wdXNoIGdhbWVPYmplY3QgXG5cdFx0cmV0dXJuIHN1cGVyKGdhbWVPYmplY3QpXG5cblx0cmVtb3ZlOiAoZ2FtZU9iamVjdCktPlxuXHRcdGkgPSAgQGNvbGxpZGVycy5pbmRleE9mKGdhbWVPYmplY3QpXG5cdFx0aWYgaSA+PSAwXG5cdFx0XHRAY29sbGlkZXJzLnNwbGljZShpLCAxKTtcblxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cblxuXG5cdGNvbGxpc2lvbnM6ICgpLT5cblx0XHRmb3IgYSBpbiBAY29sbGlkZXJzXG5cdFx0XHRpZiBhLmFjdGl2ZVxuXHRcdFx0XHRmb3IgYiBpbiBAY29sbGlkZXJzXG5cdFx0XHRcdFx0aWYgYi5hY3RpdmVcblx0XHRcdFx0XHRcdGlmIGEuY29sbGlkZXJIaXRUeXBlcy5pbmRleE9mKGIuY29sbGlkZXJUeXBlKSA+IC0xXG5cdFx0XHRcdFx0XHRcdGlmIEB0ZXN0Q29sbGlzaW9uIGEsIGJcblx0XHRcdFx0XHRcdFx0XHRhLmNvbGxpZGVJbnRvIGJcblxuXHR0ZXN0Q29sbGlzaW9uOiAoYSwgYiktPlxuXHRcdHJldHVybiBhLnJvb3QucG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoYi5yb290LnBvc2l0aW9uKSA8IGEuY29sbGlzaW9uUmFkaXVzICsgYi5jb2xsaXNpb25SYWRpdXNcblxuXG5cbmNsYXNzIEhvbWVTY3JlZW4gZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3NjcmVlbnMvdGl0bGUucG5nXCJcblx0bWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogdGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcdFx0c2hhZGluZzogVEhSRUUuTm9TaGFkaW5nXG5cdFx0XHR0cmFuc3BhcmVudDogdHJ1ZVxuXHRcblx0Z2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMjAsIDE1KVxuXHRjb25zdHJ1Y3RvcjogKCktPlxuXHRcdHN1cGVyKClcblx0XHRAcm9vdC5hZGQgbmV3IFRIUkVFLk1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG5cbmNsYXNzIEdhbWVPdmVyU2NyZWVuIGV4dGVuZHMgR2FtZU9iamVjdFxuXHR0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9zY3JlZW5zL2dhbWVfb3Zlci5wbmdcIlxuXHRtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0bWFwOiB0ZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFx0XHRzaGFkaW5nOiBUSFJFRS5Ob1NoYWRpbmdcblx0XHRcdHRyYW5zcGFyZW50OiB0cnVlXG5cdFxuXHRnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCAyMCwgMTUpXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBnZW9tZXRyeSwgbWF0ZXJpYWxcblxuXG5cbmNsYXNzIEdhbWVcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHQjc2V0dXAgd29ybGRcblx0XHRAd29ybGQgPSBuZXcgV29ybGQoKVxuXHRcdEBob21lU2NyZWVuID0gbmV3IEhvbWVTY3JlZW4oKVxuXHRcdEBnYW1lT3ZlclNjcmVlbiA9IG5ldyBHYW1lT3ZlclNjcmVlbigpXG5cdFx0QGxvYWRMZXZlbCgpXG5cdFx0QGxpdmVzID0gM1xuXG5cdFx0U2NvcmUuZGlzcGxheUVsZW1lbnQgPSAkKFwiXCJcIjxoMT5TY29yZTo8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdEBsaXZlc0VsZW1lbnQgPSAkKFwiXCJcIjxoMT5MaXZlczo8L2gxPlwiXCJcIikuYXBwZW5kVG8gJChcIiNzaHVtcFwiKVxuXHRcdFxuXHRcdFxuXHRcdEBzdGF0ZSA9IFwiaG9tZVwiXG5cdFx0QHdvcmxkLnNjZW5lLmFkZCBAaG9tZVNjcmVlbi5yb290XG5cblxuXHRcdCQod2luZG93KS5rZXlkb3duIChlKT0+XG5cdFx0XHRpZiBAc3RhdGUgPT0gXCJob21lXCJcblx0XHRcdFx0QHdvcmxkLnNjZW5lLnJlbW92ZSBAaG9tZVNjcmVlbi5yb290XG5cdFx0XHRcdEBzdGF0ZSA9IFwicGxheVwiXG5cdFx0XHRcdEBzdGFydExldmVsKClcblx0XHRcdFx0cmV0dXJuXG5cblx0XHRcdGlmIEBzdGF0ZSA9PSBcImdhbWVfb3ZlclwiXG5cdFx0XHRcdEB3b3JsZC5zY2VuZS5yZW1vdmUgQGdhbWVPdmVyU2NyZWVuLnJvb3Rcblx0XHRcdFx0QHdvcmxkLnNjZW5lLmFkZCBAaG9tZVNjcmVlbi5yb290XG5cdFx0XHRcdEBzdGF0ZSA9IFwiaG9tZVwiXG5cdFx0XHRcdHJldHVyblxuXG5cdFx0dXRpbC5hZnRlciAxLCAoKT0+XG5cdFx0XHRAd29ybGQuc3RhcnQoKVxuXG5cdGxvYWRMZXZlbDogKCktPlxuXHRcdEB3b3JsZC5jYW1lcmEucG9zaXRpb24ueCA9IDA7XG5cdFx0QGxldmVsID0gbmV3IExldmVsKEB3b3JsZClcblx0XG5cdHN0YXJ0TGV2ZWw6ICgpLT5cblx0XHRAd29ybGQuc2NlbmUuYWRkIEBsZXZlbC5yb290XG5cdFx0QHdvcmxkLm9uIFwidXBkYXRlXCIsIEBsZXZlbC51cGRhdGVcblx0XHRcblx0cmVzZXRQbGF5ZXI6ICgpPT5cblx0XHRAbGl2ZXMtLVxuXHRcdEBsaXZlc0VsZW1lbnQudGV4dCBcIkxpdmVzOiAje0BsaXZlc31cIlxuXG5cdFx0aWYgQGxpdmVzID4gMFxuXHRcdFx0QGxldmVsLnBsYXllcjEgPSBuZXcgUGxheWVyKClcblx0XHRcdEBsZXZlbC5wbGF5ZXIxLnJvb3QucG9zaXRpb24ueCA9IEB3b3JsZC5jYW1lcmEucG9zaXRpb24ueFxuXHRcdFx0QGxldmVsLmFkZCBAbGV2ZWwucGxheWVyMVxuXHRcdGVsc2Vcblx0XHRcdHV0aWwuYWZ0ZXIgMjAwMCwgQGdhbWVPdmVyXG5cblx0Z2FtZU92ZXI6ICgpPT5cblx0XHRjb25zb2xlLmxvZyBcImdhbWUgb3ZlclwiXG5cdFx0XG5cdFx0QHdvcmxkLnNjZW5lLnJlbW92ZSBAbGV2ZWwucm9vdFxuXHRcdEB3b3JsZC5vZmYgXCJ1cGRhdGVcIiwgQGxldmVsLnVwZGF0ZVxuXG5cdFx0QGxvYWRMZXZlbCgpXG5cdFx0QHdvcmxkLnNjZW5lLmFkZCBAZ2FtZU92ZXJTY3JlZW4ucm9vdFxuXHRcdEBzdGF0ZSA9IFwiZ2FtZV9vdmVyXCJcblxuXG5tb2R1bGUuZXhwb3J0cy5nYW1lID0gZ2FtZSA9IG5ldyBHYW1lKClcblxuXHRcdFxuXG4jIG1vZGVsTG9hZGVyID0gbmV3IGNvcmUuTW9kZWxMb2FkZXIoKVxuXG5cblx0XHRcdFxuXG5cbiIsImV4cG9ydHMuYWZ0ZXIgPSAoZGVsYXksIGZ1bmMpLT5cblx0c2V0VGltZW91dCBmdW5jLCBkZWxheVxuXG5leHBvcnRzLnJhbmRvbSA9IChtaW4sIG1heCktPlxuXHRyZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuIl19
