import config from '../config.js';

// Makes walk/run/jump/fall for every spritesheet, named like "enemy1-run"
export function createAnimations(scene, sheetKeys) {
  sheetKeys.forEach(key => {
    Object.entries(config.animations).forEach(([name, anim]) => {
      const animKey = key + '-' + name;
      if (scene.anims.exists(animKey)) return;

      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(key, { start: anim.start, end: anim.end }),
        frameRate: anim.frameRate,
        repeat: anim.repeat
      });
    });
  });
}
