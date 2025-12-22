export interface AssetWatchGridModel {
  aircraftId: number;
  aircraftSerialNumber?: string;
  aircraftRegistrationNumber?: string;
  aircraftSeries?: string;
  aircraftStatus?: string;
  operatorName?: string;
  managerName?: string;
  maintenanceActivity?: string;
  numberOfFlights?: number;
  totalFlightHours?: number;
  totalGroundStayHours?: number;
  timesBetweenMinMaxIndGroundStay?: number;
  lastFlightDate?: Date;
  currentGroundEventAirportName?: string;
  currentGroundEventDurationHours?: number;
}
