import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { SearchTokenResult } from "@/types/search";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";
import { GlobalSearchModalFilter } from "@/components/customs/modals/GlobalSearchModal";

export const searchTokens = async (
  params: GlobalSearchModalFilter & { q: string },
): Promise<SearchTokenResult[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/tokens/search");

  try {
    const { data } = await axios.get<SearchTokenResult[]>(API_BASE_URL, {
      params,
      // params: { q: query },
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to search tokens",
      );
    }
    throw new Error("Failed to search tokens");
  }
};
