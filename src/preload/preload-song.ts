import gaspUrl from "../../assets/gasp.mp3";
import skaningenUrl from "../../assets/skaningen.mp3";
import sovningenUrl from "../../assets/Sovingen.mp3";
import knifeSongUrl from "../../assets/Taljkniv.mp3";

export function preloadSongs(scene: Phaser.Scene) {
  scene.load.audio('gasp', gaspUrl);
  scene.load.audio('skaningen', skaningenUrl);
  scene.load.audio('sovningen', sovningenUrl);
  scene.load.audio('knifeSong', knifeSongUrl);
}
