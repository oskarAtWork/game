import 'phaser';
// import backgroundUrl from '../../assets/livingroom_background.png';
import { Scene, getCurrentLevel, goToNextScene } from '../progression';
import { Line } from '../dialogue_script/scene-utils';
import { DialogPerson, Names, createPerson, preloadPeople, updatePerson } from '../dialog-person';
import { animation_weave } from '../animations';
import { Song, skaningen } from '../songs';
import { Sheet, createSheet } from '../sheet';
import { animationRecording } from '../animation-recording';
import { preload } from '../preload/preload';
import { exhaust } from '../helper';

export const dialogSceneKey = 'DialogScene' as const;

const BASE_LINE = 470;

const xPosition = (name: Names): number => {
  switch (name) {
    case 'adam':
      return 150;

    case 'molly':
      return 500;
      
    case 'oskar':
      return 700;

    case 'silkeshäger':
      return 500;
  
    default:
      exhaust(name);
      return 0;
  }
}


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
  let characters: Map<Names, DialogPerson>;


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


      this.add.image(0, 0, level.background).setOrigin(0, 0);


      scene = level.dialog;

      for (const line of scene) {
        if (!line.speaker) continue;
        if (characters.has(line.speaker)) continue;

        const enters = scene.some((s) => s.speaker === line.speaker && line.otherAction?.includes('enter'))

        characters.set(line.speaker, createPerson(this, line.speaker, xPosition(line.speaker), enters ? 1000 : BASE_LINE));
      }

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

            if (speaker) {
              let person = characters.get(speaker)!!;

              if (otherAction === 'enter_bottom') {
                person.target_y = BASE_LINE;
              }
              if (otherAction === 'exit') {
                person.target_y = -30;
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
      
      characters.forEach(c => {
        updatePerson(c, currentLine?.speaker === c.name, animationTimer, animation_weave);
      })

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

