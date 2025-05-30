import * as React from "react";
import { cn } from "@/libraries/utils";

/**
 * ---------------------------------------------------------------------------
 * 1) The lower-level input renderer ("RenderInput")
 * ---------------------------------------------------------------------------
 */
const RenderInput = React.memo(
  React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<"input"> & {
      className?: string;
      prefixEl?: React.ReactNode; // changed to ReactNode
      suffixEl?: React.ReactNode; // changed to ReactNode
      isNumeric?: boolean;
      decimalScale?: number;
      isError?: boolean;
      width?: string;
      onNumericValueChange?: (values: {
        floatValue: number | undefined;
      }) => void;
      style?: React.CSSProperties;
      isExpandable?: boolean;
      customWidth: number | string | undefined;
      setCustomWidth?: React.Dispatch<
        React.SetStateAction<number | string | undefined>
      >;
      rerenderTrigger?: number; // For rerendering
    }
  >(
    (
      {
        className,
        type,
        prefixEl,
        suffixEl,
        isNumeric,
        decimalScale = 9,
        onNumericValueChange,
        isError,
        width,
        style,
        isExpandable = false,
        customWidth,
        setCustomWidth,
        ...props
      },
      ref,
    ) => {
      // Add state for display value
      const [displayValue, setDisplayValue] = React.useState(
        props.value?.toString() || "",
      );

      const measureRef = React.useRef<HTMLSpanElement>(null);

      // Determine whether we have prefix/suffix for styling
      const hasPrefix = !!prefixEl;
      const hasSuffix = !!suffixEl;

      React.useEffect(() => {
        if (props.value || props.value === 0) {
          setDisplayValue(props.value?.toString());
        }
      }, [props.value]);

      React.useEffect(() => {
        if (measureRef.current && isExpandable) {
          const contentWidth = measureRef.current.offsetWidth;
          const newWidth = Math.max(96, contentWidth + 80); // 80px for padding and icons
          setCustomWidth?.(newWidth);
        }
      }, [displayValue]);

      if (isNumeric) {
        return (
          <>
            {isExpandable && (
              <span
                ref={measureRef}
                style={{
                  visibility: "hidden",
                  position: "absolute",
                  whiteSpace: "pre",
                  fontSize: "14px", // match input font size
                  fontFamily: "inherit",
                }}
              >
                {displayValue}
              </span>
            )}
            <input
              type="text"
              ref={ref}
              className={cn(
                "base__input__style",
                "flex h-8 w-full rounded-[8px] border border-border bg-transparent px-3 py-1 text-sm text-fontColorPrimary shadow-sm transition-colors",
                hasPrefix ? "pl-10" : "pl-4",
                hasSuffix ? "pr-10" : "pr-4",
                className,
                isError ? "border-destructive bg-destructive/[4%]" : "",
              )}
              {...props}
              value={displayValue}
              onChange={(e) => {
                const value = e.target.value;

                // Allow empty string, decimal point, and numbers with decimals
                if (
                  value === "" ||
                  value === "." ||
                  /^\d*\.?\d*$/.test(value)
                ) {
                  // Update display value immediately
                  setDisplayValue(value);

                  if (onNumericValueChange) {
                    // Handle empty or decimal point
                    if (value === "" || value === ".") {
                      onNumericValueChange({ floatValue: undefined });
                      return;
                    }

                    // Convert to number and validate
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      onNumericValueChange({ floatValue: numValue });
                    }
                  }
                  // props.onChange?.(e);
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value === "" || value === ".") {
                  const zeroValue = "0";
                  setDisplayValue(zeroValue);
                  if (onNumericValueChange) {
                    onNumericValueChange({ floatValue: 0 });
                  }
                }
                props.onBlur?.(e);
              }}
              style={{ ...style, width: customWidth }}
            />
          </>
        );
      }

      // Non-numeric input
      return (
        <input
          type={type}
          className={cn(
            "base__input__style",
            "flex h-8 w-full rounded-[8px] border border-border bg-transparent px-3 py-1 text-sm text-fontColorPrimary shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-neutral-950 placeholder:text-fontColorSecondary invalid:border-destructive invalid:bg-destructive/[4%]",
            hasPrefix ? "pl-10" : "pl-4",
            hasSuffix ? "pr-10" : "pr-4",
            className,
            isError ? "border-destructive bg-destructive/[4%]" : "",
          )}
          ref={ref}
          style={style}
          {...props}
        />
      );
    },
  ),
);
RenderInput.displayName = "RenderInput";

/**
 * ---------------------------------------------------------------------------
 * 2) The higher-level "Input" component
 * ---------------------------------------------------------------------------
 */
const Input = React.memo(
  React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<"input"> & {
      parentClassName?: string;
      prefixEl?: React.ReactNode; // Use ReactNode or ReactElement
      suffixEl?: React.ReactNode; // Use ReactNode or ReactElement
      isNumeric?: boolean;
      decimalScale?: number;
      isError?: boolean;
      width?: string;
      onNumericValueChange?: (values: {
        floatValue: number | undefined;
      }) => void;
      style?: React.CSSProperties;
      isExpandable?: boolean;
      rerenderTrigger?: number; // For rerendering
    }
  >(
    (
      {
        className,
        prefixEl,
        suffixEl,
        parentClassName,
        isNumeric,
        decimalScale,
        onNumericValueChange,
        width,
        style,
        isExpandable = false,
        ...props
      },
      ref,
    ) => {
      const [customWidth, setCustomWidth] = React.useState<
        number | string | undefined
      >(width ?? undefined);
      /**
       * If we have either prefixEl or suffixEl, we wrap
       * the <RenderInput> in a container <div> so we can
       * absolutely position the prefix/suffix.
       */
      if (prefixEl || suffixEl) {
        return (
          <div
            className={cn(
              "relative flex w-full items-center justify-center",
              parentClassName,
            )}
            style={{ ...style, width: customWidth }}
          >
            {/* The prefix element (e.g., icon) */}
            {prefixEl}

            {/* The actual input */}
            <RenderInput
              className={className}
              autoComplete="off"
              prefixEl={prefixEl} // Pass the ReactNode directly
              suffixEl={suffixEl} // Pass the ReactNode directly
              isNumeric={isNumeric}
              decimalScale={decimalScale}
              onNumericValueChange={onNumericValueChange}
              ref={ref}
              style={{ ...style, width: customWidth }}
              isExpandable={isExpandable}
              customWidth={customWidth}
              setCustomWidth={setCustomWidth}
              {...props}
            />

            {/* The suffix element (e.g., icon or text) */}
            {suffixEl}
          </div>
        );
      }

      /**
       * If we have no prefix/suffix, just render the input directly.
       */
      return (
        <RenderInput
          style={{ ...style, width: customWidth }}
          className={className}
          autoComplete="off"
          isNumeric={isNumeric}
          decimalScale={decimalScale}
          onNumericValueChange={onNumericValueChange}
          ref={ref}
          isExpandable={isExpandable}
          customWidth={customWidth}
          setCustomWidth={setCustomWidth}
          {...props}
        />
      );
    },
  ),
);
Input.displayName = "Input";

export { Input };
