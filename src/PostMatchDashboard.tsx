import { useEffect, useRef, useState } from "react";
import { CourtHeatmap } from "./components/CourtHeatmap";
import { MomentumChart } from "./components/MomentumChart";
import { PlayerCard } from "./components/PlayerCard";
import { matchData, teamStyles } from "./data/demoMatch";
import type { HighlightClip, HighlightFilter, PlayerProfile } from "./data/demoMatch";

const teamComparisonRows = [
  { key: "pointsWon", label: "Points won" },
  { key: "winners", label: "Winners" },
  { key: "unforcedErrors", label: "Unforced errors" },
  { key: "breakPoints", label: "Break points" },
  { key: "netConversion", label: "Net conversion" },
  { key: "firstVolleyKill", label: "First-volley kill" },
  { key: "defensiveResets", label: "Defensive resets" },
] as const;

function getHeatmapForPlayer(player: PlayerProfile) {
  return matchData.heatmaps[player.id as keyof typeof matchData.heatmaps];
}

function formatFilterLabel(filter: HighlightFilter) {
  const item = matchData.filters.find((entry) => entry.id === filter);
  return item?.label ?? "All clips";
}

export default function PostMatchDashboard() {
  const [selectedFilter, setSelectedFilter] = useState<HighlightFilter>("all");
  const [selectedHighlightId, setSelectedHighlightId] = useState(matchData.highlights[0].id);
  const [selectedPlayerId, setSelectedPlayerId] = useState(matchData.players[0].id);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const filteredHighlights =
    selectedFilter === "all"
      ? matchData.highlights
      : matchData.highlights.filter((highlight) => highlight.filter === selectedFilter);

  const selectedHighlight =
    filteredHighlights.find((highlight) => highlight.id === selectedHighlightId) ?? filteredHighlights[0];
  const selectedPlayer =
    matchData.players.find((player) => player.id === selectedPlayerId) ?? matchData.players[0];

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
    if (!video || !videoDuration) {
      return;
    }

    video.currentTime = Math.max(0, Math.min(videoDuration - 0.25, videoDuration * highlight.cue));

    if (autoplay) {
      void video.play().catch(() => undefined);
    }
  }

  return (
    <main className="app-shell">
      <div className="page-aura page-aura-left" />
      <div className="page-aura page-aura-right" />

      <header className="topbar">
        <a className="brand-lockup" href="#overview">
          <img src="/assets/rosa-logo-dark.png" alt="ROSA" className="brand-wordmark" />
          <div>
            <span>Vision dashboard</span>
            <small>Pitch demo with simulated match data</small>
          </div>
        </a>

        <nav className="topnav">
          <a href="#replay">Replay</a>
          <a href="#highlights">Highlights</a>
          <a href="#statistics">Statistics</a>
          <a href="#heatmaps">Heatmaps</a>
        </nav>

        <div className="topbar-badges">
          <span className="pill subtle">Pilot-ready replay</span>
          <span className="pill accent">ROSA Vision</span>
          <a className="button secondary" href="/match-demo">
            Open live setup demo
          </a>
        </div>
      </header>

      <section className="hero section" id="overview">
        <div className="section-copy hero-copy">
          <span className="eyebrow">ROSA Vision post-match analysis</span>
          <h1>Replay, highlights, heatmaps, and match intelligence in one premium report.</h1>
          <p>{matchData.match.summary}</p>

          <div className="hero-actions">
            <a className="button primary" href="#replay">
              Watch replay
            </a>
            <a className="button secondary" href="#heatmaps">
              Open heatmaps
            </a>
            <a className="button secondary" href="/match-demo">
              Switch to live setup demo
            </a>
          </div>

          <div className="signal-row">
            <span>{matchData.match.reportReady}</span>
            <span>{matchData.match.taggedEvents} synced rally events</span>
            <span>{matchData.match.scoreSync} score sync confidence</span>
          </div>
        </div>

        <div className="hero-grid">
          <article className="surface panel replay-panel" id="replay">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Post-match video</span>
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

          <aside className="hero-side">
            <article className="surface panel score-panel">
              <div className="score-header">
                <div>
                  <span className="eyebrow">Match score</span>
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
                  <strong>{matchData.match.averageRally}</strong>
                  <span>Avg rally</span>
                </div>
                <div>
                  <strong>{matchData.match.longestRally}</strong>
                  <span>Longest point</span>
                </div>
                <div>
                  <strong>{matchData.match.autoSelectedClips}</strong>
                  <span>Auto-selected clips</span>
                </div>
              </div>
            </article>

            <article className="surface panel selected-panel">
              <div className="section-copy compact">
                <span className="eyebrow">Automatic highlight selection</span>
                <h3>{selectedHighlight.title}</h3>
                <p>{selectedHighlight.summary}</p>
              </div>

              <div className="selected-meta">
                <span>{selectedHighlight.setLabel}</span>
                <span>{selectedHighlight.score}</span>
                <span>{selectedHighlight.duration}</span>
              </div>

              <div className="selected-tags">
                <span className="pill subtle">{formatFilterLabel(selectedHighlight.filter)}</span>
                <span className="pill subtle">{selectedHighlight.shot}</span>
                <span className="pill subtle">{selectedHighlight.confidence}% confidence</span>
              </div>

              <button
                type="button"
                className="button primary button-block"
                onClick={() => jumpToHighlight(selectedHighlight, true)}
              >
                Play selected clip
              </button>
            </article>

            <article className="surface panel insight-panel">
              <span className="eyebrow">Match MVP</span>
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
                  <span>Impact</span>
                </div>
                <div>
                  <strong>{matchData.players[0].pressurePointsWon}</strong>
                  <span>Pressure points</span>
                </div>
                <div>
                  <strong>{matchData.players[0].smashesWon}/{matchData.players[0].smashesTotal}</strong>
                  <span>Smashes</span>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>

      <section className="section" id="highlights">
        <div className="section-copy section-heading">
          <span className="eyebrow">Replay navigation</span>
          <h2>Automatic highlight selection organized by shot and situation</h2>
          <p>
            Every clip stays linked to the full replay so a coach, tournament operator,
            or player can move from the full match into the most important moments
            without breaking context.
          </p>
        </div>

        <div className="collection-row">
          {matchData.filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`filter-chip ${selectedFilter === filter.id ? "filter-chip-active" : ""}`}
              onClick={() => {
                const nextHighlights =
                  filter.id === "all"
                    ? matchData.highlights
                    : matchData.highlights.filter((highlight) => highlight.filter === filter.id);

                setSelectedFilter(filter.id);
                setSelectedHighlightId(nextHighlights[0].id);
              }}
            >
              <span>{filter.label}</span>
              <strong>{filter.count}</strong>
            </button>
          ))}
        </div>

        <div className="highlights-grid">
          {filteredHighlights.map((highlight) => (
            <button
              key={highlight.id}
              type="button"
              className={`surface panel highlight-card ${selectedHighlight.id === highlight.id ? "highlight-card-active" : ""}`}
              onClick={() => jumpToHighlight(highlight, true)}
            >
              <div className="highlight-topline">
                <span className={`team-tag team-tag-${highlight.team}`}>{teamStyles[highlight.team].label}</span>
                <span>{highlight.timeLabel}</span>
              </div>
              <h3>{highlight.title}</h3>
              <p>{highlight.summary}</p>
              <div className="highlight-footer">
                <span>{highlight.score}</span>
                <span>{highlight.shot}</span>
                <span>{highlight.confidence}%</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section" id="statistics">
        <div className="section-copy section-heading">
          <span className="eyebrow">Shot count and match statistics</span>
          <h2>A Rosa Vision report can move from scoreboard context into player and shot-level detail.</h2>
          <p>
            The demo below is populated with fabricated but internally consistent padel data:
            winners, unforced errors, break-point pressure, shot taxonomy, and player impact.
          </p>
        </div>

        <div className="statistics-grid">
          <article className="surface panel comparison-panel">
            <div className="comparison-header">
              <div>
                <span className="eyebrow">Team comparison</span>
                <h3>Match control at pair level</h3>
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

          <MomentumChart points={matchData.momentum} />

          <article className="surface panel shot-panel">
            <div className="section-copy compact">
              <span className="eyebrow">Shot count</span>
              <h3>How each pair built pressure</h3>
              <p>Rosa won through a heavier volley and overhead profile, while the rivals leaned on lobs and longer defensive patterns.</p>
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
              active={selectedPlayer.id === player.id}
              onSelect={setSelectedPlayerId}
            />
          ))}
        </div>
      </section>

      <section className="section" id="heatmaps">
        <div className="section-copy section-heading">
          <span className="eyebrow">Heatmaps and player intelligence</span>
          <h2>Heatmaps are central to Rosa Vision, not an afterthought.</h2>
          <p>
            The selected player map highlights where that player spent most of the
            match. Two additional maps show where winners landed and where pressure
            forced errors or short resets.
          </p>
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
            eyebrow="Selected player map"
            title={`${selectedPlayer.shortName}'s court occupation`}
            description={selectedPlayer.keyLine}
            points={getHeatmapForPlayer(selectedPlayer)}
            accent={teamStyles[selectedPlayer.team].color}
          />
          <CourtHeatmap
            eyebrow="Winner landing zones"
            title="Where Rosa finished rallies"
            description="Most Rosa winners came from middle-lane compression and overhead finishes into the short corners."
            points={matchData.heatmaps.winnerZones}
            accent={teamStyles.rosa.color}
          />
          <CourtHeatmap
            eyebrow="Pressure errors"
            title="Where the rivals leaked short balls"
            description="The highest concentration sits around the right-half service line, where repeated resets opened the overhead lane."
            points={matchData.heatmaps.pressureMap}
            accent={teamStyles.rivals.color}
          />
        </div>
      </section>

      <footer className="footer surface">
        <div>
          <img src="/assets/rosa-icon-dark.svg" alt="" className="footer-icon" />
          <div>
            <strong>ROSA Vision dashboard demo</strong>
            <span>Structured to match the current ROSA site language while visualizing the future replay and analysis layer.</span>
          </div>
        </div>
        <div className="topbar-badges">
          <a className="button secondary" href="/match-demo">
            Switch to live setup demo
          </a>
          <a className="button secondary" href="#overview">
            Back to top
          </a>
        </div>
      </footer>
    </main>
  );
}
