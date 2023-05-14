import 'phaser';
import gaspUrl from '../assets/gasp.mp3';
import playerUrl from '../assets/adam.png';
import enemyUrl from '../assets/cat.png';
import { displayEnemyStats, Enemy } from './enemy';
import { displayPlayerStats, Player } from './player';

export const menuSceneKey = 'MenuScene';

export function menu(): Phaser.Types.Scenes.SettingsConfig | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
  let keys: {
    S: Phaser.Input.Keyboard.Key;
    G: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };

  let enemy: Enemy;
  let player: Player;
  let turnText: Phaser.GameObjects.Text;
  let yourTurn = true;

  return {
    key: menuSceneKey,
    preload() {
      if (this.input.keyboard) {
        keys = {
          S: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S,
          ),
          G: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.G,
          ),
          D: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.D,
          ),
          A: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A,
          ),
          E: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.E,
          ),
        }
      } else {
        throw Error('no keyboard, what');
      }

      keys.S.isDown = false;
      keys.G.isDown = false;
      keys.D.isDown = false;
      keys.A.isDown = false;
      keys.E.isDown = false;

      this.load.image(playerUrl, playerUrl);
      this.load.image(enemyUrl, enemyUrl);
      this.load.audio(gaspUrl, gaspUrl);
    },
    create() {
      turnText = this.add.text(0, 0, '', {
        fontSize: '60px',
        fontFamily: "Helvetica",
      });

      player = {
        s: this.add.image(100, 100, playerUrl),
        text: this.add.text(120, 120, '', {
          fontSize: '20px',
          fontFamily: "Helvetica",
        }),
        hp: 40,
      }

      enemy = {
        s: this.add.image(400, 100, enemyUrl),
        text: this.add.text(500, 100, '', {
          fontSize: '20px',
          fontFamily: "Helvetica",
        }),
        resistConfuse: 3,
        resistFear: 2,
        resistGroove: 3,
        resistSleep: 4,
        hasEarMuffs: false,
      }

      displayEnemyStats(enemy);
      displayPlayerStats(player);
    },
    update() {
      if (yourTurn) {
        turnText.text = 'Your turn: G D A E';
      } else {
        turnText.text = 'Imma fuck you up!!';
      }

      if (yourTurn) {
        let didSomething = false;
        if (keys.G.isDown) {
          enemy.resistSleep -= 1;
          keys.G.isDown = false;
          didSomething = true;
        }
  
        if (keys.D.isDown) {
          enemy.resistFear -= 1;
          keys.D.isDown = false;
          yourTurn = false;
        }
  
        if (keys.A.isDown) {
          enemy.resistGroove -= 1;
          keys.A.isDown = false;
          yourTurn = false;
        }
  
        if (keys.E.isDown) {
          enemy.resistConfuse -= 1;
          keys.E.isDown = false;
          yourTurn = false;
        }

        if (didSomething) {
          displayEnemyStats(enemy);
          yourTurn = false;
          setTimeout(() => {
            player.hp -= 5 + Math.round(Math.random() * 5);
            yourTurn = true;
            displayPlayerStats(player);
          }, 3000);
        }
      }

      if (keys.S.isDown) {
        this.sound.play(gaspUrl);
        this.scene.start(menuSceneKey);
      }
    },
  }
}