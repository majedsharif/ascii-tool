import type { ImageStats } from './types';

export interface CharRamp {
  id: string;
  label: string;
  chars: string;
}

export const CHAR_RAMPS: CharRamp[] = [
  { id: 'classic', label: 'CLASSIC', chars: ' .:-=+*#%@' },
  { id: 'dense', label: 'DENSE', chars: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`. ' },
  { id: 'blocks', label: 'BLOCKS', chars: ' ░▒▓█' },
  { id: 'shade', label: 'SHADE', chars: ' .,:;!|=+*░▒▓█' },
  { id: 'dots', label: 'DOTS', chars: ' .·•●' },
  { id: 'binary', label: 'BINARY', chars: '01' },
  { id: 'braille', label: 'BRAILLE', chars: '⠀⠁⠃⠇⠏⠟⠿⡿⣿' },
  { id: 'kana', label: 'KATAKANA', chars: 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ' },
  { id: 'matrix', label: 'MATRIX', chars: '01アイウエオカキクケコサシスセソタチツテト' },
  { id: 'arabic', label: 'ARABIC', chars: ' .٠ـ١ال٢رد٣وني٤م٥هك٦ع٧ص٨جث٩سشضغ' },
  { id: 'hex', label: 'HEX', chars: '0123456789ABCDEF' },
  { id: 'ascii-art', label: 'ASCII-ART', chars: ' .,;-+=*#@' },
  { id: 'edge', label: 'EDGE', chars: ' .-=+#' },
];

export interface PaletteSpec {
  id: string;
  label: string;
  colors: number[][];
}

export const PALETTES: PaletteSpec[] = [
  { id: 'none', label: 'NONE', colors: [] },
  {
    id: 'mono',
    label: 'MONO',
    colors: [[0, 0, 0], [255, 255, 255]],
  },
  {
    id: 'gameboy',
    label: 'GAMEBOY',
    colors: [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]],
  },
  {
    id: 'gameboy-pocket',
    label: 'GB POCKET',
    colors: [[8, 24, 32], [52, 104, 86], [136, 192, 112], [224, 248, 208]],
  },
  {
    id: 'cga0',
    label: 'CGA 0',
    colors: [[0, 0, 0], [85, 255, 85], [255, 85, 85], [255, 255, 85]],
  },
  {
    id: 'cga1',
    label: 'CGA 1',
    colors: [[0, 0, 0], [85, 255, 255], [255, 85, 255], [255, 255, 255]],
  },
  {
    id: 'nes',
    label: 'NES',
    colors: [
      [124, 124, 124], [0, 0, 252], [0, 0, 188], [68, 40, 188],
      [148, 0, 132], [168, 0, 32], [168, 16, 0], [136, 20, 0],
      [80, 48, 0], [0, 120, 0], [0, 104, 0], [0, 88, 0],
      [0, 64, 88], [0, 0, 0], [0, 0, 0], [0, 0, 0],
      [188, 188, 188], [0, 120, 248], [0, 88, 248], [104, 68, 252],
      [216, 0, 204], [228, 0, 88], [248, 56, 0], [228, 92, 16],
      [172, 124, 0], [0, 184, 0], [0, 168, 0], [0, 168, 68],
      [0, 136, 136], [0, 0, 0], [0, 0, 0], [0, 0, 0],
    ],
  },
  {
    id: 'term16',
    label: 'TERM 16',
    colors: [
      [0, 0, 0], [170, 0, 0], [0, 170, 0], [170, 85, 0],
      [0, 0, 170], [170, 0, 170], [0, 170, 170], [170, 170, 170],
      [85, 85, 85], [255, 85, 85], [85, 255, 85], [255, 255, 85],
      [85, 85, 255], [255, 85, 255], [85, 255, 255], [255, 255, 255],
    ],
  },
  {
    id: 'pico8',
    label: 'PICO-8',
    colors: [
      [0, 0, 0], [29, 43, 83], [126, 37, 83], [0, 135, 81],
      [171, 82, 54], [95, 87, 79], [194, 195, 199], [255, 241, 232],
      [255, 0, 77], [255, 163, 0], [255, 236, 39], [0, 228, 54],
      [41, 173, 255], [131, 118, 156], [255, 119, 168], [255, 204, 170],
    ],
  },
  {
    id: 'sepia',
    label: 'SEPIA',
    colors: [
      [33, 22, 14], [78, 53, 36], [128, 96, 67], [180, 145, 105],
      [220, 195, 156], [245, 230, 211],
    ],
  },
  {
    id: 'thermal',
    label: 'THERMAL',
    colors: [
      [0, 0, 32], [40, 0, 80], [120, 0, 100], [200, 30, 60],
      [240, 100, 20], [255, 200, 0], [255, 255, 220],
    ],
  },
];

export interface FontOption {
  id: string;
  label: string;
  css: string;
  loadUrl?: string;
}

export const FONTS: FontOption[] = [
  { id: 'courier', label: 'COURIER', css: '"Courier New", "Courier", monospace' },
  { id: 'jetbrains', label: 'JETBRAINS', css: '"JetBrains Mono", "Menlo", monospace' },
  { id: 'menlo', label: 'MENLO', css: '"Menlo", monospace' },
  { id: 'monaco', label: 'MONACO', css: '"Monaco", monospace' },
  {
    id: 'fira',
    label: 'FIRA CODE',
    css: '"Fira Code", monospace',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400&display=swap',
  },
  {
    id: 'ibm',
    label: 'IBM PLEX',
    css: '"IBM Plex Mono", monospace',
    loadUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&display=swap',
  },
  {
    id: 'space',
    label: 'SPACE',
    css: '"Space Mono", monospace',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400&display=swap',
  },
  {
    id: 'inconsolata',
    label: 'INCONSOLATA',
    css: '"Inconsolata", monospace',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400&display=swap',
  },
  {
    id: 'vt323',
    label: 'VT323',
    css: '"VT323", monospace',
    loadUrl: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
  },
  {
    id: 'press-start',
    label: 'PRESS START',
    css: '"Press Start 2P", monospace',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
  },
  {
    id: 'silkscreen',
    label: 'SILKSCREEN',
    css: '"Silkscreen", monospace',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Silkscreen&display=swap',
  },
];

const loadedFonts = new Set<string>();
export function ensureFontLoaded(id: string): void {
  if (typeof document === 'undefined') return;
  const f = FONTS.find((x) => x.id === id);
  if (!f || !f.loadUrl || loadedFonts.has(id)) return;
  loadedFonts.add(id);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = f.loadUrl;
  document.head.appendChild(link);
}

export function fontCssById(id: string): string {
  return FONTS.find((f) => f.id === id)?.css || FONTS[0].css;
}

export interface StylePreset {
  id: string;
  label: string;
  apply: (s: any, g: any) => void;
}

const DESTRUCTIVE_ANIM_MODES = new Set(['glitch', 'error', 'corrupt', 'type']);
const CALM_ANIM_MODES = ['wave', 'pulse', 'scan', 'rain'] as const;

export function scaleStyleIntensity(s: any, intensity: number): void {
  const t = Math.max(0, Math.min(1, intensity / 100));
  if (t === 1) return;

  const base = {
    animIntensity: 0,
    animSpeed: 8,
    dither: 0,
    edge: 0,
    sharpen: 0,
    blur: 0,
    posterize: 0,
    contrast: 0,
    saturation: 0,
    tintStrength: 0,
    hueShift: 0,
    brightness: 0,
    gamma: 1,
    invert: 0,
  };

  const lerp = (a: number, b: number): number => Math.round(a + (b - a) * t);

  s.animIntensity = lerp(base.animIntensity, s.animIntensity);
  s.animSpeed = Math.max(1, lerp(base.animSpeed, s.animSpeed));
  s.dither = lerp(base.dither, s.dither);
  s.edge = lerp(base.edge, s.edge);
  s.sharpen = lerp(base.sharpen, s.sharpen);
  s.blur = lerp(base.blur, s.blur);

  if (s.posterize >= 2) {
    const v = lerp(base.posterize, s.posterize);
    s.posterize = v >= 2 ? v : 0;
  }

  s.contrast = lerp(base.contrast, s.contrast);
  s.saturation = lerp(base.saturation, s.saturation);
  s.tintStrength = lerp(base.tintStrength, s.tintStrength);
  s.hueShift = lerp(base.hueShift, s.hueShift);
  s.brightness = lerp(base.brightness, s.brightness);
  s.invert = lerp(base.invert, s.invert);
  s.gamma = +(base.gamma + (s.gamma - base.gamma) * t).toFixed(2);

  if (t < 0.5 && DESTRUCTIVE_ANIM_MODES.has(s.animMode)) {
    const i = Math.abs(s.animSpeed | 0) % CALM_ANIM_MODES.length;
    s.animMode = CALM_ANIM_MODES[i];
  }

  if (t < 0.05) s.animEnable = false;
}

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const rndInt = (min: number, max: number) => Math.floor(rnd(min, max + 1));
const chance = (p: number) => Math.random() < p;
const randHex = () =>
  '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

const FILL_MODE_WEIGHTS: { id: string; weight: number }[] = [
  { id: 'density', weight: 6 },
  { id: 'repeat', weight: 3 },
  { id: 'wave', weight: 2 },
  { id: 'stream', weight: 1 },
  { id: 'scatter', weight: 0.5 },
  { id: 'bits', weight: 0.5 },
];

const ANIM_MODE_WEIGHTS: { id: string; weight: number; maxIntensity: number }[] = [
  { id: 'wave', weight: 5, maxIntensity: 80 },
  { id: 'pulse', weight: 3, maxIntensity: 80 },
  { id: 'scan', weight: 3, maxIntensity: 65 },
  { id: 'rain', weight: 2, maxIntensity: 55 },
  { id: 'glitch', weight: 1, maxIntensity: 35 },
  { id: 'type', weight: 0.6, maxIntensity: 30 },
  { id: 'corrupt', weight: 0.5, maxIntensity: 30 },
  { id: 'error', weight: 0.5, maxIntensity: 30 },
];

function weightedPick<T extends { weight: number }>(items: readonly T[]): T {
  const total = items.reduce((a, x) => a + x.weight, 0);
  let r = Math.random() * total;
  for (const x of items) {
    r -= x.weight;
    if (r <= 0) return x;
  }
  return items[items.length - 1];
}

function relLuminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(((n >> 16) & 255) / 255)
    + 0.7152 * f(((n >> 8) & 255) / 255)
    + 0.0722 * f((n & 255) / 255);
}

function contrastRatio(a: string, b: string): number {
  const la = relLuminance(a);
  const lb = relLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function randHexAgainst(bg: string, minRatio: number): string {
  for (let i = 0; i < 16; i++) {
    const c = randHex();
    if (contrastRatio(bg, c) >= minRatio) return c;
  }
  return relLuminance(bg) < 0.18 ? '#f0f0f0' : '#0d0d0d';
}

export function randomizeStyle(s: any, g: any, stats?: ImageStats): void {
  const ramp = pick(CHAR_RAMPS);
  s.charPreset = ramp.id;
  s.text = ramp.chars;

  const usePhoto = stats?.isMonochrome ? chance(0.3) : chance(0.75);
  s.photoColors = usePhoto;

  s.fillMode = usePhoto ? weightedPick(FILL_MODE_WEIGHTS).id : 'density';

  s.paletteMode = usePhoto && chance(0.5)
    ? pick(PALETTES.filter((p) => p.id !== 'none')).id
    : 'none';

  const duotoneP = stats?.isMonochrome ? 0.55 : 0.15;
  if (chance(duotoneP)) {
    s.duotoneEnable = true;
    s.duotoneLight = randHex();
    s.duotoneDark = randHexAgainst(s.duotoneLight, 4);
  } else {
    s.duotoneEnable = false;
  }

  s.brightness = rndInt(-15, 15);
  const contrastMin = stats?.isFlat ? 25 : 0;
  s.contrast = rndInt(contrastMin, 55);
  s.saturation = chance(0.3) ? rndInt(-100, 40) : rndInt(-15, 30);

  if (stats && stats.meanBrightness > 0.65) {
    s.gamma = +rnd(0.7, 1.0).toFixed(2);
  } else if (stats?.isDark) {
    s.gamma = +rnd(1.0, 1.4).toFixed(2);
  } else {
    s.gamma = +rnd(0.8, 1.4).toFixed(2);
  }

  s.invert = chance(0.12) ? 100 : 0;
  s.blur = chance(0.12) ? rndInt(1, 2) : 0;
  const sharpenP = stats?.isFlat ? 0.7 : 0.3;
  s.sharpen = chance(sharpenP) ? rndInt(20, 70) : 0;
  s.edge = chance(0.18) ? rndInt(30, 65) : 0;
  s.posterize = chance(0.25) ? rndInt(3, 6) : 0;
  s.dither = chance(0.4) ? rndInt(20, 90) : 0;
  const threshMax = stats?.isDark ? 12 : 25;
  s.threshold = rndInt(0, threshMax);
  s.hueShift = chance(0.4) ? rndInt(-180, 180) : 0;
  s.tintStrength = chance(0.25) ? rndInt(20, 55) : 0;
  s.tintColor = randHex();

  const colsFloor = stats?.isBusy ? 130 : 90;
  s.cols = rndInt(colsFloor, 180);
  s.addSpaces = chance(0.15) ? 1 : 0;

  const anim = weightedPick(ANIM_MODE_WEIGHTS);
  s.animEnable = chance(0.7);
  s.animMode = anim.id;
  s.animSpeed = rndInt(2, 14);
  s.animIntensity = rndInt(20, anim.maxIntensity);

  g.bgColor = randHex();
  g.fontFamily = pick(FONTS).id;
  s.textColor = usePhoto ? randHex() : randHexAgainst(g.bgColor, 4);
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'classic',
    label: 'CLASSIC',
    apply: (s, g) => {
      s.text = ' .:-=+*#%@';
      s.charPreset = 'classic';
      s.fillMode = 'density';
      s.photoColors = false;
      s.textColor = '#0a0a0a';
      s.contrast = 50;
      s.sharpen = 35;
      s.saturation = -100;
      s.threshold = 6;
      s.animEnable = false;
      g.bgColor = '#ffffff';
      g.fontFamily = 'courier';
    },
  },
  {
    id: 'newsprint',
    label: 'NEWSPRINT',
    apply: (s, g) => {
      s.text = ' .,;-+=*#@';
      s.charPreset = 'ascii-art';
      s.fillMode = 'density';
      s.photoColors = false;
      s.textColor = '#1a1610';
      s.contrast = 70;
      s.sharpen = 20;
      s.saturation = -100;
      s.gamma = 0.85;
      s.dither = 75;
      s.posterize = 4;
      s.threshold = 8;
      s.addSpaces = 1;
      s.animEnable = false;
      g.bgColor = '#e8dcbe';
      g.fontFamily = 'space';
    },
  },
  {
    id: 'matrix',
    label: 'MATRIX',
    apply: (s, g) => {
      s.text = ' .:-=+*#%@';
      s.charPreset = 'classic';
      s.fillMode = 'density';
      s.photoColors = false;
      s.textColor = '#00ff66';
      s.contrast = 50;
      s.sharpen = 30;
      s.saturation = -100;
      s.threshold = 20;
      s.animEnable = true;
      s.animMode = 'rain';
      s.animSpeed = 9;
      s.animIntensity = 35;
      g.bgColor = '#000000';
      g.fontFamily = 'jetbrains';
    },
  },
  {
    id: 'ink',
    label: 'INK',
    apply: (s, g) => {
      s.text = ' .,;-+=*#@';
      s.charPreset = 'ascii-art';
      s.fillMode = 'density';
      s.photoColors = false;
      s.textColor = '#1a0d05';
      s.contrast = 45;
      s.sharpen = 25;
      s.saturation = -100;
      s.gamma = 1.05;
      s.threshold = 6;
      s.animEnable = false;
      g.bgColor = '#f0e0bf';
      g.fontFamily = 'courier';
    },
  },
  {
    id: 'thermal',
    label: 'THERMAL',
    apply: (s, g) => {
      s.text = ' .:-=+*#%@';
      s.charPreset = 'classic';
      s.paletteMode = 'thermal';
      s.photoColors = true;
      s.fillMode = 'density';
      s.contrast = 45;
      s.sharpen = 25;
      s.saturation = 0;
      s.gamma = 0.95;
      s.threshold = 12;
      s.animEnable = false;
      g.bgColor = '#000000';
    },
  },
  {
    id: 'gameboy',
    label: 'GAMEBOY',
    apply: (s, g) => {
      s.text = ' .:-=+*#%@';
      s.charPreset = 'classic';
      s.paletteMode = 'gameboy-pocket';
      s.photoColors = true;
      s.fillMode = 'density';
      s.contrast = 40;
      s.sharpen = 25;
      s.saturation = -20;
      s.posterize = 4;
      s.threshold = 10;
      s.animEnable = false;
      g.bgColor = '#e0f8d0';
    },
  },
  {
    id: 'sketch',
    label: 'SKETCH',
    apply: (s, g) => {
      s.text = ' .,;-+=*#@';
      s.charPreset = 'ascii-art';
      s.fillMode = 'density';
      s.edge = 45;
      s.sharpen = 45;
      s.contrast = 55;
      s.saturation = -100;
      s.threshold = 10;
      s.photoColors = false;
      s.textColor = '#0a0a0a';
      s.animEnable = false;
      g.bgColor = '#fdfaf2';
      g.fontFamily = 'courier';
    },
  },
  {
    id: 'neon',
    label: 'NEON',
    apply: (s, g) => {
      s.text = ' .:-=+*#%@';
      s.charPreset = 'classic';
      s.fillMode = 'density';
      s.photoColors = false;
      s.textColor = '#ff2bd6';
      s.tintColor = '#00f0ff';
      s.tintStrength = 30;
      s.contrast = 50;
      s.sharpen = 30;
      s.saturation = 0;
      s.threshold = 14;
      s.animEnable = true;
      s.animMode = 'pulse';
      s.animSpeed = 4;
      s.animIntensity = 35;
      g.bgColor = '#160033';
      g.fontFamily = 'space';
    },
  },
  {
    id: 'glitch',
    label: 'GLITCH',
    apply: (s, g) => {
      s.text = ' .:-=+*#%@';
      s.charPreset = 'classic';
      s.fillMode = 'density';
      s.photoColors = false;
      s.textColor = '#ff00d4';
      s.tintColor = '#00ffea';
      s.tintStrength = 25;
      s.contrast = 55;
      s.sharpen = 30;
      s.saturation = 0;
      s.threshold = 12;
      s.animEnable = true;
      s.animMode = 'corrupt';
      s.animSpeed = 10;
      s.animIntensity = 35;
      g.bgColor = '#080012';
      g.fontFamily = 'silkscreen';
    },
  },
  {
    id: 'crt',
    label: 'CRT',
    apply: (s, g) => {
      s.text = ' .,;:!|=+*#';
      s.charPreset = 'custom';
      s.fillMode = 'density';
      s.photoColors = false;
      s.textColor = '#33ff77';
      s.contrast = 40;
      s.sharpen = 25;
      s.saturation = -100;
      s.gamma = 1.1;
      s.threshold = 14;
      s.animEnable = true;
      s.animMode = 'scan';
      s.animSpeed = 6;
      s.animIntensity = 35;
      g.bgColor = '#001a08';
      g.fontFamily = 'vt323';
    },
  },
  {
    id: 'blueprint',
    label: 'BLUEPRINT',
    apply: (s, g) => {
      s.text = ' .-=+#';
      s.charPreset = 'edge';
      s.fillMode = 'density';
      s.edge = 55;
      s.sharpen = 35;
      s.contrast = 50;
      s.saturation = -60;
      s.threshold = 18;
      s.photoColors = false;
      s.textColor = '#cce8ff';
      s.tintColor = '#00d4ff';
      s.tintStrength = 25;
      s.animEnable = false;
      g.bgColor = '#0a2a5e';
      g.fontFamily = 'inconsolata';
    },
  },
  {
    id: 'sepia',
    label: 'SEPIA',
    apply: (s, g) => {
      s.text = ' .,;:+*#%@';
      s.charPreset = 'classic';
      s.fillMode = 'density';
      s.paletteMode = 'sepia';
      s.photoColors = true;
      s.saturation = -25;
      s.contrast = 50;
      s.sharpen = 25;
      s.brightness = -3;
      s.gamma = 0.95;
      s.threshold = 8;
      s.animEnable = false;
      g.bgColor = '#1a0e05';
      g.fontFamily = 'courier';
    },
  },
];
