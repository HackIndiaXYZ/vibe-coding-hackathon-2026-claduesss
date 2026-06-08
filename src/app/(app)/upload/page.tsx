'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, RefreshCcw, CheckCircle, FlipHorizontal, ZapOff, Loader2 } from 'lucide-react';
import SmileReveal from '@/components/SmileReveal';
import { loadModels, detectSmile } from '@/lib/face-api';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { SmileTier } from '@/types';

type Step = 'pick' | 'detect' | 'caption';
type PickMode = 'upload' | 'camera';

interface SmileResult { score: number; tier: SmileTier; points: number; emoji: string; label: string; color: string; }

export default function UploadPage() {
  const router = useRouter();
  const { user } = useCurrentUser();

  // Step state
  const [step, setStep] = useState<Step>('pick');
  const [pickMode, setPickMode] = useState<PickMode>('upload');

  // Photo state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [mirrored, setMirrored] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detection + submit state
  const [smileResult, setSmileResult] = useState<SmileResult | null>(null);
  const [caption, setCaption] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  const STEPS: { key: Step; label: string }[] = [
    { key: 'pick',    label: 'Photo' },
    { key: 'detect',  label: 'Detect' },
    { key: 'caption', label: 'Caption' },
  ];
  const stepIdx = STEPS.findIndex(s => s.key === step);

  // Stop camera when leaving pick step or component unmounts
  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (step !== 'pick' || pickMode !== 'camera') stopCamera();
  }, [step, pickMode]);

  // ── Camera helpers ──────────────────────────────────────────

  async function startCamera() {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError('Camera access denied. Allow camera permission and try again.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  function capturePhoto() {
    if (!videoRef.current || !cameraActive) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;

    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (!blob) return;
      const f = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFile(f);
      setPreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }, 'image/jpeg', 0.92);
  }

  function startCountdown() {
    let n = 3;
    setCountdown(n);
    const id = setInterval(() => {
      n -= 1;
      if (n === 0) {
        clearInterval(id);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(n);
      }
    }, 1000);
  }

  // ── File upload helper ──────────────────────────────────────

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    setFile(f);
    setError('');
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  // ── Detection ───────────────────────────────────────────────

  async function runDetection() {
    if (!preview) return;
    setDetecting(true);
    setError('');
    try {
      await loadModels();

      // Load image at full natural size — sr-only clips to 1×1px which breaks face-api
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = preview!;
      });

      const result = await detectSmile(img);
      setSmileResult(result);
      setStep('detect');

      if (result.tier === 'beam') {
        const confetti = (await import('canvas-confetti')).default;
        confetti({ particleCount: 140, spread: 90, colors: ['#FFD93D', '#FF6B35', '#FF3D00'] });
      }

      // Pre-fetch caption in background — user stays on detect step
      setCaptionLoading(true);
      fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: result.score, tier: result.tier }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.error) console.error('[caption]', data.error);
          setCaption(data.caption ?? '');
        })
        .catch(err => console.error('[caption fetch]', err))
        .finally(() => setCaptionLoading(false));
    } catch {
      setError('Could not detect smile. Make sure your face is visible.');
    }
    setDetecting(false);
  }

  // ── Submit ──────────────────────────────────────────────────

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

  function resetPick() {
    setPreview(null);
    setFile(null);
    setSmileResult(null);
    setError('');
    setStep('pick');
    if (pickMode === 'camera') startCamera();
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black mb-6"
        style={{ fontFamily: 'var(--font-nunito)', color: '#1F2937' }}
      >
        Share a Smile
      </motion.h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 p-3 rounded-2xl glass-panel" style={{ background: 'rgba(255, 255, 255, 0.4)' }} role="progressbar" aria-label="Upload steps" aria-valuenow={stepIdx + 1} aria-valuemax={3}>
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black flex-shrink-0 transition-all duration-300 shadow-sm"
              style={{
                background: i <= stepIdx ? 'linear-gradient(135deg, #FFD93D, #FF6B35)' : 'rgba(255, 255, 255, 0.5)',
                color: i <= stepIdx ? '#1F2937' : '#9CA3AF',
                border: i <= stepIdx ? 'none' : '1px solid rgba(0, 0, 0, 0.05)'
              }}
              aria-current={i === stepIdx ? 'step' : undefined}
            >
              {i < stepIdx ? <CheckCircle size={14} aria-hidden="true" /> : i + 1}
            </div>
            <span className="text-xs font-black hidden sm:block" style={{ color: i <= stepIdx ? '#1F2937' : '#9CA3AF' }}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 rounded" style={{ background: i < stepIdx ? 'linear-gradient(90deg, #FFD93D, #FF6B35)' : 'rgba(0, 0, 0, 0.05)' }} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 1: Pick ── */}
        {step === 'pick' && (
          <motion.div key="pick" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

            {/* Mode tabs */}
            {!preview && (
              <div className="flex gap-2 mb-4 p-1 rounded-2xl glass-panel" style={{ background: 'rgba(255, 255, 255, 0.3)' }}>
                {(['upload', 'camera'] as PickMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setPickMode(mode);
                      setError('');
                      if (mode === 'camera') startCamera();
                      else stopCamera();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer"
                    style={{
                      background: pickMode === mode ? 'linear-gradient(135deg, #FFD93D, #FF6B35)' : 'transparent',
                      color: pickMode === mode ? '#1F2937' : '#9CA3AF',
                      boxShadow: pickMode === mode ? '0 4px 12px rgba(255, 107, 53, 0.15)' : 'none',
                      minHeight: '44px',
                    }}
                    aria-pressed={pickMode === mode}
                  >
                    {mode === 'upload' ? <Upload size={16} aria-hidden="true" /> : <Camera size={16} aria-hidden="true" />}
                    {mode === 'upload' ? 'Upload Photo' : 'Take Photo'}
                  </button>
                ))}
              </div>
            )}

            {/* ── Upload mode ── */}
            {pickMode === 'upload' && (
              <>
                <div
                  onClick={() => !preview && fileRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={e => e.preventDefault()}
                  className="relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 glass-panel hover-glow-smile"
                  style={{
                    minHeight: '280px',
                    borderColor: 'rgba(252, 211, 77, 0.6)',
                    background: 'rgba(255, 251, 235, 0.3)',
                    cursor: preview ? 'default' : 'pointer',
                  }}
                  role={preview ? undefined : 'button'}
                  tabIndex={preview ? -1 : 0}
                  aria-label={preview ? undefined : 'Click or drag to select an image'}
                  onKeyDown={e => !preview && e.key === 'Enter' && fileRef.current?.click()}
                >
                  {preview ? (
                    <img src={preview} alt="Selected photo preview" className="w-full object-cover rounded-3xl" style={{ maxHeight: '400px' }} />
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
              </>
            )}

            {/* ── Camera mode ── */}
            {pickMode === 'camera' && !preview && (
              <div className="relative rounded-3xl overflow-hidden border-4 pulse-glow-yellow" style={{ minHeight: '300px', background: '#1F2937', borderColor: '#FFD93D' }}>
                <video
                  ref={videoRef}
                  className="w-full rounded-3xl object-cover"
                  style={{
                    maxHeight: '420px',
                    transform: mirrored ? 'scaleX(-1)' : 'none',
                    display: cameraActive ? 'block' : 'none',
                  }}
                  playsInline
                  muted
                  aria-label="Camera preview"
                />

                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <motion.span
                      key={countdown}
                      initial={{ scale: 1.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-8xl font-black"
                      style={{ fontFamily: 'var(--font-nunito)', color: '#FFD93D' }}
                      aria-live="assertive"
                    >
                      {countdown}
                    </motion.span>
                  </div>
                )}

                {/* Camera not started */}
                {!cameraActive && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Camera size={48} style={{ color: '#6B7280' }} aria-hidden="true" />
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all duration-200 hover:scale-105"
                      style={{ background: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
                    >
                      Enable Camera
                    </button>
                  </div>
                )}

                {/* Camera error */}
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <ZapOff size={36} style={{ color: '#EF4444' }} aria-hidden="true" />
                    <p className="text-sm font-semibold" style={{ color: '#EF4444' }} role="alert">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
                      style={{ background: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Camera controls */}
                {cameraActive && countdown === null && (
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 px-4">
                    {/* Mirror toggle */}
                    <button
                      onClick={() => setMirrored(m => !m)}
                      className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                      aria-label="Toggle mirror"
                    >
                      <FlipHorizontal size={20} aria-hidden="true" />
                    </button>

                    {/* Capture button */}
                    <button
                      onClick={startCountdown}
                      className="flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                      style={{ background: 'white', borderColor: '#FFD93D' }}
                      aria-label="Take photo (3 second countdown)"
                    >
                      <div className="h-12 w-12 rounded-full" style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B35)' }} />
                    </button>

                    {/* Stop camera */}
                    <button
                      onClick={stopCamera}
                      className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                      aria-label="Stop camera"
                    >
                      <ZapOff size={20} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Preview from camera */}
            {pickMode === 'camera' && preview && (
              <img src={preview} alt="Captured photo preview" className="w-full rounded-3xl object-cover" style={{ maxHeight: '420px' }} />
            )}

            {error && <p className="mt-3 text-sm text-center" style={{ color: '#EF4444' }} role="alert">{error}</p>}

            {preview && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={resetPick}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280', minHeight: '44px' }}
                >
                  <RefreshCcw size={16} aria-hidden="true" />
                  {pickMode === 'camera' ? 'Retake' : 'Change'}
                </button>
                <button
                  onClick={runDetection}
                  disabled={detecting}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
                  style={{ background: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
                >
                  {detecting ? 'Detecting smile…' : 'Detect Smile →'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Step 2: Smile result ── */}
        {step === 'detect' && smileResult && (
          <motion.div key="detect" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {preview && (
              <img src={preview} alt="Your photo" className="w-full rounded-3xl mb-6 object-cover" style={{ maxHeight: '280px' }} />
            )}
            <div className="rounded-3xl p-6 glass-panel hover-glow-orange" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
              <SmileReveal score={smileResult.score} tier={smileResult.tier} points={smileResult.points} />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={resetPick}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-semibold text-sm cursor-pointer transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#E5E7EB', color: '#6B7280', minHeight: '44px' }}
              >
                <RefreshCcw size={16} aria-hidden="true" /> Try Again
              </button>
              <button
                onClick={() => setStep('caption')}
                disabled={captionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-wait cursor-pointer"
                style={{ background: '#FFD93D', color: '#1F2937', minHeight: '44px' }}
              >
                {captionLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Writing caption…
                  </>
                ) : 'Next →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Caption + post ── */}
        {step === 'caption' && (
          <motion.div key="caption" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {preview && (
              <img src={preview} alt="Your photo" className="w-full rounded-3xl object-cover" style={{ maxHeight: '280px' }} />
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
                className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none glass-input"
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
