import { useMemo, useRef } from "react";
import { usePopupStore } from "@/stores/use-popup-state";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { useWindowSize } from "@/hooks/use-window-size";
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";

interface TokenTextProps {
  text: string;
  className?: string;
  maxLength?: number;
  shouldTruncate?: boolean;
  isSymbol?: boolean;
  cardWidth: number;
}

// Map token font size settings to actual tailwind classes
const tokenFontSizeMap = {
  normal: "text-sm",
  large: "text-base",
  extralarge: "text-lg",
  doubleextralarge: "text-xl",
};

// Map for automatic truncation limits based on font size preset and text type
const truncationLimitsMap = {
  normal: { symbol: null, name: null },
  large: { symbol: null, name: null },
  extralarge: { symbol: 14, name: 22 },
  doubleextralarge: { symbol: 12, name: 20 },
};

const avgCharWidthMap = {
  normal: 10,
  large: 11,
  extralarge: 12,
  doubleextralarge: 13,
};

export const TokenText = ({
  text,
  className = "",
  maxLength,
  shouldTruncate = false,
  isSymbol = false,
  cardWidth,
}: TokenTextProps) => {
  const { presets, activePreset } = useCustomizeSettingsStore();
  const finalActivePreset = activePreset || "preset1";

  const { width } = useWindowSize();

  const currentFontSizePreset = useMemo(
    () => presets[finalActivePreset].tokenFontSizeSetting || "normal",
    [presets, finalActivePreset],
  );

  const fontSizeClass = tokenFontSizeMap[currentFontSizePreset];

  const dynamicCardWidth = useRef(0);
  const displayText = useMemo(() => {
    const textType = isSymbol ? "symbol" : "name";

    const avgCharWidth = avgCharWidthMap[currentFontSizePreset] || 8;
    const dynamicCharLimit =
      !isSymbol && cardWidth > 0
        ? Math.floor((cardWidth * 0.55) / avgCharWidth)
        : null;
    dynamicCardWidth.current = dynamicCharLimit || 0;

    const autoTruncateLimit =
      truncationLimitsMap[currentFontSizePreset][textType];

    const shouldAutoTruncate = autoTruncateLimit !== null;
    const finalShouldTruncate = shouldTruncate || shouldAutoTruncate;

    let finalMaxLength: number | null = dynamicCharLimit;

    if (finalShouldTruncate && finalMaxLength) {
      return truncateString(text, finalMaxLength);
    }

    return text;
  }, [
    text,
    shouldTruncate,
    maxLength,
    currentFontSizePreset,
    isSymbol,
    width,
    cardWidth,
  ]);

  return (
    <span className={cn(fontSizeClass, className)}>
      {displayText}
      {/* | {!isSymbol && cardWidth} |{" "}
      {!isSymbol && dynamicCardWidth.current} */}
    </span>
  );
};
