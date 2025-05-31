"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import {
  availableTimeframe,
  getWalletPnLChart,
  Timeframe,
} from "@/apis/rest/wallet-trade";
import { cn } from "@/libraries/utils";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { formatAmountDollarPnL } from "@/utils/formatAmount";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { memo, useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

// Sample data
const data = [
  { name: "1", value: 120 },
  { name: "2", value: 250 },
  { name: "3", value: 380 },
  { name: "4", value: 450 },
  { name: "5", value: 520 },
  { name: "6", value: 670 },
  { name: "7", value: 730 },
  { name: "8", value: 810 },
  { name: "9", value: 890 },
  { name: "10", value: 950 },
  { name: "11", value: 1020 },
  { name: "12", value: 1150 },
  { name: "13", value: 1230 },
  { name: "14", value: 1320 },
  { name: "15", value: 1440 },
  { name: "16", value: 1560 },
  { name: "17", value: 1630 },
  { name: "18", value: 1720 },
  { name: "19", value: 1810 },
  { name: "20", value: 1890 },
  { name: "21", value: 1940 },
  { name: "22", value: 1980 },
  { name: "23", value: 2010 },
  { name: "24", value: 2050 },
  { name: "25", value: 2120 },
  { name: "26", value: 2180 },
  { name: "27", value: 2240 },
  { name: "28", value: 2310 },
  { name: "29", value: 2370 },
  { name: "30", value: 2450 },
];

// const timePresetOptions = ["All", "7D", "24H", "12H", "6H", "1H"];

export default function AllRealizedPLChart({
  isModalContent = true,
}: {
  isModalContent?: boolean;
}) {
  const params = useParams<{ "wallet-address": string }>();
  const { width } = useWindowSizeStore();
  const { remainingScreenWidth } = usePopupStore();
  const { selectedTimeframe, setSelectedTimeframe } =
    useTradesWalletModalStore();
  // const walletAddress = useTradesWalletModalStore((state) => state.wallet);
  // const walletAddress = "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ"; // use hardcoded wallet address from docs

  const walletAddressState = useTradesWalletModalStore((state) => state.wallet);
  const walletAddress = isModalContent
    ? walletAddressState
    : (params?.["wallet-address"] ?? "");
  const {
    data: chartData,
    refetch,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["wallet-pnl-chart", walletAddress, selectedTimeframe],
    queryFn: async () => {
      if (!walletAddress) return null;
      const res = await getWalletPnLChart(walletAddress, selectedTimeframe);
      return res;
    },
    enabled: !!walletAddress,
  });

  // Process and transform chart data
  const processedChartData = useMemo(() => {
    if (!chartData?.data.data) return [];

    // Sort data by timestamp to ensure correct cumulative calculation
    const sortedData = [...chartData.data.data].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    let cumulativePnl = 0;
    return sortedData.map((item) => {
      // Add realized profit to cumulative
      cumulativePnl += Number(item.realizedProfitUsd);

      return {
        ...item,
        cumulativePnlUsd: cumulativePnl,
        timestamp: item.timestamp * 1000, // Convert to milliseconds for better date handling
      };
    });
  }, [chartData]);

  const dataMax = useMemo(() => {
    if (!processedChartData.length) return 0;

    const max = Math.max(
      ...processedChartData.map((item) => item.cumulativePnlUsd),
    );
    const min = Math.min(
      ...processedChartData.map((item) => item.cumulativePnlUsd),
    );

    // Handle both positive and negative values
    if (max === 0 && min === 0) return 10_000;
    return Math.ceil(Math.max(Math.abs(max), Math.abs(min)) * 0.1);
  }, [processedChartData]);

  const dataMin = useMemo(() => {
    if (!processedChartData.length) return 0;

    const min = Math.min(
      ...processedChartData.map((item) => item.cumulativePnlUsd),
    );
    if (min === 0) return 0;
    return Math.floor(min * 0.1);
  }, [processedChartData]);

  const allRealizedPnL = useMemo(() => {
    if (!chartData)
      return {
        formattedPercentage: "0%",
        formattedProfit: "$0",
        percentageRealizedPnl: 0,
      };

    const totalRealizedProfit = chartData.data.pnlUsd;
    const totalVolume = processedChartData.reduce(
      (sum, item) => sum + Number(item.volumeUsdAll),
      0,
    );

    const realizedPnlPercentage =
      totalVolume !== 0 ? (totalRealizedProfit / totalVolume) * 100 : 0;

    return {
      formattedProfit: formatAmountDollarPnL(totalRealizedProfit),
      formattedPercentage:
        realizedPnlPercentage > 0
          ? `(+${realizedPnlPercentage.toFixed(2)}%)`
          : `(${realizedPnlPercentage.toFixed(2)}%)`,
      percentageRealizedPnl: realizedPnlPercentage,
    };
  }, [chartData, processedChartData]);

  useEffect(() => {
    if (selectedTimeframe && walletAddress) {
      refetch();
    }
  }, [selectedTimeframe, refetch, walletAddress]);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-y-3 rounded-t-[20px] bg-[#080811] p-3 md:gap-y-3 md:p-[12px]",
        !isModalContent && "rounded-[8px]",
      )}
    >
      <div
        className={cn(
          "flex h-fit w-full flex-col justify-between gap-[8px] md:flex-row md:items-center md:gap-0",
          remainingScreenWidth < 800 &&
            !isModalContent &&
            "md:flex-col md:items-start md:gap-2",
        )}
      >
        <div className="flex items-center gap-x-2">
          <h4 className="line-clamp-1 font-geistSemiBold text-base text-fontColorPrimary">
            All Realized P&L
          </h4>
          <span
            className={cn(
              "font-geistSemiBold text-sm",
              allRealizedPnL.percentageRealizedPnl > 0
                ? "text-success"
                : "text-destructive",
            )}
          >
            {allRealizedPnL.formattedProfit}{" "}
            {allRealizedPnL.formattedPercentage}
          </span>
        </div>

        <div className="flex h-[32px] w-fit flex-shrink-0 items-center overflow-hidden rounded-[8px] border border-border">
          <div className="flex h-full items-center justify-center pl-4 pr-3.5">
            <span
              className={cn(
                "inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary",
                width! < 400 && "text-xs",
              )}
            >
              Presets
            </span>
          </div>
          <div className="h-full p-[2px]">
            <div className="flex h-full flex-row-reverse items-center rounded-[6px] bg-white/[8%]">
              {availableTimeframe?.map((option, index) => {
                const isActive = selectedTimeframe === option;

                return (
                  <button
                    key={index + option}
                    onClick={() => setSelectedTimeframe(option as Timeframe)}
                    className={cn(
                      "h-full rounded-[6px] px-3 font-geistSemiBold text-sm uppercase text-fontColorPrimary duration-300",
                      isActive ? "bg-white/[8%]" : "bg-transparent",
                      width! < 400 && "text-xs",
                    )}
                  >
                    {option === "30d" ? "1M" : option === "1y" ? "ALL" : option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {(isLoading || isRefetching) && (
          <div className="absolute inset-0 z-10 flex w-full items-center justify-center bg-white/[4%] backdrop-blur-md">
            <span className="flex items-center gap-2 text-sm text-fontColorSecondary">
              <LoaderCircle className="size-4 animate-spin" />
              <span>Loading chart ...</span>
            </span>
          </div>
        )}

        <ResponsiveContainer
          width="100%"
          height={
            !isModalContent && width! > 768 && remainingScreenWidth > 800
              ? 155
              : 100
          }
        >
          <AreaChart data={processedChartData}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F65B93" stopOpacity={1} />
                <stop offset="20%" stopColor="#F65B93" stopOpacity={1} />
                <stop offset="50%" stopColor="#F65B93" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#F65B93" stopOpacity={0.2} />
              </linearGradient>

              <linearGradient
                id="areaGradientSuccess"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#00C9B3" stopOpacity={1} />
                <stop offset="20%" stopColor="#00C9B3" stopOpacity={1} />
                <stop offset="50%" stopColor="#00C9B3" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#006358" stopOpacity={0.2} />
              </linearGradient>

              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="3"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              horizontal={true}
              vertical={false}
              strokeDasharray="7 5"
              stroke="#202037"
            />

            <Tooltip
              content={<MemoizedTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <XAxis
              hide={true}
              dataKey="timestamp"
              stroke="#8884d8"
              tick={{ fill: "#aaa", fontSize: 13 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis
              orientation="right"
              dataKey="cumulativePnlUsd"
              stroke="#FFFFFF"
              tick={{ fill: "#9191A4", fontSize: 13 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `${formatAmountDollarPnL(Number(value))}`
              }
              tickCount={6}
              domain={[dataMin, dataMax]}
            />

            <Area
              type="monotone"
              dataKey="cumulativePnlUsd"
              stroke={
                allRealizedPnL.percentageRealizedPnl > 0
                  ? "url(#areaGradientSuccess)"
                  : "url(#areaGradient)"
              }
              strokeWidth={2}
              fillOpacity={0.08}
              fill={
                allRealizedPnL.percentageRealizedPnl > 0
                  ? "url(#areaGradientSuccess)"
                  : "url(#areaGradient)"
              }
              style={{ filter: "url(#glow)" }}
              dot={false}
              isAnimationActive={false}
            />

            <Area
              type="monotone"
              dataKey="cumulativePnlUsd"
              stroke={
                allRealizedPnL.percentageRealizedPnl > 0 ? "#8CD9B6" : "#F65B93"
              }
              strokeWidth={2}
              fillOpacity={0}
              style={{
                mixBlendMode: "lighten",
              }}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    const formattedDate = format(new Date(label), "EEE, MMM dd, yyyy, hh:mm a");
    const formattedProfit = formatAmountDollarPnL(payload[0].value as string);
    return (
      <div className="flex flex-col gap-1 rounded border border-border bg-card p-2 text-fontColorPrimary">
        <h1 className="text-sm">
          {Number(payload[0].value) > 0 ? "+" : ""}
          {formattedProfit}
        </h1>
        <span className="text-xs text-fontColorSecondary">{formattedDate}</span>
      </div>
    );
  }
  return null;
}

const MemoizedTooltip = memo(CustomTooltip);
