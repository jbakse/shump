(function() {
  var Base, Input, Level, World, input, level, world,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Base = (function() {
    function Base() {}

    Base._events = {};

    Base.prototype.on = function(event, handler) {
      var _base;
      if (this._events == null) {
        this._events = {};
      }
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
      _ref = this._events[event];
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

    World.camera = void 0;

    World.scene = void 0;

    World.renderer = void 0;

    World.clock = void 0;

    function World() {
      var h, w;
      w = 800;
      h = 600;
      this.camera = new THREE.PerspectiveCamera(75, w / h, 1, 10000);
      this.camera.position.z = 1000;
      this.scene = new THREE.Scene();
      this.renderer = new THREE.CanvasRenderer();
      this.renderer.setSize(w, h);
      document.body.appendChild(this.renderer.domElement);
      this.clock = new THREE.Clock();
      return this;
    }

    World.prototype.animate = function() {
      this.trigger("update", this.clock.getDelta());
      requestAnimationFrame((function(_this) {
        return function() {
          return _this.animate();
        };
      })(this));
      this.renderer.render(this.scene, this.camera);
    };

    World.prototype.start = function() {
      return this.animate();
    };

    return World;

  })(Base);

  Level = (function() {
    Level.root = void 0;

    Level.geometry = void 0;

    Level.material = void 0;

    Level.mesh = void 0;

    function Level() {
      this.update = __bind(this.update, this);
      this.root = new THREE.Object3D();
      this.geometry = new THREE.BoxGeometry(200, 200, 200);
      this.material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
      });
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.root.add(this.mesh);
    }

    Level.prototype.update = function(delta) {
      if (input.keyStates['up']) {
        this.mesh.position.y += 600 * delta;
      }
      if (input.keyStates['down']) {
        this.mesh.position.y -= 600 * delta;
      }
      if (input.keyStates['left']) {
        this.mesh.position.x -= 600 * delta;
      }
      if (input.keyStates['right']) {
        return this.mesh.position.x += 600 * delta;
      }
    };

    return Level;

  })();

  Input = (function() {
    Input.prototype.keyStates = {};

    Input.prototype.keyMap = {
      "38": "up",
      "40": "down",
      "37": "left",
      "39": "right"
    };

    function Input() {
      var key, value, _ref;
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

  world = new World();

  level = new Level();

  input = new Input();

  world.scene.add(level.root);

  world.on("update", level.update);

  world.start();

}).call(this);

/*
//# sourceMappingURL=main.js.map
*/
