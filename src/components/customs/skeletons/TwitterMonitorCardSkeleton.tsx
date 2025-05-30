// ######## Components 🧩 ########
import { Skeleton } from "@/components/ui/skeleton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function TwitterMonitorCardSkeleton({
  variant = "small",
}: {
  variant?: "small" | "large";
}) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[8px] border border-border bg-white/[4%]">
      {/* Content */}
      <div
        className={cn(
          "flex w-full flex-col p-3",
          variant === "large" && "gap-y-3",
        )}
      >
        {/* User info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Skeleton className="h-8 w-8 rounded-full bg-gradient-to-r" />
            <div className="flex flex-col gap-y-1">
              <Skeleton className="h-3 w-52 bg-gradient-to-r" />
              <Skeleton className="h-3 w-24 bg-gradient-to-r" />
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Skeleton className="h-8 w-8 rounded-[8px] bg-gradient-to-r" />
            <Skeleton className="h-8 w-8 rounded-[8px] bg-gradient-to-r" />
          </div>
        </div>

        {/* Tweet content */}
        <div className="mt-2 flex flex-col gap-y-2">
          <Skeleton className="h-4 w-full bg-gradient-to-r" />
          <Skeleton className="h-4 w-4/6 bg-gradient-to-r" />
          <Skeleton className="h-4 w-3/6 bg-gradient-to-r" />
        </div>
      </div>
    </div>
  );
}
