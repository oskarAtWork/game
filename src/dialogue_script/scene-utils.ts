import { Names } from "../dialog-person";

const speaker = (speaker: Line['speaker']) => (line: string, otherAction?: Action, response?: string[]) => ({speaker, line, response, otherAction})
export const oskar = speaker('oskar');
export const adam = speaker('adam');
export const molly = speaker('molly');
export const silkeshager = speaker('silkeshäger'); 
export const blank = speaker(''); 

type Action = 'enter_bottom' | 'enter_top' | 'enter_left' | 'enter_right' | 'sheet' | 'play'| 'exit' ;

export function playLine(line: string): Line {
  return {
    speaker: '',
    line,
    otherAction: 'play',
  }
}

export type Line = {
  speaker: Names | '',
  line: string;
  response?: string[], 
  otherAction?: Action
}