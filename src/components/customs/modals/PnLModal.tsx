"use client";

import React from "react";
import PnLScreenshot from "@/components/customs/token/PnL/PnLScreenshot";
import { usePnLModalStore } from "@/stores/use-pnl-modal.store";

export default function PnLModal() {
  const {
    isOpen,
    traderData,
    tokenData,
    finalPrice,
    remainingSol,
    profitAndLoss,
    profitAndLossPercentage,
    invested,
    sold,
  } = usePnLModalStore();

  // Don't render anything if modal shouldn't be shown or data is missing
  if (
    !isOpen ||
    !traderData ||
    !tokenData ||
    finalPrice === null ||
    remainingSol === null
  ) {
    return null;
  }

  return (
    <div className="standalone-pnl-modal">
      <div style={{ display: isOpen ? "block" : "none" }}>
        <PnLScreenshot
          title={"$" + tokenData?.symbol}
          image={tokenData?.image}
          solPrice={finalPrice}
          invested={invested || 0}
          sold={sold || 0}
          profitAndLoss={profitAndLoss || 0}
          profitAndLossPercentage={profitAndLossPercentage || 0}
          remaining={remainingSol}
          isWithDialog={true}
          // Pass null for trigger since we're controlling visibility externally
          trigger={null}
        />
      </div>
    </div>
  );
}
