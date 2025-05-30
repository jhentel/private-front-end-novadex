"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import Copy from "@/components/customs/Copy";
import QuickBuyButton from "@/components/customs/buttons/QuickBuyButton";

import useTimeUpdater from "@/hooks/use-time-updater";

import { TSMonitorMessageType } from "@/types/ws-general";

import { cn } from "@/libraries/utils";
import truncateCA from "@/utils/truncateCA";
import sanitizeHtml from "@/utils/sanitizeHtml";

const cardMaps = {
  icon: {
    retweet: "/icons/footer/retweet.png",
    post: "/icons/footer/post-truth.png",
    quote: "/icons/footer/quote-retweet.png",
    comment: "/icons/footer/comment.png",
  },
  bgGradient: {
    retweet: "from-[#1D9BF0]/[4%] to-[#1D9BF0]/40",
    post: "from-[#FF477566]/[4%] to-[#FF477566]/40",
    quote: "from-[#A77C25]/[4%] to-[#A77C25]/40",
    comment: "from-[#DF74FF]/[4%] to-[#DF74FF]/40",
  },
};

// Helper function to format monitor type text
const formatMonitorTypeText = (text: string): string => {
  if (text === "post") {
    return "Truth Post";
  } else if (text === "retweet") {
    return "Re-Truth";
  }
  return text.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

// Component for media rendering to avoid duplication
const MediaRenderer = ({
  mediaItems,
  accountName = "user",
}: {
  mediaItems?:
    | {
        url: string;
        type: "image" | "video";
        width: number;
        height: number;
      }[]
    | null;
  accountName?: string;
}) => {
  if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex w-full flex-wrap gap-[1px]">
      {mediaItems.map((media, index) => {
        // Set default values if width or height is 0
        const width = media.width || 320;
        const height = media.height || 180;
        const isPortrait = width / height < 1;
        const isFirstItem = index === 0;
        const isLastItem = index === mediaItems.length - 1;
        const isSingle = mediaItems.length === 1;

        return (
          <div
            key={index}
            style={{
              aspectRatio: `${width}/${height}`,
              width: "100%", // Fill parent width
            }}
            className={cn(
              "relative cursor-pointer overflow-hidden border border-border",
              isPortrait ? "max-w-[80%]" : "max-w-full",
              isSingle
                ? "rounded-xl"
                : isFirstItem
                  ? "rounded-l-xl"
                  : isLastItem
                    ? "rounded-r-xl"
                    : "",
            )}
          >
            {media.type === "video" ? (
              <div className="relative h-full w-full">
                <video
                  src={media.url}
                  controls
                  preload="metadata"
                  className={cn(
                    "absolute inset-0 h-full w-full",
                    isSingle ? "object-contain" : "object-cover",
                  )}
                />
              </div>
            ) : (
              <Image
                src={media.url}
                alt={`Media content ${index + 1} from ${accountName}`}
                fill
                quality={100}
                className={cn(isSingle ? "object-contain" : "object-cover")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Component for nested tweets
const NestedTruth = ({
  data,
  variant = "small",
  nestLevel = 1,
}: {
  data: {
    account: {
      id: string;
      username: string;
      display_name: string;
      verified: boolean;
      avatar: string;
    };
    content: string;
    timestamp?: string | number;
    mediaItems?:
      | {
          url: string;
          type: "image" | "video";
          width: number;
          height: number;
        }[]
      | null;
    parentId?: string;
  };
  variant?: "small" | "large";
  nestLevel: number;
}) => {
  const timeDisplay = useTimeUpdater(data.timestamp);

  // Limit nesting depth
  if (nestLevel > 2) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-border/40 bg-white/[2%] p-3",
        nestLevel > 1 ? "mt-2" : "mt-3",
      )}
    >
      <div className="mb-2 flex items-center gap-x-2">
        {/* Tweet author info */}
        <div className="flex items-center gap-x-2">
          <div
            className={cn(
              "relative aspect-square flex-shrink-0 overflow-hidden rounded-full",
              variant === "small" ? "h-8 w-8" : "h-[42px] w-[42px]",
            )}
          >
            <Image
              src={data.account.avatar || ""}
              alt={`${data.account.display_name}'s Profile Picture`}
              fill
              quality={100}
              className="object-contain"
              unoptimized
            />
          </div>
          <div
            className={cn(
              "flex flex-col",
              variant === "small" ? "gap-y-1" : "gap-y-[3px]",
            )}
          >
            <div className="flex items-center gap-x-1">
              <h4
                className={cn(
                  "text-nowrap font-geistSemiBold text-fontColorPrimary",
                  variant === "small" ? "text-xs" : "text-base",
                )}
              >
                {data.account.display_name || ""}
              </h4>
            </div>

            <div className="-mt-0.5 flex items-center gap-x-1">
              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                  variant === "small" ? "text-xs" : "text-sm",
                )}
              >
                @{data.account.username || ""}
              </span>
              {timeDisplay && (
                <>
                  <span
                    className={cn(
                      "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                      variant === "small" ? "text-xs" : "text-sm",
                    )}
                  >
                    ·
                  </span>
                  <span
                    className={cn(
                      "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                      variant === "small" ? "text-xs" : "text-sm",
                    )}
                  >
                    {timeDisplay}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post content */}
      <div
        className="text-white"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(data?.content || ""),
        }}
      />

      {/* Media attachments */}
      {data?.mediaItems && data.mediaItems.length > 0 ? (
        <MediaRenderer
          mediaItems={data.mediaItems}
          accountName={data.account.display_name}
        />
      ) : null}
    </div>
  );
};

export default function TSMonitorCard({
  data,
  variant = "small",
}: {
  data: TSMonitorMessageType;
  variant?: "small" | "large";
}) {
  // Memoize values that don't change
  const cardIcon = useMemo(() => cardMaps.icon[data.type!], [data.type]);
  const cardBgGradient = useMemo(() => cardMaps.bgGradient[data.type!], [data.type]);
  const formattedTypeText = useMemo(() => formatMonitorTypeText(data.type || ""), [data.type]);

  // Use custom hook for time updates
  const timeDisplay = useTimeUpdater(data.created_at);

  return (
    <div
      onClick={() => {
        if (data.url) {
          window.open(data.url, "_blank");
        }
      }}
      className="flex w-full cursor-pointer flex-col overflow-hidden rounded-[8px] border border-border bg-white/[4%]"
    >
      <div
        className={cn(
          "relative flex w-full items-center rounded-t-[8px] bg-[#12121a]",
          variant === "small" ? "h-7 px-3" : "h-9 px-4",
        )}
      >
        {/* Card Decoration*/}
        <div
          className={cn(
            "absolute left-0 top-0 z-10 h-full w-full bg-gradient-to-b",
            cardBgGradient,
          )}
        ></div>
        <div
          className={cn(
            "absolute left-0 top-0 z-20 aspect-[780/144] flex-shrink-0 mix-blend-overlay",
            variant === "small" ? "h-7" : "h-9",
          )}
        >
          <Image
            src="/images/decorations/twitter-monitor-card-decoration.png"
            alt="Card Decoration"
            fill
            quality={100}
            className="object-contain"
          />
        </div>

        <div className="relative z-20 flex items-center gap-x-2">
          <div
            className={cn(
              "relative aspect-square flex-shrink-0",
              variant === "small" ? "h-4 w-4" : "h-5 w-5",
            )}
          >
            <Image
              src={cardIcon}
              alt={`${formattedTypeText} Icon`}
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <span
            className={cn(
              "inline-block text-nowrap font-geistSemiBold text-fontColorPrimary",
              variant === "small" ? "text-xs" : "text-base",
            )}
          >
            {formattedTypeText}
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col">
        <div
          className={cn(
            "flex w-full items-center justify-between",
            variant === "small" ? "px-3 pt-3" : "px-4 pt-4",
          )}
        >
          {/* Token Info */}
          <div className="flex items-center gap-x-2">
            <div
              className={cn(
                "relative aspect-square flex-shrink-0 overflow-hidden rounded-full",
                variant === "small" ? "h-8 w-8" : "h-[42px] w-[42px]",
              )}
            >
              <Image
                src={data?.account?.avatar || ""}
                alt={`${data.account?.display_name || "Account"} Profile Picture`}
                fill
                quality={100}
                className="object-contain"
                unoptimized
              />
            </div>
            <div
              className={cn(
                "flex flex-col",
                variant === "small" ? "gap-y-1" : "gap-y-[3px]",
              )}
            >
              <div className="flex items-center gap-x-1">
                <h4
                  className={cn(
                    "text-nowrap font-geistSemiBold text-fontColorPrimary",
                    variant === "small" ? "text-xs" : "text-base",
                  )}
                >
                  {data.account?.display_name || ""}
                </h4>
                {data.mint && <Copy value={data.mint} />}
              </div>

              <div className="-mt-0.5 flex items-center gap-x-1">
                <span
                  className={cn(
                    "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                    variant === "small" ? "text-xs" : "text-sm",
                  )}
                >
                  {data.account?.username || ""}
                </span>
                <span
                  className={cn(
                    "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                    variant === "small" ? "text-xs" : "text-sm",
                  )}
                >
                  ·
                </span>
                {data.mint && (
                  <>
                    <span
                      className={cn(
                        "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                        variant === "small" ? "text-xs" : "text-sm",
                      )}
                    >
                      {truncateCA(data.mint, 10)}
                    </span>
                    <span
                      className={cn(
                        "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                        variant === "small" ? "text-xs" : "text-sm",
                      )}
                    >
                      ·
                    </span>
                  </>
                )}
                <span
                  className={cn(
                    "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                    variant === "small" ? "text-xs" : "text-sm",
                  )}
                >
                  {timeDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex w-fit items-center gap-x-2">
            {data.mint && (
              <QuickBuyButton
                variant={
                  variant === "small"
                    ? "twitter-monitor-small"
                    : "twitter-monitor-large"
                }
                mintAddress={data.mint}
              />
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex w-full flex-col gap-y-2",
            variant === "small" ? "px-3 pb-3 pt-3" : "px-4 pb-4 pt-5",
          )}
        >
          {/* For posts, display content directly */}
          {data.type === "post" && (
            <>
              <div
                className="text-white"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(data?.content || ""),
                }}
              />

              {/* Show images for post type */}
              <MediaRenderer
                mediaItems={data.media_attachments}
                accountName={data.account?.display_name || "user"}
              />
            </>
          )}

          {/* Comment Content */}
          {data.type === "comment" && (
            <>
              {/* Main comment text */}
              <div
                className="text-white"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(data?.content || ""),
                }}
              />

              {/* Show images for the comment if any */}
              <MediaRenderer
                mediaItems={data.media_attachments}
                accountName={data.account?.display_name || "user"}
              />

              {data?.in_reply_to && (
                <NestedTruth
                  data={{
                    account: {
                      id: data.in_reply_to.account.id,
                      username: data.in_reply_to.account.username,
                      display_name: data.in_reply_to.account.display_name,
                      verified: data.in_reply_to.account.verified,
                      avatar: data.in_reply_to.account.avatar,
                    },
                    content: data.in_reply_to.content,
                    timestamp: data.created_at,
                    mediaItems: data.media_attachments,
                    parentId: data.id,
                  }}
                  variant={variant}
                  nestLevel={1}
                />
              )}
            </>
          )}

          {/* Retweet and Quote Retweet Content */}
          {(data.type === "retweet" || data.type === "quote") && (
            <>
              {/* For quote retweets, display the quoting text */}
              {data.type === "quote" && (
                <div
                  className="text-white"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(data?.content || ""),
                  }}
                />
              )}

              <MediaRenderer
                mediaItems={data.media_attachments}
                accountName={data.account?.display_name || "user"}
              />

              {/* Original tweet in a nested card for both retweet and quote_retweet */}
              {data?.quote && (
                <NestedTruth
                  data={{
                    account: {
                      id: data.quote.account.id,
                      username: data.quote.account.username,
                      display_name: data.quote.account.display_name,
                      verified: data.quote.account.verified,
                      avatar: data.quote.account.avatar,
                    },
                    content: data.quote.content,
                    timestamp: data.created_at,
                    mediaItems: data.media_attachments,
                    parentId: data.id,
                  }}
                  variant={variant}
                  nestLevel={1}
                />
              )}

              {data?.reblog && (
                <NestedTruth
                  data={{
                    account: {
                      id: data.reblog.account.id,
                      username: data.reblog.account.username,
                      display_name: data.reblog.account.display_name,
                      verified: data.reblog.account.verified,
                      avatar: data.reblog.account.avatar,
                    },
                    content: data.reblog.content,
                    timestamp: data.created_at,
                    mediaItems: data.media_attachments,
                    parentId: data.id,
                  }}
                  variant={variant}
                  nestLevel={1}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
