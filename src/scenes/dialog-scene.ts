import "phaser";
// import backgroundUrl from '../../assets/livingroom_background.png';
import { Scene, getCurrentLevel, goToNextScene } from "../progression";
import { EnterAction, Line } from "../dialogue_script/scene-utils";
import {
  DialogPerson,
  Names,
  createPerson,
  preloadPeople,
  updatePerson,
  xPosition,
  yPosition,
} from "../dialog-person";
import { animation_weave } from "../animations";
import { skaningen, sovningen } from "../songs/songs";
import { Song, clearPlayedNotes, playNote, scoreSong } from "../songs/song-utils";
import { Sheet, createSheet } from "../sheet";
import { animationRecording } from "../animation-recording";
import { preload } from "../preload/preload";
import { preloadSongs } from "../preload/preload-song";

export const dialogSceneKey = "DialogScene" as const;

type LearnState = {
  sheet: Sheet;
  line: {
    s: Phaser.GameObjects.Image;
  };
  currentNoteIndex: number;
  song: Song;
  playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[];
  state?: 'failed' | 'passed' | 'playing';
};

let delay = 0;

document.getElementById("range")?.addEventListener("change", (ev) => {
  delay = Number.parseInt((ev.target as HTMLInputElement).value);
  console.htmlLog(delay)
});

animationRecording();

