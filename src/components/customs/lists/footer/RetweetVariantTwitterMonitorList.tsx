"use client";

// ######## Components 🧩 ########
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import TwitterMonitorCard from "@/components/customs/cards/footer/TwitterMonitorCard";
// ######## Types 🗨️ ########
import { TwitterMonitorMessageType } from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function RetweetVariantTwitterMonitorList({
  list,
  className,
}: {
  list: TwitterMonitorMessageType[];
  className?: string;
}) {
  return (
    <div className={cn("col-span-1 flex w-full flex-grow", className)}>
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="invisible__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
      >
        <div className="absolute left-0 top-0 w-full flex-grow py-4">
          <div className="flex h-auto w-full flex-col gap-y-4">
            {list.map((item, index) => (
              <TwitterMonitorCard key={item.id} data={item} variant="large" />
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
