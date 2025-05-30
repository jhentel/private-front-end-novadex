import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TWITTER_FETCHER_URL || "https://media.nova.trade/api";

interface PostingAccount {
  id: string;
  username: string;
  profile_pic_url: string;
}

interface InstagramPost {
  posting_account: PostingAccount;
  text_content: string;
  thumbnail: string;
  content_url?: string;
  views?: number;
  likes?: number;
  comments?: number;
}
export const fetchInstagramStatus = async (
  link: string,
): Promise<InstagramPost | null> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/fetch-instagram?url=${link}`,
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch instagram status",
    );
  }
};
