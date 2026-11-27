import config from '../config.js';

// One long hurdle image across the whole track.
// It's anchored at its bottom-middle, sitting on the front edge of the track,
// so draw your image tall enough to reach back to the far edge.
export default class Hurdle {
  constructor(scene) {
    this.scene = scene;
    this.pass = 0;          // goes up by 1 each time the hurdle comes round again
    this.moving = false;

    this.image = scene.add.image(
      scene.scale.width * config.hurdle.startX,
      scene.track.bottom,
      'obstacle'
    );
    this.image.setOrigin(0.5, 1);
    this.image.setScale(config.hurdle.scale);

    // Drawn above the track but behind every runner
    this.image.setDepth(0);
  }

  get x() {
    return this.image.x;
  }

  start() {
    this.moving = true;
  }

  // Moves left; faster when the track scrolls, as it sits on the track
  getSpeed() {
    return config.hurdle.speed + this.scene.getScrollSpeed();
  }

  // Is this runner just in front of the hurdle (time to jump)?
  isAhead(runner) {
    const gap = this.x - runner.x;
    return gap > 0 && gap < config.hurdle.jumpRange * runner.scaleX;
  }

  // Called every frame by GameScene
  update(delta) {
    if (this.moving) {
      this.image.x -= this.getSpeed() * (delta / 1000);
    }

    // Gone off the left edge: bring it back in from the right after a gap
    if (this.image.x < -this.image.displayWidth) {
      const { min, max } = config.hurdle.respawnGap;
      this.image.x = this.scene.scale.width + this.image.displayWidth + Phaser.Math.Between(min, max);
      this.pass++;
    }
  }
}
