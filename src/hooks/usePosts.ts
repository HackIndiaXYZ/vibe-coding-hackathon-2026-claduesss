'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/types';

export function useFeedPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    async function fetchFeed() {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId!)
        .eq('status', 'accepted');

      const followingIds = follows?.map(f => f.following_id) ?? [];
      if (followingIds.length === 0) { setLoading(false); return; }

      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(username, display_name, avatar_url),
          comment_count:comments(count),
          like_count:likes(count),
          has_liked:likes!inner(user_id)
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(50);

      // Normalize Supabase aggregate syntax
      const normalized = (data ?? []).map((p: Record<string, unknown>) => ({
        ...p,
        comment_count: Array.isArray(p.comment_count) ? (p.comment_count[0] as { count: number })?.count ?? 0 : (p.comment_count ?? 0),
        like_count:    Array.isArray(p.like_count)    ? (p.like_count[0]    as { count: number })?.count ?? 0 : (p.like_count    ?? 0),
        has_liked:     Array.isArray(p.has_liked)
          ? p.has_liked.some((l: unknown) => (l as { user_id: string }).user_id === userId)
          : false,
      }));

      setPosts(normalized as Post[]);
      setLoading(false);
    }

    fetchFeed();
  }, [userId]);

  return { posts, loading };
}

export function useExplorePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchExplore() {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(username, display_name, avatar_url, is_private),
          comment_count:comments(count),
          like_count:likes(count)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      const normalized = (data ?? []).map((p: Record<string, unknown>) => ({
        ...p,
        comment_count: Array.isArray(p.comment_count) ? (p.comment_count[0] as { count: number })?.count ?? 0 : (p.comment_count ?? 0),
        like_count:    Array.isArray(p.like_count)    ? (p.like_count[0]    as { count: number })?.count ?? 0 : (p.like_count    ?? 0),
        has_liked:     false,
      }));

      const publicPosts = (normalized as (Post & { user: { is_private: boolean } })[])
        ?.filter(p => !p.user?.is_private) ?? [];

      setPosts(publicPosts);
      setLoading(false);
    }

    fetchExplore();
  }, []);

  return { posts, loading };
}
