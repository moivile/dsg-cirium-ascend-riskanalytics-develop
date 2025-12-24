import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { FilterPanelFormValueModel } from '../models/filter-panel-form-model';
import { aircraftRequestDateFormat } from '../models/fleet-insights-aircraft-request';
import { FleetInsightsTrendsSummaryRequest } from '../models/fleet-insights-trends-summary-request';
import { GroupAllDataByOptions } from '../models/group-all-data-by';
import { initialFilterPanelFormValue } from './fleet-insights-store';
import { IntervalType } from '../models/interval-type.enum';

dayjs.extend(quarterOfYear);

// 1. If endMonthDate is missing or interval != Quarter — return original value.
// 2. If the date is invalid — return original value.
// 3. If the year of the provided date is less than the current year — return the first day of December of that year (still allowing full historical year view).
// 4. If the year is the current year or a future year — return the first day of the last month of the last fully completed quarter.
//    - If no quarter has yet fully completed in the current year (i.e. we are inside Q1), this becomes December of the previous year.
// 5. The function is idempotent: applying it multiple times will not further change the result.
// Returns the adjusted date in aircraftRequestDateFormat or the original value.
export function adjustEndMonthDateForQuarterIntervalType(endMonthDate: string | undefined, interval: IntervalType): string | undefined {
  if (!endMonthDate) {
    return endMonthDate;
  }
  if (interval !== IntervalType.Quarter) {
    return endMonthDate;
  }

  const now = dayjs();
  const parsed = dayjs(endMonthDate);
  if (!parsed.isValid()) {
    return endMonthDate;
  }

  const currentYear = now.year();
  const targetYear = parsed.year();

  if (targetYear < currentYear) {
    return dayjs().year(targetYear).endOf('year').startOf('month').format(aircraftRequestDateFormat);
  }

  // Current or future year: derive last fully completed quarter's last month start.
  // Logic:
  // - now.startOf('quarter') => first day of the current (possibly incomplete) quarter
  // - subtract(1,'day') => lands on the last day of the previous (fully completed) quarter
  // - startOf('month') => first day of that final month of the completed quarter
  const lastCompletedQuarterMonthStart = now.startOf('quarter').subtract(1, 'day').startOf('month');

  return lastCompletedQuarterMonthStart.format(aircraftRequestDateFormat);
}

export function mapFiltersToFleetInsightsTrendsSummaryRequest(filters: {
  trendsTabLeftPanelFilters: Partial<FilterPanelFormValueModel>;
  groupAllDataByValue: GroupAllDataByOptions;
}): FleetInsightsTrendsSummaryRequest {
  const request: FleetInsightsTrendsSummaryRequest = {
    grouping: filters.groupAllDataByValue,
    interval: filters.trendsTabLeftPanelFilters.intervalType || initialFilterPanelFormValue.intervalType,
    startMonthDate:
      filters.trendsTabLeftPanelFilters.startDate && dayjs(filters.trendsTabLeftPanelFilters.startDate).format(aircraftRequestDateFormat),
    endMonthDate:
      filters.trendsTabLeftPanelFilters.endDate && dayjs(filters.trendsTabLeftPanelFilters.endDate).format(aircraftRequestDateFormat),
    manufacturerIds: filters.trendsTabLeftPanelFilters.aircraftManufacturers,
    aircraftTypeIds: filters.trendsTabLeftPanelFilters.aircraftTypes,
    aircraftFamilyIds: filters.trendsTabLeftPanelFilters.aircraftFamilies,
    aircraftMasterSeriesIds: filters.trendsTabLeftPanelFilters.aircraftMasterSeries,
    aircraftSeriesIds: filters.trendsTabLeftPanelFilters.aircraftSeries,
    aircraftSubSeriesIds: filters.trendsTabLeftPanelFilters.aircraftSubSeries,
    engineTypeIds: filters.trendsTabLeftPanelFilters.engineTypes,
    engineManufacturerIds: filters.trendsTabLeftPanelFilters.engineManufacturers,
    engineFamilyIds: filters.trendsTabLeftPanelFilters.engineFamilies,
    engineMasterSeriesIds: filters.trendsTabLeftPanelFilters.engineMasterSeries,
    engineSeriesIds: filters.trendsTabLeftPanelFilters.engineSeries,
    engineSubSeriesIds: filters.trendsTabLeftPanelFilters.engineSubSeries,
    aircraftOperatorIds: filters.trendsTabLeftPanelFilters.operators,
    marketClassIds: filters.trendsTabLeftPanelFilters.marketClasses,
    operatorTypeIds: filters.trendsTabLeftPanelFilters.operatorTypes,
    operatorGroupIds: filters.trendsTabLeftPanelFilters.operatorGroups,
    operatorRegionIds: filters.trendsTabLeftPanelFilters.operatorRegions,
    operatorCountryIds: filters.trendsTabLeftPanelFilters.operatorCountries,
    statusIds: filters.trendsTabLeftPanelFilters.statuses,
    lessorIds: filters.trendsTabLeftPanelFilters.lessors,
    startAge: filters?.trendsTabLeftPanelFilters.rangeValues
      ? filters.trendsTabLeftPanelFilters.rangeValues[0]
      : initialFilterPanelFormValue.rangeValues[0],
    endAge: filters?.trendsTabLeftPanelFilters.rangeValues
      ? filters.trendsTabLeftPanelFilters.rangeValues[1]
      : initialFilterPanelFormValue.rangeValues[1],
    IncludeMidLifeAircraft: filters.trendsTabLeftPanelFilters.IncludeMidLifeAircraft,
    IncludeLateLifeAircraft: filters.trendsTabLeftPanelFilters.IncludeLateLifeAircraft,
    IncludeYoungLifeAircraft: filters.trendsTabLeftPanelFilters.IncludeYoungLifeAircraft,
    ownershipIds: filters.trendsTabLeftPanelFilters.trendsOwnerships,
    leaseStatusIds: filters.trendsTabLeftPanelFilters.leaseStatuses,
    primaryUsageIds: filters.trendsTabLeftPanelFilters.primaryUsages
  };

  request.endMonthDate = adjustEndMonthDateForQuarterIntervalType(request.endMonthDate, request.interval);

  return request;
}
