

export type Enemy = {
  resistSleep: number; // G
  resistFear: number; // D
  resistGroove: number; // A
  resistConfuse: number; // E
  hasEarMuffs: boolean;
  text: Phaser.GameObjects.Text;
  s: Phaser.GameObjects.Image;
}

export const displayEnemyStats = (enemy: Enemy): string => {
  const str = `
resistSleep ${enemy.resistSleep}
resistFear ${enemy.resistFear}
resistGroove ${enemy.resistGroove}
resistConfuse ${enemy.resistConfuse}
  `.trim();

  enemy.text.text = str;
}