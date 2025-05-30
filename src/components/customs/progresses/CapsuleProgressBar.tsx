"use client";

type CapsuleProgressBarProps = {
  percentage: number;
  width: number;
  height: number;
  strokeWidth?: number;
  fontSize?: number;
  text: string;
};

export default function CapsuleProgressBar({
  percentage,
  width,
  height,
  strokeWidth = 1,
  fontSize = 10,
  text,
}: CapsuleProgressBarProps) {
  const innerRadius = height / 2;
  const progressLength = (percentage / 100) * (width + Math.PI * height);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width + strokeWidth} ${height + strokeWidth}`}
    >
      {/* Background Capsule */}
      <path
        d={`
          M ${width / 2},${strokeWidth / 2}
          l ${(width - height) / 2},0
          a ${innerRadius},${innerRadius} 0 1,1 0,${height}
          l ${-(width - height)},0
          a ${innerRadius},${innerRadius} 0 1,1 0,${-height}
          Z
        `}
        fill="none"
        stroke="#202037"
        strokeWidth={strokeWidth}
      />

      {/* Progress Capsule */}
      <path
        d={`
          M ${width / 2},${strokeWidth / 2}
          l ${(width - height) / 2 + 1},0
          a ${innerRadius},${innerRadius} 0 1,1 0,${height}
          l ${-(width - height)},0
          a ${innerRadius + 1},${innerRadius} 0 1,1 0,${-height}
          Z
        `}
        fill="none"
        stroke="url(#circleGradientFixed)"
        strokeWidth={strokeWidth}
        strokeDasharray={width + Math.PI * height - 1}
        strokeDashoffset={(1 - percentage / 100) * (width + Math.PI * height)}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.35s ease",
        }}
      />

      {/* Text in Center */}
      <text
        x="48%"
        y="55%"
        textAnchor="middle"
        fill="white"
        fontSize={fontSize}
        fontWeight="medium"
        dominantBaseline="middle"
      >
        {text}
      </text>
    </svg>
  );
}
