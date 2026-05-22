export default function FillModePanel() {
  return (
    <section className="panel">
      <header className="panel-head"><span>FILL MODE</span></header>
      <div className="panel-body">
        <div className="seg quad" data-control="fillMode">
          <button className="seg-btn active" data-value="repeat">REPEAT</button>
          <button className="seg-btn" data-value="wave">WAVE</button>
          <button className="seg-btn" data-value="scatter">SCATTER</button>
          <button className="seg-btn" data-value="density">DENSITY</button>
          <button className="seg-btn" data-value="stream">STREAM</button>
          <button className="seg-btn" data-value="bits">BITS</button>
        </div>
      </div>
    </section>
  );
}
