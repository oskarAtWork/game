import 'phaser';
import backgroundUrl from '../../assets/livingroom_background.png';
import { Scene, getCurrentLevel, goToNextScene } from '../progression';
import { Line } from '../dialogue_script/scene-utils';
import { DialogPerson, createPerson, preloadPeople, updatePerson } from '../dialog-person';
import {  animation_loopdiloop, animation_upAndDown, animation_weave } from '../animations';
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
  let adam: DialogPerson;
  let oskar: DialogPerson;
  let molly: DialogPerson;

  let scene: Scene;
  let currentLineIndex = 0;
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

      const BASE_LINE = 470;

      scene = level.dialog;

      this.add.image(0, 0, backgroundUrl).setOrigin(0, 0);

      const oskarEnters = scene.some((line) => line.speaker === 'oskar' && line.otherAction === 'enter');
      const adamEnters = scene.some((line) => line.speaker === 'adam' && line.otherAction === 'enter');
      const mollyEnters = scene.some((line) => line.speaker === 'molly' && line.otherAction === 'enter');

      adam = createPerson(this, 'adam', 300, adamEnters ? 1000 : BASE_LINE);
      oskar = createPerson(this, 'oskar', 700, oskarEnters ? 1000 : BASE_LINE);
      molly = createPerson(this, 'molly', 550, mollyEnters ? 1000 : BASE_LINE);

      const context = this; 

      this.input.keyboard!!.on('keydown', function (ev: KeyboardEvent) {
        ev.preventDefault();
        if (ev.key === ' ') {
          currentLineIndex += 1;

          const line = scene[currentLineIndex];


          if (line) {
            const {speaker, otherAction} = line;

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
        else if (ev.key === 'backspace') {
          currentLineIndex -= 1;
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
      } else {
        goToNextScene(this.scene);
      }
    },
  }
}


