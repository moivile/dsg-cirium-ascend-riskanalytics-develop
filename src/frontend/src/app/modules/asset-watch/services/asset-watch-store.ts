import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { FilterPanelFormOptions } from '../models/filter-panel-form-options';
import { IdNamePairModel } from '../../shared/models/id-name-pair-model';
import { StringIdNamePairModel } from '../../shared/models/string-id-name-pair-model';
import { FilterByWatchlistOption } from '../models/filter-by-watchlist-option';
import { Observable } from 'rxjs';
import { TreeNode } from 'primeng/api';
import { CountriesRegionsModel } from '../../shared/models/country-regions';
export interface AssetWatchState {
  filterOptions: FilterPanelFormOptions;
  searchIsDirty: boolean;
  savedSearch: {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    portfolioId?: number;
  } | null;
}

export const initialState: AssetWatchState = {
  filterOptions: {
    regions: [],
    operators: [],
    countries: [],
    cities: [],
    airports: [],
    lessors: [],
    aircraftSeries: [],
    engineSeries: [],
    aircraftSerialNumbers: [],
    maintenanceActivities: []
  },
  savedSearch: null,
  searchIsDirty: false
};

@Injectable()
export class AssetWatchStore extends ComponentStore<AssetWatchState> {
  static readonly aircraftsOnGroundTreeNode: TreeNode = {
    key: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
    label: FilterByWatchlistOption.AircraftsOnGround.toString()
  };

  constructor() {
    super(initialState);
  }

  readonly filterOptions$ = this.select((state) => state.filterOptions);
  readonly countries$ = this.select((state) => state.filterOptions.countries);
  readonly maintenanceActivities$ = this.select((state) => state.filterOptions.maintenanceActivities);

  readonly filterByOptions$: Observable<TreeNode[]> = this.select(this.maintenanceActivities$, (maintenanceActivities) => {
    const maintenanceActivityTreeNode: TreeNode = {
      key: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
      label: FilterByWatchlistOption.MaintenanceActivity.toString(),
      children: maintenanceActivities
        ? maintenanceActivities.map((element) => ({
            key: element.id.toString(),
            label: element.name
          }))
        : []
    };

    return [AssetWatchStore.aircraftsOnGroundTreeNode, maintenanceActivityTreeNode];
  });

  readonly maintenanceActivityTreeNode$ = this.select(
    this.filterByOptions$,
    (filterByOptions) =>
      filterByOptions.filter((option) => option.key === FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity])[0]
  );

  readonly savedSearch$ = this.select((state) => state.savedSearch);
  readonly searchIsDirty$ = this.select((state) => state.searchIsDirty);
  readonly isActive$ = this.select((state) => state.savedSearch?.isActive);
  readonly savedSearchName$ = this.select((state) => state.savedSearch?.name);
  readonly savedSearchId$ = this.select((state) => state.savedSearch?.id);
  readonly savedSearchIsNull$ = this.select((state) => state.savedSearch === null);

  readonly setFilterOptions = this.updater((state, filterOptions: FilterPanelFormOptions) => ({ ...state, filterOptions }));

  readonly setMaintenanceActivitiesFilterOptions = this.updater((state, maintenanceActivities: IdNamePairModel[]) => ({
    ...state,
    filterOptions: {
      ...state.filterOptions,
      maintenanceActivities
    }
  }));

  readonly setCitiesFilterOptions = this.updater((state, cities: StringIdNamePairModel[]) => ({
    ...state,
    filterOptions: {
      ...state.filterOptions,
      cities
    }
  }));

  readonly setAirportsFilterOptions = this.updater((state, airports: StringIdNamePairModel[]) => ({
    ...state,
    filterOptions: {
      ...state.filterOptions,
      airports
    }
  }));

  readonly setSearchIsDirty = this.updater((state, searchIsDirty: boolean) => ({ ...state, searchIsDirty }));
  readonly setSavedSearch = this.updater((state, savedSearch: AssetWatchState['savedSearch']) => {
    localStorage.setItem('savedSearchId', savedSearch?.id?.toString() || '');
    localStorage.setItem('savedSearchPortfolioId', savedSearch?.portfolioId?.toString() || '');
    return { ...state, savedSearch };
  });
}
