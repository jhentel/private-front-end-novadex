// ######## Components 🧩 ########
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletManagerCardMobileLoading() {
  return (
    <div className="flex h-full w-full flex-grow flex-col gap-4 bg-background p-4 md:hidden">
      {/* <div className="space-y-1">
        <Skeleton className="h-6 w-[127px] animate-pulse rounded bg-gradient-to-r" />
        <Skeleton className="h-4 w-[278px] animate-pulse rounded bg-gradient-to-r" />
      </div> */}
      {[...Array(7)].map((_, cardIndex) => (
        <div
          key={cardIndex}
          className="flex w-full flex-col rounded-lg border border-border bg-card shadow-sm"
        >
          {/* Card Header with Avatar/Icon */}
          <div className="flex w-full items-center justify-between bg-white/[0.04] p-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-20 animate-pulse rounded bg-gradient-to-r" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 animate-pulse rounded bg-gradient-to-r" />
            </div>
          </div>

          {/* Card Content - 4 rows of data */}
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, rowIndex, arr) =>
              rowIndex === arr.length - 1 ? (
                // Index terakhir dengan flex-row dan 3 Skeleton
                <div key={rowIndex} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-7 w-8 animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="h-7 w-8 animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="h-7 w-8 animate-pulse rounded bg-gradient-to-r" />
                </div>
              ) : (
                // Index lainnya tetap dengan flex-col dan 2 Skeleton
                <div key={rowIndex} className="flex flex-col gap-1 p-2">
                  <Skeleton className="h-4 w-[113px] animate-pulse rounded bg-gradient-to-r" />
                  <Skeleton className="h-4 w-[55px] animate-pulse rounded bg-gradient-to-r" />
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
