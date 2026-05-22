import type { AppState } from './types';

export interface HistoryEntry {
  snapshot: any;
}

const past: HistoryEntry[] = [];
const future: HistoryEntry[] = [];
const MAX = 80;
let suspended = false;

function takeSnapshot(state: AppState): any {
  return {
    fontSize: state.fontSize,
    fontFamily: state.fontFamily,
    lineHeight: state.lineHeight,
    charSpace: state.charSpace,
    aspect: state.aspect,
    transparentBG: state.transparentBG,
    bgColor: state.bgColor,
    bgMode: state.bgMode,
    bgGradient1: state.bgGradient1,
    bgGradient2: state.bgGradient2,
    bgGradientAngle: state.bgGradientAngle,
    bgImage: state.bgImage,
    exportScale: state.exportScale,
    draft: { ...state.draft },
    selectedImage: state.selectedImage,
    focusedImage: state.focusedImage,
    imageSettings: state.images.map((e) => ({ ...e.settings })),
  };
}

function restoreSnapshot(state: AppState, snap: any): void {
  state.fontSize = snap.fontSize;
  state.fontFamily = snap.fontFamily;
  state.lineHeight = snap.lineHeight;
  state.charSpace = snap.charSpace;
  state.aspect = snap.aspect;
  state.transparentBG = snap.transparentBG;
  state.bgColor = snap.bgColor;
  state.bgMode = snap.bgMode;
  state.bgGradient1 = snap.bgGradient1;
  state.bgGradient2 = snap.bgGradient2;
  state.bgGradientAngle = snap.bgGradientAngle;
  state.bgImage = snap.bgImage;
  state.exportScale = snap.exportScale;
  state.draft = { ...snap.draft };
  state.selectedImage = Math.min(snap.selectedImage, Math.max(0, state.images.length - 1));
  state.focusedImage = snap.focusedImage != null && state.images[snap.focusedImage] ? snap.focusedImage : null;
  for (let i = 0; i < Math.min(snap.imageSettings.length, state.images.length); i++) {
    state.images[i].settings = { ...snap.imageSettings[i] };
  }
}

export function pushHistory(state: AppState): void {
  if (suspended) return;
  const snap = takeSnapshot(state);
  const last = past[past.length - 1];
  if (last && JSON.stringify(last.snapshot) === JSON.stringify(snap)) return;
  past.push({ snapshot: snap });
  if (past.length > MAX) past.shift();
  future.length = 0;
}

export function undo(state: AppState): boolean {
  if (past.length < 2) return false;
  const current = past.pop()!;
  future.push(current);
  const prev = past[past.length - 1];
  suspended = true;
  restoreSnapshot(state, prev.snapshot);
  suspended = false;
  return true;
}

export function redo(state: AppState): boolean {
  if (future.length === 0) return false;
  const next = future.pop()!;
  past.push(next);
  suspended = true;
  restoreSnapshot(state, next.snapshot);
  suspended = false;
  return true;
}

export function clearHistory(): void {
  past.length = 0;
  future.length = 0;
}

let debounceTimer: number | null = null;
export function pushHistoryDebounced(state: AppState, ms = 350): void {
  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    pushHistory(state);
    debounceTimer = null;
  }, ms);
}
