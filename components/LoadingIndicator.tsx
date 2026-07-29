import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="my-8 rounded-[24px] border border-[rgba(113,86,56,0.16)] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(247,241,231,0.96))] p-8 text-center shadow-[0_28px_80px_rgba(61,41,20,0.1)]">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(15,118,110,0.14)] bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.12),rgba(255,252,247,0.9)_65%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_40px_rgba(61,41,20,0.08)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[rgba(15,118,110,0.16)] border-t-teal-700 border-r-amber-500"></div>
      </div>
      <p className="mt-6 text-lg font-semibold text-slate-900">Analyzing brand position...</p>
      <p className="mt-2 text-slate-600">Mapping customer perceptions and competitor territory across the selected axes...</p>
    </div>
  );
};

export default LoadingIndicator;
