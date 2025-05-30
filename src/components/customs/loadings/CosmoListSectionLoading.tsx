"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NewlyCreatedListFilterPopover from "@/components/customs/popovers/NewlyCreatedListFilterPopover";
import AboutToGraduateListFilterPopover from "@/components/customs/popovers/AboutToGraduateListFilterPopover";
import GraduatedListFilterPopover from "@/components/customs/popovers/GraduatedListFilterPopover";
import CosmoCardLoading from "@/components/customs/loadings/CosmoCardLoading";
import { CachedImage } from "../CachedImage";
import { CosmoFilterSubscribeMessageType } from "@/types/ws-general";

export default function CosmoListSectionLoading({
  column,
  variant,
  handleSendFilterMessage,
}: {
  column: 1 | 2 | 3;
  variant: "desktop" | "mobile";
  handleSendFilterMessage?: (
    category: "created" | "aboutToGraduate" | "graduated",
    filterObject: CosmoFilterSubscribeMessageType,
  ) => void;
}) {
  const columnDataMap = {
    1: {
      title: "Newly Created",
      tooltipText: "Newly Created Tokens",
      filterComponent: (
        <NewlyCreatedListFilterPopover
          handleSendFilterMessage={handleSendFilterMessage}
        />
      ),
    },
    2: {
      title: "About to Graduate",
      tooltipText: "Tokens which are about to bond",
      filterComponent: (
        <AboutToGraduateListFilterPopover
          handleSendFilterMessage={handleSendFilterMessage}
        />
      ),
    },
    3: {
      title: "Graduated",
      tooltipText: "Tokens which have bonded",
      filterComponent: (
        <GraduatedListFilterPopover
          handleSendFilterMessage={handleSendFilterMessage}
        />
      ),
    },
  };

  return (
    <>
      {variant === "desktop" && (
        <div className="relative col-span-1 flex w-full flex-grow flex-col">
          <div className="flex w-full items-center justify-between py-4">
            <div className="flex items-center gap-x-2">
              <div className="flex flex-shrink-0 items-center gap-x-1.5">
                <h3 className="font-geistSemiBold text-base text-fontColorPrimary">
                  {columnDataMap[column].title}
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                        <CachedImage
                          src="/icons/info-tooltip.png"
                          alt="Info Tooltip Icon"
                          fill
                          quality={50}
                          className="object-contain"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{columnDataMap[column].tooltipText}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {columnDataMap[column].filterComponent}
          </div>

          <div className="nova-scroller relative w-full flex-grow">
            <div className="absolute left-0 top-0 w-full flex-grow">
              <div className="flex h-auto w-full flex-col">
                {Array.from({ length: 10 }).map((_, index) => (
                  <CosmoCardLoading key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {variant === "mobile" && (
        <div className="flex h-full w-full flex-grow flex-col pl-4 pr-2 pt-4 lg:pl-0">
          <div className="nova-scroller relative w-full flex-grow">
            <div className="absolute left-0 top-0 w-full flex-grow">
              <div className="flex h-auto w-full flex-col">
                {Array.from({ length: 10 }).map((_, index) => (
                  <CosmoCardLoading key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
