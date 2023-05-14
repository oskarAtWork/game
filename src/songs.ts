
export type ViolinString = 'G' | 'D' | 'A' | 'E';

type InternalSong = {
  name: 'skaningen',
  endsAt: number;
  startsAt: number;
  notes: string;
  timings: number[];
};

type NoteEvent = {
  x: number,
  y: number,
}

export type Song = {
  endsAt: number;
  startsAt: number;
  notes: NoteEvent[];
}

function createSong(internalSong: InternalSong): Song {
  const notes = internalSong.notes.split('');
  if (notes.length !== internalSong.timings.length) {
    const errorMessage =`notes length is ${notes.length} but timings length is ${internalSong.timings.length} for song ${internalSong.name}`;
    window.alert(errorMessage);
    throw Error(errorMessage);
  }

  const combined = Array<NoteEvent>(notes.length);

  for (let i = 0; i < notes.length; i++) {
    const y = noteToY(notes[i]);

    if (y === null) {
      const err = `unallowed character in notes ${y} in song ${internalSong.name}`;
      window.alert(err);
      throw Error(err);
    }

    combined[i] = {
      x: internalSong.timings[i],
      y:  y,
    }
  }

  return {
    startsAt: internalSong.startsAt,
    endsAt: internalSong.endsAt,
    notes: combined,
  };
}

const ALLOWED = '§1234567890';

function noteToY(char: string) {
  if (char === '§') {
    return 0;
  } else if (ALLOWED.includes(char)) {
    const code = char.charCodeAt(0) - '0'.charCodeAt(0);
    return code * -50;
  } else {
    return null;
  }
}

export const skaningen: Song = createSong({
  name: 'skaningen',
  notes: '§2§1312423',
  timings: [
    124,141,151,161,179,189,198,214,223,233
  ],
  startsAt: 100,
  endsAt: 320,
});

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

