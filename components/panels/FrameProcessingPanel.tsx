export default function FrameProcessingPanel() {
  return (
    <section className="panel">
      <header className="panel-head"><span>FRAME PROCESSING</span></header>
      <div className="panel-body">
        <div className="section-label">TRANSFORM</div>
        <div className="row tight">
          <span className="lbl">ROTATE</span>
          <div className="seg" data-control="rotation">
            <button className="seg-btn active" data-value="0">0°</button>
            <button className="seg-btn" data-value="90">90°</button>
            <button className="seg-btn" data-value="180">180°</button>
            <button className="seg-btn" data-value="270">270°</button>
          </div>
        </div>
        <div className="row-flex">
          <label className="toggle">
            <input type="checkbox" id="flipH" />
            <span>FLIP H</span>
          </label>
          <label className="toggle">
            <input type="checkbox" id="flipV" />
            <span>FLIP V</span>
          </label>
        </div>

        <div className="section-label">TONE</div>
        <label className="row">
          <span className="lbl">BRIGHTNESS</span>
          <input type="range" id="brightness" min={-100} max={100} defaultValue={0} />
          <span className="val" id="brightnessVal">0</span>
        </label>
        <label className="row">
          <span className="lbl">CONTRAST</span>
          <input type="range" id="contrast" min={-100} max={100} defaultValue={0} />
          <span className="val" id="contrastVal">0</span>
        </label>
        <label className="row">
          <span className="lbl">SATURATION</span>
          <input type="range" id="saturation" min={-100} max={100} defaultValue={0} />
          <span className="val" id="saturationVal">0</span>
        </label>
        <label className="row">
          <span className="lbl">GAMMA</span>
          <input type="range" id="gamma" min={0.3} max={3} step={0.05} defaultValue={1} />
          <span className="val" id="gammaVal">1.00</span>
        </label>
        <label className="row">
          <span className="lbl">INVERT</span>
          <input type="range" id="invert" min={0} max={100} defaultValue={0} />
          <span className="val" id="invertVal">0%</span>
        </label>
        <label className="row">
          <span className="lbl">HUE SHIFT</span>
          <input type="range" id="hueShift" min={-180} max={180} defaultValue={0} />
          <span className="val" id="hueShiftVal">0°</span>
        </label>
        <label className="row">
          <span className="lbl">TINT</span>
          <input type="range" id="tintStrength" min={0} max={100} defaultValue={0} />
          <span className="val" id="tintStrengthVal">0%</span>
        </label>
        <label className="row tight">
          <span className="lbl">TINT COLOR</span>
          <input type="color" id="tintColor" defaultValue="#ff8800" />
        </label>

        <div className="section-label">DETAIL</div>
        <label className="row">
          <span className="lbl">BLUR</span>
          <input type="range" id="blur" min={0} max={5} step={1} defaultValue={0} />
          <span className="val" id="blurVal">0</span>
        </label>
        <label className="row">
          <span className="lbl">SHARPEN</span>
          <input type="range" id="sharpen" min={0} max={100} defaultValue={0} />
          <span className="val" id="sharpenVal">0</span>
        </label>
        <label className="row">
          <span className="lbl">EDGE DETECT</span>
          <input type="range" id="edge" min={0} max={100} defaultValue={0} />
          <span className="val" id="edgeVal">0%</span>
        </label>
        <label className="row">
          <span className="lbl">POSTERIZE</span>
          <input type="range" id="posterize" min={0} max={16} step={1} defaultValue={0} />
          <span className="val" id="posterizeVal">OFF</span>
        </label>
        <label className="row">
          <span className="lbl">DITHER</span>
          <input type="range" id="dither" min={0} max={100} defaultValue={0} />
          <span className="val" id="ditherVal">0</span>
        </label>
        <label className="row">
          <span className="lbl">THRESHOLD</span>
          <input type="range" id="threshold" min={0} max={100} defaultValue={30} />
          <span className="val" id="thresholdVal">30</span>
        </label>
      </div>
    </section>
  );
}
