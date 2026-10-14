import React from 'react';
import { X, Check, Image as ImageIcon, Sparkles, BookOpen, Layers, ShieldCheck, FileText } from 'lucide-react';
import { FrontPageTheme, FrontPageSettings } from '../../types/document';

interface FrontPageThemeSelectorModalProps {
  isOpen: boolean;
  settings: FrontPageSettings;
  onClose: () => void;
  onSelectTheme: (theme: FrontPageTheme) => void;
  onUpdateSettings: (updated: Partial<FrontPageSettings>) => void;
}

export const THEME_DEFINITIONS: Array<{
  id: FrontPageTheme;
  name: string;
  category: string;
  description: string;
  accentBg: string;
}> = [
  {
    id: 'classic-corporate',
    name: 'Classic Corporate',
    category: 'Corporate & Formal',
    description: 'Formal typography, centered title, understated divider, and structured metadata.',
    accentBg: 'bg-slate-100 border-slate-300',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    category: 'Clean & Modern',
    description: 'Generous whitespace, clean contemporary sans typography, and restrained aesthetics.',
    accentBg: 'bg-white border-slate-200',
  },
  {
    id: 'modern-geometric',
    name: 'Modern Geometric',
    category: 'Creative & Tech',
    description: 'Clean angular accents, blue highlight tag, and contemporary geometric balance.',
    accentBg: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    category: 'Executive & Strategic',
    description: 'Navy-accented top half suitable for enterprise business reports and proposals.',
    accentBg: 'bg-[#0F1E36] text-white border-blue-900',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    category: 'Publishing & Serif',
    description: 'Strong serif headline hierarchy with publication-grade magazine masthead.',
    accentBg: 'bg-amber-50/50 border-amber-200',
  },
  {
    id: 'technical-report',
    name: 'Technical Report',
    category: 'Engineering & Lab',
    description: 'Structured reference box, monospace telemetry, and revision specification grid.',
    accentBg: 'bg-slate-50 border-slate-400 font-mono',
  },
  {
    id: 'academic',
    name: 'Academic',
    category: 'Monograph & Thesis',
    description: 'Formal institution header, centered monograph title, author and committee blocks.',
    accentBg: 'bg-stone-50 border-stone-200',
  },
  {
    id: 'framed',
    name: 'Framed',
    category: 'Traditional Border',
    description: 'A refined inner hairline frame surrounding symmetrical title and author details.',
    accentBg: 'bg-white border-2 border-slate-800',
  },
  {
    id: 'color-panel',
    name: 'Color Panel',
    category: 'Modern Split',
    description: 'A prominent left-hand color spine paired with an expansive white content panel.',
    accentBg: 'bg-gradient-to-r from-blue-600 to-white border-blue-300',
  },
  {
    id: 'image-cover',
    name: 'Image Cover',
    category: 'Visual & Media',
    description: 'Large hero cover image with a gradient scrim, high-contrast title, and footer.',
    accentBg: 'bg-slate-800 text-white border-slate-700',
  },
];

export const FrontPageThemeSelectorModal: React.FC<FrontPageThemeSelectorModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSelectTheme,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Select Front Page Theme</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose from 10 distinct professional cover designs. Content and metadata are preserved automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 10 Themes Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {THEME_DEFINITIONS.map((t) => {
            const isSelected = settings.theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col justify-between transition-all group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-400 bg-white'
                }`}
              >
                <div>
                  {/* Theme thumbnail simulation */}
                  <div className={`h-24 rounded-lg mb-2.5 p-2 flex flex-col justify-between overflow-hidden border ${t.accentBg}`}>
                    <div className="flex justify-between items-center text-[9px] opacity-70">
                      <span>ORG</span>
                      <span>REF-01</span>
                    </div>
                    <div className="my-auto text-center font-bold text-xs line-clamp-1">
                      {t.name}
                    </div>
                    <div className="flex justify-between items-center text-[8px] opacity-60">
                      <span>Author</span>
                      <span>2026</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      {t.name}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mt-0.5">
                    {t.category}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {t.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};
