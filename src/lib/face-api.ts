'use client';

import { getSmileTier } from './smile-points';
import type { SmileTierInfo } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let landmarker: any = null;

export async function loadModels(): Promise<void> {
  if (landmarker) return;

  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

  const vision = await FilesetResolver.forVisionTasks(
    `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm`
  );

  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/models/face_landmarker.task',
    },
    runningMode: 'IMAGE',
    numFaces: 1,
  });
}

type Landmark = { x: number; y: number; z: number };

function computeScore(lm: Landmark[]): number {
  // Mouth corners
  const lc = lm[61];  // left corner
  const rc = lm[291]; // right corner
  // Face width reference (cheekbones)
  const lCheek = lm[234];
  const rCheek = lm[454];
  // Lip center (upper lip top)
  const lipTop = lm[13];

  const mouthWidth = Math.hypot(rc.x - lc.x, rc.y - lc.y);
  const faceWidth  = Math.hypot(rCheek.x - lCheek.x, rCheek.y - lCheek.y);

  // Width ratio: neutral ~0.28-0.32, smile ~0.44-0.55
  const widthScore = (mouthWidth / faceWidth - 0.28) / 0.24;

  // Corner lift: smile corners rise above lip center (y decreases upward)
  const avgCornerY = (lc.y + rc.y) / 2;
  const liftScore  = (avgCornerY - lipTop.y) / faceWidth / -0.06;

  const combined = widthScore * 0.6 + liftScore * 0.4;
  return Math.max(0, Math.min(1, combined));
}

export async function detectSmile(
  imgElement: HTMLImageElement | HTMLVideoElement
): Promise<SmileTierInfo & { score: number }> {
  await loadModels();

  const result = landmarker.detect(imgElement);

  if (!result.faceLandmarks?.length) {
    return { score: 0, ...getSmileTier(0) };
  }

  const score = computeScore(result.faceLandmarks[0]);
  return { score, ...getSmileTier(score) };
}
