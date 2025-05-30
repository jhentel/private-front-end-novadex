"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { lazy, useEffect, use } from "react";
import { useCharts } from "@/hooks/use-charts";
// ######## Components 🧩 ########
// import TokenClient from "@/components/customs/token/TokenClient";
const TokenClient = lazy(
  () => import("@/components/customs/token/TokenClient"),
);
import ScrollLayout from "@/components/layouts/ScrollLayout";
// ######## Types 🗨️ ########// ######## Constants ☑️ ########
import { TokenDataMessageType } from "@/types/ws-general";

export const runtime = "edge";
export const dynamic = "force-dynamic";
// export const revalidate = 0;
// export const preferredRegion = "home";

export default function TokenPage(
  props: {
    params: Promise<{ "mint-address": string }>;
  }
) {
  const params = use(props.params);
  const mintAddress = params?.["mint-address"];
  const { data } = useCharts({
    mintAddress,
  });
  const chartData = data as TokenDataMessageType;
  useEffect(() => {
    // console.timeEnd("Navigate from Cosmo:");
  }, []);

  return (
    <ScrollLayout withPadding={false}>
      <TokenClient mint={mintAddress} initChartData={chartData || null} />
    </ScrollLayout>
  );
}