export function dialog():
  | Phaser.Types.Scenes.SettingsConfig
  | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
  let currentDialog: Phaser.GameObjects.Text;
  let characters: Map<Names, DialogPerson>;
  let lastT: number;
  let scene: Scene;
  let currentLineIndex: number;
  let animationTimer: number;
  let learnState: LearnState | undefined;

  const getT = () => Date.now() - delay - lastT;

  const onNewLine = (context: Phaser.Scene, line: Line) => {
    const otherAction = line.otherAction;



    if (line.speaker) {
      let person = characters.get(line.speaker)!!;
      if (otherAction?.type === "enter") {
        const from = otherAction.from;

        if (from === "bottom" || from === "top") {
          person.target_y = yPosition();
        } else if (from === "left" || from === "right") {
          person.target_x = xPosition(line.speaker);
        }
      }

      if (otherAction?.type === "exit") {
        const to = otherAction.to;

        if (to === "top") {
          person.target_y = -100;
        } else if (to === "bottom") {
          person.target_y = 800;
        } else if (to === "right") {
          person.target_x = 900;
        } else if (to === "left") {
          person.target_x = -200;
        }
      }
    }

    if (otherAction?.type === "sheet") {
      let song: Song;

      const sheet = createSheet(context);

      if (otherAction.song === "sovningen") {
        song = sovningen(context, sheet);
      } else if (otherAction.song === "skaningen") {
        song = skaningen(context, sheet);
      } else {
        throw Error("add more songs here");
      }

      learnState = {
        sheet,
        line: {
          s: context.add.image(-1000, sheet.s.y, "line"),
        },
        currentNoteIndex: 0,
        song,
        playedNotes: [],
      };

      learnState.line.s.setOrigin(0, 0);
    }

    if (otherAction?.type === "play" && learnState) {
      clearPlayedNotes(learnState.playedNotes);
      context.sound.play(learnState.song.name);
      lastT = Date.now();
      learnState.state = 'playing';
    }
  };

  return {
    key: dialogSceneKey,
    preload() {
      const level = getCurrentLevel();
      if (level.sceneKey !== "DialogScene") {
        window.alert("Oh no, wrong level at dialog " + JSON.stringify(level));
        throw Error("Oh no, wrong level");
      }

      preloadSongs(this);

      preload(this);
      this.load.image(level.background, level.background);
      preloadPeople(this);
    },
    create() {
      characters = new Map();

      currentLineIndex = 0;
      animationTimer = 0;
      const level = getCurrentLevel();

      if (level.sceneKey !== "DialogScene") {
        window.alert("Oh no, wrong level at dialog " + JSON.stringify(level));
        throw Error("Oh no, wrong level");
      }

      this.add.image(0, 0, level.background).setOrigin(0, 0);

      scene = level.dialog;

      for (const line of scene) {
        if (!line.speaker) continue;
        if (characters.has(line.speaker)) continue;

        const enters = scene.find(
          (s): s is Line<EnterAction> =>
            s.speaker === line.speaker && line.otherAction?.type === "enter"
        );
        characters.set(
          line.speaker,
          createPerson(this, line.speaker, enters?.otherAction)
        );
      }

      const context = this;

      onNewLine(context, scene[0]);

      this.input.keyboard!!.on("keydown", function (ev: KeyboardEvent) {
        ev.preventDefault();

        if (learnState?.state === 'playing') {
          const now = getT();
          const noteInfo = playNote(
            now,
            ev.key,
            learnState.song,
            learnState.sheet
          );

          if (noteInfo) {
            const note = {
              s: context.add.image(noteInfo.x, noteInfo.y, "note"),
              hit: noteInfo.hit,
            };
            learnState.playedNotes.push(note);
          }
          return;
        }

        let switched = false;

        const resp = scene[currentLineIndex].response;

        if (ev.key === " " && !resp) {

          if (learnState?.state !== 'failed') {
            const isAnswer = scene[currentLineIndex - 1]?.response?.correctIndex;

            currentLineIndex += isAnswer ? 2 : 1;
            switched = true;
          }
        }

        if (resp?.options) {
          for (let i = 0; i < resp.options.length; i++) {
            if (ev.key === (i + 1).toString()) {
              if (i === resp.correctIndex || typeof resp.correctIndex === 'undefined') {
                currentLineIndex += 1;
                switched = true;
              } else {
                currentLineIndex += 2;
                switched = true;
              }
            }
          }
        }

        if (ev.key === "Backspace") {
          if (learnState?.state === 'failed' || learnState?.state === 'passed') {
            switched = true;
          } else if (okToBack(scene, currentLineIndex)) {
            currentLineIndex -= 1;
            switched = true;
          }
        }

        if (switched) {
          const line = scene[currentLineIndex];

          if (line) {
            onNewLine(context, line);
          } else {
            goToNextScene(context.scene);
          }
        }
      });

      this.add.image(0, 0, "dialog").setOrigin(0, 0);

      currentDialog = this.add
        .text(400, 500, "", {
          align: "center",
          fontSize: "1rem",
          color: "#34567a",
          wordWrap: { width: 800, useAdvancedWrap: true },
        })
        .setOrigin(0.5, 0);
    },
    update() {
      animationTimer++;
      if (animationTimer < 0) animationTimer = 0;

      if (learnState) {
        const timeSinceStart = getT();
        learnState.line.s.x =
          learnState.sheet.innerX() +
          learnState.sheet.innerWidth() *
            ((timeSinceStart - learnState.song.startsAt) /
              (learnState.song.endsAt - learnState.song.startsAt));

        learnState.line.s.setVisible(learnState.state === 'playing');

        if (timeSinceStart > learnState.song.endsAt) {
          const score = scoreSong(learnState.playedNotes, learnState.song);

          if (score < 0.5) {
            clearPlayedNotes(learnState.playedNotes)
            learnState.state = 'failed';
          } else {
            learnState.state = 'passed';
          }
        }
      }

      const currentLine: Line | undefined = scene[currentLineIndex];

      characters.forEach((c) => {
        updatePerson(
          c,
          currentLine?.speaker === c.name,
          animationTimer,
          animation_weave
        );
      });

      const isDialog = currentLine?.speaker !== "";

      if (currentLine) {
        if (isDialog) {
          let txt = speaker(scene, currentLineIndex) + currentLine.line;

          currentLine.response?.options.forEach((element, i) => {
            txt += `\n${i + 1}. ${element}`;
          });

          currentDialog.text = txt;
        } else if (currentLine.otherAction?.type === 'play' && learnState) {

          if (learnState.state === 'failed') {
            currentDialog.text = currentLine.otherAction.failMessage;
          } else if (learnState.state === 'passed') {
            currentDialog.text = currentLine.otherAction.successMessage;
          } else if (learnState.state === 'playing') {
            currentDialog.text = 'Play with §1234567890';
          }
        } else {
          currentDialog.text = currentLine.line;
        }
      }
    },
  };
}

function speaker(scene: Scene, current: number) {
  const currentLine = scene[current];
  const introduction = scene.findIndex(
    (line) =>
      line.otherAction?.type === "introduce" &&
      line.speaker === currentLine.speaker
  );

  if (introduction <= current) {
    return currentLine.speaker + ": ";
  }

  return "???: ";
}

function okToBack(scene: Line[], currentLineIndex: number) {
  const prevLine = scene[currentLineIndex - 1];

  if (!prevLine) {
    return false;
  }

  if (prevLine.otherAction?.type === "sheet") {
    return false;
  }

  return true;
}
