import adamUrl from '../assets/adam.png';
import mollyUrl from '../assets/molly.png';
import oskarUrl from '../assets/oskar.png';
import silkäsHägerUrl from '../assets/silkeshager_normal.png';
import { EnterAction } from './dialogue_script/scene-utils';
import { exhaust } from './helper';


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
  scene.load.image('silkeshäger', silkäsHägerUrl);
}

export type Names = 'oskar' | 'molly' | 'adam' | 'silkeshäger';

export const xPosition = (name: Names): number => {
  switch (name) {
    case 'adam':
      return 150;

    case 'molly':
      return 500;
      
    case 'oskar':
      return 700;

    case 'silkeshäger':
      return 500;
  
    default:
      exhaust(name);
      return 0;
  }
}

export const yPosition = () => 470;

export function createPerson(scene: Phaser.Scene, name: Names, enterAction?: EnterAction): DialogPerson {
  const defX = xPosition(name);
  const defY = yPosition();

  const x = enterAction === 'enter_left' ? -100 : enterAction === 'enter_right' ? 900 : defX;
  const y = enterAction === 'enter_top' ? -100 : enterAction === 'enter_bottom' ? 900 : defY;

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
  person.x = person.x * 0.8 + person.target_x * 0.2;
  person.y = person.y * 0.8 + person.target_y * 0.2;
  const [dx, dy] = animation[animationT % animation.length];
  person.s.x = person.x + (talking ? dx : 0);
  person.s.y = person.y + (talking ? dy : 0);
}
