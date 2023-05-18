import { Line, adam, molly, oskar } from "./scene-utils";


const scene: Line[] = [
    oskar('Adam! Adam, vakna!'),
    oskar('Somnade du precis? Spelade jag en för sömnig låt?'),
    adam('Ahjuste. Jo men den var ganska sömnig. Haha.'),
    molly('Kan du inte lära ut den till oss?'),
    oskar('Okej.'),
];

<<<<<<< HEAD
export default scene;

=======
export type Line = {
    speaker: 'Oskar' | 'Adam' | ' '| 'Molly'| 'Silkeshäger',
    line: string;
    response?: string[], 
}
>>>>>>> 0111f92b30d37715a6e9c9c7e1aee4ccf0577476
