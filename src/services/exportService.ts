import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, Packer, PageBreak } from 'docx';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { DocumentData, DocumentBlock, HeadingBlock, ParagraphBlock, ListBlock, TableBlock, FormulaBlock, SignatureBlock, MetadataBlock } from '../types/document';
import { calculateHeadingNumbers } from './blockUtils';

import { getPageGeometry } from './pageGeometry';

/**
 * Downloads a Blob directly to the client's device with filename
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Clean filename helper
 */
function sanitizeFilename(title: string, ext: string): string {
  const clean = title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  return `${clean || 'document'}.${ext}`;
}

/**
 * Triggers native high-fidelity vector PDF print dialog
 */
export function printDocumentAsPdf(): void {
  window.print();
}

/**
 * Helper to capture a DOM node cleanly to PNG data URL without oklch or font errors
 */
async function capturePageNode(node: HTMLElement): Promise<string> {
  const options = {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
    style: {
      boxShadow: 'none',
      transform: 'none',
      margin: '0',
    },
    filter: (domNode: Node) => {
      if (domNode instanceof HTMLElement) {
        // Skip interactive guide overlays (margin dashed lines) and print:hidden badges
        if (domNode.classList.contains('border-dashed') && domNode.classList.contains('pointer-events-none')) {
          return false;
        }
        if (domNode.classList.contains('print:hidden')) {
          return false;
        }
      }
      return true;
    },
  };

  try {
    return await toPng(node, options);
  } catch (err) {
    console.warn('Standard toPng failed, retrying with skipFonts: true...', err);
    return await toPng(node, { ...options, skipFonts: true });
  }
}

/**
 * Exports directly to a downloadable PDF file via canvas snapshot
 */
export async function exportToDirectPdf(element: HTMLElement, docData: DocumentData): Promise<void> {
  const geometry = getPageGeometry(
    docData.settings.pageSize,
    docData.settings.orientation,
    docData.settings.margins,
    docData.settings.showHeader,
    docData.settings.showFooter,
    docData.settings.pageNumbering
  );

  const orientation = docData.settings.orientation === 'landscape' ? 'landscape' : 'portrait';

  // Use authoritative page dimensions in millimeters
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [geometry.pageMm.width, geometry.pageMm.height],
  });

  const pdfWidth = geometry.pageMm.width;
  const pdfHeight = geometry.pageMm.height;

  // Find individual pages inside the preview container
  const pageElements: HTMLElement[] = [];

  // Check for cover page if enabled
  const coverEl = element.querySelector('#preview-page-cover') as HTMLElement | null;
  if (coverEl && docData.settings.frontPage?.enabled) {
    pageElements.push(coverEl);
  }

  // Find all body pages: #preview-page-1, #preview-page-2, etc.
  const bodyPages = Array.from(element.querySelectorAll<HTMLElement>('[id^="preview-page-"]')).filter(
    (el) => el.id !== 'preview-page-cover'
  );
  bodyPages.sort((a, b) => {
    const numA = parseInt(a.id.replace('preview-page-', ''), 10) || 0;
    const numB = parseInt(b.id.replace('preview-page-', ''), 10) || 0;
    return numA - numB;
  });

  pageElements.push(...bodyPages);

  // If specific page elements found, capture each page on its own PDF page
  if (pageElements.length > 0) {
    for (let i = 0; i < pageElements.length; i++) {
      const pageNode = pageElements[i];
      const imgData = await capturePageNode(pageNode);
      if (i > 0) {
        pdf.addPage([pdfWidth, pdfHeight], orientation);
      }
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }
  } else {
    // Fallback: capture container
    const imgData = await capturePageNode(element);
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  pdf.save(sanitizeFilename(docData.metadata.title, 'pdf'));
}

/**
 * Exports modular block document to genuine Microsoft Word .docx
 */
