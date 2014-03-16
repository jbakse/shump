(function() {
  var Base, GameObject, Input, Level, Model, ModelLoader, Player, World, after, input, level, modelLoader, world,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  after = function(delay, func) {
    return setTimeout(func, delay);
  };

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
      var args, event, handler, _i, _len, _ref;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (this._events[event] == null) {
        return this;
      }
      _ref = this._events[event].slice(0);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        handler.apply(this, args);
      }
      return this;
    };

    return Base;

  })();

  World = (function(_super) {
    __extends(World, _super);

    function World() {
      var h, w;
      World.__super__.constructor.call(this);
      w = 800;
      h = 600;
      this.camera = new THREE.PerspectiveCamera(75, w / h, 1, 10000);
      this.camera.position.z = 10;
      this.scene = new THREE.Scene();
      this.renderer = new THREE.CanvasRenderer();
      this.renderer.setSize(w, h);
      document.body.appendChild(this.renderer.domElement);
      this.clock = new THREE.Clock();
      this.stats = new Stats();
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.top = '0px';
      document.body.appendChild(this.stats.domElement);
      return this;
    }

    World.prototype.animate = function() {
      this.trigger("update", this.clock.getDelta());
      this.renderer.render(this.scene, this.camera);
      this.stats.update();
      requestAnimationFrame((function(_this) {
        return function() {
          return _this.animate();
        };
      })(this));
    };

    World.prototype.start = function() {
      return this.animate();
    };

    return World;

  })(Base);

  GameObject = (function() {
    function GameObject() {
      this.update = __bind(this.update, this);
      this.children = [];
      this.root = new THREE.Object3D();
    }

    GameObject.prototype.update = function(delta) {
      var child, _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child.update(delta));
      }
      return _results;
    };

    GameObject.prototype.add = function(gameObject) {
      this.children.push(gameObject);
      return this.root.add(gameObject.root);
    };

    return GameObject;

  })();

  Model = (function(_super) {
    __extends(Model, _super);

    function Model(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.load = __bind(this.load, this);
      Model.__super__.constructor.call(this);
      this.status = void 0;
    }

    Model.prototype.load = function(fileName) {
      var jsonLoader;
      jsonLoader = new THREE.JSONLoader();
      return jsonLoader.load(fileName, (function(_this) {
        return function() {
          var geometry, materials, others;
          geometry = arguments[0], materials = arguments[1], others = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
          console.log(geometry, materials, others);
          _this.material = new THREE.MeshFaceMaterial(materials);
          _this.geometry = geometry;
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
        wireframe: true
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
        model.load(fileName);
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

  Player = (function(_super) {
    __extends(Player, _super);

    function Player(file) {
      this.update = __bind(this.update, this);
      Player.__super__.constructor.call(this);
      this.root.add(modelLoader.load("assets/ship.js"));
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
        return this.root.position.x += 10 * delta;
      }
    };

    return Player;

  })(GameObject);

  Level = (function(_super) {
    __extends(Level, _super);

    function Level() {
      Level.__super__.constructor.call(this);
      this.ambientLight = new THREE.AmbientLight(0xffffff);
      this.root.add(this.ambientLight);
      this.player1 = new Player();
      this.add(this.player1);
      this.root.add(modelLoader.load("assets/grid_cube.js"));
    }

    return Level;

  })(GameObject);

  Input = (function() {
    Input.prototype.keyMap = {
      "38": "up",
      "87": "up",
      "40": "down",
      "83": "down",
      "37": "left",
      "65": "left",
      "39": "right",
      "68": "right"
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
            return _this.keyStates[_this.keyMap[e.which]] = true;
          }
        };
      })(this));
      $(window).keyup((function(_this) {
        return function(e) {
          if (_this.keyMap[e.which]) {
            return _this.keyStates[_this.keyMap[e.which]] = false;
          }
        };
      })(this));
    }

    return Input;

  })();

  modelLoader = new ModelLoader();

  input = new Input();

  world = new World();

  level = new Level();

  world.scene.add(level.root);

  world.on("update", level.update);

  world.start();

}).call(this);

/*
//# sourceMappingURL=main.js.map
*/
