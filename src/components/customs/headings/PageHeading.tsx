// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import React from "react";

export default function PageHeading({
  title,
  description,
  line = 1,
  showDescriptionOnMobile = false,
  children,
}: {
  title: string;
  description: string;
  line?: 1 | 2;
  showDescriptionOnMobile?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex",
        line === 1
          ? showDescriptionOnMobile
            ? "flex-col justify-start gap-y-0.5 lg:flex-row lg:items-center lg:gap-x-2"
            : "flex-row items-center gap-x-2"
          : "flex-col justify-start",
      )}
    >
      <h2
        className={cn(
          "mb-[3.5px] text-nowrap font-geistSemiBold text-[20px] text-fontColorPrimary",
          line === 1 && "mb-0",
        )}
      >
        {title}
      </h2>
      <p
        //md:mt-0.5
        className={cn(
          "line-clamp-1 text-sm text-fontColorSecondary max-md:leading-4 lg:text-nowrap",
          showDescriptionOnMobile ? "block" : "hidden lg:block",
        )}
      >
        {description}
      </p>
      {children}
    </div>
  );
}
