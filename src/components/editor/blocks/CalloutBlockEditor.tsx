import React from 'react';
import { CalloutBlock } from '../../../types/document';
import { Info, AlertTriangle, CheckCircle, Bookmark } from 'lucide-react';

interface CalloutBlockEditorProps {
  block: CalloutBlock;
  onChange: (updated: Partial<CalloutBlock>) => void;
}

export const CalloutBlockEditor: React.FC<CalloutBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const styles = {
    info: {
      border: 'border-blue-200 bg-blue-50/50',
      icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
      titleColor: 'text-blue-900',
    },
    warning: {
      border: 'border-amber-200 bg-amber-50/50',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
      titleColor: 'text-amber-900',
    },
    success: {
      border: 'border-emerald-200 bg-emerald-50/50',
      icon: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
      titleColor: 'text-emerald-900',
    },
    note: {
      border: 'border-slate-200 bg-slate-50/50',
      icon: <Bookmark className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />,
      titleColor: 'text-slate-900',
    },
  };

  const current = styles[block.calloutType || 'info'];

  return (
    <div className={`p-3.5 rounded-lg border ${current.border} space-y-1.5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {current.icon}
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Callout title..."
            className={`font-semibold text-xs bg-transparent outline-none flex-1 ${current.titleColor}`}
          />
        </div>

        {/* Type selector */}
        <select
          value={block.calloutType}
          onChange={(e) => onChange({ calloutType: e.target.value as any })}
          className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 outline-none uppercase font-semibold"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="success">Success</option>
          <option value="note">Note</option>
        </select>
      </div>

      <textarea
        rows={2}
        value={block.text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Enter callout description..."
        className="w-full bg-transparent text-xs text-slate-700 outline-none resize-none leading-relaxed"
      />
    </div>
  );
};
