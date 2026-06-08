'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Trash2, Globe, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

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
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();
      if (existing) { setUsernameError('Username already taken.'); setSaving(false); return; }
    }

    const { error } = await supabase
      .from('users')
      .update({ display_name: displayName.trim() || null, username: cleanUsername, is_private: isPrivate })
      .eq('id', user.id);

    setSaving(false);
    setSaveMsg(error ? 'Failed to save. Try again.' : 'Saved!');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
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
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black mb-6"
        style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
      >
        Settings
      </motion.h1>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave}
        className="space-y-5 p-6 rounded-3xl mb-4"
        style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
      >
        <h2 className="font-bold text-lg" style={{ color: '#1F2937' }}>Profile</h2>

        <div>
          <label htmlFor="displayName" className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2937' }}>
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={50}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-2xl border-2 text-base outline-none transition-all duration-200"
            style={{ borderColor: '#FCD34D', background: '#FFFBF0', color: '#1F2937', minHeight: '44px' }}
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2937' }}>
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style={{ color: '#9CA3AF' }}>@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setUsernameError(''); }}
              maxLength={20}
              className="w-full pl-8 pr-4 py-3 rounded-2xl border-2 text-base outline-none transition-all duration-200"
              style={{ borderColor: usernameError ? '#EF4444' : '#FCD34D', background: '#FFFBF0', color: '#1F2937', minHeight: '44px' }}
            />
          </div>
          {usernameError && <p className="mt-1.5 text-sm" style={{ color: '#EF4444' }} role="alert">{usernameError}</p>}
        </div>

        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: '#1F2937' }}>Account visibility</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: false, icon: <Globe size={18} />, label: 'Public' },
              { value: true,  icon: <Lock size={18} />,  label: 'Private' },
            ].map(opt => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setIsPrivate(opt.value)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isPrivate === opt.value ? '#FFD93D' : '#E5E7EB',
                  background: isPrivate === opt.value ? '#FFFBEB' : 'white',
                  color: '#1F2937',
                  minHeight: '44px',
                }}
                aria-pressed={isPrivate === opt.value}
              >
                <span aria-hidden="true" style={{ color: '#FF6B35' }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)', color: '#1F2937', minHeight: '44px' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saveMsg && (
            <span className="text-sm font-semibold" style={{ color: saveMsg === 'Saved!' ? '#10B981' : '#EF4444' }} role="status">
              {saveMsg}
            </span>
          )}
        </div>
      </motion.form>

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-3xl mb-4"
        style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
      >
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          style={{ borderColor: '#E5E7EB', color: '#6B7280', minHeight: '44px' }}
        >
          <LogOut size={18} aria-hidden="true" />
          Sign Out
        </button>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-6 rounded-3xl border-2"
        style={{ background: 'white', borderColor: '#FEE2E2', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
      >
        <h2 className="font-bold mb-1" style={{ color: '#DC2626' }}>Danger Zone</h2>
        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Permanently delete your account and all your data.</p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: '#FEE2E2', color: '#DC2626', minHeight: '44px' }}
          >
            <Trash2 size={16} aria-hidden="true" /> Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>
              Type <strong>@{user?.username}</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder={user?.username ?? ''}
              className="w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none"
              style={{ borderColor: '#FCA5A5', background: '#FFF', color: '#1F2937', minHeight: '44px' }}
              aria-label="Confirm username to delete account"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                className="flex-1 py-3 rounded-2xl border-2 font-semibold text-sm cursor-pointer"
                style={{ borderColor: '#E5E7EB', color: '#6B7280', minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== user?.username}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: '#DC2626', color: 'white', minHeight: '44px' }}
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
