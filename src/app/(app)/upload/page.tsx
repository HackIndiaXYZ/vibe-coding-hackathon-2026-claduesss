'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, RefreshCcw, CheckCircle } from 'lucide-react';
import SmileReveal from '@/components/SmileReveal';
import { loadModels, detectSmile } from '@/lib/face-api';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { SmileTier } from '@/types';

type Step = 'pick' | 'detect' | 'caption' | 'submit';

interface SmileResult { score: number; tier: SmileTier; points: number; emoji: string; label: string; color: string; }

export default function UploadPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [step, setStep] = useState<Step>('pick');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [smileResult, setSmileResult] = useState<SmileResult | null>(null);
  const [caption, setCaption] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const STEPS: { key: Step; label: string }[] = [
    { key: 'pick',    label: 'Photo' },
    { key: 'detect',  label: 'Detect' },
    { key: 'caption', label: 'Caption' },
    { key: 'submit',  label: 'Post' },
  ];
  const stepIdx = STEPS.findIndex(s => s.key === step);

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    setFile(f);
    setError('');
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function runDetection() {
    if (!imgRef.current) return;
    setDetecting(true);
    setError('');
    try {
      await loadModels();
      const result = await detectSmile(imgRef.current);
      setSmileResult(result);
      setStep('detect');

      if (result.tier === 'beam') {
        const confetti = (await import('canvas-confetti')).default;
        confetti({ particleCount: 120, spread: 80, colors: ['#FFD93D', '#FF6B35', '#FF3D00'] });
      }

      setCaptionLoading(true);
      const res = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: result.score, tier: result.tier }),
      });
      const data = await res.json();
      setCaption(data.caption ?? '');
      setCaptionLoading(false);
      setStep('caption');
    } catch {
      setError('Could not detect smile. Make sure your face is visible.');
      setDetecting(false);
    }
    setDetecting(false);
  }

  async function handleSubmit() {
    if (!file || !smileResult || !user) return;
    setSubmitting(true);
    setError('');
    const supabase = createClient();

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('posts').upload(path, file, { upsert: false });
    if (uploadError) { setError('Upload failed. Try again.'); setSubmitting(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(path);

    const { error: insertError } = await supabase.from('posts').insert({
      user_id: user.id,
      image_url: publicUrl,
      caption,
      smile_score: smileResult.score,
      smile_tier: smileResult.tier,
      smile_points: smileResult.points,
    });

    if (insertError) { setError('Failed to save post. Try again.'); setSubmitting(false); return; }

    if (smileResult.points > 0) {
      await supabase
        .from('users')
        .update({ smile_points: (user.smile_points ?? 0) + smileResult.points })
        .eq('id', user.id);
    }

    router.push('/feed');
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black mb-6"
        style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
      >
        Upload a Smile
      </motion.h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8" role="progressbar" aria-label="Upload steps" aria-valuenow={stepIdx + 1} aria-valuemax={4}>
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 transition-all duration-300"
              style={{
                background: i <= stepIdx ? '#FFD93D' : '#F3F4F6',
                color: i <= stepIdx ? '#1F2937' : '#9CA3AF',
              }}
              aria-current={i === stepIdx ? 'step' : undefined}
            >
              {i < stepIdx ? <CheckCircle size={14} aria-hidden="true" /> : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block" style={{ color: i <= stepIdx ? '#1F2937' : '#9CA3AF' }}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 rounded" style={{ background: i < stepIdx ? '#FFD93D' : '#F3F4F6' }} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Pick photo */}
        {step === 'pick' && (
          <motion.div key="pick" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              className="relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-yellow-400"
              style={{ minHeight: '280px', borderColor: '#FCD34D', background: '#FFFBEB' }}
              role="button"
              tabIndex={0}
              aria-label="Click or drag to select an image"
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Selected photo preview" className="w-full h-full object-cover rounded-3xl" style={{ maxHeight: '400px' }} />
              ) : (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#FFD93D' }}>
                    <Upload size={28} style={{ color: '#1F2937' }} aria-hidden="true" />
                  </div>
                  <p className="font-semibold" style={{ color: '#1F2937' }}>Drop a photo or click to browse</p>
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>JPG, PNG, WEBP · max 10MB</p>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              aria-label="Select image file"
            />

            {/* hidden img for face-api */}
            {preview && (
              <img
                ref={imgRef}
                src={preview}
                alt=""
                aria-hidden="true"
                className="sr-only"
                crossOrigin="anonymous"
              />
            )}

            {error && <p className="mt-3 text-sm text-center" style={{ color: '#EF4444' }} role="alert">{error}</p>}

            {preview && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setPreview(null); setFile(null); }}
                  className="flex-1 py-3 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280', minHeight: '44px' }}
                >
                  Change Photo
                </button>
                <button
                  onClick={runDetection}
                  disabled={detecting}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
                  style={{ background: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
                >
                  {detecting ? 'Detecting…' : 'Detect Smile →'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Smile result */}
        {step === 'detect' && smileResult && (
          <motion.div key="detect" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {preview && (
              <img src={preview} alt="Your uploaded photo" className="w-full rounded-3xl mb-6 object-cover" style={{ maxHeight: '280px' }} />
            )}
            <div className="rounded-3xl p-6" style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
              <SmileReveal score={smileResult.score} tier={smileResult.tier} points={smileResult.points} />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setStep('pick'); setSmileResult(null); }}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-semibold text-sm cursor-pointer transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#E5E7EB', color: '#6B7280', minHeight: '44px' }}
              >
                <RefreshCcw size={16} aria-hidden="true" /> Try Again
              </button>
              <button
                onClick={() => setStep('caption')}
                disabled={captionLoading}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
              >
                {captionLoading ? 'Generating caption…' : 'Next →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Caption */}
        {step === 'caption' && (
          <motion.div key="caption" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {preview && (
              <img src={preview} alt="Your uploaded photo" className="w-full rounded-3xl object-cover" style={{ maxHeight: '280px' }} />
            )}
            <div>
              <label htmlFor="caption" className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2937' }}>
                Caption <span className="font-normal" style={{ color: '#9CA3AF' }}>(AI-generated, editable)</span>
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 rounded-2xl border-2 text-sm resize-none outline-none transition-all duration-200"
                style={{ borderColor: '#FCD34D', background: 'white', color: '#1F2937', minHeight: '44px' }}
                placeholder="Write a caption…"
              />
              <div className="text-right text-xs mt-1" style={{ color: '#9CA3AF' }}>{caption.length}/200</div>
            </div>
            {error && <p className="text-sm" style={{ color: '#EF4444' }} role="alert">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)', color: '#1F2937', minHeight: '44px' }}
            >
              {submitting ? 'Posting…' : '🚀 Post to SmileChain'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
