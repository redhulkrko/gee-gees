import config from '../config.js';
import { createAnimations } from '../utils/animations.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Spritesheets listed in config.js
    config.sheets.forEach(sheet => {
      this.load.spritesheet(sheet.key, sheet.path, {
        frameWidth: config.frame.width,
        frameHeight: config.frame.height
      });
    });

    // Scenery and objects
    this.load.image('background', 'assets/background.png');
    this.load.image('track', 'assets/track.png');
    this.load.image('obstacle', 'assets/obstacle.png');

    // Player stats
    this.load.json('players', 'assets/data/players.json');
  }

  create() {
    // Animations are shared by every scene, so make them once here
    createAnimations(this, config.sheets.map(sheet => sheet.key));

    this.scene.start('GameScene');
  }
}
