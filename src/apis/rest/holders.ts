import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { ChartHolderInfo } from "@/types/ws-general";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

export const getHolders = async ({
  mint,
  filter,
}: {
  mint: string;
  filter: "holders" | "top10" | "insiders" | "snipers";
}): Promise<ChartHolderInfo[] | null> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/charts/holders");

  try {
    if (filter === "holders") {
      return null;
    }
    const { data } = await axios.get<ChartHolderInfo[] | null>(API_BASE_URL, {
      withCredentials: false,
      params: {
        mint,
        filter,
      },
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch chart holders",
      );
    }
    throw new Error("Failed to fetch chart holders");
  }
};
