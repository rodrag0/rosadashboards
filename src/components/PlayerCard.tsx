import type { CSSProperties } from "react";
import type { PlayerProfile } from "../data/demoMatch";
import { teamStyles } from "../data/demoMatch";

interface PlayerCardProps {
  player: PlayerProfile;
  active?: boolean;
  onSelect?: (playerId: string) => void;
}

export function PlayerCard({ player, active = false, onSelect }: PlayerCardProps) {
  const teamStyle = teamStyles[player.team];

  return (
    <article className={`surface panel player-card ${active ? "player-card-active" : ""}`}>
      <div className="player-topline">
        <span>{player.team === "rosa" ? "ROSA pair" : "Opposition pair"}</span>
        {player.mvp ? <strong>MVP</strong> : <strong>Impact {player.impact.toFixed(1)}</strong>}
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

        <div>
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
          <small>impact</small>
        </div>
      </div>

      <div className="player-metrics">
        <div>
          <strong>{player.winners}</strong>
          <span>Winners</span>
        </div>
        <div>
          <strong>{player.unforcedErrors}</strong>
          <span>UE</span>
        </div>
        <div>
          <strong>{player.forcedErrors}</strong>
          <span>FE</span>
        </div>
        <div>
          <strong>{player.clutch}</strong>
          <span>Clutch</span>
        </div>
      </div>

      <div className="player-bars">
        <div>
          <span>Smashes</span>
          <strong>
            {player.smashesWon}/{player.smashesTotal}
          </strong>
        </div>
        <div>
          <span>Net conversion</span>
          <strong>{player.netConversion}%</strong>
        </div>
        <div>
          <span>Pressure points</span>
          <strong>{player.pressurePointsWon}</strong>
        </div>
        <div>
          <span>Decision rating</span>
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
