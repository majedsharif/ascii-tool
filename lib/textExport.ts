import { computeLayout } from './layout';
import { getGrid } from './gridCache';
import { getCharIndex, pseudoRand } from './charMapping';
import type { EngineContext } from './types';

export function gridToText(ctx: EngineContext): string {
  const layout = computeLayout(ctx);
  const { grids, totalCols, totalRows, colOffsets, rowOffsets, colWidths, rowHeights } = layout;
  const imageGrids = grids.map((g) => getGrid(ctx, g, g.index));

  const lines: string[][] = [];
  for (let y = 0; y < totalRows; y++) {
    lines.push(new Array(totalCols).fill(' '));
  }

  for (let i = 0; i < grids.length; i++) {
    const g = grids[i];
    const s = g.settings;
    const text = s.text.replace(/[\r\n\t]/g, '') || ' ';
    const threshold = s.threshold / 100;
    const addSpaces = s.addSpaces / 100;
    const cellColWidth = colWidths[g.gridCol] || g.cols;
    const cellRowHeight = rowHeights[g.gridRow] || g.rows;
    const xOff = colOffsets[g.gridCol] + Math.floor((cellColWidth - g.cols) / 2);
    const yOff = rowOffsets[g.gridRow] + Math.floor((cellRowHeight - g.rows) / 2);

    for (let y = 0; y < g.rows; y++) {
      const line = lines[yOff + y];
      if (!line) continue;
      for (let x = 0; x < g.cols; x++) {
        const p = y * g.cols + x;
        const bVal = imageGrids[i].gray[p];
        const aVal = imageGrids[i].alpha[p];
        let ch = ' ';
        if (aVal >= 16 && bVal >= threshold) {
          if (addSpaces > 0 && pseudoRand(x * 2.7 + y * 3.1 + g.index * 11.37) < addSpaces) {
            ch = ' ';
          } else {
            const idx = getCharIndex(x, y, g.cols, g.rows, s, text, null, bVal);
            ch = idx < 0 ? ' ' : (text[idx] || ' ');
          }
        }
        if (ch !== ' ') line[xOff + x] = ch;
      }
    }
  }

  return lines.map((row) => row.join('').replace(/\s+$/, '')).join('\n') + '\n';
}
