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

export type Names = 'oskar' | 'molly' | 'adam';

export function createPerson(scene: Phaser.Scene, name: Names, x: number, y: number): DialogPerson {

  return {
    name,
    s: scene.add.image(x, y, name).setOrigin(0.5, 1),
    x,
    y,
    target_x: x,
    target_y: y,

  }
}

export function updatePerson(person: DialogPerson, talking: boolean, animationT: number, animation: [number, number][]) {
  person.x = person.x * 0.9 + person.target_x * 0.1;
  person.y = person.y * 0.9 + person.target_y * 0.1;
  const [dx, dy] = animation[animationT % animation.length];
  person.s.x = person.x + (talking ? dx : 0);
  person.s.y = person.y + (talking ? dy : 0);
}
