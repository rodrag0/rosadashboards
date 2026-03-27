interface MomentumPoint {
  point: number;
  rosa: number;
  rivals: number;
}

interface MomentumChartProps {
  points: MomentumPoint[];
}

function buildPath(values: number[], width: number, height: number) {
  const step = width / Math.max(values.length - 1, 1);
  return values
    .map((value, index) => {
      const x = step * index;
      const y = height - (value / 100) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function MomentumChart({ points }: MomentumChartProps) {
  const width = 100;
  const height = 48;
  const rosaPath = buildPath(
    points.map((point) => point.rosa),
    width,
    height,
  );
  const rivalPath = buildPath(
    points.map((point) => point.rivals),
    width,
    height,
  );

  return (
    <article className="surface panel chart-panel">
      <div className="section-copy">
        <span className="eyebrow">Match statistics</span>
        <h3>Momentum control through the three-set swing</h3>
        <p>
          Rosa lost control in the middle of set two, then rebuilt the rally profile
          with earlier net entries and deeper defensive lobs.
        </p>
      </div>

      <div className="chart-shell">
        <svg viewBox={`0 0 ${width} ${height}`} className="momentum-svg" role="img" aria-label="Momentum chart">
          <defs>
            <linearGradient id="rosa-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff0a8c" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ff0a8c" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[20, 40, 60, 80].map((value) => (
            <line
              key={value}
              x1="0"
              y1={height - (value / 100) * height}
              x2={width}
              y2={height - (value / 100) * height}
              className="chart-grid"
            />
          ))}

          {[33.3, 66.6].map((value) => (
            <line key={value} x1={value} y1="0" x2={value} y2={height} className="chart-break" />
          ))}

          <path
            d={`${rosaPath} L ${width} ${height} L 0 ${height} Z`}
            fill="url(#rosa-area)"
          />
          <path d={rosaPath} className="chart-line chart-line-rosa" />
          <path d={rivalPath} className="chart-line chart-line-rival" />
        </svg>

        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-swatch legend-swatch-rosa" />
            Rosa pressure index
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-swatch-rival" />
            Rival pressure index
          </span>
        </div>
      </div>
    </article>
  );
}
