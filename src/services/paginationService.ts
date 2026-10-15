import { DocumentBlock, DocumentData, HeadingBlock, ParagraphBlock, ListBlock, TableBlock, FormulaBlock, DividerBlock, SignatureBlock, CalloutBlock, ImageBlock, MetadataBlock, SectionBreakBlock, PageBreakBlock } from '../types/document';
import { PageGeometry, HEADER_LAYOUT, FOOTER_LAYOUT } from './pageGeometry';

export interface PaginatedPage {
  pageNumber: number; // 1-based sequential page index in body
  blocks: DocumentBlock[];
  displayPageNumber: number; // displayed page number (supports section restart)
  estimatedHeightPx: number;
  maxContentHeightPx: number;
  isOverflowing: boolean;
  hasOversizedBlock: boolean; // whether a single atomic block exceeds the full page capacity
  oversizedBlockIds: string[]; // ids of blocks exceeding full page capacity
  overflowAmountPx: number;
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

export interface DocumentOverflowSummary {
  hasOverflow: boolean;
  totalOverflowingPages: number;
  overflowingPages: number[];
  oversizedBlockCount: number;
  maxOverflowPx: number;
  message: string;
}

/**
 * Calculates accurate vertical height in CSS pixels of Page 1 Title Banner
 * accounting for title length, subtitle, status tag, and metadata row wrap.
 */
export function calculateTitleBannerHeight(
  docData: DocumentData,
  contentWidthPx: number
): number {
  // Base spacing: padding-bottom 20px (pb-5), border 2px (border-b-2), margin-bottom 24px (mb-6)
  const baseFrameSpacing = 46;

  // Title: 24px font size (text-2xl), line-height ~30px (leading-tight)
  const titleText = docData.metadata.title || 'Untitled Document';
  const titleCharsPerLine = Math.max(15, Math.floor(contentWidthPx / (24 * 0.55)));
  const titleLines = Math.max(1, Math.ceil(titleText.length / titleCharsPerLine));
  const titleHeight = titleLines * 30;

  // Subtitle: ~24px if present
  const subtitleHeight = docData.metadata.subtitle ? 24 : 0;

  // Gap between title block and metadata row (mb-2 = 8px)
  const gap = 8;

  // Metadata bar: pt-2 (8px), border-t (1px), content ~18px
  let metaItemCount = 1; // date is always present
  if (docData.metadata.author) metaItemCount++;
  if (docData.metadata.organization) metaItemCount++;
  if (docData.metadata.referenceId) metaItemCount++;

  const itemsPerRow = Math.max(1, Math.floor(contentWidthPx / 130));
  const metaRows = Math.ceil(metaItemCount / itemsPerRow);
  const metaBarHeight = 9 + (metaRows * 18);

  return Math.round(baseFrameSpacing + titleHeight + subtitleHeight + gap + metaBarHeight);
}

/**
 * Helper to get typography metrics in pixels based on document settings.
 */
export function getTypographyMetrics(
  baseFontSizePt: string = '11pt',
  lineHeightMultiplier: string = '1.3',
  contentWidthPx: number = 602
) {
  let fontSizePx = 14.5;
  if (baseFontSizePt === '10pt') fontSizePx = 13.3;
  else if (baseFontSizePt === '11pt') fontSizePx = 14.5;
  else if (baseFontSizePt === '12pt') fontSizePx = 16.0;
  else if (baseFontSizePt === '14pt') fontSizePx = 18.5;

  const lh = parseFloat(lineHeightMultiplier) || 1.3;
  const linePx = fontSizePx * lh;
  const avgCharWidth = fontSizePx * 0.52;
  const charsPerLine = Math.max(20, Math.floor(contentWidthPx / avgCharWidth));

  return { fontSizePx, lh, linePx, avgCharWidth, charsPerLine };
}

/**
 * Estimates the vertical height in CSS pixels of a given block, based on typography,
 * content size, line count, padding, and margins.
 */
export function estimateBlockHeight(
  block: DocumentBlock,
  contentWidthPx: number,
  baseFontSizePt: string = '11pt',
  lineHeightMultiplier: string = '1.3'
): number {
  const { fontSizePx, linePx, avgCharWidth, charsPerLine } = getTypographyMetrics(
    baseFontSizePt,
    lineHeightMultiplier,
    contentWidthPx
  );

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
      const text = (p.html || '').replace(/<[^>]*>/g, '').trim();
      if (!text) return Math.round(linePx + 10 + baseSpacing);

      const effectiveWidth = Math.max(100, contentWidthPx - ((p.indent || 0) * 24));
      const pCharsPerLine = Math.max(20, Math.floor(effectiveWidth / avgCharWidth));
      const lines = Math.max(1, Math.ceil(text.length / pCharsPerLine));
      return Math.round(lines * linePx + 10 + baseSpacing);
    }

