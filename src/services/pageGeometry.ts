import { PageSize, PageOrientation, PageMargin, PageNumberingFormat } from '../types/document';

/**
 * Physical Page Geometry Standard Definitions
 * 
 * Standard conversion ratio:
 * 1 inch = 25.4 mm
 * Standard CSS reference resolution: 96 CSS pixels per inch
 * 1 mm = 96 / 25.4 px = ~3.779527559 px
 */
export const MM_TO_PX = 96 / 25.4;
export const PX_TO_MM = 25.4 / 96;

export interface PageDimensionsMm {
  width: number;
  height: number;
}

export interface PageDimensionsPx {
  width: number;
  height: number;
}

export interface MarginsMm {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface MarginsPx {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface UsableContentArea {
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

/**
 * Shared layout contract for running header and footer.
 * Shared directly across geometry calculation, preview rendering, and print styles.
 */
export const HEADER_LAYOUT = {
  contentHeightPx: 16,
  paddingBottomPx: 12, // pb-3
  borderBottomPx: 1,    // border-b
  marginBottomPx: 24,   // mb-6
  totalHeightPx: 53,    // 16 + 12 + 1 + 24
};

export const FOOTER_LAYOUT = {
  contentHeightPx: 16,
  paddingTopPx: 12,     // pt-3
  borderTopPx: 1,       // border-t
  marginTopPx: 24,      // mt-6
  totalHeightPx: 53,    // 16 + 12 + 1 + 24
};

export interface PageGeometry {
  pageSize: PageSize;
  orientation: PageOrientation;
  margins: PageMargin;
  
  // Dimensions in millimeters
  pageMm: PageDimensionsMm;
  marginsMm: MarginsMm;
  contentMm: { width: number; height: number };

  // Dimensions in CSS pixels (96 DPI)
  pagePx: PageDimensionsPx;
  marginsPx: MarginsPx;
  contentPx: UsableContentArea;

  // Running header and footer reserved heights in px
  headerHeightPx: number;
  footerHeightPx: number;
  headerMarginBottomPx: number;
  footerMarginTopPx: number;

  // Net usable height for content blocks excluding header and footer
  usableBodyHeightPx: number;
}

/**
 * Standard paper sizes in millimeters (Portrait)
 */
export const PAPER_SIZES_MM: Record<PageSize, PageDimensionsMm> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 }, // 8.5 x 11 inches
  legal: { width: 215.9, height: 355.6 },  // 8.5 x 14 inches
};

/**
 * Margin presets in exact millimeters
 * - Normal: 25.4mm (1.0 inch)
 * - Narrow: 12.7mm (0.5 inch)
 * - Wide: 38.1mm (1.5 inch)
 * - Compact: 18.0mm
 */
export const MARGIN_PRESETS_MM: Record<PageMargin, MarginsMm> = {
  normal: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
  narrow: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 },
  wide: { top: 38.1, right: 38.1, bottom: 38.1, left: 38.1 },
  compact: { top: 18.0, right: 18.0, bottom: 18.0, left: 18.0 },
};

/**
 * Converts millimeters to CSS pixels rounded to nearest integer or high precision
 */
export function mmToPx(mm: number, round = true): number {
  const px = mm * MM_TO_PX;
  return round ? Math.round(px) : px;
}

/**
 * Converts CSS pixels to millimeters
 */
export function pxToMm(px: number, round = false): number {
  const mm = px * PX_TO_MM;
  return round ? Math.round(mm * 10) / 10 : mm;
}

/**
 * Authoritative page geometry calculation function.
 * Used everywhere: DocumentPreview, pagination calculation, direct PDF export, and print styles.
 */
export function getPageGeometry(
  pageSize: PageSize,
  orientation: PageOrientation,
  margins: PageMargin,
  showHeader: boolean = true,
  showFooter: boolean = true,
  pageNumbering: PageNumberingFormat = 'Page X of Y'
): PageGeometry {
  const basePaper = PAPER_SIZES_MM[pageSize] || PAPER_SIZES_MM.a4;
  
  // Apply orientation (swap width and height for landscape)
  const pageMm: PageDimensionsMm = orientation === 'landscape'
    ? { width: basePaper.height, height: basePaper.width }
    : { width: basePaper.width, height: basePaper.height };

  // Margins in mm
  const marginsMm: MarginsMm = MARGIN_PRESETS_MM[margins] || MARGIN_PRESETS_MM.normal;

  // Usable content size in mm
  const contentMm = {
    width: Math.max(0, pageMm.width - marginsMm.left - marginsMm.right),
    height: Math.max(0, pageMm.height - marginsMm.top - marginsMm.bottom),
  };

  // Convert to CSS pixels (96 DPI)
  // For A4 portrait: 210mm -> 794px, 297mm -> 1123px
  // For US Letter portrait: 215.9mm -> 816px, 279.4mm -> 1056px
  // For US Legal portrait: 215.9mm -> 816px, 355.6mm -> 1344px
  const pagePx: PageDimensionsPx = {
    width: Math.round(pageMm.width * MM_TO_PX),
    height: Math.round(pageMm.height * MM_TO_PX),
  };

  // Margins in px
  // Normal (25.4mm) -> 96px
  // Narrow (12.7mm) -> 48px
  // Wide (38.1mm) -> 144px
  // Compact (18.0mm) -> 68px
  const marginsPx: MarginsPx = {
    top: Math.round(marginsMm.top * MM_TO_PX),
    right: Math.round(marginsMm.right * MM_TO_PX),
    bottom: Math.round(marginsMm.bottom * MM_TO_PX),
    left: Math.round(marginsMm.left * MM_TO_PX),
  };

  // Content area in px
  const contentPx: UsableContentArea = {
    width: pagePx.width - marginsPx.left - marginsPx.right,
    height: pagePx.height - marginsPx.top - marginsPx.bottom,
    top: marginsPx.top,
    left: marginsPx.left,
    bottom: marginsPx.bottom,
    right: marginsPx.right,
  };

  // Running header footprint:
  // If showHeader is true, reserve HEADER_LAYOUT.totalHeightPx
  // If false, no space is reserved and no element is rendered.
  const headerHeightPx = showHeader ? HEADER_LAYOUT.totalHeightPx : 0;
  const headerMarginBottomPx = showHeader ? HEADER_LAYOUT.marginBottomPx : 0;

  // Running footer footprint:
  // The footer container is rendered if showFooter is true OR if pageNumbering is enabled (not 'none')
  const hasFooter = showFooter || (pageNumbering && pageNumbering !== 'none');
  const footerHeightPx = hasFooter ? FOOTER_LAYOUT.totalHeightPx : 0;
  const footerMarginTopPx = hasFooter ? FOOTER_LAYOUT.marginTopPx : 0;

  const usableBodyHeightPx = Math.max(100, contentPx.height - headerHeightPx - footerHeightPx);

  return {
    pageSize,
    orientation,
    margins,
    pageMm,
    marginsMm,
    contentMm,
    pagePx,
    marginsPx,
    contentPx,
    headerHeightPx,
    footerHeightPx,
    headerMarginBottomPx,
    footerMarginTopPx,
    usableBodyHeightPx,
  };
}
