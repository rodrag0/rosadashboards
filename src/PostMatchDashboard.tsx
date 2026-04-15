import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Language, Theme } from "./appTypes";
import { CourtHeatmap } from "./components/CourtHeatmap";
import { LanguageSelect } from "./components/LanguageSelect";
import { MomentumChart } from "./components/MomentumChart";
import { PlayerCard } from "./components/PlayerCard";
import { ShareIconButton } from "./components/ShareIconButton";
import { ThemeToggleButton } from "./components/ThemeToggleButton";
import { getMatchData, teamStyles } from "./data/demoMatch";
import type { HighlightClip, HighlightFilter, PlayerProfile } from "./data/demoMatch";
import { getTranslations } from "./i18n";

interface DashboardProps {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

const visionCoachDemoUrl = "https://rosavision.vercel.app/";

function buildClipUrl(highlight: HighlightClip) {
  const url = new URL(window.location.href);
  url.hash = `highlight-${highlight.id}`;
  return url.toString();
}

async function shareClip(highlight: HighlightClip, mode: "copy" | "whatsapp" | "x") {
  const url = buildClipUrl(highlight);
  const text = `${highlight.title} | ${highlight.score} | ${highlight.situation}`;

  if (mode === "copy") {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return;
  }

  const encoded = encodeURIComponent(`${text} ${url}`);
  const shareUrl =
    mode === "whatsapp"
      ? `https://wa.me/?text=${encoded}`
      : `https://x.com/intent/tweet?text=${encoded}`;

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

function getHeatmapForPlayer(matchData: ReturnType<typeof getMatchData>, player: PlayerProfile) {
  return matchData.heatmaps[player.id as keyof typeof matchData.heatmaps];
}

function parsePercent(value: string) {
  return Number(value.replace("%", ""));
}

function getFilterLabel(filter: HighlightFilter, language: Language) {
  const map = {
    en: {
      winner: "Finishing phase",
      transition: "Transition phase",
      defense: "Defensive phase",
      pressure: "Pressure phase",
      variation: "Pattern phase",
      all: "All phases",
    },
    es: {
      winner: "Fase de definición",
      transition: "Fase de transición",
      defense: "Fase defensiva",
      pressure: "Fase de presión",
      variation: "Fase de patrón",
      all: "Todas las fases",
    },
    de: {
      winner: "Abschlussphase",
      transition: "Übergangsphase",
      defense: "Defensivphase",
      pressure: "Druckphase",
      variation: "Musterphase",
      all: "Alle Phasen",
    },
  } as const;

  return map[language][filter];
}

function getShotFamilyLabel(shot: string, language: Language) {
  const normalized = shot.toLowerCase();
  const lookup =
    normalized.includes("smash") || normalized.includes("remate")
      ? "smash"
      : normalized.includes("vibora") || normalized.includes("víbora")
        ? "vibora"
        : normalized.includes("bandeja")
          ? "bandeja"
          : normalized.includes("lob") || normalized.includes("globo")
            ? "lob"
            : normalized.includes("volley") || normalized.includes("volea")
              ? "volley"
              : normalized.includes("return") || normalized.includes("devol")
                ? "return"
                : normalized.includes("pass")
                  ? "passing"
                  : "rally";

  const map = {
    en: {
      smash: "Smash family",
      vibora: "Vibora family",
      bandeja: "Bandeja family",
      lob: "Lob family",
      volley: "Volley family",
      return: "Return family",
      passing: "Passing family",
      rally: "Rally-control family",
    },
    es: {
      smash: "Familia de remate",
      vibora: "Familia de víbora",
      bandeja: "Familia de bandeja",
      lob: "Familia de globo",
      volley: "Familia de volea",
      return: "Familia de resto",
      passing: "Familia de passing",
      rally: "Familia de control",
    },
    de: {
      smash: "Smash-Familie",
      vibora: "Vibora-Familie",
      bandeja: "Bandeja-Familie",
      lob: "Lob-Familie",
      volley: "Volley-Familie",
      return: "Return-Familie",
      passing: "Passier-Familie",
      rally: "Kontroll-Familie",
    },
  } as const;

  return map[language][lookup];
}

function getSnippetClassifications(highlight: HighlightClip, language: Language) {
  return [
    getShotFamilyLabel(highlight.shot, language),
    getFilterLabel(highlight.filter, language),
    `${highlight.confidence}%`,
  ];
}

export default function PostMatchDashboard({ language, setLanguage, theme, setTheme }: DashboardProps) {
  const t = getTranslations(language);
  const matchData = useMemo(() => getMatchData(language), [language]);
  const brandWordmark = theme === "dark" ? "/assets/rosa-logo-dark.png" : "/assets/rosa-logo-light.png";
  const brandIcon = theme === "dark" ? "/assets/rosa-icon-dark.svg" : "/assets/rosa-icon-light.svg";
  const teamComparisonRows = useMemo(
    () => [
      { key: "pointsWon", label: t.postMatch.pointsWon },
      { key: "winners", label: t.postMatch.winners },
      { key: "unforcedErrors", label: t.postMatch.unforcedErrors },
      { key: "breakPoints", label: t.postMatch.breakPoints },
      { key: "netConversion", label: t.postMatch.netConversion },
      { key: "firstVolleyKill", label: t.postMatch.firstVolleyKill },
      { key: "defensiveResets", label: t.postMatch.defensiveResets },
    ] as const,
    [t],
  );

  const [selectedFilter, setSelectedFilter] = useState<HighlightFilter>("all");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<"all" | "rosa" | "rivals">("all");
  const [highlightSort, setHighlightSort] = useState<"priority" | "timeline">("priority");
  const [selectedShot, setSelectedShot] = useState<string>("all");
  const [selectedHighlightId, setSelectedHighlightId] = useState(matchData.highlights[0].id);
  const [selectedPlayerId, setSelectedPlayerId] = useState(matchData.players[0].id);
  const [videoDuration, setVideoDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const replayPanelRef = useRef<HTMLElement | null>(null);

  const shotOptions = useMemo(() => {
    return Array.from(new Set(matchData.highlights.map((highlight) => highlight.shot)));
  }, [matchData.highlights]);

  const resolvedSelectedShot = selectedShot === "all" || shotOptions.includes(selectedShot) ? selectedShot : "all";

  const filteredHighlights = useMemo(() => {
    const byType =
      selectedFilter === "all"
        ? matchData.highlights
        : matchData.highlights.filter((highlight) => highlight.filter === selectedFilter);

    const byTeam =
      selectedTeamFilter === "all"
        ? byType
        : byType.filter((highlight) => highlight.team === selectedTeamFilter);

    const byShot =
      resolvedSelectedShot === "all"
        ? byTeam
        : byTeam.filter((highlight) => highlight.shot === resolvedSelectedShot);

    const ordered = [...byShot];
    if (highlightSort === "priority") {
      ordered.sort((a, b) => b.confidence - a.confidence);
    } else {
      ordered.sort((a, b) => a.cue - b.cue);
    }

    return ordered;
  }, [highlightSort, matchData.highlights, resolvedSelectedShot, selectedFilter, selectedTeamFilter]);

  const selectedHighlight =
    filteredHighlights.find((highlight) => highlight.id === selectedHighlightId) ??
    filteredHighlights[0] ??
    matchData.highlights[0];
  const selectedPlayer =
    matchData.players.find((player) => player.id === selectedPlayerId) ?? matchData.players[0];
  const selectedHighlightIndex = Math.max(
    0,
    filteredHighlights.findIndex((highlight) => highlight.id === selectedHighlight?.id),
  );
  const selectedHighlightPosition = `${selectedHighlightIndex + 1}/${Math.max(filteredHighlights.length, 1)}`;
  const selectedClassifications = getSnippetClassifications(selectedHighlight, language);
  const leadingTeam = matchData.teamComparison[0];
  const trailingTeam = matchData.teamComparison[1];
  const winnersDelta = leadingTeam.winners - trailingTeam.winners;
  const ueDelta = trailingTeam.unforcedErrors - leadingTeam.unforcedErrors;
  const netDelta = parsePercent(leadingTeam.netConversion) - parsePercent(trailingTeam.netConversion);

  useEffect(() => {
    document.title = "ROSA Vision dashboard demo";
  }, []);

  useEffect(() => {
    if (!videoDuration || !selectedHighlight) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.currentTime = Math.max(0, Math.min(videoDuration - 0.25, videoDuration * selectedHighlight.cue));
  }, [selectedHighlight, videoDuration]);

  function jumpToHighlight(highlight: HighlightClip, autoplay: boolean) {
    setSelectedHighlightId(highlight.id);

    const video = videoRef.current;
    if (video && videoDuration) {
      video.currentTime = Math.max(0, Math.min(videoDuration - 0.25, videoDuration * highlight.cue));
      if (autoplay) {
        void video.play().catch(() => undefined);
      }
    }

    replayPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function stepHighlight(direction: "prev" | "next") {
    if (!filteredHighlights.length || !selectedHighlight) {
      return;
    }

    const currentIndex = filteredHighlights.findIndex((highlight) => highlight.id === selectedHighlight.id);
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= filteredHighlights.length) {
      return;
    }

    jumpToHighlight(filteredHighlights[nextIndex], true);
  }

  async function handleShare(highlight: HighlightClip, mode: "copy" | "whatsapp" | "x") {
    await shareClip(highlight, mode);
    if (mode === "copy") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  }

  return (
    <main className="app-shell dashboard-shell">
      <div className="page-aura page-aura-left" />
      <div className="page-aura page-aura-right" />

      <header className="topbar">
        <a className="brand-lockup" href="#overview">
          <img src={brandWordmark} alt="ROSA" className="brand-wordmark" />
          <div>
            <span>{t.postMatch.brandTitle}</span>
            <small>{t.postMatch.brandSubtitle}</small>
          </div>
        </a>

        <nav className="topnav">
          <a href="#replay">{t.postMatch.navReplay}</a>
          <a href="#highlights">{t.postMatch.navHighlights}</a>
          <a href="#statistics">{t.postMatch.navStatistics}</a>
          <a href="#heatmaps">{t.postMatch.navHeatmaps}</a>
        </nav>

        <div className="topbar-controls">
          <LanguageSelect label={t.common.language} value={language} onChange={setLanguage} />
          <ThemeToggleButton
            theme={theme}
            label={t.common.theme}
            nextThemeLabel={theme === "dark" ? t.common.light : t.common.dark}
            onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
          <a className="button secondary topbar-route-link" href="/match-demo">
            {t.common.openLiveDemo}
          </a>
        </div>
      </header>

      <section className="hero section dashboard-hero" id="overview">
        <div className="dashboard-heading">
          <div className="section-copy compact hero-copy">
            <span className="eyebrow">{t.postMatch.headerEyebrow}</span>
            <h1>{t.postMatch.headerTitle}</h1>
            <p>{t.postMatch.headerDescription}</p>
          </div>

          <div className="dashboard-summary-strip surface panel">
            <div>
              <span>{t.postMatch.compactSummaryEyebrow}</span>
              <strong>{matchData.match.reportReady}</strong>
            </div>
            <div>
              <span>{t.postMatch.avgRally}</span>
              <strong>{matchData.match.averageRally}</strong>
            </div>
            <div>
              <span>{t.postMatch.longestPoint}</span>
              <strong>{matchData.match.longestRally}</strong>
            </div>
            <div>
              <span>{t.postMatch.autoClips}</span>
              <strong>{matchData.match.autoSelectedClips}</strong>
            </div>
          </div>
        </div>

        <div className="hero-grid dashboard-grid">
          <article ref={replayPanelRef} className="surface panel replay-panel" id="replay">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">{t.postMatch.videoEyebrow}</span>
                <h2>{matchData.match.finalHeadline}</h2>
              </div>

              <div className="match-meta">
                <span>{matchData.match.competition}</span>
                <span>{matchData.match.venue}</span>
                <span>{matchData.match.duration}</span>
              </div>
            </div>

            <div className="video-frame">
              <video
                ref={videoRef}
                className="replay-video"
                controls
                playsInline
                preload="metadata"
                onLoadedMetadata={() => setVideoDuration(videoRef.current?.duration ?? 0)}
              >
                <source src="/media/rosa-vision-demo.mp4" type="video/mp4" />
              </video>

              <div className="video-overlay">
                <span className="overlay-chip">{selectedHighlight.timeLabel}</span>
                <span className="overlay-chip">{selectedHighlight.shot}</span>
                <span className="overlay-chip">{selectedHighlight.situation}</span>
              </div>
            </div>
          </article>

          <aside className="hero-side dashboard-side">
            <article className="surface panel score-panel">
              <div className="score-header">
                <div>
                  <span className="eyebrow">{t.postMatch.matchScore}</span>
                  <h2>Rodrigo / Omar vs Saul / Memo</h2>
                </div>
                <strong className="result-badge">2-1</strong>
              </div>

              <div className="score-grid">
                <div className="score-team">
                  <span>{teamStyles.rosa.label}</span>
                  {matchData.match.sets.map((set, index) => (
                    <strong key={`rosa-set-${index}`}>{set.rosa}</strong>
                  ))}
                </div>
                <div className="score-team muted">
                  <span>{teamStyles.rivals.label}</span>
                  {matchData.match.sets.map((set, index) => (
                    <strong key={`rival-set-${index}`}>{set.rivals}</strong>
                  ))}
                </div>
              </div>

              <div className="score-kpis">
                <div>
                  <strong>{matchData.match.taggedEvents}</strong>
                  <span>{t.postMatch.syncedEvents}</span>
                </div>
                <div>
                  <strong>{matchData.match.scoreSync}</strong>
                  <span>{t.postMatch.scoreSync}</span>
                </div>
                <div>
                  <strong>{matchData.match.reportReady}</strong>
                  <span>{t.postMatch.pilotReady}</span>
                </div>
              </div>
            </article>

            <article className="surface panel selected-panel">
              <div className="section-copy compact">
                <span className="eyebrow">{t.postMatch.autoSelectEyebrow}</span>
                <h3>{selectedHighlight.title}</h3>
                <p>{selectedHighlight.summary}</p>
              </div>

              <div className="selected-meta">
                <span>{selectedHighlight.setLabel}</span>
                <span>{selectedHighlight.score}</span>
                <span>{selectedHighlight.duration}</span>
              </div>

              <div className="snippet-classification-row">
                {selectedClassifications.map((item) => (
                  <span key={`selected-classification-${item}`} className="snippet-classification-chip">
                    {item}
                  </span>
                ))}
              </div>

              <div className="selected-navigation">
                <button
                  type="button"
                  className="button secondary selected-navigation-button"
                  onClick={() => stepHighlight("prev")}
                  disabled={selectedHighlightIndex <= 0}
                >
                  {t.postMatch.previousClip}
                </button>
                <span>{t.postMatch.clipPosition(selectedHighlightPosition)}</span>
                <button
                  type="button"
                  className="button secondary selected-navigation-button"
                  onClick={() => stepHighlight("next")}
                  disabled={selectedHighlightIndex >= filteredHighlights.length - 1}
                >
                  {t.postMatch.nextClip}
                </button>
              </div>

              <div className="selected-tags">
                <span className="pill subtle">{matchData.filters.find((entry) => entry.id === selectedHighlight.filter)?.label}</span>
                <span className="pill subtle">{selectedHighlight.shot}</span>
                <span className="pill subtle">{selectedHighlight.confidence}%</span>
              </div>

              <div className="selected-actions">
                <button type="button" className="button primary button-block" onClick={() => jumpToHighlight(selectedHighlight, true)}>
                  {t.postMatch.playSelectedClip}
                </button>
                <div className="share-action-row">
                  <span>{t.postMatch.shareClipTitle}</span>
                  <ShareIconButton mode="copy" label={copied ? t.common.copied : t.common.copyLink} active={copied} onClick={() => void handleShare(selectedHighlight, "copy")} />
                  <ShareIconButton mode="whatsapp" label={t.common.whatsapp} onClick={() => void handleShare(selectedHighlight, "whatsapp")} />
                  <ShareIconButton mode="x" label={t.common.x} onClick={() => void handleShare(selectedHighlight, "x")} />
                </div>
              </div>
            </article>

            <article className="surface panel insight-panel">
              <span className="eyebrow">{t.postMatch.mvpEyebrow}</span>
              <div className="mvp-lockup">
                <div className="mvp-avatar" style={{ backgroundImage: matchData.players[0].avatarGradient }}>
                  RO
                </div>
                <div>
                  <h3>{matchData.players[0].fullName}</h3>
                  <p>{matchData.players[0].keyLine}</p>
                </div>
              </div>
              <div className="mvp-grid">
                <div>
                  <strong>{matchData.players[0].impact.toFixed(1)}</strong>
                  <span>{t.postMatch.impact}</span>
                </div>
                <div>
                  <strong>{matchData.players[0].pressurePointsWon}</strong>
                  <span>{t.postMatch.pressurePoints}</span>
                </div>
                <div>
                  <strong>{matchData.players[0].smashesWon}/{matchData.players[0].smashesTotal}</strong>
                  <span>{t.postMatch.smashes}</span>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>

      <section className="section dashboard-section" id="highlights">
        <div className="section-copy section-heading compact">
          <span className="eyebrow">{t.postMatch.replayNavEyebrow}</span>
          <h2>{t.postMatch.replayNavTitle}</h2>
          <p>{t.postMatch.replayNavDescription}</p>
          <div className="context-demo-link">
            <a className="pill subtle" href={visionCoachDemoUrl} target="_blank" rel="noopener noreferrer">
              {t.common.openVisionCoachDemo}
            </a>
            <span>{t.postMatch.visionCoachHint}</span>
          </div>
        </div>

        <div className="highlights-toolbar">
          <div className="collection-row team-filter-row">
            <button
              type="button"
              className={`team-filter-chip ${selectedTeamFilter === "all" ? "team-filter-chip-active" : ""}`}
              onClick={() => setSelectedTeamFilter("all")}
            >
              {t.postMatch.allTeams}
            </button>
            <button
              type="button"
              className={`team-filter-chip ${selectedTeamFilter === "rosa" ? "team-filter-chip-active" : ""}`}
              onClick={() => setSelectedTeamFilter("rosa")}
            >
              {t.postMatch.winningPairOnly}
            </button>
            <button
              type="button"
              className={`team-filter-chip ${selectedTeamFilter === "rivals" ? "team-filter-chip-active" : ""}`}
              onClick={() => setSelectedTeamFilter("rivals")}
            >
              {t.postMatch.oppositionOnly}
            </button>
          </div>

          <div className="highlights-toolbar-controls">
            <label className="sort-select-wrap">
              <span>{t.postMatch.sortBy}</span>
              <select
                className="sort-select"
                value={highlightSort}
                onChange={(event) => setHighlightSort(event.target.value as "priority" | "timeline")}
              >
                <option value="priority">{t.postMatch.sortPriority}</option>
                <option value="timeline">{t.postMatch.sortTimeline}</option>
              </select>
            </label>

            <label className="sort-select-wrap">
              <span>{t.postMatch.shotSelectLabel}</span>
              <select className="sort-select" value={resolvedSelectedShot} onChange={(event) => setSelectedShot(event.target.value)}>
                <option value="all">{t.postMatch.allShots}</option>
                {shotOptions.map((shot) => (
                  <option key={shot} value={shot}>
                    {shot}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="collection-row">
          {matchData.filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`filter-chip ${selectedFilter === filter.id ? "filter-chip-active" : ""}`}
              onClick={() => setSelectedFilter(filter.id)}
            >
              <span>{filter.label}</span>
              <strong>{filter.count}</strong>
            </button>
          ))}
        </div>

        {filteredHighlights.length ? (
          <div className="highlights-grid">
            {filteredHighlights.map((highlight) => {
              const snippetClassifications = getSnippetClassifications(highlight, language);

              return (
                <article
                  key={highlight.id}
                  id={`highlight-${highlight.id}`}
                  className={`surface panel highlight-card ${selectedHighlight.id === highlight.id ? "highlight-card-active" : ""}`}
                >
                  <button type="button" className="highlight-card-main" onClick={() => jumpToHighlight(highlight, true)}>
                    <div className={`highlight-preview highlight-preview-${highlight.team}`}>
                      <div className="highlight-preview-topline">
                        <span>{highlight.setLabel}</span>
                        <span>{highlight.duration}</span>
                      </div>
                      <span className="highlight-preview-play" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M9 7.5 17 12l-8 4.5V7.5Z" fill="currentColor" />
                        </svg>
                      </span>
                      <div className="highlight-preview-body">
                        <div className="highlight-preview-copy">
                          <strong>{highlight.shot}</strong>
                          <small>{t.postMatch.clipPreviewPlaceholder}</small>
                        </div>
                      </div>
                      <div className="snippet-classification-row snippet-classification-row--preview">
                        {snippetClassifications.map((item) => (
                          <span key={`${highlight.id}-${item}`} className="snippet-classification-chip">
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="highlight-preview-track">
                        <span className="highlight-preview-progress" style={{ width: `${Math.max(18, highlight.cue * 100)}%` }} />
                      </div>
                    </div>

                    <div className="highlight-topline">
                      <span className={`team-tag team-tag-${highlight.team}`}>{teamStyles[highlight.team].label}</span>
                      <span>{highlight.timeLabel}</span>
                    </div>
                    <h3>{highlight.title}</h3>
                    <p>{highlight.summary}</p>
                    <div className="highlight-footer">
                      <span>{highlight.score}</span>
                      <span>{highlight.situation}</span>
                      <span>{highlight.confidence}%</span>
                    </div>
                  </button>

                  <div className="share-action-row share-action-row--card">
                    <span>{t.postMatch.shareSelectedClip}</span>
                    <ShareIconButton mode="copy" label={copied ? t.common.copied : t.common.copyLink} active={copied} onClick={() => void handleShare(highlight, "copy")} />
                    <ShareIconButton mode="whatsapp" label={t.common.whatsapp} onClick={() => void handleShare(highlight, "whatsapp")} />
                    <ShareIconButton mode="x" label={t.common.x} onClick={() => void handleShare(highlight, "x")} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <article className="surface panel empty-state">
            <h3>{t.postMatch.noClipsForFilterTitle}</h3>
            <p>{t.postMatch.noClipsForFilterDescription}</p>
          </article>
        )}
      </section>

      <section className="section dashboard-section" id="statistics">
        <div className="section-copy section-heading compact">
          <span className="eyebrow">{t.postMatch.statsEyebrow}</span>
          <h2>{t.postMatch.statsTitle}</h2>
          <p>{t.postMatch.statsDescription}</p>
        </div>

        <div className="at-a-glance-grid">
          <article className="surface panel at-a-glance-card">
            <span>{t.postMatch.winners}</span>
            <strong>{winnersDelta > 0 ? `+${winnersDelta}` : winnersDelta}</strong>
            <small>{teamStyles.rosa.label}</small>
          </article>
          <article className="surface panel at-a-glance-card">
            <span>{t.postMatch.unforcedErrors}</span>
            <strong>{ueDelta > 0 ? `+${ueDelta}` : ueDelta}</strong>
            <small>{teamStyles.rosa.label}</small>
          </article>
          <article className="surface panel at-a-glance-card">
            <span>{t.postMatch.netConversion}</span>
            <strong>{netDelta > 0 ? `+${netDelta}%` : `${netDelta}%`}</strong>
            <small>{teamStyles.rosa.label}</small>
          </article>
        </div>

        <div className="statistics-grid dashboard-stats-grid">
          <article className="surface panel comparison-panel">
            <div className="comparison-header">
              <div>
                <span className="eyebrow">{t.postMatch.comparisonEyebrow}</span>
                <h3>{t.postMatch.comparisonTitle}</h3>
              </div>
              <span className="pill subtle">{matchData.match.date}</span>
            </div>

            <div className="comparison-teams">
              <div>
                <strong>{teamStyles.rosa.label}</strong>
                <span>{teamStyles.rosa.names}</span>
              </div>
              <div>
                <strong>{teamStyles.rivals.label}</strong>
                <span>{teamStyles.rivals.names}</span>
              </div>
            </div>

            <div className="comparison-rows">
              {teamComparisonRows.map((row) => (
                <div className="comparison-row" key={row.key}>
                  <strong>{String(matchData.teamComparison[0][row.key])}</strong>
                  <span>{row.label}</span>
                  <strong>{String(matchData.teamComparison[1][row.key])}</strong>
                </div>
              ))}
            </div>
          </article>

          <MomentumChart
            points={matchData.momentum}
            eyebrow={t.postMatch.momentumEyebrow}
            title={t.postMatch.momentumTitle}
            description={t.postMatch.momentumDescription}
            winningLegend={t.postMatch.winningPressureIndex}
            oppositionLegend={t.postMatch.oppositionPressureIndex}
          />

          <article className="surface panel shot-panel">
            <div className="section-copy compact">
              <span className="eyebrow">{t.postMatch.shotCountEyebrow}</span>
              <h3>{t.postMatch.shotCountTitle}</h3>
              <p>{t.postMatch.shotCountDescription}</p>
            </div>

            <div className="shot-list">
              {matchData.shotBreakdown.map((entry) => {
                const total = entry.rosa + entry.rivals;
                const rosaWidth = (entry.rosa / total) * 100;
                const rivalWidth = (entry.rivals / total) * 100;
                return (
                  <div className="shot-row" key={entry.label}>
                    <div className="shot-values">
                      <strong>{entry.rosa}</strong>
                      <span>{entry.label}</span>
                      <strong>{entry.rivals}</strong>
                    </div>
                    <div className="shot-track">
                      <span className="shot-segment shot-segment-rosa" style={{ width: `${rosaWidth}%` }} />
                      <span className="shot-segment shot-segment-rival" style={{ width: `${rivalWidth}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="surface panel insight-stack">
            {matchData.insights.map((insight) => (
              <div className="insight-item" key={insight.title}>
                <span className="eyebrow">{insight.title}</span>
                <p>{insight.body}</p>
              </div>
            ))}
          </article>
        </div>

        <div className="players-grid">
          {matchData.players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              labels={{
                winningPair: t.postMatch.winningPair,
                oppositionPair: t.postMatch.oppositionPair,
                impact: t.postMatch.impact,
                winners: t.postMatch.winners,
                ue: t.postMatch.ue,
                fe: t.postMatch.fe,
                clutch: t.postMatch.clutch,
                smashes: t.postMatch.smashes,
                netConversion: t.postMatch.netConversion,
                pressurePoints: t.postMatch.pressurePoints,
                decisionRating: t.postMatch.decisionRating,
                mvp: t.postMatch.mvpEyebrow,
              }}
              active={selectedPlayer.id === player.id}
              onSelect={setSelectedPlayerId}
            />
          ))}
        </div>
      </section>

      <section className="section dashboard-section" id="heatmaps">
        <div className="section-copy section-heading compact">
          <span className="eyebrow">{t.postMatch.heatmapsEyebrow}</span>
          <h2>{t.postMatch.heatmapsTitle}</h2>
          <p>{t.postMatch.heatmapsDescription}</p>
        </div>

        <div className="player-switcher">
          {matchData.players.map((player) => (
            <button
              key={player.id}
              type="button"
              className={`player-switch ${selectedPlayer.id === player.id ? "player-switch-active" : ""}`}
              onClick={() => setSelectedPlayerId(player.id)}
            >
              <span className="switch-dot" style={{ backgroundImage: player.avatarGradient }} />
              {player.shortName}
            </button>
          ))}
        </div>

        <div className="heatmap-grid">
          <CourtHeatmap
            eyebrow={t.postMatch.selectedPlayerMapEyebrow}
            title={t.postMatch.selectedPlayerMapTitle(selectedPlayer.shortName)}
            description={selectedPlayer.keyLine}
            points={getHeatmapForPlayer(matchData, selectedPlayer)}
            accent={teamStyles[selectedPlayer.team].color}
          />
          <CourtHeatmap
            eyebrow={t.postMatch.winnerMapEyebrow}
            title={t.postMatch.winnerMapTitle}
            description={t.postMatch.winnerMapDescription}
            points={matchData.heatmaps.winnerZones}
            accent={teamStyles.rosa.color}
          />
          <CourtHeatmap
            eyebrow={t.postMatch.pressureMapEyebrow}
            title={t.postMatch.pressureMapTitle}
            description={t.postMatch.pressureMapDescription}
            points={matchData.heatmaps.pressureMap}
            accent={teamStyles.rivals.color}
          />
        </div>
      </section>

      <footer className="footer surface">
        <div>
          <img src={brandIcon} alt="" className="footer-icon" />
          <div>
            <strong>{t.postMatch.footerTitle}</strong>
            <span>{t.postMatch.footerDescription}</span>
          </div>
        </div>
        <div className="topbar-badges">
          <a className="button secondary" href="/match-demo">
            {t.common.openLiveDemo}
          </a>
          <a className="button secondary" href="#overview">
            {t.postMatch.backToTop}
          </a>
        </div>
      </footer>
    </main>
  );
}

