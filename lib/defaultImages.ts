import { BASE_PATH, MAX_IMAGES } from './constants';
import { invalidateGrid } from './gridCache';
import { scheduleRender, refreshAnimLoop } from './animation';
import {
  syncControlsToActive,
  syncGlobalControls,
  renderImageSelect,
  updateFocusInteraction,
  updateImageCount,
  updateExampleStates,
} from './uiSync';
import { stopEntrySources } from './frameLoader';
import { defaultImageSettings } from './defaults';
import { analyzeImage } from './frameAnalysis';
import { exampleOverlayFor, deriveOverlayFromStats } from './exampleOverlays';
import type { EngineContext, ImageEntry } from './types';

function loadOne(name: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `${BASE_PATH}/img/${name}.jpg`;
  });
}

export async function addExample(
  ctx: EngineContext,
  name: string,
  deps: { onSelectImage: (i: number) => void; onRemoveImage: (i: number) => void },
): Promise<void> {
  const filename = `${name}.jpg`;
  const existing = ctx.state.images.findIndex((e) => e.filename === filename);
  if (existing !== -1) {
    ctx.state.selectedImage = existing;
    renderImageSelect(ctx, deps);
    syncControlsToActive(ctx);
    updateExampleStates(ctx);
    return;
  }
  const img = await loadOne(name);
  if (!img) return;
  const atMax = ctx.state.images.length >= MAX_IMAGES;

  const overlay = exampleOverlayFor(name);
  const seed: any = overlay
    ? { ...defaultImageSettings(), ...overlay.s }
    : { ...defaultImageSettings() };
  seed.text = overlay?.s.text ?? name;
  if (overlay?.bg) ctx.state.bgColor = overlay.bg;

  const stats = analyzeImage(img);
  const entry: ImageEntry = {
    img, video: null, stream: null, sourceKind: 'image',
    settings: seed, filename, stats,
  };

  if (!overlay) {
    Object.assign(seed, deriveOverlayFromStats(stats));
  }
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
  syncGlobalControls(ctx);
  refreshAnimLoop(ctx);
  updateFocusInteraction(ctx);
  updateImageCount(ctx);
  updateExampleStates(ctx);
  invalidateGrid(ctx);
  scheduleRender(ctx);
}
