// ######## Components 🧩 ########
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/libraries/utils";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

export default function WalletManagerCardLoading() {
  return (
    <OverlayScrollbarsComponent
      defer
      element="div"
      className="table__modal__overlayscrollbar relative flex h-full w-full flex-grow overflow-y-scroll rounded-[8px]"
      options={{
        overflow: {
          x: "scroll",
          y: "scroll",
        },
        scrollbars: {
          theme: "os-theme-dark",
          visibility: "auto",
          autoHide: "never",
        },
      }}
    >
      <div className="w-full min-w-[1000px] rounded-xl border border-border">
        {/* Table Header */}
        <div className="sticky top-0 flex w-full items-center rounded-[8px] border-b border-border bg-background/95 px-4 py-3">
          <div className="grid w-full grid-cols-[auto_1fr_1fr_1fr] gap-4">
            <Skeleton className="mr-3 h-4 w-[224px] animate-pulse rounded bg-gradient-to-r" />
            <Skeleton className="h-4 w-full animate-pulse rounded bg-gradient-to-r" />
            <Skeleton className="h-4 w-full animate-pulse rounded bg-gradient-to-r" />
            <Skeleton className="h-4 w-full animate-pulse rounded bg-gradient-to-r" />
          </div>
        </div>

        {/* Table Body */}
        <div className="flex w-full flex-col">
          {[...Array(15)].map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex w-full items-center border-b border-border px-4 py-3",
                index % 2 === 0 && "bg-white/[0.04]",
              )}
            >
              <div className="grid w-full grid-cols-[auto_1fr_1fr_1fr] items-center gap-4">
                <div className="flex w-full items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
                    <Skeleton className="h-12 w-12 animate-pulse rounded-full bg-gradient-to-r" />
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <Skeleton className="h-4 w-[176px] animate-pulse rounded bg-gradient-to-r" />
                    <Skeleton className="h-4 w-[88px] animate-pulse rounded bg-gradient-to-r" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full animate-pulse rounded bg-gradient-to-r" />
                <Skeleton className="h-4 w-full animate-pulse rounded bg-gradient-to-r" />
                <Skeleton className="h-4 w-full animate-pulse rounded bg-gradient-to-r" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </OverlayScrollbarsComponent>
  );
}
