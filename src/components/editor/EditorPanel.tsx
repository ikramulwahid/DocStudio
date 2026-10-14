import React, { useState, useMemo } from 'react';
import { 
  DocumentBlock, 
  DocumentSettings, 
  DocumentMetadata, 
  BlockType,
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  TableBlock,
  FormulaBlock,
  DividerBlock,
  PageBreakBlock,
  SectionBreakBlock,
  MetadataBlock,
  SignatureBlock,
  CalloutBlock,
  ImageBlock
} from '../../types/document';
import { calculateHeadingNumbers, createBlockByType, generateBlockId } from '../../services/blockUtils';
import { BlockWrapper } from './BlockWrapper';
import { BlockInsertModal } from './BlockInsertModal';
import { BlockSettingsModal } from './BlockSettingsModal';

import { HeadingBlockEditor } from './blocks/HeadingBlockEditor';
import { ParagraphBlockEditor } from './blocks/ParagraphBlockEditor';
import { ListBlockEditor } from './blocks/ListBlockEditor';
import { TableBlockEditor } from './blocks/TableBlockEditor';
import { FormulaBlockEditor } from './blocks/FormulaBlockEditor';
import { DividerBlockEditor } from './blocks/DividerBlockEditor';
import { PageBreakBlockEditor } from './blocks/PageBreakBlockEditor';
import { SectionBreakBlockEditor } from './blocks/SectionBreakBlockEditor';
import { MetadataBlockEditor } from './blocks/MetadataBlockEditor';
import { SignatureBlockEditor } from './blocks/SignatureBlockEditor';
import { CalloutBlockEditor } from './blocks/CalloutBlockEditor';
import { ImageBlockEditor } from './blocks/ImageBlockEditor';

import { Plus, Layers, Sparkles } from 'lucide-react';

interface EditorPanelProps {
  blocks: DocumentBlock[];
  settings: DocumentSettings;
  metadata: DocumentMetadata;
  wordCount: number;
  charCount: number;
  onChangeBlocks: (blocks: DocumentBlock[]) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  blocks,
  settings,
  metadata,
  wordCount,
  charCount,
  onChangeBlocks,
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [insertModalState, setInsertModalState] = useState<{
    isOpen: boolean;
    insertIndex: number;
  }>({
    isOpen: false,
    insertIndex: -1,
  });

  const [settingsBlock, setSettingsBlock] = useState<DocumentBlock | null>(null);

  // Dynamically calculate hierarchical numbers for all heading blocks
  const headingNumbers = useMemo(() => {
    return calculateHeadingNumbers(blocks, settings.headingNumberingScheme || '1.1');
  }, [blocks, settings.headingNumberingScheme]);

  // Update specific block
  const handleUpdateBlock = (id: string, updatedFields: Partial<DocumentBlock>) => {
    const updated = blocks.map((b) => (b.id === id ? ({ ...b, ...updatedFields } as DocumentBlock) : b));
    onChangeBlocks(updated);
  };

