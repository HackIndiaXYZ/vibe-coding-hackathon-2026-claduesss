-- SmileChain — Initial Schema
-- Run this in Supabase Dashboard → SQL Editor

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id              uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username        text UNIQUE,
  name            text,
  email           text,
  avatar_url      text,
  total_smile_points int DEFAULT 0,
  is_private      boolean DEFAULT false,
  streak_days     int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- Posts
CREATE TABLE public.posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  image_url       text NOT NULL,
  smile_score     float NOT NULL,
  smile_tier      text NOT NULL CHECK (smile_tier IN ('none', 'mild', 'big', 'beam')),
  ai_caption      text,
  points_earned   int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- Follows
CREATE TABLE public.follows (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id     uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  following_id    uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at      timestamptz DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Smile Gifts
CREATE TABLE public.smile_gifts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id        uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  receiver_id     uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  post_id         uuid NOT NULL REFERENCES public.posts ON DELETE CASCADE,
  points          int DEFAULT 1,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (giver_id, post_id),
  CHECK (giver_id != receiver_id)
);

-- Notifications
CREATE TABLE public.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('follow_request', 'follow_accepted', 'gift_received')),
  from_user_id    uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  post_id         uuid REFERENCES public.posts ON DELETE CASCADE,
  read            boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_posts_user_id ON public.posts (user_id);
CREATE INDEX idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX idx_follows_follower ON public.follows (follower_id);
CREATE INDEX idx_follows_following ON public.follows (following_id);
CREATE INDEX idx_notifications_user ON public.notifications (user_id, read, created_at DESC);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smile_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS: users
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS: posts
-- Visible if: owner is public OR viewer follows owner (accepted) OR viewer is owner
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = user_id AND (
      u.is_private = false
      OR u.id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.follows f
        WHERE f.follower_id = auth.uid()
          AND f.following_id = u.id
          AND f.status = 'accepted'
      )
    )
  )
);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- RLS: follows
CREATE POLICY "follows_select_own" ON public.follows FOR SELECT USING (
  auth.uid() = follower_id OR auth.uid() = following_id
);
CREATE POLICY "follows_insert_auth" ON public.follows FOR INSERT WITH CHECK (
  auth.uid() = follower_id
);
CREATE POLICY "follows_update_target" ON public.follows FOR UPDATE USING (
  auth.uid() = following_id
);
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE USING (
  auth.uid() = follower_id
);

-- RLS: smile_gifts
CREATE POLICY "gifts_select_own" ON public.smile_gifts FOR SELECT USING (
  auth.uid() = giver_id OR auth.uid() = receiver_id
);
CREATE POLICY "gifts_insert_auth" ON public.smile_gifts FOR INSERT WITH CHECK (
  auth.uid() = giver_id
);

-- RLS: notifications
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE USING (
  auth.uid() = user_id
);

-- Helper: auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
