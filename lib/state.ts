import { defaultImageSettings } from './defaults';
import type { AppState, ImageSettings, ImageEntry } from './types';

export function createState(): AppState {
  return {
    fontSize: 8,
    fontFamily: 'courier',
    lineHeight: 0.75,
    charSpace: 0,
    aspect: 1,
    transparentBG: false,
    bgColor: '#ffffff',
    bgMode: 'color',
    bgGradient1: '#ffffff',
    bgGradient2: '#dddddd',
    bgGradientAngle: 180,
    bgImage: null,
    exportScale: 2,
    draft: defaultImageSettings(),
    images: [],
    selectedImage: 0,
    focusedImage: null,
    compareMode: false,
  };
}

export function activeSettings(state: AppState): ImageSettings {
  return state.images.length > 0 ? state.images[state.selectedImage].settings : state.draft;
}

export function viewImages(state: AppState): { entry: ImageEntry; index: number }[] {
  if (state.focusedImage != null && state.images[state.focusedImage]) {
    return [{ entry: state.images[state.focusedImage], index: state.focusedImage }];
  }
  if (state.images.length > 0) {
    return state.images.map((entry, index) => ({ entry, index }));
  }
  return [{
    entry: {
      img: null,
      video: null,
      stream: null,
      sourceKind: 'image',
      settings: state.draft,
      filename: '',
    },
    index: 0,
  }];
}

export function anyAnimating(state: AppState): boolean {
  return viewImages(state).some(({ entry }) => entry.settings.animEnable);
}

export function hasLiveSource(state: AppState): boolean {
  return state.images.some((e) => e.sourceKind !== 'image');
}
