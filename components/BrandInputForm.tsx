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
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (brandName.trim().length > 200) {
      setErrorMessage('Brand name must be 200 characters or fewer.');
      return;
    }

    setErrorMessage('');
    onSubmit(brandName, scope, regionalQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="space-y-5 rounded-[26px] border-2 border-[rgba(255,244,221,0.38)] bg-[linear-gradient(145deg,#1d4f4b,#123633)] p-5 shadow-[0_24px_50px_rgba(18,54,51,0.32)] transition-all duration-300 focus-within:border-[rgba(255,244,221,0.75)] focus-within:ring-4 focus-within:ring-[rgba(255,244,221,0.18)] sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_240px_minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="mb-3 block text-lg font-extrabold uppercase tracking-[0.18em] text-[#f7ecd7] sm:text-[1.15rem]">Brand Name</span>
            <input
              type="text"
              value={brandName}
              onChange={(event) => {
                setBrandName(event.target.value);
                if (errorMessage) {
                  setErrorMessage('');
                }
              }}
              maxLength={200}
              placeholder="Enter a brand name (e.g., Tesla, Nike, Samsung)"
              className="w-full rounded-2xl border border-[rgba(255,244,221,0.24)] bg-[rgba(255,250,242,0.14)] px-5 py-4 text-lg text-[#fffaf2] placeholder:text-[rgba(255,244,221,0.7)] focus:outline-none"
              disabled={isLoading}
            />
          </label>

          <label className="block">
            <span className="mb-3 block text-lg font-extrabold uppercase tracking-[0.18em] text-[#f7ecd7] sm:text-[1.15rem]">Scope</span>
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as ScopeOption)}
              disabled={isLoading}
              className="w-full rounded-2xl border border-[rgba(255,244,221,0.24)] bg-[rgba(255,250,242,0.14)] px-5 py-4 text-lg text-[#fffaf2] focus:outline-none"
            >
              <option value="Global">Global</option>
              <option value="Regional">Regional</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-3 block text-lg font-extrabold uppercase tracking-[0.18em] text-[#f7ecd7] sm:text-[1.15rem]">Region or Country</span>
            <input
              type="text"
              value={regionalQuery}
              onChange={(event) => setRegionalQuery(event.target.value)}
              placeholder={scope === 'Regional' ? 'e.g., USA, GCC, Western Europe' : 'Used only for regional scope'}
              className="w-full rounded-2xl border border-[rgba(255,244,221,0.24)] bg-[rgba(255,250,242,0.14)] px-5 py-4 text-lg text-[#fffaf2] placeholder:text-[rgba(255,244,221,0.7)] focus:outline-none"
              disabled={isLoading || scope !== 'Regional'}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="flex min-h-[60px] items-center justify-center rounded-2xl border border-[rgba(255,244,221,0.3)] bg-[linear-gradient(135deg,#f1d7ad,#d4ad73)] px-7 py-4 text-lg font-semibold text-[#173633] shadow-[0_14px_28px_rgba(10,30,28,0.28)] transition-all duration-300 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-[rgba(255,244,221,0.75)] focus:ring-offset-2 focus:ring-offset-[#1a4743] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SearchIcon className="mr-2 h-5 w-5" />
            {isLoading ? 'Mapping...' : 'Map Brand'}
          </button>
        </div>

        <p className="px-1 text-base leading-6 text-[rgba(255,244,221,0.88)] sm:text-[1.02rem]">
          Choose <strong>Global</strong> for an overall market view, or switch to <strong>Regional</strong> to focus the perception map on a specific geography.
        </p>
        {errorMessage ? <p className="px-1 text-base leading-6 text-[#ffd1d1]">{errorMessage}</p> : null}
      </div>
    </form>
  );
};

export default BrandInputForm;
