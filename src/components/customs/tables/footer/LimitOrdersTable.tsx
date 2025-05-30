"use client";

// ######## Libraries 📦 & Hooks 🪝 ######## 
// ######## Components 🧩 ########
import LimitOrdersCard from "@/components/customs/cards/footer/LimitOrdersCard";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import HeadCol from "@/components/customs/tables/HeadCol";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export default function LimitOrdersTable() {
    const width = useWindowSizeStore((state) => state.width);


  const HeaderData = [
    {
      label: "Token",
      className: "min-w-[180px]",
    },
    {
      label: "Type",
      className: "min-w-[75px]",
    },
    {
      label: "Trigger",
      className: "min-w-[120px]",
    },
    {
      label: "Wallet Name",
      className: "min-w-[120px]",
    },
    {
      label: "Expiry",
      className: "min-w-[105px]",
    },
    {
      label: "Buy/Sell Amount",
      className: "min-w-[150px]",
    },
    {
      label: "Actions",
      className: "min-w-[110px] justify-end",
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

            <div className="flex h-auto w-full flex-col max-md:gap-2 max-md:p-3">
              {Array.from({ length: 32 }).map((_, index) => (
                <LimitOrdersCard key={index} />
              ))}
            </div>
          </div>
        </OverlayScrollbarsComponent>
      )}
    </div>
  );
}
