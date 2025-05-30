"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

const TranslateWrapper = React.memo(
  ({
    children,
    reverse = false,
    duration = 200,
  }: {
    children: React.ReactNode;
    reverse?: boolean;
    duration?: number;
  }) => {
    const xValues = useMemo(
      () => (reverse ? ["-100%", "0%"] : ["0%", "-100%"]),
      [reverse],
    );

    return (
      <div className="flex w-full overflow-hidden will-change-transform">
        <motion.div
          className="flex min-w-full shrink-0 transform-gpu gap-1 will-change-transform"
          animate={{
            x: xValues,
          }}
          transition={{
            x: {
              duration: duration,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  },
);
TranslateWrapper.displayName = "TranslateWrapper";
export default TranslateWrapper;
