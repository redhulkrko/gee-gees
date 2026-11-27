import config from '../config.js';
import { applyPerspective } from '../utils/perspective.js';

export default class Obstacle extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, groundY) {
    super(scene, x, groundY, 'obstacle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.groundY = groundY;
    this.jumpOffset = 0;
    this.speed = Phaser.Math.Between(config.race.obstacleSpeed.min, config.race.obstacleSpeed.max);
  }

  // Start moving left (faster when the track scrolls, as it's on the track)
  move() {
    this.setVelocityX(-(this.speed + this.scene.getScrollSpeed()));
  }

  // Runs every frame automatically
  preUpdate() {
    const track = this.scene.track;

    // Off the left edge: come back on the right at a new random depth
    if (this.x < -this.displayWidth) {
      this.x = this.scene.scale.width + this.displayWidth;
      this.groundY = Phaser.Math.Between(track.top, track.bottom);
    }

    applyPerspective(this, track);
  }
}
