import 'phaser';
import backgroundUrl from '../../assets/background.png';
import adamUrl from '../../assets/adam-talk.png';
import oskarUrl from '../../assets/oskar-talk.png';
import { Scene, getCurrenLevel, goToNextScene } from '../progression';
import { Line } from '../dialogue_script/scene-utils';

export const dialogSceneKey = 'DialogScene' as const;

export function dialog(): Phaser.Types.Scenes.SettingsConfig | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
  
  let currentDialog: Phaser.GameObjects.Text;
  let pastDialog: Phaser.GameObjects.Text;
  let adam: Phaser.GameObjects.Image;
  let oskar: Phaser.GameObjects.Image;

  let scene: Scene;

  let index = 0;

  return {
    key: dialogSceneKey,
    preload() {
      this.load.image(backgroundUrl, backgroundUrl);
      this.load.image(adamUrl, adamUrl);
      this.load.image(oskarUrl, oskarUrl);
    },
    create() {
      const level = getCurrenLevel();

      if (level.sceneKey !== 'DialogScene') {
        window.alert('Oh no, wrong level ' + JSON.stringify(level));
        throw Error('Oh no, wrong level');
      }

      scene = level.dialog;

      this.add.image(0, 0, backgroundUrl).setOrigin(0, 0);
      adam = this.add.image(300, 330, adamUrl).setOrigin(0.5, 1);
      oskar = this.add.image(700, 400, oskarUrl).setOrigin(0.5, 1);

      adam.rotation = -Math.PI/2;

      this.input.keyboard!!.on('keydown', function (ev: KeyboardEvent) {
        console.log(ev);
        ev.preventDefault();
        if (ev.key === ' ') {
          index += 1;
        }
      });

      currentDialog = this.add.text(400, 450, '', {
        align: 'center',
        fontSize: '1rem',
        color: '#34567a'
      }).setOrigin(0.5, 0.5);

      pastDialog = this.add.text(400, 420, '', {
        fontSize: '1rem',
        color: 'rgba(0, 0, 0, 0.1)'
      }).setOrigin(0.5, 0.5);
    },
    update() {
      const dialog: Line | undefined = scene[index];
      const lastDialog: Line | undefined = scene[index-1];

      if (index > 0) {
        adam.rotation = adam.rotation * 0.95;
        adam.x = adam.x * 0.95 + 100 * 0.05;
        adam.y = adam.y * 0.95 + 400 * 0.05;
      }

      if (dialog?.speaker === 'Oskar') {
        oskar.scale = oskar.scale * 0.95 + 1.1 * 0.05;
        oskar.y = oskar.y * 0.95 + 430 * 0.05;
      } else {
        oskar.scale = oskar.scale * 0.95 + 1 * 0.05;
        oskar.y = oskar.y * 0.95 + 420 * 0.05;
      }

      if (dialog?.speaker === 'Adam') {
        adam.scale = adam.scale * 0.95 + 1.1 * 0.05;
      } else {
        adam.scale = adam.scale * 0.95 + 1 * 0.05;
      }

      if (lastDialog) {
        pastDialog.text = lastDialog.speaker + ': ' + lastDialog.line;
      }

      if (dialog) {
        currentDialog.text = dialog.speaker + ': ' + dialog.line;
      } else {
        goToNextScene(this.scene);
      }
    },
  }
}
