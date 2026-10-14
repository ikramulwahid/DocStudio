import React from 'react';
import { DocumentMetadata, FrontPageSettings, FrontPageTheme } from '../../types/document';
import { 
  Building2, 
  User, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  Bookmark,
  Layers,
  Sparkles
} from 'lucide-react';

interface FrontPageRendererProps {
  metadata: DocumentMetadata;
  frontPage: FrontPageSettings;
  width: number;
  height: number;
  isPrint?: boolean;
}

export const FrontPageRenderer: React.FC<FrontPageRendererProps> = ({
  metadata,
  frontPage,
  width,
  height,
  isPrint = false,
}) => {
  if (!frontPage.enabled) return null;

  const { theme, border, visibleFields, customIntro, coverImageUrl, logoUrl } = frontPage;

  // Metadata field lookup
  const getFieldValue = (field: string) => {
    switch (field) {
      case 'title': return metadata.title;
      case 'subtitle': return metadata.subtitle;
      case 'author': return metadata.author;
      case 'organization': return metadata.organization;
      case 'referenceId': return metadata.referenceId;
      case 'date': return metadata.updatedAt || metadata.createdAt;
      case 'status': return metadata.status;
      default: return '';
    }
  };

  const isVisible = (field: any) => (visibleFields || []).includes(field);

  // Border style container
  const borderStyle = border.enabled ? {
    border: `${border.thickness}px ${border.style} ${border.color}`,
    margin: `${border.inset}px`,
    width: `calc(100% - ${border.inset * 2}px)`,
    height: `calc(100% - ${border.inset * 2}px)`,
  } : {
    width: '100%',
    height: '100%',
  };

  return (
    <div
      id="front-page-sheet"
      style={{
        width: `${width}px`,
        minHeight: `${height}px`,
        height: `${height}px`,
        boxSizing: 'border-box',
      }}
      className="relative bg-white shadow-xl flex flex-col overflow-hidden text-slate-800 select-none print:shadow-none print:m-0"
    >
      {/* Optional Page Border */}
      <div
        className="relative h-full flex flex-col justify-between overflow-hidden"
        style={borderStyle}
      >
        {/* Render selected theme */}
        {renderThemeContent(theme, metadata, frontPage, isVisible, getFieldValue)}
      </div>
    </div>
  );
};

