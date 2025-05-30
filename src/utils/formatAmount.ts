export const formatAmountDollar = (
  value: number | string,
  formatType: "prefix" | "suffix" = "prefix",
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "-";

  // Special case: if number is very small (positive or negative),
  // use the other formatter but add dollar sign or suffix
  if (Math.abs(num) < 0.1) {
    const formatted = formatAmountWithoutLeadingZero(num);
    if (formatType === "suffix") {
      return num < 0 ? `-${formatted.substring(1)} USD` : `${formatted} USD`;
    }
    return num < 0 ? `-$${formatted.substring(1)}` : `$${formatted}`;
  }

  const units = [
    { threshold: 1_000_000_000_000, suffix: "T" },
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];

  const formatNumber = (number: number) => {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // Use absolute value for threshold comparison
  for (const { threshold, suffix } of units) {
    if (Math.abs(num) >= threshold) {
      const normalized = num / threshold;
      const formattedValue = formatNumber(normalized) + suffix;

      if (formatType === "suffix") {
        return num < 0 ? `-${formattedValue} USD` : `${formattedValue} USD`;
      }
      return num < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
    }
  }

  // Handle base case (numbers less than 1K)
  const formattedValue = formatNumber(Math.abs(num));
  if (formatType === "suffix") {
    return num < 0 ? `-${formattedValue} USD` : `${formattedValue} USD`;
  }
  return num < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
};

export const formatAmountDollarPnL = (
  value: number | string,
  formatType: "prefix" | "suffix" = "prefix",
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "-";

  // Special case: if number is very small (positive or negative),
  // use the other formatter but add dollar sign or suffix
  if (Math.abs(num) < 0.1) {
    const formatted = formatAmountWithoutLeadingZero(num);
    if (formatType === "suffix") {
      return num < 0 ? `-${formatted.substring(1)} USD` : `${formatted} USD`;
    }
    return num < 0 ? `-$${formatted.substring(1)}` : `$${formatted}`;
  }

  const units = [
    { threshold: 1_000_000_000_000, suffix: "T" },
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];

  const formatNumber = (number: number) => {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // Use absolute value for threshold comparison
  for (const { threshold, suffix } of units) {
    if (Math.abs(num) >= threshold) {
      const normalized = num / threshold;
      const formattedValue = formatNumber(normalized) + suffix;

      if (formatType === "suffix") {
        return num < 0 ? `-${formattedValue} USD` : `${formattedValue} USD`;
      }
      return num < 0
        ? `-$${formattedValue.replace("-", "")}`
        : `$${formattedValue}`;
    }
  }

  // Handle base case (numbers less than 1K)
  const formattedValue = formatNumber(Math.abs(num));
  if (formatType === "suffix") {
    return num < 0 ? `-${formattedValue} USD` : `${formattedValue} USD`;
  }
  return num < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
};

export const formatAmount = (
  value: number | string,
  maximumFractionDigits?: number,
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "-";

  const formatNumber = (number: number) =>
    number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: maximumFractionDigits || 4,
    });

  const units = [
    { threshold: 1_000_000_000_000, suffix: "T" },
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];

  for (const { threshold, suffix } of units) {
    if (num >= threshold) {
      return `${formatNumber(num / threshold)}${suffix}`;
    }
  }

  return `${formatNumber(num)}`;
};

export const formatCommaWithDecimal = (value: number | string): string => {
  const num = Number(value);

  if (isNaN(num)) return "-";

  return Number(num.toFixed(2)).toLocaleString();
};

export interface ScientificNumberFormat {
  leadingZeros: number;
  significantDigits: string;
}

export const formatScientific = (
  value: number | string,
): ScientificNumberFormat | null => {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num) || num >= 0.001) return null;

  const scientificStr = num.toExponential();
  const matches = scientificStr.match(/^([0-9](?:\.[0-9]+)?|0)e-([0-9]+)$/);

  if (!matches) return null;

  const [, mantissa, exponent] = matches;
  const mantissaDigits = mantissa.replace(".", "");

  const leadingZeros =
    mantissaDigits.length === 2
      ? parseInt(exponent) - 3
      : mantissaDigits.length === 1
        ? parseInt(exponent) - 2
        : parseInt(exponent) - 1;

  const significantDigits = mantissaDigits.padStart(3, "0").slice(0, 4); // Ensure 4 digits

  return {
    leadingZeros,
    significantDigits,
  };
};

export const formatMaxDecimals = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "-";

  const formatNumber = (number: number) =>
    number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const units = [
    { threshold: 1_000_000_000_000, suffix: "T" },
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];

  for (const { threshold, suffix } of units) {
    if (num >= threshold) {
      return `${formatNumber(num / threshold)}${suffix}`;
    }
  }

  return `${formatNumber(num)}`;
};

