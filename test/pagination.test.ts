import { getPageGeometry, HEADER_LAYOUT, FOOTER_LAYOUT } from '../src/services/pageGeometry';
import { 
  paginateDocument, 
  calculateTitleBannerHeight, 
  getDocumentOverflowSummary,
  splitParagraphHtml,
  splitParagraphBlock,
  splitListBlock,
  splitTableBlock
} from '../src/services/paginationService';
import { 
  DocumentData, 
  DocumentBlock, 
  HeadingBlock, 
  ParagraphBlock, 
  ListBlock, 
  TableBlock, 
  SignatureBlock, 
  CalloutBlock, 
  ImageBlock, 
  SectionBreakBlock, 
  PageBreakBlock, 
  DocumentSettings 
} from '../src/types/document';

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

console.log('=== RUNNING DOCSTUDIO STAGE 2 PAGINATION, CONTENT SPLITTING & FIDELITY TEST SUITE ===\n');

// 1. PAPER SIZES & ORIENTATIONS
console.log('Test Group 1: Paper Sizes and Orientations (Portrait & Landscape)');
{
  const a4p = getPageGeometry('a4', 'portrait', 'normal');
  assert(a4p.pageMm.width === 210 && a4p.pageMm.height === 297, 'A4 portrait mm dimensions (210 x 297)');
  assert(a4p.pagePx.width === 794 && a4p.pagePx.height === 1123, 'A4 portrait px dimensions (794 x 1123 @ 96 DPI)');

  const a4l = getPageGeometry('a4', 'landscape', 'normal');
  assert(a4l.pageMm.width === 297 && a4l.pageMm.height === 210, 'A4 landscape mm dimensions (297 x 210)');
  assert(a4l.pagePx.width === 1123 && a4l.pagePx.height === 794, 'A4 landscape px dimensions (1123 x 794)');

  const letterp = getPageGeometry('letter', 'portrait', 'normal');
  assert(letterp.pageMm.width === 215.9 && letterp.pageMm.height === 279.4, 'Letter portrait mm dimensions (215.9 x 279.4)');
  assert(letterp.pagePx.width === 816 && letterp.pagePx.height === 1056, 'Letter portrait px dimensions (816 x 1056)');

  const letterl = getPageGeometry('letter', 'landscape', 'normal');
  assert(letterl.pageMm.width === 279.4 && letterl.pageMm.height === 215.9, 'Letter landscape mm dimensions (279.4 x 215.9)');
  assert(letterl.pagePx.width === 1056 && letterl.pagePx.height === 816, 'Letter landscape px dimensions (1056 x 816)');

  const legalp = getPageGeometry('legal', 'portrait', 'normal');
  assert(legalp.pageMm.width === 215.9 && legalp.pageMm.height === 355.6, 'Legal portrait mm dimensions (215.9 x 355.6)');
  assert(legalp.pagePx.width === 816 && legalp.pagePx.height === 1344, 'Legal portrait px dimensions (816 x 1344)');

  const legall = getPageGeometry('legal', 'landscape', 'normal');
  assert(legall.pageMm.width === 355.6 && legall.pageMm.height === 215.9, 'Legal landscape mm dimensions (355.6 x 215.9)');
  assert(legall.pagePx.width === 1344 && legall.pagePx.height === 816, 'Legal landscape px dimensions (1344 x 816)');
}

// 2. MARGIN PRESETS & USABLE CONTENT AREA
console.log('\nTest Group 2: Margin Presets & Content Area Precision');
{
  const normalGeo = getPageGeometry('a4', 'portrait', 'normal');
  assert(normalGeo.marginsMm.top === 25.4 && normalGeo.marginsMm.left === 25.4, 'Normal margins mm is exactly 25.4mm');
  assert(normalGeo.marginsPx.top === 96 && normalGeo.marginsPx.left === 96, 'Normal margins px is exactly 96px');
  assert(normalGeo.contentPx.width === 794 - 192, 'Normal content width is pagePx.width - 2*96 (602px)');
  assert(normalGeo.contentPx.height === 1123 - 192, 'Normal content height is pagePx.height - 2*96 (931px)');

  const narrowGeo = getPageGeometry('a4', 'portrait', 'narrow');
  assert(narrowGeo.marginsMm.top === 12.7, 'Narrow margins mm is 12.7mm');
  assert(narrowGeo.marginsPx.top === 48, 'Narrow margins px is 48px');

  const wideGeo = getPageGeometry('a4', 'portrait', 'wide');
  assert(wideGeo.marginsMm.top === 38.1, 'Wide margins mm is 38.1mm');
  assert(wideGeo.marginsPx.top === 144, 'Wide margins px is 144px');

  const compactGeo = getPageGeometry('a4', 'portrait', 'compact');
  assert(compactGeo.marginsMm.top === 18.0, 'Compact margins mm is 18.0mm');
  assert(compactGeo.marginsPx.top === 68, 'Compact margins px is 68px');
}

