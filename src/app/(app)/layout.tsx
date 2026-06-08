import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single();

  if (!profile?.username) redirect('/onboarding');

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Animated Background Blobs */}
      <div className="hero-blob-1" aria-hidden="true"></div>
      <div className="hero-blob-2" aria-hidden="true"></div>
      <Navbar />
      <main className="flex-1 mb-nav">
        {children}
      </main>
    </div>
  );
}
