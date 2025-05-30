import { cn } from "@/libraries/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[4px] bg-gradient-to-br from-white/[8%] to-white/[2%]",
        className
      )}
      {...props}
      style={{
        contain: 'paint layout',
        isolation: "isolate",
        ...props.style
      }}
    />
  );
}
