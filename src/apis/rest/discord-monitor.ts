import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "@/utils/getBaseURLBasedOnRegion";
import { PingResponseDiscord, SuggestedDiscordChannel } from "@/types/monitor";

interface UpdateDiscordMonitorChannelResponse {
  success: boolean;
  message: string;
}

const API_DC_REST_URL =
  process.env.NEXT_PUBLIC_REST_DISCORD_MONITOR_URL?.replace(/\/+$/, "");

export const fetchTokenPings = async (address: string) => {
  try {
    const { data } = await axios.get<PingResponseDiscord[]>(
      `${API_DC_REST_URL}/pinged-tokens?token=${address}&licenseKey=dev-test`,
    );
    return data[0];
  } catch (err) {
    console.error(`Failed to fetch pings for ${address}:`, err);
  }
};

export const getDiscordMonitorChannel = async (): Promise<string[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/discord/get-groups");
  try {
    const { data } = await axios.get<string[]>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch discord monitor groups",
      );
    }
    throw new Error("Failed to fetch discord monitor groups");
  }
};

export const updateDiscordMonitorChannel = async (
  props: string[],
): Promise<UpdateDiscordMonitorChannelResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/discord/update-groups");
  try {
    const { data } = await axios.post<UpdateDiscordMonitorChannelResponse>(
      API_BASE_URL,
      props,
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update discord monitor groups",
      );
    }
    throw new Error("Failed to update discord monitor groups");
  }
};

export const getSuggestedDiscordChannel = async (): Promise<
  SuggestedDiscordChannel[]
> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/discord/suggested-groups");

  try {
    const { data } = await axios.get<SuggestedDiscordChannel[]>(API_BASE_URL, {
      withCredentials: false,
    });

    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch suggested groups",
      );
    }
    throw new Error("Failed to fetch suggested groups");
  }
};