    case 'list': {
      const l = block as ListBlock;
      if (!l.items || l.items.length === 0) return 24;
      let total = 10 + baseSpacing;
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
      let rowPadding = 18;
      if (t.cellPadding === 'compact') rowPadding = 12;
      else if (t.cellPadding === 'relaxed') rowPadding = 26;

      for (let r = 0; r < t.data.length; r++) {
        let maxLinesInRow = 1;
        const colWidth = Math.max(40, contentWidthPx / Math.max(1, t.cols || 1));
        const cellChars = Math.max(8, Math.floor(colWidth / (fontSizePx * 0.5)));
        
        for (const cell of t.data[r] || []) {
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
 * Splits HTML content cleanly at a word boundary closest to targetCharCount.
 * Guarantees proper HTML tag balance, closing open tags in Part 1 and reopening them in Part 2.
 */
export function splitParagraphHtml(html: string, targetCharCount: number): [string, string] {
  if (!html || !html.trim()) {
    return [html, ''];
  }

  // Tokenize HTML into tags and text runs
  const tokenRegex = /(<[^>]+>|[^<]+)/g;
  const tokens: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(html)) !== null) {
    tokens.push(match[1]);
  }

  let charCount = 0;
  const part1Tokens: string[] = [];
  const part2Tokens: string[] = [];
  const openTags: string[] = [];
  let splitReached = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.startsWith('<')) {
      if (!splitReached) {
        part1Tokens.push(token);
        if (token.startsWith('</')) {
          openTags.pop();
        } else if (!token.endsWith('/>') && !token.startsWith('<?') && !token.startsWith('<!')) {
          const tagName = token.match(/<([a-zA-Z0-9_-]+)/)?.[1];
          if (tagName && !['br', 'hr', 'img', 'input', 'meta'].includes(tagName.toLowerCase())) {
            openTags.push(token);
          }
        }
      } else {
        part2Tokens.push(token);
      }
    } else {
      if (!splitReached) {
        if (charCount + token.length <= targetCharCount) {
          part1Tokens.push(token);
          charCount += token.length;
        } else {
          const needed = Math.max(0, targetCharCount - charCount);
          let splitIdx = token.lastIndexOf(' ', needed);
          if (splitIdx === -1 || splitIdx < Math.floor(needed * 0.4)) {
            splitIdx = token.indexOf(' ', needed);
          }
          if (splitIdx === -1) {
            splitIdx = needed;
          }

          const text1 = token.slice(0, splitIdx);
          const text2 = token.slice(splitIdx);

          if (text1) part1Tokens.push(text1);
          if (text2) part2Tokens.push(text2);

          splitReached = true;
        }
      } else {
        part2Tokens.push(token);
      }
    }
  }

  if (!splitReached) {
    return [html, ''];
  }

  // Close open tags for Part 1 in reverse order
  const closingTags = openTags
    .slice()
    .reverse()
    .map((tag) => {
      const tagName = tag.match(/<([a-zA-Z0-9_-]+)/)?.[1];
      return tagName ? `</${tagName}>` : '';
    })
    .join('');

  // Re-open tags for Part 2 in forward order
  const reopeningTags = openTags.join('');

  let part1 = part1Tokens.join('') + closingTags;
  let part2 = reopeningTags + part2Tokens.join('');

