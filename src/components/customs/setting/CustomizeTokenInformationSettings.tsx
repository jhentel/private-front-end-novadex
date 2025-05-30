import Image from "next/image";
import { TokenInformationSetting } from "@/apis/rest/settings/settings";
import { cn } from "@/libraries/utils";

const CustomizedTokenInformationSettings = ({
  option,
}: {
  option: TokenInformationSetting;
}) => {
  return (
    <div
      className={cn(
        "relative -z-0 flex w-full flex-1",
        option === "simplify" ? "aspect-[720/362]" : "aspect-[720/490]",
      )}
    >
      <Image
        src={
          option === "normal"
            ? "/images/token-information-setting-normal.png"
            : "/images/token-information-setting-simplify.png"
        }
        alt={`Thumbnail ${option}`}
        fill
        className="object-contain"
      />
    </div>
  );
};

export default CustomizedTokenInformationSettings;
