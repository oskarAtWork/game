import "phaser";
import singleNoteUrl from "../../assets/single_note.png";
import sheetUrl from "../../assets/sheet.png";
import powUrl from "../../assets/pow.png";
import backgroundUrl from "../../assets/riddarborg_background.png";
import { preloadPeople } from "../dialog-person";
import knifeUrl from "../../assets/knife.png";
import { preloadSongs } from "../preload/preload-song";
import { BirdType, OpponentSong, attack_times } from "../new-songs/base";
import { skaningen, sovningen } from "../songs/songs";
import {
  Attack,
  Enemy,
  Keys,
  KnifeState,
  Player,
  Turn,
  isNoteKey,
} from "./types";
import { Sheet, createSheet } from "../sheet";
import { clearPlayedNotes, clearSong, playNote } from "../songs/song-utils";

export const testSceneKey = "test-scene";

let delay = 0;

const MS_PER_FRAME = 1000 / 60;
const BIRD_X = 700;
const NOTE_SCALE = 0.75;
const NOTE_SPEED = 10;

document.getElementById("range")?.addEventListener("change", (ev) => {
  delay = Number.parseInt((ev.target as HTMLInputElement).value);
});

const slowAnim = (from: number, to: number) => {
  return from * 0.9 + to * 0.1;
};

const anim = (from: number, to: number) => {
  return from * 0.6 + to * 0.4;
};

const lines: number[] = [];

for (let i = 7; i >= 0; i--) {
  lines.push(100 + i * 50);
}

const knifeSongTimings = [2933, 3831, 4768, 5744, 6744, 7660, 8614];
const knifeSongEnd = 9000;

const howClose = (knifeT: number) => {
  const a = knifeSongTimings.map((x) => Math.abs(x - knifeT));

  a.sort((a, b) => a - b);

  const smallest = a[0];
  const nice = 500;

  if (smallest < nice) {
    return smallest / nice;
  } else {
    return 1;
  }
};

