import ImagePanel from './panels/ImagePanel';
import PresetsPanel from './panels/PresetsPanel';
import TextPanel from './panels/TextPanel';
import FillModePanel from './panels/FillModePanel';
import DensityPanel from './panels/DensityPanel';
import ResolutionPanel from './panels/ResolutionPanel';
import FrameProcessingPanel from './panels/FrameProcessingPanel';
import ColorPanel from './panels/ColorPanel';
import AnimatePanel from './panels/AnimatePanel';
import ExportPanel from './panels/ExportPanel';

export default function Sidebar() {
  return (
    <aside className="sidebar" id="sidebar">
      <div className="brand">
        <h1>ASCII TOOL</h1>
        <button type="button" className="sidebar-toggle" id="sidebarToggle" aria-label="Toggle controls">≡</button>
      </div>
      <ImagePanel />
      <PresetsPanel />
      <TextPanel />
      <FillModePanel />
      <DensityPanel />
      <ResolutionPanel />
      <FrameProcessingPanel />
      <ColorPanel />
      <AnimatePanel />
      <ExportPanel />
    </aside>
  );
}
