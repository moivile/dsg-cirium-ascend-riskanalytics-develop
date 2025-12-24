export interface FleetInsightsTrendsChartDataset {
  data: number[];
  label: string;
  fill: boolean;
  tension: number;
  backgroundColor: string;
  borderColor: string;
  pointBackgroundColor: string;
  borderWidth: number;
  pointRadius: number;
  pointHoverRadius: number;
}

export interface FleetInsightsTrendsChartData {
  labels: string[];
  datasets: FleetInsightsTrendsChartDataset[];
}

export interface FleetInsightsTrendsRawData {
  timePoint: string;
  [key: string]: string | number;
}
