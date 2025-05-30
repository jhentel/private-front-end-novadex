"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/libraries/utils";

type LoadingStateProps = {
  state: "Sniper" | "Wallet" | "Twitter" | "Alerts";
  className?: string;
  size?: "sm" | "md";
};

export default function LoadingState({
  state,
  className,
  size,
}: LoadingStateProps) {
  return (
    <>
      {state === "Wallet" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
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
            className="relative size-12"
          >
            <Image
              src="/logo.png"
              alt="Preloader"
              fill
              quality={100}
              className="object-contain"
            />
          </motion.div>
        </div>
      )}
      {state === "Twitter" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
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
            className="relative size-12"
          >
            <Image
              src="/logo.png"
              alt="Preloader"
              fill
              quality={100}
              className="object-contain"
            />
          </motion.div>
        </div>
      )}
      {state === "Sniper" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
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
            className="relative size-12"
          >
            <Image
              src="/logo.png"
              alt="Preloader"
              fill
              quality={100}
              className="object-contain"
            />
          </motion.div>
        </div>
      )}
      {state === "Alerts" && (
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col items-center gap-y-8",
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
            className="relative size-12"
          >
            <Image
              src="/logo.png"
              alt="Preloader"
              fill
              quality={100}
              className="object-contain"
            />
          </motion.div>
        </div>
      )}
    </>
  );
}
