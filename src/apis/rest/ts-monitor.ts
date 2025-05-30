import axios from "@/libraries/axios";
import { TSUser, SuggestedTSAccount } from "@/types/truth-social";
import { default as normalAxios } from "axios";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "@/utils/getBaseURLBasedOnRegion";

interface UpdateTSMonitorAccountResponse {
  success: boolean;
  message: string;
}

interface GetTSAPIKeyResponse {
  success: boolean;
  message: string;
}

export interface TSAccount {
  name: string;
  profilePicture: string;
  username: string;
  type?: "suggested" | "regular" | string;
}

const API_TS_REST_URL = process.env.NEXT_PUBLIC_REST_TS_MONITOR_URL;

export const getTSAPIKey = async (): Promise<GetTSAPIKeyResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/truth-social/get-api-key");

  try {
    const { data } = await axios.get<GetTSAPIKeyResponse>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch truth social API key",
      );
    }
    throw new Error("Failed to fetch API key");
  }
};

export const searchTSAccounts = async (username: string): Promise<TSUser> => {
  try {
    const { data } = await normalAxios.get<TSUser>(
      `${API_TS_REST_URL}/search?q=${encodeURIComponent(username.replace("@", ""))}`,
    );

    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
        "Failed to search truth social accounts",
      );
    }
    throw new Error("Failed to search truth social accounts");
  }
};

export const getTSMonitorAccounts = async (): Promise<TSAccount[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/truth-social/get-accounts");
  try {
    const { data } = await axios.get<TSAccount[]>(API_BASE_URL,
      {
        withCredentials: false,
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
        "Failed to fetch truth social monitor accounts",
      );
    }
    throw new Error("Failed to fetch truth social monitor accounts");
  }
};

export const updateTSMonitorAccounts = async (props: {
  accounts: TSAccount[];
}): Promise<UpdateTSMonitorAccountResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/truth-social/update-accounts");
  try {
    const { data } = await axios.post<UpdateTSMonitorAccountResponse>(API_BASE_URL,
        props,
      )
    ;
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
        "Failed to update truth social monitor accounts",
      );
    }
    throw new Error("Failed to update truth social monitor accounts");
  }
};

export const getSuggestedTSAccounts = async (): Promise<
  SuggestedTSAccount[]
> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/truth-social/suggested-accounts");

  try {
    const { data } = await axios.get<SuggestedTSAccount[]>(API_BASE_URL,
      {
        withCredentials: false,
      },
    );

    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch suggested accounts",
      );
    }
    throw new Error("Failed to fetch suggested accounts");
  }
};
