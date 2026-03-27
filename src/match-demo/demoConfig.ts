import type { Language } from "../appTypes";
import { getTranslations } from "../i18n";
import type { DeuceMode, GameMode, MatchSetup, SideChangeMode } from "./matchEngine";

interface Option<T> {
  value: T;
  label: string;
  description: string;
}

export function getGameModeOptions(language: Language): Option<GameMode>[] {
  const t = getTranslations(language).matchDemo;

  return [
    {
      value: "normal",
      label: language === "es" ? "Partido normal" : language === "de" ? "Normales Match" : "Normal match",
      description:
        language === "es"
          ? "Mejor de 3 sets completos con tiebreak estándar en 6-6."
          : language === "de"
            ? "Best of 3 volle Sätze mit Standard-Tiebreak bei 6:6."
            : "Best of 3 full sets with a standard tiebreak at 6-6.",
    },
    {
      value: "quick",
      label: language === "es" ? "Quick match" : language === "de" ? "Quick Match" : "Quick match",
      description: t.quickModeNote,
    },
    {
      value: "league",
      label: language === "es" ? "Modo liga" : language === "de" ? "Liga-Modus" : "League mode",
      description:
        language === "es"
          ? "Tres sets fijos con parejas rotativas para que todos jueguen con y contra todos."
          : language === "de"
            ? "Drei feste Sätze mit rotierenden Paarungen, damit jeder mit und gegen jeden spielt."
            : "Three fixed sets with rotating pairs so everyone plays with and against everyone.",
    },
  ];
}

export function getSideChangeOptions(language: Language): Option<SideChangeMode>[] {
  return [
    {
      value: "every_set",
      label: language === "es" ? "Cada set" : language === "de" ? "Jeder Satz" : "Every set",
      description:
        language === "es"
          ? "Pide cambio de lado al terminar cada set."
          : language === "de"
            ? "Seitenwechsel am Ende jedes Satzes."
            : "Prompt a side change whenever a set ends.",
    },
    {
      value: "odd_games",
      label: language === "es" ? "Juegos impares" : language === "de" ? "Ungerade Spiele" : "Every odd game",
      description:
        language === "es"
          ? "Pide cambio en los totales impares de juegos y cada 6 puntos de tiebreak."
          : language === "de"
            ? "Wechsel bei ungerader Spielsumme und alle 6 Tiebreak-Punkte."
            : "Prompt side changes on odd game totals and each 6 tiebreak points.",
    },
  ];
}

export function getDeuceOptions(language: Language): Option<DeuceMode>[] {
  return [
    {
      value: "star",
      label: language === "es" ? "Star point" : language === "de" ? "Star Point" : "Star point",
      description:
        language === "es"
          ? "Tras perder ventaja dos veces, el siguiente punto decide el juego."
          : language === "de"
            ? "Nach zweimal verlorenem Vorteil entscheidet der nächste Punkt das Spiel."
            : "After advantage is lost twice, the next deciding point closes the game.",
    },
    {
      value: "golden",
      label: language === "es" ? "Golden point" : language === "de" ? "Golden Point" : "Golden point",
      description:
        language === "es"
          ? "En deuce, el siguiente punto gana el juego de inmediato."
          : language === "de"
            ? "Bei Einstand entscheidet der nächste Punkt sofort das Spiel."
            : "At deuce, the next point wins immediately.",
    },
    {
      value: "advantage",
      label: language === "es" ? "Ventajas" : language === "de" ? "Vorteile" : "Advantages",
      description:
        language === "es"
          ? "Puntuación tradicional con ventaja."
          : language === "de"
            ? "Traditionelle Vorteilsregel."
            : "Traditional deuce and advantage scoring.",
    },
  ];
}

export const sponsorSuggestions = [
  "Bullpadel Pro Shop",
  "Reserva del Club",
  "Hydra Electrolytes",
  "Clubhouse Recovery Lab",
];

export const initialSetup: MatchSetup = {
  gameMode: "normal",
  sideChangeMode: "every_set",
  deuceMode: "golden",
  players: ["Rodrigo", "Omar", "Saul", "Memo"],
  sponsorName: "Club Partner",
  sponsorTagline: "Premium scoreboard branding space",
  sponsorLogoText: "CP",
  eventName: "ROSA Vision Exhibition Night",
  courtName: "Court 02",
};

export const qrPattern: string[] = [
  "111111101001101111111",
  "100000100110101000001",
  "101110101010101011101",
  "101110100100001011101",
  "101110101111101011101",
  "100000100010101000001",
  "111111101010101111111",
  "000000000111100000000",
  "110011110001011110011",
  "001101001101010011010",
  "111001110111000110111",
  "010110000101101001101",
  "110101111001100101010",
  "000000000010111000000",
  "111111100111001101101",
  "100000101000011010001",
  "101110100111100111101",
  "101110101010010101110",
  "101110100101111000111",
  "100000101001001011001",
  "111111101110111101111",
];

