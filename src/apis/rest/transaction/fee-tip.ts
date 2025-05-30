import { getBaseURLBasedOnRegion } from "@/utils/getBaseURLBasedOnRegion";
import axios, { AxiosError } from "axios";

export const getFeeTip = async (): Promise<any> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/fee-tip");
  try {
    const { data } = await axios.get(API_BASE_URL);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Transaction failed");
    }
    throw new Error("Failed to submit transaction");
  }
};
