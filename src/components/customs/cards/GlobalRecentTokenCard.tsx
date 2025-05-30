"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
// ######## Components 🧩 ########
import AvatarWithBadges, {
  BadgeType,
} from "@/components/customs/AvatarWithBadges";
// ######## Utils & Helpers 🤝 ########
import { truncateString } from "@/utils/truncateString";
import {
  RecentToken,
  useRecentSearchTokensStore,
} from "@/stores/use-recent-search-tokens";
import { DEX } from "@/types/ws-general";

export type GlobalRecentTokenCardProps = {
  symbol: string;
  mint: string;
  image: string;
  dex: DEX;
  setOpenDialog: (value: boolean) => void;
};

const GlobalRecentTokenCard = React.memo(function GlobalRecentTokenCard({
  dex,
  image,
  mint,
  symbol,
  setOpenDialog,
}: GlobalRecentTokenCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { recentTokens, setRecentSearchTokens } = useRecentSearchTokensStore();

  const tokenUrl = useMemo(() => {
    if (!mint) return "#";

    const params = new URLSearchParams({
      symbol: symbol || "",
      image: image || "",
      dex: dex || "",
    });

    return `/token/${mint}?${params.toString()}`;
  }, [symbol, name, image, dex]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (setOpenDialog) {
      setOpenDialog(false);
    }
    const token = { dex, image, mint, symbol } as RecentToken;
    const updatedTokens = recentTokens.filter(
      (existingToken) => existingToken.mint !== token.mint,
    );
    setRecentSearchTokens([token, ...updatedTokens]);

    router.push(tokenUrl);
  };

  return (
    <div className="flex w-fit items-center gap-x-2">
      <div className="flex w-fit items-center gap-x-2">
        <div className="" onClick={handleClick}>
          <AvatarWithBadges
            src={image || ""}
            alt="Token Image"
            rightType={
              dex
                ?.replace(/\./g, "")
                ?.replace(/ /g, "_")
                ?.toLowerCase() as BadgeType
            }
            size="xs"
            rightClassName="size-[12px] -right-[2px] -bottom-[2.5px]"
          />
        </div>

        <h4
          onClick={handleClick}
          className="line-clamp-1 block cursor-pointer text-nowrap font-geistSemiBold text-xs text-fontColorPrimary"
        >
          {truncateString(symbol || "", 5)}
        </h4>
      </div>
    </div>
  );
});

export default GlobalRecentTokenCard;
