export default function ExportPanel() {
  return (
    <section className="panel">
      <header className="panel-head"><span>EXPORT</span></header>
      <div className="panel-body">
        <label className="row tight">
          <span className="lbl">SCALE</span>
          <div className="seg small" data-control="exportScale">
            <button className="seg-btn" data-value="1">1×</button>
            <button className="seg-btn active" data-value="2">2×</button>
            <button className="seg-btn" data-value="3">3×</button>
            <button className="seg-btn" data-value="4">4×</button>
          </div>
        </label>
        <div className="btn-grid">
          <button id="exportPng" className="action-btn">PNG</button>
          <button id="exportSvg" className="action-btn">SVG</button>
          <button id="exportHtml" className="action-btn">HTML</button>
          <button id="copyText" className="action-btn">COPY TEXT</button>
          <button id="exportGif" className="action-btn">GIF</button>
          <button id="exportVideo" className="action-btn">WEBM/MP4</button>
        </div>
        <button id="copyLink" className="action-btn ghost">COPY SHARE LINK</button>
        <button id="resetAll" className="action-btn ghost">RESET SLIDERS</button>
      </div>
    </section>
  );
}
