import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FilterPanelFormModel } from '../../models/filter-panel-form-model';
import { initialFilterPanelFormValue, FleetInsightsStore, minimumDate } from '../../services/fleet-insights-store';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { isEqual } from 'lodash';
import { MultiselectConfig } from '../../models/multiselect-config';
import { availabilityOptions } from '../../models/availability-options';
import { leaseStatusOptions } from '../../models/lease-status-options';
import {
  cancellationsOptions,
  conversionsOptions,
  deliveriesOptions,
  entryToServiceOptions,
  leaseEndOptions,
  leaseStartOptions,
  ordersOptions,
  parkedOptions,
  purchasesSalesOptions,
  retirementsOptions,
  slbOptions
} from '../../models/events-options';
import { getOwnershipOptionsForDate, pastDateOwnershipOptions } from '../../models/ownership-options';
import { IdNamePairModel } from '../../../shared/models/id-name-pair-model';
import { isPastMonth } from '../../models/date-utils';

@Component({
  selector: 'ra-fleet-insights-filter-panel',
  templateUrl: './fleet-insights-filter-panel.component.html',
  styleUrl: './fleet-insights-filter-panel.component.scss',
  standalone: false
})
export class FleetInsightsFilterPanelComponent implements OnInit, OnDestroy {
  filterPanelForm!: FormGroup<FilterPanelFormModel>;
  @Input() isFleetDistributionPage = false;
  @Input() isFleetTrendsPage$: Observable<boolean> | undefined;
  @Input() isMarketActivityPage$: Observable<boolean> | undefined;

  distributionOwnershipOptions$ = new BehaviorSubject<IdNamePairModel[]>([]);
  trendsDateOwnershipOptions = pastDateOwnershipOptions;
  leaseStatusOptions = leaseStatusOptions;
  availabilityOptions = availabilityOptions;

  ordersOptions = ordersOptions;
  deliveriesOptions = deliveriesOptions;
  slbOptions = slbOptions;
  entryToServiceOptions = entryToServiceOptions;
  cancellationsOptions = cancellationsOptions;
  purchasesSalesOptions = purchasesSalesOptions;
  leaseStartOptions = leaseStartOptions;
  leaseEndOptions = leaseEndOptions;
  parkedOptions = parkedOptions;
  conversionsOptions = conversionsOptions;
  retirementsOptions = retirementsOptions;

  private destroy$ = new Subject<void>();
  aircraftMultiselectConfigs: MultiselectConfig[] = [];
  engineMultiselectConfigs: MultiselectConfig[] = [];
  operatorMultiselectConfigs: MultiselectConfig[] = [];
  eventsMultiselectConfigs: MultiselectConfig[] = [];
  minimumDate: Date = minimumDate;
  maximumDate: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  isAvailabilityDisabledDueToPastDate = false;

