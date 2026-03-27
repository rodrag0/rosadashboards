export type GameMode = "normal" | "quick" | "league";
export type SideChangeMode = "odd_games" | "every_set";
export type DeuceMode = "star" | "golden" | "advantage";
export type SideIndex = 0 | 1;

export interface MatchSetup {
  gameMode: GameMode;
  sideChangeMode: SideChangeMode;
  deuceMode: DeuceMode;
  players: [string, string, string, string];
  sponsorName: string;
  sponsorTagline: string;
  eventName: string;
  courtName: string;
}

export interface Pairing {
  left: [number, number];
  right: [number, number];
  title: string;
}

export interface SetScore {
  left: number;
  right: number;
  pairing: Pairing;
  completed: boolean;
  winner: SideIndex | null;
  superTiebreak: boolean;
}

export interface EventLogEntry {
  label: string;
  time: number;
}

export interface LeagueStanding {
  player: string;
  setsWon: number;
  gamesWon: number;
  gamesLost: number;
  differential: number;
}

export interface MatchSnapshot {
  setup: MatchSetup;
  sets: SetScore[];
  setIndex: number;
  pointsLeft: number;
  pointsRight: number;
  advLeft: boolean;
  advRight: boolean;
  starLostAdv: number;
  starPointPending: boolean;
  inTiebreak: boolean;
  inSuperTiebreak: boolean;
  tiebreakLeft: number;
  tiebreakRight: number;
  serveSide: SideIndex;
  sidesSwapped: boolean;
  sideChangePrompt: boolean;
  status: "live" | "finished";
  winnerSide: SideIndex | null;
  startedAt: number;
  endedAt: number | null;
  eventLog: EventLogEntry[];
}

export interface MatchState extends MatchSnapshot {
  history: MatchSnapshot[];
}

const MAX_HISTORY = 200;

function pairingForSet(setup: MatchSetup, setIndex: number): Pairing {
  if (setup.gameMode !== "league") {
    return {
      left: [0, 1],
      right: [2, 3],
      title: `Set ${setIndex + 1}`,
    };
  }

  const leaguePairings: Pairing[] = [
    { left: [0, 3], right: [1, 2], title: "Round 1 | 1-4 vs 2-3" },
    { left: [0, 2], right: [1, 3], title: "Round 2 | 1-3 vs 2-4" },
    { left: [0, 1], right: [2, 3], title: "Round 3 | 1-2 vs 3-4" },
  ];

  return leaguePairings[Math.min(setIndex, leaguePairings.length - 1)];
}

function createEmptySets(setup: MatchSetup): SetScore[] {
  return Array.from({ length: 3 }, (_, index) => ({
    left: 0,
    right: 0,
    pairing: pairingForSet(setup, index),
    completed: false,
    winner: null,
    superTiebreak: setup.gameMode === "quick" && index === 2,
  }));
}

function snapshotState(state: MatchState): MatchSnapshot {
  return {
    ...state,
    sets: state.sets.map((set) => ({ ...set, pairing: { ...set.pairing } })),
    setup: {
      ...state.setup,
      players: [...state.setup.players] as MatchSetup["players"],
    },
    eventLog: state.eventLog.map((entry) => ({ ...entry })),
  };
}

function withHistory(state: MatchState): MatchState {
  const nextHistory = [...state.history, snapshotState(state)];
  return {
    ...state,
    history: nextHistory.slice(-MAX_HISTORY),
  };
}

function oppositeSide(side: SideIndex): SideIndex {
  return side === 0 ? 1 : 0;
}

function appendEvent(state: MatchState, label: string, time: number): MatchState {
  return {
    ...state,
    eventLog: [{ label, time }, ...state.eventLog].slice(0, 8),
  };
}

function countSetWins(state: MatchState) {
  return state.sets.reduce(
    (accumulator, set) => {
      if (set.winner === 0) {
        accumulator.left += 1;
      } else if (set.winner === 1) {
        accumulator.right += 1;
      }
      return accumulator;
    },
    { left: 0, right: 0 },
  );
}

