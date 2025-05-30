/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/customs/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      textShadow: {
        md: "2px 2px 4px rgba(0,0,0,0.3)",
        lg: "3px 3px 6px rgba(0,0,0,0.4)",
      },
      dropShadow: {
        "3xl": "0 35px 35px rgba(0, 0, 0, 0.25)",
        "4xl": [
          "0 15px 15px rgba(0, 0, 0, 0.65)",
          "0 35px 35px rgba(0, 0, 0, 0.25)",
          "0 45px 65px rgba(0, 0, 0, 0.15)",
        ],
      },
      fontFamily: {
        geistLight: ["var(--font-geist-light)"],
        geistRegular: ["var(--font-geist-regular)"],
        geistMedium: ["var(--font-geist-semibold)"],
        geistSemiBold: ["var(--font-geist-semibold)"],
        geistBold: ["var(--font-geist-bold)"],
        geistBlack: ["var(--font-geist-black)"],
        geistMonoLight: ["var(--font-geist-mono-light)"],
        geistMonoRegular: ["var(--font-geist-mono-regular)"],
        geistMonoMedium: ["var(--font-geist-mono-semibold)"],
        geistMonoSemiBold: ["var(--font-geist-mono-semibold)"],
        geistMonoBold: ["var(--font-geist-mono-bold)"],
        outfitSemiBold: ["var(--font-outfit-semibold)"],
        outfitBold: ["var(--font-outfit-bold)"],
        outfitBlack: ["var(--font-outfit-black)"],
      },
      colors: {
        background: {
          DEFAULT: "hsl(var(--background))",
          "1": "hsl(var(--background-1))",
        },
        customGreen: "#8CD9B6",
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          disable: "hsl(var(--primary-disable))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
        },
        shadeTable: {
          DEFAULT: "hsl(var(--shade-table))",
        },
        shadeTableHover: {
          DEFAULT: "hsl(var(--shade-table-hover))",
        },

        // Font
        fontColorPrimary: {
          DEFAULT: "#FCFCFD",
        },
        fontColorSecondary: {
          DEFAULT: "rgb(var(--font-color-secondary))",
        },
        fontColorAction: {
          DEFAULT: "#DF74FF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        scaleBounce: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.9)" },
        },
        pulseScale: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "toast-enter": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "toast-leave": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
      },
      animation: {
        "scale-bounce": "scaleBounce 2s ease-in-out infinite",
        "scale-bounce-slow": "scaleBounce 5s ease-in-out infinite",
        "pulse-scale": "pulseScale 2s ease-in-out infinite",
        fadeOut: "fadeOut 1s ease-in-out forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 5s linear infinite",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        "toast-enter": "toast-enter 200ms ease-out",
        "toast-leave": "toast-leave 150ms ease-in forwards",
      },
      transitionDelay: {
        "0": "0ms",
        "100": "100ms",
        "150": "150ms",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar-hide"),
    require("tailwindcss-textshadow"),
    require("@tailwindcss/container-queries"),
  ],
};
export default config;
