"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const SocialLinkButton = React.memo(
  ({
    href,
    icon,
    label,
    typeImage = "webp",
    variant = "secondary",
    size = "md",
    withTooltip = true,
    containerSize,
    iconSize,
  }: {
    href: string;
    icon: string;
    label: string;
    typeImage?: "webp" | "png" | "svg";
    variant?: "primary" | "secondary";
    size?: "sm" | "md";
    withTooltip?: boolean;
    containerSize?: string;
    iconSize?: string;
  }) => {
    if (!href) return null;

    if (!withTooltip) {
      return (
        <Link
          href={href}
          target="_blank"
          prefetch={false}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "gb__white__btn relative flex aspect-square h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 before:!absolute before:!rounded-[4px] hover:bg-white/[12%]",
            variant == "primary" ? "bg-white/[6%]" : "bg-[#272734]",
            size === "sm" ? "size-[20px]" : "",
          )}
        >
          <div
            className={cn(
              "relative aspect-square size-[18px] flex-shrink-0",
              size === "sm" ? "size-[16px]" : "",
            )}
          >
            <Image
              src={`/icons/social/${icon}.${typeImage}`}
              alt={`${label} Social Icon`}
              height={size === "sm" ? 16 : 18}
              width={size === "sm" ? 16 : 18}
              quality={100}
              loading="lazy"
              className="object-contain"
            />
          </div>
        </Link>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={href}
              prefetch={false}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "gb__white__btn relative flex aspect-square h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 before:!absolute before:!rounded-[4px] hover:bg-white/[12%]",
                variant == "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                size === "sm" ? "size-[20px]" : "",
                containerSize ? containerSize : "",
              )}
            >
              <div
                className={cn(
                  "relative aspect-square size-[18px] flex-shrink-0",
                  size === "sm" ? "size-[16px]" : "",
                  containerSize ? containerSize : "",
                )}
              >
                <Image
                  src={`/icons/social/${icon}.${typeImage}`}
                  alt={`${label} Social Icon`}
                  height={size === "sm" ? 16 : 18}
                  width={size === "sm" ? 16 : 18}
                  quality={100}
                  loading="lazy"
                  className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain",
                    iconSize,
                  )}
                />
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent isWithAnimation={false}>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
SocialLinkButton.displayName = "SocialLink";

export default SocialLinkButton;
