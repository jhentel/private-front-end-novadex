"use client";

// ######## Components 🧩 ########
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import GlobalSearchResultCard from "../cards/GlobalSearchResultCard";
// ######## Types 🗨️ ########
import { GlobalSearchResultCardProps } from "../cards/GlobalSearchResultCard";
import { RefObject } from "react";

export default function GlobalSearchResultList({
  data,
  focusedItemIndex = -1,
  resultCardsRef,
  setOpenDialog,
}: {
  data: GlobalSearchResultCardProps[];
  focusedItemIndex?: number;
  resultCardsRef?: RefObject<(HTMLDivElement | null)[] | null>; // Updated type to HTMLAnchorElement
  setOpenDialog?: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-grow px-4 pt-2">
      <OverlayScrollbarsComponent
        defer
        element="div"
        options={{
          scrollbars: {
            theme: "os-theme-dark",
            autoHide: "never",
          },
        }}
        className="invisible__overlayscrollbar relative h-full w-full flex-grow overflow-y-auto sm:h-[312px]"
      >
        <div className="absolute left-0 top-0 w-full flex-grow">
          <div className="flex h-auto w-full flex-col gap-y-2 pb-2 sm:pb-4">
            {data.map((item, index) => (
              <GlobalSearchResultCard
                key={item.mint + index}
                {...item}
                isFocused={index === focusedItemIndex}
                setOpenDialog={setOpenDialog || (() => {})}
                ref={
                  resultCardsRef
                    ? (el) => {
                        if (resultCardsRef.current) {
                          resultCardsRef.current[index] = el;
                        }
                      }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
