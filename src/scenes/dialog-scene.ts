import 'phaser';
// import backgroundUrl from '../../assets/livingroom_background.png';
import { Scene, getCurrentLevel, goToNextScene } from '../progression';
import { Action, EnterAction, Line, isEnterAction } from '../dialogue_script/scene-utils';
import { DialogPerson, Names, createPerson, preloadPeople, updatePerson, xPosition, yPosition } from '../dialog-person';
import { animation_weave } from '../animations';
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
  let characters: Map<Names, DialogPerson>;

  const onNewSpokenLine = (context: Phaser.Scene, speaker: Names, otherAction: Action | undefined) => {
    let person = characters.get(speaker)!!;

    if (otherAction === 'enter_bottom' || otherAction === 'enter_top') {
      person.target_y = yPosition();
    }

    if (otherAction === 'enter_left' || otherAction === 'enter_right') {
      person.target_x = xPosition(speaker);
    }
    if (otherAction === 'exit') {
      person.target_y = -30;
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

        const enters = scene.find((s): s is Line<EnterAction> => s.speaker === line.speaker && isEnterAction(line))
        characters.set(line.speaker, createPerson(this, line.speaker, enters?.otherAction));
      }

      const context = this;

      if (scene[0].speaker) {
        onNewSpokenLine(context, scene[0].speaker, scene[0].otherAction)
      }

      this.input.keyboard!!.on('keydown', function (ev: KeyboardEvent) {
        ev.preventDefault();
        let switched = false;

        const resp = scene[currentLineIndex].response;

        if (ev.key === ' ' && !resp) {
          currentLineIndex += 1;
          switched = true;
        }

        if (resp) {
          for (let i = 0; i < resp.options.length; i++) {
            if (ev.key === (i+1).toString()) {
              if (i === resp.correctIndex) {
                currentLineIndex += 1;
              } else {
                currentLineIndex += 2;
              }
            }
          }
        }

        if (ev.key === 'Backspace' && okToBack(scene, currentLineIndex)) {

          currentLineIndex -= 1;
          switched = true;
        }

        if (switched) {
          const line = scene[currentLineIndex];


          if (line) {
            const { speaker, otherAction } = line;

            if (speaker) {
              onNewSpokenLine(context, speaker, otherAction);
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

          let txt = speaker(scene, currentLineIndex) + currentLine.line;

          currentLine.response?.options.forEach((element, i) => {
            txt += `\n${i+1}. ${element}`;
          });

          currentDialog.text = txt;
        } else {
          currentDialog.text = currentLine.line;
        }
      }
    },
  }
}

function speaker(scene: Scene, current: number) {
  const currentLine = scene[current];
  for (let i = current+1; i < scene.length; i++) {
    const line = scene[i];
    if (line.speaker === currentLine.speaker && line.otherAction === 'introduce') {
      return '???: ';
    }
  }
  return currentLine.speaker + ': ';
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

