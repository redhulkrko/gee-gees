import config from '../config.js';
import Runner from '../objects/Runner.js';
import Hurdle from '../objects/Hurdle.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const { width, height } = this.scale;
    this.racing = false;

    // Track area in pixels (used for perspective)
    this.track = {
      top: height * config.track.top,
      bottom: height * config.track.bottom,
      minScale: config.track.minScale,
      maxScale: config.track.maxScale
    };

    // Scenery. tileSprite = an image that can scroll and repeat
    this.background = this.add.tileSprite(0, 0, width, height, 'background')
      .setOrigin(0).setDepth(-2);
    this.trackImage = this.add.tileSprite(0, 0, width, height, 'track')
      .setOrigin(0).setDepth(-1);

    // Runners: one per entry in players.json
    this.runners = this.physics.add.group();
    const players = this.cache.json.get('players');

    players.forEach((data, i) => {
      const groundY = Phaser.Math.Linear(this.track.top, this.track.bottom, (i + 0.5) / players.length);
      const runner = new Runner(this, config.race.startX, groundY, data);
      this.runners.add(runner);
      runner.walk();   // after adding: adding to a group resets velocity
    });

    // One long hurdle across the whole track
    this.hurdle = new Hurdle(this);

    this.time.delayedCall(config.race.walkDuration, this.startRace, [], this);
  }

  // Is the scenery scrolling right now?
  isScrolling() {
    return config.scroll.enabled && this.racing;
  }

  // How fast the track moves (0 when not scrolling)
  getScrollSpeed() {
    return this.isScrolling() ? config.scroll.trackSpeed : 0;
  }

  startRace() {
    this.racing = true;   // set first, so speeds below include scrolling

    this.runners.getChildren().forEach(runner => runner.run());
    this.hurdle.start();

    // Every second, runners tire / gain ground / drift
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.runners.getChildren().forEach(runner => runner.updateSpeed())
    });
  }

  update(time, delta) {
    this.hurdle.update(delta);

    // Each runner gets one go at each pass of the hurdle
    this.runners.getChildren().forEach(runner => {
      if (runner.lastHurdlePass === this.hurdle.pass) return;

      if (this.hurdle.isAhead(runner)) {
        runner.lastHurdlePass = this.hurdle.pass;
        runner.hitObstacle();   // falls, jumps or good-jumps based on agility
      }
    });

    if (!this.isScrolling()) return;

    const dt = delta / 1000;
    this.background.tilePositionX += config.scroll.backgroundSpeed * dt;
    this.trackImage.tilePositionX += config.scroll.trackSpeed * dt;
  }
}
