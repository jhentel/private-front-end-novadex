"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useMemo, useEffect } from "react";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";

// ######## Components 🧩 ########
import Image from "next/image";
import { HiCamera } from "react-icons/hi2";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TokenImageHover from "@/components/customs/TokenImageHover";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { getProxyUrl } from "@/utils/getProxyUrl";

export type BadgeType =
  | "moonshot"
  | "launch_a_coin"
  | "bonk"
  | "pumpfun"
  | "launchlab"
  | "raydium"
  | "boop"
  | "dynamic_bonding_curve"
  | "meteora_amm_v2"
  | "meteora_amm"
  | "pumpswap"
  | "";
export type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarWithBadgesProps {
  withImageHover?: boolean;
  symbol?: string;
  src?: string;
  alt: string;
  leftType?: BadgeType;
  rightType?: BadgeType;
  className?: string;
  classNameParent?: string;
  leftClassName?: string;
  rightClassName?: string;
  handleGoogleLensSearch?: (e: React.MouseEvent, image: string) => void;
  cameraIconClassname?: string;
  size?: AvatarSize;
  sizeConstant?: number;
  badgeSizeConstant?: number;
  isSquared?: boolean;
  isCosmo?: boolean;
}

interface BadgeProps {
  type: BadgeType | undefined;
  position: "left" | "right";
  additionalClassName?: string;
  badgeSizeConstant?: number;
  size?: AvatarSize;
}

// Cache badge image paths to avoid repeated calculations
const BADGE_IMAGE_PATHS: Record<BadgeType, { src: string; alt: string }> = {
  moonshot: { src: "/icons/asset/moonshot.png", alt: "Moonshot Icon" },
  pumpfun: { src: "/icons/asset/pumpfun.png", alt: "Pumpfun Icon" },
  launch_a_coin: {
    src: "/icons/asset/launch_a_coin.png",
    alt: "Launch A Coin Icon",
  },
  bonk: { src: "/icons/asset/bonk.png", alt: "Bonk Icon" },
  launchlab: { src: "/icons/asset/raydium.png", alt: "LaunchLab Icon" },
  raydium: {
    src: "/icons/asset/raydium.png",
    alt: "Dynamic Bonding Curve Icon",
  },
  boop: {
    src: "/icons/asset/boop.png",
    alt: "Boop Icon",
  },
  dynamic_bonding_curve: {
    src: "/icons/asset/meteora.png",
    alt: "Dynamic Bonding Curve Icon",
  },
  meteora_amm_v2: {
    src: "/icons/asset/meteora.png",
    alt: "Meteora AMM V2 Icon",
  },
  meteora_amm: { src: "/icons/asset/meteora.png", alt: "Meteora AMM Icon" },
  pumpswap: { src: "/icons/asset/pumpfun.png", alt: "Pumpswap Icon" },
  "": { src: "", alt: "" },
};

// Size mapping constants to avoid repetitive ternary operations
const SIZE_MAPPINGS = {
  xs: {
    avatar: "size-6 md:size-7",
    badge: "size-[10px]",
  },
  sm: {
    avatar: "size-7 md:size-8",
    badge: "size-[12px]",
  },
  md: {
    avatar: "size-10 md:size-10",
    badge: "size-[14px]",
  },
  lg: {
    avatar: "size-12 md:size-[56px]",
    badge: "-bottom-0.5 -right-0.5 size-[17px]",
  },
};

