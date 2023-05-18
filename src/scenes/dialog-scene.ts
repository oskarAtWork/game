import 'phaser';
import backgroundUrl from '../../assets/background.png';
import { Scene, getCurrentLevel, goToNextScene } from '../progression';
import { Line } from '../dialogue_script/scene-utils';
import { DialogPerson, createPerson, preloadPeople } from '../dialog-person';
import { loopdiloop, upAndDown, weave } from '../animations';
import { Song, skaningen } from '../songs';
import { Sheet, createSheet } from '../sheet';
import { animationRecording } from '../animation-recording';
import { preload } from '../preload/preload';

export const dialogSceneKey = 'DialogScene' as const;

type LearnState = {
  sheet: Sheet;
  line: {
    s: Phaser.GameObjects.Image;
    t: number,
  };
  currentNoteIndex: number;
  song: Song;
  playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[];
}

animationRecording();

export function dialog(): Phaser.Types.Scenes.SettingsConfig | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
  let currentDialog: Phaser.GameObjects.Text;
  let pastDialog: Phaser.GameObjects.Text;
  let adam: DialogPerson;
  let oskar: DialogPerson;
  let molly: DialogPerson;

  let scene: Scene;
  let index = 0;
  let animationTimer = 0;
  let learnState: LearnState;

  return {
    key: dialogSceneKey,
    preload() {
      preload(this);
      this.load.image(backgroundUrl, backgroundUrl);
      preloadPeople(this);
    },
    create() {
      const level = getCurrentLevel();

      if (level.sceneKey !== 'DialogScene') {
        window.alert('Oh no, wrong level at dialog ' + JSON.stringify(level));
        throw Error('Oh no, wrong level');
      }

      scene = level.dialog;

      this.add.image(0, 0, backgroundUrl).setOrigin(0, 0);

      const oskarEnters = scene.some((line) => line.speaker === 'oskar' && line.otherAction === 'enter');
      const adamEnters = scene.some((line) => line.speaker === 'adam' && line.otherAction === 'enter');
      const mollyEnters = scene.some((line) => line.speaker === 'molly' && line.otherAction === 'enter');

      adam = createPerson(this, 'adam', 300, adamEnters ? 1000 : 330);
      oskar = createPerson(this, 'oskar', 700, oskarEnters ? 1000 : 330);
      molly = createPerson(this, 'molly', 550, mollyEnters ? 1000 : 330);

      const context = this; 

      this.input.keyboard!!.on('keydown', function (ev: KeyboardEvent) {
        ev.preventDefault();
        if (ev.key === ' ') {
          index += 1;

          const line = scene[index];


          if (line) {
            const {speaker, otherAction} = line;

            if (otherAction === 'enter') {
              if (speaker === 'oskar') {
                oskar.target_y = 330;
              }
    
              if (speaker === 'molly') {
                molly.target_y = 330;
              }
    
              if (speaker === 'adam') {
                adam.target_y = 330;
              }
            }
  
            if (otherAction === 'sheet') {
              const sheet = createSheet(context);
              learnState = {
                sheet,
                line: {
                  s: context.add.image(-1000, sheet.s.y, 'line'),
                  t: 0,
                },
                currentNoteIndex: 0,
                song: skaningen(context, sheet),
                playedNotes: [],
              }

              learnState.line.s.setOrigin(0, 0);
              learnState.line.s.setVisible(false);
            }
          }
        }
      });

      currentDialog = this.add.text(400, 450, '', {
        align: 'center',
        fontSize: '1rem',
        color: '#34567a'
      }).setOrigin(0.5, 0);

      pastDialog = this.add.text(400, 420, '', {
        fontSize: '1rem',
        color: 'rgba(0, 0, 0, 0.1)'
      }).setOrigin(0.5, 0);
    },
    update() {
      const dialog: Line | undefined = scene[index];
      const lastDialog: Line | undefined = scene[index-1];
      animationTimer++;
      if (animationTimer < 0) animationTimer = 0;

      updatePerson(oskar, dialog?.speaker === 'oskar', animationTimer, weave);
      updatePerson(adam, dialog?.speaker === 'adam', animationTimer, loopdiloop);
      updatePerson(molly, dialog?.speaker === 'molly', animationTimer, upAndDown);

      const isDialog = dialog.speaker !== '';

      pastDialog.setVisible(!isDialog);
      if (lastDialog) {
        pastDialog.text = lastDialog.speaker + ': ' + lastDialog.line;
      }

      if (dialog) {
        if (isDialog) {
          currentDialog.text = dialog.speaker + ': ' + dialog.line;
        } else {
          currentDialog.text = dialog.line;
        }
      } else {
        goToNextScene(this.scene);
      }
    },
  }
}

function updatePerson(person: DialogPerson, talking: boolean, animationT: number, animation: [number, number][]) {
  person.x = person.x * 0.9 + person.target_x * 0.1;
  person.y = person.y * 0.9 + person.target_y * 0.1;
  const [dx, dy] = animation[animationT % animation.length];
  person.s.x = person.x + (talking ? dx : 0);
  person.s.y = person.y + (talking ? dy : 0);
}

