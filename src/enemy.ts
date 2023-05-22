

export type Enemy = {
  resistSleep: number; // G
  resistFear: number; // D
  resistGroove: number; // A
  confused: boolean; // E
  hasEarMuffs: boolean;
  text: Phaser.GameObjects.Text;
  s: Phaser.GameObjects.Image;
  sx: number;
  sy: number;
}

export const displayEnemyStats = (enemy: Enemy) => {
  const str = `
resistSleep ${enemy.resistSleep}
resistFear ${enemy.resistFear}
resistGroove ${enemy.resistGroove}
confused ${enemy.confused ? 'yes' : 'no'}
  `.trim();

  enemy.text.text = str;
}