const API_BASE_URL =
  process.env.NEXT_PUBLIC_TWITTER_FETCHER_URL || "https://media.nova.trade/api";

// export interface TwitterUserData {
//   success: boolean;
//   usernames: { username: string; time: number }[];
// }

// export interface TwitterScoredFollowersData {
//   notable_followers: {
//     follower_num_followers: number;
//     follower_username: string;
//     profile_picture: string;
//   }[];
// }
export interface TwitterUserStatusData {
  data: {
    tweetResult: {
      result: {
        core: {
          user_results: {
            result: {
              is_blue_verified: boolean;
              legacy: {
                name: string;
                profile_image_url_https: string;
                screen_name: string;
                verified: boolean;
              };
            };
          };
        };
        legacy: {
          created_at: string;
          entities: {
            media: {
              media_url_https: string;
            }[];
          };
          full_text: string;
          favorite_count: number;
          reply_count: number;
          retweet_count: number;
        };
      };
    };
  };
}

// export const fetchTwitterUser = async (
//   username: string,
// ): Promise<TwitterUserData> => {
//   const response = await fetch(
//     `${API_BASE_URL}/fetch-past-usernames?username=${username}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     },
//   );

//   if (!response.ok) throw new Error("Failed to fetch Twitter data");
//   return response.json();
// };

// export const fetchTwitterUserStatus = async (
//   statusURL: string,
// ): Promise<TwitterUserStatusData> => {
//   const response = await fetch(`${API_BASE_URL}/fetch-tweet?url=${statusURL}`, {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//   });

//   if (!response.ok) throw new Error("Failed to fetch Twitter Status data");
//   return response.json();
// };

// export const fetchScoredFollowers = async (
//   username: string,
// ): Promise<TwitterScoredFollowersData> => {
//   const response = await fetch(
//     `${API_BASE_URL}/fetch-scored-followers?username=${username}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     },
//   );

//   if (!response.ok) throw new Error("Failed to fetch Twitter data");
//   return response.json();
// };

// export const fetchFollowing = async (username: string): Promise<number> => {
//   const response = await fetch(
//     `${API_BASE_URL}/fetch-following?username=${username}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     },
//   );

//   if (!response.ok) throw new Error("Failed to fetch Twitter data");
//   return response.json();
// };

// -----------------------------------------------------------

export interface TwitterUserData {
  success: boolean;
  past: {
    username: string;
    timestamp: number;
  }[];
  new: NewTwitterUserData;
  loading?: {
    scoredFollowers?: boolean;
    followers?: boolean;
    following?: boolean;
    pastUsernames?: boolean;
    pfp?: boolean;
  };
}

export interface PastTwitterUserData {
  username: string;
  timestamp: number;
}

export interface NewTwitterUserData {
  image_profile: string;
  username: string;
  name: string;
  following: number;
  follower: number;
  followed_by: {
    username: string;
    image_profile: string;
  }[];
  is_blue_verified: boolean;
  timestamp: number;
}

export interface TwitterScoredFollowersData {
  notable_followers: {
    follower_username: string;
    follower_num_followers: number;
    profile_picture: string;
  }[];
}

export interface TwitterBetaData {
  name: string;
  username: string;
  followers: number;
  following: number;
  pfp_url: string;
  is_verified: boolean;
  bio: string;
}

export interface TwitterPastUsernamesData {
  success: boolean;
  usernames: {
    username: string;
    time: string | number;
  }[];
}

export interface TwitterPfpData {
  image: string;
}

export const fetchScoredFollowers = async (
  username: string,
): Promise<TwitterScoredFollowersData> => {
  const response = await fetch(
    `${API_BASE_URL}/fetch-scored-followers?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch scored followers");
  return response.json();
};

export const fetchBetaData = async (
  username: string,
): Promise<TwitterBetaData> => {
  const response = await fetch(
    `${API_BASE_URL}/beta?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch beta data");
  return response.json();
};

export const fetchPastUsernames = async (
  username: string,
): Promise<TwitterPastUsernamesData> => {
  const response = await fetch(
    `${API_BASE_URL}/fetch-past-usernames?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch past usernames");
  return response.json();
};

export const fetchPfp = async (
  username: string,
): Promise<TwitterPfpData> => {
  const response = await fetch(
    `${API_BASE_URL}/fetch-pfp?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch profile picture");
  return response.json();
};

export const fetchTwitterUserData = async (
  username: string,
  onDataUpdate?: (data: Partial<TwitterUserData>) => void
): Promise<TwitterUserData> => {
  try {
    // Initialize base data structure
    const baseData: TwitterUserData = {
      success: true,
      past: [],
      new: {
        image_profile: '',
        username: username,
        name: '',
        following: 0,
        follower: 0,
        followed_by: [],
        is_blue_verified: false,
        timestamp: Date.now()
      },
      loading: {
        scoredFollowers: true,
        followers: true,
        following: true,
        pastUsernames: true,
        pfp: true
      }
    };

    // Notify initial state
    onDataUpdate?.(baseData);

    // Create individual fetch promises with update callbacks
    const fetchPromises = [
      // Fetch beta data (pfp, followers, following, name, verification status)
      fetchBetaData(username).then(data => {
        baseData.new.image_profile = data.pfp_url;
        baseData.new.name = data.name;
        baseData.new.username = data.username;
        baseData.new.follower = data.followers;
        baseData.new.following = data.following;
        baseData.new.is_blue_verified = data.is_verified;
        baseData.loading!.pfp = false;
        baseData.loading!.followers = false;
        baseData.loading!.following = false;
        onDataUpdate?.({ ...baseData });
        return data;
      }).catch(error => {
        console.error('Error fetching beta data:', error);
        baseData.loading!.pfp = false;
        baseData.loading!.followers = false;
        baseData.loading!.following = false;
        onDataUpdate?.({ ...baseData });
        return null;
      }),

      // Fetch scored followers
      fetchScoredFollowers(username).then(data => {
        // Only take first 3 followers and filter out empty usernames
        baseData.new.followed_by = data.notable_followers
          .filter(f => f.follower_username)
          .slice(0, 3)
          .map(f => ({
            username: f.follower_username,
            image_profile: f.profile_picture
          }));
        baseData.loading!.scoredFollowers = false;
        onDataUpdate?.({ ...baseData });
        return data;
      }).catch(error => {
        console.error('Error fetching scored followers:', error);
        baseData.loading!.scoredFollowers = false;
        onDataUpdate?.({ ...baseData });
        return null;
      }),

      // Fetch past usernames
      fetchPastUsernames(username).then(data => {
        if (data.success && data.usernames) {
          baseData.past = data.usernames.map(u => ({
            username: u.username,
            timestamp: typeof u.time === 'string' ? parseInt(u.time) : u.time
          }));
        }
        baseData.loading!.pastUsernames = false;
        onDataUpdate?.({ ...baseData });
        return data;
      }).catch(error => {
        console.error('Error fetching past usernames:', error);
        baseData.loading!.pastUsernames = false;
        onDataUpdate?.({ ...baseData });
        return null;
      })
    ];

    // Wait for all requests to complete
    await Promise.all(fetchPromises);

    // Remove loading state from final response
    const { loading, ...finalData } = baseData;
    return finalData;
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    throw error;
  }
};
