import React, { useState } from 'react';
import { X, FileText, Check, AlertCircle } from 'lucide-react';
import { TEMPLATES } from '../../services/documentStore';

interface NewDocumentModalProps {
  isOpen: boolean;
  hasUnsavedChanges: boolean;
  onClose: () => void;
  onCreate: (templateKey: string) => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  hasUnsavedChanges,
  onClose,
  onCreate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('executive');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Create New Document</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select a pre-formatted structure or start with a clean slate</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasUnsavedChanges && (
          <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Notice:</span> You have unsaved changes in your current document. Creating a new document will replace the active workspace.
            </div>
          </div>
        )}

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto">
          {Object.entries(TEMPLATES).map(([key, tpl]) => {
            const isSelected = selectedTemplate === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`cursor-pointer text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-900">{tpl.name}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{tpl.description}</div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onCreate(selectedTemplate);
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
          >
            Create Document
          </button>
        </div>
      </div>
    </div>
  );
};
