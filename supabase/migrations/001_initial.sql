-- SmileChain — Full Schema
-- Run this entire file in Supabase Dashboard → SQL Editor → New query → Run

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id              uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username        text UNIQUE,
  display_name    text,
  email           text,
  avatar_url      text,
  smile_points    int DEFAULT 0,
  is_private      boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- Posts
CREATE TABLE public.posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  image_url       text NOT NULL,
  smile_score     float NOT NULL,
  smile_tier      text NOT NULL CHECK (smile_tier IN ('none', 'mild', 'big', 'beam')),
  caption         text,
  smile_points    int DEFAULT 0,
  gift_count      int DEFAULT 0,
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
  created_at      timestamptz DEFAULT now(),
  UNIQUE (giver_id, post_id),
  CHECK (giver_id != receiver_id)
);

-- Comments
CREATE TABLE public.comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body       text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at timestamptz DEFAULT now()
);

-- Likes
CREATE TABLE public.likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- Notifications
CREATE TABLE public.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  actor_id        uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('follow_request', 'follow_accepted', 'gift_received', 'comment', 'like')),
  post_id         uuid REFERENCES public.posts ON DELETE CASCADE,
  is_read         boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_posts_user_id       ON public.posts        (user_id);
CREATE INDEX idx_posts_created_at    ON public.posts        (created_at DESC);
CREATE INDEX idx_follows_follower    ON public.follows      (follower_id);
CREATE INDEX idx_follows_following   ON public.follows      (following_id);
CREATE INDEX idx_notifications_user  ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX comments_post_id_idx    ON public.comments     (post_id);
CREATE INDEX likes_post_id_idx       ON public.likes        (post_id);

-- Enable RLS
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smile_gifts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS: users
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS: posts
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
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- RLS: follows
CREATE POLICY "follows_select_own"    ON public.follows FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "follows_insert_auth"   ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_update_target" ON public.follows FOR UPDATE USING (auth.uid() = following_id);
CREATE POLICY "follows_delete_own"    ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- RLS: smile_gifts
CREATE POLICY "gifts_select_own"  ON public.smile_gifts FOR SELECT USING (auth.uid() = giver_id OR auth.uid() = receiver_id);
CREATE POLICY "gifts_insert_auth" ON public.smile_gifts FOR INSERT WITH CHECK (auth.uid() = giver_id);

-- RLS: comments
CREATE POLICY "comments_select" ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.users u ON u.id = p.user_id
      WHERE p.id = comments.post_id
        AND (
          u.is_private = false
          OR p.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.follows f
            WHERE f.follower_id = auth.uid()
              AND f.following_id = p.user_id
              AND f.status = 'accepted'
          )
        )
    )
  );
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- RLS: likes
CREATE POLICY "likes_select" ON public.likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.users u ON u.id = p.user_id
      WHERE p.id = likes.post_id
        AND (
          u.is_private = false
          OR p.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.follows f
            WHERE f.follower_id = auth.uid()
              AND f.following_id = p.user_id
              AND f.status = 'accepted'
          )
        )
    )
  );
CREATE POLICY "likes_insert" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- RLS: notifications
CREATE POLICY "notif_select_own"  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_auth" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_update_own"  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create user row on Google sign-in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, display_name, email, avatar_url)
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

