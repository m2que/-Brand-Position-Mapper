import React from 'react';
import { AlertTriangleIcon } from './icons';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="relative mx-auto my-4 max-w-3xl animate-fade-in rounded-[22px] border border-[rgba(185,28,28,0.18)] bg-[rgba(254,242,242,0.95)] px-4 py-3 text-red-900 shadow-[0_20px_50px_rgba(127,29,29,0.08)]" role="alert">
      <div className="flex gap-3">
        <div className="py-1">
          <AlertTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <p className="font-bold">Unable to generate map</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
