import { Line, adam, spegel } from "./scene-utils";

const scene: Line[] = [
    adam('Phew. Vad schysst av svanen att jag fick skjuts.'),
    adam('Om legenden stämmer så borde jag ju få träffa den Största spelmannen nu, och lära mig världens bästa låt.'),
    adam('...'),
    adam('Man kanske skulle ringt i förväg eller så.'),
    adam('Men det är ett fint berg. Jag kanske skulle ta lite kort.'),
    adam('men vad är det som glimmar?'),
    spegel('', {otherAction: {type: 'enter', from: 'bottom'}}),
    adam('Vad konstigt. En spegel. Är den största spelmannen väldigt fåfäng?'),
    spegel('Spelman, spelman på berget här, säg vem den främste av spelmännen är!'),
    adam('Va?'),
    spegel('Spelman, spelman på berget här, säg vem den främste av spelmännen är!'),
    adam('Jag hörde vad du sa, jag var bara inte alls beredd på att en spegel kunde prata.'),
    spegel('Jaha. Säg det istället då.'),
    adam('Jag var inte alls beredd på att en spegel kunde prata.'),
    spegel('Ja alltså nu vet jag ju det'),
    adam('Ah justja, såklart...'),
    spegel('...'),
    adam('...'),
    spegel('*host*'),
    adam('...'),
    adam('Förlåt, vad var det jag skulle göra igen?'),
    spegel('*suck*'),
    spegel('Spelman, spelman på berget här, säg vem den främste av spelmännen är!'),
    adam('Justja! Hmm. Den är svår. Men kanske Lapp-Nils.'),
    spegel('Feeel svaar!'),
    adam('Jaha, jag trodde inte det fanns ett rätt och fel svar. Jag trodde det mer var en fråga om smak.'),
    spegel('Varför gjorde du den mödosamma resan upp på Stora Lokala Berget?'),
    adam('Heter det inte Stora Fjärran Berget?'),
    spegel('Bara om man är långt bort från det. När man väl är där så är det ju inte fjärran.'),
    adam('Justja. Rimligt.'),
    adam('Jag gick upp hit för att träffa den störste av alla spelmän och lära mig världens bästa låt.'),
    spegel('Kom närmre.'),
    // Adam går närmre och webbkameran sätts igång. Eller så är det bara samma bild av spegeln, men med tecknade adam reflekterad i den.
    // se bilden mirrir_adam
    adam('... Nu är jag lite närmre.'),
    spegel('Den spelman som trotsar sin svaga kropp och vandrar längs stigen till bergets topp,'),
    spegel('den som bekämpar vårt fågelliv med svängiga låtar och kastad täljkniv'),
    spegel('Den ska bli hyllad vartän hen än går'),
    spegel('och krönas till Spelmanskungen i år.'),
    adam('Oj, det var värst. Vänta är det här en årlig grej?'),
    spegel('Nej alltså det är liksom löpande, men det rimmade snyggt.'),
    spegel('Dessutom är du den enda som faktiskt lyckats. Alla andra blev facking nermejade av silkeshägern.'),
    // spegel('Molly och Oskar som designade spelet lyckades väl också på ett sätt medan de speltestade, men det är ju fusk.'),
    spegel('Nu är stunden kommen. Nu ska du få en fiol med en C-sträng och komponera din egen låt i C, mästarnas tonart!'),
    adam('Oj, tack! Vad kul!'),
    // Trumkomp går igång och Adam får trycka på knapparna som när han spelar en befintlig låt, men denna gången sparas hans knapptryck och
    // översätts till toner. Han får bara ett försök på sig :)

];

export default scene;