function isDeuceContext(state: MatchState) {
  return state.pointsLeft >= 3 && state.pointsRight >= 3 && !state.inTiebreak && !state.inSuperTiebreak;
}

function pointLabel(value: number) {
  return { 0: "0", 1: "15", 2: "30", 3: "40" }[value] ?? "?";
}

function setCompleted(set: SetScore) {
  return (
    (set.left >= 6 && set.left - set.right >= 2) ||
    (set.right >= 6 && set.right - set.left >= 2) ||
    set.left === 7 ||
    set.right === 7
  );
}

function shouldEnterSetTiebreak(set: SetScore) {
  return !set.superTiebreak && set.left === 6 && set.right === 6;
}

function displaySideToLogical(state: MatchState, displaySide: SideIndex): SideIndex {
  return state.sidesSwapped ? oppositeSide(displaySide) : displaySide;
}

function maybeFlagOddGameSideChange(state: MatchState, totalGamesBefore: number) {
  if (state.setup.sideChangeMode !== "odd_games") {
    return state;
  }

  const totalAfter = totalGamesBefore + 1;
  if (totalAfter > 0 && totalAfter % 2 === 1 && !state.inTiebreak && !state.inSuperTiebreak) {
    return { ...state, sideChangePrompt: true };
  }

  return state;
}

function maybeFlagTiebreakSideChange(state: MatchState, previousTotal: number) {
  if (state.setup.sideChangeMode !== "odd_games") {
    return state;
  }

  const total = state.tiebreakLeft + state.tiebreakRight;
  if (total > 0 && total % 6 === 0 && total !== previousTotal) {
    return { ...state, sideChangePrompt: true };
  }

  return state;
}

function finishMatch(state: MatchState, timestamp: number, winnerSide: SideIndex | null = null): MatchState {
  return appendEvent(
    {
      ...state,
      status: "finished",
      winnerSide,
      endedAt: timestamp,
      sideChangePrompt: false,
    },
    "Match finished",
    timestamp,
  );
}

function moveToNextSet(state: MatchState, timestamp: number) {
  const nextIndex = state.setIndex + 1;
  if (nextIndex > 2) {
    return finishMatch(state, timestamp);
  }

  const nextSet = state.sets[nextIndex];
  return appendEvent(
    {
      ...state,
      setIndex: nextIndex,
      pointsLeft: 0,
      pointsRight: 0,
      advLeft: false,
      advRight: false,
      starLostAdv: 0,
      starPointPending: false,
      inTiebreak: false,
      inSuperTiebreak: nextSet.superTiebreak,
      tiebreakLeft: 0,
      tiebreakRight: 0,
      serveSide: oppositeSide(state.serveSide),
      sideChangePrompt: state.setup.sideChangeMode === "every_set",
      sidesSwapped: state.setup.sideChangeMode === "every_set" ? !state.sidesSwapped : state.sidesSwapped,
    },
    `Moved to ${nextSet.pairing.title}`,
    timestamp,
  );
}

function maybeFinishOrAdvance(state: MatchState, timestamp: number): MatchState {
  if (state.setup.gameMode === "league") {
    if (state.setIndex === 2) {
      return finishMatch(state, timestamp, null);
    }
    return moveToNextSet(state, timestamp);
  }

  const wins = countSetWins(state);
  if (wins.left >= 2) {
    return finishMatch(state, timestamp, 0);
  }
  if (wins.right >= 2) {
    return finishMatch(state, timestamp, 1);
  }

  if (state.setup.gameMode === "quick" && state.setIndex === 1 && wins.left === 1 && wins.right === 1) {
    return moveToNextSet(state, timestamp);
  }

  if (state.setIndex === 2) {
    return finishMatch(state, timestamp, wins.left > wins.right ? 0 : 1);
  }

  return moveToNextSet(state, timestamp);
}

