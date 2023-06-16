import { Names } from "../dialog-person";
import { SongNames } from "../songs/song-utils";

const speaker = (speaker: Line['speaker']) => (line: string, options?: {
  otherAction?: Action, response?: Line['response'], keyToContinue?: string;
}) => ({speaker, line, response: options?.response, otherAction: options?.otherAction, keyToContinue: options?.keyToContinue});

export const oskar = speaker('oskar');
export const adam = speaker('adam');
export const klara = speaker('klara');
export const svan = speaker('svan');
export const molly = speaker('molly');
export const silkeshager = speaker('silkeshäger');
export const biatare = speaker('biatare'); 
export const tajgablastjart = speaker('tajga'); 
export const blank = speaker('');
export const spegel = speaker('spegel');

export type EnterAction = {
  type: 'enter';
  from: 'bottom' | 'top' | 'left' | 'right';
}

export type ExitAction = {
  type: 'exit';
  to: 'bottom' | 'top' | 'left' | 'right';
}

export type SheetAction = {
  type: 'sheet';
  song: SongNames;
}

export type PlayAction = {
  type: 'play';
  failMessage: string;
  successMessage: string;
}

export type Action =  EnterAction | ExitAction | {type: 'introduce'} | SheetAction | PlayAction;


export function playLine(line: string, successMessage: string, failMessage: string): Line {
  return {
    speaker: '',
    line,
    otherAction: {type: 'play', successMessage, failMessage}
  }
}


export type Line<T=Action> = {
  speaker: Names | '',
  line: string;
  keyToContinue?: string;
  response?: {
    options: string[],
    correctIndex?: number; 
  } 
  otherAction?: T
}