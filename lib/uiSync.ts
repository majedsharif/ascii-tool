import { MAX_IMAGES } from './constants';
import { activeSettings } from './state';
import type { EngineContext } from './types';

type SyncDeps = {
  onSelectImage: (i: number) => void;
  onRemoveImage: (i: number) => void;
};

export function syncControlsToActive(ctx: EngineContext): void {
  const s = activeSettings(ctx.state);
  const setRange = (id: string, val: number | string, valId?: string, format?: (v: string) => string) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;
    el.value = String(val);
    if (valId) {
      const v = document.getElementById(valId);
      if (v) v.textContent = format ? format(el.value) : el.value;
    }
  };
  setRange('addSpaces', s.addSpaces, 'addSpacesVal');
  setRange('cols', s.cols, 'colsVal');
  setRange('brightness', s.brightness, 'brightnessVal');
  setRange('contrast', s.contrast, 'contrastVal');
  setRange('saturation', s.saturation, 'saturationVal');
  setRange('gamma', s.gamma, 'gammaVal', (v) => parseFloat(v).toFixed(2));
  setRange('invert', s.invert, 'invertVal', (v) => v + '%');
  setRange('blur', s.blur, 'blurVal');
  setRange('sharpen', s.sharpen, 'sharpenVal');
  setRange('edge', s.edge, 'edgeVal', (v) => v + '%');
  setRange('posterize', s.posterize, 'posterizeVal', (v) => (+v < 2 ? 'OFF' : v));
  setRange('dither', s.dither, 'ditherVal');
  setRange('threshold', s.threshold, 'thresholdVal');
  setRange('hueShift', s.hueShift, 'hueShiftVal', (v) => v + '°');
  setRange('tintStrength', s.tintStrength, 'tintStrengthVal', (v) => v + '%');
  setRange('animSpeed', s.animSpeed, 'animSpeedVal');
  setRange('animIntensity', s.animIntensity, 'animIntensityVal');
  const setVal = (id: string, val: string | number | boolean, prop: 'value' | 'checked' = 'value') => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    if (!el) return;
    if (prop === 'checked') (el as HTMLInputElement).checked = !!val;
    else el.value = String(val);
  };
  setVal('textInput', s.text);
  setVal('photoColors', s.photoColors, 'checked');
  setVal('animEnable', s.animEnable, 'checked');
  setVal('textColor', s.textColor);
  setVal('tintColor', s.tintColor);
  setVal('duotoneEnable', s.duotoneEnable, 'checked');
  setVal('duotoneLight', s.duotoneLight);
  setVal('duotoneDark', s.duotoneDark);
  setVal('flipH', s.flipH, 'checked');
  setVal('flipV', s.flipV, 'checked');
  setVal('charPreset', s.charPreset);
  setVal('paletteMode', s.paletteMode);
  const setSeg = (name: string, val: string | number) => {
    const seg = document.querySelector(`.seg[data-control="${name}"]`);
    if (!seg) return;
    seg.querySelectorAll('.seg-btn').forEach((b) => {
      b.classList.toggle('active', (b as HTMLElement).dataset.value === String(val));
    });
  };
  setSeg('fillMode', s.fillMode);
  setSeg('animMode', s.animMode);
  setSeg('rotation', s.rotation);
}

