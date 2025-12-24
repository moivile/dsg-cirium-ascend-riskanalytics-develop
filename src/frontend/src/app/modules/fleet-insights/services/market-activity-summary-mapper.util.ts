import dayjs from 'dayjs';
import { FilterPanelFormValueModel } from '../models/filter-panel-form-model';
import { aircraftRequestDateFormat } from '../models/fleet-insights-aircraft-request';
import { MarketActivitySummaryRequest } from '../models/market-activity-summary-request';
import { MarketActivityTrendsRequest } from '../models/market-activity-trends-request';
import { GroupAllDataByOptions } from '../models/group-all-data-by';
import { IntervalType } from '../models/interval-type.enum';
import { initialFilterPanelFormValue } from './fleet-insights-store';

function extractEventIds(filters: Partial<FilterPanelFormValueModel>): number[] {
  return [
    ...(filters.orders || []),
    ...(filters.deliveries || []),
    ...(filters.slb || []),
    ...(filters.entryToService || []),
    ...(filters.cancellations || []),
    ...(filters.purchasesSales || []),
    ...(filters.leaseStart || []),
    ...(filters.leaseEnd || []),
    ...(filters.parked || []),
    ...(filters.conversions || []),
    ...(filters.retirements || [])
  ].filter((id) => id !== undefined);
}

// Adjust endMonthDate only when interval is Quarter:
// - If interval not Quarter -> return original value.
// - If endMonthDate missing -> return as is.
// - If invalid -> return original value.
// - If valid -> normalize to December 1 (month index 11) of the same year (no year change).
function adjustEndDateToDecemberIfQuarter(endMonthDate?: string, interval?: IntervalType): string | undefined {
  if (interval !== IntervalType.Quarter) {
    return endMonthDate;
  }
  if (!endMonthDate) {
    return endMonthDate;
  }
  const parsed = dayjs(endMonthDate);
  if (!parsed.isValid()) {
    return endMonthDate;
  }
  return parsed.month(11).startOf('month').format(aircraftRequestDateFormat); // month(11) == December
}

export function mapFiltersToMarketActivitySummaryRequest(filters: {
  marketActivityTabLeftPanelFilters: Partial<FilterPanelFormValueModel>;
  groupAllDataByValue: GroupAllDataByOptions;
}): MarketActivitySummaryRequest {
  const request: MarketActivitySummaryRequest = {
    grouping: filters.groupAllDataByValue,
    interval: filters.marketActivityTabLeftPanelFilters.intervalType,
    startMonthDate:
      filters.marketActivityTabLeftPanelFilters.startDate &&
      dayjs(filters.marketActivityTabLeftPanelFilters.startDate).format(aircraftRequestDateFormat),
    endMonthDate:
      filters.marketActivityTabLeftPanelFilters.endDate &&
      dayjs(filters.marketActivityTabLeftPanelFilters.endDate).format(aircraftRequestDateFormat),
    manufacturerIds: filters.marketActivityTabLeftPanelFilters.aircraftManufacturers,
    aircraftTypeIds: filters.marketActivityTabLeftPanelFilters.aircraftTypes,
    aircraftFamilyIds: filters.marketActivityTabLeftPanelFilters.aircraftFamilies,
    aircraftMasterSeriesIds: filters.marketActivityTabLeftPanelFilters.aircraftMasterSeries,
    aircraftSeriesIds: filters.marketActivityTabLeftPanelFilters.aircraftSeries,
    aircraftSubSeriesIds: filters.marketActivityTabLeftPanelFilters.aircraftSubSeries,
    engineTypeIds: filters.marketActivityTabLeftPanelFilters.engineTypes,
    engineManufacturerIds: filters.marketActivityTabLeftPanelFilters.engineManufacturers,
    engineFamilyIds: filters.marketActivityTabLeftPanelFilters.engineFamilies,
    engineMasterSeriesIds: filters.marketActivityTabLeftPanelFilters.engineMasterSeries,
    engineSeriesIds: filters.marketActivityTabLeftPanelFilters.engineSeries,
    engineSubSeriesIds: filters.marketActivityTabLeftPanelFilters.engineSubSeries,
    aircraftOperatorIds: filters.marketActivityTabLeftPanelFilters.operators,
    marketClassIds: filters.marketActivityTabLeftPanelFilters.marketClasses,
    operatorTypeIds: filters.marketActivityTabLeftPanelFilters.operatorTypes,
    operatorGroupIds: filters.marketActivityTabLeftPanelFilters.operatorGroups,
    operatorRegionIds: filters.marketActivityTabLeftPanelFilters.operatorRegions,
    operatorCountryIds: filters.marketActivityTabLeftPanelFilters.operatorCountries,
    statusIds: filters.marketActivityTabLeftPanelFilters.statuses,
    lessorIds: filters.marketActivityTabLeftPanelFilters.lessors,
    primaryUsageIds: filters.marketActivityTabLeftPanelFilters.primaryUsages,
    startAge: filters?.marketActivityTabLeftPanelFilters.rangeValues
      ? filters.marketActivityTabLeftPanelFilters.rangeValues[0]
      : initialFilterPanelFormValue.rangeValues[0],
    endAge: filters?.marketActivityTabLeftPanelFilters.rangeValues
      ? filters.marketActivityTabLeftPanelFilters.rangeValues[1]
      : initialFilterPanelFormValue.rangeValues[1],
    includeMidLifeAircraft: filters.marketActivityTabLeftPanelFilters.IncludeMidLifeAircraft,
    includeLateLifeAircraft: filters.marketActivityTabLeftPanelFilters.IncludeLateLifeAircraft,
    includeYoungLifeAircraft: filters.marketActivityTabLeftPanelFilters.IncludeYoungLifeAircraft,
    // Market Activity specific filters - event types
    eventIds: extractEventIds(filters.marketActivityTabLeftPanelFilters)
  };

  // Apply December adjustment only for Quarter interval.
  request.endMonthDate = adjustEndDateToDecemberIfQuarter(request.endMonthDate, request.interval);

  return request;
}

