import './style.css'

import 'phaser';
import { battle } from './scenes/battle-scene';
import { dialog } from './scenes/dialog-scene';
import { getCurrentLevel } from './progression';
import { testScene } from './scenes/test-scene';


const GameConfig: Phaser.Types.Core.GameConfig = {
  title: "Molly and Oskar's game",
  url: '',
  version: '2.1',
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: 'app',
  scene: testScene(), //getCurrentLevel().sceneKey === 'DialogScene' ? [dialog(), battle()] : [battle(), dialog()],
  input: {
    keyboard: true,
    mouse: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      // Enable Arcade Physics system
      debug: false, // Set to true for debugging purposes
    },
  },
  backgroundColor: '#ffffff',
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

declare global {
  interface Console {
    htmlLog: (str: any) => void;
    htmlLogAppend: (str: any) => void;
  }
}

console.htmlLog = (str: any) => {
  if (typeof str === 'object') {
    document.getElementById('debug')!!.innerHTML = JSON.stringify(str);
  } else {
    document.getElementById('debug')!!.innerHTML = str?.toString();
  }
}

console.htmlLogAppend = (str: any) => {
  if (typeof str === 'object') {
    document.getElementById('debug')!!.innerHTML += ' ' + JSON.stringify(str);
  } else {
    document.getElementById('debug')!!.innerHTML += ' ' + str?.toString();
  }
}