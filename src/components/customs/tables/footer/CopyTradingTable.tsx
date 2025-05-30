"use client";

// ######## Libraries 📦 & Hooks 🪝 ######## 
// ######## Components 🧩 ########
import CopyTradingCard from "@/components/customs/cards/footer/CopyTradingCard";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import HeadCol from "@/components/customs/tables/HeadCol";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export default function CopyTradingTable() {
    const width = useWindowSizeStore((state) => state.width);


  const HeaderData = [
    {
      label: "Task Status",
      className: "min-w-[50px]",
    },
    {
      label: "Wallet Address",
      className: "min-w-[100px]",
    },
    {
      label: "SOL",
      className: "min-w-[100px]",
    },
    {
      label: "Trades",
      className: "min-w-[150px]",
    },
    {
      label: "Presets",
      className: "min-w-[150px]",
    },
    {
      label: "Actions",
      className: "min-w-[150px] justify-end",
    },
  ];

  return (
    <div className="flex w-full flex-grow flex-col">
      {width && (
        <OverlayScrollbarsComponent
          defer
          element="div"
          className="table__modal__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
          options={{
            overflow: {
              x: width > 900 || width < 730 ? "hidden" : "scroll",
              y: "scroll",
            },
          }}
        >
          <div className="absolute left-0 top-0 flex w-full flex-grow flex-col pb-5">
            <div className="header__table__container">
              {HeaderData.map((item, index) => (
                <HeadCol key={index} {...item} />
              ))}
            </div>

            <div className="flex h-auto w-full flex-col gap-2 p-3 md:gap-0 md:p-0">
              {Array.from({ length: 32 }).map((_, index) => (
                <CopyTradingCard key={index} />
              ))}
            </div>
          </div>
        </OverlayScrollbarsComponent>
      )}
    </div>
  );
}
