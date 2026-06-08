'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Trash2, Globe, Lock, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const INK = '#1A1040';

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 mb-5"
      style={{ border: `2.5px solid ${INK}`, boxShadow: `5px 5px 0 ${INK}`, borderRadius: '12px' }}
    >
      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [displayName, setDisplayName]           = useState('');
  const [username, setUsername]                 = useState('');
  const [isPrivate, setIsPrivate]               = useState(false);
  const [saving, setSaving]                     = useState(false);
  const [saveMsg, setSaveMsg]                   = useState('');
  const [usernameError, setUsernameError]       = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput]           = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name ?? '');
      setUsername(user.username ?? '');
      setIsPrivate(user.is_private);
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      setUsernameError('3–20 chars, letters/numbers/underscores only.');
      return;
    }
    setSaving(true);
    setSaveMsg('');
    setUsernameError('');
    const supabase = createClient();
    if (cleanUsername !== user.username) {
      const { data: existing } = await supabase.from('users').select('id').eq('username', cleanUsername).maybeSingle();
      if (existing) { setUsernameError('Username already taken.'); setSaving(false); return; }
    }
    const { error } = await supabase.from('users').update({ display_name: displayName.trim() || null, username: cleanUsername, is_private: isPrivate }).eq('id', user.id);
    setSaving(false);
    setSaveMsg(error ? 'Failed to save. Try again.' : 'Saved!');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.replace('/');
  }

  async function handleDeleteAccount() {
    if (!user || deleteInput !== user.username) return;
    const supabase = createClient();
    await supabase.from('users').delete().eq('id', user.id);
    await supabase.auth.signOut();
    router.replace('/');
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 inline-flex items-center gap-3"
      >
        <div
          className="flex h-10 w-10 items-center justify-center"
          style={{ background: '#FFD93D', border: `2.5px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`, borderRadius: '8px' }}
          aria-hidden="true"
        >
          <Settings size={20} style={{ color: INK }} />
        </div>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-nunito)', color: INK }}>
          Settings
        </h1>
      </motion.div>

      {/* Profile form */}
      <Section>
        <h2 className="font-black text-lg mb-5 pb-3" style={{ color: INK, borderBottom: `2px solid #E5E7EB` }}>
          Profile
        </h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-black mb-2" style={{ color: INK }}>
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder="Your name"
              className="nb-input"
              style={{ minHeight: '44px' }}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-black mb-2" style={{ color: INK }}>
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-sm" style={{ color: '#9CA3AF' }}>@</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setUsernameError(''); }}
                maxLength={20}
                className="nb-input pl-8"
                style={{ minHeight: '44px', borderColor: usernameError ? '#EF4444' : INK }}
                aria-invalid={!!usernameError}
              />
            </div>
            {usernameError && <p className="mt-1.5 text-sm font-bold" style={{ color: '#EF4444' }} role="alert">{usernameError}</p>}
          </div>

          <div>
            <p className="text-sm font-black mb-3" style={{ color: INK }}>Account visibility</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: false, icon: <Globe size={18} />, label: 'Public'  },
                { value: true,  icon: <Lock  size={18} />, label: 'Private' },
              ].map(opt => {
                const sel = isPrivate === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setIsPrivate(opt.value)}
                    className="flex items-center gap-2 px-4 py-3 font-black text-sm cursor-pointer transition-all duration-100"
                    style={{
                      background:   sel ? '#FFD93D' : '#fff',
                      border:       `2.5px solid ${INK}`,
                      boxShadow:    sel ? `3px 3px 0 ${INK}` : `2px 2px 0 ${INK}`,
                      borderRadius: '8px',
                      color:        INK,
                      transform:    sel ? 'translate(-1px,-1px)' : 'none',
                      minHeight:    '44px',
                    }}
                    aria-pressed={sel}
                  >
                    <span aria-hidden="true" style={{ color: sel ? INK : '#FF6B35' }}>{opt.icon}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="nb-btn flex-1 disabled:opacity-50"
              style={{ fontSize: '14px' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {saveMsg && (
              <span
                className="text-sm font-black px-3 py-2"
                style={{
                  color:        saveMsg === 'Saved!' ? '#059669' : '#EF4444',
                  border:       `2px solid ${saveMsg === 'Saved!' ? '#059669' : '#EF4444'}`,
                  borderRadius: '6px',
                  background:   saveMsg === 'Saved!' ? '#D1FAE5' : '#FEE2E2',
                }}
                role="status"
              >
                {saveMsg}
              </span>
            )}
          </div>
        </form>
      </Section>

      {/* Sign out */}
      <Section delay={0.05}>
        <button
          onClick={handleSignOut}
          className="nb-btn nb-btn-ghost w-full"
          style={{ fontSize: '14px', justifyContent: 'center' }}
        >
          <LogOut size={18} aria-hidden="true" /> Sign Out
        </button>
      </Section>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6"
        style={{ border: `2.5px solid #EF4444`, boxShadow: `5px 5px 0 #EF4444`, borderRadius: '12px' }}
      >
        <h2 className="font-black mb-1 text-lg" style={{ color: '#DC2626' }}>Danger Zone</h2>
        <p className="text-sm font-semibold mb-4" style={{ color: '#6B7280' }}>
          Permanently delete your account and all your data.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-5 py-3 font-black text-sm cursor-pointer transition-all duration-100"
            style={{
              background:   '#FEE2E2',
              color:        '#DC2626',
              border:       `2.5px solid #DC2626`,
              boxShadow:    `3px 3px 0 #DC2626`,
              borderRadius: '8px',
              minHeight:    '44px',
            }}
          >
            <Trash2 size={16} aria-hidden="true" /> Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-black" style={{ color: '#DC2626' }}>
              Type <strong>@{user?.username}</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder={user?.username ?? ''}
              className="nb-input"
              style={{ borderColor: '#EF4444', boxShadow: `3px 3px 0 #EF4444`, minHeight: '44px' }}
              aria-label="Confirm username to delete account"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                className="nb-btn nb-btn-ghost flex-1"
                style={{ fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== user?.username}
                className="flex-1 font-black text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
                style={{
                  background:   '#DC2626',
                  color:        '#fff',
                  border:       `2.5px solid #DC2626`,
                  boxShadow:    `3px 3px 0 #DC2626`,
                  borderRadius: '8px',
                  minHeight:    '44px',
                }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
