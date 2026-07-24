
import React from 'react';
import type { Reference, ReferenceCategory } from '../types';

interface SourceListProps {
  references?: Partial<Record<ReferenceCategory, Reference[]>>;
}

const CATEGORY_LABELS: Record<ReferenceCategory, string> = {
  official_brand: 'Official Brand Sources',
  government: 'Government & Official Data',
  industry_databases: 'Industry Databases',
  news_media: 'Major News Media',
  academic_research: 'Academic Research',
  marketing_reports: 'Marketing & Trade Reports',
};

const SourceList: React.FC<SourceListProps> = ({ references }) => {
  if (!references || Object.keys(references).length === 0) {
    return null;
  }

  // Filter out categories that have no items
  const activeCategories = (Object.keys(references) as ReferenceCategory[]).filter(
    (cat) => references[cat] && references[cat]!.length > 0
  );

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-8 p-6 bg-base-200 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-6 text-white border-b border-gray-700 pb-2">Data Sources</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {activeCategories.map((category) => (
          <div key={category} className="mb-2">
            <h4 className="text-sm font-bold text-brand-secondary uppercase tracking-wider mb-3">
              {CATEGORY_LABELS[category]}
            </h4>
            <ul className="space-y-2">
              {references[category]!.map((source, index) => (
                <li key={index} className="flex items-start">
                   <span className="text-gray-500 mr-2 text-xs mt-1">●</span>
                   <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors break-words"
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceList;
