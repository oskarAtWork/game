import './style.css'

import 'phaser';
import { battle } from './scenes/battle-scene';
import { dialog } from './scenes/dialog-scene';
import { learn } from './scenes/learn-scene';


const GameConfig: Phaser.Types.Core.GameConfig = {
  title: "Molly and Oskar's game",
  url: 'https://github.com/digitsensitive/phaser3-typescript',
  version: '2.1',
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: 'app',
  scene: [learn(), dialog(), battle()],
  input: {
    keyboard: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
  backgroundColor: '#300000',
  render: { pixelArt: false, antialias: true },
  scale: {

    autoCenter: Phaser.Scale.CENTER_BOTH,
    // `fullscreenTarget` must be defined for phones to not have
    // a small margin during fullscreen.
    fullscreenTarget: 'app',
    expandParent: false,
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener('load', () => {
  // Expose `_game` to allow debugging, mute button and fullscreen button
  (window as any)._game = new Game(GameConfig);
});
