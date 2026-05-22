import { FONTS } from '@/lib/presets';

export default function ResolutionPanel() {
  return (
    <section className="panel">
      <header className="panel-head"><span>RESOLUTION</span></header>
      <div className="panel-body">
        <label className="row tight">
          <span className="lbl">FONT</span>
          <select id="fontFamily" className="select">
            {FONTS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </label>
        <label className="row">
          <span className="lbl">COLUMNS</span>
          <input type="range" id="cols" min={20} max={240} defaultValue={110} />
          <span className="val" id="colsVal">110</span>
        </label>
        <label className="row">
          <span className="lbl">FONT SIZE</span>
          <input type="range" id="fontSize" min={4} max={24} defaultValue={8} />
          <span className="val" id="fontSizeVal">8PX</span>
        </label>
        <label className="row">
          <span className="lbl">LINE HEIGHT</span>
          <input type="range" id="lineHeight" min={0.5} max={1.5} step={0.05} defaultValue={0.75} />
          <span className="val" id="lineHeightVal">0.75</span>
        </label>
        <label className="row">
          <span className="lbl">CHAR SPACE</span>
          <input type="range" id="charSpace" min={-2} max={6} step={0.5} defaultValue={0} />
          <span className="val" id="charSpaceVal">0PX</span>
        </label>
        <label className="row">
          <span className="lbl">ASPECT</span>
          <input type="range" id="aspect" min={0.5} max={2} step={0.05} defaultValue={1} />
          <span className="val" id="aspectVal">1.00</span>
        </label>
      </div>
    </section>
  );
}
