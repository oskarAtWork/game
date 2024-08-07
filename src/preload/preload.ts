import lineUrl from "../../assets/line.png";
import dialogBoxUrl from "../../assets/dialogue_box.png";

import playerUrl from "../../assets/adam.png";
import sheetUrl from "../../assets/sheet.png";

import noteUrl from "../../assets/note.png";
import enemyUrl from "../../assets/uffe.png";

export function preload(scene: Phaser.Scene) {
  // images
  scene.load.image("player", playerUrl);
  scene.load.image("enemy", enemyUrl);
  scene.load.image("enemy", enemyUrl);
  scene.load.image("line", lineUrl);

  // so that we can easily refer to it in other files easily (level file)
  scene.load.image("note", noteUrl);
  scene.load.image("sheet", sheetUrl);

  scene.load.image("dialog", dialogBoxUrl);
}
