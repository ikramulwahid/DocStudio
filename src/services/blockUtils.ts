import { 
  DocumentBlock, 
  HeadingBlock, 
  ParagraphBlock, 
  ListBlock, 
  TableBlock, 
  FormulaBlock, 
  DividerBlock, 
  PageBreakBlock, 
  SectionBreakBlock,
  MetadataBlock, 
  SignatureBlock, 
  CalloutBlock, 
  ImageBlock,
  BlockType,
  BlockSpacing
} from '../types/document';

export function generateBlockId(): string {
  return 'b_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

// Convert numbers to roman numerals
function toRoman(num: number, upper = true): string {
  const romanLookup: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [val, char] of romanLookup) {
    while (num >= val) {
      result += char;
      num -= val;
    }
  }
  return upper ? result : result.toLowerCase();
}

// Convert number to alphabet (1 -> A, 2 -> B...)
function toAlpha(num: number, upper = true): string {
  const code = ((num - 1) % 26) + (upper ? 65 : 97);
  return String.fromCharCode(code);
}

/**
 * Default top and bottom spacing for each block type
 */
export function getDefaultBlockSpacing(type: BlockType, level: number = 1): BlockSpacing {
  switch (type) {
    case 'heading':
      if (level === 1) return { top: 24, bottom: 8 };
      if (level === 2) return { top: 20, bottom: 6 };
      if (level === 3) return { top: 16, bottom: 4 };
      return { top: 12, bottom: 4 };
    case 'paragraph':
      return { top: 0, bottom: 10 };
    case 'list':
      return { top: 4, bottom: 10 };
    case 'table':
      return { top: 12, bottom: 12 };
    case 'formula':
      return { top: 12, bottom: 12 };
    case 'divider':
      return { top: 10, bottom: 10 };
    case 'signature':
      return { top: 20, bottom: 16 };
    case 'callout':
      return { top: 8, bottom: 8 };
    case 'image':
      return { top: 12, bottom: 12 };
    case 'metadata':
      return { top: 8, bottom: 8 };
    case 'pagebreak':
    case 'sectionbreak':
    default:
      return { top: 0, bottom: 0 };
  }
}

/**
 * Calculates hierarchical or sequential heading numbers across the document.
 * Returns a Map from block.id -> calculated heading number string (e.g., "1.2", "II", "B.")
 */
export function calculateHeadingNumbers(
  blocks: DocumentBlock[],
  globalScheme: '1.1' | '1' | 'A' | 'I' | 'i' = '1.1'
): Map<string, string> {
  const numberMap = new Map<string, string>();
  const counters = [0, 0, 0, 0]; // levels 1, 2, 3, 4

  for (const block of blocks) {
    if (block.type !== 'heading') continue;
    const heading = block as HeadingBlock;
    
    if (heading.mode !== 'numbered') continue;

    const level = heading.level || 1;
    const scheme = heading.numberingScheme || globalScheme;
    const idx = level - 1;

    // Increment current level
    counters[idx]++;
    // Reset subordinate levels
    for (let i = level; i < 4; i++) {
      counters[i] = 0;
    }

    let numStr = '';
    if (scheme === '1.1') {
      const activeLevels = counters.slice(0, level);
      numStr = activeLevels.join('.') + '.';
    } else if (scheme === '1') {
      numStr = `${counters[idx]}.`;
    } else if (scheme === 'A') {
      numStr = `${toAlpha(counters[idx], true)}.`;
    } else if (scheme === 'I') {
      numStr = `${toRoman(counters[idx], true)}.`;
    } else if (scheme === 'i') {
      numStr = `${toRoman(counters[idx], false)}.`;
    }

    numberMap.set(block.id, numStr);
  }

  return numberMap;
}

// ==========================================
// FACTORY CREATORS FOR BLOCKS
// ==========================================

export function createDefaultHeading(level: 1 | 2 | 3 | 4 = 2, text = '', mode: 'plain' | 'numbered' = 'numbered'): HeadingBlock {
  return {
    id: generateBlockId(),
    type: 'heading',
    level,
    text: text || (level === 1 ? 'Main Section Title' : level === 2 ? 'Section Heading' : level === 3 ? 'Subsection' : 'Topic Header'),
    mode,
    numberingScheme: '1.1',
    align: 'left',
    keepWithNext: true,
    spacing: getDefaultBlockSpacing('heading', level),
  };
}

export function createDefaultParagraph(html = ''): ParagraphBlock {
  return {
    id: generateBlockId(),
    type: 'paragraph',
    html: html || '<p>Enter your text here...</p>',
    align: 'left',
    indent: 0,
    spacing: getDefaultBlockSpacing('paragraph'),
  };
}

