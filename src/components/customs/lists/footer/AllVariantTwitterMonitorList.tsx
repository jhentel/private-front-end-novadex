"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import EmptyState from "@/components/customs/EmptyState";
import TwitterMonitorCard from "@/components/customs/cards/footer/TwitterMonitorCard";
import TSMonitorCard from "@/components/customs/cards/footer/TSMonitorCard";
import DiscordMonitorCard from "@/components/customs/cards/footer/DiscordMonitorCard";

import {
  TSMonitorMessageType,
  TwitterMonitorMessageType,
} from "@/types/ws-general";

import { cn } from "@/libraries/utils";

import { useTwitterMonitorMessageStore } from "@/stores/footer/use-twitter-monitor-message.store";
import { useTSMonitorMessageStore } from "@/stores/footer/use-ts-monitor-message.store";
import { FinalDiscordMessage } from "@/types/monitor";
import { useDiscordMonitorMessageStore } from "@/stores/footer/use-discord-monitor-message.store";

// Define the ref type
export interface TwitterMonitorListRef {
  scrollTo: (options: ScrollToOptions) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  getScrollInstance: () => any;
  getScrollElement: () => HTMLElement | null;
}

const NoAccountsEmptyState = () => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <EmptyState
      state="Twitter"
      size="sm"
      className="-mt-5 max-w-[520px]"
      paragraphClassname="!text-fontColorSecondary"
    />
  </div>
);

const WaitingForTweetsEmptyState = () => {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl p-8 shadow-md">
      <div className="mb-3 flex items-center justify-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{
              opacity: [0.8, 1, 0.8],
              rotate: [0, 0, 0, 0, 0, 180, 180, 180, 180, 180],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              transformOrigin: "center",
              backfaceVisibility: "hidden",
              willChange: "transform, opacity",
              transform: "translateZ(0)",
            }}
          >
            <Image
              src="/icons/wait-hourglass.svg"
              alt="Waiting"
              height={80}
              width={62}
              unoptimized
              priority
            />
          </motion.div>
        </div>
      </div>

      <h3 className="mb-1 text-lg font-medium text-white">
        Waiting for account to post
      </h3>
      <p className="text-center text-sm text-gray-500">
        Posts from the account you’re monitoring will appear here once they’re
        published.
      </p>
    </div>
  );
};

// Main component
const AllVariantTwitterMonitorList = forwardRef<
  TwitterMonitorListRef,
  {
    list:
      | TwitterMonitorMessageType[]
      | (TwitterMonitorMessageType | TSMonitorMessageType | FinalDiscordMessage)[];
    variant: "small" | "large";
    isFullscreen: boolean;
    className?: string;
    showScrollbar?: boolean;
    feedType?: "All" | "Twitter" | "Truth" | "Discord";
  }
>(
  (
    {
      list,
      variant = "small",
      isFullscreen = false,
      className,
      showScrollbar = false,
      feedType = "All",
    },
    ref,
  ) => {
    const osRef = useRef<any>(null);
    const accounts = useTwitterMonitorMessageStore((state) => state.accounts);
    const tsAccounts = useTSMonitorMessageStore((state) => state.accounts);
    const discordAccounts = useDiscordMonitorMessageStore(state=>state.accounts)

    // Expose scroll methods to parent through ref
    useImperativeHandle(ref, () => {
      // Helper function to safely access viewport
      const getViewport = () => {
        try {
          const instance = osRef.current?.osInstance();
          return instance?.elements()?.viewport || null;
        } catch (error) {
          console.warn("Error accessing viewport:", error);
          return null;
        }
      };

      return {
        scrollTo: (options: ScrollToOptions) => {
          const viewport = getViewport();
          if (viewport) {
            try {
              viewport.scrollTo(options);
            } catch (error) {
              console.warn("Error in scrollTo:", error);
            }
          }
        },

        scrollToTop: () => {
          const viewport = getViewport();
          if (viewport) {
            try {
              viewport.scrollTo({ top: 0, behavior: "smooth" });
            } catch (error) {
              console.warn("Error in scrollToTop:", error);
            }
          }
        },

        scrollToBottom: () => {
          const viewport = getViewport();
          if (viewport) {
            try {
              viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: "smooth",
              });
            } catch (error) {
              console.warn("Error in scrollToBottom:", error);
            }
          }
        },

        getScrollInstance: () => osRef.current?.osInstance(),

        getScrollElement: () => getViewport(),
      };
    });

    if (accounts?.length === 0 && tsAccounts?.length === 0 && discordAccounts?.length === 0) {
      return <NoAccountsEmptyState />;
    }

    return (
      <div className={cn("col-span-1 flex w-full flex-grow", className)}>
        {list?.length > 0 ? (
          <OverlayScrollbarsComponent
            ref={osRef}
            defer
            element="div"
            className={cn(
              "relative w-full flex-grow",
              showScrollbar
                ? "twitter__overlayscrollbar"
                : "invisible__overlayscrollbar",
            )}
          >
            <div
              className={cn(
                "absolute left-0 top-0 w-full flex-grow",
                variant === "small" && "pb-4",
              )}
            >
              <div
                className={cn(
                  "flex h-auto w-full flex-col",
                  variant === "small" ? "gap-y-2" : "gap-y-2 lg:gap-y-4",
                )}
              >
                {list
                  .slice(0, 50)
                  .map((item) =>
                    "tweet_id" in item ? (
                      <TwitterMonitorCard
                        key={item.tweet_id}
                        data={item}
                        variant={variant}
                      />
                    ) : "channel" in item ? (
                      <DiscordMonitorCard key={item.timestamp} data={item} variant={variant} />
                    ) : (
                      <TSMonitorCard
                        key={item.id}
                        data={item}
                        variant={variant}
                      />
                    ),
                  )}
              </div>
            </div>
          </OverlayScrollbarsComponent>
        ) : !isFullscreen ? (
          <WaitingForTweetsEmptyState />
        ) : null}
      </div>
    );
  },
);

AllVariantTwitterMonitorList.displayName = "AllVariantTwitterMonitorList";

export default AllVariantTwitterMonitorList;
