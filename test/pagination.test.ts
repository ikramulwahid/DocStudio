import { getPageGeometry, HEADER_LAYOUT, FOOTER_LAYOUT } from '../src/services/pageGeometry';
import { paginateDocument, calculateTitleBannerHeight, getDocumentOverflowSummary } from '../src/services/paginationService';
import { DocumentData, DocumentBlock, HeadingBlock, ParagraphBlock, TableBlock, SectionBreakBlock, PageBreakBlock, DocumentSettings } from '../src/types/document';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ ${testName}${detail ? `: ${detail}` : ''}`);
  }
}

function createDummyDoc(blocks: DocumentBlock[], overrides?: Partial<DocumentData>): DocumentData {
  const defaultSettings: DocumentSettings = {
    template: 'blank',
    pageSize: 'a4',
    orientation: 'portrait',
    margins: 'normal',
    fontFamily: 'Inter',
    fontSize: '11pt',
    lineHeight: '1.3',
    showHeader: true,
    headerLeft: 'Header Left',
    headerCenter: 'Header Center',
    headerRight: 'Header Right',
    showFooter: true,
    footerText: 'Footer Text',
    pageNumbering: 'Page X of Y',
    showTitleBanner: true,
    showWatermark: false,
    watermarkText: 'CONFIDENTIAL',
    showTableBorders: true,
    headingNumberingScheme: '1.1',
    ...(overrides?.settings || {}),
  };

  return {
    schemaVersion: 2,
    id: 'test-doc',
    metadata: {
      title: 'Test Document',
      subtitle: 'Test Subtitle',
      author: 'Jane Doe',
      organization: 'Acme Corp',
      referenceId: 'DOC-1234',
      status: 'Final',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    settings: defaultSettings,
    blocks,
    ...overrides,
  };
}

console.log('=== RUNNING DOCSTUDIO PAGINATION & GEOMETRY TEST SUITE ===\n');

// 1. PAPER SIZES & ORIENTATIONS
console.log('Test Group 1: Paper Sizes and Orientations (Portrait & Landscape)');
{
  // A4 Portrait
  const a4p = getPageGeometry('a4', 'portrait', 'normal');
  assert(a4p.pageMm.width === 210 && a4p.pageMm.height === 297, 'A4 portrait mm dimensions (210 x 297)');
  assert(a4p.pagePx.width === 794 && a4p.pagePx.height === 1123, 'A4 portrait px dimensions (794 x 1123 @ 96 DPI)');

  // A4 Landscape
  const a4l = getPageGeometry('a4', 'landscape', 'normal');
  assert(a4l.pageMm.width === 297 && a4l.pageMm.height === 210, 'A4 landscape mm dimensions (297 x 210)');
  assert(a4l.pagePx.width === 1123 && a4l.pagePx.height === 794, 'A4 landscape px dimensions (1123 x 794)');

  // US Letter Portrait
  const letterp = getPageGeometry('letter', 'portrait', 'normal');
  assert(letterp.pageMm.width === 215.9 && letterp.pageMm.height === 279.4, 'Letter portrait mm dimensions (215.9 x 279.4)');
  assert(letterp.pagePx.width === 816 && letterp.pagePx.height === 1056, 'Letter portrait px dimensions (816 x 1056)');

  // US Letter Landscape
  const letterl = getPageGeometry('letter', 'landscape', 'normal');
  assert(letterl.pageMm.width === 279.4 && letterl.pageMm.height === 215.9, 'Letter landscape mm dimensions (279.4 x 215.9)');
  assert(letterl.pagePx.width === 1056 && letterl.pagePx.height === 816, 'Letter landscape px dimensions (1056 x 816)');

  // US Legal Portrait
  const legalp = getPageGeometry('legal', 'portrait', 'normal');
  assert(legalp.pageMm.width === 215.9 && legalp.pageMm.height === 355.6, 'Legal portrait mm dimensions (215.9 x 355.6)');
  assert(legalp.pagePx.width === 816 && legalp.pagePx.height === 1344, 'Legal portrait px dimensions (816 x 1344)');

  // US Legal Landscape
  const legall = getPageGeometry('legal', 'landscape', 'normal');
  assert(legall.pageMm.width === 355.6 && legall.pageMm.height === 215.9, 'Legal landscape mm dimensions (355.6 x 215.9)');
  assert(legall.pagePx.width === 1344 && legall.pagePx.height === 816, 'Legal landscape px dimensions (1344 x 816)');
}

// 2. MARGIN PRESETS & USABLE CONTENT AREA
console.log('\nTest Group 2: Margin Presets & Content Area Precision');
{
  // Normal (25.4mm = 1 inch = 96px)
  const normalGeo = getPageGeometry('a4', 'portrait', 'normal');
  assert(normalGeo.marginsMm.top === 25.4 && normalGeo.marginsMm.left === 25.4, 'Normal margins mm is exactly 25.4mm');
  assert(normalGeo.marginsPx.top === 96 && normalGeo.marginsPx.left === 96, 'Normal margins px is exactly 96px');
  assert(normalGeo.contentPx.width === 794 - 192, 'Normal content width is pagePx.width - 2*96 (602px)');
  assert(normalGeo.contentPx.height === 1123 - 192, 'Normal content height is pagePx.height - 2*96 (931px)');

  // Narrow (12.7mm = 0.5 inch = 48px)
  const narrowGeo = getPageGeometry('a4', 'portrait', 'narrow');
  assert(narrowGeo.marginsMm.top === 12.7, 'Narrow margins mm is 12.7mm');
  assert(narrowGeo.marginsPx.top === 48, 'Narrow margins px is 48px');

  // Wide (38.1mm = 1.5 inch = 144px)
  const wideGeo = getPageGeometry('a4', 'portrait', 'wide');
  assert(wideGeo.marginsMm.top === 38.1, 'Wide margins mm is 38.1mm');
  assert(wideGeo.marginsPx.top === 144, 'Wide margins px is 144px');

  // Compact (18.0mm = ~68px)
  const compactGeo = getPageGeometry('a4', 'portrait', 'compact');
  assert(compactGeo.marginsMm.top === 18.0, 'Compact margins mm is 18.0mm');
  assert(compactGeo.marginsPx.top === 68, 'Compact margins px is 68px');
}

// 3. HEADER & FOOTER CAPACITY COMBINATIONS
console.log('\nTest Group 3: Header / Footer Enabled & Disabled Capacity Combinations');
{
  const baseContentHeight = 931; // A4 portrait normal margins: 1123 - 192 = 931px

  // Both enabled
  const bothEnabled = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');
  assert(bothEnabled.headerHeightPx === HEADER_LAYOUT.totalHeightPx, 'Header footprint is 53px when enabled');
  assert(bothEnabled.footerHeightPx === FOOTER_LAYOUT.totalHeightPx, 'Footer footprint is 53px when enabled');
  assert(bothEnabled.usableBodyHeightPx === baseContentHeight - 53 - 53, 'Usable body height accounts for both header and footer (825px)');

  // Both disabled (pageNumbering = 'none')
  const bothDisabled = getPageGeometry('a4', 'portrait', 'normal', false, false, 'none');
  assert(bothDisabled.headerHeightPx === 0, 'Header footprint is 0px when disabled');
  assert(bothDisabled.footerHeightPx === 0, 'Footer footprint is 0px when disabled and page numbering is none');
  assert(bothDisabled.usableBodyHeightPx === baseContentHeight, 'Usable body height reserves zero space for disabled header/footer');

  // Header disabled, Footer enabled
  const headerOff = getPageGeometry('a4', 'portrait', 'normal', false, true, 'Page X of Y');
  assert(headerOff.headerHeightPx === 0, 'Header is 0px when disabled');
  assert(headerOff.footerHeightPx === 53, 'Footer is 53px when enabled');
  assert(headerOff.usableBodyHeightPx === baseContentHeight - 53, 'Usable body height only reserves space for footer');

  // Footer text disabled, but page numbering enabled
  const pageNumOnly = getPageGeometry('a4', 'portrait', 'normal', false, false, 'X / Y');
  assert(pageNumOnly.footerHeightPx === 53, 'Footer container footprint is 53px when pageNumbering is active even if showFooter is false');
}

// 4. EXPLICIT PAGE BREAK HANDLING (LEADING, CONSECUTIVE, TRAILING)
console.log('\nTest Group 4: Page Break Handling (Leading, Consecutive, Trailing)');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');
  const p1: ParagraphBlock = { id: 'p1', type: 'paragraph', html: '<p>First paragraph content</p>' };
  const p2: ParagraphBlock = { id: 'p2', type: 'paragraph', html: '<p>Second paragraph content</p>' };
  const pb: PageBreakBlock = { id: 'pb1', type: 'pagebreak', breakType: 'page' };

  // Case A: Leading page break [pagebreak, p1]
  const docLeading = createDummyDoc([pb, p1]);
  const pagesLeading = paginateDocument(docLeading, geo);
  assert(pagesLeading.length === 1, 'Leading page break does not produce an unintended empty page (1 page total)');
  assert(pagesLeading[0].blocks[0].id === 'p1', 'Page 1 contains the first content block directly');

  // Case B: Consecutive page breaks [p1, pagebreak, pagebreak, p2]
  const docConsecutive = createDummyDoc([p1, pb, { id: 'pb2', type: 'pagebreak', breakType: 'page' }, p2]);
  const pagesConsecutive = paginateDocument(docConsecutive, geo);
  assert(pagesConsecutive.length === 2, 'Consecutive page breaks do not produce an empty middle page (2 pages total)');
  assert(pagesConsecutive[0].blocks.length === 1 && pagesConsecutive[0].blocks[0].id === 'p1', 'Page 1 has p1');
  assert(pagesConsecutive[1].blocks.length === 1 && pagesConsecutive[1].blocks[0].id === 'p2', 'Page 2 has p2');

  // Case C: Trailing page break [p1, pagebreak]
  const docTrailing = createDummyDoc([p1, pb]);
  const pagesTrailing = paginateDocument(docTrailing, geo);
  assert(pagesTrailing.length === 1, 'Trailing page break does not produce an unintended empty page at document end');

  // Case D: Multiple consecutive trailing page breaks [p1, pagebreak, pagebreak]
  const docMultiTrailing = createDummyDoc([p1, pb, { id: 'pb3', type: 'pagebreak', breakType: 'page' }]);
  const pagesMultiTrailing = paginateDocument(docMultiTrailing, geo);
  assert(pagesMultiTrailing.length === 1, 'Multiple trailing page breaks do not produce empty trailing pages');

  // Case E: Document with only page breaks [pagebreak, pagebreak]
  const docOnlyBreaks = createDummyDoc([pb, { id: 'pb4', type: 'pagebreak', breakType: 'page' }]);
  const pagesOnlyBreaks = paginateDocument(docOnlyBreaks, geo);
  assert(pagesOnlyBreaks.length === 1, 'Document with only page breaks produces exactly 1 empty template page');

  // Case F: Intentional page breaks between sections [p1, pagebreak, p2]
  const docStandardBreak = createDummyDoc([p1, pb, p2]);
  const pagesStandardBreak = paginateDocument(docStandardBreak, geo);
  assert(pagesStandardBreak.length === 2, 'Intentional page break between paragraphs creates clean 2 pages');
}

// 5. SECTION BREAKS & PAGE NUMBER RESTARTS
console.log('\nTest Group 5: Section Breaks, Local Headers/Footers & Page Number Restarts');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');
  const p1: ParagraphBlock = { id: 'p1', type: 'paragraph', html: '<p>Section 1 Paragraph</p>' };
  const p2: ParagraphBlock = { id: 'p2', type: 'paragraph', html: '<p>Section 2 Paragraph</p>' };
  const sb: SectionBreakBlock = {
    id: 'sb1',
    type: 'sectionbreak',
    breakMode: 'next-page',
    title: 'Appendix A',
    pageNumberingMode: 'restart',
    pageNumberRestartValue: 1,
    inheritHeader: false,
    localHeader: {
      headerLeft: 'Appendix A: Research Data',
      headerRight: 'REF-APP-1',
    },
    inheritFooter: false,
    localFooter: {
      footerText: 'Confidential Appendix',
    },
  };

  const doc = createDummyDoc([p1, sb, p2]);
  const pages = paginateDocument(doc, geo);
  assert(pages.length === 2, 'Section break creates 2 distinct pages');
  assert(pages[0].displayPageNumber === 1, 'Section 1 page has displayPageNumber = 1');
  assert(pages[1].displayPageNumber === 1, 'Section 2 restarts page numbering at 1');
  assert(pages[1].headerSettings.headerLeft === 'Appendix A: Research Data', 'Section 2 overrides header text');
  assert(pages[1].footerSettings.footerText === 'Confidential Appendix', 'Section 2 overrides footer text');

  // Section break preceded by pagebreak should not create an extra blank page
  const docWithBoth = createDummyDoc([p1, { id: 'pb1', type: 'pagebreak', breakType: 'page' }, sb, p2]);
  const pagesWithBoth = paginateDocument(docWithBoth, geo);
  assert(pagesWithBoth.length === 2, 'Page break followed by section break does not create an empty intermediate page');
}

// 6. HEADING ORPHAN PREVENTION (keepWithNext)
console.log('\nTest Group 6: Heading Orphan Prevention (keepWithNext)');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');
  // Fill page with paragraphs until near capacity (~600px of content)
  const fillerBlocks: DocumentBlock[] = [];
  for (let i = 0; i < 14; i++) {
    fillerBlocks.push({
      id: `fill_${i}`,
      type: 'paragraph',
      html: '<p>This is standard content that fills the page body cleanly without exceeding limits in layout testing.</p>',
    });
  }

  const headingBlock: HeadingBlock = {
    id: 'boundary_heading',
    type: 'heading',
    mode: 'plain',
    level: 1,
    text: 'Chapter 2: Detailed Analysis',
    keepWithNext: true,
  };

  const nextParagraph: ParagraphBlock = {
    id: 'chapter_p1',
    type: 'paragraph',
    html: '<p>Opening paragraph of chapter 2 that belongs with the heading.</p>',
  };

  const doc = createDummyDoc([...fillerBlocks, headingBlock, nextParagraph]);
  const pages = paginateDocument(doc, geo);
  assert(pages.length >= 2, 'Document paginates across 2 or more pages');
  // Heading should not be isolated alone at the end of page 1 if its following paragraph cannot fit
  const page1Heading = pages[0].blocks.find((b) => b.id === 'boundary_heading');
  const page2Heading = pages[1].blocks.find((b) => b.id === 'boundary_heading');
  assert(!page1Heading && page2Heading !== undefined, 'Heading is pushed to page 2 together with its next paragraph rather than orphaned');
}

// 7. OVERSIZED BLOCKS & OVERFLOW DETECTION
console.log('\nTest Group 7: Oversized Blocks & Overflow Detection');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');
  
  // Create an oversized paragraph (e.g., 3000 words)
  const hugeText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100);
  const oversizedP: ParagraphBlock = {
    id: 'huge_para',
    type: 'paragraph',
    html: `<p>${hugeText}</p>`,
  };

  const doc = createDummyDoc([oversizedP]);
  const pages = paginateDocument(doc, geo);
  assert(pages.length === 1, 'Oversized paragraph is preserved on page');
  assert(pages[0].isOverflowing === true, 'Oversized block is identified as overflowing');
  assert(pages[0].hasOversizedBlock === true, 'Page is marked with hasOversizedBlock: true');
  assert(pages[0].oversizedBlockIds.includes('huge_para'), 'Oversized block ID is tracked');
  assert(pages[0].overflowAmountPx > 0, 'Overflow amount in px is calculated (> 0)');

  // Verify getDocumentOverflowSummary
  const summary = getDocumentOverflowSummary(pages);
  assert(summary.hasOverflow === true, 'Document overflow summary reports hasOverflow: true');
  assert(summary.totalOverflowingPages === 1, 'Total overflowing pages is 1');
  assert(summary.oversizedBlockCount === 1, 'Oversized block count is 1');

  // Verify oversized table (e.g. 40 rows)
  const tableRows: string[][] = [];
  for (let r = 0; r < 40; r++) {
    tableRows.push([`Row ${r} Col 1`, `Row ${r} Col 2`, `Row ${r} Col 3`]);
  }
  const oversizedTable: TableBlock = {
    id: 'huge_table',
    type: 'table',
    rows: 40,
    cols: 3,
    data: tableRows,
    hasHeader: true,
  };
  const docTable = createDummyDoc([oversizedTable]);
  const pagesTable = paginateDocument(docTable, geo);
  assert(pagesTable[0].isOverflowing === true, 'Oversized table is identified as overflowing');
  assert(pagesTable[0].hasOversizedBlock === true, 'Oversized table sets hasOversizedBlock');
}

// 8. PAGE 1 TITLE BANNER & COVER PAGE INTERACTIONS
console.log('\nTest Group 8: Page 1 Title Banner & Cover Page Interactions');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');
  const bannerHeight = calculateTitleBannerHeight(
    createDummyDoc([]),
    geo.contentPx.width
  );
  assert(bannerHeight >= 90 && bannerHeight <= 180, `Page 1 banner height is calculated realistically (~${bannerHeight}px)`);

  // Document with showTitleBanner = true and NO cover page
  const docWithBanner = createDummyDoc([
    { id: 'p1', type: 'paragraph', html: '<p>Intro content</p>' }
  ], {
    settings: {
      template: 'blank',
      headerLeft: '',
      headerRight: '',
      footerText: '',
      pageSize: 'a4',
      orientation: 'portrait',
      margins: 'normal',
      fontFamily: 'Inter',
      fontSize: '11pt',
      lineHeight: '1.3',
      showHeader: true,
      showFooter: true,
      pageNumbering: 'Page X of Y',
      showTitleBanner: true,
      showWatermark: false,
      watermarkText: '',
      showTableBorders: true,
      headingNumberingScheme: '1.1',
    }
  });
  const pagesWithBanner = paginateDocument(docWithBanner, geo);
  assert(pagesWithBanner[0].maxContentHeightPx < geo.usableBodyHeightPx, 'Page 1 capacity reserves space for Title Banner when enabled');

  // Document with Cover Page enabled (Title banner should not take space from Page 1 body)
  const docWithCover = createDummyDoc([
    { id: 'p1', type: 'paragraph', html: '<p>Intro content</p>' }
  ], {
    settings: {
      template: 'blank',
      headerLeft: '',
      headerRight: '',
      footerText: '',
      pageSize: 'a4',
      orientation: 'portrait',
      margins: 'normal',
      fontFamily: 'Inter',
      fontSize: '11pt',
      lineHeight: '1.3',
      showHeader: true,
      showFooter: true,
      pageNumbering: 'Page X of Y',
      showTitleBanner: true,
      showWatermark: false,
      watermarkText: '',
      showTableBorders: true,
      headingNumberingScheme: '1.1',
      frontPage: {
        enabled: true,
        theme: 'modern-geometric',
        border: {
          enabled: false,
          style: 'solid',
          thickness: 1,
          color: '#000000',
          inset: 24,
        },
        visibleFields: ['title', 'subtitle', 'author', 'organization', 'date', 'status'],
        accentColor: '#2563EB',
      }
    }
  });
  const pagesWithCover = paginateDocument(docWithCover, geo);
  assert(pagesWithCover[0].maxContentHeightPx === geo.usableBodyHeightPx, 'Page 1 capacity retains full space when cover page is enabled');
}

console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY! ✓\n');
}
