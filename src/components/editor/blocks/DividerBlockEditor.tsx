import React from 'react';
import { DividerBlock } from '../../../types/document';
import { Minus, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface DividerBlockEditorProps {
  block: DividerBlock;
  onChange: (updated: Partial<DividerBlock>) => void;
}

export const DividerBlockEditor: React.FC<DividerBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const alignClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  return (
    <div className="py-2 space-y-2 group/divider">
      {/* Quick controls bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <Minus className="w-3.5 h-3.5 text-blue-600" />
          <span>Horizontal Divider</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Style */}
          <select
            value={block.style}
            onChange={(e) => onChange({ style: e.target.value as any })}
            className="px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded outline-none"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>

          {/* Width */}
          <select
            value={block.widthPercent}
            onChange={(e) => onChange({ widthPercent: Number(e.target.value) })}
            className="px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded outline-none"
          >
            <option value={100}>100%</option>
            <option value={75}>75%</option>
            <option value={50}>50%</option>
            <option value={25}>25%</option>
          </select>

          {/* Thickness */}
          <select
            value={block.thickness}
            onChange={(e) => onChange({ thickness: Number(e.target.value) })}
            className="px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded outline-none"
          >
            <option value={1}>1px</option>
            <option value={2}>2px</option>
            <option value={3}>3px</option>
            <option value={4}>4px</option>
          </select>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5">
            <button
              type="button"
              onClick={() => onChange({ align: 'left' })}
              className={`p-1 rounded ${block.align === 'left' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <AlignLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'center' })}
              className={`p-1 rounded ${block.align === 'center' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <AlignCenter className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'right' })}
              className={`p-1 rounded ${block.align === 'right' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <AlignRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Rendered line */}
      <div className="py-2">
        <hr
          style={{
            border: 'none',
            borderTop: `${block.thickness}px ${block.style} ${block.color || '#CBD5E1'}`,
            width: `${block.widthPercent}%`,
          }}
          className={`${alignClasses[block.align || 'center']} my-1 transition-all`}
        />
      </div>
    </div>
  );
};
