
import React, { useState, useCallback } from 'react';
import { fetchBrandMapData } from './services/geminiService';
import PerceptualMap from './components/PerceptualMap';
import SourceList from './components/SourceList';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import type { MapData } from './types';

const App: React.FC = () => {
  const [brandQuery, setBrandQuery] = useState<string>('');
  const [scope, setScope] = useState<string>('Global');
  const [regionalQuery, setRegionalQuery] = useState<string>('');
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = useCallback(async () => {
    if (!brandQuery.trim()) {
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
      const analysisScope = scope === 'Regional' ? regionalQuery : 'Global';
      const data = await fetchBrandMapData(brandQuery, analysisScope);
      setMapData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [brandQuery, scope, regionalQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchData();
  };

  const InitialState = () => (
    <div className="text-center p-8 bg-base-200 rounded-lg shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-white">Welcome to the Brand Position Mapper</h3>
        <p className="mt-1 text-base text-content">Enter a brand name and select a scope to visualize its market position.</p>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
            Brand Position Mapper
          </h1>
          <p className="mt-2 text-lg text-content">
            AI-powered insights into customer perception.
          </p>
        </header>

        <main>
          <div className="bg-base-200 p-6 rounded-lg shadow-lg mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="brand-query" className="block text-sm font-medium text-gray-300">Brand Name</label>
                <div className="mt-1">
                  <input
                    id="brand-query"
                    type="text"
                    value={brandQuery}
                    onChange={(e) => setBrandQuery(e.target.value)}
                    placeholder="Enter a brand name (e.g., 'Tesla', 'Nike')"
                    className="w-full px-4 py-3 bg-base-300 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="scope-select" className="block text-sm font-medium text-gray-300">Analysis Scope</label>
                <div className="mt-1 flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-auto">
                    <select
                      id="scope-select"
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="w-full px-4 py-3 bg-base-300 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition appearance-none"
                      style={{ background: 'url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%20/%3E%3C/svg%3E\') no-repeat right 0.75rem center/1.5em 1.5em', paddingRight: '2.5rem' }}
                      disabled={isLoading}
                    >
                      <option value="Global">Global</option>
                      <option value="Regional">Regional</option>
                    </select>
                  </div>
                  {scope === 'Regional' && (
                    <div className="flex-grow w-full">
                      <label htmlFor="regional-query" className="sr-only">Region/Country</label>
                      <input
                        id="regional-query"
                        type="text"
                        value={regionalQuery}
                        onChange={(e) => setRegionalQuery(e.target.value)}
                        placeholder="e.g., 'USA', 'Western Europe'"
                        className="w-full px-4 py-3 bg-base-300 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Select if you want a global positioning analysis or a country or region specific. Global is set as the default.
                </p>
              </div>
              
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-brand-primary rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  disabled={isLoading}
                >
                  {isLoading ? 'Mapping...' : 'Map Brand'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8">
            {error && <ErrorMessage message={error} />}
            {isLoading && <Loader />}
            {!isLoading && !mapData && !error && <InitialState />}
            {mapData && (
              <div className="animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Perception Map for <span className="text-brand-primary">{mapData.brands.find(b => b.isTarget)?.name}</span>
                    </h2>
                    <p className="text-lg text-content">Scope: {mapData.scope}</p>
                </div>
                <PerceptualMap 
                  data={mapData.brands} 
                  xAxisLabel={mapData.xAxisLabel} 
                  yAxisLabel={mapData.yAxisLabel} 
                />
                <SourceList references={mapData.references} />
              </div>
            )}
          </div>
        </main>
        
        <footer className="text-center mt-12 py-4 border-t border-gray-700">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} AI Brand Mapper. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
