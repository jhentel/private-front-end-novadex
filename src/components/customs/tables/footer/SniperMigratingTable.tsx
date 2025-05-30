"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { SniperTask } from "@/apis/rest/sniper";
import { useCallback, useEffect, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
// ######## Components 🧩 ########
import SniperCard from "@/components/customs/cards/footer/SniperCard";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import HeadCol from "@/components/customs/tables/HeadCol";
import EmptyState from "@/components/customs/EmptyState";
import LoadingState from "@/components/customs/LoadingState";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

interface Props {
  tasks?: SniperTask[];
  isLoading: boolean;
}

export default function SniperMigratingTable({ tasks, isLoading }: Props) {
  const width = useWindowSizeStore((state) => state.width);

  // List height measurement
  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);

  // Effect to update list height
  useEffect(() => {
    const updateHeight = () => {
      if (listRef.current) {
        setListHeight(listRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Memoized row renderer for virtualization
  const Row = useCallback(({ index, style, data }: any) => {
    const { items, isLoading } = data;
    if (isLoading) return null;

    const task = items[index];
    if (!task) return null;

    return (
      <div style={style}>
        <SniperCard index={index} key={task.taskId} task={task} />
      </div>
    );
  }, []);

  // Filter active tasks
  const activeTasks =
    tasks
      ?.filter((t: any) => !(t.isCompleted || t.progress == "Snipe Successful"))
      .reverse() || [];

  const HeaderData = [
    {
      label: "Task Status",
      className: "min-w-[120px]",
    },
    {
      label: "Token",
      className: "min-w-[170px]",
    },
    {
      label: "Snipe",
      className: "min-w-[20px]",
    },
    {
      label: "SOL",
      className: "min-w-[70px]",
    },
    {
      label: "Progress",
      className: "min-w-[200px]",
    },
    {
      label: "Presets",
      className: "min-w-[155px]",
    },
    {
      label: "Actions",
      className: "min-w-[90px] justify-end",
    },
  ];

  return (
    <div className="flex w-full flex-grow flex-col">
      {/* Header */}
      <div className="header__table__container !pr-7">
        {HeaderData.map((item, index) => (
          <HeadCol key={index} {...item} />
        ))}
      </div>
      <div className="nova-scroller relative w-full flex-grow">
        <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
          <div
            ref={listRef}
            className="flex h-full w-full flex-col max-md:gap-2 max-md:p-3"
          >
            {isLoading ? (
              <div className="my-auto flex size-full flex-grow items-center justify-center">
                <LoadingState state="Sniper" />
              </div>
            ) : activeTasks.length > 0 ? (
              listHeight > 0 && (
                <FixedSizeList
                  className="nova-scroller"
                  height={listHeight}
                  width="100%"
                  itemCount={activeTasks.length}
                  itemSize={width! > 768 ? 64 : 114}
                  itemData={{
                    items: activeTasks,
                    isLoading,
                  }}
                >
                  {Row}
                </FixedSizeList>
              )
            ) : (
              <div className="relative -z-10 my-auto flex size-full flex-grow items-center justify-center">
                <EmptyState state="Sniper" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
