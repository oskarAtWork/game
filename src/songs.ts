import { Sheet } from "./sheet";

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
  timings: number[];
}

function createSong(internalSong: InternalSong, scene: Phaser.Scene, sheet: Sheet): Song {
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
    combined[i].alpha = 0.5;
  }

  return {
    name: internalSong.name,
    startsAt: internalSong.startsAt,
    endsAt: internalSong.endsAt,
    fullEnd: internalSong.fullEnd,
    notes: combined,
    timings: internalSong.timings,
  };
}

const getPosition = (sheet: Sheet, startsAt: number, endsAt: number, char: string, t: number) => {
  const fraction = (t - startsAt) / (endsAt - startsAt);
  const x = sheet.innerX() + fraction * sheet.innerWidth();

  const ny = noteToY(char);

  if (ny === null) {
    throw Error('not a note ->'  + char);
  }

  const y = sheet.s.y + sheet.s.displayHeight - 30 + ny;

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

export const skaningen = (scene: Phaser.Scene, sheet: Sheet): Song => createSong({
  name: 'skaningen',
  notes: '§2§1312423',
  timings: [
    114, // first beat
    131,
    140,
    148, // second beat
    173,
    177,
    182, // third beat
    211,
    215,
    217, // fourth beat
  ],
  startsAt: 114,
  endsAt: 328,
  fullEnd: 548,
}, scene, sheet);

export function playNote(t: number, char: string, song: Song | undefined, sheet: Sheet) {
  if (!song || !isAllowed(char)) {
    return undefined;
  }

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

  return {
    x,
    y,
    hit: !!closest && closestDistance < 50,
  };
}

export function clearPlayedNotes(
  playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[]
) {
  playedNotes.forEach((note) => note.s.destroy());
  while (playedNotes.length > 0) playedNotes.pop();
}

export function clearSong(song: Song) {
  song.notes.forEach((note) => note.destroy());
}

export function scoreSong(
  playedNotes: { s: Phaser.GameObjects.Image; hit: boolean }[]
) {
  return playedNotes.filter((s) => s.hit).length;
}