import React from 'react';
import { SignatureBlock, SignerInfo } from '../../../types/document';
import { PenTool, Plus, Trash2, Calendar, User, Briefcase, Building } from 'lucide-react';
import { generateBlockId } from '../../../services/blockUtils';

interface SignatureBlockEditorProps {
  block: SignatureBlock;
  onChange: (updated: Partial<SignatureBlock>) => void;
}

export const SignatureBlockEditor: React.FC<SignatureBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const handleSignerChange = (id: string, fields: Partial<SignerInfo>) => {
    const next = block.signers.map((s) => (s.id === id ? { ...s, ...fields } : s));
    onChange({ signers: next });
  };

  const handleAddSigner = () => {
    if (block.signers.length >= 4) return;
    const newSigner: SignerInfo = {
      id: generateBlockId(),
      name: 'Authorized Signatory',
      title: 'Director / Executive',
      organization: 'Organization Name',
      date: new Date().toISOString().split('T')[0],
    };
    onChange({ signers: [...block.signers, newSigner] });
  };

  const handleRemoveSigner = (id: string) => {
    if (block.signers.length <= 1) return;
    onChange({ signers: block.signers.filter((s) => s.id !== id) });
  };

  return (
    <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <PenTool className="w-3.5 h-3.5 text-blue-600" />
          <span>Signature & Sign-off Block</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout mode */}
          <select
            value={block.layout}
            onChange={(e) => onChange({ layout: e.target.value as any })}
            className="px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded outline-none"
          >
            <option value="side-by-side">Side-by-Side</option>
            <option value="stacked">Stacked</option>
          </select>

          {/* Add signer button */}
          {block.signers.length < 4 && (
            <button
              type="button"
              onClick={handleAddSigner}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
            >
              <Plus className="w-3 h-3 text-blue-600" /> Add Signer
            </button>
          )}
        </div>
      </div>

      {/* Signers list */}
      <div
        className={
          block.layout === 'side-by-side'
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
            : 'space-y-4'
        }
      >
        {block.signers.map((signer, idx) => (
          <div
            key={signer.id}
            className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 relative group/signer shadow-2xs"
          >
            {block.signers.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveSigner(signer.id)}
                title="Remove signer"
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover/signer:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Designated Signature Line Area */}
            <div className="pt-8 pb-1 border-b-2 border-slate-700 flex items-end justify-between">
              <span className="text-[10px] text-slate-400 font-mono italic">X _______________________</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Authorized Signature</span>
            </div>

            {/* Editable Fields */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={signer.name}
                  onChange={(e) => handleSignerChange(signer.id, { name: e.target.value })}
                  placeholder="Signer Full Name"
                  className="w-full bg-transparent font-semibold text-slate-800 outline-none focus:bg-slate-50 rounded px-1 -mx-1"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={signer.title}
                  onChange={(e) => handleSignerChange(signer.id, { title: e.target.value })}
                  placeholder="Title / Designation"
                  className="w-full bg-transparent text-slate-600 outline-none focus:bg-slate-50 rounded px-1 -mx-1"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Building className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={signer.organization}
                  onChange={(e) => handleSignerChange(signer.id, { organization: e.target.value })}
                  placeholder="Company / Entity"
                  className="w-full bg-transparent text-slate-500 outline-none focus:bg-slate-50 rounded px-1 -mx-1"
                />
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={signer.date}
                  onChange={(e) => handleSignerChange(signer.id, { date: e.target.value })}
                  className="bg-transparent text-slate-500 text-xs outline-none focus:bg-slate-50 rounded px-1 -mx-1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
