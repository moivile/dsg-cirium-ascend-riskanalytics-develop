export interface Row {
  grouping: string;
  values: Value[];
}

export interface Value {
  numericValue?: number;
  percentageValue?: number;
}

export interface SheetTotals {
  [key: string]: number | string;
}

export interface SummaryDataRow {
  grouping: string;
  numberOfEvents: number;
  percentageOfTotal: number;
}

export interface MarketActivityFiltersWithNames {
  intervalType?: string;
  startDate?: string;
  endDate?: string;
  orders?: string[];
  deliveries?: string[];
  slb?: string[];
  entryToService?: string[];
  cancellations?: string[];
  purchasesSales?: string[];
  leaseStart?: string[];
  leaseEnd?: string[];
  parked?: string[];
  conversions?: string[];
  retirements?: string[];
  statuses?: string[];
  primaryUsages?: string[];
  marketClasses?: string[];
  aircraftManufacturers?: string[];
  aircraftFamilies?: string[];
  aircraftTypes?: string[];
  aircraftMasterSeries?: string[];
  aircraftSeries?: string[];
  aircraftSubSeries?: string[];
  engineTypes?: string[];
  engineManufacturers?: string[];
  engineFamilies?: string[];
  engineMasterSeries?: string[];
  engineSeries?: string[];
  engineSubSeries?: string[];
  operators?: string[];
  operatorTypes?: string[];
  operatorGroups?: string[];
  operatorRegions?: string[];
  operatorCountries?: string[];
  lessors?: string[];
  rangeValues?: (string | number)[];
  includeYoungLifeAircraft?: boolean;
  includeMidLifeAircraft?: boolean;
  includeLateLifeAircraft ?: boolean;
}
