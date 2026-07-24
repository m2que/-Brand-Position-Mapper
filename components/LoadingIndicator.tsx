import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="my-4 rounded-[22px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 text-center shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
      <div className="flex items-center justify-center space-x-2">
        <div className="h-4 w-4 animate-pulse rounded-full bg-moss delay-0"></div>
        <div className="h-4 w-4 animate-pulse rounded-full bg-bronze delay-200"></div>
        <div className="h-4 w-4 animate-pulse rounded-full bg-stone delay-400"></div>
      </div>
      <p className="mt-4 text-stone">Analyzing market perceptions and mapping competitors...</p>
    </div>
  );
};

export default LoadingIndicator;
