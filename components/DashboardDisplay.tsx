import React from 'react';
import PerceptualMap from './PerceptualMap';
import SourceList from './SourceList';
import { ChartBarIcon } from './icons';
import type { MapData } from '../types';

interface DashboardDisplayProps {
  data: MapData;
}

const DashboardDisplay: React.FC<DashboardDisplayProps> = ({ data }) => {
  const targetBrand = data.brands.find((brand) => brand.isTarget);
  const competitors = data.brands.filter((brand) => !brand.isTarget);
  const positioningSummary = data.positioningSummary?.trim() || 'The map places the target brand on two customer perception dimensions to show how it is being seen in relation to competitors in the selected scope.';
  const competitiveInterpretation = data.competitiveInterpretation?.trim() || 'Read the relative distance between the target brand and nearby competitors as an indicator of whether the brand is clustered with rivals or positioned more distinctly.';

  const xAxisDisplayLabel = data.xAxisLabel;
  const yAxisDisplayLabel = data.yAxisLabel;
  const xAxisExplanation = data.axisDefinitions?.x.explanation || '';
  const yAxisExplanation = data.axisDefinitions?.y.explanation || '';


  return (
    <div className="animate-fade-in space-y-8">
      <section className="rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-5 shadow-card">
        <div className="mb-3 flex items-center gap-3">
          <ChartBarIcon className="h-6 w-6 text-moss" />
          <h2 className="font-display text-3xl font-semibold text-ink">
            Perception Map for <span className="text-moss">{targetBrand?.name}</span>
          </h2>
        </div>
        <p className="mb-5 text-base leading-7 text-stone">
          The map positions the target brand against its main competitors using the most decision-relevant perceptual dimensions identified for the selected scope.
        </p>

        <PerceptualMap data={data.brands} xAxisLabel={data.xAxisLabel} yAxisLabel={data.yAxisLabel} />
      </section>

      <section className="rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-[rgba(31,95,91,0.12)] bg-[rgba(31,95,91,0.05)] p-4">
            <h3 className="mb-3 font-display text-xl font-semibold text-ink">How To Read This Map</h3>
            <p className="text-sm leading-7 text-stone sm:text-base">
              Read the target brand's location against both axes first, then compare its distance from nearby competitors. The interpretation cards explain what that position says about perceived market territory, while the supporting sources show the evidence used to justify that reading.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(220px,0.45fr)] lg:items-start">
            <div className="space-y-4">
              <div className="w-full rounded-2xl border border-[rgba(113,86,56,0.14)] bg-[#fffaf2] p-5">
                <h3 className="font-display text-xl font-semibold text-ink">Map Dimensions</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="min-w-0 rounded-2xl border border-[rgba(31,95,91,0.12)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">X Axis</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{xAxisDisplayLabel}</p>
                  {xAxisExplanation && <p className="mt-3 text-sm leading-6 text-stone">{xAxisExplanation}</p>}
                </div>
                <div className="min-w-0 rounded-2xl border border-[rgba(198,125,50,0.16)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-bronze">Y Axis</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{yAxisDisplayLabel}</p>
                  {yAxisExplanation && <p className="mt-3 text-sm leading-6 text-stone">{yAxisExplanation}</p>}
                </div>
                </div>
              </div>

              {(data.pointsOfParity || data.pointsOfDifference) && (
                <div className="w-full rounded-2xl border border-[rgba(31,95,91,0.12)] bg-[rgba(31,95,91,0.05)] p-5">
                  <h3 className="mb-3 font-display text-xl font-semibold text-ink">POPs & PODs</h3>
                  {data.pointsOfParity && <p className="text-sm leading-7 text-stone sm:text-base"><strong>Points of parity:</strong> {data.pointsOfParity}</p>}
                  {data.pointsOfDifference && <p className="mt-4 text-sm leading-7 text-stone sm:text-base"><strong>Points of difference:</strong> {data.pointsOfDifference}</p>}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[rgba(31,95,91,0.12)] bg-[#fffaf2] p-5">
              <h3 className="mb-3 font-display text-xl font-semibold text-ink">Scope & Competitors</h3>
              <div className="inline-flex min-w-[140px] rounded-2xl border border-[rgba(198,125,50,0.16)] bg-[rgba(198,125,50,0.08)] px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-bronze">Analysis Scope</p>
                  <p className="mt-1 text-base font-semibold text-ink">{data.scope}</p>
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-moss">Compared Brands</p>
              <ul className="mt-3 space-y-2">
                {targetBrand && (
                  <li className="rounded-2xl border border-[rgba(198,125,50,0.2)] bg-[rgba(198,125,50,0.08)] px-4 py-2.5 text-sm font-semibold text-ink">
                    {targetBrand.name} (target brand)
                  </li>
                )}
                {competitors.map((brand) => (
                  <li key={brand.name} className="rounded-2xl border border-[rgba(31,95,91,0.12)] bg-white/70 px-4 py-2.5 text-sm text-stone">
                    {brand.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
          <h3 className="font-display text-2xl font-semibold text-ink">Positioning Interpretation</h3>
          <p className="mt-4 text-sm leading-7 text-stone sm:text-base whitespace-pre-line">{positioningSummary}</p>
        </div>
        <div className="rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-6 shadow-[0_20px_60px_rgba(61,41,20,0.08)]">
          <h3 className="font-display text-2xl font-semibold text-ink">Competitive Strategy</h3>
          <p className="mt-4 text-sm leading-7 text-stone sm:text-base whitespace-pre-line">{competitiveInterpretation}</p>
        </div>
      </section>

      <SourceList references={data.references} />
    </div>
  );
};

export default DashboardDisplay;
