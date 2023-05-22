
const speaker = (speaker: Line['speaker']) => (line: string, otherAction?: Line['otherAction'], response?: string[]) => ({speaker, line, response, otherAction})
export const oskar = speaker('oskar');
export const adam = speaker('adam');
export const molly = speaker('molly');
export const silkeshager = speaker('silkeshäger'); 
export const blank = speaker(''); 

export function playLine(line: string): Line {
  return {
    speaker: '',
    line,
    otherAction: 'play',
  }
}

export type Line = {
  speaker: 'oskar' | 'adam' | '' | 'molly' | 'silkeshäger',
  line: string;
  response?: string[], 
  otherAction?: 'enter' | 'sheet' | 'play'| 'exit' 
}