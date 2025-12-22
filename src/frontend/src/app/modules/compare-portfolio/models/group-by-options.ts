import { IdNamePairModel } from './../../shared/models/id-name-pair-model';

export interface GroupByOptions {
  key: string;
  value? : (IdNamePairModel | undefined)[];
  filterIds: number[],
}
