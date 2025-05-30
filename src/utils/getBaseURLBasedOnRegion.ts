import cookies from "js-cookie";

export const getBaseURLBasedOnRegion = (basePath: string): string => {
  const region = (cookies.get("_api_region") || "US") as "US" | "EU" | "ASIA";

  const API_BASED_ON_REGION_MAP = {
    US: process.env.NEXT_PUBLIC_REST_MAIN_URL_US_SERVER!,
    EU: process.env.NEXT_PUBLIC_REST_MAIN_URL_EU_SERVER!,
    ASIA: process.env.NEXT_PUBLIC_REST_MAIN_URL_ASIA_SERVER!,
  };

  const finalApiEndpoint =
    process.env.NEXT_PUBLIC_NODE_ENV === "production"
      ? API_BASED_ON_REGION_MAP[region]
      : process.env.NEXT_PUBLIC_REST_MAIN_URL;

  if (!finalApiEndpoint) {
    throw new Error("API base URL is undefined!");
  }

  const cleanedBase = finalApiEndpoint.replace(/\/$/, "");
  const cleanedPath = basePath?.replace(/^\//, "");

  return basePath ? `${cleanedBase}/${cleanedPath}` : cleanedBase;
};
