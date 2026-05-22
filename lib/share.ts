import { activeSettings } from './state';
import type { AppState, ImageSettings } from './types';

const SETTINGS_KEYS: (keyof ImageSettings)[] = [
  'text', 'charPreset', 'fillMode', 'addSpaces', 'cols',
  'brightness', 'contrast', 'saturation', 'gamma', 'invert',
  'blur', 'sharpen', 'edge', 'posterize', 'dither', 'threshold',
  'hueShift', 'tintColor', 'tintStrength', 'paletteMode',
  'duotoneEnable', 'duotoneLight', 'duotoneDark',
  'rotation', 'flipH', 'flipV',
  'photoColors', 'textColor',
  'animEnable', 'animSpeed', 'animIntensity', 'animMode',
];

const APP_KEYS: (keyof AppState)[] = [
  'fontSize', 'fontFamily', 'lineHeight', 'charSpace', 'aspect',
  'transparentBG', 'bgColor', 'bgMode',
  'bgGradient1', 'bgGradient2', 'bgGradientAngle',
];

export function buildShareUrl(state: AppState): string {
  const active = activeSettings(state);
  const payload: any = {};
  for (const k of APP_KEYS) payload[k] = (state as any)[k];
  payload.s = {};
  for (const k of SETTINGS_KEYS) payload.s[k] = (active as any)[k];
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  return `${base}#cfg=${b64}`;
}

export function applyShareHash(state: AppState): boolean {
  if (typeof window === 'undefined') return false;
  const m = window.location.hash.match(/cfg=([^&]+)/);
  if (!m) return false;
  try {
    const json = decodeURIComponent(escape(atob(m[1])));
    const payload = JSON.parse(json);
    for (const k of APP_KEYS) {
      if (payload[k] !== undefined) (state as any)[k] = payload[k];
    }
    if (payload.s) {
      const target = activeSettings(state);
      for (const k of SETTINGS_KEYS) {
        if (payload.s[k] !== undefined) (target as any)[k] = payload.s[k];
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function copyShareLink(state: AppState, btn?: HTMLButtonElement): Promise<void> {
  const url = buildShareUrl(state);
  try {
    await navigator.clipboard.writeText(url);
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'LINK COPIED';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    }
  } catch {
    alert('Could not copy: ' + url);
  }
}
