import { battleSceneKey } from "./scenes/battle-scene";
import { dialogSceneKey } from "./scenes/dialog-scene";
import "phaser";

import scene1 from "./dialogue_script/scene1";
import scene2 from "./dialogue_script/scene2";
import scene3 from "./dialogue_script/scene3";
import scene4 from "./dialogue_script/scene4";
import scene5 from "./dialogue_script/scene5";
import finalScene from "./dialogue_script/final_scene";

import { EnemyData, ezEnemy } from "./enemy";
import { testSceneKey } from "./scenes/test-scene";

type SceneKey =
  | typeof dialogSceneKey
  | typeof battleSceneKey
  | typeof testSceneKey;
export type Scene = typeof scene1 | typeof scene2;

let x = window.location.pathname;

export let currentLevel =
  x.startsWith("/") && Number.parseInt(x[1]) ? Number.parseInt(x[1]) : 0;

export type BattleData = {
  enemies: EnemyData[];
  strings: ("G" | "D")[];
};

export type Level =
  | {
      sceneKey: typeof dialogSceneKey;
      dialog: Scene;
      background: string;
    }
  | {
      sceneKey: typeof battleSceneKey | typeof testSceneKey;
      battleData: BattleData;
    };

export const levels: Level[] = [
  {
    sceneKey: "DialogScene",
    dialog: scene1,
    background: "/assets/livingroom_background.png",
  },
  {
    sceneKey: "DialogScene",
    dialog: scene2,
    background: "/assets/forest_background.png",
  },
  {
    sceneKey: "BattleScene",
    battleData: {
      enemies: [ezEnemy("silkeshäger", 13)],
      strings: ["G"],
    },
  },
  {
    sceneKey: "DialogScene",
    dialog: scene3,
    background: "/assets/forest_background.png",
  },
  {
    sceneKey: "DialogScene",
    dialog: scene4,
    background: "/assets/forest_background.png",
  },
  {
    sceneKey: "BattleScene",
    battleData: {
      enemies: [ezEnemy("biatare", 14)],
      strings: ["D"],
    },
  },
  {
    sceneKey: "DialogScene",
    dialog: scene5,
    background: "/assets/forest_background.png",
  },
  {
    sceneKey: "TestScene",
    battleData: {
      enemies: [
        ezEnemy("biatare", 6),
        ezEnemy("silkeshäger", 6),
        ezEnemy("tajga", 6),
      ],
      strings: ["D"],
    },
  },
  {
    sceneKey: "DialogScene",
    dialog: finalScene,
    background: "/assets/mountain_bkg.png",
  },
];

export const getCurrentLevel = () => levels[currentLevel];

export function goToNextScene(scene: { start: (key: SceneKey) => void }) {
  currentLevel += 1;

  if (currentLevel >= levels.length) {
    window.alert("Det var allt, gott folk, hejdå");
    return false;
  }

  scene.start(levels[currentLevel].sceneKey);
  return true;
}
