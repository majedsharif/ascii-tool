import { activeSettings } from './state';
import type { AppState, ImageSettings } from './types';

const KEY = 'ascii-tool-presets-v1';

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

export interface UserPreset {
  name: string;
  app: any;
  settings: any;
  createdAt: number;
}

export function listPresets(): UserPreset[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (!raw) return [];
    return JSON.parse(raw) as UserPreset[];
  } catch {
    return [];
  }
}

export function savePreset(state: AppState, name: string): UserPreset {
  const all = listPresets().filter((p) => p.name !== name);
  const active = activeSettings(state);
  const preset: UserPreset = {
    name,
    app: APP_KEYS.reduce((acc, k) => { (acc as any)[k] = (state as any)[k]; return acc; }, {} as any),
    settings: SETTINGS_KEYS.reduce((acc, k) => { (acc as any)[k] = (active as any)[k]; return acc; }, {} as any),
    createdAt: Date.now(),
  };
  all.push(preset);
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch {}
  return preset;
}

export function deletePreset(name: string): void {
  const all = listPresets().filter((p) => p.name !== name);
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch {}
}

export function applyPreset(state: AppState, preset: UserPreset): void {
  if (preset.app) {
    for (const k of APP_KEYS) {
      if (preset.app[k] !== undefined) (state as any)[k] = preset.app[k];
    }
  }
  if (preset.settings) {
    const target = activeSettings(state);
    for (const k of SETTINGS_KEYS) {
      if (preset.settings[k] !== undefined) (target as any)[k] = preset.settings[k];
    }
  }
}
