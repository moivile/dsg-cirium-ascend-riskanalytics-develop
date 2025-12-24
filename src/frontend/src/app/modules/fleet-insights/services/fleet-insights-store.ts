import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { FilterPanelFormValueModel } from '../models/filter-panel-form-model';
import { FilterPanelOptions } from '../models/filter-panel-options';
import { FleetInsightsAircraftFilterResponseModel } from '../models/fleet-insights-aircraft-filter-response.model';
import { debounceTime, distinctUntilChanged, map, pairwise, startWith, Subject, switchMap, tap, filter, shareReplay } from 'rxjs';
import { isEqual } from 'lodash';
import { mapFormValueToFiltersRequest, sortOptionsWithPriority } from './fleet-insights-mapper.util';
import { FleetInsightsService } from './fleet-insights-service';
import { tapResponse } from '@ngrx/operators';
import { GroupAllDataByLabels, GroupAllDataByOptions } from '../models/group-all-data-by';
import {
  defaultStatuses,
  defaultStatusIds,
  primaryUsagesKey,
  primaryUsagesPriorityNames,
  statusKey,
  statusPriorityNames
} from '../fleet-insights-constants';
import dayjs from 'dayjs';
import { IdNamePairModel } from '../../shared/models/id-name-pair-model';
import { availabilityOptions } from '../models/availability-options';
import { defaultStartDateMonthly, defaultEndDateMonthly, IntervalType, getIntervalTypeLabel } from '../models/interval-type.enum';
import { leaseStatusOptions } from '../models/lease-status-options';
import { deliveriesOptions } from '../models/events-options';
import { allOwnershipOptions } from '../models/ownership-options';
import { NavigationEnd, Router } from '@angular/router';
import { marketActivityRoute, fleetTrendsRoute } from '../../../route.constants';
import { mapEventIdsToDetails } from '../models/event-types-mapping';

export const minimumDate = new Date(1960, 0, 1);

function mapIdsToNames(ids: number[] = [], allOptions: IdNamePairModel[] = []): string[] {
  if (!Array.isArray(ids)) {
    ids = []; // Default to empty array if not an array
  }

  if (!Array.isArray(allOptions)) {
    allOptions = []; // Default to empty array if not an array
  }

  return ids.map((id) => {
    const option = allOptions.find((option) => option.id === id);
    return option?.name ?? 'Unknown'; // Default to 'Unknown' if no matching option is found
  });
}

export const initialFilterPanelFormValue: FilterPanelFormValueModel = {
  intervalType: IntervalType.Monthly,
  startDate: defaultStartDateMonthly.toDate(),
  endDate: defaultEndDateMonthly.toDate(),

  date: dayjs().startOf('month').toDate(),
  IncludeYoungLifeAircraft: false,
  IncludeMidLifeAircraft: false,
  IncludeLateLifeAircraft: false,
  rangeValues: [8, 15],
  statuses: defaultStatusIds,
  primaryUsages: [],
  marketClasses: [],
  lessors: [],

  orders: [],
  deliveries: deliveriesOptions.map((option) => option.id),
  slb: [],
  entryToService: [],
  cancellations: [],
  purchasesSales: [],
  leaseStart: [],
  leaseEnd: [],
  parked: [],
  conversions: [],
  retirements: [],

  aircraftManufacturers: [],
  aircraftFamilies: [],
  aircraftTypes: [],
  aircraftMasterSeries: [],
  aircraftSeries: [],
  aircraftSubSeries: [],

  engineTypes: [],
  engineManufacturers: [],
  engineFamilies: [],
  engineMasterSeries: [],
  engineSeries: [],
  engineSubSeries: [],

  operators: [],
  operatorTypes: [],
  operatorGroups: [],
  operatorRegions: [],
  operatorCountries: [],

  ownerships: [],
  trendsOwnerships: [],
  leaseStatuses: [],
  availabilities: []
};

interface FleetInsightsState {
  filterPanelFormValue: FilterPanelFormValueModel;
  filterPanelOptions: FilterPanelOptions;
  filterPanelOptionsLoading: boolean;
  sharedTabGroupBy: GroupAllDataByOptions;
  marketActivityTabGroupBy: GroupAllDataByOptions;
  currentTab: 'distribution' | 'trends' | 'marketActivity';
}

@Injectable()
export class FleetInsightsStore extends ComponentStore<FleetInsightsState> {
  private resetAllFiltersTriggeredSubject = new Subject<void>();
  readonly resetAllFiltersTriggered$ = this.resetAllFiltersTriggeredSubject.asObservable();

  constructor(private fleetInsightsService: FleetInsightsService, private router: Router) {
    super({
      filterPanelFormValue: initialFilterPanelFormValue,
      filterPanelOptionsLoading: false,
      filterPanelOptions: {
        statuses: defaultStatuses,
        primaryUsages: [],
        marketClasses: [],
        lessors: [],

        aircraftManufacturers: [],
        aircraftFamilies: [],
        aircraftTypes: [],
        aircraftMasterSeries: [],
        aircraftSeries: [],
        aircraftSubSeries: [],

        engineTypes: [],
        engineManufacturers: [],
        engineFamilies: [],
        engineMasterSeries: [],
        engineSeries: [],
        engineSubSeries: [],

        operators: [],
        operatorTypes: [],
        operatorGroups: [],
        operatorRegions: [],
        operatorCountries: []
      },
      sharedTabGroupBy: GroupAllDataByOptions.MarketClass,
      marketActivityTabGroupBy: GroupAllDataByOptions.MarketClass,
      currentTab: 'distribution'
    });
    this.loadFilterPanelOptions(this.loadFilterOptionsTrigger$);
    this.routerBasedTabSwitching();
  }

