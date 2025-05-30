"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import { HiCamera } from "react-icons/hi2";
import Copy from "../../Copy";

export type AddTwitterOptionCardProps = {
  name: string;
  symbol: string;
  mintAddress: string;
  image: string;
  handleAddAccount: (walletInfo: {
    name: string;
    symbol: string;
    mintAddress: string;
    image: string;
  }) => void;
  handleCloseOptionPopover: () => void;
};

export default function AddTwitterOptionCard({
  name,
  symbol,
  mintAddress,
  image,
  handleAddAccount,
  handleCloseOptionPopover,
}: AddTwitterOptionCardProps) {
  const handleGoogleLensSearch = (event: React.MouseEvent) => {
    event.stopPropagation();

    const imageUrl = `${process.env.NEXT_PUBLIC_WEB_URL}${image}`;
    // console.log(imageUrl);
    const googleLensSearchUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`;
    window.open(googleLensSearchUrl, "_blank");
  };

  const handleCopyMintAddress = (event: React.MouseEvent) => {
    event.stopPropagation();

    navigator.clipboard
      .writeText(mintAddress)
      .then(() => {})
      .catch((err) => {
        const textArea = document.createElement("textarea");
        textArea.value = mintAddress;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          console.warn("Failed to copy address:", err);
        }
        document.body.removeChild(textArea);
      });
  };

  return (
    <div
      onClick={() => {
        handleAddAccount({
          name,
          symbol,
          mintAddress,
          image,
        });
        handleCloseOptionPopover();
      }}
      className="flex h-[56px] w-full cursor-pointer items-center justify-between gap-x-3 overflow-hidden rounded-[6px] bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[6%]"
    >
      <div className="group/avatar relative aspect-square h-8 w-8 flex-shrink-0">
        <Image
          src={image}
          alt="Token Image"
          fill
          quality={100}
          className="object-contain"
        />

        <div
          onClick={handleGoogleLensSearch}
          className="invisible absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center bg-black/20 opacity-0 duration-150 group-hover/avatar:visible group-hover/avatar:opacity-100"
        >
          <HiCamera className="text-[24px] text-fontColorPrimary" />
        </div>
      </div>

      <div className="flex h-[32px] w-full flex-col">
        <div className="-mt-0.5 flex items-center gap-x-[4px]">
          <h4 className="text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {name}
          </h4>
          <Copy value={mintAddress} />
        </div>

        <span className="text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
          {symbol}
        </span>
      </div>
    </div>
  );
}
