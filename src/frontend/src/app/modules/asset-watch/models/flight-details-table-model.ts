export interface FlightDetailsTableModel {
    arrivalDate: Date;
    lastOriginAirport?: string;
    selectedAirport?: string;
    selectedCountry?: string;
    routeCategory?: string;
    operationType?: string;
    groundEventTime?: number;
    flightHours?: number;
    maintenanceActivity?: string;
    departureDate?: Date;
    nextDestinationAirport?: string;
  }
