// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import React from "react";

export type SeparatorProps = {
  color?: string;
  orientation?: "horizontal" | "vertical";
  unit?: "relative" | "fixed";
  fixedWidth?: number;
  fixedHeight?: number;
  className?: string;
};

export default React.memo(function Separator({
  color = "#202037",
  orientation = "horizontal",
  unit = "relative",
  fixedWidth,
  fixedHeight,
  className,
}: SeparatorProps) {
  return (
    <div
      style={{
        width:
          orientation === "horizontal"
            ? unit === "relative"
              ? "100%"
              : `${fixedWidth}px`
            : "0.9px",
        height:
          orientation === "horizontal"
            ? "0.9px"
            : unit === "relative"
              ? "100%"
              : `${fixedHeight}px`,
        background: color,
      }}
      className={cn("flex-shrink-0", className)}
    ></div>
  );
});