-- Auto-increment gift_count on posts when a gift is inserted
CREATE OR REPLACE FUNCTION public.handle_new_gift()
RETURNS trigger AS $$
BEGIN
  UPDATE public.posts SET gift_count = gift_count + 1 WHERE id = NEW.post_id;
  UPDATE public.users SET smile_points = smile_points - 1 WHERE id = NEW.giver_id;
  UPDATE public.users SET smile_points = smile_points + 1 WHERE id = NEW.receiver_id;
  INSERT INTO public.notifications (user_id, actor_id, type, post_id)
  VALUES (NEW.receiver_id, NEW.giver_id, 'gift_received', NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_gift_created
  AFTER INSERT ON public.smile_gifts
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_gift();

-- ============================================================
-- FEATURE ADDITIONS
-- ============================================================

-- ── Like / comment counters on posts ────────────────────────
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS like_count    int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_count int DEFAULT 0;

-- Increment like_count when a like is inserted
CREATE OR REPLACE FUNCTION public.handle_like_insert()
RETURNS trigger AS $$
BEGIN
  UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    SELECT p.user_id, NEW.user_id, 'like', NEW.post_id
    FROM public.posts p
    WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_insert
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_insert();

-- Decrement like_count when a like is deleted
CREATE OR REPLACE FUNCTION public.handle_like_delete()
RETURNS trigger AS $$
BEGIN
  UPDATE public.posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_delete
  AFTER DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_delete();

-- Increment comment_count when a comment is inserted
CREATE OR REPLACE FUNCTION public.handle_comment_insert()
RETURNS trigger AS $$
BEGIN
  UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    SELECT p.user_id, NEW.user_id, 'comment', NEW.post_id
    FROM public.posts p
    WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_insert
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_insert();

-- Decrement comment_count when a comment is deleted
CREATE OR REPLACE FUNCTION public.handle_comment_delete()
RETURNS trigger AS $$
BEGIN
  UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_delete
  AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_delete();

-- ── Streaks (#3) ─────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS streak_count   int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_posted_at timestamptz;

-- Update streak on each new post
CREATE OR REPLACE FUNCTION public.handle_post_streak()
RETURNS trigger AS $$
DECLARE
  v_last      timestamptz;
  v_streak    int;
  v_days_diff int;
  v_bonus     int := 0;
BEGIN
  SELECT last_posted_at, streak_count
    INTO v_last, v_streak
    FROM public.users WHERE id = NEW.user_id;

  IF v_last IS NULL THEN
    v_streak := 1;
  ELSE
    v_days_diff := FLOOR(EXTRACT(EPOCH FROM (now() - v_last)) / 86400);
    IF v_days_diff = 0 THEN
      -- Already posted today — no streak change
      RETURN NEW;
    ELSIF v_days_diff = 1 THEN
      v_streak := v_streak + 1;
    ELSE
      v_streak := 1;  -- streak broken
    END IF;
  END IF;

  -- Milestone bonuses: 3 / 7 / 30 days
  IF    v_streak = 3  THEN v_bonus := 10;
  ELSIF v_streak = 7  THEN v_bonus := 30;
  ELSIF v_streak = 30 THEN v_bonus := 100;
  END IF;

  UPDATE public.users
    SET streak_count   = v_streak,
        last_posted_at = now(),
        smile_points   = smile_points + v_bonus
    WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_insert_streak
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_streak();

-- ── Achievement badges (#7) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  badge_id  text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges (user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_select_all" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "badges_insert_sys" ON public.user_badges FOR INSERT WITH CHECK (true);

-- Award badges after each post insert
CREATE OR REPLACE FUNCTION public.handle_post_badges()
RETURNS trigger AS $$
DECLARE
  v_post_count    int;
  v_beam_count    int;
  v_total_points  int;
  v_streak        int;
BEGIN
  SELECT
    COUNT(*)                                      AS post_count,
    COUNT(*) FILTER (WHERE smile_tier = 'beam')   AS beam_count
  INTO v_post_count, v_beam_count
  FROM public.posts WHERE user_id = NEW.user_id;

  SELECT smile_points, streak_count
    INTO v_total_points, v_streak
    FROM public.users WHERE id = NEW.user_id;

  -- posts_10
  IF v_post_count >= 10 THEN
    INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, 'posts_10')
      ON CONFLICT DO NOTHING;
  END IF;

  -- first_beam
  IF v_beam_count >= 1 THEN
    INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, 'first_beam')
      ON CONFLICT DO NOTHING;
  END IF;

  -- points milestones
  IF v_total_points >= 100 THEN
    INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, 'points_100')
      ON CONFLICT DO NOTHING;
  END IF;
  IF v_total_points >= 1000 THEN
    INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, 'points_1000')
      ON CONFLICT DO NOTHING;
  END IF;

  -- streak badges
  IF v_streak >= 7 THEN
    INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, 'streak_7')
      ON CONFLICT DO NOTHING;
  END IF;
  IF v_streak >= 30 THEN
    INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, 'streak_30')
      ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_insert_badges
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_badges();

-- Award gifts_10 badge when gift count crosses threshold
CREATE OR REPLACE FUNCTION public.handle_gift_badges()
RETURNS trigger AS $$
DECLARE
  v_gift_count int;
BEGIN
  SELECT COUNT(*) INTO v_gift_count
    FROM public.smile_gifts WHERE receiver_id = NEW.receiver_id;

  IF v_gift_count >= 10 THEN
    INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.receiver_id, 'gifts_10')
      ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_gift_badges
  AFTER INSERT ON public.smile_gifts
  FOR EACH ROW EXECUTE FUNCTION public.handle_gift_badges();

-- ── Leaderboard view (#1) ─────────────────────────────────────
CREATE OR REPLACE VIEW public.leaderboard_weekly AS
SELECT
  u.id,
  u.username,
  u.display_name,
  u.avatar_url,
  u.smile_points                              AS total_points,
  COALESCE(SUM(p.smile_points), 0)::int       AS weekly_points,
  COUNT(p.id)::int                            AS weekly_posts
FROM public.users u
LEFT JOIN public.posts p
  ON  p.user_id    = u.id
  AND p.created_at >= date_trunc('week', now())
WHERE u.username IS NOT NULL
GROUP BY u.id
ORDER BY weekly_points DESC, total_points DESC;
