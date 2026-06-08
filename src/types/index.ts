export type SmileTier = 'none' | 'mild' | 'big' | 'beam';

export interface User {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_private: boolean;
  smile_points: number;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  smile_score: number;
  smile_tier: SmileTier;
  smile_points: number;
  gift_count: number;
  created_at: string;
  user?: Pick<User, 'username' | 'display_name' | 'avatar_url'>;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface SmileGift {
  id: string;
  giver_id: string;
  receiver_id: string;
  post_id: string;
  created_at: string;
}

export type NotificationType = 'follow_request' | 'follow_accepted' | 'gift_received';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationType;
  post_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Pick<User, 'username' | 'display_name' | 'avatar_url'>;
  post?: Pick<Post, 'image_url' | 'smile_tier'>;
}

export interface SmileTierInfo {
  tier: SmileTier;
  points: number;
  emoji: string;
  label: string;
  color: string;
}
