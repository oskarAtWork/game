import { Line, adam, molly, oskar, playLine } from "./scene-utils";


const scene: Line[] = [
    oskar('adam! adam, vakna!'),
    adam('...', {type: 'enter', from: "bottom"}),
    oskar('Somnade du precis? Spelade jag en för sömnig låt?'),
    adam('Ahjuste. Jo men den var ganska sömnig. Haha.'),
    molly('Kan du inte lära ut den till oss?', {type: 'enter', from: 'bottom'}),

    oskar('Låtar i G är så himla sömniga, tycker ni inte?', {type: "sheet", song: 'sovningen'}),

    oskar('Håll in G för att spela Sömnlåten.\nSer du rytm-mätaren med den lilla bollen?\nTryck på rätt siffra när bollen passerar siffran.'),
    
    playLine('...', 'Woah, snyggt\n[space] för att fortsätta\n[backspace] för att försöka igen', 'vi testar en gång till\n[backspace] för att försöka igen'),
    
    adam('Vilken bra låt. Vem har du den efter?'),
    oskar('Den är efter den legendariska spelmannen\n"Spelmannen som inte får nämnas vid namn."'),
    oskar('Eller, man får nämna honom vid namn,\njag har bara glömt vad han heter.'),
    adam('Ah, okej. Har han några fler låtar vi kan jamma på?'),

    oskar(
        "Tyvärr inte! Det sägs att han sitter på Stora Fjärran Berget och att den som går upp dit får lära sig världens bästa låt.\n Och på vägen dit lär man sig några låtar också"
      ),

    molly(
        "Det låter som nåt för dig Adam! Du är ju världens frilufsmänniska. Vad säger du, vågar du ta dig an den största spelmansutmaningen av dem alla?",
        undefined,
        { options: ["Okej", "Njaaa"]  }
      ),
      oskar("Nice! Jag har annat för mig så du får göra det själv.", {type: 'exit', to: "right"}),
      molly("Öh, jag med. Men love that journey for you!", {type: 'exit', to: "right"}),
      adam("Haha, okej."),
];

export default scene;