  // Normalize wrapping <p> tags
  const hadP = /^\s*<p[\s>]/i.test(html);
  if (hadP) {
    if (!/^\s*<p[\s>]/i.test(part1)) part1 = `<p>${part1}`;
    if (!/<\/p>\s*$/i.test(part1)) part1 = `${part1}</p>`;
    if (!/^\s*<p[\s>]/i.test(part2)) part2 = `<p>${part2}`;
    if (!/<\/p>\s*$/i.test(part2)) part2 = `${part2}</p>`;
  }

  return [part1.trim(), part2.trim()];
}

/**
 * Splits a paragraph block across a page boundary respecting orphan and widow line protections.
 * Returns [part1, part2] or null if the paragraph cannot be split safely in the available height.
 */
export function splitParagraphBlock(
  p: ParagraphBlock,
  availableHeightPx: number,
  contentWidthPx: number,
  baseFontSizePt: string,
  lineHeightMultiplier: string,
  isPageEmpty: boolean = false
): [ParagraphBlock, ParagraphBlock] | null {
  const { linePx, avgCharWidth } = getTypographyMetrics(baseFontSizePt, lineHeightMultiplier, contentWidthPx);
  const text = (p.html || '').replace(/<[^>]*>/g, '').trim();
  if (!text) return null;

  const effectiveWidth = Math.max(100, contentWidthPx - ((p.indent || 0) * 24));
  const charsPerLine = Math.max(20, Math.floor(effectiveWidth / avgCharWidth));
  const totalLines = Math.max(1, Math.ceil(text.length / charsPerLine));

  // Must have at least 2 lines to split at all
  if (totalLines < 2) return null;

  const topSpacing = p.spacing?.top ?? 0;
  const availableForLines = availableHeightPx - topSpacing - 10;
  let linesThatFit = Math.floor(availableForLines / linePx);

  // Orphan protection: Do not leave a single line at the bottom of the page
  if (linesThatFit < 2) {
    if (!isPageEmpty) return null; // Push entire paragraph to next page
    linesThatFit = 2; // If page is empty, at least fit 2 lines
  }

  // Widow protection: Do not leave a single line at the top of the next page
  const remainingLines = totalLines - linesThatFit;
  if (remainingLines === 1) {
    if (linesThatFit >= 3) {
      linesThatFit -= 1; // Give 2 lines to the next page
    } else if (!isPageEmpty) {
      return null; // Move entire paragraph to next page
    }
  }

  if (linesThatFit <= 0 || linesThatFit >= totalLines) {
    return null;
  }

  const targetChars = Math.round(linesThatFit * charsPerLine);
  const [part1Html, part2Html] = splitParagraphHtml(p.html, targetChars);

  if (!part1Html || !part2Html) {
    return null;
  }

  const part1: ParagraphBlock = {
    ...p,
    id: `${p.id}_split_a`,
    html: part1Html,
    spacing: { top: topSpacing, bottom: 0 },
  };

  const part2: ParagraphBlock = {
    ...p,
    id: `${p.id}_split_b`,
    html: part2Html,
    spacing: { top: 0, bottom: p.spacing?.bottom ?? 10 },
  };

  return [part1, part2];
}

/**
 * Splits a list block across a page boundary.
 * Continuation page retains list styling and correctly increments startNumber for numbered lists.
 */
export function splitListBlock(
  l: ListBlock,
  availableHeightPx: number,
  contentWidthPx: number,
  baseFontSizePt: string,
  lineHeightMultiplier: string
): [ListBlock, ListBlock] | null {
  if (!l.items || l.items.length <= 1) return null;

  const { fontSizePx, avgCharWidth } = getTypographyMetrics(baseFontSizePt, lineHeightMultiplier, contentWidthPx);
  const topSpacing = l.spacing?.top ?? 4;
  let usedHeight = 10 + topSpacing;
  let k = 0;

  for (let i = 0; i < l.items.length; i++) {
    const item = l.items[i];
    const text = (item.text || '').replace(/<[^>]*>/g, '').trim();
    const effectiveWidth = Math.max(100, contentWidthPx - ((item.indent || 0) * 20) - 30);
    const itemCharsPerLine = Math.max(15, Math.floor(effectiveWidth / avgCharWidth));
    const lines = Math.max(1, Math.ceil((text.length || 1) / itemCharsPerLine));
    const itemHeight = Math.round(lines * (fontSizePx * 1.35) + 6);

    if (usedHeight + itemHeight <= availableHeightPx) {
      usedHeight += itemHeight;
      k++;
    } else {
      break;
    }
  }

  if (k < 1 || k >= l.items.length) {
    return null;
  }

  const part1Items = l.items.slice(0, k);
  const part2Items = l.items.slice(k);

  const part1: ListBlock = {
    ...l,
    id: `${l.id}_split_a`,
    items: part1Items,
    spacing: { top: topSpacing, bottom: 0 },
  };

  const part2: ListBlock = {
    ...l,
    id: `${l.id}_split_b`,
    startNumber: (l.startNumber || 1) + k,
    items: part2Items,
    spacing: { top: 0, bottom: l.spacing?.bottom ?? 10 },
  };

  return [part1, part2];
}

