import { formatScientific } from "@/utils/formatAmount";
import React from "react";

interface ScientificNumberProps {
  value: number | string;
  className?: string;
}

const ScientificNumber: React.FC<ScientificNumberProps> = ({
  value,
  className,
}) => {
  const formatted = formatScientific(value);

  if (!formatted) {
    const num = Number(value);
    const units = [
      { threshold: 1_000_000_000_000, suffix: "T" },
      { threshold: 1_000_000_000, suffix: "B" },
      { threshold: 1_000_000, suffix: "M" },
      { threshold: 1_000, suffix: "K" },
    ];

    for (const unit of units) {
      if (num >= unit.threshold) {
        return (
          <span className={className}>
            {(num / unit.threshold).toFixed(1)}
            {unit.suffix}
          </span>
        );
      }
    }

    return <span className={className}>{num.toFixed(4)}</span>;
  }

  return (
    <span
      className={`flex w-fit items-baseline justify-center leading-4 ${className}`}
    >
      0.0
      <span className="relative -bottom-[1.5px] align-super text-[0.5em]">
        {formatted.leadingZeros}
      </span>
      {formatted.significantDigits}
    </span>
  );
};

export default ScientificNumber;
