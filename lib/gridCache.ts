import { processImageToGrid } from './frameProcessing';
import type { EngineContext, Grid, LayoutGrid } from './types';

export function invalidateGrid(ctx: EngineContext): void {
  ctx.runtime.gridCaches = [];
}

export function getGrid(ctx: EngineContext, layoutGrid: LayoutGrid, imgIndex: number): Grid {
  const { cols, rows, settings, img, video, sourceKind } = layoutGrid;
  const source: CanvasImageSource | null = sourceKind === 'image' ? img : video;
  let srcW = 0, srcH = 0;
  let srcKey = 'no-img';
  if (sourceKind === 'image' && img) {
    srcW = img.naturalWidth;
    srcH = img.naturalHeight;
    srcKey = img.src.slice(0, 64) + '|' + srcW + 'x' + srcH;
  } else if (video) {
    srcW = video.videoWidth;
    srcH = video.videoHeight;
    srcKey = 'live|' + sourceKind;
  }
  const isLive = sourceKind !== 'image';
  const key = [
    cols, rows, srcKey,
    settings.brightness, settings.contrast, settings.saturation,
    settings.gamma, settings.invert,
    settings.blur, settings.sharpen, settings.edge,
    settings.posterize, settings.dither,
    settings.hueShift, settings.tintColor, settings.tintStrength,
    settings.paletteMode,
    settings.duotoneEnable, settings.duotoneLight, settings.duotoneDark,
    settings.rotation, settings.flipH, settings.flipV,
    ctx.state.bgColor,
    isLive ? Math.floor(ctx.runtime.animFrame * 30) : 0,
  ].join(',');
  const cached = ctx.runtime.gridCaches[imgIndex];
  if (cached && cached.key === key) return cached.grid;
  const grid = processImageToGrid(ctx.procCanvas, ctx.procCtx, source, srcW, srcH, cols, rows, settings, ctx.state.bgColor);
  ctx.runtime.gridCaches[imgIndex] = { key, grid };
  return grid;
}
