import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  Observable,
  Subject,
  combineLatest,
  filter,
  forkJoin,
  iif,
  map,
  merge,
  of,
  pairwise,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs';
import { FilterPanelForm, dateFormat } from '../../models/filter-panel-form';
import { AssetWatchService } from '../../services/asset-watch.service';
import {
  TimePeriodOption,
  getFilterPanelFormEndDate,
  getFilterPanelFormStartDate,
  getTimePeriodEnumValue
} from '../../models/time-period-option';
import { RouteCategoryOption } from '../../models/route-category-option';
import dayjs from 'dayjs';
import { PeriodForm } from '../../models/period-form';
import { AssetWatchStore } from '../../services/asset-watch-store';
import { AppStore } from 'src/app/app-store';
import { AircraftWatchlistFilterForm } from '../../models/aircraft-watchlist-filter-form';
import { IdNamePairModel } from 'src/app/modules/shared/models/id-name-pair-model';
import { ActivatedRoute, Router } from '@angular/router';
import { SavedSearchesService } from '../../services/saved-searches.service';
import { TreeNode } from 'primeng/api';
import { SavedSearchModel } from '../../models/saved-search-model';
import { assetWatchRoute } from '../../../../route.constants';
import { tapResponse } from '@ngrx/operators';
import { AircraftWatchlistFilterValues } from '../../models/aircraft-watchlist-filter-values';
import { StringIdNamePairModel } from 'src/app/modules/shared/models/string-id-name-pair-model';

@Component({
  selector: 'ra-asset-watch-filter',
  templateUrl: './asset-watch-filter.component.html',
  styleUrls: ['./asset-watch-filter.component.scss'],
  standalone: false
})
export class AssetWatchFilterComponent implements OnInit, OnDestroy {
  @Input()
  filterExpandedCollapsedClass!: string;
  @Input()
  selectedTimePeriodControl!: FormControl<TimePeriodOption>;
  @Input()
  triggerOpenSavedSearch$!: Subject<void>;

  maximumDate: Date = dayjs().startOf('day').toDate();
  isStartEndDateFilterVisible = false;

  @Input()
  filterPanelForm!: FormGroup<FilterPanelForm>;
  @Input() aircraftWatchlistFilterForm!: FormGroup<AircraftWatchlistFilterForm>;
  @Input() watchlistFilterValues!: AircraftWatchlistFilterValues;
  @Input() canDeactivate!: (portfolioId?: number) => Observable<boolean>;

  timePeriodOptions = [
    TimePeriodOption.Yesterday,
    TimePeriodOption.Last7Days,
    TimePeriodOption.Last1Month,
    TimePeriodOption.Last3Months,
    TimePeriodOption.Last6Months,
    TimePeriodOption.Last12Months,
    TimePeriodOption.SelectDateRange
  ];
  routeCategoryFilterOptions = [
    {
      name: RouteCategoryOption.INTERNATIONAL,
      isSelected: false
    },
    {
      name: RouteCategoryOption.DOMESTIC,
      isSelected: false
    }
  ];
  private destroy$ = new Subject<void>();

  private isFirstLoad = true;

  periodForm: FormGroup<PeriodForm> = new FormGroup<PeriodForm>(new PeriodForm());

  filteredCountries$!: Observable<StringIdNamePairModel[]>;

