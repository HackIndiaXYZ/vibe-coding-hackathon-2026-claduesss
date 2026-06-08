'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface Props {
  username: string;
}

export default function PrivateLock({ username }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-3xl p-8 hover-glow-orange border-2"
      style={{ background: 'rgba(255, 255, 255, 0.4)', borderColor: 'rgba(252, 211, 77, 0.2)' }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
        style={{ background: '#F3F4F6' }}
        aria-hidden="true"
      >
        <Lock size={28} style={{ color: '#9CA3AF' }} />
      </div>
      <h3 className="text-lg font-bold mb-1" style={{ color: '#1F2937' }}>This account is private</h3>
      <p className="text-sm max-w-xs" style={{ color: '#6B7280' }}>
        Follow <span className="font-semibold">@{username}</span> to see their smile posts.
      </p>
    </motion.div>
  );
}
