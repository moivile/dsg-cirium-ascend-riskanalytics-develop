
import { IdNamePairModel } from '../../shared/models/id-name-pair-model';

export interface GroupOptions {
  aircraftMarketClasses: IdNamePairModel[];
  aircraftFamilies: IdNamePairModel[];
  aircraftTypes: IdNamePairModel[];
  aircraftSeries: IdNamePairModel[];
  aircraftSerialNumbers: IdNamePairModel[];
}
