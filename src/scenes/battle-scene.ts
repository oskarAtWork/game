import "phaser";
import backgroundUrl from '../../assets/forest_background.png';
import heartUrl from '../../assets/heart.png';

import { displayEnemyStats, Enemy } from "../enemy";
import { clearPlayedNotes, clearSong, playNote, scoreSong, skaningen, Song } from "../songs";
import { createSheet, Sheet } from "../sheet";
import { preload } from "../preload/preload";
import { getCurrentLevel } from "../progression";
import { createPerson, DialogPerson, preloadPeople, updatePerson } from "../dialog-person";
import { demo} from "../animations";

export const battleSceneKey = "BattleScene" as const;

export function battle():
  | Phaser.Types.Scenes.SettingsConfig
  | Phaser.Types.Scenes.CreateSceneFromObjectConfig {

  let enemy: Enemy;
  let player: DialogPerson;
  let sheet: Sheet;
  let line: {
    s: Phaser.GameObjects.Image;
    t: number;
  };
  let song: undefined | Song;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[] = [];

  let yourTurn = true;
  let hp: Phaser.GameObjects.Image[] = [];
  let animationTimer = 0;

  return {
    key: battleSceneKey,
    preload() {
      const keyboard = preload(this);
      preloadPeople(this);
      this.load.image('background', backgroundUrl);
      this.load.image('heart', heartUrl);

      keyboard.on("keydown", (ev: { key: string }) => {
        const key = ev.key.toUpperCase();

        const el = document.getElementById("keypresses") as HTMLElement;
        if (key === "Q") {
          el.innerHTML += "," + line.t;
          return;
        } else if (key === "W") {
          el.innerHTML = "";
          return;
        }

        if (yourTurn) {
          if (key === 'S') {
            this.sound.play('gasp');
            this.scene.start(battleSceneKey);
          } else if (key === 'D') {
            this.sound.play('skaningen');

            clearPlayedNotes(playedNotes);
            song = skaningen(this, sheet);

            line.s.setVisible(true);
            line.t = 0;
            yourTurn = false;
            return;
          }
        }

        const noteInfo = playNote(line.t, ev.key, song, sheet);

        if (noteInfo) {
          const note = { s: this.add.image(noteInfo.x, noteInfo.y, "note"), hit: noteInfo.hit };
          playedNotes.push(note);
        }
      });
    },
    create() {
      const level = getCurrentLevel();

      if (level.sceneKey !== 'BattleScene') {
        window.alert('Oh no, wrong level, at battle scene ' + JSON.stringify(level));
        throw Error('Oh no, wrong level');
      }
      
      this.add.image(0, 0, 'background').setOrigin(0, 0);
      sheet = createSheet(this);

      line = {
        s: this.add.image(300, 20, 'line'),
        t: 0,
      };
      line.s.setOrigin(0, 0);
      line.s.setVisible(false);

      player = createPerson(this, 'adam', 200, 500);

      enemy = {
        s: this.add.image(650, 440, 'enemy'),
        text: this.add.text(650, 10, "", {
          fontSize: "20px",
          fontFamily: "Helvetica",
        }),
        confused: false,
        resistFear: 20,
        resistGroove: 30,
        resistSleep: 40,
        hasEarMuffs: false,
      };

      displayEnemyStats(enemy);

      this.add.image(0, 0, 'dialog').setOrigin(0, 0);

      for (let i = 0; i < 20; i++) {
        hp.push(this.add.image(30 + i * 30, 550, 'heart'));
      }
    },
    update() {
      animationTimer++;
      updatePerson(player, yourTurn, animationTimer, demo)

      if (song) {
        line.t += 1;

        line.s.x =
          sheet.innerX() +
          sheet.innerWidth() *
            ((line.t - song.startsAt) / (song.endsAt - song.startsAt));

        if (line.t > song.endsAt) {
          line.s.setVisible(false);
        }

        if (line.t > song.fullEnd) {
          yourTurn = false;

          if (song.name === "skaningen") {
            enemy.resistFear -= 1;
            displayEnemyStats(enemy);
          }

          const score = scoreSong(playedNotes);
          clearSong(song);
          clearPlayedNotes(playedNotes);
          song = undefined;

          enemy.resistFear -= 1 + score;

          if (enemy.resistFear >= 0) {
            setTimeout(() => {

              const obj = hp.pop();
              obj?.destroy();
              
              yourTurn = true;
            }, 500);
          }
        }
      }

      if (enemy.resistFear <= 0) {
        enemy.s.x += 10;
        enemy.s.flipX = true;
      }
    },
  };
}

