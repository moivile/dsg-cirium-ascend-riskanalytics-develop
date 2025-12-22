import { Metric } from './metric';

export interface MetricOptions {
  metric: Metric;
  startYear: number;
  startMonthIndex: number;
  endYear: number;
  endMonthIndex: number;
}
