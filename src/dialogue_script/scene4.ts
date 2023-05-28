import { Line, adam, biatare } from "./scene-utils";

 const scene: Line[] = [
    adam('Undrar vilket håll jag ska nu...', {otherAction: {type: 'enter', from: 'bottom'}}),
    biatare('Fucking fuck you', {otherAction: {type: 'enter', from: 'top'}}),
    adam('Ojdå'),
    biatare('Jag såg vad du gjorde med silkeshägern, nu får du tampas med mig!!')
];

export default scene;