import { cn } from "@/libraries/utils";
import React, { ReactElement, ElementType, ComponentPropsWithRef } from "react";

type BaseProps<C extends ElementType> = {
  as?: C;
  variant?: "gray" | "primary" | "rounded";
  prefixIcon?: ReactElement;
  suffixIcon?: ReactElement;
  isLoading?: boolean;
  fullWidth?: boolean;
  size?: "long" | "short";
  className?: string;
  children?: React.ReactNode;
};

// Type for combined props, taking into account the element type
export type PolymorphicComponentProps<C extends ElementType> = BaseProps<C> &
  Omit<ComponentPropsWithRef<C>, keyof BaseProps<C>>;

// Component with proper type inference
export const BaseButton = <C extends ElementType = "button">({
  as,
  children,
  className,
  variant = "gray",
  prefixIcon,
  suffixIcon,
  isLoading,
  size = "long",
  disabled,
  fullWidth,
  ...props
}: PolymorphicComponentProps<C>) => {
  // Determine the element to render
  const Component = as || "button";

  const variants = {
    gray: {
      long: "gb__white__btn__long bg-white/[6%] hover:bg-white/[16%] focus:bg-white/[16%] disabled:bg-white/[4%] py-1.5 text-fontColorPrimary disabled:brightness-75",
      short:
        "gb__white__btn bg-white/[6%] hover:bg-white/[16%] focus:bg-white/[16%] disabled:bg-white/[4%] aspect-square text-fontColorPrimary disabled:brightness-75",
    },
    primary: {
      long: "gb__primary__btn bg-primary hover:bg-primary-hover focus:bg-primary-hover disabled:bg-primary-disable py-1.5 text-[#080811]",
      short:
        "gb__primary__btn__long bg-primary hover:bg-primary-hover focus:bg-primary-hover disabled:bg-primary-disable aspect-square text-[#080811]",
    },
    rounded: {
      long: "border border-[#242436] rounded-full bg-white/[4%] hover:bg-primary/[8%] hover:border-primary disabled:bg-white/[5%] disabled:border-white/[2%] py-1.5 focus:border-white/[5%] focus:bg-primary/[8%] border-solid hover:text-primary text-fontColorPrimary",
      short:
        "border border-[#242436] rounded-full bg-white/[4%] hover:bg-primary/[8%] hover:border-primary disabled:bg-white/[5%] disabled:border-white/[2%] aspect-square focus:border-white/[5%] focus:bg-primary/[8%] border-solid hover:text-primary text-fontColorPrimary",
    },
  };

  // Only apply disabled props to elements that support it (like button)
  const disabledProps =
    Component === "button" ? { disabled: disabled || isLoading } : {};

  return (
    <Component
      suppressHydrationWarning
      className={cn(
        "group/button no-border relative inline-flex flex-shrink-0 items-center justify-center gap-x-2 rounded-[8px] border-dashed border-transparent font-geistSemiBold font-medium transition-all duration-300 ease-out focus:border-white",
        // Handle cursor state
        (disabled || isLoading) && "cursor-not-allowed",
        // Handle width
        fullWidth && "w-full",
        // Handle padding based on icons
        size === "long" && prefixIcon && suffixIcon
          ? "px-3"
          : size === "long" && prefixIcon
            ? "pl-3 pr-4"
            : size === "long" && suffixIcon
              ? "pl-4 pr-3"
              : "px-3",
        variants[variant][size],
        className,
      )}
      {...disabledProps}
      {...props}
    >
      {prefixIcon}
      {children}
      {suffixIcon}
      {isLoading && <LoadingSpinner />}
    </Component>
  );
};

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
  </div>
);

export default BaseButton;
