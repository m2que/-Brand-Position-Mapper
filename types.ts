
export interface Brand {
  name: string;
  x: number;
  y: number;
  isTarget: boolean;
}

export interface Reference {
  title: string;
  url: string;
}

export type ReferenceCategory =
  | 'official_brand'
  | 'government'
  | 'industry_databases'
  | 'news_media'
  | 'academic_research'
  | 'marketing_reports';

export interface MapData {
  scope: string;
  xAxisLabel: string;
  yAxisLabel: string;
  brands: Brand[];
  references: Partial<Record<ReferenceCategory, Reference[]>>;
}
