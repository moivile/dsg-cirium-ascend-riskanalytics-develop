export interface FleetInsightsAircraftModel {
  aircraftId: number;
  aircraftSerialNumber: string;
  aircraftAgeYears?: number;
  aircraftRegistrationNumber?: string;
  status?: string;
  aircraftManufacturer?: string;
  aircraftSeries?: string;
  engineSeries?: string;
  deliveryDate?: string;
  aircraftUsage?: string;
  operator?: string;
  manager?: string;
  owner?: string;
  ownership?: string;
  leaseStatus?: string;
  leaseStart?: string;
  leaseEnd?: string;
  isLeaseEndEstimated?: boolean;
  availability?: string;
}
