
export type ViolinString = 'G' | 'D' | 'A' | 'E';

type InternalSong = {
  name: 'skaningen',
  endsAt: number;
  startsAt: number;
  fullEnd: number;
  notes: string;
  timings: number[];
};

export type Song = {
  name: 'skaningen',
  endsAt: number;
  startsAt: number;
  fullEnd: number;
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
    const {x, y} = getPosition(
      sheet,
      internalSong.startsAt,
      internalSong.endsAt,
      notes[i],
      internalSong.timings[i]
    );

    combined[i] = scene.add.image(x, y, 'note');
    combined[i].setOrigin(0, 0);
    combined[i].alpha = 0.5;
  }

  return {
    name: internalSong.name,
    startsAt: internalSong.startsAt,
    endsAt: internalSong.endsAt,
    fullEnd: internalSong.fullEnd,
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

export const isAllowed = (x: string) => ALLOWED.includes(x); 

function noteToY(char: string) {
  if (char === '§') {
    return 0;
  } else if (isAllowed(char)) {
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
    120,
    139,
    148,
    155,
    177,
    185,
    192,
    211,
    219,
    227,
  ],
  startsAt: 124,
  endsAt: 320,
  fullEnd: 548,
}, scene, sheet);

export function playNote(t: number, char: string, song: Song, sheet: Phaser.GameObjects.Image) {
  let closest = null;
  let closestDistance = 0;

  const { x, y } = getPosition(sheet, song.startsAt, song.endsAt, char, t);
  
  for (const note of song.notes) {
    const distance = Math.pow(note.x - x, 2) + Math.pow(note.y - y, 2);
    
    if (closest === null || distance < closestDistance) {
      closest = note;
      closestDistance = distance;
    }
  }

  if (closest && closestDistance < 50) {
    return {
      x,
      y,
      hit: true,
    };
  }

  return {
    x,
    y,
    hit: false,
  }
}

