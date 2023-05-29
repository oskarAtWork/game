import { Boundary } from "./boundary";

export type Player = {
  s: Phaser.GameObjects.Image;
  hyped: boolean;
  health: number;
  xsp: number;
  ysp: number;
}

export const playerBoundary: Boundary = {
  left: 100,
  right: 360,
  top: 60,
  bottom: 345,
}