export const formatAmountWithoutLeadingZero = (
  price: number | string,
  significantDigitsCount: number = 3,
  maximumFractionDigits?: number,
  decimalPlaces?: number,
): string => {
  if (Number(price) > 1000) {
    // console.log("price🟣🟣", price);
  }
  const finalPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(finalPrice)) return "";
  if (finalPrice === 0) return "0";

  // If decimalPlaces is specified, truncate (don't round) to that many places
  if (decimalPlaces !== undefined) {
    const multiplier = Math.pow(10, decimalPlaces);
    // Truncate instead of round by using Math.floor
    const truncated =
      Math.floor(Math.abs(finalPrice) * multiplier) / multiplier;
    // Format to ensure we display all decimal places
    const formatted = truncated.toFixed(decimalPlaces);
    return finalPrice < 0 ? `-${formatted}` : formatted;
  }

  // The rest of your implementation for very small numbers
  let processedNum = Math.abs(finalPrice);
  const isNegative = finalPrice < 0;

  // Original implementation for numbers ≥ 1
  if (Math.abs(finalPrice) >= 1)
    return isNegative
      ? `-${formatAmount(Math.abs(finalPrice), maximumFractionDigits)}`
      : formatAmount(Math.abs(finalPrice), maximumFractionDigits);

  const scientificStr = processedNum.toExponential();
  // Changed regex pattern to handle negative numbers
  const matches = scientificStr.match(/^([0-9](?:\.[0-9]+)?(?:e-[0-9]+)?)$/);
  if (!matches) return "";

  const parts = scientificStr.split("e-");
  const mantissa = parts[0];
  const exponentValue = parts.length > 1 ? parseInt(parts[1]) : 0;

  let significantDigits = mantissa.replace(".", "");
  significantDigits = significantDigits
    .padEnd(significantDigitsCount, "0")
    .slice(0, significantDigitsCount);

  let formattedDigits = significantDigits.replace(/0+$/, "");
  if (formattedDigits.length === 0) formattedDigits = "0";

  let leadingZeros = exponentValue - 1;
  const subscript = toSubscript(String(leadingZeros));

  // return leadingZeros > 0
  //   ? `${isNegative ? "-" : ""}0.0${leadingZeros > 2 ? subscript : leadingZeros > 1 ? "0" : ""}${formattedDigits}`
  //   : `0.${formattedDigits}`;
  const formattedNumber =
    leadingZeros > 0
      ? `0.0${leadingZeros > 2 ? subscript : leadingZeros > 1 ? "0" : ""}${formattedDigits}`
      : `0.${formattedDigits}`;

  return isNegative ? `-${formattedNumber}` : formattedNumber;
};

export const formatAmountWithMaxTwoDigits = (
  price: number | string,
): string => {
  const finalPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(finalPrice)) return "";
  if (finalPrice === 0) return "0";
  if (finalPrice >= 1) return finalPrice.toFixed(2).replace(/\.00$/, "");

  let processedNum = Math.abs(finalPrice);
  const isNegative = finalPrice < 0;

  const scientificStr = processedNum.toExponential();
  const matches = scientificStr.match(/^([0-9](?:\.[0-9]+)?)e-([0-9]+)$/);
  if (!matches) return "";

  const [, mantissa, exponent] = matches;
  const exponentValue = parseInt(exponent);

  let significantDigits = mantissa.replace(".", "");
  significantDigits = significantDigits.padEnd(2, "0").slice(0, 2);

  let formattedDigits = significantDigits.replace(/0+$/, "");
  if (formattedDigits.length === 0) formattedDigits = "0";

  let leadingZeros = exponentValue - 1;

  return leadingZeros > 0
    ? `${isNegative ? "-" : ""}0.0${leadingZeros > 1 ? "0" : ""}${formattedDigits}`
    : `0.${formattedDigits}`;
};

function toSubscript(str: string): string {
  const subscriptMap: Record<string, string> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
  };

  return str
    .split("")
    .map((char) => subscriptMap[char] || char)
    .join("");
}

// export const formatAmountWithoutLeadingZero = (price: number): string => {
//   if (isNaN(price)) return "";

//   if (price === 0) return "0";

//   if (price >= 1) {
//     return formatAmount(price);
//   }

//   let processedNum = Math.abs(price);
//   const isNegative = price < 0;

//   const scientificStr = processedNum.toExponential();
//   const matches = scientificStr.match(/^([0-9](?:\.[0-9]+)?)e-([0-9]+)$/);

//   if (!matches) return "";

//   const [, mantissa, exponent] = matches;
//   const exponentValue = parseInt(exponent);

//   let significantDigits = mantissa.replace(".", "");

//   significantDigits = significantDigits.padEnd(2, "0").slice(0, 3);

//   const firstSignificantDigit = significantDigits[0];
//   const secondSignificantDigit =
//     significantDigits[1] === "0" && significantDigits.length === 2
//       ? ""
//       : significantDigits[1];
//   const thirdSignificantDigit =
//     significantDigits[1] !== "0" &&
//     (significantDigits[2] === "0" || significantDigits[2] === undefined)
//       ? ""
//       : significantDigits[2];

//   let finalSignificantDigits;
//   if (secondSignificantDigit === "0" && thirdSignificantDigit === "0") {
//     finalSignificantDigits = `${firstSignificantDigit || ""}`;
//   } else {
//     finalSignificantDigits = `${firstSignificantDigit || ""}${secondSignificantDigit || ""}${thirdSignificantDigit || ""}`;
//   }

//   let leadingZeros = exponentValue - 1;
//   const subscript = toSubscript(String(leadingZeros));

//   return leadingZeros > 0
//     ? `${isNegative ? "-" : ""}0.0${leadingZeros > 2 ? subscript : leadingZeros > 1 ? "0" : ""}${finalSignificantDigits}`
//     : `0.${finalSignificantDigits}`;
// };

export const formatPrice = (price?: number, decimals: number = 2): string => {
  if (!price) return "0";
  return price.toFixed(decimals);
};

export const parseFormattedNumber = (formattedStr: string): number => {
  const subscriptMap: { [key: string]: string } = {
    "₀": "0",
    "₁": "1",
    "₂": "2",
    "₃": "3",
    "₄": "4",
    "₅": "5",
    "₆": "6",
    "₇": "7",
    "₈": "8",
    "₉": "9",
  };

  return Number(
    formattedStr.replace(/0\.0([₀₁₂₃₄₅₆₇₈₉])(\d+)/, (_, subscript, digits) => {
      const zeros = subscriptMap[subscript] || "0";
      return `0.${"0".repeat(Number(zeros))}${digits}`;
    }),
  );
};
