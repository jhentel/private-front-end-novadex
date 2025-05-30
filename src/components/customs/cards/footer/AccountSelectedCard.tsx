"use client";

// ######## Components 🧩 ########
import Link from "next/link";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TwitterAccount } from "@/apis/rest/twitter-monitor";
import { DiscordChannel } from "@/types/monitor";

export type AccountSelectedCardProps = {
  account: TwitterAccount | DiscordChannel;
  handleDeleteTwitterAccount: (
    removedAccount: TwitterAccount | DiscordChannel,
  ) => void;
  type: "twitter" | "truthSocial" | "discord";
};

export default function AccountSelectedCard({
  account,
  handleDeleteTwitterAccount,
  type,
}: AccountSelectedCardProps) {
  const redirectUrl =
    type === "discord"
      ? `#`
      : type === "twitter"
        ? `https://x.com/${(account as TwitterAccount).username}`
        : `https://truthsocial.com/${(account as TwitterAccount).username}`;

  return (
    <div className="flex h-[56px] w-full items-center justify-between gap-x-3 overflow-hidden border-b border-border px-3 py-[10px] last-of-type:border-transparent">
      {type === "discord" ? (
        <div className="relative aspect-square h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
          <Image
            src={(account as DiscordChannel).image}
            alt="Token Image"
            fill
            quality={100}
            className="object-contain"
            unoptimized
          />
        </div>
      ) : (
        <Link
          href={redirectUrl}
          target="_blank"
          className="relative aspect-square h-8 w-8 flex-shrink-0 overflow-hidden rounded-full"
        >
          <Image
            src={(account as TwitterAccount).profilePicture}
            alt="Token Image"
            fill
            quality={100}
            className="object-contain"
            unoptimized
          />
        </Link>
      )}

      <div className="flex h-[32px] w-full flex-col justify-center">
        <div className="-mt-0.5 flex flex-col justify-center gap-y-0">
          <div className="flex items-center gap-x-1">
            {type === "discord" ? (
              <div className="text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {(account as DiscordChannel).name}
              </div>
            ) : (
              <Link
                href={redirectUrl}
                target="_blank"
                className="text-nowrap font-geistSemiBold text-sm text-fontColorPrimary"
              >
                {(account as TwitterAccount).name}
              </Link>
            )}
            {"type" in account &&
              account.type === "suggested" &&
              type !== "discord" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative inline-block size-3 flex-shrink-0">
                        <Image
                          src={`/icons/social/suggested-badge${type === "truthSocial" ? "-red" : ""}.svg`}
                          alt="Star Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      className="z-[9999] bg-[#202037] px-2 py-1 font-geistRegular text-xs font-normal"
                      style={
                        {
                          "--tooltip-arrow-color": "#202037",
                          boxShadow: "0px 4px 16px 0px rgba(0, 0, 0, 1)",
                        } as React.CSSProperties
                      }
                    >
                      <p>Suggested</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
          </div>
          {type !== "discord" && (
            <Link
              href={redirectUrl}
              target="_blank"
              className="text-nowrap font-geistLight text-xs text-foreground"
            >
              {`@${(account as TwitterAccount).username}`}
            </Link>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleDeleteTwitterAccount(account)}
        className="relative flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center gap-x-1 overflow-hidden rounded-[8px] bg-white/[8%] duration-300 hover:bg-white/[12%]"
      >
        <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
          <Image
            src="/icons/footer/delete.png"
            alt="Delete Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      </button>
    </div>
  );
}
