'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { useFeedPosts } from '@/hooks/usePosts';
import { useCurrentUser } from '@/hooks/useCurrentUser';

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-28 rounded" />
          <div className="skeleton h-2.5 w-16 rounded" />
        </div>
      </div>
      <div className="skeleton aspect-square w-full" />
      <div className="px-4 py-3 space-y-2">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { posts, loading: postsLoading } = useFeedPosts(user?.id);

  const loading = userLoading || postsLoading;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black mb-6"
        style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
      >
        Your Feed
      </motion.h1>

      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <span className="text-6xl mb-4" role="img" aria-label="wave">👋</span>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1F2937' }}>No smiles yet</h2>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            Follow people to see their smile posts here.
          </p>
          <Link
            href="/explore"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
          >
            <Compass size={18} aria-hidden="true" />
            Explore Posts
          </Link>
        </motion.div>
      )}

      {!loading && posts.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="space-y-6"
        >
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              currentUserPoints={user?.smile_points ?? 0}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
