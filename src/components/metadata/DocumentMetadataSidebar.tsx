import React, { useState } from 'react';
import { 
  FileText, 
  Settings2, 
  Layout, 
  BarChart3, 
  Copy, 
  Trash2, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  Layers,
  BookOpen,
  Image as ImageIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Square,
  Eye
} from 'lucide-react';
import { 
  DocumentMetadata, 
  DocumentSettings, 
  DocumentStats, 
  DocumentStatus, 
  PageSize, 
  PageOrientation, 
  PageMargin,
  FontFamilyOption,
  FontSizeOption,
  LineHeightOption,
  PageNumberingFormat,
  FrontPageTheme,
  FrontPageSettings
} from '../../types/document';
import { FrontPageThemeSelectorModal, THEME_DEFINITIONS } from '../frontpage/FrontPageThemeSelectorModal';

interface DocumentMetadataSidebarProps {
  metadata: DocumentMetadata;
  settings: DocumentSettings;
  stats: DocumentStats;
  onMetadataChange: (fields: Partial<DocumentMetadata>) => void;
  onSettingsChange: (fields: Partial<DocumentSettings>) => void;
  onDuplicate: () => void;
  onClearContent: () => void;
  onResetSettings: () => void;
  onApplyTemplate: (templateKey: string) => void;
}

