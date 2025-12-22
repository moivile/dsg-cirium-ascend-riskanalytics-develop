export interface MSNUtilizationPerAircraft {
  registration: string;
  series: string;
  serialNumber: string;
  aircraftId: number;
  yearMonth: string[];
  totalHours: number[];
  totalCycles: number[];
  averageHoursPerCycle: number[];
  cO2EmissionPerKg: number[];
  averageCo2KgPerSeat: number[];
  averageCo2GPerAsk: number[];
  averageCo2GPerAsm: number[];
}
