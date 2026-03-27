import type { Language } from "../appTypes";

export type TeamId = "rosa" | "rivals";

export type HighlightFilter =
  | "all"
  | "winner"
  | "transition"
  | "defense"
  | "pressure"
  | "variation";

export interface HighlightClip {
  id: string;
  title: string;
  summary: string;
  filter: HighlightFilter;
  cue: number;
  timeLabel: string;
  duration: string;
  setLabel: string;
  score: string;
  shot: string;
  situation: string;
  confidence: number;
  team: TeamId;
}

export interface PlayerProfile {
  id: string;
  shortName: string;
  fullName: string;
  team: TeamId;
  role: string;
  impact: number;
  impactShare: number;
  clutch: number;
  winners: number;
  forcedErrors: number;
  unforcedErrors: number;
  smashesWon: number;
  smashesTotal: number;
  netConversion: number;
  pressurePointsWon: string;
  decisionRating: number;
  keyLine: string;
  avatarGradient: string;
  shotMix: { label: string; value: number }[];
  mvp?: boolean;
}

export interface HeatPoint {
  x: number;
  y: number;
  intensity: number;
}

export interface MatchData {
  match: {
    title: string;
    subtitle: string;
    competition: string;
    venue: string;
    date: string;
    duration: string;
    reportReady: string;
    scoreSync: string;
    averageRally: number;
    longestRally: number;
    taggedEvents: number;
    autoSelectedClips: number;
    sets: { rosa: number; rivals: number }[];
    finalHeadline: string;
    summary: string;
  };
  teamComparison: {
    team: TeamId;
    pointsWon: number;
    winners: number;
    unforcedErrors: number;
    breakPoints: string;
    netConversion: string;
    firstVolleyKill: string;
    defensiveResets: number;
  }[];
  filters: { id: HighlightFilter; label: string; count: number }[];
  highlights: HighlightClip[];
  players: PlayerProfile[];
  shotBreakdown: { label: string; rosa: number; rivals: number }[];
  momentum: { point: number; rosa: number; rivals: number }[];
  heatmaps: {
    rodrigo: HeatPoint[];
    omar: HeatPoint[];
    saul: HeatPoint[];
    memo: HeatPoint[];
    winnerZones: HeatPoint[];
    pressureMap: HeatPoint[];
  };
  insights: { title: string; body: string }[];
}

export const teamStyles = {
  rosa: {
    label: "ROD / OMA",
    names: "Rodrigo Ortiz / Omar Diaz",
    color: "#ff0a8c",
    soft: "rgba(255, 10, 140, 0.18)",
  },
  rivals: {
    label: "SAU / MEM",
    names: "Saul Mendez / Memo Luna",
    color: "#8bd8e8",
    soft: "rgba(139, 216, 232, 0.18)",
  },
} as const;