  constructor(
    public readonly appStore: AppStore,
    private readonly assetWatchService: AssetWatchService,
    public readonly assetWatchStore: AssetWatchStore,
    private readonly activatedRoute: ActivatedRoute,
    private readonly savedSearchesService: SavedSearchesService,
    private router: Router
  ) { }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit(): void {
    this.initFilters();

    this.filteredCountries$ = combineLatest([this.filterPanelForm.controls.regions.valueChanges, this.assetWatchStore.countries$]).pipe(
      takeUntil(this.destroy$),
      map(([selectedRegions, allCountries]) => {
        if (!selectedRegions || selectedRegions.length === 0) {
          return allCountries;
        }
        return allCountries.filter(({ regionCode }) => regionCode != null && selectedRegions.includes(regionCode.toString())).map(({ id, name }) => ({ id, name }));
      })
    );

    this.filteredCountries$.subscribe((countryOptions) => {
      if (countryOptions.length > 0) {
        const currentCountries = this.filterPanelForm.controls.countries.value || [];
        const validCountries = currentCountries.filter((countryId) => countryOptions.some((option) => option.id === countryId));
        this.filterPanelForm.controls.countries.setValue(validCountries, { emitEvent: false });
      }
    });
    this.filterPanelForm.controls.countries.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter((countriesArray: string[] | null): countriesArray is string[] => !!countriesArray && countriesArray.length > 0),
        tap(() => {
          this.filterPanelForm.controls.cities.enable({ emitEvent: false });
          this.filterPanelForm.controls.airports.enable({ emitEvent: false });
        }),
        switchMap((countriesArray) => {
          if (countriesArray) {
            return forkJoin([
              this.assetWatchService.getCitiesData(countriesArray),
              this.assetWatchService.getAirportsData(countriesArray)
            ]).pipe(
              tap(([citiesResponse, airportsResponse]) => {
                const cityOptions = citiesResponse.map((city) => ({ id: city.id, name: city.name }));
                const airportOptions = airportsResponse.map((airport) => ({ id: airport.id, name: airport.name }));
                this.assetWatchStore.setCitiesFilterOptions(cityOptions);
                this.assetWatchStore.setAirportsFilterOptions(airportOptions);
              })
            );
          } else {
            return of([], []);
          }
        })
      )
      .subscribe({
        next: ([citiesDataArray, airportsDataArray]) => {
          this.assetWatchStore.setCitiesFilterOptions(citiesDataArray);
          this.assetWatchStore.setAirportsFilterOptions(airportsDataArray);

          const filteredCityIds = (this.filterPanelForm.controls.cities.value || []).filter((id) =>
            citiesDataArray.some((city) => city.id === id)
          );
          this.filterPanelForm.controls.cities.setValue(filteredCityIds, { emitEvent: false });

          const filteredAirportIds = (this.filterPanelForm.controls.airports.value || []).filter((id) =>
            airportsDataArray.some((airport) => airport.id === id)
          );
          this.filterPanelForm.controls.airports.setValue(filteredAirportIds, { emitEvent: false });
        }
      });

