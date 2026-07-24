import type { MapData } from '../types';

export const fetchBrandMapData = async (brandName: string, scope: string): Promise<MapData> => {
  try {
    const response = await fetch("/api/brand-map", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ brandName, scope }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server returned error status ${response.status}`);
    }

    const data = await response.json() as MapData;
    return data;
  } catch (error) {
    console.error("Error fetching brand map data:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate brand map data. Please check your connection and try again.");
  }
};
