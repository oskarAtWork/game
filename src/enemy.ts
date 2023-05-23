
export type EffectStrength = 'much' | 'some' | 'none';

export type Enemy = {
  sleepy: EffectStrength;
  fearful: EffectStrength;
  groovy: EffectStrength;
  confused: EffectStrength;

  hasEarMuffs: boolean;
  health: number;
  text: Phaser.GameObjects.Text;
  s: Phaser.GameObjects.Image;
  sx: number;
  sy: number;
}

export const displayEnemyStats = (enemy: Enemy) => {
  const str = `
sleepy ${enemy.sleepy}
fearful ${enemy.fearful}
groovy ${enemy.groovy}
confused ${enemy.confused ? 'yes' : 'no'}
health: ${enemy.health}
  `.trim();

  enemy.text.text = str;
}