function awardSet(state: MatchState, winner: SideIndex, timestamp: number): MatchState {
  const set = state.sets[state.setIndex];
  const nextSets = state.sets.map((entry, index) =>
    index === state.setIndex ? { ...set, completed: true, winner } : entry,
  );

  const nextState: MatchState = {
    ...state,
    sets: nextSets,
    pointsLeft: 0,
    pointsRight: 0,
    advLeft: false,
    advRight: false,
    starLostAdv: 0,
    starPointPending: false,
    inTiebreak: false,
    tiebreakLeft: 0,
    tiebreakRight: 0,
    inSuperTiebreak: false,
  };

  return maybeFinishOrAdvance(
    appendEvent(nextState, `${winner === 0 ? "Left" : "Right"} side won ${set.pairing.title}`, timestamp),
    timestamp,
  );
}

function awardGame(state: MatchState, winner: SideIndex, timestamp: number): MatchState {
  const currentSet = state.sets[state.setIndex];
  const totalGamesBefore = currentSet.left + currentSet.right;
  const nextSet = {
    ...currentSet,
    left: currentSet.left + (winner === 0 ? 1 : 0),
    right: currentSet.right + (winner === 1 ? 1 : 0),
  };

  let nextState: MatchState = {
    ...state,
    sets: state.sets.map((entry, index) => (index === state.setIndex ? nextSet : entry)),
    pointsLeft: 0,
    pointsRight: 0,
    advLeft: false,
    advRight: false,
    starLostAdv: 0,
    starPointPending: false,
    serveSide: oppositeSide(state.serveSide),
  };

  nextState = appendEvent(nextState, `${winner === 0 ? "Left" : "Right"} side won a game`, timestamp);

  if (shouldEnterSetTiebreak(nextSet)) {
    return {
      ...nextState,
      inTiebreak: true,
      tiebreakLeft: 0,
      tiebreakRight: 0,
    };
  }

  if (setCompleted(nextSet)) {
    return awardSet(nextState, winner, timestamp);
  }

  return maybeFlagOddGameSideChange(nextState, totalGamesBefore);
}

function awardSuperTiebreakSet(state: MatchState, winner: SideIndex, timestamp: number): MatchState {
  const nextSet = {
    ...state.sets[state.setIndex],
    left: state.tiebreakLeft,
    right: state.tiebreakRight,
    completed: true,
    winner,
    superTiebreak: true,
  };

  return maybeFinishOrAdvance(
    appendEvent(
      {
        ...state,
        sets: state.sets.map((entry, index) => (index === state.setIndex ? nextSet : entry)),
        pointsLeft: 0,
        pointsRight: 0,
        advLeft: false,
        advRight: false,
        starLostAdv: 0,
        starPointPending: false,
        inSuperTiebreak: false,
        tiebreakLeft: 0,
        tiebreakRight: 0,
      },
      `${winner === 0 ? "Left" : "Right"} side won the super tiebreak`,
      timestamp,
    ),
    timestamp,
  );
}

function awardTiebreakPoint(state: MatchState, side: SideIndex, timestamp: number): MatchState {
  const previousTotal = state.tiebreakLeft + state.tiebreakRight;
  let nextState: MatchState = {
    ...state,
    tiebreakLeft: state.tiebreakLeft + (side === 0 ? 1 : 0),
    tiebreakRight: state.tiebreakRight + (side === 1 ? 1 : 0),
  };

  if (state.inSuperTiebreak) {
    const targetReached =
      (nextState.tiebreakLeft >= 10 || nextState.tiebreakRight >= 10) &&
      Math.abs(nextState.tiebreakLeft - nextState.tiebreakRight) >= 2;

    if (targetReached) {
      return awardSuperTiebreakSet(nextState, nextState.tiebreakLeft > nextState.tiebreakRight ? 0 : 1, timestamp);
    }
  } else {
    const targetReached =
      (nextState.tiebreakLeft >= 7 || nextState.tiebreakRight >= 7) &&
      Math.abs(nextState.tiebreakLeft - nextState.tiebreakRight) >= 2;

    if (targetReached) {
      const currentSet = nextState.sets[nextState.setIndex];
      const winner = nextState.tiebreakLeft > nextState.tiebreakRight ? 0 : 1;
      const nextSet = {
        ...currentSet,
        left: currentSet.left + (winner === 0 ? 1 : 0),
        right: currentSet.right + (winner === 1 ? 1 : 0),
      };

      return awardSet(
        {
          ...nextState,
          sets: nextState.sets.map((entry, index) => (index === nextState.setIndex ? nextSet : entry)),
          inTiebreak: false,
        },
        winner,
        timestamp,
      );
    }
  }

  nextState = appendEvent(nextState, `${side === 0 ? "Left" : "Right"} side won a tiebreak point`, timestamp);
  return maybeFlagTiebreakSideChange(nextState, previousTotal);
}

