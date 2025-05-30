"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { Suspense, lazy } from "react";
// ######## Components 🧩 ########
const LeftTokenSection = lazy(
  () => import("@/components/customs/sections/LeftTokenSection"),
);
const RightTokenSection = lazy(
  () => import("@/components/customs/sections/RightTokenSection"),
);
// ######## Types 🗨️ ########
import { TokenDataMessageType } from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import TokenWSAndFetch from "./TokenWSAndFetch";
import { useIsClient } from "@/hooks/use-is-client";
import TokenWrapperSnap from "./TokenWrapperSnap";

const TokenClient = ({
  mint,
  initChartData,
}: {
  mint: string;
  initChartData: TokenDataMessageType | null;
}) => {
  const isClient = useIsClient();

  return (
    <>
      <TokenWrapperSnap>
        {isClient && (
          <TokenWSAndFetch initChartData={initChartData} mint={mint} />
        )}
        <LeftTokenSection initChartData={initChartData} />
        <RightTokenSection initChartData={initChartData} />
        {/* <TokenInteractiveTutorials /> */}
      </TokenWrapperSnap>
    </>
  );
};

export default TokenClient;
