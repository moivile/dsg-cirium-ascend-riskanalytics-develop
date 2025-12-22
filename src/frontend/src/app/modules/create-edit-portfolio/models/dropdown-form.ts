import { FormControl } from '@angular/forms';
import { IdNamePairModel } from '../../shared/models/id-name-pair-model';

export class DropdownForm {
  manufacturers = new FormControl<IdNamePairModel[]>([]);
  aircraftTypes = new FormControl<IdNamePairModel[]>([]);
  aircraftMasterSeriesList = new FormControl<IdNamePairModel[]>([]);
  aircraftOperators = new FormControl<IdNamePairModel[]>([]);
  operatorCountries = new FormControl<IdNamePairModel[]>([]);
  lessors = new FormControl<IdNamePairModel[]>([]);
  companyTypes = new FormControl<IdNamePairModel[]>([]);
  statuses = new FormControl<IdNamePairModel[]>([]);
}
