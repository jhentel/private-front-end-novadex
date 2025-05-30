"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import { fetchWebsiteAge, WebsiteAge } from "@/apis/rest/social-feed";
import { useQuery } from "@tanstack/react-query";
import { parse } from "tldts";

/**
 * Formats a date as a relative time string (e.g., "28y" for 28 years ago)
 * @param dateInput - ISO date string, timestamp number, or Date object
 * @returns Formatted relative time string
 */
function formatRelativeTime(dateInput: string | number | Date): string {
  // Handle different input types
  const date =
    dateInput instanceof Date
      ? dateInput
      : typeof dateInput === "number"
        ? new Date(dateInput)
        : new Date(dateInput);

  const now = new Date();

  // Make sure the date is valid
  if (isNaN(date.getTime())) {
    return "";
  }

  // Calculate time difference in milliseconds
  const diffMs = now.getTime() - date.getTime();

  // Convert to different time units
  const diffSec = diffMs / 1000;
  const diffMin = diffSec / 60;
  const diffHour = diffMin / 60;
  const diffDay = diffHour / 24;
  const diffWeek = diffDay / 7;
  const diffMonth = diffDay / 30.44; // Average days in a month
  const diffYear = diffDay / 365.25; // Account for leap years

  // Return the appropriate format based on the difference
  if (diffYear >= 1) {
    return `${Math.floor(diffYear)}y`;
  } else if (diffMonth >= 1) {
    return `${Math.floor(diffMonth)}m`;
  } else if (diffWeek >= 1) {
    return `${Math.floor(diffWeek)}w`;
  } else if (diffDay >= 1) {
    return `${Math.floor(diffDay)}d`;
  } else if (diffHour >= 1) {
    return `${Math.floor(diffHour)}h`;
  } else if (diffMin >= 1) {
    return `${Math.floor(diffMin)}min`;
  } else {
    return "now";
  }
}

function extractDomain(urlString: string): string {
  try {
    const parsed = parse(urlString);
    let domain = parsed.domain || urlString;

    // Remove www. prefix if it exists
    if (domain.startsWith("www.")) {
      domain = domain.slice(4);
    }

    return domain;
  } catch (error) {
    console.error(`Invalid URL: ${urlString}`);
    return "";
  }
}

function formatUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    let host = parsedUrl.hostname.replace(/^www\./, ""); // remove www. if exists
    let path = parsedUrl.pathname.replace(/\/$/, ""); // remove trailing slash from path

    if (path === "" || path === "/") {
      return host;
    } else {
      return `${host}${path}`;
    }
  } catch (error) {
    console.warn("Error formatting URL:", error);
    return url; // Return original URL if parsing fails
  }
}

const WebsiteHoverPopoverContent = React.memo(({ href }: { href: string }) => {
  const formattedUrl = React.useMemo(() => {
    try {
      return formatUrl(href);
    } catch (error) {
      console.warn("Error formatting URL in useMemo:", error);
      return href;
    }
  }, [href]);

  const { data, isLoading, isError, isFetching } = useQuery<WebsiteAge>({
    queryKey: ["website-age", formattedUrl],
    queryFn: () => fetchWebsiteAge(formattedUrl),
    enabled: !!formattedUrl,
    retry: 0,
  });

  // Show loading indicator only if actually fetching data
  if (isLoading && isFetching) {
    return (
      <div className="flex h-12 items-center justify-center z-[1000]">
        <div className="relative size-6 animate-spin">
          <Image
            src="/icons/search-loading.png"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start justify-between gap-x-2 z-[1000]">
      <div className="flex min-w-0 flex-1 flex-col gap-y-0.5">
        <p className="font-geistRegular text-[10px] font-normal leading-[14px] text-fontColorPrimary">
          {extractDomain(href)}
        </p>
        <p className="max-w-full break-all font-geistRegular text-[10px] font-normal leading-[14px] text-fontColorSecondary">
          {formattedUrl}
        </p>
      </div>
      {!isError && data?.creation_date && (
        <p className="flex-shrink-0 font-geistRegular text-[10px] font-normal leading-[14px] text-success">
          {formatRelativeTime(data.creation_date)}
        </p>
      )}
    </div>
  );
});

WebsiteHoverPopoverContent.displayName = "WebsiteHoverPopoverContent";

const WebsiteHoverPopover = React.memo(
  ({
    href,
    variant = "secondary",
    containerSize,
    iconSize,
  }: {
    href: string;
    variant?: "primary" | "secondary";
    containerSize?: string;
    iconSize?: string;
  }) => {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href={href}
              target="_blank"
              className={cn(
                "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%]",
                variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                containerSize,
              )}
            >
              <div
                className={cn(
                  "relative aspect-square size-[16px] flex-shrink-0",
                  iconSize,
                )}
              >
                <Image
                  src="/icons/social/website.svg"
                  alt="Website Social Icon"
                  fill
                  quality={100}
                  loading="lazy"
                  className="object-contain"
                />
              </div>
            </Link>
          </TooltipTrigger>

          <TooltipContent
            isWithAnimation={false}
            align="start"
            side="bottom"
            className="gb__white__popover z-[1000] w-[220px] rounded-[8px] border border-border bg-card p-3 !transition-none"
          >
            <iframe className="absolute inset-0 h-full w-full opacity-0" />
            <WebsiteHoverPopoverContent href={href} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

WebsiteHoverPopover.displayName = "WebsiteHoverPopover";

export default WebsiteHoverPopover;