const convertDexToTooltipLabel = (type: BadgeType) => {
  if (type === "pumpfun") {
    return "Pump.Fun";
  }
  if (type === "pumpswap") {
    return "Pump.Swap";
  }
  if (type === "launch_a_coin") {
    return "Launch a Coin";
  }
  if (type === "launchlab") {
    return "LaunchLab";
  }
  if (type === "dynamic_bonding_curve") {
    return "Dynamic Bonding Curve";
  }
  if (type === "meteora_amm_v2") {
    return "Meteora AMM V2";
  }
  if (type === "meteora_amm") {
    return "Meteora AMM";
  }
  return type
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

export const IMAGE_PROXY_URL =
  process.env.NEXT_PUBLIC_IMAGE_PROXY_URL ||
  "https://nova-image-proxy.vercel.app";
const MAX_RETRIES = 7;
const RETRY_DELAYS = [0, 100, 300, 500, 1000, 2000, 3000]; // Progressive delays for retries

const Badge = ({
  type,
  position,
  additionalClassName,
  badgeSizeConstant,
  size = "sm",
}: BadgeProps) => {
  if (!type) return null;

  const sizeClasses = SIZE_MAPPINGS[size];

  const badge = BADGE_IMAGE_PATHS[type];
  const positionClass =
    position === "left"
      ? `${window.location.pathname.includes("/token/") ? "-bottom-0.5 -left-0.5" : "bottom-0.5 left-0.5"} ${additionalClassName}`
      : `${window.location.pathname.includes("/token/") ? "-bottom-0.5 -right-0.5" : "bottom-0.5 right-0.5"} ${additionalClassName}`;

  const tooltipLabel = convertDexToTooltipLabel(type);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              `absolute z-50 rounded-full bg-black ${sizeClasses.badge}`,
              positionClass,
              type === "pumpswap" && "hue-rotate-[120deg] saturate-150",
              type === "launchlab" && "hue-rotate-[150deg] saturate-200",
              type === "dynamic_bonding_curve" &&
                "brightness-150 hue-rotate-[80deg] saturate-150",
              type === "meteora_amm_v2" &&
                "brightness-125 hue-rotate-[15deg] saturate-150",
            )}
            aria-label={badge?.alt || "Badge"}
          >
            {Boolean(badge?.src) && (
              <Image
                src={badge?.src}
                alt={badge?.alt || "Badge"}
                {...(badgeSizeConstant
                  ? {
                      height: badgeSizeConstant,
                      width: badgeSizeConstant,
                    }
                  : { fill: true })}
                className="object-contain"
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          isWithAnimation={false}
          className="px-2 py-0.5"
        >
          <span className="text-[10px]">{tooltipLabel}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const AvatarWithBadges = ({
  withImageHover = false,
  symbol,
  src,
  alt,
  leftType,
  rightType,
  className,
  classNameParent,
  leftClassName,
  rightClassName,
  handleGoogleLensSearch,
  cameraIconClassname,
  size = "sm",
  sizeConstant,
  badgeSizeConstant,
  isSquared = false,
  isCosmo = false,
}: AvatarWithBadgesProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = SIZE_MAPPINGS[size];

  // Memoize the image source to prevent unnecessary re-renders
  const imageSrc = useMemo(
    () => getProxyUrl(src as string, symbol?.[0] || alt?.[1] || ""),
    [src, alt, symbol],
  );
  // useMemo(() => {
  //   if (!src) return undefined;

  //   if (src && src.startsWith("/images/")) return src;

  //   // If both direct and proxy approaches failed, use the first character as fallback
  //   if (src?.toLowerCase()?.includes("base64"))
  //     return src;

  //   // Try proxy if direct image failed
  //   return `${getRandomProxyUrl()}/proxy?url=${encodeURIComponent(src)}&fallback=${symbol?.[0] || alt?.[1]}`.trimEnd();
  // }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  const showFallback = !imageSrc;

  const customizedSettingPresets = useCustomizeSettingsStore(
    (state) => state.presets,
  );
  const customizedSettingActivePreset = useCustomizeSettingsStore(
    (state) => state.activePreset,
  );

  const currentAvatarPreset =
    customizedSettingPresets[customizedSettingActivePreset].avatarSetting ||
    "normal";

  const sideOffsetMap = useMemo(() => {
    if (currentAvatarPreset === "normal") return -50;
    if (currentAvatarPreset === "large") return -58;
    if (currentAvatarPreset === "extralarge") return -65;
    if (currentAvatarPreset === "doubleextralarge") return -74;
    return -50;
  }, [currentAvatarPreset]);

  return (
    <div className="relative !aspect-square">
      {withImageHover ? (
        <div className="relative h-auto w-auto">
          <Popover open={isAvatarHovered}>
            <PopoverTrigger asChild className="relative !z-40">
              <div>
                <div
                  className={cn(
                    "group/avatar avatar-with-badges relative flex aspect-square flex-shrink-0 items-center justify-center rounded-full",
                    sizeClasses.avatar,
                    classNameParent,
                    isSquared && isCosmo ? "rounded-[4px]" : "rounded-full",
                  )}
                >
                  <div
                    className={cn(
                      "relative aspect-square size-full rounded-full",
                      className,
                      isSquared && isCosmo ? "rounded-[4px]" : "rounded-full",
                      !showFallback &&
                        handleGoogleLensSearch &&
                        "cursor-pointer transition-opacity duration-300 ease-out hover:opacity-0",
                    )}
                  >
                    {Boolean(imageSrc) ? (
                      <Image
                        key={imageSrc}
                        src={imageSrc as string}
                        alt={alt}
                        {...(sizeConstant
                          ? {
                              height: sizeConstant,
                              width: sizeConstant,
                            }
                          : { fill: true })}
                        loading="eager"
                        className={cn(
                          "size-full rounded-full object-cover",
                          isSquared && isCosmo
                            ? "rounded-[4px]"
                            : "rounded-full",
                        )}
                        onLoad={handleImageLoad}
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex size-full items-center justify-center rounded-full",
                          isSquared && isCosmo
                            ? "rounded-[4px]"
                            : "rounded-full",
                        )}
                      >
                        {symbol ? (
                          <span className="inline-block text-lg font-medium uppercase leading-none text-white md:text-xl">
                            {symbol?.[0]}
                          </span>
                        ) : (
                          <span className="inline-block text-lg font-medium uppercase leading-none text-white md:text-xl">
                            {alt?.[1]}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {handleGoogleLensSearch && imageSrc && !showFallback && (
                    <button
                      onClick={(e) => handleGoogleLensSearch(e, src || "")}
                      className={cn(
                        "invisible absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#360146]/50 opacity-0 duration-100 group-hover/avatar:visible group-hover/avatar:opacity-100",
                        isSquared && isCosmo ? "rounded-[4px]" : "rounded-full",
                      )}
                      aria-label="Search with Google Lens"
                    >
                      <HiCamera
                        className={cn(
                          "text-[28px] text-fontColorPrimary",
                          cameraIconClassname,
                        )}
                      />
                    </button>
                  )}
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={sideOffsetMap}
              onMouseEnter={() => setIsAvatarHovered(true)}
              onMouseLeave={() => setIsAvatarHovered(false)}
              className="relative z-[1000] h-40 w-40 overflow-hidden rounded-[8px] border-none"
            >
              <TokenImageHover
                src={imageSrc}
                symbol={symbol || ""}
                handleGoogleLensSearch={
                  src ? (e) => handleGoogleLensSearch!(e, src || "") : undefined
                }
              />
            </PopoverContent>
          </Popover>

          <div
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
            className="absolute left-1/2 top-1/2 !z-40 size-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent opacity-0"
          ></div>
        </div>
      ) : (
        <div
          className={cn(
            "group/avatar avatar-with-badges relative flex aspect-square flex-shrink-0 items-center justify-center rounded-full",
            sizeClasses.avatar,
            classNameParent,

            isSquared && isCosmo ? "rounded-[4px]" : "rounded-full",
          )}
        >
          <div
            className={cn(
              "relative aspect-square size-full rounded-full",
              className,
              isSquared && isCosmo ? "rounded-[4px]" : "rounded-full",
              !showFallback &&
                handleGoogleLensSearch &&
                "cursor-pointer transition-opacity duration-300 ease-out hover:opacity-0",
            )}
          >
            {Boolean(imageSrc) ? (
              <Image
                key={imageSrc}
                src={imageSrc as string}
                alt={alt}
                {...(sizeConstant
                  ? {
                      height: sizeConstant,
                      width: sizeConstant,
                    }
                  : { fill: true })}
                loading="eager"
                className={cn(
                  "size-full rounded-full object-cover",
                  // isLoading && "animate-pulse",
                  isSquared && isCosmo ? "rounded-[4px]" : "rounded-full",
                )}
                //  onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div
                className={cn(
                  "flex size-full items-center justify-center rounded-full",
                  isSquared && isCosmo ? "rounded-[4px]" : "rounded-full",
                )}
              >
                {symbol ? (
                  <span className="inline-block text-lg font-medium uppercase leading-none text-white md:text-xl">
                    {symbol?.[0]}
                  </span>
                ) : (
                  <span className="inline-block text-lg font-medium uppercase leading-none text-white md:text-xl">
                    {alt?.[1]}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Google Lens Search Overlay */}
          {handleGoogleLensSearch && imageSrc && !showFallback && (
            <button
              onClick={(e) => handleGoogleLensSearch(e, src || "")}
              className={cn(
                "invisible absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#360146]/50 opacity-0 duration-100 group-hover/avatar:visible group-hover/avatar:opacity-100",
                isSquared && isCosmo ? "rounded-[4px]" : "rounded-full",
              )}
              aria-label="Search with Google Lens"
            >
              <HiCamera
                className={cn(
                  "text-[28px] text-fontColorPrimary",
                  cameraIconClassname,
                )}
              />
            </button>
          )}
        </div>
      )}

      {/* Left Badge */}
      <Badge
        type={leftType}
        position="left"
        additionalClassName={leftClassName}
        badgeSizeConstant={badgeSizeConstant}
        size={size}
      />

      {/* Right Badge */}
      <Badge
        type={rightType}
        position="right"
        additionalClassName={rightClassName}
        badgeSizeConstant={badgeSizeConstant}
        size={size}
      />
    </div>
  );
};

// Only re-render if props actually change
export default React.memo(AvatarWithBadges);
