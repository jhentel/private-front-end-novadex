import React from "react";

type Segment = {
  value: number; // in percentage
  color: string;
};

type Props = {
  size?: number;
  strokeWidth?: number;
  gapDegree?: number; // gap in degrees
  segments: Segment[];
};

const CircularSegmentedRing: React.FC<Props> = ({
  size = 120,
  strokeWidth = 10,
  gapDegree = 4,
  segments,
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const totalValue = segments.reduce((acc, s) => acc + s.value, 0);
  const totalGapDegrees = gapDegree * segments.length;
  const effectiveCircleDegrees = 360 - totalGapDegrees;
  const degreePerUnit = effectiveCircleDegrees / totalValue;

  let currentAngle = 0;

  return (
    <svg width={size} height={size}>
      <g transform={`rotate(-90 ${center} ${center})`}>
        {segments.map((seg, i) => {
          const startAngle = currentAngle;
          const sweepAngle = seg.value * degreePerUnit;
          const endAngle = startAngle + sweepAngle;

          const arcLength = (sweepAngle / 360) * circumference;
          const dasharray = `${arcLength} ${circumference}`;
          const dashoffset = (currentAngle / 360) * circumference;

          currentAngle += sweepAngle + gapDegree;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dasharray}
              strokeDashoffset={-dashoffset}
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );
};

export default CircularSegmentedRing;
