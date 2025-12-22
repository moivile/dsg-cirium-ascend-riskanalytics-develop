import { FormControl } from '@angular/forms';
import { TimePeriodOption, getFilterPanelFormEndDate, getFilterPanelFormStartDate } from './time-period-option';

export const dateFormat = 'YYYY-MM-DD';

export class FilterPanelForm {
  regions = new FormControl<string[]>([]);
  countries = new FormControl<string[]>([]);
  cities = new FormControl<string[]>({ value: [], disabled: true });
  airports = new FormControl<string[]>({ value: [], disabled: true });
  routeCategory = new FormControl<string | null>(null);
  operators = new FormControl<number[]>([]);
  lessors = new FormControl<number[]>([]);
  aircraftSeries = new FormControl<number[]>([]);
  engineSeries = new FormControl<number[]>([]);
  aircraftSerialNumbers = new FormControl<number[]>([]);
  startDate = new FormControl<string>(getFilterPanelFormStartDate(TimePeriodOption.Last7Days).format(dateFormat), { nonNullable: true });
  endDate = new FormControl<string>(getFilterPanelFormEndDate().format(dateFormat), { nonNullable: true });
}
