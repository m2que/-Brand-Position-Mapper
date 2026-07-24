export interface Brand {
  name: string;
  x: number;
  y: number;
  isTarget: boolean;
}

export interface Reference {
  title: string;
  url: string;
  category: ReferenceCategory;
  relevanceNote: string;
}

export interface AxisDefinition {
  axisName: string;
  negativeLabel: string;
  positiveLabel: string;
  displayLabel: string;
  explanation: string;
}

export type ReferenceCategory =
  | 'official_brand'
  | 'government'
  | 'industry_databases'
  | 'news_media'
  | 'academic_research'
  | 'marketing_reports';

export type ScopeOption = 'Global' | 'Regional';

export interface MapData {
  scope: string;
  xAxisLabel: string;
  yAxisLabel: string;
  axisDefinitions: {
    x: AxisDefinition;
    y: AxisDefinition;
  };
  brands: Brand[];
  references: Reference[];
  positioningSummary: string;
  competitiveInterpretation: string;
  pointsOfParity?: string;
  pointsOfDifference?: string;
}

export interface BrandMapRequest {
  brandName: string;
  scope: string;
}
