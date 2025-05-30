"use client";

import React, { useMemo } from "react";
import ScrollLayout from "./ScrollLayout";
import { cn } from "@/libraries/utils";
import { useParams, usePathname } from "next/navigation";
import { usePopupStore } from "@/stores/use-popup-state";
import { TokenPageFullLoading } from "../customs/loadings/TokenPageLoading";
import TokenClientSSR from "../customs/token/TokenClientSSR";

const TokenLayout = ({ mint }: { mint: string }) => {
  const pathname = usePathname();
  const remainingScreenWidth = usePopupStore(
    (state) => state.remainingScreenWidth,
  );
  const popups = usePopupStore((state) => state.popups);
  const isSnapOpen = useMemo(() => {
    return popups.some((p) => p.isOpen && p.snappedSide !== "none");
  }, [popups]);

  return (
    <>
      <ScrollLayout
        key={mint}
        withPadding={false}
        className={cn(!pathname.includes("token") && "hidden")}
      >
        <div
          className={cn(
            "relative mb-14 mt-4 flex w-full flex-col-reverse gap-x-2 gap-y-2 pb-4 md:mb-12 md:mt-2 md:flex-row md:gap-y-0 md:px-4 xl:mt-0 xl:flex-grow",
            isSnapOpen && "xl:flex-nowrap",
            remainingScreenWidth &&
              remainingScreenWidth < 768 &&
              "md:mb-14 md:mt-4 md:flex-col-reverse md:gap-y-4 md:px-0",
          )}
        >
          <TokenClientSSR />
        </div>
      </ScrollLayout>
      {!pathname.includes("token") && <TokenPageFullLoading />}
    </>
  );
};

export default TokenLayout;
