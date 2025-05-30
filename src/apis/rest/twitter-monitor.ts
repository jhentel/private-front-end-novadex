import axios from "@/libraries/axios";
import {
  SuggestedTwitterAccount,
  TwitterSearchResponse,
  TwitterUser,
} from "@/types/twitter";
import { default as normalAxios } from "axios";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

interface GetTwitterMonitorAccountResponse {
  success: boolean;
  message: TwitterAccount[];
}
interface UpdateTwitterMonitorAccountResponse {
  success: boolean;
  message: string;
}
interface GetTwitterAPIKeyResponse {
  success: boolean;
  message: string;
}
export interface TwitterAccount {
  name: string;
  profilePicture: string;
  username: string;
  type?: "suggested" | "regular" | string;
}

export const getTwitterAPIKey = async (): Promise<GetTwitterAPIKeyResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/twitter/get-api-key");

  try {
    const { data } = await axios.get<GetTwitterAPIKeyResponse>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch twitter API key",
      );
    }
    throw new Error("Failed to fetch API key");
  }
};

export const searchTwitterAccounts = async (
  username: string,
): Promise<TwitterUser> => {
  try {
    const { data } = await normalAxios.get<TwitterUser>(
      `${process.env.NEXT_PUBLIC_REST_TWITTER_MONITOR_URL}/search?q=${encodeURIComponent(username)}`,
    );

    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to search twitter accounts",
      );
    }
    throw new Error("Failed to search twitter accounts");
  }
};

// Get Twitter Monitor Accounts
export const getTwitterMonitorAccounts = async (): Promise<
  TwitterAccount[]
> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/twitter/get-accounts");

  try {
    const { data } = await axios.get<TwitterAccount[]>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch twitter monitor accounts",
      );
    }
    throw new Error("Failed to fetch twitter monitor accounts");
  }
};

export const updateTwitterMonitorAccounts = async (props: {
  accounts: TwitterAccount[];
}): Promise<UpdateTwitterMonitorAccountResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/twitter/update-accounts");

  try {
    const { data } = await axios.post<UpdateTwitterMonitorAccountResponse>(
      API_BASE_URL,
      props,
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update twitter monitor accounts",
      );
    }
    throw new Error("Failed to update twitter monitor accounts");
  }
};

export const getSuggestedTwitterAccounts = async (): Promise<
  SuggestedTwitterAccount[]
> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/twitter/suggested-accounts");

  try {
    const { data } = await axios.get<SuggestedTwitterAccount[]>(API_BASE_URL, {
      withCredentials: false,
    });

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
