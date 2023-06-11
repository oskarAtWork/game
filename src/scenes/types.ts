import { BirdType } from "../new-songs/base";
import { Song } from "../songs/song-utils";

export type Attack =
  | {
      type: "player";
      s: Phaser.GameObjects.Image;
    }
  | {
      type: "opponent";
      s: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    };

export type Turn =
  | {
      type: "opponent";
    }
  | {
      type: "player";
      song?: Song;
    }
  | {
      type: "shoot";
      nrOfShots: number;
    };

export const allNotes = [
  '§', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
] as const;

export const isNoteKey = (x: string): x is NoteKey => allNotes.includes(x as NoteKey); 

export type NoteKey = (typeof allNotes)[number];

export type Keys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  G: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
};

export type Player = {
  s: Phaser.GameObjects.Image;
  lineIndex: number;
};

export type KnifeState = {
  angle: number;
  angleUpper: number;
  angleLower: number;
  aimLineUpper: Phaser.GameObjects.Line;
  aimLineLower: Phaser.GameObjects.Line;
  spread: number;
};

export type Enemy = {
  s: Phaser.GameObjects.Sprite;
  pow: Phaser.GameObjects.Image;
  y: number;
  startY: number;
  birdType: BirdType;
  health: Phaser.GameObjects.Image[];
};
