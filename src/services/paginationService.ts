import { DocumentBlock, DocumentData, HeadingBlock, ParagraphBlock, ListBlock, TableBlock, FormulaBlock, DividerBlock, SignatureBlock, CalloutBlock, ImageBlock, MetadataBlock, SectionBreakBlock } from '../types/document';
import { PageGeometry } from './pageGeometry';

export interface PaginatedPage {
  pageNumber: number; // 1-based sequential page index in body
  blocks: DocumentBlock[];
  displayPageNumber: number; // displayed page number (supports section restart)
  estimatedHeightPx: number;
  maxContentHeightPx: number;
  isOverflowing: boolean;
  headerSettings: {
    showHeader: boolean;
    headerLeft: string;
    headerCenter?: string;
    headerRight: string;
  };
  footerSettings: {
    showFooter: boolean;
    footerLeft?: string;
    footerCenter?: string;
    footerRight?: string;
    footerText: string;
  };
}

/**
 * Estimates the vertical height in CSS pixels of a given block, based on typography,
 * content size, line count, padding, and margins.
 * This provides immediate, pure, authoritative pagination without layout shifts.
 */
export function estimateBlockHeight(
  block: DocumentBlock,
  contentWidthPx: number,
  baseFontSizePt: string = '11pt',
  lineHeightMultiplier: string = '1.3'
): number {
  // Approximate base font size in pixels
  let fontSizePx = 14.5;
  if (baseFontSizePt === '10pt') fontSizePx = 13.3;
  else if (baseFontSizePt === '11pt') fontSizePx = 14.5;
  else if (baseFontSizePt === '12pt') fontSizePx = 16.0;
  else if (baseFontSizePt === '14pt') fontSizePx = 18.5;

  const lh = parseFloat(lineHeightMultiplier) || 1.3;
  const linePx = fontSizePx * lh;

  // Characters per line estimate based on content width and font size
  // On average, a proportional font character is ~0.55 * fontSize
  const avgCharWidth = fontSizePx * 0.52;
  const charsPerLine = Math.max(20, Math.floor(contentWidthPx / avgCharWidth));

  // Default block spacing (top + bottom)
  const topSpacing = block.spacing?.top ?? 0;
  const bottomSpacing = block.spacing?.bottom ?? 0;
  const baseSpacing = topSpacing + bottomSpacing;

  switch (block.type) {
    case 'heading': {
      const h = block as HeadingBlock;
      let headingFontSizePx = 24;
      let extraMargin = 28;
      if (h.level === 1) { headingFontSizePx = 24; extraMargin = 32; }
      else if (h.level === 2) { headingFontSizePx = 20; extraMargin = 26; }
      else if (h.level === 3) { headingFontSizePx = 17; extraMargin = 22; }
      else if (h.level === 4) { headingFontSizePx = 15; extraMargin = 18; }

      const textLen = (h.text || '').length;
      const hCharsPerLine = Math.max(15, Math.floor(contentWidthPx / (headingFontSizePx * 0.55)));
      const lines = Math.max(1, Math.ceil(textLen / hCharsPerLine));
      return Math.round(lines * headingFontSizePx * 1.25 + extraMargin + baseSpacing);
    }

    case 'paragraph': {
      const p = block as ParagraphBlock;
      // Strip HTML tags to estimate raw text length
      const text = (p.html || '').replace(/<[^>]*>/g, '').trim();
      if (!text) return Math.round(linePx + 10 + baseSpacing);

      // Account for paragraph indentation if set
      const effectiveWidth = Math.max(100, contentWidthPx - ((p.indent || 0) * 24));
      const pCharsPerLine = Math.max(20, Math.floor(effectiveWidth / avgCharWidth));
      const lines = Math.max(1, Math.ceil(text.length / pCharsPerLine));
      // Paragraph margin-y is approx 10px
      return Math.round(lines * linePx + 10 + baseSpacing);
    }

    case 'list': {
      const l = block as ListBlock;
      if (!l.items || l.items.length === 0) return 24;
      let total = 10 + baseSpacing; // container padding
      for (const item of l.items) {
        const text = (item.text || '').replace(/<[^>]*>/g, '').trim();
        const effectiveWidth = Math.max(100, contentWidthPx - ((item.indent || 0) * 20) - 30);
        const itemCharsPerLine = Math.max(15, Math.floor(effectiveWidth / avgCharWidth));
        const lines = Math.max(1, Math.ceil((text.length || 1) / itemCharsPerLine));
        total += Math.round(lines * (fontSizePx * 1.35) + 6);
      }
      return total;
    }

    case 'table': {
      const t = block as TableBlock;
      if (!t.data || t.data.length === 0) return 60;
      let total = 20 + baseSpacing;
      // Row padding
      let rowPadding = 18;
      if (t.cellPadding === 'compact') rowPadding = 12;
      else if (t.cellPadding === 'relaxed') rowPadding = 26;

      for (let r = 0; r < t.data.length; r++) {
        // Find longest cell in row
        let maxLinesInRow = 1;
        const colWidth = Math.max(40, contentWidthPx / Math.max(1, t.cols || 1));
        const cellChars = Math.max(8, Math.floor(colWidth / (fontSizePx * 0.5)));
        
        for (const cell of t.data[r]) {
          const cText = (cell || '').replace(/<[^>]*>/g, '');
          const lines = Math.max(1, Math.ceil(cText.length / cellChars));
          if (lines > maxLinesInRow) maxLinesInRow = lines;
        }
        total += Math.round(maxLinesInRow * (fontSizePx * 1.25) + rowPadding);
      }
      return total;
    }

    case 'formula': {
      const f = block as FormulaBlock;
      return f.displayMode ? Math.round(64 + baseSpacing) : Math.round(36 + baseSpacing);
    }

    case 'divider': {
      const d = block as DividerBlock;
      return Math.round(24 + (d.thickness || 1) + baseSpacing);
    }

    case 'metadata': {
      const m = block as MetadataBlock;
      const count = m.visibleFields?.length || 4;
      if (m.layout === 'compact') {
        return Math.round(44 + baseSpacing);
      }
      const rows = Math.ceil(count / 2);
      return Math.round(rows * 36 + 28 + baseSpacing);
    }

    case 'signature': {
      const s = block as SignatureBlock;
      const count = s.signers?.length || 1;
      if (s.layout === 'side-by-side') {
        const rows = Math.ceil(count / 2);
        return Math.round(rows * 110 + 20 + baseSpacing);
      }
      return Math.round(count * 105 + 20 + baseSpacing);
    }

    case 'callout': {
      const c = block as CalloutBlock;
      const text = c.text || '';
      const lines = Math.max(1, Math.ceil(text.length / (charsPerLine - 6)));
      return Math.round((c.title ? 28 : 12) + lines * linePx + 16 + baseSpacing);
    }

    case 'image': {
      const img = block as ImageBlock;
      // Typical image block preview height
      return Math.round(240 + (img.caption ? 24 : 0) + baseSpacing);
    }

    case 'pagebreak':
    case 'sectionbreak':
      return 0;

    default:
      return 40;
  }
}