export async function exportToDocx(docData: DocumentData): Promise<void> {
  const docxChildren: any[] = [];
  const headingNumbers = calculateHeadingNumbers(docData.blocks || [], docData.settings.headingNumberingScheme || '1.1');

  // Front Page / Cover Sheet if enabled
  if (docData.settings.frontPage?.enabled) {
    const fp = docData.settings.frontPage;
    docxChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: (docData.metadata.organization || 'DOCUMENT').toUpperCase(), bold: true, size: 20, color: '4B5563' })
        ],
        spacing: { before: 720, after: 360 },
      }),
      new Paragraph({
        text: docData.metadata.title,
        heading: HeadingLevel.TITLE,
        spacing: { before: 1440, after: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: docData.metadata.subtitle || '', italics: true, size: 24, color: '64748B' })
        ],
        spacing: { after: 720 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Author: ${docData.metadata.author || 'N/A'}\n`, bold: true, size: 20 }),
          new TextRun({ text: `Date: ${docData.metadata.updatedAt || docData.metadata.createdAt}\n`, size: 20 }),
          new TextRun({ text: `Reference: ${docData.metadata.referenceId || ''}\n`, size: 18, color: '64748B' }),
          new TextRun({ text: `Status: ${docData.metadata.status}\n`, size: 18, color: '2563EB' }),
          ...(fp.customIntro ? [new TextRun({ text: `\n${fp.customIntro}\n`, italics: true, size: 18, color: '475569' })] : []),
        ],
        spacing: { before: 1440, after: 720 },
      }),
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // Title block
  if (!docData.settings.frontPage?.enabled && docData.metadata.title) {
    docxChildren.push(
      new Paragraph({
        text: docData.metadata.title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
      })
    );
  }

  if (docData.metadata.subtitle) {
    docxChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: docData.metadata.subtitle,
            italics: true,
            color: '555555',
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Metadata kicker
  const metaLine = [
    docData.metadata.author ? `Author: ${docData.metadata.author}` : null,
    docData.metadata.organization ? `Org: ${docData.metadata.organization}` : null,
    docData.metadata.referenceId ? `Ref: ${docData.metadata.referenceId}` : null,
    docData.metadata.updatedAt ? `Date: ${docData.metadata.updatedAt}` : null,
  ].filter(Boolean).join(' | ');

  if (metaLine) {
    docxChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: metaLine,
            size: 18,
            color: '777777',
          }),
        ],
        spacing: { after: 240 },
      })
    );
  }

  // Convert each block
  for (const block of docData.blocks || []) {
    switch (block.type) {
      case 'heading': {
        const h = block as HeadingBlock;
        const num = headingNumbers.get(h.id);
        const headingText = num ? `${num} ${h.text}` : h.text;
        const level = h.level === 1 
          ? HeadingLevel.HEADING_1 
          : h.level === 2 
          ? HeadingLevel.HEADING_2 
          : h.level === 3 
          ? HeadingLevel.HEADING_3 
          : HeadingLevel.HEADING_4;

        docxChildren.push(
          new Paragraph({
            text: headingText,
            heading: level,
            spacing: { before: 240, after: 120 },
          })
        );
        break;
      }
      case 'paragraph': {
        const p = block as ParagraphBlock;
        const parser = new DOMParser();
        const dom = parser.parseFromString(p.html || '', 'text/html');
        const textContent = dom.body.textContent || '';
        if (textContent.trim()) {
          docxChildren.push(
            new Paragraph({
              text: textContent,
              spacing: { after: 140 },
            })
          );
        }
        break;
      }
      case 'list': {
        const l = block as ListBlock;
        l.items.forEach((it, idx) => {
          if (l.listType === 'bullet') {
            docxChildren.push(
              new Paragraph({
                text: it.text,
                bullet: { level: it.indent || 0 },
                spacing: { after: 60 },
              })
            );
          } else {
            docxChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${idx + 1}. `, bold: true }),
                  new TextRun(it.text),
                ],
                indent: { left: (it.indent || 0) * 360 + 360 },
                spacing: { after: 60 },
              })
            );
          }
        });
        break;
      }
      case 'table': {
        const t = block as TableBlock;
        const tableRows = t.data.map((row, rIdx) => {
          const isTh = t.hasHeader && rIdx === 0;
          return new TableRow({
            children: row.map((cellText) => {
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cellText.replace(/<[^>]+>/g, '').trim(),
                        bold: isTh,
                      }),
                    ],
                  }),
                ],
                width: { size: Math.floor(100 / Math.max(1, row.length)), type: WidthType.PERCENTAGE },
                shading: isTh ? { fill: 'F3F4F6' } : undefined,
              });
            }),
          });
        });

        if (tableRows.length > 0) {
          docxChildren.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
          docxChildren.push(new Paragraph({ spacing: { after: 160 } }));
        }
        break;
      }
      case 'formula': {
        const f = block as FormulaBlock;
        docxChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: f.latex, italics: true, font: 'Courier New', color: '2B3A42' }),
              ...(f.showNumber && f.equationNumber ? [new TextRun({ text: `\t${f.equationNumber}`, bold: true })] : []),
            ],
            spacing: { before: 120, after: 120 },
          })
        );
        break;
      }
      case 'divider': {
        docxChildren.push(
          new Paragraph({
            border: {
              bottom: {
                color: 'CBD5E1',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 140, after: 140 },
          })
        );
        break;
      }
      case 'pagebreak': {
        docxChildren.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
        break;
      }
      case 'sectionbreak': {
        docxChildren.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
        break;
      }
      case 'signature': {
        const s = block as SignatureBlock;
        docxChildren.push(new Paragraph({ text: 'Authorized Signatures', heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 120 } }));
        s.signers.forEach((sig) => {
          docxChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `X _________________________________________\n`, color: '888888' }),
                new TextRun({ text: `${sig.name}\n`, bold: true }),
                new TextRun({ text: `${sig.title} | ${sig.organization}\n`, color: '555555' }),
                new TextRun({ text: `Date: ${sig.date}\n`, color: '777777' }),
              ],
              spacing: { after: 180 },
            })
          );
        });
        break;
      }
      case 'callout': {
        docxChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `[Notice] ${(block as any).title || ''}: `, bold: true }),
              new TextRun({ text: (block as any).text, italics: true }),
            ],
            indent: { left: 720 },
            spacing: { before: 120, after: 120 },
          })
        );
        break;
      }
    }
  }

  const docx = new Document({
    sections: [
      {
        properties: {},
        children: docxChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(docx);
  downloadBlob(blob, sanitizeFilename(docData.metadata.title, 'docx'));
}

/**
 * Exports modular block document to standalone HTML
 */
export function exportToHtml(docData: DocumentData): void {
  const headingNumbers = calculateHeadingNumbers(docData.blocks || [], docData.settings.headingNumberingScheme || '1.1');

  let bodyContent = '';
  for (const block of docData.blocks || []) {
    switch (block.type) {
      case 'heading': {
        const h = block as HeadingBlock;
        const num = headingNumbers.get(h.id);
        const text = num ? `${num} ${h.text}` : h.text;
        bodyContent += `<h${h.level}>${text}</h${h.level}>\n`;
        break;
      }
      case 'paragraph': {
        const p = block as ParagraphBlock;
        bodyContent += `${p.html}\n`;
        break;
      }
      case 'list': {
        const l = block as ListBlock;
        const tag = l.listType === 'numbered' ? 'ol' : 'ul';
        bodyContent += `<${tag}>\n` + l.items.map((it) => `  <li>${it.text}</li>`).join('\n') + `\n</${tag}>\n`;
        break;
      }
      case 'table': {
        const t = block as TableBlock;
        bodyContent += `<table>\n` + t.data.map((row, rIdx) => {
          const isTh = t.hasHeader && rIdx === 0;
          const cellTag = isTh ? 'th' : 'td';
          return `  <tr>` + row.map((c) => `<${cellTag}>${c}</${cellTag}>`).join('') + `</tr>`;
        }).join('\n') + `\n</table>\n`;
        break;
      }
      case 'formula': {
        const f = block as FormulaBlock;
        bodyContent += `<div class="formula"><pre>$$ ${f.latex} $$</pre>${f.showNumber && f.equationNumber ? `<span>${f.equationNumber}</span>` : ''}</div>\n`;
        break;
      }
      case 'divider': {
        bodyContent += `<hr/>\n`;
        break;
      }
      case 'pagebreak': {
        bodyContent += `<div style="page-break-after: always;"></div>\n`;
        break;
      }
      case 'sectionbreak': {
        bodyContent += `<div style="page-break-after: always;" class="section-break"></div>\n`;
        break;
      }
      case 'signature': {
        const s = block as SignatureBlock;
        bodyContent += `<div class="signatures">${s.signers.map((sig) => `<div class="signer"><strong>${sig.name}</strong><br/>${sig.title}<br/>${sig.date}</div>`).join('')}</div>\n`;
        break;
      }
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docData.metadata.title}</title>
  <style>
    body {
      font-family: ${docData.settings.fontFamily}, -apple-system, sans-serif;
      line-height: ${docData.settings.lineHeight};
      color: #1F2937;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .header-meta { border-bottom: 2px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 1.5rem; }
    h3 { font-size: 1.25rem; margin-top: 1.25rem; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; }
    th { background: #F8FAFC; }
    .signatures { display: flex; gap: 40px; margin-top: 40px; }
    .signer { border-top: 2px solid #333; padding-top: 8px; flex: 1; }
  </style>
</head>
<body>
  <div class="header-meta">
    <h1>${docData.metadata.title}</h1>
    ${docData.metadata.subtitle ? `<p>${docData.metadata.subtitle}</p>` : ''}
    <div>Author: ${docData.metadata.author} | Ref: ${docData.metadata.referenceId} | Date: ${docData.metadata.updatedAt}</div>
  </div>
  <div class="content">
    ${bodyContent}
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, sanitizeFilename(docData.metadata.title, 'html'));
}

/**
 * Exports modular block document to Markdown (.md)
 */
export function exportToMarkdown(docData: DocumentData): void {
  const headingNumbers = calculateHeadingNumbers(docData.blocks || [], docData.settings.headingNumberingScheme || '1.1');
  let md = `# ${docData.metadata.title}\n\n`;

  if (docData.metadata.subtitle) {
    md += `*${docData.metadata.subtitle}*\n\n`;
  }
  md += `**Author**: ${docData.metadata.author} | **Date**: ${docData.metadata.updatedAt} | **Status**: ${docData.metadata.status}\n\n---\n\n`;

  for (const block of docData.blocks || []) {
    switch (block.type) {
      case 'heading': {
        const h = block as HeadingBlock;
        const num = headingNumbers.get(h.id);
        const prefix = '#'.repeat(h.level);
        const text = num ? `${num} ${h.text}` : h.text;
        md += `${prefix} ${text}\n\n`;
        break;
      }
      case 'paragraph': {
        const p = block as ParagraphBlock;
        const parser = new DOMParser();
        const dom = parser.parseFromString(p.html || '', 'text/html');
        md += `${dom.body.textContent || ''}\n\n`;
        break;
      }
      case 'list': {
        const l = block as ListBlock;
        l.items.forEach((it, idx) => {
          const indent = '  '.repeat(it.indent || 0);
          const bullet = l.listType === 'numbered' ? `${idx + 1}.` : '-';
          md += `${indent}${bullet} ${it.text}\n`;
        });
        md += '\n';
        break;
      }
      case 'formula': {
        const f = block as FormulaBlock;
        md += `\n$$\n${f.latex}\n$$\n\n`;
        break;
      }
      case 'divider': {
        md += `---\n\n`;
        break;
      }
      case 'pagebreak': {
        md += `\n<!-- pagebreak -->\n\n`;
        break;
      }
      case 'sectionbreak': {
        md += `\n<!-- sectionbreak -->\n\n`;
        break;
      }
    }
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, sanitizeFilename(docData.metadata.title, 'md'));
}

/**
 * Exports document JSON backup for re-importing
 */
export function exportToJson(docData: DocumentData): void {
  const jsonStr = JSON.stringify(docData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, sanitizeFilename(docData.metadata.title, 'json'));
}
