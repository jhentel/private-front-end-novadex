"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import CustomToast from "@/components/customs/toasts/CustomToast";
import { useCopyAddress } from "@/stores/use-copy-address";
import { cn } from "@/libraries/utils";

interface DetailCopied {
  mint: string;
  symbol: string;
  name: string;
  image: string;
}

type CopyIconVariant = "white" | "gray" | "primary";

const getCopyIconSrc = (variant: CopyIconVariant) => {
  const iconMap: Record<CopyIconVariant, string> = {
    gray: "/icons/copy-secondary.svg",
    primary: "/icons/copy-purple.svg",
    white: "/icons/copy-primary.svg",
  };
  return iconMap[variant] || iconMap.gray;
};

const Copy = React.memo(
  ({
    value,
    dataDetail,
    variant = "gray",
    className,
    classNameChild,
    withToast = false,
    sizeConstant,
    withAnimation = true,
  }: {
    value: string;
    dataDetail?: DetailCopied;
    variant?: CopyIconVariant;
    className?: string;
    classNameChild?: string;
    withToast?: boolean;
    sizeConstant?: number;
    withAnimation?: boolean;
  }) => {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const setDetailCopied = useCopyAddress((state) => state.setDetailCopied);

    const handleCopy = useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            if (dataDetail) {
              setDetailCopied(dataDetail);
            }
            if (withToast) {
              toast.custom((t: any) => (
                <CustomToast
                  tVisibleState={t.visible}
                  message="Successfully copied"
                  state="SUCCESS"
                />
              ));
            }
            timeoutRef.current = setTimeout(() => setCopied(false), 3000);
          })
          .catch((err) => {
            console.warn("Failed to copy:", err);
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = value;
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand("copy");
              setCopied(true);
              if (dataDetail) {
                setDetailCopied(dataDetail);
              }
              timeoutRef.current = setTimeout(() => setCopied(false), 3000);
            } catch (err) {
              console.warn("Fallback copy failed:", err);
            }
            document.body.removeChild(textArea);
          });
      },
      [value, dataDetail, setDetailCopied, withToast],
    );

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    // Simple non-animated version
    if (!withAnimation) {
      return (
        <button
          onClick={(e) => handleCopy(e)}
          className={cn(
            "relative aspect-square size-4 transition-opacity duration-300 hover:opacity-60 focus:border-none focus:outline-none focus:ring-0 md:size-[18px]",
            className,
          )}
          style={{ isolation: "isolate" }}
        >
          <Image
            src={getCopyIconSrc(variant)}
            alt="Copy Icon"
            {...(sizeConstant
              ? { height: sizeConstant, width: sizeConstant }
              : { fill: true })}
            quality={100}
            className={cn(
              "size-full transition-opacity duration-200",
              classNameChild,
              copied ? "opacity-0" : "opacity-100",
            )}
          />
          <Image
            src="/icons/pink-check.png"
            alt="Check Icon"
            {...(sizeConstant
              ? { height: sizeConstant, width: sizeConstant }
              : { fill: true })}
            quality={100}
            className={cn(
              "absolute inset-0 size-full transition-opacity duration-200",
              classNameChild,
              copied ? "opacity-100" : "opacity-0",
            )}
          />
        </button>
      );
    }

    // Animated version (existing code)
    return (
      <button
        onClick={(e) => handleCopy(e)}
        className={cn(
          "relative aspect-square size-4 transition-opacity duration-300 hover:opacity-60 focus:border-none focus:outline-none focus:ring-0 md:size-[18px]",
          className,
        )}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className={cn("absolute inset-0 size-full", classNameChild)}
            >
              <Image
                src="/icons/pink-check.png"
                alt="Check Icon"
                {...(sizeConstant
                  ? { height: sizeConstant, width: sizeConstant }
                  : { fill: true })}
                quality={100}
                className="object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className={cn("absolute inset-0 size-full", classNameChild)}
            >
              <Image
                src={getCopyIconSrc(variant)}
                alt="Copy Icon"
                {...(sizeConstant
                  ? { height: sizeConstant, width: sizeConstant }
                  : { fill: true })}
                quality={100}
                className="object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  },
);

Copy.displayName = "Copy";

export default Copy;
