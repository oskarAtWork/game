import "phaser";
import backgroundUrl from "../../assets/tile-layout.png";
import gameOverUrl from "../../assets/game_over.png";
import heartUrl from "../../assets/heart.png";
import knifeUrl from "../../assets/knife.png";
import zUrl from "../../assets/z.png";
import biUrl from "../../assets/bi.png";
import arrowKeysUrl from "../../assets/arrow_keys.png";
import explosionUrl from "../../assets/explosion.png";
import lightningUrl from "../../assets/lightning.png";

const anim = (from: number, to: number) => {
  return from * 0.95 + to * 0.05;
};

import {
  ENEMY_FRAME_CONFUSED,
  ENEMY_FRAME_GROOVY,
  ENEMY_FRAME_NORMAL,
  ENEMY_FRAME_SLEEPY,
  Enemy,
  blendAnimation,
  braveBoundary,
  scaredBoundary,
} from "../enemy";
import { skaningen, sovningen } from "../songs/songs";
import {
  clearPlayedNotes,
  clearSong,
  playNote,
  scoreSong,
  Song,
} from "../songs/song-utils";
import { createSheet, Sheet } from "../sheet";
import { preload } from "../preload/preload";
import { BattleData, getCurrentLevel, goToNextScene } from "../progression";
import { preloadPeople } from "../dialog-person";
import {
  animation_confused,
  animation_long_floaty,
  animation_shake,
} from "../animations";
import { preloadSongs } from "../preload/preload-song";
import { Player, playerBoundary } from "../player";
import { animBoundary, centerX, centerY } from "../boundary";

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

type Turn =
  | {
      type: "select";
      text: string;
    }
  | {
      type: "play";
      text: string;
    }
  | {
      type: "loose";
      text: string;
    }
  | {
      type: "shoot";
      text: string;
      shots: number;
    }
  | {
      type: "opponent";
      text: string;
      index: number;
    }
  | {
      type: "win";
      text: string;
    };

const TURN_SELECT = (bd: BattleData) =>
  ({
    type: "select",
    text: "Välj en fiolsträng: " + bd.strings.join(", "),
  } satisfies Turn);

export const battleSceneKey = "BattleScene" as const;

let delay = 0;

document.getElementById("range")?.addEventListener("change", (ev) => {
  delay = Number.parseInt((ev.target as HTMLInputElement).value);
});

