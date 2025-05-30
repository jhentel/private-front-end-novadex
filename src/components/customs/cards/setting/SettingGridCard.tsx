"use client";

// ######## Components 🧩 ########
import { Label } from "../../../ui/label";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import LabelStatusIndicator from "../../LabelStatusIndicator";
import { ToggleStatusType } from "@/types/global";

type SettingGridCardProps = {
  label?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  isInvisible?: boolean;
  indicator?: ToggleStatusType;
};

export default function SettingGridCard({
  label,
  description,
  className,
  children,
  isInvisible,
  indicator,
}: SettingGridCardProps) {
  return (
    <div
      className={cn(
        "col-span-1 flex w-full flex-col gap-y-3 px-4 py-2 md:gap-y-4 md:p-4",
        className,
        isInvisible && "hidden xl:flex",
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-y-0.5",
          isInvisible && "invisible opacity-0",
        )}
      >
        <div className="flex items-center gap-x-2">
          <Label className="font-geistSemiBold text-sm text-fontColorPrimary">
            {label}
          </Label>
          {indicator && <LabelStatusIndicator status={indicator} />}
        </div>
        <p className="text-xs text-fontColorSecondary md:text-xs">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
