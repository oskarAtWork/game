

import * as Phaser from 'phaser';
import glitterUrl from '../assets/glitter.png';
import glitterGoldUrl from '../assets/glitter-gold.png';

export type Bar = (health: number, target: number, at: number) => void;

export function createBar(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  x: number,
  y: number,
  width: number,
  height: number
): Bar {
  // Create the glitter effect for the health bar
  const glitter = scene.add.image(x, y, 'glitter');
  glitter.setOrigin(0.5).setScale(2).setAlpha(1);

  const glitter2 = scene.add.image(x, y, 'glitter');
  glitter2.setOrigin(0.5).setScale(2).setAlpha(1).setBlendMode(Phaser.BlendModes.ADD);

  const glitterGold = scene.add.image(x, y, 'glitterGold');
  glitterGold.setOrigin(0.5).setScale(2).setAlpha(1);

  const glitterGold2 = scene.add.image(x, y, 'glitterGold');
  glitterGold2.setOrigin(0.5).setScale(2).setAlpha(1).setBlendMode(Phaser.BlendModes.ADD);

  // Create the mask for the health bar
  const mask = scene.add.graphics();
  mask.fillRect(x, y, width, height).setVisible(false);

  const outline = scene.add.graphics();
  outline.lineStyle(2, 0x000000);
  outline.strokeRect(x, y, width, height);

  container.add(glitter);
  container.add(glitter2);
  container.add(glitterGold);
  container.add(glitterGold2);
  container.add(outline);

  // Apply the mask to the glitter image
  const geoMask = new Phaser.Display.Masks.GeometryMask(scene, mask);
  glitter.mask = geoMask;
  glitter2.mask = geoMask;
  glitterGold.mask = geoMask;
  glitterGold2.mask = geoMask;

  let maskHeight = 0;

  // Update the mask position based on health value (0 to 1)
  const updateHealthBar = (fraction: number, target: number, at: number): void => {
    glitter.setAngle(at * 0.5).setAlpha(fraction <= target ? 1 : 0)
    glitter2.setAngle(-at * 0.5).setAlpha(fraction <= target ? 1 : 0)
    glitterGold.setAngle(at * 0.5).setAlpha(fraction > target ? 1 : 0)
    glitterGold2.setAngle(-at * 0.5).setAlpha(fraction > target ? 1 : 0)

    maskHeight = anim(maskHeight, height * fraction);

    mask.clear();
    mask.fillRect(
      x,
      y + height - maskHeight + container.y,
      width,
      maskHeight
    )
  };

  return updateHealthBar;
}

export function loadBar(scene: Phaser.Scene): void {
  // Load the necessary assets
  scene.load.image('glitter', glitterUrl);
  scene.load.image('glitterGold', glitterGoldUrl);
}


const anim = (from: number, to: number) => {
  return from * 0.95 + to * 0.05;
};