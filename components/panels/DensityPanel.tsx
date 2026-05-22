export default function DensityPanel() {
  return (
    <section className="panel">
      <header className="panel-head"><span>DENSITY</span></header>
      <div className="panel-body">
        <label className="row">
          <span className="lbl">ADD SPACES</span>
          <input type="range" id="addSpaces" min={0} max={100} defaultValue={0} />
          <span className="val" id="addSpacesVal">0</span>
        </label>
      </div>
    </section>
  );
}
