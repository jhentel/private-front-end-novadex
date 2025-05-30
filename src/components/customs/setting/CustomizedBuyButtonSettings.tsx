import { ButtonSetting } from "@/apis/rest/settings/settings";

const paddingStyles = {
  normal: {
    paddingInline: "calc(0.25rem*2)", // X
    paddingBlock: "calc(0.25rem*0.75)", // Y
  },
  large: {
    paddingInline: "calc(0.25rem*2.75)", // X
    paddingBlock: "calc(0.25rem*1.5)", // Y
  },
  extralarge: {
    paddingInline: "calc(0.25rem*3.5)", // X
    paddingBlock: "calc(0.25rem*2.25)", // Y
  },
  doubleextralarge: {
    paddingInline: "calc(0.25rem*4.25)", // X
    paddingBlock: "calc(0.25rem*3)", // Y
  },
  tripleextralarge: {
    paddingInline: "calc(0.25rem*5.75)", // X
    paddingBlock: "calc(0.25rem*4)", // Y
  },
  quadripleextralarge: {
    paddingInline: "calc(0.25rem*6.5)", // X
    paddingBlock: "calc(0.25rem*4.75)", // Y
  },
};

export const quickBuyButtonStyles = {
  normal: {
    default: {
      paddingRight: "calc(0.25rem*3)",
      paddingLeft: "calc(0.25rem*2.5)",
      paddingBlock: "calc(0.25rem*0)", // Y
    },
    large: {
      paddingRight: "calc(0.25rem*5)",
      paddingLeft: "calc(0.25rem*4.5)",
      paddingBlock: "calc(0.25rem*0)", // Y
    },
  },
  large: {
    default: {
      paddingRight: "calc(0.25rem*3.75)",
      paddingLeft: "calc(0.25rem*3.25)",
      paddingBlock: "calc(0.25rem*4)", // Y
    },
    large: {
      paddingRight: "calc(0.25rem*6)",
      paddingLeft: "calc(0.25rem*5.5)",
      paddingBlock: "calc(0.25rem*4)", // Y
    },
  },
  extralarge: {
    default: {
      paddingRight: "calc(0.25rem*4.50)",
      paddingLeft: "calc(0.25rem*4)",
      paddingBlock: "calc(0.25rem*5)", // Y
    },
    large: {
      paddingRight: "calc(0.25rem*7)",
      paddingLeft: "calc(0.25rem*6.5)",
      paddingBlock: "calc(0.25rem*5)", // Y
    },
  },
  doubleextralarge: {
    default: {
      paddingRight: "calc(0.25rem*5.25)",
      paddingLeft: "calc(0.25rem*4.75)",
      paddingBlock: "calc(0.25rem*6)", // Y
    },
    large: {
      paddingRight: "calc(0.25rem*8)",
      paddingLeft: "calc(0.25rem*7.5)",
      paddingBlock: "calc(0.25rem*6)", // Y
    },
  },
  tripleextralarge: {
    default: {
      paddingRight: "calc(0.25rem*6)", // +0.75 from previous
      paddingLeft: "calc(0.25rem*5.5)", // +0.75 from previous
      paddingBlock: "calc(0.25rem*7)", // +1 from previous
    },
    large: {
      paddingRight: "calc(0.25rem*9)", // +1 from previous
      paddingLeft: "calc(0.25rem*8.5)", // +1 from previous
      paddingBlock: "calc(0.25rem*7)", // +1 from previous
    },
  },
  quadripleextralarge: {
    default: {
      paddingRight: "calc(0.25rem*6.75)", // +0.75 from previous
      paddingLeft: "calc(0.25rem*6.25)", // +0.75 from previous
      paddingBlock: "calc(0.25rem*8)", // +1 from previous
    },
    large: {
      paddingRight: "calc(0.25rem*10)", // +1 from previous
      paddingLeft: "calc(0.25rem*9.5)", // +1 from previous
      paddingBlock: "calc(0.25rem*8)", // +1 from previous
    },
  },
};

const CustomizedBuyButtonSettings = ({ option }: { option: ButtonSetting }) => {
  return (
    <div
      className="flex flex-1 items-center justify-center gap-0.5 rounded-[40px] bg-[#2B2B3B]"
      style={paddingStyles[option]}
    >
      <svg
        width="17"
        height="16"
        viewBox="0 0 17 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.58238 2.81098C9.58238 2.00885 8.54206 1.69388 8.09712 2.36128L3.7378 8.90026C3.37863 9.43902 3.76484 10.1607 4.41235 10.1607H7.42049V13.1866C7.42049 13.9887 8.46081 14.3037 8.90575 13.6363L13.2651 7.0973C13.6242 6.55854 13.238 5.83688 12.5905 5.83688H9.58238V2.81098Z"
          fill="#FCFCFD"
        />
      </svg>
      <svg
        width="17"
        height="16"
        viewBox="0 0 17 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.44937 10.7074C4.52178 10.6282 4.62135 10.582 4.72694 10.582H14.303C14.478 10.582 14.5655 10.813 14.4418 10.9483L12.5501 13.0171C12.4777 13.0963 12.3782 13.1425 12.2726 13.1425H2.69647C2.52148 13.1425 2.43399 12.9115 2.55769 12.7762L4.44937 10.7074Z"
          fill="url(#paint0_linear_40_8478)"
        />
        <path
          d="M4.44937 2.98305C4.5248 2.90386 4.62436 2.85767 4.72694 2.85767H14.303C14.478 2.85767 14.5655 3.08863 14.4418 3.22392L12.5501 5.29273C12.4777 5.37192 12.3782 5.41811 12.2726 5.41811H2.69647C2.52148 5.41811 2.43399 5.18714 2.55769 5.05186L4.44937 2.98305Z"
          fill="url(#paint1_linear_40_8478)"
        />
        <path
          d="M12.5501 6.82045C12.4777 6.74126 12.3782 6.69507 12.2726 6.69507H2.69647C2.52148 6.69507 2.43399 6.92604 2.55769 7.06132L4.44937 9.13013C4.52178 9.20932 4.62135 9.25551 4.72694 9.25551H14.303C14.478 9.25551 14.5655 9.02454 14.4418 8.88926L12.5501 6.82045Z"
          fill="url(#paint2_linear_40_8478)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_40_8478"
            x1="13.3882"
            y1="1.62195"
            x2="5.78103"
            y2="14.9453"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_40_8478"
            x1="10.4904"
            y1="-0.0327788"
            x2="2.88316"
            y2="13.2906"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_40_8478"
            x1="11.9301"
            y1="0.789286"
            x2="4.32287"
            y2="14.1126"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
      </svg>
      <p className="font-geist ml-0.5 mr-[0.23rem] text-white">0.3</p>
    </div>
  );
};

export default CustomizedBuyButtonSettings;
