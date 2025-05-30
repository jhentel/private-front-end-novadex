// ######## Components 🧩 ########
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendingCardLoading() {
  return (
    <div className="transition-color flex h-[72px] min-w-max items-center duration-300 ease-out odd:bg-white/[3%] even:bg-transparent hover:bg-white/10">
      <div className="flex w-full min-w-[248px] px-3">
        <div className="flex w-full items-center gap-x-2">
          <Skeleton className="h-[50px] w-[50px] flex-shrink-0 rounded-full" />
          <div className="flex w-full flex-col gap-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
      <div className="flex h-full w-full min-w-[165px] items-center px-3">
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex h-full w-full min-w-[165px] items-center px-3">
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex h-full w-full min-w-[165px] items-center px-3">
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex h-full w-full min-w-[165px] items-center px-3">
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex h-full w-full min-w-[165px] items-center px-3">
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex h-full w-full min-w-[165px] items-center px-3">
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex h-full w-full min-w-[165px] items-center px-3">
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