  // Move block up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...blocks];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    onChangeBlocks(next);
  };

  // Move block down
  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const next = [...blocks];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    onChangeBlocks(next);
  };

  // Duplicate block
  const handleDuplicate = (index: number) => {
    const source = blocks[index];
    const duplicated: DocumentBlock = JSON.parse(JSON.stringify(source));
    duplicated.id = generateBlockId();
    const next = [...blocks];
    next.splice(index + 1, 0, duplicated);
    onChangeBlocks(next);
  };

  // Delete block
  const handleDelete = (index: number) => {
    if (blocks.length <= 1) {
      // Keep at least one block
      onChangeBlocks([createBlockByType('paragraph')]);
      return;
    }
    const next = blocks.filter((_, idx) => idx !== index);
    onChangeBlocks(next);
  };

  // Open insert modal at specific index
  const handleOpenInsert = (index: number) => {
    setInsertModalState({
      isOpen: true,
      insertIndex: index,
    });
  };

  // Insert block
  const handleInsertBlock = (type: BlockType, extra?: any) => {
    const newBlock = createBlockByType(type);
    if (type === 'heading' && extra?.level) {
      (newBlock as HeadingBlock).level = extra.level;
    }
    if (type === 'list' && extra?.listType) {
      (newBlock as ListBlock).listType = extra.listType;
    }

    const next = [...blocks];
    const targetIdx = insertModalState.insertIndex;
    if (targetIdx >= 0 && targetIdx <= next.length) {
      next.splice(targetIdx, 0, newBlock);
    } else {
      next.push(newBlock);
    }
    onChangeBlocks(next);
    setSelectedBlockId(newBlock.id);
  };

  const renderBlockEditor = (block: DocumentBlock) => {
    switch (block.type) {
      case 'heading':
        return (
          <HeadingBlockEditor
            block={block as HeadingBlock}
            calculatedNumber={headingNumbers.get(block.id)}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'paragraph':
        return (
          <ParagraphBlockEditor
            block={block as ParagraphBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'list':
        return (
          <ListBlockEditor
            block={block as ListBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'table':
        return (
          <TableBlockEditor
            block={block as TableBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'formula':
        return (
          <FormulaBlockEditor
            block={block as FormulaBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'divider':
        return (
          <DividerBlockEditor
            block={block as DividerBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'pagebreak':
        return (
          <PageBreakBlockEditor
            block={block as PageBreakBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'sectionbreak':
        return (
          <SectionBreakBlockEditor
            block={block as SectionBreakBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'metadata':
        return (
          <MetadataBlockEditor
            block={block as MetadataBlock}
            metadata={metadata}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'signature':
        return (
          <SignatureBlockEditor
            block={block as SignatureBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'callout':
        return (
          <CalloutBlockEditor
            block={block as CalloutBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      case 'image':
        return (
          <ImageBlockEditor
            block={block as ImageBlock}
            onChange={(updated) => handleUpdateBlock(block.id, updated)}
          />
        );
      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <section className="h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden relative">
      {/* Top Bar Info */}
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Block Workspace</span>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
            {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleOpenInsert(blocks.length)}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" /> Add Block
        </button>
      </div>

      {/* Main Blocks Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6">
        <div
          className="max-w-3xl mx-auto min-h-full space-y-1"
          style={{
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize === '10pt' ? '14px' : settings.fontSize === '11pt' ? '15px' : settings.fontSize === '12pt' ? '16px' : '18px',
            lineHeight: settings.lineHeight,
          }}
        >
          {blocks.map((block, index) => (
            <BlockWrapper
              key={block.id}
              block={block}
              index={index}
              totalBlocks={blocks.length}
              isSelected={selectedBlockId === block.id}
              onSelect={() => setSelectedBlockId(block.id)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              onDuplicate={() => handleDuplicate(index)}
              onDelete={() => handleDelete(index)}
              onOpenSettings={() => setSettingsBlock(block)}
              onInsertBefore={() => handleOpenInsert(index)}
              onInsertAfter={() => handleOpenInsert(index + 1)}
            >
              {renderBlockEditor(block)}
            </BlockWrapper>
          ))}

          {/* Bottom Add Block Target */}
          <div className="pt-4 pb-12 flex justify-center">
            <button
              type="button"
              onClick={() => handleOpenInsert(blocks.length)}
              className="px-4 py-2 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-lg text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors bg-slate-50/50 hover:bg-blue-50/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Block at End of Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-7 px-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0 text-[11px] text-slate-500 font-medium select-none">
        <div className="flex items-center gap-3">
          <span>Words: <strong className="text-slate-800 tabular-nums">{wordCount.toLocaleString()}</strong></span>
          <span>·</span>
          <span>Characters: <strong className="text-slate-800 tabular-nums">{charCount.toLocaleString()}</strong></span>
          <span>·</span>
          <span>Blocks: <strong className="text-slate-800 tabular-nums">{blocks.length}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>Modular Block Mode</span>
          <span>·</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Insert Block Modal */}
      <BlockInsertModal
        isOpen={insertModalState.isOpen}
        onClose={() => setInsertModalState({ isOpen: false, insertIndex: -1 })}
        onSelectBlock={handleInsertBlock}
      />

      {/* Contextual Settings Modal */}
      <BlockSettingsModal
        block={settingsBlock}
        onClose={() => setSettingsBlock(null)}
        onUpdateBlock={(updated) => {
          if (settingsBlock) {
            handleUpdateBlock(settingsBlock.id, updated);
            setSettingsBlock((prev) => (prev ? ({ ...prev, ...updated } as any) : null));
          }
        }}
      />
    </section>
  );
};
