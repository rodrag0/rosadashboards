import type { DeuceMode, GameMode, MatchSetup, SideChangeMode } from "./matchEngine";

interface Option<T> {
  value: T;
  label: string;
  description: string;
}

export const gameModeOptions: Option<GameMode>[] = [
  {
    value: "normal",
    label: "Normal match",
    description: "Best of 3 full sets with a standard tiebreak at 6-6.",
  },
  {
    value: "quick",
    label: "Quick match",
    description: "Two full sets, then a super tiebreak decider if both pairs split the match.",
  },
  {
    value: "league",
    label: "League mode",
    description: "Three fixed sets with rotating pairs so every player partners and opposes everyone else.",
  },
];

export const sideChangeOptions: Option<SideChangeMode>[] = [
  {
    value: "every_set",
    label: "Every set",
    description: "Prompt a side change whenever a set ends.",
  },
  {
    value: "odd_games",
    label: "Every odd game",
    description: "Prompt side changes on odd game totals and each 6 tiebreak points.",
  },
];

export const deuceOptions: Option<DeuceMode>[] = [
  {
    value: "star",
    label: "Star point",
    description: "After advantage is lost twice, the next deciding point closes the game.",
  },
  {
    value: "golden",
    label: "Golden point",
    description: "At deuce, the next point wins immediately.",
  },
  {
    value: "advantage",
    label: "Advantages",
    description: "Traditional deuce and advantage scoring.",
  },
];

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
