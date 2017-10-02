class Crood {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  setCrood(x, y) {
    this.x = x;
    this.y = y;
  }
  copy() {
    return new Crood(this.x, this.y);
  }
}

class Meteor {
  constructor(init = new Crood(), final = new Crood(), size = 3, speed = 200, onDestroy = null) {
    this.init = init; // 初始位置
    this.final = final; // 最终位置
    this.size = size; // 大小
    this.speed = speed; // 速度：像素/s

    // 飞行总时间
    this.dur = Math.sqrt(Math.pow(this.final.x - this.init.x, 2) + Math.pow(this.final.y - this.init.y, 2)) * 1000 / this.speed;

    this.pass = 0; // 已过去的时间
    this.prev = this.init.copy(); // 上一帧位置
    this.now = this.init.copy(); // 当前位置
    this.onDestroy = onDestroy;
  }
  draw(ctx, delta) {
    this.pass += delta;
    this.pass = Math.min(this.pass, this.dur);

    const percent = this.pass / this.dur;

    this.now.setCrood(
      this.init.x + (this.final.x - this.init.x) * percent,
      this.init.y + (this.final.y - this.init.y) * percent,
    );

    // canvas
    ctx.strokeStyle = '#fff';
    ctx.lineCap = 'round';
    ctx.lineWidth = this.size;
    ctx.beginPath();
    ctx.moveTo(this.now.x, this.now.y);
    ctx.lineTo(this.prev.x, this.prev.y);
    ctx.stroke();

    this.prev.setCrood(this.now.x, this.now.y);
    if (this.pass === this.dur) {
      this.destroy();
    }
  }
  destroy() {
    this.onDestroy && this.onDestroy();
  }
}


class MeteorShower {
  constructor(cvs, ctx, config = {}) {
    this.cvs = cvs;
    this.ctx = ctx;
    this.stars = [];
    this.T;
    this.stop = false;
    this.playing = false;

    this._starCount = config.starCount;
  }

  createStar() {
    const angle = Math.PI * Math.random();
    const distance = Math.random() * 600;
    const init = new Crood(Math.random() * this.cvs.width | 0, Math.random() * 300 | 0);
    const final = new Crood(init.x + distance * Math.cos(angle), init.y + distance * Math.sin(angle));
    const size = Math.random() * 2;
    const speed = Math.random() * 500 + 300;

    const star = new Meteor(
      init, final, size, speed,
      () => { this.remove(star); },
    );
    return star;
  }

  remove(star) {
    this.stars = this.stars.filter(s => s !== star);
  }

  update(delta) {
    if (!this.stop && this.stars.length < this._starCount) {
      this.stars.push(this.createStar());
    }
    this.stars.forEach((star) => {
      star.draw(this.ctx, delta);
    });
  }

  tick() {
    if (this.playing) return;
    this.playing = true;

    const now = (new Date()).getTime();
    let last = now;
    let delta;

    const _tick = () => {
      if (this.stop && this.stars.length === 0) {
        window.cancelAnimationFrame(this.T);
        this.playing = false;
        return;
      }

      delta = now - last;
      delta = delta > 500 ? 30 : (delta < 16 ? 16 : delta);
      last = now;

      this.T = window.requestAnimationFrame(_tick);

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
  starCount: 1,
})
  .start();
