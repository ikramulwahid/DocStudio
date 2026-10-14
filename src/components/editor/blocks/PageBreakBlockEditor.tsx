import React from 'react';
import { PageBreakBlock } from '../../../types/document';
import { Scissors, FileText } from 'lucide-react';

interface PageBreakBlockEditorProps {
  block: PageBreakBlock;
  onChange: (updated: Partial<PageBreakBlock>) => void;
}

export const PageBreakBlockEditor: React.FC<PageBreakBlockEditorProps> = ({
  block,
  onChange,
}) => {
  return (
    <div className="py-2.5 my-1">
      <div className="relative flex items-center justify-center">
        {/* Dashed line */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-blue-300" />
        </div>

        {/* Badge in center */}
        <div className="relative bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 select-none">
          <Scissors className="w-3.5 h-3.5" />
          <span>{block.label || 'Page Break'}</span>
        </div>
      </div>
    </div>
  );
};
