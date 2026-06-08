'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Settings, User } from 'lucide-react';
import FollowButton from '@/components/FollowButton';
import PrivateLock from '@/components/PrivateLock';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { TIER_CONFIG } from '@/lib/smile-points';
import type { User as UserType, Post, Follow } from '@/types';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useCurrentUser();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followState, setFollowState] = useState<'follow' | 'pending' | 'following'>('follow');
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);

  const isOwn = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;
    const supabase = createClient();

    async function load() {
      const { data: u } = await supabase.from('users').select('*').eq('username', username).single();
      if (!u) { setLoading(false); return; }
      setProfile(u as UserType);

      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', u.id).eq('status', 'accepted'),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', u.id).eq('status', 'accepted'),
      ]);
      setFollowCounts({ followers: followers ?? 0, following: following ?? 0 });

      if (currentUser && !isOwn) {
        const { data: follow } = await supabase
          .from('follows')
          .select('status')
          .eq('follower_id', currentUser.id)
          .eq('following_id', u.id)
          .maybeSingle();
        if (follow) setFollowState(follow.status === 'accepted' ? 'following' : 'pending');
        else setFollowState('follow');
      }

      const canSeePosts = !u.is_private || isOwn || followState === 'following';
      if (canSeePosts || !u.is_private) {
        const { data: p } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false });
        setPosts((p as Post[]) ?? []);
      }

      setLoading(false);
    }

    load();
  }, [username, currentUser, isOwn, followState]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="skeleton h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <span className="text-5xl mb-4" role="img" aria-label="not found">🤷</span>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#1F2937' }}>User not found</h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>@{username} doesn&apos;t exist.</p>
      </div>
    );
  }

  const canSeePosts = !profile.is_private || isOwn || followState === 'following';

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="h-20 w-20 flex-shrink-0 rounded-full overflow-hidden border-4"
            style={{ borderColor: '#FFD93D' }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name ?? profile.username ?? ''} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                <User size={32} style={{ color: '#F59E0B' }} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black truncate" style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}>
              {profile.display_name ?? profile.username}
            </h1>
            <p className="text-sm mb-3" style={{ color: '#9CA3AF' }}>@{profile.username}</p>

            <div className="flex items-center gap-2 flex-wrap">
              {isOwn ? (
                <Link
                  href="/settings"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition-all duration-200 hover:scale-105 cursor-pointer"
                  style={{ borderColor: '#E5E7EB', color: '#1F2937', minHeight: '44px' }}
                  aria-label="Edit profile settings"
                >
                  <Settings size={16} aria-hidden="true" /> Settings
                </Link>
              ) : currentUser ? (
                <FollowButton
                  targetUserId={profile.id}
                  targetIsPrivate={profile.is_private}
                  currentUserId={currentUser.id}
                  initialState={followState}
                  onStateChange={s => setFollowState(s ?? 'follow')}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 py-4 rounded-2xl text-center" style={{ background: '#FFFBEB' }}>
          {[
            { label: 'Posts', value: posts.length },
            { label: 'Followers', value: followCounts.followers },
            { label: 'Following', value: followCounts.following },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Points badge */}
        <div className="mt-3 flex items-center justify-center">
          <span
            className="px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)', color: '#1F2937' }}
            aria-label={`${profile.smile_points} smile points`}
          >
            😊 {profile.smile_points ?? 0} Smile Points
          </span>
        </div>
      </motion.div>

      {/* Posts grid or locked */}
      {!canSeePosts ? (
        <PrivateLock username={profile.username ?? username} />
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl mb-3 block" role="img" aria-label="camera">📸</span>
          <p className="font-semibold" style={{ color: '#1F2937' }}>No posts yet</p>
          {isOwn && (
            <Link
              href="/upload"
              className="inline-block mt-4 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{ background: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
            >
              Upload your first smile
            </Link>
          )}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-3 gap-1"
          aria-label="Posts grid"
        >
          {posts.map(post => {
            const tier = TIER_CONFIG[post.smile_tier];
            return (
              <motion.div
                key={post.id}
                variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
              >
                <img
                  src={post.image_url}
                  alt={post.caption ?? 'Smile post'}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}
                  aria-hidden="true"
                >
                  <span className="text-white text-xs font-bold">{tier.emoji} +{tier.points}pts</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