export const DocumentMetadataSidebar: React.FC<DocumentMetadataSidebarProps> = ({
  metadata,
  settings,
  stats,
  onMetadataChange,
  onSettingsChange,
  onDuplicate,
  onClearContent,
  onResetSettings,
  onApplyTemplate,
}) => {
  // Collapsible accordion state for sections
  const [sections, setSections] = useState({
    info: true,
    frontPage: true,
    layout: true,
    headerFooter: false,
    stats: false,
    actions: false,
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const frontPage: FrontPageSettings = settings.frontPage || {
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
    coverImageUrl: '',
    logoUrl: '',
    align: 'center',
  };

  const updateFrontPage = (partial: Partial<FrontPageSettings>) => {
    onSettingsChange({
      frontPage: {
        ...frontPage,
        ...partial,
        border: {
          ...frontPage.border,
          ...(partial.border || {}),
        },
      },
    });
  };

  return (
    <aside className="h-full bg-white border-r border-slate-200 overflow-y-auto flex flex-col text-xs select-none">
      {/* Top Header of the Left Column */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs tracking-tight">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Document Configuration</span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">
          {settings.pageSize.toUpperCase()} · {settings.orientation}
        </span>
      </div>

      <div className="p-3.5 space-y-3.5 flex-1">
        {/* SECTION 1: Document Information */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('info')}
            className="w-full px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors font-semibold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Document Information</span>
            </div>
            {sections.info ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.info && (
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => onMetadataChange({ title: e.target.value })}
                  placeholder="Document Title"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={metadata.subtitle}
                  onChange={(e) => onMetadataChange({ subtitle: e.target.value })}
                  placeholder="Brief descriptive subtitle"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Author</label>
                  <input
                    type="text"
                    value={metadata.author}
                    onChange={(e) => onMetadataChange({ author: e.target.value })}
                    placeholder="Author name"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Organization</label>
                  <input
                    type="text"
                    value={metadata.organization}
                    onChange={(e) => onMetadataChange({ organization: e.target.value })}
                    placeholder="Company / Org"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Reference ID</label>
                  <input
                    type="text"
                    value={metadata.referenceId}
                    onChange={(e) => onMetadataChange({ referenceId: e.target.value })}
                    placeholder="DOC-2026-001"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Status</label>
                  <select
                    value={metadata.status}
                    onChange={(e) => onMetadataChange({ status: e.target.value as DocumentStatus })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Final">Final</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <div>
                  <span className="font-medium text-slate-600">Created:</span>
                  <div className="text-slate-700">{metadata.createdAt}</div>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Modified:</span>
                  <div className="text-slate-700">{metadata.updatedAt}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Front Page / Cover Sheet */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('frontPage')}
            className="w-full px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors font-semibold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Front Page / Cover Sheet</span>
            </div>
            <div className="flex items-center gap-2">
              {frontPage.enabled ? (
                <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded">
                  Active
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-normal">Off</span>
              )}
              {sections.frontPage ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </div>
          </button>

          {sections.frontPage && (
            <div className="p-3 space-y-3.5">
              {/* Enable Front Page Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-800">Enable Front Page</div>
                  <div className="text-[10px] text-slate-500">Renders as Page 1 before body content</div>
                </div>
                <input
                  type="checkbox"
                  checked={frontPage.enabled}
                  onChange={(e) => updateFrontPage({ enabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {frontPage.enabled && (
                <>
                  {/* Theme Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-700">Cover Theme</label>
                      <button
                        type="button"
                        onClick={() => setIsThemeModalOpen(true)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Browse 10 Themes</span>
                      </button>
                    </div>

                    <select
                      value={frontPage.theme}
                      onChange={(e) => updateFrontPage({ theme: e.target.value as FrontPageTheme })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none text-slate-900 bg-white font-medium"
                    >
                      {THEME_DEFINITIONS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} — {t.category}
                        </option>
                      ))}
                    </select>

                    <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between">
                      <span>Active: <strong className="text-slate-800">{THEME_DEFINITIONS.find((t) => t.id === frontPage.theme)?.name}</strong></span>
                      <button
                        type="button"
                        onClick={() => setIsThemeModalOpen(true)}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Metadata Fields Checklist */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-semibold text-slate-700">Visible Fields on Cover</label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50/70 p-2 rounded-md border border-slate-200">
                      {[
                        { id: 'title', label: 'Document Title' },
                        { id: 'subtitle', label: 'Subtitle' },
                        { id: 'author', label: 'Author' },
                        { id: 'organization', label: 'Organization' },
                        { id: 'referenceId', label: 'Reference ID' },
                        { id: 'date', label: 'Date' },
                        { id: 'status', label: 'Status Badge' },
                      ].map((field) => {
                        const isChecked = (frontPage.visibleFields || []).includes(field.id as any);
                        return (
                          <label key={field.id} className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = frontPage.visibleFields || [];
                                const updated = e.target.checked
                                  ? [...current, field.id as any]
                                  : current.filter((f) => f !== field.id);
                                updateFrontPage({ visibleFields: updated });
                              }}
                              className="rounded text-blue-600 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span>{field.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-semibold text-slate-700">Title & Content Alignment</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-md">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateFrontPage({ align })}
                          className={`py-1 text-[11px] font-medium rounded flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                            (frontPage.align || 'center') === align
                              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {align === 'left' && <AlignLeft className="w-3 h-3" />}
                          {align === 'center' && <AlignCenter className="w-3 h-3" />}
                          {align === 'right' && <AlignRight className="w-3 h-3" />}
                          <span className="capitalize">{align}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Intro / Synopsis */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-semibold text-slate-700">Introductory Text / Synopsis</label>
                    <textarea
                      value={frontPage.customIntro || ''}
                      onChange={(e) => updateFrontPage({ customIntro: e.target.value })}
                      placeholder="Add an executive synopsis, formal abstract, or custom cover wording..."
                      rows={2}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none text-slate-900 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Branding / Images */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-semibold text-slate-700">Branding Assets</label>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500">Logo Image URL</span>
                        {frontPage.logoUrl && (
                          <button
                            type="button"
                            onClick={() => updateFrontPage({ logoUrl: '' })}
                            className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={frontPage.logoUrl || ''}
                        onChange={(e) => updateFrontPage({ logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500">Cover Hero Image URL</span>
                        {frontPage.coverImageUrl && (
                          <button
                            type="button"
                            onClick={() => updateFrontPage({ coverImageUrl: '' })}
                            className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={frontPage.coverImageUrl || ''}
                        onChange={(e) => updateFrontPage({ coverImageUrl: e.target.value })}
                        placeholder="Hero image for Image Cover theme"
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none"
                      />
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                        <span>Presets:</span>
                        <button
                          type="button"
                          onClick={() => updateFrontPage({ coverImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80' })}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          Skyline
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => updateFrontPage({ coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80' })}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          Technology
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => updateFrontPage({ coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80' })}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          Minimal Office
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Border & Frame Customization (Section 1.3) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-700">Page Frame & Border</label>
                      <input
                        type="checkbox"
                        checked={frontPage.border?.enabled ?? false}
                        onChange={(e) => updateFrontPage({
                          border: {
                            ...frontPage.border,
                            enabled: e.target.checked,
                          }
                        })}
                        className="rounded text-blue-600 w-3.5 h-3.5 cursor-pointer"
                      />
                    </div>

                    {frontPage.border?.enabled && (
                      <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">Border Style</span>
                            <select
                              value={frontPage.border.style || 'solid'}
                              onChange={(e) => updateFrontPage({
                                border: {
                                  ...frontPage.border,
                                  style: e.target.value as any,
                                }
                              })}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white outline-none"
                            >
                              <option value="solid">Solid</option>
                              <option value="dashed">Dashed</option>
                              <option value="dotted">Dotted</option>
                              <option value="double">Double</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">Thickness</span>
                            <select
                              value={frontPage.border.thickness || 2}
                              onChange={(e) => updateFrontPage({
                                border: {
                                  ...frontPage.border,
                                  thickness: Number(e.target.value),
                                }
                              })}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white outline-none"
                            >
                              <option value={1}>1 px (Thin)</option>
                              <option value={2}>2 px (Normal)</option>
                              <option value={3}>3 px (Bold)</option>
                              <option value={4}>4 px (Heavy)</option>
                              <option value={6}>6 px (Prominent)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">Margin Inset</span>
                            <select
                              value={frontPage.border.inset || 24}
                              onChange={(e) => updateFrontPage({
                                border: {
                                  ...frontPage.border,
                                  inset: Number(e.target.value),
                                }
                              })}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white outline-none"
                            >
                              <option value={16}>16 px (Close to edge)</option>
                              <option value={24}>24 px (Standard)</option>
                              <option value={32}>32 px (Generous)</option>
                              <option value={40}>40 px (Deep inset)</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">Border Color</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={frontPage.border.color || '#1E293B'}
                                onChange={(e) => updateFrontPage({
                                  border: {
                                    ...frontPage.border,
                                    color: e.target.value,
                                  }
                                })}
                                className="w-7 h-7 p-0.5 rounded border border-slate-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={frontPage.border.color || '#1E293B'}
                                onChange={(e) => updateFrontPage({
                                  border: {
                                    ...frontPage.border,
                                    color: e.target.value,
                                  }
                                })}
                                className="flex-1 px-1.5 py-1 text-xs font-mono border border-slate-200 rounded outline-none uppercase"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Color Presets */}
                        <div className="flex items-center gap-1 pt-1">
                          <span className="text-[10px] text-slate-400">Presets:</span>
                          {[
                            { name: 'Charcoal', val: '#1E293B' },
                            { name: 'Navy', val: '#0F1E36' },
                            { name: 'Slate', val: '#64748B' },
                            { name: 'Gold', val: '#D97706' },
                            { name: 'Blue', val: '#2563EB' },
                          ].map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => updateFrontPage({
                                border: { ...frontPage.border, color: c.val }
                              })}
                              style={{ backgroundColor: c.val }}
                              className="w-4 h-4 rounded-full border border-white shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: Page & Typography Layout */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('layout')}
            className="w-full px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors font-semibold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <Layout className="w-3.5 h-3.5 text-slate-500" />
              <span>Page & Typography</span>
            </div>
            {sections.layout ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.layout && (
            <div className="p-3 space-y-3">
              {/* Document Template Selector */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Template Style</label>
                <select
                  value={settings.template}
                  onChange={(e) => onApplyTemplate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                >
                  <option value="executive">Executive Summary</option>
                  <option value="proposal">Project Proposal</option>
                  <option value="report">Technical Report</option>
                  <option value="blank">Blank Slate</option>
                </select>
              </div>

              {/* Page Size & Orientation */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Page Size</label>
                  <select
                    value={settings.pageSize}
                    onChange={(e) => onSettingsChange({ pageSize: e.target.value as PageSize })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                  >
                    <option value="a4">A4 (210 × 297mm)</option>
                    <option value="letter">US Letter (8.5 × 11")</option>
                    <option value="legal">Legal (8.5 × 14")</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Orientation</label>
                  <select
                    value={settings.orientation}
                    onChange={(e) => onSettingsChange({ orientation: e.target.value as PageOrientation })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              {/* Page Margins */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Page Margins</label>
                <select
                  value={settings.margins}
                  onChange={(e) => onSettingsChange({ margins: e.target.value as PageMargin })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                >
                  <option value="normal">Normal — 25.4 mm (1.00 in)</option>
                  <option value="narrow">Narrow — 12.7 mm (0.50 in)</option>
                  <option value="wide">Wide — 38.1 mm (1.50 in)</option>
                  <option value="compact">Compact — 18.0 mm (0.71 in)</option>
                </select>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Font Family</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onSettingsChange({ fontFamily: e.target.value as FontFamilyOption })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Sans)</option>
                  <option value="Source Serif 4">Source Serif 4 (Editorial Serif)</option>
                  <option value="Lora">Lora (Classic Literary Serif)</option>
                  <option value="IBM Plex Mono">IBM Plex Mono (Technical Monospace)</option>
                </select>
              </div>

              {/* Font Size & Line Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Base Font Size</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => onSettingsChange({ fontSize: e.target.value as FontSizeOption })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                  >
                    <option value="10pt">10 pt</option>
                    <option value="11pt">11 pt</option>
                    <option value="12pt">12 pt</option>
                    <option value="14pt">14 pt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Line Spacing</label>
                  <select
                    value={settings.lineHeight}
                    onChange={(e) => onSettingsChange({ lineHeight: e.target.value as LineHeightOption })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                  >
                    <option value="1.15">1.15 (Tight)</option>
                    <option value="1.3">1.30 (Normal)</option>
                    <option value="1.5">1.50 (Relaxed)</option>
                    <option value="1.75">1.75 (Open)</option>
                    <option value="2.0">2.00 (Double)</option>
                  </select>
                </div>
              </div>

              {/* Heading Numbering Scheme */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Heading Numbering Scheme</label>
                <select
                  value={settings.headingNumberingScheme || '1.1'}
                  onChange={(e) => onSettingsChange({ headingNumberingScheme: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                >
                  <option value="1.1">Hierarchical (1., 1.1, 1.2.1)</option>
                  <option value="1">Decimal (1., 2., 3.)</option>
                  <option value="A">Alphabetic (A., B., C.)</option>
                  <option value="I">Uppercase Roman (I., II., III.)</option>
                  <option value="i">Lowercase Roman (i., ii., iii.)</option>
                </select>
              </div>

              {/* Document Banner Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-700">Display Header Banner</div>
                  <div className="text-[10px] text-slate-400">Renders styled title block on page 1</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showTitleBanner}
                  onChange={(e) => onSettingsChange({ showTitleBanner: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Headers, Footers & Numbering */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('headerFooter')}
            className="w-full px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors font-semibold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Headers & Footers</span>
            </div>
            {sections.headerFooter ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.headerFooter && (
            <div className="p-3 space-y-3">
              {/* Header Toggle & Inputs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-700">Running Header</span>
                  <input
                    type="checkbox"
                    checked={settings.showHeader}
                    onChange={(e) => onSettingsChange({ showHeader: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                {settings.showHeader && (
                  <div className="space-y-2 mt-2">
                    <input
                      type="text"
                      value={settings.headerLeft}
                      onChange={(e) => onSettingsChange({ headerLeft: e.target.value })}
                      placeholder="Header left text"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      value={settings.headerCenter || ''}
                      onChange={(e) => onSettingsChange({ headerCenter: e.target.value })}
                      placeholder="Header center text (optional)"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      value={settings.headerRight}
                      onChange={(e) => onSettingsChange({ headerRight: e.target.value })}
                      placeholder="Header right text"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Footer Toggle & Inputs */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-700">Running Footer</span>
                  <input
                    type="checkbox"
                    checked={settings.showFooter}
                    onChange={(e) => onSettingsChange({ showFooter: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                {settings.showFooter && (
                  <input
                    type="text"
                    value={settings.footerText}
                    onChange={(e) => onSettingsChange({ footerText: e.target.value })}
                    placeholder="Footer disclaimer / note"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none mt-2"
                  />
                )}
              </div>

              {/* Page Numbering */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Page Numbering</label>
                <select
                  value={settings.pageNumbering}
                  onChange={(e) => onSettingsChange({ pageNumbering: e.target.value as PageNumberingFormat })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none bg-white text-slate-900"
                >
                  <option value="Page X of Y">Page X of Y</option>
                  <option value="X / Y">X / Y</option>
                  <option value="X">X (Number only)</option>
                  <option value="none">None (Disabled)</option>
                </select>
              </div>

              {/* Watermark */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-700">Watermark</span>
                  <input
                    type="checkbox"
                    checked={settings.showWatermark}
                    onChange={(e) => onSettingsChange({ showWatermark: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                {settings.showWatermark && (
                  <input
                    type="text"
                    value={settings.watermarkText}
                    onChange={(e) => onSettingsChange({ watermarkText: e.target.value })}
                    placeholder="CONFIDENTIAL, DRAFT, etc."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 outline-none mt-2 uppercase font-mono"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Document Statistics */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('stats')}
            className="w-full px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors font-semibold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Document Statistics</span>
            </div>
            {sections.stats ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.stats && (
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-base font-bold text-slate-900 tabular-nums">{stats.wordCount.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Words</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-base font-bold text-slate-900 tabular-nums">{stats.charCount.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Characters</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-base font-bold text-slate-900 tabular-nums">~{stats.pageCount}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Est. Pages</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-base font-bold text-slate-900 tabular-nums">{stats.readingTimeMinutes} min</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Read Time</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Document Actions */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('actions')}
            className="w-full px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors font-semibold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Document Actions</span>
            </div>
            {sections.actions ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {sections.actions && (
            <div className="p-3 space-y-2">
              <button
                type="button"
                onClick={onDuplicate}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 transition-colors text-left"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Duplicate Document</span>
              </button>

              <button
                type="button"
                onClick={onResetSettings}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 transition-colors text-left"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Settings to Default</span>
              </button>

              <button
                type="button"
                onClick={onClearContent}
                className="w-full px-3 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium flex items-center gap-2 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Clear Document Content</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Front Page Theme Selector Modal */}
      <FrontPageThemeSelectorModal
        isOpen={isThemeModalOpen}
        settings={frontPage}
        onClose={() => setIsThemeModalOpen(false)}
        onSelectTheme={(selectedTheme) => {
          updateFrontPage({ theme: selectedTheme });
          setIsThemeModalOpen(false);
        }}
        onUpdateSettings={updateFrontPage}
      />
    </aside>
  );
};
