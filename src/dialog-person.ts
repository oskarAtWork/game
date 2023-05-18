import adamUrl from '../assets/adam.png';
import mollyUrl from '../assets/molly.png';
import oskarUrl from '../assets/oskar.png';


export type DialogPerson = {
  s: Phaser.GameObjects.Image; 
  name: string;
  target_x: number;
  target_y: number;
  x: number,
  y: number;

}

export function preloadPeople(scene: Phaser.Scene) {
  scene.load.image('adam', adamUrl);
  scene.load.image('molly', mollyUrl);
  scene.load.image('oskar', oskarUrl);
}

export function createPerson(scene: Phaser.Scene, name: 'oskar' | 'molly' | 'adam', x: number, y: number): DialogPerson {

  return {
    name,
    s: scene.add.image(x, y, name).setOrigin(0.5, 1),
    x,
    y,
    target_x: x,
    target_y: y,

  }
}

