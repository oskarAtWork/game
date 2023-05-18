import "phaser";

import { clearPlayedNotes, playNote, scoreSong, skaningen, Song } from "../songs";
import { createSheet, Sheet } from "../sheet";
import { preload } from "../preload/preload";
import { battleSceneKey } from "./battle-scene";


export const learnSceneKey = "LearnScene";

export function learn():
  | Phaser.Types.Scenes.SettingsConfig
  | Phaser.Types.Scenes.CreateSceneFromObjectConfig {

  let sheet: Sheet;
  let line: {
    s: Phaser.GameObjects.Image;
    t: number;
  };
  let currentNoteIndex = 0;
  let song: Song;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[] = [];

  return {
    key: learnSceneKey,
    preload() {
      const keyboard = preload(this);

      keyboard.on("keydown", (ev: KeyboardEvent) => {
        const key = ev.key;
        ev.preventDefault();
        console.log(key);

        if (key === 'Backspace') {
          clearPlayedNotes(playedNotes);
          currentNoteIndex = 0;
          return;
        }

        if (key === 'Enter') {
          const score = scoreSong(playedNotes);

          clearPlayedNotes(playedNotes);
          currentNoteIndex = 0;

          if (score === song.notes.length) {
            this.scene.start(battleSceneKey);
          }

          return;
        }

        const t = song.timings[currentNoteIndex];

        if (t !== undefined) {
          const noteInfo = playNote(t, key, song, sheet);

          if (noteInfo) {
            const note = { s: this.add.image(noteInfo.x, noteInfo.y, "note"), hit: noteInfo.hit };
            playedNotes.push(note);
            currentNoteIndex++;
          }
        }
      });
    },
    create() {
      this.add.image(0, 0, 'background').setOrigin(0, 0);
      sheet = createSheet(this);
      song = skaningen(this, sheet);

      line = {
        s: this.add.image(-100, 20, 'line'), // somewhere outside screen
        t: 0,
      };
      line.s.setOrigin(0, 0);
      line.s.setVisible(false);
    },
    update() {
      line.t = song.timings[currentNoteIndex] || 0;

      line.s.x =
        sheet.innerX() +
        sheet.innerWidth() *
          ((line.t - song.startsAt) / (song.endsAt - song.startsAt));

    },
  };
}