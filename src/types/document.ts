export type DocumentStatus = 'Draft' | 'In Review' | 'Final' | 'Archived';

export type PageSize = 'a4' | 'letter' | 'legal';
export type PageOrientation = 'portrait' | 'landscape';
export type PageMargin = 'normal' | 'narrow' | 'wide' | 'compact';
export type PageNumberingFormat = 'Page X of Y' | 'X / Y' | 'X' | 'none';

export type FontFamilyOption = 
  | 'Plus Jakarta Sans' 
  | 'Source Serif 4' 
  | 'Lora' 
  | 'IBM Plex Mono'
  | 'Inter';

export type FontSizeOption = '10pt' | '11pt' | '12pt' | '14pt';
export type LineHeightOption = '1.15' | '1.3' | '1.5' | '1.75' | '2.0';

export interface DocumentMetadata {
  title: string;
  subtitle: string;
  author: string;
  organization: string;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
  status: DocumentStatus;
}

// ==========================================
// FRONT PAGE / COVER THEMES & CONFIGURATION
// ==========================================

export type FrontPageTheme =
  | 'classic-corporate'
  | 'minimal'
  | 'modern-geometric'
  | 'executive-navy'
  | 'editorial'
  | 'technical-report'
  | 'academic'
  | 'framed'
  | 'color-panel'
  | 'image-cover';

export interface FrontPageBorderSettings {
  enabled: boolean;
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  thickness: number; // 1 to 6 px
  color: string;
  inset: number; // distance from paper edge in px (e.g. 24px)
}

export interface FrontPageSettings {
  enabled: boolean;
  theme: FrontPageTheme;
  border: FrontPageBorderSettings;
  visibleFields: Array<'title' | 'subtitle' | 'author' | 'organization' | 'referenceId' | 'date' | 'status'>;
  customIntro?: string;
  coverImageUrl?: string;
  logoUrl?: string;
  accentColor?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DocumentSettings {
  template: 'executive' | 'proposal' | 'report' | 'meeting' | 'blank';
  pageSize: PageSize;
  orientation: PageOrientation;
  margins: PageMargin;
  fontFamily: FontFamilyOption;
  fontSize: FontSizeOption;
  lineHeight: LineHeightOption;
  
  // Header options
  showHeader: boolean;
  headerLeft: string;
  headerCenter?: string;
  headerRight: string;
  headerHasBottomRule?: boolean;
  differentFirstPage?: boolean;

  // Footer options
  showFooter: boolean;
  footerLeft?: string;
  footerCenter?: string;
  footerRight?: string;
  footerText: string;
  footerHasTopRule?: boolean;
  pageNumbering: PageNumberingFormat;

  // Page extras
  showTitleBanner: boolean;
  showWatermark: boolean;
  watermarkText: string;
  showTableBorders: boolean;
  headingNumberingScheme?: '1.1' | '1' | 'A' | 'I' | 'i';

  // Front page configuration
  frontPage?: FrontPageSettings;
}

// ==========================================
// BLOCK ARCHITECTURE DEFINITIONS
// ==========================================

export type BlockType = 
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'table'
  | 'formula'
  | 'divider'
  | 'pagebreak'
  | 'sectionbreak'
  | 'metadata'
  | 'signature'
  | 'callout'
  | 'image';

export interface BlockSpacing {
  top?: number; // In px
  bottom?: number; // In px
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  spacing?: BlockSpacing;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
  mode: 'plain' | 'numbered';
  numberingScheme?: '1.1' | '1' | 'A' | 'I' | 'i';
  align?: 'left' | 'center' | 'right';
  color?: string;
  keepWithNext?: boolean;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  html: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  indent?: number;
}

export type BulletMarkerStyle = 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'dot';
export type NumberedListStyle = 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';

export interface ListItem {
  id: string;
  text: string; // May contain rich-text formatting (<b>, <i>, <u>, <s>, <a>)
  indent: number; // 0 for top level, 1 for nested
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  listType: 'bullet' | 'numbered';
  bulletMarker?: BulletMarkerStyle;
  numberedStyle?: NumberedListStyle;
  startNumber?: number;
  items: ListItem[];
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  rows: number;
  cols: number;
  hasHeader: boolean;
  data: string[][]; // row x col html/text
  colWidths?: number[]; // percentages
  align?: 'left' | 'center' | 'right';
  borderColor?: string;
  headerBgColor?: string;
  cellPadding?: 'compact' | 'normal' | 'relaxed';
}

export interface FormulaBlock extends BaseBlock {
  type: 'formula';
  latex: string;
  displayMode: boolean; // true = display / block, false = inline
  showNumber: boolean;
  equationNumber?: string;
  caption?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  thickness: number; // 1, 2, 3, 4
  widthPercent: number; // 25, 50, 75, 100
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface PageBreakBlock extends BaseBlock {
  type: 'pagebreak';
  breakType: 'page' | 'section';
  label?: string;
}

export interface SectionBreakBlock extends BaseBlock {
  type: 'sectionbreak';
  breakMode: 'next-page';
  inheritHeader: boolean;
  inheritFooter: boolean;
  localHeader?: {
    headerLeft?: string;
    headerCenter?: string;
    headerRight?: string;
    hasBottomRule?: boolean;
  };
  localFooter?: {
    footerLeft?: string;
    footerCenter?: string;
    footerRight?: string;
    footerText?: string;
    hasTopRule?: boolean;
  };
  pageNumberingMode: 'continue' | 'restart';
  pageNumberRestartValue: number;
  title?: string;
}

export interface MetadataBlock extends BaseBlock {
  type: 'metadata';
  visibleFields: Array<'title' | 'subtitle' | 'author' | 'organization' | 'referenceId' | 'createdAt' | 'updatedAt' | 'status'>;
  layout: 'grid' | 'cards' | 'inline' | 'compact';
  showLabels: boolean;
  align: 'left' | 'center';
}

export interface SignerInfo {
  id: string;
  name: string;
  title: string;
  organization: string;
  date: string;
}

export interface SignatureBlock extends BaseBlock {
  type: 'signature';
  layout: 'side-by-side' | 'stacked';
  signers: SignerInfo[];
  lineWidth?: number;
  lineThickness?: number;
  showDate?: boolean;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  calloutType: 'info' | 'warning' | 'success' | 'note';
  title?: string;
  text: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  caption?: string;
  widthPercent: number;
  align: 'left' | 'center' | 'right';
}

export type DocumentBlock = 
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | TableBlock
  | FormulaBlock
  | DividerBlock
  | PageBreakBlock
  | SectionBreakBlock
  | MetadataBlock
  | SignatureBlock
  | CalloutBlock
  | ImageBlock;

export interface DocumentData {
  schemaVersion: 2;
  id: string;
  metadata: DocumentMetadata;
  settings: DocumentSettings;
  blocks: DocumentBlock[];
  contentHtml?: string; // Backwards compatibility fallback
}

export interface DocumentStats {
  wordCount: number;
  charCount: number;
  charCountNoSpaces: number;
  readingTimeMinutes: number;
  paragraphCount: number;
  pageCount: number;
}
