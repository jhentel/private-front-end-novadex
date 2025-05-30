"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/libraries/utils";

const Preloader = ({
  vanillaCSSAnimation = false,
  vanillaLoadingState,
  className,
}: {
  vanillaCSSAnimation?: boolean;
  vanillaLoadingState?: boolean;
  className?: string;
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (vanillaLoadingState === false) {
      timeoutRef.current = setTimeout(() => {
        setShowLoading(false);
      }, 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [vanillaLoadingState]);

  return vanillaCSSAnimation ? (
    showLoading && (
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center bg-card",
          className,
        )}
      >
        <div className="relative size-16 animate-pulse-scale">
          <Image
            src="/logo.png"
            alt="Preloader"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      </div>
    )
  ) : (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-card",
        className,
      )}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 0, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="relative size-16"
      >
        <Image
          src="/logo.png"
          alt="Preloader"
          fill
          quality={100}
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
