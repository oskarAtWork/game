import 'phaser';
import backgroundUrl from '../../assets/background.png';
import { Scene, getCurrentLevel, goToNextScene } from '../progression';
import { Line } from '../dialogue_script/scene-utils';
import { DialogPerson, createPerson, preloadPeople } from '../dialog-person';
import { demo, loopdiloop, smillanimation, upAndDown, weave } from '../animations';

export const dialogSceneKey = 'DialogScene' as const;

const mt = document.getElementById('mouse-tracker') as HTMLCanvasElement;

let coors: [number, number][] = [];
const ctx = mt.getContext('2d');

mt?.addEventListener('mousedown', (ev) => {
  if (!ev.shiftKey) {
    return;
  }

  ctx?.clearRect(0, 0, 100, 100);
  while(coors.length) coors.pop();
})


mt?.addEventListener('mousemove', (ev) => {
  if (!ev.shiftKey) {
    return;
  }

  const rect = mt.getBoundingClientRect();
  const x = Math.round(ev.x - rect.left);
  const y = Math.round(ev.y - rect.top);

  const last = coors[coors.length - 1];


  if (last?.[0] !== x || last?.[1] !== y) {
    coors.push([x, y]);
    ctx?.fillRect(x, y, 2, 2);
  }
})

mt?.addEventListener('mouseup', () => {
  const first = coors[0];

  if (!first) {
    return;
  }

  const output = coors.map(([x, y]) => [x-first[0], y-first[1]])
  
  document.getElementById('result')!!.innerHTML = JSON.stringify(output);
})



export function dialog(): Phaser.Types.Scenes.SettingsConfig | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
  
  let currentDialog: Phaser.GameObjects.Text;
  let pastDialog: Phaser.GameObjects.Text;
  let adam: DialogPerson;
  let oskar: DialogPerson;
  let molly: DialogPerson;

  let scene: Scene;
  let index = 0;
  let animationTimer = 0;

  return {
    key: dialogSceneKey,
    preload() {
      this.load.image(backgroundUrl, backgroundUrl);
      preloadPeople(this);
    },
    create() {
      const level = getCurrentLevel();

      if (level.sceneKey !== 'DialogScene') {
        window.alert('Oh no, wrong level at dialog ' + JSON.stringify(level));
        throw Error('Oh no, wrong level');
      }

      scene = level.dialog;

      this.add.image(0, 0, backgroundUrl).setOrigin(0, 0);
      adam = createPerson(this, 'adam', 300, 1000);
      oskar = createPerson(this, 'oskar', 700, 330);
      molly = createPerson(this, 'molly', 900, 330);

      this.input.keyboard!!.on('keydown', function (ev: KeyboardEvent) {
        console.log(ev);
        ev.preventDefault();
        if (ev.key === ' ') {
          index += 1;

          if (scene[index]?.speaker === 'Molly') {
            molly.target_x = 550;
          }

          if (scene[index]?.speaker === 'Adam') {
            adam.target_y = 330;
          }
        }
      });

      currentDialog = this.add.text(400, 450, '', {
        align: 'center',
        fontSize: '1rem',
        color: '#34567a'
      }).setOrigin(0.5, 0.5);

      pastDialog = this.add.text(400, 420, '', {
        fontSize: '1rem',
        color: 'rgba(0, 0, 0, 0.1)'
      }).setOrigin(0.5, 0.5);
    },
    update() {
      const dialog: Line | undefined = scene[index];
      const lastDialog: Line | undefined = scene[index-1];
      animationTimer++;
      if (animationTimer < 0) animationTimer = 0;

      updatePerson(oskar, dialog?.speaker === 'Oskar', animationTimer, weave);
      updatePerson(adam, dialog?.speaker === 'Adam', animationTimer, loopdiloop);
      updatePerson(molly, dialog?.speaker === 'Molly', animationTimer, upAndDown);

      if (lastDialog) {
        pastDialog.text = lastDialog.speaker + ': ' + lastDialog.line;
      }

      if (dialog) {
        currentDialog.text = dialog.speaker + ': ' + dialog.line;
      } else {
        goToNextScene(this.scene);
      }
    },
  }
}
function updatePerson(person: DialogPerson, talking: boolean, animationT: number, animation: [number, number][]) {
  person.x = person.x * 0.9 + person.target_x * 0.1;
  person.y = person.y * 0.9 + person.target_y * 0.1;
  const [dx, dy] = animation[animationT % animation.length];
  person.s.x = person.x + (talking ? dx : 0);
  person.s.y = person.y + (talking ? dy : 0);
}

