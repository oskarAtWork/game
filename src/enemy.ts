import { Boundary } from "./boundary";
import { BirdNames } from "./dialog-person";

export type EffectStrength = 'much' | 'some' | 'none';

export const ENEMY_FRAME_NORMAL = 0;
export const ENEMY_FRAME_SLEEPY = 1;
export const ENEMY_FRAME_CONFUSED = 2;
export const ENEMY_FRAME_GROOVY = 3;

export const normalBoundary = (): Boundary => ({
  left: 420,
  right: 710,
  top: 70,
  bottom: 375,
})

export const scaredBoundary = (): Boundary => ({
  left: 650,
  right: 710,
  top: 70,
  bottom: 375,
})

export const braveBoundary = (): Boundary => ({
  left: 420,
  right: 520,
  top: 70,
  bottom: 375,
})

export type Enemy = {
  status: {
    strength: EffectStrength;
    type: 'sleepy' | 'fearful';
  } | undefined;

  name: BirdNames;

  healthBar: {
    back: Phaser.GameObjects.Rectangle;
    front: Phaser.GameObjects.Rectangle;
  }

  boundary: Boundary;

  hasEarMuffs: boolean;
  health: number;
  maxHealth: number;
  text: Phaser.GameObjects.Text;
  s: Phaser.GameObjects.Sprite;
  speed: number;
  x: number;
  y: number;
}
