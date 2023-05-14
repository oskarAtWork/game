import 'phaser';
import particleUrl from '../assets/particle.png';
import gaspUrl from '../assets/gasp.mp3';
import playerUrl from '../assets/cat.png';

export const menuSceneKey = 'MenuScene';

export function menu(): Phaser.Types.Scenes.SettingsConfig | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
  let keys: {
    S: Phaser.Input.Keyboard.Key;
    LEFT: Phaser.Input.Keyboard.Key;
    RIGHT: Phaser.Input.Keyboard.Key;
    DOWN: Phaser.Input.Keyboard.Key;
    UP: Phaser.Input.Keyboard.Key;
  };
  let sprites: {s: Phaser.GameObjects.Image, r: number }[];
  let player: {
    s: Phaser.GameObjects.Image,
  };

  return {
    key: menuSceneKey,
    preload() {
      sprites = [];

      if (this.input.keyboard) {
        keys = {
          S: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S,
          ),
          LEFT: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT,
          ),
          RIGHT: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
          ),
          DOWN: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN,
          ),
          UP: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.UP,
          )
        }
      } else {
        console.warn('Seems like we do not have a keyboard');
      }

      keys.S.isDown = false;
      keys.LEFT.isDown = false;
      keys.RIGHT.isDown = false;
      this.load.image('particle', particleUrl);
      this.load.image('player', playerUrl);
      this.load.audio('gasp', gaspUrl);
    },
    create() {
      this.add.text(0, 0, 'Press S to restart scene', {
        fontSize: '60px',
        fontFamily: "Helvetica",
      });
  
      const img = this.add.image(100, 100, 'player');
      player = {
        s: img,
      }

      for (let i = 0; i < 10; i++) {
          const x = Phaser.Math.Between(-64, 800);
          const y = Phaser.Math.Between(-64, 600);
  
          const image = this.add.image(x, y, 'particle');
          image.setBlendMode(Phaser.BlendModes.ADD);
          sprites.push({ s: image, r: 2 + Math.random() * 6 });
      }
    },
    update() {
      if (keys.S.isDown) {
        this.sound.play('gasp');
        this.scene.start(menuSceneKey);
      }

      if (keys.LEFT.isDown) {
        player.s.x -= 3;
      }
      if (keys.RIGHT.isDown) {
        player.s.x += 3;
      }
      if (keys.DOWN.isDown) {
        player.s.y += 3;
      }
      if (keys.UP.isDown) {
        player.s.y -= 3;
      }
  
      for (let i = 0; i < sprites.length; i++) {
          const sprite = sprites[i].s;
  
          sprite.y -= sprites[i].r;
  
          if (sprite.y < -256) {
              sprite.y = 700;
          }
      }
    },
  }
}