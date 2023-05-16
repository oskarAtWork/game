import "phaser";

import { playNote, Song } from "../songs";
import { createSheet, Sheet } from "../sheet";
import { preload } from "../preload";

export const learnSceneKey = "LearnScene";

export function learn():
  | Phaser.Types.Scenes.SettingsConfig
  | Phaser.Types.Scenes.CreateSceneFromObjectConfig {


  let sheet: Sheet;
  let line: {
    s: Phaser.GameObjects.Image;
    t: number;
  };
  let song: undefined | Song;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[] = [];

  return {
    key: learnSceneKey,
    preload() {
      const keyboard = preload(this);

      keyboard.on("keydown", (ev: { key: string }) => {
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
    },
    update() {
      line.s.setVisible(!!song && line.t < song.endsAt);

      if (song) {
        line.t += 1;

        line.s.x =
          sheet.innerX() +
          sheet.innerWidth() *
            ((line.t - song.startsAt) / (song.endsAt - song.startsAt));

        if (line.t > song.fullEnd) {
          clearSong(song);
          clearNotes(playedNotes);
          song = undefined;
        }
      }
    },
  };
}

function clearNotes(
  playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[]
) {
  const count = playedNotes.filter((s) => s.hit).length;
  playedNotes.forEach((note) => note.s.destroy());
  while (playedNotes.length > 0) playedNotes.pop();
  return count;
}

function clearSong(song: Song) {
  song.notes.forEach((note) => note.destroy());
}
