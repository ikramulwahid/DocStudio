import React from 'react';
import { ListBlock, ListItem, BulletMarkerStyle, NumberedListStyle } from '../../../types/document';
import { Plus, Trash2, ArrowRight, CornerDownRight, List, ListOrdered } from 'lucide-react';

interface ListBlockEditorProps {
  block: ListBlock;
  onChange: (updated: Partial<ListBlock>) => void;
}

export const ListBlockEditor: React.FC<ListBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const getBulletSymbol = (marker?: BulletMarkerStyle) => {
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

  const getNumberLabel = (index: number, style?: NumberedListStyle, start = 1) => {
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

  const handleItemTextChange = (id: string, text: string) => {
    const updated = block.items.map((it) => (it.id === id ? { ...it, text } : it));
    onChange({ items: updated });
  };

  const handleItemIndentChange = (id: string, delta: number) => {
    const updated = block.items.map((it) => {
      if (it.id === id) {
        const nextIndent = Math.max(0, Math.min(2, (it.indent || 0) + delta));
        return { ...it, indent: nextIndent };
      }
      return it;
    });
    onChange({ items: updated });
  };

  const handleAddItem = (afterIndex: number) => {
    const newItem: ListItem = {
      id: 'li_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
      text: '',
      indent: block.items[afterIndex]?.indent || 0,
    };
    const nextItems = [...block.items];
    nextItems.splice(afterIndex + 1, 0, newItem);
    onChange({ items: nextItems });
  };

  const handleRemoveItem = (id: string) => {
    if (block.items.length <= 1) {
      // Clear text rather than deleting last item
      onChange({ items: [{ ...block.items[0], text: '' }] });
      return;
    }
    onChange({ items: block.items.filter((it) => it.id !== id) });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, item: ListItem) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem(index);
    } else if (e.key === 'Backspace' && item.text === '' && block.items.length > 1) {
      e.preventDefault();
      handleRemoveItem(item.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleItemIndentChange(item.id, e.shiftKey ? -1 : 1);
    }
  };

  return (
    <div className="space-y-1.5 py-1">
      {block.items.map((item, index) => {
        const marker = block.listType === 'bullet'
          ? getBulletSymbol(block.bulletMarker)
          : getNumberLabel(index, block.numberedStyle, block.startNumber || 1);

        return (
          <div
            key={item.id}
            className="flex items-start gap-2 group/item"
            style={{ paddingLeft: `${(item.indent || 0) * 20}px` }}
          >
            {/* Marker symbol */}
            <span className="font-mono text-slate-500 font-medium select-none text-xs w-6 text-right shrink-0 mt-0.5">
              {marker}
            </span>

            {/* Editable item text */}
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleItemTextChange(item.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index, item)}
              placeholder="List item (Enter for next, Tab to indent)..."
              className="flex-1 bg-transparent outline-none text-xs text-slate-800 focus:bg-slate-50 rounded px-1 -mx-1"
            />

            {/* Controls on hover */}
            <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
              <button
                type="button"
                onClick={() => handleItemIndentChange(item.id, item.indent > 0 ? -1 : 1)}
                title={item.indent > 0 ? 'Outdent (Shift+Tab)' : 'Indent (Tab)'}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
              >
                <CornerDownRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleAddItem(index)}
                title="Add item below"
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                title="Delete item"
                className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
