// ######## Components 🧩 ########
import { Label } from "@/components/ui/label";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import Image from "next/image";

//######## Types 🗨️ ########
import { Size } from "./types";

export const imageList = [
  {
    id: "image1",
    src: "/images/pnl-tracker/bg-theme-1.webp",
    label: "Theme 1",
    themeId: "theme1",
    size: { width: 180, height: 70 },
    availableCurrency: "all",
  },
  {
    id: "image2",
    src: "/images/pnl-tracker/bg-theme-2.webp",
    label: "Theme 2",
    themeId: "theme2",
    thumbnail: "/images/pnl-tracker/thumbnail-theme-2.png",
    size: { width: 250, height: 70 },
    availableCurrency: "usd-sol",
  },
  // {
  //   id: "image3",
  //   src: "/images/pnl-tracker/bg-theme-3.webp",
  //   label: "Theme 3",
  //   themeId: "theme3",
  //   thumbnail: "/images/pnl-tracker/thumbnail-theme-3.png",
  //   size: { width: 460, height: 680 },
  // },
  {
    id: "image4",
    src: "/images/pnl-tracker/bg-theme-4.webp",
    label: "Theme 4",
    themeId: "theme4",
    thumbnail: "/images/pnl-tracker/thumbnail-theme-4.png",
    size: { width: 250, height: 70 },
    availableCurrency: "usd-sol",
  },
  {
    id: "image5",
    src: "/images/pnl-tracker/bg-theme-5.webp",
    label: "Theme 5",
    themeId: "theme5",
    thumbnail: "/images/pnl-tracker/thumbnail-theme-5.png",
    size: { width: 250, height: 70 },
    availableCurrency: "all",
  },
  {
    id: "image6",
    src: "/images/pnl-tracker/bg-theme-6.webp",
    label: "Theme 6",
    themeId: "theme6",
    thumbnail: "/images/pnl-tracker/thumbnail-theme-6.png",
    size: { width: 250, height: 70 },
    availableCurrency: "usd-sol",
  },
  // {
  //   id: "image7",
  //   src: "/images/pnl-tracker/bg-theme-7.png",
  //   label: "Theme 7",
  //   themeId: "theme7",
  //   thumbnail: "/images/pnl-tracker/thumbnail-theme-7.png",
  //   size: { width: 460, height: 250 },
  // },
  // {
  //   id: "image8",
  //   src: "/images/pnl-tracker/bg-theme-8.png",
  //   label: "Theme 8",
  //   themeId: "theme8",
  //   thumbnail: "/images/pnl-tracker/thumbnail-theme-8.png",
  //   size: { width: 760, height: 150 },
  // },
  {
    id: "image9",
    src: "/images/pnl-tracker/bg-theme-9.webp",
    label: "Theme 9",
    themeId: "theme9",
    size: { width: 180, height: 70 },
    availableCurrency: "all",
  },
  {
    id: "image10",
    src: "/images/pnl-tracker/bg-theme-10.webp",
    label: "Theme 10",
    themeId: "theme10",
    size: { width: 180, height: 70 },
    availableCurrency: "all",
  },
];

interface PNLImageSelectorProps {
  selectedTheme: string;
  setSelectedTheme?: (theme: string) => void;
  setSize?: (value: Size) => void;
}
const PnLImageSelector = ({
  selectedTheme,
  setSelectedTheme,
  setSize,
}: PNLImageSelectorProps) => {
  const handleImageChange = (themeId: string, size: Size) => {
    setSize!(size);
    setSelectedTheme!(themeId);
  };

  return (
    <div
      className="flex w-full flex-col gap-2"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Label className="font-geistRegular text-xs text-fontColorSecondary">
        P&L Image
      </Label>
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="popover__overlayscrollbar h-[180px] w-full p-2 pr-2.5"
      >
        <div className="grid w-full grid-cols-2 gap-4">
          {imageList.map((image, index) => {
            const isSelected = image.themeId === selectedTheme;

            return (
              <label
                key={image.id}
                className={`relative flex h-16 w-full cursor-pointer flex-col items-start justify-start overflow-hidden rounded-[8px] border border-[#242436] ${
                  isSelected ? "ring-2 ring-fontColorAction" : ""
                }`}
              >
                <input
                  type="radio"
                  name="pnl-image"
                  value={image.src}
                  checked={isSelected}
                  onChange={() => handleImageChange(image.themeId, image.size!)}
                  className="peer absolute left-2 top-2 hidden size-4"
                />
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <Image
                  src={image.thumbnail ? image.thumbnail : image.src}
                  alt={image.label}
                  objectFit="cover"
                  fill
                  className="absolute z-[-1]"
                />
                <div className="absolute left-2 top-2">
                  {isSelected ? (
                    <div className="relative size-5 rounded-full bg-gradient-to-b from-[#FFE2FF] via-[#F0B0FF] to-[#E383FF]">
                      <div className="absolute left-1.5 top-1.5 size-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="relative size-5 rounded-full border-2 border-white" />
                  )}
                </div>
                <p className="absolute bottom-2 left-2 z-10 text-sm text-white">
                  Theme {index + 1}
                </p>
              </label>
            );
          })}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default PnLImageSelector;
