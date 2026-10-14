import React from 'react';
import { TableBlock } from '../../../types/document';
import { Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TableBlockEditorProps {
  block: TableBlock;
  onChange: (updated: Partial<TableBlock>) => void;
}

export const TableBlockEditor: React.FC<TableBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const nextData = block.data.map((r, rIdx) => {
      if (rIdx !== rowIndex) return [...r];
      const nextRow = [...r];
      nextRow[colIndex] = value;
      return nextRow;
    });
    onChange({ data: nextData });
  };

  const handleAddRow = () => {
    const newRow = new Array(block.cols).fill('');
    onChange({
      rows: block.rows + 1,
      data: [...block.data, newRow],
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (block.rows <= 1) return;
    const nextData = block.data.filter((_, idx) => idx !== rowIndex);
    onChange({
      rows: block.rows - 1,
      data: nextData,
    });
  };

  const handleAddColumn = () => {
    const nextData = block.data.map((row) => [...row, '']);
    const newWidths = new Array(block.cols + 1).fill(Math.floor(100 / (block.cols + 1)));
    onChange({
      cols: block.cols + 1,
      data: nextData,
      colWidths: newWidths,
    });
  };

  const handleDeleteColumn = (colIndex: number) => {
    if (block.cols <= 1) return;
    const nextData = block.data.map((row) => row.filter((_, idx) => idx !== colIndex));
    const newWidths = new Array(block.cols - 1).fill(Math.floor(100 / (block.cols - 1)));
    onChange({
      cols: block.cols - 1,
      data: nextData,
      colWidths: newWidths,
    });
  };

  return (
    <div className="space-y-2 py-1">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded-md border border-slate-200">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={block.hasHeader}
              onChange={(e) => onChange({ hasHeader: e.target.checked })}
              className="rounded text-blue-600 w-3.5 h-3.5"
            />
            <span className="font-medium text-slate-700">Header Row</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
          >
            <Plus className="w-3 h-3 text-blue-600" /> Add Row
          </button>
          <button
            type="button"
            onClick={handleAddColumn}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
          >
            <Plus className="w-3 h-3 text-blue-600" /> Add Column
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {block.data.map((row, rIdx) => {
              const isHeaderRow = block.hasHeader && rIdx === 0;
              return (
                <tr
                  key={rIdx}
                  className={`group/row ${
                    isHeaderRow ? 'bg-slate-50 font-semibold text-slate-900' : 'hover:bg-slate-50/50'
                  }`}
                >
                  {row.map((cellValue, cIdx) => (
                    <td
                      key={cIdx}
                      className="border border-slate-200 p-1 relative"
                      style={{
                        backgroundColor: isHeaderRow ? block.headerBgColor || '#F8FAFC' : undefined,
                      }}
                    >
                      <input
                        type="text"
                        value={cellValue}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        placeholder={isHeaderRow ? `Header ${cIdx + 1}` : 'Cell data'}
                        className={`w-full bg-transparent outline-none px-1.5 py-1 rounded text-slate-800 transition-colors focus:bg-white focus:ring-1 focus:ring-blue-500 ${
                          isHeaderRow ? 'font-semibold text-slate-900' : ''
                        }`}
                      />
                    </td>
                  ))}
                  {/* Row delete button */}
                  <td className="w-6 border-0 text-center p-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    {block.rows > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(rIdx)}
                        title="Delete row"
                        className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Column delete buttons under table */}
      {block.cols > 1 && (
        <div className="flex items-center text-[10px] text-slate-400 gap-1 px-1">
          <span>Remove column:</span>
          {Array.from({ length: block.cols }).map((_, cIdx) => (
            <button
              key={cIdx}
              type="button"
              onClick={() => handleDeleteColumn(cIdx)}
              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-600 transition-colors"
            >
              Col {cIdx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
