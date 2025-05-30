"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect } from "react";
import useTimeUpdater from "@/hooks/use-time-updater";
// ######## Components 🧩 ########
import Link from "next/link";
import Image from "next/image";
import Copy from "@/components/customs/Copy";
import QuickBuyButton from "@/components/customs/buttons/QuickBuyButton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import truncateCA from "@/utils/truncateCA";
import { getTimeInfo } from "@/utils/formatTime";
// ######## Types 🗨️ ########
import {
  MediaItem,
  ParentTweetData,
  TwitterMonitorMessageType,
} from "@/types/ws-general";

const cardMaps = {
  icon: {
    retweet: "/icons/footer/retweet.png",
    post: "/icons/footer/post.png",
    quote_retweet: "/icons/footer/quote-retweet.png",
    comment: "/icons/footer/comment.png",
  },
  bgGradient: {
    retweet: "from-[#1D9BF0]/[4%] to-[#1D9BF0]/40",
    post: "from-[#00C9B3]/[4%] to-[#00C9B3]/40",
    quote_retweet: "from-[#A77C25]/[4%] to-[#A77C25]/40",
    comment: "from-[#DF74FF]/[4%] to-[#DF74FF]/40",
  },
};

// Helper function to render text with clickable links and mentions
const renderTextWithLinks = (text: string) => {
  const urlRegex =
    /(https?:\/\/[^\s]+|www\.[^\s]+|trib\.al\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+)/g;
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;

  const parts = text.split(/(\s+)/);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <span
          key={index}
          onClick={() => window.open(href, "_blank")}
          className="text-[#DF74FF] no-underline"
        >
          {part}
        </span>
      );
    }

    if (mentionRegex.test(part)) {
      let hasColon = false;
      let username = part.replace("@", "");

      if (username.includes(":")) {
        hasColon = true;
        username = username.slice(0, username.length - 1);
      }

      return (
        <React.Fragment key={index}>
          <span
            onClick={() => window.open(`https://x.com/${username}`, "_blank")}
            className="text-primary no-underline"
          >
            @{username}
          </span>
          {hasColon && <span>:</span>}
        </React.Fragment>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

// Helper function to format monitor type text
const formatMonitorTypeText = (text: string): string => {
  return text.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

// Component for media rendering to avoid duplication
const MediaRenderer = ({
  mediaItems,
  variant = "small",
}: {
  mediaItems?: MediaItem[] | null;
  variant?: "small" | "large";
}) => {
  if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-2 flex w-full gap-[1px]")}>
      {mediaItems.map((image, index) => (
        <div
          key={index}
          style={{
            aspectRatio: `${image.sizes.large.w}/${image.sizes.large.h}`,
            width:
              image.sizes.large.w === image.sizes.large.h
                ? "100%"
                : image.sizes.large.w,
          }}
          className={cn(
            "relative cursor-pointer overflow-hidden border border-border",
            image.sizes.large.w / image.sizes.large.h < 1
              ? "max-w-[80%]"
              : "max-w-full",
            mediaItems.length === 1
              ? "rounded-xl"
              : index === 0
                ? "rounded-l-xl"
                : index === mediaItems.length - 1
                  ? "rounded-r-xl"
                  : "",
          )}
        >
          <Image
            src={image.media_url_https}
            alt="Twitter Monitor Content Image"
            fill
            quality={100}
            className={cn(
              mediaItems.length === 1 ? "object-contain" : "object-cover",
            )}
          />
        </div>
      ))}
    </div>
  );
};

// Component for nested tweets - updated for new ParentTweetData structure
const NestedTweet = ({
  data,
  variant = "small",
  nestLevel = 1,
}: {
  data: {
    profile: {
      name: string;
      username: string;
      image: string;
    };
    content: string;
    timestamp?: string | number;
    mediaItems?: MediaItem[] | null;
    parentTweet?: ParentTweetData;
  };
  variant?: "small" | "large";
  nestLevel: number;
}) => {
  const timeDisplay = useTimeUpdater(data.timestamp);

  // Limit nesting depth - Moved after hooks to prevent React Hooks error
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
              src={
                data.profile.image || "/icons/social/fallback-profile-image.png"
              }
              alt="Twitter Profile"
              fill
              quality={100}
              className="object-contain"
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
                {data.profile.name || ""}
              </h4>
            </div>

            <div className="-mt-0.5 flex items-center gap-x-1">
              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                  variant === "small" ? "text-xs" : "text-sm",
                )}
              >
                @{data.profile.username || ""}
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

      {/* Tweet content */}
      <p
        className={cn(
          "break-words text-fontColorPrimary",
          variant === "small" ? "text-xs" : "text-sm",
        )}
      >
        {data.content.split("\n").map((line, index) => (
          <React.Fragment key={`content-${index}`}>
            {renderTextWithLinks(line)}
            <br />
          </React.Fragment>
        ))}
      </p>

      {/* Media attachments */}
      {data.mediaItems && (
        <MediaRenderer mediaItems={data.mediaItems} variant={variant} />
      )}

      {/* Render parent tweet if it exists and we haven't reached max nesting depth */}
      {data.parentTweet && nestLevel < 2 && (
        <NestedTweet
          data={{
            profile: {
              name: data.parentTweet.parent_name,
              username: data.parentTweet.parent_username,
              image: data.parentTweet.parent_profile_pic,
            },
            content: data.parentTweet.parent_text,
            timestamp: data.parentTweet.parent_date,
            mediaItems: data.parentTweet.parent_media,
            parentTweet: undefined,
          }}
          variant={variant}
          nestLevel={nestLevel + 1}
        />
      )}
    </div>
  );
};

