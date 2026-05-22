import { computeLayout } from './layout';
import { getGrid } from './gridCache';
import { getCharIndex, pseudoRand } from './charMapping';
import { fontCssById } from './presets';
import type { EngineContext, RenderOpts } from './types';

function paintBackground(ctx: EngineContext, tctx: CanvasRenderingContext2D, w: number, h: number, scale: number): void {
  const s = ctx.state;
  if (s.bgMode === 'gradient') {
    const angle = ((s.bgGradientAngle || 180) * Math.PI) / 180;
    const cx = w / 2, cy = h / 2;
    const r = Math.sqrt(w * w + h * h) / 2;
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    const g = tctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    g.addColorStop(0, s.bgGradient1);
    g.addColorStop(1, s.bgGradient2);
    tctx.fillStyle = g;
    tctx.fillRect(0, 0, w, h);
  } else if (s.bgMode === 'image' && s.bgImage) {
    const bgImg = bgImageCache(s.bgImage);
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      const ir = bgImg.naturalWidth / bgImg.naturalHeight;
      const cr = w / h;
      let sx = 0, sy = 0, sw = bgImg.naturalWidth, sh = bgImg.naturalHeight;
      if (ir > cr) {
        sw = sh * cr;
        sx = (bgImg.naturalWidth - sw) / 2;
      } else {
        sh = sw / cr;
        sy = (bgImg.naturalHeight - sh) / 2;
      }
      tctx.fillStyle = s.bgColor;
      tctx.fillRect(0, 0, w, h);
      tctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, w, h);
    } else {
      tctx.fillStyle = s.bgColor;
      tctx.fillRect(0, 0, w, h);
    }
  } else {
    tctx.fillStyle = s.bgColor;
    tctx.fillRect(0, 0, w, h);
  }
}

const bgImageCacheMap = new Map<string, HTMLImageElement>();
function bgImageCache(src: string): HTMLImageElement | null {
  if (!src) return null;
  let e = bgImageCacheMap.get(src);
  if (!e) {
    e = new Image();
    e.src = src;
    bgImageCacheMap.set(src, e);
  }
  return e;
}

// Canvas2D `letterSpacing` lets us draw whole runs of monospace text in a
// single fillText call. Without it, batching would mis-space characters.
const SUPPORTS_LETTER_SPACING =
  typeof CanvasRenderingContext2D !== 'undefined'
  && 'letterSpacing' in CanvasRenderingContext2D.prototype;

