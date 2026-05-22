import { MAX_IMAGES } from './constants';
import { invalidateGrid } from './gridCache';
import { scheduleRender, refreshAnimLoop } from './animation';
import {
  syncControlsToActive,
  renderImageSelect,
  updateFocusInteraction,
  updateImageCount,
  updateExampleStates,
} from './uiSync';
import type { EngineContext, ImageEntry, SourceKind } from './types';
import { defaultImageSettings } from './defaults';
import { analyzeImage } from './frameAnalysis';
import { deriveOverlayFromStats } from './exampleOverlays';

type LoaderDeps = {
  onSelectImage: (i: number) => void;
  onRemoveImage: (i: number) => void;
};

function freshSeed(ctx: EngineContext): any {
  const isFirst = ctx.state.images.length === 0;
  return isFirst
    ? { ...ctx.state.draft }
    : { ...ctx.state.images[ctx.state.selectedImage].settings };
}

function placeEntry(ctx: EngineContext, entry: ImageEntry, deps: LoaderDeps): void {
  const atMax = ctx.state.images.length >= MAX_IMAGES;
  if (atMax) {
    const old = ctx.state.images[ctx.state.selectedImage];
    if (old) stopEntrySources(old);
    ctx.state.images[ctx.state.selectedImage] = entry;
  } else {
    ctx.state.images.push(entry);
    ctx.state.selectedImage = ctx.state.images.length - 1;
  }
  ctx.canvas.classList.add('has-image');
  renderImageSelect(ctx, deps);
  syncControlsToActive(ctx);
  refreshAnimLoop(ctx);
  updateFocusInteraction(ctx);
  updateImageCount(ctx);
  updateExampleStates(ctx);
  invalidateGrid(ctx);
  scheduleRender(ctx);
}

export function stopEntrySources(entry: ImageEntry): void {
  if (entry.video) {
    try { entry.video.pause(); } catch {}
  }
  if (entry.stream) {
    entry.stream.getTracks().forEach((t) => t.stop());
  }
  entry.video = null;
  entry.stream = null;
}

export function loadImageFile(ctx: EngineContext, file: File, deps: LoaderDeps): Promise<void> {
  return new Promise((resolve) => {
    if (!file) { resolve(); return; }
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      loadVideoSource(ctx, url, file.name, deps).then(resolve);
      return;
    }
    if (!file.type.startsWith('image/')) { resolve(); return; }
    const reader = new FileReader();
    reader.onerror = () => resolve();
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve();
      img.onload = () => {
        const seed = freshSeed(ctx);
        const stats = analyzeImage(img);
        Object.assign(seed, deriveOverlayFromStats(stats));
        if (/\.(png|svg)$/i.test(file.name) || /(png|svg)/i.test(file.type)) {
          seed.threshold = 0;
        }
        const entry: ImageEntry = {
          img, video: null, stream: null,
          sourceKind: 'image' as SourceKind,
          settings: seed, filename: file.name, stats,
        };
        placeEntry(ctx, entry, deps);
        resolve();
      };
      img.src = (e.target as FileReader).result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function loadImageFiles(ctx: EngineContext, files: FileList | File[] | null, deps: LoaderDeps): Promise<void> {
  for (const f of Array.from(files || [])) {
    await loadImageFile(ctx, f, deps);
  }
}

export function loadImageFromBlob(ctx: EngineContext, blob: Blob, filename: string, deps: LoaderDeps): Promise<void> {
  const file = new File([blob], filename, { type: blob.type || 'image/png' });
  return loadImageFile(ctx, file, deps);
}

export async function loadImageFromUrl(ctx: EngineContext, url: string, deps: LoaderDeps): Promise<void> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    const name = url.split('/').pop() || 'remote-image';
    await loadImageFromBlob(ctx, blob, name, deps);
  } catch {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => { alert('Failed to load image from URL'); resolve(); };
      img.onload = () => {
        const seed = freshSeed(ctx);
        const fname = url.split('/').pop() || 'remote-image';
        let stats;
        try {
          stats = analyzeImage(img);
          Object.assign(seed, deriveOverlayFromStats(stats));
        } catch {}
        if (/\.(png|svg)(\?|$)/i.test(url)) {
          seed.threshold = 0;
        }
        const entry: ImageEntry = {
          img, video: null, stream: null,
          sourceKind: 'image' as SourceKind,
          settings: seed, filename: fname, stats,
        };
        placeEntry(ctx, entry, deps);
        resolve();
      };
      img.src = url;
    });
  }
}

export async function loadVideoSource(
  ctx: EngineContext, src: string, filename: string, deps: LoaderDeps,
): Promise<void> {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.src = src;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = 'anonymous';
    v.onerror = () => { alert('Failed to load video'); resolve(); };
    v.onloadedmetadata = () => {
      v.play().catch(() => {});
    };
    v.onloadeddata = () => {
      const seed = freshSeed(ctx);
      let stats;
      try {
        stats = analyzeImage(v);
        Object.assign(seed, deriveOverlayFromStats(stats));
      } catch {}
      const entry: ImageEntry = {
        img: null, video: v, stream: null,
        sourceKind: 'video' as SourceKind,
        settings: seed, filename, stats,
      };
      placeEntry(ctx, entry, deps);
      resolve();
    };
  });
}

export async function startWebcam(ctx: EngineContext, deps: LoaderDeps): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) {
    alert('Webcam not supported in this browser');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    const v = document.createElement('video');
    v.srcObject = stream;
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    await new Promise<void>((res) => {
      v.onloadedmetadata = () => { v.play().then(() => res()).catch(() => res()); };
    });
    await new Promise<void>((res) => {
      const anyV = v as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
      };
      if (typeof anyV.requestVideoFrameCallback === 'function') {
        anyV.requestVideoFrameCallback(() => res());
      } else {
        setTimeout(res, 120);
      }
    });
    const seed = freshSeed(ctx);
    let stats;
    try {
      stats = analyzeImage(v);
      Object.assign(seed, deriveOverlayFromStats(stats));
    } catch {}
    const entry: ImageEntry = {
      img: null, video: v, stream,
      sourceKind: 'webcam' as SourceKind,
      settings: seed, filename: 'webcam', stats,
    };
    placeEntry(ctx, entry, deps);
  } catch (err) {
    alert('Webcam access denied');
  }
}

export function removeImage(ctx: EngineContext, index: number, deps: LoaderDeps): void {
  if (index < 0 || index >= ctx.state.images.length) return;
  const removed = ctx.state.images[index];
  stopEntrySources(removed);
  ctx.state.images.splice(index, 1);
  if (ctx.state.images.length === 0) {
    ctx.state.selectedImage = 0;
    ctx.state.focusedImage = null;
    ctx.canvas.classList.remove('has-image');
  } else {
    if (ctx.state.focusedImage === index) ctx.state.focusedImage = null;
    else if (ctx.state.focusedImage != null && ctx.state.focusedImage > index) ctx.state.focusedImage -= 1;
    if (ctx.state.selectedImage === index) {
      ctx.state.selectedImage = Math.min(index, ctx.state.images.length - 1);
    } else if (ctx.state.selectedImage > index) {
      ctx.state.selectedImage -= 1;
    }
  }
  renderImageSelect(ctx, deps);
  syncControlsToActive(ctx);
  refreshAnimLoop(ctx);
  updateFocusInteraction(ctx);
  updateImageCount(ctx);
  updateExampleStates(ctx);
  invalidateGrid(ctx);
  scheduleRender(ctx);
}
