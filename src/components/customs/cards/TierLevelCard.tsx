import Image from "next/image";
import Separator from "@/components/customs/Separator";
import { CachedImage } from "../CachedImage";

type TierLevelCardProps = {
  level: 1 | 2 | 3;
  amountReferred?: number;
  volume?: string;
  isLoading?: boolean;
};

export default function TierLevelCard({
  level,
  amountReferred,
  volume,
  isLoading,
}: TierLevelCardProps) {
  const skeletonBackground = {
    background:
      "linear-gradient(288.8deg, rgba(255, 255, 255, 0.02) 12.7%, rgba(255, 255, 255, 0.08) 87.3%)",
  };

  const SkeletonLoader = ({ className }: { className: string }) => (
    <div
      className={`${className} animate-pulse rounded`}
      style={skeletonBackground}
    />
  );
  return (
    <div className="tier__level__card relative mx-auto flex h-auto w-full max-w-[280px] flex-col gap-y-4 rounded-[16px] bg-white/[6%] p-4 shadow-[12px_12px_90px_0_rgba(0,0,0,0.5)] backdrop-blur-[50px] duration-300 ease-in-out hover:-translate-y-2 lg:mx-0">
      <div className="flex w-full items-center gap-x-4">
        <div className="relative aspect-square h-16 w-16 flex-shrink-0">
          {isLoading ? (
            <SkeletonLoader className="h-full w-full rounded-full" />
          ) : (
            <Image
              src={`/images/tiers/tier-${level === 1 ? 3 : level === 3 ? 1 : 2}.png`}
              alt={`Tier Level ${level === 1 ? 3 : level === 3 ? 1 : 2} Image`}
              fill
              quality={100}
              className="object-contain"
            />
          )}
        </div>
        <div className="flex w-full flex-col gap-y-0">
          {isLoading ? (
            <SkeletonLoader className="mb-2 h-5 w-full pt-3" />
          ) : (
            <h4 className="text-nowrap font-geistSemiBold text-[20px] text-fontColorPrimary">
              Tier {level}
            </h4>
          )}
          <div className="flex w-full items-center justify-between">
            {isLoading ? (
              <SkeletonLoader className="h-5 w-1/2" />
            ) : (
              <>
                <span className="inline-block text-nowrap text-sm text-fontColorSecondary">
                  Amount Referred
                </span>
                <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  {amountReferred?.toLocaleString() || 0}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-y-4">
        <Separator color="#73738433" />

        <div className="flex w-full items-center justify-between">
          {isLoading ? (
            <SkeletonLoader className="h-5 w-20" />
          ) : (
            <span className="inline-block text-nowrap text-sm text-fontColorSecondary">
              Volume
            </span>
          )}
          {isLoading ? (
            <SkeletonLoader className="h-5 w-20" />
          ) : (
            <div className="flex items-center gap-x-1">
              <div className="relative aspect-auto h-[13px] w-[15px] flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana SQ Icon"
                  fill
                  quality={50}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {volume || "0 SOL"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