  readonly filterPanelFormValue$ = this.select((state) => state.filterPanelFormValue);
  readonly filterPanelFormValue = {
    intervalType$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.intervalType),

    startDate$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.startDate),
    endDate$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.endDate),
    date$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) =>
      filterPanelFormValue.date ? dayjs(filterPanelFormValue.date).endOf('month').toDate() : null
    ),

    includeYoungLifeAircraft$: this.select(
      this.filterPanelFormValue$,
      (filterPanelFormValue) => filterPanelFormValue.IncludeYoungLifeAircraft
    ),
    includeMidLifeAircraft$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.IncludeMidLifeAircraft),
    includeLateLifeAircraft$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.IncludeLateLifeAircraft),
    rangeValues$: this.select(this.filterPanelFormValue$, (state) => state.rangeValues),

    statuses$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.statuses),
    primaryUsages$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.primaryUsages),
    marketClasses$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.marketClasses),
    lessors$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.lessors),

    orders$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.orders),
    deliveries$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.deliveries),
    slb$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.slb),
    entryToService$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.entryToService),
    cancellations$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.cancellations),
    purchasesSales$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.purchasesSales),
    leaseStart$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.leaseStart),
    leaseEnd$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.leaseEnd),
    parked$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.parked),
    conversions$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.conversions),
    retirements$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.retirements),

    aircraftManufacturers$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.aircraftManufacturers),
    aircraftFamilies$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.aircraftFamilies),
    aircraftTypes$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.aircraftTypes),
    aircraftMasterSeries$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.aircraftMasterSeries),
    aircraftSeries$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.aircraftSeries),
    aircraftSubSeries$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.aircraftSubSeries),

    engineTypes$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.engineTypes),
    engineManufacturers$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.engineManufacturers),
    engineFamilies$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.engineFamilies),
    engineMasterSeries$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.engineMasterSeries),
    engineSeries$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.engineSeries),
    engineSubSeries$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.engineSubSeries),

    operators$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.operators),
    operatorTypes$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.operatorTypes),
    operatorGroups$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.operatorGroups),
    operatorRegions$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.operatorRegions),
    operatorCountries$: this.select(this.filterPanelFormValue$, (filterPanelFormValue) => filterPanelFormValue.operatorCountries),

    ownerships$: this.select(this.filterPanelFormValue$, (state) => state.ownerships),
    trendsOwnerships$: this.select(this.filterPanelFormValue$, (state) => state.trendsOwnerships),
    leaseStatuses$: this.select(this.filterPanelFormValue$, (state) => state.leaseStatuses),
    availabilities$: this.select(this.filterPanelFormValue$, (state) => state.availabilities)
  };

  readonly eventIds$ = this.select(
    this.filterPanelFormValue.orders$,
    this.filterPanelFormValue.deliveries$,
    this.filterPanelFormValue.slb$,
    this.filterPanelFormValue.entryToService$,
    this.filterPanelFormValue.cancellations$,
    this.filterPanelFormValue.purchasesSales$,
    this.filterPanelFormValue.leaseStart$,
    this.filterPanelFormValue.leaseEnd$,
    this.filterPanelFormValue.parked$,
    this.filterPanelFormValue.conversions$,
    this.filterPanelFormValue.retirements$,
    (orders, deliveries, slb, entryToService, cancellations, purchasesSales, leaseStart, leaseEnd, parked, conversions, retirements) =>
      Array.from(
        new Set<number>([
          ...orders,
          ...deliveries,
          ...slb,
          ...entryToService,
          ...cancellations,
          ...purchasesSales,
          ...leaseStart,
          ...leaseEnd,
          ...parked,
          ...conversions,
          ...retirements
        ])
      )
  );

  readonly filterPanelOptions$ = this.select((state) => state.filterPanelOptions);
  readonly filterPanelOptions = {
    statuses$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.statuses),
    primaryUsages$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.primaryUsages),
    marketClasses$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.marketClasses),
    lessors$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.lessors),

    aircraftManufacturers$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.aircraftManufacturers),
    aircraftFamilies$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.aircraftFamilies),
    aircraftTypes$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.aircraftTypes),
    aircraftMasterSeries$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.aircraftMasterSeries),
    aircraftSeries$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.aircraftSeries),
    aircraftSubSeries$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.aircraftSubSeries),

    engineTypes$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.engineTypes),
    engineManufacturers$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.engineManufacturers),
    engineFamilies$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.engineFamilies),
    engineMasterSeries$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.engineMasterSeries),
    engineSeries$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.engineSeries),
    engineSubSeries$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.engineSubSeries),

    operators$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.operators),
    operatorTypes$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.operatorTypes),
    operatorGroups$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.operatorGroups),
    operatorRegions$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.operatorRegions),
    operatorCountries$: this.select(this.filterPanelOptions$, (filterPanelOptions) => filterPanelOptions.operatorCountries)
  };

  readonly filterPanelOptionsLoading$ = this.select((state) => state.filterPanelOptionsLoading);

  readonly loadFilterOptionsTrigger$ = this.select(
    this.filterPanelFormValue.statuses$,
    this.filterPanelFormValue.primaryUsages$,
    this.filterPanelFormValue.marketClasses$,
    this.filterPanelFormValue.lessors$,

    this.filterPanelFormValue.aircraftManufacturers$,
    this.filterPanelFormValue.aircraftFamilies$,
    this.filterPanelFormValue.aircraftTypes$,
    this.filterPanelFormValue.aircraftMasterSeries$,
    this.filterPanelFormValue.aircraftSeries$,
    this.filterPanelFormValue.aircraftSubSeries$,

    this.filterPanelFormValue.engineTypes$,
    this.filterPanelFormValue.engineManufacturers$,
    this.filterPanelFormValue.engineFamilies$,
    this.filterPanelFormValue.engineMasterSeries$,
    this.filterPanelFormValue.engineSeries$,
    this.filterPanelFormValue.engineSubSeries$,

    this.filterPanelFormValue.operators$,
    this.filterPanelFormValue.operatorTypes$,
    this.filterPanelFormValue.operatorGroups$,
    this.filterPanelFormValue.operatorRegions$,
    this.filterPanelFormValue.operatorCountries$,
    (
      statuses,
      primaryUsages,
      marketClasses,
      lessors,

      aircraftManufacturers,
      aircraftFamilies,
      aircraftTypes,
      aircraftMasterSeries,
      aircraftSeries,
      aircraftSubSeries,

      engineTypes,
      engineManufacturers,
      engineFamilies,
      engineMasterSeries,
      engineSeries,
      engineSubSeries,

      operators,
      operatorTypes,
      operatorGroups,
      operatorRegions,
      operatorCountries
    ) => ({
      statuses,
      primaryUsages,
      marketClasses,
      lessors,

      aircraftManufacturers,
      aircraftFamilies,
      aircraftTypes,
      aircraftMasterSeries,
      aircraftSeries,
      aircraftSubSeries,

      engineTypes,
      engineManufacturers,
      engineFamilies,
      engineMasterSeries,
      engineSeries,
      engineSubSeries,

      operators,
      operatorTypes,
      operatorGroups,
      operatorRegions,
      operatorCountries
    })
  );

  distributionTabLeftPanelFilters$ = this.select(
    this.filterPanelFormValue.date$,
    this.filterPanelFormValue.statuses$,
    this.filterPanelFormValue.primaryUsages$,

    this.filterPanelFormValue.includeYoungLifeAircraft$,
    this.filterPanelFormValue.includeMidLifeAircraft$,
    this.filterPanelFormValue.includeLateLifeAircraft$,
    this.filterPanelFormValue.rangeValues$,

    this.filterPanelFormValue.marketClasses$,
    this.filterPanelFormValue.lessors$,
    this.filterPanelFormValue.ownerships$,
    this.filterPanelFormValue.leaseStatuses$,
    this.filterPanelFormValue.availabilities$,

    this.filterPanelFormValue.aircraftManufacturers$,
    this.filterPanelFormValue.aircraftFamilies$,
    this.filterPanelFormValue.aircraftTypes$,
    this.filterPanelFormValue.aircraftMasterSeries$,
    this.filterPanelFormValue.aircraftSeries$,
    this.filterPanelFormValue.aircraftSubSeries$,
    this.filterPanelFormValue.engineTypes$,
    this.filterPanelFormValue.engineManufacturers$,
    this.filterPanelFormValue.engineFamilies$,
    this.filterPanelFormValue.engineMasterSeries$,
    this.filterPanelFormValue.engineSeries$,
    this.filterPanelFormValue.engineSubSeries$,
    this.filterPanelFormValue.operators$,
    this.filterPanelFormValue.operatorTypes$,
    this.filterPanelFormValue.operatorGroups$,
    this.filterPanelFormValue.operatorRegions$,
    this.filterPanelFormValue.operatorCountries$,
    (
      date,
      statuses,
      primaryUsages,

      IncludeYoungLifeAircraft,
      IncludeMidLifeAircraft,
      IncludeLateLifeAircraft,
      rangeValues,

      marketClasses,
      lessors,
      ownerships,
      leaseStatuses,
      availabilities,

      aircraftManufacturers,
      aircraftFamilies,
      aircraftTypes,
      aircraftMasterSeries,
      aircraftSeries,
      aircraftSubSeries,

      engineTypes,
      engineManufacturers,
      engineFamilies,
      engineMasterSeries,
      engineSeries,
      engineSubSeries,

      operators,
      operatorTypes,
      operatorGroups,
      operatorRegions,
      operatorCountries
    ) =>
      ({
        date,
        statuses,
        primaryUsages,

        IncludeYoungLifeAircraft,
        IncludeMidLifeAircraft,
        IncludeLateLifeAircraft,
        rangeValues,

        marketClasses,
        lessors,
        ownerships,
        leaseStatuses,
        availabilities,

        aircraftManufacturers,
        aircraftFamilies,
        aircraftTypes,
        aircraftMasterSeries,
        aircraftSeries,
        aircraftSubSeries,

        engineTypes,
        engineManufacturers,
        engineFamilies,
        engineMasterSeries,
        engineSeries,
        engineSubSeries,

        operators,
        operatorTypes,
        operatorGroups,
        operatorRegions,
        operatorCountries
      } as Partial<FilterPanelFormValueModel>)
  ).pipe(debounceTime(50));

  /**
   * This computed property transforms distributionTabLeftPanelFilters into relevant name arrays
   * using the corresponding filterPanelOptions, ownershipOptions, and availabilityOptions.
   */
  readonly distributionTabLeftPanelFiltersWithNames$ = this.select(
    this.distributionTabLeftPanelFilters$,
    this.filterPanelOptions$,
    (filters, panelOptions) => {
      if (!filters) {
        return null;
      }

      return {
        date: filters.date ? dayjs(filters.date).format('MMMM YYYY') : '',
        statuses: mapIdsToNames(filters.statuses, panelOptions.statuses),
        primaryUsages: mapIdsToNames(filters.primaryUsages, panelOptions.primaryUsages),

        IncludeYoungLifeAircraft: filters.IncludeYoungLifeAircraft,
        IncludeMidLifeAircraft: filters.IncludeMidLifeAircraft,
        IncludeLateLifeAircraft: filters.IncludeLateLifeAircraft,
        rangeValues: filters.rangeValues,

        marketClasses: mapIdsToNames(filters.marketClasses, panelOptions.marketClasses),
        lessors: mapIdsToNames(filters.lessors, panelOptions.lessors),

        ownerships: mapIdsToNames(filters.ownerships, allOwnershipOptions),
        leaseStatuses: mapIdsToNames(filters.leaseStatuses, leaseStatusOptions),
        availabilities: mapIdsToNames(filters.availabilities, availabilityOptions),

        aircraftManufacturers: mapIdsToNames(filters.aircraftManufacturers, panelOptions.aircraftManufacturers),
        aircraftFamilies: mapIdsToNames(filters.aircraftFamilies, panelOptions.aircraftFamilies),
        aircraftTypes: mapIdsToNames(filters.aircraftTypes, panelOptions.aircraftTypes),
        aircraftMasterSeries: mapIdsToNames(filters.aircraftMasterSeries, panelOptions.aircraftMasterSeries),
        aircraftSeries: mapIdsToNames(filters.aircraftSeries, panelOptions.aircraftSeries),
        aircraftSubSeries: mapIdsToNames(filters.aircraftSubSeries, panelOptions.aircraftSubSeries),

        engineTypes: mapIdsToNames(filters.engineTypes, panelOptions.engineTypes),
        engineManufacturers: mapIdsToNames(filters.engineManufacturers, panelOptions.engineManufacturers),
        engineFamilies: mapIdsToNames(filters.engineFamilies, panelOptions.engineFamilies),
        engineMasterSeries: mapIdsToNames(filters.engineMasterSeries, panelOptions.engineMasterSeries),
        engineSeries: mapIdsToNames(filters.engineSeries, panelOptions.engineSeries),
        engineSubSeries: mapIdsToNames(filters.engineSubSeries, panelOptions.engineSubSeries),

        operators: mapIdsToNames(filters.operators, panelOptions.operators),
        operatorTypes: mapIdsToNames(filters.operatorTypes, panelOptions.operatorTypes),
        operatorGroups: mapIdsToNames(filters.operatorGroups, panelOptions.operatorGroups),
        operatorRegions: mapIdsToNames(filters.operatorRegions, panelOptions.operatorRegions),
        operatorCountries: mapIdsToNames(filters.operatorCountries, panelOptions.operatorCountries)
      };
    }
  );

  readonly sharedTabGroupBy$ = this.select((state) => state.sharedTabGroupBy);

  readonly marketActivityTabGroupBy$ = this.select((state) => state.marketActivityTabGroupBy);

  readonly currentTab$ = this.select((state) => state.currentTab);

  private readonly urlCurrentTab$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => {
      const url = this.router.url;
      if (url.includes(`/${marketActivityRoute}`)) {
        return 'marketActivity' as const;
      }
      if (url.includes(`/${fleetTrendsRoute}`)) {
        return 'trends' as const;
      }
      return 'distribution' as const;
    }),
    shareReplay(1)
  );

  readonly groupAllDataByValue$ = this.select(
    this.currentTab$,
    this.sharedTabGroupBy$,
    this.marketActivityTabGroupBy$,
    (currentTab, sharedTabGroupBy, marketActivityTabGroupBy) =>
      currentTab === 'marketActivity' ? marketActivityTabGroupBy : sharedTabGroupBy
  );

  readonly groupAllDataByLabel$ = this.select(
    this.groupAllDataByValue$,
    (groupAllDataByValue) => GroupAllDataByLabels[groupAllDataByValue]
  );

  readonly distributionTabSummaryFilters$ = this.select(
    this.distributionTabLeftPanelFilters$,
    this.groupAllDataByValue$,
    (distributionTabLeftPanelFilters, groupAllDataByValue) => ({
      distributionTabLeftPanelFilters,
      groupAllDataByValue
    })
  );

  trendsTabLeftPanelFilters$ = this.select(
    this.filterPanelFormValue.intervalType$,
    this.filterPanelFormValue.startDate$,
    this.filterPanelFormValue.endDate$,

    this.filterPanelFormValue.statuses$,
    this.filterPanelFormValue.primaryUsages$,
    this.filterPanelFormValue.marketClasses$,

    this.filterPanelFormValue.aircraftManufacturers$,
    this.filterPanelFormValue.aircraftFamilies$,
    this.filterPanelFormValue.aircraftTypes$,
    this.filterPanelFormValue.aircraftMasterSeries$,
    this.filterPanelFormValue.aircraftSeries$,
    this.filterPanelFormValue.aircraftSubSeries$,

    this.filterPanelFormValue.engineTypes$,
    this.filterPanelFormValue.engineManufacturers$,
    this.filterPanelFormValue.engineFamilies$,
    this.filterPanelFormValue.engineMasterSeries$,
    this.filterPanelFormValue.engineSeries$,
    this.filterPanelFormValue.engineSubSeries$,

    this.filterPanelFormValue.operators$,
    this.filterPanelFormValue.operatorTypes$,
    this.filterPanelFormValue.operatorGroups$,
    this.filterPanelFormValue.operatorRegions$,
    this.filterPanelFormValue.operatorCountries$,

    this.filterPanelFormValue.lessors$,

    this.filterPanelFormValue.rangeValues$,

    this.filterPanelFormValue.includeYoungLifeAircraft$,
    this.filterPanelFormValue.includeMidLifeAircraft$,
    this.filterPanelFormValue.includeLateLifeAircraft$,

    this.filterPanelFormValue.trendsOwnerships$,

    this.filterPanelFormValue.leaseStatuses$,

    (
      intervalType,
      startDate,
      endDate,

      statuses,
      primaryUsages,
      marketClasses,

      aircraftManufacturers,
      aircraftFamilies,
      aircraftTypes,
      aircraftMasterSeries,
      aircraftSeries,
      aircraftSubSeries,

      engineTypes,
      engineManufacturers,
      engineFamilies,
      engineMasterSeries,
      engineSeries,
      engineSubSeries,

      operators,
      operatorTypes,
      operatorGroups,
      operatorRegions,
      operatorCountries,

      lessors,

      rangeValues,
      IncludeYoungLifeAircraft,
      IncludeMidLifeAircraft,
      IncludeLateLifeAircraft,

      trendsOwnerships,

      leaseStatuses
    ) =>
      ({
        intervalType,
        startDate,
        endDate,

        statuses,
        primaryUsages,
        marketClasses,

        aircraftManufacturers,
        aircraftFamilies,
        aircraftTypes,
        aircraftMasterSeries,
        aircraftSeries,
        aircraftSubSeries,

        engineTypes,
        engineManufacturers,
        engineFamilies,
        engineMasterSeries,
        engineSeries,
        engineSubSeries,

        operators,
        operatorTypes,
        operatorGroups,
        operatorRegions,
        operatorCountries,

        lessors,

        rangeValues,
        IncludeYoungLifeAircraft,
        IncludeMidLifeAircraft,
        IncludeLateLifeAircraft,

        trendsOwnerships,

        leaseStatuses
      } as Partial<FilterPanelFormValueModel>)
  ).pipe(debounceTime(50));

  readonly trendsTabSummaryFilters$ = this.select(
    this.trendsTabLeftPanelFilters$,
    this.groupAllDataByValue$,
    (trendsTabLeftPanelFilters, groupAllDataByValue) => ({
      trendsTabLeftPanelFilters,
      groupAllDataByValue
    })
  );
  /**
   * This computed property transforms trendsTabLeftPanelFilters into relevant name arrays
   * using the corresponding filterPanelOptions, ownershipOptions, and availabilityOptions.
   */
  readonly trendsTabLeftPanelFiltersWithNames$ = this.select(
    this.trendsTabLeftPanelFilters$,
    this.filterPanelOptions$,
    (filters, panelOptions) => {
      if (!filters) {
        return null;
      }

      return {
        intervalType: filters.intervalType,
        startDate: filters.startDate ? dayjs(filters.startDate).format('MMMM YYYY') : '',
        endDate: filters.endDate ? dayjs(filters.endDate).format('MMMM YYYY') : '',
        statuses: mapIdsToNames(filters.statuses, panelOptions.statuses),
        primaryUsages: mapIdsToNames(filters.primaryUsages, panelOptions.primaryUsages),
        marketClasses: mapIdsToNames(filters.marketClasses, panelOptions.marketClasses),
        lessors: mapIdsToNames(filters.lessors, panelOptions.lessors),
        IncludeYoungLifeAircraft: filters.IncludeYoungLifeAircraft,
        IncludeMidLifeAircraft: filters.IncludeMidLifeAircraft,
        IncludeLateLifeAircraft: filters.IncludeLateLifeAircraft,
        rangeValues: filters.rangeValues,
        trendsOwnerships: mapIdsToNames(filters.trendsOwnerships, allOwnershipOptions),
        leaseStatuses: mapIdsToNames(filters.leaseStatuses, leaseStatusOptions),
        aircraftManufacturers: mapIdsToNames(filters.aircraftManufacturers, panelOptions.aircraftManufacturers),
        aircraftFamilies: mapIdsToNames(filters.aircraftFamilies, panelOptions.aircraftFamilies),
        aircraftTypes: mapIdsToNames(filters.aircraftTypes, panelOptions.aircraftTypes),
        aircraftMasterSeries: mapIdsToNames(filters.aircraftMasterSeries, panelOptions.aircraftMasterSeries),
        aircraftSeries: mapIdsToNames(filters.aircraftSeries, panelOptions.aircraftSeries),
        aircraftSubSeries: mapIdsToNames(filters.aircraftSubSeries, panelOptions.aircraftSubSeries),
        engineTypes: mapIdsToNames(filters.engineTypes, panelOptions.engineTypes),
        engineManufacturers: mapIdsToNames(filters.engineManufacturers, panelOptions.engineManufacturers),
        engineFamilies: mapIdsToNames(filters.engineFamilies, panelOptions.engineFamilies),
        engineMasterSeries: mapIdsToNames(filters.engineMasterSeries, panelOptions.engineMasterSeries),
        engineSeries: mapIdsToNames(filters.engineSeries, panelOptions.engineSeries),
        engineSubSeries: mapIdsToNames(filters.engineSubSeries, panelOptions.engineSubSeries),
        operators: mapIdsToNames(filters.operators, panelOptions.operators),
        operatorTypes: mapIdsToNames(filters.operatorTypes, panelOptions.operatorTypes),
        operatorGroups: mapIdsToNames(filters.operatorGroups, panelOptions.operatorGroups),
        operatorRegions: mapIdsToNames(filters.operatorRegions, panelOptions.operatorRegions),
        operatorCountries: mapIdsToNames(filters.operatorCountries, panelOptions.operatorCountries)
      };
    }
  );

  marketActivityTabLeftPanelFilters$ = this.select(
    this.filterPanelFormValue.intervalType$,
    this.filterPanelFormValue.startDate$,
    this.filterPanelFormValue.endDate$,

    this.filterPanelFormValue.orders$,
    this.filterPanelFormValue.deliveries$,
    this.filterPanelFormValue.slb$,
    this.filterPanelFormValue.entryToService$,
    this.filterPanelFormValue.cancellations$,
    this.filterPanelFormValue.purchasesSales$,
    this.filterPanelFormValue.leaseStart$,
    this.filterPanelFormValue.leaseEnd$,
    this.filterPanelFormValue.parked$,
    this.filterPanelFormValue.conversions$,
    this.filterPanelFormValue.retirements$,

    this.filterPanelFormValue.statuses$,
    this.filterPanelFormValue.primaryUsages$,
    this.filterPanelFormValue.marketClasses$,

    this.filterPanelFormValue.aircraftManufacturers$,
    this.filterPanelFormValue.aircraftFamilies$,
    this.filterPanelFormValue.aircraftTypes$,
    this.filterPanelFormValue.aircraftMasterSeries$,
    this.filterPanelFormValue.aircraftSeries$,
    this.filterPanelFormValue.aircraftSubSeries$,

    this.filterPanelFormValue.engineTypes$,
    this.filterPanelFormValue.engineManufacturers$,
    this.filterPanelFormValue.engineFamilies$,
    this.filterPanelFormValue.engineMasterSeries$,
    this.filterPanelFormValue.engineSeries$,
    this.filterPanelFormValue.engineSubSeries$,

    this.filterPanelFormValue.operators$,
    this.filterPanelFormValue.operatorTypes$,
    this.filterPanelFormValue.operatorGroups$,
    this.filterPanelFormValue.operatorRegions$,
    this.filterPanelFormValue.operatorCountries$,

    this.filterPanelFormValue.lessors$,

    this.filterPanelFormValue.rangeValues$,

    this.filterPanelFormValue.includeYoungLifeAircraft$,
    this.filterPanelFormValue.includeMidLifeAircraft$,
    this.filterPanelFormValue.includeLateLifeAircraft$,

    (
      intervalType,
      startDate,
      endDate,

      orders,
      deliveries,
      slb,
      entryToService,
      cancellations,
      purchasesSales,
      leaseStart,
      leaseEnd,
      parked,
      conversions,
      retirements,

      statuses,
      primaryUsages,
      marketClasses,

      aircraftManufacturers,
      aircraftFamilies,
      aircraftTypes,
      aircraftMasterSeries,
      aircraftSeries,
      aircraftSubSeries,

      engineTypes,
      engineManufacturers,
      engineFamilies,
      engineMasterSeries,
      engineSeries,
      engineSubSeries,

      operators,
      operatorTypes,
      operatorGroups,
      operatorRegions,
      operatorCountries,

      lessors,
      rangeValues,

      IncludeYoungLifeAircraft,
      IncludeMidLifeAircraft,
      IncludeLateLifeAircraft
    ) =>
      ({
        intervalType,
        startDate,
        endDate,

        orders,
        deliveries,
        slb,
        entryToService,
        cancellations,
        purchasesSales,
        leaseStart,
        leaseEnd,
        parked,
        conversions,
        retirements,

        statuses,
        primaryUsages,
        marketClasses,

        aircraftManufacturers,
        aircraftFamilies,
        aircraftTypes,
        aircraftMasterSeries,
        aircraftSeries,
        aircraftSubSeries,

        engineTypes,
        engineManufacturers,
        engineFamilies,
        engineMasterSeries,
        engineSeries,
        engineSubSeries,

        operators,
        operatorTypes,
        operatorGroups,
        operatorRegions,
        operatorCountries,

        lessors,
        rangeValues,

        IncludeYoungLifeAircraft,
        IncludeMidLifeAircraft,
        IncludeLateLifeAircraft
      } as Partial<FilterPanelFormValueModel>)
  ).pipe(debounceTime(50));

  readonly marketActivityTabLeftPanelFiltersWithNames$ = this.select(
    this.marketActivityTabLeftPanelFilters$,
    this.filterPanelOptions$,
    (filters, panelOptions) => {
      if (!filters) {
        return null;
      }
      return {
        intervalType: filters.intervalType ? getIntervalTypeLabel(filters.intervalType) : '',
        startDate: filters.startDate ? dayjs(filters.startDate).format('MMMM YYYY') : '',
        endDate: filters.endDate ? dayjs(filters.endDate).format('MMMM YYYY') : '',
        orders: mapEventIdsToDetails(filters.orders || []),
        deliveries: mapEventIdsToDetails(filters.deliveries || []),
        slb: mapEventIdsToDetails(filters.slb || []),
        entryToService: mapEventIdsToDetails(filters.entryToService || []),
        cancellations: mapEventIdsToDetails(filters.cancellations || []),
        purchasesSales: mapEventIdsToDetails(filters.purchasesSales || []),
        leaseStart: mapEventIdsToDetails(filters.leaseStart || []),
        leaseEnd: mapEventIdsToDetails(filters.leaseEnd || []),
        parked: mapEventIdsToDetails(filters.parked || []),
        conversions: mapEventIdsToDetails(filters.conversions || []),
        retirements: mapEventIdsToDetails(filters.retirements || []),
        statuses: mapIdsToNames(filters.statuses, panelOptions.statuses),
        primaryUsages: mapIdsToNames(filters.primaryUsages, panelOptions.primaryUsages),
        marketClasses: mapIdsToNames(filters.marketClasses, panelOptions.marketClasses),
        aircraftManufacturers: mapIdsToNames(filters.aircraftManufacturers, panelOptions.aircraftManufacturers),
        aircraftFamilies: mapIdsToNames(filters.aircraftFamilies, panelOptions.aircraftFamilies),
        aircraftTypes: mapIdsToNames(filters.aircraftTypes, panelOptions.aircraftTypes),
        aircraftMasterSeries: mapIdsToNames(filters.aircraftMasterSeries, panelOptions.aircraftMasterSeries),
        aircraftSeries: mapIdsToNames(filters.aircraftSeries, panelOptions.aircraftSeries),
        aircraftSubSeries: mapIdsToNames(filters.aircraftSubSeries, panelOptions.aircraftSubSeries),
        engineTypes: mapIdsToNames(filters.engineTypes, panelOptions.engineTypes),
        engineManufacturers: mapIdsToNames(filters.engineManufacturers, panelOptions.engineManufacturers),
        engineFamilies: mapIdsToNames(filters.engineFamilies, panelOptions.engineFamilies),
        engineMasterSeries: mapIdsToNames(filters.engineMasterSeries, panelOptions.engineMasterSeries),
        engineSeries: mapIdsToNames(filters.engineSeries, panelOptions.engineSeries),
        engineSubSeries: mapIdsToNames(filters.engineSubSeries, panelOptions.engineSubSeries),
        operators: mapIdsToNames(filters.operators, panelOptions.operators),
        operatorTypes: mapIdsToNames(filters.operatorTypes, panelOptions.operatorTypes),
        operatorGroups: mapIdsToNames(filters.operatorGroups, panelOptions.operatorGroups),
        operatorRegions: mapIdsToNames(filters.operatorRegions, panelOptions.operatorRegions),
        operatorCountries: mapIdsToNames(filters.operatorCountries, panelOptions.operatorCountries),
        lessors: mapIdsToNames(filters.lessors, panelOptions.lessors),
        rangeValues: filters.rangeValues,
        includeYoungLifeAircraft: filters.IncludeYoungLifeAircraft,
        includeMidLifeAircraft: filters.IncludeMidLifeAircraft,
        includeLateLifeAircraft: filters.IncludeLateLifeAircraft
      };
    }
  );

  readonly marketActivityTabSummaryFilters$ = this.select(
    this.marketActivityTabLeftPanelFilters$,
    this.groupAllDataByValue$,
    (marketActivityTabLeftPanelFilters, groupAllDataByValue) => ({
      marketActivityTabLeftPanelFilters,
      groupAllDataByValue
    })
  );

  readonly updateFilterPanelFormValue = this.updater((state, formValue: Partial<FilterPanelFormValueModel>) => ({
    ...state,
    filterPanelFormValue: {
      ...state.filterPanelFormValue,
      ...formValue
    }
  }));

  readonly updateFilterPanelOptionsWithFilterResponseModel = this.updater(
    (
      state,
      { options, excludeKeys }: { options: FleetInsightsAircraftFilterResponseModel; excludeKeys: (keyof FilterPanelFormValueModel)[] }
    ) => {
      const { filterPanelOptions, filterPanelFormValue } = state;
      const updatedOptions: FilterPanelOptions = { ...filterPanelOptions };

      Object.keys(options).forEach((key) => {
        const typedKey = key as keyof FleetInsightsAircraftFilterResponseModel;
        const formKey = key as keyof FilterPanelFormValueModel;
        const currFilterOptions = filterPanelOptions[typedKey] || [];
        const currFilterValue = (filterPanelFormValue[formKey] || []) as number[];
        const selectedOptions = currFilterOptions.filter((option) => currFilterValue.includes(option.id));
        const newOptions = options[typedKey] || [];
        const selectedOptionsWithoutNewOptions = selectedOptions.filter(
          (option) => !newOptions.map((newOption) => newOption.id).includes(option.id)
        );

        if (!excludeKeys.includes(formKey)) {
          const combinedOptions = newOptions.concat(selectedOptionsWithoutNewOptions);

          if (typedKey === primaryUsagesKey) {
            updatedOptions[typedKey] = sortOptionsWithPriority(combinedOptions, primaryUsagesPriorityNames);
          } else if (typedKey === statusKey) {
            updatedOptions[typedKey] = sortOptionsWithPriority(combinedOptions, statusPriorityNames);
          } else {
            updatedOptions[typedKey] = combinedOptions.sort((a, b) => a.name.localeCompare(b.name));
          }
        }
      });

      return {
        ...state,
        filterPanelOptions: updatedOptions
      };
    }
  );

  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading
  }));

  private readonly resetAllFilters = this.updater((state) => ({
    ...state,
    filterPanelFormValue: {
      ...initialFilterPanelFormValue
    }
  }));

  readonly resetAllFiltersEffect = this.effect<void>((trigger$) =>
    trigger$.pipe(
      tap(() => {
        this.resetAllFilters();
        this.resetAllFiltersTriggeredSubject.next();
      })
    )
  );

  readonly updateGroupingForTab = this.updater((state, groupBy: GroupAllDataByOptions) => {
    const isEventSpecific = this.isEventSpecificGrouping(groupBy);

    return {
      ...state,
      marketActivityTabGroupBy: isEventSpecific
        ? groupBy
        : state.currentTab === 'marketActivity'
        ? groupBy
        : state.marketActivityTabGroupBy,
      sharedTabGroupBy: !isEventSpecific ? groupBy : state.sharedTabGroupBy
    };
  });

  readonly switchToTab = this.updater((state, tabType: 'distribution' | 'trends' | 'marketActivity') => {
    const updatedState = this.storeCurrentGrouping(state);
    const isMarketActivityTab = tabType === 'marketActivity';
    const isDistributionOrTrendsTab = tabType === 'distribution' || tabType === 'trends';
    const shouldUpdateMarketActivityGrouping = isMarketActivityTab && updatedState.sharedTabGroupBy === GroupAllDataByOptions.Ownership;

    const shouldUpdateSharedGrouping =
      state.currentTab === 'marketActivity' &&
      isDistributionOrTrendsTab &&
      state.marketActivityTabGroupBy === GroupAllDataByOptions.MarketClass;

    return {
      ...updatedState,
      currentTab: tabType,
      ...(shouldUpdateMarketActivityGrouping && { marketActivityTabGroupBy: GroupAllDataByOptions.MarketClass }),
      ...(shouldUpdateSharedGrouping && { sharedTabGroupBy: GroupAllDataByOptions.MarketClass })
    };
  });

  readonly routerBasedTabSwitching = this.effect(() => this.urlCurrentTab$.pipe(tap((tabType) => this.switchToTab(tabType))));

  readonly loadFilterPanelOptions = this.effect<Partial<FilterPanelFormValueModel>>((trigger$) =>
    trigger$.pipe(
      debounceTime(300),
      startWith(this.get().filterPanelFormValue),
      pairwise(),
      map(([prev, curr]) => {
        const changedKeys: (keyof FilterPanelFormValueModel)[] = [];

        Object.keys(curr).forEach((key) => {
          const typedKey = key as keyof FilterPanelFormValueModel;
          if (!isEqual(prev[typedKey], curr[typedKey])) {
            changedKeys.push(typedKey);
          }
        });

        const excludeKeys: (keyof FilterPanelFormValueModel)[] = changedKeys.filter(
          (key) => Array.isArray(curr[key]) && (curr[key] as unknown[]).length > 0
        );

        return { filterIds: curr, excludeKeys };
      }),
      distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
      map((value, index) => {
        if (index === 0) {
          value.filterIds.statuses = [];
        }
        return value;
      }),
      tap(() => this.patchState({ filterPanelOptionsLoading: true })),
      switchMap(({ filterIds, excludeKeys }) => {
        const request = mapFormValueToFiltersRequest(filterIds);
        return this.fleetInsightsService.getAircraftFilterData(request).pipe(
          tapResponse(
            (response) => {
              this.updateFilterPanelOptionsWithFilterResponseModel({ options: response, excludeKeys });
              this.patchState({ filterPanelOptionsLoading: false });
            },
            (err) => {
              console.error(err);
              this.patchState({ filterPanelOptionsLoading: false });
            }
          )
        );
      })
    )
  );

  private isEventSpecificGrouping(groupBy: GroupAllDataByOptions): boolean {
    return groupBy === GroupAllDataByOptions.EventTypes || groupBy === GroupAllDataByOptions.EventDetails;
  }

  private storeCurrentGrouping(state: FleetInsightsState): FleetInsightsState {
    const currentGroupBy = state.currentTab === 'marketActivity' ? state.marketActivityTabGroupBy : state.sharedTabGroupBy;

    if (this.isEventSpecificGrouping(currentGroupBy)) {
      return { ...state, marketActivityTabGroupBy: currentGroupBy };
    }

    return {
      ...state,
      sharedTabGroupBy: currentGroupBy,
      marketActivityTabGroupBy: this.isEventSpecificGrouping(state.marketActivityTabGroupBy)
        ? state.marketActivityTabGroupBy
        : currentGroupBy
    };
  }
}