export function syncGlobalControls(ctx: EngineContext): void {
  const s = ctx.state;
  const set = (id: string, val: any, prop: 'value' | 'checked' = 'value') => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    if (!el) return;
    if (prop === 'checked') (el as HTMLInputElement).checked = !!val;
    else el.value = String(val);
  };
  set('fontFamily', s.fontFamily);
  set('fontSize', s.fontSize);
  const fontSizeVal = document.getElementById('fontSizeVal');
  if (fontSizeVal) fontSizeVal.textContent = s.fontSize + 'PX';
  set('lineHeight', s.lineHeight);
  const lineHeightVal = document.getElementById('lineHeightVal');
  if (lineHeightVal) lineHeightVal.textContent = s.lineHeight.toFixed(2);
  set('charSpace', s.charSpace);
  const charSpaceVal = document.getElementById('charSpaceVal');
  if (charSpaceVal) charSpaceVal.textContent = s.charSpace + 'PX';
  set('aspect', s.aspect);
  const aspectVal = document.getElementById('aspectVal');
  if (aspectVal) aspectVal.textContent = s.aspect.toFixed(2);
  set('bgColor', s.bgColor);
  set('bgGradient1', s.bgGradient1);
  set('bgGradient2', s.bgGradient2);
  set('bgGradientAngle', s.bgGradientAngle);
  const angleVal = document.getElementById('bgGradientAngleVal');
  if (angleVal) angleVal.textContent = s.bgGradientAngle + '°';
  set('transparentBG', s.transparentBG, 'checked');
  const setSeg = (name: string, val: string | number) => {
    const seg = document.querySelector(`.seg[data-control="${name}"]`);
    if (!seg) return;
    seg.querySelectorAll('.seg-btn').forEach((b) => {
      b.classList.toggle('active', (b as HTMLElement).dataset.value === String(val));
    });
  };
  setSeg('bgMode', s.bgMode);
  setSeg('exportScale', s.exportScale);
}

export function renderImageSelect(ctx: EngineContext, deps: SyncDeps): void {
  const el = document.getElementById('imageThumbs') as HTMLElement | null;
  const hint = document.getElementById('imageSelectHint') as HTMLElement | null;
  if (!el) return;
  el.innerHTML = '';

  if (ctx.state.images.length === 0) {
    el.classList.add('hidden');
    hint?.classList.add('hidden');
    return;
  }

  el.classList.remove('hidden');
  hint?.classList.toggle('hidden', ctx.state.images.length < 2);

  ctx.state.images.forEach((entry, i) => {
    const item = document.createElement('div');
    item.className = 'image-thumb' + (i === ctx.state.selectedImage ? ' is-selected' : '');

    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'image-thumb-pick';
    pick.title = entry.filename;
    pick.setAttribute('aria-label', `Select ${entry.filename}`);
    if (entry.img) {
      pick.style.backgroundImage = `url(${entry.img.src})`;
    } else if (entry.sourceKind === 'webcam') {
      pick.textContent = 'CAM';
      pick.style.fontSize = '10px';
      pick.style.letterSpacing = '0.12em';
      pick.style.display = 'flex';
      pick.style.alignItems = 'center';
      pick.style.justifyContent = 'center';
    } else if (entry.sourceKind === 'video') {
      pick.textContent = 'VID';
      pick.style.fontSize = '10px';
      pick.style.letterSpacing = '0.12em';
      pick.style.display = 'flex';
      pick.style.alignItems = 'center';
      pick.style.justifyContent = 'center';
    }
    pick.addEventListener('click', () => {
      ctx.state.selectedImage = i;
      renderImageSelect(ctx, deps);
      syncControlsToActive(ctx);
      deps.onSelectImage(i);
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'image-thumb-remove';
    remove.setAttribute('aria-label', `Remove ${entry.filename}`);
    remove.textContent = '×';
    remove.addEventListener('click', (e) => {
      e.stopPropagation();
      deps.onRemoveImage(i);
    });

    item.appendChild(pick);
    item.appendChild(remove);
    el.appendChild(item);
  });
}

export function updateImageCount(ctx: EngineContext): void {
  const el = document.getElementById('imageCount');
  if (el) el.textContent = `${ctx.state.images.length} / ${MAX_IMAGES}`;
}

export function updateExampleStates(ctx: EngineContext): void {
  const loaded = new Set(ctx.state.images.map((e) => e.filename));
  document.querySelectorAll<HTMLElement>('[data-example]').forEach((el) => {
    const name = el.dataset.example;
    if (!name) return;
    const isLoaded = loaded.has(`${name}.jpg`);
    el.classList.toggle('is-loaded', isLoaded);
  });
}

export function updateFocusInteraction(ctx: EngineContext): void {
  const canFocus = ctx.state.images.length >= 2 && ctx.state.focusedImage == null;
  ctx.canvas.classList.toggle('can-focus', canFocus);
  ctx.canvas.classList.toggle('is-focused', ctx.state.focusedImage != null);
}
