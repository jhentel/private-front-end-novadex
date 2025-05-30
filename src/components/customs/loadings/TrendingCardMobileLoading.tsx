// ######## Components 🧩 ########
import Separator from "@/components/customs/Separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendingCardMobileLoading() {
  return (
    <div className="group w-full flex-shrink-0 overflow-hidden rounded-[8px] border border-border bg-transparent duration-300 hover:border-border">
      {/* Header */}
      <div className="relative flex h-[40px] w-full items-center justify-between overflow-hidden bg-white/[3%] px-2">
        <div className="relative z-20 flex items-center gap-x-2">
          <Skeleton className="h-6 w-6 flex-shrink-0 rounded-full" />
          <Skeleton className="h-4 w-[80px]" />
        </div>

        <div className="flex w-fit gap-x-2">
          <Skeleton className="h-4 w-16" />
          <Separator
            color="#202037"
            orientation="vertical"
            unit="fixed"
            fixedHeight={16}
          />
          <div className="flex items-center gap-x-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton className="h-4 w-4" key={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex w-full flex-col">
        <div className="flex w-full justify-between gap-x-6 gap-y-3 px-2 py-3">
          <div className="flex w-full items-center gap-x-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="flex w-full flex-col gap-y-2" key={index}>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>

        <Separator color="#202037" />

        <div className="flex h-8 w-full items-center justify-between px-2 py-2">
          <div className="flex items-center gap-x-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-4 w-4" key={index} />
            ))}
          </div>
          <Skeleton className="h-4 w-[82px]" />
        </div>
      </div>
    </div>
  );
}
