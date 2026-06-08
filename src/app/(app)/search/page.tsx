'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as UserType } from '@/types';

const INK = '#1A1040';

export default function SearchPage() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await createClient()
        .from('users')
        .select('id, username, display_name, avatar_url, is_private, smile_points')
        .ilike('username', `%${q}%`)
        .limit(20);
      setResults((data as UserType[]) ?? []);
      setLoading(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 inline-flex items-center gap-3"
      >
        <div
          className="flex h-10 w-10 items-center justify-center text-xl"
          style={{ background: '#FFD93D', border: `2.5px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`, borderRadius: '8px' }}
          aria-hidden="true"
        >
          🔍
        </div>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: INK }}>
          Search
        </h1>
      </motion.div>

      {/* Search input */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#9CA3AF' }}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by username…"
          autoFocus
          className="nb-input pl-11"
          style={{ minHeight: '48px', fontSize: '15px' }}
          aria-label="Search users by username"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: '#9CA3AF' }} aria-live="polite">
            searching…
          </span>
        )}
      </div>

      {/* No results */}
      {query && !loading && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white"
          style={{ border: `2.5px solid ${INK}`, boxShadow: `5px 5px 0 ${INK}`, borderRadius: '12px' }}
          aria-live="polite"
        >
          <span className="text-4xl mb-3 block" role="img" aria-label="person shrugging">🤷</span>
          <p className="font-black" style={{ color: INK }}>No users found</p>
          <p className="text-sm mt-1 font-semibold" style={{ color: '#6B7280' }}>Try a different username</p>
        </motion.div>
      )}

      {/* Idle state */}
      {!query && (
        <div
          className="text-center py-16 bg-white"
          style={{ border: `2.5px solid ${INK}`, boxShadow: `5px 5px 0 ${INK}`, borderRadius: '12px' }}
        >
          <span className="text-4xl mb-3 block" role="img" aria-label="magnifying glass">🔍</span>
          <p className="font-black" style={{ color: INK }}>Find people to follow</p>
          <p className="text-sm mt-1 font-semibold" style={{ color: '#6B7280' }}>Type a username above</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="space-y-2"
          aria-label="Search results"
        >
          {results.map(u => (
            <motion.li
              key={u.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            >
              <Link
                href={`/profile/${u.username}`}
                className="flex items-center gap-3 p-3 bg-white cursor-pointer transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px]"
                style={{
                  border:       `2.5px solid ${INK}`,
                  boxShadow:    `4px 4px 0 ${INK}`,
                  borderRadius: '10px',
                }}
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden"
                  style={{ border: `2.5px solid ${INK}`, borderRadius: '8px', background: '#FFD93D' }}
                >
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                  ) : (
                    <User size={20} aria-hidden="true" style={{ color: INK }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate" style={{ color: INK }}>
                    {u.display_name ?? u.username}
                  </p>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>@{u.username}</p>
                </div>
                <div
                  className="flex-shrink-0 px-3 py-1 font-black text-sm"
                  style={{ background: '#FFD93D', border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}`, borderRadius: '6px' }}
                >
                  {u.smile_points ?? 0} pts
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
