

export type Sheet = {
  s: Phaser.GameObjects.Image;
  paddingLeft: number;
  paddingRight: number;
  paddingBottom: number; 
  paddingTop: number;
  innerWidth: () => number;
  innerX: () => number;
}

export function createSheet(scene: Phaser.Scene, y: number): Sheet {
  const obj = {
    s: scene.add.image(200, y, 'sheet').setOrigin(0, 0),
    paddingTop: 6,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10, 
  }

  return {
    ...obj,
    innerWidth: () => obj.s.displayWidth - (obj.paddingLeft + obj.paddingRight),
    innerX: () => obj.s.x + obj.paddingLeft,
  }
}