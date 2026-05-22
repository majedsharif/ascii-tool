import { BASE_PATH, EXAMPLE_IMAGES, MAX_IMAGES } from '@/lib/constants';

export default function ImagePanel() {
  return (
    <section className="panel">
      <header className="panel-head">
        <span>INPUT</span>
        <span className="panel-head-meta" id="imageCount">0 / {MAX_IMAGES}</span>
      </header>
      <div className="panel-body">
        <label className="dropzone" id="imageDropzone">
          <input type="file" id="imageInput" accept="image/*,video/*" multiple />
          <span className="dropzone-icon" aria-hidden="true">+</span>
          <span className="dropzone-text">UPLOAD MEDIA</span>
          <span className="dropzone-sub">IMAGE / GIF / VIDEO</span>
        </label>

        <div className="row tight">
          <input type="text" id="urlInput" placeholder="HTTPS://… (PASTE IMAGE URL)" className="text-input" />
          <button id="loadUrl" type="button" className="ghost-btn small">LOAD</button>
        </div>

        <button id="webcamBtn" type="button" className="ghost-btn">USE WEBCAM</button>

        <div className="image-thumbs hidden" id="imageThumbs" />
        <p className="hint hidden" id="imageSelectHint">CLICK A THUMBNAIL TO EDIT THAT IMAGE</p>

        <div className="example-block">
          <div className="section-label">EXAMPLES</div>
          <div className="example-grid" id="exampleGrid">
            {EXAMPLE_IMAGES.map((name) => (
              <button
                key={name}
                type="button"
                className="example-thumb"
                data-example={name}
                title={name.toUpperCase()}
                style={{ backgroundImage: `url(${BASE_PATH}/img/${name}.jpg)` }}
              >
                <span className="sr-only">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
