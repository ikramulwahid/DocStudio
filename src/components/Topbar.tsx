import React from 'react';
import { 
  FilePlus, 
  FolderOpen, 
  Save, 
  FileDown, 
  FileText, 
  Check, 
  SlidersHorizontal,
  PenTool,
  Eye
} from 'lucide-react';

interface TopbarProps {
  documentTitle: string;
  isDirty: boolean;
  activeMobileTab: 'metadata' | 'editor' | 'preview';
  onSelectMobileTab: (tab: 'metadata' | 'editor' | 'preview') => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
  onTitleChange: (newTitle: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  documentTitle,
  isDirty,
  activeMobileTab,
  onSelectMobileTab,
  onNew,
  onOpen,
  onSave,
  onExport,
  onTitleChange,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-30 select-none">
      {/* Left side: Brand Logo + Document Name */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 hidden sm:inline">
            DocStudio
          </span>
        </div>

        <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>

        {/* Editable Document Title */}
        <div className="flex items-center gap-2 min-w-0 max-w-xs md:max-w-md">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 truncate transition-colors border border-transparent hover:border-slate-200 focus:border-blue-500 outline-none"
            title="Click to rename document"
          />
          {isDirty ? (
            <span className="text-[11px] text-amber-600 font-medium whitespace-nowrap shrink-0 hidden md:inline">
              (Unsaved)
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0 hidden md:inline flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Middle: Responsive Mobile / Tablet Tab Switcher */}
      <div className="flex lg:hidden items-center p-0.5 bg-slate-100 rounded-lg">
        <button
          onClick={() => onSelectMobileTab('metadata')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${
            activeMobileTab === 'metadata'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Metadata & Settings"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span className="hidden sm:inline">Settings</span>
        </button>
        <button
          onClick={() => onSelectMobileTab('editor')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${
            activeMobileTab === 'editor'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Document Editor"
        >
          <PenTool className="w-3 h-3" />
          <span className="hidden sm:inline">Editor</span>
        </button>
        <button
          onClick={() => onSelectMobileTab('preview')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${
            activeMobileTab === 'preview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Live Preview"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>

      {/* Right side: Four Action Buttons (New, Open, Save, Export) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* New Button */}
        <button
          type="button"
          onClick={onNew}
          className="h-8 px-2.5 md:px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          title="Create a new document"
        >
          <FilePlus className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">New</span>
        </button>

        {/* Open Button */}
        <button
          type="button"
          onClick={onOpen}
          className="h-8 px-2.5 md:px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          title="Open document from device or saved drafts"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Open</span>
        </button>

        {/* Save Button */}
        <button
          type="button"
          onClick={onSave}
          className={`h-8 px-2.5 md:px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isDirty
              ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
          title="Save changes to browser storage"
        >
          <Save className={`w-3.5 h-3.5 ${isDirty ? 'text-blue-600' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Export Button (Primary CTA) */}
        <button
          type="button"
          onClick={onExport}
          className="h-8 px-3 md:px-3.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          title="Export as PDF, Word DOCX, HTML, Markdown or JSON"
        >
          <FileDown className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
