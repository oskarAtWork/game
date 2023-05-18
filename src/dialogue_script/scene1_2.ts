const oskar = (line:string, response?: string[]): Line => ({speaker: 'Oskar', line, response})
const adam = (line:string, response?: string[]): Line => ({speaker: 'Adam', line, response})
// const molly = (line:string, response?: string[]): Line => ({speaker: 'Molly', line, response})
import { Line } from './scene1_1';

export const scene1_2: Line[] = [
    oskar('Låtar i G är så himla sömniga, tycker ni inte? Håll in G för att spela Sömnlåten. Ser du rytm-mätaren med den lilla bollen? Tryck på rätt siffra när bollen passerar siffran.'),
    adam('Vilken bra låt. Vem har du den efter?'),
    oskar('Den är efter den legendariska spelmannen "Spelmannen som inte får nämnas vid namn."'),
    oskar('Eller, man får nämna honom vid  namn, jag har bara glömt vad han heter.'),
    adam('Ah, okej. Har han några fler låtar vi kan jamma på?'),
    oskar('Det finns bara fyra nedtecknade. Vi kan spela allihop, det blir kul!'),
];