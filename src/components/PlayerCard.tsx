import type { CSSProperties } from "react";
import type { PlayerProfile } from "../data/demoMatch";
import { teamStyles } from "../data/demoMatch";

interface PlayerCardLabels {
  winningPair: string;
  oppositionPair: string;
  impact: string;
  winners: string;
  ue: string;
  fe: string;
  clutch: string;
  smashes: string;
  netConversion: string;
  pressurePoints: string;
  decisionRating: string;
  mvp: string;
}

interface PlayerCardProps {
  player: PlayerProfile;
  labels: PlayerCardLabels;
  active?: boolean;
  onSelect?: (playerId: string) => void;
}

export function PlayerCard({ player, labels, active = false, onSelect }: PlayerCardProps) {
  const teamStyle = teamStyles[player.team];

  return (
    <article className={`surface panel player-card ${active ? "player-card-active" : ""}`}>
      <div className="player-topline">
        <span>{player.team === "rosa" ? labels.winningPair : labels.oppositionPair}</span>
        {player.mvp ? <strong>{labels.mvp}</strong> : <strong>{labels.impact} {player.impact.toFixed(1)}</strong>}
      </div>

      <div className="player-overview">
        <button
          type="button"
          className="avatar-button"
          onClick={() => onSelect?.(player.id)}
          aria-label={`Show ${player.shortName} heatmap`}
        >
          <span className="avatar-shell" style={{ backgroundImage: player.avatarGradient }}>
            {player.shortName.slice(0, 2).toUpperCase()}
          </span>
        </button>

        <div className="player-heading">
          <h3>{player.shortName}</h3>
          <p>{player.role}</p>
        </div>

        <div
          className="impact-ring"
          style={
            {
              "--ring-value": `${player.impactShare}%`,
              "--ring-color": teamStyle.color,
            } as CSSProperties
          }
        >
          <span>{player.impact.toFixed(1)}</span>
          <small>{labels.impact}</small>
        </div>
      </div>

      <div className="player-metrics player-metrics--compact">
        <div>
          <strong>{player.winners}</strong>
          <span>{labels.winners}</span>
        </div>
        <div>
          <strong>{player.unforcedErrors}</strong>
          <span>{labels.ue}</span>
        </div>
        <div>
          <strong>{player.forcedErrors}</strong>
          <span>{labels.fe}</span>
        </div>
        <div>
          <strong>{player.clutch}</strong>
          <span>{labels.clutch}</span>
        </div>
      </div>

      <div className="player-bars player-bars--compact">
        <div>
          <span>{labels.smashes}</span>
          <strong>
            {player.smashesWon}/{player.smashesTotal}
          </strong>
        </div>
        <div>
          <span>{labels.netConversion}</span>
          <strong>{player.netConversion}%</strong>
        </div>
        <div>
          <span>{labels.pressurePoints}</span>
          <strong>{player.pressurePointsWon}</strong>
        </div>
        <div>
          <span>{labels.decisionRating}</span>
          <strong>
            {player.decisionRating > 0 ? "+" : ""}
            {player.decisionRating.toFixed(2)}
          </strong>
        </div>
      </div>

      <p className="player-keyline">{player.keyLine}</p>

      <div className="player-mix">
        {player.shotMix.map((item) => (
          <span key={`${player.id}-${item.label}`}>
            {item.label} <strong>{item.value}</strong>
          </span>
        ))}
      </div>
    </article>
  );
}
