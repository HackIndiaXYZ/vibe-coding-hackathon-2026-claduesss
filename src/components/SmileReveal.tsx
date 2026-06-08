'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TIER_CONFIG } from '@/lib/smile-points';
import type { SmileTier } from '@/types';

interface Props {
  score: number;
  tier: SmileTier;
  points: number;
}

export default function SmileReveal({ score, tier, points }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const info = TIER_CONFIG[tier];

  useEffect(() => {
    const target = Math.round(score * 100);
    const step = target / 40;
    let current = 0;
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayed(Math.round(current));
      if (current >= target) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
      className="flex flex-col items-center text-center py-8"
    >
      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.3 }}
        className="text-8xl mb-4 drop-shadow-xl select-none"
        role="img"
        aria-label={info.label}
      >
        {info.emoji}
      </motion.span>
 
      <motion.div
        animate={displayed > 0 ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.4 }}
        className="text-7xl font-black mb-1 drop-shadow-sm"
        style={{ fontFamily: 'var(--font-nunito)', color: info.color === '#9CA3AF' ? '#6B7280' : info.color }}
        aria-label={`Smile intensity: ${displayed} percent`}
      >
        {displayed}%
      </motion.div>
 
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div
          className="px-5 py-2 rounded-full font-bold text-lg mb-2 shadow-sm"
          style={{ background: info.color + '22', color: info.color === '#9CA3AF' ? '#6B7280' : info.color, border: `1px solid ${info.color}33` }}
        >
          {info.label}
        </div>
 
        {points > 0 ? (
          <p className="text-sm font-semibold text-emerald-500 flex items-center justify-center gap-1">
            <span>✨</span> +{points} Smile Points earned!
          </p>
        ) : (
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Try smiling bigger next time! 😊
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
