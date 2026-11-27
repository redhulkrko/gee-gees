import config from './config.js';
import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: config.width,
  height: config.height,
  backgroundColor: '#000000',
  pixelArt: true,                         // keeps pixel sprites sharp when scaled
  physics: { default: 'arcade' },
  scale: {
    mode: Phaser.Scale.FIT,               // fit any screen, keep 16:9 shape
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [PreloadScene, GameScene]        // PreloadScene runs first
});
