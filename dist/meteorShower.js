'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function rand(max) {
  return Math.random() * max;
}

var Coordinate = function () {
  function Coordinate() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, Coordinate);

    this.x = x;
    this.y = y;
  }

  _createClass(Coordinate, [{
    key: 'setCoordinate',
    value: function setCoordinate(x, y) {
      this.x = x;
      this.y = y;
    }
  }]);

  return Coordinate;
}();

var Meteor = function () {
  function Meteor() {
    var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Coordinate();
    var final = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Coordinate();
    var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
    var speed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 200;
    var onDestroy = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    _classCallCheck(this, Meteor);

    this.init = init;
    this.final = final;
    this.size = size;
    this.speed = speed; // px/s

    this.dur = Math.sqrt(Math.pow(this.final.x - this.init.x, 2) + Math.pow(this.final.y - this.init.y, 2)) * 1000 / this.speed;
    this.passed = 0;

    this.prev = new Coordinate(this.init.x, this.init.y);
    this.now = new Coordinate(this.init.x, this.init.y);

    this.onDestroy = onDestroy;
  }

  _createClass(Meteor, [{
    key: 'draw',
    value: function draw(ctx, delta) {
      this.passed += delta;
      this.passed = Math.min(this.passed, this.dur);

      var percent = this.passed / this.dur;

      this.now.setCoordinate(this.init.x + (this.final.x - this.init.x) * percent, this.init.y + (this.final.y - this.init.y) * percent);

      // draw on canvas
      ctx.strokeStyle = '#fff';
      ctx.lineCap = 'round';
      ctx.lineWidth = this.size;

      ctx.beginPath();
      ctx.moveTo(this.now.x, this.now.y);
      ctx.lineTo(this.prev.x, this.prev.y);
      ctx.stroke();

      this.prev.setCoordinate(this.now.x, this.now.y);

      if (this.passed === this.dur) {
        this.destroy();
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.onDestroy && this.onDestroy(this);
    }
  }]);

  return Meteor;
}();

var MeteorShower = function () {
  function MeteorShower(cvs, ctx) {
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, MeteorShower);

    this.cvs = cvs;
    this.ctx = ctx;
    this.meteors = [];
    this.animation;
    this.stop = false;

    this.meteorCount = config.meteorCount;
    this.maxPathHeight = config.maxPathHeight;
    this.minPathLength = config.minPathLength;
    this.maxPathLength = config.maxPathLength;
    this.maxSize = config.maxSize;
    this.minSpeed = config.minSpeed;
    this.maxSpeed = config.maxSpeed;
  }

  _createClass(MeteorShower, [{
    key: 'createMeteor',
    value: function createMeteor() {
      var angle = rand(Math.PI);
      var size = rand(this.maxSize);
      var speed = Math.max(rand(this.maxSpeed), this.minSpeed);
      var pathLength = Math.max(rand(this.maxPathLength), this.minPathLength);
      var init = new Coordinate(rand(this.cvs.width), rand(this.maxPathHeight));
      var final = new Coordinate(init.x + pathLength * Math.cos(angle), init.y + pathLength * Math.sin(angle));

      return new Meteor(init, final, size, speed, this.removeMeteor.bind(this));
    }
  }, {
    key: 'removeMeteor',
    value: function removeMeteor(meteor) {
      this.meteors = this.meteors.filter(function (s) {
        return s !== meteor;
      }); // TO Fix: no way its deep equal
    }
  }, {
    key: 'update',
    value: function update(delta) {
      var _this = this;

      if (!this.stop && this.meteors.length < this.meteorCount) {
        this.meteors.push(this.createMeteor());
      }
      this.meteors.forEach(function (meteor) {
        meteor.draw(_this.ctx, delta);
      });
    }
  }, {
    key: 'tick',
    value: function tick() {
      var _this2 = this;

      var now = new Date().getTime();
      var last = now;
      var delta = void 0;

      var _tick = function _tick() {
        if (_this2.stop && _this2.meteors.length === 0) {
          window.cancelAnimationFrame(_this2.animation);
          return;
        }

        delta = now - last;
        delta = delta > 500 ? 30 : delta < 16 ? 16 : delta;
        last = now;

        _this2.animation = window.requestAnimationFrame(_tick);

        _this2.ctx.save();

        _this2.ctx.fillStyle = 'rgba(0,0,0,0.9)';
        _this2.ctx.globalCompositeOperation = 'destination-in';

        _this2.ctx.fillRect(0, 0, _this2.cvs.width, _this2.cvs.height);
        _this2.ctx.restore();
        _this2.update(delta);
      };

      _tick();
    }
  }, {
    key: 'start',
    value: function start() {
      this.stop = false;
      this.tick();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.stop = true;
    }
  }]);

  return MeteorShower;
}();

var canvas = document.querySelector('canvas');
var ctx2d = canvas.getContext('2d');

new MeteorShower(canvas, ctx2d, {
  meteorCount: 1,
  maxPathHeight: 600,
  minPathLength: 600,
  maxPathLength: 1000,
  maxSize: 5,
  minSpeed: 300,
  maxSpeed: 500
}).start();