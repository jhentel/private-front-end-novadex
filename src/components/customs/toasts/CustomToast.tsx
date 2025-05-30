"use client";

// ######## Components 🧩 ########
import Image from "next/image";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import Link from "next/link";

type SuccessToastProps = {
  tVisibleState: boolean;
  state?: "SUCCESS" | "LOADING" | "ERROR" | "WARNING";
  message?: string;
  link?: string;
  customMessage?: React.ReactNode;
  className?: string;
};

export default function CustomToast({
  tVisibleState,
  state = "SUCCESS",
  message,
  link,
  customMessage,
  className,
}: SuccessToastProps) {
  const iconBasedOnStateMap = {
    SUCCESS: "/icons/toast/success.png",
    LOADING: "/icons/toast/loading.png",
    ERROR: "/icons/toast/error.png",
    WARNING: "/icons/toast/warning.png",
  };

  return link ? (
    <Link
      href={link}
      className={cn(
        "flex h-[36px] w-auto items-center gap-x-2 rounded-[8px] bg-[#29293D] px-3 py-2 shadow-[0_8px_20px_0px_rgba(0,0,0,0.12)]",
        tVisibleState ? "animate-toast-enter" : "animate-toast-leave",
        className,
        link && "cursor-pointer",
      )}
    >
      <div className="relative aspect-square h-4 w-4 flex-shrink-0">
        <Image
          src={iconBasedOnStateMap[state]}
          alt="Status Icon"
          fill
          quality={100}
          className={cn(
            "object-contain",
            state === "LOADING" && "animate-spin",
          )}
        />
      </div>
      {customMessage ? (
        customMessage
      ) : (
        <span className="inline-block text-sm leading-[20px] text-fontColorPrimary">
          {message}
        </span>
      )}
    </Link>
  ) : (
    <div
      className={cn(
        "flex h-[36px] w-auto items-center gap-x-2 rounded-[8px] bg-[#29293D] px-3 py-2 shadow-[0_8px_20px_0px_rgba(0,0,0,0.12)]",
        tVisibleState ? "animate-toast-enter" : "animate-toast-leave",
        className,
        link && "cursor-pointer",
      )}
    >
      <div className="relative aspect-square h-4 w-4 flex-shrink-0">
        <Image
          src={iconBasedOnStateMap[state]}
          alt="Status Icon"
          fill
          quality={100}
          className={cn(
            "object-contain",
            state === "LOADING" && "animate-spin",
          )}
        />
      </div>
      {customMessage ? (
        customMessage
      ) : (
        <span className="inline-block text-sm leading-[20px] text-fontColorPrimary">
          {message}
        </span>
      )}
    </div>
  );
}
