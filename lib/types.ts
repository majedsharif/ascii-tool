export interface ImageSettings {
  text: string;
  charPreset: string;
  fillMode: string;
  addSpaces: number;
  cols: number;
  brightness: number;
  contrast: number;
  saturation: number;
  gamma: number;
  invert: number;
  blur: number;
  sharpen: number;
  edge: number;
  posterize: number;
  dither: number;
  threshold: number;
  hueShift: number;
  tintColor: string;
  tintStrength: number;
  paletteMode: string;
  duotoneEnable: boolean;
  duotoneLight: string;
  duotoneDark: string;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  photoColors: boolean;
  textColor: string;
  animEnable: boolean;
  animSpeed: number;
  animIntensity: number;
  animMode: string;
}

export type SourceKind = 'image' | 'video' | 'webcam';

export interface ImageStats {
  meanBrightness: number;   // 0..1
  contrast: number;         // 0..1 stddev of luminance
  edgeDensity: number;      // 0..1 fraction of pixels with Sobel magnitude above threshold
  meanSaturation: number;   // 0..1
  aspect: number;           // width / height
  subjectX: number;         // 0..1 center of mass of high-contrast pixels
  subjectY: number;         // 0..1
  isDark: boolean;
  isFlat: boolean;
  isBusy: boolean;
  isMonochrome: boolean;
}

export interface ImageEntry {
  img: HTMLImageElement | null;
  video: HTMLVideoElement | null;
  stream: MediaStream | null;
  sourceKind: SourceKind;
  settings: ImageSettings;
  filename: string;
  stats?: ImageStats;
}

export interface AppState {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  charSpace: number;
  aspect: number;
  transparentBG: boolean;
  bgColor: string;
  bgMode: string;
  bgGradient1: string;
  bgGradient2: string;
  bgGradientAngle: number;
  bgImage: string | null;
  exportScale: number;
  draft: ImageSettings;
  images: ImageEntry[];
  selectedImage: number;
  focusedImage: number | null;
  compareMode: boolean;
}

export interface Grid {
  gray: Float32Array;
  colors: Uint8ClampedArray;
  alpha: Uint8ClampedArray;
  cols: number;
  rows: number;
}

export interface LayoutGrid {
  cols: number;
  rows: number;
  settings: ImageSettings;
  img: HTMLImageElement | null;
  video: HTMLVideoElement | null;
  sourceKind: SourceKind;
  index: number;
  gridRow: number;
  gridCol: number;
}

export interface Layout {
  grids: LayoutGrid[];
  charW: number;
  charH: number;
  totalCols: number;
  totalRows: number;
  colOffsets: number[];
  rowOffsets: number[];
  colWidths: number[];
  rowHeights: number[];
}

export interface GridCacheEntry {
  key: string;
  grid: Grid;
}

export interface Runtime {
  animFrame: number;
  lastFrameTime: number;
  animRaf: number | null;
  pendingRender: number | null;
  gridCaches: (GridCacheEntry | undefined)[];
  hasLiveSource: boolean;
  zoom: number;
  panX: number;
  panY: number;
  suppressNextClick: boolean;
}

export interface RenderOpts {
  forceOpaque?: boolean;
  noAnim?: boolean;
  forceOriginal?: boolean;
}

export interface EngineContext {
  state: AppState;
  runtime: Runtime;
  outputCanvas: HTMLCanvasElement;
  canvas: HTMLElement;
  procCanvas: HTMLCanvasElement;
  procCtx: CanvasRenderingContext2D;
  measureCanvas: HTMLCanvasElement;
  measureCtx: CanvasRenderingContext2D;
}