const base = {
  match: {
    date: "27 Mar 2026",
    duration: "1h 29m",
    scoreSync: "99.2%",
    averageRally: 6.8,
    longestRally: 22,
    taggedEvents: 184,
    autoSelectedClips: 18,
    sets: [
      { rosa: 6, rivals: 4 },
      { rosa: 2, rivals: 6 },
      { rosa: 7, rivals: 5 },
    ],
  },
  teamComparison: [
    {
      team: "rosa" as TeamId,
      pointsWon: 89,
      winners: 42,
      unforcedErrors: 26,
      breakPoints: "4/9",
      netConversion: "68%",
      firstVolleyKill: "61%",
      defensiveResets: 17,
    },
    {
      team: "rivals" as TeamId,
      pointsWon: 86,
      winners: 37,
      unforcedErrors: 31,
      breakPoints: "3/8",
      netConversion: "61%",
      firstVolleyKill: "52%",
      defensiveResets: 13,
    },
  ],
  filters: [
    { id: "all" as HighlightFilter, count: 18 },
    { id: "winner" as HighlightFilter, count: 6 },
    { id: "transition" as HighlightFilter, count: 4 },
    { id: "defense" as HighlightFilter, count: 3 },
    { id: "pressure" as HighlightFilter, count: 3 },
    { id: "variation" as HighlightFilter, count: 2 },
  ],
  highlights: [
    { id: "closing-smash", filter: "winner" as HighlightFilter, cue: 0.12, timeLabel: "01:06", duration: "0:16", setLabel: "Set 3", score: "6-5, 40-15", confidence: 97, team: "rosa" as TeamId },
    { id: "golden-return", filter: "pressure" as HighlightFilter, cue: 0.21, timeLabel: "01:51", duration: "0:18", setLabel: "Set 2", score: "2-3, deciding point", confidence: 91, team: "rivals" as TeamId },
    { id: "lob-reset", filter: "defense" as HighlightFilter, cue: 0.3, timeLabel: "02:33", duration: "0:15", setLabel: "Set 1", score: "4-4, 30-30", confidence: 89, team: "rivals" as TeamId },
    { id: "omid-poach", filter: "transition" as HighlightFilter, cue: 0.38, timeLabel: "03:04", duration: "0:13", setLabel: "Set 3", score: "3-2, 15-0", confidence: 93, team: "rosa" as TeamId },
    { id: "vibora-target", filter: "variation" as HighlightFilter, cue: 0.46, timeLabel: "03:39", duration: "0:14", setLabel: "Set 1", score: "2-1, 30-15", confidence: 86, team: "rosa" as TeamId },
    { id: "sidewall-scramble", filter: "defense" as HighlightFilter, cue: 0.54, timeLabel: "04:16", duration: "0:20", setLabel: "Set 2", score: "4-2, 15-30", confidence: 88, team: "rivals" as TeamId },
    { id: "serve-plus-one", filter: "winner" as HighlightFilter, cue: 0.64, timeLabel: "05:02", duration: "0:11", setLabel: "Set 1", score: "5-4, 15-0", confidence: 90, team: "rosa" as TeamId },
    { id: "pressure-defense", filter: "pressure" as HighlightFilter, cue: 0.73, timeLabel: "05:46", duration: "0:17", setLabel: "Set 3", score: "5-5, 30-40", confidence: 95, team: "rosa" as TeamId },
    { id: "backhand-pass", filter: "winner" as HighlightFilter, cue: 0.82, timeLabel: "06:20", duration: "0:09", setLabel: "Set 2", score: "5-2, 40-30", confidence: 84, team: "rivals" as TeamId },
    { id: "bandeja-drift", filter: "variation" as HighlightFilter, cue: 0.9, timeLabel: "06:58", duration: "0:12", setLabel: "Set 3", score: "4-4, 15-15", confidence: 87, team: "rosa" as TeamId },
  ],
  players: [
    { id: "rodrigo", shortName: "Rodrigo", fullName: "Rodrigo Ortiz", team: "rosa" as TeamId, impact: 8.7, impactShare: 87, clutch: 92, winners: 16, forcedErrors: 11, unforcedErrors: 6, smashesWon: 7, smashesTotal: 9, netConversion: 74, pressurePointsWon: "7/9", decisionRating: 1.42, avatarGradient: "linear-gradient(135deg, #ff0a8c 0%, #ff7cbf 100%)", shotMixValues: [14, 8, 18, 9], mvp: true },
    { id: "omar", shortName: "Omar", fullName: "Omar Diaz", team: "rosa" as TeamId, impact: 7.9, impactShare: 79, clutch: 81, winners: 12, forcedErrors: 9, unforcedErrors: 7, smashesWon: 4, smashesTotal: 6, netConversion: 69, pressurePointsWon: "6/9", decisionRating: 1.11, avatarGradient: "linear-gradient(135deg, #ff4ca8 0%, #ffc1de 100%)", shotMixValues: [21, 7, 11, 6], mvp: false },
    { id: "saul", shortName: "Saul", fullName: "Saul Mendez", team: "rivals" as TeamId, impact: 7.4, impactShare: 74, clutch: 76, winners: 11, forcedErrors: 8, unforcedErrors: 9, smashesWon: 5, smashesTotal: 8, netConversion: 63, pressurePointsWon: "5/8", decisionRating: 0.78, avatarGradient: "linear-gradient(135deg, #8bd8e8 0%, #c5f6ff 100%)", shotMixValues: [17, 6, 13, 8], mvp: false },
    { id: "memo", shortName: "Memo", fullName: "Memo Luna", team: "rivals" as TeamId, impact: 6.9, impactShare: 69, clutch: 72, winners: 9, forcedErrors: 6, unforcedErrors: 12, smashesWon: 3, smashesTotal: 6, netConversion: 58, pressurePointsWon: "4/8", decisionRating: 0.41, avatarGradient: "linear-gradient(135deg, #59bfd5 0%, #a8eef7 100%)", shotMixValues: [16, 11, 5, 6], mvp: false },
  ],
  shotBreakdown: [
    { rosa: 39, rivals: 33 },
    { rosa: 19, rivals: 14 },
    { rosa: 11, rivals: 8 },
    { rosa: 15, rivals: 14 },
    { rosa: 24, rivals: 29 },
    { rosa: 12, rivals: 9 },
  ],
  momentum: [
    { point: 1, rosa: 52, rivals: 48 },
    { point: 2, rosa: 54, rivals: 49 },
    { point: 3, rosa: 58, rivals: 47 },
    { point: 4, rosa: 61, rivals: 45 },
    { point: 5, rosa: 63, rivals: 44 },
    { point: 6, rosa: 65, rivals: 43 },
    { point: 7, rosa: 57, rivals: 50 },
    { point: 8, rosa: 51, rivals: 56 },
    { point: 9, rosa: 48, rivals: 61 },
    { point: 10, rosa: 44, rivals: 64 },
    { point: 11, rosa: 41, rivals: 66 },
    { point: 12, rosa: 47, rivals: 58 },
    { point: 13, rosa: 52, rivals: 53 },
    { point: 14, rosa: 55, rivals: 50 },
    { point: 15, rosa: 60, rivals: 47 },
    { point: 16, rosa: 66, rivals: 42 },
    { point: 17, rosa: 71, rivals: 39 },
    { point: 18, rosa: 76, rivals: 35 },
  ],
  heatmaps: {
    rodrigo: [
      { x: 28, y: 66, intensity: 0.44 },
      { x: 35, y: 58, intensity: 0.66 },
      { x: 43, y: 60, intensity: 0.82 },
      { x: 49, y: 68, intensity: 0.56 },
      { x: 37, y: 73, intensity: 0.34 },
      { x: 53, y: 76, intensity: 0.28 },
    ],
    omar: [
      { x: 52, y: 64, intensity: 0.38 },
      { x: 58, y: 56, intensity: 0.74 },
      { x: 66, y: 60, intensity: 0.78 },
      { x: 70, y: 69, intensity: 0.54 },
      { x: 61, y: 74, intensity: 0.36 },
      { x: 54, y: 79, intensity: 0.24 },
    ],
    saul: [
      { x: 33, y: 24, intensity: 0.34 },
      { x: 40, y: 31, intensity: 0.58 },
      { x: 47, y: 37, intensity: 0.74 },
      { x: 36, y: 42, intensity: 0.52 },
      { x: 29, y: 35, intensity: 0.28 },
      { x: 52, y: 27, intensity: 0.24 },
    ],
    memo: [
      { x: 55, y: 26, intensity: 0.3 },
      { x: 62, y: 33, intensity: 0.56 },
      { x: 69, y: 37, intensity: 0.72 },
      { x: 58, y: 43, intensity: 0.49 },
      { x: 72, y: 29, intensity: 0.4 },
      { x: 64, y: 46, intensity: 0.24 },
    ],
    winnerZones: [
      { x: 29, y: 21, intensity: 0.34 },
      { x: 42, y: 18, intensity: 0.46 },
      { x: 51, y: 25, intensity: 0.7 },
      { x: 61, y: 22, intensity: 0.62 },
      { x: 71, y: 17, intensity: 0.42 },
      { x: 65, y: 31, intensity: 0.31 },
    ],
    pressureMap: [
      { x: 32, y: 34, intensity: 0.24 },
      { x: 41, y: 39, intensity: 0.36 },
      { x: 50, y: 44, intensity: 0.58 },
      { x: 58, y: 41, intensity: 0.66 },
      { x: 66, y: 37, intensity: 0.53 },
      { x: 72, y: 33, intensity: 0.28 },
    ],
  },
} as const;

