import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  RotateCcw,
  Eye,
  FileCheck
} from 'lucide-react';

interface PreviewToolbarProps {
  zoom: number;
  currentPage: number;
  totalPages: number;
  hasCoverPage?: boolean;
  showGuides: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitWidth: () => void;
  onFitPage: () => void;
  onToggleGuides: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPrint: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  zoom,
  currentPage,
  totalPages,
  hasCoverPage = false,
  showGuides,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitWidth,
  onFitPage,
  onToggleGuides,
  onPrevPage,
  onNextPage,
  onPrint,
}) => {
  const minPage = hasCoverPage ? 0 : 1;

  return (
    <div className="h-10 border-b border-slate-200 bg-white px-3 flex items-center justify-between shrink-0 select-none text-xs">
      {/* Left side: Preview title & page indicator */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Live Preview</span>
        </div>

        <span className="text-slate-300">|</span>

        {/* Multi-page navigation */}
        <div className="flex items-center gap-1 text-[11px] text-slate-600">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= minPage}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="font-mono px-1 font-medium">
            {currentPage === 0 && hasCoverPage ? (
              <span className="text-blue-600 font-semibold">Cover Page</span>
            ) : (
              `Page ${currentPage} of ${Math.max(1, totalPages)}`
            )}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right side: Zoom, Fit, Guides, Quick Print */}
      <div className="flex items-center gap-1 text-slate-600">
        {/* Toggle Margin & Boundary Guides */}
        <button
          type="button"
          onClick={onToggleGuides}
          title={showGuides ? 'Hide layout guides' : 'Show layout margin guides'}
          className={`p-1.5 rounded transition-colors ${
            showGuides ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        <span className="text-slate-200 mx-0.5">|</span>

        {/* Fit width & fit page */}
        <button
          type="button"
          onClick={onFitWidth}
          title="Fit to Width"
          className="px-2 py-1 text-[11px] font-medium rounded hover:bg-slate-100 text-slate-700 transition-colors hidden sm:inline"
        >
          Fit Width
        </button>
        <button
          type="button"
          onClick={onFitPage}
          title="Fit to Page"
          className="px-2 py-1 text-[11px] font-medium rounded hover:bg-slate-100 text-slate-700 transition-colors hidden sm:inline"
        >
          Fit Page
        </button>

        <span className="text-slate-200 mx-0.5 hidden sm:inline">|</span>

        {/* Zoom controls */}
        <button
          type="button"
          onClick={onZoomOut}
          disabled={zoom <= 35}
          title="Zoom Out (-)"
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onResetZoom}
          title="Reset Zoom (100%)"
          className="px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-700 hover:bg-slate-100 font-medium min-w-10 text-center"
        >
          {zoom}%
        </button>

        <button
          type="button"
          onClick={onZoomIn}
          disabled={zoom >= 200}
          title="Zoom In (+)"
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <span className="text-slate-200 mx-0.5">|</span>

        {/* Direct print shortcut */}
        <button
          type="button"
          onClick={onPrint}
          title="Print document or Save as PDF"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-blue-600 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