/**
 * Automatically paginates document blocks into physical pages.
 * Respects:
 * - Page geometry and physical usable height
 * - Explicit page breaks (`pagebreak`)
 * - Section breaks (`sectionbreak`) with independent running headers/footers and numbering restarts
 * - Prevents awkward orphaned headings (`keepWithNext`)
 * - Computes clean, predictable overflow boundaries
 */
export function paginateDocument(
  docData: DocumentData,
  geometry: PageGeometry
): PaginatedPage[] {
  const pagesList: PaginatedPage[] = [];
  const blocks = docData.blocks || [];

  // Usable height for page 1 might need adjustment if title banner is present
  const baseAvailableHeight = geometry.usableBodyHeightPx;
  const hasCoverPage = Boolean(docData.settings.frontPage?.enabled);
  const showBannerOnPage1 = docData.settings.showTitleBanner && !hasCoverPage;
  const titleBannerEstimatedHeight = 110; // Title + subtitle + status + meta bar

  let currentBlocks: DocumentBlock[] = [];
  let currentHeight = 0;
  let pageCounter = 1;
  let currentDisplayPage = 1;

  // Running settings state across sections
  let currentHeader = {
    showHeader: docData.settings.showHeader,
    headerLeft: docData.settings.headerLeft || docData.metadata.organization || docData.metadata.title,
    headerCenter: docData.settings.headerCenter || '',
    headerRight: docData.settings.headerRight || docData.metadata.referenceId,
  };

  let currentFooter = {
    showFooter: docData.settings.showFooter,
    footerLeft: docData.settings.footerLeft || '',
    footerCenter: docData.settings.footerCenter || '',
    footerRight: docData.settings.footerRight || '',
    footerText: docData.settings.footerText || '',
  };

  const getPageCapacity = (pageIndex: number): number => {
    if (pageIndex === 1 && showBannerOnPage1) {
      return Math.max(100, baseAvailableHeight - titleBannerEstimatedHeight);
    }
    return baseAvailableHeight;
  };

  const commitPage = () => {
    const pageCapacity = getPageCapacity(pageCounter);
    pagesList.push({
      pageNumber: pageCounter,
      blocks: [...currentBlocks],
      displayPageNumber: currentDisplayPage,
      estimatedHeightPx: currentHeight,
      maxContentHeightPx: pageCapacity,
      isOverflowing: currentHeight > pageCapacity + 20,
      headerSettings: { ...currentHeader },
      footerSettings: { ...currentFooter },
    });

    pageCounter++;
    currentDisplayPage++;
    currentBlocks = [];
    currentHeight = 0;
  };

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Explicit Page Break
    if (block.type === 'pagebreak') {
      commitPage();
      continue;
    }

    // Section Break
    if (block.type === 'sectionbreak') {
      // Commit the current page prior to section break if it has any blocks
      if (currentBlocks.length > 0) {
        commitPage();
      }

      const sb = block as SectionBreakBlock;
      // Inherit or override header
      if (!sb.inheritHeader && sb.localHeader) {
        currentHeader = {
          showHeader: docData.settings.showHeader,
          headerLeft: sb.localHeader.headerLeft || '',
          headerCenter: sb.localHeader.headerCenter || '',
          headerRight: sb.localHeader.headerRight || '',
        };
      }
      // Inherit or override footer
      if (!sb.inheritFooter && sb.localFooter) {
        currentFooter = {
          showFooter: docData.settings.showFooter,
          footerLeft: sb.localFooter.footerLeft || '',
          footerCenter: sb.localFooter.footerCenter || '',
          footerRight: sb.localFooter.footerRight || '',
          footerText: sb.localFooter.footerText || '',
        };
      }
      // Restart page numbering if requested
      if (sb.pageNumberingMode === 'restart') {
        currentDisplayPage = sb.pageNumberRestartValue || 1;
      }
      continue;
    }

    // Regular content block
    const blockHeight = estimateBlockHeight(
      block,
      geometry.contentPx.width,
      docData.settings.fontSize,
      docData.settings.lineHeight
    );

    const pageCapacity = getPageCapacity(pageCounter);

    // Check if adding this block exceeds page capacity
    // If block is a Heading and keepWithNext is enabled (or by default for H1/H2), check if next block also fits
    const isHeading = block.type === 'heading';
    const keepWithNext = isHeading && (block as HeadingBlock).keepWithNext !== false;
    let requiredSpace = blockHeight;

    if (keepWithNext && i + 1 < blocks.length) {
      const nextBlock = blocks[i + 1];
      if (nextBlock.type !== 'pagebreak' && nextBlock.type !== 'sectionbreak') {
        const nextHeight = estimateBlockHeight(
          nextBlock,
          geometry.contentPx.width,
          docData.settings.fontSize,
          docData.settings.lineHeight
        );
        requiredSpace += Math.min(nextHeight, 60); // at least first few lines of next block
      }
    }

    if (currentBlocks.length > 0 && currentHeight + requiredSpace > pageCapacity) {
      // Push to next page cleanly
      commitPage();
    }

    currentBlocks.push(block);
    currentHeight += blockHeight;
  }

  // Commit last remaining page or at least one empty page if document has no body blocks
  if (currentBlocks.length > 0 || pagesList.length === 0) {
    commitPage();
  }

  return pagesList;
}