export function battle():
  | Phaser.Types.Scenes.SettingsConfig
  | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
  let enemies: Enemy[];
  let sheet: Sheet;
  let line: {
    s: Phaser.GameObjects.Image;
  };
  let player: Player;

  let arrowKeysImage: Phaser.GameObjects.Image;
  let hasMoved: boolean;

  let song: undefined | Song;
  let textObj: Phaser.GameObjects.Text;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[];

  let playEffect: {
    container: Phaser.GameObjects.Container;
    skaningen: Phaser.GameObjects.Image;
    sovningen: Phaser.GameObjects.Image;
  };

  let turn: Turn;
  let hp: Phaser.GameObjects.Image[];

  let animationTimer: number;
  let lastT: number;

  let restart: boolean;

  const getT = () => Date.now() - delay - lastT;

  let attacks: {
    s: Phaser.GameObjects.Image;
    destroy: boolean;
    speed: number;
    hyped: boolean;
  }[];

  let opponentAttacks: (
    | {
        s: Phaser.GameObjects.Image;
        speed: number;
        angleSpeed: number;
      }
    | undefined
  )[];

  let knifeState: {
    angle: number;
    angleUpper: number;
    angleLower: number;
    aimLineUpper: Phaser.GameObjects.Line;
    aimLineLower: Phaser.GameObjects.Line;
    spread: number;
  };

  let effects: {
    type: "explosion" | "lightning" | "lightning-harmless" | "z";
    start: number;
    length: number;
    frames: number;
    sx?: number;
    sy?: number;
    s: Phaser.GameObjects.Sprite;
  }[];

  let gameOver: Phaser.GameObjects.Image;

  let context: Phaser.Scene;

  function createExplosion(x: number, y: number) {
    effects.push({
      type: "explosion",
      start: animationTimer,
      length: 30,
      frames: 10,
      s: context.add.sprite(x, y, "explosion").setScale(0.5),
    });
  }

  function createZ(x: number, y: number) {
    effects.push({
      type: "z",
      start: animationTimer,
      length: 30,
      frames: 10,
      sx: 0.5,
      sy: -1,
      s: context.add.sprite(x, y, "z").setScale(0.5),
    });
  }

  function createBi(x: number, y: number, angle: number, angleSpeed = 0) {
    const obj = {
      s: context.physics.add.image(x, y, "bi").setAngle(angle),
      speed: 4,
      angleSpeed,
    };

    let found = false;

    for (let i = 0; i < opponentAttacks.length; i++) {
      if (!opponentAttacks[i]) {
        opponentAttacks[i] = obj;
        found = true;
        break;
      }
    }

    if (!found) {
      opponentAttacks.push(obj);
    }
  }

  function hurtPlayer(amount: number) {
    createExplosion(player.s.x, player.s.y - 10);
    for (let i = 0; i < amount; i++) {
      const heart = hp.pop();

      if (heart) {
        createExplosion(heart.x, heart.y);
        heart.destroy();
      }
    }

    if (!hp.length) {
      turn = {
        type: "loose",
        text: "Ajdå\n[space] för att testa igen",
      };
    }
  }

  function createLightning(x: number, y: number, harmless: boolean) {
    for (let i = 0; i < 10; i++) {
      const yy = y - i * 100;

      if (yy < -50) {
        break;
      }

      effects.push({
        type: harmless ? "lightning-harmless" : "lightning",
        start: animationTimer,
        length: 50,
        frames: 9,
        s: context.add.sprite(x, yy, "lightning"),
      });
    }
  }

  let keys: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
  };

  function create(c: Phaser.Scene) {
    context = c;
    context.game.sound.pauseOnBlur = false;
    restart = false;
    lastT = 0;
    animationTimer = 0;
    playedNotes = [];
    hp = [];
    attacks = [];
    enemies = [];
    opponentAttacks = [];
    effects = [];
    hasMoved = true;
    const level = getCurrentLevel();

    keys = {
      left: context.input.keyboard!!.addKey("left"),
      right: context.input.keyboard!!.addKey("right"),
      down: context.input.keyboard!!.addKey("down"),
      up: context.input.keyboard!!.addKey("up"),
    };

    if (level.sceneKey !== "BattleScene") {
      window.alert(
        "Oh no, wrong level, at battle scene " + JSON.stringify(level)
      );
      throw Error("Oh no, wrong level");
    }

    turn = TURN_SELECT(level.battleData);

    context.add.image(0, 0, "background").setOrigin(0, 0);

    arrowKeysImage = context.add.image(230, 230, "arrowKeys").setAlpha(0.25);

    player = {
      s: context.physics.add.image(230, 220, "adam").setScale(0.25),
      hyped: false,
      xsp: 0,
      ysp: 0,
    };

    for (let e of level.battleData.enemies) {
      const enemyImage = context.physics.add
        .sprite(560, 220, e.name, 0)
        .setScale(0.5);

      let attack: (enemy: Enemy) => void;

      if (e.name === "biatare") {
        attack = (enemy) => {
          setTimeout(() => {
            turn.text = "Bi-attack!!!";
            let r = 11;
            let spreadFactor = enemy.status?.type === "fearful" ? 4 : 5;
            for (
              let i = 180 - r * spreadFactor;
              i <= 180 + r * spreadFactor;
              i += r
            ) {
              createBi(enemy.s.x - 100, enemy.s.y, i, enemy.status?.type === 'confused' ? (i-180) / 5 : 0);
            }
          }, 1000);
        };
      } else {
        attack = (enemy) => {
          let strength: number;

          if (enemy.status?.type === "confused") {
            turn.text = "Silkeshägern är förvirrad och träffar sig själv!";
            createLightning(enemy.s.x, enemy.s.y, true);
            enemy.health -= 3;
            strength = 0;
          } else if (enemy.status?.type === "sleepy") {
            if (enemy.status.strength === "much") {
              turn.text = "Silkeshägern sov, ingen skada skedd";
              strength = 0;
            } else if (enemy.status.strength === "some") {
              turn.text = "Silkeshägern gjorde en svag attack, 1hp skada";
              strength = 1;
            } else {
              turn.text = "Silkeshägern framkallade en blixt, 3 hp skada";
              strength = 3;
            }
          } else if (enemy.status?.type === "fearful") {
            if (enemy.status.strength === "much") {
              turn.text = "Silkeshägern skakade så mycket att hen missade";
              strength = 0;
            } else if (
              enemy.status.strength === "some" &&
              Math.random() < 0.5
            ) {
              turn.text = "Silkeshägern skakade så mycket att hen missade";
              strength = 0;
            } else {
              turn.text = "Rädd fågel, 3 hp skada";
              strength = 3;
            }
          } else {
            turn.text = "Arg fågel, 3 hp skada";
            strength = 3;
          }

          if (strength) {
            createLightning(player.s.x, player.s.y - 29, false);
            hurtPlayer(3);
          } else if (enemy.status?.type === "fearful") {
            createLightning(
              player.s.x + 120 + Math.random() * 10,
              player.s.y - 120,
              true
            );
          }
        };
      }

      enemies.push({
        ...e,
        attack,
        s: enemyImage,
        text: context.add.text(650, 10, "", {
          fontSize: "20px",
          fontFamily: "Helvetica",
        }),
        healthBar: {
          back: context.add
            .rectangle(0, 0, 100, 10)
            .setOrigin(0, 0)
            .setFillStyle(0x000000),
          front: context.add
            .rectangle(0, 0, 100, 10)
            .setOrigin(0, 0)
            .setFillStyle(0x22ee22),
        },
      });
    }

    context.input.keyboard?.on("keydown", (ev: KeyboardEvent) => {
      const key = ev.key.toUpperCase();
      ev.preventDefault();

      if (turn.type === "loose") {
        if (ev.key === " ") {
          restart = true;
        }
        return;
      }

      if (turn.type === "shoot" && turn.shots > 0 && ev.key === " ") {
        turn = { ...turn, shots: turn.shots - 1 };

        const knife = context.physics.add
          .sprite(player.s.x, player.s.y, "knife")
          .setScale(player.hyped ? 2 : 1);

        const spread = player.hyped ? knifeState.spread / 2 : knifeState.spread;

        knife.rotation = knifeState.angle + (Math.random() - 0.5) * spread;

        attacks.push({
          s: knife,
          destroy: false,
          speed: player.hyped ? 24 : 12,
          hyped: player.hyped,
        });
      }

      if (turn.type === "play") {
        if (ev.key === " ") {
          if (!song || getT() > song.endsAt) {
            context.sound.play("knifeSong");
            lastT = Date.now();

            turn = {
              type: "shoot",
              shots: 7,
              text: "[space] för att skjuta (i takt)",
            };
            hasMoved = false;
          }
          return;
        }
      }

      if (turn.type === "win") {
        if (ev.key === " ") {
          goToNextScene(context.scene);
        }
        return;
      }

      if (turn.type === "opponent") {
        if (ev.key === " ") {
          const turnIndex = turn.index;
          turn.index = enemies.findIndex(
            (e, i) => i > turnIndex && e.health > 0
          );

          if (turn.index >= enemies.length || turn.index === -1) {
            turn = TURN_SELECT(level.battleData);
            enemies.forEach((e) => {
              e.status = undefined;
            });
          } else {
            enemies[turn.index].attack(enemies[turn.index]);
          }
        }
        return;
      }

      if (turn.type === "select") {
        if (key === "D" || key === "G") {
          context.sound.play(key === "D" ? "skaningen" : "sovningen");

          clearPlayedNotes(playedNotes);
          song =
            key === "D" ? skaningen(context, sheet) : sovningen(context, sheet);

          line.s.setVisible(true);
          lastT = Date.now();
          turn = {
            type: "play",
            text: "",
          };
          return;
        } else if (key === "A") {
          player.hyped = true;
          enemies
            .filter((e) => e.health > 0)
            .forEach((e) => {
              e.status = {
                type: "hyped",
                strength: "much",
              };
            });
          turn = {
            type: "shoot",
            shots: 7,
            text: "[space] för att skjuta (i takt)",
          };
          context.sound.play("knifeSong");
          lastT = Date.now();
        } else if (key === "E") {
          enemies
            .filter((e) => e.health > 0)
            .forEach((e) => {
              e.status = {
                type: "confused",
                strength: "much",
              };
            });
          turn = {
            type: "shoot",
            shots: 7,
            text: "[space] för att skjuta (i takt)",
          };
          context.sound.play("knifeSong");
          lastT = Date.now();
        }
      }

      const now = Date.now() - lastT - delay;
      const noteInfo = playNote(now, ev.key, song, sheet);

      if (noteInfo) {
        const note = {
          s: context.add.image(noteInfo.x, noteInfo.y, "note"),
          hit: noteInfo.hit,
        };
        playedNotes.push(note);
      }
    });

    // ui
    knifeState = {
      angle: 0,
      angleLower: 0,
      angleUpper: 0,
      spread: 0,
      aimLineUpper: context.add
        .line()
        .setStrokeStyle(3, 0xffffff)
        .setOrigin(0, 0),
      aimLineLower: context.add
        .line()
        .setStrokeStyle(3, 0xffffff)
        .setOrigin(0, 0),
    };

    playEffect = {
      container: context.add.container(0, 0).setAlpha(0),
      skaningen: context.add.image(400, 400, "adam-play-1"),
      sovningen: context.add.image(400, 400, "adam-play-3"),
    };
    playEffect.container.add(playEffect.skaningen);
    playEffect.container.add(playEffect.sovningen);

    context.add.image(0, 0, "dialog").setOrigin(0, 0);
    for (let i = 0; i < 10; i++) {
      hp.push(context.add.image(20 + i * 30, 460, "heart"));
    }

    sheet = createSheet(context, 480);

    textObj = context.add
      .text(400, 500, "", {
        align: "center",
        fontSize: "1rem",
        color: "#34567a",
      })
      .setOrigin(0.5, 0);

    line = {
      s: context.add.image(300, sheet.s.y, "line"),
    };
    line.s.setOrigin(0, 0);
    line.s.setVisible(false);

    gameOver = context.add.image(0, 0, "game_over").setOrigin(0, 0).setAlpha(0);
  }

  return {
    key: battleSceneKey,
    preload() {
      preload(this);
      preloadSongs(this);
      preloadPeople(this);
      this.load.image("background", backgroundUrl);
      this.load.image("heart", heartUrl);
      this.load.image("knife", knifeUrl);
      this.load.image("bi", biUrl);
      this.load.image("arrowKeys", arrowKeysUrl);

      this.load.spritesheet("explosion", explosionUrl, {
        frameWidth: 100,
        frameHeight: 100,
      });

      this.load.image("z", zUrl);

      this.load.spritesheet("lightning", lightningUrl, {
        frameWidth: 50,
        frameHeight: 100,
      });

      this.load.image("game_over", gameOverUrl);
    },
    create() {
      create(this);
    },
    update() {
      animationTimer++;
      arrowKeysImage.alpha = hasMoved
        ? arrowKeysImage.alpha * 0.93
        : anim(arrowKeysImage.alpha, 1);

      for (let i = opponentAttacks.length - 1; i >= 0; i--) {
        const attack = opponentAttacks[i];
        if (!attack) {
          continue;
        }

        attack.s.angle += attack.angleSpeed;
        attack.angleSpeed *= 0.95;

        attack.s.x +=
          Math.cos(Phaser.Math.DegToRad(attack.s.angle)) * attack.speed;
        attack.s.y +=
          Math.sin(Phaser.Math.DegToRad(attack.s.angle)) * attack.speed;

        const collides = this.physics.collide(attack.s, player.s);
        const enemyCollision = enemies.filter((x) => x.health > 0).find((e) => this.physics.collide(attack.s, e.s));
        const outside =
          attack.s.x < 0 ||
          attack.s.y > 800 ||
          attack.s.y < 0 ||
          attack.s.y > 600;

        if (collides || outside || enemyCollision) {
          attack.s.destroy();
          opponentAttacks[i] = undefined;
        }

        if (collides) {
          hurtPlayer(3);
        }

        if (enemyCollision) {
          enemyCollision.health -= 1;
          createExplosion(enemyCollision.s.x, enemyCollision.s.y);
        }
      }

      if (turn.type !== "play" || !song) {
        playEffect.container.setAlpha(anim(playEffect.container.alpha, 0));
        if (playEffect.container.alpha < 0.05) {
          playEffect.container.y = 0;
        }
      } else {
        const d = getT();
        const p = song.endsAt;

        playEffect.sovningen.setVisible(song.name === "sovningen");
        playEffect.skaningen.setVisible(song.name === "skaningen");

        playEffect.container.y = -20 * (d / p);
        playEffect.container.setAlpha(
          anim(playEffect.container.alpha, 0.1 + (0.9 * d) / p)
        );
      }

      if (!effects.some((x) => x.type === "lightning")) {
        let acc = 0.5;
        let frictionX = true;
        let frictionY = true;

        if (keys.left.isDown) {
          player.xsp -= acc;
          frictionX = false;
          hasMoved = true;
        }
        if (keys.right.isDown) {
          player.xsp += acc;
          frictionX = false;
          hasMoved = true;
        }
        if (keys.up.isDown) {
          player.ysp -= acc;
          frictionY = false;
          hasMoved = true;
        }
        if (keys.down.isDown) {
          player.ysp += acc;
          frictionY = false;
          hasMoved = true;
        }

        const maxSp = player.hyped ? 12 : 6;

        player.xsp = Phaser.Math.Clamp(player.xsp, -maxSp, maxSp);
        player.ysp = Phaser.Math.Clamp(player.ysp, -maxSp, maxSp);

        player.s.x = Phaser.Math.Clamp(
          player.s.x + player.xsp,
          playerBoundary.left,
          playerBoundary.right
        );
        player.s.y = Phaser.Math.Clamp(
          player.s.y + player.ysp,
          playerBoundary.top,
          playerBoundary.bottom
        );

        if (player.s.x === playerBoundary.left && player.xsp < 0) {
          player.xsp = 0;
        } else if (player.s.x === playerBoundary.right && player.xsp > 0) {
          player.xsp = 0;
        }

        if (player.s.y === playerBoundary.top && player.ysp < 0) {
          player.ysp = 0;
        } else if (player.s.y === playerBoundary.bottom && player.ysp > 0) {
          player.ysp = 0;
        }

        if (frictionX) player.xsp *= 0.8;
        if (frictionY) player.ysp *= 0.8;
      }

      // effects
      {
        const doNotDestroy: typeof effects = [];
        for (const effect of effects) {
          const i = Math.floor(
            effect.frames *
              (animationTimer - effect.start) *
              (1 / effect.length)
          );

          effect.s.x += effect.sx ?? 0;
          effect.s.y += effect.sy ?? 0;

          if (i < effect.frames) {
            effect.s.setFrame(i);
            doNotDestroy.push(effect);
          } else {
            effect.s.destroy();
          }
        }

        if (doNotDestroy.length < effects.length) {
          effects = doNotDestroy;
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

        let remove = false;

        for (const knife of attacks) {
          knife.s.x +=
            Math.cos(Phaser.Math.DegToRad(knife.s.angle)) * knife.speed;
          knife.s.y +=
            Math.sin(Phaser.Math.DegToRad(knife.s.angle)) * knife.speed;

          const collides = enemies.find(
            (e) => e.health > 0 && this.physics.collide(knife.s, e.s)
          );

          const outside =
            knife.s.x < 0 ||
            knife.s.x > 800 ||
            knife.s.y < 0 ||
            knife.s.y > 600;

          if (collides) {
            collides.health -=
              (collides.status?.type === "fearful" ? 2 : 1) *
              (knife.hyped ? 2 : 1);
            createExplosion(knife.s.x, knife.s.y);
          }

          if (collides || outside) {
            knife.s.destroy();
            knife.destroy = true;
            remove = true;
          }
        }

        if (remove) {
          attacks = attacks.filter((x) => !x.destroy);
        }
      }

      enemies.forEach((e, i) => {
        let frame: number;

        switch (e.status?.type) {
          case "sleepy":
            frame = ENEMY_FRAME_SLEEPY;
            break;
          case "confused":
            frame = ENEMY_FRAME_CONFUSED;
            break;
          case "hyped":
            frame = ENEMY_FRAME_GROOVY;
            break;
          default:
            frame = 0;
        }

        e.s.setFrame(frame);

        if (
          animationTimer % 30 === i * (30 / enemies.length) &&
          e.status?.type === "sleepy" &&
          e.status.strength === "much"
        ) {
          createZ(e.s.x, e.s.y);
        }
      });

      if (turn.type === "shoot") {
        textObj.text = turn.text + "\nSkott kvar: " + turn.shots;
      } else if (turn.type === "opponent") {
        textObj.text = turn.text + "\n[space] för att fortsätta";
      } else if (turn.type === "win") {
        textObj.text = "Du vann\n" + turn.text + "\n[space] för att fortsätta";
      } else {
        textObj.text = turn.text;
      }

      if (turn.type === "shoot") {
        if (getT() > knifeSongEnd) {
          turn = {
            type: "opponent",
            text: "...",
            index: enemies.findIndex((e, i) => i >= 0 && e.health > 0),
          };

          hasMoved = false;
          enemies[turn.index].attack(enemies[0]);
        }
      }

      if (turn.type === "loose") {
        gameOver.alpha = anim(gameOver.alpha, 1);
      } else {
        gameOver.alpha = anim(gameOver.alpha, 0);
      }

      sheet.s.setVisible(turn.type === "play" && !!song);

      if (song && turn.type === "play") {
        const timeSinceStart = getT();

        line.s.x =
          sheet.innerX() +
          sheet.innerWidth() *
            ((timeSinceStart - song.startsAt) / (song.endsAt - song.startsAt));

        if (timeSinceStart > song.endsAt) {
          line.s.setVisible(false);
          const score = scoreSong(playedNotes, song);

          let text: string;

          if (song.name === "skaningen") {
            if (score > 0.7) {
              text = "Väldigt skrämmande";
              enemies.forEach((enemy) => {
                enemy.status = {
                  type: "fearful",
                  strength: "much",
                };
              });
            } else if (score > 0.3) {
              text = "Lite skrämmande ändå";
              enemies.forEach((enemy) => {
                enemy.status = {
                  type: "fearful",
                  strength: "some",
                };
              });
            } else {
              text = "Ingen effekt";
              enemies.forEach((enemy) => {
                enemy.status = undefined;
              });
            }
          } else if (song.name === "sovningen") {
            if (score > 0.7) {
              text = "Väldigt sömnigt";

              enemies.forEach((enemy) => {
                enemy.status = {
                  type: "sleepy",
                  strength: "much",
                };
              });
            } else if (score > 0.3) {
              text = "Lite trött verkar fågeln bli";
              enemies.forEach((enemy) => {
                enemy.status = {
                  type: "sleepy",
                  strength: "some",
                };
              });
            } else {
              text = "Ingen effekt";
              enemies.forEach((enemy) => {
                enemy.status = undefined;
              });
            }
          } else {
            throw Error("Unknown song");
          }

          turn.text = text + "\n[tryck space]";

          clearSong(song);
          clearPlayedNotes(playedNotes);
          song = undefined;
        }
      }

      enemies.forEach((enemy) => {
        const ex = enemy.s.x - 50;
        const ey = enemy.s.y - 50;

        enemy.healthBar.back.setPosition(ex, ey);
        enemy.healthBar.front.setPosition(ex, ey);
        enemy.healthBar.front.width =
          enemy.healthBar.back.width * (enemy.health / enemy.maxHealth);

        enemy.healthBar.back.setVisible(
          turn.type !== "win" && enemy.health > 0
        );
        enemy.healthBar.front.setVisible(
          turn.type !== "win" && enemy.health > 0
        );
      });

      const dead = enemies.filter((e) => e.health <= 0);

      dead.forEach((enemy) => {
        enemy.s.y += 10;
        enemy.s.flipY = true;
      });

      if (dead.length === enemies.length) {
        turn = {
          type: "win",
          text: "Fågeln dog",
        };
      } else {
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];

          if (enemy.health <= 0) {
            continue;
          }

          const scared = enemy.status?.type === "fearful";
          const confused = enemy.status?.type === "confused";

          const b =
            enemy.name === "biatare" &&
            turn.type === "opponent" &&
            !scared &&
            turn.index === i
              ? braveBoundary()
              : enemy.defaultBoundary;

          enemy.boundary = animBoundary(
            enemy.boundary,
            scared ? scaredBoundary() : b
          );

          const animationTarget = scared
            ? animation_shake
            : confused
            ? animation_confused
            : animation_long_floaty;

          if (
            animationTarget !== enemy.animation.to &&
            animationTarget !== enemy.animation.from
          ) {
            enemy.animation.to = animationTarget;
            enemy.animation.blendT = 0;
          }

          if (enemy.animation.to === enemy.animation.from) {
            enemy.animation.to = undefined;
          }

          if (enemy.animation.to) {
            enemy.animation.blendT = anim(enemy.animation.blendT, 1);

            if (enemy.animation.blendT > 0.95) {
              enemy.animation.from = enemy.animation.to;
              enemy.animation.to = undefined;
            }
          }

          enemy.x = anim(enemy.x, centerX(enemy.boundary));
          enemy.y = anim(enemy.y, centerY(enemy.boundary));

          let target: number;

          switch(enemy.status?.type) {
            case 'confused':
              target = 0.25;
              break;
            case 'sleepy':
              target = 0.1;
              break;
            default:
              target = 1;
          }

          console.htmlLog(target)

          enemy.animation.animationSpeed = anim(enemy.animation.animationSpeed, target);
          enemy.animation.animationT += enemy.animation.animationSpeed;

          if (
            enemy.status?.type === "sleepy" &&
            enemy.status.strength === "some"
          ) {
            enemy.speed = anim(enemy.speed, 0.25);
          }
          if (
            enemy.status?.type === "sleepy" &&
            enemy.status.strength === "much"
          ) {
            enemy.speed = anim(enemy.speed, 0);
          } else {
            enemy.speed = anim(enemy.speed, 1);
          }

          const [offX, offY] = blendAnimation(
            enemy.animation,
          );

          const dx =
            offX *
            (1 / 50) *
            (enemy.boundary.right - enemy.boundary.left) *
            (1 / 2) *
            enemy.speed;

          const dy =
            offY *
            (1 / 50) *
            (enemy.boundary.bottom - enemy.boundary.top) *
            (1 / 2) *
            enemy.speed;

          enemy.s.x = enemy.x + dx;
          enemy.s.y = enemy.y + dy;
        }
      }

      if (restart) {
        this.children.removeAll();
        this.sound.stopAll();
        create(this);
        this.scene.restart();
      }
    },
  };
}
