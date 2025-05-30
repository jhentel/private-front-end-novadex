export interface TSUser {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  locked: boolean;
  bot: boolean;
  discoverable: boolean;
  group: boolean;
  created_at: string;
  note: string;
  url: string;
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at: string;
  verified: boolean;
  location: string;
  website: string;
  unauth_visibility: boolean;
  chats_onboarded: boolean;
  feeds_onboarded: boolean;
  accepting_messages: boolean;
  emojis: any[];
  fields: any[];
}

export interface TSSearchResponse {
  num_results: number;
  users: TSUser[];
}

export interface SuggestedTSAccount {
  name: string;
  profilePicture: string;
  username: string;
  type: "suggested";
}
