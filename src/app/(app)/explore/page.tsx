'use client';

import { motion } from 'framer-motion';
import PostCard from '@/components/PostCard';
import { useExplorePosts } from '@/hooks/usePosts';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const INK = '#1A1040';

function SkeletonCard() {
  return (
    <div className="bg-white overflow-hidden" style={{ border: `2.5px solid ${INK}`, boxShadow: `5px 5px 0 ${INK}`, borderRadius: '12px' }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="skeleton h-10 w-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-28 rounded" />
          <div className="skeleton h-2.5 w-16 rounded" />
        </div>
      </div>
      <div className="skeleton aspect-square w-full" style={{ borderRadius: 0 }} />
      <div className="px-4 py-3 space-y-2">
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const { user }           = useCurrentUser();
  const { posts, loading } = useExplorePosts();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 inline-flex items-center gap-3"
      >
        <div
          className="flex h-10 w-10 items-center justify-center text-xl"
          style={{ background: '#FF6B35', border: `2.5px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`, borderRadius: '8px' }}
          aria-hidden="true"
        >
          🧭
        </div>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: INK }}>
          Explore
        </h1>
      </motion.div>

      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center bg-white"
          style={{ border: `2.5px solid ${INK}`, boxShadow: `5px 5px 0 ${INK}`, borderRadius: '12px', padding: '48px 32px' }}
        >
          <div
            className="text-4xl mb-4 flex h-20 w-20 items-center justify-center mx-auto"
            style={{ background: '#FFD93D', border: `2.5px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}`, borderRadius: '12px' }}
            role="img" aria-label="camera"
          >
            📸
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: INK }}>No posts yet</h2>
          <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>Be the first to share a smile!</p>
        </motion.div>
      )}

      {!loading && posts.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
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
