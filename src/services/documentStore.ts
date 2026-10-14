import { DocumentData, DocumentStats, DocumentBlock } from '../types/document';
import { 
  generateBlockId, 
  parseHtmlToBlocks,
  createDefaultHeading,
  createDefaultParagraph,
  createDefaultList,
  createDefaultTable,
  createDefaultFormula,
  createDefaultDivider,
  createDefaultPageBreak,
  createDefaultMetadata,
  createDefaultSignature,
  createDefaultCallout
} from './blockUtils';

export const TEMPLATES: Record<string, { name: string; description: string; data: Partial<DocumentData> }> = {
  executive: {
    name: 'Executive Summary',
    description: 'High-level business brief with strategic objectives, metrics, formulas, and executive sign-off.',
    data: {
      metadata: {
        title: 'Q3 Enterprise Strategy & Growth Blueprint',
        subtitle: 'Quarterly review of operational milestones, ARR trajectory, and portfolio expansion',
        author: 'Elena Rostova',
        organization: 'Vanguard Global Advisory',
        referenceId: 'EXEC-2026-Q3-08',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-12',
        status: 'In Review',
      },
      settings: {
        template: 'executive',
        pageSize: 'a4',
        orientation: 'portrait',
        margins: 'normal',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: '11pt',
        lineHeight: '1.5',
        showHeader: true,
        headerLeft: 'Vanguard Global Advisory — Confidential',
        headerRight: 'EXEC-2026-Q3',
        showFooter: true,
        footerText: 'DocStudio Executive Document System',
        pageNumbering: 'Page X of Y',
        showTitleBanner: true,
        showWatermark: false,
        watermarkText: 'CONFIDENTIAL',
        showTableBorders: true,
        headingNumberingScheme: '1.1',
        frontPage: {
          enabled: true,
          theme: 'executive-navy',
          border: {
            enabled: false,
            style: 'solid',
            thickness: 2,
            color: '#0F1E36',
            inset: 24,
          },
          visibleFields: ['title', 'subtitle', 'author', 'organization', 'referenceId', 'date', 'status'],
          customIntro: 'Confidential strategic blueprint detailing enterprise operational milestones, capital allocation benchmarks, and recurring revenue expansion.',
          coverImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
          logoUrl: '',
          align: 'left',
        },
      },
      blocks: [
        {
          id: generateBlockId(),
          type: 'heading',
          level: 1,
          text: 'Executive Overview',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'paragraph',
          html: '<p>This executive briefing synthesizes Vanguard Global Advisory\'s core operating performance for the trailing quarter and establishes resource allocation benchmarks through fiscal year 2027. Despite broader macro volatility, aggregate recurring revenue expanded by <strong>24.6% year-over-year</strong>, driven by rapid cloud migration and automated regulatory compliance workflows.</p>',
          align: 'left',
        },
        {
          id: generateBlockId(),
          type: 'callout',
          calloutType: 'info',
          title: 'Strategic Mandate',
          text: 'All operational initiatives must maintain strict compliance with international zero-trust protocols while delivering scalable margin expansion.',
        },
        {
          id: generateBlockId(),
          type: 'heading',
          level: 2,
          text: 'Strategic Pillars & Growth Vectors',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'list',
          listType: 'bullet',
          bulletMarker: 'disc',
          items: [
            { id: generateBlockId(), text: 'Enterprise Platform Consolidation: Unifying isolated analytics silos into a singular real-time workflow hub.', indent: 0 },
            { id: generateBlockId(), text: 'Net Expansion Momentum: Sustaining 118% net revenue retention across Fortune 500 accounts.', indent: 0 },
            { id: generateBlockId(), text: 'Autonomous Governance: Deploying cryptographic audit verifications across client deliverables.', indent: 0 },
          ],
        },
        {
          id: generateBlockId(),
          type: 'heading',
          level: 2,
          text: 'Quarterly Performance Benchmarks',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'table',
          rows: 5,
          cols: 4,
          hasHeader: true,
          colWidths: [32, 24, 24, 20],
          align: 'left',
          borderColor: '#CBD5E1',
          headerBgColor: '#F8FAFC',
          cellPadding: 'normal',
          data: [
            ['Operational Metric', 'Target Benchmark', 'Actual Q3 Result', 'Variance'],
            ['Enterprise Platform Adoption', '12,500 seats', '14,120 seats', '+13.0% (Outperformed)'],
            ['Recurring Revenue Run-Rate', '$18.5M ARR', '$19.8M ARR', '+$1.3M (On Track)'],
            ['Mean SLA Resolution Window', '< 4.0 hours', '2.8 hours', '-30.0% (Optimized)'],
            ['Operating Margin Efficiency', '28.0%', '31.4%', '+3.4% (Exceeded)'],
          ],
        },
        {
          id: generateBlockId(),
          type: 'heading',
          level: 2,
          text: 'Yield Optimization Model',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'paragraph',
          html: '<p>The strategic yield model is calibrated according to asymptotic capital compounding and customer lifetime value trajectories:</p>',
          align: 'left',
        },
        {
          id: generateBlockId(),
          type: 'formula',
          latex: 'Y(t) = Y_0 \\cdot \\exp\\left( \\int_0^t \\left[ \\alpha(\\tau) - \\beta(\\tau) \\right] d\\tau \\right) + \\sum_{k=1}^N \\gamma_k \\cdot \\Delta_k',
          displayMode: true,
          showNumber: true,
          equationNumber: '(1.1)',
        },
        {
          id: generateBlockId(),
          type: 'divider',
          thickness: 1,
          widthPercent: 100,
          style: 'solid',
          color: '#E2E8F0',
          align: 'center',
          spacing: { top: 20, bottom: 20 },
        },
        {
          id: generateBlockId(),
          type: 'heading',
          level: 2,
          text: 'Executive Endorsement & Authorizations',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'signature',
          layout: 'side-by-side',
          lineWidth: 240,
          lineThickness: 1,
          showDate: true,
          signers: [
            {
              id: generateBlockId(),
              name: 'Elena Rostova',
              title: 'Managing Principal & Senior Director',
              organization: 'Vanguard Global Advisory',
              date: '2026-10-12',
            },
            {
              id: generateBlockId(),
              name: 'Dr. Aris Thorne',
              title: 'Chief Technology Officer',
              organization: 'Apex Distributed Labs',
              date: '2026-10-12',
            },
          ],
        },
      ],
    },
  },
  proposal: {
    name: 'Project Proposal',
    description: 'Statement of work with architectural deliverables, project timelines, and sign-offs.',
    data: {
      metadata: {
        title: 'Unified Customer Intelligence Platform',
        subtitle: 'Architecture Design, Implementation Roadmap, and Milestone Deliverables',
        author: 'Marcus Vance',
        organization: 'Aether Cloud Solutions',
        referenceId: 'PROP-2026-0412',
        createdAt: '2026-10-05',
        updatedAt: '2026-10-12',
        status: 'Draft',
      },
      settings: {
        template: 'proposal',
        pageSize: 'letter',
        orientation: 'portrait',
        margins: 'normal',
        fontFamily: 'Source Serif 4',
        fontSize: '11pt',
        lineHeight: '1.5',
        showHeader: true,
        headerLeft: 'Aether Cloud Solutions — Proposal',
        headerRight: 'PROP-2026-0412',
        showFooter: true,
        footerText: 'Strictly Proprietary & Confidential',
        pageNumbering: 'Page X of Y',
        showTitleBanner: true,
        showWatermark: false,
        watermarkText: 'DRAFT',
        showTableBorders: true,
        headingNumberingScheme: '1.1',
      },
      blocks: [
        {
          id: generateBlockId(),
          type: 'heading',
          level: 1,
          text: 'Project Overview & Objectives',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'paragraph',
          html: '<p>Enterprise customer data is currently isolated across disparate legacy silos, preventing low-latency analytical queries and introducing data divergence. This proposal presents the architectural design for a <strong>Unified Customer Intelligence Platform</strong> engineered for sub-second synchronization and robust role-based isolation.</p>',
          align: 'left',
        },
        {
          id: generateBlockId(),
          type: 'heading',
          level: 2,
          text: 'Scope of Work & Deliverables',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'list',
          listType: 'numbered',
          numberedStyle: 'decimal',
          startNumber: 1,
          items: [
            { id: generateBlockId(), text: 'Ingestion Pipeline: High-throughput ingestion infrastructure supporting 50,000 events/second.', indent: 0 },
            { id: generateBlockId(), text: 'Normalized Data Layer: Cloud-native database schemas with automated rollups and indexes.', indent: 0 },
            { id: generateBlockId(), text: 'Executive Console: Responsive analytics web dashboard with multi-tenant access control.', indent: 0 },
          ],
        },
        {
          id: generateBlockId(),
          type: 'heading',
          level: 2,
          text: 'Delivery Schedule & Milestone Matrix',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'table',
          rows: 4,
          cols: 3,
          hasHeader: true,
          colWidths: [30, 45, 25],
          align: 'left',
          borderColor: '#CBD5E1',
          headerBgColor: '#F8FAFC',
          cellPadding: 'normal',
          data: [
            ['Phase', 'Deliverable Scope', 'Estimated Window'],
            ['Phase 1: Architecture', 'Requirements specification & schema blueprints', 'Weeks 1 – 3'],
            ['Phase 2: Core Pipelines', 'Distributed data pipeline deployment & SLA benchmarking', 'Weeks 4 – 8'],
            ['Phase 3: Integration', 'Frontend portal, compliance audit trails & deployment', 'Weeks 9 – 12'],
          ],
        },
        {
          id: generateBlockId(),
          type: 'pagebreak',
          breakType: 'page',
          label: 'Page Break',
        },
        {
          id: generateBlockId(),
          type: 'heading',
          level: 1,
          text: 'Authorization & Mutual Agreement',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'paragraph',
          html: '<p>By signing below, the parties confirm receipt and agreement to the scope, milestones, and deliverable commitments detailed in this proposal.</p>',
          align: 'left',
        },
        {
          id: generateBlockId(),
          type: 'signature',
          layout: 'side-by-side',
          lineWidth: 250,
          lineThickness: 1,
          showDate: true,
          signers: [
            {
              id: generateBlockId(),
              name: 'Marcus Vance',
              title: 'VP of Engineering',
              organization: 'Aether Cloud Solutions',
              date: '2026-10-12',
            },
            {
              id: generateBlockId(),
              name: 'Client Representative',
              title: 'Chief Information Officer',
              organization: 'Enterprise Partner Corp.',
              date: '2026-10-12',
            },
          ],
        },
      ],
    },
  },
  report: {
    name: 'Technical Report',
    description: 'Technical evaluation with mathematical equations, data tables, and methodology.',
    data: {
      metadata: {
        title: 'System Latency & Throughput Benchmark Report',
        subtitle: 'Comprehensive evaluation of high-concurrency distributed caching layers',
        author: 'Dr. Aris Thorne',
        organization: 'Apex Distributed Labs',
        referenceId: 'REP-TECH-2026-89',
        createdAt: '2026-09-28',
        updatedAt: '2026-10-12',
        status: 'Final',
      },
      settings: {
        template: 'report',
        pageSize: 'a4',
        orientation: 'portrait',
        margins: 'normal',
        fontFamily: 'IBM Plex Mono',
        fontSize: '10pt',
        lineHeight: '1.5',
        showHeader: true,
        headerLeft: 'Apex Distributed Labs // Benchmarks',
        headerRight: 'REP-TECH-2026-89',
        showFooter: true,
        footerText: 'Apex Technical Evaluation Series',
        pageNumbering: 'Page X of Y',
        showTitleBanner: true,
        showWatermark: false,
        watermarkText: 'FINAL',
        showTableBorders: true,
        headingNumberingScheme: '1.1',
      },
      blocks: [
        {
          id: generateBlockId(),
          type: 'heading',
          level: 1,
          text: 'Abstract & Methodology',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'paragraph',
          html: '<p>This technical report evaluates tail latency and saturation points of multi-tenant distributed caching topologies under sustained high-throughput workloads. Experiments were conducted across 64 dedicated compute nodes simulating 120,000 queries per second.</p>',
          align: 'left',
        },
        {
          id: generateBlockId(),
          type: 'heading',
          level: 2,
          text: 'Tail Latency Bound Formulation',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'formula',
          latex: 'P(\\text{latency} > t) \\le \\exp\\left( -\\frac{2(t - \\mu)^2}{\\sum_{i=1}^k (b_i - a_i)^2} \\right)',
          displayMode: true,
          showNumber: true,
          equationNumber: '(2.1)',
        },
        {
          id: generateBlockId(),
          type: 'heading',
          level: 2,
          text: 'Experimental Results Matrix',
          mode: 'numbered',
          numberingScheme: '1.1',
          align: 'left',
          keepWithNext: true,
        },
        {
          id: generateBlockId(),
          type: 'table',
          rows: 4,
          cols: 4,
          hasHeader: true,
          colWidths: [25, 25, 25, 25],
          align: 'left',
          borderColor: '#CBD5E1',
          headerBgColor: '#F8FAFC',
          cellPadding: 'normal',
          data: [
            ['Concurrency (qps)', 'p50 Latency', 'p99 Latency', 'Packet Drop Rate'],
            ['25,000 qps', '0.82 ms', '1.45 ms', '0.000%'],
            ['75,000 qps', '1.14 ms', '2.68 ms', '0.001%'],
            ['120,000 qps', '1.48 ms', '3.42 ms', '0.004%'],
          ],
        },
      ],
    },
  },
  blank: {
    name: 'Blank Document',
    description: 'Clean slate for custom documents with modular blocks.',
    data: {
      metadata: {
        title: 'Untitled Document',
        subtitle: '',
        author: 'User',
        organization: '',
        referenceId: 'DOC-2026-0001',
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
        showTitleBanner: false,
        showWatermark: false,
        watermarkText: '',
        showTableBorders: true,
        headingNumberingScheme: '1.1',
      },
      blocks: [
        createDefaultHeading(1, 'Untitled Document', 'plain'),
        createDefaultParagraph('<p>Start typing or insert blocks to begin crafting your document...</p>'),
      ],
    },
  },
};

