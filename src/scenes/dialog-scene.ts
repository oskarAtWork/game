import 'phaser';
// import backgroundUrl from '../../assets/livingroom_background.png';
import { Scene, getCurrentLevel, goToNextScene } from '../progression';
import { Line } from '../dialogue_script/scene-utils';
import { DialogPerson, createPerson, preloadPeople, updatePerson } from '../dialog-person';
import { animation_loopdiloop, animation_upAndDown, animation_weave } from '../animations';
import { Song, skaningen } from '../songs';
import { Sheet, createSheet } from '../sheet';
import { animationRecording } from '../animation-recording';
import { preload } from '../preload/preload';
// import lr from '../../assets/forest_background.png';

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
  let characters: Map<string, DialogPerson>;
  let adam: DialogPerson;
  let oskar: DialogPerson;
  let molly: DialogPerson;

  let scene: Scene;
  let currentLineIndex: number;
  let animationTimer: number;
  let learnState: LearnState;

  return {
    key: dialogSceneKey,
    preload() {
      const level = getCurrentLevel();
      if (level.sceneKey !== 'DialogScene') {
        window.alert('Oh no, wrong level at dialog ' + JSON.stringify(level));
        throw Error('Oh no, wrong level');
      }

      preload(this);
      //this.load.image(backgroundUrl, backgroundUrl);
      this.load.image(level.background, level.background);
      console.log(level.background);
      preloadPeople(this);
    },
    create() {
      characters = new Map();
      
      currentLineIndex = 0;
      animationTimer = 0;
      const level = getCurrentLevel();

      if (level.sceneKey !== 'DialogScene') {
        window.alert('Oh no, wrong level at dialog ' + JSON.stringify(level));
        throw Error('Oh no, wrong level');
      }

      const BASE_LINE = 470;

      scene = level.dialog;
      for (const line of scene) {
        characters.set(line.speaker, createPerson(this, line.speaker, 0, 0));
      }

      this.add.image(0, 0, level.background).setOrigin(0, 0);

      

      const oskarEnters = scene.some((line) => line.speaker === 'oskar' && line.otherAction === 'enter');
      const adamEnters = scene.some((line) => line.speaker === 'adam' && line.otherAction === 'enter');
      const mollyEnters = scene.some((line) => line.speaker === 'molly' && line.otherAction === 'enter');

      adam = createPerson(this, 'adam', 300, adamEnters ? 1000 : BASE_LINE);
      oskar = createPerson(this, 'oskar', 700, oskarEnters ? 1000 : BASE_LINE);
      molly = createPerson(this, 'molly', 550, mollyEnters ? 1000 : BASE_LINE);

      const context = this;

      this.input.keyboard!!.on('keydown', function (ev: KeyboardEvent) {
        ev.preventDefault();
        let switched = false;

        if (ev.key === ' ') {
          currentLineIndex += 1;
          switched = true;
        }

        if (ev.key === 'Backspace' && okToBack(scene, currentLineIndex)) {

          currentLineIndex -= 1;
          switched = true;
        }

        if (ev.key.toUpperCase() === 'S') {
          context.scene.restart();
        }

        if (switched) {
          const line = scene[currentLineIndex];

          if (line) {
            const { speaker, otherAction } = line;

            if (otherAction === 'enter') {
              if (speaker === 'oskar') {
                oskar.target_y = BASE_LINE;
              }

              if (speaker === 'molly') {
                molly.target_y = BASE_LINE;
              }

              if (speaker === 'adam') {
                adam.target_y = BASE_LINE;
              }
            }
            if (otherAction === 'exit') {
              if (speaker === 'oskar') {
                oskar.target_y = -1000;
              }

              if (speaker === 'molly') {
                molly.target_y = -1000;
              }

              if (speaker === 'adam') {
                adam.target_y = -1000;
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
          } else {
            goToNextScene(context.scene);
          }
        }
      });

      this.add.image(0, 0, 'dialog').setOrigin(0, 0);

      currentDialog = this.add.text(400, 500, '', {
        align: 'center',
        fontSize: '1rem',
        color: '#34567a',
        wordWrap: { width: 800, useAdvancedWrap: true }
      }).setOrigin(0.5, 0);

    },
    update() {
      const currentLine: Line | undefined = scene[currentLineIndex];

      animationTimer++;
      if (animationTimer < 0) animationTimer = 0;

      updatePerson(oskar, currentLine?.speaker === 'oskar', animationTimer, animation_weave);
      updatePerson(adam, currentLine?.speaker === 'adam', animationTimer, animation_loopdiloop);
      updatePerson(molly, currentLine?.speaker === 'molly', animationTimer, animation_upAndDown);

      const isDialog = currentLine?.speaker !== '';

      if (currentLine) {
        if (isDialog) {
          currentDialog.text = currentLine.speaker + ': ' + currentLine.line;
        } else {
          currentDialog.text = currentLine.line;
        }
      }
    },
  }
}


function okToBack(scene: Line[], currentLineIndex: number) {
  const prevLine = scene[currentLineIndex - 1];

  if (!prevLine) {
    return false;
  }

  if (prevLine.otherAction === 'sheet') {
    return false;
  }

  return true;
}

