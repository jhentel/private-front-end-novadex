import { cn } from "@/libraries/utils";
import Image from "next/image";
import React from "react";

const ProgressBadge = ({
  label,
  color,
}: {
  label: string;
  color: "purple" | "red" | "green";
}) => {
  const bg20 =
    color === "purple"
      ? "bg-primary/20"
      : color === "red"
        ? "bg-destructive/20"
        : "bg-success/20";

  const bg =
    color === "purple"
      ? "bg-primary"
      : color === "red"
        ? "bg-destructive"
        : "bg-success";

  const image =
    color === "purple"
      ? "/icons/pink-migrating-clock.svg"
      : color === "red"
        ? "/icons/red-cross.svg"
        : "/icons/green-check.svg";

  const text =
    color === "purple"
      ? "text-primary"
      : color === "red"
        ? "text-destructive"
        : "text-success";

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-center gap-x-1 rounded-[4px] px-1.5 max-md:size-[24px] md:h-[18px] md:rounded-[3px] md:pl-[3px] md:pr-1.5",
          bg20,
        )}
      >
        <div
          className={cn("h-[80%] w-[3px] rounded-[10px] max-md:hidden", bg)}
        ></div>
        <div className="relative aspect-square h-3 w-3 flex-shrink-0">
          <Image
            src={image}
            alt="Migrating Clock Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        <span
          className={cn(
            "inline-block whitespace-nowrap font-geistRegular text-xs max-md:hidden",
            text,
          )}
        >
          {label}
        </span>
      </div>
    </>
  );
};

export default ProgressBadge;
