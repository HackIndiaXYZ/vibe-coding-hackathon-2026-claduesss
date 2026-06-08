'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Lock, Globe, ArrowRight, Smile } from 'lucide-react';

const INK = '#1A1040';

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [checking, setChecking]   = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = username.trim().toLowerCase();
    if (!clean) { setError('Username is required.'); return; }
    if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
      setError('3–20 chars, letters/numbers/underscores only.');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data: existing } = await supabase.from('users').select('id').eq('username', clean).maybeSingle();
    if (existing) { setError('Username taken.'); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login'); return; }
    const { error: updateError } = await supabase.from('users').update({ username: clean, is_private: isPrivate }).eq('id', user.id);
    if (updateError) { setError('Failed to save. Try again.'); setLoading(false); return; }
    router.replace('/feed');
  }

  async function checkUsername(val: string) {
    const clean = val.trim().toLowerCase();
    if (!clean || !/^[a-z0-9_]{3,20}$/.test(clean)) return;
    setChecking(true);
    const { data } = await createClient().from('users').select('id').eq('username', clean).maybeSingle();
    setChecking(false);
    if (data) setError('Username taken.');
    else setError('');
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-6"
      style={{ background: '#FFFBF0' }}
    >
      {/* Decorative top-right block */}
      <div
        className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
        style={{ background: '#FFD93D', borderLeft: `2.5px solid ${INK}`, borderBottom: `2.5px solid ${INK}`, borderBottomLeftRadius: '20px', opacity: 0.5 }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm bg-white p-8"
        style={{ border: `2.5px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`, borderRadius: '16px' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center"
            style={{ background: '#FFD93D', border: `2.5px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`, borderRadius: '12px' }}
            aria-hidden="true"
          >
            <Smile size={32} style={{ color: INK }} />
          </div>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: INK }}>
            Almost There!
          </h1>
          <p className="mt-1.5 text-sm font-semibold" style={{ color: '#6B7280' }}>
            Set up your SmileChain profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-black mb-2" style={{ color: INK }}>
              Username <span aria-hidden="true" style={{ color: '#FF6B35' }}>*</span>
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-sm"
                style={{ color: '#9CA3AF' }}
              >
                @
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                onBlur={e => checkUsername(e.target.value)}
                placeholder="yourname"
                required
                maxLength={20}
                className="nb-input pl-8"
                style={{
                  borderColor: error ? '#EF4444' : INK,
                  boxShadow: error ? `3px 3px 0 #EF4444` : `3px 3px 0 ${INK}`,
                  minHeight: '44px',
                }}
                aria-invalid={!!error}
                aria-describedby={error ? 'username-error' : 'username-hint'}
              />
              {checking && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: '#9CA3AF' }}>
                  checking…
                </span>
              )}
            </div>
            {error && (
              <p id="username-error" className="mt-1.5 text-sm font-bold" style={{ color: '#EF4444' }} role="alert">{error}</p>
            )}
            <p id="username-hint" className="mt-1 text-xs font-medium" style={{ color: '#9CA3AF' }}>
              3–20 chars · letters, numbers, underscores
            </p>
          </div>

          {/* Visibility */}
          <div>
            <p className="text-sm font-black mb-3" style={{ color: INK }}>Account visibility</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: false, icon: <Globe size={18} />, label: 'Public',  desc: 'Anyone can see your posts' },
                { value: true,  icon: <Lock size={18} />,  label: 'Private', desc: 'Followers only' },
              ].map(opt => {
                const sel = isPrivate === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setIsPrivate(opt.value)}
                    className="p-4 text-left cursor-pointer transition-all duration-100"
                    style={{
                      background:   sel ? '#FFD93D' : '#fff',
                      border:       `2.5px solid ${INK}`,
                      boxShadow:    sel ? `3px 3px 0 ${INK}` : `2px 2px 0 ${INK}`,
                      borderRadius: '10px',
                      transform:    sel ? 'translate(-1px,-1px)' : 'none',
                      minHeight:    '44px',
                    }}
                    aria-pressed={sel}
                  >
                    <div className="mb-1" style={{ color: sel ? INK : '#FF6B35' }} aria-hidden="true">{opt.icon}</div>
                    <div className="font-black text-sm" style={{ color: INK }}>{opt.label}</div>
                    <div className="text-xs mt-0.5 font-medium" style={{ color: '#6B7280' }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!error || !username.trim()}
            className="nb-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ justifyContent: 'center', fontSize: '15px' }}
          >
            {loading ? 'Saving…' : <>Start Smiling <ArrowRight size={16} /></>}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
