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

export const matchData = {
  match: {
    title: "ROSA Vision match report",
    subtitle:
      "A simulated post-match analysis flow for clubs, tournaments, and performance-minded players.",
    competition: "Founders Club pilot match",
    venue: "Munich pilot court 02",
    date: "27 Mar 2026",
    duration: "1h 29m",
    reportReady: "47 sec after final point",
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
    finalHeadline: "Rodrigo and Omar closed the match 6-4, 2-6, 7-5 after a third-set net-pressure swing.",
    summary:
      "Replay, tagged highlights, heatmaps, shot counts, and player-level takeaways all stay tied to the same synced match timeline.",
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
      longestRun: "9 straight points",
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
      longestRun: "7 straight points",
    },
  ],
  filters: [
    { id: "all" as HighlightFilter, label: "All clips", count: 18 },
    { id: "winner" as HighlightFilter, label: "Winner patterns", count: 6 },
    { id: "transition" as HighlightFilter, label: "Transition swings", count: 4 },
    { id: "defense" as HighlightFilter, label: "Defensive rescues", count: 3 },
    { id: "pressure" as HighlightFilter, label: "Pressure points", count: 3 },
    { id: "variation" as HighlightFilter, label: "Shot variation", count: 2 },
  ],
  highlights: [
    {
      id: "closing-smash",
      title: "Closing smash chain",
      summary: "Rodrigo wins the final overhead sequence after Omar forces a short reset in the middle lane.",
      filter: "winner" as HighlightFilter,
      cue: 0.12,
      timeLabel: "01:06",
      duration: "0:16",
      setLabel: "Set 3",
      score: "6-5, 40-15",
      shot: "Smash",
      situation: "Match-closing attack",
      confidence: 97,
      team: "rosa" as TeamId,
    },
    {
      id: "golden-return",
      title: "Golden-point return pressure",
      summary: "Saul compresses the middle and steals the serve with two deep returns and a closing backhand volley.",
      filter: "pressure" as HighlightFilter,
      cue: 0.21,
      timeLabel: "01:51",
      duration: "0:18",
      setLabel: "Set 2",
      score: "2-3, deciding point",
      shot: "Return + volley",
      situation: "Break-point conversion",
      confidence: 91,
      team: "rivals" as TeamId,
    },
    {
      id: "lob-reset",
      title: "Defensive lob reset",
      summary: "Memo survives a fast exchange with a high defensive lob and flips the point from baseline defense to offense.",
      filter: "defense" as HighlightFilter,
      cue: 0.3,
      timeLabel: "02:33",
      duration: "0:15",
      setLabel: "Set 1",
      score: "4-4, 30-30",
      shot: "Defensive lob",
      situation: "Under heavy pressure",
      confidence: 89,
      team: "rivals" as TeamId,
    },
    {
      id: "omid-poach",
      title: "Poach on transition",
      summary: "Omar crosses early after a low chiquita and converts the middle ball before the rivals stabilize the net.",
      filter: "transition" as HighlightFilter,
      cue: 0.38,
      timeLabel: "03:04",
      duration: "0:13",
      setLabel: "Set 3",
      score: "3-2, 15-0",
      shot: "Poach volley",
      situation: "Baseline-to-net swing",
      confidence: 93,
      team: "rosa" as TeamId,
    },
    {
      id: "vibora-target",
      title: "Vibora into backhand shoulder",
      summary: "Rodrigo repeatedly targets Saul's backhand shoulder and earns a short ball for the next overhead.",
      filter: "variation" as HighlightFilter,
      cue: 0.46,
      timeLabel: "03:39",
      duration: "0:14",
      setLabel: "Set 1",
      score: "2-1, 30-15",
      shot: "Vibora",
      situation: "Pattern construction",
      confidence: 86,
      team: "rosa" as TeamId,
    },
    {
      id: "sidewall-scramble",
      title: "Side-wall scramble save",
      summary: "Saul reads the rebound off glass, extends the rally, and drags Rosa into a 19-shot exchange.",
      filter: "defense" as HighlightFilter,
      cue: 0.54,
      timeLabel: "04:16",
      duration: "0:20",
      setLabel: "Set 2",
      score: "4-2, 15-30",
      shot: "Side-wall defense",
      situation: "Extended rally",
      confidence: 88,
      team: "rivals" as TeamId,
    },
    {
      id: "serve-plus-one",
      title: "Serve plus one into open court",
      summary: "Omar gets immediate court position and finishes the next ball into the empty deuce side corridor.",
      filter: "winner" as HighlightFilter,
      cue: 0.64,
      timeLabel: "05:02",
      duration: "0:11",
      setLabel: "Set 1",
      score: "5-4, 15-0",
      shot: "Forehand volley",
      situation: "Serve hold",
      confidence: 90,
      team: "rosa" as TeamId,
    },
    {
      id: "pressure-defense",
      title: "Pressure point hold from defense",
      summary: "Rodrigo and Omar survive from deep court, reset twice, and steal the point on the third overhead.",
      filter: "pressure" as HighlightFilter,
      cue: 0.73,
      timeLabel: "05:46",
      duration: "0:17",
      setLabel: "Set 3",
      score: "5-5, 30-40",
      shot: "Reset to overhead",
      situation: "Break point saved",
      confidence: 95,
      team: "rosa" as TeamId,
    },
    {
      id: "backhand-pass",
      title: "Backhand pass through the middle seam",
      summary: "Memo punishes a loose approach with the cleanest passing shot of the set.",
      filter: "winner" as HighlightFilter,
      cue: 0.82,
      timeLabel: "06:20",
      duration: "0:09",
      setLabel: "Set 2",
      score: "5-2, 40-30",
      shot: "Backhand pass",
      situation: "Counterattack",
      confidence: 84,
      team: "rivals" as TeamId,
    },
    {
      id: "bandeja-drift",
      title: "Bandeja drift opens the lane",
      summary: "Rodrigo's floating bandeja forces Saul back and creates a clean middle volley for Omar.",
      filter: "variation" as HighlightFilter,
      cue: 0.9,
      timeLabel: "06:58",
      duration: "0:12",
      setLabel: "Set 3",
      score: "4-4, 15-15",
      shot: "Bandeja",
      situation: "Space creation",
      confidence: 87,
      team: "rosa" as TeamId,
    },
  ] satisfies HighlightClip[],
  players: [
    {
      id: "rodrigo",
      shortName: "Rodrigo",
      fullName: "Rodrigo Ortiz",
      team: "rosa" as TeamId,
      role: "Left-side finisher",
      impact: 8.7,
      impactShare: 87,
      clutch: 92,
      winners: 16,
      forcedErrors: 11,
      unforcedErrors: 6,
      smashesWon: 7,
      smashesTotal: 9,
      netConversion: 74,
      pressurePointsWon: "7/9",
      decisionRating: 1.42,
      keyLine: "Won the final two overhead chains and drove Rosa's strongest attack lane.",
      avatarGradient: "linear-gradient(135deg, #ff0a8c 0%, #ff7cbf 100%)",
      shotMix: [
        { label: "Bandejas", value: 14 },
        { label: "Viboras", value: 8 },
        { label: "Volleys", value: 18 },
        { label: "Smashes", value: 9 },
      ],
      mvp: true,
    },
    {
      id: "omar",
      shortName: "Omar",
      fullName: "Omar Diaz",
      team: "rosa" as TeamId,
      role: "Right-side controller",
      impact: 7.9,
      impactShare: 79,
      clutch: 81,
      winners: 12,
      forcedErrors: 9,
      unforcedErrors: 7,
      smashesWon: 4,
      smashesTotal: 6,
      netConversion: 69,
      pressurePointsWon: "6/9",
      decisionRating: 1.11,
      keyLine: "Managed tempo with early poaches and the cleanest transition reads on the right side.",
      avatarGradient: "linear-gradient(135deg, #ff4ca8 0%, #ffc1de 100%)",
      shotMix: [
        { label: "Volleys", value: 21 },
        { label: "Chiquitas", value: 7 },
        { label: "Lobs", value: 11 },
        { label: "Smashes", value: 6 },
      ],
    },
    {
      id: "saul",
      shortName: "Saul",
      fullName: "Saul Mendez",
      team: "rivals" as TeamId,
      role: "Pressure returner",
      impact: 7.4,
      impactShare: 74,
      clutch: 76,
      winners: 11,
      forcedErrors: 8,
      unforcedErrors: 9,
      smashesWon: 5,
      smashesTotal: 8,
      netConversion: 63,
      pressurePointsWon: "5/8",
      decisionRating: 0.78,
      keyLine: "Best return pressure on the court and the main reason the second set tilted away from Rosa.",
      avatarGradient: "linear-gradient(135deg, #8bd8e8 0%, #c5f6ff 100%)",
      shotMix: [
        { label: "Returns", value: 17 },
        { label: "Passing shots", value: 6 },
        { label: "Lobs", value: 13 },
        { label: "Smashes", value: 8 },
      ],
    },
    {
      id: "memo",
      shortName: "Memo",
      fullName: "Memo Luna",
      team: "rivals" as TeamId,
      role: "Recovery defender",
      impact: 6.9,
      impactShare: 69,
      clutch: 72,
      winners: 9,
      forcedErrors: 6,
      unforcedErrors: 12,
      smashesWon: 3,
      smashesTotal: 6,
      netConversion: 58,
      pressurePointsWon: "4/8",
      decisionRating: 0.41,
      keyLine: "Extended rallies well, but leaked too many short resets in the last third of the match.",
      avatarGradient: "linear-gradient(135deg, #59bfd5 0%, #a8eef7 100%)",
      shotMix: [
        { label: "Defensive lobs", value: 16 },
        { label: "Volleys", value: 11 },
        { label: "Glass recoveries", value: 5 },
        { label: "Smashes", value: 6 },
      ],
    },
  ] satisfies PlayerProfile[],
  shotBreakdown: [
    { label: "Volleys", rosa: 39, rivals: 33 },
    { label: "Bandejas", rosa: 19, rivals: 14 },
    { label: "Viboras", rosa: 11, rivals: 8 },
    { label: "Smashes", rosa: 15, rivals: 14 },
    { label: "Lobs", rosa: 24, rivals: 29 },
    { label: "Chiquitas", rosa: 12, rivals: 9 },
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
      { x: 34, y: 28, intensity: 0.8 },
      { x: 40, y: 36, intensity: 0.7 },
      { x: 47, y: 42, intensity: 0.56 },
      { x: 58, y: 31, intensity: 0.52 },
      { x: 61, y: 52, intensity: 0.34 },
      { x: 69, y: 24, intensity: 0.28 },
    ],
    omar: [
      { x: 51, y: 46, intensity: 0.52 },
      { x: 59, y: 35, intensity: 0.78 },
      { x: 66, y: 44, intensity: 0.74 },
      { x: 72, y: 30, intensity: 0.48 },
      { x: 62, y: 61, intensity: 0.34 },
      { x: 44, y: 58, intensity: 0.2 },
    ],
    saul: [
      { x: 28, y: 61, intensity: 0.37 },
      { x: 31, y: 49, intensity: 0.61 },
      { x: 37, y: 42, intensity: 0.73 },
      { x: 46, y: 33, intensity: 0.55 },
      { x: 54, y: 41, intensity: 0.33 },
      { x: 65, y: 26, intensity: 0.24 },
    ],
    memo: [
      { x: 42, y: 70, intensity: 0.31 },
      { x: 49, y: 60, intensity: 0.46 },
      { x: 58, y: 53, intensity: 0.69 },
      { x: 64, y: 47, intensity: 0.73 },
      { x: 72, y: 41, intensity: 0.49 },
      { x: 78, y: 29, intensity: 0.21 },
    ],
    winnerZones: [
      { x: 24, y: 17, intensity: 0.43 },
      { x: 39, y: 26, intensity: 0.56 },
      { x: 48, y: 22, intensity: 0.65 },
      { x: 61, y: 34, intensity: 0.71 },
      { x: 69, y: 18, intensity: 0.62 },
      { x: 75, y: 28, intensity: 0.4 },
    ],
    pressureMap: [
      { x: 27, y: 68, intensity: 0.26 },
      { x: 35, y: 56, intensity: 0.41 },
      { x: 48, y: 51, intensity: 0.6 },
      { x: 58, y: 43, intensity: 0.74 },
      { x: 63, y: 61, intensity: 0.67 },
      { x: 72, y: 49, intensity: 0.39 },
    ],
  },
  insights: [
    {
      title: "MVP sequence",
      body: "Rodrigo created or finished 6 of the final 8 Rosa winning points and posted the highest impact share at 87%.",
    },
    {
      title: "Swing moment",
      body: "The match flipped back toward Rosa after a six-point surge built on early poaches and deeper lobs into Saul's backhand corner.",
    },
    {
      title: "Coaching angle",
      body: "Memo's defensive recoveries kept the second set alive, but the rivals lost shape whenever Rosa forced one extra reset before attacking.",
    },
  ],
};
