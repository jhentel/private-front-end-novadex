"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { getProxyUrl } from "@/utils/getProxyUrl";
import { cn } from "@/libraries/utils";

interface TokenImageHoverProps {
  src: string;
  symbol: string;
  handleGoogleLensSearch?: (e: React.MouseEvent, image: string) => void;
}

const TokenImageHover = ({
  src,
  symbol,
  handleGoogleLensSearch,
}: TokenImageHoverProps) => {
  const imageSrc = useMemo(
    () => getProxyUrl(src as string, symbol?.[0] || ""),
    [src],
  );

  const showFallback = !imageSrc;

  return (
    <>
      <Image
        key={imageSrc}
        src={imageSrc as string}
        alt="token image"
        fill
        className="rounded-[8px] object-cover"
        priority
        quality={50}
      />

      {handleGoogleLensSearch && imageSrc && !showFallback && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleGoogleLensSearch(e, src || "");
          }}
          className={cn(
            "absolute bottom-[8px] right-[8px] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#000000]/70 opacity-100",
          )}
          aria-label="Search with Google Lens"
        >
          <Image
            src="/icons/token/google-lens-icon.svg"
            alt="Google Lens Icon"
            width={20}
            height={20}
          />
        </button>
      )}
    </>
  );
};

export default React.memo(TokenImageHover);
