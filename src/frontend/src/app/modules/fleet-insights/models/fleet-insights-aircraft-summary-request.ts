import { FleetInsightsAircraftRequest } from './fleet-insights-aircraft-request';
import { GroupAllDataByOptions } from './group-all-data-by';

export interface FleetInsightsAircraftSummaryRequest extends FleetInsightsAircraftRequest {
  grouping?: GroupAllDataByOptions;
}
