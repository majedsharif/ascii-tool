export default function AnimatePanel() {
  return (
    <section className="panel">
      <header className="panel-head"><span>ANIMATE</span></header>
      <div className="panel-body">
        <label className="toggle">
          <input type="checkbox" id="animEnable" />
          <span>ENABLE</span>
        </label>
        <label className="row">
          <span className="lbl">SPEED</span>
          <input type="range" id="animSpeed" min={1} max={20} defaultValue={8} />
          <span className="val" id="animSpeedVal">8</span>
        </label>
        <label className="row">
          <span className="lbl">INTENSITY</span>
          <input type="range" id="animIntensity" min={0} max={100} defaultValue={50} />
          <span className="val" id="animIntensityVal">50</span>
        </label>
        <div className="seg quad" data-control="animMode">
          <button className="seg-btn active" data-value="wave">WAVE</button>
          <button className="seg-btn" data-value="pulse">PULSE</button>
          <button className="seg-btn" data-value="rain">RAIN</button>
          <button className="seg-btn" data-value="glitch">GLITCH</button>
          <button className="seg-btn" data-value="error">ERROR</button>
          <button className="seg-btn" data-value="scan">SCAN</button>
          <button className="seg-btn" data-value="type">TYPE</button>
          <button className="seg-btn" data-value="corrupt">CORRUPT</button>
        </div>
      </div>
    </section>
  );
}
