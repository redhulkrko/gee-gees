// All the settings in one place. Tweak the game from here.

export default {
  // Game size (scaled to fit the TV)
  width: 1920,
  height: 1080,

  // Size of ONE frame in your spritesheets
  frame: { width: 32, height: 32 },

  // Spritesheets to load. The key is what players.json uses in "sprite"
  sheets: [
    { key: 'enemy1', path: 'assets/enemy1.png' },
    { key: 'enemy2', path: 'assets/enemy2.png' },
    { key: 'enemy3', path: 'assets/enemy3.png' }
  ],

  // Frame ranges for each animation (same for every sheet)
  animations: {
    walk: { start: 0,  end: 3,  frameRate: 6,  repeat: -1 },
    run:  { start: 4,  end: 7,  frameRate: 10, repeat: -1 },
    jump: { start: 8,  end: 11, frameRate: 10, repeat: 0 },
    fall: { start: 12, end: 15, frameRate: 10, repeat: 0 }
  },

  // The track area for perspective (as a fraction of screen height)
  track: {
    top: 0.45,       // far edge of the track (sprites smallest)
    bottom: 0.95,    // near edge of the track (sprites biggest)
    minScale: 1.5,
    maxScale: 4
  },

  race: {
    walkDuration: 5000,                    // ms of walking before the race starts
    walkSpeed: 30,
    startX: 100,                           // where runners start
    jumpHeight: 40,                        // multiplied by sprite scale
    boostAmount: 100,                      // extra speed after a good jump
    boostDuration: 1000,
    fallSlideSpeed: 150                    // used when scrolling is OFF
  },

  // The single long hurdle across the track
  hurdle: {
    pieces: 12,                         // pieces stacked from back to front of the track
    startX: 0.75,                       // starting position (fraction of screen width)
    speed: 100,                         // how fast it moves left
    jumpRange: 20,                      // how close a runner gets before jumping (x sprite scale)
    respawnGap: { min: 200, max: 1200 },// extra distance off-screen before it comes round again
    offscreenMargin: 200                // how far past the left edge before it resets
  },

  // Scrolling background option
  scroll: {
    enabled: true,          // false = static background, runners cross the screen
    backgroundSpeed: 40,    // slower than the track = sense of distance (parallax)
    trackSpeed: 160,        // set this near the AVERAGE speed in players.json
    edgeMargin: 100         // keeps runners this far from the screen edges
  }
};
