"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import { useAFKStatusStore } from "@/stores/footer/use-afk-status.store";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AFKRaydiumForm from "@/components/customs/forms/footer/AFKRaydiumForm";
import AFKPumpFunForm from "@/components/customs/forms/footer/AFKPumpFunForm";
import AFKMoonshotForm from "@/components/customs/forms/footer/AFKMoonshotForm";
import AFKMeteoraForm from "@/components/customs/forms/footer/AFKMeteoraForm";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import TaskStatus from "@/components/customs/TaskStatus";
import { CachedImage } from "@/components/customs/CachedImage";

type TabLabel = "Raydium" | "Pump Fun" | "Moonshot" | "Meteora";

type Tab = {
  label: TabLabel;
  icons: {
    active: string;
    inactive: string;
  };
  tooltipMessage: string;
  content: React.ComponentType;
};

const tabList: Tab[] = [
  {
    label: "Raydium",
    icons: {
      active: "/icons/footer/active-raydium.png",
      inactive: "/icons/footer/inactive-raydium.png",
    },
    tooltipMessage: "Raydium Information",
    content: AFKRaydiumForm,
  },
  {
    label: "Pump Fun",
    icons: {
      active: "/icons/footer/active-pumpfun.png",
      inactive: "/icons/footer/inactive-pumpfun.png",
    },
    tooltipMessage: "Pump Fun Information",
    content: AFKPumpFunForm,
  },
  {
    label: "Moonshot",
    icons: {
      active: "/icons/footer/moonshot-meteora.png",
      inactive: "/icons/footer/moonshot-meteora.png",
    },
    tooltipMessage: "Moonshot Information",
    content: AFKMoonshotForm,
  },
  {
    label: "Meteora",
    icons: {
      active: "/icons/footer/moonshot-meteora.png",
      inactive: "/icons/footer/moonshot-meteora.png",
    },
    tooltipMessage: "Meteora Information",
    content: AFKMeteoraForm,
  },
];

export default function AFKModalContent({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabLabel>("Raydium");

  const { raydiumStatus, pumpFunStatus, moonshotStatus, meteoraStatus } =
    useAFKStatusStore();
  const statusMapping: Record<TabLabel, boolean> = {
    Raydium: raydiumStatus,
    "Pump Fun": pumpFunStatus,
    Moonshot: moonshotStatus,
    Meteora: meteoraStatus,
  };

  return (
    <>
      <div className="flex h-[58px] w-full justify-between p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          AFK
        </h4>

        {/* X for mobile close modal */}
        <button
          onClick={toggleModal}
          className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70 md:hidden"
        >
          <Image
            src="/icons/close.png"
            alt="Close Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </button>
      </div>

      {/* AFK Tabs */}
      <div className="flex w-full flex-grow flex-col">
        <div className="flex h-fit w-full items-center border-y border-border">
          <ScrollArea className="flex h-full w-full">
            <ScrollBar orientation="horizontal" className="hidden" />
            <div className="flex h-full w-full items-center justify-center">
              {tabList.map((tab, index) => {
                const isActive = activeTab === tab.label;
                const currentStatus = statusMapping[tab.label];

                return (
                  <div
                    key={index + tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className="relative z-20 flex h-full w-fit cursor-pointer flex-col items-center justify-center gap-y-2 px-4 py-[14px]"
                  >
                    <div className="flex w-full items-center justify-center gap-x-2.5">
                      <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                        <Image
                          src={isActive ? tab.icons.active : tab.icons.inactive}
                          alt="Info Tooltip Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>

                      <span
                        className={cn(
                          "inline-block text-nowrap text-base text-[#9191A4]",
                          isActive && "font-geistSemiBold text-[#DF74FF]",
                        )}
                      >
                        {tab.label}
                      </span>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative aspect-square h-[17.5px] w-[17.5px] flex-shrink-0">
                              <CachedImage
                                src="/icons/info-tooltip.png"
                                alt="Info Tooltip Icon"
                                fill
                                quality={50}
                                className="object-contain"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="z-[320]">
                            <p>{tab.tooltipMessage}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {currentStatus !== undefined && (
                      <TaskStatus
                        isCompleted={false}
                        isRunning={false}
                        className="rounded-[4px] px-2 py-1"
                      />
                    )}

                    {isActive && (
                      <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-[100px] bg-primary"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="relative grid w-full flex-grow grid-cols-1">
          {tabList.map((tab) => {
            const isActive = activeTab === tab.label;
            const FormComponent = tab.content;

            return isActive ? <FormComponent key={tab.label} /> : null;
          })}
        </div>
      </div>
    </>
  );
}
