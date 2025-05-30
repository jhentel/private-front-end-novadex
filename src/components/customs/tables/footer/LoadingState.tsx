import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

export const LoadingState = ({
  isFetchingBasedOnFilter = false,
}: {
  isFetchingBasedOnFilter: boolean;
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-4 p-4">
      <motion.div
        initial={{ opacity: 0.8 }}
        animate={{
          opacity: [0.8, 1, 0.8],
          rotate: [0, 0, 0, 0, 0, 180, 180, 180, 180, 180],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transformOrigin: "center",
          backfaceVisibility: "hidden",
          willChange: "transform, opacity",
          transform: "translateZ(0)",
        }}
      >
        <Image
          src="/icons/wait-hourglass.svg"
          alt="Waiting"
          height={80}
          width={62}
          unoptimized
          priority
        />
      </motion.div>

      <h3 className="mb-1 text-lg font-medium text-white">
        {isFetchingBasedOnFilter
          ? "Loading..."
          : "Waiting for wallet transactions"}
      </h3>
      <p className="text-center text-sm text-gray-500">
        {isFetchingBasedOnFilter
          ? "Please wait while we fetch the latest transactions."
          : "Transactions from the wallets you&apos;re tracking will appear here once they occur."}
      </p>
    </div>
  );
};
