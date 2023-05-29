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

export const ezEnemy = (name: BirdNames, maxHealth: number, placement?: 'top' | 'bottom'): EnemyData => {
  let nb: Boundary;
  
  if (placement === 'bottom') {
    nb = lowerBoundary();
  } else if (placement === 'top') {
    nb = upperBoundary();
  } else {
    nb = normalBoundary();
  }

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
      t: 0,
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
    type: 'sleepy' | 'fearful';
  } | undefined;
  name: BirdNames;
  boundary: Boundary;
  defaultBoundary: Boundary;
  animation: {
    from: Animation,
    to: Animation | undefined;
    t: number,
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