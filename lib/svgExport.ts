import { computeLayout } from './layout';
import { getGrid } from './gridCache';
import { getCharIndex, pseudoRand } from './charMapping';
import { fontCssById } from './presets';
import type { EngineContext } from './types';

function escapeXml(ch: string): string {
  if (ch === '&') return '&amp;';
  if (ch === '<') return '&lt;';
  if (ch === '>') return '&gt;';
  if (ch === '"') return '&quot;';
  if (ch === "'") return '&apos;';
  return ch;
}

export function buildSvg(ctx: EngineContext): string {
  const layout = computeLayout(ctx);
  const { grids, charW, charH, totalCols, totalRows, colOffsets, rowOffsets, colWidths, rowHeights } = layout;
  const w = Math.max(1, Math.round(totalCols * charW));
  const h = Math.max(1, Math.round(totalRows * charH));
  const fontCss = fontCssById(ctx.state.fontFamily);

  const bg = ctx.state.transparentBG ? 'transparent' : ctx.state.bgColor;
  const parts: string[] = [];
  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family='${fontCss.replace(/'/g, '"')}' font-size="${ctx.state.fontSize}" letter-spacing="${ctx.state.charSpace}">`);
  parts.push(`<rect width="${w}" height="${h}" fill="${bg}"/>`);

  for (const g of grids) {
    const s = g.settings;
    const text = s.text.replace(/[\r\n\t]/g, '') || ' ';
    const threshold = s.threshold / 100;
    const addSpaces = s.addSpaces / 100;
    const useSolid = !s.photoColors;
    const cellColWidth = colWidths[g.gridCol] || g.cols;
    const cellRowHeight = rowHeights[g.gridRow] || g.rows;
    const xOff = colOffsets[g.gridCol] + Math.floor((cellColWidth - g.cols) / 2);
    const yOff = rowOffsets[g.gridRow] + Math.floor((cellRowHeight - g.rows) / 2);
    const grid = getGrid(ctx, g, g.index);
    for (let y = 0; y < g.rows; y++) {
      let runFill = '';
      let runStr = '';
      let runStart = -1;
      const flush = (lineY: number) => {
        if (runStart < 0 || !runStr) return;
        const xPx = (xOff + runStart) * charW;
        const yPx = (yOff + lineY) * charH;
        parts.push(`<text x="${xPx.toFixed(2)}" y="${(yPx + ctx.state.fontSize * 0.85).toFixed(2)}" fill="${runFill}">${runStr}</text>`);
        runStart = -1;
        runStr = '';
        runFill = '';
      };
      for (let x = 0; x < g.cols; x++) {
        const p = y * g.cols + x;
        const bVal = grid.gray[p];
        let skip = grid.alpha[p] < 16 || bVal < threshold;
        if (!skip && addSpaces > 0) {
          if (pseudoRand(x * 2.7 + y * 3.1 + g.index * 11.37) < addSpaces) skip = true;
        }
        if (skip) { flush(y); continue; }
        const idx = getCharIndex(x, y, g.cols, g.rows, s, text, null, bVal);
        if (idx < 0) { flush(y); continue; }
        const ch = text[idx];
        if (!ch || ch === ' ') { flush(y); continue; }
        let color: string;
        if (useSolid) {
          color = s.textColor;
        } else {
          const ci = (y * g.cols + x) * 3;
          color = `rgb(${grid.colors[ci]},${grid.colors[ci + 1]},${grid.colors[ci + 2]})`;
        }
        if (runStart === -1) {
          runStart = x;
          runFill = color;
          runStr = escapeXml(ch);
        } else if (color === runFill && runStr.length < 200) {
          runStr += escapeXml(ch);
        } else {
          flush(y);
          runStart = x;
          runFill = color;
          runStr = escapeXml(ch);
        }
      }
      flush(y);
    }
  }
  parts.push(`</svg>`);
  return parts.join('\n');
}

export function exportSvg(ctx: EngineContext): void {
  const svg = buildSvg(ctx);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ascii-${Date.now()}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
