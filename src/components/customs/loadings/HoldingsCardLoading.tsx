// ######## Components 🧩 ########
import { Skeleton } from "@/components/ui/skeleton";

interface HoldingsCardLoadingProps {
  index?: number;
}

export default function HoldingsCardLoading({
  index,
}: HoldingsCardLoadingProps) {
  return (
    <div
      className={`flex h-[99px] min-w-max items-center pl-4 pr-4 ${index !== undefined && index % 2 === 0 ? "bg-white/[3%]" : ""}`}
    >
      <div className="flex w-full min-w-[14%] px-3">
        <div className="flex w-full items-center gap-x-2">
          <Skeleton className="h-[50px] w-[50px] flex-shrink-0 rounded-full bg-gradient-to-r" />
          <div className="flex w-full flex-col gap-y-1">
            <Skeleton className="h-4 w-full flex-shrink-0 rounded-[4px] bg-gradient-to-r" />
            <Skeleton className="h-4 w-1/2 flex-shrink-0 rounded-[4px] bg-gradient-to-r" />
          </div>
        </div>
      </div>
      <div className="flex h-full w-full min-w-[14%] items-center px-3">
        <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
      </div>
      <div className="flex h-full w-full min-w-[14%] items-center px-3">
        <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
      </div>
      <div className="flex h-full w-full min-w-[14%] items-center px-3">
        <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
      </div>
      <div className="flex h-full w-full min-w-[14%] items-center px-3">
        <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
      </div>
      <div className="flex h-full w-full min-w-[14%] items-center px-3">
        <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
      </div>
      <div className="flex h-full w-full min-w-[14%] items-center px-3">
        <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
      </div>
    </div>
  );
}
