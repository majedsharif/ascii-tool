import type { EngineContext } from './types';

const MIN_ZOOM = 1;
const MAX_ZOOM = 16;
const WHEEL_STEP = 1.0015;
const BUTTON_STEP = 1.25;
const DRAG_THRESHOLD = 4;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function updateLabel(ctx: EngineContext): void {
  const el = document.getElementById('zoomLabel');
  if (el) el.textContent = Math.round(ctx.runtime.zoom * 100) + '%';
  if (ctx.runtime.zoom > 1) ctx.canvas.classList.add('is-zoomed');
  else ctx.canvas.classList.remove('is-zoomed');
  const out = document.getElementById('zoomOut') as HTMLButtonElement | null;
  if (out) out.disabled = ctx.runtime.zoom <= MIN_ZOOM + 1e-6;
  const fit = document.getElementById('zoomFit') as HTMLButtonElement | null;
  if (fit) fit.disabled = ctx.runtime.zoom === 1 && ctx.runtime.panX === 0 && ctx.runtime.panY === 0;
}

export function applyZoomTransform(ctx: EngineContext): void {
  const { zoom, panX, panY } = ctx.runtime;
  ctx.outputCanvas.style.transformOrigin = '0 0';
  ctx.outputCanvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  updateLabel(ctx);
}

export function resetZoom(ctx: EngineContext): void {
  ctx.runtime.zoom = 1;
  ctx.runtime.panX = 0;
  ctx.runtime.panY = 0;
  applyZoomTransform(ctx);
}

function zoomAt(ctx: EngineContext, factor: number, cx: number, cy: number): void {
  const oldZoom = ctx.runtime.zoom;
  const newZoom = clamp(oldZoom * factor, MIN_ZOOM, MAX_ZOOM);
  if (newZoom === oldZoom) return;
  const rect = ctx.outputCanvas.getBoundingClientRect();
  const dx = cx - rect.left + ctx.runtime.panX;
  const dy = cy - rect.top + ctx.runtime.panY;
  const ratio = newZoom / oldZoom;
  ctx.runtime.panX = dx - (dx - ctx.runtime.panX) * ratio;
  ctx.runtime.panY = dy - (dy - ctx.runtime.panY) * ratio;
  ctx.runtime.zoom = newZoom;
  if (newZoom === 1) { ctx.runtime.panX = 0; ctx.runtime.panY = 0; }
  applyZoomTransform(ctx);
}

function canvasCenter(ctx: EngineContext): { x: number; y: number } {
  const r = ctx.canvas.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function setupZoom(ctx: EngineContext): () => void {
  ctx.runtime.zoom = 1;
  ctx.runtime.panX = 0;
  ctx.runtime.panY = 0;
  ctx.runtime.suppressNextClick = false;
  applyZoomTransform(ctx);

  const onWheel = (e: WheelEvent) => {
    if (ctx.state.images.length === 0) return;
    e.preventDefault();
    const factor = Math.pow(WHEEL_STEP, -e.deltaY);
    zoomAt(ctx, factor, e.clientX, e.clientY);
  };
  ctx.canvas.addEventListener('wheel', onWheel, { passive: false });

  let panning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panOriginX = 0;
  let panOriginY = 0;
  let moved = false;

  const onPointerDown = (e: PointerEvent) => {
    if (ctx.runtime.zoom <= 1) return;
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.canvas-toolbar, .zoom-toolbar')) return;
    panning = true;
    moved = false;
    panStartX = e.clientX;
    panStartY = e.clientY;
    panOriginX = ctx.runtime.panX;
    panOriginY = ctx.runtime.panY;
    ctx.canvas.classList.add('is-panning');
    ctx.outputCanvas.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!panning) return;
    const dx = e.clientX - panStartX;
    const dy = e.clientY - panStartY;
    if (!moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) moved = true;
    ctx.runtime.panX = panOriginX + dx;
    ctx.runtime.panY = panOriginY + dy;
    applyZoomTransform(ctx);
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!panning) return;
    panning = false;
    ctx.canvas.classList.remove('is-panning');
    if (moved) ctx.runtime.suppressNextClick = true;
    try { ctx.outputCanvas.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };
  ctx.outputCanvas.addEventListener('pointerdown', onPointerDown);
  ctx.outputCanvas.addEventListener('pointermove', onPointerMove);
  ctx.outputCanvas.addEventListener('pointerup', onPointerUp);
  ctx.outputCanvas.addEventListener('pointercancel', onPointerUp);

  const zoomIn = document.getElementById('zoomIn');
  const zoomOut = document.getElementById('zoomOut');
  const zoomFit = document.getElementById('zoomFit');
  const onZoomIn = () => { const c = canvasCenter(ctx); zoomAt(ctx, BUTTON_STEP, c.x, c.y); };
  const onZoomOut = () => { const c = canvasCenter(ctx); zoomAt(ctx, 1 / BUTTON_STEP, c.x, c.y); };
  const onZoomFit = () => resetZoom(ctx);
  zoomIn?.addEventListener('click', onZoomIn);
  zoomOut?.addEventListener('click', onZoomOut);
  zoomFit?.addEventListener('click', onZoomFit);

  // Pinch-to-zoom via two-pointer tracking
  const activePointers = new Map<number, { x: number; y: number }>();
  let pinchDist = 0;
  let pinchMid = { x: 0, y: 0 };
  const onPinchDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.size === 2) {
      const pts = Array.from(activePointers.values());
      pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchMid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      panning = false;
    }
  };
  const onPinchMove = (e: PointerEvent) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.size === 2) {
      const pts = Array.from(activePointers.values());
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinchDist > 0) zoomAt(ctx, d / pinchDist, pinchMid.x, pinchMid.y);
      pinchDist = d;
      pinchMid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    }
  };
  const onPinchUp = (e: PointerEvent) => {
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) pinchDist = 0;
  };
  ctx.outputCanvas.addEventListener('pointerdown', onPinchDown);
  ctx.outputCanvas.addEventListener('pointermove', onPinchMove);
  ctx.outputCanvas.addEventListener('pointerup', onPinchUp);
  ctx.outputCanvas.addEventListener('pointercancel', onPinchUp);

  return () => {
    ctx.canvas.removeEventListener('wheel', onWheel);
    ctx.outputCanvas.removeEventListener('pointerdown', onPointerDown);
    ctx.outputCanvas.removeEventListener('pointermove', onPointerMove);
    ctx.outputCanvas.removeEventListener('pointerup', onPointerUp);
    ctx.outputCanvas.removeEventListener('pointercancel', onPointerUp);
    ctx.outputCanvas.removeEventListener('pointerdown', onPinchDown);
    ctx.outputCanvas.removeEventListener('pointermove', onPinchMove);
    ctx.outputCanvas.removeEventListener('pointerup', onPinchUp);
    ctx.outputCanvas.removeEventListener('pointercancel', onPinchUp);
    zoomIn?.removeEventListener('click', onZoomIn);
    zoomOut?.removeEventListener('click', onZoomOut);
    zoomFit?.removeEventListener('click', onZoomFit);
  };
}
