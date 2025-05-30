// ######## Components 🧩 ########
import Separator from "@/components/customs/Separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function HoldingsCardMobileLoading() {
  return (
    <div className="group w-full flex-shrink-0 overflow-hidden rounded-[8px] border border-border bg-card duration-300 hover:border-border">
      {/* Header */}
      <div className="relative flex h-[40px] w-full items-center justify-between overflow-hidden bg-white/[4%] px-3">
        <div className="relative z-20 flex items-center gap-x-2">
          <Skeleton className="h-6 w-6 flex-shrink-0 rounded-full" />

          <Skeleton className="h-5 w-[140px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative flex w-full flex-col">
        {/* <Skeleton className="h-12 w-full" /> */}
        <div className="flex w-full items-center gap-x-2 p-3">
          <div className="flex w-full flex-col gap-y-2">
            <Skeleton className="h-5 w-full rounded-[4px]" />
            <Skeleton className="h-5 w-1/2 rounded-[4px]" />
          </div>

          <div className="flex w-full flex-col gap-y-2">
            <Skeleton className="h-5 w-full rounded-[4px]" />
            <Skeleton className="h-5 w-1/2 rounded-[4px]" />
          </div>
          <div className="flex w-full flex-col gap-y-2">
            <Skeleton className="h-5 w-full rounded-[4px]" />
            <Skeleton className="h-5 w-1/2 rounded-[4px]" />
          </div>
          <div className="flex w-full flex-col gap-y-2">
            <Skeleton className="h-5 w-full rounded-[4px]" />
            <Skeleton className="h-5 w-1/2 rounded-[4px]" />
          </div>
        </div>

        <Separator color="#202037" />

        <div className="flex w-full items-center justify-end gap-x-2 px-3 py-2">
          <Skeleton className="h-8 w-[83px] rounded-[8px]" />
          <Skeleton className="h-8 w-8 rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}
