import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { CosmoDataMessageType } from "@/types/ws-general";
import cookies from "js-cookie";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

interface GetCosmoInitialResponse {
  created: CosmoDataMessageType[];
  about_to_graduate: CosmoDataMessageType[];
  graduated: CosmoDataMessageType[];
}
interface GetCosmoFilterResponse {
  created: CosmoDataMessageType[] | null;
  about_to_graduate: CosmoDataMessageType[] | null;
  graduated: CosmoDataMessageType[] | null;
}

interface CosmoFilterProps {
  column?: string;
  dexes?: string;
  show_hidden?: boolean;
  show_keywords?: string;
  hide_keywords?: string;
  min_holders?: number;
  max_holders?: number;
  min_dev_holdings?: number;
  max_dev_holdings?: number;
  min_dev_migrated?: number;
  max_dev_migrated?: number;
  min_snipers?: number;
  max_snipers?: number;
  min_insider_holding?: number;
  max_insider_holding?: number;
  min_bot_holders?: number;
  max_bot_holders?: number;
  min_age?: number;
  max_age?: number;
  min_liquidity?: number;
  max_liquidity?: number;
  min_volume?: number;
  max_volume?: number;
  min_market_cap?: number;
  max_market_cap?: number;
  min_transactions?: number;
  max_transactions?: number;
  min_buys?: number;
  max_buys?: number;
  min_sells?: number;
  max_sells?: number;
}
// #################### API🔥 ####################
export const getCosmoInitialFetch =
  async (): Promise<GetCosmoInitialResponse> => {
    const API_BASE_URL = getBaseURLBasedOnRegion("/cosmo");

    try {
      const { data } = await axios.get<GetCosmoInitialResponse>(API_BASE_URL);
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch initial cosmo",
        );
      }
      throw new Error("Failed to fetch initial cosmo");
    }
  };

export const getCosmoFilterFetch = async (
  props: CosmoFilterProps,
): Promise<GetCosmoFilterResponse> => {
  // const API_BASE_URL =
  //   props.column === "graduated" || props.show_hidden
  //     ? getBaseURLBasedOnRegion("/cosmo")
  //     : getBaseURLBasedOnRegion("/cosmo/filter");
  const API_BASE_URL = props.show_hidden
    ? getBaseURLBasedOnRegion("/cosmo")
    : getBaseURLBasedOnRegion("/cosmo/filter");

  try {
    const { data } = await axios.get<GetCosmoFilterResponse>(API_BASE_URL, {
      params: props,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch cosmo filter",
      );
    }
    throw new Error("Failed to fetch cosmo filter");
  }
};

interface UpdateUserBlacklistedDevelopersResponse {
  success: boolean;
  message: string;
}

export const getBlacklistedDevelopers = async (): Promise<string[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/cosmo/blacklisted-developers");

  try {
    const { data } = await axios.get<string[]>(API_BASE_URL, {
      headers: {
        "X-Nova-Session": cookies.get("_nova_session") || "",
      },
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch user's blacklisted developers",
      );
    }
    throw new Error("Failed to fetch user's blacklisted developers");
  }
};

export const updateUserBlacklistedDevelopers = async (
  accounts: string[],
): Promise<UpdateUserBlacklistedDevelopersResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion(
    "/cosmo/blacklisted-developers/edit",
  );

  try {
    const { data } = await axios.post<UpdateUserBlacklistedDevelopersResponse>(
      API_BASE_URL,
      accounts,
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update user's blacklisted developers",
      );
    }
    throw new Error("Failed to update user's blacklisted developers");
  }
};

export const getHiddenTokens = async (): Promise<string[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/cosmo/hidden-tokens");

  try {
    const { data } = await axios.get<string[]>(API_BASE_URL, {
      headers: {
        "X-Nova-Session": cookies.get("_nova_session") || "",
      },
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch hidden tokens",
      );
    }
    throw new Error("Failed to fetch hidden tokens");
  }
};

export const hideCosmoToken = async (token: string[]) => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/cosmo/hide-token");

  try {
    const { data } = await axios.post(API_BASE_URL, token);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to hide token");
    }
    throw new Error("Failed to hide token");
  }
};
