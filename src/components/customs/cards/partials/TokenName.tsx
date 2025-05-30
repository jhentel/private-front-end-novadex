"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { cn } from "@/libraries/utils";
import toast from "react-hot-toast";
import CustomToast from "@/components/customs/toasts/CustomToast";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { TokenText } from "./TokenText";

export const TokenName = React.memo(
  ({
    name,
    mint,
    migrating,
    cardWidth,
  }: {
    name: string;
    mint: string;
    migrating: boolean;
    cardWidth: number;
  }) => {
    const [_, setCopied] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get token font size settings
    const { presets, activePreset } = useCustomizeSettingsStore();
    const finalActivePreset = activePreset || "preset1";

    const currentFontSizePreset = useMemo(
      () => presets[finalActivePreset].tokenFontSizeSetting || "normal",
      [presets, finalActivePreset],
    );

    // Determine if we should use the split view or truncated view based on font size
    // const shouldUseSplitView = useMemo(
    //   () =>
    //     ["normal", "large",].includes(
    //       currentFontSizePreset,
    //     ),
    //   [currentFontSizePreset],
    // );
    // const shouldUseSplitView = useMemo(
    //   () =>
    //     ["normal", "large",].includes(
    //       currentFontSizePreset,
    //     ),
    //   [currentFontSizePreset],
    // );

    const handleCopy = useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        navigator.clipboard
          .writeText(mint)
          .then(() => {
            setCopied(true);
            toast.custom((t: any) => (
              <CustomToast
                tVisibleState={t.visible}
                message="Successfully copied"
                state="SUCCESS"
              />
            ));

            timeoutRef.current = setTimeout(() => setCopied(false), 3000);
          })
          .catch((err) => {
            console.warn("Failed to copy:", err);
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = mint;
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand("copy");
              setCopied(true);
              timeoutRef.current = setTimeout(() => setCopied(false), 3000);
            } catch (err) {
              console.warn("Fallback copy failed:", err);
            }
            document.body.removeChild(textArea);
          });
      },
      [mint],
    );

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const [firstPart, secondPart] = useMemo(() => {
      const mid = Math.ceil(name.length / 1.4);
      return [name.substring(0, mid), name.substring(mid)];
    }, [name]);

    // Common class for text styling
    const textStyle = cn(
      migrating ? "text-fontColorPrimary/70" : "text-fontColorSecondary",
    );

    return (
      <button
        className="relative z-30 w-full hover:opacity-60 focus:outline-none"
        id="social-links-first"
        onClick={handleCopy}
      >
        {/* {shouldUseSplitView ? (
          // Original split view for normal and large sizes
          <div className="flex w-full">
            <TokenText
              text={firstPart}
              className={cn(
                "min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap",
                textStyle,
              )}
            />
            <TokenText
              text={secondPart}
              className={cn("whitespace-nowrap", textStyle)}
            />
          </div>
        ) : ( */}
        <div className="w-full">
          <TokenText
            text={name || mint}
            className={cn("truncate whitespace-nowrap", textStyle)}
            shouldTruncate={true}
            cardWidth={cardWidth}
          />
        </div>
        {/* )} */}
      </button>
    );
  },
);

TokenName.displayName = "TokenName";
