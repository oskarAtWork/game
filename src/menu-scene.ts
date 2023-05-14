import 'phaser';
import gaspUrl from '../assets/gasp.mp3';
import skaningenUrl from '../assets/skaningen.mp3';
import playerUrl from '../assets/adam.png';
import sheetUrl from '../assets/sheet.png';
import noteUrl from '../assets/note.png';
import enemyUrl from '../assets/cat.png';
import { displayEnemyStats, Enemy } from './enemy';
import { displayPlayerStats, Player } from './player';
import { skaningen, Song } from './songs';

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
  let sheet: Phaser.GameObjects.Image;
  let ball: {
    s: Phaser.GameObjects.Image;
    t: number,
  };
  let song: undefined | Song;

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
      this.load.image(sheetUrl, sheetUrl);
      this.load.image(enemyUrl, enemyUrl);
      this.load.image('note', noteUrl);
      this.load.audio(gaspUrl, gaspUrl);
      this.load.audio(skaningenUrl, skaningenUrl);
    },
    create() {
      sheet = this.add.image(400, 20, sheetUrl);

      ball = {
        s: this.add.image(300, 20, 'note'),
        t: 0,
      };
      ball.s.setVisible(false);

      player = {
        s: this.add.image(100, 300, playerUrl),
        text: this.add.text(120, 320, '', {
          fontSize: '20px',
          fontFamily: "Helvetica",
        }),
        hp: 40,
      }

      document.addEventListener('keydown', (ev) => {
        const el = document.getElementById('keypresses') as HTMLElement;
        if (ev.key.toUpperCase() === 'Q') {
          el.innerHTML += ',' + ball.t;
        } else if (ev.key.toUpperCase() === 'W') {
          el.innerHTML = '';
        }
      })

      enemy = {
        s: this.add.image(400, 300, enemyUrl),
        text: this.add.text(500, 300, '', {
          fontSize: '20px',
          fontFamily: "Helvetica",
        }),
        confused: false,
        resistFear: 2,
        resistGroove: 3,
        resistSleep: 4,
        hasEarMuffs: false,
      }

      displayEnemyStats(enemy);
      displayPlayerStats(player);
    },
    update() {
      if (song && ball.s.visible) {
        ball.t += 1;
        if (ball.t > song.endsAt) {
          ball.s.setVisible(false);
        }
        ball.s.x = (sheet.x - 210) + 420 * ((ball.t - song.startsAt) / (song.endsAt - song.startsAt));
      }

      if (enemy.resistFear <= 0) {
        enemy.s.x += 1;
      }

      if (yourTurn) {
        let didSomething = false;
        if (keys.G.isDown) {
          enemy.resistSleep -= 1;
          keys.G.isDown = false;
          didSomething = true;
        }
  
        if (keys.D.isDown) {
          this.sound.play(skaningenUrl);
          enemy.resistFear -= 1;
          keys.D.isDown = false;
          yourTurn = false;
          didSomething = true;
        }
  
        if (keys.A.isDown) {
          enemy.resistGroove -= 1;
          keys.A.isDown = false;
          yourTurn = false;
          didSomething = true;
        }
  
        if (keys.E.isDown) {
          enemy.confused = true;
          keys.E.isDown = false;
          yourTurn = false;
          didSomething = true;
        }

        if (didSomething) {
          displayEnemyStats(enemy);

          song = skaningen(this);
          ball.s.setVisible(true);
          ball.t = 0;

          /*
          yourTurn = false;

          setTimeout(() => {
            player.hp -= 5 + Math.round(Math.random() * 5);
            yourTurn = true;
            displayPlayerStats(player);
          }, 3000);*/
        }
      }

      if (keys.S.isDown) {
        this.sound.play(gaspUrl);
        this.scene.start(menuSceneKey);
      }
    },
  }
}