  constructor(private fb: FormBuilder, public store: FleetInsightsStore) {
    this.filterPanelForm = this.fb.group<FilterPanelFormModel>({
      intervalType: this.fb.control(initialFilterPanelFormValue.intervalType, { nonNullable: true }),
      startDate: this.fb.control(initialFilterPanelFormValue.startDate, { nonNullable: true }),
      endDate: this.fb.control(initialFilterPanelFormValue.endDate, { nonNullable: true }),

      date: this.fb.control(initialFilterPanelFormValue.date, { validators: Validators.required, nonNullable: true }),
      IncludeYoungLifeAircraft: this.fb.control(initialFilterPanelFormValue.IncludeYoungLifeAircraft, { nonNullable: true }),
      IncludeMidLifeAircraft: this.fb.control(initialFilterPanelFormValue.IncludeMidLifeAircraft, { nonNullable: true }),
      IncludeLateLifeAircraft: this.fb.control(initialFilterPanelFormValue.IncludeLateLifeAircraft, { nonNullable: true }),
      rangeValues: this.fb.control([...initialFilterPanelFormValue.rangeValues], { nonNullable: true }),
      statuses: this.fb.control(initialFilterPanelFormValue.statuses, { nonNullable: true }),
      primaryUsages: this.fb.control(initialFilterPanelFormValue.primaryUsages, { nonNullable: true }),
      marketClasses: this.fb.control(initialFilterPanelFormValue.marketClasses, { nonNullable: true }),
      lessors: this.fb.control(initialFilterPanelFormValue.lessors, { nonNullable: true }),

      orders: this.fb.control(initialFilterPanelFormValue.orders, { nonNullable: true }),
      deliveries: this.fb.control(initialFilterPanelFormValue.deliveries, { nonNullable: true }),
      slb: this.fb.control(initialFilterPanelFormValue.slb, { nonNullable: true }),
      entryToService: this.fb.control(initialFilterPanelFormValue.entryToService, { nonNullable: true }),
      cancellations: this.fb.control(initialFilterPanelFormValue.cancellations, { nonNullable: true }),
      purchasesSales: this.fb.control(initialFilterPanelFormValue.purchasesSales, { nonNullable: true }),
      leaseStart: this.fb.control(initialFilterPanelFormValue.leaseStart, { nonNullable: true }),
      leaseEnd: this.fb.control(initialFilterPanelFormValue.leaseEnd, { nonNullable: true }),
      parked: this.fb.control(initialFilterPanelFormValue.parked, { nonNullable: true }),
      conversions: this.fb.control(initialFilterPanelFormValue.conversions, { nonNullable: true }),
      retirements: this.fb.control(initialFilterPanelFormValue.retirements, { nonNullable: true }),

      aircraftManufacturers: this.fb.control(initialFilterPanelFormValue.aircraftManufacturers, { nonNullable: true }),
      aircraftFamilies: this.fb.control(initialFilterPanelFormValue.aircraftFamilies, { nonNullable: true }),
      aircraftTypes: this.fb.control(initialFilterPanelFormValue.aircraftTypes, { nonNullable: true }),
      aircraftMasterSeries: this.fb.control(initialFilterPanelFormValue.aircraftMasterSeries, { nonNullable: true }),
      aircraftSeries: this.fb.control(initialFilterPanelFormValue.aircraftSeries, { nonNullable: true }),
      aircraftSubSeries: this.fb.control(initialFilterPanelFormValue.aircraftSubSeries, { nonNullable: true }),

      engineTypes: this.fb.control(initialFilterPanelFormValue.engineTypes, { nonNullable: true }),
      engineManufacturers: this.fb.control(initialFilterPanelFormValue.engineManufacturers, { nonNullable: true }),
      engineFamilies: this.fb.control(initialFilterPanelFormValue.engineFamilies, { nonNullable: true }),
      engineMasterSeries: this.fb.control(initialFilterPanelFormValue.engineMasterSeries, { nonNullable: true }),
      engineSeries: this.fb.control(initialFilterPanelFormValue.engineSeries, { nonNullable: true }),
      engineSubSeries: this.fb.control(initialFilterPanelFormValue.engineSubSeries, { nonNullable: true }),

      operators: this.fb.control(initialFilterPanelFormValue.operators, { nonNullable: true }),
      operatorTypes: this.fb.control(initialFilterPanelFormValue.operatorTypes, { nonNullable: true }),
      operatorGroups: this.fb.control(initialFilterPanelFormValue.operatorGroups, { nonNullable: true }),
      operatorRegions: this.fb.control(initialFilterPanelFormValue.operatorRegions, { nonNullable: true }),
      operatorCountries: this.fb.control(initialFilterPanelFormValue.operatorCountries, { nonNullable: true }),

      ownerships: this.fb.control(initialFilterPanelFormValue.ownerships, { nonNullable: true }),
      trendsOwnerships: this.fb.control(initialFilterPanelFormValue.trendsOwnerships, { nonNullable: true }),
      leaseStatuses: this.fb.control(initialFilterPanelFormValue.leaseStatuses, { nonNullable: true }),
      availabilities: this.fb.control(initialFilterPanelFormValue.availabilities, { nonNullable: true })
    });

    this.filterPanelForm.controls.date.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        filter((date) => !!date),
        tap((date) => {
          const ownershipOptions = getOwnershipOptionsForDate(date);
          this.distributionOwnershipOptions$.next(ownershipOptions);
          this.cleanOwnerships(ownershipOptions);
          this.handleAvailabilityForDate(date);
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.store.filterPanelFormValue$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        tap((formValue) => {
          this.filterPanelForm.setValue(formValue);
        })
      )
      .subscribe();

    this.filterPanelForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        tap((formValue) => {
          this.store.updateFilterPanelFormValue(formValue);
        })
      )
      .subscribe();

    this.aircraftMultiselectConfigs = this.initializeMultiselectConfigs('aircraft');
    this.engineMultiselectConfigs = this.initializeMultiselectConfigs('engine');
    this.operatorMultiselectConfigs = this.initializeMultiselectConfigs('operator');
    this.eventsMultiselectConfigs = this.initializeMultiselectConfigs('events');

    this.store.resetAllFiltersTriggered$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isAvailabilityDisabledDueToPastDate = false;
      this.filterPanelForm.controls.availabilities.enable();
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onResetAll(): void {
    this.store.resetAllFiltersEffect();
  }

  cleanOwnerships(options: IdNamePairModel[]): void {
    const control = this.filterPanelForm.controls.ownerships;
    const allowedIds = new Set(options.map((o) => o.id));
    const currentValue = control.value || [];
    // filter out IDs not in allowedIds
    const filteredValue = currentValue.filter((id) => allowedIds.has(id));
    // update control only if something was removed
    if (filteredValue.length !== currentValue.length) {
      control.setValue(filteredValue);
    }
  }

  private handleAvailabilityForDate(date: Date): void {
    const isPastMonthSelected = isPastMonth(date);
    this.isAvailabilityDisabledDueToPastDate = isPastMonthSelected;

    if (isPastMonthSelected) {
      this.filterPanelForm.controls.availabilities.setValue([], { emitEvent: false });
      this.filterPanelForm.controls.availabilities.markAsDirty();
      this.filterPanelForm.controls.availabilities.updateValueAndValidity();
      this.filterPanelForm.controls.availabilities.disable({ emitEvent: false });
    } else {
      this.filterPanelForm.controls.availabilities.enable({ emitEvent: false });
    }
  }

  private initializeMultiselectConfigs(groupType: 'aircraft' | 'engine' | 'operator' | 'events'): MultiselectConfig[] {
    const multiselectConfigs = {
      aircraft: [
        {
          label: 'Aircraft Manufacturer',
          controlName: 'aircraftManufacturers',
          options$: this.store.filterPanelOptions.aircraftManufacturers$
        },
        {
          label: 'Aircraft Family',
          controlName: 'aircraftFamilies',
          options$: this.store.filterPanelOptions.aircraftFamilies$
        },
        {
          label: 'Aircraft Type',
          controlName: 'aircraftTypes',
          options$: this.store.filterPanelOptions.aircraftTypes$
        },
        {
          label: 'Aircraft Master Series',
          controlName: 'aircraftMasterSeries',
          options$: this.store.filterPanelOptions.aircraftMasterSeries$
        },
        {
          label: 'Aircraft Series',
          controlName: 'aircraftSeries',
          options$: this.store.filterPanelOptions.aircraftSeries$
        },
        {
          label: 'Aircraft Sub Series',
          controlName: 'aircraftSubSeries',
          options$: this.store.filterPanelOptions.aircraftSubSeries$
        }
      ] as MultiselectConfig[],
      engine: [
        {
          label: 'Engine Manufacturer',
          controlName: 'engineManufacturers',
          options$: this.store.filterPanelOptions.engineManufacturers$
        },
        {
          label: 'Engine Family',
          controlName: 'engineFamilies',
          options$: this.store.filterPanelOptions.engineFamilies$
        },
        {
          label: 'Engine Type',
          controlName: 'engineTypes',
          options$: this.store.filterPanelOptions.engineTypes$
        },
        {
          label: 'Engine Master Series',
          controlName: 'engineMasterSeries',
          options$: this.store.filterPanelOptions.engineMasterSeries$
        },
        {
          label: 'Engine Series',
          controlName: 'engineSeries',
          options$: this.store.filterPanelOptions.engineSeries$
        },
        {
          label: 'Engine Sub Series',
          controlName: 'engineSubSeries',
          options$: this.store.filterPanelOptions.engineSubSeries$
        }
      ] as MultiselectConfig[],
      operator: [
        {
          label: 'Operator',
          controlName: 'operators',
          options$: this.store.filterPanelOptions.operators$
        },
        {
          label: 'Operator Type',
          controlName: 'operatorTypes',
          options$: this.store.filterPanelOptions.operatorTypes$
        },
        {
          label: 'Operator Group',
          controlName: 'operatorGroups',
          options$: this.store.filterPanelOptions.operatorGroups$
        },
        {
          label: 'Operator Region',
          controlName: 'operatorRegions',
          options$: this.store.filterPanelOptions.operatorRegions$
        },
        {
          label: 'Operator Country/Subregion',
          controlName: 'operatorCountries',
          options$: this.store.filterPanelOptions.operatorCountries$
        }
      ] as MultiselectConfig[],
      events: [
        {
          label: 'Orders',
          controlName: 'orders',
          options$: of(this.ordersOptions)
        },
        {
          label: 'Deliveries',
          controlName: 'deliveries',
          options$: of(this.deliveriesOptions)
        },
        {
          label: 'Sale & Lease-back',
          controlName: 'slb',
          options$: of(this.slbOptions)
        },
        {
          label: 'Entry to Service',
          controlName: 'entryToService',
          options$: of(this.entryToServiceOptions)
        },
        {
          label: 'Cancellations',
          controlName: 'cancellations',
          options$: of(this.cancellationsOptions)
        },
        {
          label: 'Purchases/Sales',
          controlName: 'purchasesSales',
          options$: of(this.purchasesSalesOptions)
        },
        {
          label: 'Lease Start',
          controlName: 'leaseStart',
          options$: of(this.leaseStartOptions)
        },
        {
          label: 'Lease End',
          controlName: 'leaseEnd',
          options$: of(this.leaseEndOptions)
        },
        {
          label: 'Parked',
          controlName: 'parked',
          options$: of(this.parkedOptions)
        },
        {
          label: 'Conversions',
          controlName: 'conversions',
          options$: of(this.conversionsOptions)
        },
        {
          label: 'Retirements',
          controlName: 'retirements',
          options$: of(this.retirementsOptions)
        }
      ] as MultiselectConfig[]
    };

    return multiselectConfigs[groupType];
  }
}
