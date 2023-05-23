import { Sheet } from "../sheet";
import { Song, createSong } from "./song-utils";

export const skaningen = (scene: Phaser.Scene, sheet: Sheet): Song =>
  createSong(
    {
      name: "skaningen",
      notes: "§2§1312423",
      timings: [
        2060, // first beat
        2330,
        2539,
        2613, // second beat
        2896,
        3038,
        3180, // third beat
        3489,
        3644,
        3799, // fourth beat
      ],
      startsAt: 2058,
      endsAt: 5536,
    },
    scene,
    sheet
  );

export const sovningen = (scene: Phaser.Scene, sheet: Sheet): Song =>
  createSong(
    {
      name: "sovningen",
      notes: "§54312",
      timings: [2238, 4171, 6376, 6892, 7475, 8081],
      startsAt: 2238,
      endsAt: 10000,
    },
    scene,
    sheet
  );
