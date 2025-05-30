import React from "react";
import Image from "next/image";

import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";
import Separator from "@/components/customs/Separator";
import { cn } from "@/libraries/utils";

// Memoized ManagePostButton component
const ManagePostButton = React.memo(
  ({ isMobile = false }: { isMobile: boolean }) => {
    if (isMobile) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <BaseButton as='div' variant="gray" className="size-[32px]">
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/footer/setting-primary.svg"
                    alt="Setting Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </TooltipTrigger>
            <TooltipContent className="z-[1000]">
              <p>Add to library</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <BaseButton as='div' variant="gray" className="h-8 w-full justify-between py-0">
        <div className="flex items-center gap-x-2">
          <div className={cn("relative aspect-square size-4 flex-shrink-0")}>
            <Image
              src="/icons/footer/setting-primary.svg"
              alt="Gray Setting Icon"
              fill
              quality={100}
              className="object-contain duration-300"
              sizes="16px"
            />
          </div>
          <span
            className={cn(
              "inline-block whitespace-nowrap font-geistSemiBold text-sm",
            )}
          >
            Manage Account
          </span>
        </div>
        <div className="flex items-center gap-x-2">
          <Separator
            color="#080811"
            orientation="vertical"
            unit="fixed"
            fixedHeight={32}
          />
          <ChevronDown className="h-4 w-4" />
        </div>
      </BaseButton>
    );
  },
);

ManagePostButton.displayName = 'ManagePostButton';

export default ManagePostButton;
