import config from '../config.js';
import { applyPerspective } from '../utils/perspective.js';

// One long hurdle across the whole track, from the back edge to the front.
// It's built from a column of pieces so each piece gets the right size and
// draw order for its depth: runners at the back are hidden behind it,
// runners at the front are drawn in front of it.
export default class Hurdle {
  constructor(scene) {
    this.scene = scene;
    this.x = scene.scale.width * config.hurdle.startX;
    this.pass = 0;          // goes up by 1 each time the hurdle comes round again
    this.moving = false;
    this.pieces = [];

    const { top, bottom } = scene.track;
    const count = config.hurdle.pieces;

    for (let i = 0; i < count; i++) {
      const groundY = Phaser.Math.Linear(top, bottom, i / (count - 1));
      const piece = scene.add.image(this.x, groundY, 'obstacle').setOrigin(0.5, 1);
      piece.groundY = groundY;
      this.pieces.push(piece);
    }
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
      this.x -= this.getSpeed() * (delta / 1000);
    }

    // Gone off the left edge: bring it back in from the right after a gap
    if (this.x < -config.hurdle.offscreenMargin) {
      const { min, max } = config.hurdle.respawnGap;
      this.x = this.scene.scale.width + Phaser.Math.Between(min, max);
      this.pass++;
    }

    this.pieces.forEach(piece => {
      piece.x = this.x;
      applyPerspective(piece, this.scene.track);
    });
  }
}
