import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../ui/tooltip";

interface FeeSummaryProps {
  variant: "footer" | "header";
}
function FeeSummary({ variant }: FeeSummaryProps) {
  if (variant === "header") {
    return (
      <div className="flex h-fit w-full flex-grow justify-around gap-2 bg-card px-4 py-2 xl:hidden">
        <div className="flex items-center gap-1">
          <div className="relative aspect-square size-4 shrink-0">
            <Image
              src="/icons/bond-curv.svg"
              alt="Bonding Curve Icon"
              fill
              quality={100}
              className="object-contain"
              loading="eager"
              priority
            />
          </div>
          <span className="shrink truncate whitespace-nowrap font-geistMonoLight text-xs text-fontColorSecondary">
            55% Bond.Curve
          </span>
        </div>
        <div className="w-[1px] shrink-0 bg-border" />
        <div className="flex items-center gap-1">
          <div className="relative aspect-square size-4 shrink-0">
            <Image
              src="/icons/priority-fee.svg"
              alt="Priority Fee Icon"
              fill
              quality={100}
              className="object-contain"
              loading="eager"
              priority
            />
          </div>
          <span className="shrink truncate whitespace-nowrap font-geistMonoLight text-xs text-fontColorSecondary">
            $12 Prio.Fee
          </span>
        </div>
        <div className="w-[1px] shrink-0 bg-border" />
        <div className="flex items-center gap-1">
          <div className="relative aspect-square size-4 shrink-0">
            <Image
              src="/icons/bribe-fee.svg"
              alt="Bribe Fee Icon"
              fill
              quality={100}
              className="object-contain"
              loading="eager"
              priority
            />
          </div>
          <span className="shrink truncate whitespace-nowrap font-geistMonoLight text-xs text-fontColorSecondary">
            $0.5 Bribe Fee
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="hidden h-fit w-fit gap-3 py-2 pl-4 xl:flex">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <div className="relative aspect-square size-4 shrink-0">
                <Image
                  src="/icons/bond-curv.svg"
                  alt="Bonding Curve Icon"
                  fill
                  quality={100}
                  className="object-contain"
                  loading="eager"
                  priority
                />
              </div>
              <span className="font-geistMonoLight text-xs text-fontColorSecondary">
                55%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent isWithAnimation={false}>
            <span>Estimated Bonding Curve</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <div className="relative aspect-square size-4 shrink-0">
                <Image
                  src="/icons/priority-fee.svg"
                  alt="Priority Fee Icon"
                  fill
                  quality={100}
                  className="object-contain"
                  loading="eager"
                  priority
                />
              </div>
              <span className="font-geistMonoLight text-xs text-fontColorSecondary">
                $12
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent isWithAnimation={false}>
            <span>Recommended Priority Fee</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <div className="relative aspect-square size-4 shrink-0">
                <Image
                  src="/icons/bribe-fee.svg"
                  alt="Bribe Fee Icon"
                  fill
                  quality={100}
                  className="object-contain"
                  loading="eager"
                  priority
                />
              </div>
              <span className="font-geistMonoLight text-xs text-fontColorSecondary">
                $0.5
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent isWithAnimation={false}>
            <span>Recommended Bribe Fee</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="w-[1px] shrink-0 bg-border" />
    </div>
  );
}

export default FeeSummary;
