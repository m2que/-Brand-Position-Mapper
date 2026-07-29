import React, { useCallback, useState } from 'react';
import BrandInputForm from './components/BrandInputForm';
import DashboardDisplay from './components/DashboardDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import LoadingIndicator from './components/LoadingIndicator';
import { ChartBarIcon } from './components/icons';
import { fetchBrandMapData } from './services/geminiService';
import type { MapData, ScopeOption } from './types';

const PositionMapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 4v16"></path>
    <path d="M4 12h16"></path>
    <path d="M12 4l-1.75 1.75"></path>
    <path d="M12 4l1.75 1.75"></path>
    <path d="M20 12l-1.75-1.75"></path>
    <path d="M20 12l-1.75 1.75"></path>
  </svg>
);

const App: React.FC = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (brandName: string, scope: ScopeOption, regionalQuery: string) => {
    if (!brandName.trim()) {
      setError('Please enter a brand name.');
      return;
    }

    if (scope === 'Regional' && !regionalQuery.trim()) {
      setError('Please enter a specific country or region for regional analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMapData(null);

    try {
      const analysisScope = scope === 'Regional' ? regionalQuery.trim() : 'Global';
      const data = await fetchBrandMapData(brandName.trim(), analysisScope);
      setMapData(data);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError instanceof Error ? requestError.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#f7f1e7_48%,#f3ecdf_100%)] text-slate-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(198,125,50,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(31,95,91,0.16),transparent_26%)]"></div>
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-10 rounded-[28px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.9)] px-6 py-10 shadow-[0_24px_80px_rgba(61,41,20,0.12)] sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-[rgba(15,118,110,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">
                <ChartBarIcon className="h-4 w-4" />
                MarketLearn Featured Tool
              </div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                Brand Position Mapper
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                Map how a brand is perceived against competitors, then support that positioning read with grounded sources. The linked industry reports, business news, and academic articles may be used to support reports and business plans.
              </p>
            </div>
            <div className="max-w-sm rounded-[22px] border border-[rgba(15,118,110,0.12)] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(250,244,235,0.96))] p-5 shadow-[0_16px_40px_rgba(61,41,20,0.08)]">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(15,118,110,0.08)] text-teal-800">
                <PositionMapIcon className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">How to use it</p>
              <p className="mt-3 font-serif text-2xl font-semibold text-slate-900">Global or regional brand mapping</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Start with one brand, compare its perceived position against competitors, then use the results to inform strategy.
              </p>
            </div>
          </div>
        </header>

        <main>
          <BrandInputForm onSubmit={handleSubmit} isLoading={isLoading} />

          {isLoading && <LoadingIndicator />}
          {error && <ErrorDisplay message={error} />}

          {mapData ? (
            <DashboardDisplay data={mapData} />
          ) : (
            !isLoading && !error && (
              <div className="mt-12 rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.9)] p-8 text-center shadow-card">
                <ChartBarIcon className="mx-auto mb-4 h-12 w-12 text-bronze" />
                <h2 className="font-display text-3xl font-semibold text-ink">Ready to Map</h2>
                <p className="mt-3 text-stone">
                  Enter a brand above to generate a competitor-based customer perception map with global or regional scope and supporting references.
                </p>
              </div>
            )
          )}
        </main>

        <footer className="mt-auto pt-8 text-center text-sm text-stone">
          <p>© 2026 MarketLearn. AI-assisted content — verify before implementation.</p>
          <p className="mt-2">
            Contact:{' '}
            <a href="mailto:marketlearn.online@gmail.com" className="text-moss underline decoration-[rgba(31,95,91,0.4)] underline-offset-4 hover:text-bronze">
              marketlearn.online@gmail.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
