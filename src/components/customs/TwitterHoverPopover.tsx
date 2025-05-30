"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import {
  fetchTwitterUserData,
  fetchBetaData,
  TwitterUserData,
  fetchCommunity,
  TwitterCommunityData,
} from "@/apis/rest/twitter";
import { ScrollArea } from "../ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  fromUnixTime,
} from "date-fns";
import SocialLinkButton from "./buttons/SocialLinkButton";
import { formatAmount } from "@/utils/formatAmount";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LightTooltip from "./light-tooltip";
import TimeDifference from "./cards/TimeDifference";
import { Skeleton } from "../ui/skeleton";
import { useCopyDropdownState } from "@/stores/cosmo/card-state/use-copy-dropdown-state.store";

function getRelativeTime(timestamp: number): string {
  // Handle both Unix timestamp (seconds) and JavaScript timestamp (milliseconds)
  // If timestamp is less than a reasonable threshold, assume it's in seconds
  const date =
    timestamp < 10000000000 ? fromUnixTime(timestamp) : new Date(timestamp);
  const now = new Date();

  // Calculate absolute differences to handle future dates correctly
  const totalMinutes = Math.abs(differenceInMinutes(now, date));
  if (totalMinutes < 1) {
    return "just now";
  }
  if (totalMinutes === 1) {
    return "1 minute";
  }
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  }

  const totalHours = Math.abs(differenceInHours(now, date));
  if (totalHours === 1) {
    return "1 hour";
  }
  if (totalHours < 24) {
    return `${totalHours} hours`;
  }

  const totalDays = Math.abs(differenceInDays(now, date));
  if (totalDays === 1) {
    return "1 day";
  }
  if (totalDays < 7) {
    return `${totalDays} days`;
  }

  const totalWeeks = Math.abs(differenceInWeeks(now, date));
  if (totalWeeks === 1) {
    return "1 week";
  }
  if (totalWeeks < 4) {
    return `${totalWeeks} weeks`;
  }

  const totalMonths = Math.abs(differenceInMonths(now, date));

  // Handle edge case where months difference is 0 but days > 28
  if (totalMonths === 0 && totalDays >= 28) {
    return "1 month";
  }

  if (totalMonths === 1) {
    return "1 month";
  }
  if (totalMonths < 12) {
    return `${totalMonths} months`;
  }

  const totalYears = Math.abs(differenceInYears(now, date));
  if (totalYears === 1) {
    return "a year ago";
  }
  return `${totalYears} years ago`;
}

const PersistentTooltipProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <TooltipPrimitive.Provider
      delayDuration={100}
      skipDelayDuration={1000} // Time to allow movement between tooltips
    >
      {children}
    </TooltipPrimitive.Provider>
  );
};

const AvatarItem = React.memo(
  ({
    username,
    profileUrl,
    isFirstItem = false,
    className,
  }: {
    username: string;
    profileUrl: string;
    isFirstItem: boolean;
    className?: string;
  }) => {
    const tooltipContent = (
      <span className="font-geistRegular text-xs font-normal">{username}</span>
    );

    const avatar = (
      <div
        className={cn(
          "relative flex-shrink-0 cursor-pointer",
          !isFirstItem && "-ml-[6px]",
          className,
        )}
      >
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={username}
            fill
            className={cn("rounded-full object-cover")}
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center rounded-full bg-black font-medium text-white blur-lg",
            )}
          >
            {username
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}
      </div>
    );

    return (
      <LightTooltip tip={username}>
        <Link
          href={`https://x.com/${username}`}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
          }}
          aria-label={`View ${username}'s profile on X`}
        >
          {avatar}
        </Link>
      </LightTooltip>
    );
  },
);

AvatarItem.displayName = "AvatarItem";