export function testScene():
  | Phaser.Types.Scenes.SettingsConfig
  | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
  function createAttack(
    context: Phaser.Scene,
    x: number,
    y: number,
    image: string
  ) {
    const obj = {
      type: "opponent",
      s: context.physics.add.image(x, y - 10, image).setScale(0),
    } satisfies Attack;

    let found = false;

    for (let i = 0; i < attacks.length; i++) {
      if (!attacks[i]) {
        attacks[i] = obj;
        found = true;
        break;
      }
    }

    if (!found) {
      attacks.push(obj);
    }
  }

  function createPlayerAttack(context: Phaser.Scene, y: number) {
    const obj = {
      type: "player",
      s: context.physics.add
        .image(player.s.x, y, "knife")
        .setRotation(
          knifeState.angle + (Math.random() - 0.5) * knifeState.spread
        ),
    } satisfies Attack;

    let found = false;

    for (let i = 0; i < attacks.length; i++) {
      if (!attacks[i]) {
        attacks[i] = obj;
        found = true;
        break;
      }
    }

    if (!found) {
      attacks.push(obj);
    }
  }

  let attacks: (Attack | undefined)[];
  let lastT: number;
  let enemies: Enemy[];
  let turn: Turn;
  let player: Player;
  let keys: Keys;
  let knifeState: KnifeState;
  let opponentSong: OpponentSong;
  let sheet: Sheet;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[];

  const getT = () => Date.now() - delay - lastT;

  return {
    key: testSceneKey,
    preload() {
      preloadPeople(this);
      preloadSongs(this);
      this.load.image("singleNote", singleNoteUrl);
      this.load.image("pow", powUrl);
      this.load.image("knife", knifeUrl);
      this.load.image("background", backgroundUrl);
      this.load.image("sheet", sheetUrl);
    },
    create() {
      lastT = Date.now();
      attacks = [];
      playedNotes = [];
      opponentSong = [];
      this.add.image(0, 0, "background").setOrigin(0, 0).setAlpha(0.5);
      turn = {
        type: "player",
      };

      for (const y of lines) {
        this.add
          .rectangle(0, y, 800, 20)
          .setOrigin(0, 0.5)
          .setFillStyle(0xffffff, 0.2)
          .setBlendMode(Phaser.BlendModes.ADD);
      }

      sheet = createSheet(this, 480);

      keys = {
        left: this.input.keyboard!!.addKey("left"),
        right: this.input.keyboard!!.addKey("right"),
        down: this.input.keyboard!!.addKey("down"),
        up: this.input.keyboard!!.addKey("up"),
        space: this.input.keyboard!!.addKey(
          Phaser.Input.Keyboard.KeyCodes.SPACE
        ),
        G: this.input.keyboard!!.addKey(Phaser.Input.Keyboard.KeyCodes.G),
        D: this.input.keyboard!!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };

      this.input.keyboard!!.on("keydown", (ev: KeyboardEvent) => {

        if (isNoteKey(ev.key) && turn.type === 'player' && turn.song) {
          const noteInfo = playNote(
            getT(),
            ev.key,
            turn.song,
            sheet
          );

          if (noteInfo) {
            const note = {
              s: this.add.image(noteInfo.x, noteInfo.y, "singleNote"),
              hit: noteInfo.hit,
            };
            playedNotes.push(note);
          }
        }
      });


      player = {
        s: this.physics.add.image(230, lines[3], "adam").setScale(0.2),
        lineIndex: 3,
      };

      knifeState = {
        angle: 0,
        angleLower: 0,
        angleUpper: 0,
        spread: 0,
        aimLineUpper: this.add
          .line()
          .setStrokeStyle(3, 0xffffff)
          .setOrigin(0, 0),
        aimLineLower: this.add
          .line()
          .setStrokeStyle(3, 0xffffff)
          .setOrigin(0, 0),
      };

      enemies = (["silkeshäger", "biatare", "tajga"] satisfies BirdType[]).map(
        (birdType, i) => {
          const y = lines[lines.length - 2 - i * 3];
          return {
            s: this.physics.add
              .sprite(BIRD_X, y, birdType)
              .setScale(0.5)
              .setFlipX(i > 0)
              .setOrigin(0.5, 0.7),
            pow: this.add.image(BIRD_X, y, "pow").setAlpha(0),
            birdType,
            health: 10,
            y,
            startY: y,
          };
        }
      );
    },
    update() {
      if (turn.type === "opponent") {
        let now = getT();
        const toPlay = opponentSong.filter((x) => x.ms <= now);
        opponentSong = opponentSong.filter((x) => x.ms > now);

        for (const play of toPlay) {
          const height = lines[play.note % lines.length];

          const adjustment = NOTE_SPEED * ((play.ms - now) / MS_PER_FRAME);

          createAttack(this, BIRD_X - adjustment, height, "singleNote");
        }

        enemies.forEach((e) => {
          const play = opponentSong.find((f) => f.bird === e.birdType);
          if (play) {
            e.y = lines[play.note % lines.length];
          } else {
            e.y = e.startY;
          }
        });

        if (opponentSong.length === 0) {
          turn = {
            type: "player",
          };
        }
      }

      // knife stuff
      {
        knifeState.aimLineLower.setVisible(turn.type === "shoot");
        knifeState.aimLineUpper.setVisible(turn.type === "shoot");

        const dist = howClose(getT());
        const angle = 0;

        knifeState.spread = dist * Phaser.Math.DegToRad(240);

        knifeState.angleLower = angle + knifeState.spread / 2;
        knifeState.angleUpper = angle - knifeState.spread / 2;

        knifeState.angle = angle;

        knifeState.aimLineUpper.setTo(
          player.s.x,
          player.s.y,
          player.s.x + Math.cos(knifeState.angleUpper) * 1000,
          player.s.y + Math.sin(knifeState.angleUpper) * 1000
        );
        knifeState.aimLineLower.setTo(
          player.s.x,
          player.s.y,
          player.s.x + Math.cos(knifeState.angleLower) * 1000,
          player.s.y + Math.sin(knifeState.angleLower) * 1000
        );
      }

      // move all attacks
      for (let i = 0; i < attacks.length; i++) {
        const attack = attacks[i];
        if (!attack) {
          continue;
        }

        if (attack.type === "opponent") {
          attack.s.x -= NOTE_SPEED;
          if (attack.s.x < 0) {
            attack.s.destroy();
            attacks[i] = undefined;
          }
          attack.s.scale = slowAnim(attack.s.scale, NOTE_SCALE);
        } else {
          attack.s.x += Math.cos(attack.s.rotation) * 12;
          attack.s.y += Math.sin(attack.s.rotation) * 12;

          const hitEnemies = enemies.filter((enemy) =>
            this.physics.collide(attack.s, enemy.s)
          );

          let anyEnemyDied = false;
          for (let enemy of hitEnemies) {
            enemy.pow.alpha = 1;
            enemy.health -= 1;

            if (enemy.health <= 0) {
              anyEnemyDied = true;
            }
          }

          if (anyEnemyDied) {
            enemies = enemies.filter((enemy) => {
              if (enemy.health <= 0) {
                enemy.pow.destroy();
                enemy.s.destroy();
                return false;
              }
              return true;
            });
          }

          if (
            hitEnemies.length > 0 ||
            attack.s.x > 800 ||
            attack.s.y > 600 ||
            attack.s.y < 0
          ) {
            attack.s.destroy();
            attacks[i] = undefined;
          }
        }
      }

      // animations
      player.s.y = anim(player.s.y, lines[player.lineIndex] - 14);
      for (const enemy of enemies) {
        enemy.s.y = anim(enemy.s.y, enemy.y);
        enemy.pow.alpha = slowAnim(enemy.pow.alpha, 0);
      }

      sheet.s.alpha = anim(sheet.s.alpha, turn.type === 'player' && turn.song ? 1 : 0);

      if (turn.type === 'player' && turn.song && getT() > turn.song.endsAt) {
        clearPlayedNotes(playedNotes);
        clearSong(turn.song);
        turn = {
          type: 'shoot',
          nrOfShots: 7,
        };
        lastT = Date.now();
        this.sound.play("knifeSong");
      }

      // keyboard
      {
        if (keys.up.isDown) {
          player.lineIndex = Math.min(lines.length - 1, player.lineIndex + 1);
          keys.up.isDown = false;
        }

        if (keys.down.isDown) {
          player.lineIndex = Math.max(0, player.lineIndex - 1);
          keys.down.isDown = false;
        }

        if (keys.space.isDown) {
          keys.space.isDown = false;
          if (turn.type === "shoot") {
            createPlayerAttack(this, lines[player.lineIndex]);
            turn.nrOfShots--;
            if (turn.nrOfShots <= 0 || getT() > knifeSongEnd) {
              turn = {
                type: "opponent",
              };
              this.sound.stopAll();
              this.sound.play("baseAttackSong");
              opponentSong = [...attack_times];
              lastT = Date.now();
            }
          }
        }

        if (keys.G.isDown) {
          keys.G.isDown = false;

          if (turn.type === "player" && !turn.song) {
            lastT = Date.now();
            turn.song = sovningen(this, sheet);
            this.sound.play(turn.song.name);
          }
        }

        if (keys.D.isDown) {
          keys.D.isDown = false;

          if (turn.type === "player" && !turn.song) {
            lastT = Date.now();
            turn.song = skaningen(this, sheet);
            this.sound.play(turn.song.name);
          }
        }
      }
    },
  };
}
