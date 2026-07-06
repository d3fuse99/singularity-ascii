class Particle {
  constructor(r, angle) {
    this.r = r;
    this.angle = angle;
    this.prevAngle = angle;
    this.speed = 0.08 / Math.sqrt(r);
    this.y = (Math.random() - 0.5) * (r * 0.02 + 0.8);
  }
  
  update() {
    this.prevAngle = this.angle;
    let timeDilation = Math.sqrt(Math.max(0.05, 1.0 - (minRadius * 0.95) / this.r));
    let vortexBoost = Math.pow(minRadius / this.r, 2.0) * 0.04;
    this.angle += this.speed * timeDilation + vortexBoost;
  }
}