import { IdNamePairModel } from '../../shared/models/id-name-pair-model';
import { Aircraft } from '../../shared/models/aircraft';

export interface AircraftSearchResult extends AircraftSearchResultDropdowns {
  aircraftList: Aircraft[];
  totalCount: number;
}

export class AircraftSearchResultDropdowns {
  manufacturers: IdNamePairModel[] = [];
  aircraftTypes: IdNamePairModel[] = [];
  aircraftMasterSeries: IdNamePairModel[] = [];
  aircraftOperators: IdNamePairModel[] = [];
  operatorCountries: IdNamePairModel[] = [];
  lessors: IdNamePairModel[] = [];
  companyTypes: IdNamePairModel[] = [];
  statuses: IdNamePairModel[] = [];
}
