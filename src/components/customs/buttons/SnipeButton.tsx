"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect } from "react";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { quickBuyButtonStyles } from "../setting/CustomizedBuyButtonSettings";
// ######## Components 🧩 ########
import Image from "next/image";
import { CosmoDataMessageType } from "@/types/ws-general";
import { useSniperFooterStore } from "@/stores/footer/use-sniper-footer.store";
import { cn } from "@/libraries/utils";

export default function SnipeButton({
  data,
  className,
}: {
  data: CosmoDataMessageType;
  className?: string | undefined;
}) {
  const setSniperState = useSniperFooterStore(
    (state) => state.setTokenInfoState,
  );

  const presetData = useQuickBuySettingsStore((state) => state.presets);
  const {
    presets: customizedSettingPresets,
    activePreset: customizedSettingActivePreset,
  } = useCustomizeSettingsStore();

  const currentButtonPreset =
    customizedSettingPresets[customizedSettingActivePreset].buttonSetting ||
    "normal";
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1600px)");

    // Set initial value
    setIsLargeScreen(mediaQuery.matches);

    // Add listener for changes
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsLargeScreen(e.matches);
    };

    // Modern browsers use addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }
    // Older browsers use addListener (deprecated)
    else {
      mediaQuery.addListener(handleMediaChange);
      return () => mediaQuery.removeListener(handleMediaChange);
    }
  }, []);

  const quickBuyButtonStyle = isLargeScreen
    ? quickBuyButtonStyles[currentButtonPreset].large
    : quickBuyButtonStyles[currentButtonPreset].default;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSniperState({
          name: data.name,
          dex: data.dex,
          image: data.image,
          symbol: data.symbol,
          mint: data.mint,
        });
      }}
      className={cn(
        "relative -bottom-6 z-10 flex h-[28px] w-[82px] items-center justify-center gap-x-1.5 overflow-hidden rounded-[40px] bg-white/[8%] pl-2.5 pr-3 duration-300 hover:bg-white/[12%] min-[490px]:bottom-0 xl:-bottom-6 min-[1490px]:bottom-0",
        className,
      )}
      style={quickBuyButtonStyle}
    >
      <>
        <div className="relative -ml-[1.5px] aspect-square h-3.5 w-3.5 flex-shrink-0 lg:h-4 lg:w-4">
          <Image
            src="/icons/snipe.png"
            alt="Snipe Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        <span className="block font-geistSemiBold text-sm text-fontColorPrimary">
          Snipe
        </span>
      </>
    </button>
  );
}
