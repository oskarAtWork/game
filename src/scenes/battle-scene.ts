import "phaser";
import backgroundUrl from '../../assets/forest_background.png';
import heartUrl from '../../assets/heart.png';
import knifeUrl from '../../assets/knife.png';


import { displayEnemyStats, EffectStrength, Enemy } from "../enemy";
import { clearPlayedNotes, clearSong, playNote, scoreSong, skaningen, Song } from "../songs";
import { createSheet, Sheet } from "../sheet";
import { preload } from "../preload/preload";
import { getCurrentLevel } from "../progression";
import { createPerson, DialogPerson, preloadPeople, updatePerson } from "../dialog-person";
import { animation_demo} from "../animations";

type Turn = {
  type: 'select';
  text: string;
  endAt?: never;
} | {
  type: 'play';
  text: string;
  endAt?: never;
} | {
  type: 'effect';
  text: string;
  endAt: number;
} | 
{
  type: 'shoot';
  text: string;
  shots: number;
  endAt?: never;
} | {
  type: 'opponent';
  text: string;
  endAt: number;
  strength: number;
} | {
  type: 'win';
  text: string;
  endAt?: never;
}

const TURN_SELECT = {
  type: 'select',
  text: 'Select a violin string',
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
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[];

  let turn: Turn = TURN_SELECT;
  let previousTurn: Turn | undefined = undefined;
  let hp: Phaser.GameObjects.Image[];
  let animationTimer: number;
  let attacks: Phaser.GameObjects.Image[];

  return {
    key: battleSceneKey,
    preload() {
      preload(this);
      preloadPeople(this);
      this.load.image('background', backgroundUrl);
      this.load.image('heart', heartUrl);
      this.load.image('knife', knifeUrl)
    },
    create() {
      animationTimer = 0;
      playedNotes = [];
      hp = [];
      attacks = [];
      const level = getCurrentLevel();

      if (level.sceneKey !== 'BattleScene') {
        window.alert('Oh no, wrong level, at battle scene ' + JSON.stringify(level));
        throw Error('Oh no, wrong level');
      }
      
      const br = this.add.image(0, 0, 'background').setOrigin(0, 0);
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
        health: 20,
        confused: 'none',
        fearful: 'none',
        groovy: 'none',
        sleepy: 'none',
        hasEarMuffs: false,
      };

      displayEnemyStats(enemy);

      this.add.image(0, 0, 'dialog').setOrigin(0, 0);

      for (let i = 0; i < 10; i++) {
        hp.push(this.add.image(20 + i * 30, 460, 'heart'));
      }
      
      br.setInteractive().on('pointerdown', (ev: Phaser.Input.Pointer) => {
        const knife = this.add.image(player.x, player.y, 'knife');

        knife.angle = Phaser.Math.RadToDeg(Math.atan2(ev.y - player.y, ev.x - player.y));
        console.log('created knife at', player.x, player.y, knife.angle)
      })

      this.input.on('mousedown', () => {
        console.log('Hi')
      })

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

      for (const knife of attacks) {
        knife.x += Math.cos(Phaser.Math.DegToRad(knife.angle));
        knife.y += Math.sin(Phaser.Math.DegToRad(knife.angle));
      }

      if (previousTurn !== turn) {
        previousTurn = turn;

        textObj.text = turn.text;

        if (turn.type === 'opponent') {
          for (let i = 0; i < turn.strength; i++) {
            hp.pop();
          }
        }
      }

      if (turn.type === 'shoot') {
        if (turn.shots === 0) {
          turn = {
            type: 'opponent',
            strength: 5,
            endAt: animationTimer + 60,
            text: 'Caw caaw'
          }
        }
      }


      if (typeof turn.endAt === "number" && animationTimer >= turn.endAt) {
        if (turn.type === 'effect') {
          turn = {
            type: 'shoot',
            text: 'Click to shoot',
            shots: 5,
          }
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
          const score = scoreSong(playedNotes, song);

          let text: string;
          let effect: EffectStrength;

          if (score > 0.7) {
            text = 'Very good';
            enemy.fearful = 'much';
          } else if (score > 0.3) {
            text = 'Ok...'
            effect = 'some';
            enemy.fearful = 'some';
          } else {
            text = 'What was that?'
            enemy.fearful = 'none';
          }

          if (song.name === "skaningen") {
            displayEnemyStats(enemy);
          }

          clearSong(song);
          clearPlayedNotes(playedNotes);
          song = undefined;

          turn = {
            type: 'effect',
            text,
            endAt: animationTimer + 120,
          }
        }
      }

      if (enemy.fearful === 'much') {
        enemy.s.x += 10;
        enemy.s.flipX = true;
      }
    },
  };
}

