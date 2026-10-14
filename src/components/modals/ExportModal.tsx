import React, { useState } from 'react';
import { X, FileDown, Printer, FileText, Code, FileSpreadsheet, Check, Download } from 'lucide-react';
import { DocumentData } from '../../types/document';
import { printDocumentAsPdf, exportToDirectPdf, exportToDocx, exportToHtml, exportToMarkdown, exportToJson } from '../../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  docData: DocumentData;
  previewElement: HTMLElement | null;
  onClose: () => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  docData,
  previewElement,
  onClose,
  onNotify,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf-print' | 'pdf-direct' | 'docx' | 'html' | 'md' | 'json'>('pdf-print');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (selectedFormat === 'pdf-print') {
        printDocumentAsPdf();
        onNotify('success', 'Print / PDF Dialog Launched', 'Save as PDF using your browser dialog.');
      } else if (selectedFormat === 'pdf-direct') {
        if (!previewElement) {
          throw new Error('Preview element not accessible for rendering');
        }
        await exportToDirectPdf(previewElement, docData);
        onNotify('success', 'PDF Downloaded', `${docData.metadata.title}.pdf was downloaded.`);
      } else if (selectedFormat === 'docx') {
        await exportToDocx(docData);
        onNotify('success', 'Word DOCX Downloaded', `${docData.metadata.title}.docx was saved.`);
      } else if (selectedFormat === 'html') {
        exportToHtml(docData);
        onNotify('success', 'HTML Exported', 'Clean standalone HTML file generated.');
      } else if (selectedFormat === 'md') {
        exportToMarkdown(docData);
        onNotify('success', 'Markdown Exported', 'Clean Markdown file generated.');
      } else if (selectedFormat === 'json') {
        exportToJson(docData);
        onNotify('success', 'Project Backup Saved', 'JSON backup file generated.');
      }
      onClose();
    } catch (err: any) {
      console.error('Export failed:', err);
      onNotify('error', 'Export Failed', err.message || 'An error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    {
      id: 'pdf-print' as const,
      title: 'Print / Vector PDF (Recommended)',
      desc: '100% crisp vector typography, exact page breaks, and selectable text via print engine.',
      icon: <Printer className="w-5 h-5 text-blue-600" />,
      badge: 'Best Quality',
    },
    {
      id: 'pdf-direct' as const,
      title: 'Direct PDF File Download',
      desc: 'Instantly download a standalone .pdf file directly to your downloads folder.',
      icon: <FileDown className="w-5 h-5 text-indigo-600" />,
      badge: 'Direct File',
    },
    {
      id: 'docx' as const,
      title: 'Microsoft Word Document (.docx)',
      desc: 'Fully formatted Word document with tables, headings, styles, and metadata.',
      icon: <FileSpreadsheet className="w-5 h-5 text-sky-600" />,
      badge: 'Editable Word',
    },
    {
      id: 'html' as const,
      title: 'Standalone HTML (.html)',
      desc: 'Self-contained webpage with embedded styling for sharing or offline viewing.',
      icon: <Code className="w-5 h-5 text-emerald-600" />,
      badge: 'Web Ready',
    },
    {
      id: 'md' as const,
      title: 'Markdown Document (.md)',
      desc: 'Clean markdown text syntax for GitHub, documentation, or note-taking systems.',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      badge: 'Plain Text',
    },
    {
      id: 'json' as const,
      title: 'DocStudio Project Backup (.json)',
      desc: 'Full document state backup that can be reopened anytime via the Open menu.',
      icon: <Download className="w-5 h-5 text-slate-600" />,
      badge: 'Native Backup',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Export Document</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select a destination format to export "{docData.metadata.title}"</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {formats.map((fmt) => {
            const isSelected = selectedFormat === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-100">{fmt.icon}</div>
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {fmt.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-900">{fmt.title}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-normal">{fmt.desc}</div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export Document'}
          </button>
        </div>
      </div>
    </div>
  );
};
