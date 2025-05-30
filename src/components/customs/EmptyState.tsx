"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/libraries/utils";
import BaseButton from "./buttons/BaseButton";
import { WindowSize } from "@/stores/use-popup-state";

type EmptyStateProps = {
  state:
    | "Cosmo Empty"
    | "Cosmo No Result"
    | "Cosmo No Result With Hidden"
    | "No Result"
    | "404"
    | "500"
    | "Sniper"
    | "Wallet"
    | "Archived Wallet"
    | "Twitter"
    | "Alerts"
    | "Holding"
    | "Referral";
  className?: string;
  passedTryAgainFunction?: () => void;
  size?: "sm" | "md";
  paragraphClassname?: string;
  windowSize?: WindowSize;
};

export default function EmptyState({
  state,
  className,
  passedTryAgainFunction,
  size,
  paragraphClassname,
  windowSize,
}: Readonly<EmptyStateProps>) {
  const handleTryAgain = () => {
    if (passedTryAgainFunction !== undefined) {
      passedTryAgainFunction();
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {state === "Cosmo Empty" && (
        <div
          className={cn(
            "flex w-full max-w-[320px] flex-col items-center gap-y-4",
            className,
          )}
        >
          <div className="relative aspect-[160/160] h-auto w-full max-w-[120px] flex-shrink-0">
            <Image
              src="/images/page-states/no_result.svg"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-1.5 text-center">
            <h2 className="font-geistSemiBold text-[20px] text-fontColorPrimary">
              Oops, There&apos;s <br /> No Token At The Moment
            </h2>
            <p className={cn("text-xs text-[#737384]", paragraphClassname)}>
              {
                "It seems there are no tokens available at the moment. Please try again later."
              }
            </p>
          </div>
        </div>
      )}
      {state === "Cosmo No Result With Hidden" && (
        <div
          className={cn(
            "flex w-full max-w-[320px] flex-col items-center gap-y-4",
            className,
          )}
        >
          <div className="relative aspect-[160/160] h-auto w-full max-w-[120px] flex-shrink-0">
            <Image
              src="/images/page-states/no_result.svg"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-1.5 text-center">
            <h2 className="font-geistSemiBold text-[20px] text-fontColorPrimary">
              Oops! No Coins Yet!
            </h2>
            <p className={cn("text-xs text-[#737384]", paragraphClassname)}>
              {
                "Show hidden tokens is enabled. There’s no coin data to display right now."
              }
            </p>
          </div>
        </div>
      )}
      {state === "Cosmo No Result" && (
        <div
          className={cn(
            "flex w-full max-w-[320px] flex-col items-center gap-y-4",
            className,
          )}
        >
          <div className="relative aspect-[160/160] h-auto w-full max-w-[120px] flex-shrink-0">
            <Image
              src="/images/page-states/no_result.svg"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-1.5 text-center">
            <h2 className="font-geistSemiBold text-[20px] text-fontColorPrimary">
              Oops! No Coins Yet!
            </h2>
            <p className={cn("text-xs text-[#737384]", paragraphClassname)}>
              {"There’s no coin data to display right now."}
            </p>
          </div>
        </div>
      )}
      {state === "No Result" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
            className,
          )}
        >
          <div
            className={cn(
              "relative aspect-[160/160] h-auto w-full max-w-[160px] flex-shrink-0",
              windowSize && windowSize.height <= 450 && "hidden",
            )}
          >
            <Image
              src="/images/page-states/no_result.svg"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-2 text-center">
            <h2 className="font-geistSemiBold text-[24px] text-fontColorPrimary">
              Oops, We Couldn&apos;t Find That
            </h2>
            <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
              {
                "It seems we don’t have what you’re looking for. Check your spelling or explore related categories."
              }
            </p>
          </div>
        </div>
      )}
      {state === "Referral" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
            className,
          )}
        >
          <div className="relative aspect-[160/160] h-auto w-full max-w-[160px] flex-shrink-0">
            <Image
              src="/images/page-states/no_result.svg"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-2 text-center">
            <h2 className="font-geistSemiBold text-[24px] text-fontColorPrimary">
              No referrals yet!
            </h2>
            <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
              Invite a friend to begin tracking.
            </p>
          </div>
        </div>
      )}
      {state === "Wallet" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
            size == "sm" && "gap-y-6",
            className,
          )}
        >
          <div
            className={cn(
              "relative aspect-[160/160] h-auto w-full max-w-[160px] flex-shrink-0",
              size == "sm" && "max-w-[120px]",
              windowSize && windowSize.height <= 450 && "hidden",
            )}
          >
            <Image
              src="/images/page-states/wallet.svg"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-2 text-center">
            <h2
              className={cn(
                "font-geistSemiBold text-[24px] text-fontColorPrimary",
                size == "sm" && "md:text-[18px]",
              )}
            >
              No Wallets Found!
            </h2>
            <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
              It looks like you don&apos;t have any wallets set up yet. To start
              managing your crypto assets, create a new wallet or import an
              existing one.
            </p>
          </div>
        </div>
      )}
      {state === "Archived Wallet" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
            size == "sm" && "gap-y-6",
            className,
          )}
        >
          <div
            className={cn(
              "relative aspect-[160/160] h-auto w-full max-w-[160px] flex-shrink-0",
              size == "sm" && "max-w-[120px]",
            )}
          >
            <Image
              src="/images/page-states/wallet.svg"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-2 text-center">
            <h2
              className={cn(
                "font-geistSemiBold text-[24px] text-fontColorPrimary",
                size == "sm" && "md:text-[18px]",
              )}
            >
              No Archived Wallets Yet
            </h2>
            <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
              To archive a wallet, go to the &quot;My Wallets&quot; tab and
              select a wallet to archive.
            </p>
          </div>
        </div>
      )}
      {state === "Twitter" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
            size == "sm" && "gap-y-6",
            className,
          )}
        >
          <div className="relative">
            <Image
              src="/icons/empty-monitor.svg"
              alt="Empty Feed"
              height={120}
              width={153}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-2 text-center">
            <h2
              className={cn(
                "font-geistSemiBold text-[18px] text-fontColorPrimary md:text-[24px]",
                size == "sm" && "md:text-[18px]",
              )}
            >
              No accounts currently monitored
            </h2>
            <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
              Please add to continue.
            </p>
          </div>
        </div>
      )}
      {state === "Sniper" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
            className,
          )}
        >
          <div className="relative aspect-[160/160] h-auto w-full max-w-[160px] flex-shrink-0">
            <Image
              src="/images/page-states/sniper.png"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-2 text-center">
            <h2 className="font-geistSemiBold text-[18px] text-fontColorPrimary md:text-[24px]">
              No Sniper Tasks made
            </h2>
            <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
              It looks like you don&apos;t have any sniper tasks running. Add a
              sniper task to get started.
            </p>
          </div>
        </div>
      )}
      {state === "Alerts" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-grow flex-col items-center gap-y-8",
            className,
          )}
        >
          <div className="relative aspect-[160/160] h-auto w-full max-w-[160px] flex-shrink-0">
            <Image
              src="/images/page-states/alerts.png"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-2 text-center">
            <h2 className="font-geistSemiBold text-[18px] text-fontColorPrimary md:text-[24px]">
              No Alerts Available
            </h2>
            <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
              You currently have no alerts. Start by making a few trades to
              receive alerts.
            </p>
          </div>
        </div>
      )}
      {state === "Holding" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
            className,
          )}
        >
          <div className="relative aspect-[160/160] h-auto w-full max-w-[160px] flex-shrink-0">
            <Image
              src="/images/page-states/no_result.svg"
              alt="No Result Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-2 text-center">
            <h2 className="font-geistSemiBold text-[18px] text-fontColorPrimary md:text-[24px]">
              Oops, No Holdings Found!
            </h2>
            <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
              Try purchasing a token and coming back!
            </p>
          </div>
        </div>
      )}
      {state === "404" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
            className,
          )}
        >
          <div className="flex w-full flex-col items-center gap-y-8">
            <div className="relative aspect-[160/160] h-auto w-full max-w-[160px] flex-shrink-0">
              <Image
                src="/images/page-states/404.png"
                alt="404 Image"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-y-2 text-center">
              <h2 className="font-geistSemiBold text-[24px] text-fontColorPrimary">
                Oops, Page Not Found!
              </h2>
              <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
                {
                  "We couldn’t find the page you were looking for. Try checking the URL or head back to the homepage."
                }
              </p>
            </div>
          </div>
          <Link
            href="/"
            prefetch
            className="relative flex h-[40px] flex-shrink-0 items-center justify-center rounded-[8px] bg-primary px-6 duration-300 hover:bg-primary-hover"
          >
            <span className="inline-block font-geistSemiBold text-base text-[#080811]">
              Go to Homepage
            </span>
          </Link>
        </div>
      )}
      {state === "500" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
            className,
          )}
        >
          <div className="flex w-full flex-col items-center gap-y-8">
            <div className="relative aspect-[160/160] h-auto w-full max-w-[160px] flex-shrink-0">
              <Image
                src="/images/page-states/500.png"
                alt="500 Image"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-y-2 text-center">
              <h2 className="font-geistSemiBold text-[24px] text-fontColorPrimary">
                Something Went Wrong.
              </h2>
              <p className={cn("text-sm text-[#737384]", paragraphClassname)}>
                {
                  "We encountered an error while processing your request. Please try again later."
                }
              </p>
            </div>
          </div>
          <BaseButton
            onClick={handleTryAgain}
            variant="primary"
            className="h-[40px] px-6"
          >
            <span className="inline-block font-geistSemiBold text-base text-[#080811]">
              Try again
            </span>
          </BaseButton>
        </div>
      )}
    </>
  );
}