// 3. HEADER & FOOTER CAPACITY COMBINATIONS
console.log('\nTest Group 3: Header / Footer Enabled & Disabled Capacity Combinations');
{
  const baseContentHeight = 931;

  const bothEnabled = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');
  assert(bothEnabled.headerHeightPx === HEADER_LAYOUT.totalHeightPx, 'Header footprint is 53px when enabled');
  assert(bothEnabled.footerHeightPx === FOOTER_LAYOUT.totalHeightPx, 'Footer footprint is 53px when enabled');
  assert(bothEnabled.usableBodyHeightPx === baseContentHeight - 53 - 53, 'Usable body height accounts for both header and footer (825px)');

  const bothDisabled = getPageGeometry('a4', 'portrait', 'normal', false, false, 'none');
  assert(bothDisabled.headerHeightPx === 0, 'Header footprint is 0px when disabled');
  assert(bothDisabled.footerHeightPx === 0, 'Footer footprint is 0px when disabled and page numbering is none');
  assert(bothDisabled.usableBodyHeightPx === baseContentHeight, 'Usable body height reserves zero space for disabled header/footer');

  const headerOff = getPageGeometry('a4', 'portrait', 'normal', false, true, 'Page X of Y');
  assert(headerOff.headerHeightPx === 0, 'Header is 0px when disabled');
  assert(headerOff.footerHeightPx === 53, 'Footer is 53px when enabled');
  assert(headerOff.usableBodyHeightPx === baseContentHeight - 53, 'Usable body height only reserves space for footer');

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

  // Leading page break
  const docLeading = createDummyDoc([pb, p1]);
  const pagesLeading = paginateDocument(docLeading, geo);
  assert(pagesLeading.length === 1, 'Leading page break does not produce an unintended empty page (1 page total)');
  assert(pagesLeading[0].blocks[0].id === 'p1', 'Page 1 contains the first content block directly');

  // Consecutive page breaks
  const docConsecutive = createDummyDoc([p1, pb, { id: 'pb2', type: 'pagebreak', breakType: 'page' }, p2]);
  const pagesConsecutive = paginateDocument(docConsecutive, geo);
  assert(pagesConsecutive.length === 2, 'Consecutive page breaks do not produce an empty middle page (2 pages total)');
  assert(pagesConsecutive[0].blocks[0].id === 'p1', 'Page 1 has p1');
  assert(pagesConsecutive[1].blocks[0].id === 'p2', 'Page 2 has p2');

  // Trailing page break
  const docTrailing = createDummyDoc([p1, pb]);
  const pagesTrailing = paginateDocument(docTrailing, geo);
  assert(pagesTrailing.length === 1, 'Trailing page break does not produce an unintended empty page at document end');

  // Multiple consecutive trailing page breaks
  const docMultiTrailing = createDummyDoc([p1, pb, { id: 'pb3', type: 'pagebreak', breakType: 'page' }]);
  const pagesMultiTrailing = paginateDocument(docMultiTrailing, geo);
  assert(pagesMultiTrailing.length === 1, 'Multiple trailing page breaks do not produce empty trailing pages');

  // Document with only page breaks
  const docOnlyBreaks = createDummyDoc([pb, { id: 'pb4', type: 'pagebreak', breakType: 'page' }]);
  const pagesOnlyBreaks = paginateDocument(docOnlyBreaks, geo);
  assert(pagesOnlyBreaks.length === 1, 'Document with only page breaks produces exactly 1 empty template page');

  // Intentional page breaks between sections
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

  const docWithBoth = createDummyDoc([p1, { id: 'pb1', type: 'pagebreak', breakType: 'page' }, sb, p2]);
  const pagesWithBoth = paginateDocument(docWithBoth, geo);
  assert(pagesWithBoth.length === 2, 'Page break followed by section break does not create an empty intermediate page');
}

// 6. HEADING ORPHAN PREVENTION (keepWithNext)
console.log('\nTest Group 6: Heading Orphan Prevention (keepWithNext)');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');
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
  const page1Heading = pages[0].blocks.find((b) => b.id === 'boundary_heading');
  const page2Heading = pages[1].blocks.find((b) => b.id === 'boundary_heading');
  assert(!page1Heading && page2Heading !== undefined, 'Heading is pushed to page 2 together with its next paragraph rather than orphaned');
}

// 7. CONTENT SPLITTING: PARAGRAPHS ACROSS PAGES
console.log('\nTest Group 7: Paragraph Splitting with Orphan/Widow Protection');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');

  // Test splitParagraphHtml directly
  const htmlSample = '<p>Alpha beta gamma <strong>delta epsilon zeta</strong> eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega.</p>';
  const [part1, part2] = splitParagraphHtml(htmlSample, 45);
  assert(part1.startsWith('<p>') && part1.endsWith('</p>'), 'HTML split Part 1 is properly wrapped in <p>');
  assert(part2.startsWith('<p>') && part2.endsWith('</p>'), 'HTML split Part 2 is properly wrapped in <p>');
  assert(part1.includes('delta') && (part1.includes('</strong>') || !part1.includes('<strong>')), 'HTML split properly closes tags');

  // Test paragraph splitting across pages
  // A long paragraph (approx 50 lines) that cannot fit on Page 1
  const sentences = 'The enterprise cloud architecture accelerates automated regulatory verification protocols and eliminates operational latency across distributed environments. ';
  const longText = sentences.repeat(35); // ~4500 characters, ~60 lines
  const longParagraph: ParagraphBlock = {
    id: 'long_para_1',
    type: 'paragraph',
    html: `<p>${longText}</p>`,
    align: 'justify',
  };

  const docLongPara = createDummyDoc([longParagraph]);
  const pagesLongPara = paginateDocument(docLongPara, geo);
  assert(pagesLongPara.length >= 2, `Long paragraph cleanly splits across pages (actual pages: ${pagesLongPara.length})`);
  assert(pagesLongPara[0].isOverflowing === false, 'Page 1 has no overflow after paragraph split');
  assert(pagesLongPara[1].isOverflowing === false, 'Page 2 has no overflow after paragraph split');

  // Both pages contain parts of the paragraph
  const p1Blocks = pagesLongPara[0].blocks.filter((b) => b.type === 'paragraph');
  const p2Blocks = pagesLongPara[1].blocks.filter((b) => b.type === 'paragraph');
  assert(p1Blocks.length > 0 && p2Blocks.length > 0, 'Both pages contain split paragraph chunks');

  // Spacing contract at split boundary: Part 1 has zero bottom margin, Part 2 has zero top margin
  const splitA = p1Blocks[p1Blocks.length - 1] as ParagraphBlock;
  const splitB = p2Blocks[0] as ParagraphBlock;
  assert(splitA.spacing?.bottom === 0, 'Split Part 1 has zero bottom spacing for seamless page break');
  assert(splitB.spacing?.top === 0, 'Split Part 2 has zero top spacing for seamless continuation');
}

// 8. CONTENT SPLITTING: MULTI-ROW TABLES & HEADER REPETITION
console.log('\nTest Group 8: Multi-row Table Splitting with Repeated Headers');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');

  // 40-row table with header
  const tableRows: string[][] = [
    ['Product Name', 'SKU Category', 'Unit Price', 'Quarterly Volume', 'Gross Margin']
  ];
  for (let r = 1; r <= 40; r++) {
    tableRows.push([`Enterprise License Pack ${r}`, 'Software Tier A', `$${(r * 450).toLocaleString()}`, `${r * 120} units`, `${65 + (r % 15)}%`]);
  }

  const largeTable: TableBlock = {
    id: 'large_table_1',
    type: 'table',
    rows: 41,
    cols: 5,
    hasHeader: true,
    data: tableRows,
    colWidths: [28, 20, 18, 18, 16],
  };

  const docTable = createDummyDoc([largeTable]);
  const pagesTable = paginateDocument(docTable, geo);
  assert(pagesTable.length >= 2, `Large table splits across pages (actual pages: ${pagesTable.length})`);
  assert(pagesTable[0].isOverflowing === false, 'Page 1 does not overflow with table splitting');
  assert(pagesTable[1].isOverflowing === false, 'Page 2 does not overflow with table splitting');

  // Verify that continuation table on Page 2 repeats the header row
  const tablePage1 = pagesTable[0].blocks.find((b) => b.type === 'table') as TableBlock;
  const tablePage2 = pagesTable[1].blocks.find((b) => b.type === 'table') as TableBlock;
  assert(tablePage1 !== undefined && tablePage2 !== undefined, 'Both pages have table blocks');
  assert(tablePage1.hasHeader === true, 'Page 1 table hasHeader is true');
  assert(tablePage2.hasHeader === true, 'Page 2 continuation table hasHeader is true');
  assert(tablePage2.data[0][0] === 'Product Name', 'Page 2 table header row is duplicated with column names');
  assert(tablePage2.data[1][0] !== 'Product Name', 'Page 2 subsequent row is actual data row');
}

