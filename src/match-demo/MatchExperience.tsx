import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { deuceOptions, gameModeOptions, initialSetup, qrPattern, sideChangeOptions, sponsorSuggestions } from "./demoConfig";
import "./match-demo.css";
import {
  applyPoint,
  confirmSideChange,
  createMatchState,
  getDisplayPairing,
  getDisplayServeSide,
  getLeagueStandings,
  getPointDisplay,
  type MatchSetup,
  type MatchState,
  undoLastAction,
} from "./matchEngine";

type DemoStage = "qr" | "setup" | "live" | "summary";

function formatClock(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function formatElapsed(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getPreviewSchedule(setup: MatchSetup) {
  if (setup.gameMode !== "league") {
    return [
      {
        label: "Main pairing",
        left: `${setup.players[0]} / ${setup.players[1]}`,
        right: `${setup.players[2]} / ${setup.players[3]}`,
      },
    ];
  }

  return [
    { label: "Round 1", left: `${setup.players[0]} / ${setup.players[3]}`, right: `${setup.players[1]} / ${setup.players[2]}` },
    { label: "Round 2", left: `${setup.players[0]} / ${setup.players[2]}`, right: `${setup.players[1]} / ${setup.players[3]}` },
    { label: "Round 3", left: `${setup.players[0]} / ${setup.players[1]}`, right: `${setup.players[2]} / ${setup.players[3]}` },
  ];
}

function FauxQr({ large = false }: { large?: boolean }) {
  return (
    <div className={`match-demo__qr ${large ? "match-demo__qr--large" : ""}`} aria-hidden="true">
      {qrPattern.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="match-demo__qr-row">
          {row.split("").map((bit, columnIndex) => (
            <span
              key={`cell-${rowIndex}-${columnIndex}`}
              className={`match-demo__qr-cell ${bit === "1" ? "match-demo__qr-cell--filled" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MonitorStage({
  stage,
  setup,
  match,
  now,
}: {
  stage: DemoStage;
  setup: MatchSetup;
  match: MatchState;
  now: number;
}) {
  const displayPairing = getDisplayPairing(match);
  const pointDisplay = getPointDisplay(match);
  const currentSet = match.sets[match.setIndex];
  const elapsed = formatElapsed((match.endedAt ?? now) - match.startedAt);
  const schedule = getPreviewSchedule(setup);

  if (stage === "qr" || stage === "setup") {
    return (
      <div className="match-demo__monitor-screen match-demo__monitor-screen--pre">
        <div className="match-demo__monitor-topline">
          <div>
            <span className="match-demo__eyebrow">ROSA Core HD + Vision</span>
            <strong>{setup.eventName}</strong>
          </div>
          <div className="match-demo__clock-chip">{formatClock(now)}</div>
        </div>

        <div className="match-demo__monitor-grid">
          <div className="match-demo__sponsor-hero">
            <span className="match-demo__label">Sponsor placement</span>
            <strong>{setup.sponsorName || "Your club sponsor"}</strong>
            <p>{setup.sponsorTagline || "Premium placement on QR and live monitor"}</p>
          </div>

          <div className="match-demo__qr-card">
            <span className="match-demo__label">Scan to configure match</span>
            <FauxQr large />
            <p>rosapadel.com/match-demo/setup</p>
          </div>
        </div>

        <div className="match-demo__monitor-footer">
          <div>
            <span className="match-demo__label">Upcoming format</span>
            <strong>{gameModeOptions.find((option) => option.value === setup.gameMode)?.label}</strong>
          </div>
          <div className="match-demo__schedule-strip">
            {schedule.map((entry) => (
              <div key={entry.label} className="match-demo__schedule-pill">
                <span>{entry.label}</span>
                <strong>{entry.left}</strong>
                <small>vs {entry.right}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === "summary") {
    const standings = setup.gameMode === "league" ? getLeagueStandings(match) : [];
    const champion =
      setup.gameMode === "league"
        ? standings[0]?.player ?? "League leader"
        : match.winnerSide === 0
          ? `${setup.players[0]} / ${setup.players[1]}`
          : `${setup.players[2]} / ${setup.players[3]}`;

    return (
      <div className="match-demo__monitor-screen match-demo__monitor-screen--summary">
        <div className="match-demo__monitor-topline">
          <div>
            <span className="match-demo__eyebrow">Final summary</span>
            <strong>{champion}</strong>
          </div>
          <div className="match-demo__clock-chip">{formatClock(now)}</div>
        </div>

        <div className="match-demo__summary-grid">
          <div className="match-demo__winner-card">
            <span className="match-demo__label">Finished match</span>
            <h2>{setup.gameMode === "league" ? "League rotation complete" : "Winning pair"}</h2>
            <p>
              {setup.gameMode === "league"
                ? `${champion} leads the final league table.`
                : `${champion} closes the demo match on ${setup.courtName}.`}
            </p>

            <div className="match-demo__set-summary">
              {match.sets.map((set, index) => (
                <div key={`summary-set-${index}`} className="match-demo__set-card">
                  <span>{set.pairing.title}</span>
                  <strong>
                    {set.left} - {set.right}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="match-demo__qr-card match-demo__qr-card--summary">
            <span className="match-demo__label">Scan again for a shareable recap</span>
            <FauxQr />
            <p>Players can screenshot this card or scan again to restart the match flow.</p>
          </div>
        </div>

        <div className="match-demo__summary-sponsor">
          <span>{setup.sponsorName || "Your club sponsor"}</span>
          <small>{setup.sponsorTagline || "Premium placement on QR and live monitor"}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="match-demo__monitor-screen match-demo__monitor-screen--live">
      <div className="match-demo__monitor-topline">
        <div>
          <span className="match-demo__eyebrow">{currentSet.pairing.title}</span>
          <strong>{setup.eventName}</strong>
        </div>

        <div className="match-demo__monitor-meta">
          <span className="match-demo__clock-chip">{formatClock(now)}</span>
          <span className="match-demo__clock-chip">Elapsed {elapsed}</span>
          <span className="match-demo__sponsor-chip">{setup.sponsorName || "Sponsor"}</span>
        </div>
      </div>

      <div className="match-demo__scoreboard">
        <div className="match-demo__team match-demo__team--left">
          <span className="match-demo__label">Left side</span>
          <h2>{displayPairing.left}</h2>
          <strong className={`match-demo__point-value ${pointDisplay.starPoint ? "match-demo__point-value--star" : ""}`}>
            {pointDisplay.left}
          </strong>
        </div>

        <div className="match-demo__center-panel">
          <div className="match-demo__sets-grid">
            {match.sets.map((set, index) => (
              <div
                key={`monitor-set-${index}`}
                className={`match-demo__set-box ${index === match.setIndex ? "match-demo__set-box--active" : ""}`}
              >
                <span>S{index + 1}</span>
                <strong>
                  {set.left} - {set.right}
                </strong>
              </div>
            ))}
          </div>

          <div className="match-demo__status-row">
            <span>
              {pointDisplay.superTiebreak
                ? "Super tiebreak"
                : pointDisplay.tiebreak
                  ? "Tiebreak"
                  : pointDisplay.starPoint
                    ? "Star point live"
                    : "Regular game"}
            </span>
            <span>Serve: {getDisplayServeSide(match) === 0 ? displayPairing.left : displayPairing.right}</span>
            <span>{setup.sideChangeMode === "odd_games" ? "Side changes on odd games" : "Side changes every set"}</span>
          </div>
        </div>

        <div className="match-demo__team match-demo__team--right">
          <span className="match-demo__label">Right side</span>
          <h2>{displayPairing.right}</h2>
          <strong className={`match-demo__point-value ${pointDisplay.starPoint ? "match-demo__point-value--star" : ""}`}>
            {pointDisplay.right}
          </strong>
        </div>
      </div>

      {match.sideChangePrompt ? (
        <div className="match-demo__side-change-banner">
          <span>Change sides now</span>
          <strong>The next score tap confirms the swap, or you can use the explicit side-change button.</strong>
        </div>
      ) : null}
    </div>
  );
}

function SetupPanel({
  setup,
  setSetup,
  onStart,
  onBack,
}: {
  setup: MatchSetup;
  setSetup: Dispatch<SetStateAction<MatchSetup>>;
  onStart: () => void;
  onBack: () => void;
}) {
  const schedule = getPreviewSchedule(setup);

  function updatePlayer(index: number, value: string) {
    setSetup((current) => {
      const nextPlayers = [...current.players] as MatchSetup["players"];
      nextPlayers[index] = value;
      return { ...current, players: nextPlayers };
    });
  }

  return (
    <div className="match-demo__phone-shell">
      <div className="match-demo__phone-notch" />
      <div className="match-demo__phone-body">
        <div className="match-demo__panel-copy">
          <span className="match-demo__eyebrow">Web setup flow</span>
          <h2>Configure the match from the QR code landing page.</h2>
          <p>
            Same logic, stronger presentation: game mode, side changes, deuce handling,
            player names, and sponsor blocks before the monitor flips live.
          </p>
        </div>

        <div className="match-demo__option-grid">
          {gameModeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`match-demo__option-card ${setup.gameMode === option.value ? "match-demo__option-card--active" : ""}`}
              onClick={() => setSetup((current) => ({ ...current, gameMode: option.value }))}
            >
              <span>{option.label}</span>
              <small>{option.description}</small>
            </button>
          ))}
        </div>

        <div className="match-demo__selection-block">
          <div className="match-demo__selection-head">
            <strong>Side changes</strong>
            <span>Choose when the monitor should prompt players to swap ends.</span>
          </div>
          <div className="match-demo__choice-grid match-demo__choice-grid--two">
            {sideChangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`match-demo__option-card ${setup.sideChangeMode === option.value ? "match-demo__option-card--active" : ""}`}
                onClick={() => setSetup((current) => ({ ...current, sideChangeMode: option.value }))}
              >
                <span>{option.label}</span>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="match-demo__selection-block">
          <div className="match-demo__selection-head">
            <strong>Deuce handling</strong>
            <span>Select whether the point flow uses advantages, golden point, or Rosa's star-point logic.</span>
          </div>
          <div className="match-demo__option-grid match-demo__option-grid--deuce">
            {deuceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`match-demo__option-card ${setup.deuceMode === option.value ? "match-demo__option-card--active" : ""}`}
                onClick={() => setSetup((current) => ({ ...current, deuceMode: option.value }))}
              >
                <span>{option.label}</span>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="match-demo__player-grid">
          {setup.players.map((player, index) => (
            <label key={`player-${index}`} className="match-demo__field">
              <span>Player {index + 1}</span>
              <input value={player} onChange={(event) => updatePlayer(index, event.target.value)} maxLength={24} />
            </label>
          ))}
        </div>

        <div className="match-demo__player-grid match-demo__player-grid--meta">
          <label className="match-demo__field">
            <span>Event name</span>
            <input
              value={setup.eventName}
              onChange={(event) => setSetup((current) => ({ ...current, eventName: event.target.value }))}
              maxLength={42}
            />
          </label>
          <label className="match-demo__field">
            <span>Court</span>
            <input
              value={setup.courtName}
              onChange={(event) => setSetup((current) => ({ ...current, courtName: event.target.value }))}
              maxLength={20}
            />
          </label>
          <label className="match-demo__field">
            <span>Sponsor</span>
            <input
              value={setup.sponsorName}
              onChange={(event) => setSetup((current) => ({ ...current, sponsorName: event.target.value }))}
              maxLength={32}
            />
          </label>
          <label className="match-demo__field">
            <span>Sponsor tagline</span>
            <input
              value={setup.sponsorTagline}
              onChange={(event) => setSetup((current) => ({ ...current, sponsorTagline: event.target.value }))}
              maxLength={48}
            />
          </label>
        </div>

        <div className="match-demo__sponsor-suggestions">
          {sponsorSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="match-demo__chip"
              onClick={() => setSetup((current) => ({ ...current, sponsorName: suggestion }))}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="match-demo__schedule-preview">
          {schedule.map((item) => (
            <div key={item.label} className="match-demo__schedule-card">
              <span>{item.label}</span>
              <strong>{item.left}</strong>
              <small>vs {item.right}</small>
            </div>
          ))}
        </div>

        <div className="match-demo__actions">
          <button type="button" className="match-demo__button match-demo__button--ghost" onClick={onBack}>
            Back to monitor
          </button>
          <button type="button" className="match-demo__button match-demo__button--primary" onClick={onStart}>
            Start live match
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MatchExperience() {
  const [stage, setStage] = useState<DemoStage>("qr");
  const [setup, setSetup] = useState<MatchSetup>(initialSetup);
  const [match, setMatch] = useState<MatchState>(() => createMatchState(initialSetup, Date.now()));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    document.title = "ROSA Core HD match demo";
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  function startLiveMatch() {
    const normalizedPlayers = setup.players.map((player, index) => player.trim() || `Player ${index + 1}`) as MatchSetup["players"];
    const normalizedSetup = {
      ...setup,
      players: normalizedPlayers,
      sponsorName: setup.sponsorName.trim() || "Your club sponsor",
      sponsorTagline: setup.sponsorTagline.trim() || "Premium placement on QR and live monitor",
      eventName: setup.eventName.trim() || "ROSA pilot court demo",
      courtName: setup.courtName.trim() || "Court 02",
    };

    setSetup(normalizedSetup);
    setMatch(createMatchState(normalizedSetup, Date.now()));
    setStage("live");
  }

  function resetToQr() {
    const timestamp = Date.now();
    setMatch(createMatchState(setup, timestamp));
    setNow(timestamp);
    setStage("qr");
  }

  const displayPairing = getDisplayPairing(match);
  const pointDisplay = getPointDisplay(match);
  const standings = setup.gameMode === "league" ? getLeagueStandings(match) : [];
  const displayStage = stage === "live" && match.status === "finished" ? "summary" : stage;

  return (
    <main className="app-shell match-demo-page">
      <div className="page-aura page-aura-left" />
      <div className="page-aura page-aura-right" />

      <header className="topbar match-demo__topbar">
        <a className="brand-lockup" href="/match-demo">
          <img src="/assets/rosa-logo-dark.png" alt="ROSA" className="brand-wordmark" />
          <div>
            <span>Core HD + Vision</span>
            <small>Live setup and monitor simulator</small>
          </div>
        </a>

        <div className="topbar-badges">
          <span className="pill subtle">On-court monitor</span>
          <span className="pill accent">Pitch demo flow</span>
          <a className="button secondary" href="/">
            Open post-match analysis
          </a>
        </div>
      </header>

      <section className={`match-demo match-demo--${displayStage}`}>
        <div className="match-demo__header">
          <div>
            <span className="match-demo__eyebrow">ROSA Core HD + Vision</span>
            <h1>Match setup, on-court monitor, and score simulation in one route.</h1>
            <p>
              This route stages the full in-match flow: monitor QR + sponsor placement,
              web setup, live scoreboard with manual point triggers, and a final shareable summary.
            </p>
          </div>

          <div className="match-demo__header-actions">
            <div className="match-demo__stage-pills">
              {(["qr", "setup", "live", "summary"] as DemoStage[]).map((value) => (
                <span key={value} className={`match-demo__stage-pill ${displayStage === value ? "match-demo__stage-pill--active" : ""}`}>
                  {value}
                </span>
              ))}
            </div>
            <a className="match-demo__button match-demo__button--ghost" href="/">
              Return to post-match dashboard
            </a>
          </div>
        </div>

        <div className="match-demo__layout">
          <div className="match-demo__monitor-shell">
            <div className="match-demo__monitor-frame">
              <div className="match-demo__monitor-brand">
                <img src="/assets/rosa-icon-dark.svg" alt="" />
                <span>ROSA monitor simulation</span>
              </div>

              <MonitorStage stage={displayStage} setup={setup} match={match} now={now} />
            </div>
          </div>

          <aside className="match-demo__sidebar">
            {displayStage === "qr" ? (
              <div className="match-demo__sidebar-card">
                <div className="match-demo__panel-copy">
                  <span className="match-demo__eyebrow">Monitor first</span>
                  <h2>The sponsor leads while players scan the QR.</h2>
                  <p>
                    The pre-match monitor emphasizes sponsor value, event branding, and a clear QR
                    entry point before the web setup flow appears.
                  </p>
                </div>

                <div className="match-demo__value-list">
                  <div>
                    <strong>Large sponsor block</strong>
                    <span>Prime placement during queue and pre-match dwell time.</span>
                  </div>
                  <div>
                    <strong>QR to setup</strong>
                    <span>Players move from the monitor to the setup webapp without staff intervention.</span>
                  </div>
                  <div>
                    <strong>Live handoff</strong>
                    <span>Once setup is complete, the same monitor flips to the in-game scoreboard.</span>
                  </div>
                </div>

                <button type="button" className="match-demo__button match-demo__button--primary" onClick={() => setStage("setup")}>
                  Simulate QR scan
                </button>
              </div>
            ) : null}

            {displayStage === "setup" ? (
              <SetupPanel setup={setup} setSetup={setSetup} onStart={startLiveMatch} onBack={() => setStage("qr")} />
            ) : null}

            {displayStage === "live" ? (
              <div className="match-demo__sidebar-card">
                <div className="match-demo__panel-copy">
                  <span className="match-demo__eyebrow">Manual control dock</span>
                  <h2>Trigger points on the left or right side of the monitor.</h2>
                  <p>
                    This simulates the pitch flow while preserving Rosa deuce rules, side changes,
                    set progression, and a demo-only league mode extension.
                  </p>
                </div>

                <div className="match-demo__controls">
                  <button
                    type="button"
                    className="match-demo__score-button match-demo__score-button--left"
                    onClick={() => setMatch((current) => applyPoint(current, 0, Date.now()))}
                  >
                    <span>Left side point</span>
                    <strong>{displayPairing.left}</strong>
                  </button>

                  <button
                    type="button"
                    className="match-demo__score-button match-demo__score-button--right"
                    onClick={() => setMatch((current) => applyPoint(current, 1, Date.now()))}
                  >
                    <span>Right side point</span>
                    <strong>{displayPairing.right}</strong>
                  </button>
                </div>

                <div className="match-demo__utility-grid">
                  <button type="button" className="match-demo__button match-demo__button--ghost" onClick={() => setMatch((current) => undoLastAction(current))}>
                    Undo last event
                  </button>
                  <button
                    type="button"
                    className="match-demo__button match-demo__button--ghost"
                    onClick={() => setMatch((current) => confirmSideChange(current, Date.now()))}
                    disabled={!match.sideChangePrompt}
                  >
                    Confirm side change
                  </button>
                  <button type="button" className="match-demo__button match-demo__button--ghost" onClick={() => setStage("setup")}>
                    Back to setup
                  </button>
                  <button type="button" className="match-demo__button match-demo__button--primary" onClick={resetToQr}>
                    Reset to QR
                  </button>
                </div>

                <div className="match-demo__live-meta">
                  <div>
                    <span>Serve</span>
                    <strong>{getDisplayServeSide(match) === 0 ? displayPairing.left : displayPairing.right}</strong>
                  </div>
                  <div>
                    <span>Point mode</span>
                    <strong>{pointDisplay.superTiebreak ? "Super tiebreak" : pointDisplay.tiebreak ? "Tiebreak" : "Regular game"}</strong>
                  </div>
                  <div>
                    <span>Elapsed</span>
                    <strong>{formatElapsed(now - match.startedAt)}</strong>
                  </div>
                </div>

                <div className="match-demo__event-log">
                  {match.eventLog.map((entry) => (
                    <div key={`${entry.time}-${entry.label}`} className="match-demo__event-row">
                      <span>{entry.label}</span>
                      <small>{formatClock(entry.time)}</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {displayStage === "summary" ? (
              <div className="match-demo__sidebar-card">
                <div className="match-demo__panel-copy">
                  <span className="match-demo__eyebrow">Shareable recap</span>
                  <h2>{setup.gameMode === "league" ? "League standings and completed rounds" : "Final score card ready for screenshot"}</h2>
                  <p>
                    After the match, the same route pivots into a clean recap state with final set scores
                    and a fresh QR to restart the flow.
                  </p>
                </div>

                <div className="match-demo__set-results">
                  {match.sets.map((set, index) => (
                    <div key={`result-${index}`} className="match-demo__set-result">
                      <span>{set.pairing.title}</span>
                      <strong>
                        {set.left} - {set.right}
                      </strong>
                    </div>
                  ))}
                </div>

                {setup.gameMode === "league" ? (
                  <div className="match-demo__standings">
                    {standings.map((entry, index) => (
                      <div key={entry.player} className="match-demo__standing-row">
                        <span>{index + 1}</span>
                        <strong>{entry.player}</strong>
                        <small>
                          {entry.setsWon} sets | {entry.gamesWon}-{entry.gamesLost}
                        </small>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="match-demo__actions">
                  <button type="button" className="match-demo__button match-demo__button--ghost" onClick={() => setStage("setup")}>
                    Edit setup
                  </button>
                  <button type="button" className="match-demo__button match-demo__button--primary" onClick={resetToQr}>
                    Start again
                  </button>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
