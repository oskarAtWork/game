import { Sheet } from "../sheet";

export type ViolinString = 'G' | 'D' | 'A' | 'E';

export const songNames = ['skaningen', 'sovningen', 'knifeSong'] as const;

export type SongNames = typeof songNames[number];

type InternalSong = {
  name: SongNames;
  endsAt: number;
  startsAt: number;
  notes: string;
  timings: number[];
};

export type Song = {
  name: SongNames;
  endsAt: number;
  startsAt: number;
  notes: Phaser.GameObjects.Image[];
  timings: number[];
}

export function createSong(internalSong: InternalSong, scene: Phaser.Scene, sheet: Sheet): Song {
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

const MIN_DISTANCE = 100;

export function playNote(t: number, char: string, song: Song | undefined, sheet: Sheet) {
  if (!song || !isAllowed(char)) {
    return undefined;
  }

  const { x, y } = getPosition(sheet, song.startsAt, song.endsAt, char, t);
  
  for (const note of song.notes) {
    if (distance(x, y, note) < MIN_DISTANCE) {
      return {x, y, hit: true}
    }
  }

  return {
    x,
    y,
    hit: false,
  };
}

const distance = (x: number, y: number, note: Phaser.GameObjects.Image) =>
  Math.pow(note.x - x, 2) + Math.pow(note.y - y, 2)


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
  playedNotes: {s: Phaser.GameObjects.Image, hit: boolean }[],
  song: Song,
) {
  let score = 0;
  const unused: Array<Phaser.GameObjects.Image | undefined> = Array.from(playedNotes.map((s) => s.s));

  for (const songNote of song.notes) {
    let distanceClosest = 999999;
    let closest = -1;

    for (let i = 0; i < unused.length; i++) {
      const pn = playedNotes[i];
      if (!pn) {
        continue;
      }

      const dist = distance(pn.s.x, pn.s.y, songNote);

      if (dist < distanceClosest) {
        distanceClosest = dist;
        closest = i;
      }
    }

    if (distanceClosest < MIN_DISTANCE) {
      score += 1;
      unused[closest] = undefined;
    }
  }

  score -= unused.filter((f) => !!f).length * 0.5;
  return Math.max(1, score) / song.notes.length;
}