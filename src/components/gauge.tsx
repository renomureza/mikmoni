import { useLingui } from "@lingui/react/macro";
import { useId, useMemo } from "react";

type GaugeStatus = "normal" | "warning" | "critical";

type CpuGaugeProps = {
  value: number;
  size?: number;
  label: string;
  thresholds?: { warning: number; critical: number };
  className?: string;
};

const STATUS_COLOR: Record<GaugeStatus, string> = {
  normal: "var(--color-green-500)",
  warning: "var(--color-yellow-500)",
  critical: "var(--color-red-500)",
};

const TRACK_COLOR = "var(--color-neutral-200)";
const NUM_TICKS = 40;
const START_ANGLE = 180;
const END_ANGLE = 0;

function getStatus(
  value: number,
  thresholds: { warning: number; critical: number },
): GaugeStatus {
  if (value >= thresholds.critical) return "critical";
  if (value >= thresholds.warning) return "warning";
  return "normal";
}

function buildTicks(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  value: number,
  activeColor: string,
) {
  const ticks: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
  }[] = [];

  for (let i = 0; i < NUM_TICKS; i++) {
    const t = i / (NUM_TICKS - 1);
    const angleDeg = START_ANGLE - (START_ANGLE - END_ANGLE) * t;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy - rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy - rOuter * Math.sin(angleRad);

    const isFilled = t <= value / 100;
    ticks.push({ x1, y1, x2, y2, color: isFilled ? activeColor : TRACK_COLOR });
  }

  return ticks;
}

export default function Gauge({
  value,
  size = 200,
  label,
  thresholds = { warning: 70, critical: 90 },
  className,
}: CpuGaugeProps) {
  const { t } = useLingui();

  const gradientId = useId();
  const clamped = Math.min(100, Math.max(0, value));
  const clamedRounded = Math.round(clamped);

  const status = useMemo(
    () => getStatus(clamped, thresholds),
    [clamped, thresholds],
  );
  const activeColor = STATUS_COLOR[status];

  const cx = 200;
  const cy = 200;
  const rInner = 140;
  const rOuter = 170;

  const ticks = useMemo(
    () => buildTicks(cx, cy, rInner, rOuter, clamped, activeColor),
    [clamped, activeColor],
  );

  const STATUS_LABEL = useMemo(() => {
    return {
      normal: t`Normal`,
      warning: t`Elevated`,
      critical: t`Critical`,
    } satisfies Record<GaugeStatus, string>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel = STATUS_LABEL[status];

  return (
    <div className={className}>
      <svg
        viewBox="0 0 400 250"
        width={size}
        height={size * 0.625}
        role="img"
        aria-label={t`${label}: ${clamedRounded} percent, status ${statusLabel}`}
      >
        <defs>
          <clipPath id={`${gradientId}-clip`}>
            <rect x="0" y="0" width="400" height="210" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${gradientId}-clip)`}>
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.color}
              strokeWidth={7}
              strokeLinecap="round"
              style={{ transition: "stroke 0.3s ease" }}
            />
          ))}
        </g>

        <text
          x="200"
          y="170"
          textAnchor="middle"
          fontSize="40"
          fontWeight={600}
          fill="var(--color-foreground)"
        >
          {clamedRounded}%
        </text>

        <text x="200" y="200" textAnchor="middle" fontSize="18">
          <tspan fill={activeColor} style={{ transition: "fill 0.3s ease" }}>
            ●{" "}
          </tspan>
          <tspan fill="var(--color-neutral-500)" fontWeight={500}>
            {label} · {STATUS_LABEL[status]}
          </tspan>
        </text>
      </svg>
    </div>
  );
}
