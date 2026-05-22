import { anyAnimating } from './state';
import { computeLayout } from './layout';
import { renderToCanvas } from './rendering';
import { gridToText } from './textExport';
import type { EngineContext } from './types';

declare global {
  interface Window {
    GIF: any;
  }
}

export function exportPng(ctx: EngineContext): void {
  const temp = document.createElement('canvas');
  renderToCanvas(ctx, temp, ctx.state.exportScale, null, { noAnim: true });
  temp.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ascii-${Date.now()}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, 'image/png');
}

export async function copyAsText(ctx: EngineContext, btn: HTMLButtonElement): Promise<void> {
  await navigator.clipboard.writeText(gridToText(ctx));
  const orig = btn.textContent;
  btn.textContent = 'COPIED';
  setTimeout(() => { btn.textContent = orig; }, 1200);
}

let gifWorkerUrlPromise: Promise<string | null> | null = null;
export function getGifWorkerUrl(): Promise<string | null> {
  if (gifWorkerUrlPromise) return gifWorkerUrlPromise;
  gifWorkerUrlPromise = fetch('https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js')
    .then((r) => {
      if (!r.ok) throw new Error('worker fetch failed');
      return r.text();
    })
    .then((code) => URL.createObjectURL(new Blob([code], { type: 'application/javascript' })))
    .catch(() => null);
  return gifWorkerUrlPromise;
}

export async function exportGif(ctx: EngineContext, gifBtn: HTMLButtonElement): Promise<void> {
  if (typeof window.GIF === 'undefined') {
    alert('GIF encoder failed to load. Check your connection.');
    return;
  }
  if (!anyAnimating(ctx.state)) {
    alert('Enable ANIMATE on at least one image first.');
    return;
  }
  const workerUrl = await getGifWorkerUrl();
  if (!workerUrl) {
    alert('GIF worker failed to load. Check your connection.');
    return;
  }

  const original = gifBtn.textContent;
  gifBtn.disabled = true;
  gifBtn.classList.add('recording');

  const fps = 15;
  const duration = 4;
  const totalFrames = fps * duration;
  const delay = Math.round(1000 / fps);
  const scale = ctx.state.exportScale;

  const layout = computeLayout(ctx);
  const gifW = Math.max(1, Math.round(layout.totalCols * layout.charW * scale));
  const gifH = Math.max(1, Math.round(layout.totalRows * layout.charH * scale));
  const temp = document.createElement('canvas');
  temp.width = gifW;
  temp.height = gifH;
  // CPU-backed canvas makes per-frame getImageData (used to feed gif.js) much
  // faster than the default GPU-backed canvas.
  const tempCtx = temp.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

  const workerCount = Math.max(2, Math.min(4, (navigator.hardwareConcurrency || 2) - 1));
  const gif = new window.GIF({
    workers: workerCount,
    // Higher number = fewer color samples = faster encode. ASCII art has a
    // tiny effective palette so the quality hit is imperceptible.
    quality: 15,
    width: gifW,
    height: gifH,
    workerScript: workerUrl,
    background: ctx.state.bgColor,
  });

  let i = 0;
  function captureFrame() {
    if (i < totalFrames) {
      const t = i / fps;
      renderToCanvas(ctx, temp, scale, t, { forceOpaque: true });
      // Pre-extract ImageData and pass it directly so gif.js can skip its own
      // getImageData + array copy on every frame.
      const frameData = tempCtx.getImageData(0, 0, gifW, gifH);
      gif.addFrame(frameData, { delay });
      gifBtn.textContent = `CAPTURE ${i + 1}/${totalFrames}`;
      i++;
      setTimeout(captureFrame, 0);
    } else {
      gifBtn.textContent = 'ENCODING…';
      gif.on('progress', (p: number) => {
        gifBtn.textContent = `ENCODE ${Math.round(p * 100)}%`;
      });
      gif.on('finished', (blob: Blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `ascii-${Date.now()}.gif`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        gifBtn.textContent = original;
        gifBtn.disabled = false;
        gifBtn.classList.remove('recording');
      });
      gif.render();
    }
  }
  captureFrame();
}