/**
 * Splits a table block across a page boundary.
 * If the table has a header row (hasHeader: true), the header is duplicated
 * at the top of the continuation table on the next page for publication fidelity.
 */
export function splitTableBlock(
  t: TableBlock,
  availableHeightPx: number,
  contentWidthPx: number,
  baseFontSizePt: string,
  lineHeightMultiplier: string
): [TableBlock, TableBlock] | null {
  if (!t.data || t.data.length <= 1) return null;

  const { fontSizePx } = getTypographyMetrics(baseFontSizePt, lineHeightMultiplier, contentWidthPx);
  const topSpacing = t.spacing?.top ?? 12;
  let rowPadding = 18;
  if (t.cellPadding === 'compact') rowPadding = 12;
  else if (t.cellPadding === 'relaxed') rowPadding = 26;

  // Calculate height of each individual row
  const rowHeights = t.data.map((row) => {
    let maxLines = 1;
    const colWidth = Math.max(40, contentWidthPx / Math.max(1, t.cols || 1));
    const cellChars = Math.max(8, Math.floor(colWidth / (fontSizePx * 0.5)));
    for (const cell of row || []) {
      const cText = (cell || '').replace(/<[^>]*>/g, '');
      const lines = Math.max(1, Math.ceil(cText.length / cellChars));
      if (lines > maxLines) maxLines = lines;
    }
    return Math.round(maxLines * (fontSizePx * 1.25) + rowPadding);
  });

  const hasHeader = Boolean(t.hasHeader);
  let usedHeight = 20 + topSpacing;

  if (hasHeader) {
    // Header row (row 0) must fit
    usedHeight += rowHeights[0];
    let k = 0; // Number of data rows (rows 1..n) that fit

    for (let r = 1; r < t.data.length; r++) {
      if (usedHeight + rowHeights[r] <= availableHeightPx) {
        usedHeight += rowHeights[r];
        k++;
      } else {
        break;
      }
    }

    // Must fit at least 1 data row along with the header
    if (k < 1 || k >= t.data.length - 1) {
      return null;
    }

    const part1Data = [t.data[0], ...t.data.slice(1, k + 1)];
    const part2Data = [t.data[0], ...t.data.slice(k + 1)]; // Repeat header row!

    const part1: TableBlock = {
      ...t,
      id: `${t.id}_split_a`,
      rows: part1Data.length,
      data: part1Data,
      spacing: { top: topSpacing, bottom: 0 },
    };

    const part2: TableBlock = {
      ...t,
      id: `${t.id}_split_b`,
      rows: part2Data.length,
      data: part2Data,
      hasHeader: true, // Repeated header
      spacing: { top: 0, bottom: t.spacing?.bottom ?? 12 },
    };

    return [part1, part2];
  } else {
    // Table without header row
    let k = 0;
    for (let r = 0; r < t.data.length; r++) {
      if (usedHeight + rowHeights[r] <= availableHeightPx) {
        usedHeight += rowHeights[r];
        k++;
      } else {
        break;
      }
    }

    if (k < 1 || k >= t.data.length) {
      return null;
    }

    const part1Data = t.data.slice(0, k);
    const part2Data = t.data.slice(k);

    const part1: TableBlock = {
      ...t,
      id: `${t.id}_split_a`,
      rows: part1Data.length,
      data: part1Data,
      spacing: { top: topSpacing, bottom: 0 },
    };

    const part2: TableBlock = {
      ...t,
      id: `${t.id}_split_b`,
      rows: part2Data.length,
      data: part2Data,
      spacing: { top: 0, bottom: t.spacing?.bottom ?? 12 },
    };

    return [part1, part2];
  }
}

