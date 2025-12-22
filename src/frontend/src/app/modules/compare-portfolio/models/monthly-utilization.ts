export interface MonthlyUtilization {
  group: string;
  groupId: number;
  aircraftType: string;
  numberOfAircraftInGroup: number;
  year: number;
  month: number;
  averageHours: number;
  totalHours: number;
  numberOfAircraftWithHours: number;
  averageCycles: number;
  totalCycles: number;
  numberOfAircraftWithCycles: number;
  averageHoursPerCycle: number;
  numberOfAircraftWithHoursPerCycle: number;
  averageCo2KgPerSeat: number;
  numberOfAircraftWithCo2KgPerSeat: number;
  totalCo2KgPerSeat: number;
  averageCo2GPerAsk: number;
  averageCo2GPerAsm: number;
  totalCo2GPerAsk: number;
  totalCo2GPerAsm: number;
  numberOfAircraftWithCo2GPerAsk: number;
  numberOfAircraftWithCo2GPerAsm: number;
}