function addAdvantagePoint(state: MatchState, side: SideIndex, timestamp: number): MatchState {
  if (side === 0) {
    if (state.advLeft) {
      return awardGame(state, 0, timestamp);
    }
    if (state.advRight) {
      return appendEvent({ ...state, advRight: false }, "Back to deuce", timestamp);
    }
    return appendEvent({ ...state, advLeft: true }, "Left side gained advantage", timestamp);
  }

  if (state.advRight) {
    return awardGame(state, 1, timestamp);
  }
  if (state.advLeft) {
    return appendEvent({ ...state, advLeft: false }, "Back to deuce", timestamp);
  }
  return appendEvent({ ...state, advRight: true }, "Right side gained advantage", timestamp);
}

function armStarPoint(state: MatchState) {
  if (!isDeuceContext(state)) {
    return state;
  }

  const starLostAdv = Math.min(state.starLostAdv + 1, 2);
  return {
    ...state,
    starLostAdv,
    starPointPending: starLostAdv >= 2,
  };
}

function addStarPoint(state: MatchState, side: SideIndex, timestamp: number): MatchState {
  if (side === 0) {
    if (state.advLeft) {
      return awardGame(state, 0, timestamp);
    }
    if (state.advRight) {
      return appendEvent(armStarPoint({ ...state, advRight: false }), "Star point armed", timestamp);
    }
    if (state.starPointPending) {
      return awardGame(state, 0, timestamp);
    }
    return appendEvent({ ...state, advLeft: true }, "Left side gained star advantage", timestamp);
  }

  if (state.advRight) {
    return awardGame(state, 1, timestamp);
  }
  if (state.advLeft) {
    return appendEvent(armStarPoint({ ...state, advLeft: false }), "Star point armed", timestamp);
  }
  if (state.starPointPending) {
    return awardGame(state, 1, timestamp);
  }
  return appendEvent({ ...state, advRight: true }, "Right side gained star advantage", timestamp);
}

function addRegularPoint(state: MatchState, side: SideIndex, timestamp: number): MatchState {
  const nextState: MatchState = {
    ...state,
    pointsLeft: state.pointsLeft + (side === 0 ? 1 : 0),
    pointsRight: state.pointsRight + (side === 1 ? 1 : 0),
  };

  if (
    (nextState.pointsLeft >= 4 || nextState.pointsRight >= 4) &&
    Math.abs(nextState.pointsLeft - nextState.pointsRight) >= 2
  ) {
    return awardGame(nextState, nextState.pointsLeft > nextState.pointsRight ? 0 : 1, timestamp);
  }

  return appendEvent(nextState, `${side === 0 ? "Left" : "Right"} side won a point`, timestamp);
}

export function createMatchState(setup: MatchSetup, timestamp = Date.now()): MatchState {
  return {
    setup,
    sets: createEmptySets(setup),
    setIndex: 0,
    pointsLeft: 0,
    pointsRight: 0,
    advLeft: false,
    advRight: false,
    starLostAdv: 0,
    starPointPending: false,
    inTiebreak: false,
    inSuperTiebreak: false,
    tiebreakLeft: 0,
    tiebreakRight: 0,
    serveSide: 0,
    sidesSwapped: false,
    sideChangePrompt: false,
    status: "live",
    winnerSide: null,
    startedAt: timestamp,
    endedAt: null,
    history: [],
    eventLog: [
      {
        label: "Match ready to start",
        time: timestamp,
      },
    ],
  };
}

export function confirmSideChange(state: MatchState, timestamp = Date.now()): MatchState {
  if (!state.sideChangePrompt || state.status === "finished") {
    return state;
  }

  return appendEvent(
    {
      ...withHistory(state),
      sideChangePrompt: false,
      sidesSwapped: !state.sidesSwapped,
    },
    "Side change confirmed",
    timestamp,
  );
}

