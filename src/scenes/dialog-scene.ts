import 'phaser';
import backgroundUrl from '../../assets/background.png';
import adamUrl from '../../assets/adam-talk.png';

export const dialogSceneKey = 'DialogScene';

export function dialog(): Phaser.Types.Scenes.SettingsConfig | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
  return {
    key: dialogSceneKey,
    preload() {
      this.load.image(backgroundUrl, backgroundUrl);
      this.load.image(adamUrl, adamUrl);
    },
    create() {
      this.add.image(0, 0, backgroundUrl).setOrigin(0, 0);
      this.add.image(100, 0, adamUrl).setOrigin(0, 0);
    },
    update() {

    },
  }
}
