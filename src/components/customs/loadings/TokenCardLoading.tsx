// ######## Components 🧩 ########
import { Skeleton } from "@/components/ui/skeleton";
import Separator from "@/components/customs/Separator";

export function TokenHeaderLoading() {
  return Array.from({ length: 7 }).map((_, index) => (
    <div
      key={index}
      className="flex h-full w-full min-w-[90px] items-center px-3"
    >
      <Skeleton className="h-4 w-full" />
    </div>
  ));
}

export function TokenCardLoading() {
  return (
    <>
      {/* Desktop */}
      <div className="transition-color hidden h-[72px] min-w-max items-center duration-300 ease-out odd:bg-white/[3%] even:bg-transparent hover:bg-white/10 md:flex">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="flex h-full w-full min-w-[90px] items-center px-3"
          >
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="group block w-full flex-shrink-0 overflow-hidden rounded-[8px] border border-border bg-transparent duration-300 hover:border-border md:hidden">
        <div className="relative flex h-[40px] w-full items-center justify-between overflow-hidden bg-[#12121a] px-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="relative flex w-full flex-col">
          <div className="flex w-full justify-between gap-x-6 gap-y-3 px-2 py-3">
            <div className="flex w-full items-center gap-x-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="flex w-full flex-col gap-y-2" key={index}>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>

          <Separator color="#202037" />

          <div className="flex h-auto w-full items-center justify-between px-2 py-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-x-2">
              <Skeleton className="size-8" />
              <Skeleton className="size-8" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
