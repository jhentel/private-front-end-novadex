// ######## Components 🧩 ########
import { Skeleton } from "@/components/ui/skeleton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function TwitterMonitorMenuSkeleton({
  count = 3,
  variant = "desktop", // desktop or mobile
  className,
}: {
  count?: number;
  variant?: "desktop" | "mobile";
  className?: string;
}) {
  return (
    <>
      {/* Desktop */}
      {variant === "desktop" && (
        <div className={cn("flex w-full", "flex-col gap-y-2", className)}>
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "relative flex h-10 w-full items-center justify-start rounded-[8px]",
              )}
            >
              <Skeleton className={cn("h-10 w-full bg-gradient-to-r")} />
            </div>
          ))}
        </div>
      )}

      {/* Mobile */}
      {variant === "mobile" && (
        <div className="flex w-full items-center justify-center gap-x-2">
          <Skeleton className="h-9 w-24 rounded bg-gradient-to-r" />
          <Skeleton className="h-9 w-full rounded bg-gradient-to-r" />
          <Skeleton className="h-9 w-full rounded bg-gradient-to-r" />
        </div>
      )}
    </>
  );
}