export function mapFiltersToMarketActivityTrendsRequest(filters: {
  marketActivityTabLeftPanelFilters: Partial<FilterPanelFormValueModel>;
  groupAllDataByValue: GroupAllDataByOptions;
}): MarketActivityTrendsRequest {
  const request: MarketActivityTrendsRequest = {
    grouping: filters.groupAllDataByValue,
    interval: filters.marketActivityTabLeftPanelFilters.intervalType || IntervalType.Monthly,
    startMonthDate:
      filters.marketActivityTabLeftPanelFilters.startDate &&
      dayjs(filters.marketActivityTabLeftPanelFilters.startDate).format(aircraftRequestDateFormat),
    endMonthDate:
      filters.marketActivityTabLeftPanelFilters.endDate &&
      dayjs(filters.marketActivityTabLeftPanelFilters.endDate).format(aircraftRequestDateFormat),
    manufacturerIds: filters.marketActivityTabLeftPanelFilters.aircraftManufacturers,
    aircraftTypeIds: filters.marketActivityTabLeftPanelFilters.aircraftTypes,
    aircraftFamilyIds: filters.marketActivityTabLeftPanelFilters.aircraftFamilies,
    aircraftMasterSeriesIds: filters.marketActivityTabLeftPanelFilters.aircraftMasterSeries,
    aircraftSeriesIds: filters.marketActivityTabLeftPanelFilters.aircraftSeries,
    aircraftSubSeriesIds: filters.marketActivityTabLeftPanelFilters.aircraftSubSeries,
    engineTypeIds: filters.marketActivityTabLeftPanelFilters.engineTypes,
    engineManufacturerIds: filters.marketActivityTabLeftPanelFilters.engineManufacturers,
    engineFamilyIds: filters.marketActivityTabLeftPanelFilters.engineFamilies,
    engineMasterSeriesIds: filters.marketActivityTabLeftPanelFilters.engineMasterSeries,
    engineSeriesIds: filters.marketActivityTabLeftPanelFilters.engineSeries,
    engineSubSeriesIds: filters.marketActivityTabLeftPanelFilters.engineSubSeries,
    aircraftOperatorIds: filters.marketActivityTabLeftPanelFilters.operators,
    marketClassIds: filters.marketActivityTabLeftPanelFilters.marketClasses,
    operatorTypeIds: filters.marketActivityTabLeftPanelFilters.operatorTypes,
    operatorGroupIds: filters.marketActivityTabLeftPanelFilters.operatorGroups,
    operatorRegionIds: filters.marketActivityTabLeftPanelFilters.operatorRegions,
    operatorCountryIds: filters.marketActivityTabLeftPanelFilters.operatorCountries,
    statusIds: filters.marketActivityTabLeftPanelFilters.statuses,
    lessorIds: filters.marketActivityTabLeftPanelFilters.lessors,
    primaryUsageIds: filters.marketActivityTabLeftPanelFilters.primaryUsages,
    startAge: filters?.marketActivityTabLeftPanelFilters.rangeValues
      ? filters.marketActivityTabLeftPanelFilters.rangeValues[0]
      : initialFilterPanelFormValue.rangeValues[0],
    endAge: filters?.marketActivityTabLeftPanelFilters.rangeValues
      ? filters.marketActivityTabLeftPanelFilters.rangeValues[1]
      : initialFilterPanelFormValue.rangeValues[1],
    includeMidLifeAircraft: filters.marketActivityTabLeftPanelFilters.IncludeMidLifeAircraft,
    includeLateLifeAircraft: filters.marketActivityTabLeftPanelFilters.IncludeLateLifeAircraft,
    includeYoungLifeAircraft: filters.marketActivityTabLeftPanelFilters.IncludeYoungLifeAircraft,
    // Market Activity specific filters - event types
    eventIds: extractEventIds(filters.marketActivityTabLeftPanelFilters)
  };

  // Apply December adjustment only for Quarter interval.
  request.endMonthDate = adjustEndDateToDecemberIfQuarter(request.endMonthDate, request.interval);

  return request;
}
