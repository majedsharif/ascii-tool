import { RESET_KEYS } from './constants';
import { createState, activeSettings } from './state';
import { defaultImageSettings } from './defaults';
import { invalidateGrid } from './gridCache';
import { scheduleRender, refreshAnimLoop } from './animation';
import { bindRange, bindToggle, bindColor, bindSeg, bindSelect } from './bindings';
import {
  loadImageFiles, loadImageFromBlob, loadImageFromUrl, startWebcam, removeImage,
} from './frameLoader';
import {
  syncControlsToActive,
  syncGlobalControls,
  renderImageSelect,
  updateFocusInteraction,
  updateImageCount,
  updateExampleStates,
} from './uiSync';
import { imageIndexAtPoint, setFocus } from './focus';
import { addExample } from './defaultImages';
import { exportPng, exportGif, copyAsText } from './exports';
import { exportSvg } from './svgExport';
import { exportHtml } from './htmlExport';
import { exportVideo } from './videoExport';
import { copyShareLink, applyShareHash } from './share';
import { listPresets, savePreset, applyPreset, deletePreset } from './storage';
import { CHAR_RAMPS, STYLE_PRESETS, ensureFontLoaded, randomizeStyle, scaleStyleIntensity } from './presets';
import { pushHistory, pushHistoryDebounced, undo, redo, clearHistory } from './history';
import { setupZoom, resetZoom } from './zoom';
import type { EngineContext, Runtime } from './types';

function renderUserPresets(ctx: EngineContext): void {
  const root = document.getElementById('userPresets');
  if (!root) return;
  const presets = listPresets();
  root.innerHTML = '';
  if (presets.length === 0) {
    root.innerHTML = '<p class="hint">NO SAVED PRESETS YET</p>';
    return;
  }
  presets.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'user-preset-row';
    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'user-preset-btn';
    load.textContent = p.name;
    load.addEventListener('click', () => {
      applyPreset(ctx.state, p);
      ensureFontLoaded(ctx.state.fontFamily);
      syncControlsToActive(ctx);
      syncGlobalControls(ctx);
      refreshAnimLoop(ctx);
      invalidateGrid(ctx);
      scheduleRender(ctx);
      pushHistory(ctx.state);
    });
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'user-preset-del';
    del.textContent = '×';
    del.addEventListener('click', () => {
      if (!confirm(`Delete preset "${p.name}"?`)) return;
      deletePreset(p.name);
      renderUserPresets(ctx);
    });
    row.appendChild(load);
    row.appendChild(del);
    root.appendChild(row);
  });
}

