import type { Game } from "phaser";

declare module NodeJS.Global {
  interface Window {
    _game: Game;
  }
}