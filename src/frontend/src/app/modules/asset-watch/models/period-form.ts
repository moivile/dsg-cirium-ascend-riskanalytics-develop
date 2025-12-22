import { FormControl, Validators } from '@angular/forms';
import { TimePeriodOption, getFilterPanelFormEndDate, getFilterPanelFormStartDate } from './time-period-option';

export class PeriodForm {
  periodFormStartDate = new FormControl<Date>(getFilterPanelFormStartDate(TimePeriodOption.Last7Days).toDate(), {
    validators: Validators.required
  });
  periodFormEndDate = new FormControl<Date>(getFilterPanelFormEndDate().toDate(), { validators: Validators.required });
}