/**
 * Checks whether any non-break content block exists after the current index in an array.
 */
function hasSubsequentContentInQueue(queue: DocumentBlock[]): boolean {
  for (const b of queue) {
    if (b && b.type !== 'pagebreak' && b.type !== 'sectionbreak') {
      return true;
    }
  }
  return false;
}

/**
 * Automatically paginates document blocks into physical pages with real content splitting.
 * Respects:
 * - Authoritative page geometry and physical usable height
 * - Explicit page breaks without empty leading, consecutive, or trailing pages
 * - Section breaks with independent running headers/footers and numbering restarts
 * - Heading orphan prevention (keepWithNext)
 * - Clean paragraph splitting with orphan and widow line protections
 * - List splitting with continuous numbering
 * - Table splitting with repeated table header row on continuation pages
 * - Atomic preservation of unbreakable blocks (callouts, images, formulas, signatures)
 */
export function paginateDocument(
  docData: DocumentData,
  geometry: PageGeometry
): PaginatedPage[] {
  const pagesList: PaginatedPage[] = [];
  const rawBlocks = docData.blocks || [];

  const hasCoverPage = Boolean(docData.settings.frontPage?.enabled);
  const showBannerOnPage1 = docData.settings.showTitleBanner && !hasCoverPage;
  const titleBannerEstimatedHeight = showBannerOnPage1
    ? calculateTitleBannerHeight(docData, geometry.contentPx.width)
    : 0;

  let currentBlocks: DocumentBlock[] = [];
  let currentHeight = 0;
  let pageCounter = 1;
  let currentDisplayPage = 1;
  let currentOversizedBlockIds: string[] = [];

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

  // Dynamically compute the capacity of a given page based on its header/footer state and Page 1 banner
  const getPageCapacity = (pageIndex: number, headerEnabled: boolean, footerEnabled: boolean): number => {
    const hasFooterContainer = footerEnabled || (docData.settings.pageNumbering && docData.settings.pageNumbering !== 'none');
    const headerFootprint = headerEnabled ? HEADER_LAYOUT.totalHeightPx : 0;
    const footerFootprint = hasFooterContainer ? FOOTER_LAYOUT.totalHeightPx : 0;
    
    let capacity = geometry.contentPx.height - headerFootprint - footerFootprint;

    if (pageIndex === 1 && showBannerOnPage1) {
      capacity -= titleBannerEstimatedHeight;
    }

    return Math.max(100, capacity);
  };

  const commitPage = () => {
    const pageCapacity = getPageCapacity(pageCounter, currentHeader.showHeader, currentFooter.showFooter);
    const isOverflow = currentHeight > pageCapacity;
    const overflowPx = isOverflow ? currentHeight - pageCapacity : 0;

    pagesList.push({
      pageNumber: pageCounter,
      blocks: [...currentBlocks],
      displayPageNumber: currentDisplayPage,
      estimatedHeightPx: currentHeight,
      maxContentHeightPx: pageCapacity,
      isOverflowing: isOverflow,
      hasOversizedBlock: currentOversizedBlockIds.length > 0,
      oversizedBlockIds: [...currentOversizedBlockIds],
      overflowAmountPx: overflowPx,
      headerSettings: { ...currentHeader },
      footerSettings: { ...currentFooter },
    });

    pageCounter++;
    currentDisplayPage++;
    currentBlocks = [];
    currentHeight = 0;
    currentOversizedBlockIds = [];
  };

  // Mutable processing queue initialized with clone of blocks
  const blockQueue: DocumentBlock[] = [...rawBlocks];

  // Safeguard against infinite loops: maximum 5000 iterations
  let loopIterations = 0;
  const maxIterations = 5000;

  while (blockQueue.length > 0 && loopIterations < maxIterations) {
    loopIterations++;
    const block = blockQueue.shift()!;

    // 1. Explicit Page Break handling
    if (block.type === 'pagebreak') {
      if (currentBlocks.length === 0) {
        continue; // Discard leading or consecutive breaks
      }
      if (!hasSubsequentContentInQueue(blockQueue)) {
        continue; // Discard trailing breaks
      }
      commitPage();
      continue;
    }

    // 2. Section Break handling
    if (block.type === 'sectionbreak') {
      if (currentBlocks.length > 0) {
        commitPage();
      }

      const sb = block as SectionBreakBlock;
      if (!sb.inheritHeader && sb.localHeader) {
        currentHeader = {
          showHeader: docData.settings.showHeader,
          headerLeft: sb.localHeader.headerLeft || '',
          headerCenter: sb.localHeader.headerCenter || '',
          headerRight: sb.localHeader.headerRight || '',
        };
      }
      if (!sb.inheritFooter && sb.localFooter) {
        currentFooter = {
          showFooter: docData.settings.showFooter,
          footerLeft: sb.localFooter.footerLeft || '',
          footerCenter: sb.localFooter.footerCenter || '',
          footerRight: sb.localFooter.footerRight || '',
          footerText: sb.localFooter.footerText || '',
        };
      }
      if (sb.pageNumberingMode === 'restart') {
        currentDisplayPage = sb.pageNumberRestartValue || 1;
      }
      continue;
    }

    // 3. Regular block measurement
    const blockHeight = estimateBlockHeight(
      block,
      geometry.contentPx.width,
      docData.settings.fontSize,
      docData.settings.lineHeight
    );

    const pageCapacity = getPageCapacity(pageCounter, currentHeader.showHeader, currentFooter.showFooter);
    const availableHeight = pageCapacity - currentHeight;

    // 4. Heading KeepWithNext: prevent orphaned headings at page bottom
    if (block.type === 'heading' && (block as HeadingBlock).keepWithNext !== false) {
      // Find subsequent content block
      const nextContentBlock = blockQueue.find((b) => b.type !== 'pagebreak' && b.type !== 'sectionbreak');
      let requiredNextSpace = 45; // Default ~2 lines
      if (nextContentBlock) {
        if (nextContentBlock.type === 'list') requiredNextSpace = 35;
        else if (nextContentBlock.type === 'table') requiredNextSpace = 65;
        else if (nextContentBlock.type === 'paragraph') requiredNextSpace = 45;
      }

      if (currentBlocks.length > 0 && currentHeight + blockHeight + requiredNextSpace > pageCapacity) {
        commitPage();
        blockQueue.unshift(block);
        continue;
      }
    }

    // 5. Does the entire block fit on the current page?
    if (blockHeight <= availableHeight) {
      currentBlocks.push(block);
      currentHeight += blockHeight;
      continue;
    }

    // 6. Block does NOT fit entirely. Check if it can be split!
    if (block.type === 'paragraph') {
      const p = block as ParagraphBlock;
      const isPageEmpty = currentBlocks.length === 0;
      const splitTargetHeight = isPageEmpty ? pageCapacity : availableHeight;
      const splitResult = splitParagraphBlock(
        p,
        splitTargetHeight,
        geometry.contentPx.width,
        docData.settings.fontSize,
        docData.settings.lineHeight,
        isPageEmpty
      );

      if (splitResult) {
        const [part1, part2] = splitResult;
        currentBlocks.push(part1);
        currentHeight += estimateBlockHeight(part1, geometry.contentPx.width, docData.settings.fontSize, docData.settings.lineHeight);
        commitPage();
        blockQueue.unshift(part2);
        continue;
      } else if (!isPageEmpty) {
        // Cannot safely split on this filled page (e.g. orphan/widow protection) -> push whole paragraph to next page
        commitPage();
        blockQueue.unshift(block);
        continue;
      } else {
        // Page is empty and paragraph cannot split (e.g. single giant unbreakable line)
        currentBlocks.push(block);
        currentHeight += blockHeight;
        currentOversizedBlockIds.push(block.id);
        commitPage();
        continue;
      }
    }

    if (block.type === 'list') {
      const l = block as ListBlock;
      const isPageEmpty = currentBlocks.length === 0;
      const splitTargetHeight = isPageEmpty ? pageCapacity : availableHeight;
      const splitResult = splitListBlock(
        l,
        splitTargetHeight,
        geometry.contentPx.width,
        docData.settings.fontSize,
        docData.settings.lineHeight
      );

      if (splitResult) {
        const [part1, part2] = splitResult;
        currentBlocks.push(part1);
        currentHeight += estimateBlockHeight(part1, geometry.contentPx.width, docData.settings.fontSize, docData.settings.lineHeight);
        commitPage();
        blockQueue.unshift(part2);
        continue;
      } else if (!isPageEmpty) {
        // Cannot fit even 1 item on this filled page -> push whole list to next page
        commitPage();
        blockQueue.unshift(block);
        continue;
      } else {
        // Single oversized list item on empty page
        currentBlocks.push(block);
        currentHeight += blockHeight;
        currentOversizedBlockIds.push(block.id);
        commitPage();
        continue;
      }
    }

    if (block.type === 'table') {
      const t = block as TableBlock;
      const isPageEmpty = currentBlocks.length === 0;
      const splitTargetHeight = isPageEmpty ? pageCapacity : availableHeight;
      const splitResult = splitTableBlock(
        t,
        splitTargetHeight,
        geometry.contentPx.width,
        docData.settings.fontSize,
        docData.settings.lineHeight
      );

      if (splitResult) {
        const [part1, part2] = splitResult;
        currentBlocks.push(part1);
        currentHeight += estimateBlockHeight(part1, geometry.contentPx.width, docData.settings.fontSize, docData.settings.lineHeight);
        commitPage();
        blockQueue.unshift(part2);
        continue;
      } else if (!isPageEmpty) {
        // Cannot fit even 1 row on this filled page -> push whole table to next page
        commitPage();
        blockQueue.unshift(block);
        continue;
      } else {
        // Single huge row table on empty page
        currentBlocks.push(block);
        currentHeight += blockHeight;
        currentOversizedBlockIds.push(block.id);
        commitPage();
        continue;
      }
    }

    // 7. Atomic / Unbreakable block (heading, image, callout, formula, divider, signature, metadata)
    if (currentBlocks.length > 0) {
      // Current page already has content -> move atomic block to clean next page
      commitPage();
      blockQueue.unshift(block);
      continue;
    } else {
      // Empty page, but atomic block exceeds total page capacity
      currentBlocks.push(block);
      currentHeight += blockHeight;
      currentOversizedBlockIds.push(block.id);
      commitPage();
      continue;
    }
  }

  // Commit last remaining page or at least one empty page if document has no body blocks
  if (currentBlocks.length > 0 || pagesList.length === 0) {
    commitPage();
  }

  return pagesList;
}

