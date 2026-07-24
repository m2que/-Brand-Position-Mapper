import React, { useState } from 'react';
import { SearchIcon } from './icons';
import type { ScopeOption } from '../types';

interface BrandInputFormProps {
  onSubmit: (brandName: string, scope: ScopeOption, regionalQuery: string) => void;
  isLoading: boolean;
}

const BrandInputForm: React.FC<BrandInputFormProps> = ({ onSubmit, isLoading }) => {
  const [brandName, setBrandName] = useState('');
  const [scope, setScope] = useState<ScopeOption>('Global');
  const [regionalQuery, setRegionalQuery] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(brandName, scope, regionalQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="space-y-3 rounded-[22px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-4 shadow-card transition-all duration-300 focus-within:ring-2 focus-within:ring-moss/25 sm:p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_220px_minmax(0,0.9fr)_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-moss">Brand Name</span>
            <input
              type="text"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
              placeholder="Enter a brand name (e.g., Tesla, Nike, Samsung)"
              className="w-full rounded-2xl border border-[rgba(31,95,91,0.14)] bg-[#fffaf2] px-4 py-3 text-base text-ink placeholder:text-stone focus:outline-none"
              disabled={isLoading}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-moss">Scope</span>
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as ScopeOption)}
              disabled={isLoading}
              className="w-full rounded-2xl border border-[rgba(31,95,91,0.14)] bg-[#fffaf2] px-4 py-3 text-base text-ink focus:outline-none"
            >
              <option value="Global">Global</option>
              <option value="Regional">Regional</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-moss">Region or Country</span>
            <input
              type="text"
              value={regionalQuery}
              onChange={(event) => setRegionalQuery(event.target.value)}
              placeholder={scope === 'Regional' ? 'e.g., USA, GCC, Western Europe' : 'Used only for regional scope'}
              className="w-full rounded-2xl border border-[rgba(31,95,91,0.14)] bg-[#fffaf2] px-4 py-3 text-base text-ink placeholder:text-stone focus:outline-none"
              disabled={isLoading || scope !== 'Regional'}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1f5f5b,#174944)] px-6 py-3 font-semibold text-white shadow-[0_14px_28px_rgba(31,95,91,0.24)] transition-all duration-300 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-[#fffaf2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SearchIcon className="mr-2 h-5 w-5" />
            {isLoading ? 'Mapping...' : 'Map Brand'}
          </button>
        </div>

        <p className="px-1 text-sm leading-5 text-stone">
          Choose <strong>Global</strong> for an overall market view, or switch to <strong>Regional</strong> to focus the perception map on a specific geography.
        </p>
      </div>
    </form>
  );
};

export default BrandInputForm;
