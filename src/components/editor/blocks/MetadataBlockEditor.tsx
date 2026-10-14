import React, { useState } from 'react';
import { MetadataBlock, DocumentMetadata } from '../../../types/document';
import { FileBadge, Settings, Check, LayoutGrid, List } from 'lucide-react';

interface MetadataBlockEditorProps {
  block: MetadataBlock;
  metadata: DocumentMetadata;
  onChange: (updated: Partial<MetadataBlock>) => void;
}

export const MetadataBlockEditor: React.FC<MetadataBlockEditorProps> = ({
  block,
  metadata,
  onChange,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const availableFields: Array<{ id: any; label: string; value: string }> = [
    { id: 'title', label: 'Document Title', value: metadata.title },
    { id: 'subtitle', label: 'Subtitle', value: metadata.subtitle },
    { id: 'author', label: 'Author', value: metadata.author },
    { id: 'organization', label: 'Organization', value: metadata.organization },
    { id: 'referenceId', label: 'Reference ID', value: metadata.referenceId },
    { id: 'createdAt', label: 'Creation Date', value: metadata.createdAt },
    { id: 'updatedAt', label: 'Last Modified', value: metadata.updatedAt },
    { id: 'status', label: 'Document Status', value: metadata.status },
  ];

  const toggleField = (fieldId: any) => {
    const current = block.visibleFields || [];
    if (current.includes(fieldId)) {
      onChange({ visibleFields: current.filter((f) => f !== fieldId) });
    } else {
      onChange({ visibleFields: [...current, fieldId] });
    }
  };

  return (
    <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2.5">
      {/* Header bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <FileBadge className="w-3.5 h-3.5 text-blue-600" />
          <span>Document Metadata Summary</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout mode */}
          <select
            value={block.layout}
            onChange={(e) => onChange({ layout: e.target.value as any })}
            className="px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded outline-none"
          >
            <option value="grid">Grid Layout</option>
            <option value="cards">Card Style</option>
            <option value="compact">Compact Strip</option>
          </select>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
            title="Configure visible fields"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Field selection popup drawer if opened */}
      {showConfig && (
        <div className="p-2.5 bg-white border border-slate-200 rounded-md text-xs space-y-1.5 shadow-xs animate-in fade-in duration-100">
          <div className="font-semibold text-slate-700 mb-1">Choose Visible Fields:</div>
          <div className="grid grid-cols-2 gap-1.5">
            {availableFields.map((f) => {
              const isChecked = (block.visibleFields || []).includes(f.id);
              return (
                <label
                  key={f.id}
                  onClick={() => toggleField(f.id)}
                  className="flex items-center gap-2 text-slate-700 cursor-pointer p-1 hover:bg-slate-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="rounded text-blue-600 w-3 h-3"
                  />
                  <span>{f.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Rendered live metadata block */}
      <div
        className={
          block.layout === 'cards'
            ? 'grid grid-cols-2 sm:grid-cols-3 gap-2'
            : block.layout === 'compact'
            ? 'flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600'
            : 'grid grid-cols-2 gap-2 text-xs'
        }
      >
        {availableFields
          .filter((f) => (block.visibleFields || []).includes(f.id) && f.value)
          .map((f) => (
            <div
              key={f.id}
              className={
                block.layout === 'cards'
                  ? 'p-2 bg-white rounded border border-slate-200 shadow-2xs'
                  : block.layout === 'compact'
                  ? 'flex items-center gap-1.5'
                  : 'flex items-baseline justify-between py-1 border-b border-slate-100'
              }
            >
              {block.showLabels && (
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  {f.label}:
                </span>
              )}
              <span className="text-xs font-semibold text-slate-800 break-words">
                {f.id === 'status' ? (
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-bold uppercase">
                    {f.value}
                  </span>
                ) : (
                  f.value
                )}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};
