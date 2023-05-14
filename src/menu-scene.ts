import 'phaser';
import gaspUrl from '../assets/gasp.mp3';
import lineUrl from '../assets/line.png';
import skaningenUrl from '../assets/skaningen.mp3';
import playerUrl from '../assets/adam.png';
import sheetUrl from '../assets/sheet.png';
import noteUrl from '../assets/note.png';
import enemyUrl from '../assets/cat.png';
import { displayEnemyStats, Enemy } from './enemy';
import { displayPlayerStats, Player } from './player';
import { isAllowed, playNote, skaningen, Song } from './songs';

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
  let line: {
    s: Phaser.GameObjects.Image;
    t: number,
  };
  let song: undefined | Song;
  let playedNotes: {s: Phaser.GameObjects.Image, hit: boolean}[] = [];

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
      this.load.image(lineUrl, lineUrl);
      this.load.image('note', noteUrl);
      this.load.audio(gaspUrl, gaspUrl);
      this.load.audio(skaningenUrl, skaningenUrl);
    },
    create() {
      sheet = this.add.image(200, 20, sheetUrl);
      sheet.setOrigin(0, 0);

      line = {
        s: this.add.image(300, 20, lineUrl),
        t: 0,
      };
      line.s.setOrigin(0, 0);
      line.s.setVisible(false);

      player = {
        s: this.add.image(100, 300, playerUrl),
        text: this.add.text(120, 320, '', {
          fontSize: '20px',
          fontFamily: "Helvetica",
        }),
        hp: 40,
      }

      const scene = this;

      document.addEventListener('keydown', (ev) => {
        const el = document.getElementById('keypresses') as HTMLElement;

        if (!song) {
          return;
        }

        if (isAllowed(ev.key)) {
          const {x, y, hit} = playNote(line.t, ev.key, song, sheet);

          const note = { s: scene.add.image(x, y, 'note'), hit};

          playedNotes.push(
            note
          );

          note.s.setOrigin(0, 0);
        }

        if (ev.key.toUpperCase() === 'Q') {
          el.innerHTML += ',' + line.t;
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
        resistFear: 20,
        resistGroove: 30,
        resistSleep: 40,
        hasEarMuffs: false,
      }

      displayEnemyStats(enemy);
      displayPlayerStats(player);
    },
    update() {
      if (song) {
        line.t += 1;
        line.s.x = (sheet.x) + sheet.displayWidth * ((line.t - song.startsAt) / (song.endsAt - song.startsAt));

        if (line.t > song.endsAt) {
          line.s.setVisible(false);
        }
        if (line.t > song.fullEnd) {
          yourTurn = false;

          if (song.name === 'skaningen') {
            enemy.resistFear -= 1;
            displayEnemyStats(enemy);
          }

          const score = clearNotes(playedNotes);
          song = undefined;

          enemy.resistFear -= 1 + score;
          displayPlayerStats(player);

          if (enemy.resistFear >= 0) {
            setTimeout(() => {
              player.hp -= 5 + Math.round(Math.random() * 5);
              yourTurn = true;
            }, 500);
          } 
        }

      }

      if (enemy.resistFear <= 0) {
        enemy.s.x += 10;
      }

      if (yourTurn) {
        let didSomething = false;

        if (keys.D.isDown) {
          this.sound.play(skaningenUrl);
          keys.D.isDown = false;

          didSomething = true;

          clearNotes(playedNotes);
          song = skaningen(this, sheet);

          line.s.setVisible(true);
          line.t = 0;
        }

        if (didSomething) {
          yourTurn = false;
        }
      }

      if (keys.S.isDown) {
        this.sound.play(gaspUrl);
        this.scene.start(menuSceneKey);
      }
    },
  }
}

function clearNotes(playedNotes: {s: Phaser.GameObjects.Image, hit: boolean}[]) {
  const count = playedNotes.filter((s) => s.hit).length;
  playedNotes.forEach((note) => note.s.destroy());
  while (playedNotes.length > 0) playedNotes.pop();
  return count;
}