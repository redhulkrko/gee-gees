import config from '../config.js';
import { applyPerspective } from '../utils/perspective.js';

export default class Runner extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, groundY, data) {
    super(scene, x, groundY, data.sprite);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);          // position = feet

    this.stats = data;               // values from players.json
    this.groundY = groundY;          // position on the track (depth)
    this.currentSpeed = data.speed;  // "real" speed, changes over time
    this.driftSpeed = 0;             // up/down movement
    this.jumpOffset = 0;             // height off the ground
    this.fallen = false;
    this.boosting = false;
  }

  get sheet() {
    return this.texture.key;
  }

  isJumping() {
    return this.anims.currentAnim && this.anims.currentAnim.key === this.sheet + '-jump';
  }

  // Sets on-screen speed. When the track scrolls, the runner only moves
  // by the difference, so faster runners pull ahead and slower ones drop back.
  applySpeed(extra = 0) {
    this.setVelocityX(this.currentSpeed + extra - this.scene.getScrollSpeed());
  }

  walk() {
    this.setVelocityX(config.race.walkSpeed);
    this.play(this.sheet + '-walk');
  }

  run() {
    this.applySpeed();
    this.play(this.sheet + '-run');
  }

  // Called every second during the race
  updateSpeed() {
    if (this.fallen || this.boosting) return;

    const { speed, stamina } = this.stats;

    let change = Phaser.Math.Between(-10, 10);
    if (Math.random() > stamina) change -= 15;      // tiring

    this.currentSpeed = Phaser.Math.Clamp(this.currentSpeed + change, speed * 0.5, speed * 1.3);
    this.applySpeed();

    if (Math.random() < 0.3) {
      this.driftSpeed = Phaser.Math.Between(-40, 40);
    }
  }

  hitObstacle() {
    if (this.fallen || this.isJumping()) return;

    const agility = this.stats.agility;
    const fallChance = 0.3 * (1 - agility);
    const goodChance = 0.3 * agility;
    const roll = Math.random();

    if (roll < fallChance) {
      this.fall();
    } else if (roll > 1 - goodChance) {
      this.goodJump();
    } else {
      this.jump();
    }
  }

  jump() {
    this.play(this.sheet + '-jump');

    this.scene.tweens.add({
      targets: this,
      jumpOffset: config.race.jumpHeight * this.scaleY,
      duration: 200,
      yoyo: true
    });

    this.once('animationcomplete', () => {
      if (!this.fallen) this.play(this.sheet + '-run');
    });
  }

  goodJump() {
    this.jump();

    this.once('animationcomplete', () => {
      this.boosting = true;
      this.applySpeed(config.race.boostAmount);

      this.scene.time.delayedCall(config.race.boostDuration, () => {
        this.boosting = false;
        if (this.active && !this.fallen) this.applySpeed();
      });
    });
  }

  fall() {
    this.fallen = true;
    this.driftSpeed = 0;
    this.play(this.sheet + '-fall');   // stops on last frame (repeat: 0)

    // Scrolling: the runner stops, so the track carries them off left.
    // Not scrolling: slide off left at a set speed.
    const slide = this.scene.isScrolling() ? config.scroll.trackSpeed : config.race.fallSlideSpeed;
    this.setVelocityX(-slide);
  }

  // Keep runners visible
  keepOnScreen() {
    if (this.scene.isScrolling()) {
      const margin = config.scroll.edgeMargin;
      const width = this.scene.scale.width;
      this.x = Phaser.Math.Clamp(this.x, margin, width - margin);
    } else {
      this.scene.physics.world.wrap(this, 0);
    }
  }

  // Runs every frame automatically
  preUpdate(time, delta) {
    super.preUpdate(time, delta);   // needed for animations to play

    if (this.fallen) {
      if (this.x < -this.displayWidth) {
        this.destroy();
        return;
      }
    } else {
      // Drift up/down, bounce back at the track edges
      const track = this.scene.track;
      this.groundY += this.driftSpeed * (delta / 1000);

      if (this.groundY < track.top || this.groundY > track.bottom) {
        this.groundY = Phaser.Math.Clamp(this.groundY, track.top, track.bottom);
        this.driftSpeed *= -1;
      }

      this.keepOnScreen();
    }

    applyPerspective(this, this.scene.track);
  }
}