export function renderToCanvas(
  ctx: EngineContext,
  target: HTMLCanvasElement,
  scale: number,
  forceT: number | null = null,
  opts: RenderOpts = {},
): void {
  const tctx = target.getContext('2d') as CanvasRenderingContext2D;
  const layout = computeLayout(ctx);
  const { grids, charW, charH, totalCols, totalRows, colOffsets, rowOffsets, colWidths, rowHeights } = layout;
  const { state, runtime } = ctx;

  const w = Math.max(1, Math.round(totalCols * charW * scale));
  const h = Math.max(1, Math.round(totalRows * charH * scale));
  if (target.width !== w) target.width = w;
  if (target.height !== h) target.height = h;

  const useTransparent = state.transparentBG && !opts.forceOpaque;
  if (useTransparent) {
    tctx.clearRect(0, 0, w, h);
  } else {
    paintBackground(ctx, tctx, w, h, scale);
  }

  if (opts.forceOriginal) {
    for (let i = 0; i < grids.length; i++) {
      const g = grids[i];
      const source = g.sourceKind === 'image' ? g.img : g.video;
      if (!source) continue;
      const srcW = g.sourceKind === 'image' ? (g.img?.naturalWidth || 0) : (g.video?.videoWidth || 0);
      const srcH = g.sourceKind === 'image' ? (g.img?.naturalHeight || 0) : (g.video?.videoHeight || 0);
      if (!srcW || !srcH) continue;
      const cellColWidth = colWidths[g.gridCol] || g.cols;
      const cellRowHeight = rowHeights[g.gridRow] || g.rows;
      const xOffsetChars = colOffsets[g.gridCol] + Math.floor((cellColWidth - g.cols) / 2);
      const yOffsetChars = rowOffsets[g.gridRow] + Math.floor((cellRowHeight - g.rows) / 2);
      const dx = xOffsetChars * charW * scale;
      const dy = yOffsetChars * charH * scale;
      const dw = g.cols * charW * scale;
      const dh = g.rows * charH * scale;
      tctx.drawImage(source, dx, dy, dw, dh);
    }
    return;
  }

  const fontCss = fontCssById(state.fontFamily);
  tctx.textBaseline = 'top';
  tctx.font = `400 ${state.fontSize * scale}px ${fontCss}`;
  if (SUPPORTS_LETTER_SPACING) {
    (tctx as any).letterSpacing = `${state.charSpace * scale}px`;
  }

  const globalT = opts.noAnim
    ? null
    : (forceT != null ? forceT : (runtime.animRaf ? runtime.animFrame : null));

  for (let i = 0; i < grids.length; i++) {
    const g = grids[i];
    const s = g.settings;
    const text = s.text.replace(/[\r\n\t]/g, '') || ' ';
    const threshold = s.threshold / 100;
    const addSpaces = s.addSpaces / 100;
    const useSolid = !s.photoColors;
    const tImg = (globalT != null && s.animEnable) ? globalT : null;

    const cellColWidth = colWidths[g.gridCol] || g.cols;
    const cellRowHeight = rowHeights[g.gridRow] || g.rows;
    const xOffsetChars = colOffsets[g.gridCol] + Math.floor((cellColWidth - g.cols) / 2);
    const yOffsetChars = rowOffsets[g.gridRow] + Math.floor((cellRowHeight - g.rows) / 2);

    const grid = getGrid(ctx, g, g.index);
    const cellW = charW * scale;
    const cellH = charH * scale;
    const canBatch = SUPPORTS_LETTER_SPACING;

    if (useSolid) tctx.fillStyle = s.textColor;
    let lastRgb = -1;

    for (let y = 0; y < g.rows; y++) {
      const drawY = (y + yOffsetChars) * cellH;
      let runStr = '';
      let runStartX = -1;
      let runColor = '';
      let runRgb = -1;
      let lastRunX = -2;

      const flushRun = (): void => {
        if (!runStr) return;
        if (useSolid) {
          // fillStyle already set to s.textColor before the loop.
        } else if (runRgb !== lastRgb) {
          tctx.fillStyle = runColor;
          lastRgb = runRgb;
        }
        const drawX = (runStartX + xOffsetChars) * cellW;
        tctx.fillText(runStr, drawX, drawY);
        runStr = '';
        runStartX = -1;
        lastRunX = -2;
      };

      for (let x = 0; x < g.cols; x++) {
        const p = y * g.cols + x;
        if (grid.alpha[p] < 16) { flushRun(); continue; }
        const bVal = grid.gray[p];
        if (bVal < threshold) { flushRun(); continue; }
        if (addSpaces > 0) {
          const seed = tImg != null
            ? x * 2.7 + y * 3.1 + g.index * 11.37 + Math.floor(tImg * 6 * (s.animSpeed / 4))
            : x * 2.7 + y * 3.1 + g.index * 11.37;
          if (pseudoRand(seed) < addSpaces) { flushRun(); continue; }
        }
        const idx = getCharIndex(x, y, g.cols, g.rows, s, text, tImg, bVal);
        if (idx < 0) { flushRun(); continue; }
        const ch = text[idx];
        if (!ch || ch === ' ') { flushRun(); continue; }

        let cellRgb = -1;
        let cellColor = '';
        if (!useSolid) {
          const ci = p * 3;
          const r = grid.colors[ci];
          const gC = grid.colors[ci + 1];
          const b = grid.colors[ci + 2];
          cellRgb = (r << 16) | (gC << 8) | b;
          if (canBatch) {
            // Only build the string when this color differs from the current run.
            if (cellRgb !== runRgb) cellColor = `rgb(${r},${gC},${b})`;
          } else {
            if (cellRgb !== lastRgb) {
              tctx.fillStyle = `rgb(${r},${gC},${b})`;
              lastRgb = cellRgb;
            }
          }
        }

        if (!canBatch) {
          const drawX = (x + xOffsetChars) * cellW;
          tctx.fillText(ch, drawX, drawY);
          continue;
        }

        const contiguous = x === lastRunX + 1;
        const sameColor = useSolid || cellRgb === runRgb;
        if (runStartX === -1 || !contiguous || !sameColor) {
          flushRun();
          runStartX = x;
          runRgb = cellRgb;
          runColor = useSolid ? '' : (cellColor || `rgb(${grid.colors[p * 3]},${grid.colors[p * 3 + 1]},${grid.colors[p * 3 + 2]})`);
        }
        runStr += ch;
        lastRunX = x;
      }
      flushRun();
    }
  }
}

function canvasContentSize(el: HTMLElement): { w: number; h: number } {
  const cs = getComputedStyle(el);
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padR = parseFloat(cs.paddingRight) || 0;
  const padT = parseFloat(cs.paddingTop) || 0;
  const padB = parseFloat(cs.paddingBottom) || 0;
  return {
    w: Math.max(1, el.clientWidth - padL - padR),
    h: Math.max(1, el.clientHeight - padT - padB),
  };
}

export function computeLiveScale(ctx: EngineContext): number {
  const layout = computeLayout(ctx);
  const nativeW = Math.max(1, layout.totalCols * layout.charW);
  const nativeH = Math.max(1, layout.totalRows * layout.charH);
  const { w: targetW, h: targetH } = canvasContentSize(ctx.canvas);
  const fit = Math.min(targetW / nativeW, targetH / nativeH);
  if (!isFinite(fit) || fit <= 1) return 1;
  return Math.min(3, Math.max(1, Math.ceil(fit)));
}

export function fitOutputToCanvas(ctx: EngineContext): void {
  const { w: maxW, h: maxH } = canvasContentSize(ctx.canvas);
  const ratio = ctx.outputCanvas.width / ctx.outputCanvas.height;
  let dispW = maxW;
  let dispH = dispW / ratio;
  if (dispH > maxH) { dispH = maxH; dispW = dispH * ratio; }
  ctx.outputCanvas.style.width = dispW + 'px';
  ctx.outputCanvas.style.height = dispH + 'px';
}

export function render(ctx: EngineContext): void {
  renderToCanvas(ctx, ctx.outputCanvas, computeLiveScale(ctx), null, { forceOriginal: ctx.state.compareMode });
  fitOutputToCanvas(ctx);
}
