
export type ViolinString = 'G' | 'D' | 'A' | 'E';

type InternalSong = {
  name: 'skaningen',
  endsAt: number;
  startsAt: number;
  notes: string;
  timings: number[];
};

export type Song = {
  endsAt: number;
  startsAt: number;
  notes: Phaser.GameObjects.Image[];
}

function createSong(internalSong: InternalSong, scene: Phaser.Scene, sheet: Phaser.GameObjects.Image): Song {
  const notes = internalSong.notes.split('');
  if (notes.length !== internalSong.timings.length) {
    const errorMessage =`notes length is ${notes.length} but timings length is ${internalSong.timings.length} for song ${internalSong.name}`;
    window.alert(errorMessage);
    throw Error(errorMessage);
  }

  const combined = Array<Phaser.GameObjects.Image>(notes.length);

  for (let i = 0; i < notes.length; i++) {
    const {x, y} = getPosition(sheet, internalSong.startsAt, internalSong.endsAt, notes[i], internalSong.timings[i])

    combined[i] = scene.add.image(x, y, 'note');
    combined[i].setOrigin(0, 0);
  }

  return {
    startsAt: internalSong.startsAt,
    endsAt: internalSong.endsAt,
    notes: combined,
  };
}

const getPosition = (sheet: Phaser.GameObjects.Image, startsAt: number, endsAt: number, char: string, t: number) => {
  const fraction = (t - startsAt) / (endsAt - startsAt);
  const x = sheet.x + fraction * sheet.displayWidth;

  const ny = noteToY(char);

  if (ny === null) {
    throw Error('not a note ->'  + char);
  }

  const y = sheet.y + sheet.displayHeight - 30 + ny;

  return {
    x, y
  }
}

const ALLOWED = '§1234567890';

function noteToY(char: string) {
  if (char === '§') {
    return 0;
  } else if (ALLOWED.includes(char)) {
    const code = char.charCodeAt(0) - '0'.charCodeAt(0);
    return code * -10;
  } else {
    return null;
  }
}

export const skaningen = (scene: Phaser.Scene, sheet: Phaser.GameObjects.Image): Song => createSong({
  name: 'skaningen',
  notes: '§2§1312423',
  timings: [
    124,141,151,161,179,189,198,214,223,233
  ],
  startsAt: 124,
  endsAt: 320,
}, scene, sheet);

export function playNote(t: number, char: string, notes: Song['notes']) {
  let closest = null;
  let closestDistance = 0;
  
  const y = noteToY(char);

  if (y === null) {
    return;
  }

  for (const note of notes) {
    const distance = Math.pow(note.x - t, 2) + Math.pow(note.y - y, 2);
    
    if (closest === null || distance < closestDistance) {
      closest = note;
      closestDistance = distance;
    }
  }

  if (closest && closestDistance < 50) {
    return {
      x: t,
      y,
      hit: true,
    };
  }

  return {
    x: t,
    y,
    hit: false,
  }
}

