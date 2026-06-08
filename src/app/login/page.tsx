'use client';

import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: 'var(--background)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="w-full max-w-sm p-8 rounded-3xl shadow-xl text-center"
        style={{ background: 'white', border: '2px solid #FCD34D' }}
      >
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-md"
          style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)' }}
          aria-hidden="true"
        >
          <span className="text-4xl">😊</span>
        </div>

        <h1
          className="text-3xl font-black mb-2"
          style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
        >
          SmileChain
        </h1>
        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
          Where your smile is the currency
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          style={{
            background: 'white',
            border: '2px solid #E5E7EB',
            color: '#1F2937',
            minHeight: '44px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-xs" style={{ color: '#9CA3AF' }}>
          By signing in you agree to our terms. No credit card required.
        </p>
      </motion.div>
    </main>
  );
}
