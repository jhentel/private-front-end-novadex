import { cn } from "@/libraries/utils";
import Image from "next/image";
import React from "react";
import { CachedImage } from "./CachedImage";

const SortButton = ({
  type = "usdc-or-sol",
  value,
  setValue,
}: {
  type?: "usdc-or-sol";
  value: string;
  setValue: (value: "USDC" | "SOL") => void;
}) => {
  return (
    <>
      <div className="flex h-[20px] w-auto items-center justify-center rounded-[10px] bg-secondary p-[3px]">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setValue("USDC");
          }}
          className={cn(
            "flex size-[16px] cursor-pointer items-center justify-center rounded-full p-1 duration-300",
            value === "USDC" && "bg-white/10 text-fontColorPrimary",
          )}
        >
          <div className="relative flex aspect-square size-[12px] flex-shrink-0 items-center justify-center">
            <Image
              src={
                value === "USDC" ? "/icons/usdc.svg" : "/icons/usdc-gray.svg"
              }
              alt="USDC Icon"
              fill
              quality={100}
            />
          </div>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setValue("SOL");
          }}
          className={cn(
            "flex size-[16px] cursor-pointer items-center justify-center rounded-full p-1 duration-300",
            value === "SOL" && "bg-white/10 text-fontColorPrimary",
          )}
        >
          <div className="relative flex aspect-square size-[12px] flex-shrink-0 items-center justify-center">
            <CachedImage
              src="/icons/solana-sq.svg"
              alt="Solana Icon"
              fill
              quality={100}
            />
          </div>
        </button>
      </div>
    </>
  );
};

export default SortButton;

export const SortCoinButton = ({
  value,
  setValue,
  tokenImage,
}: {
  value: string;
  setValue: (value: "COIN" | "SOL") => void;
  tokenImage?: string;
}) => {
  return (
    <>
      <div className="flex h-[20px] w-auto items-center justify-center rounded-[10px] bg-secondary p-[3px]">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setValue("COIN");
          }}
          className={cn(
            "flex size-[16px] cursor-pointer items-center justify-center rounded-full p-1 duration-300",
            value === "USDC" && "bg-white/10 text-fontColorPrimary",
          )}
        >
          <div
            className={cn(
              "relative flex aspect-square size-[12px] flex-shrink-0 items-center justify-center",
              value !== "COIN" && "grayscale",
            )}
          >
            <Image
              // src={"/icons/footer/coins.svg"}
              src={
                tokenImage
                  ? tokenImage
                  : value === "COIN"
                    ? "/icons/usdc.svg"
                    : "/icons/usdc-gray.svg"
              }
              alt="Coin Symbol"
              fill
              quality={100}
              className={cn("rounded-full")}
            />
          </div>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setValue("SOL");
          }}
          className={cn(
            "flex size-[16px] cursor-pointer items-center justify-center rounded-full p-1 duration-300",
            value === "SOL" && "bg-white/10 text-fontColorPrimary",
          )}
        >
          <div className="relative flex aspect-square size-[12px] flex-shrink-0 items-center justify-center">
            <CachedImage
              src="/icons/solana-sq.svg"
              alt="Solana Icon"
              fill
              quality={100}
            />
          </div>
        </button>
      </div>
    </>
  );
};
