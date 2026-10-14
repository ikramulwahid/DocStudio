import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FolderOpen, Trash2, Clock, Search, AlertCircle, FileCheck } from 'lucide-react';
import { listLibraryDocuments, getLibraryDocument, deleteFromLibrary } from '../../services/documentStore';
import { parseHtmlToBlocks } from '../../services/blockUtils';
import { DocumentData } from '../../types/document';

interface OpenDocumentModalProps {
  isOpen: boolean;
  hasUnsavedChanges: boolean;
  onClose: () => void;
  onSelectDocument: (doc: DocumentData) => void;
  onImportFromFile: (doc: DocumentData) => void;
}

export const OpenDocumentModal: React.FC<OpenDocumentModalProps> = ({
  isOpen,
  hasUnsavedChanges,
  onClose,
  onSelectDocument,
  onImportFromFile,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'upload'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedDocs, setSavedDocs] = useState<Array<{ id: string; title: string; updatedAt: string; status: string; author: string }>>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSavedDocs(listLibraryDocuments());
      setUploadError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredDocs = savedDocs.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSaved = (id: string) => {
    const doc = getLibraryDocument(id);
    if (doc) {
      onSelectDocument(doc);
      onClose();
    }
  };

  const handleDeleteSaved = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteFromLibrary(id);
    setSavedDocs(listLibraryDocuments());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.metadata) {
            let documentBlocks = parsed.blocks;
            if (!Array.isArray(documentBlocks) && parsed.contentHtml) {
              documentBlocks = parseHtmlToBlocks(parsed.contentHtml);
            }
            if (Array.isArray(documentBlocks)) {
              onImportFromFile({
                schemaVersion: 2,
                id: parsed.id || 'doc_' + Date.now(),
                metadata: parsed.metadata,
                settings: parsed.settings || {
                  template: 'blank',
                  pageSize: 'a4',
                  orientation: 'portrait',
                  margins: 'normal',
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: '11pt',
                  lineHeight: '1.5',
                  showHeader: false,
                  headerLeft: '',
                  headerRight: '',
                  showFooter: false,
                  footerText: '',
                  pageNumbering: 'none',
                  showTitleBanner: true,
                  showWatermark: false,
                  watermarkText: '',
                  showTableBorders: true,
                  headingNumberingScheme: '1.1',
                },
                blocks: documentBlocks,
              });
              onClose();
              return;
            }
          }
          setUploadError('Invalid DocStudio JSON structure.');
        } catch {
          setUploadError('Unable to parse JSON file.');
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newDoc: DocumentData = {
          schemaVersion: 2,
          id: 'doc_' + Date.now(),
          metadata: {
            title: file.name.replace(/\.[^/.]+$/, ''),
            subtitle: 'Imported HTML file',
            author: 'Imported',
            organization: '',
            referenceId: `IMP-${Date.now().toString().slice(-4)}`,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            status: 'Draft',
          },
          settings: {
            template: 'blank',
            pageSize: 'a4',
            orientation: 'portrait',
            margins: 'normal',
            fontFamily: 'Plus Jakarta Sans',
            fontSize: '11pt',
            lineHeight: '1.5',
            showHeader: true,
            headerLeft: '',
            headerRight: '',
            showFooter: true,
            footerText: '',
            pageNumbering: 'Page X of Y',
            showTitleBanner: true,
            showWatermark: false,
            watermarkText: 'DRAFT',
            showTableBorders: true,
            headingNumberingScheme: '1.1',
          },
          blocks: parseHtmlToBlocks(content),
        };
        onImportFromFile(newDoc);
        onClose();
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const paragraphs = text
          .split('\n\n')
          .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
          .join('');

        const newDoc: DocumentData = {
          schemaVersion: 2,
          id: 'doc_' + Date.now(),
          metadata: {
            title: file.name.replace(/\.[^/.]+$/, ''),
            subtitle: 'Imported text file',
            author: 'Imported',
            organization: '',
            referenceId: `IMP-${Date.now().toString().slice(-4)}`,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            status: 'Draft',
          },
          settings: {
            template: 'blank',
            pageSize: 'a4',
            orientation: 'portrait',
            margins: 'normal',
            fontFamily: 'Plus Jakarta Sans',
            fontSize: '11pt',
            lineHeight: '1.5',
            showHeader: false,
            headerLeft: '',
            headerRight: '',
            showFooter: false,
            footerText: '',
            pageNumbering: 'none',
            showTitleBanner: true,
            showWatermark: false,
            watermarkText: '',
            showTableBorders: true,
            headingNumberingScheme: '1.1',
          },
          blocks: parseHtmlToBlocks(paragraphs || '<p></p>'),
        };
        onImportFromFile(newDoc);
        onClose();
      };
      reader.readAsText(file);
    } else {
      setUploadError('Unsupported file type. Please upload .json, .html, .md, or .txt.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Open Document</h3>
            <p className="text-xs text-slate-500 mt-0.5">Resume a saved document or import from your computer</p>
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
              <span className="font-semibold">Notice:</span> You have unsaved changes in your current workspace. Opening another document will replace it.
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-5 pt-3 gap-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Saved Drafts ({savedDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import from Computer
          </button>
        </div>

        <div className="p-5 max-h-[55vh] overflow-y-auto">
          {activeTab === 'saved' ? (
            <div className="space-y-3">
              {savedDocs.length > 0 && (
                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved documents..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {filteredDocs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No saved documents found</p>
                  <p className="text-[11px] text-slate-400 mt-1">Saved documents will appear here automatically</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectSaved(doc.id)}
                      className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                          {doc.title}
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {doc.updatedAt}
                          </span>
                          <span>·</span>
                          <span>{doc.author || 'Author N/A'}</span>
                          <span>·</span>
                          <span className="text-slate-600 font-medium">{doc.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSaved(e, doc.id)}
                          title="Delete draft"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.html,.htm,.md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Click to select file from your computer
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Supports DocStudio JSON (.json), HTML (.html), Markdown (.md), and plain text (.txt)
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-blue-600">
                  <FileCheck className="w-4 h-4" />
                  Browse files
                </div>
              </div>

              {uploadError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {uploadError}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
