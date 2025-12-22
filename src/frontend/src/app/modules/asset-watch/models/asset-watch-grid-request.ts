import { FormControl, FormGroup } from '@angular/forms';
import { TimePeriodOption } from './time-period-option';
import { FilterPanelForm } from './filter-panel-form';
import { AircraftWatchlistFilterForm } from './aircraft-watchlist-filter-form';
import { FilterByWatchlistOption } from './filter-by-watchlist-option';

export class AssetWatchGridRequest {
  constructor(
    filterPanelForm: FormGroup<FilterPanelForm>,
    selectedTimePeriodControl: FormControl<TimePeriodOption>,
    selectedPortfolioId: number | null,
    aircraftWatchlistFilterForm: FormGroup<AircraftWatchlistFilterForm>,
    pageNumber?: number,
    pageSize?: number
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
    this.minNoOfFlights = aircraftWatchlistFilterForm.value?.minNoOfFlights ?? 0;
    this.minTotalGroundStay = aircraftWatchlistFilterForm.value?.minTotalGroundStay ?? 0;
    this.minIndividualGroundStay = aircraftWatchlistFilterForm.value?.minIndividualGroundStay ?? 0;
    this.minCurrentGroundStay = aircraftWatchlistFilterForm.value?.minCurrentGroundStay ?? 0;
    this.maxCurrentGroundStay = aircraftWatchlistFilterForm.value?.maxCurrentGroundStay ?? 0;
    this.maxIndividualGroundStay = aircraftWatchlistFilterForm.value?.maxIndividualGroundStay ?? 0;
    const filterOptions = aircraftWatchlistFilterForm.value?.filterByOptions;

    if (filterPanelForm.value.routeCategory) {
      this.routeCategory = filterPanelForm.value.routeCategory?.toString();
    }

    this.maintenanceActivityIds = [];
    this.showAircraftOnGround = false;

    if (filterOptions && filterOptions.length > 0) {
      const isAircraftsOnGroundSelected =
        filterOptions.length === 1 && filterOptions[0].key === FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround];
      this.showAircraftOnGround = isAircraftsOnGroundSelected;
      if (!isAircraftsOnGroundSelected) {
        filterOptions.forEach((element) => {
          if (element.key && !isNaN(parseInt(element.key))) {
            this.maintenanceActivityIds.push(parseInt(element.key as string));
          }
        });
      }
    }

    this.skip = pageNumber;
    this.take = pageSize;
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
  minNoOfFlights!: number;
  minTotalGroundStay!: number;
  minIndividualGroundStay!: number;
  minCurrentGroundStay!: number;
  maxIndividualGroundStay!: number;
  maxCurrentGroundStay!: number;
  maintenanceActivityIds: number[];
  routeCategory!: string;
  skip?: number;
  take?: number;
  showAircraftOnGround: boolean;

  get displayMaintenanceActivity(): boolean {
    return this.maintenanceActivityIds?.length > 0;
  }
}
