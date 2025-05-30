import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

// Types
interface SniperFooter {
  count: number;
  isRunning: boolean;
}

export interface Footer {
  walletTracker: number;
  twitter: number;
  alerts: number;
  sniper: SniperFooter;
  timestamp: number;
}

interface FooterRequest {
  section: "walletTracker" | "twitter" | "alerts" | "sniper";
}

// #################### API🔥 ####################
export const getFooterData = async (): Promise<Footer> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/footer");

  try {
    const { data } = await axios.get<Footer>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch footer data",
      );
    }
    throw new Error("Failed to fetch footer data");
  }
};

export const clearFooterSection = async (
  section: "walletTracker" | "twitter" | "alerts" | "sniper",
): Promise<Footer> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/footer/clear");

  try {
    const { data } = await axios.post<Footer>(API_BASE_URL, {
      section,
    } as FooterRequest);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to clear footer section",
      );
    }
    throw new Error("Failed to clear footer section");
  }
};
