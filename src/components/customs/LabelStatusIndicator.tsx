import { ToggleStatusType } from "@/types/global";

type LabelStatusIndicatorProps = {
  status: ToggleStatusType;
};

export default function LabelStatusIndicator({
  status = "ON",
}: LabelStatusIndicatorProps) {
  const indicatorStatusColor = status === "ON" ? "#85D6B1" : "#F65B93";

  return (
    <div
      style={{
        background: indicatorStatusColor,
        boxShadow: `0px 0px 4px 1.5px ${indicatorStatusColor}`,
      }}
      className="-mb-[1px] aspect-square h-2 w-2 rounded-full duration-300"
    ></div>
  );
}