const copy = {
  en: {
    match: {
      title: "ROSA Vision match report",
      subtitle: "A simulated post-match analysis flow for clubs, tournaments, and performance-minded players.",
      competition: "Founders Club pilot match",
      venue: "Munich pilot court 02",
      reportReady: "47 sec after final point",
      finalHeadline: "Rodrigo and Omar closed the match 6-4, 2-6, 7-5 after a third-set net-pressure swing.",
      summary: "Replay, tagged highlights, heatmaps, shot counts, and player-level takeaways all stay tied to the same synced match timeline.",
    },
    filters: ["All clips", "Winner patterns", "Transition swings", "Defensive rescues", "Pressure points", "Shot variation"],
    highlights: [
      ["Closing smash chain", "Rodrigo wins the final overhead sequence after Omar forces a short reset through the middle lane.", "Smash", "Match-closing attack"],
      ["Golden-point return pressure", "Saul compresses the middle and steals serve with two deep returns and a closing backhand volley.", "Return + volley", "Break-point conversion"],
      ["Defensive lob reset", "Memo survives a fast exchange with a high defensive lob and flips the point from baseline defense to offense.", "Defensive lob", "Under heavy pressure"],
      ["Poach on transition", "Omar crosses early after a low chiquita and converts the middle ball before the rivals stabilize the net.", "Poach volley", "Baseline-to-net swing"],
      ["Vibora into backhand shoulder", "Rodrigo repeatedly targets Saul's backhand shoulder and earns a short ball for the next overhead.", "Vibora", "Pattern construction"],
      ["Side-wall scramble save", "Saul reads the rebound off glass, extends the rally, and drags the point into a 19-shot exchange.", "Side-wall defense", "Extended rally"],
      ["Serve plus one into open court", "Omar gets immediate court position and finishes the next ball into the empty deuce-side corridor.", "Forehand volley", "Serve hold"],
      ["Pressure point hold from defense", "Rodrigo and Omar survive from deep court, reset twice, and steal the point on the third overhead.", "Reset to overhead", "Break point saved"],
      ["Backhand pass through the middle seam", "Memo punishes a loose approach with the cleanest passing shot of the set.", "Backhand pass", "Counterattack"],
      ["Bandeja drift opens the lane", "Rodrigo's floating bandeja forces Saul back and creates a clean middle volley for Omar.", "Bandeja", "Space creation"],
    ],
    playerRoles: ["Left-side finisher", "Right-side controller", "Pressure returner", "Recovery defender"],
    playerKeyLines: [
      "Won the final two overhead chains and drove the strongest attack lane for the winning pair.",
      "Managed tempo with early poaches and the cleanest transition reads on the right side.",
      "Generated the best return pressure on court and drove the second-set swing.",
      "Extended rallies well, but leaked too many short resets in the last third of the match.",
    ],
    playerShotMix: [
      ["Bandejas", "Viboras", "Volleys", "Smashes"],
      ["Volleys", "Chiquitas", "Lobs", "Smashes"],
      ["Returns", "Passing shots", "Lobs", "Smashes"],
      ["Defensive lobs", "Volleys", "Glass recoveries", "Smashes"],
    ],
    shotBreakdown: ["Volleys", "Bandejas", "Viboras", "Smashes", "Lobs", "Chiquitas"],
    insights: [
      ["MVP sequence", "Rodrigo created or finished 6 of the final 8 winning points and posted the highest impact share at 87%."],
      ["Swing moment", "The match flipped back after a six-point surge built on early poaches and deeper lobs into Saul's backhand corner."],
      ["Coaching angle", "Memo's defensive recoveries kept the second set alive, but the opposition lost shape whenever one extra reset was forced before the attack."],
    ],
  },
  es: {
    match: {
      title: "Informe de partido ROSA Vision",
      subtitle: "Un flujo postpartido simulado para clubes, torneos y jugadores orientados al rendimiento.",
      competition: "Partido piloto del Founders Club",
      venue: "Pista piloto 02 de M�nich",
      reportReady: "47 s tras el �ltimo punto",
      finalHeadline: "Rodrigo y Omar cerraron el partido 6-4, 2-6, 7-5 tras un giro de presi�n en la red en el tercer set.",
      summary: "Replay, highlights etiquetados, mapas de calor, conteo de golpes y conclusiones por jugador quedan ligados a la misma l�nea temporal sincronizada.",
    },
    filters: ["Todos", "Patrones ganadores", "Cambios de transici�n", "Rescates defensivos", "Puntos de presi�n", "Variaci�n de golpe"],
    highlights: [
      ["Cadena final de remates", "Rodrigo gana la secuencia final de remates despu�s de que Omar fuerce una bola corta por el carril central.", "Remate", "Ataque para cerrar el partido"],
      ["Presi�n al golden point con la devoluci�n", "Sa�l comprime el centro y roba el saque con dos devoluciones profundas y una volea final de rev�s.", "Devoluci�n + volea", "Conversi�n de break point"],
      ["Reset defensivo con globo", "Memo sobrevive a un intercambio r�pido con un globo alto y cambia el punto de defensa a ataque.", "Globo defensivo", "Bajo mucha presi�n"],
      ["Poach en transici�n", "Omar cruza pronto tras una chiquita baja y resuelve la bola central antes de que la pareja rival estabilice la red.", "Poach de volea", "Cambio de fondo a red"],
      ["V�bora al hombro de rev�s", "Rodrigo castiga repetidamente el hombro de rev�s de Sa�l y provoca una bola corta para el siguiente overhead.", "V�bora", "Construcci�n del patr�n"],
      ["Salvada con pared lateral", "Sa�l lee el rebote en el cristal, alarga el punto y lo lleva a un intercambio de 19 golpes.", "Defensa con pared lateral", "Peloteo largo"],
      ["Saque m�s uno a pista abierta", "Omar toma posici�n enseguida y define la siguiente bola al pasillo vac�o del lado de deuce.", "Volea de derecha", "Consolidaci�n del saque"],
      ["Salvar el punto de presi�n desde defensa", "Rodrigo y Omar sobreviven desde el fondo, resetean dos veces y roban el punto con el tercer overhead.", "Reset a overhead", "Break point salvado"],
      ["Passing de rev�s por la costura central", "Memo castiga una subida floja con el passing m�s limpio del set.", "Passing de rev�s", "Contraataque"],
      ["La bandeja abre el carril", "La bandeja flotada de Rodrigo empuja a Sa�l atr�s y deja una volea central limpia para Omar.", "Bandeja", "Creaci�n de espacio"],
    ],
    playerRoles: ["Finalizador lado izquierdo", "Controlador lado derecho", "Restador de presi�n", "Defensor de recuperaci�n"],
    playerKeyLines: [
      "Gan� las dos cadenas finales de overhead y empuj� el carril ofensivo m�s fuerte de la pareja ganadora.",
      "Gestion� el ritmo con cruces tempranos y las lecturas de transici�n m�s limpias del lado derecho.",
      "Gener� la mejor presi�n al resto de la pista y marc� el giro del segundo set.",
      "Alarg� bien los puntos, pero dej� demasiadas bolas cortas en el �ltimo tercio del partido.",
    ],
    playerShotMix: [
      ["Bandejas", "V�boras", "Voleas", "Remates"],
      ["Voleas", "Chiquitas", "Globos", "Remates"],
      ["Restos", "Passings", "Globos", "Remates"],
      ["Globos defensivos", "Voleas", "Recuperaciones en cristal", "Remates"],
    ],
    shotBreakdown: ["Voleas", "Bandejas", "V�boras", "Remates", "Globos", "Chiquitas"],
    insights: [
      ["Secuencia MVP", "Rodrigo cre� o termin� 6 de los �ltimos 8 puntos ganadores y firm� la mayor cuota de impacto con 87%."],
      ["Momento del giro", "El partido volvi� a cambiar tras una racha de seis puntos apoyada en cruces tempranos y globos m�s profundos al rinc�n de rev�s de Sa�l."],
      ["�ngulo de coaching", "Las recuperaciones defensivas de Memo mantuvieron vivo el segundo set, pero la pareja rival perdi� forma cada vez que se forz� un reset extra antes del ataque."],
    ],
  },
  de: {
    match: {
      title: "ROSA Vision Matchbericht",
      subtitle: "Ein simulierter Post-Match-Flow f�r Clubs, Turniere und leistungsorientierte Spieler.",
      competition: "Pilotmatch des Founders Club",
      venue: "Pilot-Court 02 in M�nchen",
      reportReady: "47 Sek. nach dem letzten Punkt",
      finalHeadline: "Rodrigo und Omar entschieden das Match 6:4, 2:6, 7:5 nach einem Netzdruck-Swing im dritten Satz.",
      summary: "Replay, markierte Highlights, Heatmaps, Schlaganzahl und Spieler-Insights bleiben an derselben synchronisierten Match-Timeline gekoppelt.",
    },
    filters: ["Alle Clips", "Winner-Muster", "Transitionswechsel", "Defensiv-Rettungen", "Druckpunkte", "Schlagvariation"],
    highlights: [
      ["Abschlusskette mit Smash", "Rodrigo gewinnt die finale Overhead-Sequenz, nachdem Omar durch die Mitte einen kurzen Reset erzwingt.", "Smash", "Angriff zum Matchende"],
      ["Golden-Point-Druck beim Return", "Saul verdichtet die Mitte und holt sich den Aufschlag mit zwei tiefen Returns und einer finalen R�ckhand-Volley.", "Return + Volley", "Breakball-Verwertung"],
      ["Defensiver Lob-Reset", "Memo �berlebt einen schnellen Schlagabtausch mit einem hohen Defensiv-Lob und kippt den Punkt von Verteidigung zu Angriff.", "Defensiv-Lob", "Unter hohem Druck"],
      ["Poach in der Transition", "Omar kreuzt fr�h nach einer flachen Chiquita und verwertet den Mittelball, bevor die Gegner das Netz stabilisieren.", "Poach-Volley", "Wechsel von Grundlinie zu Netz"],
      ["Vibora an die R�ckhandschulter", "Rodrigo attackiert wiederholt Sauls R�ckhandschulter und erzwingt einen kurzen Ball f�r den n�chsten Overhead.", "Vibora", "Musteraufbau"],
      ["Rettung �ber die Seitenwand", "Saul liest den Glasabpraller, verl�ngert die Rally und zieht den Punkt in 19 Schl�ge.", "Seitenwand-Defense", "Lange Rally"],
      ["Serve plus one ins offene Feld", "Omar nimmt sofort Feldposition ein und setzt den n�chsten Ball in den offenen Deuce-Korridor.", "Vorhand-Volley", "Aufschlagspiel sichern"],
      ["Druckpunkt aus der Defensive gehalten", "Rodrigo und Omar �berleben tief im Court, resetten zweimal und stehlen den Punkt mit dem dritten Overhead.", "Reset zu Overhead", "Breakball abgewehrt"],
      ["R�ckhand-Pass durch die Mittelnaht", "Memo bestraft einen losen Angriff mit dem saubersten Passierschlag des Satzes.", "R�ckhand-Pass", "Konter"],
      ["Bandeja-Drift �ffnet die Linie", "Rodrigos schwebende Bandeja dr�ckt Saul zur�ck und schafft eine freie Mittel-Volley f�r Omar.", "Bandeja", "Raumgewinn"],
    ],
    playerRoles: ["Abschlussspieler links", "Kontrollspieler rechts", "Druck-Returner", "Recovery-Verteidiger"],
    playerKeyLines: [
      "Gewann die letzten zwei Overhead-Ketten und trieb die st�rkste Angriffslinie des Siegerpaars.",
      "Steuerte das Tempo mit fr�hen Poaches und den saubersten Transition-Reads auf der rechten Seite.",
      "Erzeugte den st�rksten Return-Druck des Matches und pr�gte den Swing im zweiten Satz.",
      "Verl�ngerte Rallys stark, gab aber im letzten Drittel zu viele kurze Resets ab.",
    ],
    playerShotMix: [
      ["Bandejas", "Viboras", "Volleys", "Smashes"],
      ["Volleys", "Chiquitas", "Lobs", "Smashes"],
      ["Returns", "Passierschl�ge", "Lobs", "Smashes"],
      ["Defensiv-Lobs", "Volleys", "Glas-Recoveries", "Smashes"],
    ],
    shotBreakdown: ["Volleys", "Bandejas", "Viboras", "Smashes", "Lobs", "Chiquitas"],
    insights: [
      ["MVP-Sequenz", "Rodrigo kreierte oder beendete 6 der letzten 8 Gewinnpunkte und erzielte mit 87 % den h�chsten Impact-Anteil."],
      ["Schl�sselmoment", "Das Match drehte nach einem Lauf von sechs Punkten zur�ck, der auf fr�hen Poaches und tieferen Lobs in Sauls R�ckhandecke basierte."],
      ["Coaching-Blick", "Memos Defensiv-Recoveries hielten den zweiten Satz am Leben, doch die Gegner verloren jedes Mal die Form, wenn vor dem Angriff ein zus�tzlicher Reset erzwungen wurde."],
    ],
  },
} as const;

