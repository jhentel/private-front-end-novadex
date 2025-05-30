// ######## Components 🧩 ########
import { Skeleton } from "@/components/ui/skeleton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function TwitterMonitorActionsSkeleton({
  variant = "desktop", // desktop or mobile
  className,
}: {
  variant?: "desktop" | "mobile";
  className?: string;
}) {
  return (
    <div
      className={cn(
        variant === "desktop"
          ? "mt-auto flex w-full flex-col justify-center gap-y-2"
          : "flex w-full flex-grow",
        className,
      )}
    >
      {variant === "desktop" && (
        // Desktop layout - vertical buttons
        <>
          <Skeleton className="h-10 w-full rounded-[8px] bg-gradient-to-r" />
          <Skeleton className="h-10 w-full rounded-[8px] bg-gradient-to-r" />
          <Skeleton className="h-10 w-full rounded-[8px] bg-gradient-to-r" />

          <Skeleton className="h-4 w-3/6 rounded bg-gradient-to-r" />
          <Skeleton className="h-4 w-2/6 rounded bg-gradient-to-r" />
        </>
      )}

      {variant === "mobile" && (
        <div className="grid w-full grid-cols-4 gap-x-2">
          <Skeleton className="h-9 w-full bg-gradient-to-r" />
          <Skeleton className="h-9 w-full bg-gradient-to-r" />
          <Skeleton className="h-9 w-full bg-gradient-to-r" />
          <Skeleton className="h-9 w-full bg-gradient-to-r" />
        </div>
      )}
    </div>
  );
}
