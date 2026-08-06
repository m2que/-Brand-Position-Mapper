import React, { useState } from 'react';
import { PositionMapIcon, SearchIcon } from './icons';
import type { ScopeOption } from '../types';

interface BrandInputFormProps {
  onSubmit: (brandName: string, scope: ScopeOption, regionalQuery: string) => void;
  isLoading: boolean;
}

const BrandInputForm: React.FC<BrandInputFormProps> = ({ onSubmit, isLoading }) => {
  const [brandName, setBrandName] = useState('');
  const [scope, setScope] = useState<ScopeOption>('Global');
  const [regionalQuery, setRegionalQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyzeClick = () => {
    if (isLoading) return;

    if (brandName.trim().length > 200) {
      setErrorMessage('Brand name must be 200 characters or fewer.');
      return;
    }

    setErrorMessage('');
    onSubmit(brandName, scope, regionalQuery);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 mx-auto max-w-4xl">
      <div className="space-y-4 rounded-[28px] border border-[rgba(245,238,220,0.45)] bg-[linear-gradient(145deg,rgba(4,47,46,0.96),rgba(8,83,75,0.94)_52%,rgba(10,57,54,0.97))] p-4 shadow-[0_30px_90px_rgba(3,32,30,0.42)] transition-all duration-300 focus-within:ring-2 focus-within:ring-[rgba(254,240,138,0.45)] sm:p-5">
        <div className="mb-1 flex items-center gap-3 text-[#f6e7c8]">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,248,225,0.22)] bg-[rgba(255,250,240,0.1)] text-current shadow-[inset_0_1px_0_rgba(255,248,225,0.08)]">
            <PositionMapIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(246,231,200,0.8)]">Brand Position Mapper Input</p>
            <p className="text-sm text-[rgba(248,239,218,0.88)]">Enter a brand, choose a scope, and generate the analysis.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="flex flex-col gap-2">
            <span className="text-lg font-extrabold uppercase tracking-[0.12em] text-[#f6e7c8] sm:text-[1.3rem]">Brand Name</span>
            <input
              type="text"
              value={brandName}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              onChange={(event) => {
                setBrandName(event.target.value.slice(0, 200));
                if (errorMessage) {
                  setErrorMessage('');
                }
              }}
              maxLength={200}
              placeholder="Enter a brand name (e.g., Tesla, Nike, Samsung)"
              className="w-full rounded-2xl border border-[rgba(255,248,225,0.36)] bg-[rgba(255,250,240,0.14)] px-4 py-3 text-lg text-[#fff8ea] placeholder:text-[rgba(246,231,200,0.72)] shadow-[inset_0_1px_0_rgba(255,248,225,0.12),0_18px_40px_rgba(2,24,23,0.28)] backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[rgba(254,240,138,0.45)]"
              disabled={isLoading}
            />
          </label>

          <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            className="flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2c66d,#d9a441)] px-6 py-3 font-bold text-[#1f2937] shadow-[0_18px_34px_rgba(89,64,18,0.34)] transition-all duration-300 hover:-translate-y-px hover:bg-[linear-gradient(135deg,#f5d27f,#e0af4e)] focus:outline-none focus:ring-2 focus:ring-[rgba(254,240,138,0.55)] focus:ring-offset-2 focus:ring-offset-[#0a3c39] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SearchIcon className="mr-2 h-5 w-5" />
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)] md:items-stretch">
          <label className="flex h-full flex-col gap-2 rounded-2xl border border-[rgba(255,248,225,0.28)] bg-[rgba(255,250,240,0.1)] px-4 py-3 text-[#f8efda] shadow-[inset_0_1px_0_rgba(255,248,225,0.08)] backdrop-blur-sm">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[rgba(246,231,200,0.84)]">Scope</span>
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as ScopeOption)}
              disabled={isLoading}
              className="bg-transparent text-sm text-[#fff8ea] focus:outline-none"
            >
              <option value="Global">Global</option>
              <option value="Regional">Regional</option>
            </select>
            {!errorMessage && (
              <span className="mt-auto text-sm leading-6 text-[rgba(248,239,218,0.86)]">
                {scope === 'Global' ? 'Use a broad market view across major competitors.' : 'Focus the map on a specific country or regional market.'}
              </span>
            )}
          </label>

          <label className="flex h-full flex-col gap-2 rounded-2xl border border-[rgba(255,248,225,0.24)] bg-[rgba(255,250,240,0.08)] px-4 py-3 text-[#f8efda] shadow-[inset_0_1px_0_rgba(255,248,225,0.06)] backdrop-blur-sm">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[rgba(246,231,200,0.84)]">Region or Country</span>
            <input
              type="text"
              value={regionalQuery}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              onChange={(event) => setRegionalQuery(event.target.value)}
              placeholder={scope === 'Regional' ? 'e.g., USA, GCC, Western Europe' : 'Used only for regional scope'}
              className="w-full rounded-2xl border border-[rgba(255,248,225,0.22)] bg-[rgba(255,250,240,0.08)] px-4 py-3 text-base text-[#fff8ea] placeholder:text-[rgba(246,231,200,0.62)] focus:outline-none focus:ring-2 focus:ring-[rgba(254,240,138,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading || scope !== 'Regional'}
            />
            <p className="mt-auto text-sm leading-6 text-[rgba(248,239,218,0.82)]">
              Choose <strong>Global</strong> for an overall market view, or switch to <strong>Regional</strong> to focus the perception map on a specific geography.
            </p>
          </label>
        </div>
        {errorMessage ? <p className="px-4 text-sm font-medium text-[#ffe2b8]">{errorMessage}</p> : null}
      </div>
    </form>
  );
};

export default BrandInputForm;
