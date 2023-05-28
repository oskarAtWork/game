import { Line, adam, blank, klara, playLine } from "./scene-utils";

const scene: Line[] = [
  adam("Woah, vilken tur att jag hade täljknivar", {
    otherAction: { type: "enter", from: "left" },
  }),
  klara("Tjo i galoppen ´", { otherAction: { type: "enter", from: "bottom" } }),
  adam("Klara, kul att se dig här"),
  klara("Jo, nog är det kul att se mig alltid, vill du lära dig en låt!", {
    otherAction: { type: "sheet", song: "skaningen" },
    response: { options: ["Ja"] },
  }),
  klara("Är du säker, den är läskig", {
    response: {
      options: ["Ja för jag är en man", "Ja (men utan sexism)"],
      correctIndex: 1,
    },
  }),
  klara("Då kör vi"),
  klara("Oj, skumt sagt... iallafall"),
  playLine(
    "spela med §1234567890",
    "klara: Där satt den!!!",
    "klara: cool låt, men lät ju inte som min"
  ),
  adam("Vilken bra låt"),
  klara("Såklart, måste dra nu, ska dumstra", {
    otherAction: { type: "exit", to: "bottom" },
  }),
  adam("kanske... det här hållet", {
    otherAction: { type: "exit", to: "left" },
  }),
  adam("tydligen inte", { otherAction: { type: "exit", to: "right" } }),
  blank("..."),
];

export default scene;
