import { computeLayout } from './layout';
import { invalidateGrid } from './gridCache';
import { scheduleRender, refreshAnimLoop } from './animation';
import { renderImageSelect, syncControlsToActive, updateFocusInteraction } from './uiSync';
import type { EngineContext } from './types';

type FocusDeps = {
  onSelectImage: (i: number) => void;
  onRemoveImage: (i: number) => void;
};

export function imageIndexAtPoint(ctx: EngineContext, clientX: number, clientY: number): number | null {
  const rect = ctx.outputCanvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const xPx = clientX - rect.left;
  const yPx = clientY - rect.top;
  if (xPx < 0 || xPx > rect.width || yPx < 0 || yPx > rect.height) return null;
  const layout = computeLayout(ctx);
  const colX = (xPx / rect.width) * layout.totalCols;
  const rowY = (yPx / rect.height) * layout.totalRows;
  for (const g of layout.grids) {
    const colStart = layout.colOffsets[g.gridCol];
    const colEnd = colStart + (layout.colWidths[g.gridCol] || g.cols);
    const rowStart = layout.rowOffsets[g.gridRow];
    const rowEnd = rowStart + (layout.rowHeights[g.gridRow] || g.rows);
    if (colX >= colStart && colX < colEnd && rowY >= rowStart && rowY < rowEnd) {
      return g.index;
    }
  }
  return null;
}

export function setFocus(ctx: EngineContext, index: number | null, deps: FocusDeps): void {
  if (index == null) {
    if (ctx.state.focusedImage == null) return;
    ctx.state.focusedImage = null;
  } else {
    if (!ctx.state.images[index]) return;
    ctx.state.focusedImage = index;
    ctx.state.selectedImage = index;
    renderImageSelect(ctx, deps);
    syncControlsToActive(ctx);
  }
  updateFocusInteraction(ctx);
  invalidateGrid(ctx);
  refreshAnimLoop(ctx);
  scheduleRender(ctx);
}
