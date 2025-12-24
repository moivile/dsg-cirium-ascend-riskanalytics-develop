import dayjs from 'dayjs';
import { IdNamePairModel } from '../../shared/models/id-name-pair-model';
import { FilterPanelFormValueModel } from '../models/filter-panel-form-model';
import { aircraftRequestDateFormat, FleetInsightsAircraftRequest } from '../models/fleet-insights-aircraft-request';
import { FleetInsightsFiltersRequest } from '../models/fleet-insights-filters-request';
import { PagingAndSortingParams } from '../models/paging-and-sorting-params.model';
import { FleetInsightsAircraftSummaryRequest } from '../models/fleet-insights-aircraft-summary-request';
import { GroupAllDataByOptions } from '../models/group-all-data-by';
import { initialFilterPanelFormValue } from './fleet-insights-store';

export function mapFormValueToFiltersRequest(formValue: Partial<FilterPanelFormValueModel>): FleetInsightsFiltersRequest {
  return {
    statusIds: formValue.statuses,
    primaryUsageIds: formValue.primaryUsages,
    marketClassIds: formValue.marketClasses,
    lessorIds: formValue.lessors,

    manufacturerIds: formValue.aircraftManufacturers,
    aircraftFamilyIds: formValue.aircraftFamilies,
    aircraftTypeIds: formValue.aircraftTypes,
    aircraftMasterSeriesIds: formValue.aircraftMasterSeries,
    aircraftSeriesIds: formValue.aircraftSeries,
    aircraftSubSeriesIds: formValue.aircraftSubSeries,

    engineTypeIds: formValue.engineTypes,
    engineManufacturerIds: formValue.engineManufacturers,
    engineFamilyIds: formValue.engineFamilies,
    engineMasterSeriesIds: formValue.engineMasterSeries,
    engineSeriesIds: formValue.engineSeries,
    engineSubSeriesIds: formValue.engineSubSeries,

    aircraftOperatorIds: formValue.operators,
    operatorTypeIds: formValue.operatorTypes,
    operatorGroupIds: formValue.operatorGroups,
    operatorRegionIds: formValue.operatorRegions,
    operatorCountryIds: formValue.operatorCountries,
    availabilityIds: formValue.availabilities
  };
}

export function sortOptionsWithPriority(
  options: IdNamePairModel[],
  priorityNames: string[],
  sortRemainingAlphabetically = true
): IdNamePairModel[] {
  return options.sort((a, b) => {
    const aPriorityIndex = priorityNames.indexOf(a.name);
    const bPriorityIndex = priorityNames.indexOf(b.name);

    if (aPriorityIndex !== -1 && bPriorityIndex !== -1) {
      return aPriorityIndex - bPriorityIndex;
    } else if (aPriorityIndex !== -1) {
      return -1;
    } else if (bPriorityIndex !== -1) {
      return 1;
    } else if (sortRemainingAlphabetically) {
      return a.name.localeCompare(b.name);
    } else {
      return 0;
    }
  });
}

export function mapFiltersToFleetInsightsAircraftRequest(
  filters: Partial<FilterPanelFormValueModel>,
  pagingAndSortingParams?: PagingAndSortingParams
): FleetInsightsAircraftRequest {
  const fleetInsightsAircraftRequest: FleetInsightsAircraftRequest = {
    startAge: filters?.rangeValues ? filters.rangeValues[0] : initialFilterPanelFormValue.rangeValues[0],
    endAge: filters?.rangeValues ? filters.rangeValues[1] : initialFilterPanelFormValue.rangeValues[1],
    includeYoungLifeAircraft: filters.IncludeYoungLifeAircraft || initialFilterPanelFormValue.IncludeYoungLifeAircraft,
    includeMidLifeAircraft: filters.IncludeMidLifeAircraft || initialFilterPanelFormValue.IncludeMidLifeAircraft,
    includeLateLifeAircraft: filters.IncludeLateLifeAircraft || initialFilterPanelFormValue.IncludeLateLifeAircraft,

    date: filters.date && dayjs(filters.date).format(aircraftRequestDateFormat),
    manufacturerIds: filters.aircraftManufacturers,
    aircraftTypeIds: filters.aircraftTypes,
    aircraftFamilyIds: filters.aircraftFamilies,
    aircraftMasterSeriesIds: filters.aircraftMasterSeries,
    aircraftSeriesIds: filters.aircraftSeries,
    aircraftSubSeriesIds: filters.aircraftSubSeries,
    engineTypeIds: filters.engineTypes,
    engineManufacturerIds: filters.engineManufacturers,
    engineFamilyIds: filters.engineFamilies,
    engineMasterSeriesIds: filters.engineMasterSeries,
    engineSeriesIds: filters.engineSeries,
    engineSubSeriesIds: filters.engineSubSeries,
    aircraftOperatorIds: filters.operators,
    marketClassIds: filters.marketClasses,
    operatorTypeIds: filters.operatorTypes,
    operatorGroupIds: filters.operatorGroups,
    operatorRegionIds: filters.operatorRegions,
    operatorCountryIds: filters.operatorCountries,
    statusIds: filters.statuses,
    lessorIds: filters.lessors,
    primaryUsageIds: filters.primaryUsages,
    ownershipIds: filters.ownerships,
    availabilityIds: filters.availabilities,
    leaseStatusIds: filters.leaseStatuses
  };

  if (pagingAndSortingParams) {
    fleetInsightsAircraftRequest.skip = pagingAndSortingParams.skip;
    fleetInsightsAircraftRequest.take = pagingAndSortingParams.take;
    fleetInsightsAircraftRequest.sortBy = pagingAndSortingParams.sortBy;
    fleetInsightsAircraftRequest.sortDirectionAscending = pagingAndSortingParams.sortDirectionAscending;
  }

  return fleetInsightsAircraftRequest;
}

export function mapFiltersToFleetInsightsAircraftSummaryRequest(filters: {
  distributionTabLeftPanelFilters: Partial<FilterPanelFormValueModel>;
  groupAllDataByValue: GroupAllDataByOptions;
}): FleetInsightsAircraftSummaryRequest {
  const request: FleetInsightsAircraftSummaryRequest = {
    ...mapFiltersToFleetInsightsAircraftRequest(filters.distributionTabLeftPanelFilters),
    grouping: filters.groupAllDataByValue
  };

  return request;
}
