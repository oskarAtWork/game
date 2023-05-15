import gaspUrl from "../assets/gasp.mp3";
import lineUrl from "../assets/line.png";
import skaningenUrl from "../assets/skaningen.mp3";
import playerUrl from "../assets/adam.png";
import sheetUrl from "../assets/sheet.png";
import backgroundUrl from "../assets/background.png";
import noteUrl from "../assets/note.png";
import enemyUrl from "../assets/uffe.png";

export function preload(scene: Phaser.Scene) {
    if (!scene.input.keyboard) {
        throw Error("no keyboard, what");
      }

      // audio
      scene.load.audio('gasp', gaspUrl);
      scene.load.audio('skaningen', skaningenUrl);

      // images
      scene.load.image('player', playerUrl);
      scene.load.image('enemy', enemyUrl);
      scene.load.image('line', lineUrl);
      scene.load.image('background', backgroundUrl);
      // so that we can easily refer to it in other files easily (level file)
      scene.load.image("note", noteUrl);
      scene.load.image("sheet", sheetUrl);
}