import { Line, adam, svan } from "./scene-utils";

const scene: Line[] = [
  adam("Känns ju lite skumt att mörda fåglar så här mycket"),
  adam("Hade kännts bättre om jag kunde rädda en fågel också"),
  // svan toner
  adam("En svan som sitter fast! "),
  svan("*pust* *puh* hjäääälp mig jag sitter fast *host*", {
    otherAction: { type: "enter", from: "bottom" },
  }),
  adam("Täljkniv!!! Eller vänta, här är ju en chans att hjälpa..."),
  adam("Tälkniv!!! fast hjälpsamt!"),
  svan("Woah, tack, är du påväg upp för berget"),
  adam("Japp, har nog en bit kvar"),
  svan(
    "Ja, det är typ 4 världar att besegra, i din väg står 9 faktioner, alla med 3 kungar att besegra"
  ),
  svan("...bergatroll, lava-flum-rides ..."),
  svan("...drakar, 3 kolibrier i en rock som försöker komma in på bio..."),
  svan("...demoner, jesus"),
  adam("..."),
  svan("men som gentjänst så kan jag ju bara flyga dig till toppen?"),
  adam("toppen?"),
  svan("toppen, då kör vi!!!", { otherAction: { type: "exit", to: "top" } }),
  adam("[tänk att han flyger med på svanen]", {
    otherAction: { type: "exit", to: "top" },
  }),
];

export default scene;
