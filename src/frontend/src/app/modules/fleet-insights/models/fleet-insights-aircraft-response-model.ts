import { FleetInsightsAircraftModel } from './fleet-insights-aircraft-model';

export interface FleetInsightsAircraftResponseModel {
  aircraftList?: FleetInsightsAircraftModel[];
  skip: number;
  take: number;
  totalCount: number;
}
