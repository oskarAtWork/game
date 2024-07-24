import adamUrl from '../assets/adam.png';
import adamPlay1 from '../assets/adam-play-1.png';
import adamPlay2 from '../assets/adam-play-2.png';
import adamPlay3 from '../assets/adam-play-3.png';
import adamPlay4 from '../assets/adam-play-4.png';
import mollyUrl from '../assets/molly.png';
import oskarUrl from '../assets/oskar.png';
import biatareUrl from '../assets/biatare_sheet.png';
import tajgaUrl from '../assets/tajgablastjart_sheet.png';
import silkäsHägerUrl from '../assets/silkeshager_sheet.png';
import klaraUrl from '../assets/klara.png';
import spegelUrl from '../assets/spegel.png';
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
  scene.load.image('spegel', spegelUrl);
  
  scene.load.spritesheet('silkeshäger', silkäsHägerUrl, { frameWidth: 200, frameHeight: 200});
  scene.load.spritesheet('tajga', tajgaUrl, { frameWidth: 200, frameHeight: 200});
  scene.load.spritesheet('biatare', biatareUrl, { frameWidth: 200, frameHeight: 200});
  scene.load.image('klara', klaraUrl);

  scene.load.image('adam-play-1', adamPlay1);
  scene.load.image('adam-play-2', adamPlay2);
  scene.load.image('adam-play-3', adamPlay3);
  scene.load.image('adam-play-4', adamPlay4);
}

export type BirdNames = 'silkeshäger' | 'biatare' | 'tajga';
export type Names = 'oskar' | 'molly' | 'adam' | 'klara' | 'svan' | 'spegel' | BirdNames;

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

    case 'spegel':
      return 400;

    case 'silkeshäger':
    case 'biatare':
    case 'tajga':
    case 'svan':
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
