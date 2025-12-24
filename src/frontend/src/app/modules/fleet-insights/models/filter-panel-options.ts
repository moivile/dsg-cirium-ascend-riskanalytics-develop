import { IdNamePairModel } from '../../shared/models/id-name-pair-model';

export interface FilterPanelOptions {
  statuses: IdNamePairModel[];
  primaryUsages: IdNamePairModel[];
  marketClasses: IdNamePairModel[];
  lessors: IdNamePairModel[];

  aircraftManufacturers: IdNamePairModel[];
  aircraftFamilies: IdNamePairModel[];
  aircraftTypes: IdNamePairModel[];
  aircraftMasterSeries: IdNamePairModel[];
  aircraftSeries: IdNamePairModel[];
  aircraftSubSeries: IdNamePairModel[];

  engineTypes: IdNamePairModel[];
  engineManufacturers: IdNamePairModel[];
  engineFamilies: IdNamePairModel[];
  engineMasterSeries: IdNamePairModel[];
  engineSeries: IdNamePairModel[];
  engineSubSeries: IdNamePairModel[];

  operators: IdNamePairModel[];
  operatorTypes: IdNamePairModel[];
  operatorGroups: IdNamePairModel[];
  operatorRegions: IdNamePairModel[];
  operatorCountries: IdNamePairModel[];
}
