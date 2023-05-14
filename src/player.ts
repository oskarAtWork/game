
export type Player = {
  s: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
  hp: number;
}

export const displayPlayerStats = (player: Player) => {
  const str = `
hp ${player.hp}
  `.trim();

  player.text.text = str;
}