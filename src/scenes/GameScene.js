import config from '../config.js';
import Runner from '../objects/Runner.js';
import Obstacle from '../objects/Obstacle.js';

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

    // Obstacles at random spots on the track
    this.obstacles = this.physics.add.group();

    for (let i = 0; i < config.race.obstacleCount; i++) {
      const x = Phaser.Math.Between(width * 0.5, width);
      const y = Phaser.Math.Between(this.track.top, this.track.bottom);
      this.obstacles.add(new Obstacle(this, x, y));
    }

    // Hits: only when runner and obstacle are at about the same depth
    this.physics.add.overlap(
      this.runners,
      this.obstacles,
      (runner) => runner.hitObstacle(),
      (runner, obstacle) => Math.abs(runner.groundY - obstacle.groundY) < config.race.hitDepth
    );

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
    this.obstacles.getChildren().forEach(obstacle => obstacle.move());

    // Every second, runners tire / gain ground / drift
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.runners.getChildren().forEach(runner => runner.updateSpeed())
    });
  }

  update(time, delta) {
    if (!this.isScrolling()) return;

    const dt = delta / 1000;
    this.background.tilePositionX += config.scroll.backgroundSpeed * dt;
    this.trackImage.tilePositionX += config.scroll.trackSpeed * dt;
  }
}
