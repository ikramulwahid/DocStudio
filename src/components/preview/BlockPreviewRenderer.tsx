import React, { useMemo } from 'react';
import { 
  DocumentBlock, 
  HeadingBlock, 
  ParagraphBlock, 
  ListBlock, 
  TableBlock, 
  FormulaBlock, 
  DividerBlock, 
  PageBreakBlock, 
  MetadataBlock, 
  SignatureBlock, 
  CalloutBlock, 
  ImageBlock,
  DocumentMetadata
} from '../../types/document';
import katex from 'katex';
import { Info, AlertTriangle, CheckCircle, Bookmark } from 'lucide-react';

interface BlockPreviewRendererProps {
  block: DocumentBlock;
  calculatedNumber?: string;
  metadata: DocumentMetadata;
}

export const BlockPreviewRenderer: React.FC<BlockPreviewRendererProps> = ({
  block,
  calculatedNumber,
  metadata,
}) => {
  // Heading
  if (block.type === 'heading') {
    const h = block as HeadingBlock;
    const fontSizes = {
      1: 'text-2xl font-bold mt-6 mb-2.5',
      2: 'text-xl font-semibold mt-5 mb-2',
      3: 'text-lg font-semibold mt-4 mb-1.5',
      4: 'text-base font-semibold mt-3 mb-1',
    };
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return (
      <div className={`${fontSizes[h.level]} ${alignClasses[h.align || 'left']} text-slate-900 tracking-tight leading-snug break-words`}>
        {h.mode === 'numbered' && calculatedNumber && (
          <span className="font-mono text-slate-900 mr-2 font-bold select-none">
            {calculatedNumber}
          </span>
        )}
        <span>{h.text}</span>
      </div>
    );
  }

  // Paragraph
  if (block.type === 'paragraph') {
    const p = block as ParagraphBlock;
    const alignStyles: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    return (
      <div
        className={`my-2 text-slate-800 leading-relaxed ${alignStyles[p.align || 'left']}`}
        style={{
          paddingLeft: p.indent ? `${p.indent * 24}px` : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: p.html }}
      />
    );
  }

  // List
  if (block.type === 'list') {
    const l = block as ListBlock;

    const getBulletSymbol = (marker?: any) => {
      switch (marker) {
        case 'circle': return '○';
        case 'square': return '■';
        case 'dash': return '—';
        case 'arrow': return '→';
        case 'dot': return '·';
        case 'disc':
        default: return '•';
      }
    };

    const getNumberLabel = (index: number, style?: any, start = 1) => {
      const val = start + index;
      if (style === 'lower-alpha') return `${String.fromCharCode(96 + ((val - 1) % 26) + 1)}.`;
      if (style === 'upper-alpha') return `${String.fromCharCode(64 + ((val - 1) % 26) + 1)}.`;
      if (style === 'lower-roman') {
        const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
        return `${romans[(val - 1) % 10] || val}.`;
      }
      if (style === 'upper-roman') {
        const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        return `${romans[(val - 1) % 10] || val}.`;
      }
      return `${val}.`;
    };

    return (
      <div className="my-2 space-y-1">
        {l.items.map((it, idx) => {
          const marker = l.listType === 'bullet'
            ? getBulletSymbol(l.bulletMarker)
            : getNumberLabel(idx, l.numberedStyle, l.startNumber || 1);

          return (
            <div
              key={it.id}
              className="flex items-start gap-2"
              style={{ paddingLeft: `${(it.indent || 0) * 20}px` }}
            >
              <span className="font-mono text-slate-700 font-medium select-none text-xs w-6 text-right shrink-0 mt-0.5">
                {marker}
              </span>
              <span className="flex-1 text-slate-800 leading-normal text-sm">{it.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Table
  if (block.type === 'table') {
    const t = block as TableBlock;
    const paddingClasses = {
      compact: 'p-1.5',
      normal: 'p-2.5',
      relaxed: 'p-3.5',
    };

    return (
      <div className="my-3 overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-xs text-slate-800">
          <tbody>
            {t.data.map((row, rIdx) => {
              const isHeader = t.hasHeader && rIdx === 0;
              return (
                <tr
                  key={rIdx}
                  className={isHeader ? 'font-semibold' : 'even:bg-slate-50/50'}
                  style={{
                    backgroundColor: isHeader ? t.headerBgColor || '#F8FAFC' : undefined,
                  }}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`border border-slate-300 ${paddingClasses[t.cellPadding || 'normal']}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Formula
  if (block.type === 'formula') {
    const f = block as FormulaBlock;
    let mathHtml = '';
    try {
      mathHtml = katex.renderToString(f.latex || '', {
        displayMode: f.displayMode,
        throwOnError: false,
      });
    } catch {
      mathHtml = `<code>${f.latex}</code>`;
    }

    return (
      <div className="my-3 flex items-center justify-between overflow-x-auto py-1">
        <div
          className="flex-1 text-center overflow-x-auto text-slate-900"
          dangerouslySetInnerHTML={{ __html: mathHtml }}
        />
        {f.showNumber && f.equationNumber && (
          <span className="font-mono text-xs text-slate-600 select-none ml-4 shrink-0 font-medium">
            {f.equationNumber}
          </span>
        )}
      </div>
    );
  }

  // Divider
  if (block.type === 'divider') {
    const d = block as DividerBlock;
    const alignClasses = {
      left: 'mr-auto',
      center: 'mx-auto',
      right: 'ml-auto',
    };

    return (
      <div className="py-2" style={{ padding: `${d.spacing || 16}px 0` }}>
        <hr
          style={{
            border: 'none',
            borderTop: `${d.thickness}px ${d.style} ${d.color || '#CBD5E1'}`,
            width: `${d.widthPercent}%`,
          }}
          className={`${alignClasses[d.align || 'center']} my-0`}
        />
      </div>
    );
  }

  // Page Break
  if (block.type === 'pagebreak') {
    return (
      <div className="my-4 py-2 border-t-2 border-dashed border-slate-300 print:hidden text-center">
        <span className="text-[10px] uppercase font-mono text-slate-400 bg-white px-2">
          [ Page Break ]
        </span>
      </div>
    );
  }

  // Metadata Block
  if (block.type === 'metadata') {
    const m = block as MetadataBlock;
    const availableFields: Array<{ id: any; label: string; value: string }> = [
      { id: 'title', label: 'Document Title', value: metadata.title },
      { id: 'subtitle', label: 'Subtitle', value: metadata.subtitle },
      { id: 'author', label: 'Author', value: metadata.author },
      { id: 'organization', label: 'Organization', value: metadata.organization },
      { id: 'referenceId', label: 'Reference ID', value: metadata.referenceId },
      { id: 'createdAt', label: 'Created Date', value: metadata.createdAt },
      { id: 'updatedAt', label: 'Last Modified', value: metadata.updatedAt },
      { id: 'status', label: 'Status', value: metadata.status },
    ];

    const fieldsToRender = availableFields.filter(
      (f) => (m.visibleFields || []).includes(f.id) && f.value
    );

    return (
      <div className="my-3 p-3 border border-slate-200 rounded-md bg-slate-50/60 text-xs">
        <div
          className={
            m.layout === 'cards'
              ? 'grid grid-cols-2 sm:grid-cols-3 gap-2'
              : m.layout === 'compact'
              ? 'flex flex-wrap gap-x-4 gap-y-1 text-slate-700'
              : 'grid grid-cols-2 gap-2'
          }
        >
          {fieldsToRender.map((f) => (
            <div
              key={f.id}
              className={
                m.layout === 'cards'
                  ? 'p-2 bg-white rounded border border-slate-200 shadow-2xs'
                  : m.layout === 'compact'
                  ? 'flex items-center gap-1.5'
                  : 'flex items-baseline justify-between py-1 border-b border-slate-200/60'
              }
            >
              {m.showLabels && (
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {f.label}:
                </span>
              )}
              <span className="text-xs font-semibold text-slate-900">
                {f.id === 'status' ? (
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 font-bold uppercase">
                    {f.value}
                  </span>
                ) : (
                  f.value
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Signature Block
  if (block.type === 'signature') {
    const s = block as SignatureBlock;

    return (
      <div className="my-6 pt-4">
        <div
          className={
            s.layout === 'side-by-side'
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-8'
              : 'space-y-8'
          }
        >
          {s.signers.map((signer) => (
            <div key={signer.id} className="space-y-1 text-xs">
              <div className="pt-10 pb-1 border-b-2 border-slate-800 flex justify-between items-end">
                <span className="text-[10px] font-mono text-slate-400">X ___________________</span>
              </div>
              <div className="font-bold text-slate-900 pt-1 text-sm">{signer.name}</div>
              <div className="text-slate-600">{signer.title}</div>
              <div className="text-slate-500">{signer.organization}</div>
              {s.showDate && signer.date && (
                <div className="text-slate-400 text-[11px] pt-0.5">Date: {signer.date}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Callout Block
  if (block.type === 'callout') {
    const c = block as CalloutBlock;
    const styles = {
      info: {
        border: 'border-blue-200 bg-blue-50/40 text-blue-900',
        icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
      },
      warning: {
        border: 'border-amber-200 bg-amber-50/40 text-amber-900',
        icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
      },
      success: {
        border: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
        icon: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
      },
      note: {
        border: 'border-slate-200 bg-slate-50/50 text-slate-900',
        icon: <Bookmark className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />,
      },
    };
    const cur = styles[c.calloutType || 'info'];

    return (
      <div className={`my-3 p-3 rounded-lg border ${cur.border} space-y-1 text-xs`}>
        {c.title && (
          <div className="flex items-center gap-1.5 font-bold">
            {cur.icon}
            <span>{c.title}</span>
          </div>
        )}
        <div className="text-slate-700 leading-relaxed">{c.text}</div>
      </div>
    );
  }

  // Image Block
  if (block.type === 'image') {
    const img = block as ImageBlock;
    const alignClasses = {
      left: 'mr-auto',
      center: 'mx-auto',
      right: 'ml-auto',
    };

    return (
      <div className={`my-4 ${alignClasses[img.align || 'center']}`} style={{ maxWidth: `${img.widthPercent || 100}%` }}>
        <img
          src={img.url}
          alt={img.caption || 'Document asset'}
          className="rounded-md border border-slate-200 shadow-2xs max-h-96 object-contain mx-auto"
        />
        {img.caption && (
          <div className="text-center text-xs text-slate-500 italic mt-1.5">{img.caption}</div>
        )}
      </div>
    );
  }

  return null;
};
