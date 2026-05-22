import { anyAnimating, hasLiveSource } from './state';
import { invalidateGrid } from './gridCache';
import { render } from './rendering';
import type { EngineContext } from './types';

export function scheduleRender(ctx: EngineContext): void {
  const { runtime } = ctx;
  if (runtime.animRaf) return;
  if (runtime.pendingRender) return;
  runtime.pendingRender = requestAnimationFrame(() => {
    runtime.pendingRender = null;
    render(ctx);
  });
}

export function startAnim(ctx: EngineContext): void {
  const { runtime } = ctx;
  if (runtime.animRaf) return;
  runtime.lastFrameTime = performance.now();
  const tick = (now: number) => {
    const dt = (now - runtime.lastFrameTime) / 1000;
    runtime.lastFrameTime = now;
    runtime.animFrame += dt;
    if (runtime.hasLiveSource) invalidateGrid(ctx);
    render(ctx);
    runtime.animRaf = requestAnimationFrame(tick);
  };
  runtime.animRaf = requestAnimationFrame(tick);
}

export function stopAnim(ctx: EngineContext): void {
  const { runtime } = ctx;
  if (runtime.animRaf) cancelAnimationFrame(runtime.animRaf);
  runtime.animRaf = null;
  scheduleRender(ctx);
}

export function refreshAnimLoop(ctx: EngineContext): void {
  ctx.runtime.hasLiveSource = hasLiveSource(ctx.state);
  if (anyAnimating(ctx.state) || ctx.runtime.hasLiveSource) startAnim(ctx);
  else stopAnim(ctx);
}
