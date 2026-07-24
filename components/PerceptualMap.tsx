import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell, ReferenceLine } from 'recharts';
import type { Brand } from '../types';

interface PerceptualMapProps {
  data: Brand[];
  xAxisLabel: string;
  yAxisLabel: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-base-300 p-3 border border-gray-500 rounded-lg shadow-lg">
        <p className="font-bold text-white">{data.name}</p>
        <p className="text-sm text-content">{`X: ${data.x}`}</p>
        <p className="text-sm text-content">{`Y: ${data.y}`}</p>
      </div>
    );
  }
  return null;
};

const PerceptualMap: React.FC<PerceptualMapProps> = ({ data, xAxisLabel, yAxisLabel }) => {
  const domain = [-11, 11];

  return (
    <div className="w-full h-96 md:h-[500px] bg-base-200 p-4 rounded-lg shadow-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 40,
            bottom: 40,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis type="number" dataKey="x" name={xAxisLabel} domain={domain} stroke="#9CA3AF">
            <Label value={xAxisLabel} offset={-25} position="insideBottom" fill="#D1D5DB" />
            <Label value="" position="insideTopLeft" />
          </XAxis>
          <YAxis type="number" dataKey="y" name={yAxisLabel} domain={domain} stroke="#9CA3AF">
            <Label value={yAxisLabel} angle={-90} offset={-5} position="insideLeft" fill="#D1D5DB" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          
          {/* Quadrant Lines */}
          <ReferenceLine x={0} stroke="#6B7280" strokeDasharray="2 2" />
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="2 2" />

          <Scatter name="Brands" data={data} fill="#8884d8">
             {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isTarget ? '#A78BFA' : '#60A5FA'} stroke={entry.isTarget ? '#fff' : 'none'} strokeWidth={2}/>
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerceptualMap;