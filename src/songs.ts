
export type ViolinString = 'G' | 'D' | 'A' | 'E';

export type Song = {
  endsAt: number;
  startsAt: number;
  notes: string;
} 

export const skaningen: Song = {
  notes: '§2§1312423',
  startsAt: 100,
  endsAt: 320,
}