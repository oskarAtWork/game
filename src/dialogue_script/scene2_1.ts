import { Line } from "./scene-utils";

const adam = (line:string, response?: string[]): Line => ({speaker: 'Adam', line, response})
const blank = (line:string, response?: string[]): Line => ({speaker: ' ', line, response})
const silkeshager = (line:string, response?: string[]): Line => ({speaker: 'Silkeshäger', line, response})



export const scene1_2: Line[] = [
    adam('Hmmm, tänk tänk tänk....'),
    adam('Jag tror att berget är på andra sidan av den här skogen. Hoppas att jag får se några fina fåglar på vägen.'),
    blank('KWÄÄ! KWÄÄÄ!'),
    adam('Hmm, jag känner igen det där lätet. Kan det vara...', ),
    // Fågeln syns.
    blank('Mjaaa lille pöjk, kan du gissa vad jag är för en fågel? Skulle inte tro det! HAHA!'),
    adam('Jo, jag tror jag kan gissa. Du är ju en', ['Silkeshäger', 'Vittrut', 'Knölsvan']),
    // om han gissar rätt (silkeshäger)
    silkeshager('Jaså minsann! Du är inte så dum som jag först trodde.'),
    silkeshager('Få se om du är lika bra på fiol som du är på fågelkännedom!!!')
    // duell
];