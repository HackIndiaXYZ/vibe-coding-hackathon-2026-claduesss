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
        .select('*, user:users(username, display_name, avatar_url)')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(50);

      setPosts((data as Post[]) ?? []);
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
        .select('*, user:users(username, display_name, avatar_url, is_private)')
        .order('created_at', { ascending: false })
        .limit(100);

      const publicPosts = (data as (Post & { user: { is_private: boolean } })[])
        ?.filter(p => !p.user?.is_private) ?? [];

      setPosts(publicPosts);
      setLoading(false);
    }

    fetchExplore();
  }, []);

  return { posts, loading };
}
