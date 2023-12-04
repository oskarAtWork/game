import { Sheet } from "../sheet";
import { Song, createSong } from "./song-utils";

export const skaningen = (scene: Phaser.Scene, sheet: Sheet): Song =>
  createSong(
    {
      name: "skaningen",
      effect: "fearful",
      notes: "1312423534",
      timings: [
        1845, // first beat
        2153,
        2307,
        2462, // second beat
        2750,
        2893,
        3037, // third beat
        3334,
        3478,
        3632, // fourth beat
      ],
      startsAt: 1845,
      endsAt: 5536,
    },
    scene,
    sheet
  );

export const sovningen = (scene: Phaser.Scene, sheet: Sheet): Song =>
  createSong(
    {
      name: "sovningen",
      effect: "sleepy",
      notes: "165423",
      timings: [2238, 4171, 6104, 6692, 7475, 8081],
      startsAt: 2238,
      endsAt: 10000,
    },
    scene,
    sheet
  );
