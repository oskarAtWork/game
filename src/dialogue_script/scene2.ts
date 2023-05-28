import { Line, adam, blank, silkeshager } from "./scene-utils";

 const scene: Line[] = [
    adam('Hmmm, tänk tänk tänk....', {otherAction: {type: 'enter', from: 'left'}}),
    adam('Jag tror att berget är på andra sidan av den här skogen. Hoppas att jag får se några fina fåglar på vägen.'),
    blank('KWÄÄ! KWÄÄÄ!'),
    adam('Hmm, jag känner igen det där lätet. Kan det vara...'),
    silkeshager('KWÄ', {otherAction: {type: 'enter', from: 'top'}}),
    // Fågeln syns.
    silkeshager('Mjaaa lille pöjk, kan du gissa vad jag är för en fågel? Skulle inte tro det! HAHA!'),
    adam('Jo, jag tror jag kan gissa. Du är ju en', {response: {correctIndex: 0, options: ['Silkeshäger', 'Vittrut', 'Knölsvan']}}),
    // om han gissar rätt (silkeshäger)
    silkeshager('Jaså minsann! Du är inte så dum som jag först trodde.', {otherAction: {type: 'introduce'}}),
    silkeshager('Få se om du är lika dålig på fiol som du är på fågelkännedom!!!', {otherAction: {type: 'introduce'}})
    // duell
];

export default scene;