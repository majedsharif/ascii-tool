import { PER_IMAGE_KEYS } from './constants';
import { activeSettings } from './state';
import { invalidateGrid } from './gridCache';
import { scheduleRender } from './animation';
import type { EngineContext, AppState, ImageSettings } from './types';

type AnyTarget = AppState | ImageSettings;
type Formatter = (v: string) => string;

// Dynamic key writes use `as any` since TS can't narrow per-key value types from a runtime string.
export function targetFor(ctx: EngineContext, key: string): AnyTarget {
  return PER_IMAGE_KEYS.includes(key) ? activeSettings(ctx.state) : ctx.state;
}

export function makeValEditable(rangeEl: HTMLInputElement, valEl: HTMLElement, format?: Formatter): void {
  valEl.classList.add('val-editable');
  valEl.title = 'Click to type a value';

  const display = () => {
    valEl.textContent = format ? format(rangeEl.value) : rangeEl.value;
  };

  const startEdit = () => {
    if (valEl.isContentEditable) return;
    valEl.contentEditable = 'plaintext-only';
    valEl.classList.add('editing');
    valEl.textContent = rangeEl.value;
    valEl.focus();
    const range = document.createRange();
    range.selectNodeContents(valEl);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const commit = () => {
    const raw = valEl.textContent || '';
    const parsed = parseFloat(raw.replace(/[^\d.\-]/g, ''));
    const min = parseFloat(rangeEl.min);
    const max = parseFloat(rangeEl.max);
    const step = parseFloat(rangeEl.step) || 1;
    let value: number;
    if (isNaN(parsed)) {
      value = parseFloat(rangeEl.value);
    } else if (parsed < min) {
      value = min;
    } else if (parsed > max) {
      value = max;
    } else {
      value = Math.round((parsed - min) / step) * step + min;
    }
    const decimals = (String(step).split('.')[1] || '').length;
    rangeEl.value = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
    valEl.contentEditable = 'false';
    valEl.classList.remove('editing');
    display();
    rangeEl.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const cancel = () => {
    valEl.contentEditable = 'false';
    valEl.classList.remove('editing');
    display();
  };

  valEl.addEventListener('mousedown', (e) => {
    if (!valEl.isContentEditable) {
      e.preventDefault();
      e.stopPropagation();
      startEdit();
    }
  });
  valEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  valEl.addEventListener('beforeinput', (e: any) => {
    if (e.inputType && e.inputType.startsWith('insert')) {
      const added = (e.data || '').length;
      const sel = window.getSelection();
      const replaced = (sel && sel.toString().length) || 0;
      const next = (valEl.textContent || '').length - replaced + added;
      if (next > 5) e.preventDefault();
    }
  });
  valEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      valEl.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
      valEl.blur();
    }
  });
  valEl.addEventListener('blur', () => {
    if (valEl.isContentEditable) commit();
  });
}

export function bindRange(
  ctx: EngineContext,
  id: string,
  key: string,
  valId?: string,
  format?: Formatter,
  onChange?: () => void,
): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return;
  const val = valId ? document.getElementById(valId) : null;
  const update = () => {
    (targetFor(ctx, key) as any)[key] = parseFloat(el.value);
    if (val) val.textContent = format ? format(el.value) : el.value;
    if (onChange) onChange();
    invalidateGrid(ctx);
    scheduleRender(ctx);
  };
  el.addEventListener('input', update);
  el.addEventListener('dblclick', () => {
    if (el.value === el.defaultValue) return;
    el.value = el.defaultValue;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  if (val) {
    val.textContent = format ? format(el.value) : el.value;
    makeValEditable(el, val, format);
  }
}

export function bindToggle(
  ctx: EngineContext,
  id: string,
  key: string,
  onChange?: (checked: boolean) => void,
): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return;
  el.addEventListener('change', () => {
    (targetFor(ctx, key) as any)[key] = el.checked;
    if (onChange) onChange(el.checked);
    invalidateGrid(ctx);
    scheduleRender(ctx);
  });
}

export function bindColor(ctx: EngineContext, id: string, key: string, onChange?: () => void): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return;
  el.addEventListener('input', () => {
    (targetFor(ctx, key) as any)[key] = el.value;
    if (onChange) onChange();
    invalidateGrid(ctx);
    scheduleRender(ctx);
  });
}

export function bindSelect(
  ctx: EngineContext,
  id: string,
  key: string,
  onChange?: (val: string) => void,
): void {
  const el = document.getElementById(id) as HTMLSelectElement | null;
  if (!el) return;
  el.addEventListener('change', () => {
    (targetFor(ctx, key) as any)[key] = el.value;
    if (onChange) onChange(el.value);
    invalidateGrid(ctx);
    scheduleRender(ctx);
  });
}

export function bindSeg(
  ctx: EngineContext,
  name: string,
  key: string,
  parse?: (v: string) => any,
  onChange?: (val: any) => void,
): void {
  const seg = document.querySelector(`.seg[data-control="${name}"]`) as HTMLElement | null;
  if (!seg) return;
  seg.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.seg-btn') as HTMLElement | null;
    if (!btn) return;
    seg.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const raw = btn.dataset.value || '';
    const val = parse ? parse(raw) : raw;
    (targetFor(ctx, key) as any)[key] = val;
    if (onChange) onChange(val);
    invalidateGrid(ctx);
    scheduleRender(ctx);
  });
}
