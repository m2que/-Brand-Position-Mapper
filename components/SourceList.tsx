import React from 'react';
import { LinkIcon } from './icons';
import type { Reference, ReferenceCategory } from '../types';

interface SourceListProps {
  references?: Reference[];
}

const CATEGORY_LABELS: Record<ReferenceCategory, string> = {
  official_brand: 'Official Brand Sources',
  government: 'Government & Official Data',
  industry_databases: 'Industry Databases',
  news_media: 'Major News Media',
  academic_research: 'Academic Research',
  marketing_reports: 'Marketing & Trade Reports'
};

const CATEGORY_STYLES: Record<ReferenceCategory, string> = {
  official_brand: 'bg-[rgba(31,95,91,0.08)] text-moss border-[rgba(31,95,91,0.16)]',
  government: 'bg-[rgba(30,64,175,0.08)] text-blue-800 border-[rgba(30,64,175,0.16)]',
  industry_databases: 'bg-[rgba(198,125,50,0.12)] text-amber-800 border-[rgba(198,125,50,0.2)]',
  news_media: 'bg-[rgba(190,24,93,0.08)] text-rose-800 border-[rgba(190,24,93,0.16)]',
  academic_research: 'bg-[rgba(88,28,135,0.08)] text-purple-800 border-[rgba(88,28,135,0.16)]',
  marketing_reports: 'bg-[rgba(71,85,105,0.08)] text-slate-700 border-[rgba(71,85,105,0.16)]'
};

const SourceList: React.FC<SourceListProps> = ({ references }) => {
  if (!references || !Array.isArray(references) || references.length === 0) {
    return (
      <section className="rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
        <div className="mb-4 flex items-center gap-3">
          <LinkIcon className="h-6 w-6 text-moss" />
          <h3 className="font-display text-2xl font-semibold text-ink">Supporting Sources</h3>
        </div>
        <p className="text-sm leading-7 text-stone">
          No grounded sources were recovered into the final response for this run. This result should be treated as low-confidence until the source set is regenerated successfully.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
      <div className="mb-6 flex items-center gap-3">
        <LinkIcon className="h-6 w-6 text-moss" />
        <h3 className="font-display text-2xl font-semibold text-ink">Supporting Sources</h3>
      </div>
      <p className="mb-5 text-sm leading-7 text-stone">
        These are the sources used to support the positioning analysis. Each note explains how the source helps justify the brand's placement on the map.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {references.map((source, index) => {
          const category = source.category as ReferenceCategory;

          return (
            <article key={`${source.url}-${index}`} className="rounded-2xl border border-[rgba(113,86,56,0.14)] bg-[#fffaf2] p-4 shadow-[0_10px_30px_rgba(61,41,20,0.05)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-sm font-semibold text-ink transition-colors hover:text-moss hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </div>
                <span className={`w-fit rounded border px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[category]}`}>
                  {CATEGORY_LABELS[category]}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">{source.relevanceNote}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default SourceList;