/**
 * Summarizes overflow state across all paginated pages for UI badges, warnings, and export safeguards.
 */
export function getDocumentOverflowSummary(pages: PaginatedPage[]): DocumentOverflowSummary {
  const overflowingPages: number[] = [];
  let oversizedBlockCount = 0;
  let maxOverflowPx = 0;

  for (const page of pages) {
    if (page.isOverflowing) {
      overflowingPages.push(page.pageNumber);
      if (page.overflowAmountPx > maxOverflowPx) {
        maxOverflowPx = page.overflowAmountPx;
      }
    }
    if (page.hasOversizedBlock) {
      oversizedBlockCount += page.oversizedBlockIds.length;
    }
  }

  const hasOverflow = overflowingPages.length > 0;
  let message = 'All content fits within physical page boundaries.';
  if (hasOverflow) {
    const pageStr = overflowingPages.length === 1 ? `Page ${overflowingPages[0]}` : `Pages ${overflowingPages.join(', ')}`;
    if (oversizedBlockCount > 0) {
      message = `${pageStr} exceeds physical page capacity due to oversized atomic content blocks (e.g. large images or signature cards).`;
    } else {
      message = `${pageStr} exceeds printable page capacity (~${maxOverflowPx}px overflow).`;
    }
  }

  return {
    hasOverflow,
    totalOverflowingPages: overflowingPages.length,
    overflowingPages,
    oversizedBlockCount,
    maxOverflowPx,
    message,
  };
}
