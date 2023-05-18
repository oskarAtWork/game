import { battleSceneKey } from "./scenes/battle-scene";
import { dialogSceneKey } from "./scenes/dialog-scene";
import { learnSceneKey } from "./scenes/learn-scene";
import 'phaser';

import scene1 from './dialogue_script/scene1_1';
import scene2 from './dialogue_script/scene1_2';
import scene3 from './dialogue_script/scene1_3';
import { skaningen } from "./songs";

type SceneKey = typeof learnSceneKey | typeof dialogSceneKey | typeof battleSceneKey;
export type Scene = typeof scene1 | typeof scene2 | typeof scene3;

export let currentLevel = 0;

export type Level = {
  sceneKey: typeof learnSceneKey;
  songName: string;
  song: typeof skaningen
} | {
  sceneKey: typeof dialogSceneKey;
  dialog: Scene
} | {
  sceneKey: typeof battleSceneKey;
  battleData: {
    enemies: number,
  }
}

export const levels: Level[] = [
  {
    sceneKey: 'DialogScene',
    dialog: scene1,
  },
  {
    sceneKey: 'LearnScene',
    songName: 'Skåningen',
    song: skaningen
  },
  {
    sceneKey: 'BattleScene',
    battleData: {
      enemies: 1,
    }
  }
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