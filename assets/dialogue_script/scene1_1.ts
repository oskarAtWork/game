const oskar = (line:string, response?: string[]): Line => ({speaker: 'Oskar', line, response})
const adam = (line:string, response?: string[]): Line => ({speaker: 'Adam', line, response})
const molly = (line:string, response?: string[]): Line => ({speaker: 'Molly', line, response})
const blank = (line:string, response?: string[]): Line => ({speaker: ' ', line, response})

const scene1_1: Line[] = [
    oskar('Adam! Adam, vakna!'),
    blank(' '),
    oskar('Somnade du precis? Spelade jag en för sömnig låt?'),
    adam('Ahjuste. Jo men den var ganska sömnig. Haha.'),
    molly('Kan du inte lära ut den till oss?'),
    oskar('Okej.'),
];

type Line = {
    speaker: 'Oskar' | 'Adam' | ' '| 'Molly',
    line: string;
    response?: string[], 
}