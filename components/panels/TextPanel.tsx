import { CHAR_RAMPS } from '@/lib/presets';

export default function TextPanel() {
  return (
    <section className="panel">
      <header className="panel-head"><span>CHARS &amp; TEXT</span></header>
      <div className="panel-body">
        <label className="row tight">
          <span className="lbl">PRESET</span>
          <select id="charPreset" className="select">
            <option value="custom">CUSTOM</option>
            {CHAR_RAMPS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </label>
        <textarea id="textInput" rows={2} spellCheck={false} defaultValue="YOUR TEXT HERE" />
        <p className="hint">CHARACTERS USED TO BUILD THE ART · TYPE ANY UNICODE</p>
      </div>
    </section>
  );
}
