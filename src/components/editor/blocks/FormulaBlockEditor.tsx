import React, { useMemo } from 'react';
import { FormulaBlock } from '../../../types/document';
import katex from 'katex';
import { Code, Hash, Eye } from 'lucide-react';

interface FormulaBlockEditorProps {
  block: FormulaBlock;
  onChange: (updated: Partial<FormulaBlock>) => void;
}

export const FormulaBlockEditor: React.FC<FormulaBlockEditorProps> = ({
  block,
  onChange,
}) => {
  // Safe KaTeX rendering
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(block.latex || 'E = mc^2', {
        displayMode: block.displayMode,
        throwOnError: false,
      });
    } catch (err: any) {
      return `<span class="text-rose-600 text-xs font-mono">LaTeX Error: ${err.message}</span>`;
    }
  }, [block.latex, block.displayMode]);

  return (
    <div className="space-y-2 p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
      {/* Formula Settings bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1.5 border-b border-slate-200/80">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Code className="w-3.5 h-3.5 text-blue-600" />
          <span>LaTeX Formula Block</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={block.displayMode}
              onChange={(e) => onChange({ displayMode: e.target.checked })}
              className="rounded text-blue-600 w-3 h-3"
            />
            <span>Display Mode</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={block.showNumber}
              onChange={(e) => onChange({ showNumber: e.target.checked })}
              className="rounded text-blue-600 w-3 h-3"
            />
            <span>Number:</span>
          </label>
          {block.showNumber && (
            <input
              type="text"
              value={block.equationNumber || ''}
              onChange={(e) => onChange({ equationNumber: e.target.value })}
              placeholder="(1.1)"
              className="w-16 px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded font-mono text-center outline-none"
            />
          )}
        </div>
      </div>

      {/* LaTeX Source Code Input */}
      <div>
        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
          LaTeX Source
        </label>
        <textarea
          rows={2}
          value={block.latex}
          onChange={(e) => onChange({ latex: e.target.value })}
          placeholder="e.g. \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}"
          className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
        />
      </div>

      {/* Live Rendered Math Output */}
      <div className="pt-1">
        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
          <Eye className="w-3 h-3" />
          <span>Rendered Mathematics Preview</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-md flex items-center justify-between overflow-x-auto min-h-[50px]">
          <div
            className="flex-1 text-center py-1 overflow-x-auto text-slate-900"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
          {block.showNumber && block.equationNumber && (
            <span className="font-mono text-xs text-slate-500 select-none ml-4 shrink-0 font-medium">
              {block.equationNumber}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
