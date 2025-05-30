import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "../../../utils/getBaseURLBasedOnRegion";

// #################### API🔥 ####################
export const getServerTime = async (): Promise<number> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/server-time");

  try {
    const { data } = await axios.get<number>(API_BASE_URL);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch server time",
      );
    }
    throw new Error("Failed to fetch server time");
  }
};