export function getMatchData(language: Language): MatchData {
  const localized = copy[language];

  return {
    match: {
      title: localized.match.title,
      subtitle: localized.match.subtitle,
      competition: localized.match.competition,
      venue: localized.match.venue,
      date: base.match.date,
      duration: base.match.duration,
      reportReady: localized.match.reportReady,
      scoreSync: base.match.scoreSync,
      averageRally: base.match.averageRally,
      longestRally: base.match.longestRally,
      taggedEvents: base.match.taggedEvents,
      autoSelectedClips: base.match.autoSelectedClips,
      sets: base.match.sets.map((set) => ({ ...set })),
      finalHeadline: localized.match.finalHeadline,
      summary: localized.match.summary,
    },
    teamComparison: base.teamComparison.map((entry) => ({ ...entry })),
    filters: base.filters.map((entry, index) => ({
      ...entry,
      label: localized.filters[index],
    })),
    highlights: base.highlights.map((entry, index) => ({
      ...entry,
      title: localized.highlights[index][0],
      summary: localized.highlights[index][1],
      shot: localized.highlights[index][2],
      situation: localized.highlights[index][3],
    })),
    players: base.players.map((entry, index) => ({
      id: entry.id,
      shortName: entry.shortName,
      fullName: entry.fullName,
      team: entry.team,
      role: localized.playerRoles[index],
      impact: entry.impact,
      impactShare: entry.impactShare,
      clutch: entry.clutch,
      winners: entry.winners,
      forcedErrors: entry.forcedErrors,
      unforcedErrors: entry.unforcedErrors,
      smashesWon: entry.smashesWon,
      smashesTotal: entry.smashesTotal,
      netConversion: entry.netConversion,
      pressurePointsWon: entry.pressurePointsWon,
      decisionRating: entry.decisionRating,
      keyLine: localized.playerKeyLines[index],
      avatarGradient: entry.avatarGradient,
      shotMix: entry.shotMixValues.map((value, mixIndex) => ({
        label: localized.playerShotMix[index][mixIndex],
        value,
      })),
      mvp: entry.mvp,
    })),
    shotBreakdown: base.shotBreakdown.map((entry, index) => ({
      ...entry,
      label: localized.shotBreakdown[index],
    })),
    momentum: base.momentum.map((entry) => ({ ...entry })),
    heatmaps: {
      rodrigo: base.heatmaps.rodrigo.map((point) => ({ ...point })),
      omar: base.heatmaps.omar.map((point) => ({ ...point })),
      saul: base.heatmaps.saul.map((point) => ({ ...point })),
      memo: base.heatmaps.memo.map((point) => ({ ...point })),
      winnerZones: base.heatmaps.winnerZones.map((point) => ({ ...point })),
      pressureMap: base.heatmaps.pressureMap.map((point) => ({ ...point })),
    },
    insights: localized.insights.map((entry) => ({ title: entry[0], body: entry[1] })),
  };
}


