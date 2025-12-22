import { FormControl, FormGroup } from '@angular/forms';
import { TimePeriodOption } from './time-period-option';
import { FilterPanelForm } from './filter-panel-form';
import { GroupingOption } from './grouping-option';

export class AssetWatchSummaryRequest {
  constructor(
    filterPanelForm: FormGroup<FilterPanelForm>,
    selectedTimePeriodControl: FormControl<TimePeriodOption>,
    selectedPortfolioId: number | null,
    assetWatchGroupingOption: FormControl<GroupingOption>
  ) {
    this.countryCodes = filterPanelForm.value.countries || [];
    this.cities = filterPanelForm.value.cities || [];
    this.airportCodes = filterPanelForm.value.airports || [];
    this.regionCodes = filterPanelForm.value.regions || [];
    this.dateFrom = filterPanelForm.value.startDate as string;
    this.dateTo = filterPanelForm.value.endDate as string;
    this.operatorIds = filterPanelForm.value.operators || [];
    this.lessorIds = filterPanelForm.value.lessors || [];
    this.aircraftSeriesIds = filterPanelForm.value.aircraftSeries || [];
    this.engineSerieIds = filterPanelForm.value.engineSeries || [];
    this.aircraftIds = filterPanelForm.value.aircraftSerialNumbers || [];
    this.period = TimePeriodOption[selectedTimePeriodControl.value];
    this.portfolioId = selectedPortfolioId ?? 0;
    if (filterPanelForm.value.routeCategory) {
      this.routeCategory = filterPanelForm.value.routeCategory?.toString();
    }
    this.assetWatchGroupingOption = GroupingOption[assetWatchGroupingOption.value];
  }

  countryCodes!: string[];
  cities!: string[];
  airportCodes!: string[];
  regionCodes!: string[];
  dateFrom!: string;
  dateTo!: string;
  operatorIds: number[];
  lessorIds!: number[];
  aircraftSeriesIds!: number[];
  engineSerieIds!: number[];
  aircraftIds!: number[];
  period!: string;
  portfolioId!: number;
  assetWatchGroupingOption!: string;
  routeCategory!: string;
}
