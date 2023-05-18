export const oskar = (line:string, response?: string[]): Line => ({speaker: 'Oskar', line, response})
export const adam = (line:string, response?: string[]): Line => ({speaker: 'Adam', line, response})
export const molly = (line:string, response?: string[]): Line => ({speaker: 'Molly', line, response})
//const blank = (line:string, response?: string[]): Line => ({speaker: ' ', line, response})

export type Line = {
    speaker: 'Oskar' | 'Adam' | ' '| 'Molly',
    line: string;
    response?: string[], 
}