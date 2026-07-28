import React, { useCallback, useState } from 'react';
import BrandInputForm from './components/BrandInputForm';
import DashboardDisplay from './components/DashboardDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import LoadingIndicator from './components/LoadingIndicator';
import { ChartBarIcon } from './components/icons';
import { fetchBrandMapData } from './services/geminiService';
import type { MapData, ScopeOption } from './types';

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
    <div className="min-h-screen p-4 sm:p-5 md:p-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(198,125,50,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(31,95,91,0.16),transparent_26%)]"></div>
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <header className="mb-3 flex flex-col gap-3 rounded-[20px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.88)] px-4 py-4 shadow-card sm:px-5 sm:py-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-moss">
            <ChartBarIcon className="h-4 w-4" />
            MarketLearn Featured Tool
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
                Brand Position Mapper
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-stone sm:text-[15px]">
                Map how a brand is perceived against competitors, then support that positioning read with grounded sources.
              </p>
            </div>
            <div className="rounded-[16px] border border-[rgba(31,95,91,0.12)] bg-[rgba(31,95,91,0.05)] px-4 py-3 text-sm leading-6 text-stone">
              Global or regional scope. Target brand, competitors, customer perception axes, AI-generated positioning analysis, and supporting sources.
            </div>
          </div>
        </header>

        <main className="space-y-3">
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
