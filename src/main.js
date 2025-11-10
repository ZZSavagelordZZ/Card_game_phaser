import Phaser from 'phaser';
import StartScene from './scenes/StartScene.js';
import ModeSelectScene from './scenes/ModeSelectScene.js';
import GameScene from './scenes/GameScene.js';
import RulesScene from './scenes/RulesScene.js';

// Force landscape on mobile
const isMobile = window.innerWidth < 768 || window.innerHeight < 768;
let gameWidth = window.innerWidth;
let gameHeight = window.innerHeight;

if (isMobile && gameHeight > gameWidth) {
  // Swap dimensions for landscape
  [gameWidth, gameHeight] = [gameHeight, gameWidth];
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    orientation: Phaser.Scale.Orientation.LANDSCAPE,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [StartScene, ModeSelectScene, RulesScene, GameScene],
};

// Create game instance
const game = new Phaser.Game(config);

// Handle window resize to maintain fullscreen
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

// Store reference for potential external access
window.game = game;

