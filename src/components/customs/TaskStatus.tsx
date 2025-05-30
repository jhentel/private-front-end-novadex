import { cn } from "@/libraries/utils";
import Image from "next/image";
import React from "react";

const TaskStatus = ({
  isCompleted,
  isRunning,
  className,
}: {
  isCompleted: boolean;
  isRunning: boolean;
  className?: string;
}) => {
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-center gap-x-1 rounded-[4px] py-2 pl-2 pr-3 max-md:h-6 md:rounded-[8px]",
          isCompleted
            ? "bg-primary/[12%]"
            : isRunning
              ? "bg-success/[12%]"
              : "bg-destructive/[12%]",
          className,
        )}
      >
        <div className="relative aspect-square size-4 flex-shrink-0">
          <Image
            src={
              isCompleted
                ? "/icons/pink-check-thick.svg"
                : isRunning
                  ? "/icons/footer/running-task.svg"
                  : "/icons/footer/stopped-task.svg"
            }
            alt={
              isCompleted
                ? "Completed Task Icon"
                : isRunning
                  ? "Running Task Icon"
                  : "Stopped Task Icon"
            }
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        <span
          className={cn(
            "inline-block text-nowrap font-geistSemiBold text-xs",
            isCompleted
              ? "text-primary"
              : isRunning
                ? "text-success"
                : "text-destructive",
          )}
        >
          {isCompleted ? "Completed" : isRunning ? "Running" : "Stopped"}
        </span>
      </div>
    </>
  );
};

export default React.memo(TaskStatus);
