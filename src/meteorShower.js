function rand(max) {
  return Math.random() * max;
}

class Coordinate {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  setCoordinate(x, y) {
    this.x = x;
    this.y = y;
  }
}



class Meteor {
  constructor(init = new Coordinate(), final = new Coordinate(), size = 3, speed = 200, onDestroy = null) {
    this.init = init;
    this.final = final;
    this.size = size;
    this.speed = speed; // px/s

    this.dur = Math.sqrt((this.final.x - this.init.x) ** 2 + (this.final.y - this.init.y) ** 2) * 1000 / this.speed;
    this.passed = 0;

    this.prev = new Coordinate(this.init.x, this.init.y);
    this.now = new Coordinate(this.init.x, this.init.y);

    this.onDestroy = onDestroy;
  }

  draw(ctx, delta) {
    this.passed += delta;
    this.passed = Math.min(this.passed, this.dur);

    const percent = this.passed / this.dur;

    this.now.setCoordinate(
      this.init.x + (this.final.x - this.init.x) * percent,
      this.init.y + (this.final.y - this.init.y) * percent,
    );

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

  destroy() {
    this.onDestroy && this.onDestroy(this);
  }
}



class MeteorShower {
  constructor(cvs, ctx, config = {}) {
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

  createMeteor() {
    const angle = rand(Math.PI);
    const size = rand(this.maxSize);
    const speed = Math.max(rand(this.maxSpeed), this.minSpeed);
    const pathLength = Math.max(rand(this.maxPathLength), this.minPathLength);
    const init = new Coordinate(rand(this.cvs.width), rand(this.maxPathHeight));
    const final = new Coordinate(init.x + pathLength * Math.cos(angle), init.y + pathLength * Math.sin(angle));

    return new Meteor(
      init, final, size, speed,
      this.removeMeteor.bind(this),
    );
  }

  removeMeteor(meteor) {
    this.meteors = this.meteors.filter(s => s !== meteor); // TO Fix: no way its deep equal
  }

  update(delta) {
    if (!this.stop && this.meteors.length < this.meteorCount) {
      this.meteors.push(this.createMeteor());
    }
    this.meteors.forEach((meteor) => {
      meteor.draw(this.ctx, delta);
    });
  }

  tick() {
    const now = (new Date()).getTime();
    let last = now;
    let delta;

    const _tick = () => {
      if (this.stop && this.meteors.length === 0) {
        window.cancelAnimationFrame(this.animation);
        return;
      }

      delta = now - last;
      delta = delta > 500 ? 30 : (delta < 16 ? 16 : delta);
      last = now;

      this.animation = window.requestAnimationFrame(_tick);

      this.ctx.save();

      this.ctx.fillStyle = 'rgba(0,0,0,0.9)';
      this.ctx.globalCompositeOperation = 'destination-in';

      this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
      this.ctx.restore();
      this.update(delta);
    };

    _tick();
  }

  start() {
    this.stop = false;
    this.tick();
  }

  stop() {
    this.stop = true;
  }
}



const canvas = document.querySelector('canvas');
const ctx2d = canvas.getContext('2d');

new MeteorShower(canvas, ctx2d, {
  meteorCount: 1,
  maxPathHeight: 600,
  minPathLength: 600,
  maxPathLength: 1000,
  maxSize: 5,
  minSpeed: 300,
  maxSpeed: 500,
})
  .start();
