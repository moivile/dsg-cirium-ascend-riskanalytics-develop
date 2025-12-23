import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SavedSearchModel } from '../../models/saved-search-model';
import { IdNamePairModel } from '../../../shared/models/id-name-pair-model';
import { StringIdNamePairModel } from '../../../shared/models/string-id-name-pair-model';
import { TimePeriodOption } from '../../models/time-period-option';
import { FilterPanelFormOptions } from '../../models/filter-panel-form-options';
import dayjs from 'dayjs';
import { dateFormat } from '../../models/filter-panel-form';

@Component({
    selector: 'ra-saved-search-filters-view',
    templateUrl: './asset-watch-saved-search-filters-view.component.html',
    styleUrl: './asset-watch-saved-search-filters-view.component.scss',
    standalone: false
})
export class AssetWatchSavedSearchFiltersViewComponent {
  savedSearch: SavedSearchModel = this.config.data.savedSearch;
  filterOptions: FilterPanelFormOptions = this.config.data.filterOptions;
  savedSearchCriteriaList: SavedSearchCriterion[] = [];

  constructor(private readonly config: DynamicDialogConfig) {
    this.convertToSavedSearchFilters(this.savedSearch);
  }

  convertToSavedSearchFilters(savedSearch: SavedSearchModel): void {
    const dateViewFormat = 'DD-MMM-YYYY';

    this.savedSearchCriteriaList.push({
      criteria: 'Portfolio',
      selection: savedSearch.portfolioName
    });

    if (savedSearch.regionCodes?.length > 0) {
      this.savedSearchCriteriaList.push(this.getNames('Regions', savedSearch.regionCodes, this.filterOptions.regions));
    }
    if (savedSearch.countryCodes?.length > 0) {
      this.savedSearchCriteriaList.push(this.getNames('Countries/Subregions', savedSearch.countryCodes, this.filterOptions.countries));
    }

    if (savedSearch.cities?.length > 0) {
      this.savedSearchCriteriaList.push(this.getNames('Cities', savedSearch.cities, this.filterOptions.cities));
    }

    if (savedSearch.airportCodes?.length > 0) {
      this.savedSearchCriteriaList.push(this.getNames('Airports', savedSearch.airportCodes, this.filterOptions.airports));
    }

    if (savedSearch.routeCategory) {
      this.savedSearchCriteriaList.push({ criteria: 'Route Category', selection: savedSearch.routeCategory });
    }

    this.savedSearchCriteriaList.push({
      criteria: 'Date Range',
      selection: TimePeriodOption[savedSearch.period as keyof typeof TimePeriodOption]?.toString()
    });

    if (savedSearch.operatorIds?.length > 0) {
      this.savedSearchCriteriaList.push(this.getNames('Operator', savedSearch.operatorIds, this.filterOptions.operators));
    }

    if (savedSearch.lessorIds?.length > 0) {
      this.savedSearchCriteriaList.push(this.getNames('Lessor', savedSearch.lessorIds, this.filterOptions.lessors));
    }

    if (savedSearch.aircraftSeriesIds?.length > 0) {
      this.savedSearchCriteriaList.push(this.getNames('Aircraft Series', savedSearch.aircraftSeriesIds, this.filterOptions.aircraftSeries));
    }

    if (savedSearch.engineSerieIds?.length > 0) {
      this.savedSearchCriteriaList.push(this.getNames('Engine Series', savedSearch.engineSerieIds, this.filterOptions.engineSeries));
    }

    if (savedSearch.aircraftIds?.length > 0) {
      this.savedSearchCriteriaList.push(this.getNames('Serial', savedSearch.aircraftIds, this.filterOptions.aircraftSerialNumbers));
    }

    if (savedSearch.minNoOfFlights > 0) {
      this.savedSearchCriteriaList.push({ criteria: 'Min. No. of Flights', selection: savedSearch.minNoOfFlights.toString() });
    }

    if (savedSearch.minTotalGroundStay > 0) {
      this.savedSearchCriteriaList.push({ criteria: 'Min. Total Ground Stay', selection: savedSearch.minTotalGroundStay.toString() });
    }

    if (savedSearch.minIndividualGroundStay > 0) {
      this.savedSearchCriteriaList.push({
        criteria: 'Min. Individual Ground Stay',
        selection: savedSearch.minIndividualGroundStay.toString()
      });
    }

    if (savedSearch.maxIndividualGroundStay > 0) {
      this.savedSearchCriteriaList.push({
        criteria: 'Max. Individual Ground Stay',
        selection: savedSearch.maxIndividualGroundStay.toString()
      });
    }

    if (savedSearch.maxCurrentGroundStay > 0) {
      this.savedSearchCriteriaList.push({
        criteria: 'Max. Current Ground Stay (Hours)',
        selection: savedSearch.maxCurrentGroundStay.toString()
      });
    }

    if (savedSearch.minCurrentGroundStay > 0) {
      this.savedSearchCriteriaList.push({
        criteria: 'Min. Current Ground Stay (Hours)',
        selection: savedSearch.minCurrentGroundStay.toString()
      });
    }

    if (savedSearch.showAircraftOnGround) {
      this.savedSearchCriteriaList.push({ criteria: 'Current AOG', selection: 'Yes' });
    }

    if (savedSearch.maintenanceActivityIds?.length > 0) {
      this.savedSearchCriteriaList.push(
        this.getNames('Maintenance Activity', savedSearch.maintenanceActivityIds, this.filterOptions.maintenanceActivities)
      );
    }
  }

  private getNames<T extends IdNamePairModel | StringIdNamePairModel>(
    optionName: string,
    ids: (number | string)[],
    options: T[]
  ): SavedSearchCriterion {
    const names = ids
      .map((id) => {
        const option = options.find((option) => option.id === id);
        return option?.name;
      })
      .filter((name): name is string => !!name)
      .sort();
    return { criteria: optionName, selection: names.join(', ') };
  }
}

interface SavedSearchCriterion {
  criteria: string;
  selection: string;
}