export default function TwitterMonitorCard({
  data,
  variant = "small",
}: {
  data: TwitterMonitorMessageType;
  variant?: "small" | "large";
}) {
  const cardIcon = cardMaps.icon[data.type!];
  const cardBgGradient = cardMaps.bgGradient[data.type!];

  // State for time display
  const [timeDisplay, setTimeDisplay] = useState(
    () => getTimeInfo(data.created_at).formattedTime,
  );

  // Effect for time updates with tiered approach
  useEffect(() => {
    const updateTime = () => {
      const { formattedTime, nextUpdateInterval } = getTimeInfo(
        data.created_at,
      );
      setTimeDisplay(formattedTime);

      // If we have a next update interval, schedule the next update
      if (nextUpdateInterval) {
        timeoutId = setTimeout(updateTime, nextUpdateInterval);
      }
    };

    // Initial update and timer setup
    let timeoutId = setTimeout(updateTime, 1000);

    // Cleanup on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [data.created_at]);

  // Effect for retweet time updates
  useEffect(() => {
    if (!data.content?.retweet_data?.original_tweet_date) return;

    const updateRetweetTime = () => {
      const timestamp = data.content.retweet_data.original_tweet_date;
      const { nextUpdateInterval } = getTimeInfo(timestamp);

      if (nextUpdateInterval) {
        retweetTimeoutId = setTimeout(updateRetweetTime, nextUpdateInterval);
      }
    };

    let retweetTimeoutId = setTimeout(updateRetweetTime, 1000);

    return () => {
      if (retweetTimeoutId) clearTimeout(retweetTimeoutId);
    };
  }, [data.content?.retweet_data?.original_tweet_date]);

  return (
    <Link
      href={data.tweet_link}
      target="_blank"
      className="flex w-full flex-col overflow-hidden rounded-[8px] border border-border bg-white/[4%]"
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
              alt={`${formatMonitorTypeText(data.type || "")} Icon`}
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
            {formatMonitorTypeText(data.type || "")}
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
                src={data.profile?.image || ""}
                alt="Twitter Monitor Token Image"
                fill
                quality={100}
                className="object-contain"
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
                  {data.profile?.name || ""}
                </h4>
                {data.mint && <Copy value={data.mint || ""} />}
              </div>

              <div className="-mt-0.5 flex items-center gap-x-1">
                <span
                  className={cn(
                    "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary",
                    variant === "small" ? "text-xs" : "text-sm",
                  )}
                >
                  {data.profile?.username || ""}
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
                      {truncateCA(data.mint || "CA", 10)}
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
                mintAddress={data.mint || ""}
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
              <p
                className={cn(
                  "break-words text-fontColorPrimary",
                  variant === "small" ? "text-xs" : "text-sm",
                )}
              >
                {data.content?.fulltext.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {renderTextWithLinks(line)}
                    <br />
                  </React.Fragment>
                ))}
              </p>

              {/* Show images for post type */}
              <MediaRenderer
                mediaItems={data.content?.image?.url}
                variant={variant}
              />
            </>
          )}

          {/* Comment Content */}
          {data.type === "comment" && (
            <>
              {/* Main comment text */}
              <p
                className={cn(
                  "break-words text-fontColorPrimary",
                  variant === "small" ? "text-xs" : "text-sm",
                )}
              >
                {data.content?.fulltext.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {renderTextWithLinks(line)}
                    <br />
                  </React.Fragment>
                ))}
              </p>

              {/* Show images for the comment if any */}
              <MediaRenderer
                mediaItems={data.content?.image?.url}
                variant={variant}
              />

              {/* Show the tweet being replied to in a nested card */}
              {data.content?.comment_data?.replied_to && (
                <NestedTweet
                  data={{
                    profile: {
                      name: data.content.comment_data.replied_to_name,
                      username: data.content.comment_data.replied_to,
                      image: data.content.comment_data.replied_to_profile_pic,
                    },
                    content: data.content.comment_data.comment_text,
                    timestamp: data.content.comment_data.replied_to_date,
                    mediaItems: data.content.comment_data.replied_to_media,
                    parentTweet: data.content.comment_data.parent_tweet,
                  }}
                  variant={variant}
                  nestLevel={1}
                />
              )}
            </>
          )}

          {/* Retweet and Quote Retweet Content */}
          {(data.type === "retweet" || data.type === "quote_retweet") && (
            <>
              {/* For quote retweets, display the quoting text */}
              {data.type === "quote_retweet" && (
                <p
                  className={cn(
                    "break-words text-fontColorPrimary",
                    variant === "small" ? "text-xs" : "text-sm",
                  )}
                >
                  {data.content?.fulltext.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {renderTextWithLinks(line)}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              )}

              {/* Original tweet in a nested card for both retweet and quote_retweet */}
              {data.content?.retweet_data && (
                <NestedTweet
                  data={{
                    profile: {
                      name: data.content.retweet_data
                        .original_tweet_account_name,
                      username:
                        data.content.retweet_data.original_tweet_account,
                      image:
                        data.content.retweet_data.original_tweet_profile_pic,
                    },
                    content: data.content.retweet_data.original_tweet_text,
                    timestamp: data.content.retweet_data.original_tweet_date,
                    mediaItems: data.content.retweet_data.original_tweet_media,
                    parentTweet: data.content.retweet_data.parent_tweet,
                  }}
                  variant={variant}
                  nestLevel={1}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
