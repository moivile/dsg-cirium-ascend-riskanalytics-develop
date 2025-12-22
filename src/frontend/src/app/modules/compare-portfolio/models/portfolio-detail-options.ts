import { GroupByOptions } from './group-by-options';

export interface PortfolioDetailOptions {
  portfolioId?: number,
  portfolioName: string,
  groupByOptions?: GroupByOptions;
  operatorId?: number;
  operatorName?: string;
  lessorId?: number;
  lessorName?: string;
  includeBaseline: boolean;
}
