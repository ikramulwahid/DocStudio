import React from 'react';
import { HeadingBlock } from '../../../types/document';
import { Hash, AlignLeft, AlignCenter, AlignRight, ListOrdered } from 'lucide-react';
import { getDefaultBlockSpacing } from '../../../services/blockUtils';

interface HeadingBlockEditorProps {
  block: HeadingBlock;
  calculatedNumber?: string;
  onChange: (updated: Partial<HeadingBlock>) => void;
}

export const HeadingBlockEditor: React.FC<HeadingBlockEditorProps> = ({
  block,
  calculatedNumber,
  onChange,
}) => {
  const fontSizes = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-semibold',
    3: 'text-lg font-semibold',
    4: 'text-base font-semibold',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const handleLevelChange = (newLevel: 1 | 2 | 3 | 4) => {
    onChange({ 
      level: newLevel,
      // If user hasn't explicitly customized spacing, adapt to level default
      spacing: block.spacing || getDefaultBlockSpacing('heading', newLevel)
    });
  };

  return (
    <div 
      className="space-y-1 group/heading"
      style={{
        marginTop: `${block.spacing?.top ?? 20}px`,
        marginBottom: `${block.spacing?.bottom ?? 6}px`,
      }}
    >
      {/* Quick Level Selector Bar on focus/hover */}
      <div className="flex items-center gap-1 opacity-60 group-hover/heading:opacity-100 transition-opacity pb-0.5">
        <div className="flex items-center p-0.5 bg-slate-100 rounded text-[10px] font-bold">
          {([1, 2, 3, 4] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => handleLevelChange(lvl)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                block.level === lvl
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              H{lvl}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onChange({ mode: block.mode === 'numbered' ? 'plain' : 'numbered' })}
          className={`px-1.5 py-0.5 text-[10px] rounded font-semibold transition-colors ${
            block.mode === 'numbered'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {block.mode === 'numbered' ? '# Numbered' : 'Plain'}
        </button>
      </div>

      <div className={`flex items-baseline gap-2 ${alignClasses[block.align || 'left']}`}>
        {/* Dynamic Number Badge */}
        {block.mode === 'numbered' && calculatedNumber && (
          <span className="font-mono text-blue-600 font-bold select-none shrink-0 text-sm bg-blue-50/80 px-1.5 py-0.5 rounded">
            {calculatedNumber}
          </span>
        )}

        {/* Heading Input */}
        <input
          type="text"
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder={`Heading ${block.level}...`}
          className={`w-full bg-transparent outline-none text-slate-900 tracking-tight transition-colors focus:bg-slate-50/50 rounded px-1 -mx-1 ${
            fontSizes[block.level]
          }`}
        />
      </div>
    </div>
  );
};
