import React, { useRef } from 'react';
import { ImageBlock } from '../../../types/document';
import { Image as ImageIcon, Upload, Link, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ImageBlockEditorProps {
  block: ImageBlock;
  onChange: (updated: Partial<ImageBlock>) => void;
}

export const ImageBlockEditor: React.FC<ImageBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ url: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const alignClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  return (
    <div className="space-y-2 p-2 border border-slate-200 rounded-lg bg-slate-50/50">
      <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1.5 border-b border-slate-200">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Image Block</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onChange({ align: 'left' })}
              className={`p-1 rounded ${block.align === 'left' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-500'}`}
            >
              <AlignLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'center' })}
              className={`p-1 rounded ${block.align === 'center' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-500'}`}
            >
              <AlignCenter className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'right' })}
              className={`p-1 rounded ${block.align === 'right' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-500'}`}
            >
              <AlignRight className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            <Upload className="w-3 h-3" /> Replace
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Image Preview & Caption */}
      <div className={`space-y-1.5 ${alignClasses[block.align || 'center']}`} style={{ maxWidth: `${block.widthPercent || 100}%` }}>
        <div className="rounded-md overflow-hidden border border-slate-200 bg-white">
          <img
            src={block.url}
            alt={block.caption || 'Document asset'}
            className="w-full max-h-80 object-contain mx-auto"
          />
        </div>
        <input
          type="text"
          value={block.caption || ''}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Add image caption..."
          className="w-full text-center text-[11px] text-slate-500 italic bg-transparent outline-none focus:bg-white rounded py-0.5"
        />
      </div>
    </div>
  );
};
