import React, { useState, useEffect, useRef } from 'react';
import { Topbar } from './components/Topbar';
import { DocumentMetadataSidebar } from './components/metadata/DocumentMetadataSidebar';
import { EditorPanel } from './components/editor/EditorPanel';
import { DocumentPreview } from './components/preview/DocumentPreview';
import { NewDocumentModal } from './components/modals/NewDocumentModal';
import { OpenDocumentModal } from './components/modals/OpenDocumentModal';
import { ExportModal } from './components/modals/ExportModal';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/ui/Toast';

import { 
  DocumentData, 
  DocumentMetadata, 
  DocumentSettings, 
  DocumentStats,
  DocumentBlock
} from './types/document';
import { 
  loadCurrentDocument, 
  saveCurrentDocument, 
  createNewDocument, 
  calculateDocumentStats,
  TEMPLATES
} from './services/documentStore';
import { createDefaultParagraph } from './services/blockUtils';

export default function App() {
  // Document state with modular blocks
  const [docData, setDocData] = useState<DocumentData>(() => loadCurrentDocument());
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [stats, setStats] = useState<DocumentStats>(() => calculateDocumentStats(docData.blocks));

  // Responsive mobile/tablet active tab
  const [activeMobileTab, setActiveMobileTab] = useState<'metadata' | 'editor' | 'preview'>('editor');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Confirmation modals
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Preview element ref for direct PDF export
  const previewRef = useRef<HTMLDivElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Recalculate stats when blocks change
  useEffect(() => {
    setStats(calculateDocumentStats(docData.blocks));
  }, [docData.blocks]);

  // Auto-save debounced or on change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCurrentDocument(docData);
    }, 1200);
    return () => clearTimeout(timer);
  }, [docData]);

  // Window unload warning if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Document metadata handler
  const handleMetadataChange = (fields: Partial<DocumentMetadata>) => {
    setDocData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...fields,
        updatedAt: new Date().toISOString().split('T')[0],
      },
    }));
    setIsDirty(true);
  };

  // Document settings handler
  const handleSettingsChange = (fields: Partial<DocumentSettings>) => {
    setDocData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...fields,
      },
    }));
    setIsDirty(true);
  };

  // Block updates handler
  const handleBlocksChange = (newBlocks: DocumentBlock[]) => {
    setDocData((prev) => ({
      ...prev,
      blocks: newBlocks,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString().split('T')[0],
      },
    }));
    setIsDirty(true);
  };

  // Action: Save Document
  const handleSaveDocument = () => {
    saveCurrentDocument(docData);
    setIsDirty(false);
    addToast('success', 'Document Saved', `"${docData.metadata.title}" stored to local library.`);
  };

  // Action: New Document
  const handleCreateNew = (templateKey: string) => {
    const newDoc = createNewDocument(templateKey);
    setDocData(newDoc);
    setIsDirty(false);
    addToast('info', 'New Document Created', `Loaded template: ${TEMPLATES[templateKey]?.name || 'Blank'}`);
  };

  // Action: Open Document
  const handleSelectDocument = (openedDoc: DocumentData) => {
    setDocData(openedDoc);
    setIsDirty(false);
    addToast('success', 'Document Opened', `"${openedDoc.metadata.title}" loaded successfully.`);
  };

  // Action: Duplicate Document
  const handleDuplicateDocument = () => {
    const duplicated: DocumentData = {
      ...docData,
      id: 'doc_' + Date.now(),
      metadata: {
        ...docData.metadata,
        title: `${docData.metadata.title} (Copy)`,
        referenceId: `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'Draft',
      },
    };
    setDocData(duplicated);
    setIsDirty(true);
    addToast('success', 'Document Duplicated', 'Created an independent copy in workspace.');
  };

  // Action: Clear Content (with confirmation)
  const handleClearContent = () => {
    setConfirmState({
      isOpen: true,
      title: 'Clear Document Blocks?',
      description: 'This will erase all content blocks in the editor. Document metadata and layout settings will be retained.',
      confirmLabel: 'Clear Content',
      isDestructive: true,
      onConfirm: () => {
        setDocData((prev) => ({
          ...prev,
          blocks: [createDefaultParagraph('<p>Start typing...</p>')],
        }));
        setIsDirty(true);
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        addToast('info', 'Content Cleared', 'Editor canvas is now empty.');
      },
    });
  };

  // Action: Reset Settings (with confirmation)
  const handleResetSettings = () => {
    setConfirmState({
      isOpen: true,
      title: 'Reset Document Settings?',
      description: 'This will revert page sizing, margins, typography, and headers to standard A4 portrait defaults. Your written blocks will not be modified.',
      confirmLabel: 'Reset Settings',
      isDestructive: false,
      onConfirm: () => {
        setDocData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            pageSize: 'a4',
            orientation: 'portrait',
            margins: 'normal',
            fontFamily: 'Plus Jakarta Sans',
            fontSize: '11pt',
            lineHeight: '1.5',
            showHeader: true,
            headerLeft: '',
            headerCenter: '',
            headerRight: '',
            showFooter: true,
            footerText: 'DocStudio Document',
            pageNumbering: 'Page X of Y',
            showTitleBanner: true,
            showWatermark: false,
            watermarkText: 'DRAFT',
            showTableBorders: true,
            headingNumberingScheme: '1.1',
          },
        }));
        setIsDirty(true);
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        addToast('info', 'Settings Reset', 'Restored default page and typography configuration.');
      },
    });
  };

  // Template switch handler
  const handleApplyTemplate = (templateKey: string) => {
    const tpl = TEMPLATES[templateKey];
    if (tpl) {
      setConfirmState({
        isOpen: true,
        title: `Apply "${tpl.name}" Layout?`,
        description: 'Applying this style will update your typography, header, and page formatting. Would you also like to load its sample structure?',
        confirmLabel: 'Apply Template',
        isDestructive: false,
        onConfirm: () => {
          setDocData((prev) => ({
            ...prev,
            settings: {
              ...prev.settings,
              ...(tpl.data.settings || {}),
              template: templateKey as any,
            },
          }));
          setIsDirty(true);
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
          addToast('success', 'Template Applied', `Switched layout to ${tpl.name}.`);
        },
      });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F4F6F8] text-[#1F2937] overflow-hidden">
      {/* 1. TOPBAR: Full width across the top of the application */}
      <Topbar
        documentTitle={docData.metadata.title}
        isDirty={isDirty}
        activeMobileTab={activeMobileTab}
        onSelectMobileTab={setActiveMobileTab}
        onNew={() => setIsNewModalOpen(true)}
        onOpen={() => setIsOpenModalOpen(true)}
        onSave={handleSaveDocument}
        onExport={() => setIsExportModalOpen(true)}
        onTitleChange={(newTitle) => handleMetadataChange({ title: newTitle })}
      />

      {/* WORKSPACE AREA: Fixed three-column split on desktop (23.33% / 33.33% / 43.34%) */}
      <main className="flex-1 w-full flex overflow-hidden">
        {/* COLUMN 1: Left Sidebar — Document Metadata & Actions (23.33%) */}
        <div
          className={`h-full overflow-hidden ${
            activeMobileTab === 'metadata' ? 'w-full flex-1' : 'hidden'
          } lg:block lg:w-[23.33%] shrink-0`}
        >
          <DocumentMetadataSidebar
            metadata={docData.metadata}
            settings={docData.settings}
            stats={stats}
            onMetadataChange={handleMetadataChange}
            onSettingsChange={handleSettingsChange}
            onDuplicate={handleDuplicateDocument}
            onClearContent={handleClearContent}
            onResetSettings={handleResetSettings}
            onApplyTemplate={handleApplyTemplate}
          />
        </div>

        {/* COLUMN 2: Middle Panel — Modular Block Document Editor (33.33%) */}
        <div
          className={`h-full overflow-hidden ${
            activeMobileTab === 'editor' ? 'w-full flex-1' : 'hidden'
          } lg:block lg:w-[33.33%] shrink-0`}
        >
          <EditorPanel
            blocks={docData.blocks}
            settings={docData.settings}
            metadata={docData.metadata}
            wordCount={stats.wordCount}
            charCount={stats.charCount}
            onChangeBlocks={handleBlocksChange}
          />
        </div>

        {/* COLUMN 3: Right Panel — Live Document Preview (43.34%) */}
        <div
          className={`h-full overflow-hidden ${
            activeMobileTab === 'preview' ? 'w-full flex-1' : 'hidden'
          } lg:block lg:w-[43.34%] shrink-0`}
        >
          <DocumentPreview
            docData={docData}
            previewRef={previewRef}
          />
        </div>
      </main>

      {/* MODALS */}
      <NewDocumentModal
        isOpen={isNewModalOpen}
        hasUnsavedChanges={isDirty}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={handleCreateNew}
      />

      <OpenDocumentModal
        isOpen={isOpenModalOpen}
        hasUnsavedChanges={isDirty}
        onClose={() => setIsOpenModalOpen(false)}
        onSelectDocument={handleSelectDocument}
        onImportFromFile={handleSelectDocument}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        docData={docData}
        previewElement={previewRef.current}
        onClose={() => setIsExportModalOpen(false)}
        onNotify={addToast}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        isDestructive={confirmState.isDestructive}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* TOAST NOTIFICATIONS */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
