import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

export interface Announcement {
  message: string;
  level: "warning" | "danger" | "success";
}

/**
 * Fetches the current announcement from the API
 *
 * @returns {Promise<Announcement>} The current announcement data
 * @throws {Error} If the request fails
 */
export const getAnnouncement = async (): Promise<Announcement> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/announcements");

  try {
    const { data } = await axios.get<Announcement>(API_BASE_URL);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch announcement",
      );
    }
    throw new Error("Failed to fetch announcement");
  }
};
