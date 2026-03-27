import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { Language, Theme } from "../appTypes";
import { ShareIconButton } from "../components/ShareIconButton";
import { getTranslations, languageOptions } from "../i18n";
import { getDeuceOptions, getGameModeOptions, getSideChangeOptions, initialSetup, qrPattern, sponsorSuggestions } from "./demoConfig";
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

interface MatchExperienceProps {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

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

function buildSponsorMark(setup: MatchSetup) {
  const raw = (setup.sponsorLogoText || setup.sponsorName || "CL").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return raw.slice(0, 3) || "CL";
}

function getPreviewSchedule(setup: MatchSetup, t: ReturnType<typeof getTranslations>["matchDemo"]) {
  if (setup.gameMode !== "league") {
    return [
      {
        label: t.mainPairing,
        left: `${setup.players[0]} / ${setup.players[1]}`,
        right: `${setup.players[2]} / ${setup.players[3]}`,
      },
    ];
  }

  return [
    { label: t.round1, left: `${setup.players[0]} / ${setup.players[3]}`, right: `${setup.players[1]} / ${setup.players[2]}` },
    { label: t.round2, left: `${setup.players[0]} / ${setup.players[2]}`, right: `${setup.players[1]} / ${setup.players[3]}` },
    { label: t.round3, left: `${setup.players[0]} / ${setup.players[1]}`, right: `${setup.players[2]} / ${setup.players[3]}` },
  ];
}

function getMatchShareText(setup: MatchSetup, match: MatchState) {
  const scoreLine = match.sets.map((set, index) => `S${index + 1} ${set.left}-${set.right}`).join(" | ");
  return `${setup.eventName} | ${scoreLine}`;
}

async function shareSummary(mode: "copy" | "whatsapp" | "x", setup: MatchSetup, match: MatchState) {
  const url = new URL(window.location.href);
  url.hash = "summary";
  const payload = `${getMatchShareText(setup, match)} ${url.toString()}`;

  if (mode === "copy") {
    await navigator.clipboard.writeText(payload);
    return;
  }

  const encoded = encodeURIComponent(payload);
  const target = mode === "whatsapp" ? `https://wa.me/?text=${encoded}` : `https://x.com/intent/tweet?text=${encoded}`;
  window.open(target, "_blank", "noopener,noreferrer");
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
  t,
  gameModeOptions,
  deuceOptions,
  common,
}: {
  stage: DemoStage;
  setup: MatchSetup;
  match: MatchState;
  now: number;
  t: ReturnType<typeof getTranslations>["matchDemo"];
  common: ReturnType<typeof getTranslations>["common"];
  gameModeOptions: ReturnType<typeof getGameModeOptions>;
  deuceOptions: ReturnType<typeof getDeuceOptions>;
}) {
  const displayPairing = getDisplayPairing(match);
  const pointDisplay = getPointDisplay(match);
  const currentSet = match.sets[match.setIndex];
  const elapsed = formatElapsed((match.endedAt ?? now) - match.startedAt);
  const schedule = getPreviewSchedule(setup, t);
  const sponsorMark = buildSponsorMark(setup);
  const deuceLabel = deuceOptions.find((option) => option.value === setup.deuceMode)?.label ?? setup.deuceMode;

  if (stage === "qr" || stage === "setup") {
    return (
      <div className="match-demo__monitor-screen match-demo__monitor-screen--pre">
        <div className="match-demo__monitor-topline">
          <div>
            <span className="match-demo__eyebrow">{t.headerEyebrow}</span>
            <strong>{setup.eventName}</strong>
          </div>
          <div className="match-demo__monitor-meta">
            <span className="match-demo__clock-chip">{formatClock(now)}</span>
            <span className="match-demo__clock-chip">{setup.courtName}</span>
          </div>
        </div>

        <div className="match-demo__monitor-grid">
          <div className="match-demo__sponsor-hero">
            <div className="match-demo__sponsor-lockup">
              <div className="match-demo__sponsor-logo">{sponsorMark}</div>
              <div>
                <span className="match-demo__label">{t.sponsorPlacement}</span>
                <strong>{setup.sponsorName || t.defaultSponsorName}</strong>
              </div>
            </div>
            <p>{setup.sponsorTagline || t.defaultSponsorTagline}</p>
          </div>

          <div className="match-demo__qr-card">
            <span className="match-demo__label">{t.scanToConfigureMatch}</span>
            <FauxQr large />
            <p>rosapadel.com/match-demo/setup</p>
          </div>
        </div>

        <div className="match-demo__monitor-footer">
          <div>
            <span className="match-demo__label">{t.upcomingFormat}</span>
            <strong>{gameModeOptions.find((option) => option.value === setup.gameMode)?.label}</strong>
          </div>
          <div>
            <span className="match-demo__label">{t.deuceModeLabel}</span>
            <strong>{deuceLabel}</strong>
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
        ? standings[0]?.player ?? t.leagueLeader
        : match.winnerSide === 0
          ? `${setup.players[0]} / ${setup.players[1]}`
          : `${setup.players[2]} / ${setup.players[3]}`;

    return (
      <div className="match-demo__monitor-screen match-demo__monitor-screen--summary" id="summary">
        <div className="match-demo__monitor-topline">
          <div>
            <span className="match-demo__eyebrow">{t.finalSummary}</span>
            <strong>{champion}</strong>
          </div>
          <div className="match-demo__monitor-meta">
            <span className="match-demo__clock-chip">{formatClock(now)}</span>
            <span className="match-demo__sponsor-chip">{setup.sponsorName}</span>
          </div>
        </div>

        <div className="match-demo__summary-grid">
          <div className="match-demo__winner-card match-demo__winner-card--summary">
            <div className="match-demo__sponsor-lockup">
              <div className="match-demo__sponsor-logo">{sponsorMark}</div>
              <div>
                <span className="match-demo__label">{t.finishedMatch}</span>
                <h2>{setup.gameMode === "league" ? t.leagueCompleteTitle : t.winningPairTitle}</h2>
              </div>
            </div>
            <p>{setup.gameMode === "league" ? `${champion} leads the final league table.` : `${champion} closes the demo match on ${setup.courtName}.`}</p>

            <div className="match-demo__summary-kpis">
              <div>
                <span>{t.elapsed}</span>
                <strong>{elapsed}</strong>
              </div>
              <div>
                <span>{t.upcomingFormat}</span>
                <strong>{gameModeOptions.find((option) => option.value === setup.gameMode)?.label}</strong>
              </div>
              <div>
                <span>{t.deuceModeLabel}</span>
                <strong>{deuceLabel}</strong>
              </div>
            </div>

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
            <span className="match-demo__label">{t.scanAgainRecap}</span>
            <FauxQr />
            <p>{t.summaryMonitorNote}</p>
            <div className="share-action-row share-action-row--monitor">
              <ShareIconButton mode="copy" label={common.copyLink} onClick={() => void shareSummary("copy", setup, match)} />
              <ShareIconButton mode="whatsapp" label={common.whatsapp} onClick={() => void shareSummary("whatsapp", setup, match)} />
              <ShareIconButton mode="x" label={common.x} onClick={() => void shareSummary("x", setup, match)} />
            </div>
          </div>
        </div>

        <div className="match-demo__summary-sponsor">
          <div className="match-demo__sponsor-lockup">
            <div className="match-demo__sponsor-logo match-demo__sponsor-logo--small">{sponsorMark}</div>
            <span>{setup.sponsorName || t.defaultSponsorName}</span>
          </div>
          <small>{setup.sponsorTagline || t.defaultSponsorTagline}</small>
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
          <span className="match-demo__clock-chip">{t.elapsed} {elapsed}</span>
          <span className="match-demo__sponsor-chip">{setup.sponsorName || "Sponsor"}</span>
        </div>
      </div>

      <div className="match-demo__scoreboard">
        <div className="match-demo__team match-demo__team--left">
          <span className="match-demo__label">{t.leftSide}</span>
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
                ? t.superTiebreak
                : pointDisplay.tiebreak
                  ? t.tiebreak
                  : pointDisplay.starPoint
                    ? t.starPoint
                    : t.regularGame}
            </span>
            <span>{t.serve}: {getDisplayServeSide(match) === 0 ? displayPairing.left : displayPairing.right}</span>
            <span>{pointDisplay.superTiebreak ? t.superTiebreak : `${t.deuceModeLabel}: ${deuceLabel}`}</span>
            <span>{setup.sideChangeMode === "odd_games" ? t.sideChangeOdd : t.sideChangeSet}</span>
          </div>
        </div>

        <div className="match-demo__team match-demo__team--right">
          <span className="match-demo__label">{t.rightSide}</span>
          <h2>{displayPairing.right}</h2>
          <strong className={`match-demo__point-value ${pointDisplay.starPoint ? "match-demo__point-value--star" : ""}`}>
            {pointDisplay.right}
          </strong>
        </div>
      </div>

      {match.sideChangePrompt ? (
        <div className="match-demo__side-change-banner">
          <span>{t.changeSidesNow}</span>
          <strong>{t.changeSidesDescription}</strong>
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
  t,
  gameModeOptions,
  sideChangeOptions,
  deuceOptions,
}: {
  setup: MatchSetup;
  setSetup: Dispatch<SetStateAction<MatchSetup>>;
  onStart: () => void;
  onBack: () => void;
  t: ReturnType<typeof getTranslations>["matchDemo"];
  gameModeOptions: ReturnType<typeof getGameModeOptions>;
  sideChangeOptions: ReturnType<typeof getSideChangeOptions>;
  deuceOptions: ReturnType<typeof getDeuceOptions>;
}) {
  const [showAdmin, setShowAdmin] = useState(false);
  const schedule = getPreviewSchedule(setup, t);

  function updatePlayer(index: number, value: string) {
    setSetup((current) => {
      const nextPlayers = [...current.players] as MatchSetup["players"];
      nextPlayers[index] = value;
      return { ...current, players: nextPlayers };
    });
  }

  return (
    <div className="match-demo__phone-stage">
      <div className="match-demo__phone-shell">
        <span className="match-demo__phone-side-button match-demo__phone-side-button--upper" aria-hidden="true" />
        <span className="match-demo__phone-side-button match-demo__phone-side-button--lower" aria-hidden="true" />
        <div className="match-demo__phone-statusbar" aria-hidden="true">
          <span className="match-demo__phone-time">9:41</span>
          <div className="match-demo__phone-notch" />
          <div className="match-demo__phone-system">
            <span className="match-demo__phone-signal" />
            <span className="match-demo__phone-battery">
              <i />
            </span>
          </div>
        </div>

        <div className="match-demo__phone-screen">
          <div className="match-demo__phone-body">
        <div className="match-demo__panel-copy">
          <span className="match-demo__eyebrow">{t.setupEyebrow}</span>
          <h2>{t.setupTitle}</h2>
          <p>{t.setupDescription}</p>
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
            <strong>{t.sideChangesTitle}</strong>
            <span>{t.sideChangesDescription}</span>
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
            <strong>{t.deuceTitle}</strong>
            <span>{t.deuceDescription}</span>
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
          {setup.gameMode === "quick" ? <p className="match-demo__inline-note">{t.quickModeNote}</p> : null}
        </div>

        <div className="match-demo__player-grid">
          {setup.players.map((player, index) => (
            <label key={`player-${index}`} className="match-demo__field">
              <span>{t.playerLabel(index + 1)}</span>
              <input value={player} onChange={(event) => updatePlayer(index, event.target.value)} maxLength={24} />
            </label>
          ))}
        </div>

        <div className="match-demo__player-grid match-demo__player-grid--meta">
          <label className="match-demo__field">
            <span>{t.eventName}</span>
            <input
              value={setup.eventName}
              onChange={(event) => setSetup((current) => ({ ...current, eventName: event.target.value }))}
              maxLength={42}
            />
          </label>
          <label className="match-demo__field">
            <span>{t.court}</span>
            <input
              value={setup.courtName}
              onChange={(event) => setSetup((current) => ({ ...current, courtName: event.target.value }))}
              maxLength={20}
            />
          </label>
        </div>

        <div className="match-demo__admin-toggle-row">
          <div className="match-demo__selection-head">
            <strong>{t.adminTitle}</strong>
            <span>{t.adminDescription}</span>
          </div>
          <button type="button" className="match-demo__button match-demo__button--ghost" onClick={() => setShowAdmin((current) => !current)}>
            {showAdmin ? t.adminHide : t.adminShow}
          </button>
        </div>

        {showAdmin ? (
          <div className="match-demo__admin-panel">
            <div className="match-demo__player-grid match-demo__player-grid--meta">
              <label className="match-demo__field">
                <span>{t.sponsor}</span>
                <input
                  value={setup.sponsorName}
                  onChange={(event) => setSetup((current) => ({ ...current, sponsorName: event.target.value }))}
                  maxLength={32}
                />
              </label>
              <label className="match-demo__field">
                <span>{t.sponsorTagline}</span>
                <input
                  value={setup.sponsorTagline}
                  onChange={(event) => setSetup((current) => ({ ...current, sponsorTagline: event.target.value }))}
                  maxLength={48}
                />
              </label>
              <label className="match-demo__field">
                <span>{t.sponsorLogo}</span>
                <input
                  value={setup.sponsorLogoText}
                  onChange={(event) => setSetup((current) => ({ ...current, sponsorLogoText: event.target.value }))}
                  maxLength={6}
                />
              </label>
            </div>

            <div className="match-demo__sponsor-suggestions">
              {sponsorSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="match-demo__chip"
                  onClick={() =>
                    setSetup((current) => ({
                      ...current,
                      sponsorName: suggestion,
                      sponsorLogoText: suggestion
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 3)
                        .toUpperCase(),
                    }))
                  }
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

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
            {t.backToMonitor}
          </button>
          <button type="button" className="match-demo__button match-demo__button--primary" onClick={onStart}>
            {t.startLiveMatch}
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchExperience({ language, setLanguage, theme, setTheme }: MatchExperienceProps) {
  const messages = getTranslations(language);
  const t = messages.matchDemo;
  const brandWordmark = theme === "dark" ? "/assets/rosa-logo-dark.png" : "/assets/rosa-logo-light.png";
  const brandIcon = theme === "dark" ? "/assets/rosa-icon-dark.svg" : "/assets/rosa-icon-light.svg";
  const gameModeOptions = useMemo(() => getGameModeOptions(language), [language]);
  const sideChangeOptions = useMemo(() => getSideChangeOptions(language), [language]);
  const deuceOptions = useMemo(() => getDeuceOptions(language), [language]);

  const [stage, setStage] = useState<DemoStage>("qr");
  const [setup, setSetup] = useState<MatchSetup>(initialSetup);
  const [match, setMatch] = useState<MatchState>(() => createMatchState(initialSetup, Date.now()));
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

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
      sponsorName: setup.sponsorName.trim() || t.defaultSponsorName,
      sponsorTagline: setup.sponsorTagline.trim() || t.defaultSponsorTagline,
      sponsorLogoText: setup.sponsorLogoText.trim() || buildSponsorMark(setup),
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

  async function handleShare(mode: "copy" | "whatsapp" | "x") {
    await shareSummary(mode, setup, match);
    if (mode === "copy") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
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
          <img src={brandWordmark} alt="ROSA" className="brand-wordmark" />
          <div>
            <span>{t.brandTitle}</span>
            <small>{t.brandSubtitle}</small>
          </div>
        </a>

        <div className="topbar-controls">
          <div className="segment-control" aria-label={messages.common.language}>
            {languageOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`segment-control__button ${language === option ? "segment-control__button--active" : ""}`}
                onClick={() => setLanguage(option)}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className="button secondary" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? messages.common.light : messages.common.dark}
          </button>
          <a className="button secondary" href="/">
            {messages.common.openPostMatch}
          </a>
        </div>
      </header>

      <section className={`match-demo match-demo--${displayStage}`}>
        <div className="match-demo__header">
          <div>
            <span className="match-demo__eyebrow">{t.headerEyebrow}</span>
            <h1>{t.headerTitle}</h1>
            <p>{t.headerDescription}</p>
          </div>

          <div className="match-demo__header-actions">
            <div className="match-demo__stage-pills">
              {([
                ["qr", t.stageQr],
                ["setup", t.stageSetup],
                ["live", t.stageLive],
                ["summary", t.stageSummary],
              ] as const).map(([value, label]) => (
                <span key={value} className={`match-demo__stage-pill ${displayStage === value ? "match-demo__stage-pill--active" : ""}`}>
                  {label}
                </span>
              ))}
            </div>
            <a className="match-demo__button match-demo__button--ghost" href="/">
              {t.returnToPostMatch}
            </a>
          </div>
        </div>

        <div className="match-demo__layout">
          <div className="match-demo__monitor-shell">
            <div className="match-demo__monitor-frame">
              <div className="match-demo__monitor-brand">
                <img src={brandIcon} alt="" />
                <span>{t.monitorSimulation}</span>
              </div>

              <MonitorStage
                stage={displayStage}
                setup={setup}
                match={match}
                now={now}
                t={t}
                gameModeOptions={gameModeOptions}
                deuceOptions={deuceOptions}
                common={messages.common}
              />
            </div>
          </div>

          <aside className="match-demo__sidebar">
            {displayStage === "qr" ? (
              <div className="match-demo__sidebar-card">
                <div className="match-demo__panel-copy">
                  <span className="match-demo__eyebrow">{t.sponsorLeadEyebrow}</span>
                  <h2>{t.sponsorLeadTitle}</h2>
                  <p>{t.sponsorLeadDescription}</p>
                </div>

                <div className="match-demo__value-list">
                  <div>
                    <strong>{t.largeSponsorBlock}</strong>
                    <span>{t.largeSponsorBlockDescription}</span>
                  </div>
                  <div>
                    <strong>{t.qrToSetup}</strong>
                    <span>{t.qrToSetupDescription}</span>
                  </div>
                  <div>
                    <strong>{t.liveHandoff}</strong>
                    <span>{t.liveHandoffDescription}</span>
                  </div>
                </div>

                <button type="button" className="match-demo__button match-demo__button--primary" onClick={() => setStage("setup")}>
                  {t.simulateQrScan}
                </button>
              </div>
            ) : null}

            {displayStage === "setup" ? (
              <SetupPanel
                setup={setup}
                setSetup={setSetup}
                onStart={startLiveMatch}
                onBack={() => setStage("qr")}
                t={t}
                gameModeOptions={gameModeOptions}
                sideChangeOptions={sideChangeOptions}
                deuceOptions={deuceOptions}
              />
            ) : null}

            {displayStage === "live" ? (
              <div className="match-demo__sidebar-card">
                <div className="match-demo__panel-copy">
                  <span className="match-demo__eyebrow">{t.manualDockEyebrow}</span>
                  <h2>{t.manualDockTitle}</h2>
                  <p>{t.manualDockDescription}</p>
                </div>

                <div className="match-demo__controls">
                  <button
                    type="button"
                    className="match-demo__score-button match-demo__score-button--left"
                    onClick={() => setMatch((current) => applyPoint(current, 0, Date.now()))}
                  >
                    <span>{t.leftSidePoint}</span>
                    <strong>{displayPairing.left}</strong>
                  </button>

                  <button
                    type="button"
                    className="match-demo__score-button match-demo__score-button--right"
                    onClick={() => setMatch((current) => applyPoint(current, 1, Date.now()))}
                  >
                    <span>{t.rightSidePoint}</span>
                    <strong>{displayPairing.right}</strong>
                  </button>
                </div>

                <div className="match-demo__utility-grid">
                  <button type="button" className="match-demo__button match-demo__button--ghost" onClick={() => setMatch((current) => undoLastAction(current))}>
                    {t.undoLastEvent}
                  </button>
                  <button
                    type="button"
                    className="match-demo__button match-demo__button--ghost"
                    onClick={() => setMatch((current) => confirmSideChange(current, Date.now()))}
                    disabled={!match.sideChangePrompt}
                  >
                    {t.confirmSideChange}
                  </button>
                  <button type="button" className="match-demo__button match-demo__button--ghost" onClick={() => setStage("setup")}>
                    {t.backToSetup}
                  </button>
                  <button type="button" className="match-demo__button match-demo__button--primary" onClick={resetToQr}>
                    {t.resetToQr}
                  </button>
                </div>

                <div className="match-demo__live-meta">
                  <div>
                    <span>{t.serve}</span>
                    <strong>{getDisplayServeSide(match) === 0 ? displayPairing.left : displayPairing.right}</strong>
                  </div>
                  <div>
                    <span>{t.pointMode}</span>
                    <strong>{pointDisplay.superTiebreak ? t.superTiebreak : pointDisplay.tiebreak ? t.tiebreak : pointDisplay.starPoint ? t.starPoint : t.regularGame}</strong>
                  </div>
                  <div>
                    <span>{t.elapsed}</span>
                    <strong>{formatElapsed(now - match.startedAt)}</strong>
                  </div>
                  <div>
                    <span>{t.deuceModeLabel}</span>
                    <strong>{pointDisplay.superTiebreak ? t.superTiebreak : deuceOptions.find((option) => option.value === setup.deuceMode)?.label}</strong>
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
              <div className="match-demo__sidebar-card match-demo__sidebar-card--summary">
                <div className="match-demo__panel-copy">
                  <span className="match-demo__eyebrow">{t.summaryEyebrow}</span>
                  <h2>{t.summarySidebarTitle}</h2>
                  <p>{t.summarySidebarDescription}</p>
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
                          {entry.setsWon} {t.setsLabel} | {entry.gamesWon}-{entry.gamesLost} {t.gamesLabel}
                        </small>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="share-action-row share-action-row--stack">
                  <span>{t.summaryActions}</span>
                  <ShareIconButton mode="copy" label={copied ? messages.common.copied : messages.common.copyLink} active={copied} onClick={() => void handleShare("copy")} />
                  <ShareIconButton mode="whatsapp" label={messages.common.whatsapp} onClick={() => void handleShare("whatsapp")} />
                  <ShareIconButton mode="x" label={messages.common.x} onClick={() => void handleShare("x")} />
                </div>

                <div className="match-demo__actions">
                  <button type="button" className="match-demo__button match-demo__button--ghost" onClick={() => setStage("setup")}>
                    {t.editSetup}
                  </button>
                  <button type="button" className="match-demo__button match-demo__button--primary" onClick={resetToQr}>
                    {t.startAgain}
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




