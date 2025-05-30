"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  CartesianAxis,
} from "recharts";
import { cn } from "@/libraries/utils";

// Sample data
const data = [
  { name: "1", value: 1000 },
  { name: "2", value: 1400 },
  { name: "3", value: 800 },
  { name: "4", value: 750 },
  { name: "5", value: 1200 },
  { name: "6", value: 400 },
  { name: "7", value: 2800 },
  { name: "8", value: 2500 },
  { name: "9", value: 2000 },
  { name: "10", value: 1500 },
  { name: "11", value: 3200 },
  { name: "12", value: 3700 },
  { name: "13", value: 4200 },
];

const timePresetOptions = ["All", "7D", "24H", "12H", "6H", "1H"];

export default function AllRealizedPLChart() {
  const [selectedTimePreset, setSelectedTimePreset] = useState<
    "All" | "7D" | "24H" | "12H" | "6H" | "1H"
  >("All");

  return (
    <div className="flex h-full w-full flex-col gap-y-5 rounded-t-[20px] bg-[#080811] p-2 md:gap-y-3 md:p-[12px]">
      <div className="md:gap-0z flex h-8 w-full flex-col justify-between gap-[8px] md:flex-row md:items-center">
        <div className="flex items-center gap-x-2">
          <h4 className="line-clamp-1 font-geistSemiBold text-base text-fontColorPrimary">
            All Realized P&L
          </h4>
          <span className="font-geistSemiBold text-sm text-success">
            {"$13.98K (+0.2%)"}
          </span>
        </div>

        <div className="flex h-[32px] flex-shrink-0 items-center overflow-hidden rounded-[8px] border border-border">
          <div className="flex h-full items-center justify-center pl-4 pr-3.5">
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary">
              Presets
            </span>
          </div>
          <div className="h-full p-[2px]">
            <div className="flex h-full items-center rounded-[6px] bg-white/[8%]">
              {timePresetOptions?.map((option, index) => {
                const isActive = selectedTimePreset === option;

                return (
                  <button
                    key={index + option}
                    onClick={() =>
                      setSelectedTimePreset(
                        option as "All" | "7D" | "24H" | "12H" | "6H" | "1H",
                      )
                    }
                    className={cn(
                      "h-full rounded-[6px] px-3 font-geistSemiBold text-sm text-fontColorPrimary duration-300",
                      isActive ? "bg-white/[8%]" : "bg-transparent",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data}>
          {/* Gradient and Glow Filter */}
          <defs>
            {/* Gradient for the area */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C9B3" stopOpacity={1} />
              <stop offset="50%" stopColor="#00C9B3" stopOpacity={1} />
              <stop offset="100%" stopColor="#006358" stopOpacity={1} />
            </linearGradient>

            {/* Additional "Plus Lighter" Gradient */}
            <linearGradient
              id="plusLighterGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="rgba(255, 255, 255, 0.8)"
                stopOpacity={0.8}
              />
              <stop
                offset="50%"
                stopColor="rgba(255, 255, 255, 0.4)"
                stopOpacity={0.4}
              />
              <stop
                offset="100%"
                stopColor="rgba(255, 255, 255, 0)"
                stopOpacity={0}
              />
            </linearGradient>

            {/* Glow Effect */}
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

          {/* Grid */}
          <CartesianGrid
            horizontal={true}
            vertical={false}
            strokeDasharray="7 5"
            stroke="#202037"
          />

          {/* Axes */}
          <XAxis
            hide={true}
            dataKey="name"
            stroke="#8884d8"
            tick={{ fill: "#aaa", fontSize: 13 }}
          />
          <YAxis
            orientation="right"
            stroke="#FFFFFF"
            tick={{ fill: "foreground", fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `+$${value.toLocaleString()}`}
          />

          {/* Area with Gradient */}
          <Area
            type="linear"
            dataKey="value"
            stroke="url(#areaGradient)"
            strokeWidth={2}
            fillOpacity={0.08}
            fill="url(#areaGradient)"
            style={{ filter: "url(#glow)" }}
            dot={false}
            isAnimationActive={false}
          />

          {/* "Plus Lighter" Effect */}
          <Area
            type="linear"
            dataKey="value"
            stroke="url(#plusLighterGradient)"
            strokeWidth={2.5}
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
  );
}
