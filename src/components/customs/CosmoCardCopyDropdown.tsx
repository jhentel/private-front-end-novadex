"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { useCopyAddress } from "@/stores/use-copy-address";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import CustomToast from "./toasts/CustomToast";
import toast from "react-hot-toast";
import { CosmoDataMessageType } from "@/types/ws-general";
import Image from "next/image";
import { useCopyDropdownState } from "@/stores/cosmo/card-state/use-copy-dropdown-state.store";

const CosmoCardCopyDropdown = ({ data }: { data: CosmoDataMessageType }) => {
  const setDetailCopied = useCopyAddress((state) => state.setDetailCopied);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setDropdownOpen = useCopyDropdownState(
    (state) => state.setDropdownOpen,
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(
    async (text: string | undefined | null, type: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!text) {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={`${type} is not available`}
            state="ERROR"
          />
        ));
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (data.mint && data.name && data.symbol) {
          setDetailCopied({
            mint: data.mint,
            name: data.name,
            symbol: data.symbol,
            image: data.image,
          });
        }
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={`Successfully copied ${type}`}
            state="SUCCESS"
          />
        ));
        timeoutRef.current = setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.warn(`Failed to copy ${type}:`, err);
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={`Failed to copy ${type}`}
            state="ERROR"
          />
        ));
      }
    },
    [data, setDetailCopied],
  );

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        setDropdownOpen(open);
      }}
    >
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button
          title={copied ? "Copied!" : "Copy options"}
          className="relative aspect-square h-4 w-4 flex-shrink-0 duration-300 hover:brightness-200 focus:outline-none md:size-[18px]"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {copied ? (
            <Image
              src="/icons/pink-check.png"
              alt="Copied"
              height={18}
              width={18}
              quality={100}
              className="size-full object-contain"
            />
          ) : (
            <Image
              src="/icons/copy-secondary.svg"
              alt="Copy Options"
              height={18}
              width={18}
              quality={100}
              className="size-full object-contain"
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => e.stopPropagation()}
        sideOffset={5}
        className="border-none bg-shadeTable text-white shadow-lg"
      >
        <DropdownMenuItem
          onSelect={() => handleCopy(data?.mint, "CA")}
          className="text-white focus:bg-shadeTableHover focus:text-white cursor-pointer"
        >
          Copy CA
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => handleCopy(data?.name, "Name")}
          className="text-white focus:bg-shadeTableHover focus:text-white cursor-pointer"
        >
          Copy Name
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => handleCopy(data?.symbol, "Ticker")}
          className="text-white focus:bg-shadeTableHover focus:text-white cursor-pointer"
        >
          Copy Ticker
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CosmoCardCopyDropdown;
