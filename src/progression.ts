import { battleSceneKey } from "./scenes/battle-scene";
import { dialogSceneKey } from "./scenes/dialog-scene";
import 'phaser';

import scene1 from './dialogue_script/scene1';
import scene2 from './dialogue_script/scene2';
import scene3 from './dialogue_script/scene3';
import scene4 from './dialogue_script/scene4';

import { EnemyData, ezEnemy } from "./enemy";

type SceneKey = typeof dialogSceneKey | typeof battleSceneKey;
export type Scene = typeof scene1 | typeof scene2;

let x = window.location.pathname;

export let currentLevel = x.startsWith('/') && Number.parseInt(x[1]) ? Number.parseInt(x[1]) : 0;

export type BattleData = {
  enemies: EnemyData[], 
  strings: ('G' | 'D')[],
}

export type Level = {
  sceneKey: typeof dialogSceneKey;
  dialog: Scene;
  background: string;
} | {
  sceneKey: typeof battleSceneKey;
  battleData: BattleData;
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
      enemies: [ezEnemy('silkeshäger', 14)],
      strings: ['G'],
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
      enemies: [ezEnemy('biatare', 14)],
      strings: ['G', 'D'],
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