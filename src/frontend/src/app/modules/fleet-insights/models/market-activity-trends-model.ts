export interface MarketActivityTrendsModel {
  period: string;
  numberOfEvents: number;
  percentageOfTotal?: number;
  grouping: string;
}

export interface MarketActivityTrendsApiResponse {
  grouping: string;
  values: MarketActivityTrendsTimePoint[];
}

export interface MarketActivityTrendsTimePoint {
  year: number;
  timePoint: number;
  numberOfEvents: number;
  percentageOfTotal: number;
  percentageOfInService: number;
}
