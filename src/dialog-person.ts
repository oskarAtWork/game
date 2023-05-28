import adamUrl from '../assets/adam.png';
import mollyUrl from '../assets/molly.png';
import oskarUrl from '../assets/oskar.png';
import biatareUrl from '../assets/biatare_normal.png';
import tajgablastjartUrl from '../assets/tajgablastjart_normal.png';
import silkäsHägerUrl from '../assets/silkeshager_normal.png';
import klaraUrl from '../assets/klara.png';
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
  scene.load.image('tajgablåstjärt', tajgablastjartUrl);
  scene.load.image('biatare', biatareUrl);
  scene.load.image('klara', klaraUrl);
}

export type Names = 'oskar' | 'molly' | 'adam' | 'klara' | 'silkeshäger' | 'biatare' | 'tajgablåstjärt';

export const xPosition = (name: Names): number => {
  switch (name) {
    case 'adam':
      return 150;

    case 'molly':
      return 500;
      
    case 'oskar':
      return 700;

    case 'klara':
      return 600;

    case 'silkeshäger':
    case 'biatare':
    case 'tajgablåstjärt':
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

  const x = enterAction?.from === 'left' ? -100 : enterAction?.from === 'right' ? 900 : defX;
  const y = enterAction?.from === 'top' ? -100 : enterAction?.from === 'bottom' ? 900 : defY;

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
  person.x = person.x * 0.95 + person.target_x * 0.05;
  person.y = person.y * 0.95 + person.target_y * 0.05;
  const [dx, dy] = animation[animationT % animation.length];
  person.s.x = person.x + (talking ? dx : 0);
  person.s.y = person.y + (talking ? dy : 0);
}
