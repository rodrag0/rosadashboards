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
  const court = {
    x: 10,
    y: 12,
    width: 80,
    height: 160,
  };

  const serviceOffset = (3 / 20) * court.height;
  const netY = court.y + court.height / 2;
  const upperServiceY = court.y + serviceOffset;
  const lowerServiceY = court.y + court.height - serviceOffset;

  return (
    <article className="surface panel heatmap-panel">
      <div className="section-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="court-shell">
        <svg viewBox="0 0 100 184" className="court-svg" role="img" aria-label={title}>
          <rect x={court.x} y={court.y} width={court.width} height={court.height} rx="8" className="court-outline" />
          <line x1={court.x} y1={netY} x2={court.x + court.width} y2={netY} className="court-line court-net" />
          <line
            x1={court.x}
            y1={upperServiceY}
            x2={court.x + court.width}
            y2={upperServiceY}
            className="court-line"
          />
          <line
            x1={court.x}
            y1={lowerServiceY}
            x2={court.x + court.width}
            y2={lowerServiceY}
            className="court-line"
          />
          <line
            x1={court.x + court.width / 2}
            y1={upperServiceY}
            x2={court.x + court.width / 2}
            y2={lowerServiceY}
            className="court-line"
          />

          {points.map((point, index) => (
            <g key={`${title}-${index}`}>
              <circle
                cx={court.x + point.x * (court.width / 100)}
                cy={court.y + point.y * (court.height / 100)}
                r={8 + point.intensity * 12}
                fill={accent}
                opacity={0.08 + point.intensity * 0.16}
              />
              <circle
                cx={court.x + point.x * (court.width / 100)}
                cy={court.y + point.y * (court.height / 100)}
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
