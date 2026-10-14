import React, { useState } from 'react';
import { SectionBreakBlock } from '../../../types/document';
import { Sliders, RefreshCw, Link2, Unlink, FileText, ChevronDown, ChevronRight, Hash } from 'lucide-react';

interface SectionBreakBlockEditorProps {
  block: SectionBreakBlock;
  onChange: (updated: Partial<SectionBreakBlock>) => void;
}

export const SectionBreakBlockEditor: React.FC<SectionBreakBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const localHeader = block.localHeader || {};
  const localFooter = block.localFooter || {};

  return (
    <div className="my-2 p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg space-y-2.5">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-600 text-white rounded">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <span>Section Break</span>
              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-100/70 px-1.5 py-0.2 rounded">
                Next Page
              </span>
            </div>
            <div className="text-[11px] text-indigo-700/80">
              {block.inheritHeader ? 'Header: Inherited' : 'Header: Custom'} ·{' '}
              {block.inheritFooter ? 'Footer: Inherited' : 'Footer: Custom'} ·{' '}
              {block.pageNumberingMode === 'restart' ? `Page numbering restarts at ${block.pageNumberRestartValue || 1}` : 'Page numbering continues'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2 py-1 rounded transition-colors"
        >
          <span>{isExpanded ? 'Hide Settings' : 'Configure Section'}</span>
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Section Configuration */}
      {isExpanded && (
        <div className="pt-2 border-t border-indigo-200/60 space-y-3 text-xs text-slate-700 animate-in fade-in duration-100">
          {/* Section Title */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Section Identifier / Title</label>
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. Chapter 2: Methodology"
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-500"
            />
          </div>

          {/* Header Inheritance & Local Settings */}
          <div className="p-2.5 bg-white border border-slate-200 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                {block.inheritHeader ? <Link2 className="w-3.5 h-3.5 text-blue-600" /> : <Unlink className="w-3.5 h-3.5 text-amber-600" />}
                <span>Running Header</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={block.inheritHeader}
                  onChange={(e) => onChange({ inheritHeader: e.target.checked })}
                  className="rounded text-indigo-600 w-3.5 h-3.5"
                />
                <span className="font-medium">Inherit from previous section</span>
              </label>
            </div>

            {!block.inheritHeader && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <input
                  type="text"
                  value={localHeader.headerLeft || ''}
                  onChange={(e) => onChange({
                    localHeader: { ...localHeader, headerLeft: e.target.value }
                  })}
                  placeholder="Section header left"
                  className="px-2 py-1 text-xs border border-slate-200 rounded outline-none"
                />
                <input
                  type="text"
                  value={localHeader.headerRight || ''}
                  onChange={(e) => onChange({
                    localHeader: { ...localHeader, headerRight: e.target.value }
                  })}
                  placeholder="Section header right"
                  className="px-2 py-1 text-xs border border-slate-200 rounded outline-none"
                />
              </div>
            )}
          </div>

          {/* Footer Inheritance & Local Settings */}
          <div className="p-2.5 bg-white border border-slate-200 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                {block.inheritFooter ? <Link2 className="w-3.5 h-3.5 text-blue-600" /> : <Unlink className="w-3.5 h-3.5 text-amber-600" />}
                <span>Running Footer</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={block.inheritFooter}
                  onChange={(e) => onChange({ inheritFooter: e.target.checked })}
                  className="rounded text-indigo-600 w-3.5 h-3.5"
                />
                <span className="font-medium">Inherit from previous section</span>
              </label>
            </div>

            {!block.inheritFooter && (
              <div className="pt-1 border-t border-slate-100">
                <input
                  type="text"
                  value={localFooter.footerText || ''}
                  onChange={(e) => onChange({
                    localFooter: { ...localFooter, footerText: e.target.value }
                  })}
                  placeholder="Section footer disclaimer / text"
                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded outline-none"
                />
              </div>
            )}
          </div>

          {/* Page Numbering Mode */}
          <div className="p-2.5 bg-white border border-slate-200 rounded-md space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              <span>Section Page Numbering</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label
                onClick={() => onChange({ pageNumberingMode: 'continue' })}
                className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                  block.pageNumberingMode === 'continue' ? 'bg-indigo-50 border-indigo-300 font-semibold text-indigo-900' : 'border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name={`numMode_${block.id}`}
                  checked={block.pageNumberingMode === 'continue'}
                  readOnly
                  className="text-indigo-600"
                />
                <span>Continue from previous</span>
              </label>

              <label
                onClick={() => onChange({ pageNumberingMode: 'restart' })}
                className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                  block.pageNumberingMode === 'restart' ? 'bg-indigo-50 border-indigo-300 font-semibold text-indigo-900' : 'border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name={`numMode_${block.id}`}
                  checked={block.pageNumberingMode === 'restart'}
                  readOnly
                  className="text-indigo-600"
                />
                <span>Restart numbering</span>
              </label>
            </div>

            {block.pageNumberingMode === 'restart' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-600 font-medium">Restart at page:</span>
                <input
                  type="number"
                  min={1}
                  value={block.pageNumberRestartValue || 1}
                  onChange={(e) => onChange({ pageNumberRestartValue: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="w-20 px-2 py-1 text-xs border border-slate-200 rounded outline-none font-mono"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
