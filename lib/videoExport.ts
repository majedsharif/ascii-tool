import { anyAnimating } from './state';
import { computeLayout } from './layout';
import { renderToCanvas } from './rendering';
import type { EngineContext } from './types';

function pickMimeType(): string | null {
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=h264',
    'video/mp4',
  ];
  for (const m of candidates) {
    if ((window as any).MediaRecorder?.isTypeSupported?.(m)) return m;
  }
  return null;
}

export async function exportVideo(
  ctx: EngineContext,
  btn: HTMLButtonElement,
  durationSec = 4,
  fps = 24,
): Promise<void> {
  if (!('MediaRecorder' in window)) {
    alert('MediaRecorder is not supported in this browser');
    return;
  }
  if (!anyAnimating(ctx.state)) {
    alert('Enable ANIMATE on at least one image first.');
    return;
  }
  const mime = pickMimeType();
  if (!mime) {
    alert('No supported video codec found in this browser.');
    return;
  }

  const original = btn.textContent;
  btn.disabled = true;
  btn.classList.add('recording');

  const scale = ctx.state.exportScale;
  const layout = computeLayout(ctx);
  const w = Math.max(2, Math.round(layout.totalCols * layout.charW * scale));
  const h = Math.max(2, Math.round(layout.totalRows * layout.charH * scale));
  const temp = document.createElement('canvas');
  temp.width = w;
  temp.height = h;

  const stream = (temp as any).captureStream(fps) as MediaStream;
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
  recorder.start();

  const start = performance.now();
  const totalFrames = durationSec * fps;
  let frame = 0;
  await new Promise<void>((resolve) => {
    function step() {
      if (frame >= totalFrames) { resolve(); return; }
      const t = frame / fps;
      renderToCanvas(ctx, temp, scale, t, { forceOpaque: true });
      btn.textContent = `CAPTURE ${frame + 1}/${totalFrames}`;
      frame++;
      setTimeout(step, Math.max(1, 1000 / fps - (performance.now() - start - (frame * 1000) / fps)));
    }
    step();
  });
  recorder.stop();
  await stopped;
  const blob = new Blob(chunks, { type: mime });
  const a = document.createElement('a');
  const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
  a.href = URL.createObjectURL(blob);
  a.download = `ascii-${Date.now()}.${ext}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);

  btn.textContent = original;
  btn.disabled = false;
  btn.classList.remove('recording');
}
