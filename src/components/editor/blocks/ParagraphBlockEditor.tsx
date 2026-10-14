import React, { useRef, useEffect } from 'react';
import { ParagraphBlock } from '../../../types/document';
import { Bold, Italic, Underline, Strikethrough, Link, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface ParagraphBlockEditorProps {
  block: ParagraphBlock;
  onChange: (updated: Partial<ParagraphBlock>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const ParagraphBlockEditor: React.FC<ParagraphBlockEditorProps> = ({
  block,
  onChange,
  onKeyDown,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Synchronize HTML with DOM only when external update occurs
  useEffect(() => {
    if (contentRef.current && !isInternalChange.current) {
      if (contentRef.current.innerHTML !== block.html) {
        contentRef.current.innerHTML = block.html || '<p><br></p>';
      }
    }
    isInternalChange.current = false;
  }, [block.html]);

  const handleInput = () => {
    if (contentRef.current) {
      isInternalChange.current = true;
      const html = contentRef.current.innerHTML;
      onChange({ html });
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleLink = () => {
    const url = prompt('Enter link URL (e.g. https://example.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const alignStyles: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  return (
    <div className="relative group/para">
      {/* Floating formatting mini-bar visible on hover/focus */}
      <div className="hidden group-focus-within/para:flex items-center gap-0.5 absolute -top-8 left-0 bg-white border border-slate-200 shadow-md rounded-md p-1 z-20 text-slate-600 animate-in fade-in duration-100">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}
          title="Bold (Ctrl+B)"
          className="p-1 hover:bg-slate-100 rounded text-slate-700"
        >
          <Bold className="w-3 h-3" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}
          title="Italic (Ctrl+I)"
          className="p-1 hover:bg-slate-100 rounded text-slate-700"
        >
          <Italic className="w-3 h-3" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }}
          title="Underline (Ctrl+U)"
          className="p-1 hover:bg-slate-100 rounded text-slate-700"
        >
          <Underline className="w-3 h-3" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('strikeThrough'); }}
          title="Strikethrough"
          className="p-1 hover:bg-slate-100 rounded text-slate-700"
        >
          <Strikethrough className="w-3 h-3" />
        </button>
        <span className="text-slate-200">|</span>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleLink(); }}
          title="Insert Link"
          className="p-1 hover:bg-slate-100 rounded text-slate-700"
        >
          <Link className="w-3 h-3" />
        </button>
        <span className="text-slate-200">|</span>
        <button
          type="button"
          onClick={() => onChange({ align: 'left' })}
          className={`p-1 rounded ${block.align === 'left' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-700'}`}
        >
          <AlignLeft className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onChange({ align: 'center' })}
          className={`p-1 rounded ${block.align === 'center' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-700'}`}
        >
          <AlignCenter className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onChange({ align: 'right' })}
          className={`p-1 rounded ${block.align === 'right' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-700'}`}
        >
          <AlignRight className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onChange({ align: 'justify' })}
          className={`p-1 rounded ${block.align === 'justify' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-700'}`}
        >
          <AlignJustify className="w-3 h-3" />
        </button>
      </div>

      {/* ContentEditable writing canvas */}
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
        className={`outline-none text-slate-800 leading-relaxed min-h-[1.5em] px-1 -mx-1 rounded transition-colors focus:bg-slate-50/50 ${
          alignStyles[block.align || 'left']
        }`}
        style={{
          paddingLeft: block.indent ? `${block.indent * 24}px` : undefined,
        }}
      />
    </div>
  );
};
