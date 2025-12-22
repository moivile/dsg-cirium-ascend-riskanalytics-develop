import { FormControl, FormGroup } from '@angular/forms';
import { AssetWatchGridRequest } from './asset-watch-grid-request';
import { FilterPanelForm } from './filter-panel-form';
import { TimePeriodOption } from './time-period-option';
import { AircraftWatchlistFilterForm } from './aircraft-watchlist-filter-form';

export class SavedSearchRequest extends AssetWatchGridRequest {
  name!: string;
  description?: string;
  isActive!: boolean;

  constructor(
    filterPanelForm: FormGroup<FilterPanelForm>,
    selectedTimePeriodControl: FormControl<TimePeriodOption>,
    selectedPortfolioId: number | null,
    aircraftWatchlistFilterForm: FormGroup<AircraftWatchlistFilterForm>,
    name: string,
    description: string | undefined,
    isActive: boolean
  ) {
    super(filterPanelForm, selectedTimePeriodControl, selectedPortfolioId, aircraftWatchlistFilterForm);
    this.name = name;
    this.description = description;
    this.isActive = isActive;
  }
}
