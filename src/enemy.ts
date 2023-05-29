import { Boundary, centerX } from "./boundary";
import { BirdNames } from "./dialog-person";
import {Animation, animation_long_floaty} from './animations';

export type EffectStrength = 'much' | 'some';

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

export const upperBoundary = (): Boundary => ({
  left: 420,
  right: 710,
  top: 70,
  bottom: 200,
})

export const lowerBoundary = (): Boundary => ({
  left: 420,
  right: 710,
  top: 200,
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

export const ezEnemy = (name: BirdNames, maxHealth: number, nb = normalBoundary()): EnemyData => {
  const x = centerX(nb)
  const y = (nb.left + nb.right) / 2

  return {
    status: undefined,
    name,
    boundary: nb,
    defaultBoundary: nb,
    animation: {
      from: animation_long_floaty,
      to: undefined,
      blendT: 0,
      animationSpeed: 1,
      animationT: 0,
    },
    hasEarMuffs: false,
    maxHealth,
    health: maxHealth,
    speed: 1,
    x,
    y
  }
}

export type EnemyData = {
  status: {
    strength: EffectStrength;
    type: 'sleepy' | 'fearful' | 'hyped' | 'confused';
  } | undefined;
  name: BirdNames;
  boundary: Boundary;
  defaultBoundary: Boundary;
  animation: {
    from: Animation,
    to: Animation | undefined;
    blendT: number,

    animationT: number;
    animationSpeed: number;
  },
  hasEarMuffs: boolean;
  health: number;
  maxHealth: number;
  speed: number;
  x: number;
  y: number;
}

export type Enemy = EnemyData & {
  s: Phaser.GameObjects.Sprite;
  healthBar: {
    back: Phaser.GameObjects.Rectangle;
    front: Phaser.GameObjects.Rectangle;
  }
  text: Phaser.GameObjects.Text;
  attack: (enemy: Enemy) => void;
}

export function blendAnimation(animations: Enemy['animation']) {

  const tBottom = Math.floor(animations.animationT);
  const tTop = Math.ceil(animations.animationT);

  const roundOff = animations.animationT - tBottom;

  const fromBottom = animations.from[tBottom % animations.from.length];
  const fromTop = animations.from[tTop % animations.from.length];

  const to = animations.to ?? animations.from;

  const toBottom = to[tBottom % to.length];
  const toTop = to[tTop % to.length];

  return [
    (fromBottom[0] * (1-roundOff) + fromTop[0] * roundOff) * (1-animations.blendT) +
      (toBottom[0] * (1-roundOff) + toTop[0] * roundOff) * animations.blendT,
    (fromBottom[1] * (1-roundOff) + fromTop[1] * roundOff) * (1-animations.blendT) +
      (toBottom[1] * (1-roundOff) + toTop[1] * roundOff) * animations.blendT,
  ]
}