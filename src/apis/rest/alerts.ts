import axios from "@/libraries/axios";
import { Alert } from "@/types/alerts";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

export const getAlerts = async (): Promise<Alert[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/alerts");

  try {
    const { data } = await axios.get<Alert[]>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch alerts",
      );
    }
    throw new Error("Failed to fetch alerts");
  }
};
