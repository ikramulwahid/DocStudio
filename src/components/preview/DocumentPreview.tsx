import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PreviewToolbar } from './PreviewToolbar';
import { DocumentData } from '../../types/document';
import { BlockPreviewRenderer } from './BlockPreviewRenderer';
import { FrontPageRenderer } from '../frontpage/FrontPageRenderer';
import { calculateHeadingNumbers } from '../../services/blockUtils';
import { printDocumentAsPdf } from '../../services/exportService';
import { getPageGeometry } from '../../services/pageGeometry';
import { paginateDocument, PaginatedPage } from '../../services/paginationService';
import { AlertCircle } from 'lucide-react';

interface DocumentPreviewProps {
  docData: DocumentData;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  docData,
  previewRef,
}) => {
  const [zoom, setZoom] = useState<number>(85);
  const [currentPage, setCurrentPage] = useState<number>(() => (docData.settings.frontPage?.enabled ? 0 : 1));
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Authoritative physical page geometry
  const geometry = useMemo(() => {
    return getPageGeometry(
      docData.settings.pageSize,
      docData.settings.orientation,
      docData.settings.margins,
      docData.settings.showHeader,
      docData.settings.showFooter
    );
  }, [
    docData.settings.pageSize,
    docData.settings.orientation,
    docData.settings.margins,
    docData.settings.showHeader,
    docData.settings.showFooter,
  ]);

  const { pagePx, marginsPx } = geometry;
  const pageWidth = pagePx.width;
  const pageHeight = pagePx.height;

  // Dynamically calculate hierarchical heading numbers
  const headingNumbers = useMemo(() => {
    return calculateHeadingNumbers(docData.blocks || [], docData.settings.headingNumberingScheme || '1.1');
  }, [docData.blocks, docData.settings.headingNumberingScheme]);

  // Divide blocks into physical pages with authoritative automatic pagination and explicit breaks
  const pages = useMemo<PaginatedPage[]>(() => {
    return paginateDocument(docData, geometry);
  }, [docData, geometry]);

  const totalPages = pages.length;
  const hasCoverPage = Boolean(docData.settings.frontPage?.enabled);

  // If cover is toggled off while on cover, switch to page 1
  useEffect(() => {
    if (!hasCoverPage && currentPage === 0) {
      setCurrentPage(1);
    }
  }, [hasCoverPage, currentPage]);

  // Fit to width calculation
  const handleFitWidth = () => {
    if (containerRef.current) {
      const availableWidth = containerRef.current.clientWidth - 48;
      const newZoom = Math.max(40, Math.min(160, Math.floor((availableWidth / pageWidth) * 100)));
      setZoom(newZoom);
    }
  };

  // Fit to page calculation
  const handleFitPage = () => {
    if (containerRef.current) {
      const availableHeight = containerRef.current.clientHeight - 80;
      const newZoom = Math.max(40, Math.min(140, Math.floor((availableHeight / pageHeight) * 100)));
      setZoom(newZoom);
    }
  };

  const scrollToPage = (pageNumber: number) => {
    const targetId = pageNumber === 0 ? 'preview-page-cover' : `preview-page-${pageNumber}`;
    const pageEl = document.getElementById(targetId);
    if (pageEl && containerRef.current) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNumber);
    }
  };

  // Format page number string
  const formatPageNumber = (displayPageNumber: number, total: number) => {
    const fmt = docData.settings.pageNumbering;
    if (fmt === 'none') return '';
    if (fmt === 'Page X of Y') return `Page ${displayPageNumber} of ${total}`;
    if (fmt === 'X / Y') return `${displayPageNumber} / ${total}`;
    if (fmt === 'X') return `${displayPageNumber}`;
    return '';
  };

  // Resolve header/footer tokens
  const resolveToken = (text: string, pageNum: number, total: number) => {
    if (!text) return '';
    return text
      .replace(/\{title\}/gi, docData.metadata.title)
      .replace(/\{author\}/gi, docData.metadata.author)
      .replace(/\{date\}/gi, docData.metadata.updatedAt)
      .replace(/\{ref\}/gi, docData.metadata.referenceId)
      .replace(/\{page\}/gi, pageNum.toString())
      .replace(/\{pages\}/gi, total.toString());
  };

  return (
    <div className="h-full flex flex-col bg-[#E9EDF2] overflow-hidden select-none">
      {/* Top Preview Toolbar */}
      <PreviewToolbar
        zoom={zoom}
        currentPage={currentPage}
        totalPages={totalPages}
        hasCoverPage={hasCoverPage}
        showGuides={showGuides}
        onZoomIn={() => setZoom((prev) => Math.min(200, prev + 10))}
        onZoomOut={() => setZoom((prev) => Math.max(35, prev - 10))}
        onResetZoom={() => setZoom(100)}
        onFitWidth={handleFitWidth}
        onFitPage={handleFitPage}
        onToggleGuides={() => setShowGuides(!showGuides)}
        onPrevPage={() => {
          const minPage = hasCoverPage ? 0 : 1;
          if (currentPage > minPage) scrollToPage(currentPage - 1);
        }}
        onNextPage={() => {
          if (currentPage < totalPages) scrollToPage(currentPage + 1);
        }}
        onPrint={printDocumentAsPdf}
      />

      {/* Main Preview Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start relative"
      >
        {/* Scaled Canvas Container */}
        <div
          ref={previewRef}
          id="print-target"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: `${pageWidth}px`,
            transition: 'transform 0.15s ease-out',
          }}
          className="flex flex-col gap-8 pb-16"
        >
          {/* 1. FRONT COVER PAGE (rendered when enabled) */}
          {hasCoverPage && docData.settings.frontPage && (
            <div
              id="preview-page-cover"
              className="relative transition-all flex justify-center shrink-0 print:m-0"
            >
              <FrontPageRenderer
                metadata={docData.metadata}
                frontPage={docData.settings.frontPage}
                width={pageWidth}
                height={pageHeight}
              />
            </div>
          )}

          {/* 2. DOCUMENT BODY PAGES */}
          {pages.map((page) => {
            const pageNum = page.pageNumber;
            const isFirstBodyPage = pageNum === 1;

            return (
              <div
                key={pageNum}
                id={`preview-page-${pageNum}`}
                style={{
                  width: `${pageWidth}px`,
                  minHeight: `${pageHeight}px`,
                  height: `${pageHeight}px`, // Fixed exact physical page height
                  backgroundColor: '#FFFFFF',
                  paddingTop: `${marginsPx.top}px`,
                  paddingBottom: `${marginsPx.bottom}px`,
                  paddingLeft: `${marginsPx.left}px`,
                  paddingRight: `${marginsPx.right}px`,
                  boxSizing: 'border-box',
                  fontFamily: docData.settings.fontFamily,
                  fontSize: docData.settings.fontSize === '10pt' ? '13px' : docData.settings.fontSize === '11pt' ? '14.5px' : docData.settings.fontSize === '12pt' ? '16px' : '17.5px',
                  lineHeight: docData.settings.lineHeight,
                }}
                className={`relative bg-white shadow-xl flex flex-col justify-between text-slate-800 transition-all overflow-hidden ${
                  showGuides ? 'ring-1 ring-blue-300 ring-dashed' : ''
                }`}
              >
                {/* Margin Guide Outlines if enabled */}
                {showGuides && (
                  <div
                    className="absolute inset-0 pointer-events-none border border-dashed border-blue-400/40"
                    style={{
                      top: `${marginsPx.top}px`,
                      bottom: `${marginsPx.bottom}px`,
                      left: `${marginsPx.left}px`,
                      right: `${marginsPx.right}px`,
                    }}
                  />
                )}

                {/* Page Content Overflow Warning Pill if overflowing */}
                {page.isOverflowing && (
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/90 text-white text-[10px] font-semibold rounded shadow-sm print:hidden">
                    <AlertCircle className="w-3 h-3" />
                    <span>Content exceeds page boundary</span>
                  </div>
                )}

                {/* Diagonal Watermark */}
                {docData.settings.showWatermark && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10">
                    <span className="text-slate-900/[0.04] text-7xl font-bold font-mono tracking-widest uppercase transform -rotate-45 select-none">
                      {docData.settings.watermarkText || 'CONFIDENTIAL'}
                    </span>
                  </div>
                )}

                {/* Running Header */}
                {page.headerSettings.showHeader ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-3 border-b border-slate-200 mb-6 shrink-0">
                    <div className="font-medium tracking-tight truncate max-w-xs">
                      {resolveToken(page.headerSettings.headerLeft || docData.metadata.organization || docData.metadata.title, page.displayPageNumber, totalPages)}
                    </div>
                    {page.headerSettings.headerCenter && (
                      <div className="font-medium text-slate-400 truncate max-w-xs text-center">
                        {resolveToken(page.headerSettings.headerCenter, page.displayPageNumber, totalPages)}
                      </div>
                    )}
                    <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider shrink-0">
                      {resolveToken(page.headerSettings.headerRight || docData.metadata.referenceId, page.displayPageNumber, totalPages)}
                    </div>
                  </div>
                ) : (
                  <div className="h-2" />
                )}

                {/* Page Content Body */}
                <div className="flex-1 flex flex-col">
                  {/* First Page Title Banner: Shown on Page 1 if banner enabled AND front page is not enabled */}
                  {isFirstBodyPage && docData.settings.showTitleBanner && !hasCoverPage && (
                    <div className="mb-6 pb-5 border-b-2 border-slate-900">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="min-w-0">
                          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                            {docData.metadata.title}
                          </h1>
                          {docData.metadata.subtitle && (
                            <p className="text-sm text-slate-600 mt-1 italic leading-snug">
                              {docData.metadata.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-700">
                            {docData.metadata.status}
                          </span>
                        </div>
                      </div>

                      {/* Metadata bar */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        {docData.metadata.author && (
                          <span>
                            <strong className="text-slate-700">Author:</strong> {docData.metadata.author}
                          </span>
                        )}
                        {docData.metadata.organization && (
                          <span>
                            <strong className="text-slate-700">Org:</strong> {docData.metadata.organization}
                          </span>
                        )}
                        {docData.metadata.referenceId && (
                          <span>
                            <strong className="text-slate-700">Ref:</strong> {docData.metadata.referenceId}
                          </span>
                        )}
                        <span>
                          <strong className="text-slate-700">Date:</strong> {docData.metadata.updatedAt}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Render the ordered blocks for this page */}
                  <div className="space-y-1">
                    {page.blocks.map((block) => (
                      <BlockPreviewRenderer
                        key={block.id}
                        block={block}
                        calculatedNumber={headingNumbers.get(block.id)}
                        metadata={docData.metadata}
                      />
                    ))}
                  </div>
                </div>

                {/* Running Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-200 mt-6 shrink-0">
                  <div className="truncate max-w-xs text-slate-500">
                    {page.footerSettings.showFooter
                      ? resolveToken(page.footerSettings.footerText || page.footerSettings.footerLeft || '', page.displayPageNumber, totalPages)
                      : ''}
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 font-medium">
                    {formatPageNumber(page.displayPageNumber, totalPages)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
