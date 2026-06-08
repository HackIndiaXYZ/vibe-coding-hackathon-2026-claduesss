'use client';

import { getSmileTier } from './smile-points';
import type { SmileTierInfo } from '@/types';

let modelsLoaded = false;

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;
  const faceapi = await import('face-api.js');
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

export async function detectSmile(imgElement: HTMLImageElement): Promise<SmileTierInfo & { score: number }> {
  const faceapi = await import('face-api.js');
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 });

  const result = await faceapi
    .detectSingleFace(imgElement, options)
    .withFaceLandmarks()
    .withFaceExpressions();

  if (!result) return { score: 0, ...getSmileTier(0) };

  const score = result.expressions.happy ?? 0;
  return { score, ...getSmileTier(score) };
}
