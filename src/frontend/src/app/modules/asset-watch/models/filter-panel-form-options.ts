import { IdNamePairModel } from '.././../shared/models/id-name-pair-model';
import { StringIdNamePairModel } from '../../shared/models/string-id-name-pair-model';
import { CountriesRegionsModel } from '../../shared/models/country-regions';

export interface FilterPanelFormOptions {
  operators: IdNamePairModel[];
  regions: StringIdNamePairModel[];
  countries: CountriesRegionsModel[];
  cities: StringIdNamePairModel[];
  airports: StringIdNamePairModel[];
  lessors: IdNamePairModel[];
  aircraftSeries: IdNamePairModel[];
  engineSeries: IdNamePairModel[];
  aircraftSerialNumbers: IdNamePairModel[];
  maintenanceActivities: IdNamePairModel[];
}
