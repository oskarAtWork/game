import { Boundary, centerX } from "./boundary";
import { BirdNames } from "./dialog-person";
import {Animation, animation_long_floaty} from './animations';
import { exhaust } from "./helper";

export type EffectType = 'sleepy' | 'fearful' | 'hyped' | 'confused';

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

export type EnemyData = {
  status: {
    type: EffectType;
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
  resistances: Record<EffectType, number>;
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

export const ezEnemy = (name: BirdNames, maxHealth: number, nb = normalBoundary()): EnemyData => {
  const x = centerX(nb)
  const y = (nb.left + nb.right) / 2

  let resistances: EnemyData['resistances'];

  if (name === 'biatare') {
    resistances = {
      fearful: 0.6,
      sleepy: 0.9,
      hyped: 0.6,
      confused: 0.6,
    };
  } else if (name === 'silkeshäger') {
    resistances = {
      fearful: 0.7,
      sleepy: 0.5,
      hyped: 0.6,
      confused: 0.8,
    };
  } else if (name === 'tajga') {
    resistances = {
      fearful: 0.7,
      sleepy: 0.5,
      hyped: 0.6,
      confused: 0.5,
    };
  } else {
    exhaust(name);
    window.alert(`Unknown bird name ${name}`)
    resistances = {
      fearful: 0,
      sleepy: 0,
      hyped: 0,
      confused: 0,
    }
  }


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
    resistances,
    x,
    y
  }
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

export function getFrame(status: EffectType | undefined) {
  switch (status) {
    case "sleepy":
      return ENEMY_FRAME_SLEEPY;
    case "confused":
      return ENEMY_FRAME_CONFUSED;
    case "hyped":
      return ENEMY_FRAME_GROOVY;
  }

  return ENEMY_FRAME_NORMAL;
}