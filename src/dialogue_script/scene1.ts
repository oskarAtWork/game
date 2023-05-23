import { Line, adam, molly, oskar, playLine } from "./scene-utils";


const scene: Line[] = [
    oskar('adam! adam, vakna!'),
    adam('...', "enter_bottom"),
    oskar('Somnade du precis? Spelade jag en för sömnig låt?'),
    adam('Ahjuste. Jo men den var ganska sömnig. Haha.'),
    molly('Kan du inte lära ut den till oss?', "enter_bottom"),

    oskar('Låtar i G är så himla sömniga, tycker ni inte?', "sheet"),

    oskar('Håll in G för att spela Sömnlåten.\nSer du rytm-mätaren med den lilla bollen?\nTryck på rätt siffra när bollen passerar siffran.'),
    
    playLine('...'),
    
    adam('Vilken bra låt. Vem har du den efter?'),
    oskar('Den är efter den legendariska spelmannen\n"Spelmannen som inte får nämnas vid namn."'),
    oskar('Eller, man får nämna honom vid namn,\njag har bara glömt vad han heter.'),
    adam('Ah, okej. Har han några fler låtar vi kan jamma på?'),
    oskar('Det finns bara fyra nedtecknade. Vi kan spela allihop, det blir kul!'),
];

export default scene;

