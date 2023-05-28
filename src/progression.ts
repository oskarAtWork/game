import { battleSceneKey } from "./scenes/battle-scene";
import { dialogSceneKey } from "./scenes/dialog-scene";
import 'phaser';

import scene1 from './dialogue_script/scene1';
import scene2 from './dialogue_script/scene2';
import scene3 from './dialogue_script/scene3';
import scene4 from './dialogue_script/scene4';
import { Names } from "./dialog-person";

type SceneKey = typeof dialogSceneKey | typeof battleSceneKey;
export type Scene = typeof scene1 | typeof scene2;

let x = window.location.pathname;

export let currentLevel = x.startsWith('/') && Number.parseInt(x[1]) ? Number.parseInt(x[1]) : 0;

export type Level = {
  sceneKey: typeof dialogSceneKey;
  dialog: Scene;
  background: string;
} | {
  sceneKey: typeof battleSceneKey;
  battleData: {
    name: Exclude<Names, 'adam' | 'klara' | 'molly' | 'oskar'>,
  }
}

export const levels: Level[] = [

  {
    sceneKey: 'DialogScene',
    dialog: scene1,
    background: '/assets/livingroom_background.png',
  },
  {
    sceneKey: 'DialogScene',
    dialog: scene2,
    background: '/assets/forest_background.png',
  },
  {
    sceneKey: 'BattleScene',
    battleData: {
      name: 'silkeshäger',
    }
  },
  {
    sceneKey: 'DialogScene',
    dialog: scene3,
    background: '/assets/forest_background.png',
  },
  {
    sceneKey: 'DialogScene',
    dialog: scene4,
    background: '/assets/forest_background.png',
  },
  {
    sceneKey: 'BattleScene',
    battleData: {
      name: 'biatare',
    }
  },
]

export const getCurrentLevel = () => levels[currentLevel];

export function goToNextScene(scene: {start: (key: SceneKey) => void}) {
  currentLevel += 1;

  if (currentLevel >= levels.length) {
    window.alert('No more rooms')
    return false;
  }

  scene.start(levels[currentLevel].sceneKey);
  return true;
}