function renderThemeContent(
  theme: FrontPageTheme,
  metadata: DocumentMetadata,
  frontPage: FrontPageSettings,
  isVisible: (field: any) => boolean,
  getFieldValue: (field: string) => string
) {
  const { customIntro, coverImageUrl, logoUrl } = frontPage;

  switch (theme) {
    // ==========================================
    // 1. CLASSIC CORPORATE
    // ==========================================
    case 'classic-corporate':
      return (
        <div className="h-full flex flex-col justify-between p-16 text-center">
          {/* Top Organization Header */}
          <div className="pt-8 space-y-3">
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-10 mx-auto object-contain" />}
            {isVisible('organization') && (
              <div className="text-xs uppercase tracking-widest font-semibold text-slate-500">
                {getFieldValue('organization')}
              </div>
            )}
            <div className="w-16 h-0.5 bg-slate-900 mx-auto mt-4" />
          </div>

          {/* Center Title Block */}
          <div className="my-auto py-12 max-w-xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
              {getFieldValue('title')}
            </h1>
            {isVisible('subtitle') && metadata.subtitle && (
              <p className="text-base text-slate-600 font-serif italic max-w-md mx-auto leading-relaxed">
                {metadata.subtitle}
              </p>
            )}
            {customIntro && (
              <p className="text-xs text-slate-500 max-w-md mx-auto pt-4 leading-relaxed">
                {customIntro}
              </p>
            )}
          </div>

          {/* Bottom Structured Metadata */}
          <div className="pb-8 border-t border-slate-200 pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
              {isVisible('author') && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prepared By</div>
                  <div className="font-medium text-slate-800 mt-0.5">{metadata.author}</div>
                </div>
              )}
              {isVisible('referenceId') && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reference</div>
                  <div className="font-mono text-slate-800 mt-0.5">{metadata.referenceId}</div>
                </div>
              )}
              {isVisible('date') && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</div>
                  <div className="text-slate-800 mt-0.5">{metadata.updatedAt}</div>
                </div>
              )}
              {isVisible('status') && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classification</div>
                  <div className="font-semibold text-slate-800 uppercase mt-0.5">{metadata.status}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    // ==========================================
    // 2. MINIMAL
    // ==========================================
    case 'minimal':
      return (
        <div className="h-full flex flex-col justify-between p-20 text-left">
          {/* Top Ref & Org */}
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            {isVisible('organization') && <span>{metadata.organization}</span>}
            {isVisible('referenceId') && <span>{metadata.referenceId}</span>}
          </div>

          {/* Middle Typography Block */}
          <div className="my-auto space-y-6 max-w-xl">
            <div className="w-10 h-1 bg-blue-600" />
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {getFieldValue('title')}
            </h1>
            {isVisible('subtitle') && metadata.subtitle && (
              <p className="text-lg text-slate-500 font-light leading-snug">
                {metadata.subtitle}
              </p>
            )}
            {customIntro && (
              <p className="text-xs text-slate-400 pt-2 leading-relaxed max-w-md">
                {customIntro}
              </p>
            )}
          </div>

          {/* Bottom Single Line Details */}
          <div className="flex flex-wrap gap-8 text-xs text-slate-500 pt-8 border-t border-slate-100">
            {isVisible('author') && (
              <div>
                <span className="text-slate-400">Author:</span> <strong className="text-slate-700">{metadata.author}</strong>
              </div>
            )}
            {isVisible('date') && (
              <div>
                <span className="text-slate-400">Published:</span> <span className="text-slate-700">{metadata.updatedAt}</span>
              </div>
            )}
            {isVisible('status') && (
              <div>
                <span className="text-slate-400">Status:</span> <span className="font-semibold text-slate-700">{metadata.status}</span>
              </div>
            )}
          </div>
        </div>
      );

    // ==========================================
    // 3. MODERN GEOMETRIC
    // ==========================================
    case 'modern-geometric':
      return (
        <div className="h-full flex flex-col justify-between p-16 relative overflow-hidden">
          {/* Geometric Accent Shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 -mr-20 -mt-20 rounded-full pointer-events-none" />
          <div className="absolute top-12 right-12 w-32 h-32 border-4 border-blue-600/20 pointer-events-none rotate-12" />

          {/* Header */}
          <div className="relative z-10">
            {isVisible('organization') && (
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                {metadata.organization}
              </div>
            )}
          </div>

          {/* Center Title Card */}
          <div className="relative z-10 my-auto py-12 max-w-lg space-y-4">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-mono font-bold tracking-widest uppercase rounded">
              DOCUMENT SPECIFICATION
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {getFieldValue('title')}
            </h1>
            {isVisible('subtitle') && metadata.subtitle && (
              <p className="text-base text-slate-600 leading-relaxed">
                {metadata.subtitle}
              </p>
            )}
            {customIntro && (
              <p className="text-xs text-slate-500 pt-2 leading-relaxed">
                {customIntro}
              </p>
            )}
          </div>

          {/* Bottom Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            {isVisible('author') && (
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Prepared By</div>
                <div className="font-semibold text-slate-800">{metadata.author}</div>
              </div>
            )}
            {isVisible('referenceId') && (
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Document ID</div>
                <div className="font-mono text-slate-800">{metadata.referenceId}</div>
              </div>
            )}
            {isVisible('date') && (
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Date of Release</div>
                <div className="text-slate-800">{metadata.updatedAt}</div>
              </div>
            )}
            {isVisible('status') && (
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Security Tier</div>
                <div className="font-semibold text-blue-700">{metadata.status}</div>
              </div>
            )}
          </div>
        </div>
      );

    // ==========================================
    // 4. EXECUTIVE NAVY
    // ==========================================
    case 'executive-navy':
      return (
        <div className="h-full flex flex-col justify-between">
          {/* Top Full Navy Banner */}
          <div className="bg-[#0F1E36] text-white p-14 sm:p-16 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-blue-200">
              {isVisible('organization') && <span className="font-semibold tracking-wider uppercase">{metadata.organization}</span>}
              {isVisible('status') && (
                <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/40 rounded text-[10px] font-mono uppercase font-bold text-blue-300">
                  {metadata.status}
                </span>
              )}
            </div>

            <div className="my-auto py-8 space-y-4 max-w-lg">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                {getFieldValue('title')}
              </h1>
              {isVisible('subtitle') && metadata.subtitle && (
                <p className="text-base text-blue-100/90 font-light leading-relaxed">
                  {metadata.subtitle}
                </p>
              )}
              {customIntro && (
                <p className="text-xs text-blue-200/80 pt-2 leading-relaxed">
                  {customIntro}
                </p>
              )}
            </div>

            <div className="w-16 h-1 bg-amber-400" />
          </div>

          {/* Bottom White Metadata Footer */}
          <div className="bg-white p-10 sm:p-14 border-t-4 border-amber-400">
            <div className="grid grid-cols-3 gap-6 text-xs">
              {isVisible('author') && (
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Author</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{metadata.author}</div>
                </div>
              )}
              {isVisible('referenceId') && (
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reference</div>
                  <div className="font-mono text-slate-900 mt-0.5">{metadata.referenceId}</div>
                </div>
              )}
              {isVisible('date') && (
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Publication Date</div>
                  <div className="text-slate-900 mt-0.5">{metadata.updatedAt}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    // ==========================================
    // 5. EDITORIAL
    // ==========================================
    case 'editorial':
      return (
        <div className="h-full flex flex-col justify-between p-16 font-serif">
          {/* Top Magazine Masthead */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
            <span className="text-xs uppercase font-sans tracking-widest font-bold text-slate-900">
              {isVisible('organization') ? metadata.organization : 'SPECIAL EDITION'}
            </span>
            <span className="text-xs font-mono text-slate-500">
              {isVisible('date') && metadata.updatedAt}
            </span>
          </div>

          {/* Center Editorial Title */}
          <div className="my-auto py-12 space-y-6 max-w-xl">
            <div className="text-xs uppercase font-sans tracking-widest font-bold text-rose-600">
              FEATURE BRIEFING
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight leading-tight">
              {getFieldValue('title')}
            </h1>
            {isVisible('subtitle') && metadata.subtitle && (
              <p className="text-xl text-slate-600 font-serif italic leading-relaxed">
                {metadata.subtitle}
              </p>
            )}
            {customIntro && (
              <p className="text-xs font-sans text-slate-600 pt-2 leading-relaxed border-l-2 border-slate-900 pl-4">
                {customIntro}
              </p>
            )}
          </div>

          {/* Bottom Columnar Info */}
          <div className="border-t border-slate-300 pt-6 grid grid-cols-3 gap-6 font-sans text-xs">
            {isVisible('author') && (
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Author</span>
                <span className="font-medium text-slate-900">{metadata.author}</span>
              </div>
            )}
            {isVisible('referenceId') && (
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Document ID</span>
                <span className="font-mono text-slate-900">{metadata.referenceId}</span>
              </div>
            )}
            {isVisible('status') && (
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Status</span>
                <span className="font-semibold text-slate-900 uppercase">{metadata.status}</span>
              </div>
            )}
          </div>
        </div>
      );

    // ==========================================
    // 6. TECHNICAL REPORT
    // ==========================================
    case 'technical-report':
      return (
        <div className="h-full flex flex-col justify-between p-14 font-mono text-xs text-slate-800">
          {/* Top Specification Header */}
          <div className="border-2 border-slate-900 p-4 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold uppercase tracking-wider text-slate-900">
                {isVisible('organization') ? metadata.organization : 'APEX TECHNICAL REPORT'}
              </span>
              {isVisible('status') && (
                <span className="px-2 py-0.5 bg-slate-900 text-white font-bold text-[10px]">
                  {metadata.status}
                </span>
              )}
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>DOC REF: {metadata.referenceId}</span>
              <span>DATE: {metadata.updatedAt}</span>
            </div>
          </div>

          {/* Center Technical Title */}
          <div className="my-auto py-8 space-y-4">
            <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">
              // TECHNICAL SPECIFICATION & BENCHMARK REPORT
            </div>
            <h1 className="text-3xl font-sans font-bold text-slate-900 leading-snug">
              {getFieldValue('title')}
            </h1>
            {isVisible('subtitle') && metadata.subtitle && (
              <p className="text-sm font-sans text-slate-600 leading-relaxed">
                {metadata.subtitle}
              </p>
            )}
            {customIntro && (
              <div className="p-3 bg-slate-50 border border-slate-200 font-sans text-xs text-slate-600 mt-4">
                <strong>Abstract:</strong> {customIntro}
              </div>
            )}
          </div>

          {/* Bottom Table Grid */}
          <div className="border-2 border-slate-900">
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2 bg-slate-50 font-bold border-r border-slate-200 w-1/3">Principal Author</td>
                  <td className="p-2">{metadata.author}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 bg-slate-50 font-bold border-r border-slate-200">Issuing Entity</td>
                  <td className="p-2">{metadata.organization}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-slate-50 font-bold border-r border-slate-200">Distribution Tier</td>
                  <td className="p-2 uppercase font-bold text-slate-900">{metadata.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    // ==========================================
    // 7. ACADEMIC
    // ==========================================
    case 'academic':
      return (
        <div className="h-full flex flex-col justify-between p-16 text-center font-serif">
          {/* Top Institution Block */}
          <div className="pt-10 space-y-2">
            {isVisible('organization') && (
              <div className="text-sm font-bold uppercase tracking-widest text-slate-800">
                {metadata.organization}
              </div>
            )}
            <div className="text-xs text-slate-500 uppercase tracking-wider">
              Department of Technical Research & Publications
            </div>
          </div>

          {/* Center Title Block */}
          <div className="my-auto py-12 max-w-lg mx-auto space-y-6">
            <h1 className="text-3xl font-serif font-bold text-slate-900 leading-tight">
              {getFieldValue('title')}
            </h1>
            {isVisible('subtitle') && metadata.subtitle && (
              <p className="text-base text-slate-600 italic">
                {metadata.subtitle}
              </p>
            )}
            {customIntro && (
              <p className="text-xs font-sans text-slate-500 max-w-md mx-auto pt-4 leading-relaxed italic">
                "{customIntro}"
              </p>
            )}
          </div>

          {/* Bottom Author & Committee */}
          <div className="pb-10 space-y-2 text-xs text-slate-700">
            {isVisible('author') && (
              <div>
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Prepared By</span>
                <span className="font-semibold text-slate-900 text-sm">{metadata.author}</span>
              </div>
            )}
            <div className="pt-4 text-slate-500 text-[11px]">
              {isVisible('date') && <span>{metadata.updatedAt}</span>}
              {isVisible('referenceId') && <span> · Monograph ID {metadata.referenceId}</span>}
            </div>
          </div>
        </div>
      );

    // ==========================================
    // 8. FRAMED
    // ==========================================
    case 'framed':
      return (
        <div className="h-full flex flex-col justify-between p-14 relative">
          {/* Inner Accent Frame */}
          <div className="border border-slate-900/30 p-10 h-full flex flex-col justify-between text-center">
            {/* Top Logo & Org */}
            <div>
              {isVisible('organization') && (
                <div className="text-xs font-serif uppercase tracking-widest text-slate-600 font-bold">
                  {metadata.organization}
                </div>
              )}
            </div>

            {/* Center Content */}
            <div className="my-auto py-8 max-w-lg mx-auto space-y-4">
              <div className="w-12 h-0.5 bg-blue-600 mx-auto" />
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
                {getFieldValue('title')}
              </h1>
              {isVisible('subtitle') && metadata.subtitle && (
                <p className="text-sm font-serif text-slate-600 italic">
                  {metadata.subtitle}
                </p>
              )}
              {customIntro && (
                <p className="text-xs text-slate-500 max-w-md mx-auto pt-2">
                  {customIntro}
                </p>
              )}
            </div>

            {/* Bottom Metadata */}
            <div className="pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-600">
              {isVisible('author') && <span>{metadata.author}</span>}
              {isVisible('date') && <span>{metadata.updatedAt}</span>}
              {isVisible('status') && <span className="font-bold uppercase">{metadata.status}</span>}
            </div>
          </div>
        </div>
      );

    // ==========================================
    // 9. COLOR PANEL
    // ==========================================
    case 'color-panel':
      return (
        <div className="h-full flex">
          {/* Left Vertical Color Panel (30% width) */}
          <div className="w-28 sm:w-36 bg-blue-600 text-white p-8 flex flex-col justify-between">
            <div className="text-xs font-mono font-bold uppercase rotate-180 [writing-mode:vertical-lr] tracking-widest opacity-80">
              {isVisible('organization') ? metadata.organization : 'DOCSTUDIO'}
            </div>
            {isVisible('referenceId') && (
              <div className="text-[10px] font-mono opacity-80">
                {metadata.referenceId}
              </div>
            )}
          </div>

          {/* Right Main Body (70% width) */}
          <div className="flex-1 p-14 flex flex-col justify-between bg-white">
            <div className="space-y-1">
              {isVisible('status') && (
                <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded">
                  {metadata.status}
                </span>
              )}
            </div>

            <div className="my-auto py-8 space-y-4 max-w-lg">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {getFieldValue('title')}
              </h1>
              {isVisible('subtitle') && metadata.subtitle && (
                <p className="text-base text-slate-600 leading-relaxed font-light">
                  {metadata.subtitle}
                </p>
              )}
              {customIntro && (
                <p className="text-xs text-slate-500 pt-2 leading-relaxed">
                  {customIntro}
                </p>
              )}
            </div>

            <div className="space-y-2 pt-6 border-t border-slate-100 text-xs text-slate-600">
              {isVisible('author') && (
                <div>
                  <span className="text-slate-400">Prepared by:</span> <strong className="text-slate-800">{metadata.author}</strong>
                </div>
              )}
              {isVisible('date') && (
                <div>
                  <span className="text-slate-400">Date:</span> <span>{metadata.updatedAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    // ==========================================
    // 10. IMAGE COVER
    // ==========================================
    case 'image-cover':
    default:
      return (
        <div className="h-full flex flex-col justify-between bg-slate-900 text-white relative overflow-hidden">
          {/* Background or Hero Cover Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
            style={{
              backgroundImage: `url(${coverImageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80'})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent pointer-events-none" />

          {/* Top Organization Header */}
          <div className="relative z-10 p-16 flex justify-between items-center text-xs text-slate-300">
            {isVisible('organization') && (
              <span className="font-bold uppercase tracking-widest">{metadata.organization}</span>
            )}
            {isVisible('status') && (
              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-xs rounded text-[10px] font-mono uppercase font-bold text-white">
                {metadata.status}
              </span>
            )}
          </div>

          {/* Center Main Title */}
          <div className="relative z-10 p-16 my-auto space-y-4 max-w-xl">
            <div className="w-12 h-1 bg-blue-500" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {getFieldValue('title')}
            </h1>
            {isVisible('subtitle') && metadata.subtitle && (
              <p className="text-lg text-slate-200 font-light leading-snug">
                {metadata.subtitle}
              </p>
            )}
            {customIntro && (
              <p className="text-xs text-slate-300 pt-2 leading-relaxed max-w-md">
                {customIntro}
              </p>
            )}
          </div>

          {/* Bottom Metadata Bar */}
          <div className="relative z-10 p-16 pt-6 border-t border-white/20 flex flex-wrap gap-8 text-xs text-slate-300">
            {isVisible('author') && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Author</span>
                <span className="font-semibold text-white">{metadata.author}</span>
              </div>
            )}
            {isVisible('referenceId') && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Document ID</span>
                <span className="font-mono text-white">{metadata.referenceId}</span>
              </div>
            )}
            {isVisible('date') && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Release Date</span>
                <span className="text-white">{metadata.updatedAt}</span>
              </div>
            )}
          </div>
        </div>
      );
  }
}