export function applyPoint(state: MatchState, displaySide: SideIndex, timestamp = Date.now()): MatchState {
  if (state.status === "finished") {
    return state;
  }

  if (state.sideChangePrompt) {
    return confirmSideChange(state, timestamp);
  }

  const logicalSide = displaySideToLogical(state, displaySide);
  let nextState = withHistory(state);

  if (nextState.inTiebreak || nextState.inSuperTiebreak) {
    return awardTiebreakPoint(nextState, logicalSide, timestamp);
  }

  if (!isDeuceContext(nextState)) {
    nextState = {
      ...nextState,
      starLostAdv: 0,
      starPointPending: false,
    };
  }

  if (isDeuceContext(nextState)) {
    if (nextState.setup.deuceMode === "golden") {
      return awardGame(nextState, logicalSide, timestamp);
    }
    if (nextState.setup.deuceMode === "advantage") {
      return addAdvantagePoint(nextState, logicalSide, timestamp);
    }
    return addStarPoint(nextState, logicalSide, timestamp);
  }

  return addRegularPoint(nextState, logicalSide, timestamp);
}

export function undoLastAction(state: MatchState): MatchState {
  if (state.history.length === 0) {
    return state;
  }

  const previous = state.history[state.history.length - 1];
  return {
    ...previous,
    history: state.history.slice(0, -1),
  };
}

export function getDisplayPairing(state: MatchState) {
  const currentSet = state.sets[state.setIndex];
  const left = currentSet.pairing.left.map((index) => state.setup.players[index]).join(" / ");
  const right = currentSet.pairing.right.map((index) => state.setup.players[index]).join(" / ");

  if (state.sidesSwapped) {
    return { left: right, right: left, title: currentSet.pairing.title };
  }

  return { left, right, title: currentSet.pairing.title };
}

export function getPointDisplay(state: MatchState) {
  if (state.inTiebreak || state.inSuperTiebreak) {
    return {
      left: String(state.tiebreakLeft),
      right: String(state.tiebreakRight),
      tiebreak: true,
      superTiebreak: state.inSuperTiebreak,
      starPoint: false,
    };
  }

  const starPoint = state.setup.deuceMode === "star" && state.starPointPending && !state.advLeft && !state.advRight;

  if (starPoint) {
    return {
      left: "★",
      right: "★",
      tiebreak: false,
      superTiebreak: false,
      starPoint: true,
    };
  }

  return {
    left: state.advLeft ? "Ad" : pointLabel(state.pointsLeft),
    right: state.advRight ? "Ad" : pointLabel(state.pointsRight),
    tiebreak: false,
    superTiebreak: false,
    starPoint: false,
  };
}

export function getDisplayServeSide(state: MatchState): SideIndex {
  return state.sidesSwapped ? oppositeSide(state.serveSide) : state.serveSide;
}

export function getLeagueStandings(state: MatchState): LeagueStanding[] {
  const table = state.setup.players.map((player) => ({
    player,
    setsWon: 0,
    gamesWon: 0,
    gamesLost: 0,
    differential: 0,
  }));

  state.sets.forEach((set) => {
    if (!set.completed) {
      return;
    }

    set.pairing.left.forEach((index) => {
      table[index].gamesWon += set.left;
      table[index].gamesLost += set.right;
      if (set.winner === 0) {
        table[index].setsWon += 1;
      }
    });

    set.pairing.right.forEach((index) => {
      table[index].gamesWon += set.right;
      table[index].gamesLost += set.left;
      if (set.winner === 1) {
        table[index].setsWon += 1;
      }
    });
  });

  return table
    .map((entry) => ({
      ...entry,
      differential: entry.gamesWon - entry.gamesLost,
    }))
    .sort((left, right) => {
      if (right.setsWon !== left.setsWon) {
        return right.setsWon - left.setsWon;
      }
      if (right.differential !== left.differential) {
        return right.differential - left.differential;
      }
      return right.gamesWon - left.gamesWon;
    });
}
