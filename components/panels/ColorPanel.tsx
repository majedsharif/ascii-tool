import { PALETTES } from '@/lib/presets';

export default function ColorPanel() {
  return (
    <section className="panel">
      <header className="panel-head"><span>COLOR</span></header>
      <div className="panel-body">
        <label className="toggle">
          <input type="checkbox" id="photoColors" defaultChecked />
          <span>PHOTO COLORS</span>
        </label>
        <label className="row tight">
          <span className="lbl">PALETTE</span>
          <select id="paletteMode" className="select">
            {PALETTES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </label>
        <label className="toggle">
          <input type="checkbox" id="duotoneEnable" />
          <span>DUOTONE</span>
        </label>
        <label className="row tight">
          <span className="lbl">LIGHT</span>
          <input type="color" id="duotoneLight" defaultValue="#ffdd55" />
        </label>
        <label className="row tight">
          <span className="lbl">DARK</span>
          <input type="color" id="duotoneDark" defaultValue="#001144" />
        </label>

        <div className="section-label">TEXT</div>
        <label className="row tight">
          <span className="lbl">TEXT COLOR</span>
          <input type="color" id="textColor" defaultValue="#000000" />
        </label>

        <div className="section-label">BACKGROUND</div>
        <div className="seg small" data-control="bgMode">
          <button className="seg-btn active" data-value="color">COLOR</button>
          <button className="seg-btn" data-value="gradient">GRADIENT</button>
          <button className="seg-btn" data-value="image">IMAGE</button>
        </div>
        <label className="toggle">
          <input type="checkbox" id="transparentBG" />
          <span>TRANSPARENT BG</span>
        </label>
        <label className="row tight">
          <span className="lbl">BG COLOR</span>
          <input type="color" id="bgColor" defaultValue="#ffffff" />
        </label>
        <label className="row tight">
          <span className="lbl">GRAD A</span>
          <input type="color" id="bgGradient1" defaultValue="#ffffff" />
        </label>
        <label className="row tight">
          <span className="lbl">GRAD B</span>
          <input type="color" id="bgGradient2" defaultValue="#dddddd" />
        </label>
        <label className="row">
          <span className="lbl">GRAD ANGLE</span>
          <input type="range" id="bgGradientAngle" min={0} max={360} defaultValue={180} />
          <span className="val" id="bgGradientAngleVal">180°</span>
        </label>
        <div className="row tight">
          <span className="lbl">BG IMAGE</span>
          <div className="bg-image-row">
            <input type="file" id="bgImageInput" accept="image/*" style={{ display: 'none' }} />
            <button type="button" id="bgImagePick" className="ghost-btn small">PICK</button>
            <button type="button" id="bgImageClear" className="ghost-btn small">CLEAR</button>
          </div>
        </div>
      </div>
    </section>
  );
}
