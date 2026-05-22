import { STYLE_PRESETS } from '@/lib/presets';

export default function PresetsPanel() {
  return (
    <section className="panel">
      <header className="panel-head"><span>PRESETS</span></header>
      <div className="panel-body">
        <div className="section-label">STYLES</div>
        <div className="preset-grid" id="stylePresetGrid">
          <button type="button" className="preset-btn preset-btn-wide preset-btn-randomize" data-style-preset="random">RANDOMIZE</button>
          <button type="button" id="resetStyle" className="preset-btn preset-btn-wide preset-btn-reset">RESET</button>
          {STYLE_PRESETS.map((p) => (
            <button key={p.id} type="button" className="preset-btn" data-style-preset={p.id}>
              {p.label}
            </button>
          ))}
        </div>
        <label className="row">
          <span className="lbl">INTENSITY</span>
          <input type="range" id="presetIntensity" min={0} max={100} defaultValue={50} />
          <span className="val" id="presetIntensityVal">50</span>
        </label>

        <div className="section-label">USER PRESETS</div>
        <div className="user-presets" id="userPresets" />
        <div className="row-flex">
          <input type="text" id="presetName" placeholder="NAME…" className="text-input" />
          <button type="button" id="savePreset" className="ghost-btn small">SAVE</button>
        </div>
        <p className="hint">SAVED LOCALLY</p>
      </div>
    </section>
  );
}
