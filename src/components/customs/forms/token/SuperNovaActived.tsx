import Image from "next/image";
import { HTMLAttributes } from "react";

interface SuperNovaActivedProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}
export const SuperNovaActived = ({
  title = "SuperNova Activated",
  ...props
}: SuperNovaActivedProps) => {
  return (
    <div
      className="flex items-center gap-[2px] rounded bg-[#FFEF9E24] px-1 py-[1px]"
      {...props}
    >
      <Image
        src="/icons/super-nova.svg"
        alt="Super Nova"
        height={14}
        width={14}
        quality={50}
        className="shrink-0 object-contain"
      />
      <p className="bg-[radial-gradient(292.69%_130.83%_at_29.78%_4.38%,#FFFAE2_0%,#FFF8D2_3%,#FFF2B0_10%,#FFEE96_17%,#FFEA83_25%,#FFE877_32%,#FFE874_41%,#C0993E_73%,#957324_100%)] bg-clip-text text-[10px] font-medium text-transparent">
        {title}
      </p>
    </div>
  );
};
