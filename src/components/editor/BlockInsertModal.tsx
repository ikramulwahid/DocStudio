import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Hash, 
  Pilcrow, 
  List, 
  ListOrdered, 
  Table as TableIcon, 
  Code, 
  Minus, 
  Scissors, 
  FileBadge, 
  PenTool, 
  MessageSquare, 
  Image as ImageIcon,
  SlidersHorizontal 
} from 'lucide-react';
import { BlockType } from '../../types/document';
import { createBlockByType } from '../../services/blockUtils';

interface BlockInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType, extraOptions?: any) => void;
}

export const BlockInsertModal: React.FC<BlockInsertModalProps> = ({
  isOpen,
  onClose,
  onSelectBlock,
}) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const blockCategories = [
    {
      category: 'Headings',
      items: [
        { type: 'heading' as BlockType, level: 1, title: 'Heading 1', desc: 'Main section header with dynamic numbering', icon: <Hash className="w-4 h-4 text-blue-600" />, slash: '/h1' },
        { type: 'heading' as BlockType, level: 2, title: 'Heading 2', desc: 'Subsection header with hierarchical number (e.g. 1.1)', icon: <Hash className="w-4 h-4 text-blue-500" />, slash: '/h2' },
        { type: 'heading' as BlockType, level: 3, title: 'Heading 3', desc: 'Sub-topic header with nested number (e.g. 1.1.1)', icon: <Hash className="w-4 h-4 text-blue-400" />, slash: '/h3' },
      ],
    },
    {
      category: 'Text & Prose',
      items: [
        { type: 'paragraph' as BlockType, title: 'Paragraph', desc: 'Formatted prose with bold, italic, links & color', icon: <Pilcrow className="w-4 h-4 text-slate-600" />, slash: '/paragraph' },
        { type: 'callout' as BlockType, title: 'Callout Note', desc: 'Highlighted notice, alert, or quote box', icon: <MessageSquare className="w-4 h-4 text-cyan-600" />, slash: '/callout' },
      ],
    },
    {
      category: 'Lists',
      items: [
        { type: 'list' as BlockType, listType: 'bullet', title: 'Bulleted List', desc: 'Disc, circle, square, arrow or dash markers', icon: <List className="w-4 h-4 text-emerald-600" />, slash: '/bullet' },
        { type: 'list' as BlockType, listType: 'numbered', title: 'Numbered List', desc: 'Decimal, alphabetic, or Roman numeral list', icon: <ListOrdered className="w-4 h-4 text-emerald-700" />, slash: '/numbered' },
      ],
    },
    {
      category: 'Tables & Data',
      items: [
        { type: 'table' as BlockType, title: 'Data Table', desc: 'Interactive grid with headers, rows, and columns', icon: <TableIcon className="w-4 h-4 text-sky-600" />, slash: '/table' },
      ],
    },
    {
      category: 'Mathematics',
      items: [
        { type: 'formula' as BlockType, title: 'Mathematical Formula', desc: 'LaTeX equation rendered via KaTeX engine', icon: <Code className="w-4 h-4 text-indigo-600" />, slash: '/formula' },
      ],
    },
    {
      category: 'Page Layout',
      items: [
        { type: 'divider' as BlockType, title: 'Horizontal Rule', desc: 'Visual separator with customizable thickness & style', icon: <Minus className="w-4 h-4 text-slate-500" />, slash: '/divider' },
        { type: 'pagebreak' as BlockType, title: 'Page Break', desc: 'Forces subsequent blocks onto a new physical page', icon: <Scissors className="w-4 h-4 text-rose-500" />, slash: '/pagebreak' },
        { type: 'sectionbreak' as BlockType, title: 'Section Break', desc: 'Starts a new section with independent headers, footers & page numbering', icon: <SlidersHorizontal className="w-4 h-4 text-indigo-600" />, slash: '/section' },
      ],
    },
    {
      category: 'Document Components',
      items: [
        { type: 'metadata' as BlockType, title: 'Document Metadata Block', desc: 'Displays title, author, reference ID & status live', icon: <FileBadge className="w-4 h-4 text-amber-600" />, slash: '/metadata' },
        { type: 'signature' as BlockType, title: 'Signature Block', desc: 'Formal execution lines for one or more signers', icon: <PenTool className="w-4 h-4 text-purple-600" />, slash: '/signature' },
        { type: 'image' as BlockType, title: 'Image Asset', desc: 'Graphic figure with caption and alignment', icon: <ImageIcon className="w-4 h-4 text-teal-600" />, slash: '/image' },
      ],
    },
  ];

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return blockCategories;
    const q = search.toLowerCase().trim();
    return blockCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) =>
            it.title.toLowerCase().includes(q) ||
            it.desc.toLowerCase().includes(q) ||
            it.slash.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-100">
        {/* Search header */}
        <div className="p-3 border-b border-slate-200 flex items-center gap-2.5 bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search block type or type /command..."
            className="flex-1 text-xs bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories and Block Items */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-3.5">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No blocks match "{search}". Try searching for heading, list, table, or formula.
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  {cat.category}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {cat.items.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSelectBlock(item.type, item);
                        onClose();
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white border border-slate-200 rounded-md group-hover:border-blue-300 shadow-2xs">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-tight">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 group-hover:text-blue-600 group-hover:border-blue-100">
                        {item.slash}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