const STORAGE_KEY_CURRENT = 'docstudio_current_document_v2';
const STORAGE_KEY_LIBRARY = 'docstudio_library_v2';
const STORAGE_KEY_LEGACY = 'docstudio_current_document_v1';

export function createNewDocument(templateKey = 'executive'): DocumentData {
  const tpl = TEMPLATES[templateKey] || TEMPLATES.executive;
  const today = new Date().toISOString().split('T')[0];
  const uniqueId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const freshBlocks: DocumentBlock[] = (tpl.data.blocks || []).map((b) => ({
    ...b,
    id: generateBlockId(),
  }));

  return {
    schemaVersion: 2,
    id: uniqueId,
    metadata: {
      title: tpl.data.metadata?.title || 'Untitled Document',
      subtitle: tpl.data.metadata?.subtitle || '',
      author: tpl.data.metadata?.author || 'Document Author',
      organization: tpl.data.metadata?.organization || '',
      referenceId: tpl.data.metadata?.referenceId || `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: today,
      updatedAt: today,
      status: tpl.data.metadata?.status || 'Draft',
    },
    settings: {
      template: (tpl.data.settings?.template || 'executive') as any,
      pageSize: tpl.data.settings?.pageSize || 'a4',
      orientation: tpl.data.settings?.orientation || 'portrait',
      margins: tpl.data.settings?.margins || 'normal',
      fontFamily: tpl.data.settings?.fontFamily || 'Plus Jakarta Sans',
      fontSize: tpl.data.settings?.fontSize || '11pt',
      lineHeight: tpl.data.settings?.lineHeight || '1.5',
      showHeader: tpl.data.settings?.showHeader ?? true,
      headerLeft: tpl.data.settings?.headerLeft || '',
      headerCenter: tpl.data.settings?.headerCenter || '',
      headerRight: tpl.data.settings?.headerRight || '',
      headerHasBottomRule: tpl.data.settings?.headerHasBottomRule ?? true,
      showFooter: tpl.data.settings?.showFooter ?? true,
      footerText: tpl.data.settings?.footerText || '',
      footerLeft: tpl.data.settings?.footerLeft || '',
      footerCenter: tpl.data.settings?.footerCenter || '',
      footerRight: tpl.data.settings?.footerRight || '',
      footerHasTopRule: tpl.data.settings?.footerHasTopRule ?? true,
      pageNumbering: tpl.data.settings?.pageNumbering || 'Page X of Y',
      showTitleBanner: tpl.data.settings?.showTitleBanner ?? true,
      showWatermark: tpl.data.settings?.showWatermark ?? false,
      watermarkText: tpl.data.settings?.watermarkText || 'DRAFT',
      showTableBorders: tpl.data.settings?.showTableBorders ?? true,
      headingNumberingScheme: tpl.data.settings?.headingNumberingScheme || '1.1',
      frontPage: tpl.data.settings?.frontPage || {
        enabled: false,
        theme: 'classic-corporate',
        border: {
          enabled: false,
          style: 'solid',
          thickness: 2,
          color: '#1E293B',
          inset: 24,
        },
        visibleFields: ['title', 'subtitle', 'author', 'organization', 'referenceId', 'date', 'status'],
        customIntro: '',
        coverImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
        logoUrl: '',
        align: 'center',
      },
    },
    blocks: freshBlocks.length > 0 ? freshBlocks : [createDefaultHeading(1), createDefaultParagraph()],
  };
}

export function loadCurrentDocument(): DocumentData {
  try {
    // Try V2 block format first
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
        return parsed;
      }
    }

    // Try V1 legacy HTML format and migrate
    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (parsed && parsed.contentHtml) {
        const migratedBlocks = parseHtmlToBlocks(parsed.contentHtml);
        const migratedDoc: DocumentData = {
          schemaVersion: 2,
          id: parsed.id || 'doc_' + Date.now(),
          metadata: parsed.metadata,
          settings: {
            ...parsed.settings,
            headingNumberingScheme: '1.1',
          },
          blocks: migratedBlocks,
        };
        saveCurrentDocument(migratedDoc);
        return migratedDoc;
      }
    }
  } catch (err) {
    console.error('Failed to parse document from localStorage', err);
  }

  // Fallback to executive template
  const defaultDoc = createNewDocument('executive');
  saveCurrentDocument(defaultDoc);
  return defaultDoc;
}

export function saveCurrentDocument(doc: DocumentData): void {
  try {
    const updated: DocumentData = {
      ...doc,
      schemaVersion: 2,
      metadata: {
        ...doc.metadata,
        updatedAt: new Date().toISOString().split('T')[0],
      },
    };
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(updated));
    saveToLibrary(updated);
  } catch (err) {
    console.error('Failed to save document to localStorage', err);
  }
}

export function listLibraryDocuments(): Array<{ id: string; title: string; updatedAt: string; status: string; author: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIBRARY);
    if (raw) {
      const library: DocumentData[] = JSON.parse(raw);
      return library.map((d) => ({
        id: d.id,
        title: d.metadata.title,
        updatedAt: d.metadata.updatedAt,
        status: d.metadata.status,
        author: d.metadata.author,
      }));
    }
  } catch (err) {
    console.error('Failed to list library documents', err);
  }
  return [];
}

export function getLibraryDocument(id: string): DocumentData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIBRARY);
    if (raw) {
      const library: DocumentData[] = JSON.parse(raw);
      const match = library.find((d) => d.id === id);
      if (match) return match;
    }
  } catch (err) {
    console.error('Failed to get document from library', err);
  }
  return null;
}

export function saveToLibrary(doc: DocumentData): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIBRARY);
    let library: DocumentData[] = raw ? JSON.parse(raw) : [];
    const index = library.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      library[index] = doc;
    } else {
      library.unshift(doc);
    }
    if (library.length > 20) {
      library = library.slice(0, 20);
    }
    localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(library));
  } catch (err) {
    console.error('Failed to save to library', err);
  }
}

export function deleteFromLibrary(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIBRARY);
    if (raw) {
      let library: DocumentData[] = JSON.parse(raw);
      library = library.filter((d) => d.id !== id);
      localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(library));
    }
  } catch (err) {
    console.error('Failed to delete from library', err);
  }
}

export function calculateDocumentStats(blocks: DocumentBlock[]): DocumentStats {
  if (!blocks || blocks.length === 0) {
    return {
      wordCount: 0,
      charCount: 0,
      charCountNoSpaces: 0,
      readingTimeMinutes: 0,
      paragraphCount: 0,
      pageCount: 1,
    };
  }

  let totalWords = 0;
  let totalChars = 0;
  let totalCharsNoSpaces = 0;
  let paragraphCount = 0;
  let pageBreaks = 0;

  for (const block of blocks) {
    let blockText = '';

    if (block.type === 'heading') {
      blockText = block.text || '';
      paragraphCount++;
    } else if (block.type === 'paragraph') {
      const parser = new DOMParser();
      const dom = parser.parseFromString(block.html || '', 'text/html');
      blockText = dom.body.textContent || '';
      paragraphCount++;
    } else if (block.type === 'list') {
      blockText = block.items.map((i) => i.text).join(' ');
      paragraphCount += block.items.length;
    } else if (block.type === 'table') {
      blockText = block.data.flat().join(' ');
      paragraphCount += block.rows;
    } else if (block.type === 'formula') {
      blockText = block.latex || '';
    } else if (block.type === 'callout') {
      blockText = (block.title || '') + ' ' + (block.text || '');
      paragraphCount++;
    } else if (block.type === 'pagebreak') {
      pageBreaks++;
    }

    const words = blockText.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;
    totalChars += blockText.length;
    totalCharsNoSpaces += blockText.replace(/\s/g, '').length;
  }

  const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));
  const estimatedPageCount = Math.max(1, pageBreaks + 1, Math.ceil(totalWords / 380));

  return {
    wordCount: totalWords,
    charCount: totalChars,
    charCountNoSpaces: totalCharsNoSpaces,
    readingTimeMinutes,
    paragraphCount: Math.max(1, paragraphCount),
    pageCount: estimatedPageCount,
  };
}