const TwitterHoverPopoverContent = React.memo(
  ({
    username,
    data,
    setFinalData,
  }: {
    username: string;
    data: TwitterUserData | undefined;
    setFinalData: React.Dispatch<
      React.SetStateAction<TwitterUserData | undefined>
    >;
  }) => {
    const [partialData, setPartialData] = useState<TwitterUserData | undefined>(
      data,
    );
    const [profileImage, setProfileImage] = useState<string>("");
    const [loadingPfp, setLoadingPfp] = useState<boolean>(true);

    // Separate query for profile picture using fetchBetaData
    const { data: betaData } = useQuery({
      queryKey: ["twitter-beta", username],
      queryFn: async () => {
        setLoadingPfp(true);
        try {
          const result = await fetchBetaData(username);
          setProfileImage(result.pfp_url);
          return result;
        } catch (error) {
          console.error("Error fetching beta data:", error);
          return null;
        } finally {
          setLoadingPfp(false);
        }
      },
      enabled: !!username,
    });

    // Main data query (excluding profile picture)
    const { data: fetchData, isLoading } = useQuery({
      queryKey: ["twitter", username],
      queryFn: async () => {
        if (data) return data;
        const res = await fetchTwitterUserData(username, (newData) => {
          // Update partial data immediately when any data is available
          setPartialData((prev) => {
            if (!prev) {
              return {
                success: true,
                past: [],
                new: {
                  image_profile: "",
                  username: username,
                  name: username,
                  following: 0,
                  follower: 0,
                  followed_by: [],
                  is_blue_verified: false,
                  timestamp: Date.now(),
                },
                ...newData,
              };
            }
            return {
              ...prev,
              ...newData,
              new: {
                ...prev.new,
                ...newData.new,
              },
            };
          });
        });
        return res;
      },
      initialData: data,
      enabled: !data,
    });

    // Update final data when fetch completes
    useEffect(() => {
      if (fetchData && !isLoading) {
        setFinalData(fetchData);
      }
    }, [fetchData, isLoading, setFinalData]);

    // Use partial data for display if available
    const displayData = partialData || fetchData;

    // Memoize the past usernames list to prevent unnecessary re-renders
    const pastUsernames = useMemo(() => {
      if (!displayData?.past) return [];
      return displayData.past
        .filter(
          (item) =>
            item.username.toLowerCase() !==
            displayData.new.username.toLowerCase(),
        )
        .map((item) => ({
          ...item,
          // Convert Unix timestamp from seconds to milliseconds
          timestamp:
            typeof item.timestamp === "string"
              ? parseInt(item.timestamp) * 1000
              : item.timestamp * 1000,
        }));
    }, [displayData?.past, displayData?.new.username]);

    const currentUsernameTimestamp = useMemo(() => {
      if (!displayData?.past || !displayData?.new.username) return null;

      const currentUsername = displayData.new.username.toLowerCase();
      const matchingEntry = displayData.past.find(
        (item) => item.username.toLowerCase() === currentUsername,
      );

      return matchingEntry ? matchingEntry.timestamp : null;
    }, [displayData?.past, displayData?.new.username]);

    return (
      <>
        {isLoading && !displayData ? (
          <div className="absolute left-1/2 top-1/2 z-[1000] flex h-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <div className="flex w-full flex-col gap-4 px-3">
              <div className="flex items-center gap-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-x-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ) : displayData && displayData.success ? (
          <>
            <div className="z-[1000] h-full w-full">
              <ScrollArea className="h-full w-full">
                <div className="flex flex-col gap-y-0.5 pt-2">
                  <h3 className="px-3 font-geistRegular text-xs font-normal uppercase text-fontColorSecondary">
                    New
                  </h3>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://x.com/${username}`, "_blank");
                    }}
                    className="mx-1 block cursor-pointer rounded-lg bg-[#17171F] p-3 hover:bg-[#272734]"
                  >
                    <div className="flex items-start gap-x-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {loadingPfp ? (
                          <Skeleton className="h-full w-full rounded-full" />
                        ) : (
                          <>
                            <AvatarImage
                              src={profileImage}
                              alt={`${displayData.new.username} Profile Picture`}
                            />
                            <AvatarFallback>
                              {displayData.new.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className="flex flex-1 flex-col gap-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex w-full items-center justify-between gap-x-1">
                            <h4 className="font-geistSemiBold text-base font-semibold leading-5 text-white">
                              {username}
                            </h4>
                            <h4 className="text-fontColorSecondary">
                              {currentUsernameTimestamp &&
                                `${getRelativeTime(currentUsernameTimestamp)}`}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-x-1 whitespace-nowrap">
                          {displayData.loading?.following ? (
                            <Skeleton className="h-4 w-20" />
                          ) : (
                            <p className="font-geistRegular text-sm font-normal leading-[18px] text-[#9191A4]">
                              <span className="font-geistSemiBold text-sm font-semibold text-fontColorPrimary">
                                {formatAmount(
                                  displayData.new.following || 0,
                                  2,
                                )}
                              </span>{" "}
                              Following
                            </p>
                          )}

                          <span className="font-geistRegular text-sm font-normal leading-[18px] text-[#9191A4]">
                            ·
                          </span>

                          {displayData.loading?.followers ? (
                            <Skeleton className="h-4 w-20" />
                          ) : (
                            <p className="font-geistRegular text-sm font-normal leading-[18px] text-[#9191A4]">
                              <span className="font-geistSemiBold text-sm font-semibold text-fontColorPrimary">
                                {formatAmount(displayData.new.follower || 0, 2)}
                              </span>{" "}
                              Followers
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 px-3 pb-3">
                      {/* Description */}
                      {loadingPfp ? (
                        <Skeleton className="h-4 w-full" />
                      ) : betaData?.bio ? (
                        <p className="font-geistRegular text-sm font-normal leading-[18px] text-fontColorPrimary">
                          {betaData.bio}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                {displayData.loading?.pastUsernames ? (
                  <div className="mt-4 px-3">
                    <Skeleton className="mb-2 h-4 w-20" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                ) : pastUsernames.length > 0 ? (
                  <div className="flex flex-col gap-y-0.5 px-3">
                    <h3 className="pt-2 font-geistRegular text-xs font-normal uppercase text-fontColorSecondary">
                      Past
                    </h3>
                    {pastUsernames.map((item) => (
                      <div
                        key={item.username + String(item.timestamp)}
                        className="flex items-center py-1"
                      >
                        <p className="text-xs text-primary">@{item.username}</p>
                        <p className="ml-1 text-xs text-fontColorSecondary/60">
                          {getRelativeTime(item.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </ScrollArea>
            </div>
          </>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-sm text-fontColorSecondary/60">
              Failed to load profile
            </p>
          </div>
        )}
      </>
    );
  },
);

const EmptyState = () => {
  return (
    <div className="mt-4 flex h-full flex-col items-center justify-center gap-1">
      <EmptyIlustration />
      <p className="text-xs text-fontColorSecondary">No Past @s Found</p>
    </div>
  );
};

const EmptyIlustration = () => {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        opacity="0.1"
        cx="32"
        cy="62.0794"
        rx="32"
        ry="1.92"
        fill="#9191A4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.8316 45.8344C21.144 46.1468 21.144 46.6533 20.8316 46.9657L16.5649 51.2324C16.2525 51.5448 15.746 51.5448 15.4335 51.2324C15.1211 50.92 15.1211 50.4135 15.4335 50.101L19.7002 45.8344C20.0126 45.5219 20.5192 45.5219 20.8316 45.8344Z"
        fill="#9191A4"
      />
      <path
        d="M53.1029 12.2667L38.2095 29.2059L54.4002 52.2666H42.4882L36.5007 43.7397C37.0278 42.7809 37.4021 41.7265 37.591 40.6095L44.1509 49.7913H49.5722L24.6215 14.8699H19.2015L29.3414 29.0626C28.8171 28.9776 28.2792 28.9334 27.7311 28.9334C27.2063 28.9334 26.6909 28.9739 26.1878 29.052L14.4002 12.2667H26.3122L36.6375 26.9718L49.5749 12.2667H53.1029Z"
        fill="#9191A4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.4659 30.1334C22.4585 30.1334 18.3992 34.1927 18.3992 39.2001C18.3992 44.2074 22.4585 48.2667 27.4659 48.2667C32.4732 48.2667 36.5325 44.2074 36.5325 39.2001C36.5325 34.1927 32.4732 30.1334 27.4659 30.1334ZM16.7992 39.2001C16.7992 33.309 21.5748 28.5334 27.4659 28.5334C33.3569 28.5334 38.1325 33.309 38.1325 39.2001C38.1325 45.0911 33.3569 49.8667 27.4659 49.8667C21.5748 49.8667 16.7992 45.0911 16.7992 39.2001Z"
        fill="#9191A4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.3878 25.6283C15.1467 24.7288 14.2222 24.195 13.3227 24.436C12.4232 24.677 11.8894 25.6016 12.1304 26.5011L13.0282 29.8516C13.2692 30.7511 14.1938 31.2849 15.0932 31.0439C15.9927 30.8028 16.5265 29.8783 16.2855 28.9788L15.3878 25.6283ZM13.6424 33.2918C13.4014 32.3923 12.4768 31.8585 11.5773 32.0995L8.22683 32.9972C7.32733 33.2383 6.79354 34.1628 7.03456 35.0623C7.27558 35.9618 8.20014 36.4956 9.09964 36.2546L12.4501 35.3569C13.3496 35.1158 13.8834 34.1913 13.6424 33.2918ZM13.6541 25.6728C13.8708 25.6148 14.0935 25.7434 14.1516 25.96L15.0493 29.3105C15.1074 29.5272 14.9788 29.7499 14.7621 29.8079C14.5455 29.866 14.3228 29.7374 14.2647 29.5207L13.367 26.1702C13.3089 25.9536 13.4375 25.7309 13.6541 25.6728ZM12.4058 33.6227C12.3478 33.406 12.1251 33.2774 11.9084 33.3355L8.55796 34.2332C8.3413 34.2913 8.21273 34.514 8.27078 34.7306C8.32883 34.9473 8.55154 35.0759 8.76819 35.0178L12.1187 34.1201C12.3353 34.062 12.4639 33.8393 12.4058 33.6227Z"
        fill="#9191A4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.9299 35.9537C21.5758 35.7446 21.1623 35.9263 21.0011 36.3072L21.0011 36.3072C20.8432 36.6801 20.9642 37.1464 21.3021 37.346L24.4407 39.1997L21.3021 41.0535C20.9642 41.253 20.8432 41.7193 21.0011 42.0923L21.1237 42.0403L21.0011 42.0923C21.1623 42.4732 21.5758 42.6549 21.9299 42.4458L26.2471 39.8959C26.4804 39.7581 26.6168 39.4854 26.6168 39.1997C26.6168 38.9141 26.4804 38.6413 26.2471 38.5036L21.9299 35.9537ZM33.9302 36.3072C33.769 35.9263 33.3555 35.7446 33.0014 35.9537L28.6841 38.5036C28.4509 38.6413 28.3144 38.9141 28.3144 39.1997C28.3144 39.4854 28.4509 39.7581 28.6841 39.8959L33.0014 42.4458C33.3555 42.6549 33.769 42.4732 33.9302 42.0923C34.0881 41.7194 33.9671 41.253 33.6291 41.0535L30.4906 39.1997L33.6291 37.346C33.9671 37.1464 34.0881 36.6801 33.9302 36.3072Z"
        fill="#9191A4"
      />
    </svg>
  );
};

TwitterHoverPopoverContent.displayName = "TwitterHoverPopoverContent";

const TwitterCommunityPopoverContent = React.memo(
  ({
    communityId,
  }: {
    communityId: string;
  }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);

    const { data: communityData, isLoading } = useQuery({
      queryKey: ["twitter-community", communityId],
      queryFn: () => fetchCommunity(communityId),
      enabled: !!communityId,
    });

    const descriptionRef = useCallback((node: HTMLParagraphElement | null) => {
      if (node) {
        setIsDescriptionOverflowing(node.scrollHeight > node.clientHeight);
      }
    }, []);

    if (isLoading) {
      return (
        <div className="flex flex-col gap-4 p-3">
          <Skeleton className="h-[122px] w-full" />
          <div className="flex flex-col gap-4 px-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex items-center gap-2 px-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      );
    }

    if (!communityData) return null;

    return (
      <div className="flex flex-col gap-4 p-3">
        {/* Banner */}
        <div
          className="h-[122px] w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${communityData.banner})` }}
        />

        {/* Name and Verified Badge */}
        <div className="flex flex-col gap-3 px-3">
          <div className="flex items-center gap-1">
            <h3 className="font-geistSemiBold text-base font-semibold leading-5 text-white">
              {communityData.name}
            </h3>
            <Image
              src="/icons/badge-verified.svg"
              alt="Verified"
              width={20}
              height={20}
              className="flex-shrink-0"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <p
                ref={descriptionRef}
                className={cn(
                  "font-geistRegular text-sm font-normal leading-[18px] text-fontColorPrimary break-words whitespace-pre-wrap",
                  !showFullDescription && "line-clamp-3"
                )}
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  maxWidth: "100%"
                }}
              >
                {communityData.description}
              </p>
              {isDescriptionOverflowing && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="font-geistSemiBold text-xs font-semibold leading-4 text-fontColorPrimary"
                >
                  {showFullDescription ? "See Less" : "See More"}
                </button>
              )}
            </div>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 rounded-lg pr-3 py-1">
            <div className="flex items-center gap-2">
              {/* <div className="flex -space-x-2">
                {[1, 2, 3].map((_, index) => (
                  <Avatar key={index} className="ring-2 ring-[#17171F]">
                    <AvatarImage src={`https://github.com/shadcn.png`} alt="Member" />
                    <AvatarFallback>M{index + 1}</AvatarFallback>
                  </Avatar>
                ))}
              </div> */}
              <div className="flex items-center gap-1">
                <span className="font-geistSemiBold text-base font-semibold leading-5 text-white">
                  {formatAmount(communityData.member_count, 0)}
                </span>
                <span className="font-geistRegular text-xs font-normal leading-4 text-fontColorSecondary line-clamp-1">
                  Members
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TwitterCommunityPopoverContent.displayName = "TwitterCommunityPopoverContent";

const TwitterHoverPopover = React.memo(
  ({
    href,
    variant = "secondary",
    data,
    containerSize,
    iconSize,
    isTokenPage = false,
  }: {
    href: string;
    variant?: "primary" | "secondary";
    data?: TwitterUserData;
    containerSize?: string;
    iconSize?: string;
    isTokenPage?: boolean;
  }) => {
    const twitterUsernameRegex = /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/([^\/\?\s#]+)/;
    const communityIdRegex = /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/i\/communities\/(\d+)/;

    const username = href.match(twitterUsernameRegex)?.[1] || "";
    const communityId = href.match(communityIdRegex)?.[1] || "";

    const [finalData, setFinalData] = useState(data);
    const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);

    // Move useQuery outside conditional block
    const { data: communityData } = useQuery({
      queryKey: ["twitter-community", communityId],
      queryFn: () => fetchCommunity(communityId),
      enabled: !!communityId,
    });

    // Memoize the embed URL calculation
    const embedUrl = useMemo(() => {
      let videoId = "";

      const watchMatch = href.match(/youtube\.com\/watch\?v=([^&]+)/);
      if (watchMatch) videoId = watchMatch[1];

      const shortMatch = href.match(/youtu\.be\/([^?&]+)/);
      if (shortMatch) videoId = shortMatch[1];

      const embedMatch = href.match(/youtube\.com\/embed\/([^?&]+)/);
      if (embedMatch) return href;

      const shortsMatch = href.match(/youtube\.com\/shorts\/([^?&]+)/);
      if (shortsMatch) videoId = shortsMatch[1];

      return videoId ? `https://www.youtube.com/embed/${videoId}` : href;
    }, [href]);

    const setDropdownOpen = useCopyDropdownState(
      (state) => state.setDropdownOpen,
    );
    const [isHovering, setIsHovering] = useState<boolean>(false);

    useEffect(() => {
      setDropdownOpen(isHovering);
    }, [isHovering, setDropdownOpen]);

    // Memoize the community button render
    const communityButton = useMemo(() => {
      if (!communityId) return null;

      return (
        <PersistentTooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(href, "_blank");
                  }}
                  className="flex items-center gap-0.5 rounded-[4px] border border-transparent bg-white/[16%] px-[6px] py-0.5"
                >
                  <div className="relative aspect-square size-4">
                    <Image
                      src="/icons/social/twitter-communities-people.svg"
                      alt="Twitter Communities"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-geistMedium text-xs font-medium leading-none text-fontColorPrimary">
                    {formatAmount(communityData?.member_count || 0, 0)}
                  </span>
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              isWithAnimation={false}
              align="start"
              side="bottom"
              className={cn(
                "gb__white__popover z-[1000] rounded-[4px] border border-border bg-card p-1 !transition-none",
                "min-h-72 w-auto min-w-72 max-w-96",
              )}
            >
              <TwitterCommunityPopoverContent communityId={communityId} />
            </TooltipContent>
          </Tooltip>
        </PersistentTooltipProvider>
      );
    }, [communityId, communityData, href]);

    if (communityId) {
      return communityButton;
    }

    if (
      !(href.includes("x.com") || href.includes("twitter.com")) &&
      href.includes("youtube.com")
    ) {
      return (
        <PersistentTooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <SocialLinkButton
                variant={"primary"}
                size="sm"
                href={href}
                icon="twitter"
                label="Twitter"
                typeImage="svg"
                containerSize={containerSize}
                iconSize={iconSize}
              />
            </TooltipTrigger>
            <TooltipContent className="p-0">
              <iframe
                className="h-[200px] w-full rounded-[6px] border border-border"
                src={embedUrl}
                title="YouTube video player"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
              ></iframe>
            </TooltipContent>
          </Tooltip>
        </PersistentTooltipProvider>
      );
    }

    return (
      <>
        {href.includes("search?q=") || href.includes("communities") ? (
          <Link
            href={href}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%]",
              variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
              !finalData || !data
                ? "aspect-square size-[20px]"
                : "w-auto gap-0.5 p-1.5",
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
                src="/icons/social/twitter.svg"
                alt="Twitter Social Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            {!!finalData && (
              <div className="text-xs text-fontColorPrimary">
                {(data || finalData)?.past?.length}
              </div>
            )}
          </Link>
        ) : (
          <>
            <PersistentTooltipProvider>
              <Tooltip
                delayDuration={0}
                open={isHovering}
                onOpenChange={setIsHovering}
              >
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    target="_blank"
                    className={cn(
                      "gb__white__btn_xs relative hidden h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%] md:flex",
                      variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                      !finalData || !data
                        ? "aspect-square size-[20px]"
                        : "w-auto gap-0.5 p-1.5",
                      containerSize,
                      data || (finalData && "!w-auto pl-1 pr-1.5"),
                    )}
                  >
                    <div
                      className={cn(
                        "relative aspect-square size-[16px] flex-shrink-0",
                        iconSize,
                      )}
                    >
                      <Image
                        src="/icons/social/twitter.svg"
                        alt="Twitter Social Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    {!!finalData && (
                      <div className="text-xs text-fontColorPrimary">
                        {(data || finalData).past?.length}
                      </div>
                    )}
                  </Link>
                </TooltipTrigger>

                <TooltipContent
                  isWithAnimation={false}
                  align="start"
                  side="bottom"
                  className={cn(
                    "gb__white__popover z-[1000] rounded-[4px] border border-border bg-card p-1 !transition-none",
                    "min-h-72 w-auto min-w-72 max-w-96",
                  )}
                >
                  <TwitterHoverPopoverContent
                    username={username}
                    data={data}
                    setFinalData={setFinalData}
                  />
                </TooltipContent>
              </Tooltip>
            </PersistentTooltipProvider>

            {isTokenPage ? (
              <Link
                href={href}
                target="_blank"
                className={cn(
                  "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%] md:hidden",
                  variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                  !finalData || !data
                    ? "aspect-square size-[20px]"
                    : "w-auto gap-0.5 p-1.5",
                  containerSize,
                  data || (finalData && "!w-auto pl-1 pr-1.5"),
                )}
              >
                <div
                  className={cn(
                    "relative aspect-square size-[16px] flex-shrink-0",
                    iconSize,
                  )}
                >
                  <Image
                    src="/icons/social/twitter.svg"
                    alt="Twitter Social Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                {!!finalData && (
                  <div className="text-xs text-fontColorPrimary">
                    {(data || finalData)?.past?.length}
                  </div>
                )}
              </Link>
            ) : (
              <Drawer open={isOpenDrawer} onOpenChange={setIsOpenDrawer}>
                <DrawerTrigger
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpenDrawer(!isOpenDrawer);
                  }}
                >
                  <div
                    className={cn(
                      "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%] md:hidden",
                      variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                      !finalData || !data
                        ? "aspect-square size-[20px]"
                        : "w-auto gap-0.5 p-1.5",
                      containerSize,
                      data || (finalData && "!w-auto pl-1 pr-1.5"),
                    )}
                  >
                    <div
                      className={cn(
                        "relative aspect-square size-[16px] flex-shrink-0",
                        iconSize,
                      )}
                    >
                      <Image
                        src="/icons/social/twitter.svg"
                        alt="Twitter Social Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    {!!finalData && (
                      <div className="text-xs text-fontColorPrimary">
                        {(data || finalData)?.past?.length}
                      </div>
                    )}
                  </div>
                </DrawerTrigger>
                <DrawerContent className="h-[87dvh] border-0 bg-[#080811] p-0">
                  <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#242436] px-4 py-2.5">
                    <DrawerTitle className="text-fontColorPrimary">
                      Twitter
                    </DrawerTitle>
                    <div
                      className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent"
                      onClick={() => setIsOpenDrawer(false)}
                    >
                      <div
                        className="relative aspect-square h-6 w-6 flex-shrink-0"
                        aria-label="Close"
                        title="Close"
                      >
                        <Image
                          src="/icons/close.png"
                          alt="Close Icon"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </DrawerHeader>
                  <div className="flex h-full flex-col justify-center">
                    <TwitterHoverPopoverContent
                      username={username}
                      data={data}
                      setFinalData={setFinalData}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </>
        )}
      </>
    );
  },
);

TwitterHoverPopover.displayName = "TwitterHoverPopover";

export default TwitterHoverPopover;
