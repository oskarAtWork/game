
export type EffectStrength = 'much' | 'some' | 'none';

export const ENEMY_FRAME_NORMAL = 0;
export const ENEMY_FRAME_SLEEPY = 1;
export const ENEMY_FRAME_CONFUSED = 2;
export const ENEMY_FRAME_GROOVY = 3;

export type Enemy = {
  status: {
    strength: EffectStrength;
    type: 'sleepy' | 'fearful';
  } | undefined;

  healthBar: {
    back: Phaser.GameObjects.Rectangle;
    front: Phaser.GameObjects.Rectangle;
  }

  hasEarMuffs: boolean;
  health: number;
  maxHealth: number;
  text: Phaser.GameObjects.Text;
  s: Phaser.GameObjects.Sprite;
  speed: number;
  sx: number;
  sy: number;
}