    this.filterPanelForm.controls.countries.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter((countriesArray: string[] | null) => !countriesArray || countriesArray.length === 0)
      )
      .subscribe({
        next: () => {
          this.filterPanelForm.controls.cities.reset(null, { emitEvent: false });
          this.filterPanelForm.controls.airports.reset(null, { emitEvent: false });
          this.filterPanelForm.controls.airports.disable({ emitEvent: false });
          this.filterPanelForm.controls.cities.disable({ emitEvent: false });
        }
      });

    this.selectedTimePeriodControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter((timePeriod) => !!timePeriod),
        tap((timePeriod) => {
          if (timePeriod !== TimePeriodOption.SelectDateRange) {
            this.filterPanelForm.patchValue({
              startDate: getFilterPanelFormStartDate(timePeriod as TimePeriodOption).format(dateFormat),
              endDate: getFilterPanelFormEndDate().format(dateFormat)
            });

            this.periodForm.patchValue(
              {
                periodFormStartDate: getFilterPanelFormStartDate(timePeriod as TimePeriodOption).toDate(),
                periodFormEndDate: getFilterPanelFormEndDate().toDate()
              },
              { emitEvent: false }
            );
          }
        })
      )
      .subscribe();

    this.periodForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.selectedTimePeriodControl.patchValue(TimePeriodOption.SelectDateRange, { emitEvent: false });

          if (dayjs(this.periodForm.value.periodFormStartDate).isAfter(dayjs(this.periodForm.value.periodFormEndDate))) {
            this.periodForm.patchValue(
              {
                periodFormStartDate: this.periodForm.value.periodFormEndDate,
                periodFormEndDate: this.periodForm.value.periodFormStartDate
              },
              { emitEvent: false }
            );
          }

          const endDateSubtract12Months = dayjs(this.periodForm.value.periodFormEndDate).subtract(12, 'month').startOf('day');

          if (
            dayjs(this.periodForm.value.periodFormEndDate)
              .subtract(12, 'month')
              .startOf('day')
              .isAfter(dayjs(this.periodForm.value.periodFormStartDate))
          ) {
            this.periodForm.patchValue(
              {
                periodFormStartDate: endDateSubtract12Months.toDate()
              },
              { emitEvent: false }
            );
          }

          this.filterPanelForm.patchValue({
            startDate: dayjs(this.periodForm.value.periodFormStartDate).format(dateFormat),
            endDate: dayjs(this.periodForm.value.periodFormEndDate).format(dateFormat)
          });
        })
      )
      .subscribe();
  }

  resetFilters(): void {
    this.initAircraftWatchlistFilterFormWithDefaultValues(false);
    this.initFilterPanelFormWithDefaultValues();

    this.assetWatchStore.savedSearch$
      .pipe(
        take(1),
        filter((savedSearch) => !savedSearch),
        tap(() => {
          this.assetWatchStore.setSearchIsDirty(false);
        })
      )
      .subscribe();
  }

  updateSelectedRouteCategoryFilter(): void {
    const selectedOptions = this.routeCategoryFilterOptions.filter((option) => option.isSelected).map((option) => option.name);

    if (selectedOptions.length === 1) {
      this.filterPanelForm.controls.routeCategory.setValue(selectedOptions[0]);
    } else {
      this.filterPanelForm.controls.routeCategory.setValue(null);
    }
  }

  initFilters(): void {
    const currentPortfolioId$ = this.appStore.selectedPortfolioId$.pipe(
      filter((selectedPortfolioId) => !!selectedPortfolioId),
      map((selectedPortfolioId) => selectedPortfolioId as number)
    );

    const openSavedSearchStream$ = merge(
      this.triggerOpenSavedSearch$.pipe(
        map(() => {
          const routeSavedSearchId = this.activatedRoute.snapshot.paramMap.get('savedSearchId');
          return routeSavedSearchId ? Number(routeSavedSearchId) : null;
        })
      ),
      this.activatedRoute.paramMap.pipe(
        map((params) => {
          const savedSearchId = params.get('savedSearchId');
          return savedSearchId ? Number(savedSearchId) : null;
        })
      )
    ).pipe(
      switchMap((savedSearchId) => {
        if (savedSearchId !== null) {
          return this.savedSearchesService.getSavedSearch(savedSearchId).pipe(
            tapResponse(
              (savedSearch) => {
                this.assetWatchStore.setSavedSearch(savedSearch);
                this.appStore.setSelectedPortfolioId(savedSearch.portfolioId);
              },
              () => {
                this.router.navigate([`/${assetWatchRoute}`]);
              }
            )
          );
        } else {
          return of(null);
        }
      })
    );

    const selectAnotherPortfolioStream$ = currentPortfolioId$.pipe(
      pairwise(),
      withLatestFrom(this.assetWatchStore.savedSearch$),
      filter(([[, currentPortfolioId], savedSearch]) => currentPortfolioId !== savedSearch?.portfolioId),
      switchMap(([[previousPortfolioId]]) => this.canDeactivate(previousPortfolioId)),
      map(() => this.activatedRoute.snapshot.paramMap.get('savedSearchId')),
      tap((savedSearchId) => {
        if (savedSearchId) {
          this.router.navigate([`/${assetWatchRoute}`]);
        }
      }),
      filter((savedSearchId) => !savedSearchId),
      map(() => null)
    ) as Observable<null>;

    merge(openSavedSearchStream$, selectAnotherPortfolioStream$)
      .pipe(
        takeUntil(this.destroy$),
        withLatestFrom(currentPortfolioId$, this.assetWatchStore.maintenanceActivities$),
        switchMap(([savedSearch, selectedPortfolioId, maintenanceActivities]) => {
          return forkJoin({
            filterOptions: this.assetWatchService.getAssetWatchFilterData(selectedPortfolioId),
            maintenanceActivityData: iif(
              () => maintenanceActivities?.length > 0,
              of(maintenanceActivities),
              this.assetWatchService.getMaintenanceActivityData()
            ),
            cities: iif(
              () => (savedSearch?.countryCodes?.length ?? 0) > 0,
              this.assetWatchService.getCitiesData(savedSearch?.countryCodes as string[]),
              of([])
            ),
            airports: iif(
              () => (savedSearch?.countryCodes?.length ?? 0) > 0,
              this.assetWatchService.getAirportsData(savedSearch?.countryCodes as string[]),
              of([])
            )
          }).pipe(map((results) => ({ ...results, savedSearch })));
        }),
        map(({ filterOptions, maintenanceActivityData, cities, airports, savedSearch }) => {
          filterOptions.maintenanceActivities = maintenanceActivityData;
          filterOptions.cities = cities;
          filterOptions.airports = airports;
          this.assetWatchStore.setFilterOptions(filterOptions);
          return savedSearch;
        }),
        withLatestFrom(this.assetWatchStore.maintenanceActivityTreeNode$),
        tap(([savedSearch, maintenanceActivityTreeNode]) => {
          if (savedSearch) {
            this.initAircraftWatchlistFilterFormWithSavedSearch(savedSearch, maintenanceActivityTreeNode, this.isFirstLoad);
            this.initFilterPanelFormWithSavedSearch(savedSearch);
          } else {
            this.initAircraftWatchlistFilterFormWithDefaultValues(this.isFirstLoad);
            this.initFilterPanelFormWithDefaultValues();
            this.assetWatchStore.setSavedSearch(null);
          }
          this.isFirstLoad = false;
          this.assetWatchStore.setSearchIsDirty(false);
        })
      )
      .subscribe();
  }

  initFilterPanelFormWithSavedSearch(savedSearch: SavedSearchModel): void {
    const timePeriodEnumValue = getTimePeriodEnumValue(savedSearch.period);
    this.selectedTimePeriodControl.setValue(timePeriodEnumValue, { emitEvent: false });

    if (timePeriodEnumValue == TimePeriodOption.SelectDateRange) {
      savedSearch.dateFrom = dayjs(savedSearch.dateFrom).format(dateFormat);
      savedSearch.dateTo = dayjs(savedSearch.dateTo).format(dateFormat);

      this.periodForm.setValue(
        {
          periodFormStartDate: dayjs(savedSearch.dateFrom).toDate(),
          periodFormEndDate: dayjs(savedSearch.dateTo).toDate()
        },
        { emitEvent: false }
      );
    } else {
      savedSearch.dateFrom = getFilterPanelFormStartDate(timePeriodEnumValue).format(dateFormat);
      savedSearch.dateTo = getFilterPanelFormEndDate().format(dateFormat);

      this.periodForm.patchValue(
        {
          periodFormStartDate: getFilterPanelFormStartDate(timePeriodEnumValue).toDate(),
          periodFormEndDate: getFilterPanelFormEndDate().toDate()
        },
        { emitEvent: false }
      );
    }

    this.filterPanelForm.controls.countries.setValue(savedSearch.countryCodes || [], { emitEvent: false });

    if (savedSearch.countryCodes && savedSearch.countryCodes.length > 0) {
      this.filterPanelForm.controls.cities.enable({ emitEvent: false });
      this.filterPanelForm.controls.airports.enable({ emitEvent: false });
    }

    this.filterPanelForm.patchValue({
      regions: savedSearch?.regionCodes || [],
      cities: savedSearch?.cities || [],
      airports: savedSearch?.airportCodes || [],
      startDate: savedSearch.dateFrom,
      endDate: savedSearch.dateTo,
      operators: savedSearch?.operatorIds || [],
      lessors: savedSearch?.lessorIds || [],
      aircraftSeries: savedSearch?.aircraftSeriesIds || [],
      engineSeries: savedSearch?.engineSerieIds || [],
      aircraftSerialNumbers: savedSearch?.aircraftIds || [],
      routeCategory: savedSearch?.routeCategory || null
    });

    this.routeCategoryFilterOptions.forEach((option) => {
      option.isSelected = savedSearch?.routeCategory === option.name;
    });
  }

  initAircraftWatchlistFilterFormWithSavedSearch(
    savedSearch: SavedSearchModel,
    maintenanceActivityTreeNode: TreeNode<any>,
    emitEvent: boolean
  ): void {
    const filterByOptionsFormValue: TreeNode[] = [];

    if (savedSearch.showAircraftOnGround) {
      filterByOptionsFormValue.push(AssetWatchStore.aircraftsOnGroundTreeNode);
    } else if (
      maintenanceActivityTreeNode.children &&
      maintenanceActivityTreeNode.children.length > 0 &&
      savedSearch.maintenanceActivityIds &&
      savedSearch.maintenanceActivityIds.length > 0
    ) {
      const savedSearchMaintenanceActivityIdsSet = new Set(savedSearch.maintenanceActivityIds.map((id) => id.toString()));
      const selectedOptions = maintenanceActivityTreeNode.children.filter((option) =>
        savedSearchMaintenanceActivityIdsSet.has(option.key as string)
      );

      filterByOptionsFormValue.push(...selectedOptions);

      if (maintenanceActivityTreeNode.children.length === selectedOptions.length) {
        filterByOptionsFormValue.push(maintenanceActivityTreeNode);
      }
    }

    this.aircraftWatchlistFilterForm.setValue(
      {
        minNoOfFlights: savedSearch.minNoOfFlights,
        minTotalGroundStay: savedSearch.minTotalGroundStay,
        minIndividualGroundStay: savedSearch.minIndividualGroundStay,
        minCurrentGroundStay: savedSearch.minCurrentGroundStay,
        maxIndividualGroundStay: savedSearch.maxIndividualGroundStay,
        maxCurrentGroundStay: savedSearch.maxCurrentGroundStay,
        filterByOptions: filterByOptionsFormValue
      },
      { emitEvent }
    );

    this.watchlistFilterValues.currentGroundStayAOG = savedSearch.minCurrentGroundStay;
    this.watchlistFilterValues.currentMaxGroundStayAOG = savedSearch.maxCurrentGroundStay;
  }

  initFilterPanelFormWithDefaultValues(): void {
    this.selectedTimePeriodControl.reset(TimePeriodOption.Last7Days, { emitEvent: false });

    this.periodForm.reset(
      {
        periodFormStartDate: getFilterPanelFormStartDate(TimePeriodOption.Last7Days).toDate(),
        periodFormEndDate: getFilterPanelFormEndDate().toDate()
      },
      { emitEvent: false }
    );

    this.routeCategoryFilterOptions.forEach((option) => {
      option.isSelected = false;
    });

    this.filterPanelForm.reset({
      regions: [],
      countries: [],
      cities: [],
      airports: [],
      routeCategory: null,
      startDate: getFilterPanelFormStartDate(TimePeriodOption.Last7Days).format(dateFormat),
      endDate: getFilterPanelFormEndDate().format(dateFormat),
      operators: [],
      lessors: [],
      aircraftSeries: [],
      engineSeries: [],
      aircraftSerialNumbers: []
    });
  }

  initAircraftWatchlistFilterFormWithDefaultValues(emitEvent: boolean): void {
    this.aircraftWatchlistFilterForm.reset(
      {
        minNoOfFlights: 0,
        minTotalGroundStay: 0,
        minIndividualGroundStay: 0,
        minCurrentGroundStay: 0,
        maxIndividualGroundStay: 0,
        maxCurrentGroundStay: 0,
        filterByOptions: []
      },
      { emitEvent }
    );
    this.watchlistFilterValues.currentGroundStayAOG = 0;
    this.watchlistFilterValues.currentMaxGroundStayAOG = 0;
  }
}
