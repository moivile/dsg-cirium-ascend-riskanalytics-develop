import { Observable } from 'rxjs';
import { IdNamePairModel } from '../../shared/models/id-name-pair-model';

export interface MultiselectConfig {
  label: string;
  controlName: string;
  options$: Observable<IdNamePairModel[]>;
}
