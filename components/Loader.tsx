
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-600 border-t-brand-primary rounded-full animate-spin"></div>
      <p className="text-lg text-content">Analyzing market perceptions...</p>
    </div>
  );
};

export default Loader;
