import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Trash2, 
  GripVertical, 
  Plus, 
  SlidersHorizontal,
  Hash,
  Pilcrow,
  List,
  Table as TableIcon,
  Code,
  Minus,
  Scissors,
  FileBadge,
  PenTool,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';
import { DocumentBlock, BlockType } from '../../types/document';

interface BlockWrapperProps {
  block: DocumentBlock;
  index: number;
  totalBlocks: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onOpenSettings?: () => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;
  children: React.ReactNode;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  index,
  totalBlocks,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onOpenSettings,
  onInsertBefore,
  onInsertAfter,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'heading': return <Hash className="w-3 h-3 text-blue-600" />;
      case 'paragraph': return <Pilcrow className="w-3 h-3 text-slate-500" />;
      case 'list': return <List className="w-3 h-3 text-emerald-600" />;
      case 'table': return <TableIcon className="w-3 h-3 text-sky-600" />;
      case 'formula': return <Code className="w-3 h-3 text-indigo-600" />;
      case 'divider': return <Minus className="w-3 h-3 text-slate-400" />;
      case 'pagebreak': return <Scissors className="w-3 h-3 text-rose-500" />;
      case 'sectionbreak': return <SlidersHorizontal className="w-3 h-3 text-indigo-600" />;
      case 'metadata': return <FileBadge className="w-3 h-3 text-amber-600" />;
      case 'signature': return <PenTool className="w-3 h-3 text-purple-600" />;
      case 'callout': return <MessageSquare className="w-3 h-3 text-cyan-600" />;
      case 'image': return <ImageIcon className="w-3 h-3 text-teal-600" />;
      default: return <Pilcrow className="w-3 h-3 text-slate-500" />;
    }
  };

  const getBlockLabel = (block: DocumentBlock) => {
    if (block.type === 'heading') return `H${block.level}`;
    if (block.type === 'pagebreak') return 'Break';
    if (block.type === 'sectionbreak') return 'Section';
    return block.type;
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group rounded-lg transition-all my-1.5 ${
        isSelected
          ? 'ring-1 ring-blue-500 bg-blue-50/10'
          : 'hover:bg-slate-50/60'
      }`}
    >
      {/* Top Hover Insert Line */}
      <div className="absolute -top-3 left-0 right-0 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInsertBefore();
          }}
          title="Insert block above"
          className="h-4.5 px-2 bg-blue-600 text-white rounded-full flex items-center gap-1 text-[10px] font-semibold shadow-xs hover:bg-blue-700 transition-colors pointer-events-auto"
        >
          <Plus className="w-2.5 h-2.5 stroke-[3]" /> Add
        </button>
      </div>

      {/* Floating Action Controls on top-right */}
      <div
        className={`absolute -top-3.5 right-2 flex items-center gap-0.5 bg-white border border-slate-200 rounded-md shadow-xs px-1 py-0.5 z-20 transition-opacity ${
          isHovered || isSelected ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Block Type Badge */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider select-none border-r border-slate-100 mr-0.5">
          {getBlockIcon(block.type)}
          <span>{getBlockLabel(block)}</span>
        </div>

        {/* Move Up */}
        <button
          type="button"
          disabled={index <= 0}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          title="Move up"
          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronUp className="w-3 h-3" />
        </button>

        {/* Move Down */}
        <button
          type="button"
          disabled={index >= totalBlocks - 1}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          title="Move down"
          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Duplicate */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate block"
          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Copy className="w-3 h-3" />
        </button>

        {/* Settings */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            title="Block configuration"
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3" />
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete block"
          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Block Body Content */}
      <div className="p-1.5 md:p-2">{children}</div>

      {/* Bottom Hover Insert Line */}
      <div className="absolute -bottom-3 left-0 right-0 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInsertAfter();
          }}
          title="Insert block below"
          className="h-4.5 px-2 bg-blue-600 text-white rounded-full flex items-center gap-1 text-[10px] font-semibold shadow-xs hover:bg-blue-700 transition-colors pointer-events-auto"
        >
          <Plus className="w-2.5 h-2.5 stroke-[3]" /> Add
        </button>
      </div>
    </div>
  );
};
