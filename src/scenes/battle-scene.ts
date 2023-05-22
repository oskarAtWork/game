import "phaser";
import backgroundUrl from '../../assets/forest_background.png';
import heartUrl from '../../assets/heart.png';

import { displayEnemyStats, Enemy } from "../enemy";
import { clearPlayedNotes, clearSong, playNote, scoreSong, skaningen, Song } from "../songs";
import { createSheet, Sheet } from "../sheet";
import { preload } from "../preload/preload";
import { getCurrentLevel } from "../progression";
import { createPerson, DialogPerson, preloadPeople, updatePerson } from "../dialog-person";
import { animation_demo, animation_empty} from "../animations";

type Turn = {
  type: 'select';
  text: string;
} | {
  type: 'play';
  text: string;
} | {
  type: 'effect';
  text: string;
  endAt: number;
  goTo: Turn;
} | {
  type: 'opponent';
  text: string;
  endAt: number;
  strength: number;
  goTo: Turn;
} | {
  type: 'win';
  text: string;
}

const TURN_SELECT = {
  type: 'select',
  text: 'Select a violin string'
} satisfies Turn;

const TURN_WIN = {
  type: 'win',
  text: 'Good job'
} satisfies Turn;

export const battleSceneKey = "BattleScene" as const;

export function battle():
  | Phaser.Types.Scenes.SettingsConfig
  | Phaser.Types.Scenes.CreateSceneFromObjectConfig {

  let enemy: Enemy;
  let player: DialogPerson;
  let sheet: Sheet;
  let line: {
    s: Phaser.GameObjects.Image;
    t: number;
  };
  let song: undefined | Song;
  let textObj: Phaser.GameObjects.Text;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[] = [];

  let turn: Turn = TURN_SELECT;
  let previousTurn: Turn | undefined = undefined;
  let hp: Phaser.GameObjects.Image[] = [];
  let animationTimer = 0;


  return {
    key: battleSceneKey,
    preload() {
      preload(this);
      preloadPeople(this);
      this.load.image('background', backgroundUrl);
      this.load.image('heart', heartUrl);
    },
    create() {
      const level = getCurrentLevel();

      if (level.sceneKey !== 'BattleScene') {
        window.alert('Oh no, wrong level, at battle scene ' + JSON.stringify(level));
        throw Error('Oh no, wrong level');
      }
      
      this.add.image(0, 0, 'background').setOrigin(0, 0);
      sheet = createSheet(this);

      line = {
        s: this.add.image(300, 20, 'line'),
        t: 0,
      };
      line.s.setOrigin(0, 0);
      line.s.setVisible(false);

      player = createPerson(this, 'adam', 200, 500);

      const enemyImage = this.add.image(650, 440, 'enemy')

      enemy = {
        s: enemyImage,
        text: this.add.text(650, 10, "", {
          fontSize: "20px",
          fontFamily: "Helvetica",
        }),
        sx: enemyImage.x,
        sy: enemyImage.y,
        confused: false,
        resistFear: 20,
        resistGroove: 30,
        resistSleep: 40,
        hasEarMuffs: false,
      };

      displayEnemyStats(enemy);

      this.add.image(0, 0, 'dialog').setOrigin(0, 0);

      for (let i = 0; i < 10; i++) {
        hp.push(this.add.image(20 + i * 30, 460, 'heart'));
      }

      this.input.keyboard?.on("keydown", (ev: { key: string }) => {
        const key = ev.key.toUpperCase();

        const el = document.getElementById("keypresses") as HTMLElement;
        if (key === "Q") {
          el.innerHTML += "," + line.t;
          return;
        } else if (key === "W") {
          el.innerHTML = "";
          return;
        }

        if (turn.type = 'select') {
          if (key === 'S') {
            this.sound.play('gasp');
            this.scene.start(battleSceneKey);
          } else if (key === 'D') {
            this.sound.play('skaningen');

            clearPlayedNotes(playedNotes);
            song = skaningen(this, sheet);

            line.s.setVisible(true);
            line.t = 0;
            turn = {
              type: 'play',
              text: 'Play using\n§1234567890'
            }
            return;
          }
        }

        const noteInfo = playNote(line.t, ev.key, song, sheet);

        if (noteInfo) {
          const note = { s: this.add.image(noteInfo.x, noteInfo.y, "note"), hit: noteInfo.hit };
          playedNotes.push(note);
        }
      });

      textObj = this.add.text(400, 500, '', {
        align: 'center',
        fontSize: '1rem',
        color: '#34567a'
      }).setOrigin(0.5, 0);
    },
    update() {
      animationTimer++;

      if (previousTurn !== turn) {
        previousTurn = turn;

        textObj.text = turn.text;

        if (turn.type === 'opponent') {
          for (let i = 0; i < turn.strength; i++) {
            hp.pop();
          }
        }
      }

      if (turn.type === 'effect' || turn.type === 'opponent') {
        if (animationTimer >= turn.endAt) {
          turn = turn.goTo;
        }
      }

      updatePerson(player, turn.type === 'play', animationTimer, animation_demo)

      if (song) {
        line.t += 1;

        line.s.x =
          sheet.innerX() +
          sheet.innerWidth() *
            ((line.t - song.startsAt) / (song.endsAt - song.startsAt));

        if (line.t > song.endsAt) {
          line.s.setVisible(false);
        }

        if (line.t > song.fullEnd) {
          clearSong(song);
          clearPlayedNotes(playedNotes);
        }

        if (line.t > song.endsAt && turn.type === 'play') {
          const score = scoreSong(playedNotes, song);

          let text: string;

          if (score > 0.7) {
            text = 'Very good';
          } else if (score > 0.3) {
            text = 'Ok...'
          } else {
            text = 'What was that?'
          }

          const leftOfSong = song.fullEnd - line.t;

          if (song.name === "skaningen") {
            enemy.resistFear -= 1 + score;
            displayEnemyStats(enemy);
          }

          turn = {
            type: 'effect',
            text,
            endAt: animationTimer + leftOfSong, // plus one second
            goTo: enemy.resistFear <= 0 ? TURN_WIN : {
              type: 'opponent',
              text: 'Imma attack you!!',
              strength: 3, 
              endAt: animationTimer + leftOfSong + 120,
              goTo: TURN_SELECT,
            }
          };
        }
      }

      if (enemy.resistFear <= 0) {
        enemy.s.x += 10;
        enemy.s.flipX = true;
      }
    },
  };
}

