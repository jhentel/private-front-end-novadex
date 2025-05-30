"use client";

type CircularProgressBarProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
};

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
  size = 100,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="circular-progress"
    >
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#202037"
        strokeWidth={strokeWidth}
      />

      {/* Progress Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#circleGradientFixed)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(270 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.35s ease" }}
      />
    </svg>
  );
};

export default CircularProgressBar;
