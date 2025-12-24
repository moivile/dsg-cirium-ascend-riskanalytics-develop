import { FormControl } from '@angular/forms';
import { IntervalType } from './interval-type.enum';

export interface FilterPanelFormModel {
  intervalType: FormControl<IntervalType>;
  startDate: FormControl<Date>;
  endDate: FormControl<Date>;
  date: FormControl<Date>;
  IncludeYoungLifeAircraft: FormControl<boolean>;
  IncludeMidLifeAircraft: FormControl<boolean>;
  IncludeLateLifeAircraft: FormControl<boolean>;
  rangeValues: FormControl<number[]>;
  statuses: FormControl<number[]>;
  primaryUsages: FormControl<number[]>;
  marketClasses: FormControl<number[]>;
  lessors: FormControl<number[]>;

  orders: FormControl<number[]>;
  deliveries: FormControl<number[]>;
  slb: FormControl<number[]>;
  entryToService: FormControl<number[]>;
  cancellations: FormControl<number[]>;
  purchasesSales: FormControl<number[]>;
  leaseStart: FormControl<number[]>;
  leaseEnd: FormControl<number[]>;
  parked: FormControl<number[]>;
  conversions: FormControl<number[]>;
  retirements: FormControl<number[]>;

  aircraftManufacturers: FormControl<number[]>;
  aircraftFamilies: FormControl<number[]>;
  aircraftTypes: FormControl<number[]>;
  aircraftMasterSeries: FormControl<number[]>;
  aircraftSeries: FormControl<number[]>;
  aircraftSubSeries: FormControl<number[]>;

  engineTypes: FormControl<number[]>;
  engineManufacturers: FormControl<number[]>;
  engineFamilies: FormControl<number[]>;
  engineMasterSeries: FormControl<number[]>;
  engineSeries: FormControl<number[]>;
  engineSubSeries: FormControl<number[]>;

  operators: FormControl<number[]>;
  operatorTypes: FormControl<number[]>;
  operatorGroups: FormControl<number[]>;
  operatorRegions: FormControl<number[]>;
  operatorCountries: FormControl<number[]>;

  ownerships: FormControl<number[]>;
  trendsOwnerships: FormControl<number[]>;
  leaseStatuses: FormControl<number[]>;
  availabilities: FormControl<number[]>;
}

export interface FilterPanelFormValueModel {
  intervalType: IntervalType;
  startDate: Date;
  endDate: Date;
  date: Date;
  IncludeYoungLifeAircraft: boolean;
  IncludeMidLifeAircraft: boolean;
  IncludeLateLifeAircraft: boolean;
  rangeValues: number[];
  statuses: number[];
  primaryUsages: number[];
  marketClasses: number[];
  lessors: number[];

  orders: number[];
  deliveries: number[];
  slb: number[];
  entryToService: number[];
  cancellations: number[];
  purchasesSales: number[];
  leaseStart: number[];
  leaseEnd: number[];
  parked: number[];
  conversions: number[];
  retirements: number[];

  aircraftManufacturers: number[];
  aircraftFamilies: number[];
  aircraftTypes: number[];
  aircraftMasterSeries: number[];
  aircraftSeries: number[];
  aircraftSubSeries: number[];

  engineTypes: number[];
  engineManufacturers: number[];
  engineFamilies: number[];
  engineMasterSeries: number[];
  engineSeries: number[];
  engineSubSeries: number[];

  operators: number[];
  operatorTypes: number[];
  operatorGroups: number[];
  operatorRegions: number[];
  operatorCountries: number[];

  ownerships: number[];
  trendsOwnerships: number[];
  leaseStatuses: number[];
  availabilities: number[];
}
