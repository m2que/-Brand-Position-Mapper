import React from 'react';
import {
  CartesianGrid,
  Cell,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { Brand } from '../types';

interface PerceptualMapProps {
  data: Brand[];
  xAxisLabel: string;
  yAxisLabel: string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: Brand }> }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const brand = payload[0].payload;

  return (
    <div className="rounded-2xl border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.96)] p-3 text-sm shadow-lg">
      <p className="font-semibold text-ink">{brand.name}</p>
      <p className="text-stone">X: {brand.x}</p>
      <p className="text-stone">Y: {brand.y}</p>
    </div>
  );
};

const PerceptualMap: React.FC<PerceptualMapProps> = ({ data, xAxisLabel, yAxisLabel }) => {
  const chartXAxisLabel = `Perception Dimension: ${xAxisLabel}`;
  const chartYAxisLabel = `Perception Dimension: ${yAxisLabel}`;

  return (
    <div className="h-96 rounded-[24px] border border-[rgba(113,86,56,0.14)] bg-[rgba(255,252,247,0.92)] p-4 shadow-card md:h-[520px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 24, bottom: 56, left: 42 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8cfbf" />
          <XAxis type="number" dataKey="x" domain={[-10, 10]} ticks={[-10, -5, 0, 5, 10]} stroke="#6b7280">
            <Label value={chartXAxisLabel} offset={-18} position="insideBottom" fill="#4b5563" />
          </XAxis>
          <YAxis type="number" dataKey="y" domain={[-10, 10]} ticks={[-10, -5, 0, 5, 10]} stroke="#6b7280">
            <Label value={chartYAxisLabel} angle={-90} offset={-20} position="insideLeft" fill="#4b5563" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#8b7c67' }} />
          <ReferenceLine x={0} stroke="#8b7c67" strokeDasharray="4 4" />
          <ReferenceLine y={0} stroke="#8b7c67" strokeDasharray="4 4" />
          <Scatter data={data}>
            {data.map((brand, index) => (
              <Cell
                key={`${brand.name}-${index}`}
                fill={brand.isTarget ? '#c67d32' : '#1f5f5b'}
                stroke={brand.isTarget ? '#6d4718' : '#ffffff'}
                strokeWidth={brand.isTarget ? 2.5 : 1.25}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerceptualMap;