export function setupEngine(): () => void {
  const outputCanvas = document.getElementById('output') as HTMLCanvasElement;
  const canvas = document.getElementById('canvas') as HTMLElement;

  const procCanvas = document.createElement('canvas');
  const procCtx = procCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d') as CanvasRenderingContext2D;

  const runtime: Runtime = {
    animFrame: 0,
    lastFrameTime: 0,
    animRaf: null,
    pendingRender: null,
    gridCaches: [],
    hasLiveSource: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    suppressNextClick: false,
  };

  const ctx: EngineContext = {
    state: createState(),
    runtime,
    outputCanvas,
    canvas,
    procCanvas,
    procCtx,
    measureCanvas,
    measureCtx,
  };

  applyShareHash(ctx.state);
  ensureFontLoaded(ctx.state.fontFamily);

  const deps = {
    onSelectImage: (_i: number) => { pushHistory(ctx.state); },
    onRemoveImage: (i: number) => { removeImage(ctx, i, deps); pushHistory(ctx.state); },
  };

  const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
  textInput.addEventListener('input', (e) => {
    const v = (e.target as HTMLTextAreaElement).value || ' ';
    activeSettings(ctx.state).text = v;
    activeSettings(ctx.state).charPreset = 'custom';
    const sel = document.getElementById('charPreset') as HTMLSelectElement | null;
    if (sel) sel.value = 'custom';
    scheduleRender(ctx);
    pushHistoryDebounced(ctx.state);
  });

  bindSelect(ctx, 'charPreset', 'charPreset', (val) => {
    const ramp = CHAR_RAMPS.find((r) => r.id === val);
    const ti = document.getElementById('textInput') as HTMLTextAreaElement | null;
    if (ramp) {
      activeSettings(ctx.state).text = ramp.chars;
      if (ti) ti.value = ramp.chars;
    } else if (val === 'custom') {
      activeSettings(ctx.state).text = 'YOUR TEXT HERE';
      if (ti) ti.value = 'YOUR TEXT HERE';
    }
    pushHistory(ctx.state);
  });

  bindSelect(ctx, 'fontFamily', 'fontFamily', (val) => {
    ensureFontLoaded(val);
    setTimeout(() => { invalidateGrid(ctx); scheduleRender(ctx); }, 100);
    pushHistory(ctx.state);
  });

  bindSelect(ctx, 'paletteMode', 'paletteMode', () => pushHistory(ctx.state));

  bindSeg(ctx, 'fillMode', 'fillMode', undefined, () => pushHistory(ctx.state));
  bindRange(ctx, 'addSpaces', 'addSpaces', 'addSpacesVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'cols', 'cols', 'colsVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'fontSize', 'fontSize', 'fontSizeVal', (v) => v + 'PX', () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'lineHeight', 'lineHeight', 'lineHeightVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'charSpace', 'charSpace', 'charSpaceVal', (v) => v + 'PX', () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'aspect', 'aspect', 'aspectVal', (v) => parseFloat(v).toFixed(2), () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'brightness', 'brightness', 'brightnessVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'contrast', 'contrast', 'contrastVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'saturation', 'saturation', 'saturationVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'gamma', 'gamma', 'gammaVal', (v) => parseFloat(v).toFixed(2), () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'invert', 'invert', 'invertVal', (v) => v + '%', () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'blur', 'blur', 'blurVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'sharpen', 'sharpen', 'sharpenVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'edge', 'edge', 'edgeVal', (v) => v + '%', () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'posterize', 'posterize', 'posterizeVal', (v) => (+v < 2 ? 'OFF' : v), () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'dither', 'dither', 'ditherVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'threshold', 'threshold', 'thresholdVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'hueShift', 'hueShift', 'hueShiftVal', (v) => v + '°', () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'tintStrength', 'tintStrength', 'tintStrengthVal', (v) => v + '%', () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'bgGradientAngle', 'bgGradientAngle', 'bgGradientAngleVal', (v) => v + '°', () => pushHistoryDebounced(ctx.state));
  bindToggle(ctx, 'photoColors', 'photoColors', () => pushHistory(ctx.state));
  bindToggle(ctx, 'transparentBG', 'transparentBG', () => pushHistory(ctx.state));
  bindToggle(ctx, 'duotoneEnable', 'duotoneEnable', () => pushHistory(ctx.state));
  bindToggle(ctx, 'flipH', 'flipH', () => pushHistory(ctx.state));
  bindToggle(ctx, 'flipV', 'flipV', () => pushHistory(ctx.state));
  bindColor(ctx, 'textColor', 'textColor', () => pushHistoryDebounced(ctx.state));
  bindColor(ctx, 'bgColor', 'bgColor', () => pushHistoryDebounced(ctx.state));
  bindColor(ctx, 'tintColor', 'tintColor', () => pushHistoryDebounced(ctx.state));
  bindColor(ctx, 'duotoneLight', 'duotoneLight', () => pushHistoryDebounced(ctx.state));
  bindColor(ctx, 'duotoneDark', 'duotoneDark', () => pushHistoryDebounced(ctx.state));
  bindColor(ctx, 'bgGradient1', 'bgGradient1', () => pushHistoryDebounced(ctx.state));
  bindColor(ctx, 'bgGradient2', 'bgGradient2', () => pushHistoryDebounced(ctx.state));
  bindToggle(ctx, 'animEnable', 'animEnable', () => { refreshAnimLoop(ctx); pushHistory(ctx.state); });
  bindRange(ctx, 'animSpeed', 'animSpeed', 'animSpeedVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindRange(ctx, 'animIntensity', 'animIntensity', 'animIntensityVal', undefined, () => pushHistoryDebounced(ctx.state));
  bindSeg(ctx, 'animMode', 'animMode', undefined, () => { ctx.runtime.animFrame = 0; pushHistory(ctx.state); });
  bindSeg(ctx, 'exportScale', 'exportScale', parseFloat, () => pushHistory(ctx.state));
  bindSeg(ctx, 'bgMode', 'bgMode', undefined, () => pushHistory(ctx.state));
  bindSeg(ctx, 'rotation', 'rotation', (v) => parseInt(v, 10), () => pushHistory(ctx.state));

  const imageInput = document.getElementById('imageInput') as HTMLInputElement;
  imageInput.addEventListener('change', (e) => {
    loadImageFiles(ctx, (e.target as HTMLInputElement).files, deps);
    (e.target as HTMLInputElement).value = '';
  });

  const exampleGrid = document.getElementById('exampleGrid');
  const onExampleClick = (e: Event) => {
    const target = (e.target as HTMLElement).closest('[data-example]') as HTMLElement | null;
    if (!target || target.classList.contains('is-disabled')) return;
    const name = target.dataset.example;
    if (name) addExample(ctx, name, deps).then(() => pushHistory(ctx.state));
  };
  exampleGrid?.addEventListener('click', onExampleClick);

  const dropzone = document.getElementById('imageDropzone');
  const onDzOver = (e: DragEvent) => {
    e.preventDefault();
    dropzone?.classList.add('is-dragover');
  };
  const onDzLeave = () => dropzone?.classList.remove('is-dragover');
  const onDzDrop = (e: DragEvent) => {
    e.preventDefault();
    dropzone?.classList.remove('is-dragover');
    loadImageFiles(ctx, e.dataTransfer?.files || null, deps);
  };
  dropzone?.addEventListener('dragover', onDzOver);
  dropzone?.addEventListener('dragleave', onDzLeave);
  dropzone?.addEventListener('drop', onDzDrop);

  document.getElementById('clearImage')!.addEventListener('click', () => {
    for (const e of ctx.state.images) {
      if (e.stream) e.stream.getTracks().forEach((t) => t.stop());
    }
    ctx.state.images = [];
    ctx.state.selectedImage = 0;
    ctx.state.focusedImage = null;
    canvas.classList.remove('has-image');
    imageInput.value = '';
    resetZoom(ctx);
    renderImageSelect(ctx, deps);
    syncControlsToActive(ctx);
    refreshAnimLoop(ctx);
    updateFocusInteraction(ctx);
    updateImageCount(ctx);
    updateExampleStates(ctx);
    invalidateGrid(ctx);
    scheduleRender(ctx);
    pushHistory(ctx.state);
  });

  document.getElementById('loadUrl')?.addEventListener('click', () => {
    const inp = document.getElementById('urlInput') as HTMLInputElement;
    const url = inp.value.trim();
    if (!url) return;
    loadImageFromUrl(ctx, url, deps).then(() => { inp.value = ''; pushHistory(ctx.state); });
  });
  document.getElementById('urlInput')?.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      e.preventDefault();
      (document.getElementById('loadUrl') as HTMLButtonElement).click();
    }
  });

  document.getElementById('webcamBtn')?.addEventListener('click', () => {
    startWebcam(ctx, deps).then(() => pushHistory(ctx.state));
  });

  outputCanvas.addEventListener('click', (e) => {
    if (ctx.state.images.length === 0) return;
    e.stopPropagation();
    if (ctx.runtime.suppressNextClick) {
      ctx.runtime.suppressNextClick = false;
      return;
    }
    if (ctx.state.focusedImage != null) {
      setFocus(ctx, null, deps);
      return;
    }
    if (ctx.state.images.length < 2) return;
    const idx = imageIndexAtPoint(ctx, e.clientX, e.clientY);
    if (idx != null) setFocus(ctx, idx, deps);
  });

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    canvas.classList.add('dragover');
  };
  const onDragLeave = () => canvas.classList.remove('dragover');
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    canvas.classList.remove('dragover');
    loadImageFiles(ctx, e.dataTransfer?.files || null, deps);
  };
  canvas.addEventListener('dragover', onDragOver);
  canvas.addEventListener('dragleave', onDragLeave);
  canvas.addEventListener('drop', onDrop);

  // Clipboard paste
  const onPaste = (e: ClipboardEvent) => {
    if (!e.clipboardData) return;
    const tgt = e.target as HTMLElement | null;
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;
    const items = Array.from(e.clipboardData.items);
    let handled = false;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          loadImageFromBlob(ctx, blob, `pasted-${Date.now()}.png`, deps).then(() => pushHistory(ctx.state));
          handled = true;
          break;
        }
      }
    }
    if (!handled) {
      const txt = e.clipboardData.getData('text/plain');
      if (txt && /^https?:\/\//.test(txt) && /\.(png|jpe?g|gif|webp|svg|bmp)/i.test(txt)) {
        e.preventDefault();
        loadImageFromUrl(ctx, txt.trim(), deps).then(() => pushHistory(ctx.state));
      }
    }
  };
  document.addEventListener('paste', onPaste);

  const onResize = () => scheduleRender(ctx);
  window.addEventListener('resize', onResize);
  if (document.fonts) {
    document.fonts.ready.then(() => {
      invalidateGrid(ctx);
      scheduleRender(ctx);
    });
  }

  const copyBtn = document.getElementById('copyText') as HTMLButtonElement;
  copyBtn.addEventListener('click', () => { copyAsText(ctx, copyBtn); });

  let lastRawStyleSettings: any = null;

  document.getElementById('resetAll')?.addEventListener('click', () => {
    const s = activeSettings(ctx.state);
    const defaults = defaultImageSettings();
    RESET_KEYS.forEach((k) => { (s as any)[k] = (defaults as any)[k]; });
    syncControlsToActive(ctx);
    invalidateGrid(ctx);
    refreshAnimLoop(ctx);
    scheduleRender(ctx);
    pushHistory(ctx.state);
  });

  document.getElementById('resetStyle')?.addEventListener('click', () => {
    const s = activeSettings(ctx.state);
    const defaults = defaultImageSettings();
    Object.keys(defaults).forEach((k) => { (s as any)[k] = (defaults as any)[k]; });
    ctx.state.bgColor = '#ffffff';
    ctx.state.fontFamily = 'courier';
    ensureFontLoaded(ctx.state.fontFamily);
    lastRawStyleSettings = null;
    syncControlsToActive(ctx);
    syncGlobalControls(ctx);
    invalidateGrid(ctx);
    refreshAnimLoop(ctx);
    scheduleRender(ctx);
    pushHistory(ctx.state);
  });

  document.getElementById('exportPng')!.addEventListener('click', () => exportPng(ctx));
  document.getElementById('exportSvg')?.addEventListener('click', () => exportSvg(ctx));
  document.getElementById('exportHtml')?.addEventListener('click', () => exportHtml(ctx));

  const gifBtn = document.getElementById('exportGif') as HTMLButtonElement;
  gifBtn.addEventListener('click', () => { exportGif(ctx, gifBtn); });
  const vidBtn = document.getElementById('exportVideo') as HTMLButtonElement | null;
  vidBtn?.addEventListener('click', () => { exportVideo(ctx, vidBtn); });

  const copyLinkBtn = document.getElementById('copyLink') as HTMLButtonElement;
  copyLinkBtn?.addEventListener('click', () => { copyShareLink(ctx.state, copyLinkBtn); });

  // BG image picker
  const bgImageInput = document.getElementById('bgImageInput') as HTMLInputElement | null;
  document.getElementById('bgImagePick')?.addEventListener('click', () => bgImageInput?.click());
  bgImageInput?.addEventListener('change', () => {
    const f = bgImageInput.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      ctx.state.bgImage = reader.result as string;
      ctx.state.bgMode = 'image';
      syncGlobalControls(ctx);
      scheduleRender(ctx);
      pushHistory(ctx.state);
    };
    reader.readAsDataURL(f);
    bgImageInput.value = '';
  });
  document.getElementById('bgImageClear')?.addEventListener('click', () => {
    ctx.state.bgImage = null;
    if (ctx.state.bgMode === 'image') ctx.state.bgMode = 'color';
    syncGlobalControls(ctx);
    scheduleRender(ctx);
    pushHistory(ctx.state);
  });

  const readPresetIntensity = (): number => {
    const el = document.getElementById('presetIntensity') as HTMLInputElement | null;
    return el ? parseInt(el.value, 10) : 100;
  };

  const applyStyleAction = (action: 'random' | string): void => {
    const s = activeSettings(ctx.state);
    if (action === 'random') {
      const entry = ctx.state.images[ctx.state.selectedImage];
      randomizeStyle(s, ctx.state, entry?.stats);
    } else {
      const p = STYLE_PRESETS.find((x) => x.id === action);
      if (!p) return;
      p.apply(s, ctx.state);
    }
    lastRawStyleSettings = { ...s };
    scaleStyleIntensity(s, readPresetIntensity());
    ensureFontLoaded(ctx.state.fontFamily);
    syncControlsToActive(ctx);
    syncGlobalControls(ctx);
    refreshAnimLoop(ctx);
    invalidateGrid(ctx);
    scheduleRender(ctx);
    pushHistory(ctx.state);
  };

  document.getElementById('stylePresetGrid')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-style-preset]') as HTMLElement | null;
    if (!btn) return;
    const id = btn.dataset.stylePreset;
    if (!id) return;
    applyStyleAction(id === 'random' ? 'random' : id);
  });

  const intensityInput = document.getElementById('presetIntensity') as HTMLInputElement | null;
  const intensityVal = document.getElementById('presetIntensityVal');
  intensityInput?.addEventListener('input', () => {
    if (intensityVal) intensityVal.textContent = intensityInput.value;
    if (!lastRawStyleSettings) return;
    const s = activeSettings(ctx.state);
    Object.assign(s, lastRawStyleSettings);
    scaleStyleIntensity(s, parseInt(intensityInput.value, 10));
    syncControlsToActive(ctx);
    refreshAnimLoop(ctx);
    invalidateGrid(ctx);
    scheduleRender(ctx);
    pushHistoryDebounced(ctx.state);
  });

  // Save preset
  document.getElementById('savePreset')?.addEventListener('click', () => {
    const inp = document.getElementById('presetName') as HTMLInputElement;
    const name = inp.value.trim();
    if (!name) { alert('Enter a name first'); return; }
    savePreset(ctx.state, name);
    inp.value = '';
    renderUserPresets(ctx);
  });

  // Canvas toolbar buttons
  document.getElementById('compareBtn')?.addEventListener('mousedown', () => {
    ctx.state.compareMode = true; scheduleRender(ctx);
  });
  const releaseCompare = () => {
    if (ctx.state.compareMode) { ctx.state.compareMode = false; scheduleRender(ctx); }
  };
  document.getElementById('compareBtn')?.addEventListener('mouseup', releaseCompare);
  document.getElementById('compareBtn')?.addEventListener('mouseleave', releaseCompare);
  document.getElementById('compareBtn')?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    ctx.state.compareMode = true; scheduleRender(ctx);
  });
  document.getElementById('compareBtn')?.addEventListener('touchend', releaseCompare);

  document.getElementById('undoBtn')?.addEventListener('click', () => {
    if (undo(ctx.state)) {
      ensureFontLoaded(ctx.state.fontFamily);
      syncControlsToActive(ctx);
      syncGlobalControls(ctx);
      invalidateGrid(ctx);
      refreshAnimLoop(ctx);
      scheduleRender(ctx);
    }
  });
  document.getElementById('redoBtn')?.addEventListener('click', () => {
    if (redo(ctx.state)) {
      ensureFontLoaded(ctx.state.fontFamily);
      syncControlsToActive(ctx);
      syncGlobalControls(ctx);
      invalidateGrid(ctx);
      refreshAnimLoop(ctx);
      scheduleRender(ctx);
    }
  });

  document.getElementById('sidebarOpen')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('is-open');
  });
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('is-open');
  });

  // Keyboard shortcuts
  const onKey = (e: KeyboardEvent) => {
    const tgt = e.target as HTMLElement;
    const inField = tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (undo(ctx.state)) {
        ensureFontLoaded(ctx.state.fontFamily);
        syncControlsToActive(ctx); syncGlobalControls(ctx);
        invalidateGrid(ctx); refreshAnimLoop(ctx); scheduleRender(ctx);
      }
      return;
    }
    if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'z' && e.shiftKey || e.key.toLowerCase() === 'y')) {
      e.preventDefault();
      if (redo(ctx.state)) {
        ensureFontLoaded(ctx.state.fontFamily);
        syncControlsToActive(ctx); syncGlobalControls(ctx);
        invalidateGrid(ctx); refreshAnimLoop(ctx); scheduleRender(ctx);
      }
      return;
    }
    if (inField) return;
    if (e.key === ' ') {
      e.preventDefault();
      applyStyleAction('random');
      return;
    }
    if (e.key === 'c' || e.key === 'C') {
      ctx.state.compareMode = true; scheduleRender(ctx); return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const exNames = Array.from(document.querySelectorAll<HTMLElement>('[data-example]'))
        .map((el) => el.dataset.example!).filter(Boolean);
      if (exNames.length === 0) return;
      const cur = ctx.state.images[ctx.state.selectedImage]?.filename?.replace('.jpg', '') || '';
      let idx = exNames.indexOf(cur);
      idx = (idx + (e.key === 'ArrowRight' ? 1 : -1) + exNames.length) % exNames.length;
      addExample(ctx, exNames[idx], deps).then(() => pushHistory(ctx.state));
      return;
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'c' || e.key === 'C') {
      if (ctx.state.compareMode) { ctx.state.compareMode = false; scheduleRender(ctx); }
    }
  };
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKeyUp);

  // Hash share link → live update on hashchange
  const onHashChange = () => {
    if (applyShareHash(ctx.state)) {
      ensureFontLoaded(ctx.state.fontFamily);
      syncControlsToActive(ctx); syncGlobalControls(ctx);
      invalidateGrid(ctx); refreshAnimLoop(ctx); scheduleRender(ctx);
    }
  };
  window.addEventListener('hashchange', onHashChange);

  const cleanupZoom = setupZoom(ctx);

  syncControlsToActive(ctx);
  syncGlobalControls(ctx);
  updateImageCount(ctx);
  updateExampleStates(ctx);
  renderUserPresets(ctx);
  clearHistory();
  pushHistory(ctx.state);
  scheduleRender(ctx);

  return () => {
    cleanupZoom();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('hashchange', onHashChange);
    document.removeEventListener('paste', onPaste);
    canvas.removeEventListener('dragover', onDragOver);
    canvas.removeEventListener('dragleave', onDragLeave);
    canvas.removeEventListener('drop', onDrop);
    exampleGrid?.removeEventListener('click', onExampleClick);
    dropzone?.removeEventListener('dragover', onDzOver);
    dropzone?.removeEventListener('dragleave', onDzLeave);
    dropzone?.removeEventListener('drop', onDzDrop);
    if (runtime.animRaf) cancelAnimationFrame(runtime.animRaf);
    if (runtime.pendingRender) cancelAnimationFrame(runtime.pendingRender);
    for (const e of ctx.state.images) {
      if (e.stream) e.stream.getTracks().forEach((t) => t.stop());
    }
  };
}
