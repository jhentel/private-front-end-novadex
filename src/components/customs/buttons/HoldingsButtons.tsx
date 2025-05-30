"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useHoldingsHideStore } from "@/stores/holdings/use-holdings-hide.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SellHolding from "@/components/customs/modals/SellHoldingsPopoverModal";
import PnLScreenshot from "@/components/customs/token/PnL/PnLScreenshot";
import QuickBuyButton from "./QuickBuyButton";

export default function HoldingsButtons({
  isFirst = false,
  profitAndLoss,
  profitAndLossPercentage,
  invested,
  sold,
  mint,
  remainingSol,
  symbol,
  image,
}: {
  isFirst?: boolean;
  profitAndLoss: number;
  profitAndLossPercentage: number;
  invested: number;
  sold: number;
  mint: string;
  remainingSol: number;
  symbol: string;
  image?: string;
}) {
  const { hiddenTokenList, setHiddenTokenList } = useHoldingsHideStore();
  const solPrice = useSolPriceMessageStore((state) => state.messages).price;
  const holdingMessages = useHoldingsMessageStore((state) => state.messages);

  const toggleHide = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (hiddenTokenList?.includes(mint)) {
      setHiddenTokenList(hiddenTokenList?.filter((item) => item !== mint));
    } else {
      setHiddenTokenList([...hiddenTokenList, mint]);
      // console.log("Toggle button clicked");
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <QuickBuyButton
                variant="holdings"
                mintAddress={mint}
                className="aspect-square flex-shrink-0"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="px-2 py-1">
            <span className="inline-block text-nowrap text-xs">Quick Buy</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div id={isFirst ? "holding-sell-button" : undefined}>
        <SellHolding
          mint={mint}
          remainingSol={remainingSol}
          holdingsMessages={holdingMessages}
        />
      </div>

      <PnLScreenshot
        title={symbol ? "$" + symbol : "-"}
        solPrice={solPrice}
        invested={invested}
        sold={sold}
        profitAndLoss={profitAndLoss}
        profitAndLossPercentage={profitAndLossPercentage}
        isWithDialog
        image={image}
        remaining={remainingSol}
        trigger={
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BaseButton
                    id={isFirst ? "share-holding-button" : undefined}
                    variant="gray"
                    size="short"
                    className="size-8 max-md:hidden"
                  >
                    <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                      <Image
                        src="/icons/share.png"
                        alt="Share Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </BaseButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="px-2 py-1">
                  <span className="inline-block text-nowrap text-xs">
                    Share
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BaseButton
                    id={isFirst ? "share-holding-button" : undefined}
                    variant="gray"
                    size="short"
                    className="h-8 md:hidden"
                    prefixIcon={
                      <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                        <Image
                          src="/icons/share.png"
                          alt="Share Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    }
                  >
                    {/* <span className="relative z-30 font-geistSemiBold text-sm text-fontColorPrimary">
                      Share
                    </span> */}
                  </BaseButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="px-2 py-1">
                  <span className="inline-block text-nowrap text-xs">
                    Share
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        }
        sheetsTriggerClassname="flex-grow-0 w-fit"
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <BaseButton
              id={isFirst ? "hide-holding-button" : undefined}
              variant="gray"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleHide(e);
              }}
              size="short"
              className="size-8"
            >
              <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                <Image
                  src={
                    hiddenTokenList.includes(mint)
                      ? "/icons/hide.png"
                      : "/icons/unhide.png"
                  }
                  alt="Hide / Unhide Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </BaseButton>
          </TooltipTrigger>
          <TooltipContent side="top" className="px-2 py-1">
            <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
              {hiddenTokenList.includes(mint) ? "Unhide" : "Hide"}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
