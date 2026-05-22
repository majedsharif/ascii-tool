export default function Canvas() {
  return (
    <main className="canvas" id="canvas">
      <div className="canvas-inner">
        <canvas id="output" />
      </div>
      <div className="canvas-toolbar" id="canvasToolbar">
        <button type="button" className="canvas-btn" id="compareBtn" title="Hold to compare (or press C)">COMPARE</button>
        <button type="button" className="canvas-btn" id="undoBtn" title="Undo (⌘Z)">UNDO</button>
        <button type="button" className="canvas-btn" id="redoBtn" title="Redo (⌘⇧Z)">REDO</button>
        <button type="button" className="canvas-btn" id="clearImage" title="Clear image">CLEAR</button>
        <button type="button" className="canvas-btn" id="sidebarOpen" title="Open controls">CONTROLS</button>
      </div>
      <div className="zoom-toolbar" id="zoomToolbar">
        <button type="button" className="canvas-btn" id="zoomOut" title="Zoom out">−</button>
        <span className="zoom-label" id="zoomLabel">100%</span>
        <button type="button" className="canvas-btn" id="zoomIn" title="Zoom in">+</button>
        <button type="button" className="canvas-btn" id="zoomFit" title="Reset zoom">FIT</button>
      </div>
    </main>
  );
}
