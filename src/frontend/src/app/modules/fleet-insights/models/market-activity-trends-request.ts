import { GroupAllDataByOptions } from './group-all-data-by';
import { IntervalType } from './interval-type.enum';

export interface MarketActivityTrendsRequest {
  grouping: GroupAllDataByOptions;
  interval: IntervalType;
  startMonthDate?: string;
  endMonthDate?: string;
  manufacturerIds?: number[];
  aircraftTypeIds?: number[];
  aircraftFamilyIds?: number[];
  aircraftMasterSeriesIds?: number[];
  aircraftSeriesIds?: number[];
  aircraftSubSeriesIds?: number[];
  engineTypeIds?: number[];
  engineManufacturerIds?: number[];
  engineFamilyIds?: number[];
  engineMasterSeriesIds?: number[];
  engineSeriesIds?: number[];
  engineSubSeriesIds?: number[];
  aircraftOperatorIds?: number[];
  marketClassIds?: number[];
  operatorTypeIds?: number[];
  operatorGroupIds?: number[];
  operatorRegionIds?: number[];
  operatorCountryIds?: number[];
  statusIds?: number[];
  lessorIds?: number[];
  primaryUsageIds?: number[];
  eventIds?: number[];
  includeYoungLifeAircraft?: boolean;
  includeMidLifeAircraft?: boolean;
  includeLateLifeAircraft?: boolean;
  startAge?: number;
  endAge?: number;
}
