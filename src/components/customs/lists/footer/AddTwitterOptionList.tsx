"use client";

// ######## Components 🧩 ########
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import AddTwitterOptionCard from "../../cards/footer/AddTwitterOptionCard";

export default function AddTwitterOptionList({
  data,
  handleAddAccount,
  handleCloseOptionPopover,
}: {
  data: {
    name: string;
    symbol: string;
    mintAddress: string;
    image: string;
  }[];
  handleAddAccount: (walletInfo: {
    name: string;
    symbol: string;
    mintAddress: string;
    image: string;
  }) => void;
  handleCloseOptionPopover: () => void;
}) {
  return (
    <OverlayScrollbarsComponent
      defer
      element="div"
      className="modal__overlayscrollbar relative h-[288px] w-full flex-grow overflow-y-scroll rounded-[8px]"
    >
      <div className="absolute left-0 top-0 w-full flex-grow">
        <div className="flex h-auto w-full flex-col gap-y-1 px-2 pt-2">
          {data.map((item, index) => (
            <AddTwitterOptionCard
              key={item.mintAddress + index}
              {...item}
              handleAddAccount={handleAddAccount}
              handleCloseOptionPopover={handleCloseOptionPopover}
            />
          ))}
        </div>
      </div>
    </OverlayScrollbarsComponent>
  );
}
