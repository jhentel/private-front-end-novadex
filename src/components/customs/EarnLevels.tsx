"use client";

import { useState, Fragment } from "react";
import Image from "next/image";
import { EarnLevelCarousel } from "@/components/customs/EarnLevelCarousel";
import { EarnLevelProgress } from "@/components/customs/EarnLevelProgress";

export type Level = {
  tier: number;
  status: "complete" | "locked" | "ongoing";
  currentPts: number;
  targetPts: number;
  rewardMultiplier: number;
};

const levels: Level[] = [
  {
    tier: 1,
    status: "complete",
    currentPts: 10000,
    targetPts: 10000,
    rewardMultiplier: 0.5,
  },
  {
    tier: 2,
    status: "complete",
    currentPts: 12000,
    targetPts: 12000,
    rewardMultiplier: 0.6,
  },
  {
    tier: 3,
    status: "complete",
    currentPts: 15000,
    targetPts: 15000,
    rewardMultiplier: 0.7,
  },
  {
    tier: 4,
    status: "complete",
    currentPts: 18000,
    targetPts: 18000,
    rewardMultiplier: 0.8,
  },
  {
    tier: 5,
    status: "complete",
    currentPts: 22000,
    targetPts: 22000,
    rewardMultiplier: 0.9,
  },
  {
    tier: 6,
    status: "complete",
    currentPts: 26000,
    targetPts: 26000,
    rewardMultiplier: 1.0,
  },
  {
    tier: 7,
    status: "ongoing",
    currentPts: 15000,
    targetPts: 30000,
    rewardMultiplier: 1.1,
  },
  {
    tier: 8,
    status: "locked",
    currentPts: 0,
    targetPts: 35000,
    rewardMultiplier: 1.2,
  },
  {
    tier: 9,
    status: "locked",
    currentPts: 0,
    targetPts: 41000,
    rewardMultiplier: 1.3,
  },
  {
    tier: 10,
    status: "locked",
    currentPts: 0,
    targetPts: 48000,
    rewardMultiplier: 1.5,
  },
];

export function EarnLevels() {
  const [focusedLevel, setFocusedLevel] = useState(levels[6]);

  return (
    <Fragment>
      <EarnLevelCarousel
        levels={levels}
        focusedLevel={focusedLevel}
        onFocusLevelChange={setFocusedLevel}
      />

      <div>
        <div className="relative isolate flex h-[60px] w-full flex-col items-center justify-center gap-1 overflow-hidden">
          <Image
            src="/images/decorations/level-pointer-decoration.svg"
            alt="Level Pointer"
            width={84.5}
            height={60}
            quality={100}
          />
          <div className="absolute bottom-0 mt-2 h-px w-full bg-gradient-to-l from-[#DF74FF00] via-[#FFFFFF] to-[#DF74FF00] lg:w-[336px]" />
          <div
            className="absolute -bottom-[72px] h-[78px] w-[260px] animate-scale-bounce bg-[#E97DFF] blur-xl lg:w-[336px]"
            style={{ borderRadius: "100%" }}
          ></div>
        </div>

        <EarnLevelProgress level={focusedLevel} />
      </div>
    </Fragment>
  );
}
