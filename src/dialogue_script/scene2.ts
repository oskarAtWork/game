import { Line, adam, molly, oskar } from "./scene-utils";

const scene: Line[] = [
    molly('Wow, vilka bra låtar! Det måste vara en helt otrolig spelman.'),
    oskar('Eller hur! Det sägs att han sitter på Stora Fjärran Berget och att den som går upp dit får lära sig världens bästa låt. '),
    molly('Det låter som nåt för dig, adam! Du är ju världens frilufsmänniska. Vad säger du, vågar du ta dig an den största spelmansutmaningen av dem alla?', undefined, [
        'Okej', 'Njaaa'
    ]),
    oskar('Nice! Jag har annat för mig så du får göra det själv.', 'exit'),
    molly('Öh, jag med. Men love that journey for you!', 'exit'),
    adam('Haha, okej.'),
];

export default scene;