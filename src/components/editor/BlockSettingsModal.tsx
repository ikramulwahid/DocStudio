import React from 'react';
import { DocumentBlock, HeadingBlock, ListBlock, TableBlock, DividerBlock, FormulaBlock, SignatureBlock, MetadataBlock } from '../../types/document';
import { X, SlidersHorizontal, Hash, List, Table as TableIcon, Minus, Code, PenTool, FileBadge } from 'lucide-react';

interface BlockSettingsModalProps {
  block: DocumentBlock | null;
  onClose: () => void;
  onUpdateBlock: (updated: Partial<DocumentBlock>) => void;
}

export const BlockSettingsModal: React.FC<BlockSettingsModalProps> = ({
  block,
  onClose,
  onUpdateBlock,
}) => {
  if (!block) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-100">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              {block.type} Block Configuration
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs">
          {/* HEADING SETTINGS */}
          {block.type === 'heading' && (() => {
            const h = block as HeadingBlock;
            return (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Heading Level</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => onUpdateBlock({ level: lvl as any })}
                        className={`py-1 rounded font-bold transition-colors ${
                          h.level === lvl ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        H{lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Numbering Mode</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateBlock({ mode: 'numbered' })}
                      className={`py-1 px-2 rounded font-medium ${
                        h.mode === 'numbered' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Numbered
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateBlock({ mode: 'plain' })}
                      className={`py-1 px-2 rounded font-medium ${
                        h.mode === 'plain' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Plain
                    </button>
                  </div>
                </div>

                {h.mode === 'numbered' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Numbering Scheme</label>
                    <select
                      value={h.numberingScheme || '1.1'}
                      onChange={(e) => onUpdateBlock({ numberingScheme: e.target.value as any })}
                      className="w-full px-2 py-1 border border-slate-200 rounded outline-none bg-white"
                    >
                      <option value="1.1">Hierarchical (1., 1.1, 1.2.1)</option>
                      <option value="1">Decimal (1., 2., 3.)</option>
                      <option value="A">Alphabetic (A., B., C.)</option>
                      <option value="I">Uppercase Roman (I., II., III.)</option>
                      <option value="i">Lowercase Roman (i., ii., iii.)</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-600 font-medium">Keep with Next Content</span>
                  <input
                    type="checkbox"
                    checked={h.keepWithNext ?? true}
                    onChange={(e) => onUpdateBlock({ keepWithNext: e.target.checked })}
                    className="rounded text-blue-600 w-3.5 h-3.5"
                  />
                </div>
              </>
            );
          })()}

          {/* LIST SETTINGS */}
          {block.type === 'list' && (() => {
            const l = block as ListBlock;
            return (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">List Type</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateBlock({ listType: 'bullet' })}
                      className={`py-1 px-2 rounded font-medium ${
                        l.listType === 'bullet' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Bulleted
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateBlock({ listType: 'numbered' })}
                      className={`py-1 px-2 rounded font-medium ${
                        l.listType === 'numbered' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Numbered
                    </button>
                  </div>
                </div>

                {l.listType === 'bullet' ? (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Bullet Marker Style</label>
                    <select
                      value={l.bulletMarker || 'disc'}
                      onChange={(e) => onUpdateBlock({ bulletMarker: e.target.value as any })}
                      className="w-full px-2 py-1 border border-slate-200 rounded outline-none bg-white"
                    >
                      <option value="disc">• Filled Circle (Disc)</option>
                      <option value="circle">○ Hollow Circle</option>
                      <option value="square">■ Square</option>
                      <option value="dash">— Em-dash</option>
                      <option value="arrow">→ Arrow</option>
                      <option value="dot">· Dot</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Numbering Format</label>
                      <select
                        value={l.numberedStyle || 'decimal'}
                        onChange={(e) => onUpdateBlock({ numberedStyle: e.target.value as any })}
                        className="w-full px-2 py-1 border border-slate-200 rounded outline-none bg-white"
                      >
                        <option value="decimal">Decimal (1, 2, 3)</option>
                        <option value="lower-alpha">Lowercase Letters (a, b, c)</option>
                        <option value="upper-alpha">Uppercase Letters (A, B, C)</option>
                        <option value="lower-roman">Lowercase Roman (i, ii, iii)</option>
                        <option value="upper-roman">Uppercase Roman (I, II, III)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Starting Number</label>
                      <input
                        type="number"
                        min={1}
                        value={l.startNumber || 1}
                        onChange={(e) => onUpdateBlock({ startNumber: Number(e.target.value) || 1 })}
                        className="w-full px-2 py-1 border border-slate-200 rounded outline-none bg-white"
                      />
                    </div>
                  </>
                )}
              </>
            );
          })()}

          {/* DIVIDER SETTINGS */}
          {block.type === 'divider' && (() => {
            const d = block as DividerBlock;
            return (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Rule Style</label>
                  <select
                    value={d.style}
                    onChange={(e) => onUpdateBlock({ style: e.target.value as any })}
                    className="w-full px-2 py-1 border border-slate-200 rounded outline-none bg-white"
                  >
                    <option value="solid">Solid Line</option>
                    <option value="dashed">Dashed Line</option>
                    <option value="dotted">Dotted Line</option>
                    <option value="double">Double Line</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Width %</label>
                    <select
                      value={d.widthPercent}
                      onChange={(e) => onUpdateBlock({ widthPercent: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-200 rounded outline-none bg-white"
                    >
                      <option value={100}>100%</option>
                      <option value={75}>75%</option>
                      <option value={50}>50%</option>
                      <option value={25}>25%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Thickness</label>
                    <select
                      value={d.thickness}
                      onChange={(e) => onUpdateBlock({ thickness: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-200 rounded outline-none bg-white"
                    >
                      <option value={1}>1 px</option>
                      <option value={2}>2 px</option>
                      <option value={3}>3 px</option>
                      <option value={4}>4 px</option>
                    </select>
                  </div>
                </div>
              </>
            );
          })()}

          {/* FORMULA SETTINGS */}
          {block.type === 'formula' && (() => {
            const f = block as FormulaBlock;
            return (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Display Mode (Centered)</span>
                  <input
                    type="checkbox"
                    checked={f.displayMode}
                    onChange={(e) => onUpdateBlock({ displayMode: e.target.checked })}
                    className="rounded text-blue-600 w-3.5 h-3.5"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Show Equation Number</span>
                  <input
                    type="checkbox"
                    checked={f.showNumber}
                    onChange={(e) => onUpdateBlock({ showNumber: e.target.checked })}
                    className="rounded text-blue-600 w-3.5 h-3.5"
                  />
                </div>
              </>
            );
          })()}

          {/* TABLE SETTINGS */}
          {block.type === 'table' && (() => {
            const t = block as TableBlock;
            return (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Header Row</span>
                  <input
                    type="checkbox"
                    checked={t.hasHeader}
                    onChange={(e) => onUpdateBlock({ hasHeader: e.target.checked })}
                    className="rounded text-blue-600 w-3.5 h-3.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Cell Padding</label>
                  <select
                    value={t.cellPadding || 'normal'}
                    onChange={(e) => onUpdateBlock({ cellPadding: e.target.value as any })}
                    className="w-full px-2 py-1 border border-slate-200 rounded outline-none bg-white"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
              </>
            );
          })()}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
