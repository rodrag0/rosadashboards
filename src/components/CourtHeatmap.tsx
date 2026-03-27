import type { HeatPoint } from "../data/demoMatch";

interface CourtHeatmapProps {
  title: string;
  eyebrow: string;
  description: string;
  points: HeatPoint[];
  accent: string;
}

export function CourtHeatmap({
  title,
  eyebrow,
  description,
  points,
  accent,
}: CourtHeatmapProps) {
  return (
    <article className="surface panel heatmap-panel">
      <div className="section-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="court-shell">
        <svg viewBox="0 0 100 140" className="court-svg" role="img" aria-label={title}>
          <rect x="2" y="2" width="96" height="136" rx="8" className="court-outline" />
          <line x1="50" y1="2" x2="50" y2="138" className="court-line" />
          <line x1="2" y1="70" x2="98" y2="70" className="court-line court-net" />
          <line x1="20" y1="35" x2="80" y2="35" className="court-line" />
          <line x1="20" y1="105" x2="80" y2="105" className="court-line" />
          <line x1="20" y1="35" x2="20" y2="105" className="court-line" />
          <line x1="80" y1="35" x2="80" y2="105" className="court-line" />

          {points.map((point, index) => (
            <g key={`${title}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y * 1.36}
                r={8 + point.intensity * 12}
                fill={accent}
                opacity={0.08 + point.intensity * 0.16}
              />
              <circle
                cx={point.x}
                cy={point.y * 1.36}
                r={2 + point.intensity * 6}
                fill={accent}
                opacity={0.18 + point.intensity * 0.45}
              />
            </g>
          ))}
        </svg>
      </div>
    </article>
  );
}
