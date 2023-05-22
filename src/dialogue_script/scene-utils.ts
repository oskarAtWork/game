import { Names } from "../dialog-person";

const speaker = (speaker: Line['speaker']) => (line: string, otherAction?: Action, response?: Line['response']) => ({speaker, line, response, otherAction})
export const oskar = speaker('oskar');
export const adam = speaker('adam');
export const molly = speaker('molly');
export const silkeshager = speaker('silkeshäger'); 
export const blank = speaker(''); 

export type EnterAction = 'enter_bottom' | 'enter_top' | 'enter_left' | 'enter_right';
export type Action =  EnterAction | 'sheet' | 'play'| 'exit' | 'introduce';

export function isEnterAction(line?: Line): line is Line<EnterAction> {
  return line?.otherAction?.startsWith('enter_') ?? false;
}

export function playLine(line: string): Line {
  return {
    speaker: '',
    line,
    otherAction: 'play',
  }
}


export type Line<T=Action> = {
  speaker: Names | '',
  line: string;
  response?: {
    options: string[],
    correctIndex: number; 
  } 
  otherAction?: T
}