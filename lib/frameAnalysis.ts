import type { ImageStats } from './types';

const TARGET_LONG_EDGE = 96;
const EDGE_THRESHOLD = 0.12;

export function analyzeImage(source: CanvasImageSource): ImageStats {
  const srcW = (source as HTMLImageElement).naturalWidth
    || (source as HTMLVideoElement).videoWidth
    || (source as HTMLCanvasElement).width
    || 1;
  const srcH = (source as HTMLImageElement).naturalHeight
    || (source as HTMLVideoElement).videoHeight
    || (source as HTMLCanvasElement).height
    || 1;
  const aspect = srcW / srcH;

  const scale = TARGET_LONG_EDGE / Math.max(srcW, srcH);
  const w = Math.max(8, Math.round(srcW * scale));
  const h = Math.max(8, Math.round(srcH * scale));

  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : document.createElement('canvas');
  if (!(canvas instanceof OffscreenCanvas)) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) return fallback(aspect);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';
  ctx.drawImage(source, 0, 0, w, h);

  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    return fallback(aspect);
  }
  const data = imgData.data;
  const n = w * h;

  const lum = new Float32Array(n);
  let sumL = 0;
  let sumSatLin = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    lum[p] = l;
    sumL += l;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    sumSatLin += mx === 0 ? 0 : (mx - mn) / mx;
  }
  const meanBrightness = sumL / n;
  const meanSaturation = sumSatLin / n;

  let sumVar = 0;
  for (let p = 0; p < n; p++) {
    const d = lum[p] - meanBrightness;
    sumVar += d * d;
  }
  const contrast = Math.sqrt(sumVar / n);

  let edgeCount = 0;
  let edgeArea = 0;
  let cxSum = 0;
  let cySum = 0;
  let cWeight = 0;
  const invMaxSobel = 1 / Math.sqrt(32);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -lum[i - w - 1] + lum[i - w + 1]
        - 2 * lum[i - 1] + 2 * lum[i + 1]
        - lum[i + w - 1] + lum[i + w + 1];
      const gy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1]
        + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
      const m = Math.sqrt(gx * gx + gy * gy) * invMaxSobel;
      edgeArea++;
      if (m > EDGE_THRESHOLD) {
        edgeCount++;
        cxSum += x * m;
        cySum += y * m;
        cWeight += m;
      }
    }
  }
  const edgeDensity = edgeArea > 0 ? edgeCount / edgeArea : 0;
  const subjectX = cWeight > 0 ? (cxSum / cWeight) / w : 0.5;
  const subjectY = cWeight > 0 ? (cySum / cWeight) / h : 0.5;

  return {
    meanBrightness,
    contrast,
    edgeDensity,
    meanSaturation,
    aspect,
    subjectX,
    subjectY,
    isDark: meanBrightness < 0.35,
    isFlat: contrast < 0.15,
    isBusy: edgeDensity > 0.18,
    isMonochrome: meanSaturation < 0.15,
  };
}

function fallback(aspect: number): ImageStats {
  return {
    meanBrightness: 0.5,
    contrast: 0.25,
    edgeDensity: 0.1,
    meanSaturation: 0.4,
    aspect,
    subjectX: 0.5,
    subjectY: 0.5,
    isDark: false,
    isFlat: false,
    isBusy: false,
    isMonochrome: false,
  };
}
