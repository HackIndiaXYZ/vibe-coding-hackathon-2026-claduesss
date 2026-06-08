'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Lock, Globe } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
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

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', clean)
      .maybeSingle();

    if (existing) { setError('Username taken.'); setLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login'); return; }

    const { error: updateError } = await supabase
      .from('users')
      .update({ username: clean, is_private: isPrivate })
      .eq('id', user.id);

    if (updateError) { setError('Failed to save. Try again.'); setLoading(false); return; }

    router.replace('/feed');
  }

  async function checkUsername(val: string) {
    const clean = val.trim().toLowerCase();
    if (!clean || !/^[a-z0-9_]{3,20}$/.test(clean)) return;
    setChecking(true);
    const supabase = createClient();
    const { data } = await supabase.from('users').select('id').eq('username', clean).maybeSingle();
    setChecking(false);
    if (data) setError('Username taken.');
    else setError('');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={{ background: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <span className="text-5xl" role="img" aria-label="wave">👋</span>
          <h1 className="mt-4 text-3xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}>
            Almost There!
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>Set up your SmileChain profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2937' }}>
              Choose a username <span aria-hidden="true" style={{ color: '#FF6B35' }}>*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style={{ color: '#6B7280' }}>@</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                onBlur={e => checkUsername(e.target.value)}
                placeholder="yourname"
                required
                maxLength={20}
                className="w-full pl-8 pr-4 py-3 rounded-2xl border-2 text-base font-medium outline-none transition-all duration-200"
                style={{
                  borderColor: error ? '#EF4444' : '#FCD34D',
                  background: 'white',
                  color: '#1F2937',
                  minHeight: '44px',
                }}
              />
              {checking && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#6B7280' }}>
                  checking…
                </span>
              )}
            </div>
            {error && (
              <p className="mt-1.5 text-sm" style={{ color: '#EF4444' }} role="alert">{error}</p>
            )}
            <p className="mt-1 text-xs" style={{ color: '#9CA3AF' }}>3–20 chars · letters, numbers, underscores</p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: '#1F2937' }}>Account visibility</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: false, icon: <Globe size={20} />, label: 'Public',  desc: 'Anyone can see your posts' },
                { value: true,  icon: <Lock size={20} />,  label: 'Private', desc: 'Followers only' },
              ].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setIsPrivate(opt.value)}
                  className="p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: isPrivate === opt.value ? '#FFD93D' : '#E5E7EB',
                    background: isPrivate === opt.value ? '#FFFBEB' : 'white',
                    minHeight: '44px',
                  }}
                  aria-pressed={isPrivate === opt.value}
                >
                  <div className="mb-1" style={{ color: '#FF6B35' }} aria-hidden="true">{opt.icon}</div>
                  <div className="font-semibold text-sm" style={{ color: '#1F2937' }}>{opt.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!error || !username.trim()}
            className="w-full py-3.5 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FFD93D, #FF6B35)',
              color: '#1F2937',
              minHeight: '44px',
            }}
          >
            {loading ? 'Saving…' : 'Start Smiling →'}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
