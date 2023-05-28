import { Boundary } from "./boundary";
import { BirdNames } from "./dialog-person";
import {Animation} from './animations';

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
  animation: {
    from: Animation,
    to: Animation | undefined;
    t: number,
  },
  hasEarMuffs: boolean;
  health: number;
  maxHealth: number;
  text: Phaser.GameObjects.Text;
  s: Phaser.GameObjects.Sprite;
  speed: number;
  x: number;
  y: number;
}


export function blendAnimation(animations: Enemy['animation'], animationTimer: number) {
  const from = animations.from[animationTimer % animations.from.length];

  if (!animations.to) {
    return from;
  }

  const to = animations.to[animationTimer % animations.to.length];

  return [
    from[0] * (1-animations.t) + to[0] * animations.t,
    from[1] * (1-animations.t) + to[1] * animations.t,
  ]
}