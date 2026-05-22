export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const IMAGE_GAP_CHARS = 3;
export const GRID_COLS = 1;
export const GRID_ROWS = 1;
export const MAX_IMAGES = GRID_COLS * GRID_ROWS;

export const EXAMPLE_IMAGES = [
  'cat', 'desert', 'duck', 'flower', 'clownfish', 'mountain', 'saturn', 'tree', 'wave',
] as const;

export const PER_IMAGE_KEYS = [
  'text', 'charPreset', 'fillMode', 'addSpaces', 'cols',
  'brightness', 'contrast', 'saturation', 'gamma', 'invert',
  'blur', 'sharpen', 'edge', 'posterize', 'dither', 'threshold',
  'hueShift', 'tintColor', 'tintStrength', 'paletteMode',
  'duotoneEnable', 'duotoneLight', 'duotoneDark',
  'rotation', 'flipH', 'flipV',
  'photoColors', 'textColor',
  'animEnable', 'animSpeed', 'animIntensity', 'animMode',
];

export const RESET_KEYS = [
  'cols', 'addSpaces',
  'brightness', 'contrast', 'saturation', 'gamma', 'invert',
  'blur', 'sharpen', 'edge', 'posterize', 'dither', 'threshold',
  'hueShift', 'tintStrength', 'paletteMode', 'duotoneEnable',
  'rotation', 'flipH', 'flipV',
  'animSpeed', 'animIntensity',
];
