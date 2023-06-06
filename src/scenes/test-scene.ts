import "phaser";
import biUrl from "../../assets/bi.png";
import backgroundUrl from "../../assets/riddarborg_background.png";
import { preloadPeople } from "../dialog-person";
import knifeUrl from "../../assets/knife.png";
import { preloadSongs } from "../preload/preload-song";
import { OpponentSong, ba_attack_times, ko_attack_times, sh_attack_times, tb_attack_times } from "../new-songs/base";

export const testSceneKey = "test-scene";

let delay = 0;

document.getElementById("range")?.addEventListener("change", (ev) => {
  delay = Number.parseInt((ev.target as HTMLInputElement).value);
});

const anim = (from: number, to: number) => {
  return from * 0.7 + to * 0.3;
};

const lines: number[] = [];

for (let i = 0; i < 13; i++) {
  lines.push(100 + i * 30);
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
  type Attack =
    | {
        type: "player";
        s: Phaser.GameObjects.Image;
      }
    | {
        type: "opponent";
        s: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
      };

  let attacks: (Attack | undefined)[];
  let lastT: number;

  function createAttack(context: Phaser.Scene, y: number) {
    const obj = {
      type: "opponent",
      s: context.physics.add.image(800, y, "bi"),
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
      s: context.physics.add.image(player.s.x, y, "knife").setAngle(Math.random() * knifeState.spread),
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

  type Player = {
    s: Phaser.GameObjects.Image;
    lineIndex: number;
  };

  type Turn =
    | {
        type: "opponent";
      }
    | {
        type: "player";
      }
    | {
        type: "shoot";
        nrOfShots: number;
      };

  let turn: Turn;

  let player: Player;
  let at: number;

  let keys: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  let knifeState: {
    angle: number;
    angleUpper: number;
    angleLower: number;
    aimLineUpper: Phaser.GameObjects.Line;
    aimLineLower: Phaser.GameObjects.Line;
    spread: number;
  };

  let opponentSong: OpponentSong;

  const getT = () => Date.now() - delay - lastT;

  return {
    key: testSceneKey,
    preload() {
      preloadPeople(this);
      preloadSongs(this);
      this.load.image("bi", biUrl);
      this.load.image("knife", knifeUrl);
      this.load.image("background", backgroundUrl);
    },
    create() {
      at = 0;
      attacks = [];
      opponentSong = [];
      this.add.image(0, 0, "background").setOrigin(0, 0).setAlpha(0.5);

      for (const y of lines) {
        this.add
          .rectangle(0, y, 800, 20)
          .setOrigin(0, 0.5)
          .setFillStyle(0xffffff, 0.2)
          .setBlendMode(Phaser.BlendModes.ADD);
      }

      turn = {
        type: "player",
      };

      keys = {
        left: this.input.keyboard!!.addKey("left"),
        right: this.input.keyboard!!.addKey("right"),
        down: this.input.keyboard!!.addKey("down"),
        up: this.input.keyboard!!.addKey("up"),
        space: this.input.keyboard!!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      };

      player = {
        s: this.physics.add.image(230, lines[3], "adam").setScale(0.25),
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
    },
    update() {
      at++;

      if (turn.type === "opponent") {
        let now = getT();

        console.htmlLog(now)

        const toPlay = opponentSong.filter((x) => x[1] <= now);

        opponentSong = opponentSong.filter((x) => x[1] > now);

        for (const play of toPlay) {
          createAttack(this, lines[lines.length - play[0]]);
        }

        if (opponentSong.length === 0) {
          turn = {
            type: "player",
          };
        }
      }

      if (keys.space.isDown) {
        keys.space.isDown = false;
        if (turn.type === 'player') {
          turn = {
            type: "shoot",
            nrOfShots: 3,
          }
          lastT = Date.now();
          this.sound.play("knifeSong");
        } else if (turn.type === 'shoot') {
          createPlayerAttack(this, lines[player.lineIndex]);
          turn.nrOfShots--;
          if (turn.nrOfShots <= 0) {
            turn = {
              type: "opponent",
            }
            this.sound.stopAll();
            this.sound.play('baseAttackSong')
            opponentSong = [
              ...sh_attack_times,
              ...ko_attack_times,
              ...ba_attack_times,
              ...tb_attack_times
            ]
            lastT = Date.now();
          }
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

      for (let i = 0; i < attacks.length; i++) {
        const attack = attacks[i];
        if (!attack) {
          continue;
        }

        if (attack.type === "opponent") {
          attack.s.x -= 5;
          if (attack.s.x < 0) {
            attack.s.destroy();
            attacks[i] = undefined;
          }
        } else {
          attack.s.x += 5;
          if (attack.s.x > 800) {
            attack.s.destroy();
            attacks[i] = undefined;
          }
        }
      }

      //player stuff
      {
        player.s.y = anim(player.s.y, lines[player.lineIndex]);

        if (keys.up.isDown) {
          player.lineIndex = Math.max(0, player.lineIndex - 1);
          keys.up.isDown = false;
        }
        if (keys.down.isDown) {
          player.lineIndex = Math.min(lines.length - 1, player.lineIndex + 1);
          keys.down.isDown = false;
        }
      }
    },
  };
}
