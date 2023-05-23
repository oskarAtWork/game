import "phaser";
import backgroundUrl from '../../assets/forest_background.png';
import heartUrl from '../../assets/heart.png';
import knifeUrl from '../../assets/knife.png';


import { displayEnemyStats, Enemy } from "../enemy";
import { skaningen, sovningen } from "../songs/songs";
import { clearPlayedNotes, clearSong, playNote, scoreSong, Song } from "../songs/song-utils";
import { createSheet, Sheet } from "../sheet";
import { preload } from "../preload/preload";
import { getCurrentLevel, goToNextScene } from "../progression";
import { createPerson, DialogPerson, preloadPeople, updatePerson } from "../dialog-person";
import { animation_demo, animation_long_floaty} from "../animations";
import { preloadSongs } from "../preload/preload-song";

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

export const battleSceneKey = "BattleScene" as const;

let delay = 0;

document.getElementById('range')?.addEventListener('change', (ev) => {
  delay = Number.parseInt((ev.target as HTMLInputElement).value);
});

export function battle():
  | Phaser.Types.Scenes.SettingsConfig
  | Phaser.Types.Scenes.CreateSceneFromObjectConfig {

  let enemy: Enemy;
  let player: DialogPerson;
  let sheet: Sheet;
  let line: {
    s: Phaser.GameObjects.Image;
    start: number; //ms gotten from Date(0)
  };
  let song: undefined | Song;
  let textObj: Phaser.GameObjects.Text;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[];

  let turn: Turn = TURN_SELECT;
  let previousTurn: Turn | undefined = undefined;
  let hp: Phaser.GameObjects.Image[];
  let animationTimer: number;
  let attacks: {s: Phaser.GameObjects.Image, destroy: boolean}[];

  return {
    key: battleSceneKey,
    preload() {
      preload(this);
      preloadSongs(this);
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
        start: 0,
      };
      line.s.setOrigin(0, 0);
      line.s.setVisible(false);

      player = createPerson(this, 'adam');

      const enemyImage = this.physics.add.sprite(600, 320, 'silkeshäger')

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
        if (turn.type === 'shoot' && turn.shots > 0) {
          turn = {...turn, shots: turn.shots-1};
          const y = player.y - 120;
          const knife = this.physics.add.sprite(player.x, y, 'knife');

          const angle = Phaser.Math.Angle.BetweenPoints(
            {x: player.x, y},
            ev
          ) * Phaser.Math.RAD_TO_DEG;

          knife.angle = angle;

          attacks.push({s: knife, destroy: false});
        }
      })

      this.input.keyboard?.on("keydown", (ev: { key: string }) => {
        const key = ev.key.toUpperCase();

        if (turn.type === 'win' && ev.key === ' ') {
          goToNextScene(this.scene);
          return;
        }

        if (turn.type === 'select') {
          if (key === 'S') {
            this.sound.play('gasp');
            this.scene.start(battleSceneKey);
            return;
          } else if (key === 'D' || key === 'G') {
            this.sound.play(key === 'D' ? 'skaningen' : 'sovningen');

            clearPlayedNotes(playedNotes);
            song = key === 'D' ? skaningen(this, sheet) : sovningen(this, sheet);

            line.s.setVisible(true);
            line.start = Date.now();
            turn = {
              type: 'play',
              text: 'Play using\n§1234567890'
            }
            return;
          }
        }

        const now = Date.now() - line.start - delay;
        const noteInfo = playNote(now, ev.key, song, sheet);

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
      let remove = false;

      for (const knife of attacks) {
        knife.s.x += Math.cos(Phaser.Math.DegToRad(knife.s.angle)) * 15;
        knife.s.y += Math.sin(Phaser.Math.DegToRad(knife.s.angle)) * 15;

        const collides = this.physics.collide(knife.s, enemy.s);
        const outside = knife.s.x < 0 || knife.s.y > 800 || knife.s.y < 0 || knife.s.y > 600;

        if (collides) {
          enemy.health -= 1;
          displayEnemyStats(enemy);
        }

        if (collides || outside) {
          knife.s.destroy();
          knife.destroy = true;
          remove = true;
        }
      }

      if (enemy.health <= 0 && turn.type !== 'win') {
        turn = {
          type: 'win',
          text: 'You won'
        }
      }

      if (remove) {
        attacks = attacks.filter((x) => !x.destroy)
      }

      if (previousTurn !== turn) {
        previousTurn = turn;

        if (turn.type === 'shoot') {
          textObj.text = turn.text + '\nShots left: ' + turn.shots;
        } else {
          textObj.text = turn.text;
        }
      }
      
      if (turn.type === 'opponent') {
        if (animationTimer >= turn.endAt) {
          for(let i = 0; i < turn.strength; i++) {
            const heart = hp.pop();
            heart?.destroy();
          }

          turn = TURN_SELECT;
        }
      }

      if (turn.type === 'shoot') {
        if (turn.shots === 0) {
          turn = {
            type: 'opponent',
            strength: 1,
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

      sheet.s.setVisible(turn.type === 'play');
      updatePerson(player, turn.type === 'play', animationTimer, animation_demo)

      if (song) {
        const timeSinceStart = Date.now() - line.start - delay;

        line.s.x =
          sheet.innerX() +
          sheet.innerWidth() *
            ((timeSinceStart - song.startsAt) / (song.endsAt - song.startsAt));

        if (timeSinceStart > song.endsAt) {
          line.s.setVisible(false);
          const score = scoreSong(playedNotes, song);

          let text: string;

          if (song.name === 'skaningen') {
            if (score > 0.7) {
              text = 'Very moving';
              enemy.fearful = 'much';
            } else if (score > 0.3) {
              text = 'It had some effect'
              enemy.fearful = 'some';
            } else {
              text = 'Not so effective'
              enemy.fearful = 'none';
            }
          } else if (song.name === 'sovningen') {
            if (score > 0.7) {
              text = 'Very moving';
              enemy.sleepy = 'much';
            } else if (score > 0.3) {
              text = 'It had some effect'
              enemy.sleepy = 'some';
            } else {
              text = 'Not so effective'
              enemy.sleepy = 'none';
            }
          } else {
            throw Error('Unknown song');
          }

          if (song.name === "skaningen") {
            displayEnemyStats(enemy);
          }

          clearSong(song);
          clearPlayedNotes(playedNotes);
          song = undefined;

          turn = {
            type: 'shoot',
            shots: 4,
            text,
          }
        }
      }

      if (enemy.health <= 0) {
        enemy.s.y += 10;
        enemy.s.flipY = true;
      } else if (enemy.fearful === 'much') {
        enemy.s.x += 10;
        enemy.s.flipX = true;
      } else {
        const sp = enemy.sleepy === 'some' || enemy.sleepy === 'much' ? 1 : 3;
        enemy.s.x = enemy.sx + animation_long_floaty[animationTimer % animation_long_floaty.length][0] * sp;
        enemy.s.y = enemy.sy + animation_long_floaty[animationTimer % animation_long_floaty.length][1] * sp;
      }
    },
  };
}

