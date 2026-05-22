import { computeLayout } from './layout';
import { getGrid } from './gridCache';
import { getCharIndex, pseudoRand } from './charMapping';
import { fontCssById, FONTS } from './presets';
import type { EngineContext } from './types';

function escapeHtml(ch: string): string {
  if (ch === '&') return '&amp;';
  if (ch === '<') return '&lt;';
  if (ch === '>') return '&gt;';
  if (ch === ' ') return '&nbsp;';
  return ch;
}

export function buildHtml(ctx: EngineContext): string {
  const layout = computeLayout(ctx);
  const { grids, totalCols, totalRows, colOffsets, rowOffsets, colWidths, rowHeights } = layout;
  const fontCss = fontCssById(ctx.state.fontFamily);
  const fontDef = FONTS.find((f) => f.id === ctx.state.fontFamily);
  const bg = ctx.state.transparentBG ? 'transparent' : ctx.state.bgColor;

  const lines: { ch: string; color: string }[][] = [];
  for (let y = 0; y < totalRows; y++) {
    lines.push(Array.from({ length: totalCols }, () => ({ ch: ' ', color: '' })));
  }

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
      for (let x = 0; x < g.cols; x++) {
        const p = y * g.cols + x;
        if (grid.alpha[p] < 16) continue;
        const bVal = grid.gray[p];
        if (bVal < threshold) continue;
        if (addSpaces > 0 && pseudoRand(x * 2.7 + y * 3.1 + g.index * 11.37) < addSpaces) continue;
        const idx = getCharIndex(x, y, g.cols, g.rows, s, text, null, bVal);
        if (idx < 0) continue;
        const ch = text[idx];
        if (!ch || ch === ' ') continue;
        let color: string;
        if (useSolid) {
          color = s.textColor;
        } else {
          const ci = p * 3;
          color = `rgb(${grid.colors[ci]},${grid.colors[ci + 1]},${grid.colors[ci + 2]})`;
        }
        lines[yOff + y][xOff + x] = { ch, color };
      }
    }
  }

  const out: string[] = [];
  for (const row of lines) {
    let runColor = '';
    let runStr = '';
    const flush = () => {
      if (!runStr) return;
      out.push(`<span style="color:${runColor}">${runStr}</span>`);
      runStr = '';
      runColor = '';
    };
    for (const cell of row) {
      if (cell.ch === ' ' || !cell.color) { flush(); out.push('&nbsp;'); continue; }
      if (cell.color !== runColor) { flush(); runColor = cell.color; }
      runStr += escapeHtml(cell.ch);
    }
    flush();
    out.push('\n');
  }

  const fontLink = fontDef?.loadUrl ? `<link rel="stylesheet" href="${fontDef.loadUrl}">` : '';

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>ASCII Art</title>
${fontLink}
<style>
body{margin:0;background:${bg};display:flex;align-items:center;justify-content:center;min-height:100vh;}
pre{font-family:${fontCss};font-size:${ctx.state.fontSize}px;line-height:${ctx.state.lineHeight};letter-spacing:${ctx.state.charSpace}px;margin:0;padding:24px;white-space:pre;}
</style></head>
<body><pre>${out.join('')}</pre></body></html>`;
}

export function exportHtml(ctx: EngineContext): void {
  const html = buildHtml(ctx);
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ascii-${Date.now()}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
