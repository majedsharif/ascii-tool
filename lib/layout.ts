import { IMAGE_GAP_CHARS, GRID_COLS, GRID_ROWS } from './constants';
import { viewImages } from './state';
import { fontCssById } from './presets';
import type { EngineContext, Layout, LayoutGrid } from './types';

export function getCharWidth(measureCtx: CanvasRenderingContext2D, fs: number, fontCss: string): number {
  measureCtx.font = `400 ${fs}px ${fontCss}`;
  return measureCtx.measureText('M').width;
}

export function computeLayout(ctx: EngineContext): Layout {
  const { state, measureCtx } = ctx;
  const fontCss = fontCssById(state.fontFamily);
  const charW = getCharWidth(measureCtx, state.fontSize, fontCss) + state.charSpace;
  const charH = state.fontSize * state.lineHeight;
  const entries = viewImages(state);
  const singleCell = entries.length <= 1;

  const cs = getComputedStyle(ctx.canvas);
  const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  const canvasW = Math.max(1, ctx.canvas.clientWidth - padX);
  const canvasH = Math.max(1, ctx.canvas.clientHeight - padY);
  const fallbackAspect = canvasH / canvasW;

  const grids: LayoutGrid[] = entries.map(({ entry, index }) => {
    const s = entry.settings;
    const colsPer = Math.max(2, Math.round(s.cols));
    const img = entry.img;
    const video = entry.video;
    let imgW = 0, imgH = 0;
    if (entry.sourceKind === 'image' && img) {
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;
    } else if (video) {
      imgW = video.videoWidth || 0;
      imgH = video.videoHeight || 0;
    }
    let baseAspect = imgW && imgH ? imgH / imgW : fallbackAspect;
    const r90 = ((s.rotation || 0) % 180) === 90;
    if (r90) baseAspect = 1 / baseAspect;
    const aspect = baseAspect * state.aspect;
    const rows = Math.max(2, Math.round((aspect * colsPer * charW) / charH));
    const gridCol = singleCell ? 0 : index % GRID_COLS;
    const gridRow = singleCell ? 0 : Math.floor(index / GRID_COLS);
    return { cols: colsPer, rows, settings: s, img, video, sourceKind: entry.sourceKind, index, gridRow, gridCol };
  });

  const usedCols = singleCell ? 1 : GRID_COLS;
  const usedRows = singleCell ? 1 : GRID_ROWS;
  const colWidths = new Array(usedCols).fill(0);
  const rowHeights = new Array(usedRows).fill(0);
  for (const g of grids) {
    colWidths[g.gridCol] = Math.max(colWidths[g.gridCol], g.cols);
    rowHeights[g.gridRow] = Math.max(rowHeights[g.gridRow], g.rows);
  }

  const colOffsets = new Array(usedCols).fill(0);
  const rowOffsets = new Array(usedRows).fill(0);
  let accCol = 0;
  let nonEmptyCols = 0;
  for (let c = 0; c < usedCols; c++) {
    colOffsets[c] = accCol;
    if (colWidths[c] > 0) {
      if (nonEmptyCols > 0) accCol += IMAGE_GAP_CHARS;
      colOffsets[c] = accCol;
      accCol += colWidths[c];
      nonEmptyCols++;
    }
  }
  const totalCols = Math.max(2, accCol);

  let accRow = 0;
  let nonEmptyRows = 0;
  for (let r = 0; r < usedRows; r++) {
    rowOffsets[r] = accRow;
    if (rowHeights[r] > 0) {
      if (nonEmptyRows > 0) accRow += IMAGE_GAP_CHARS;
      rowOffsets[r] = accRow;
      accRow += rowHeights[r];
      nonEmptyRows++;
    }
  }
  const totalRows = Math.max(2, accRow);

  return { grids, charW, charH, totalCols, totalRows, colOffsets, rowOffsets, colWidths, rowHeights };
}
