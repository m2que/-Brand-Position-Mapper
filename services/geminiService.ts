import type { MapData } from '../types';

export const fetchBrandMapData = async (brandName: string, scope: string): Promise<MapData> => {
  const response = await fetch('/api/brand-map', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ brandName, scope })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(typeof errorData.error === 'string' ? errorData.error : 'Failed to generate brand map data.');
  }

  return response.json();
};