// 9. CONTENT SPLITTING: LISTS & CONTINUOUS NUMBERING
console.log('\nTest Group 9: List Splitting with Continuous Numbering');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');

  // Create 35-item numbered list
  const listItems = [];
  for (let i = 1; i <= 35; i++) {
    listItems.push({
      id: `item_${i}`,
      text: `Strategic milestone checkpoint ${i}: Comprehensive protocol verification and compliance sign-off across all active regional branches.`,
      indent: 0,
    });
  }

  const longList: ListBlock = {
    id: 'long_list_1',
    type: 'list',
    listType: 'numbered',
    numberedStyle: 'decimal',
    startNumber: 1,
    items: listItems,
  };

  const docList = createDummyDoc([longList]);
  const pagesList = paginateDocument(docList, geo);
  assert(pagesList.length >= 2, `Long list splits across pages (actual pages: ${pagesList.length})`);
  assert(pagesList[0].isOverflowing === false, 'Page 1 does not overflow with list splitting');

  const listPage1 = pagesList[0].blocks.find((b) => b.type === 'list') as ListBlock;
  const listPage2 = pagesList[1].blocks.find((b) => b.type === 'list') as ListBlock;
  assert(listPage1 !== undefined && listPage2 !== undefined, 'Both pages have list blocks');
  assert(listPage1.startNumber === 1, 'Page 1 list starts at 1');
  const expectedStartNumber = 1 + listPage1.items.length;
  assert(listPage2.startNumber === expectedStartNumber, `Page 2 list continuous startNumber is ${expectedStartNumber}`);
}

// 10. ATOMIC BLOCKS PRESERVATION (SIGNATURES, CALLOUTS, IMAGES)
console.log('\nTest Group 10: Atomic Blocks Preservation (Unbreakable)');
{
  const geo = getPageGeometry('a4', 'portrait', 'normal', true, true, 'Page X of Y');

  // Fill page near capacity
  const fillerBlocks: DocumentBlock[] = [];
  for (let i = 0; i < 12; i++) {
    fillerBlocks.push({
      id: `p_fill_${i}`,
      type: 'paragraph',
      html: '<p>Regular paragraph content filling up the usable body space in test verification.</p>',
    });
  }

  const sigBlock: SignatureBlock = {
    id: 'sig_1',
    type: 'signature',
    layout: 'side-by-side',
    signers: [
      { id: 's1', name: 'Alice Smith', title: 'CEO', organization: 'Acme', date: '2026-01-01' },
      { id: 's2', name: 'Bob Jones', title: 'CTO', organization: 'Acme', date: '2026-01-01' },
    ],
  };

  const docSig = createDummyDoc([...fillerBlocks, sigBlock]);
  const pagesSig = paginateDocument(docSig, geo);
  assert(pagesSig.length >= 2, 'Document paginates across 2 pages');
  
  // Signature block must be kept intact on Page 2, not broken across pages
  const sigOnP1 = pagesSig[0].blocks.find((b) => b.type === 'signature');
  const sigOnP2 = pagesSig[1].blocks.find((b) => b.type === 'signature') as SignatureBlock;
  assert(!sigOnP1 && sigOnP2 !== undefined, 'Signature block moved atomically to Page 2');
  assert(sigOnP2.signers.length === 2, 'Signature block signers are all preserved together');

  // Verify oversized atomic block detection (e.g., giant image taller than whole page)
  const hugeImage: ImageBlock = {
    id: 'huge_img',
    type: 'image',
    url: 'https://example.com/test.png',
    caption: 'Giant Blueprint',
    widthPercent: 100,
    align: 'center',
    spacing: { top: 0, bottom: 900 }, // Intentionally forces height > pageCapacity
  };
  const docHugeImg = createDummyDoc([hugeImage]);
  const pagesHugeImg = paginateDocument(docHugeImg, geo);
  assert(pagesHugeImg[0].hasOversizedBlock === true, 'Atomic block exceeding full page is reliably identified as oversized');
  assert(pagesHugeImg[0].oversizedBlockIds.includes('huge_img'), 'Oversized atomic block ID is tracked');
}

// 11. PAGE 1 TITLE BANNER & COVER PAGE INTERACTIONS
console.log('\nTest Group 11: Page 1 Title Banner & Cover Page Interactions');
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