export function createDefaultList(listType: 'bullet' | 'numbered' = 'bullet'): ListBlock {
  return {
    id: generateBlockId(),
    type: 'list',
    listType,
    bulletMarker: 'disc',
    numberedStyle: 'decimal',
    startNumber: 1,
    spacing: getDefaultBlockSpacing('list'),
    items: [
      { id: generateBlockId(), text: 'First list item with details', indent: 0 },
      { id: generateBlockId(), text: 'Second list item with <strong>bold emphasis</strong>', indent: 0 },
      { id: generateBlockId(), text: 'Third list item with notes', indent: 0 },
    ],
  };
}

export function createDefaultTable(rows = 3, cols = 3): TableBlock {
  const data: string[][] = [
    ['Header Item 1', 'Header Item 2', 'Header Item 3'],
    ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
    ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
  ];
  return {
    id: generateBlockId(),
    type: 'table',
    rows,
    cols,
    hasHeader: true,
    data,
    colWidths: [33, 33, 34],
    align: 'left',
    borderColor: '#CBD5E1',
    headerBgColor: '#F8FAFC',
    cellPadding: 'normal',
    spacing: getDefaultBlockSpacing('table'),
  };
}

export function createDefaultFormula(latex = '\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}'): FormulaBlock {
  return {
    id: generateBlockId(),
    type: 'formula',
    latex,
    displayMode: true,
    showNumber: true,
    equationNumber: '(1.1)',
    align: 'center',
    spacing: getDefaultBlockSpacing('formula'),
  };
}

export function createDefaultDivider(): DividerBlock {
  return {
    id: generateBlockId(),
    type: 'divider',
    thickness: 1,
    widthPercent: 100,
    style: 'solid',
    color: '#E2E8F0',
    align: 'center',
    spacing: getDefaultBlockSpacing('divider'),
  };
}

export function createDefaultPageBreak(): PageBreakBlock {
  return {
    id: generateBlockId(),
    type: 'pagebreak',
    breakType: 'page',
    label: 'Page Break',
    spacing: { top: 0, bottom: 0 },
  };
}

export function createDefaultSectionBreak(): SectionBreakBlock {
  return {
    id: generateBlockId(),
    type: 'sectionbreak',
    breakMode: 'next-page',
    inheritHeader: true,
    inheritFooter: true,
    pageNumberingMode: 'continue',
    pageNumberRestartValue: 1,
    title: 'Section Break (Next Page)',
    spacing: { top: 0, bottom: 0 },
  };
}

export function createDefaultMetadata(): MetadataBlock {
  return {
    id: generateBlockId(),
    type: 'metadata',
    visibleFields: ['title', 'subtitle', 'author', 'organization', 'referenceId', 'updatedAt', 'status'],
    layout: 'grid',
    showLabels: true,
    align: 'left',
    spacing: getDefaultBlockSpacing('metadata'),
  };
}

export function createDefaultSignature(): SignatureBlock {
  return {
    id: generateBlockId(),
    type: 'signature',
    layout: 'side-by-side',
    lineWidth: 240,
    lineThickness: 1,
    showDate: true,
    spacing: getDefaultBlockSpacing('signature'),
    signers: [
      {
        id: generateBlockId(),
        name: 'Elena Rostova',
        title: 'Managing Principal',
        organization: 'Vanguard Global Advisory',
        date: new Date().toISOString().split('T')[0],
      },
      {
        id: generateBlockId(),
        name: 'Dr. Aris Thorne',
        title: 'Chief Technology Officer',
        organization: 'Apex Distributed Labs',
        date: new Date().toISOString().split('T')[0],
      },
    ],
  };
}

export function createDefaultCallout(type: 'info' | 'warning' | 'success' | 'note' = 'info'): CalloutBlock {
  return {
    id: generateBlockId(),
    type: 'callout',
    calloutType: type,
    title: type === 'info' ? 'Important Notice' : type === 'warning' ? 'Critical Warning' : 'Operational Milestone',
    text: 'Key operational risks must be continuously validated according to organizational governance protocols.',
    spacing: getDefaultBlockSpacing('callout'),
  };
}

