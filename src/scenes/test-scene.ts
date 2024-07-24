import "phaser";
import singleNoteUrl from "../../assets/single_note.png";
import heartUrl from "../../assets/heart.png";
import sheetUrl from "../../assets/sheet.png";
import powUrl from "../../assets/pow.png";
import svandamUrl from "../../assets/svandam.png";
import backgroundUrl from "../../assets/sky-image.png";
import gameOverUrl from "../../assets/game_over.png";
import { preloadPeople } from "../dialog-person";
import knifeUrl from "../../assets/knife.png";
import { preloadSongs } from "../preload/preload-song";
import { OpponentSong, attack_times } from "../new-songs/base";
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
import {
  clearPlayedNotes,
  clearSong,
  playNote,
  scoreSong,
} from "../songs/song-utils";
import { getCurrentLevel, goToNextScene } from "../progression";
import { ENEMY_FRAME_CONFUSED, ENEMY_FRAME_NORMAL } from "../enemy";

export const testSceneKey = "TestScene";

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
    image: string,
    enemy: Enemy
  ) {
    const obj = {
      type: "opponent",
      s: context.physics.add
        .image(x, y - 10, image)
        .setScale(0)
        .setFlipX(enemy.status === "confused"),
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

  let gameOver: Phaser.GameObjects.Image;
  let attacks: (Attack | undefined)[];
  let lastT: number;
  let enemies: Enemy[];
  let turn: Turn;
  let player: Player;
  let keys: Keys;
  let knifeState: KnifeState;
  let opponentSong: OpponentSong;
  let sheet: Sheet;
  let sleepy = false;
  let text: Phaser.GameObjects.Text;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[];

  const getT = () => Date.now() - delay - lastT;

  const startOpponentTurn = (context: Phaser.Scene) => {
    turn = {
      type: "opponent",
    };
    context.sound.stopAll();
    context.sound.play("baseAttackSong", {
      rate: sleepy ? 0.5 : 1,
    });
    console.log(attack_times);
    opponentSong = [...attack_times];
    lastT = Date.now();
  };

  return {
    key: testSceneKey,
    preload() {
      preloadPeople(this);
      this.load.image("svandam", svandamUrl);
      preloadSongs(this);
      this.load.image("singleNote", singleNoteUrl);
      this.load.image("note", singleNoteUrl);
      this.load.image("pow", powUrl);
      this.load.image("knife", knifeUrl);
      this.load.image("background", backgroundUrl);
      this.load.image("sheet", sheetUrl);
      this.load.image("health", heartUrl);
      this.load.image("game_over", gameOverUrl);
    },
    create() {
      sleepy = false;
      const level = getCurrentLevel();
      if (level.sceneKey !== "TestScene") {
        throw Error(
          `Tried to open test scene with ${level.sceneKey} scene stuff`
        );
      }

      lastT = Date.now();
      attacks = [];
      playedNotes = [];
      opponentSong = [];
      this.add
        .image(0, 0, "background")
        .setOrigin(0, 0)
        .setAlpha(0.5)
        .setScale(2);

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
        A: this.input.keyboard!!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        E: this.input.keyboard!!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      };

      this.input.keyboard!!.on("keydown", (ev: KeyboardEvent) => {
        if (!isNoteKey(ev.key)) {
          return;
        }

        if (turn.type === "player" && turn.song) {
          const noteInfo = playNote(
            getT() + (turn.song.name === "skaningen" ? 230 : 100),
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
        s: this.physics.add.image(230, lines[3], "svandam").setScale(0.2),
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

      const nrOfEnemies = level.battleData.enemies.length;

      enemies = level.battleData.enemies.map((enemyData, i) => {
        const y =
          lines[
            lines.length - 1 - Math.floor((i * lines.length) / nrOfEnemies)
          ];

        return {
          s: this.physics.add
            .sprite(BIRD_X, y, enemyData.name)
            .setScale(0.4)
            .setFlipX(enemyData.name !== "silkeshäger")
            .setOrigin(0.5, 0.7),
          pow: this.add.image(BIRD_X, y, "pow").setAlpha(0),
          birdType: enemyData.name,
          health: [],
          y,
          startY: y,
          status: "",
        };
      });

      enemies.forEach((enemy, i) => {
        const amountOfHealth = level.battleData.enemies[i].health;

        for (let index = 0; index < amountOfHealth; index++) {
          enemy.health.push(
            this.add.image(enemy.s.x, enemy.s.y, "health").setScale(0.6)
          );
        }
      });

      text = this.add.text(400, 20, "", {
        align: "center",
        fontSize: "2rem",
        color: "#000000",
        wordWrap: { width: 800, useAdvancedWrap: true },
      });

      text.setOrigin(0.5, 0);

      gameOver = this.add.image(0, 0, "game_over").setOrigin(0, 0).setAlpha(0);
    },
    update() {
      if (turn.type === "opponent") {
        let now = getT();

        const toPlay = opponentSong.filter(
          (x) => x.ms * (sleepy ? 2 : 1) <= now
        );
        opponentSong = opponentSong.filter(
          (x) => x.ms * (sleepy ? 2 : 1) > now
        );

        for (const play of toPlay) {
          const bird = enemies.find((f) => f.birdType === play.bird);

          if (!bird) {
            continue;
          }

          const height = lines[play.note % lines.length];
          const adjustment =
            NOTE_SPEED *
            (sleepy ? 0.5 : 1) *
            ((play.ms * (sleepy ? 2 : 1) - now) / MS_PER_FRAME);
          createAttack(this, BIRD_X - adjustment, height, "singleNote", bird);
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

      if (turn.type === "player" && !turn.song) {
        text.text = "Press G or D";
      } else {
        text.text = "";
      }

      if (player.s.x < 0) {
        gameOver.setAlpha(gameOver.alpha * 0.1 + 0.9);
      }

      if (enemies.length === 0) {
        turn = { type: "win" };
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
          if (attack.s.flipX) {
            attack.s.x += NOTE_SPEED * (sleepy ? 0.5 : 1);
          } else {
            attack.s.x -= NOTE_SPEED * (sleepy ? 0.5 : 1);
          }

          attack.s.scale = slowAnim(attack.s.scale, NOTE_SCALE);

          if (attack.s.x < 0 || attack.s.x > 800) {
            attack.s.destroy();
            attacks[i] = undefined;
          } else if (this.physics.collide(player.s, attack.s)) {
            attack.s.destroy();
            attacks[i] = undefined;
            player.s.x -= 20;
          }
        } else {
          attack.s.x += Math.cos(attack.s.rotation) * 12;
          attack.s.y += Math.sin(attack.s.rotation) * 12;

          const hitEnemies = enemies.filter((enemy) =>
            this.physics.collide(attack.s, enemy.s)
          );

          let anyEnemyDied = false;
          for (let enemy of hitEnemies) {
            enemy.pow.alpha = 1;

            enemy.health.pop()?.destroy();

            if (enemy.health.length === 0) {
              anyEnemyDied = true;
            }
          }

          if (anyEnemyDied) {
            enemies = enemies.filter((enemy) => {
              if (enemy.health.length === 0) {
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

        if (enemy.status === "confused") {
          enemy.s.setFrame(ENEMY_FRAME_CONFUSED);
        } else {
          enemy.s.setFrame(ENEMY_FRAME_NORMAL);
        }

        if (enemy.health.length) {
          const SPACING = 18;
          const ITEMS_PER_ROW = Math.min(enemy.health.length, 8);
          const halfWidth = Math.floor(0.5 * SPACING * ITEMS_PER_ROW);

          enemy.health.forEach((heart, i) => {
            const i2 = i - ITEMS_PER_ROW;
            heart.alpha = anim(heart.alpha, turn.type === "opponent" ? 0 : 1);

            if (i2 < 0) {
              heart.y = enemy.s.y - 70;
              heart.x = enemy.s.x + i * SPACING - halfWidth;
            } else {
              heart.y = enemy.s.y - 50;
              heart.x = enemy.s.x + i2 * SPACING - halfWidth;
            }
          });
        }
      }

      sheet.s.alpha = anim(
        sheet.s.alpha,
        turn.type === "player" && turn.song ? 1 : 0
      );

      if (turn.type === "player" && turn.song && getT() > turn.song.endsAt) {
        if (scoreSong(playedNotes, turn.song) > 0.5) {
          if (turn.song.name === "sovningen") {
            sleepy = true;
          }

          enemies.forEach((e) => {
            e.status = "";
          });

          if (turn.song.name === "skaningen") {
            enemies = enemies.filter((e) => {
              e.health.pop()?.destroy();

              if (e.health.length === 0) {
                e.pow.destroy();
                e.s.destroy();
                return false;
              }
              return true;
            });
          }
        }
        clearPlayedNotes(playedNotes);
        clearSong(turn.song);
        turn = {
          type: "shoot",
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

          if (turn.type === "win") {
            goToNextScene(this.scene);
          }

          if (turn.type === "shoot") {
            createPlayerAttack(this, lines[player.lineIndex]);
            turn.nrOfShots--;
          }
        }

        if (
          turn.type === "shoot" &&
          (turn.nrOfShots <= 0 || getT() > knifeSongEnd)
        ) {
          startOpponentTurn(this);
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

        if (keys.A.isDown) {
          keys.A.isDown = false;

          startOpponentTurn(this);
        }

        if (keys.E.isDown) {
          keys.E.isDown = false;

          if (turn.type === "player" && !turn.song) {
            sleepy = false;
            random(enemies, 2, (e) => {
              e.status = "confused";
            });

            startOpponentTurn(this);
          }
        }
      }
    },
  };
}

const random = <T>(enemies: T[], nr: number, fn: (e: T) => void) => {
  const LEN = enemies.length;
  let randomElementsLeft = nr;

  for (let i = 0; i < LEN; i++) {
    if (randomElementsLeft === 0) {
      return;
    }
    const elementsLeft = LEN - i;
    if (Math.random() < randomElementsLeft / elementsLeft) {
      fn(enemies[i]);
      randomElementsLeft -= 1;
    }
  }
};
// test cases

const buckets = [0, 0, 0, 0, 0];

for (let i = 0; i < 10000; i++) {
  random([0, 1, 2, 3, 4], 4, (i) => {
    buckets[i]++;
  });
}

console.log(buckets.join(", "));
