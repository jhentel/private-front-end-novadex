export interface TwitterUser {
  friends_count: number;
  user_id: string;
  media_count: number;
  verified: boolean;
  name: string;
  screen_name: string;
  profile_image_url_https: string;
  favourites_count: number;
  followers_count: number;
}

export interface TwitterSearchResponse {
  num_results: number;
  users: TwitterUser[];
}

export interface SuggestedTwitterAccount {
  name: string;
  profilePicture: string;
  username: string;
  type: "suggested";
}
