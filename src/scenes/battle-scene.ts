import "phaser";
import backgroundUrl from "../../assets/forest_background.png";
import gameOverUrl from "../../assets/game_over.png";
import heartUrl from "../../assets/heart.png";
import knifeUrl from "../../assets/knife.png";
import explosionUrl from "../../assets/explosion.png";

import { ENEMY_FRAME_NORMAL, ENEMY_FRAME_SLEEPY, Enemy } from "../enemy";
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
import { getCurrentLevel, goToNextScene } from "../progression";
import {
  createPerson,
  DialogPerson,
  preloadPeople,
  updatePerson,
} from "../dialog-person";
import { animation_demo, animation_long_floaty } from "../animations";
import { preloadSongs } from "../preload/preload-song";

const knifeSongTimings = [2949, 3882, 4883, 5785, 6837, 7571, 8597];
const knifeSongEnd = 9000;

const throwPositionX = 250;
const throwPositionY = 400;

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
      playedEffect: boolean;
    }
  | {
      type: "win";
      text: string;
    };

const TURN_SELECT = {
  type: "select",
  text: "Välj en fiolsträng",
} satisfies Turn;

export const battleSceneKey = "BattleScene" as const;

let delay = 0;

document.getElementById("range")?.addEventListener("change", (ev) => {
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
  };

  let song: undefined | Song;
  let textObj: Phaser.GameObjects.Text;
  let playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[];

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
  }[];

  let knifeState: {
    angle: number;
    angleUpper: number;
    angleLower: number;
    aimLineUpper: Phaser.GameObjects.Line;
    aimLineLower: Phaser.GameObjects.Line;
    spread: number;
  };

  let explosions: {
    start: number;
    length: number;
    s: Phaser.GameObjects.Sprite;
  }[];

  let gameOver: Phaser.GameObjects.Image;

  let context: Phaser.Scene;

  function createExplosion(x: number, y: number) {
    explosions.push({
      start: animationTimer,
      length: 100,
      s: context.add.sprite(x, y, "explosion"),
    });
  }

  function create(c: Phaser.Scene) {
    context = c;
    context.game.sound.pauseOnBlur = false;
    restart = false;
    lastT = 0;
    animationTimer = 0;
    playedNotes = [];
    hp = [];
    attacks = [];
    explosions = [];
    turn = TURN_SELECT;
    const level = getCurrentLevel();

    if (level.sceneKey !== "BattleScene") {
      window.alert(
        "Oh no, wrong level, at battle scene " + JSON.stringify(level)
      );
      throw Error("Oh no, wrong level");
    }

    const br = context.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setInteractive();
    sheet = createSheet(context);

    line = {
      s: context.add.image(300, 20, "line"),
    };
    line.s.setOrigin(0, 0);
    line.s.setVisible(false);

    player = createPerson(context, "adam");

    const enemyImage = context.physics.add.sprite(600, 320, level.battleData.name, 0);

    enemy = {
      s: enemyImage,
      text: context.add.text(650, 10, "", {
        fontSize: "20px",
        fontFamily: "Helvetica",
      }),
      healthBar: {
        back: context.add.rectangle(0, 0, 100, 10).setOrigin(0, 0).setFillStyle(0x000000),
        front: context.add.rectangle(0, 0, 100, 10).setOrigin(0, 0).setFillStyle(0x22ee22),
      },
      sx: enemyImage.x,
      sy: enemyImage.y,
      health: 10,
      maxHealth: 10,
      status: undefined,
      hasEarMuffs: false,
    };

    context.add.image(0, 0, "dialog").setOrigin(0, 0);

    for (let i = 0; i < 1; i++) {
      hp.push(context.add.image(20 + i * 30, 460, "heart"));
    }

    br.on("pointerdown", () => {
      if (turn.type === "shoot" && turn.shots > 0) {
        turn = { ...turn, shots: turn.shots - 1 };

        const knife = context.physics.add.sprite(
          throwPositionX,
          throwPositionY,
          "knife"
        );

        knife.rotation =
          knifeState.angle +
          Math.random() * knifeState.spread * 2 -
          knifeState.spread;

        attacks.push({ s: knife, destroy: false, speed: 12 });
      }
    });

    context.input.keyboard?.on("keydown", (ev: KeyboardEvent) => {
      const key = ev.key.toUpperCase();
      ev.preventDefault();

      if (turn.type === 'loose') {
        if (ev.key === ' ') {
          restart = true;
        }
        return;
      }

      if (key === 'Q') {
        restart = true;
        return;
      }

      if (turn.type === 'play') {
        if (ev.key === ' ') {
          if (!song || getT() > song.endsAt) {
            context.sound.play("knifeSong");
            lastT = Date.now();

            turn = {
              type: "shoot",
              shots: 7,
              text: 'Klicka för att skjuta (i takt)'
            };
          }
          return;
        }
      }

      if (turn.type === 'opponent') {
        if (!turn.playedEffect) {
          turn.playedEffect = true;

          let strength: number;

          if (enemy.status?.type === 'sleepy') {
            if (enemy.status.strength === 'much') {
              turn.text = 'Fågeln sov, ingen attack';
              strength = 0;
            } else if (enemy.status.strength === 'some') {
              turn.text = 'Fågeln gjorde en svag attack (1hp)';
              strength = 1;
            } else {
              turn.text = 'Arg fågel, 3 hp skada';
              strength = 3;
            }
          } else if (enemy.status?.type === 'fearful') {
            if (enemy.status.strength === 'much' && Math.random() < 0.5) {
              turn.text = 'Rädd fågel, skakade så mycket att hen missade';
              strength = 0;
            } if (enemy.status.strength === 'some' && Math.random() < 0.25) {
              turn.text = 'Rätt rädd fågel, skakade så mycket att hen missade';
              strength = 0;
            } else {
              turn.text = 'Rädd fågel, 3 hp skada';
              strength = 3;
            }
          } else {
            turn.text = 'Arg fågel, 3 hp skada';
            strength = 3;
          }

          if (strength) {
            for (let i = 0; i < strength; i++) {
              const heart = hp.pop();
  
              if (heart) {
                createExplosion(heart.x, heart.y)
                heart.destroy();
              }
            }

            if (!hp.length) {
              turn = {
                type: 'loose',
                text: 'Ajdå\n[space] för att testa igen',
              }
            }
          }
        } else {
          turn = TURN_SELECT;
        }

        return;
      }

      if (turn.type === "win") {
        if (ev.key === " ") {
          goToNextScene(context.scene);
        }
        return;
      }

      if (turn.type === "select") {
        if (key === "S") {
          context.sound.play("gasp");
          context.scene.start(battleSceneKey);
          return;
        } else if (key === "D" || key === "G") {
          context.sound.play(key === "D" ? "skaningen" : "sovningen");

          clearPlayedNotes(playedNotes);
          song =
            key === "D" ? skaningen(context, sheet) : sovningen(context, sheet);

          line.s.setVisible(true);
          lastT = Date.now();
          turn = {
            type: "play",
            text: "Play using\n§1234567890",
          };
          return;
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

    textObj = context.add
      .text(400, 500, "", {
        align: "center",
        fontSize: "1rem",
        color: "#34567a",
      })
      .setOrigin(0.5, 0);

    gameOver = context.add.image(0, 0, 'game_over').setOrigin(0, 0).setAlpha(0);
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

      this.load.spritesheet("explosion", explosionUrl, {
        frameWidth: 100,
        frameHeight: 100,
      });

      this.load.image("game_over", gameOverUrl)
    },
    create() {
      create(this)
    },
    update() {
      animationTimer++;

      // explosions
      {
        const doNotDestroy: typeof explosions = [];
        for (const explosion of explosions) {
          const i = Math.floor(
            10 * (animationTimer - explosion.start) * (1 / explosion.length)
          );

          if (i < 10) {
            explosion.s.setFrame(i);
            doNotDestroy.push(explosion);
          } else {
            explosion.s.destroy();
          }
        }

        if (doNotDestroy.length < explosions.length) {
          explosions = doNotDestroy;
        }
      }

      // knife stuff
      {
        knifeState.aimLineLower.setVisible(turn.type === "shoot");
        knifeState.aimLineUpper.setVisible(turn.type === "shoot");

        const dist = howClose(getT());
        const angle = Phaser.Math.Angle.Between(
          throwPositionX,
          throwPositionY,
          this.input.x,
          this.input.y
        );

        const angleLower = angle + dist * Phaser.Math.DegToRad(45);
        const angleUpper = angle - dist * Phaser.Math.DegToRad(45);

        knifeState.angleLower = angleLower;
        knifeState.angleUpper = angleUpper;
        knifeState.spread = dist * Phaser.Math.DegToRad(45);
        knifeState.angle = angle;

        knifeState.aimLineUpper.setTo(
          throwPositionX,
          throwPositionY,
          throwPositionX + Math.cos(angleUpper) * 1000,
          throwPositionY + Math.sin(angleUpper) * 1000
        );
        knifeState.aimLineLower.setTo(
          throwPositionX,
          throwPositionY,
          throwPositionX + Math.cos(angleLower) * 1000,
          throwPositionY + Math.sin(angleLower) * 1000
        );

        let remove = false;

        for (const knife of attacks) {
          knife.s.x +=
            Math.cos(Phaser.Math.DegToRad(knife.s.angle)) * knife.speed;
          knife.s.y +=
            Math.sin(Phaser.Math.DegToRad(knife.s.angle)) * knife.speed;

          const collides = this.physics.collide(knife.s, enemy.s);
          const outside =
            knife.s.x < 0 ||
            knife.s.y > 800 ||
            knife.s.y < 0 ||
            knife.s.y > 600;

          if (collides) {
            enemy.health -= 1;
            createExplosion(knife.s.x, knife.s.y)
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

      enemy.healthBar.back.setPosition(enemy.sx, enemy.sy - 180);
      enemy.healthBar.front.setPosition(enemy.sx, enemy.sy - 180);
      enemy.healthBar.front.width = (enemy.healthBar.back.width * (enemy.health / enemy.maxHealth));

      enemy.healthBar.back.setVisible(turn.type !== 'win');
      enemy.healthBar.front.setVisible(turn.type !== 'win');

      enemy.s.setFrame(enemy.status?.type === 'sleepy' ? ENEMY_FRAME_SLEEPY : ENEMY_FRAME_NORMAL)

      if (turn.type === "shoot") {
        textObj.text = turn.text + "\nSkott kvar: " + turn.shots;
      } else if (turn.type === "opponent" && turn.playedEffect) {
        textObj.text = turn.text + '\n[space] för att fortsätta';
      }  else if (turn.type === 'win') {
        textObj.text = 'Du vann\n' + turn.text + '\n[space] för att fortsätta'
      } else {
        textObj.text = turn.text;
      }

      if (turn.type === "shoot") {
        if (getT() > knifeSongEnd) {
          turn = {
            type: "opponent",
            playedEffect: false,
            text: "fågeln: Caw caaw\n[tryck space]",
          };
        }
      }

      if (turn.type === 'loose') {
        gameOver.alpha = gameOver.alpha * 0.95 + 1 * 0.05;
      } else {
        gameOver.alpha = gameOver.alpha * 0.95 + 0 * 0.05;
      }

      sheet.s.setVisible(turn.type === "play");
      updatePerson(
        player,
        turn.type === "play",
        animationTimer,
        animation_demo
      );

      if (song && turn.type === 'play') {
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
              enemy.status = {
                type: "fearful",
                strength: 'much'
              }
            } else if (score > 0.3) {
              text = "Lite skrämmande ändå";
              enemy.status = {
                type: "fearful",
                strength: 'some'
              }
            } else {
              text = "Ingen effekt";
              enemy.status = {
                type: "fearful",
                strength: 'none'
              }
            }
          } else if (song.name === "sovningen") {
            if (score > 0.7) {
              text = "Väldigt sömnigt";
              enemy.status = {
                type: "sleepy",
                strength: 'much'
              }
            } else if (score > 0.3) {
              text = "Lite trött verkar fågeln bli";
              enemy.status = {
                type: "sleepy",
                strength: 'some'
              }
            } else {
              text = "Ingen effekt";
              enemy.status = {
                type: "sleepy",
                strength: 'none'
              }
            }
          } else {
            throw Error("Unknown song");
          }

          turn.text = text + '\n[tryck space]';

          clearSong(song);
          clearPlayedNotes(playedNotes);
          song = undefined;
        }
      }

      if (enemy.health <= 0) {
        enemy.s.y += 10;
        enemy.s.flipY = true;
        turn = {
          type: 'win',
          text: 'Fågeln dog',
        }
      } else {
        if (enemy.status?.type === 'sleepy' && enemy.status.strength === "much") {
          enemy.s.x = enemy.sx;
          enemy.s.y = enemy.sy + 100;
        } else {
          const sp = enemy.status?.type === 'sleepy' && enemy.status.strength === "some" ? 1 : 3;
          enemy.s.x =
            enemy.sx +
            animation_long_floaty[
              animationTimer % animation_long_floaty.length
            ][0] *
              sp;
          enemy.s.y =
            enemy.sy +
            animation_long_floaty[
              animationTimer % animation_long_floaty.length
            ][1] *
              sp;
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
