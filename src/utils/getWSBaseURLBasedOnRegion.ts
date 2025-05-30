import cookies from "js-cookie";

export const getWSBaseURLBasedOnRegion = (): string => {
  const region = (cookies.get("_api_region") || "US") as "US" | "EU" | "ASIA";

  const WS_BASED_ON_REGION_MAP = {
    US: process.env.NEXT_PUBLIC_WS_MAIN_URL_US_SERVER!,
    EU: process.env.NEXT_PUBLIC_WS_MAIN_URL_EU_SERVER!,
    ASIA: process.env.NEXT_PUBLIC_WS_MAIN_URL_ASIA_SERVER!,
  };

  const finalApiEndpoint =
    process.env.NEXT_PUBLIC_NODE_ENV === "production"
      ? WS_BASED_ON_REGION_MAP[region]
      : process.env.NEXT_PUBLIC_WS_MAIN_URL;

  if (!finalApiEndpoint) {
    console.error("API base URL is undefined!");
  }

  return finalApiEndpoint as string;
};
