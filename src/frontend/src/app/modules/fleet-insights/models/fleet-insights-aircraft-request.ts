import { FleetInsightsFiltersRequest } from './fleet-insights-filters-request';
import { FleetInsightsSortByTypes } from './fleet-insights-sort-by-types';

export const aircraftRequestDateFormat = 'YYYY-MM-DD';

export interface FleetInsightsAircraftRequest extends FleetInsightsFiltersRequest {
  startAge: number;
  endAge: number;
  includeYoungLifeAircraft: boolean;
  includeMidLifeAircraft: boolean;
  includeLateLifeAircraft: boolean;
  date?: string;
  ownershipIds?: number[];
  availabilityIds?: number[];
  leaseStatusIds?: number[];
  skip?: number;
  take?: number;
  sortBy?: FleetInsightsSortByTypes;
  sortDirectionAscending?: boolean;
}
