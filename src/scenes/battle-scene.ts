import "phaser";

import { displayEnemyStats, Enemy } from "../enemy";
import { displayPlayerStats, Player } from "../player";
import { clearPlayedNotes, clearSong, playNote, scoreSong, skaningen, Song } from "../songs";
import { createSheet, Sheet } from "../sheet";
import { preload } from "../preload/preload";

export const battleSceneKey = "BattleScene";

export function battle():
  | Phaser.Types.Scenes.SettingsConfig
  | Phaser.Types.Scenes.CreateSceneFromObjectConfig {

  let enemy: Enemy;
  let player: Player;
  let sheet: Sheet;
  let line: {
    s: Phaser.GameObjects.Image;
    t: number;
  };
  let song: undefined | Song;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[] = [];

  let yourTurn = true;

  return {
    key: battleSceneKey,
    preload() {
      const keyboard = preload(this);

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
      this.add.image(0, 0, 'background').setOrigin(0, 0);
      sheet = createSheet(this);

      line = {
        s: this.add.image(300, 20, 'line'),
        t: 0,
      };
      line.s.setOrigin(0, 0);
      line.s.setVisible(false);

      player = {
        s: this.add.image(100, 300, 'player'),
        text: this.add.text(120, 320, "", {
          fontSize: "20px",
          fontFamily: "Helvetica",
        }),
        hp: 40,
      };

      enemy = {
        s: this.add.image(650, 300, 'enemy'),
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
      displayPlayerStats(player);
    },
    update() {
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
        enemy.s.flipX = true;
      }
    },
  };
}