export function createDefaultImage(): ImageBlock {
  return {
    id: generateBlockId(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    caption: 'Figure 1: Strategic Execution Framework Overview',
    widthPercent: 100,
    align: 'center',
    spacing: getDefaultBlockSpacing('image'),
  };
}

export function createBlockByType(type: BlockType, extra?: any): DocumentBlock {
  switch (type) {
    case 'heading': return createDefaultHeading(extra?.level || 2);
    case 'paragraph': return createDefaultParagraph();
    case 'list': return createDefaultList(extra?.listType || 'bullet');
    case 'table': return createDefaultTable(3, 3);
    case 'formula': return createDefaultFormula();
    case 'divider': return createDefaultDivider();
    case 'pagebreak': return createDefaultPageBreak();
    case 'sectionbreak': return createDefaultSectionBreak();
    case 'metadata': return createDefaultMetadata();
    case 'signature': return createDefaultSignature();
    case 'callout': return createDefaultCallout('info');
    case 'image': return createDefaultImage();
    default: return createDefaultParagraph();
  }
}

/**
 * Migration helper to ensure legacy heading blocks (h1, h2, h3, h4) are unified into type: 'heading'
 * and that spacing and formula alignment exist on every block.
 */
export function migrateLegacyBlocks(rawBlocks: any[]): DocumentBlock[] {
  if (!Array.isArray(rawBlocks)) return [];

  return rawBlocks.map((b) => {
    let block = { ...b };

    // Migrate separate heading types (e.g. 'h1', 'h2', 'h3', 'h4') to unified 'heading'
    if (block.type === 'h1' || block.type === 'h2' || block.type === 'h3' || block.type === 'h4') {
      const level = parseInt(block.type.charAt(1), 10) as 1 | 2 | 3 | 4;
      block.type = 'heading';
      block.level = level;
    }

    // Default spacing if unset
    if (!block.spacing) {
      block.spacing = getDefaultBlockSpacing(block.type, block.level);
    }

    // Default formula alignment if unset
    if (block.type === 'formula' && !block.align) {
      block.align = 'center';
    }

    return block as DocumentBlock;
  });
}

/**
 * Converts older HTML strings into structured DocumentBlocks
 */
export function parseHtmlToBlocks(html: string): DocumentBlock[] {
  if (!html || !html.trim()) {
    return [createDefaultParagraph('<p>Start typing your document...</p>')];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: DocumentBlock[] = [];
  const nodes = Array.from(doc.body.childNodes);

  for (const node of nodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push(createDefaultParagraph(`<p>${text}</p>`));
      }
      continue;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
      const level = parseInt(tag.charAt(1), 10) as 1 | 2 | 3 | 4;
      blocks.push(createDefaultHeading(level, el.textContent?.trim() || 'Heading', 'numbered'));
    } else if (tag === 'ul') {
      const items = Array.from(el.querySelectorAll('li')).map((li) => ({
        id: generateBlockId(),
        text: li.innerHTML.trim() || li.textContent?.trim() || '',
        indent: 0,
      }));
      blocks.push({
        id: generateBlockId(),
        type: 'list',
        listType: 'bullet',
        bulletMarker: 'disc',
        items: items.length > 0 ? items : [{ id: generateBlockId(), text: 'List item', indent: 0 }],
        spacing: getDefaultBlockSpacing('list'),
      });
    } else if (tag === 'ol') {
      const items = Array.from(el.querySelectorAll('li')).map((li) => ({
        id: generateBlockId(),
        text: li.innerHTML.trim() || li.textContent?.trim() || '',
        indent: 0,
      }));
      blocks.push({
        id: generateBlockId(),
        type: 'list',
        listType: 'numbered',
        numberedStyle: 'decimal',
        startNumber: 1,
        items: items.length > 0 ? items : [{ id: generateBlockId(), text: 'Numbered item', indent: 0 }],
        spacing: getDefaultBlockSpacing('list'),
      });
    } else if (tag === 'table') {
      const rows = Array.from(el.querySelectorAll('tr'));
      if (rows.length > 0) {
        const tableData = rows.map((tr) =>
          Array.from(tr.querySelectorAll('th, td')).map((cell) => cell.innerHTML.trim() || '')
        );
        const colCount = Math.max(...tableData.map((r) => r.length), 1);
        blocks.push({
          id: generateBlockId(),
          type: 'table',
          rows: tableData.length,
          cols: colCount,
          hasHeader: true,
          data: tableData,
          align: 'left',
          borderColor: '#CBD5E1',
          headerBgColor: '#F8FAFC',
          cellPadding: 'normal',
          spacing: getDefaultBlockSpacing('table'),
        });
      }
    } else if (tag === 'hr') {
      blocks.push(createDefaultDivider());
    } else if (tag === 'blockquote') {
      blocks.push({
        id: generateBlockId(),
        type: 'callout',
        calloutType: 'note',
        title: 'Quote',
        text: el.textContent?.trim() || '',
        spacing: getDefaultBlockSpacing('callout'),
      });
    } else {
      const inner = el.outerHTML;
      blocks.push({
        id: generateBlockId(),
        type: 'paragraph',
        html: inner,
        align: 'left',
        indent: 0,
        spacing: getDefaultBlockSpacing('paragraph'),
      });
    }
  }

  return blocks.length > 0 ? blocks : [createDefaultParagraph('<p>Start typing...</p>')];
}
