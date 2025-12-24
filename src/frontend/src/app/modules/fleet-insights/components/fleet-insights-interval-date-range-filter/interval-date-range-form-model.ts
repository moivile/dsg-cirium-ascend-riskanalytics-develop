import { FormControl } from '@angular/forms';
import { IntervalType } from '../../models/interval-type.enum';

export interface IntervalDateRangeFormModel {
  intervalType: FormControl<IntervalType>;
  startDate: FormControl<Date>;
  endDate: FormControl<Date>;
}
