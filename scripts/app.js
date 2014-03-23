(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var level, shump, updateDebug;

shump = require('./shump.coffee');

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

world.start();

window.level = level;


},{"./shump.coffee":2}],2:[function(require,module,exports){
var Bullet, CollisionObject, Enemy, GameObject, Level, Player, core, input, modelLoader, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

core = require('./shump_core.coffee');

util = require('./util.coffee');

GameObject = (function() {
  function GameObject() {
    this.update = __bind(this.update, this);
    this.parent = void 0;
    this.children = [];
    this.root = new THREE.Object3D();
    this.dead = false;
    this.active = true;
    this.age = 0;
  }

  GameObject.prototype.update = function(delta) {
    var child, i, _i, _ref, _results;
    this.age += delta;
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
    this.root.position.setX(-11);
    world.camera.position.setX(-11);
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
    side: THREE.DoubleSide
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
      return this.parent.remove(this);
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
    side: THREE.DoubleSide
  });

  enemyGeometry = new THREE.PlaneGeometry(1, 1);

  function Enemy(position) {
    Enemy.__super__.constructor.call(this);
    this.colliderType = "enemy";
    this.colliderHitTypes.push("player");
    this.root.add(new THREE.Mesh(enemyGeometry, enemyMaterial));
    this.root.position.copy(position);
  }

  Enemy.prototype.update = function(delta) {
    Enemy.__super__.update.call(this, delta);
    this.root.position.x += -1 * delta;
    return this.root.position.y += delta * Math.sin(this.age);
  };

  return Enemy;

})(CollisionObject);

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
    var enemy, o, _i, _len, _ref, _results;
    this.data = data;
    console.log(this.data);
    _ref = data.layers[0].objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      o = _ref[_i];
      enemy = new Enemy(new THREE.Vector3(o.x / 32, 7 - o.y / 32, 0));
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
      if (child.root.position.x < world.camera.position.x + 10) {
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


},{"./shump_core.coffee":3,"./util.coffee":4}],3:[function(require,module,exports){
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
    console.log(targetZ);
    this.camera.position.z = targetZ;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.CanvasRenderer();
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

module.exports.Base = Base;

module.exports.World = World;

module.exports.Model = Model;

module.exports.ModelLoader = ModelLoader;

module.exports.Input = Input;


},{}],4:[function(require,module,exports){
module.exports.after = function(delay, func) {
  return setTimeout(func, delay);
};

module.exports.random = function(min, max) {
  return Math.random() * (max - min) + min;
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL21haW4uY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy9zaHVtcC5jb2ZmZWUiLCIvVXNlcnMvamJha3NlL0RvY3VtZW50cy9wcm9qZWN0cy9zaHVtcC9zY3JpcHRzL3NodW1wX2NvcmUuY29mZmVlIiwiL1VzZXJzL2piYWtzZS9Eb2N1bWVudHMvcHJvamVjdHMvc2h1bXAvc2NyaXB0cy91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEseUJBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxnQkFBUixDQUFSLENBQUE7O0FBQUEsT0FDTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQXFCLEtBQXJCLENBREEsQ0FBQTs7QUFBQSxDQUdBLENBQUUsUUFBRixDQUFXLENBQUMsTUFBWixDQUFtQiw2QkFBbkIsQ0FIQSxDQUFBOztBQUFBLFdBS0EsR0FBYyxTQUFBLEdBQUE7U0FDYixDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUE0QixtQkFBQSxHQUFrQixLQUFLLENBQUMsUUFBUSxDQUFDLE1BQTdELEVBRGE7QUFBQSxDQUxkLENBQUE7O0FBQUEsTUFVTSxDQUFDLEtBQVAsR0FBbUIsSUFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQVgsQ0FBQSxDQVZuQixDQUFBOztBQUFBLEtBV0EsR0FBWSxJQUFBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FYWixDQUFBOztBQUFBLEtBYUssQ0FBQyxLQUFL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LENBQUMsS0FBZixHQUF1QixTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7U0FDdEIsVUFBQSxDQUFXLElBQVgsRUFBaUIsS0FBakIsRUFEc0I7QUFBQSxDQUF2QixDQUFBOztBQUFBLE1BR00sQ0FBQyxPQUFPLENBQUMsTUFBZixHQUF3QixTQUFDLEdBQUQsRUFBTSxHQUFOLEdBQUE7QUFDdkIsU0FBTyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsQ0FBQyxHQUFBLEdBQU0sR0FBUCxDQUFoQixHQUE4QixHQUFyQyxDQUR1QjtBQUFBLENBSHhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInNodW1wID0gcmVxdWlyZSgnLi9zaHVtcC5jb2ZmZWUnKTtcbmNvbnNvbGUubG9nIFwic2h1bXBcIiwgc2h1bXBcblxuJChcIiNkZWJ1Z1wiKS5hcHBlbmQoXCJcIlwiPHNwYW4gaWQ9XCJsZXZlbENoaWxkcmVuXCI+XCJcIlwiKVxuXG51cGRhdGVEZWJ1ZyA9ICgpLT5cblx0JChcIiNsZXZlbENoaWxkcmVuXCIpLnRleHQgXCJcIlwibGV2ZWwuY2hpbGRyZW4gPSAje2xldmVsLmNoaWxkcmVuLmxlbmd0aH1cIlwiXCJcblxuXG4jc2V0dXAgd29ybGRcbndpbmRvdy53b3JsZCA9IG5ldyBzaHVtcC5jb3JlLldvcmxkKClcbmxldmVsID0gbmV3IHNodW1wLkxldmVsKClcblxud29ybGQuc2NlbmUuYWRkIGxldmVsLnJvb3RcbndvcmxkLm9uIFwidXBkYXRlXCIsIGxldmVsLnVwZGF0ZVxud29ybGQub24gXCJ1cGRhdGVcIiwgdXBkYXRlRGVidWdcblxuY29uc29sZS5sb2cgXCJsZXZlbFwiLCBsZXZlbFxuI2JlZ2luXG53b3JsZC5zdGFydCgpXG5cblxud2luZG93LmxldmVsID0gbGV2ZWxcblxuIiwiY29yZSA9IHJlcXVpcmUgJy4vc2h1bXBfY29yZS5jb2ZmZWUnXG51dGlsID0gcmVxdWlyZSAnLi91dGlsLmNvZmZlZSdcblxuY2xhc3MgR2FtZU9iamVjdFxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAcGFyZW50ID0gdW5kZWZpbmVkXG5cdFx0QGNoaWxkcmVuID0gW11cblx0XHRAcm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG5cdFx0QGRlYWQgPSBmYWxzZVxuXHRcdEBhY3RpdmUgPSB0cnVlXG5cdFx0QGFnZSA9IDBcblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdEBhZ2UgKz0gZGVsdGFcblx0XHRmb3IgaSBpbiBbQGNoaWxkcmVuLmxlbmd0aC0xLi4wXSBieSAtMVxuXHRcdFx0Y2hpbGQgPSBAY2hpbGRyZW5baV1cblx0XHRcdGlmIGNoaWxkLmRlYWRcblx0XHRcdFx0QHJlbW92ZSBjaGlsZFxuXHRcdFx0XHRjb250aW51ZVxuXHRcdFx0aWYgY2hpbGQuYWN0aXZlXG5cdFx0XHRcdGNoaWxkLnVwZGF0ZSBkZWx0YSBcblx0XG5cdGFjdGl2YXRlOiAoKS0+XG5cdFx0QGFjdGl2ZSA9IHRydWU7XG5cdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gdGhpc1xuXHRcdEBjaGlsZHJlbi5wdXNoKGdhbWVPYmplY3QpXG5cdFx0QHJvb3QuYWRkKGdhbWVPYmplY3Qucm9vdClcblx0XHRyZXR1cm4gZ2FtZU9iamVjdFxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRAcm9vdC5yZW1vdmUoZ2FtZU9iamVjdC5yb290KVxuXHRcdGdhbWVPYmplY3QucGFyZW50ID0gbnVsbFxuXHRcdGkgPSAgQGNoaWxkcmVuLmluZGV4T2YoZ2FtZU9iamVjdClcblx0XHRpZiBpID49IDBcblx0XHRcdEBjaGlsZHJlbi5zcGxpY2UoaSwgMSk7XG5cdFx0cmV0dXJuIGdhbWVPYmplY3RcblxuXHRkaWU6ICgpLT5cblx0XHRAZGVhZCA9IHRydWU7XG5cdFxuXG5jbGFzcyBDb2xsaXNpb25PYmplY3QgZXh0ZW5kcyBHYW1lT2JqZWN0XG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdEBjb2xsaWRlclR5cGUgPSB1bmRlZmluZWRcblx0XHRAY29sbGlkZXJIaXRUeXBlcyA9IFtdXG5cblx0Y29sbGlkZVdpdGg6IChnYW1lT2JqZWN0KS0+XG5cdFx0QGRpZSgpXG5cdFx0Z2FtZU9iamVjdC5kaWUoKVxuXG5cdFxuXG5cbmNsYXNzIFBsYXllciBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEByb290LnBvc2l0aW9uLnNldFgoLTExKTtcblx0XHR3b3JsZC5jYW1lcmEucG9zaXRpb24uc2V0WCgtMTEpO1xuXHRcdEBjb2xsaWRlclR5cGUgPSBcInBsYXllclwiXG5cdFx0QGNvbGxpZGVySGl0VHlwZXMucHVzaCBcIlwiXG5cblxuXHRcdEByb290LmFkZCBtb2RlbExvYWRlci5sb2FkKFwiYXNzZXRzL3NoaXAuanNcIilcblx0XHRAbGFzdEZpcmUgPSBEYXRlLm5vdygpXG5cblxuXHR1cGRhdGU6IChkZWx0YSk9PlxuXHRcdGlmIGlucHV0LmtleVN0YXRlc1sndXAnXVxuXHRcdFx0QHJvb3QucG9zaXRpb24ueSArPSAxMCAqIGRlbHRhO1xuXHRcdGlmIGlucHV0LmtleVN0YXRlc1snZG93biddXG5cdFx0XHRAcm9vdC5wb3NpdGlvbi55IC09IDEwICogZGVsdGE7XG5cdFx0aWYgaW5wdXQua2V5U3RhdGVzWydsZWZ0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggLT0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ3JpZ2h0J11cblx0XHRcdEByb290LnBvc2l0aW9uLnggKz0gMTAgKiBkZWx0YTtcblx0XHRpZiBpbnB1dC5rZXlTdGF0ZXNbJ2ZpcmVfcHJpbWFyeSddXG5cdFx0XHRAZmlyZV9wcmltYXJ5KClcblxuXHRmaXJlX3ByaW1hcnk6ICgpLT5cblx0XHRpZiBEYXRlLm5vdygpID4gQGxhc3RGaXJlICsgMjQwIFxuXHRcdFx0QGxhc3RGaXJlID0gRGF0ZS5ub3coKVxuXHRcdFx0YnVsbGV0ID0gbmV3IEJ1bGxldChAcm9vdC5wb3NpdGlvbilcblx0XHRcdEBwYXJlbnQuYWRkIGJ1bGxldFxuXHRcdFx0IyBAcGFyZW50LmNvbGxpZGVycy5wdXNoIGJ1bGxldFxuXG5cdGRpZTogKCktPlxuXHRcdCMgY29uc29sZS5sb2cgXCJkaWVcIlxuXG5cbmNsYXNzIEJ1bGxldCBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRidWxsZXRUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBcImFzc2V0cy9idWxsZXQucG5nXCJcblx0YnVsbGV0TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogYnVsbGV0VGV4dHVyZVxuXHRcdFx0c2lkZTogVEhSRUUuRG91YmxlU2lkZVxuXHRcblx0YnVsbGV0R2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMSwgMSk7XG5cblx0Y29uc3RydWN0b3I6IChwb3NpdGlvbiktPlxuXHRcdHN1cGVyKClcblx0XHRAY29sbGlkZXJUeXBlID0gXCJidWxsZXRcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJlbmVteVwiXG5cdFx0XG5cdFx0QGJpcnRoID0gRGF0ZS5ub3coKVxuXHRcdEB0aW1lVG9MaXZlID0gMTAwMFxuXHRcdEByb290LmFkZCBuZXcgVEhSRUUuTWVzaCBidWxsZXRHZW9tZXRyeSwgYnVsbGV0TWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cdHVwZGF0ZTogKCktPlxuXHRcdEByb290LnBvc2l0aW9uLnggKz0gLjI1XG5cdFx0aWYgRGF0ZS5ub3coKSA+IEBiaXJ0aCArIEB0aW1lVG9MaXZlXG5cdFx0XHRAcGFyZW50LnJlbW92ZSh0aGlzKVxuXG5jbGFzcyBFbmVteSBleHRlbmRzIENvbGxpc2lvbk9iamVjdFxuXHRlbmVteVRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL2VuZW15LnBuZ1wiXG5cdGVuZW15TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWxcblx0XHRcdG1hcDogZW5lbXlUZXh0dXJlXG5cdFx0XHRzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG5cdFxuXHRlbmVteUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDEsIDEpO1xuXG5cdGNvbnN0cnVjdG9yOiAocG9zaXRpb24pLT5cblx0XHRzdXBlcigpXG5cdFx0QGNvbGxpZGVyVHlwZSA9IFwiZW5lbXlcIlxuXHRcdEBjb2xsaWRlckhpdFR5cGVzLnB1c2ggXCJwbGF5ZXJcIlxuXG5cdFx0QHJvb3QuYWRkIG5ldyBUSFJFRS5NZXNoIGVuZW15R2VvbWV0cnksIGVuZW15TWF0ZXJpYWxcblx0XHRAcm9vdC5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuXG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHRAcm9vdC5wb3NpdGlvbi54ICs9IC0xICogZGVsdGFcblx0XHRAcm9vdC5wb3NpdGlvbi55ICs9IGRlbHRhICogTWF0aC5zaW4oQGFnZSlcblx0XHQjIHN1cGVyKGRlbHRhKVxuXHRcdCMgaWYgQGFnZSA8IDFcblx0XHQjIFx0QHJvb3QucG9zaXRpb24ueCArPSAtNSAqIGRlbHRhXG5cdFx0IyBlbHNlIGlmIEBhZ2UgPCAyXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnkgKz0gLTUgKiBkZWx0YVxuXHRcdCMgZWxzZSBpZiBAYWdlIDwgMi4xXG5cdFx0IyBcdEByb290LnBvc2l0aW9uLnggKz0gNSAqIGRlbHRhXG5cdFx0IyBlbHNlXG5cdFx0IyBcdEBkaWUoKVxuXG5jbGFzcyBMZXZlbCBleHRlbmRzIEdhbWVPYmplY3Rcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0c3VwZXIoKVxuXHRcdFxuXHRcdEBjb2xsaWRlcnMgPSBbXVxuXG5cdFx0QGFtYmllbnRMaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuXHRcdEByb290LmFkZChAYW1iaWVudExpZ2h0KTtcdFx0XG5cblx0XHRAcGxheWVyMSA9IG5ldyBQbGF5ZXIoKVxuXHRcdEBhZGQgQHBsYXllcjFcblxuXHRcdCMgYUByb290LmFkZCBtb2RlbExvYWRlci5sb2FkKFwiYXNzZXRzL2dyaWRfY3ViZS5qc1wiKVxuXHRcdEBsYXN0RW5lbXkgPSBEYXRlLm5vdygpXG5cblx0XHQkLmdldEpTT04gXCJhc3NldHMvbGV2ZWxfMS5qc29uXCIsIEBvbkxvYWRcblx0XHRcdFxuXG5cdG9uTG9hZDogKGRhdGEpPT5cblx0XHRAZGF0YSA9IGRhdGFcblx0XHRjb25zb2xlLmxvZyBAZGF0YVxuXHRcdGZvciBvIGluIGRhdGEubGF5ZXJzWzBdLm9iamVjdHMgXG5cdFx0XHRlbmVteSA9IG5ldyBFbmVteShuZXcgVEhSRUUuVmVjdG9yMyhvLnggLyAzMiwgNyAtIG8ueSAvIDMyLCAwKSlcblx0XHRcdGVuZW15LmFjdGl2ZSA9IGZhbHNlXG5cdFx0XHRAYWRkIGVuZW15XG5cblx0dXBkYXRlOiAoZGVsdGEpLT5cblx0XHRzdXBlcihkZWx0YSlcblx0XHR3b3JsZC5jYW1lcmEucG9zaXRpb24ueCArPSAxICogZGVsdGFcblx0XHRAcGxheWVyMS5yb290LnBvc2l0aW9uLnggKz0gMSAqIGRlbHRhXG5cblx0XHRmb3IgY2hpbGQgaW4gQGNoaWxkcmVuXG5cdFx0XHRpZiBjaGlsZC5yb290LnBvc2l0aW9uLnggPCB3b3JsZC5jYW1lcmEucG9zaXRpb24ueCArIDEwXG5cdFx0XHRcdGNoaWxkLmFjdGl2YXRlKClcblxuXHRcdEBjb2xsaXNpb25zKClcblxuXHRcdCMgaWYgRGF0ZS5ub3coKSA+IEBsYXN0RW5lbXkgKyAxMDBcblx0XHQjIFx0QGxhc3RFbmVteSA9IERhdGUubm93KClcblx0XHQjIFx0ZW5lbXkgPSBuZXcgRW5lbXkoQHJvb3QucG9zaXRpb24uY2xvbmUoKS5zZXRYKDE1KS5zZXRZKHV0aWwucmFuZG9tKC0xMCwgMTApKSlcblx0XHQjIFx0QGFkZCBlbmVteVxuXHRcdFx0XG5cblx0YWRkOiAoZ2FtZU9iamVjdCktPlxuXHRcdGlmIGdhbWVPYmplY3QgaW5zdGFuY2VvZiBDb2xsaXNpb25PYmplY3Rcblx0XHRcdEBjb2xsaWRlcnMucHVzaCBnYW1lT2JqZWN0IFxuXHRcdHJldHVybiBzdXBlcihnYW1lT2JqZWN0KVxuXG5cdHJlbW92ZTogKGdhbWVPYmplY3QpLT5cblx0XHRpID0gIEBjb2xsaWRlcnMuaW5kZXhPZihnYW1lT2JqZWN0KVxuXHRcdGlmIGkgPj0gMFxuXHRcdFx0QGNvbGxpZGVycy5zcGxpY2UoaSwgMSk7XG5cblx0XHRyZXR1cm4gc3VwZXIoZ2FtZU9iamVjdClcblxuXG5cblxuXHRjb2xsaXNpb25zOiAoKS0+XG5cdFx0Zm9yIGEgaW4gQGNvbGxpZGVyc1xuXHRcdFx0aWYgYS5hY3RpdmVcblx0XHRcdFx0Zm9yIGIgaW4gQGNvbGxpZGVyc1xuXHRcdFx0XHRcdGlmIGIuYWN0aXZlXG5cdFx0XHRcdFx0XHRpZiBhLmNvbGxpZGVySGl0VHlwZXMuaW5kZXhPZihiLmNvbGxpZGVyVHlwZSkgPiAtMVxuXHRcdFx0XHRcdFx0XHRpZiBAdGVzdENvbGxpc2lvbiBhLCBiXG5cdFx0XHRcdFx0XHRcdFx0YS5jb2xsaWRlV2l0aCBiXG5cblx0dGVzdENvbGxpc2lvbjogKGEsIGIpLT5cblx0XHRyZXR1cm4gYS5yb290LnBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKGIucm9vdC5wb3NpdGlvbikgPCAxXG5cblxuXHRcdFxuXG5tb2RlbExvYWRlciA9IG5ldyBjb3JlLk1vZGVsTG9hZGVyKClcbmlucHV0ID0gbmV3IGNvcmUuSW5wdXQoKVxuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzLkxldmVsID0gTGV2ZWxcbm1vZHVsZS5leHBvcnRzLmNvcmUgPSBjb3JlXG4iLCJjbGFzcyBCYXNlXG5cdGNvbnN0cnVjdG9yOiAoKS0+XG5cdFx0QF9ldmVudHMgPSB7fVxuXG5cdG9uOiAoZXZlbnQsIGhhbmRsZXIpIC0+XG5cdFx0KEBfZXZlbnRzW2V2ZW50XSA/PSBbXSkucHVzaCBoYW5kbGVyXG5cdFx0dGhpc1xuXG5cdG9mZjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuXHRcdGZvciBzdXNwZWN0LCBpbmRleCBpbiBAX2V2ZW50c1tldmVudF0gd2hlbiBzdXNwZWN0IGlzIGhhbmRsZXJcblx0XHRcdEBfZXZlbnRzW2V2ZW50XS5zcGxpY2UgaW5kZXgsIDFcblx0XHR0aGlzXG5cblx0dHJpZ2dlcjogKGV2ZW50LCBhcmdzLi4uKSA9PlxuXHRcdHJldHVybiB0aGlzIHVubGVzcyBAX2V2ZW50c1tldmVudF0/XG5cdFx0Zm9yIGkgaW4gW0BfZXZlbnRzW2V2ZW50XS5sZW5ndGgtMS4uMF0gYnkgLTFcblx0XHRcdGhhbmRsZXIgPSBAX2V2ZW50c1tldmVudF1baV1cblx0XHRcdGhhbmRsZXIuYXBwbHkgdGhpcywgYXJnc1xuXG5cdFx0dGhpc1xuXG5cbmNsYXNzIFdvcmxkIGV4dGVuZHMgQmFzZVxuXHRcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0c3VwZXIoKVxuXG5cdFx0dyA9IDY0MFxuXHRcdGggPSA0ODBcblx0XHRAY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCB3IC8gaCwgMSwgMTAwMDApXG5cdFx0Zm92X3JhZGlhbnMgPSA0NSAqIChNYXRoLlBJIC8gMTgwKVxuXG5cdFx0dGFyZ2V0WiA9IDQ4MCAvICgyICogTWF0aC50YW4oZm92X3JhZGlhbnMgLyAyKSApIC8gMzIuMDtcblxuXHRcdGNvbnNvbGUubG9nIHRhcmdldFpcblx0XHRAY2FtZXJhLnBvc2l0aW9uLnogPSB0YXJnZXRaXG5cdFx0XG5cdFx0QHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcblx0XHRcblx0XHRAcmVuZGVyZXIgPSBuZXcgVEhSRUUuQ2FudmFzUmVuZGVyZXIoKVxuXHRcdEByZW5kZXJlci5zZXRTaXplIHcsIGhcblx0XHQkKFwiI3NodW1wXCIpWzBdLmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cblx0XHRAY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKVxuXHRcdEBzdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnXG5cdFx0JChcIiNzaHVtcFwiKVswXS5hcHBlbmRDaGlsZCggQHN0YXRzLmRvbUVsZW1lbnQgKVxuXG5cdFx0cmV0dXJuIHRoaXNcblxuXHRhbmltYXRlOiA9PlxuXHRcdGRlbHRhID0gQGNsb2NrLmdldERlbHRhKClcdFx0XG5cdFx0I2Rvbid0IHVwZGF0ZSBhZnRlciBsb25nIGZyYW1lIChmaXhlcyBpc3N1ZSB3aXRoIHN3aXRjaGluZyB0YWJzKVxuXHRcdGlmIChkZWx0YSA8IC41KSBcblx0XHRcdEB0cmlnZ2VyIFwidXBkYXRlXCIsIGRlbHRhXG5cblx0XHRAcmVuZGVyZXIucmVuZGVyIEBzY2VuZSwgQGNhbWVyYVxuXHRcdEBzdGF0cy51cGRhdGUoKVxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSBAYW5pbWF0ZVxuXHRcdHJldHVyblxuXG5cdHN0YXJ0OiAtPlxuXHRcdEBhbmltYXRlKClcblxuXG5jbGFzcyBNb2RlbCBleHRlbmRzIEJhc2Vcblx0Y29uc3RydWN0b3I6IChAZ2VvbWV0cnksIEBtYXRlcmlhbCktPlxuXHRcdHN1cGVyKClcblx0XHRAbWF0ZXJpYWwgPSB1bmRlZmluZWRcblx0XHRAZ2VvbWV0cnkgPSB1bmRlZmluZWRcblx0XHRAdGV4dHVyZSA9IHVuZGVmaW5lZFxuXHRcdEBzdGF0dXMgPSB1bmRlZmluZWRcblxuXHRsb2FkOiAoZmlsZU5hbWUpPT5cblx0XHRqc29uTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcblx0XHRqc29uTG9hZGVyLmxvYWQgZmlsZU5hbWUsIChnZW9tZXRyeSwgbWF0ZXJpYWxzLCBvdGhlcnMuLi4pPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKCBtYXRlcmlhbHMgKVxuXHRcdFx0IyBAbWF0ZXJpYWwgPSBtYXRlcmlhbHNbMF1cblx0XHRcdEBnZW9tZXRyeSA9IGdlb21ldHJ5XG5cdFx0XHRAc3RhdHVzID0gXCJyZWFkeVwiXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5cdGxvYWRQbmc6IChmaWxlTmFtZSk9PlxuXHRcdEB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSBmaWxlTmFtZSwge30sICgpPT5cblx0XHRcdEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXHRcdFx0XHQjIHRyYW5zcGFyZW50OiB0cnVlXG5cdFx0XHRcdCMgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcblx0XHRcdFx0bWFwOiBAdGV4dHVyZVxuXHRcdFx0XHQjIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcblx0XHRcdEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5IDEsIDFcblx0XHRcdEBzdGF0dXMgPSBcInJlYWR5XCJcblx0XHRcdGNvbnNvbGUubG9nIFwibG9hZHBuZ1wiLCB0aGlzXG5cdFx0XHRAdHJpZ2dlciBcInN1Y2Nlc3NcIiwgdGhpc1xuXG5jbGFzcyBNb2RlbExvYWRlclxuXHRcblx0Y29uc3RydWN0b3I6ICgpLT5cblx0XHRAZGVmYXVsdEdlb21ldHJ5ID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSgxLDEsMSlcblx0XHRAZGVmYXVsdE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cdFx0XHRjb2xvcjogMHgwMGZmMDBcblx0XHRcdHdpcmVmcmFtZTogdHJ1ZVxuXHRcdFx0bWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlIFwiYXNzZXRzL3doaXRlLnBuZ1wiXG5cblx0XHRAbG9hZGVkTW9kZWxzID0ge31cblxuXHRsb2FkOiAoZmlsZU5hbWUpLT5cblxuXHRcdCMgaWYgYWxyZWFkeSBsb2FkZWQsIGp1c3QgbWFrZSB0aGUgbmV3IG1lc2ggYW5kIHJldHVyblxuXHRcdGlmIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdPyAmJiBAbG9hZGVkTW9kZWxzW2ZpbGVOYW1lXS5zdGF0dXMgPT0gXCJyZWFkeVwiXG5cdFx0XHRjb25zb2xlLmxvZyBcImNhY2hlZFwiXG5cdFx0XHRyZXR1cm4gbmV3IFRIUkVFLk1lc2goQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV0uZ2VvbWV0cnksIEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdLm1hdGVyaWFsKVxuXG5cblx0XHQjIGlmIHJlcXVlc3RlZCBidXQgbm90IHJlYWR5XG5cdFx0aWYgQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcdG1vZGVsID0gQGxvYWRlZE1vZGVsc1tmaWxlTmFtZV1cblx0XHRcblx0XHQjIGlmIG5vdCByZXF1ZXN0ZWQgYmVmb3JlXG5cdFx0ZWxzZVxuXHRcdFx0bW9kZWwgPSBuZXcgTW9kZWwoKVxuXHRcdFx0aWYgZmlsZU5hbWUuc3BsaXQoJy4nKS5wb3AoKSA9PSBcImpzXCJcblx0XHRcdFx0bW9kZWwubG9hZChmaWxlTmFtZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0bW9kZWwubG9hZFBuZyhmaWxlTmFtZSlcblx0XHRcdEBsb2FkZWRNb2RlbHNbZmlsZU5hbWVdID0gbW9kZWxcblxuXHRcdG9iamVjdCA9IG5ldyBUSFJFRS5NZXNoKCBAZGVmYXVsdEdlb21ldHJ5LCBAZGVmYXVsdE1hdGVyaWFsIClcblx0XHRtb2RlbC5vbiBcInN1Y2Nlc3NcIiwgKG0pLT5cblx0XHRcdG9iamVjdC5nZW9tZXRyeSA9IG0uZ2VvbWV0cnlcdFx0XHRcblx0XHRcdG9iamVjdC5tYXRlcmlhbCA9IG0ubWF0ZXJpYWxcblx0XHRcdG0ub2ZmIFwic3VjY2Vzc1wiLCBhcmd1bWVudHMuY2FsbGVlICNyZW1vdmUgdGhpcyBoYW5kbGVyIG9uY2UgdXNlZFxuXHRcdHJldHVybiBvYmplY3RcblxuY2xhc3MgSW5wdXRcblx0a2V5TWFwOiBcblx0XHRcIjM4XCI6XCJ1cFwiXG5cdFx0XCI4N1wiOlwidXBcIiAjd1xuXHRcdFwiNDBcIjpcImRvd25cIlxuXHRcdFwiODNcIjpcImRvd25cIiAjc1xuXHRcdFwiMzdcIjpcImxlZnRcIlxuXHRcdFwiNjVcIjpcImxlZnRcIiAjYVxuXHRcdFwiMzlcIjpcInJpZ2h0XCJcblx0XHRcIjY4XCI6XCJyaWdodFwiICNkXG5cdFx0XCIzMlwiOlwiZmlyZV9wcmltYXJ5XCIgI3NwYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGtleVN0YXRlcyA9IFtdXG5cblx0XHRmb3Iga2V5LCB2YWx1ZSBvZiBAa2V5TWFwXG5cdFx0XHRAa2V5U3RhdGVzW3ZhbHVlXSA9IGZhbHNlO1xuXG5cdFx0JCh3aW5kb3cpLmtleWRvd24gKGUpPT5cblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IHRydWU7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cblx0XHQkKHdpbmRvdykua2V5dXAgKGUpPT5cblx0XHRcdGlmIEBrZXlNYXBbZS53aGljaF1cblx0XHRcdFx0QGtleVN0YXRlc1tAa2V5TWFwW2Uud2hpY2hdXSA9IGZhbHNlO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXG5tb2R1bGUuZXhwb3J0cy5CYXNlID0gQmFzZVxubW9kdWxlLmV4cG9ydHMuV29ybGQgPSBXb3JsZFxubW9kdWxlLmV4cG9ydHMuTW9kZWwgPSBNb2RlbFxubW9kdWxlLmV4cG9ydHMuTW9kZWxMb2FkZXIgPSBNb2RlbExvYWRlclxubW9kdWxlLmV4cG9ydHMuSW5wdXQgPSBJbnB1dFxuIiwibW9kdWxlLmV4cG9ydHMuYWZ0ZXIgPSAoZGVsYXksIGZ1bmMpLT5cblx0c2V0VGltZW91dCBmdW5jLCBkZWxheVxuXG5tb2R1bGUuZXhwb3J0cy5yYW5kb20gPSAobWluLCBtYXgpLT5cblx0cmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiJdfQ==
