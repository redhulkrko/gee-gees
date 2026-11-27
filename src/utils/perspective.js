// Sets size, drawing order and jump height from position on the track
export function applyPerspective(obj, track) {
  const t = Phaser.Math.Clamp((obj.groundY - track.top) / (track.bottom - track.top), 0, 1);  // 0 = back, 1 = front

  obj.setScale(Phaser.Math.Linear(track.minScale, track.maxScale, t));
  obj.y = obj.groundY - (obj.jumpOffset || 0);
  obj.setDepth(obj.groundY);   // lower on screen = drawn in front
}
